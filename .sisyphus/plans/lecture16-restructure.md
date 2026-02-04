# Restructure Lecture 16: Training Transformer Models

## TL;DR

> **Quick Summary**: Restructure `slides/week5/lecture16.md` with 5 targeted changes: expand training data construction (new slides on concatenation+chunking), clarify perplexity in practice, consolidate 9 optimizer/scaling slides into 2 overview slides, add foundation→instruct→fine-tuning model taxonomy, and remove 3 end-of-lecture slides.
>
> **Deliverables**:
> - `slides/week5/lecture16.md` — Restructured lecture (~500-700 lines)
> - `slides/week5/lecture16.html` — Compiled HTML
> - `slides/week5/lecture16.pdf` — Compiled PDF
> - `notes/l16-screenshots/` — Playwright screenshot evidence of every compiled slide
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO — single file, sequential edits
> **Critical Path**: Task 1 (write full new file) → Task 2 (compile) → Task 3 (screenshot verification)

---

## Context

### Original Request
User wants to restructure lecture 16 (Training Transformer Models) with 5 specific changes to improve pedagogical flow, add missing content about training data construction, modernize the pre-training/fine-tuning section to cover instruct-tuned models, and reduce redundancy in the optimization/scaling coverage.

### Interview Summary
**Key Discussions**:
- Training data construction: Use the HuggingFace-standard concatenation+chunking approach, NOT sliding windows. Explain causal mask's role. (Verified via HuggingFace `run_clm.py` `group_texts()` function.)
- Perplexity: Expand beyond definition to cover practical usage, typical values, limitations.
- Optimizer/scaling consolidation: 9 slides → 2 slides. Keep intuitions, drop detailed math (AdamW equations, gradient clipping formulas, scaling law exponents). Add "Further reading" note-boxes.
- Foundation → instruct model taxonomy: Replace 2-slide "pre-training vs fine-tuning" with 2-3 slides covering the modern 3-stage pipeline (pre-training → instruction tuning/RLHF → task-specific fine-tuning).
- Remove 3 end slides: pitfalls, scaling discussion, ethics discussion — no time.

**Research Findings**:
- HuggingFace `group_texts()`: concatenates all tokenized text, splits into `block_size` chunks, copies `input_ids` to `labels`. Model internally shifts labels during forward pass (`logits[:-1]` vs `labels[1:]`).
- Causal mask: lower triangular matrix applied to attention scores. Position $i$ can only attend to positions $0..i$. This enables parallel training — all positions predict simultaneously.
- Typical block_size: 512 (old), 1024-2048 (GPT-2 era), 4096+ (modern LLMs).
- Gold standard style reference: `slides/week5/lecture17.md` (551 lines, box-first, no columns).
- Compilation: `../template_deck/compile.sh lecture16.md` from `slides/week5/`. Auto-splits code >20 lines, tables >8 rows. `<!-- split: N -->` overrides per-block. `<!-- _class: scale-XX -->` scales content.

### Self-Performed Gap Analysis
**Potential gaps identified and addressed**:
1. Learning objectives slide must be updated to reflect new content (training data construction, model taxonomy) — addressed in slide plan.
2. References slide must be updated: add Ouyang et al. (2022) for InstructGPT/RLHF, keep relevant existing refs, drop refs for removed content — addressed.
3. "Up next..." teaser in Questions slide must still say "Retrieval Augmented Generation" — verified, no change needed.
4. The "Where we left off" slide references lecture 15 ($\theta$ as given) — still valid, no change needed.
5. Code examples: current file has 3 large code blocks (LR scheduling 18 lines, HF training 28 lines, HF fine-tuning 27 lines). Plan reduces to 1 simplified HF training example and 1 simplified fine-tuning example.
6. Line count target: removing ~9 slides of content, adding ~5-6 slides → net reduction. Current 608 lines → target 500-700 should be achievable.
7. `<!-- _class: scale-XX -->` directives: use scale-85 or scale-90 for slides with code examples to help them fit.

---

## Work Objectives

### Core Objective
Rewrite `lecture16.md` to improve pedagogical flow by explaining how training data is actually constructed, clarifying perplexity as a practical metric, consolidating dense optimization content into accessible overviews, and modernizing the fine-tuning section to reflect the foundation→instruct→task pipeline.

### Concrete Deliverables
- `slides/week5/lecture16.md` — complete restructured lecture
- `slides/week5/lecture16.html` — compiled HTML output
- `slides/week5/lecture16.pdf` — compiled PDF output

