#!/usr/bin/env python3
"""
Build course pages from markdown sources.

Converts markdown files to styled HTML pages with proper:
- Tables
- Ordered and unordered lists
- Links (internal vs external)
- LaTeX \href commands
- Headers and formatting
"""

import re
import os
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent


def strip_latex_preamble(text):
    """Remove LaTeX preamble from markdown files."""
    if "\\begin{" not in text:
        return text
    match = re.search(r"^## ", text, re.MULTILINE)
    return text[match.start() :] if match else text


def convert_latex_href(text):
    """Convert LaTeX \href{url}{text} to markdown [text](url)."""
    # Match \href{url}{text} pattern
    pattern = r"\\href\{([^}]+)\}\{([^}]+)\}"
    return re.sub(pattern, r"[\2](\1)", text)


def convert_latex_table(text):
    """Remove inline LaTeX table blocks."""
    # Remove LaTeX table environments
    text = re.sub(r"\\setlength\{[^}]+\}\{[^}]+\}", "", text)
    text = re.sub(r"\\vspace\{[^}]+\}", "", text)
    text = re.sub(r"\\begin\{center\}", "", text)
    text = re.sub(r"\\end\{center\}", "", text)
    text = re.sub(r"\\begin\{tabular\}\{[^}]+\}", "", text)
    text = re.sub(r"\\end\{tabular\}", "", text)
    text = re.sub(r"\\hline", "", text)
    text = re.sub(r"\\textbf\{([^}]+)\}", r"**\1**", text)
    text = re.sub(r"\\\\", "", text)
    text = re.sub(r"&", " | ", text)
    return text


def slugify(text):
    """Convert text to URL-friendly slug for anchor IDs."""
    slug = text.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = slug.strip("-")
    return slug


def convert_headers(html):
    """Convert markdown headers to HTML with anchor IDs."""

    def replace_header(match, tag):
        text = match.group(1)
        slug = slugify(text)
        return f'<{tag} id="{slug}">{text}</{tag}>'

    html = re.sub(
        r"^#### (.+)$", lambda m: replace_header(m, "h4"), html, flags=re.MULTILINE
    )
    html = re.sub(
        r"^### (.+)$", lambda m: replace_header(m, "h3"), html, flags=re.MULTILINE
    )
    html = re.sub(
        r"^## (.+)$", lambda m: replace_header(m, "h2"), html, flags=re.MULTILINE
    )
    html = re.sub(
        r"^# (.+)$", lambda m: replace_header(m, "h1"), html, flags=re.MULTILINE
    )
    return html


def convert_inline_formatting(html):
    """Convert bold and italic markdown to HTML."""
    html = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", html)
    html = re.sub(r"\*(.+?)\*", r"<em>\1</em>", html)
    html = re.sub(r"(?<![\\])_(.+?)_", r"<em>\1</em>", html)
    return html


def convert_code_blocks(text):
    """Convert fenced code blocks (```) to HTML pre/code tags."""
    lines = text.split("\n")
    result = []
    in_code_block = False
    code_lines = []
    lang = ""

    for line in lines:
        if line.strip().startswith("```") and not in_code_block:
            in_code_block = True
            lang = line.strip()[3:].strip()
            code_lines = []
        elif line.strip() == "```" and in_code_block:
            in_code_block = False
            code_content = "\n".join(code_lines)
            code_content = (
                code_content.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
            )
            lang_class = f' class="language-{lang}"' if lang else ""
            result.append(f"<pre><code{lang_class}>{code_content}</code></pre>")
        elif in_code_block:
            code_lines.append(line)
        else:
            result.append(line)

    return "\n".join(result)


def convert_inline_code(text):
    """Convert backtick inline code to HTML code tags."""
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", text)


def convert_links(html):
    """Convert markdown links to HTML, handling internal vs external links."""

    def replace_link(match):
        text = match.group(1)
        url = match.group(2)

        # Determine if link is internal or external
        is_external = (
            url.startswith("http://")
            or url.startswith("https://")
            or url.startswith("mailto:")
        )

        if is_external:
            return f'<a href="{url}" target="_blank">{text}</a>'
        else:
            return f'<a href="{url}">{text}</a>'

    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", replace_link, html)


