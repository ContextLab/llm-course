#!/usr/bin/env python3
"""
process_markdown.py - Markdown processor for Marp presentations

This script processes Marp markdown files to:
1. Auto-split long code blocks across multiple slides
2. Auto-split long tables across multiple slides
3. Inject JavaScript for line numbering
4. Maintain continued line numbers across split code blocks
5. Add "continued..." indicators
6. Convert simple flow diagram syntax to themed SVG diagrams

Usage:
    python3 process_markdown.py input.md output.md [--max-lines N] [--max-table-rows N] [--no-split]

Arguments:
    input.md         Input markdown file
    output.md        Output processed markdown file
    --max-lines      Maximum lines per code block before splitting (default: 20)
    --max-table-rows Maximum data rows per table before splitting (default: 8)
    --no-split       Disable code block and table splitting

Flow Diagram Syntax:
    ```flow
    [Input] --> [Process] --> [Output]
    ```

    This generates an auto-styled SVG flowchart matching the CDL theme.
    Supported features:
    - Multiple nodes: [Node1] --> [Node2] --> [Node3]
    - Vertical flow: [Node1] ==> [Node2]  (downward arrow)
    - Custom colors: [Node:green], [Node:teal], [Node:blue], [Node:orange]
    - Multi-line diagrams for complex flows
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


# =============================================================================
# FLOW DIAGRAM GENERATION
# =============================================================================

# CDL Theme color palette for flow diagrams - Dartmouth Tertiary Colors
# These colors match the emoji-bg-* classes in cdl-theme.css (using 0.15 opacity for flow diagrams)
# Note: CSS emoji-bg uses 0.5 opacity; flow diagrams use 0.15 for subtler backgrounds
FLOW_COLORS = {
    # Primary brand color
    'green': {'fill': 'rgba(0, 105, 62, 0.15)', 'stroke': '#00693e', 'text': '#00693e'},           # Dartmouth Green

    # Blues - River Blue and River Navy
    'blue': {'fill': 'rgba(38, 122, 186, 0.15)', 'stroke': '#267aba', 'text': '#003c73'},          # River Blue
    'river-blue': {'fill': 'rgba(38, 122, 186, 0.15)', 'stroke': '#267aba', 'text': '#003c73'},    # River Blue (alias)
    'navy': {'fill': 'rgba(0, 60, 115, 0.15)', 'stroke': '#003c73', 'text': '#003c73'},            # River Navy
    'river-navy': {'fill': 'rgba(0, 60, 115, 0.15)', 'stroke': '#003c73', 'text': '#003c73'},      # River Navy (alias)

    # Greens - Spring Green and Rich Spring Green
    'spring': {'fill': 'rgba(196, 221, 136, 0.15)', 'stroke': '#c4dd88', 'text': '#6a8a3a'},       # Spring Green
    'spring-green': {'fill': 'rgba(196, 221, 136, 0.15)', 'stroke': '#c4dd88', 'text': '#6a8a3a'}, # Spring Green (alias)
    'rich-spring': {'fill': 'rgba(165, 215, 95, 0.15)', 'stroke': '#a5d75f', 'text': '#5a8a2a'},   # Rich Spring Green
    'teal': {'fill': 'rgba(0, 128, 128, 0.15)', 'stroke': '#008080', 'text': '#006666'},           # Teal (blue-green)

    # Warm colors - Yellows and Oranges
    'yellow': {'fill': 'rgba(245, 220, 105, 0.15)', 'stroke': '#f5dc69', 'text': '#8a7a30'},       # Summer Yellow
    'summer': {'fill': 'rgba(245, 220, 105, 0.15)', 'stroke': '#f5dc69', 'text': '#8a7a30'},       # Summer Yellow (alias)
    'orange': {'fill': 'rgba(255, 160, 15, 0.15)', 'stroke': '#ffa00f', 'text': '#d94415'},        # Bonfire Orange
    'bonfire': {'fill': 'rgba(255, 160, 15, 0.15)', 'stroke': '#ffa00f', 'text': '#d94415'},       # Bonfire Orange (alias)
    'tuck': {'fill': 'rgba(217, 68, 21, 0.15)', 'stroke': '#d94415', 'text': '#d94415'},           # Tuck Orange
    'tuck-orange': {'fill': 'rgba(217, 68, 21, 0.15)', 'stroke': '#d94415', 'text': '#d94415'},    # Tuck Orange (alias)

    # Reds
    'red': {'fill': 'rgba(157, 22, 46, 0.15)', 'stroke': '#9d162e', 'text': '#9d162e'},            # Bonfire Red
    'bonfire-red': {'fill': 'rgba(157, 22, 46, 0.15)', 'stroke': '#9d162e', 'text': '#9d162e'},    # Bonfire Red (alias)

    # Other colors
    'violet': {'fill': 'rgba(138, 105, 150, 0.15)', 'stroke': '#8a6996', 'text': '#6a4d7a'},       # Violet
    'purple': {'fill': 'rgba(138, 105, 150, 0.15)', 'stroke': '#8a6996', 'text': '#6a4d7a'},       # Violet (alias)
    'brown': {'fill': 'rgba(100, 60, 32, 0.15)', 'stroke': '#643c20', 'text': '#643c20'},          # Autumn Brown
    'autumn': {'fill': 'rgba(100, 60, 32, 0.15)', 'stroke': '#643c20', 'text': '#643c20'},         # Autumn Brown (alias)

    # Grays
    'gray': {'fill': 'rgba(66, 65, 65, 0.15)', 'stroke': '#424141', 'text': '#424141'},            # Granite Gray
    'granite': {'fill': 'rgba(66, 65, 65, 0.15)', 'stroke': '#424141', 'text': '#424141'},         # Granite Gray (alias)
}

# Default color sequence for auto-coloring nodes
DEFAULT_COLOR_SEQUENCE = ['green', 'teal', 'blue', 'orange', 'gray']


def parse_flow_node(node_text: str) -> dict:
    """
    Parse a flow diagram node from text like [Label] or [Label:color].

    Args:
        node_text: Text like "Input" or "Process:teal"

    Returns:
        dict with 'label' and optional 'color'
    """
    if ':' in node_text:
        parts = node_text.rsplit(':', 1)
        label = parts[0].strip()
        color = parts[1].strip().lower()
        if color not in FLOW_COLORS:
            color = None  # Will use auto-color
    else:
        label = node_text.strip()
        color = None

    return {'label': label, 'color': color}


def parse_flow_line(line: str) -> list:
    """
    Parse a line of flow diagram syntax into nodes and arrows.

    Supported syntax:
        [A] --> [B] --> [C]     Horizontal flow
        [A] ==> [B]             Vertical flow (down)

    Args:
        line: A line of flow diagram syntax

    Returns:
        List of dicts with 'type' (node/arrow_h/arrow_v) and content
    """
    elements = []
    line = line.strip()

    if not line:
        return elements

    # Pattern to match nodes [text] or [text:color]
    node_pattern = r'\[([^\]]+)\]'
    # Pattern to match arrows
    arrow_h_pattern = r'-->'  # Horizontal arrow
    arrow_v_pattern = r'==>'  # Vertical arrow

    # Tokenize the line
    pos = 0
    while pos < len(line):
        # Skip whitespace
        while pos < len(line) and line[pos].isspace():
            pos += 1
        if pos >= len(line):
            break

        # Check for node
        node_match = re.match(node_pattern, line[pos:])
        if node_match:
            node_text = node_match.group(1)
            elements.append({'type': 'node', 'content': parse_flow_node(node_text)})
            pos += node_match.end()
            continue

        # Check for horizontal arrow
        if line[pos:pos+3] == '-->':
            elements.append({'type': 'arrow_h', 'content': None})
            pos += 3
            continue

        # Check for vertical arrow
        if line[pos:pos+3] == '==>':
            elements.append({'type': 'arrow_v', 'content': None})
            pos += 3
            continue

        # Skip unknown characters
        pos += 1

    return elements


def calculate_text_width(text: str, font_size: int = 22) -> int:
    """Estimate text width in pixels based on character count.

    Uses a conservative estimate to prevent text clipping. Wide characters
    like 'W', 'M', and uppercase letters need extra space.
    """
    # Use 0.85 multiplier to account for:
    # - Wide uppercase letters (W, M, S, etc.)
    # - Hyphens and special characters
    # - Variable-width font rendering
    # - Font weight 600 (bold) which is significantly wider than normal weight
    # - Avenir font's wide character proportions
    # Previous values (0.55, 0.65, 0.72) were all too small
    avg_char_width = font_size * 0.85
    return int(len(text) * avg_char_width)


def generate_flow_svg(flow_lines: list, caption: str = None) -> str:
    """
    Generate an SVG flow diagram from parsed flow diagram syntax.

    Args:
        flow_lines: List of lines, each containing flow elements
        caption: Optional caption for the diagram

    Returns:
        HTML string containing the SVG diagram in a container div
    """
    # Parse all lines
    all_elements = []
    for line in flow_lines:
        elements = parse_flow_line(line)
        if elements:
            all_elements.append(elements)

    if not all_elements:
        return ''

    # Collect all nodes and determine layout
    all_nodes = []
    for row_elements in all_elements:
        row_nodes = [e for e in row_elements if e['type'] == 'node']
        all_nodes.extend(row_nodes)

    # Auto-assign colors to nodes without explicit colors
    color_idx = 0
    for node in all_nodes:
        if node['content']['color'] is None:
            node['content']['color'] = DEFAULT_COLOR_SEQUENCE[color_idx % len(DEFAULT_COLOR_SEQUENCE)]
            color_idx += 1

    # Calculate dimensions
    # Node dimensions
    min_node_width = 120
    node_height = 70
    node_padding = 40  # Extra padding for text (increased from 35 to prevent clipping)
    node_spacing = 70  # Space between nodes (including arrow)
    arrow_width = 50   # Width of arrow

    # Calculate node widths based on text
    for node in all_nodes:
        text_width = calculate_text_width(node['content']['label'])
        node['width'] = max(min_node_width, text_width + node_padding * 2)

    # For horizontal rows, calculate total width
    max_row_width = 0
    row_widths = []
    for row_elements in all_elements:
        row_nodes = [e for e in row_elements if e['type'] == 'node']
        num_arrows = len([e for e in row_elements if e['type'] in ('arrow_h', 'arrow_v')])

        # Sum up node widths and arrows
        row_width = sum(n['width'] for n in row_nodes)
        row_width += num_arrows * (arrow_width + 20)  # Arrow + spacing
        row_widths.append(row_width)
        max_row_width = max(max_row_width, row_width)

    # SVG dimensions - use tight bounding box with border
    # Border prevents stroke cutoff and text clipping at edges
    svg_border = 25  # Increased from 15 to prevent edge clipping
    row_height = node_height + 20  # Reduced row spacing for multi-row diagrams

    # Calculate tight content bounds
    content_width = max_row_width
    content_height = len(all_elements) * row_height - 20  # Remove trailing spacing

    # Final SVG dimensions with tight border
    svg_width = content_width + svg_border * 2
    svg_height = content_height + svg_border * 2

    # Start building SVG
    # Note: We omit explicit width/height attributes and inline styles to allow CSS to control sizing
    # The viewBox provides the aspect ratio, and CSS in cdl-theme.css constrains max-width to 1200px
    # This ensures HTML and PDF render at the same size (PDF renders at 1280px Marp base)
    svg_parts = []
    svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_width} {svg_height}">')

    # Add arrow symbol definition
    svg_parts.append('''  <defs>
    <symbol id="flow-arrow" viewBox="0 0 76.41 27.12">
      <path d="M43.3,1.69c-.92-.1-1.78.32-2.08,1.1-.3.79.06,1.69.83,2.23l1.19.46s0,0,0,0c0,0,0,0,0,0l15.39,5.94H2.98c-1.1,0-2,.9-2,2s.9,2,2,2h55.64l-15.4,5.94s0,0,0,0c0,0,0,0,0,0l-1.17.45c-.77.54-1.14,1.45-.83,2.24.3.78,1.16,1.2,2.09,1.1l1.15-.42s0,0,.01,0c0,0,0,0,0,0l24.98-9.1c2.07-.75,2.06-3.67,0-4.42L44.45,2.11" fill="currentColor"/>
    </symbol>
  </defs>''')

    # Render each row
    y_offset = svg_border + node_height // 2
    global_node_idx = 0

    for row_idx, row_elements in enumerate(all_elements):
        # Center the row horizontally within the viewBox
        # Note: svg_width already includes padding, so just center the row
        row_width = row_widths[row_idx]
        x_offset = (svg_width - row_width) // 2

        for elem in row_elements:
            if elem['type'] == 'node':
                node_data = elem['content']
                color_name = node_data['color']
                colors = FLOW_COLORS[color_name]
                width = elem['width'] if 'width' in elem else min_node_width

                # Draw rounded rectangle
                rect_x = x_offset
                rect_y = y_offset - node_height // 2
                svg_parts.append(f'  <rect x="{rect_x}" y="{rect_y}" width="{width}" height="{node_height}" rx="12" ry="12"')
                svg_parts.append(f'        fill="{colors["fill"]}" stroke="{colors["stroke"]}" stroke-width="3"/>')

                # Draw text
                text_x = rect_x + width // 2
                text_y = y_offset + 7  # Vertically centered with slight adjustment
                svg_parts.append(f'  <text x="{text_x}" y="{text_y}" font-family="\'Avenir LT Std\', Avenir, \'Avenir Next\', sans-serif" font-size="22"')
                svg_parts.append(f'        font-weight="600" fill="{colors["text"]}" text-anchor="middle">{escape(node_data["label"])}</text>')

                x_offset += width + 10  # Move past this node

            elif elem['type'] == 'arrow_h':
                # Horizontal arrow
                arrow_x = x_offset
                arrow_y = y_offset - 14  # Center arrow vertically
                svg_parts.append(f'  <use href="#flow-arrow" x="{arrow_x}" y="{arrow_y}" width="{arrow_width}" height="28" style="color: #0a2518"/>')
                x_offset += arrow_width + 10

            elif elem['type'] == 'arrow_v':
                # Vertical arrow (rotated) - will be rendered between rows
                # For now, just move position
                x_offset += 20

        y_offset += row_height

    svg_parts.append('</svg>')

    # Wrap in diagram container
    svg_content = '\n'.join(svg_parts)
    result = f'<div class="diagram-container">\n{svg_content}\n</div>'

    if caption:
        result += f'\n<div class="diagram-caption">{escape(caption)}</div>'

    return result


def process_flow_blocks(content: str) -> tuple:
    """
    Process ```flow code blocks and convert them to SVG diagrams.

    Args:
        content: The full markdown content

    Returns:
        Tuple of (processed_content, number_of_diagrams_processed)
    """
    # Pattern to match flow code blocks
    # Supports optional caption after the closing ```
    flow_pattern = r'```flow\n(.*?)```(?:\s*\n\s*<!--\s*caption:\s*(.*?)\s*-->)?'

    diagrams_processed = 0

    def replace_flow_block(match):
        nonlocal diagrams_processed
        flow_content = match.group(1)
        caption = match.group(2) if match.lastindex >= 2 else None

        # Split into lines and filter empty ones
        lines = [line for line in flow_content.strip().split('\n') if line.strip()]

        if not lines:
            return ''

        diagrams_processed += 1
        return generate_flow_svg(lines, caption)

    processed = re.sub(flow_pattern, replace_flow_block, content, flags=re.DOTALL)
    return processed, diagrams_processed


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


