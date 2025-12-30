# Arrow SVG Implementation Notes

## Date: 2025-12-30

## Summary

Added support for scalable SVG arrows in the compile pipeline. The implementation allows arrows with variable widths where the stem stretches while the arrowhead remains fixed size.

## Files Modified

1. **`/Users/jmanning/llm-course/slides/template_deck/themes/cdl-theme.css`**
   - Added CSS classes for `.svg-arrow` and variants
   - Uses CSS custom properties for width control
   - Supports size variants: sm, md, lg, xl
   - Supports width presets: 40, 60, 80, 100, 120, 150, 200
   - Supports direction: up, down, left (default is right)
   - Supports color variants: gray, light

2. **`/Users/jmanning/llm-course/slides/template_deck/process_markdown.py`**
   - Added `process_arrow_syntax()` function
   - Converts `--[spec]->` syntax to HTML spans
   - Tracks arrow statistics

3. **`/Users/jmanning/llm-course/slides/template_deck/images/arrow-stem.svg`**
   - Simple horizontal rectangle that stretches
   - Uses preserveAspectRatio="none"

4. **`/Users/jmanning/llm-course/slides/template_deck/images/arrow-head.svg`**
   - Triangle arrowhead, fixed size
   - Uses Dartmouth green (#00693e)

5. **`/Users/jmanning/llm-course/slides/template_deck/images/arrow-clean.svg`**
   - Clean version of original arrow.svg without Adobe metadata

## Markdown Syntax

Use the following syntax in markdown files:

```markdown
# Default arrow (80px)
--[]->

# Size variants
--[sm]->   # Small (50px)
--[md]->   # Medium (80px)
--[lg]->   # Large (100px)
--[xl]->   # Extra large (150px)

# Specific widths
--[40]->   # 40px arrow
--[100]->  # 100px arrow
--[200]->  # 200px arrow

# Direction variants
--[md,down]->  # Points down
--[md,up]->    # Points up
--[md,left]->  # Points left

# Color variants
--[md,gray]->  # Grayscale arrow
--[md,light]-> # Lighter green

# Combined
--[lg,down,gray]->  # Large, down-pointing, gray arrow
```

## CSS Custom Properties

The arrows use CSS custom properties for customization:

```css
.svg-arrow {
    --arrow-width: 80px;        /* Total arrow width */
    --arrow-head-width: 20px;   /* Fixed arrowhead width */
    --arrow-height: 27px;       /* Arrow height */
    --arrow-stem-height: 8px;   /* Stem thickness */
}
```

## Usage in HTML

Can also use directly in HTML:

```html
<span class="svg-arrow"></span>
<span class="svg-arrow svg-arrow-lg"></span>
<span class="svg-arrow" style="--arrow-width: 150px;"></span>
```

## Testing

The implementation was tested with:
- Various size variants (sm, md, lg, xl)
- Width-specific arrows (40px to 200px)
- Flow diagram layout with emoji icons
- Inline text usage

All tests confirmed that:
- Stem stretches proportionally
- Arrowhead remains fixed size
- Dartmouth green color is correct
- Alignment works in flex containers

## Notes

- Plain `-->` is NOT converted to avoid conflicts with markdown/code syntax
- Use `--[]->` for default arrow or `--[md]->` for medium
- The CSS uses background images pointing to relative paths from the theme