### Definition of Done
- [ ] File is 500-700 lines
- [ ] All content is inside semantic boxes (definition-box, note-box, tip-box, example-box, warning-box, important-box)
- [ ] Sentence case for all slide titles
- [ ] No multi-column layouts
- [ ] No emojis in slide titles
- [ ] Compiles cleanly to HTML and PDF via `../template_deck/compile.sh lecture16.md`
- [ ] Contains exactly the slide structure specified in the plan below
- [ ] Learning objectives updated to match new content
- [ ] References updated (add InstructGPT, keep relevant, remove orphaned)
- [ ] Questions slide unchanged (emoji-figure + "Up next..." RAG teaser)

### Must Have
- Training data construction slides with concatenation+chunking explanation
- Causal mask explanation with visual/textual description
- Perplexity expanded with practical usage, typical values, limitations
- Consolidated optimizer/scaling overview (1-2 slides max)
- Foundation model → instruct model → fine-tuned model taxonomy
- Simplified code examples that fit on fewer slides

### Must NOT Have (Guardrails)
- NO sliding window explanation for training data (this is a common misconception; the production approach is concatenation+chunking)
- NO detailed AdamW math equations ($m_t$, $v_t$ formulas)
- NO gradient clipping formula
- NO scaling law power-law exponents ($N^{-0.076}$, etc.)
- NO Chinchilla equation ($\text{tokens} \approx 20 \times \text{parameters}$)
- NO "Common training pitfalls" slide
- NO "Discussion: scaling and efficiency" slide
- NO "Discussion: training data and ethics" slide
- NO multi-column `<div class="columns">` layouts
- NO `paginate`, `header`, `footer` in frontmatter
- NO `<!-- _class: lead -->` on any slide
- NO content outside semantic boxes (except title slide and Questions slide emoji-figure)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: N/A (slides, not code)
- **User wants tests**: Manual verification via compile + Playwright screenshots
- **Framework**: Playwright browser automation via `playwright` skill

### Automated Verification

**Compile verification** (using Bash):
```bash
cd slides/week5 && ../template_deck/compile.sh lecture16.md
# Assert: exit code 0
# Assert: lecture16.html exists and is >200K
```

```bash
cd slides/week5 && ../template_deck/compile.sh lecture16.md -f pdf
# Assert: exit code 0
# Assert: lecture16.pdf exists and is >1M
```

**Content verification** (using Bash grep):
```bash
# Verify line count in range
wc -l slides/week5/lecture16.md
# Assert: 500-700 lines

# Verify no multi-column layouts
grep -c 'class="columns"' slides/week5/lecture16.md
# Assert: 0

# Verify no paginate/header/footer in frontmatter
head -10 slides/week5/lecture16.md | grep -c 'paginate\|header\|footer'
# Assert: 0

# Verify no emojis in slide titles (H1 lines)
grep '^# ' slides/week5/lecture16.md | grep -cP '[\x{1F000}-\x{1FFFF}]'
# Assert: 0

# Verify removed slides are gone
grep -c 'Common training pitfalls' slides/week5/lecture16.md
# Assert: 0
grep -c 'Discussion: scaling and efficiency' slides/week5/lecture16.md
# Assert: 0
grep -c 'Discussion: training data and ethics' slides/week5/lecture16.md
# Assert: 0
```

**Visual verification** (using playwright skill):
```
1. Open: slides/week5/lecture16.html in browser
2. Screenshot each slide to notes/l16-screenshots/slide-NN.png
3. Verify: title slide has correct title
4. Verify: no obvious overflow (text cut off at bottom)
5. Verify: all slides render with CDL theme styling
```

---

## Execution Strategy

### Sequential Execution (Single File)

All tasks operate on the same file `slides/week5/lecture16.md`, so they MUST be sequential.