def process_arrow_syntax(line: str) -> str:
    """
    Process arrow shorthand syntax in a line of markdown.

    Supported syntax:
      --[80]->      Arrow with specific width in pixels
      --[lg]->      Arrow with named size variant (sm, md, lg, xl)
      --[100,lg]->  Arrow with width and additional class

    Note: Plain --> is NOT converted (conflicts with markdown/code syntax).
    Use --[]-> for default arrow or --[md]-> for medium.

    Returns:
        The line with arrow syntax replaced by HTML span elements
    """
    # Pattern for arrows with size specification in brackets
    # Only matches --[spec]-> to avoid conflicts with plain --> in markdown/code
    arrow_pattern = r'--\[([^\]]*)\]->'

    def replace_arrow(match):
        spec = match.group(1)  # The content inside brackets, or None

        classes = ['svg-arrow']
        style = ''

        if spec:
            # Parse the specification
            parts = [p.strip() for p in spec.split(',')]
            for part in parts:
                if part.isdigit():
                    # Numeric width in pixels
                    width = int(part)
                    style = f'--arrow-width: {width}px;'
                elif part in ('sm', 'md', 'lg', 'xl'):
                    # Named size variant
                    classes.append(f'svg-arrow-{part}')
                elif part in ('40', '60', '80', '100', '120', '150', '200'):
                    # Preset width class
                    classes.append(f'svg-arrow-{part}')
                elif part in ('up', 'down', 'left'):
                    # Direction variant
                    classes.append(f'svg-arrow-{part}')
                elif part in ('gray', 'light'):
                    # Color variant
                    classes.append(f'svg-arrow-{part}')
                else:
                    # Try to parse as width with units or custom class
                    if 'px' in part or 'em' in part or 'rem' in part:
                        style = f'--arrow-width: {part};'
                    else:
                        # Treat as custom class
                        classes.append(part)

        class_str = ' '.join(classes)
        style_attr = f' style="{style}"' if style else ''
        return f'<span class="{class_str}"{style_attr}></span>'

    return re.sub(arrow_pattern, replace_arrow, line)


