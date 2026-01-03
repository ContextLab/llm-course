# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-03
**Commit:** a599253
**Branch:** main

## OVERVIEW

LLM/NLP educational course repository: 15 browser-based interactive demos + Marp/LaTeX lecture slides + Jupyter assignments. Dartmouth PSYC 51.17 "Language Models from Scratch".

## STRUCTURE

```
llm-course/
├── demos/           # 15 interactive web demos (vanilla JS, Transformers.js)
│   ├── shared/      # CSS theme + visualization-utils.js
│   └── 01-15/       # ELIZA → Embeddings Comparison
├── slides/          # Marp markdown lectures
│   ├── week1-10/    # Each week symlinks to template_deck/themes/
│   └── template_deck/  # Build engine (compile.sh, autoscale.js)
├── tests/           # 1500+ tests, custom TestRunner (no framework)
├── assignments/     # Jupyter notebooks for students
├── notes/           # Internal debugging logs (not student-facing)
└── admin/           # Syllabus, fonts, compile scripts
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/edit demo | `demos/XX-name/` | Follow 4-step: dir → HTML → index entry → README |
| Edit demo visuals | `demos/shared/css/demo-styles.css` | CSS variables for dark/light |
| Demo utilities | `demos/shared/js/visualization-utils.js` | ThemeManager, CanvasUtils, MatrixUtils |
| Compile slides | `slides/template_deck/compile.sh` | Run from week dir: `../template_deck/compile.sh lecture.md` |
| Edit slide theme | `slides/template_deck/themes/cdl-theme.css` | Propagates via symlinks |
| Run tests | `npm test` or `npm run test:demoXX` | Custom TestRunner per file |
| CI workflows | `.github/workflows/` | test-demos, deploy-demos, build-slides |

## CONVENTIONS

**Indentation**: 2-space for JS/HTML/CSS.

**Demo structure**: Each demo has `index.html`, `js/`, optional `css/`, `README.md`. Import shared utils via relative paths.

**Slide compilation**: Markdown → `process_markdown.py` (splits long content) → Marp → `autoscale.js` injected into HTML.

**Testing**: Self-contained TestRunner class in each `.mjs` file. No Jest/Mocha. Tests mock DOM globals for browser code.

**Naming**:
- Demos: `XX-kebab-name/` (eliza, chatbot-evolution)
- Tests: `test-demoXX-description.mjs`
- Slides: `lectureN.md` per week directory

## ANTI-PATTERNS (THIS PROJECT)

| Pattern | Why Forbidden |
|---------|---------------|
| `git checkout/restore/reset` without backup | **CRITICAL**: Always `git stash` or commit first. Violating destroys work. |
| Refreshing slides without F5 | Browser caches. MUST hard-refresh after compile. |
| Modifying `.diagram-container` in autoscale | Fixed-size elements break if scaled. |
| Partial regex matches in chatbots | Use word boundaries (`\b`) to avoid "you" matching "young". |
| PARRY emotions outside [0,20] | Breaks historical fidelity to Colby 1972. |
| Bidirectional substitution without placeholders | "I"→"you" then "you"→"me" overwrites. Use temp placeholders. |

## UNIQUE STYLES

**Autoscaling philosophy**: Start at max font size, scale DOWN only when overflow detected. Never scale up.

**Cross-demo imports**: Demo 02 imports ElizaEngine from `../../eliza/js/eliza-engine.js`. Demos share `/demos/data/gutenberg/` corpus.

**Slide preprocessing**: `process_markdown.py` auto-splits tables/code >N lines, adds "continued..." markers, renders ```flow blocks as SVG.

## COMMANDS

```bash
# Development
npm install                     # Install dependencies (just 'compromise')
python -m http.server 8000      # Serve demos locally

# Testing
npm test                        # Run all 1500+ tests
npm run test:demoXX            # Run specific demo tests (01-15)
npm run test:demo15            # Runs ELIZA, PARRY, ALICE subtests

# Slides
cd slides/weekN
../template_deck/compile.sh lectureN.md   # Compile single lecture
cd slides && ./compile_all_slides.sh      # Compile all LaTeX slides

# Syllabus
cd admin && ./compile.sh       # Rebuild syllabus.pdf
```

## NOTES

- **Demo 07 (RAG)** has known memory issues in CI. Uses `NODE_OPTIONS="--max-old-space-size=4096"`.
- **No LSP** for JS/Python in this environment. Use explore agents for code navigation.
- **GitHub Pages** auto-deploys on push to main. Live at `contextlab.github.io/llm-course/demos/`.
- **Fonts**: Duplicated in `/admin/` and `/fonts/`. Both needed for different build targets.
- **notes/** is dev logs, not course notes. Don't expose to students.
