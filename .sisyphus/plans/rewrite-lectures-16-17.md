# Rewrite Lectures 16 and 17 to Match Lecture 15 Style

## TL;DR

> **Quick Summary**: Completely rewrite `lecture16.md` (Training Transformers) and `lecture17.md` (RAG) with new topic content, matching the lecture 15 / week 4 box-first style exactly. Both files exist and will be overwritten.
>
> **Deliverables**:
> - `slides/week5/lecture16.md` — Complete lecture on Training/Fitting Transformer Models (~35 slides)
> - `slides/week5/lecture17.md` — Complete lecture on Retrieval Augmented Generation (~35 slides)
> - Both compiled to HTML via `compile.sh`
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 & Task 2 (parallel) → Task 3 (compile both)

---

## Context

### Original Request
Rewrite lectures 16 and 17 for the LLM course to match the style of lecture 15 and week 4 lectures. User provided a detailed style guide, required content lists for both lectures, and constraints.

### Interview Summary
**Key Discussions**:
- User provided explicit style guide extracted from lecture 15 analysis
- User specified exact required content for each lecture (8 items for L16, 10 items for L17)
- Both lectures currently exist with WRONG style (paginate, header/footer, columns, lead class) and WRONG topics (L16 = transformer architecture/attention, L17 = training components/FlashAttention)

**Research Findings**:
- Lecture 15 style: box-first architecture, no columns, `<!-- _class: scale-XX -->` for density, emoji-figure Questions slide, tip-box "Up next..." teaser
- Week 4 style: same box-first pattern, decentralized references on concept slides plus final References slide, `# 💭 Discussion:` pattern for interactive slides
- Compile pipeline: Marp + `process_markdown.py` (auto-splits long code/tables >20 lines/8 rows) + `autoscale.js`
- README specifies: Kaplan et al. (2020) for L16, Lewis et al. (2020) for L17, HuggingFace Chapter 3 for L16, RAG demo link for L17
- L17 must include: Assignment 3 due (Feb 6) + Assignment 4 released (Customer Service Chatbot, due Feb 16)
- L15 ends with tip-box "Up next... Training transformers: where do the parameters ($\theta$) come from?" — L16 should pick up from this

### Metis Review
**Identified Gaps** (addressed):
- README requires specific readings (Kaplan 2020, Lewis 2020) → included in plan
- L17 must have admin notices (Assignment 3 due, Assignment 4 released) → explicit task item
- No `figures/` directory in week5 for new diagrams → plan avoids requiring custom images; use text/box descriptions instead
- Running example continuity (lecture 15 uses "the robots will bring") → plan notes to reference this where natural
- Long KaTeX in boxes may overflow → plan notes to use scale classes when needed

---

## Work Objectives

### Core Objective
Replace both lecture files with complete, compilable Marp markdown matching the lecture 15 box-first style, with correct topic content per the course syllabus.

### Concrete Deliverables
- `slides/week5/lecture16.md` — Training/Fitting Transformer Models lecture
- `slides/week5/lecture17.md` — Retrieval Augmented Generation lecture
- Both compiled successfully to `lecture16.html` and `lecture17.html`

### Definition of Done
- [ ] Both `.md` files have correct frontmatter (marp, theme, math, transition, author ONLY)
- [ ] Both compile without errors via `../template_deck/compile.sh`
- [ ] Both use content boxes exclusively (no raw text paragraphs outside boxes)
- [ ] No multi-column `<div class="columns">` layouts in either file
- [ ] All slide titles in sentence case
- [ ] Both end with emoji-figure Questions slide + tip-box teaser
- [ ] L16 covers all 8 required topics; L17 covers all 10 required topics
- [ ] Both have References slide with note-box

### Must Have
- Correct frontmatter (NO paginate, NO header, NO footer)
- NO `<!-- _class: lead -->` on title slides
- Content boxes for ALL content (definition-box, note-box, tip-box, example-box, warning-box)
- Single-column vertical stacking layout
- Sentence case slide titles
- KaTeX math for formulas
- Python code examples (inside example-box)
- References slide with note-box
- Questions slide with emoji-figure (Email, Discord, Office hours)
- L16: tip-box "Up next..." teasing RAG
- L17: Admin slide with Assignment 3 due date + Assignment 4 release
- L17: Link to RAG demo
- ~30-40 slides each