# =============================================================================
# SLIDE CONTENT ANALYSIS FOR COMPILE-TIME SCALING
# =============================================================================

# Content type patterns
CALLOUT_BOX_PATTERN = re.compile(r'<div\s+class="([^"]*(?:note|warning|tip|example|definition|important|callout)[^"]*)"')
FLEX_CONTAINER_PATTERN = re.compile(r'<div[^>]*style="[^"]*display:\s*flex[^"]*"')
TWO_COLUMN_PATTERN = re.compile(r'<div[^>]*style="[^"]*display:\s*flex[^"]*".*?</div>\s*</div>', re.DOTALL)
CODE_BLOCK_PATTERN = re.compile(r'```(?:\w+)?\n(.*?)```', re.DOTALL)
TABLE_PATTERN = re.compile(r'^\|.*\|$', re.MULTILINE)
SCALE_CLASS_PATTERN = re.compile(r'<!--\s*_class:\s*([^>]*scale-\d+[^>]*)\s*-->')
EMOJI_FIGURE_PATTERN = re.compile(r'<div\s+class="emoji-figure"')
FLOW_DIAGRAM_PATTERN = re.compile(r'```flow\n.*?```', re.DOTALL)

# Content height weights (approximate units where 1 unit ≈ 30px)
CONTENT_WEIGHTS = {
    'h1': 3.0,
    'h2': 2.5,
    'h3': 2.0,
    'paragraph_per_50_chars': 0.8,
    'list_item': 1.2,
    'callout_box_base': 4.0,  # base height for callout box
    'callout_content_per_50_chars': 0.6,
    'code_block_line': 0.8,
    'table_header': 1.8,
    'table_row': 1.5,
    'flex_container_overhead': 1.5,
    'emoji_figure': 5.0,
    'flow_diagram': 4.0,
    'table_in_callout_penalty': 2.0,  # Extra space needed for table inside callout
}

