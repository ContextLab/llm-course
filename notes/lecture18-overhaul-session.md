# Lecture 18 Overhaul Session Notes
**Date**: 2026-02-08 through 2026-02-09
**Status**: ALL COMPLETE ✅

---

## Session 1: Animation Overhaul (2026-02-08)

Fixed 6 Manim animations, reduced slides 37→24, updated running example to "robots [MASK] help us" (4 tokens). All 12 tasks completed.

---

## Session 2: Full Refactoring (2026-02-09)

**Major pivot**: Animations still had issues AND content was redundant with L12. Decision: remove all 6 animations, refocus on depth/intuition/code, add companion notebook.

### Audit Results
- **L12** covers: BERT definition, MLM 80/10/10, NSP, input representation, fine-tuning, "bank" polysemy
- **L15** covers: full transformer architecture, Q/K/V, causal masking
- **L19** covers: RoBERTa, ALBERT, DistilBERT, ELECTRA
- **L20** covers: applications, Google Search, NER, QA, brain connections

### Key Decisions
- Remove ALL 6 animations (redundant with L12)
- Add companion notebook: `xhour_bert_demo.ipynb`
- Notebook link appears ONCE (final slide only)
- New focus: Winograd schemas, attention specialization, bias, layer probing, brain parallels

### Files
- `slides/week6/lecture18.md` — 22 slides (depth/intuition/code)
- `slides/week6/lecture18.html` — Compiled (311K)
- `slides/week6/lecture18.pdf` — Compiled (1.5M)
- `slides/week6/xhour_bert_demo.ipynb` — Companion notebook (23 cells)
- `slides/README.md` — Updated with notebook link + readings

### Notebook Structure
| Section | Content |
|---------|---------|
| Part 1 | Fill-in-the-blank: pipeline("fill-mask"), world knowledge, gender bias |
| Part 2 | Attention: heatmaps, multi-head comparison |
| Part 3 | Layer embeddings: "cell" divergence, multi-word pairs |
| Part 4 | Sentence similarity: sentence-transformers, similarity matrix |

### Verification
- **Local Python**: 9/9 cells pass
- **Slides**: HTML+PDF compiled clean, 1 auto-scale (slide 15)
- **Visual QA**: 22 slides pass
- **Colab**: GitHub raw URL returns 200, all 4 parts confirmed
- **npm test**: 92/93 (1 pre-existing failure, unrelated)

### Git
- Commit `b3d619e`: pushed to `main`

### Commands
```bash
cd slides/week6 && ../template_deck/compile.sh lecture18.md
python3 -m http.server 8766 -d /Users/jmanning/llm-course/slides
```
