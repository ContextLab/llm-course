# Lecture 18 Overhaul Session Notes
**Date**: 2026-02-08
**Status**: ALL COMPLETE ✅

## Summary
Comprehensive overhaul of Lecture 18 (BERT deep dive) - animations, slides, and styling.

## Key Decisions
- **Running example**: Changed from "[CLS] the robot [MASK] pancakes [SEP]" (6 tokens) to **"robots [MASK] help us"** (4 tokens, no special tokens in animations). Ties to lecture 15's "robots" theme.
- **Slide reduction**: 37 → ~24 slides
- **Content deferred**: Benchmarks → L19, Fine-tuning tasks → L20
- **Content cut**: WordPiece (covered L6), Contextual-vs-static embeddings (covered L12)
- **GIF sizing**: Can use `![height:550]` or `![height:600]` for animation-only slides

## Files
- `/Users/jmanning/llm-course/slides/week6/lecture18.md` - Main slide markdown
- `/Users/jmanning/llm-course/slides/week6/animations/bert_scenes.py` - Manim animation source
- `/Users/jmanning/llm-course/slides/week6/animations/render_gifs.py` - GIF renderer
- `/Users/jmanning/llm-course/slides/week5/lecture15.md` - Reference lecture
- `/Users/jmanning/llm-course/slides/week5/animations/transformer_scenes.py` - Reference animations

## Animation Issues (6 scenes)
1. **BertVsGptAttention**: "vs." above not between, text too small, BERT matrix not fully filled, inconsistent colors
2. **BertInputRepresentation**: text too small, row labels appear before matrix, labels too small
3. **SegmentEmbeddings**: varying box heights, text too small, spread out, orange hard to read, "isNext?" unclear
4. **MaskedLanguageModeling**: needs audit for sizing/overlap
5. **BertPredictionHead**: bars not left-aligned, words not right-justified
6. **FineTuningTransfer**: overlapping text, awkward sequence

## Global Requirements
- Sentence case capitalization
- Darker colors for text/lines/figures
- Larger animations
- Follow lecture 15 style (sandwich pattern, intuitive titles, animations for math only)
- ~25 slides max

## Redundancy Analysis
- WordPiece tokenization: thoroughly covered in L6 (lecture6.md has 8+ references)
- Contextual vs static embeddings: thoroughly covered in L12 (lecture12.md covers polysemy, contextual embeddings)
- BERT benchmarks: L19 already covers variant benchmarks, can absorb original BERT results
- Fine-tuning tasks: L20 covers QA, NER, sentiment with code examples, can absorb task architecture info

## Slide Reduction Plan (37 → ~24)
### Cut entirely:
- Slide 7: "Why bidirectionality matters" (implicit in animation)
- Slide 8: "Why BERT was revolutionary" (fold into merged slide 3+4)
- Slide 11: Code walkthrough of input (redundant with animation)
- Slide 14: WordPiece tokenization (covered in L6)
- Slide 26: Fine-tuning tasks table (defer to L20)
- Slide 32: BERT benchmark results (defer to L19)

### Merge:
- Slides 3+4 → "Where we left off" + "What is BERT"
- Slides 15+16 → MLM definition + step-by-step
- Slides 23+24 → Pre-training + paradigm
- Slides 27-28 → 1 fine-tuning code slide
- Slides 29-30 → 1 contextual embeddings code slide
- Slides 33+34 → "What BERT learns" + probing

### Keep MLM loss (slide 18):
- Fold key formula into MLM definition slide as a note

## Execution Plan
### Wave 1 (parallel, no dependencies):
- Task 8: Update shared constants for new example
- Task 7: Edit lecture18.md (37→~24)

### Wave 1.5 (after Task 8, parallel):
- Tasks 1-6: Fix all 6 animation scenes

### Wave 2 (after all animations done):
- Task 9: Re-render GIFs

### Wave 3 (after GIFs + slides):
- Task 10: Recompile lecture18.md

### Wave 4 (after compile):
- Task 11: Visual QA with Playwright

## Completion Status (2026-02-08)

All 12 tasks completed:

| Task | Status | Notes |
|------|--------|-------|
| 1. Scene 1 (BertVsGptAttention) | ✅ | Centered "vs.", enlarged text, full outlines, BLUE=before RED=after |
| 2. Scene 2 (BertInputRepresentation) | ✅ | Scale 0.5→0.65, labels FadeIn with matrix, full token names |
| 3. Scene 3 (SegmentEmbeddings) | ✅ | Uniform box heights (0.45), ORANGE→GOLD_E, "NSP" label |
| 4. Scene 4 (MaskedLanguageModeling) | ✅ | Updated to 4-token example, select_idx=1 ("will") |
| 5. Scene 5 (BertPredictionHead) | ✅ | Right-justified words, left-aligned bars, scale 0.55→0.65 |
| 6. Scene 6 (FineTuningTransfer) | ✅ | L15 GoingDeeper style, 3 clean animation phases |
| 7. Slide markdown | ✅ | 37→24 slides, content cuts/merges, sentence case |
| 8. Shared data constants | ✅ | TOKENS=["robots","[MASK]","help","us"], T=4 |
| 9. GIF rendering | ✅ | 6/6 GIFs rendered (~15-18MB each) |
| 10. Slide compilation | ✅ | lecture18.html (362K) + lecture18.pdf (1.7M) |
| 11. Visual QA (Playwright) | ✅ | 12 key slides screenshotted, all passed |
| 12. Session notes | ✅ | This file |

### Visual QA Results
- 12 slides screenshotted (1, 4, 5, 7, 8, 10, 12, 14, 16, 19, 21, 24)
- No text overflow or cut-off detected
- All GIFs load and display correctly
- Sentence case verified throughout
- Auto-injected scale classes working (scale-78, scale-80)

### Final Output
- **Slides**: 24 markdown slides + 2 auto-split = ~26 rendered slides
- **GIFs**: 6 animation files in `slides/week6/animations/gifs/`
- **HTML**: `slides/week6/lecture18.html`
- **PDF**: `slides/week6/lecture18.pdf`

### Rendering Commands (for future re-renders)
```bash
# GIFs (use conda python for Manim)
cd slides/week6/animations
/Users/jmanning/opt/anaconda3/bin/python render_gifs.py

# Slides
cd slides/week6
../template_deck/compile.sh lecture18.md
```

## HTTP Server
Running at http://localhost:8766 serving from /Users/jmanning/llm-course/slides/
