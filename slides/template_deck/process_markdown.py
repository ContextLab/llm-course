#!/usr/bin/env python3
"""
process_markdown.py - Markdown processor for Marp presentations

This script processes Marp markdown files to:
1. Auto-split long code blocks across multiple slides
2. Inject JavaScript for line numbering
3. Maintain continued line numbers across split code blocks
4. Add "continued..." indicators

Usage:
    python3 process_markdown.py input.md output.md [--max-lines N] [--no-split]

Arguments:
    input.md      Input markdown file
    output.md     Output processed markdown file
    --max-lines   Maximum lines per code block before splitting (default: 20)
    --no-split    Disable code block splitting
"""

import argparse
import re
import sys
from html import escape

# Pygments for syntax highlighting
try:
    from pygments import highlight
    from pygments.lexers import get_lexer_by_name, guess_lexer, TextLexer
    from pygments.formatters import HtmlFormatter
    from pygments.util import ClassNotFound
    PYGMENTS_AVAILABLE = True
except ImportError:
    PYGMENTS_AVAILABLE = False


def highlight_code_line(code_line: str, lang: str) -> str:
    """
    Apply syntax highlighting to a single line of code.
    Returns HTML with span tags for syntax highlighting.
    """
    if not PYGMENTS_AVAILABLE or not code_line.strip():
        return escape(code_line)

    try:
        if lang:
            lexer = get_lexer_by_name(lang, stripall=False)
        else:
            lexer = TextLexer()
    except ClassNotFound:
        lexer = TextLexer()

    # Use a formatter that outputs inline styles or classes
    formatter = HtmlFormatter(nowrap=True, classprefix='hl-')

    # Highlight the line
    highlighted = highlight(code_line, lexer, formatter)

    # Remove trailing newline that Pygments adds
    return highlighted.rstrip('\n')


