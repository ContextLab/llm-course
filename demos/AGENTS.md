# DEMOS KNOWLEDGE BASE

## OVERVIEW

15 browser-based NLP/LLM interactive demos. Vanilla JS + Transformers.js. No build step required.

## STRUCTURE

```
demos/
├── index.html              # Hub page with all 15 demo cards
├── shared/
│   ├── css/demo-styles.css # Theme system, components, responsive
│   └── js/visualization-utils.js  # ThemeManager, Canvas, Animation, Matrix utils
├── eliza/               # Pattern-matching chatbot (1966)
├── chatbot-evolution/   # Timeline: ELIZA→PARRY→ALICE→GPT (imports from 01)
├── tokenization/        # BPE, WordPiece comparison
├── embeddings/          # 3D Word2Vec explorer (Plotly)
├── attention/           # Self-attention visualization
├── transformer/         # 3D architecture walkthrough (Three.js)
├── gpt-playground/      # Text generation lab
├── rag/                 # Retrieval-augmented generation
├── topic-modeling/      # LDA topic discovery
├── sentiment/           # Classification dashboard
├── pos-tagging/         # Syntax/dependency parser (D3)
├── analogies/           # Vector arithmetic (king-man+woman)
├── semantic-search/     # BM25 + embeddings hybrid
├── bert-mlm/            # Masked language modeling
├── embeddings-comparison/  # Model benchmarking lab
└── data/gutenberg/         # Shared text corpora
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Change all demo styling | `shared/css/demo-styles.css` |
| Add animation/canvas util | `shared/js/visualization-utils.js` |
| New demo | Create `XX-name/`, add to `index.html`, follow README template |
| Cross-demo import | Use relative path: `../../eliza/js/eliza-engine.js` |
| Test demo | `npm run test:demoXX` from repo root |

## CONVENTIONS

**4-step demo creation**: 1) mkdir `XX-name/` 2) Create `index.html` with shared CSS/JS 3) Add card to `demos/index.html` 4) Add `README.md`.

**Theme usage**: Call `ThemeManager.init()` on page load. Use CSS variables (`--color-primary`, `--spacing-md`).

**ES Modules**: Use `type="module"` in script tags. Import from CDN for Transformers.js.

**Local updateThemeIcon()**: Each demo implements this to sync icon with ThemeManager.

## ANTI-PATTERNS

- **Don't duplicate visualization-utils.js logic** — import from shared.
- **Don't hardcode colors** — use CSS variables for theme support.
- **Don't load large models eagerly** — lazy-load on user action.

## EXTERNAL DEPS (CDN)

- `@xenova/transformers` — BERT, GPT inference in-browser
- `Plotly.js` — 3D plots (embeddings, analogies)
- `Three.js` — 3D architecture (transformer demo)
- `D3.js` — Dependency trees, complex layouts
- `Anime.js` — Smooth transitions
- `Compromise` — POS tagging (devDep for tests)
