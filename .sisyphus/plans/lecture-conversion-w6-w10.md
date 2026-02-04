# Lecture Conversion: Weeks 6, 7, 9, 10 (L18-L27)

## TL;DR

> **Quick Summary**: Convert 10 Marp lectures from old-style formatting (column layouts, old callout syntax, emojis in titles) to the "box-first" gold standard established in L17. Lecture 24 requires entirely new content (Agents & Tool Use) since its current RAG content duplicates L17.
>
> **Deliverables**:
> - 10 rewritten `.md` lecture files (L18-L27)
> - 10 compiled `.html` files
> - 10 compiled `.pdf` files
> - Manim animation GIFs where appropriate
> - Git commit(s) with all changes
>
> **Estimated Effort**: Large (10 lectures, ~8,000 lines of content)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Wave 1 → Quality check → Wave 2 → Quality check → Wave 3 → Quality check → Wave 4 (compile all + commit)

---

## Context

### Original Request
Convert remaining course lectures (weeks 6, 7, 9, 10) to match the "box-first" slide style used in weeks 1-5. This is primarily a structural conversion — same content, new formatting — except for L24 which needs entirely new content on Agents & Tool Use.

### Interview Summary
**Key Discussions**:
- L24 strategy: Write from scratch with agents/tool use content (function calling, ReAct, Toolformer, autonomous agents). Current RAG content is redundant with L17.
- L27 teaser: Reflective closing — "That's a wrap! From ELIZA to autonomous agents — what a journey. Good luck on your final projects!"
- Announcements: Include where applicable per course schedule (L21, L23, L27)
- Manim animations: Use same L15 approach (GIF via manim + gifsicle, embed as `![height:500](animations/gifs/filename.gif)`) for complex equation visualizations

**Research Findings**:
- All week directories (6, 7, 9, 10) have correct `themes -> ../template_deck/themes` symlinks
- Old lectures use: `paginate: true`, `header:`, `footer:`, `<!-- _class: lead -->`, `<div class="columns">`, `<div class="callout info/tip/warning">`, emojis in titles, Title Case, LaTeX escapes (`\&`, `\_`)
- Compile pipeline: `process_markdown.py` → `marp-cli` → JS injection. Default format is `both` (HTML+PDF).
- Old lecture endings are inconsistent: some have "Readings", "Looking Forward", "Summary" slides with varied formatting

### Metis Review
**Identified Gaps** (addressed):
- Symlink verification: All 4 week directories confirmed with correct symlinks
- Compile default format: Confirmed `both` (HTML+PDF) — no extra flags needed
- Old ending patterns: Mapped for L20, L23, L25 — all need standardization to Questions? slide
- References/Readings slides: Need conversion to `note-box` containers (not removal)
- Manim infrastructure: Confirmed at `slides/week5/animations/` with Dartmouth palette

---

## Work Objectives

### Core Objective
Convert all 10 remaining lectures to the box-first Marp style, preserving educational content while standardizing visual presentation. L24 gets entirely new content on Agents & Tool Use.

### Concrete Deliverables
- 10 rewritten `.md` files in their respective week directories
- 10 compiled `.html` files (same directories)
- 10 compiled `.pdf` files (same directories)
- Any manim animation GIFs created during the process

### Definition of Done
- [ ] All 10 lectures compile without errors via `compile.sh`
- [ ] All 10 lectures use exact gold standard frontmatter (no `paginate`, `header`, `footer`)
- [ ] All 10 lectures have Learning Objectives slide after title
- [ ] All 10 lectures end with standardized Questions? slide
- [ ] Zero `<div class="columns">` in any converted file
- [ ] Zero `<div class="callout ...">` in any converted file
- [ ] Zero emojis in `#` slide titles
- [ ] All slide titles in sentence case
- [ ] L24 contains agents/tool use content (not RAG)

### Must Have
- Exact frontmatter matching L17 (marp, theme, math, transition, author — nothing else)
- Title slide format: `# Lecture N: Title`, `### PSYC 51.17: ...`, name/school/term
- Learning objectives as second slide in `note-box`
- All content in semantic boxes (definition-box, note-box, tip-box, example-box, warning-box, important-box)
- Python code inside `example-box` divs
- ```flow blocks for pipeline/process diagrams
- Standardized Questions? slide with emoji-figure grid + tip-box teaser
- Announcement slides where applicable (L21, L23, L27)

### Must NOT Have (Guardrails)
- `paginate: true` in frontmatter
- `header:` or `footer:` in frontmatter
- `<!-- _class: lead -->` on title slides
- `<div class="columns"><div class="column">` layouts (use sequential boxes)
- `<div class="callout info/tip/warning">` (old syntax)
- Emojis in `#` slide titles (e.g., `# BERT Deep Dive 🔬` → `# BERT deep dive`)
- Title Case in slide titles (only first word + proper nouns capitalized)
- `\item` LaTeX artifacts
- LaTeX escape sequences in non-math text (`\&` → `&`, `\_` → `_`)
- Random emoji decorations in body text
- Bare "Summary" slides (convert to note-box or tip-box)
- Separate "Discussion Questions" sections (merge into tip-box)
- Content outside of semantic boxes (all substantive content must be in a box)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: N/A (slides, not code)
- **User wants tests**: NO — visual verification via compilation
- **Framework**: Marp compile.sh
- **QA approach**: Automated compilation + Playwright visual review

