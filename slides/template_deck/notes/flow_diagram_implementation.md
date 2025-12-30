# Flow Diagram Auto-Generation Implementation

**Date**: 2025-12-30
**Status**: Completed
**Branch**: feature/issue-22-theme-refinement

## Summary

Implemented automatic flow diagram generation from simple markdown syntax in Marp presentations. Users can now write intuitive syntax and have it rendered as themed SVG diagrams.

## Syntax

### Basic Flow Diagram
```markdown
```flow
[Input] --> [Process] --> [Output]
```
```

This generates a horizontal flowchart with automatically colored nodes (green, teal, blue, orange, gray cycle).

### Custom Colors
```markdown
```flow
[Training Data:green] --> [Model:teal] --> [Fine-tuning:blue] --> [Deployment:orange]
```
```

Supported colors: `green`, `teal`, `blue`, `orange`, `gray`

### Captions (Optional)
```markdown
```flow
[A] --> [B] --> [C]
```
<!-- caption: Description of the diagram -->
```

## Implementation Details

### Files Modified

1. **`process_markdown.py`** - Added flow diagram processing:
   - `parse_flow_node()` - Parse node text and optional color
   - `parse_flow_line()` - Tokenize flow syntax into nodes and arrows
   - `calculate_text_width()` - Estimate text width for node sizing
   - `generate_flow_svg()` - Generate inline SVG from parsed elements
   - `process_flow_blocks()` - Find and replace ```flow blocks with SVG

2. **`theme_showcase.md`** - Updated slide 30:
   - Replaced manual SVG diagram with `[Input] --> [Process] --> [Output]`
   - Added second slide demonstrating custom colors

3. **`themes/cdl-theme.css`** - Already had diagram styling:
   - `.diagram-container` - Centers and constrains diagrams
   - `.diagram-caption` - Styled italic caption below diagrams

### Color Palette (CDL Theme)

```python
FLOW_COLORS = {
    'green': {'fill': 'rgba(0, 105, 62, 0.15)', 'stroke': '#00693e', 'text': '#00693e'},
    'teal': {'fill': 'rgba(20, 184, 166, 0.15)', 'stroke': '#14b8a6', 'text': '#0d7377'},
    'blue': {'fill': 'rgba(59, 130, 246, 0.15)', 'stroke': '#3b82f6', 'text': '#2563eb'},
    'orange': {'fill': 'rgba(249, 115, 22, 0.15)', 'stroke': '#f97316', 'text': '#c2410c'},
    'gray': {'fill': 'rgba(156, 163, 175, 0.15)', 'stroke': '#9ca3af', 'text': '#4b5563'},
}
```

## Features

1. **Simple syntax** - `[Label] --> [Label]` for horizontal flow
2. **Auto-coloring** - Nodes automatically cycle through theme colors
3. **Custom colors** - Override with `[Label:color]` syntax
4. **Dynamic sizing** - Node width adjusts based on text length
5. **Theme matching** - Uses CDL theme fonts and color palette
6. **Inline SVG** - No external files or services needed
7. **Caption support** - Optional captions via HTML comments

## Usage in Marp Workflow

1. Write flow diagrams using the `flow` fenced code block
2. Run `process_markdown.py` to convert to SVG
3. Compile with Marp CLI

## Testing

```bash
python3 process_markdown.py theme_showcase.md output.md
# Output: Flow diagrams generated: 2
```

## Future Enhancements

- Vertical flow support (`==>` arrow)
- Multi-row diagrams
- Decision diamonds
- Bidirectional arrows
- Node shapes (rectangle, diamond, circle)

## Related Files

- `/Users/jmanning/llm-course/slides/template_deck/process_markdown.py`
- `/Users/jmanning/llm-course/slides/template_deck/theme_showcase.md`
- `/Users/jmanning/llm-course/slides/template_deck/themes/cdl-theme.css`
- `/Users/jmanning/llm-course/slides/template_deck/images/flowchart_local.svg` (original manual SVG)