### Must NOT Have (Guardrails)
- `paginate: true` in frontmatter
- `header:` or `footer:` in frontmatter
- `<!-- _class: lead -->` on any slide
- `<div class="columns">` or `<div class="column">` anywhere
- Title Case slide titles (use Sentence case: "Training a language model" not "Training a Language Model")
- Raw text outside content boxes (every substantive paragraph should be in a box)
- Standalone code blocks without an enclosing example-box
- Custom images/figures that don't exist (no broken image links)
- More than 45 slides or fewer than 28 slides per lecture

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (compile.sh)
- **User wants tests**: Manual verification via compilation
- **Framework**: Marp CLI via compile.sh
- **QA approach**: Compile + structural grep checks

### Automated Verification

Each task includes executable verification that the agent can run directly:

**For slide compilation** (using Bash):
```bash
cd slides/week5 && ../template_deck/compile.sh lecture16.md
# Assert: Exit code 0
# Assert: lecture16.html exists and is non-empty

cd slides/week5 && ../template_deck/compile.sh lecture17.md
# Assert: Exit code 0
# Assert: lecture17.html exists and is non-empty
```

**For style compliance** (using Grep):
```bash
# Must NOT contain:
grep -c 'paginate:' slides/week5/lecture16.md  # Assert: 0
grep -c 'header:' slides/week5/lecture16.md    # Assert: 0
grep -c 'footer:' slides/week5/lecture16.md    # Assert: 0
grep -c '_class: lead' slides/week5/lecture16.md  # Assert: 0
grep -c 'class="columns"' slides/week5/lecture16.md  # Assert: 0
grep -c 'class="column"' slides/week5/lecture16.md   # Assert: 0
# (repeat for lecture17.md)

# Must contain:
grep -c 'definition-box' slides/week5/lecture16.md  # Assert: >0
grep -c 'note-box' slides/week5/lecture16.md        # Assert: >0
grep -c 'tip-box' slides/week5/lecture16.md         # Assert: >0
grep -c 'example-box' slides/week5/lecture16.md     # Assert: >0
grep -c 'emoji-figure' slides/week5/lecture16.md    # Assert: >0
# (repeat for lecture17.md)
```