def convert_tables(html):
    """Convert markdown tables to HTML tables."""
    lines = html.split("\n")
    result = []
    in_table = False
    table_lines = []

    for line in lines:
        stripped = line.strip()

        # Detect table row (starts with |)
        if stripped.startswith("|") and stripped.endswith("|"):
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(stripped)
        else:
            if in_table:
                # End of table, convert it
                result.append(convert_table_block(table_lines))
                in_table = False
                table_lines = []
            result.append(line)

    # Handle table at end of file
    if in_table and table_lines:
        result.append(convert_table_block(table_lines))

    return "\n".join(result)


def convert_table_block(lines):
    """Convert a block of markdown table lines to HTML."""
    if len(lines) < 2:
        return "\n".join(lines)

    html = ["<table>"]

    for i, line in enumerate(lines):
        # Skip separator line (|---|---|...)
        if re.match(r"^\|[-:\s|]+\|$", line):
            continue

        cells = [cell.strip() for cell in line.strip("|").split("|")]

        if i == 0:
            # Header row
            html.append("<thead><tr>")
            for cell in cells:
                html.append(f"<th>{cell}</th>")
            html.append("</tr></thead>")
            html.append("<tbody>")
        else:
            # Data row
            html.append("<tr>")
            for cell in cells:
                html.append(f"<td>{cell}</td>")
            html.append("</tr>")

    html.append("</tbody>")
    html.append("</table>")

    return "\n".join(html)


def convert_lists(html):
    """Convert markdown lists to HTML with proper nesting support."""
    lines = html.split("\n")
    result = []
    stack = []  # [(indent, list_type, has_open_li)]

    def get_indent(line):
        return len(line) - len(line.lstrip())

    def parse_list_item(line):
        stripped = line.lstrip()
        indent = get_indent(line)

        checkbox_match = re.match(r"^- \[([ xX])\]\s+(.+)$", stripped)
        if checkbox_match:
            checked = checkbox_match.group(1).lower() == "x"
            content = checkbox_match.group(2)
            checkbox_html = (
                f'<input type="checkbox" disabled{" checked" if checked else ""}> '
            )
            return indent, "ul", checkbox_html + content

        ordered_match = re.match(r"^(\d+)\.\s+(.+)$", stripped)
        if ordered_match:
            return indent, "ol", ordered_match.group(2)

        unordered_match = re.match(r"^[-*]\s+(.+)$", stripped)
        if unordered_match:
            return indent, "ul", unordered_match.group(1)

        return -1, "", ""

    def close_to_indent(target_indent):
        while stack and stack[-1][0] >= target_indent:
            _, list_type, has_open_li = stack.pop()
            if has_open_li:
                result.append("</li>")
            result.append(f"</{list_type}>")

    def peek_next_list_item(start_idx):
        for j in range(start_idx, len(lines)):
            if lines[j].strip():
                return parse_list_item(lines[j])
        return -1, "", ""

    i = 0
    while i < len(lines):
        line = lines[i]
        indent, list_type, content = parse_list_item(line)

        if list_type:
            # Check if next line is a nested list
            next_indent, next_type, _ = peek_next_list_item(i + 1)
            has_nested = next_type and next_indent > indent

            # Close lists at same or higher indent with different type
            while stack and stack[-1][0] >= indent:
                if stack[-1][0] == indent and stack[-1][1] == list_type:
                    # Same level, same type - just close the previous li
                    if stack[-1][2]:
                        result.append("</li>")
                        stack[-1] = (stack[-1][0], stack[-1][1], False)
                    break
                # Different type or higher indent - close completely
                _, old_type, old_has_li = stack.pop()
                if old_has_li:
                    result.append("</li>")
                result.append(f"</{old_type}>")

            # Open new list if needed
            if not stack or stack[-1][0] < indent:
                result.append(f"<{list_type}>")
                stack.append((indent, list_type, False))

            # Write the li (leave open if nested content follows)
            if has_nested:
                result.append(f"<li>{content}")
                stack[-1] = (stack[-1][0], stack[-1][1], True)
            else:
                result.append(f"<li>{content}</li>")

            i += 1
        else:
            # Not a list item
            if line.strip():
                close_to_indent(0)
            result.append(line)
            i += 1

    close_to_indent(0)
    return "\n".join(result)