### Automated Verification Per Lecture

Each lecture's acceptance is verified by:

```bash
# 1. Compile (from week directory)
cd slides/weekN && ../template_deck/compile.sh lectureN.md
# Assert: Exit code 0, lectureN.html created, lectureN.pdf created

# 2. Validate no old patterns remain
grep -c 'paginate: true' lectureN.md        # Assert: 0
grep -c '<!-- _class: lead -->' lectureN.md  # Assert: 0
grep -c 'class="columns"' lectureN.md       # Assert: 0
grep -c 'class="callout' lectureN.md        # Assert: 0

# 3. Validate new patterns present
grep -c 'theme: cdl-theme' lectureN.md      # Assert: 1
grep -c 'transition: fade' lectureN.md      # Assert: 1
grep -c 'emoji-figure' lectureN.md          # Assert: 1 (Questions slide)
grep -c 'data-title=' lectureN.md           # Assert: >= 5 (semantic boxes)
```

### Visual Verification (Playwright)
After each wave compiles, a visual review task opens each HTML in Playwright, navigates slide-by-slide, and checks for:
- Layout overflow / text clipping
- Correct box styling (colored borders, icons)
- No broken emoji rendering
- Proper flow diagram rendering
- Screenshot evidence saved to `.sisyphus/evidence/`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — Week 6 BERT lectures):
├── Task 1: L18 — BERT Deep Dive (729 lines, standard conversion)
├── Task 2: L19 — BERT Variants (699 lines, standard conversion)
└── Task 3: L20 — Applications of Encoder Models (815 lines, standard conversion)

Wave 2 (After Wave 1 quality check — Week 7 GPT lectures):
├── Task 4: L21 — GPT Architecture (776 lines, standard conversion)
├── Task 5: L22 — Scaling Up to GPT-3+ (954 lines, standard conversion)
└── Task 6: L23 — Implementing GPT from Scratch (996 lines, code-heavy)

Wave 3 (After Wave 2 quality check — Week 9 Advanced Topics):
├── Task 7: L24 — Agents and Tool Use (NEW CONTENT — write from scratch)
├── Task 8: L25 — MoE & Efficiency (836 lines, standard conversion)
└── Task 9: L26 — Ethics, Bias, and Safety (921 lines, standard conversion)

Wave 4 (After Wave 3 quality check — Finalization):
├── Task 10: L27 — Final Project Work Session (432 lines, standard conversion)
├── Task 11: Compile all 10 lectures (HTML + PDF)
├── Task 12: Visual review of all compiled lectures
└── Task 13: Git commit all changes
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (L18) | None | 11, 12, 13 | 2, 3 |
| 2 (L19) | None | 11, 12, 13 | 1, 3 |
| 3 (L20) | None | 11, 12, 13 | 1, 2 |
| 4 (L21) | Wave 1 quality OK | 11, 12, 13 | 5, 6 |
| 5 (L22) | Wave 1 quality OK | 11, 12, 13 | 4, 6 |
| 6 (L23) | Wave 1 quality OK | 11, 12, 13 | 4, 5 |
| 7 (L24) | Wave 2 quality OK | 11, 12, 13 | 8, 9 |
| 8 (L25) | Wave 2 quality OK | 11, 12, 13 | 7, 9 |
| 9 (L26) | Wave 2 quality OK | 11, 12, 13 | 7, 8 |
| 10 (L27) | Wave 3 quality OK | 11, 12, 13 | None (only task in its sub-wave) |
| 11 (Compile) | 1-10 all complete | 12 | None |
| 12 (Visual review) | 11 | 13 | None |
| 13 (Git commit) | 12 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|--------------------|
| 1 | 1, 2, 3 | 3x `delegate_task(category="writing", load_skills=[], run_in_background=true)` |
| 2 | 4, 5, 6 | 3x `delegate_task(category="writing", load_skills=[], run_in_background=true)` |
| 3 | 7, 8, 9 | 3x `delegate_task(category="writing", load_skills=[], run_in_background=true)` — L24 needs extra research context |
| 4 | 10, 11, 12, 13 | Sequential: writing → quick → visual-engineering (playwright) → quick (git) |

---

## Shared Conversion Reference

> **CRITICAL**: Every task below references this section. Agents MUST read this before starting any lecture conversion.

### Exact Frontmatter (copy verbatim)
```yaml
---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---
```

### Exact Title Slide Format
```markdown
# Lecture N: Title in sentence case
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026
```

### Exact Learning Objectives Slide Format
```markdown
---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. [Objective 1]
2. [Objective 2]
3. [Objective 3]
4. [Objective 4]
5. [Objective 5]

</div>
```

### Exact Questions? Slide Format (LAST slide of every lecture)
```markdown
---

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

[TEASER TEXT — see per-lecture specification]

</div>
```

### Box Type Reference
| Box | Use For | Example data-title |
|-----|---------|-------------------|
| `definition-box` | Formal definitions, key concepts | "Masked language modeling" |
| `note-box` | Learning objectives, context, readings | "By the end of this lecture..." |
| `tip-box` | Analogies, intuitions, discussion Qs | "Think of it this way..." |
| `example-box` | Code examples, calculations | "Fine-tuning BERT in Python" |
| `warning-box` | Limitations, pitfalls, cautions | "Common misconceptions" |
| `important-box` | Announcements, critical info | "Assignment due this week" |

