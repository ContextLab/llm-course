# Draft: Lecture Conversion (Weeks 6, 7, 9, 10)

## Requirements (confirmed)
- Convert 10 lectures (L18-L27) from old Marp style to "box-first" gold standard matching L17
- Old style uses: `paginate: true`, `header:`, `footer:`, `<!-- _class: lead -->`, `<div class="columns">`, `<div class="callout info/tip/warning">`, emojis in titles, Title Case
- New style uses: exact frontmatter (no paginate/header/footer), box divs (definition-box, note-box, tip-box, example-box, warning-box, important-box), sentence case, no emojis in titles, no multi-column layouts
- Every lecture: title slide + learning objectives + ... content ... + Questions? slide (exact format)
- L24 is SPECIAL: currently has RAG content but should be "Agents and Tool Use" — needs NEW CONTENT, not just restyling
- Batch in waves of 3-4 for quality verification between waves
- Final step: compile all + commit

## Technical Decisions
- Compile command: `../template_deck/compile.sh lectureN.md` from week directory
- Output format: both HTML and PDF (default)
- No test infrastructure needed — verification is visual (compile success + slide review)

## Lecture Inventory

| Lecture | File | Lines | Week | Topic | Special Notes |
|---------|------|-------|------|-------|---------------|
| L18 | slides/week6/lecture18.md | 729 | 6 | BERT Deep Dive | Standard conversion |
| L19 | slides/week6/lecture19.md | 699 | 6 | BERT Variants | Standard conversion |
| L20 | slides/week6/lecture20.md | 815 | 6 | Applications of Encoder Models | Standard conversion |
| L21 | slides/week7/lecture21.md | 776 | 7 | GPT Architecture | Standard conversion |
| L22 | slides/week7/lecture22.md | 954 | 7 | Scaling Up to GPT-3+ | Standard conversion |
| L23 | slides/week7/lecture23.md | 996 | 7 | Implementing GPT from Scratch | Heavy code, all in example-boxes |
| L24 | slides/week9/lecture24.md | 903 | 9 | Agents and Tool Use (currently RAG!) | CONTENT REWRITE needed |
| L25 | slides/week9/lecture25.md | 836 | 9 | MoE & Efficiency | Standard conversion |
| L26 | slides/week9/lecture26.md | 921 | 9 | Ethics, Bias, Safety | Standard conversion |
| L27 | slides/week10/lecture27.md | 432 | 10 | Final Project Work Session | Short, simpler |

## "Up next..." Teasers (confirmed from course schedule)

| Lecture | Teaser for "Up next..." |
|---------|------------------------|
| L18 | "BERT variants — RoBERTa, DistilBERT, ALBERT, and how to make BERT better!" |
| L19 | "Applications of encoder models — real-world NLP with BERT and friends!" |
| L20 | "GPT architecture — autoregressive generation and the decoder-only transformer!" |
| L21 | "Scaling up — from GPT-2 to GPT-3, scaling laws, and the rise of ChatGPT!" |
| L22 | "Implementing GPT from scratch — building a language model step by step!" |
| L23 | "Week 8 is off — use it to work on your final project! See you in Week 9." |
| L24 | "Mixture of Experts and efficiency — how to make giant models practical!" |
| L25 | "Ethics, bias, and safety — the responsible side of language models!" |
| L26 | "Final project presentations — get ready to show off your work!" |
| L27 | N/A (last lecture — teaser: "Good luck with your presentations!") |

## Wave Structure (user preference: batches of 3-4)
- Wave 1: L18, L19, L20 (Week 6 — all BERT, straightforward conversions)
- Wave 2: L21, L22, L23 (Week 7 — GPT, L23 is code-heavy)
- Wave 3: L24, L25, L26 (Week 9 — L24 needs new content)
- Wave 4: L27 + compile all + commit (Week 10 + finalization)

## Final Decisions (from user answers)

### L24 Content Strategy: WRITE FROM SCRATCH
- Create entirely new content on agents/tool use
- Topics: function calling, ReAct framework (Yao et al. 2023), Toolformer (Schick et al. 2023), autonomous agents
- Discard existing RAG content (redundant with L17)

### L27 Teaser: REFLECTIVE CLOSING
- "That's a wrap! From ELIZA to autonomous agents — what a journey. Good luck on your final projects!"

### Announcements: INCLUDE WHERE APPLICABLE
- L21: Assignment 4 Due (Feb 16), Final Project Released (Due Mar 9), Assignment 5 Available (Optional/Extra Credit)
- L23: Week 8 off (no classes Feb 23-27)
- L27: Final Project Due (Mar 9, 11:59 PM EST)

### Manim Animations
- Use same approach as L15: generate GIF with manim, process with `gifsicle --no-loopcount`, embed as `![height:500](animations/gifs/filename.gif)`
- Infrastructure exists in `slides/week5/animations/`
- Use for complex equation visualizations where appropriate

## Open Questions
- None remaining — all decisions confirmed

## Scope Boundaries
- INCLUDE: Convert all 10 lectures to box-first style, compile, commit
- EXCLUDE: Modifying any already-converted lectures (L1-L17), slides/README.md updates, CI changes
