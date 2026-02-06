# Beta Demo QA Session - February 6, 2026

## Comprehensive QA Testing Complete

### Issues Fixed This Session

| Issue | File(s) Changed | Fix Description |
|-------|-----------------|-----------------|
| **Transformer 3D Labels Overlap** | `demos/transformer/js/architecture-3d.js` | Labels now hidden by default, appear on hover. Improved label styling (smaller, rounded corners, text truncation). |
| **Topic Modeling Stopwords** | `demos/topic-modeling/js/lda.js` | Expanded STOPWORDS set from ~90 to ~180+ words. Added pronouns (his, her, she), numerals (one, two, three), common verbs, adverbs, and high-frequency vocabulary. |
| **Embeddings Comparison Score Display** | `demos/embeddings-comparison/js/visualization.js`, `js/comparison-app.js` | Leaderboard now uses `silhouetteScore` metric for categorization (matching result cards). All scores display as percentages when in 0-1 range. |
| **Beta Badges Removed** | `demos/index.html` | Removed beta badges from Transformer Architecture and RAG System Demo. |

### Previous Session Fixes (Already Completed)
- WIP banners removed from 7 demos
- Beta badges removed from 8 demos

### Final State - All Demos

| Demo | Status | Notes |
|------|--------|-------|
| 01 ELIZA | ✅ Ready | Fully functional |
| 02 Chatbot Evolution | ✅ Ready | ELIZA, PARRY, ALICE, GPT all working |
| 03 Tokenization | ✅ Ready | BPE, WordPiece comparison |
| 04 Word Embeddings | ✅ Ready | 3D Plotly visualization |
| 05 Attention | ✅ Ready | Uses simulated attention (noted in UI) |
| 06 Transformer | ✅ Ready | Labels hidden by default, show on hover |
| 07 GPT Playground | ✅ Ready | ONNX warnings (performance only) |
| 08 RAG | ✅ Ready | Excluded from review, beta badge removed |
| 09 Topic Modeling | ✅ Ready | Stopwords properly filtered |
| 10 Sentiment | ✅ Ready | |
| 11 POS Tagging | ✅ Ready | |
| 12 Analogies | ✅ Ready | |
| 13 Semantic Search | ✅ Ready | |
| 14 BERT MLM | ✅ Ready | |
| 15 Embeddings Comparison | ✅ Ready | Score display now consistent |

### Verification Results
- **Playwright Screenshots**: Transformer shows clean 3D blocks without label overlap
- **Playwright Screenshots**: Topic modeling word clouds show content words only (technology, research, healthcare, learning)
- **Test Suite**: 92/93 tests passing (1 pre-existing failure in tokenization)
- **Lecture Links**: All verified to exist in slides/week*/lecture*.html

### Known Pre-existing Issues (Not Fixed)
1. Tokenization test 2.10 failing (mixed case to lowercase conversion)
2. Radar chart label overlap in Embeddings Comparison (minor visual issue)
3. Attention demo uses simulated attention (documented in UI)

### Files Modified
```
demos/transformer/js/architecture-3d.js
demos/topic-modeling/js/lda.js
demos/embeddings-comparison/js/visualization.js
demos/embeddings-comparison/js/comparison-app.js
demos/index.html
```