### Conversion Checklist (apply to EVERY lecture)
1. Replace frontmatter (remove paginate/header/footer, add math/transition/author)
2. Replace title slide (remove `<!-- _class: lead -->`, use exact format above)
3. Add Learning Objectives slide as slide 2
4. Convert all `<div class="callout info/tip/warning">` to semantic boxes
5. Convert all `<div class="columns">` to sequential boxes
6. Wrap all Python code in `example-box`
7. Convert slide titles to sentence case, remove emojis
8. Remove LaTeX escapes from non-math text
9. Convert "Summary" slides to `note-box` or `tip-box`
10. Convert "Discussion Questions" to `tip-box`
11. Convert "Readings/References" to `note-box` with `data-title="Further reading"`
12. Add `<!-- _class: scale-XX -->` for dense slides
13. Add ```flow blocks for pipeline diagrams where appropriate
14. Replace final slide with exact Questions? format
15. Compile and verify

---

## TODOs

### WAVE 1: Week 6 — BERT Lectures (parallel)

- [ ] 1. Convert L18: BERT deep dive

  **What to do**:
  - Read `slides/week6/lecture18.md` (729 lines) completely
  - Read `slides/week5/lecture17.md` as the gold standard reference
  - Apply full Conversion Checklist from Shared Conversion Reference above
  - Specific content notes:
    - "Today's Agenda" slide → replace with Learning Objectives in note-box
    - BERT bidirectional vs unidirectional comparison (currently in columns) → convert to sequential definition-boxes
    - MLM masking strategy explanation → definition-box
    - NSP task explanation → definition-box
    - Architecture specs (BERT-base vs BERT-large) → note-box with comparison
    - Fine-tuning pipeline → ```flow block
    - Contextual embeddings visualization → tip-box with analogy
    - All code examples → example-box
    - "References" slide → note-box with `data-title="Further reading"`
  - Teaser: "BERT variants — RoBERTa, DistilBERT, ALBERT, and how to make BERT better!"
  - No announcements needed for this lecture

  **Must NOT do**:
  - Use column layouts for BERT-base vs BERT-large comparison
  - Add emojis to slide titles
  - Leave any `<div class="callout">` syntax
  - Leave any `<div class="columns">` syntax

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Primary task is rewriting/restructuring markdown content with precise formatting rules
  - **Skills**: `[]`
    - No special skills needed — this is a markdown rewrite following explicit templates
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed — we're writing Marp markdown, not designing UI
    - `playwright`: Not needed at individual task level — visual review is a separate task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (gold standard to follow):
  - `slides/week5/lecture17.md` — Complete gold standard. Follow this file's structure exactly: frontmatter, title slide, learning objectives, content in boxes, references in note-box, Questions? slide
  - `slides/week5/lecture17.md:1-7` — Exact frontmatter to copy
  - `slides/week5/lecture17.md:9-14` — Exact title slide format
  - `slides/week5/lecture17.md:18-28` — Learning objectives pattern
  - `slides/week5/lecture17.md:529-551` — Questions? slide with emoji-figure and tip-box teaser

  **Source Content** (what to convert):
  - `slides/week6/lecture18.md` — Full source file. Preserve all educational content, equations, code. Only change formatting/structure.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md` — Full theme documentation: box syntax, emoji figures, flow diagrams, scaling classes
  - `slides/template_deck/themes/cdl-theme.css` — CSS class names for boxes and layouts

  **Acceptance Criteria**:

  ```bash
  # Agent runs from slides/week6/:
  ../template_deck/compile.sh lecture18.md
  # Assert: Exit code 0
  # Assert: lecture18.html exists
  # Assert: lecture18.pdf exists

  # Validate old patterns removed:
  grep -c 'paginate: true' lecture18.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture18.md    # Assert: 0
  grep -c 'class="columns"' lecture18.md         # Assert: 0
  grep -c 'class="callout' lecture18.md          # Assert: 0
  grep -c 'class="column"' lecture18.md          # Assert: 0

  # Validate new patterns present:
  grep -c 'theme: cdl-theme' lecture18.md        # Assert: 1
  grep -c 'transition: fade' lecture18.md        # Assert: 1
  grep -c 'emoji-figure' lecture18.md            # Assert: >= 1
  grep -c 'data-title=' lecture18.md             # Assert: >= 5
  grep -c 'Learning objectives' lecture18.md     # Assert: 1
  ```

  **Commit**: NO (groups with Wave 1 batch or final commit)

---

- [ ] 2. Convert L19: BERT variants

  **What to do**:
  - Read `slides/week6/lecture19.md` (699 lines) completely
  - Apply full Conversion Checklist from Shared Conversion Reference
  - Specific content notes:
    - RoBERTa improvements over BERT → definition-box for each variant
    - DistilBERT knowledge distillation → definition-box + tip-box analogy
    - ALBERT parameter sharing → definition-box
    - ELECTRA replaced-token detection → definition-box
    - Comparison table of variants → note-box (or standalone table)
    - Model selection guidance → tip-box
    - All code → example-box
    - References → note-box with `data-title="Further reading"`
  - Teaser: "Applications of encoder models — real-world NLP with BERT and friends!"
  - No announcements needed

  **Must NOT do**:
  - Use column layouts for variant comparisons
  - Leave old callout syntax
  - Use Title Case in slide titles

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Markdown content restructuring with formatting rules
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard (entire file)
  - `slides/week5/lecture17.md:529-551` — Questions? slide format

  **Source Content**:
  - `slides/week6/lecture19.md` — Full source (699 lines). Preserve all variant descriptions, comparisons, code.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md` — Box syntax, scaling classes, flow diagrams

  **Acceptance Criteria**:

  ```bash
  cd slides/week6 && ../template_deck/compile.sh lecture19.md
  # Assert: Exit code 0, lecture19.html + lecture19.pdf exist

  grep -c 'paginate: true' lecture19.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture19.md    # Assert: 0
  grep -c 'class="columns"' lecture19.md         # Assert: 0
  grep -c 'class="callout' lecture19.md          # Assert: 0
  grep -c 'emoji-figure' lecture19.md            # Assert: >= 1
  grep -c 'data-title=' lecture19.md             # Assert: >= 5
  grep -c 'Learning objectives' lecture19.md     # Assert: 1
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 3. Convert L20: Applications of encoder models

  **What to do**:
  - Read `slides/week6/lecture20.md` (815 lines) completely
  - Apply full Conversion Checklist
  - Specific content notes:
    - Real-world NLP applications → note-box overview
    - Named Entity Recognition → definition-box + example-box with code
    - Sentiment analysis with BERT → example-box
    - Question answering → definition-box + example-box
    - Cognitive neuroscience applications → tip-box (connecting NLP to course theme)
    - Bias in encoder models → warning-box
    - Deployment considerations → note-box
    - "Readings & Resources" slide → note-box with `data-title="Further reading"`
    - "Looking Forward" slide → merge into Questions? teaser
  - Teaser: "GPT architecture — autoregressive generation and the decoder-only transformer!"
  - No announcements needed

  **Must NOT do**:
  - Keep "Looking Forward" as a separate slide (merge into teaser)
  - Use column layouts
  - Leave old callout or column syntax

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Markdown content restructuring
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard
  - `slides/week5/lecture17.md:529-551` — Questions? slide format

  **Source Content**:
  - `slides/week6/lecture20.md` — Full source (815 lines)

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md`

  **Acceptance Criteria**:

  ```bash
  cd slides/week6 && ../template_deck/compile.sh lecture20.md
  # Assert: Exit code 0, lecture20.html + lecture20.pdf exist

  grep -c 'paginate: true' lecture20.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture20.md    # Assert: 0
  grep -c 'class="columns"' lecture20.md         # Assert: 0
  grep -c 'class="callout' lecture20.md          # Assert: 0
  grep -c 'emoji-figure' lecture20.md            # Assert: >= 1
  grep -c 'data-title=' lecture20.md             # Assert: >= 5
  ```

  **Commit**: NO (groups with final commit)