```
Task 1: Write the complete restructured lecture16.md
   ↓
Task 2: Compile to HTML + PDF, fix any compilation issues
   ↓
Task 3: Playwright screenshot verification of every slide
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | None |
| 2 | 1 | 3 | None |
| 3 | 2 | None | None |

---

## NEW SLIDE STRUCTURE (Exact Specification)

Below is the exact slide-by-slide structure for the rewritten file. Each slide specifies its title, boxes, and what content goes in each box.

### Slide 1: Title slide
**Status**: KEEP (unchanged)
```
# Lecture 16: Training transformer models
### PSYC 51.17: Models of language and communication
Jeremy R. Manning | Dartmouth College | Winter 2026
```

---

### Slide 2: Learning objectives
**Status**: MODIFY (update objectives to match new content)
- **note-box** ("By the end of this lecture, you will be able to..."): Update to ~5 objectives:
  1. Explain what it means to "train" a transformer model
  2. Describe how training data is constructed from raw text
  3. Understand cross-entropy loss and perplexity as training metrics
  4. Describe the training loop and key optimization techniques
  5. Distinguish between foundation models, instruct-tuned models, and fine-tuned models

---

### Slide 3: Where we left off
**Status**: KEEP (unchanged)
- **note-box** ("Recap from lecture 15"): Last time transformer as function, $\theta$ as given
- **tip-box** ("Today's question"): Where do parameters come from?

---

### Slide 4: What does "training" mean?
**Status**: KEEP (unchanged)
- **definition-box** ("Training a language model"): $\theta^* = \arg\min_\theta \mathcal{L}(\theta)$
- **tip-box** ("Intuition"): Student learning to finish sentences analogy

---

### Slide 5: The language modeling objective
**Status**: KEEP (unchanged)
- **definition-box** ("Next-token prediction"): $P(x_t | x_1, ..., x_{t-1}; \theta)$
- **note-box** ("This is self-supervised learning"): No labels needed, next word is the label

---

### Slide 6: From raw text to training data
**Status**: NEW — Change (1)
- **definition-box** ("How training data is constructed"):
  - Explain the 3-step production pipeline:
    1. **Tokenize** every document in the corpus independently
    2. **Concatenate** all token sequences into one long stream (optionally separated by `<EOS>` tokens)
    3. **Chunk** the stream into fixed-length blocks of `block_size` tokens (e.g., 1024 or 2048)
  - Each chunk becomes one training example
  - Leftover tokens shorter than `block_size` are dropped
- **note-box** ("Why not pad individual documents?"):
  - Padding wastes compute — every `[PAD]` token is a wasted FLOP
  - Concatenation ensures every token in every batch is a real training signal
  - This is the standard approach used by HuggingFace, GPT-2/3, LLaMA, etc.

---

### Slide 7: The causal attention mask
**Status**: NEW — Change (1)
- **definition-box** ("How one chunk trains the whole model"):
  - Within each chunk, the **causal attention mask** (a lower-triangular matrix) ensures position $t$ can only attend to positions $1, 2, ..., t$
  - This means every position simultaneously predicts its next token — one forward pass through a chunk of length $L$ produces $L$ training signals
  - Labels = input shifted right by 1 position (the model handles this internally)
- **tip-box** ("Intuition"):
  - Think of it like a classroom where every student takes the same test at the same time, but each student can only see the questions before theirs. Student 1 sees nothing and guesses the first word. Student 2 sees word 1 and predicts word 2. Student $L$ sees all previous words and predicts the last.

---

### Slide 8: Cross-entropy loss
**Status**: KEEP (unchanged from current slide 6)
- **definition-box** ("The loss function"): Cross-entropy formula, simplification to $-\log(\hat{y}_c)$

---

### Slide 9: Understanding cross-entropy
**Status**: KEEP (unchanged from current slide 7, use `<!-- _class: scale-80 -->`)
- **tip-box** ("Why negative log probability?"): Loss values for prob 1.0, 0.5, 0.01
- **example-box** ("Concrete example"): Code block with vocabulary example

---

### Slide 10: Perplexity
**Status**: MODIFY — Change (2) — expand significantly
- **definition-box** ("Perplexity: a more intuitive metric"):
  - Formula: $\text{PPL} = e^{\mathcal{L}}$
  - Interpretation: perplexity of $k$ means model is as confused as choosing among $k$ equally likely options
- **note-box** ("Perplexity in practice"):
  - **Model comparison**: Lower PPL = better model. Used to compare GPT-2 Small (PPL ≈ 27) vs GPT-2 XL (PPL ≈ 17) vs GPT-3 (PPL ≈ 11)
  - **Training monitoring**: Plot PPL over training steps; it should decrease. Spikes indicate instability.
  - **Evaluation**: Standard metric on held-out test sets (e.g., WikiText-103)
- **warning-box** ("Limitations of perplexity"):
  - Only measures token-level prediction accuracy — doesn't capture fluency, coherence, or factual correctness
  - A model with low PPL can still hallucinate, generate toxic content, or produce grammatically perfect nonsense
  - Can't compare models with different vocabularies (different PPL scales)
  - Domain-dependent: a model's PPL on medical text vs. tweets will differ wildly

Use `<!-- _class: scale-85 -->` for this slide.

---

### Slide 11: The training loop
**Status**: KEEP (minor trim from current slide 9)
- **definition-box** ("Four steps, repeated millions of times"):
  - Forward pass, compute loss, backward pass, update parameters
  - $\theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}$
- **warning-box** ("Scale matters"): GPT-3 cost ~$4.6M, GPT-4 ~$100M+

Use `<!-- _class: scale-95 -->` as in original.

---

### Slide 12: Optimization and regularization
**Status**: NEW (consolidation of current slides 10-13) — Change (3)
- **definition-box** ("Key techniques for training transformers"):
  - **Stochastic gradient descent (SGD)**: Use random mini-batches instead of entire dataset. Faster, noisier, but works well in practice.
  - **AdamW optimizer**: Gives each parameter its own adaptive learning rate based on gradient history. Adds momentum (smooths updates) and weight decay (prevents overfitting). The standard choice for transformers.
  - **Learning rate scheduling**: Start with a warmup phase (gradually increase LR), then decay with cosine or linear schedule. Prevents instability early in training.
  - **Gradient clipping**: Cap gradient magnitude to prevent "exploding gradients" from destroying training progress. Typical max norm = 1.0.
- **note-box** ("Further reading"):
  - [Loshchilov & Hutter (2019)](https://arxiv.org/abs/1711.05101) — AdamW optimizer
  - [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) — Warmup scheduling in the original transformer

---

### Slide 13: Scaling laws
**Status**: NEW (consolidation of current slides 15-18) — Change (3)
- **definition-box** ("Bigger models + more data = better performance"):
  - Language model performance follows predictable **power laws**: smooth, straight lines on log-log plots when you increase model size, dataset size, or compute budget
  - **Kaplan et al. (2020)**: Discovered these relationships across 7 orders of magnitude
  - **Hoffmann et al. (2022, Chinchilla)**: Showed optimal training balances model size and data — a smaller model trained on more data can match a larger undertrained model
  - Key takeaway: you can predict model performance before training by running small-scale experiments first
- **note-box** ("Further reading"):
  - [Kaplan et al. (2020)](https://arxiv.org/abs/2001.08361) — Scaling Laws for Neural Language Models
  - [Hoffmann et al. (2022)](https://arxiv.org/abs/2203.15556) — Training Compute-Optimal Large Language Models (Chinchilla)

---

### Slide 14: Training with HuggingFace
**Status**: MODIFY (simplify current slide 14's code) — Use `<!-- _class: scale-85 -->`
- **example-box** ("Pre-training a language model"):
  - Simplified Python code block (~18-20 lines max):
    ```python
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from transformers import Trainer, TrainingArguments
    from datasets import load_dataset

    model = AutoModelForCausalLM.from_pretrained("gpt2")
    tokenizer = AutoTokenizer.from_pretrained("gpt2")

    dataset = load_dataset("wikitext", "wikitext-2-raw-v1")
    def tokenize(examples):
        return tokenizer(examples["text"], truncation=True, max_length=512)
    tokenized = dataset.map(tokenize, batched=True)

    args = TrainingArguments(
        output_dir="./results", num_train_epochs=3,
        per_device_train_batch_size=8, learning_rate=5e-5,
        warmup_steps=500, weight_decay=0.01,
    )
    trainer = Trainer(model=model, args=args, train_dataset=tokenized["train"])
    trainer.train()
    ```
  - Use `<!-- split: 22 -->` to prevent auto-splitting (try to keep on one slide with scale-85)

---

### Slide 15: From pre-training to deployment
**Status**: NEW — Change (4)
- **definition-box** ("Three stages of model development"):
  1. **Pre-training** → **Foundation model**: Train on massive general text corpus (books, web, code). The model learns language patterns, world knowledge, and reasoning. Expensive ($millions), done once. Examples: GPT-3 base, LLaMA, Mistral.
  2. **Instruction tuning + RLHF** → **Instruct model**: Fine-tune the foundation model on instruction-following data and human preference feedback. The model learns to be helpful, harmless, and honest. This is what makes ChatGPT different from raw GPT-4. Examples: ChatGPT, Claude, Gemini.
  3. **Task-specific fine-tuning** → **Specialized model**: Further fine-tune on domain data for a specific application. Cheap, fast, and highly effective. Examples: medical diagnosis, legal analysis, code generation for a specific codebase.

Use `<!-- _class: scale-90 -->` for this slide.

---

### Slide 16: Why instruction tuning matters
**Status**: NEW — Change (4)
- **tip-box** ("Foundation models are powerful but unruly"):
  - A foundation model has vast knowledge but no "manners" — it will complete any text prompt, including harmful or nonsensical ones
  - Instruction tuning teaches the model to follow instructions, answer questions helpfully, and refuse harmful requests
  - **RLHF** (Reinforcement Learning from Human Feedback): Humans rank model outputs, and the model is trained to prefer higher-ranked responses
- **note-box** ("Further reading"):
  - [Ouyang et al. (2022)](https://arxiv.org/abs/2203.02155) — Training language models to follow instructions with human feedback (InstructGPT)
  - [Bai et al. (2022)](https://arxiv.org/abs/2204.05862) — Constitutional AI: Harmlessness from AI Feedback

---

### Slide 17: Task-specific fine-tuning
**Status**: MODIFY (rework current slides 19-20)
- **definition-box** ("Adapting a model to your task"):
  - Take a pre-trained (or instruct-tuned) model and train it further on task-specific data
  - Only needs small datasets (hundreds to thousands of examples)
  - Uses tiny learning rates (10-100x smaller than pre-training) to preserve existing knowledge
  - Training takes minutes to hours, not weeks
- **tip-box** ("Why does it work?"):
  - The pre-trained model already understands language, facts, and reasoning. Fine-tuning just teaches it the *format* and *focus* of your task — like an expert learning a new specialty.

---

### Slide 18: Fine-tuning with HuggingFace
**Status**: MODIFY (simplify current slide 21's code) — Use `<!-- _class: scale-85 -->`
- **example-box** ("Fine-tuning for sentiment classification"):
  - Simplified Python code block (~18-20 lines max):
    ```python
    from transformers import AutoModelForSequenceClassification
    from transformers import Trainer, TrainingArguments
    from datasets import load_dataset

    model = AutoModelForSequenceClassification.from_pretrained(
        "bert-base-uncased", num_labels=2
    )
    dataset = load_dataset("imdb")

    args = TrainingArguments(
        output_dir="./sentiment-model", num_train_epochs=3,
        per_device_train_batch_size=16, learning_rate=2e-5,
        warmup_ratio=0.1, weight_decay=0.01,
        evaluation_strategy="epoch",
    )
    trainer = Trainer(
        model=model, args=args,
        train_dataset=dataset["train"], eval_dataset=dataset["test"],
    )
    trainer.train()  # ~93% accuracy in ~30 minutes on one GPU!
    ```
  - Use `<!-- split: 24 -->` to prevent auto-splitting (try to keep on one slide with scale-85)

---

### Slide 19: Practical training advice
**Status**: KEEP (current slide 22, minor trim)
- **tip-box** ("Rules of thumb"):
  1. Start small: test pipeline with a small model first
  2. Learning rate: fine-tuning uses 10-100x smaller LR (1e-5 to 5e-5)
  3. Epochs: fine-tuning needs 2-5 epochs; pre-training uses 1 epoch on large data
  4. Batch size: larger = more stable but more memory; use gradient accumulation if GPU is small
  5. Always monitor a validation set for overfitting

---

### Slide 20: References
**Status**: MODIFY (update to match new content)
- **note-box** ("Further reading"):
  - [Vaswani et al. (2017, *NeurIPS*)](https://arxiv.org/abs/1706.03762) — "Attention Is All You Need" — The original transformer paper.
  - [Kaplan et al. (2020, *arXiv*)](https://arxiv.org/abs/2001.08361) — "Scaling Laws for Neural Language Models"
  - [Hoffmann et al. (2022, *arXiv*)](https://arxiv.org/abs/2203.15556) — "Training Compute-Optimal Large Language Models" (Chinchilla)
  - [Ouyang et al. (2022, *NeurIPS*)](https://arxiv.org/abs/2203.02155) — "Training language models to follow instructions with human feedback" (InstructGPT/RLHF)
  - [HuggingFace NLP Course, Chapter 3](https://huggingface.co/learn/nlp-course/chapter3) — Hands-on fine-tuning tutorial
  - (Remove: Loshchilov & Hutter AdamW — moved to "Further reading" in slide 12)

---

### Slide 21: Questions?
**Status**: KEEP (unchanged)
- **emoji-figure**: Email, Discord, Office hours
- **tip-box** ("Up next..."): Retrieval Augmented Generation (RAG)

---

### SLIDES REMOVED:
- ~~Gradient descent intuition~~ (current slide 10) → absorbed into slide 12
- ~~Optimization: AdamW~~ (current slide 11) → absorbed into slide 12
- ~~Learning rate scheduling~~ (current slide 12) → absorbed into slide 12
- ~~Gradient clipping~~ (current slide 13) → absorbed into slide 12
- ~~Scaling laws~~ (current slide 15) → absorbed into slide 13
- ~~Visualizing scaling laws~~ (current slide 16) → absorbed into slide 13
- ~~Chinchilla scaling~~ (current slide 17) → absorbed into slide 13
- ~~What scaling laws tell us~~ (current slide 18) → absorbed into slide 13
- ~~Common training pitfalls~~ (current slide 23) → DELETED
- ~~Discussion: scaling and efficiency~~ (current slide 24) → DELETED
- ~~Discussion: training data and ethics~~ (current slide 25) → DELETED

### SUMMARY: Source Slide Count
- **Kept unchanged**: 7 slides (title, where we left off, what does training mean, language modeling objective, cross-entropy loss, understanding cross-entropy, questions)
- **Modified**: 5 slides (learning objectives, perplexity, HF training code, HF fine-tuning code, practical advice, references)
- **New**: 5 slides (from raw text to training data, causal attention mask, optimization & regularization, scaling laws consolidated, from pre-training to deployment, why instruction tuning matters, task-specific fine-tuning)
- **Removed**: 11 slides
- **Total source slides**: 21 (down from 27, but more substantive content per slide)
- **Estimated compiled slides**: ~24-26 (code blocks may auto-split if they exceed thresholds)

---

## TODOs

- [ ] 1. Write the complete restructured `lecture16.md`

  **What to do**:
  - Replace the entire contents of `slides/week5/lecture16.md` with the new 21-slide structure specified above
  - Follow the exact slide order: Title → Learning objectives → Where we left off → What does training mean → Language modeling objective → From raw text to training data → The causal attention mask → Cross-entropy loss → Understanding cross-entropy → Perplexity → The training loop → Optimization and regularization → Scaling laws → Training with HuggingFace → From pre-training to deployment → Why instruction tuning matters → Task-specific fine-tuning → Fine-tuning with HuggingFace → Practical training advice → References → Questions
  - For each slide, use the exact box types, titles, and content summaries specified in the "NEW SLIDE STRUCTURE" section above
  - For code example slides (14, 18): use `<!-- _class: scale-85 -->` and `<!-- split: 22 -->` or `<!-- split: 24 -->` to keep code on one compiled slide
  - For dense text slides (10, 15): use `<!-- _class: scale-85 -->` or `<!-- _class: scale-90 -->`
  - Keep frontmatter identical to current: `marp: true`, `theme: cdl-theme`, `math: katex`, `transition: fade 0.25s`, `author: Contextual Dynamics Lab`
  - Maintain blank lines between `<div>` tags and content (required for Marp to parse markdown inside HTML)
  - Ensure every `---` separator has a blank line before and after
  - Use sentence case for all slide titles
  - All content inside semantic boxes — no raw paragraphs

  **Must NOT do**:
  - Do NOT include sliding window explanation for training data
  - Do NOT include AdamW equations ($m_t$, $v_t$ formulas)
  - Do NOT include gradient clipping formula
  - Do NOT include scaling law exponents
  - Do NOT include the 3 removed slides (pitfalls, scaling discussion, ethics discussion)
  - Do NOT use multi-column layouts
  - Do NOT add emojis to slide titles
  - Do NOT change the frontmatter structure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex content restructuring of a single markdown file requiring precise adherence to a detailed specification. Not UI work (no visual-engineering), not trivial (not quick), requires domain knowledge about LLM training concepts.
  - **Skills**: None required
    - No browser automation needed for writing
    - No git operations needed
    - No UI/UX design needed
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for file writing, only for verification (Task 3)
    - `git-master`: No commits in this task
    - `frontend-ui-ux`: Not a UI task

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 1 of 3)
  - **Blocks**: Task 2 (compile), Task 3 (verification)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `slides/week5/lecture17.md` — **GOLD STANDARD**. Follow this file's exact style for frontmatter, box usage, spacing, title formatting, emoji-figure pattern on Questions slide. The executor should read this file first to internalize the style.
  - `slides/week5/lecture16.md:1-7` — Current frontmatter to keep exactly
  - `slides/week5/lecture16.md:586-608` — Current Questions slide to keep exactly (emoji-figure + "Up next..." tip-box)

  **Content References** (source material for new slides):
  - `slides/week5/lecture16.md:32-48` — Current "Where we left off" slide (keep unchanged)
  - `slides/week5/lecture16.md:52-68` — Current "What does training mean?" slide (keep unchanged)
  - `slides/week5/lecture16.md:72-88` — Current "Language modeling objective" slide (keep unchanged)
  - `slides/week5/lecture16.md:92-106` — Current "Cross-entropy loss" slide (keep unchanged)
  - `slides/week5/lecture16.md:109-136` — Current "Understanding cross-entropy" slide (keep, with `scale-80`)
  - `slides/week5/lecture16.md:140-159` — Current "Perplexity" slide (base for expansion)
  - `slides/week5/lecture16.md:162-183` — Current "Training loop" slide (keep with minor trim)
  - `slides/week5/lecture16.md:186-209` — Current gradient descent + SGD content (absorb key points into consolidated slide)
  - `slides/week5/lecture16.md:212-234` — Current AdamW content (absorb intuition into consolidated slide, drop math)
  - `slides/week5/lecture16.md:237-274` — Current LR scheduling content (absorb concept into consolidated slide, drop code)
  - `slides/week5/lecture16.md:277-294` — Current gradient clipping (absorb concept into consolidated slide, drop formula)
  - `slides/week5/lecture16.md:297-333` — Current HF training code (simplify and keep)
  - `slides/week5/lecture16.md:336-355` — Current scaling laws (absorb into consolidated slide)
  - `slides/week5/lecture16.md:358-384` — Current visualizing scaling laws (absorb key insight into consolidated slide, drop table)
  - `slides/week5/lecture16.md:387-406` — Current Chinchilla (absorb key finding into consolidated slide)
  - `slides/week5/lecture16.md:409-430` — Current "what scaling laws tell us" (absorb takeaways into consolidated slide, drop cost table)
  - `slides/week5/lecture16.md:433-448` — Current pre-training vs fine-tuning (rework into 3-stage taxonomy)
  - `slides/week5/lecture16.md:451-470` — Current "why fine-tuning works" (rework into task-specific fine-tuning slide)
  - `slides/week5/lecture16.md:473-508` — Current fine-tuning with HF code (simplify and keep)
  - `slides/week5/lecture16.md:511-522` — Current practical advice (keep with minor trim)
  - `slides/week5/lecture16.md:569-582` — Current references (update)

  **Technical References** (verified facts for new content):
  - HuggingFace `group_texts()` function from `run_clm.py`: concatenate all tokenized text, split into `block_size` chunks, copy `input_ids` to `labels`
  - Causal mask: lower triangular matrix, position $t$ attends only to $1..t$, one forward pass = $L$ training signals
  - Label shifting: model internally does `logits[:-1]` vs `labels[1:]` in the forward pass (NOT the data collator)
  - Typical block_size: 512 (old), 1024-2048 (GPT-2), 4096+ (modern)
  - InstructGPT paper: Ouyang et al. (2022), arXiv 2203.02155
  - Constitutional AI: Bai et al. (2022), arXiv 2204.05862

  **Documentation References**:
  - `slides/template_deck/STYLE_GUIDE.md:255-283` — Per-slide split control (`<!-- split: N -->`) syntax and rules
  - `slides/template_deck/STYLE_GUIDE.md:345-420` — Callout box syntax for all 6 box types
  - `slides/template_deck/AGENTS.md` — Compilation pipeline: process_markdown.py → marp-cli → autoscale.js injection
  - `slides/AGENTS.md` — Slide conventions, anti-patterns

  **Acceptance Criteria**:

  ```bash
  # Verify file exists and is in range
  wc -l slides/week5/lecture16.md
  # Assert: output shows 500-700 lines

  # Verify frontmatter is correct
  head -7 slides/week5/lecture16.md
  # Assert: matches "marp: true\ntheme: cdl-theme\nmath: katex\ntransition: fade 0.25s\nauthor: Contextual Dynamics Lab"

  # Verify no forbidden content
  grep -c 'Common training pitfalls' slides/week5/lecture16.md
  # Assert: 0
  grep -c 'Discussion: scaling and efficiency' slides/week5/lecture16.md
  # Assert: 0
  grep -c 'Discussion: training data and ethics' slides/week5/lecture16.md
  # Assert: 0
  grep -c 'class="columns"' slides/week5/lecture16.md
  # Assert: 0

  # Verify new content exists
  grep -c 'From raw text to training data\|causal attention mask\|concatenat' slides/week5/lecture16.md
  # Assert: >= 2
  grep -c 'instruction tuning\|instruct.*model\|RLHF' slides/week5/lecture16.md
  # Assert: >= 2
  grep -c 'Ouyang et al' slides/week5/lecture16.md
  # Assert: >= 1

  # Verify slide count (~21 slides = ~20 separators)
  grep -c '^---$' slides/week5/lecture16.md
  # Assert: 20-22
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from all grep/wc verification commands

  **Commit**: NO (group with Task 2)

