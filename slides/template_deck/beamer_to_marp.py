#!/usr/bin/env python3
"""
beamer_to_marp.py - Convert Beamer LaTeX slides to Marp markdown

Converts Beamer presentations to Marp format using the CDL theme.

Usage:
    python beamer_to_marp.py input.tex [-o output.md]

Features:
    - Converts frames to Marp slides
    - Handles columns, blocks, and lists
    - Maps custom Beamer boxes to CDL callout classes
    - Converts basic TikZ to flow diagram syntax or placeholders
    - Preserves emojis and hyperlinks
"""

import re
import argparse
import sys
from pathlib import Path
from typing import Optional, List, Tuple


class BeamerToMarpConverter:
    """Converts Beamer LaTeX to Marp markdown."""

    def __init__(self, input_path: str, theme: str = "cdl-theme"):
        self.input_path = Path(input_path)
        self.theme = theme
        self.title = ""
        self.subtitle = ""
        self.author = ""
        self.date = ""
        self.sections: List[str] = []

    def convert(self) -> str:
        """Main conversion method."""
        with open(self.input_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract metadata
        self._extract_metadata(content)

        # Build output
        output_parts = []

        # Add frontmatter
        output_parts.append(self._generate_frontmatter())

        # Add title slide
        output_parts.append(self._generate_title_slide())

        # Extract and convert frames
        frames = self._extract_frames(content)
        for frame in frames:
            converted = self._convert_frame(frame)
            if converted:
                output_parts.append(converted)

        return '\n'.join(output_parts)

    def _extract_metadata(self, content: str) -> None:
        """Extract title, author, date from Beamer preamble."""
        # Title
        match = re.search(r'\\title\{([^}]*)\}', content)
        if match:
            self.title = self._clean_latex(match.group(1))

        # Subtitle
        match = re.search(r'\\subtitle\{([^}]*)\}', content)
        if match:
            self.subtitle = self._clean_latex(match.group(1))

        # Author
        match = re.search(r'\\author\{([^}]*)\}', content)
        if match:
            self.author = self._clean_latex(match.group(1))

        # Date
        match = re.search(r'\\date\{([^}]*)\}', content)
        if match:
            self.date = self._clean_latex(match.group(1))

    def _generate_frontmatter(self) -> str:
        """Generate Marp frontmatter."""
        return f"""---
marp: true
theme: {self.theme}
paginate: true
header: '{self.author}'
footer: '{self.date}'
---
"""

    def _generate_title_slide(self) -> str:
        """Generate the title slide."""
        slide = "<!-- _class: lead -->\n\n"
        slide += f"# {self.title}\n"
        if self.subtitle:
            slide += f"## {self.subtitle}\n"
        slide += f"\n**{self.author}**\n"
        if self.date:
            slide += f"\n{self.date}\n"
        return slide

    def _extract_frames(self, content: str) -> List[str]:
        """Extract all frame environments from the document."""
        frames = []

        # Match \begin{frame}...\end{frame}
        # Handle optional arguments like [shrink=10]
        pattern = r'\\begin\{frame\}(?:\[[^\]]*\])?\s*(?:\{([^}]*)\})?(.*?)\\end\{frame\}'

        for match in re.finditer(pattern, content, re.DOTALL):
            frame_title = match.group(1) if match.group(1) else ""
            frame_content = match.group(2)
            frames.append((frame_title, frame_content))

        return frames

    def _convert_frame(self, frame: Tuple[str, str]) -> Optional[str]:
        """Convert a single frame to Marp slide."""
        title, content = frame

        # Skip title page frames
        if '\\titlepage' in content:
            return None

        # Skip TOC frames (optional - could convert to manual list)
        if '\\tableofcontents' in content:
            return self._generate_toc_slide(title)

        # Start slide
        lines = ["---\n"]

        # Add title if present
        if title:
            clean_title = self._clean_latex(title)
            lines.append(f"# {clean_title}\n")

        # Convert content
        converted_content = self._convert_content(content)
        lines.append(converted_content)

        return '\n'.join(lines)

    def _generate_toc_slide(self, title: str) -> str:
        """Generate a table of contents slide (placeholder)."""
        clean_title = self._clean_latex(title) if title else "Overview"
        return f"""---

# {clean_title}

<!-- TODO: Add manual table of contents or navigation -->

"""

    def _convert_content(self, content: str) -> str:
        """Convert frame content from LaTeX to Markdown."""
        # Process in order - some conversions depend on others

        # Handle sections (mark them for later)
        content = self._convert_sections(content)

        # Handle columns
        content = self._convert_columns(content)

        # Handle blocks
        content = self._convert_blocks(content)

        # Handle custom boxes
        content = self._convert_custom_boxes(content)

        # Handle lists
        content = self._convert_lists(content)

        # Handle TikZ (placeholder conversion)
        content = self._convert_tikz(content)

        # Handle tables
        content = self._convert_tables(content)

        # Handle code listings
        content = self._convert_listings(content)

        # Handle inline formatting
        content = self._convert_inline_formatting(content)

        # Handle hyperlinks
        content = self._convert_hyperlinks(content)

        # Clean up LaTeX artifacts
        content = self._cleanup_latex(content)

        return content

    def _convert_sections(self, content: str) -> str:
        """Track sections for reference (stored but not converted inline)."""
        for match in re.finditer(r'\\section\{([^}]*)\}', content):
            self.sections.append(self._clean_latex(match.group(1)))
        # Remove section commands from content
        return re.sub(r'\\section\{[^}]*\}', '', content)

    def _convert_columns(self, content: str) -> str:
        """Convert Beamer columns to HTML two-column layout."""
        # Match the columns environment
        columns_pattern = r'\\begin\{columns\}(?:\[[^\]]*\])?(.*?)\\end\{columns\}'

        def replace_columns(match):
            columns_content = match.group(1)

            # Extract individual columns
            column_pattern = r'\\begin\{column\}\{([^}]*)\}(.*?)\\end\{column\}'
            columns = re.findall(column_pattern, columns_content, re.DOTALL)

            if len(columns) == 2:
                # Two-column layout
                left_content = self._convert_content(columns[0][1])
                right_content = self._convert_content(columns[1][1])

                return f"""<div class="columns">
<div class="column">

{left_content.strip()}

</div>
<div class="column">

{right_content.strip()}

</div>
</div>
"""
            else:
                # Single or unknown column count - just process content
                return self._convert_content(columns_content)

        return re.sub(columns_pattern, replace_columns, content, flags=re.DOTALL)

    def _convert_blocks(self, content: str) -> str:
        """Convert Beamer block environments to Marp callouts."""
        # Standard block -> info callout
        content = re.sub(
            r'\\begin\{block\}\{([^}]*)\}(.*?)\\end\{block\}',
            lambda m: f'<div class="callout info">\n<div class="callout-title">{self._clean_latex(m.group(1))}</div>\n\n{m.group(2).strip()}\n\n</div>\n',
            content,
            flags=re.DOTALL
        )

        # Alert block -> warning callout
        content = re.sub(
            r'\\begin\{alertblock\}\{([^}]*)\}(.*?)\\end\{alertblock\}',
            lambda m: f'<div class="callout warning">\n<div class="callout-title">{self._clean_latex(m.group(1))}</div>\n\n{m.group(2).strip()}\n\n</div>\n',
            content,
            flags=re.DOTALL
        )

        # Example block -> tip callout
        content = re.sub(
            r'\\begin\{exampleblock\}\{([^}]*)\}(.*?)\\end\{exampleblock\}',
            lambda m: f'<div class="callout tip">\n<div class="callout-title">{self._clean_latex(m.group(1))}</div>\n\n{m.group(2).strip()}\n\n</div>\n',
            content,
            flags=re.DOTALL
        )

        return content

    def _convert_custom_boxes(self, content: str) -> str:
        """Convert custom Beamer boxes (thinkaboutit, discussion)."""
        # thinkaboutit -> tip callout
        content = re.sub(
            r'\\begin\{thinkaboutit\}(.*?)\\end\{thinkaboutit\}',
            lambda m: f'<div class="callout tip">\n<div class="callout-title">Think about it!</div>\n\n{m.group(1).strip()}\n\n</div>\n',
            content,
            flags=re.DOTALL
        )

        # discussion -> info callout
        content = re.sub(
            r'\\begin\{discussion\}(.*?)\\end\{discussion\}',
            lambda m: f'<div class="callout info">\n<div class="callout-title">Discussion</div>\n\n{m.group(1).strip()}\n\n</div>\n',
            content,
            flags=re.DOTALL
        )

        return content

    def _convert_lists(self, content: str) -> str:
        """Convert itemize and enumerate environments."""
        # Convert itemize
        def convert_itemize(match):
            items_content = match.group(1)
            # Remove setlength before extracting items
            items_content = re.sub(r'\\setlength\{[^}]*\}\{[^}]*\}', '', items_content)
            items = re.findall(r'\\item\s*(.*?)(?=\\item|$)', items_content, re.DOTALL)
            md_items = []
            for item in items:
                clean_item = item.strip()
                if clean_item:
                    md_items.append(f"- {clean_item}")
            return '\n'.join(md_items) + '\n'

        content = re.sub(
            r'\\begin\{itemize\}(?:\[[^\]]*\])?(.*?)\\end\{itemize\}',
            convert_itemize,
            content,
            flags=re.DOTALL
        )

        # Convert enumerate
        def convert_enumerate(match):
            items_content = match.group(1)
            # Remove setlength before extracting items
            items_content = re.sub(r'\\setlength\{[^}]*\}\{[^}]*\}', '', items_content)
            items = re.findall(r'\\item\s*(.*?)(?=\\item|$)', items_content, re.DOTALL)
            md_items = []
            counter = 1
            for item in items:
                clean_item = item.strip()
                if clean_item:
                    md_items.append(f"{counter}. {clean_item}")
                    counter += 1
            return '\n'.join(md_items) + '\n'

        content = re.sub(
            r'\\begin\{enumerate\}(?:\[[^\]]*\])?(.*?)\\end\{enumerate\}',
            convert_enumerate,
            content,
            flags=re.DOTALL
        )

        return content

    def _convert_tikz(self, content: str) -> str:
        """Convert TikZ diagrams to Marp flow syntax or placeholders."""
        # Match tikzpicture environments
        tikz_pattern = r'\\begin\{tikzpicture\}(?:\[[^\]]*\])?(.*?)\\end\{tikzpicture\}'

        def tikz_to_flow(match):
            tikz_content = match.group(1)

            # Try to identify the type of diagram
            if 'timeline' in tikz_content.lower() or '\\foreach' in tikz_content:
                return self._convert_timeline_tikz(tikz_content)
            elif 'arrow' in tikz_content.lower() or '->' in tikz_content:
                return self._convert_flowchart_tikz(tikz_content)
            elif 'circle' in tikz_content:
                return self._convert_venn_tikz(tikz_content)
            else:
                # Generic placeholder
                return f"""
<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:
{tikz_content[:500]}...
-->

```
[Diagram placeholder - manual conversion required]
```
"""

        return re.sub(tikz_pattern, tikz_to_flow, content, flags=re.DOTALL)

    def _convert_timeline_tikz(self, tikz_content: str) -> str:
        """Convert timeline TikZ to Marp flow diagram."""
        # Extract nodes from the timeline
        nodes = re.findall(r'\\node.*?\{([^}]+)\}', tikz_content)

        if not nodes:
            return "<!-- Timeline diagram - manual conversion needed -->\n"

        # Build a simple flow diagram
        flow_items = [n.strip().replace('\\\\', ' ').replace('\n', ' ')[:30] for n in nodes if n.strip()]

        if len(flow_items) > 1:
            return f"""
```
{' -> '.join(flow_items[:6])}
```
"""
        return "<!-- Timeline - see original for details -->\n"

    def _convert_flowchart_tikz(self, tikz_content: str) -> str:
        """Convert flowchart TikZ to Marp flow syntax."""
        # Try to extract node labels
        nodes = re.findall(r'\\node\[([^\]]*)\][^{]*\{([^}]+)\}', tikz_content)

        if not nodes:
            return "<!-- Flowchart - manual conversion needed -->\n"

        # Extract just the text content
        node_texts = [n[1].strip().replace('\\\\', ' ')[:25] for n in nodes if n[1].strip()]

        if len(node_texts) >= 2:
            return f"""
```
{' -> '.join(node_texts[:8])}
```
"""
        return "<!-- Flowchart - see original for structure -->\n"

    def _convert_venn_tikz(self, tikz_content: str) -> str:
        """Convert Venn/circle diagrams."""
        return "<!-- Venn diagram - manual conversion required -->\n"

    def _convert_tables(self, content: str) -> str:
        """Convert LaTeX tabular to Markdown tables."""
        # Match tabular environment
        tabular_pattern = r'\\begin\{tabular\}\{[^}]*\}(.*?)\\end\{tabular\}'

        def tabular_to_md(match):
            table_content = match.group(1)

            # Split into rows
            rows = re.split(r'\\\\', table_content)
            md_rows = []

            for i, row in enumerate(rows):
                # Clean and split by &
                row = row.strip()
                if not row or row.startswith('\\hline') or row.startswith('\\toprule') or \
                   row.startswith('\\midrule') or row.startswith('\\bottomrule'):
                    continue

                # Remove hline commands within the row
                row = re.sub(r'\\(?:hline|toprule|midrule|bottomrule)', '', row)

                cells = [self._clean_latex(c.strip()) for c in row.split('&')]
                if any(cells):
                    md_rows.append('| ' + ' | '.join(cells) + ' |')

                    # Add header separator after first row
                    if len(md_rows) == 1:
                        separator = '|' + '|'.join([' --- '] * len(cells)) + '|'
                        md_rows.append(separator)

            return '\n'.join(md_rows) + '\n'

        # Also handle table environment wrapper
        content = re.sub(r'\\begin\{table\}(?:\[[^\]]*\])?(.*?)\\end\{table\}',
                        lambda m: m.group(1), content, flags=re.DOTALL)

        return re.sub(tabular_pattern, tabular_to_md, content, flags=re.DOTALL)

    def _convert_listings(self, content: str) -> str:
        """Convert lstlisting to code blocks."""
        # lstlisting with language
        content = re.sub(
            r'\\begin\{lstlisting\}(?:\[language=([^\]]*)\])?(.*?)\\end\{lstlisting\}',
            lambda m: f"```{m.group(1).lower() if m.group(1) else 'python'}\n{m.group(2).strip()}\n```\n",
            content,
            flags=re.DOTALL
        )

        # verbatim
        content = re.sub(
            r'\\begin\{verbatim\}(.*?)\\end\{verbatim\}',
            lambda m: f"```\n{m.group(1).strip()}\n```\n",
            content,
            flags=re.DOTALL
        )

        return content

    def _convert_inline_formatting(self, content: str) -> str:
        """Convert inline LaTeX formatting to Markdown."""
        # Bold: \textbf{} -> **
        content = re.sub(r'\\textbf\{([^}]*)\}', r'**\1**', content)

        # Italic: \textit{} or \emph{} -> *
        content = re.sub(r'\\(?:textit|emph)\{([^}]*)\}', r'*\1*', content)

        # Monospace: \texttt{} -> `
        content = re.sub(r'\\texttt\{([^}]*)\}', r'`\1`', content)

        # Large/huge text (remove commands, keep text)
        content = re.sub(r'\\(?:Large|LARGE|huge|Huge|large|small|footnotesize|tiny)\{([^}]*)\}', r'\1', content)
        content = re.sub(r'\{\\(?:Large|LARGE|huge|Huge|large|small|footnotesize|tiny)\s+([^}]*)\}', r'\1', content)

        return content

    def _convert_hyperlinks(self, content: str) -> str:
        """Convert LaTeX hyperlinks to Markdown."""
        # \href{url}{text} -> [text](url)
        content = re.sub(
            r'\\href\{([^}]*)\}\{([^}]*)\}',
            r'[\2](\1)',
            content
        )

        # \url{} -> plain URL
        content = re.sub(r'\\url\{([^}]*)\}', r'\1', content)

        return content

    def _cleanup_latex(self, content: str) -> str:
        """Remove remaining LaTeX artifacts."""
        # Remove setlength commands (do this early - they appear in lists)
        content = re.sub(r'\\setlength\{[^}]*\}\{[^}]*\}', '', content)

        # Remove standalone size commands (without braces)
        content = re.sub(r'\\(?:small|footnotesize|tiny|large|Large|LARGE|huge|Huge|normalsize)\b', '', content)

        # Remove common spacing commands
        content = re.sub(r'\\vspace\{[^}]*\}', '\n', content)
        content = re.sub(r'\\hspace\{[^}]*\}', ' ', content)
        content = re.sub(r'\\vfill', '\n', content)
        content = re.sub(r'\\centering', '', content)
        content = re.sub(r'\\noindent', '', content)

        # Convert escaped special characters
        content = content.replace(r'\%', '%')
        content = content.replace(r'\$', '$')
        content = content.replace(r'\&', '&')
        content = content.replace(r'\_', '_')
        content = content.replace(r'\#', '#')
        content = content.replace(r'\{', '{')
        content = content.replace(r'\}', '}')
        content = content.replace(r'\neq', '≠')
        content = content.replace(r'\textbar', '|')

        # Remove begin/end center
        content = re.sub(r'\\begin\{center\}', '', content)
        content = re.sub(r'\\end\{center\}', '', content)

        # Remove other environments we didn't handle
        content = re.sub(r'\\begin\{[^}]*\}(?:\[[^\]]*\])?', '', content)
        content = re.sub(r'\\end\{[^}]*\}', '', content)

        # Remove scope and other TikZ remnants
        content = re.sub(r'\\begin\{scope\}[^}]*', '', content)
        content = re.sub(r'\\end\{scope\}', '', content)

        # Remove standalone LaTeX commands
        content = re.sub(r'\\(?:def|fill|draw|node|path|coordinate)[^;]*;', '', content)

        # Remove any remaining backslash commands we missed
        content = re.sub(r'\\[a-zA-Z]+\{[^}]*\}', '', content)

        # Clean up artifacts from list conversions (e.g., "- sep}{0pt}")
        content = re.sub(r'-\s*sep\}\{[^}]*\}', '', content)
        content = re.sub(r'\d+\.\s*sep\}\{[^}]*\}', '', content)

        # Remove empty list items
        content = re.sub(r'^-\s*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^\d+\.\s*$', '', content, flags=re.MULTILINE)

        # Remove empty lines and normalize whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)

        return content

    def _clean_latex(self, text: str) -> str:
        """Clean LaTeX commands from a text string."""
        # Remove formatting commands
        text = re.sub(r'\\(?:textbf|textit|emph|texttt)\{([^}]*)\}', r'\1', text)

        # Remove size commands
        text = re.sub(r'\\(?:Large|LARGE|huge|Huge|large|small|footnotesize|tiny)', '', text)

        # Remove other common commands
        text = re.sub(r'\\(?:bf|it|tt|em)\b', '', text)

        # Clean up whitespace
        text = ' '.join(text.split())

        return text


def main():
    parser = argparse.ArgumentParser(
        description='Convert Beamer LaTeX to Marp markdown'
    )
    parser.add_argument('input', help='Input .tex file')
    parser.add_argument('-o', '--output', help='Output .md file (default: input with .md extension)')
    parser.add_argument('-t', '--theme', default='cdl-theme', help='Marp theme name')

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output) if args.output else input_path.with_suffix('.md')

    converter = BeamerToMarpConverter(input_path, theme=args.theme)
    result = converter.convert()

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(result)

    print(f"Converted: {input_path} -> {output_path}")


if __name__ == '__main__':
    main()
