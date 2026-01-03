# TEMPLATE_DECK KNOWLEDGE BASE

## OVERVIEW

Build engine for Marp slides. Python preprocessor + JS autoscaling + Dartmouth theme.

## STRUCTURE

```
template_deck/
├── compile.sh              # Master build script (entry point)
├── process_markdown.py     # Content splitter, flow diagram renderer
├── autoscale.js           # Runtime font scaling (injected into HTML)
├── chart-defaults.js      # Chart.js configuration defaults
├── beamer_to_marp.py      # LaTeX→Markdown converter
├── themes/
│   └── cdl-theme.css      # Dartmouth brand CSS (green/navy/orange)
├── images/                # Theme backgrounds, logos
└── notes/                 # Development notes
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Compile a lecture | `./compile.sh <lecture.md>` |
| Fix content overflow | `autoscale.js` — check `measureSlideContent()` |
| Change slide splitting | `process_markdown.py` — look for `split_content()` |
| Update brand colors | `themes/cdl-theme.css` — CSS custom properties |
| Convert LaTeX slide | `python beamer_to_marp.py input.tex` |

## COMPILATION PIPELINE

```
1. process_markdown.py  →  Splits long code/tables, renders ```flow blocks
2. marp-cli            →  Markdown to HTML/PDF
3. Python injection    →  Inserts autoscale.js into <head>
4. Cleanup             →  Removes temp files
```

## CONVENTIONS

**Scaling philosophy**: Start at max font, scale DOWN on overflow. Never scale up.

**CSS variable**: `--content-scale` set by JS, consumed by CSS for responsive text.

**Flow diagrams**: Use ` ```flow ` code blocks for auto-generated SVG flowcharts.

**Line preservation**: `process_markdown.py` maintains line numbers across split slides.

## ANTI-PATTERNS

| Pattern | Problem |
|---------|---------|
| Scaling `.diagram-container` | Fixed elements break layout |
| Measuring without reset | Cumulative scaling errors |
| Skipping `autoscale.js` injection | Overflow in compiled slides |
| Editing generated HTML | Overwritten on recompile |

## KEY FILES

- **autoscale.js** (46KB): Complex. Measures DOM, calculates scale factors, handles multi-column layouts.
- **process_markdown.py** (51KB): AST-like markdown parsing. Handles edge cases for tables, code, images.
- **cdl-theme.css**: Dartmouth brand. Don't change primary colors without approval.
