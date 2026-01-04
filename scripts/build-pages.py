#!/usr/bin/env python3

import re
import os
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent


def strip_latex_preamble(text):
    if "\\begin{" not in text:
        return text
    match = re.search(r"^## ", text, re.MULTILINE)
    return text[match.start() :] if match else text


def convert_headers(html):
    html = re.sub(r"^### (.+)$", r"<h3>\1</h3>", html, flags=re.MULTILINE)
    html = re.sub(r"^## (.+)$", r"<h2>\1</h2>", html, flags=re.MULTILINE)
    html = re.sub(r"^# (.+)$", r"<h1>\1</h1>", html, flags=re.MULTILINE)
    return html


def convert_inline_formatting(html):
    html = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", html)
    html = re.sub(r"\*(.+?)\*", r"<em>\1</em>", html)
    html = re.sub(r"_(.+?)_", r"<em>\1</em>", html)
    return html


def convert_links(html):
    return re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2" target="_blank">\1</a>', html
    )


def convert_lists(html):
    lines = html.split("\n")
    in_list = False
    result = []
    for line in lines:
        if line.strip().startswith("- "):
            if not in_list:
                result.append("<ul>")
                in_list = True
            result.append(f"<li>{line.strip()[2:]}</li>")
        else:
            if in_list:
                result.append("</ul>")
                in_list = False
            result.append(line)
    if in_list:
        result.append("</ul>")
    return "\n".join(result)


def wrap_paragraphs(html):
    paragraphs = re.split(r"\n\n+", html)
    formatted = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if (
            p.startswith("<h")
            or p.startswith("<ul")
            or p.startswith("<ol")
            or p.startswith("<table")
        ):
            formatted.append(p)
        elif p.startswith("<li"):
            formatted.append(p)
        else:
            formatted.append(f"<p>{p}</p>")
    return "\n".join(formatted)


def parse_markdown_to_html(markdown_text):
    html = strip_latex_preamble(markdown_text)
    html = convert_headers(html)
    html = convert_inline_formatting(html)
    html = convert_links(html)
    html = convert_lists(html)
    html = wrap_paragraphs(html)
    return html


def get_page_template(title, nav_active, content, depth=1):
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
        .content p {{
            color: var(--text-secondary);
            line-height: 1.8;
            margin-bottom: 1rem;
        }}
        .content ul {{
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


ASSIGNMENT_DIRS = [
    ("Assignment 1: ELIZA", "assignment-1"),
    ("Assignment 2: SPAM classifier", "assignment-2"),
    ("Assignment 3: Wikipedia", "assignment-3"),
    ("Assignment 4: Customer Service Chatbot", "assignment-4"),
    ("Assignment 5: GPT", "assignment-5"),
    ("Final Project", "final-project"),
]


def build_individual_assignments():
    assignments_dir = REPO_ROOT / "assignments"

    for source_name, dest_name in ASSIGNMENT_DIRS:
        source = assignments_dir / source_name / "README.md"
        dest_dir = assignments_dir / dest_name
        dest = dest_dir / "index.html"

        if not source.exists():
            print(f"Warning: {source} not found, skipping")
            continue

        markdown = source.read_text()
        content = ACCEPT_ASSIGNMENT_BUTTON + parse_markdown_to_html(markdown)

        title = source_name.replace(":", " -")
        html = get_page_template(title, "assignments", content, depth=2)

        dest_dir.mkdir(exist_ok=True)
        dest.write_text(html)
        print(f"Built: {dest}")


def create_assignments_readme():
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