---

- [ ] 2. Compile lecture16.md to HTML and PDF

  **What to do**:
  - Run the Marp compilation pipeline from the `slides/week5/` directory
  - Compile to HTML first, verify success
  - Compile to PDF, verify success
  - If compilation fails, diagnose and fix issues in `lecture16.md` (common issues: unclosed HTML tags, missing blank lines around `<div>` tags, malformed KaTeX)
  - Verify output file sizes are reasonable (HTML >200K, PDF >1M based on other lectures)

  **Must NOT do**:
  - Do NOT modify `compile.sh`, `process_markdown.py`, or any template_deck files
  - Do NOT modify the theme CSS

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple compilation commands with potential minor fix iteration
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for compilation
    - `git-master`: No commits yet

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 2 of 3)
  - **Blocks**: Task 3 (verification)
  - **Blocked By**: Task 1

  **References**:
  - `slides/template_deck/compile.sh` — Compilation script entry point
  - `slides/template_deck/AGENTS.md` — Pipeline: process_markdown.py → marp-cli → autoscale.js injection
  - `notes/2026-02-03-lecture-rewrites-session.md:6-7` — Reference output sizes: L17 compiled to 263K-367K HTML, 1.1M-2.1M PDF

  **Acceptance Criteria**:

  ```bash
  cd slides/week5 && ../template_deck/compile.sh lecture16.md
  # Assert: exit code 0

  ls -la slides/week5/lecture16.html
  # Assert: file exists, size > 200000 bytes

  cd slides/week5 && ../template_deck/compile.sh lecture16.md -f pdf
  # Assert: exit code 0

  ls -la slides/week5/lecture16.pdf
  # Assert: file exists, size > 1000000 bytes
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from compile commands (exit codes)
  - [ ] File size listing for .html and .pdf

  **Commit**: YES
  - Message: `refactor(slides): restructure lecture 16 with training data construction, model taxonomy, and consolidated optimization`
  - Files: `slides/week5/lecture16.md`, `slides/week5/lecture16.html`, `slides/week5/lecture16.pdf`
  - Pre-commit: compilation succeeds (exit code 0)

---

- [ ] 3. Visual verification with Playwright screenshots

  **What to do**:
  - Open `slides/week5/lecture16.html` in a browser via Playwright
  - Navigate through every compiled slide and take a screenshot of each
  - Save screenshots to `notes/l16-screenshots/slide-NN.png`
  - Verify visually:
    - Title slide renders correctly with CDL theme
    - No text overflow (content cut off at slide boundaries)
    - All semantic boxes render with correct styling (colored borders, icons)
    - Code blocks have syntax highlighting
    - KaTeX equations render (not raw LaTeX source)
    - New slides (training data, causal mask, model taxonomy) have correct content
    - Questions slide has emoji-figure with Email/Discord/Office hours

  **Must NOT do**:
  - Do NOT modify any source files based on screenshots (just document issues)
  - Do NOT re-compile

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward screenshot automation task
  - **Skills**: [`playwright`]
    - `playwright`: Required for browser automation — opening HTML file, navigating slides, taking screenshots
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations
    - `frontend-ui-ux`: Not designing UI, just verifying rendering

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 3 of 3, final)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 2

  **References**:
  - `slides/week5/lecture16.html` — Compiled output to verify
  - `notes/l16-screenshots/` — Directory for screenshot output (create if not exists)
  - `notes/lec9-slide*.png`, `notes/lec10-slide*.png` — Examples of previous screenshot verification sessions

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: file:///Users/jmanning/llm-course/slides/week5/lecture16.html
  2. For each slide (use right arrow key or click to advance):
     a. Screenshot to: notes/l16-screenshots/slide-{NN}.png
     b. Verify: slide content is visible and not overflowing
  3. After all slides captured:
     a. Count screenshots — should match expected compiled slide count (24-28 slides)
     b. Verify title slide (slide 1) shows "Lecture 16: Training transformer models"
     c. Verify no slides show raw LaTeX ($$...$$ not rendered)
  ```

  ```bash
  # Verify screenshots were captured
  ls notes/l16-screenshots/slide-*.png | wc -l
  # Assert: 24-28 files (compiled slide count)
  ```

  **Evidence to Capture:**
  - [ ] All screenshot PNG files in `notes/l16-screenshots/`
  - [ ] Count of screenshots matching expected slide count

  **Commit**: NO (screenshots are verification evidence, not deliverables)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `refactor(slides): restructure lecture 16 with training data construction, model taxonomy, and consolidated optimization` | `slides/week5/lecture16.md`, `slides/week5/lecture16.html`, `slides/week5/lecture16.pdf` | Compilation succeeds (exit code 0) |