# Slide height budget before scaling is needed (in content units)
# A typical slide can fit ~20 units: H1 (3) + callout (4) + 3 list items (3.6) + text (4) + buffer
SLIDE_HEIGHT_BUDGET = 20.0


def analyze_slide_content(slide_content: str) -> dict:
    """
    Analyze slide content and return metrics for scaling decisions.

    Args:
        slide_content: Raw markdown content of a single slide

    Returns:
        dict with content metrics
    """
    metrics = {
        'has_scale_class': False,
        'existing_scale_class': None,
        'callout_count': 0,
        'callout_types': [],
        'has_two_column': False,
        'has_code_block': False,
        'code_block_lines': 0,
        'has_table': False,
        'table_rows': 0,
        'table_in_callout': False,
        'has_emoji_figure': False,
        'emoji_columns': 0,
        'has_flow_diagram': False,
        'list_items': 0,
        'text_length': 0,
        'estimated_height': 0.0,
        'overflow_warnings': [],
    }

    # Check for existing scale class
    scale_match = SCALE_CLASS_PATTERN.search(slide_content)
    if scale_match:
        metrics['has_scale_class'] = True
        metrics['existing_scale_class'] = scale_match.group(1)

    # Count callout boxes
    callout_matches = CALLOUT_BOX_PATTERN.findall(slide_content)
    metrics['callout_count'] = len(callout_matches)
    metrics['callout_types'] = callout_matches

    # Check for two-column layout
    if FLEX_CONTAINER_PATTERN.search(slide_content):
        metrics['has_two_column'] = True

    # Check for code blocks
    code_matches = CODE_BLOCK_PATTERN.findall(slide_content)
    if code_matches:
        metrics['has_code_block'] = True
        metrics['code_block_lines'] = sum(len(code.split('\n')) for code in code_matches)

    # Check for tables
    table_lines = TABLE_PATTERN.findall(slide_content)
    if table_lines:
        metrics['has_table'] = True
        # Subtract 1 for header separator row
        metrics['table_rows'] = max(0, len(table_lines) - 2)

    # Check for table inside callout box (high overflow risk)
    # Look for pattern: callout div containing table
    if metrics['has_table'] and metrics['callout_count'] > 0:
        # Simple heuristic: if table appears after callout opening
        callout_start = slide_content.find('class="')
        if callout_start > -1:
            for box_type in ['note-box', 'warning-box', 'tip-box', 'example-box', 'definition-box']:
                box_pos = slide_content.find(box_type)
                if box_pos > -1:
                    # Find the closing </div> for this box
                    box_section = slide_content[box_pos:box_pos+2000]
                    if '|' in box_section and '---' in box_section:
                        metrics['table_in_callout'] = True
                        metrics['overflow_warnings'].append(
                            f"TABLE INSIDE CALLOUT BOX detected - high overflow risk"
                        )
                        break

    # Check for emoji figures
    if EMOJI_FIGURE_PATTERN.search(slide_content):
        metrics['has_emoji_figure'] = True
        # Count emoji columns
        emoji_col_count = slide_content.count('emoji-col')
        metrics['emoji_columns'] = emoji_col_count

    # Check for flow diagrams
    if FLOW_DIAGRAM_PATTERN.search(slide_content):
        metrics['has_flow_diagram'] = True

    # Count list items
    list_items = re.findall(r'^[\s]*[-*+]\s', slide_content, re.MULTILINE)
    numbered_items = re.findall(r'^[\s]*\d+\.\s', slide_content, re.MULTILINE)
    metrics['list_items'] = len(list_items) + len(numbered_items)

    # Calculate text length (excluding HTML tags and code blocks)
    text_only = re.sub(r'<[^>]+>', '', slide_content)
    text_only = re.sub(r'```.*?```', '', text_only, flags=re.DOTALL)
    metrics['text_length'] = len(text_only)

    # Estimate content height
    height = 0.0

    # Title
    if re.search(r'^#\s+', slide_content, re.MULTILINE):
        height += CONTENT_WEIGHTS['h1']

    # Callout boxes
    height += metrics['callout_count'] * CONTENT_WEIGHTS['callout_box_base']

    # Code blocks
    height += metrics['code_block_lines'] * CONTENT_WEIGHTS['code_block_line']

    # Tables
    if metrics['has_table']:
        height += CONTENT_WEIGHTS['table_header']
        height += metrics['table_rows'] * CONTENT_WEIGHTS['table_row']

    # Table in callout penalty
    if metrics['table_in_callout']:
        height += CONTENT_WEIGHTS['table_in_callout_penalty']

    # List items
    height += metrics['list_items'] * CONTENT_WEIGHTS['list_item']

    # Text content
    height += (metrics['text_length'] / 50) * CONTENT_WEIGHTS['paragraph_per_50_chars']

    # Two-column overhead
    if metrics['has_two_column']:
        height += CONTENT_WEIGHTS['flex_container_overhead']

    # Emoji figures
    if metrics['has_emoji_figure']:
        height += CONTENT_WEIGHTS['emoji_figure']

    # Flow diagrams
    if metrics['has_flow_diagram']:
        height += CONTENT_WEIGHTS['flow_diagram']

    metrics['estimated_height'] = height

    # Generate overflow warnings
    if height > SLIDE_HEIGHT_BUDGET * 1.5:
        metrics['overflow_warnings'].append(
            f"Estimated height ({height:.1f}) exceeds budget ({SLIDE_HEIGHT_BUDGET}) by >50%"
        )
    elif height > SLIDE_HEIGHT_BUDGET:
        metrics['overflow_warnings'].append(
            f"Estimated height ({height:.1f}) exceeds budget ({SLIDE_HEIGHT_BUDGET})"
        )

    if metrics['callout_count'] >= 3:
        metrics['overflow_warnings'].append(
            f"Multiple callout boxes ({metrics['callout_count']}) may cause overflow"
        )

    if metrics['has_two_column'] and metrics['callout_count'] >= 2:
        metrics['overflow_warnings'].append(
            "Two-column layout with multiple callouts - consider scale-78"
        )

    if metrics['emoji_columns'] >= 4:
        metrics['overflow_warnings'].append(
            f"Emoji figure with {metrics['emoji_columns']} columns may overflow horizontally"
        )

    return metrics