---

### WAVE 2: Week 7 — GPT Lectures (parallel, after Wave 1)

- [ ] 4. Convert L21: GPT architecture

  **What to do**:
  - Read `slides/week7/lecture21.md` (776 lines) completely
  - Apply full Conversion Checklist
  - Specific content notes:
    - Decoder-only transformer → definition-box
    - Causal masking explanation → definition-box + possible flow diagram
    - GPT-1 two-stage training (pre-train → fine-tune) → ```flow block
    - Autoregressive generation → example-box with step-by-step
    - Comparison with BERT (encoder vs decoder) → sequential boxes (NOT columns)
    - Code examples → example-box
    - References → note-box
  - **Announcements slide** (important-box):
    - Assignment 4 Due: February 16, 11:59 PM EST
    - Final Project Released: Due March 9, 11:59 PM EST — link to https://contextlab.github.io/llm-course/assignments/final-project/
    - Assignment 5 Available (Optional/Extra Credit): Build GPT — link to https://contextlab.github.io/llm-course/assignments/assignment-5/
  - Teaser: "Scaling up — from GPT-2 to GPT-3, scaling laws, and the rise of ChatGPT!"

  **Must NOT do**:
  - Use columns for encoder vs decoder comparison
  - Use different header text than course standard
  - Leave `<div class="callout">` patterns

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Markdown restructuring with precise formatting
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Wave 1 quality check

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard
  - `slides/week5/lecture17.md:32-48` — Announcements slide pattern (important-box + note-box)

  **Source Content**:
  - `slides/week7/lecture21.md` — Full source (776 lines). Note: uses different header string than other lectures.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md` — Flow diagram syntax, box types

  **Acceptance Criteria**:

  ```bash
  cd slides/week7 && ../template_deck/compile.sh lecture21.md
  # Assert: Exit code 0, lecture21.html + lecture21.pdf exist

  grep -c 'paginate: true' lecture21.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture21.md    # Assert: 0
  grep -c 'class="columns"' lecture21.md         # Assert: 0
  grep -c 'class="callout' lecture21.md          # Assert: 0
  grep -c 'emoji-figure' lecture21.md            # Assert: >= 1
  grep -c 'data-title=' lecture21.md             # Assert: >= 5
  grep -c 'Assignment' lecture21.md              # Assert: >= 1 (announcements present)
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 5. Convert L22: Scaling up to GPT-3 and beyond

  **What to do**:
  - Read `slides/week7/lecture22.md` (954 lines) completely
  - Apply full Conversion Checklist
  - Specific content notes:
    - GPT-2 scale-up → definition-box with specs
    - WebText dataset → note-box
    - Zero-shot / few-shot learning → definition-box with examples
    - GPT-3 specifications → definition-box
    - Scaling laws (Kaplan et al.) → note-box + possible equation visualization
    - In-context learning → example-box with prompt examples
    - RLHF pipeline → ```flow block (this is a key pipeline diagram)
    - ChatGPT and InstructGPT → definition-box
    - Open vs closed models landscape → note-box
    - Prompting techniques → example-box
    - References → note-box
  - Teaser: "Implementing GPT from scratch — building a language model step by step!"
  - No announcements for this lecture

  **Must NOT do**:
  - Use columns for GPT-1 vs GPT-2 vs GPT-3 comparison
  - Keep old `callout warning` / `callout info` syntax
  - Leave Title Case in slide titles

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Complex content restructuring with many box types needed
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Wave 1 quality check

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard

  **Source Content**:
  - `slides/week7/lecture22.md` — Full source (954 lines). Dense content with many comparison sections.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md` — Flow diagrams for RLHF pipeline

  **Acceptance Criteria**:

  ```bash
  cd slides/week7 && ../template_deck/compile.sh lecture22.md
  # Assert: Exit code 0, lecture22.html + lecture22.pdf exist

  grep -c 'paginate: true' lecture22.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture22.md    # Assert: 0
  grep -c 'class="columns"' lecture22.md         # Assert: 0
  grep -c 'class="callout' lecture22.md          # Assert: 0
  grep -c 'emoji-figure' lecture22.md            # Assert: >= 1
  grep -c 'data-title=' lecture22.md             # Assert: >= 5
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 6. Convert L23: Implementing GPT from scratch

  **What to do**:
  - Read `slides/week7/lecture23.md` (996 lines) completely
  - Apply full Conversion Checklist
  - **CODE-HEAVY LECTURE** — this is primarily a walkthrough of building GPT. Every code block MUST be inside `<div class="example-box" data-title="...">`.
  - Specific content notes:
    - BPE tokenization implementation → example-box
    - Token + positional embedding → example-box + definition-box for concepts
    - Self-attention implementation → example-box (multi-step)
    - Multi-head attention → example-box
    - Feed-forward network → example-box
    - Transformer block assembly → example-box + ```flow block showing layer stacking
    - Training loop → example-box
    - Sampling strategies (greedy, top-k, top-p, temperature) → definition-box + example-box
    - "Code Resources" callout → note-box
    - Dense code slides → use `<!-- _class: scale-90 -->` or `<!-- _class: scale-85 -->` as needed
  - **Announcement slide** (important-box):
    - Week 8: No classes February 23-27 (instructor away). Use this time for final project work.
  - Teaser: "Week 8 is off — use it to work on your final project! See you in Week 9."

  **Must NOT do**:
  - Leave code blocks outside of example-box containers
  - Use column layouts for code comparisons
  - Skip scale classes on dense code slides (will overflow)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Code-heavy content restructuring — every code block needs wrapping
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Wave 1 quality check

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard
  - `slides/week5/lecture17.md:32-48` — Announcements pattern

  **Source Content**:
  - `slides/week7/lecture23.md` — Full source (996 lines). LONGEST lecture. Very code-heavy.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md` — Scale classes (`scale-90`, `scale-85`, etc.) for dense slides, example-box syntax

  **Acceptance Criteria**:

  ```bash
  cd slides/week7 && ../template_deck/compile.sh lecture23.md
  # Assert: Exit code 0, lecture23.html + lecture23.pdf exist

  grep -c 'paginate: true' lecture23.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture23.md    # Assert: 0
  grep -c 'class="columns"' lecture23.md         # Assert: 0
  grep -c 'class="callout' lecture23.md          # Assert: 0
  grep -c 'example-box' lecture23.md             # Assert: >= 8 (many code sections)
  grep -c 'emoji-figure' lecture23.md            # Assert: >= 1
  ```

  **Commit**: NO (groups with final commit)