---

## Success Criteria

### Verification Commands
```bash
# Line count in range
wc -l slides/week5/lecture16.md  # Expected: 500-700

# Compilation
cd slides/week5 && ../template_deck/compile.sh lecture16.md  # Expected: exit 0
cd slides/week5 && ../template_deck/compile.sh lecture16.md -f pdf  # Expected: exit 0

# No forbidden content
grep -c 'Common training pitfalls' slides/week5/lecture16.md  # Expected: 0
grep -c 'Discussion: scaling' slides/week5/lecture16.md  # Expected: 0
grep -c 'Discussion: training data' slides/week5/lecture16.md  # Expected: 0

# Required new content present
grep -c 'concatenat' slides/week5/lecture16.md  # Expected: >= 1
grep -c 'causal.*mask\|causal attention' slides/week5/lecture16.md  # Expected: >= 1
grep -c 'instruct' slides/week5/lecture16.md  # Expected: >= 2
grep -c 'RLHF' slides/week5/lecture16.md  # Expected: >= 1
grep -c 'Ouyang' slides/week5/lecture16.md  # Expected: >= 1
```

### Final Checklist
- [ ] All "Must Have" content present (training data construction, causal mask, perplexity expansion, consolidated optimization, model taxonomy)
- [ ] All "Must NOT Have" content absent (11 removed slides, detailed math, sliding windows, multi-column)
- [ ] File compiles to HTML and PDF without errors
- [ ] All semantic boxes render correctly in screenshots
- [ ] No text overflow visible in any compiled slide
- [ ] Learning objectives match actual slide content
- [ ] References include Ouyang et al. (2022) for InstructGPT
- [ ] "Up next..." still says RAG