def determine_scale_class(metrics: dict):
    """
    Based on content metrics, determine the appropriate scale class.

    Args:
        metrics: dict from analyze_slide_content()

    Returns:
        Scale class string (e.g., 'scale-78') or None if no scaling needed
    """
    # If already has a scale class, don't override
    if metrics['has_scale_class']:
        return None

    height = metrics['estimated_height']

    # Table in callout is a special case - always needs scaling
    if metrics['table_in_callout']:
        return 'scale-78'

    # Two-column with multiple callouts
    if metrics['has_two_column'] and metrics['callout_count'] >= 2:
        if height > SLIDE_HEIGHT_BUDGET * 0.9:
            return 'scale-78'

    # Multiple callouts (3+)
    if metrics['callout_count'] >= 3:
        return 'scale-80'

    # Height-based scaling
    if height > SLIDE_HEIGHT_BUDGET * 1.4:
        return 'scale-70'
    elif height > SLIDE_HEIGHT_BUDGET * 1.2:
        return 'scale-78'
    elif height > SLIDE_HEIGHT_BUDGET * 1.1:
        return 'scale-80'
    elif height > SLIDE_HEIGHT_BUDGET:
        return 'scale-90'

    return None


def inject_scale_class(slide_content: str, scale_class: str) -> str:
    """
    Inject a scale class directive at the beginning of a slide.

    Args:
        slide_content: Raw slide content (after ---)
        scale_class: Scale class to inject (e.g., 'scale-78')

    Returns:
        Modified slide content with scale class directive
    """
    # Check if there's already a _class directive
    if SCALE_CLASS_PATTERN.search(slide_content):
        return slide_content

    # Check for existing _class directive without scale
    existing_class = re.search(r'<!--\s*_class:\s*([^>]*)\s*-->', slide_content)
    if existing_class:
        # Add scale class to existing directive
        old_directive = existing_class.group(0)
        old_classes = existing_class.group(1)
        new_directive = f'<!-- _class: {old_classes} {scale_class} -->'
        return slide_content.replace(old_directive, new_directive)

    # Insert new directive at the start of the slide (after any leading whitespace)
    lines = slide_content.split('\n')
    insert_idx = 0
    for i, line in enumerate(lines):
        if line.strip():
            insert_idx = i
            break

    lines.insert(insert_idx, f'<!-- _class: {scale_class} -->')
    return '\n'.join(lines)