**For slide count** (using Bash):
```bash
grep -c '^---$' slides/week5/lecture16.md  # Assert: between 28 and 45
grep -c '^---$' slides/week5/lecture17.md  # Assert: between 28 and 45
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — PARALLEL):
├── Task 1: Write lecture16.md (Training Transformers)
└── Task 2: Write lecture17.md (RAG)

Wave 2 (After Wave 1):
└── Task 3: Compile both lectures and verify style compliance
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | Two parallel writing agents with load_skills=[] |
| 2 | 3 | Single verification agent |

---

## TODOs

- [ ] 1. Write lecture16.md — Training/fitting transformer models

  **What to do**:
  Write a complete Marp lecture file (~35 slides) covering training/fitting transformer models. The file must match the lecture 15 style EXACTLY. Overwrite the existing `slides/week5/lecture16.md`.

  **Content structure** (suggested slide flow):
  1. Title slide: `# Lecture 16: Training transformer models`
  2. Learning objectives (note-box)
  3. Where we left off (note-box recapping lecture 15's transformer architecture, referencing "the robots will bring" example)
  4. The training problem (definition-box: what does "training" mean for a transformer?)
  5. Loss functions for language models — cross-entropy (definition-box with KaTeX: $\mathcal{L} = -\sum_{i} y_i \log(\hat{y}_i)$)
  6. Perplexity (definition-box: $\text{PPL} = e^{\mathcal{L}}$, intuition in tip-box)
  7. The training loop (definition-box: forward pass → loss → backward pass → update)
  8. Gradient descent intuition (tip-box with analogy)
  9. Optimization: AdamW (definition-box explaining adaptive learning rates + weight decay)
  10. Learning rate scheduling (definition-box: warmup then decay, example-box with Python code)
  11. Gradient clipping (warning-box: why gradients explode, definition-box for clipping)
  12. Python example: training loop with HuggingFace (example-box with ```python)
  13. Scaling laws introduction (definition-box: Kaplan et al. 2020 findings)
  14. Scaling laws: the power law (definition-box with KaTeX, tip-box for intuition)
  15. Chinchilla scaling (definition-box: Hoffmann et al. 2022 — compute-optimal training)
  16. What scaling laws tell us (tip-box: practical implications)
  17. Pre-training vs fine-tuning (definition-box distinguishing the two phases)
  18. Transfer learning concept (note-box: why pre-train then fine-tune?)
  19. Fine-tuning with HuggingFace Trainer (example-box with Python code)
  20. Practical training advice (tip-box: batch size, learning rate, epochs)
  21. Common training pitfalls (warning-box: overfitting, catastrophic forgetting, data quality)
  22. 💭 Discussion: scaling and efficiency
  23. 💭 Discussion: training data and ethics
  24. Demo notebook reference (note-box with link to HuggingFace Chapter 3)
  25. References (note-box with Kaplan 2020, Hoffmann 2022, Vaswani 2017, HuggingFace)
  26. Questions? (emoji-figure + tip-box "Up next..." teasing RAG)

  **Frontmatter** (MUST be exactly):
  ```yaml
  ---
  marp: true
  theme: cdl-theme
  math: katex
  transition: fade 0.25s
  author: Contextual Dynamics Lab
  ---
  ```

  **Title slide** (MUST be exactly):
  ```markdown
  # Lecture 16: Training transformer models
  ### PSYC 51.17: Models of language and communication

  Jeremy R. Manning
  Dartmouth College
  Winter 2026
  ```

  **Questions slide** (MUST be exactly this structure):
  ```html
  # Questions?

  <div class="emoji-figure">
    <div class="emoji-col">
      <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
      <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a></span>
    </div>
    <div class="emoji-col">
      <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
      <span class="label"><a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
    </div>
    <div class="emoji-col">
      <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
      <span class="label"><a href="https://context-lab.youcanbook.me">Office hours</a></span>
    </div>
  </div>

  <div class="tip-box" data-title="Up next...">

  Retrieval Augmented Generation (RAG): giving language models access to external knowledge!

  </div>
  ```

  **Must NOT do**:
  - Use `paginate`, `header`, or `footer` in frontmatter
  - Use `<!-- _class: lead -->` on any slide
  - Use `<div class="columns">` or any multi-column layout
  - Use Title Case for slide titles
  - Leave text outside content boxes
  - Reference images/figures that don't exist in the repo
  - Include more than 45 or fewer than 28 slides

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: This is a content-writing task producing a complete Markdown lecture file
  - **Skills**: [`/convert-lecture`]
    - `/convert-lecture`: Domain overlap — this is specifically about lecture slide authoring in this repo's Marp format
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No frontend work involved, pure markdown authoring

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `slides/week5/lecture15.md` — PRIMARY style reference. Copy frontmatter, title slide format, box usage patterns, Questions slide, and References slide structure EXACTLY.
  - `slides/week4/lecture13.md` — Secondary style reference. Note how Python code is presented inside `example-box`, how `<!-- _class: scale-XX -->` is used for dense slides.
  - `slides/week4/lecture14.md` — Secondary style reference. Note discussion slide patterns and warning-box usage.

  **Content References** (what to teach):
  - `slides/README.md` (Week 5 section) — Required reading: Kaplan et al. (2020), HuggingFace Chapter 3
  - `slides/week5/lecture15.md:564-568` — "Up next..." box says "Training transformers: where do the parameters ($\theta$) come from?" — L16 should answer this question
  - Current `slides/week5/lecture17.md:523-569` — Contains some training tips (AdamW, warmup, gradient clipping, mixed precision) that can inform content but must be rewritten in new style

  **External References**:
  - [Kaplan et al. (2020)](https://arxiv.org/abs/2001.08361) — Scaling Laws for Neural Language Models
  - [Hoffmann et al. (2022)](https://arxiv.org/abs/2203.15556) — Training Compute-Optimal Large Language Models (Chinchilla)
  - [HuggingFace NLP Course Chapter 3](https://huggingface.co/learn/nlp-course/chapter3) — Fine-tuning a pretrained model

  **WHY Each Reference Matters**:
  - `lecture15.md`: The executor must match this file's style pixel-for-pixel. Read frontmatter, title slide, box usage, Questions slide, and overall slide density.
  - `lecture13.md`/`lecture14.md`: Show how Python code and math are formatted in boxes. Show discussion slide patterns.
  - `README.md`: Contains the required readings that must appear in the References slide.
  - Current `lecture17.md` training tips: Source material for content (AdamW, warmup) but DO NOT copy the style.

  **Acceptance Criteria**:

  **Automated Verification (Bash):**
  ```bash
  # Style compliance checks
  grep -c 'paginate:' slides/week5/lecture16.md       # Assert: 0
  grep -c 'header:' slides/week5/lecture16.md          # Assert: 0
  grep -c 'footer:' slides/week5/lecture16.md          # Assert: 0
  grep -c '_class: lead' slides/week5/lecture16.md     # Assert: 0
  grep -c 'class="columns"' slides/week5/lecture16.md  # Assert: 0
  grep -c 'class="column"' slides/week5/lecture16.md   # Assert: 0

  # Required content checks
  grep -c 'definition-box' slides/week5/lecture16.md   # Assert: >= 5
  grep -c 'note-box' slides/week5/lecture16.md         # Assert: >= 3
  grep -c 'tip-box' slides/week5/lecture16.md          # Assert: >= 3
  grep -c 'example-box' slides/week5/lecture16.md      # Assert: >= 2
  grep -c 'warning-box' slides/week5/lecture16.md      # Assert: >= 1
  grep -c 'emoji-figure' slides/week5/lecture16.md     # Assert: 1
  grep -c 'Up next' slides/week5/lecture16.md          # Assert: >= 1
  grep -c 'Kaplan' slides/week5/lecture16.md           # Assert: >= 1
  grep -c 'cross-entropy\|cross.entropy' slides/week5/lecture16.md  # Assert: >= 1
  grep -c 'perplexity\|Perplexity' slides/week5/lecture16.md       # Assert: >= 1
  grep -c 'AdamW\|adamw' slides/week5/lecture16.md     # Assert: >= 1
  grep -ci 'scaling law' slides/week5/lecture16.md     # Assert: >= 1
  grep -ci 'fine.tun' slides/week5/lecture16.md        # Assert: >= 1

  # Slide count
  grep -c '^---$' slides/week5/lecture16.md            # Assert: between 28 and 45

  # Frontmatter check
  head -7 slides/week5/lecture16.md | grep -c 'marp: true'          # Assert: 1
  head -7 slides/week5/lecture16.md | grep -c 'theme: cdl-theme'    # Assert: 1
  head -7 slides/week5/lecture16.md | grep -c 'math: katex'         # Assert: 1
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from all grep checks
  - [ ] Slide separator count

  **Commit**: YES (groups with Task 2)
  - Message: `content(slides): rewrite lectures 16-17 to match lecture 15 style`
  - Files: `slides/week5/lecture16.md`, `slides/week5/lecture17.md`
  - Pre-commit: Compile both lectures successfully

---

- [ ] 2. Write lecture17.md — Retrieval Augmented Generation (RAG)

  **What to do**:
  Write a complete Marp lecture file (~35 slides) covering Retrieval Augmented Generation. The file must match the lecture 15 style EXACTLY. Overwrite the existing `slides/week5/lecture17.md`.

  **Content structure** (suggested slide flow):
  1. Title slide: `# Lecture 17: Retrieval augmented generation`
  2. Learning objectives (note-box)
  3. Announcements slide (important-box: Assignment 3 due Feb 6 11:59 PM EST; note-box: Assignment 4 released — Customer Service Chatbot, due Feb 16)
  4. The knowledge problem (definition-box: parametric vs non-parametric knowledge)
  5. Why RAG? (tip-box: limitations of parametric knowledge — hallucination, stale data, no citations)
  6. RAG architecture overview (definition-box: retrieve + generate pipeline)
  7. The RAG pipeline step by step (definition-box: query → embed → retrieve → augment prompt → generate)
  8. Embeddings for retrieval (definition-box: using embeddings as search, connecting to lectures 11-15)
  9. Vector similarity (definition-box with KaTeX: cosine similarity $\text{sim}(a,b) = \frac{a \cdot b}{\|a\| \|b\|}$)
  10. Chunking strategies (definition-box: why chunk? + tip-box: fixed-size, sentence, semantic chunking)
  11. Chunk size tradeoffs (warning-box: too small = no context, too large = noise)
  12. Vector databases (definition-box: what they are, why needed)
  13. Popular vector databases (note-box: FAISS, ChromaDB, Pinecone, Weaviate)
  14. Python implementation: embedding documents (example-box with ```python using sentence-transformers)
  15. Python implementation: retrieval (example-box with ```python using FAISS or ChromaDB)
  16. Python implementation: generation with context (example-box with ```python showing prompt augmentation)
  17. End-to-end RAG example (example-box: complete mini pipeline)
  18. RAG vs fine-tuning (tip-box comparing when to use each)
  19. Advanced RAG techniques (note-box: re-ranking, hybrid search, query expansion)
  20. Limitations of RAG (warning-box: retrieval quality, context window limits, latency)
  21. Best practices (tip-box: evaluation, chunking strategy, embedding model choice)
  22. Interactive demo (note-box with link to RAG demo: https://contextlab.github.io/llm-course/demos/rag/)
  23. 💭 Discussion: RAG applications and limitations
  24. 💭 Discussion: future of knowledge-grounded generation
  25. References (note-box with Lewis 2020, Borgeaud 2022, HuggingFace)
  26. Questions? (emoji-figure + tip-box "Up next..." teasing BERT / encoder models in Week 6)

  **Frontmatter** (MUST be exactly):
  ```yaml
  ---
  marp: true
  theme: cdl-theme
  math: katex
  transition: fade 0.25s
  author: Contextual Dynamics Lab
  ---
  ```

  **Title slide** (MUST be exactly):
  ```markdown
  # Lecture 17: Retrieval augmented generation
  ### PSYC 51.17: Models of language and communication

  Jeremy R. Manning
  Dartmouth College
  Winter 2026
  ```

  **Admin slide** (MUST include):
  ```html
  # Announcements

  <div class="important-box" data-title="Assignment 3 due this week">

  **Wikipedia Embeddings** assignment is due **Thursday, February 6 at 11:59 PM EST**.

  Submit via GitHub Classroom.

  </div>

  <div class="note-box" data-title="Assignment 4 released">

  [**Customer Service Chatbot**](https://contextlab.github.io/llm-course/assignments/assignment-4/) — build a context-aware chatbot using retrieval and generation techniques.

  Due: **February 16 at 11:59 PM EST**.

  </div>
  ```

  **Questions slide** (MUST be exactly this structure):
  ```html
  # Questions?

  <div class="emoji-figure">
    <div class="emoji-col">
      <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
      <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a></span>
    </div>
    <div class="emoji-col">
      <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
      <span class="label"><a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
    </div>
    <div class="emoji-col">
      <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
      <span class="label"><a href="https://context-lab.youcanbook.me">Office hours</a></span>
    </div>
  </div>

  <div class="tip-box" data-title="Up next...">

  Week 6: BERT and encoder models — bidirectional attention and masked language modeling!

  </div>
  ```

  **Must NOT do**:
  - Use `paginate`, `header`, or `footer` in frontmatter
  - Use `<!-- _class: lead -->` on any slide
  - Use `<div class="columns">` or any multi-column layout
  - Use Title Case for slide titles
  - Leave text outside content boxes
  - Reference images/figures that don't exist in the repo
  - Include more than 45 or fewer than 28 slides

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Content-writing task producing a complete Markdown lecture file
  - **Skills**: [`/convert-lecture`]
    - `/convert-lecture`: Domain overlap — lecture slide authoring in this repo's Marp format
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No frontend work involved

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `slides/week5/lecture15.md` — PRIMARY style reference. Copy frontmatter, title slide format, box usage patterns, Questions slide, References slide structure EXACTLY.
  - `slides/week4/lecture13.md` — Secondary style reference. Python code in example-box, scale classes for dense slides.
  - `slides/week4/lecture14.md` — Secondary style reference. Discussion patterns, warning-box usage.

  **Content References** (what to teach):
  - `slides/README.md` (Week 5 section) — Required reading: Lewis et al. (2020), RAG demo link, Assignment 3/4 dates
  - `slides/README.md` (Week 6 section) — "Up next" teaser content (BERT deep dive)
  - `demos/rag/` — The RAG demo exists at https://contextlab.github.io/llm-course/demos/rag/
  - `slides/README.md` (Week 4 section, Lecture 11-12) — Embeddings context that RAG builds upon

  **External References**:
  - [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
  - [Borgeaud et al. (2022)](https://arxiv.org/abs/2112.04426) — RETRO: Improving language models by retrieving from trillions of tokens
  - [RAG System Demo](https://contextlab.github.io/llm-course/demos/rag/) — Course interactive demo
  - [Assignment 4: Customer Service Chatbot](https://contextlab.github.io/llm-course/assignments/assignment-4/)

  **WHY Each Reference Matters**:
  - `lecture15.md`: Style template — the executor must match it exactly
  - `lecture13.md`/`lecture14.md`: Show how to format code and discussions in boxes
  - `README.md` Week 5: Contains mandatory admin dates, reading links, and demo reference
  - `README.md` Week 6: Provides content for the "Up next..." teaser

  **Acceptance Criteria**:

  **Automated Verification (Bash):**
  ```bash
  # Style compliance checks
  grep -c 'paginate:' slides/week5/lecture17.md       # Assert: 0
  grep -c 'header:' slides/week5/lecture17.md          # Assert: 0
  grep -c 'footer:' slides/week5/lecture17.md          # Assert: 0
  grep -c '_class: lead' slides/week5/lecture17.md     # Assert: 0
  grep -c 'class="columns"' slides/week5/lecture17.md  # Assert: 0
  grep -c 'class="column"' slides/week5/lecture17.md   # Assert: 0

  # Required content checks
  grep -c 'definition-box' slides/week5/lecture17.md   # Assert: >= 5
  grep -c 'note-box' slides/week5/lecture17.md         # Assert: >= 3
  grep -c 'tip-box' slides/week5/lecture17.md          # Assert: >= 3
  grep -c 'example-box' slides/week5/lecture17.md      # Assert: >= 2
  grep -c 'warning-box' slides/week5/lecture17.md      # Assert: >= 1
  grep -c 'emoji-figure' slides/week5/lecture17.md     # Assert: 1
  grep -c 'Up next' slides/week5/lecture17.md          # Assert: >= 1
  grep -c 'Lewis' slides/week5/lecture17.md            # Assert: >= 1
  grep -c 'cosine\|similarity' slides/week5/lecture17.md  # Assert: >= 1
  grep -ci 'chunking\|chunk' slides/week5/lecture17.md    # Assert: >= 1
  grep -ci 'vector database\|vector store' slides/week5/lecture17.md  # Assert: >= 1
  grep -c 'contextlab.github.io/llm-course/demos/rag' slides/week5/lecture17.md  # Assert: >= 1
  grep -c 'February 6\|Feb 6' slides/week5/lecture17.md   # Assert: >= 1
  grep -c 'assignment-4\|Assignment 4' slides/week5/lecture17.md  # Assert: >= 1

  # Slide count
  grep -c '^---$' slides/week5/lecture17.md            # Assert: between 28 and 45

  # Frontmatter check
  head -7 slides/week5/lecture17.md | grep -c 'marp: true'          # Assert: 1
  head -7 slides/week5/lecture17.md | grep -c 'theme: cdl-theme'    # Assert: 1
  head -7 slides/week5/lecture17.md | grep -c 'math: katex'         # Assert: 1
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from all grep checks
  - [ ] Slide separator count

  **Commit**: YES (groups with Task 1)
  - Message: `content(slides): rewrite lectures 16-17 to match lecture 15 style`
  - Files: `slides/week5/lecture16.md`, `slides/week5/lecture17.md`
  - Pre-commit: Compile both lectures successfully

---

- [ ] 3. Compile both lectures and verify

  **What to do**:
  Compile both lecture files using the template_deck compile script. Verify clean compilation and run all style compliance checks.

  **Steps**:
  1. Run `../template_deck/compile.sh lecture16.md` from `slides/week5/`
  2. Verify exit code 0 and `lecture16.html` exists
  3. Run `../template_deck/compile.sh lecture17.md` from `slides/week5/`
  4. Verify exit code 0 and `lecture17.html` exists
  5. Run all grep-based style compliance checks from Tasks 1 and 2
  6. Verify slide counts are in range (28-45 each)
  7. If any check fails, fix the corresponding `.md` file and re-compile

  **Must NOT do**:
  - Skip compilation
  - Ignore compilation warnings/errors
  - Edit HTML files directly (they're regenerated on compile)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple compile-and-verify task
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All: This is just running bash commands and checking output

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1 and 2

  **References**:

  **Pattern References**:
  - `slides/template_deck/compile.sh` — The compilation script to run
  - `slides/week5/themes` — Symlink that must exist (already confirmed present)

  **Acceptance Criteria**:

  **Automated Verification (Bash):**
  ```bash
  # Compile lecture 16
  cd /Users/jmanning/llm-course/slides/week5 && ../template_deck/compile.sh lecture16.md
  # Assert: Exit code 0

  # Verify output exists
  test -s /Users/jmanning/llm-course/slides/week5/lecture16.html
  # Assert: Exit code 0 (file exists and non-empty)

  # Compile lecture 17
  cd /Users/jmanning/llm-course/slides/week5 && ../template_deck/compile.sh lecture17.md
  # Assert: Exit code 0

  # Verify output exists
  test -s /Users/jmanning/llm-course/slides/week5/lecture17.html
  # Assert: Exit code 0 (file exists and non-empty)

  # Run ALL style compliance checks from Tasks 1 and 2
  # (see acceptance criteria in Tasks 1 and 2 for full list)
  ```

  **Evidence to Capture:**
  - [ ] Compile output for both lectures
  - [ ] All grep check results
  - [ ] Final slide counts

  **Commit**: YES
  - Message: `content(slides): rewrite lectures 16-17 to match lecture 15 style`
  - Files: `slides/week5/lecture16.md`, `slides/week5/lecture17.md`
  - Pre-commit: All compile and style checks pass

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3 (final) | `content(slides): rewrite lectures 16-17 to match lecture 15 style` | `slides/week5/lecture16.md`, `slides/week5/lecture17.md` | Both compile, all style checks pass |

---

## Success Criteria

### Verification Commands
```bash
# Compile both
cd slides/week5 && ../template_deck/compile.sh lecture16.md  # Expected: exit 0
cd slides/week5 && ../template_deck/compile.sh lecture17.md  # Expected: exit 0

# Style: no forbidden patterns
grep -c 'paginate:\|header:\|footer:\|_class: lead\|class="columns"\|class="column"' slides/week5/lecture16.md  # Expected: 0
grep -c 'paginate:\|header:\|footer:\|_class: lead\|class="columns"\|class="column"' slides/week5/lecture17.md  # Expected: 0

# Style: required patterns present
grep -c 'definition-box\|note-box\|tip-box\|example-box\|warning-box\|emoji-figure' slides/week5/lecture16.md  # Expected: >= 15
grep -c 'definition-box\|note-box\|tip-box\|example-box\|warning-box\|emoji-figure' slides/week5/lecture17.md  # Expected: >= 15
```

### Final Checklist
- [ ] Both `.md` files overwritten with correct content
- [ ] Frontmatter matches lecture 15 exactly (5 fields only)
- [ ] No forbidden patterns (columns, lead, paginate, header, footer)
- [ ] All content in semantic boxes
- [ ] Sentence case titles throughout
- [ ] L16 covers: loss functions, optimization, scaling laws, fine-tuning, Python examples, discussion
- [ ] L17 covers: RAG architecture, embeddings, chunking, vector DBs, Python implementation, demo link, admin notices
- [ ] Both have References slide and Questions slide with emoji-figure
- [ ] Both compile to HTML without errors
- [ ] Slide count 28-45 each
