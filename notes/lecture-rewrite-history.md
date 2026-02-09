# Lecture rewrite history

Consolidated record of all lecture authoring and rewriting sessions (Feb 2026). All work described here has been committed and pushed.

## Lecture 18: BERT deep dive (Feb 8–9, 2026)

### Session 1: Animation overhaul
- Fixed 6 Manim animations, reduced slides 37→24.
- Updated running example to "robots [MASK] help us" (4 tokens).

### Session 2: Full refactoring
- Removed all 6 animations (redundant with L12).
- Added companion notebook: `bert_demo.ipynb` (4 parts: fill-in-the-blank, attention heatmaps, layer embeddings, sentence similarity).
- New focus: Winograd schemas, attention specialization, bias, layer probing, brain parallels.
- 22 slides. Compiled: 311K HTML, 1.5M PDF.
- Commit: `b3d619e`.

## Lectures 19–26: Redundancy overhaul (Feb 3–9, 2026)

### Approach
5-wave process: research → content rewriting → companion notebooks → compilation → README update.

### Per-lecture changes

| Lecture | Slides | Key removals | Key additions |
|---------|--------|-------------|---------------|
| L19 (BERT Variants) | 27 | "Recall: what BERT does" slide, masking recap | ModernBERT, Gemma Encoder (2025), production deployment (ONNX, TensorRT, INT8) |
| L20 (Applications) | 20 | "Recall and roadmap" slide, generic "Where BERT excels" | Domain applications (clinical, legal, financial, scientific), Sentence-BERT/E5/NV-Embed |
| L21 (GPT Architecture) | 22 | 4 slides: "From BERT to GPT", "Transformer decoder", "Causal attention", "GPT vs BERT" | BooksCorpus controversy, weight tying, LLaMA revolution, test-time compute |
| L22 (Scaling Up) | 17 | Verbose scaling laws recap | "Beyond Chinchilla: overtraining era", focused "Why ChatGPT mattered" |
| L23 (GPT from Scratch) | 31 | Theory recaps from code slides | Weight tying code, gradient accumulation, LR scheduling, mixed precision, nanoGPT comparison |
| L24 (Agents) | 23 | CoT re-definition, RAG re-explanation | Cross-references to L22 and L17 |
| L25 (MoE) | 21 | GPT parameter/cost table (3rd repetition) | Cross-reference to L22 |
| L26 (Ethics) | 21 | RLHF/DPO re-explanation | Representation engineering, weak-to-strong generalization, sycophancy bias |

### Factual corrections applied
1. L25: CO2 source → Patterson et al. 2021 (not Strubell 2019).
2. L25: Mixtral → 6x faster (not 5x), 12.9B active (not 13B).
3. L20: Caucheteux DOI → 10.1038/s42003-022-03036-1.
4. L26: EU AI Act fines → 7%/3% (not 6%).
5. L22: Kojima CoT → 17.7% → 78.7% on GSM8K.

### Companion notebooks created
- `bert_variants_demo.ipynb` (week6): Compare fill-mask, speed benchmarks, ELECTRA.
- `encoder_applications_demo.ipynb` (week6): Classification, NER, QA, bias measurement.
- `gpt_from_scratch_demo.ipynb` (week7): Build mini-GPT, train on Shakespeare.
- `agents_demo.ipynb` (week9): Simulated agent loop, ReAct, safety demos.
- `moe_efficiency_demo.ipynb` (week9): MoE layer, load balancing, quantization.

### Commits
- Initial rewrites: various intermediate commits (Feb 3–8).
- Final overhaul: `51b6d73` — 25 files changed, 1006 insertions, 653 deletions. Pushed to main, CI green.
