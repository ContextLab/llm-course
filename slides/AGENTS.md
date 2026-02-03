# SLIDES KNOWLEDGE BASE

## OVERVIEW

Marp-based lecture slides for 10-week NLP course. Custom Python preprocessor + JS autoscaling. Some legacy LaTeX.

## STRUCTURE

```
slides/
├── index.html              # Course schedule with links to all lectures
├── week1-10/               # One directory per week
│   ├── lectureN.md         # Marp source
│   ├── lectureN.html       # Compiled output
│   ├── lectureN.pdf        # PDF export
│   ├── figures/            # Week-specific images
│   └── themes/ → symlink   # Points to template_deck/themes/
├── template_deck/          # Build engine (see template_deck/AGENTS.md)
├── beamerthemeDartmouth.sty  # Legacy LaTeX theme
└── compile_all_slides.sh   # Batch compile all LaTeX slides
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Compile one lecture | Run `../template_deck/compile.sh lecture.md` from week dir |
| Edit theme CSS | `template_deck/themes/cdl-theme.css` |
| Fix autoscaling | `template_deck/autoscale.js` |
| Add slide content | Edit `lectureN.md`, recompile |
| Legacy LaTeX | `beamerthemeDartmouth.sty`, `compile_all_slides.sh` |

## CONVENTIONS

**Marp frontmatter**: Each `.md` starts with `marp: true`, theme, paginate settings.

**Theme symlinks**: `week1/themes/` → `../../template_deck/themes/`. Don't break symlinks.

**Output location**: HTML/PDF generated in same directory as source .md.

**Content splitting**: Long code/tables auto-split by `process_markdown.py` with "continued..." markers. Use `<!-- split: N -->` or `<!-- split: N, M -->` to override per-slide. Splits inside callout boxes automatically re-wrap in the same box type on each continuation slide.

## ANTI-PATTERNS

- **Don't edit HTML directly** — regenerated on compile, changes lost.
- **Don't skip F5** — browser caches aggressively. Hard-refresh required.
- **Don't remove themes symlink** — breaks compilation for that week.
- **Don't modify diagram-container elements** — fixed size, breaks if scaled.

## NOTES

- CI builds slides via `.github/workflows/build-slides.yml`
- Hybrid repo: Marp is primary, LaTeX for legacy/complex slides
- Fonts (Fira Code, Avenir) required for PDF export
