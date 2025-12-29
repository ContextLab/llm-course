#!/usr/bin/env python3
"""
process_markdown.py - Markdown processor for Marp presentations

This script processes Marp markdown files to:
1. Auto-split long code blocks across multiple slides
2. Auto-split long tables across multiple slides
3. Inject JavaScript for line numbering
4. Maintain continued line numbers across split code blocks
5. Add "continued..." indicators

Usage:
    python3 process_markdown.py input.md output.md [--max-lines N] [--max-table-rows N] [--no-split]

Arguments:
    input.md         Input markdown file
    output.md        Output processed markdown file
    --max-lines      Maximum lines per code block before splitting (default: 20)
    --max-table-rows Maximum data rows per table before splitting (default: 8)
    --no-split       Disable code block and table splitting
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


def parse_markdown_table(lines: list) -> dict:
    """
    Parse a markdown table into its components.

    Args:
        lines: List of markdown table lines (including header, separator, and data rows)

    Returns:
        dict with 'header', 'separator', 'data_rows', and 'column_count'
    """
    if len(lines) < 2:
        return None

    header = lines[0]
    separator = lines[1] if len(lines) > 1 else None
    data_rows = lines[2:] if len(lines) > 2 else []

    # Count columns from header
    column_count = len([c for c in header.split('|') if c.strip()])

    return {
        'header': header,
        'separator': separator,
        'data_rows': data_rows,
        'column_count': column_count
    }


def detect_long_columns(all_data_rows: list, threshold: int = 25) -> set:
    """
    Detect columns that have content long enough to likely wrap.

    Args:
        all_data_rows: List of all data rows (markdown format)
        threshold: Character length above which content is considered "long"

    Returns:
        Set of column indices that have long content
    """
    long_columns = set()

    for row in all_data_rows:
        cells = [c.strip() for c in row.split('|') if c.strip()]
        for i, cell in enumerate(cells):
            if len(cell) > threshold:
                long_columns.add(i)

    return long_columns


def generate_table_html(header: str, separator: str, data_rows: list, is_continuation: bool = False, is_split_table: bool = False, left_align_columns: set = None) -> list:
    """
    Generate HTML for a markdown table.

    Args:
        header: The header row (markdown format)
        separator: The separator row (markdown format)
        data_rows: List of data rows (markdown format)
        is_continuation: Whether this is a continuation table (affects styling)
        is_split_table: Whether this table is part of a split sequence (prevents autoscaling)
        left_align_columns: Set of column indices to force left-alignment (for split tables with wrapping)

    Returns:
        List of HTML lines
    """
    result = []
    if left_align_columns is None:
        left_align_columns = set()

    # Parse header cells
    header_cells = [c.strip() for c in header.split('|') if c.strip()]

    # Parse alignment from separator
    alignments = []
    if separator:
        sep_parts = [s.strip() for s in separator.split('|') if s.strip()]
        for part in sep_parts:
            if part.startswith(':') and part.endswith(':'):
                alignments.append('center')
            elif part.endswith(':'):
                alignments.append('right')
            elif part.startswith(':'):
                alignments.append('left')
            else:
                alignments.append('center')  # default

    # Ensure we have enough alignments
    while len(alignments) < len(header_cells):
        alignments.append('center')

    # Build HTML table with appropriate classes
    classes = []
    if is_split_table:
        classes.append('split-table')
    if is_continuation:
        classes.append('table-continuation')
    class_attr = f' class="{" ".join(classes)}"' if classes else ''
    result.append(f'<table{class_attr}>')

    # Header row (headers stay centered)
    result.append('<thead>')
    result.append('<tr>')
    for i, cell in enumerate(header_cells):
        align = alignments[i] if i < len(alignments) else 'center'
        result.append(f'<th style="text-align: {align}">{cell}</th>')
    result.append('</tr>')
    result.append('</thead>')

    # Data rows
    result.append('<tbody>')
    for row in data_rows:
        cells = [c.strip() for c in row.split('|') if c.strip()]
        result.append('<tr>')
        for i, cell in enumerate(cells):
            # Use left alignment for columns with long content, otherwise use default
            if i in left_align_columns:
                align = 'left'
            else:
                align = alignments[i] if i < len(alignments) else 'center'
            result.append(f'<td style="text-align: {align}">{cell}</td>')
        result.append('</tr>')
    result.append('</tbody>')

    result.append('</table>')

    return result


def split_table(table_lines: list, max_rows: int, current_title: str) -> list:
    """
    Split a long table across multiple slides.

    Args:
        table_lines: List of markdown table lines
        max_rows: Maximum data rows per slide
        current_title: Current slide title for continuation slides

    Returns:
        List of output lines (including slide separators and continued indicators)
    """
    parsed = parse_markdown_table(table_lines)
    if not parsed or len(parsed['data_rows']) <= max_rows:
        # No splitting needed, return original markdown
        return table_lines

    result = []
    header = parsed['header']
    separator = parsed['separator']
    data_rows = parsed['data_rows']

    # Detect columns with long content across ALL rows (for consistent alignment)
    long_columns = detect_long_columns(data_rows)

    # Split data rows into chunks
    chunks = []
    for i in range(0, len(data_rows), max_rows):
        chunks.append(data_rows[i:i + max_rows])

    # Generate slides for each chunk
    for chunk_idx, chunk in enumerate(chunks):
        if chunk_idx > 0:
            # Add slide separator and title for continuation
            result.append("")
            result.append("---")
            result.append("")
            if current_title:
                result.append(current_title)
                result.append("")

        # Generate HTML table for this chunk
        # All chunks are part of a split table, so mark them to prevent autoscaling
        # Pass long_columns to ensure consistent left-alignment across all slides
        is_continuation = chunk_idx > 0
        table_html = generate_table_html(header, separator, chunk, is_continuation, is_split_table=True, left_align_columns=long_columns)
        result.extend(table_html)

        # Add continued indicator based on position in sequence
        is_first = chunk_idx == 0
        is_last = chunk_idx == len(chunks) - 1

        if is_first and not is_last:
            # First slide of split table (more to come)
            result.append("")
            result.append('<div class="table-continued-indicator">continued...</div>')
        elif not is_first and not is_last:
            # Middle slide (continuation, more to come)
            result.append("")
            result.append('<div class="table-continued-indicator">...continued...</div>')
        elif not is_first and is_last:
            # Last slide (continuation, no more)
            result.append("")
            result.append('<div class="table-continued-indicator-last">...continued</div>')

    return result


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


def process_markdown(input_file: str, output_file: str, max_lines: int = 20, max_table_rows: int = 8, no_split: bool = False) -> dict:
    """
    Process a markdown file for Marp presentation.

    Args:
        input_file: Path to input markdown file
        output_file: Path to output processed markdown file
        max_lines: Maximum lines per code block before splitting
        max_table_rows: Maximum data rows per table before splitting
        no_split: If True, disable code block and table splitting

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

    # State tracking for table processing
    in_table = False
    table_lines_buffer = []
    table_start_idx = -1

    # Statistics
    stats = {
        "input_lines": len(lines),
        "code_blocks_found": 0,
        "code_blocks_split": 0,
        "tables_found": 0,
        "tables_split": 0,
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
                        # Last slide (continuation, no more) - uses different class for positioning
                        result_lines.append("")
                        result_lines.append('<div class="code-continued-indicator-last">...continued</div>')
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
            # Check if this is a table line (starts with |)
            is_table_line = line.strip().startswith('|') and line.strip().endswith('|')

            if is_table_line and not in_table:
                # Start of a new table
                in_table = True
                table_start_idx = len(result_lines)
                table_lines_buffer = [line]
                stats["tables_found"] += 1
            elif is_table_line and in_table:
                # Continue buffering table lines
                table_lines_buffer.append(line)
            elif not is_table_line and in_table:
                # End of table - process it
                in_table = False

                # Check if we need to split this table (has more than 2 lines: header + separator + data)
                # A table needs at least header + separator = 2 lines, plus data rows
                parsed = parse_markdown_table(table_lines_buffer)
                if not no_split and parsed and len(parsed['data_rows']) > max_table_rows:
                    # Remove any table lines we may have added
                    result_lines = result_lines[:table_start_idx]

                    # Split the table
                    split_result = split_table(table_lines_buffer, max_table_rows, current_title)
                    result_lines.extend(split_result)

                    stats["tables_split"] += 1
                    # Calculate how many slides were added
                    num_chunks = (len(parsed['data_rows']) + max_table_rows - 1) // max_table_rows
                    stats["slides_added"] += num_chunks - 1
                else:
                    # No splitting needed, output original markdown table
                    result_lines.extend(table_lines_buffer)

                table_lines_buffer = []

                # Now add the current non-table line
                result_lines.append(line)
            else:
                # Regular line (not in code block, not table)
                result_lines.append(line)

        i += 1

    # Handle any remaining buffered table at end of file
    if in_table and table_lines_buffer:
        parsed = parse_markdown_table(table_lines_buffer)
        if not no_split and parsed and len(parsed['data_rows']) > max_table_rows:
            # Remove any table lines we may have added
            result_lines = result_lines[:table_start_idx]

            # Split the table
            split_result = split_table(table_lines_buffer, max_table_rows, current_title)
            result_lines.extend(split_result)

            stats["tables_split"] += 1
            num_chunks = (len(parsed['data_rows']) + max_table_rows - 1) // max_table_rows
            stats["slides_added"] += num_chunks - 1
        else:
            result_lines.extend(table_lines_buffer)

    # Join result back together
    result = "\n".join(result_lines)

    stats["output_lines"] = len(result.split("\n"))

    # Write output
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(result)

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Process Marp markdown files with code block splitting, table splitting, and line numbering"
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
        "--max-table-rows", "-r",
        type=int,
        default=8,
        help="Maximum data rows per table before splitting (default: 8)"
    )
    parser.add_argument(
        "--no-split",
        action="store_true",
        help="Disable code block and table splitting"
    )

    args = parser.parse_args()

    try:
        stats = process_markdown(
            args.input,
            args.output,
            max_lines=args.max_lines,
            max_table_rows=args.max_table_rows,
            no_split=args.no_split
        )

        print(f"Processed: {stats['input_lines']} input lines -> {stats['output_lines']} output lines")
        print(f"Code blocks found: {stats['code_blocks_found']}")
        if stats['code_blocks_split'] > 0:
            print(f"Code blocks split: {stats['code_blocks_split']}")
        print(f"Tables found: {stats['tables_found']}")
        if stats['tables_split'] > 0:
            print(f"Tables split: {stats['tables_split']}")
        if stats['slides_added'] > 0:
            print(f"Additional slides created: {stats['slides_added']}")

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