def convert_ordered_lists(html):
    """Legacy function - now handled by convert_lists."""
    return html


def convert_unordered_lists(html):
    """Legacy function - now handled by convert_lists."""
    lines = html.split("\n")
    in_list = False
    result = []

    for line in lines:
        stripped = line.strip()
        # Skip if already processed (contains <li>)
        if "<li>" in line or "<ul>" in line or "<ol>" in line:
            result.append(line)
            continue
        if stripped.startswith("- ") and not stripped.startswith("- ["):
            if not in_list:
                result.append("<ul>")
                in_list = True
            result.append(f"<li>{stripped[2:]}</li>")
        else:
            if in_list:
                result.append("</ul>")
                in_list = False
            result.append(line)

    if in_list:
        result.append("</ul>")

    return "\n".join(result)


def convert_horizontal_rules(html):
    """Convert markdown horizontal rules to HTML."""
    return re.sub(r"^---+$", "<hr>", html, flags=re.MULTILINE)


def wrap_paragraphs(html):
    """Wrap plain text blocks in paragraph tags."""
    paragraphs = re.split(r"\n\n+", html)
    formatted = []

    for p in paragraphs:
        p = p.strip()
        if not p:
            continue

        starts_with_tag = (
            p.startswith("<h")
            or p.startswith("</h")
            or p.startswith("<ul")
            or p.startswith("</ul")
            or p.startswith("<ol")
            or p.startswith("</ol")
            or p.startswith("<li")
            or p.startswith("</li")
            or p.startswith("<table")
            or p.startswith("</table")
            or p.startswith("<thead")
            or p.startswith("</thead")
            or p.startswith("<tbody")
            or p.startswith("</tbody")
            or p.startswith("<tr")
            or p.startswith("</tr")
            or p.startswith("<hr")
            or p.startswith("<div")
            or p.startswith("</div")
            or p.startswith("<p")
            or p.startswith("</p")
            or p.startswith("<input")
        )

        contains_block_html = (
            "<ul>" in p
            or "</ul>" in p
            or "<ol>" in p
            or "</ol>" in p
            or "<li>" in p
            or "</li>" in p
            or "<table>" in p
            or "</table>" in p
        )

        if starts_with_tag or contains_block_html:
            formatted.append(p)
        else:
            formatted.append(f"<p>{p}</p>")

    return "\n".join(formatted)


def parse_markdown_to_html(markdown_text):
    """Convert markdown text to HTML."""
    html = strip_latex_preamble(markdown_text)
    html = convert_latex_href(html)
    html = convert_latex_table(html)

    html = convert_code_blocks(html)
    html = convert_headers(html)
    html = convert_inline_formatting(html)
    html = convert_inline_code(html)
    html = convert_tables(html)
    html = convert_lists(html)
    html = convert_horizontal_rules(html)
    html = convert_links(html)
    html = wrap_paragraphs(html)

    return html