def process_markdown(input_file: str, output_file: str, max_lines: int = 20, no_split: bool = False) -> dict:
    """
    Process a markdown file for Marp presentation.

    Args:
        input_file: Path to input markdown file
        output_file: Path to output processed markdown file
        max_lines: Maximum lines per code block before splitting
        no_split: If True, disable code block splitting

    Returns:
        dict with processing statistics
    """
    # Read input file
    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse the file into lines
    lines = content.split("\n")
    result_lines = []

    # Track frontmatter
    frontmatter_count = 0
    frontmatter_end_idx = -1

    # Find frontmatter boundaries
    for i, line in enumerate(lines):
        if line.strip() == "---":
            frontmatter_count += 1
            if frontmatter_count == 2:
                frontmatter_end_idx = i
                break

    # State tracking for code block processing
    in_code_block = False
    code_block_fence = ""
    code_block_lang = ""
    code_block_start_idx = -1
    code_lines_buffer = []
    current_title = ""

    # Statistics
    stats = {
        "input_lines": len(lines),
        "code_blocks_found": 0,
        "code_blocks_split": 0,
        "slides_added": 0,
    }

    i = 0
    while i < len(lines):
        line = lines[i]

        # Track current slide title (for continuation slides)
        title_match = re.match(r'^(#{1,2})\s+(.+)$', line)
        if title_match and not in_code_block:
            current_title = line

        # Detect code block start (``` or ~~~)
        code_start_match = re.match(r'^(`{3,}|~{3,})(\w*)(.*)$', line)
        if code_start_match and not in_code_block:
            in_code_block = True
            code_block_fence = code_start_match.group(1)
            code_block_lang = code_start_match.group(2)
            code_block_start_idx = len(result_lines)
            code_lines_buffer = []
            result_lines.append(line)
            stats["code_blocks_found"] += 1
            i += 1
            continue

        # Detect code block end
        if in_code_block and line.strip().startswith(code_block_fence[0] * 3):
            in_code_block = False

            # Check if we need to split this code block
            if not no_split and len(code_lines_buffer) > max_lines:
                # Remove the opening fence we already added
                result_lines = result_lines[:code_block_start_idx]

                # Split into chunks
                chunks = []
                for j in range(0, len(code_lines_buffer), max_lines):
                    chunks.append(code_lines_buffer[j:j + max_lines])

                stats["code_blocks_split"] += 1
                stats["slides_added"] += len(chunks) - 1

                # Generate slides for each chunk
                for chunk_idx, chunk in enumerate(chunks):
                    start_line_num = chunk_idx * max_lines + 1

                    if chunk_idx > 0:
                        # Add slide separator and title for continuation
                        result_lines.append("")
                        result_lines.append("---")
                        result_lines.append("")
                        if current_title:
                            result_lines.append(current_title)
                            result_lines.append("")

                    if chunk_idx == 0:
                        # First chunk: use HTML with line numbers and syntax highlighting
                        lang_class = f'class="language-{code_block_lang} has-line-numbers"' if code_block_lang else 'class="has-line-numbers"'
                        result_lines.append(f'<pre><code {lang_class} data-start-line="1">')
                        for line_idx, code_line in enumerate(chunk):
                            line_num = line_idx + 1
                            highlighted = highlight_code_line(code_line, code_block_lang)
                            result_lines.append(f'<span class="line"><span class="line-num">{line_num}</span><span class="line-code">{highlighted}</span></span>')
                        result_lines.append("</code></pre>")
                    else:
                        # Continuation chunks: use HTML with data-start-line attribute and syntax highlighting
                        lang_class = f'class="language-{code_block_lang} has-line-numbers"' if code_block_lang else 'class="has-line-numbers"'
                        result_lines.append(f'<pre><code {lang_class} data-start-line="{start_line_num}">')
                        for line_idx, code_line in enumerate(chunk):
                            line_num = start_line_num + line_idx
                            highlighted = highlight_code_line(code_line, code_block_lang)
                            result_lines.append(f'<span class="line"><span class="line-num">{line_num}</span><span class="line-code">{highlighted}</span></span>')
                        result_lines.append("</code></pre>")

                    # Add continued indicator based on position in sequence
                    # First slide: "continued..."
                    # Middle slides: "...continued..."
                    # Last slide: "...continued"
                    is_first = chunk_idx == 0
                    is_last = chunk_idx == len(chunks) - 1

                    if is_first and not is_last:
                        # First slide of split code (more to come)
                        result_lines.append("")
                        result_lines.append('<div class="code-continued-indicator">continued...</div>')
                    elif not is_first and not is_last:
                        # Middle slide (continuation, more to come)
                        result_lines.append("")
                        result_lines.append('<div class="code-continued-indicator">...continued...</div>')
                    elif not is_first and is_last:
                        # Last slide (continuation, no more)
                        result_lines.append("")
                        result_lines.append('<div class="code-continued-indicator">...continued</div>')
            else:
                # No splitting needed, but still add line numbers and syntax highlighting
                # Remove the opening fence we already added
                result_lines = result_lines[:code_block_start_idx]

                lang_class = f'class="language-{code_block_lang} has-line-numbers"' if code_block_lang else 'class="has-line-numbers"'
                result_lines.append(f'<pre><code {lang_class} data-start-line="1">')
                for line_idx, code_line in enumerate(code_lines_buffer):
                    line_num = line_idx + 1
                    highlighted = highlight_code_line(code_line, code_block_lang)
                    result_lines.append(f'<span class="line"><span class="line-num">{line_num}</span><span class="line-code">{highlighted}</span></span>')
                result_lines.append("</code></pre>")

            code_lines_buffer = []
            i += 1
            continue

        # Inside code block: buffer the lines
        if in_code_block:
            code_lines_buffer.append(line)
        else:
            result_lines.append(line)

        i += 1

    # Join result back together
    result = "\n".join(result_lines)

    stats["output_lines"] = len(result.split("\n"))

    # Write output
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(result)

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Process Marp markdown files with code block splitting and line numbering"
    )
    parser.add_argument("input", help="Input markdown file")
    parser.add_argument("output", help="Output processed markdown file")
    parser.add_argument(
        "--max-lines", "-l",
        type=int,
        default=20,
        help="Maximum lines per code block before splitting (default: 20)"
    )
    parser.add_argument(
        "--no-split",
        action="store_true",
        help="Disable code block splitting"
    )

    args = parser.parse_args()

    try:
        stats = process_markdown(
            args.input,
            args.output,
            max_lines=args.max_lines,
            no_split=args.no_split
        )

        print(f"Processed: {stats['input_lines']} input lines -> {stats['output_lines']} output lines")
        print(f"Code blocks found: {stats['code_blocks_found']}")
        if stats['code_blocks_split'] > 0:
            print(f"Code blocks split: {stats['code_blocks_split']}")
            print(f"Additional slides created: {stats['slides_added']}")

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
