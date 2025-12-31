# Table Splitting Implementation Notes

## Date: 2025-12-29

## Summary
Implemented support for auto-splitting long tables across multiple slides in the Marp presentation compile pipeline.

## Files Modified

### 1. `/Users/jmanning/llm-course/slides/template_deck/process_markdown.py`
- Added `parse_markdown_table()` function to parse markdown tables into header, separator, and data rows
- Added `generate_table_html()` function to generate HTML tables with proper alignment
- Added `split_table()` function to split long tables and generate multiple slides
- Updated `process_markdown()` function signature to accept `max_table_rows` parameter (default: 8)
- Added table detection logic in the main processing loop
- Added statistics tracking for tables found and tables split
- Updated argparse to include `--max-table-rows` / `-r` argument

### 2. `/Users/jmanning/llm-course/slides/template_deck/compile.sh`
- Added `-r, --rows` option for max table rows per slide (default: 8)
- Added `MAX_TABLE_ROWS` configuration variable
- Updated Python command to pass `--max-table-rows` argument
- Updated help text and examples

### 3. `/Users/jmanning/llm-course/slides/template_deck/themes/cdl-theme.css`
- Added `.table-continued-indicator` and `.table-continued-indicator-last` CSS classes
- Added positioning rules for table continued indicators
- Added `.table-continuation` class for continuation tables

### 4. `/Users/jmanning/llm-course/slides/template_deck/theme_showcase.md`
- Added new "Long table (auto-split demo)" slide with 17 data rows to test table splitting

## Implementation Details

### Table Detection
- Tables are detected by lines that start and end with `|`
- Lines are buffered until a non-table line is encountered

### Splitting Logic
- Tables with more than `max_table_rows` data rows are split
- Header row is replicated on each slide
- Alignment from markdown separator row is preserved
- Column widths are consistent via inline styles

### Continued Indicators
- First slide: `<div class="table-continued-indicator">continued...</div>`
- Middle slides: `<div class="table-continued-indicator">...continued...</div>`
- Last slide: `<div class="table-continued-indicator-last">...continued</div>`

## Testing
- Compiled `theme_showcase.md` successfully
- 17-row table was split into 3 slides (8 + 8 + 2 rows)
- Header row correctly replicated on all slides
- Continued indicators correctly positioned

## Usage Examples
```bash
# Compile with default 8 rows per table
./compile.sh theme_showcase.md

# Compile with 6 rows per table
./compile.sh theme_showcase.md -r 6

# Compile with 10 rows per table
./compile.sh theme_showcase.md --rows 10
```