def get_page_template(title, nav_active, content, depth=1):
    """Generate full HTML page with navigation and styling."""
    prefix = "../" * depth

    nav_items = [
        ("Outline", f"{prefix}", nav_active == "outline"),
        ("Syllabus", f"{prefix}syllabus/", nav_active == "syllabus"),
        ("Demos", f"{prefix}demos/", nav_active == "demos"),
        ("Assignments", f"{prefix}assignments/", nav_active == "assignments"),
        ("GitHub", "https://github.com/ContextLab/llm-course", False),
    ]

    nav_html = ""
    for name, href, active in nav_items:
        target = ' target="_blank"' if "github.com" in href else ""
        active_class = ' class="active"' if active else ""
        nav_html += f'<a href="{href}"{active_class}{target}>{name}</a>\n            '

    return f'''<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - PSYC 51.17</title>
    <meta name="description" content="{title} for PSYC 51.17: Language Models from Scratch">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="{prefix}demos/shared/css/demo-styles.css">
    <style>
        .page-nav {{
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-md) var(--spacing-xl);
            background: var(--bg-color);
            border-bottom: 1px solid var(--border-color);
            z-index: var(--z-fixed);
            backdrop-filter: blur(10px);
        }}
        .page-nav .logo {{
            font-size: 1.5rem;
            font-weight: 700;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .page-nav .nav-links {{
            display: flex;
            gap: 2rem;
            align-items: center;
        }}
        .page-nav .nav-links a {{
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }}
        .page-nav .nav-links a:hover,
        .page-nav .nav-links a.active {{
            color: var(--primary-color);
        }}
        .page-nav .theme-toggle {{
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-full);
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .page-nav .theme-toggle:hover {{
            background: var(--surface-hover);
            border-color: var(--primary-color);
        }}
        .page-header {{
            margin-top: 70px;
            padding: 3rem 2rem 2rem;
            text-align: center;
            background: linear-gradient(180deg, var(--surface-color) 0%, var(--bg-color) 100%);
        }}
        .page-header h1 {{
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            margin-bottom: 1rem;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .content {{
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
        }}
        .content h1 {{
            font-size: 2rem;
            font-weight: 800;
            color: var(--text-primary);
            margin: 2rem 0 1rem;
        }}
        .content h2 {{
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 2rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--border-color);
        }}
        .content h3 {{
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 1.5rem 0 0.75rem;
        }}
        .content h4 {{
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 1.25rem 0 0.5rem;
        }}
        .content p {{
            color: var(--text-secondary);
            line-height: 1.8;
            margin-bottom: 1rem;
        }}
        .content ul, .content ol {{
            color: var(--text-secondary);
            padding-left: 1.5rem;
            margin-bottom: 1rem;
        }}
        .content li {{
            margin-bottom: 0.5rem;
            line-height: 1.6;
        }}
        .content a {{
            color: var(--primary-color);
            text-decoration: none;
        }}
        .content a:hover {{
            text-decoration: underline;
        }}
        .content strong {{
            color: var(--text-primary);
        }}
        .content hr {{
            border: none;
            border-top: 1px solid var(--border-color);
            margin: 2rem 0;
        }}
        .content table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }}
        .content th, .content td {{
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }}
        .content th {{
            background: var(--surface-color);
            color: var(--text-primary);
            font-weight: 600;
        }}
        .content td {{
            color: var(--text-secondary);
        }}
        .content tr:hover {{
            background: var(--surface-color);
        }}
        .content code {{
            background: var(--surface-color);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
            color: var(--primary-color);
        }}
        .content pre {{
            background: var(--surface-color);
            padding: 1rem;
            border-radius: var(--radius-md);
            overflow-x: auto;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }}
        .content pre code {{
            background: none;
            padding: 0;
            color: var(--text-secondary);
            font-size: 0.875rem;
            line-height: 1.6;
        }}
        footer {{
            background: var(--surface-color);
            border-top: 1px solid var(--border-color);
            padding: 2rem;
            text-align: center;
        }}
        footer p {{
            color: var(--text-secondary);
            margin: 0.5rem 0;
        }}
        footer a {{
            color: var(--primary-color);
            text-decoration: none;
        }}
        footer a:hover {{
            text-decoration: underline;
        }}
        @media (max-width: 768px) {{
            .page-nav .nav-links {{ gap: 1rem; font-size: 0.9rem; }}
        }}
    </style>
</head>
<body>
    <nav class="page-nav">
        <div class="logo">PSYC 51.17</div>
        <div class="nav-links">
            {nav_html}<button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                <span id="themeIcon">&#127769;</span>
            </button>
        </div>
    </nav>

    <header class="page-header">
        <h1>{title}</h1>
    </header>

    <main class="content">
        {content}
    </main>

    <footer>
        <p>&copy; 2026 <a href="https://www.context-lab.com" target="_blank">Contextual Dynamics Lab</a></p>
        <p>PSYC 51.17: Language Models from Scratch</p>
    </footer>

    <script>
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const html = document.documentElement;
        const currentTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', currentTheme);
        themeIcon.innerHTML = currentTheme === 'dark' ? '&#127769;' : '&#9728;';
        themeToggle.addEventListener('click', () => {{
            const current = html.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeIcon.innerHTML = newTheme === 'dark' ? '&#127769;' : '&#9728;';
        }});
    </script>
</body>
</html>'''