def analyze_and_warn_slides(content, filename="unknown"):
    """
    Analyze all slides in content and generate warnings.
    Optionally inject scale classes for slides that need them.

    Args:
        content: Full markdown content
        filename: Name of file being processed (for warnings)

    Returns:
        tuple of (modified_content, list_of_warnings)
    """
    warnings = []

    # Split into slides (by ---)
    parts = re.split(r'\n---\n', content)

    if len(parts) < 2:
        return content, warnings

    # First part is frontmatter + title slide
    modified_parts = [parts[0]]

    for i, slide in enumerate(parts[1:], start=2):
        metrics = analyze_slide_content(slide)

        # Generate warnings
        for warning in metrics['overflow_warnings']:
            warnings.append(f"Slide {i}: {warning}")

        # Determine if scaling is needed
        scale_class = determine_scale_class(metrics)

        if scale_class:
            # Log the auto-scaling decision
            warnings.append(
                f"Slide {i}: Auto-injecting {scale_class} (estimated height: {metrics['estimated_height']:.1f})"
            )
            slide = inject_scale_class(slide, scale_class)

        modified_parts.append(slide)

    # Rejoin with slide separators
    modified_content = '\n---\n'.join(modified_parts)

    return modified_content, warnings


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

    # Analyze slides for overflow warnings and auto-inject scale classes
    content, overflow_warnings = analyze_and_warn_slides(content, input_file)

    # Print overflow warnings to stderr
    if overflow_warnings:
        print(f"\n=== Slide Analysis Warnings for {input_file} ===", file=sys.stderr)
        for warning in overflow_warnings:
            print(f"  {warning}", file=sys.stderr)
        print("", file=sys.stderr)

    # Process flow diagram blocks first (before line-by-line processing)
    content, flow_diagrams_processed = process_flow_blocks(content)

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
        "arrows_processed": 0,
        "flow_diagrams_processed": flow_diagrams_processed,
        "overflow_warnings": len([w for w in overflow_warnings if "overflow" in w.lower() or "exceeds" in w.lower()]),
        "scale_classes_injected": len([w for w in overflow_warnings if "Auto-injecting" in w]),
    }

    # Count arrows in input for statistics
    arrow_pattern = r'--\[([^\]]*)\]->'
    for line in lines:
        stats["arrows_processed"] += len(re.findall(arrow_pattern, line))

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

                # Now add the current non-table line (with arrow processing)
                result_lines.append(process_arrow_syntax(line))
            else:
                # Regular line (not in code block, not table)
                result_lines.append(process_arrow_syntax(line))

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
        if stats['arrows_processed'] > 0:
            print(f"Arrows processed: {stats['arrows_processed']}")
        if stats['flow_diagrams_processed'] > 0:
            print(f"Flow diagrams generated: {stats['flow_diagrams_processed']}")
        if stats.get('scale_classes_injected', 0) > 0:
            print(f"Scale classes auto-injected: {stats['scale_classes_injected']}")
        if stats.get('overflow_warnings', 0) > 0:
            print(f"Overflow warnings: {stats['overflow_warnings']}")

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