---

### WAVE 3: Week 9 — Advanced Topics (parallel, after Wave 2)

- [ ] 7. Write L24: Agents and tool use (NEW CONTENT)

  **What to do**:
  - **THIS IS NOT A CONVERSION — this is a new lecture written from scratch.**
  - Discard the existing RAG content in `slides/week9/lecture24.md` entirely.
  - Write ~25-30 slides on Agents and Tool Use, covering:

  **Lecture outline** (based on course README and research):
  1. Title slide: `# Lecture 24: Agents and tool use`
  2. Learning objectives (note-box): function calling, ReAct, tool use, agent architectures, autonomous agents
  3. Announcements: None for this lecture
  4. **From chatbots to agents** — what makes an agent different from a chatbot? (definition-box)
  5. **Function calling** — how LLMs invoke external tools (definition-box + example-box with API example)
  6. **The tool use paradigm** — structured output for function invocation (example-box)
  7. **Toolformer** (Schick et al., 2023) — self-supervised tool learning (definition-box)
  8. **The ReAct framework** (Yao et al., 2023) — Reasoning + Acting loop (definition-box + ```flow block)
  9. **ReAct in action** — step-by-step example of thought/action/observation (example-box)
  10. **Agent architectures** — plan-and-execute, reflection, multi-agent (note-box)
  11. **Autonomous agents** — AutoGPT, BabyAGI, Voyager (note-box)
  12. **Practical function calling** — OpenAI/Anthropic API examples (example-box with Python code)
  13. **Agent memory** — short-term (context window) vs long-term (vector DB) (definition-box)
  14. **Limitations and risks** — hallucinated tool calls, cascading errors, safety (warning-box)
  15. **Discussion questions** — when should agents act autonomously? (tip-box)
  16. **References** — Yao et al. 2023, Schick et al. 2023, and others (note-box)
  17. Questions? slide with teaser

  - Teaser: "Mixture of Experts and efficiency — how to make giant models practical!"
  - Use ```flow blocks for ReAct loop and agent architecture diagrams
  - Include Python code examples for function calling (inside example-box)
  - Consider manim animations for the ReAct thought/action/observation cycle if appropriate

  **Must NOT do**:
  - Reuse any RAG content from the existing file
  - Use column layouts
  - Skip the standardized Questions? slide
  - Make up paper citations — use only verified references (Yao et al. 2023, Schick et al. 2023, etc.)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Writing new educational content from scratch with specific formatting requirements
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for content writing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Wave 2 quality check

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard for structure and formatting
  - `slides/week5/lecture17.md:100-140` — Flow diagram example (RAG pipeline) — use similar style for ReAct loop

  **Content References** (papers to cite):
  - Yao et al. (2023): "ReAct: Synergizing Reasoning and Acting in Language Models" — https://arxiv.org/abs/2210.03629
  - Schick et al. (2023): "Toolformer: Language Models Can Teach Themselves to Use Tools" — https://arxiv.org/abs/2302.04761
  - Wei et al. (2022): "Chain-of-Thought Prompting Elicits Reasoning" — https://arxiv.org/abs/2201.11903
  - Significant Gravitas (2023): AutoGPT — https://github.com/Significant-Gravitas/AutoGPT

  **Course Context** (what students already know):
  - `slides/README.md` — Course schedule showing L24 as "Agents and Tool Use"
  - Students have covered: transformers, BERT, GPT, RAG (L17), scaling laws. They understand LLM fundamentals.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md`

  **Acceptance Criteria**:

  ```bash
  cd slides/week9 && ../template_deck/compile.sh lecture24.md
  # Assert: Exit code 0, lecture24.html + lecture24.pdf exist

  # Verify it's agents content, not RAG:
  grep -ci 'retrieval augmented' lecture24.md    # Assert: 0 (RAG content removed)
  grep -ci 'agent' lecture24.md                  # Assert: >= 5 (agents content present)
  grep -ci 'function calling' lecture24.md       # Assert: >= 1
  grep -ci 'ReAct' lecture24.md                  # Assert: >= 1
  grep -ci 'Toolformer' lecture24.md             # Assert: >= 1

  # Standard checks:
  grep -c 'paginate: true' lecture24.md          # Assert: 0
  grep -c 'emoji-figure' lecture24.md            # Assert: >= 1
  grep -c 'data-title=' lecture24.md             # Assert: >= 5
  grep -c 'Learning objectives' lecture24.md     # Assert: 1
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 8. Convert L25: Mixture of Experts and efficiency

  **What to do**:
  - Read `slides/week9/lecture25.md` (836 lines) completely
  - Apply full Conversion Checklist
  - Specific content notes:
    - MoE architecture concept → definition-box + ```flow block showing routing
    - Expert routing / gating mechanism → definition-box
    - Switch Transformer (Fedus et al. 2022) → definition-box
    - Mixtral (Jiang et al. 2024) → definition-box
    - Quantization techniques → definition-box + example-box
    - Pruning and distillation → definition-box
    - Efficiency comparison table → note-box
    - LaTeX escapes in titles (e.g., `Experts \& Efficiency`) → remove backslashes
    - Dense code blocks → scale classes as needed
    - References → note-box with `data-title="Further reading"`
  - Teaser: "Ethics, bias, and safety — the responsible side of language models!"
  - No announcements for this lecture

  **Must NOT do**:
  - Leave LaTeX escape characters (`\&`, `\_`) in non-math text
  - Use column layouts
  - Leave old callout syntax

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Standard conversion with technical content
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Wave 2 quality check

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard

  **Source Content**:
  - `slides/week9/lecture25.md` — Full source (836 lines). Contains LaTeX escapes that need cleaning.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md`

  **Acceptance Criteria**:

  ```bash
  cd slides/week9 && ../template_deck/compile.sh lecture25.md
  # Assert: Exit code 0, lecture25.html + lecture25.pdf exist

  grep -c 'paginate: true' lecture25.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture25.md    # Assert: 0
  grep -c 'class="columns"' lecture25.md         # Assert: 0
  grep -c 'class="callout' lecture25.md          # Assert: 0
  grep -c 'emoji-figure' lecture25.md            # Assert: >= 1
  grep -c 'data-title=' lecture25.md             # Assert: >= 5
  grep '\\&' lecture25.md                        # Assert: no matches (LaTeX escapes removed)
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 9. Convert L26: Ethics, bias, and safety

  **What to do**:
  - Read `slides/week9/lecture26.md` (921 lines) completely
  - Apply full Conversion Checklist
  - Specific content notes:
    - Types of bias (data, algorithmic, societal) → definition-box for each
    - Bias examples → warning-box with concrete examples
    - RLHF alignment → definition-box + ```flow block
    - Jailbreaking and adversarial attacks → warning-box
    - Privacy concerns → warning-box
    - Regulation landscape (EU AI Act, etc.) → note-box
    - "Your Role as AI Developers" slide → remove emoji from title, convert to tip-box
    - Ethical frameworks → note-box
    - Discussion questions → tip-box
    - "Stochastic Parrots" (Bender et al. 2021) → definition-box or note-box
    - References → note-box
  - Teaser: "Final project presentations — get ready to show off your work!"
  - No announcements for this lecture

  **Must NOT do**:
  - Leave ZWJ emoji sequences in slide titles
  - Use column layouts
  - Leave old callout syntax
  - Be preachy — maintain academic, balanced tone

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Content-heavy conversion with sensitive material requiring careful tone
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Wave 2 quality check

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard

  **Source Content**:
  - `slides/week9/lecture26.md` — Full source (921 lines). Contains ZWJ emoji in at least one title.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md`

  **Acceptance Criteria**:

  ```bash
  cd slides/week9 && ../template_deck/compile.sh lecture26.md
  # Assert: Exit code 0, lecture26.html + lecture26.pdf exist

  grep -c 'paginate: true' lecture26.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture26.md    # Assert: 0
  grep -c 'class="columns"' lecture26.md         # Assert: 0
  grep -c 'class="callout' lecture26.md          # Assert: 0
  grep -c 'emoji-figure' lecture26.md            # Assert: >= 1
  grep -c 'data-title=' lecture26.md             # Assert: >= 5
  ```

  **Commit**: NO (groups with final commit)

---

### WAVE 4: Finalization (sequential, after Wave 3)

- [ ] 10. Convert L27: Final project work session

  **What to do**:
  - Read `slides/week10/lecture27.md` (432 lines) completely
  - Apply full Conversion Checklist
  - Specific content notes:
    - SHORTEST lecture — primarily logistical, not content-heavy
    - "Where We Are" → note-box with schedule
    - Final project requirements → note-box or definition-box
    - Presentation format → note-box
    - Video component guidelines → note-box
    - Grading rubric / checklist → important-box
    - Common pitfalls → warning-box
    - Tips for success → tip-box
    - Submission checklist → important-box
    - "You've Got This!" motivational ending → merge into Questions? slide teaser or tip-box
    - Remove random emoji decorations from motivational text
  - **Announcement slide** (important-box):
    - Final Project Due: March 9, 11:59 PM EST
    - Link to: https://contextlab.github.io/llm-course/assignments/final-project/
  - Teaser (reflective closing): "That's a wrap! From ELIZA to autonomous agents — what a journey. Good luck on your final projects!"

  **Must NOT do**:
  - Leave emojis in slide titles or body text as decoration
  - Keep "You've Got This!" as a standalone slide with emoji decorations
  - Leave old callout syntax

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Short, straightforward conversion
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (first task in Wave 4)
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Wave 3 quality check

  **References**:

  **Pattern References**:
  - `slides/week5/lecture17.md` — Gold standard

  **Source Content**:
  - `slides/week10/lecture27.md` — Full source (432 lines). Short and logistical.

  **Style References**:
  - `slides/template_deck/STYLE_GUIDE.md`

  **Acceptance Criteria**:

  ```bash
  cd slides/week10 && ../template_deck/compile.sh lecture27.md
  # Assert: Exit code 0, lecture27.html + lecture27.pdf exist

  grep -c 'paginate: true' lecture27.md          # Assert: 0
  grep -c '<!-- _class: lead -->' lecture27.md    # Assert: 0
  grep -c 'class="columns"' lecture27.md         # Assert: 0
  grep -c 'class="callout' lecture27.md          # Assert: 0
  grep -c 'emoji-figure' lecture27.md            # Assert: >= 1
  grep -c 'data-title=' lecture27.md             # Assert: >= 3
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 11. Compile all 10 lectures (HTML + PDF)

  **What to do**:
  - Compile each lecture from its respective week directory
  - Verify both HTML and PDF output exist for all 10

  ```bash
  cd slides/week6 && ../template_deck/compile.sh lecture18.md && ../template_deck/compile.sh lecture19.md && ../template_deck/compile.sh lecture20.md
  cd slides/week7 && ../template_deck/compile.sh lecture21.md && ../template_deck/compile.sh lecture22.md && ../template_deck/compile.sh lecture23.md
  cd slides/week9 && ../template_deck/compile.sh lecture24.md && ../template_deck/compile.sh lecture25.md && ../template_deck/compile.sh lecture26.md
  cd slides/week10 && ../template_deck/compile.sh lecture27.md
  ```

  - Verify all outputs exist:
  ```bash
  ls -la slides/week6/lecture{18,19,20}.{html,pdf}
  ls -la slides/week7/lecture{21,22,23}.{html,pdf}
  ls -la slides/week9/lecture{24,25,26}.{html,pdf}
  ls -la slides/week10/lecture27.{html,pdf}
  ```

  **Must NOT do**:
  - Skip any lecture
  - Ignore compile errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple sequential shell commands
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 1-10 all complete

  **References**:
  - `slides/template_deck/compile.sh` — Compilation script
  - `slides/template_deck/AGENTS.md` — Compilation pipeline docs

  **Acceptance Criteria**:

  ```bash
  # All 20 output files exist (10 HTML + 10 PDF):
  for f in slides/week6/lecture{18,19,20} slides/week7/lecture{21,22,23} slides/week9/lecture{24,25,26} slides/week10/lecture27; do
    test -f "${f}.html" && test -f "${f}.pdf" && echo "OK: $f" || echo "MISSING: $f"
  done
  # Assert: All 10 print "OK"
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 12. Visual review of all compiled lectures

  **What to do**:
  - Open each of the 10 compiled HTML files in Playwright browser
  - Navigate through every slide checking for:
    - Layout overflow / text clipping
    - Correct box styling (colored borders, icons)
    - No broken emoji rendering in Questions? slide
    - Proper flow diagram rendering
    - Code blocks properly contained in example-boxes
    - Scale classes applied where needed (no overflow on dense slides)
    - Sentence case in all titles
    - No leftover old-style formatting
  - Save screenshots of any issues found to `.sisyphus/evidence/`
  - Report issues per lecture so they can be fixed before commit
  - Fix any issues found

  **Must NOT do**:
  - Skip any lecture
  - Approve slides with visible overflow
  - Ignore broken flow diagrams

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Requires visual inspection of rendered HTML slides
  - **Skills**: `['playwright']`
    - `playwright`: Required for browser-based visual review of compiled HTML slides

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: Task 13
  - **Blocked By**: Task 11

  **References**:
  - Compiled HTML files in `slides/week{6,7,9,10}/`
  - `slides/template_deck/STYLE_GUIDE.md` — What correct styling looks like

  **Acceptance Criteria**:

  ```bash
  # Screenshots saved for any issues:
  ls .sisyphus/evidence/
  # Assert: Either empty (no issues) or contains documented issues that were fixed

  # All lectures compile cleanly after fixes:
  # (re-run Task 11 compile commands if fixes were made)
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 13. Git commit all changes

  **What to do**:
  - Stage all changed/new files:
    - `slides/week6/lecture{18,19,20}.{md,html,pdf}`
    - `slides/week7/lecture{21,22,23}.{md,html,pdf}`
    - `slides/week9/lecture{24,25,26}.{md,html,pdf}`
    - `slides/week10/lecture27.{md,html,pdf}`
    - Any animation GIFs created
  - Create commit with descriptive message

  **Must NOT do**:
  - Commit `.sisyphus/` files
  - Commit without verifying all lectures compile
  - Force push

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple git operations
  - **Skills**: `['git-master']`
    - `git-master`: Proper commit message formatting and git operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Task 12

  **References**:
  - Git log for recent commit message style

  **Acceptance Criteria**:

  ```bash
  git status
  # Assert: Working tree clean after commit

  git log -1 --oneline
  # Assert: Shows new commit with descriptive message
  ```

  **Commit**: YES
  - Message: `feat(slides): convert lectures 18-27 to box-first Marp style`
  - Body should list: which lectures were converted, note L24 rewrite
  - Files: all `.md`, `.html`, `.pdf` in weeks 6, 7, 9, 10 + any animation files

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 13 (final) | `feat(slides): convert lectures 18-27 to box-first Marp style` | `slides/week{6,7,9,10}/lecture*.{md,html,pdf}` | All 10 compile, visual review passed |

---

## Success Criteria

### Verification Commands
```bash
# All lectures compile:
for w in 6 7 9 10; do
  cd slides/week${w}
  for f in lecture*.md; do
    ../template_deck/compile.sh "$f" || echo "FAIL: $f"
  done
  cd ../..
done

# No old patterns remain:
grep -r 'paginate: true' slides/week{6,7,9,10}/lecture*.md      # Expected: no output
grep -r '<!-- _class: lead -->' slides/week{6,7,9,10}/lecture*.md # Expected: no output
grep -r 'class="columns"' slides/week{6,7,9,10}/lecture*.md      # Expected: no output
grep -r 'class="callout' slides/week{6,7,9,10}/lecture*.md       # Expected: no output

# New patterns present in all:
for f in slides/week{6,7,9,10}/lecture*.md; do
  echo "--- $f ---"
  grep -c 'emoji-figure' "$f"    # >= 1
  grep -c 'data-title=' "$f"     # >= 3
done

# L24 has agents content:
grep -ci 'retrieval augmented' slides/week9/lecture24.md  # 0
grep -ci 'agent' slides/week9/lecture24.md                # >= 5
```

### Final Checklist
- [ ] All 10 `.md` files use exact gold standard frontmatter
- [ ] All 10 lectures have Learning Objectives slide
- [ ] All 10 lectures end with standardized Questions? slide
- [ ] All content in semantic boxes (no bare content)
- [ ] All code in example-boxes
- [ ] All slide titles in sentence case, no emojis
- [ ] Zero old-style patterns (columns, callouts, lead class)
- [ ] L24 is entirely about agents/tool use (no RAG content)
- [ ] L21 has announcements (A4 due, final project, A5 optional)
- [ ] L23 has announcement (Week 8 off)
- [ ] L27 has announcement (final project due) + reflective closing teaser
- [ ] All 10 compile to HTML + PDF without errors
- [ ] Visual review confirms no overflow or rendering issues
- [ ] Git commit created with all changes