ACCEPT_ASSIGNMENT_BUTTON = """
<div style="background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin: 2rem 0; text-align: center;">
    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Ready to Start?</h3>
    <a href="#" class="accept-btn" style="display: inline-block; background: var(--gradient-primary); color: white; padding: 0.75rem 2rem; border-radius: var(--radius-md); font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(99,102,241,0.4)';" onmouseout="this.style.transform='';this.style.boxShadow='';">
        <i class="fa-solid fa-rocket" style="margin-right: 0.5rem;"></i>Accept Assignment
    </a>
    <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
        GitHub Classroom link coming soon
    </p>
</div>
"""


def build_syllabus():
    """Build the syllabus page from markdown."""
    source = REPO_ROOT / "admin" / "syllabus.md"
    dest = REPO_ROOT / "syllabus" / "index.html"

    if not source.exists():
        print(f"Warning: {source} not found, skipping syllabus")
        return

    markdown = source.read_text()
    content = parse_markdown_to_html(markdown)
    html = get_page_template("Course Syllabus", "syllabus", content, depth=1)

    dest.parent.mkdir(exist_ok=True)
    dest.write_text(html)
    print(f"Built: {dest}")


def build_assignment_hub():
    """Build the main assignments hub page."""
    source = REPO_ROOT / "assignments" / "README.md"
    dest = REPO_ROOT / "assignments" / "index.html"

    if not source.exists():
        print(f"Warning: {source} not found, creating default")
        create_assignments_readme()

    markdown = source.read_text()
    content = parse_markdown_to_html(markdown)
    html = get_page_template("Course Assignments", "assignments", content, depth=1)

    dest.write_text(html)
    print(f"Built: {dest}")


# Map: (display_title, output_dir, submodule_dir)
ASSIGNMENT_DIRS = [
    ("Assignment 1 - ELIZA", "assignment-1", "eliza-llm-course"),
    ("Assignment 2 - SPAM Classifier", "assignment-2", "spam-classifier-llm-course"),
    ("Assignment 3 - Wikipedia Embeddings", "assignment-3", "embeddings-llm-course"),
    (
        "Assignment 4 - Customer Service Chatbot",
        "assignment-4",
        "customer-service-bot-llm-course",
    ),
    ("Assignment 5 - Build GPT", "assignment-5", "gpt-llm-course"),
    ("Final Project", "final-project", "final-project-llm-course"),
]


def extract_github_classroom_link(markdown_text):
    """Extract GitHub Classroom link from the submission box in README."""
    match = re.search(
        r"\[GitHub Classroom Link\]\((https://classroom\.github\.com/[^)]+)\)",
        markdown_text,
    )
    if match:
        return match.group(1)
    return None


def extract_due_date(markdown_text):
    """Extract due date from the submission box in README."""
    match = re.search(r"\*\*Due:\*\*\s*([^\n]+)", markdown_text)
    if match:
        return match.group(1).strip()
    return None


def create_accept_button(classroom_link, due_date):
    """Create the Accept Assignment button HTML with actual link."""
    if classroom_link:
        link_html = f'<a href="{classroom_link}" target="_blank" class="accept-btn" style="display: inline-block; background: var(--gradient-primary); color: white; padding: 0.75rem 2rem; border-radius: var(--radius-md); font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 4px 12px rgba(99,102,241,0.4)\';" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\';">'
        link_html += '<i class="fa-solid fa-rocket" style="margin-right: 0.5rem;"></i>Accept Assignment</a>'
        due_html = (
            f'<p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">Due: {due_date}</p>'
            if due_date
            else ""
        )
    else:
        link_html = '<span style="color: var(--text-secondary);">GitHub Classroom link coming soon</span>'
        due_html = ""

    return f"""
<div style="background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin: 2rem 0; text-align: center;">
    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Ready to Start?</h3>
    {link_html}
    {due_html}
</div>
"""


def strip_submission_box(markdown_text):
    """Remove the submission box blockquote from markdown before processing."""
    lines = markdown_text.split("\n")
    result = []
    in_blockquote = False
    found_hr = False

    for line in lines:
        if line.startswith("> ") and not found_hr:
            in_blockquote = True
            continue
        if in_blockquote and line.strip() == "":
            continue
        if line.strip() == "---" and in_blockquote:
            in_blockquote = False
            found_hr = True
            continue
        if not in_blockquote:
            result.append(line)

    return "\n".join(result)


def build_individual_assignments():
    """Build individual assignment pages from submodule READMEs."""
    assignments_dir = REPO_ROOT / "assignments"

    for title, dest_name, submodule_name in ASSIGNMENT_DIRS:
        source = assignments_dir / submodule_name / "README.md"
        dest_dir = assignments_dir / dest_name
        dest = dest_dir / "index.html"

        if not source.exists():
            print(f"Warning: {source} not found, skipping")
            continue

        markdown = source.read_text()

        classroom_link = extract_github_classroom_link(markdown)
        due_date = extract_due_date(markdown)
        accept_button = create_accept_button(classroom_link, due_date)

        clean_markdown = strip_submission_box(markdown)
        content = accept_button + parse_markdown_to_html(clean_markdown)

        html = get_page_template(title, "assignments", content, depth=2)

        dest_dir.mkdir(exist_ok=True)
        dest.write_text(html)
        print(f"Built: {dest}")


def create_assignments_readme():
    """Create the default assignments README if it doesn't exist."""
    readme_path = REPO_ROOT / "assignments" / "README.md"

    content = """# Course Assignments

Welcome to the assignments for PSYC 51.17: Models of Language and Communication.

## Submission Instructions

All assignments are submitted via GitHub Classroom. Click the "Accept Assignment" button on each assignment page to get started. This will create a personal repository where you'll complete your work.

**Submission Process:**

1. Click "Accept Assignment" to create your repository
2. Clone the repository to your local machine or open in Google Colab
3. Complete the assignment following the instructions
4. Commit and push your changes before the deadline
5. Your latest commit before the deadline will be graded

## Assignment Schedule

| # | Title | Released | Due | Weight |
|---|-------|----------|-----|--------|
| 1 | [ELIZA Chatbot](./assignment-1/) | Week 1 | End of Week 2 | 15% |
| 2 | [SPAM Classifier](./assignment-2/) | Week 2 | End of Week 3 | 15% |
| 3 | [Wikipedia Embeddings](./assignment-3/) | Week 3 | End of Week 4 | 15% |
| 4 | [Customer Service Chatbot](./assignment-4/) | Week 5 | End of Week 6 | 15% |
| 5 | [Build GPT](./assignment-5/) | Week 7 | Week 9 | 15% |
| Final | [Research Project](./final-project/) | Week 9 | Finals Week | 25% |

## Late Policy

Assignments receive a 10% deduction for each week late, rounded up to the nearest whole week. The final project must be submitted on time.

## Grading

Each assignment is graded on:

- **Correctness**: Does your code produce the expected outputs?
- **Code Quality**: Is your code well-organized and documented?
- **Understanding**: Do your explanations demonstrate understanding of the concepts?

## Getting Help

- **Office Hours**: By appointment
- **Discord**: Join our class server for discussions
- **GitHub Issues**: Report bugs or ask questions on the assignment repositories

---

## Assignments

### [Assignment 1: ELIZA Chatbot](./assignment-1/)
Build a pattern-matching chatbot based on Weizenbaum's classic ELIZA program. Learn about string manipulation, regular expressions, and the foundations of conversational AI.

### [Assignment 2: SPAM Classifier](./assignment-2/)
Develop a text classification system to identify spam messages. Explore feature engineering, tokenization, and evaluation metrics.

### [Assignment 3: Wikipedia Embeddings](./assignment-3/)
Compare different text embedding methods on Wikipedia articles. Visualize semantic relationships and evaluate embedding quality.

### [Assignment 4: Customer Service Chatbot](./assignment-4/)
Create a context-aware customer service chatbot using transformer-based models. Implement retrieval and response generation.

### [Assignment 5: Build GPT](./assignment-5/)
Implement and train a small GPT model from scratch. Understand the transformer architecture, attention mechanisms, and autoregressive generation.

### [Final Project: Research Project](./final-project/)
Conduct an independent research project applying concepts from the course. Present your findings to the class.
"""

    readme_path.write_text(content)
    print(f"Created: {readme_path}")


def main():
    """Main build function."""
    print("Building course pages...")
    print("=" * 50)

    (REPO_ROOT / "syllabus").mkdir(exist_ok=True)
    (REPO_ROOT / "assignments").mkdir(exist_ok=True)

    build_syllabus()
    build_assignment_hub()
    build_individual_assignments()

    print("=" * 50)
    print("Done!")


if __name__ == "__main__":
    main()
