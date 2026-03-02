# Session Notes: 2026-03-02 — Lecture 24 MoE Plan

## Completed This Session

### 1. Finished Lecture 24 Slide-by-Slide Revisions (from prior plan)
- **Slide 12 SVG fix** committed as `b6de13b`: Fixed reasoning-pipeline.svg RL reward loop arrow
  - Replaced dashed line + triangle marker with solid line + reusable `#rp-arrow` symbol
  - Used Python REPL to calculate precise rotated coordinates (no guessing)
  - Matched stroke-width (2px) to arrow shaft thickness (~2.06px)
- **All other slides (5-17)** were already done from prior commits
- **Notebook** (`thinking_demo.ipynb`) already updated to use DeepSeek-R1-Distill-Qwen-7B (no API key)
- **Visual verification**: Screenshots taken and verified for slides 5, 8, 12, 13, 16, 17, 18
- **Final slide count**: 18 slides total, compiles cleanly

### 2. Created MoE Addition Plan
- Plan saved at: `.omc/plans/moe-slides-plan.md`
- User approved with "Clear context first" option

## NEXT TASK: Execute MoE Plan

### What to do
Execute the plan at `.omc/plans/moe-slides-plan.md`. Summary:

1. **Create SVG**: `slides/week9/figs/moe-architecture.svg`
   - Horizontal flow: Input Token → Router (softmax) → fan-out to 8 expert boxes (2 active, 6 grayed) → weighted sum → output
   - Style: match existing SVGs (Avenir font, similar colors)
   - Include annotation: "Total: 46.7B params | Active: 12.9B (2 of 8 experts)"

2. **Insert new slide 16** in `slides/week9/lecture24.md` at ~line 369 (before current "The frontier landscape")
   - Title: "Mixture of Experts: doing more with less"
   - Definition box explaining router → top-k → weighted sum
   - Table: Mixtral/DeepSeek-V3/Llama4 Maverick params comparison
   - Scale class: `scale-70`

3. **Update slide 2** (learning objectives, ~line 19): Add 6th objective about MoE

4. **Update slide 17** (formerly 16, frontier landscape): Change "(sparse activation — see companion notebook)" to "(explained on the previous slide)"

5. **Add notebook Part 3**: "Mixture of Experts — sparse activation"
   - Insert between current Part 2 and Part 3 (renumber subsequent parts to 4, 5, 6)
   - Toy MoE layer in PyTorch (N=8 experts, top-2 routing)
   - Visualize expert selection, load balancing
   - Bar chart: total vs active params for real models

6. **Compile and verify**: Screenshot new slides, verify links

### Verified Facts (DO NOT RE-RESEARCH — these are confirmed)

**Papers (all arxiv IDs verified)**:
| Paper | arxiv ID |
|-------|----------|
| Shazeer et al. (2017) — Sparsely-Gated MoE | 1701.06538 |
| Fedus et al. (2022) — Switch Transformers | 2101.03961 |
| Jiang et al. (2024) — Mixtral | 2401.04088 |
| DeepSeek-AI (2024) — DeepSeek-V3 | 2412.19437 |

**Model specs (all verified)**:
| Model | Total | Active/token | Experts | Routing |
|-------|-------|-------------|---------|---------|
| Mixtral 8x7B | 46.7B | 12.9B | 8 | top-2 |
| DeepSeek-V3 | 671B | 37B | 256+1 shared | top-8+shared |
| Llama 4 Maverick | 400B | 17B | 128+1 shared | top-1+shared |

**DeepSeek-V3 training cost**: 2.788M H800 GPU hours, ~$5.6M (at $2/hr)

## Git State
- Last commit: `b6de13b` (Fix reasoning-pipeline SVG)
- Branch: `main`
- HTTP server: running on port 8767 from `/Users/jmanning/llm-course`
- Compile command: `cd slides/week9 && ../../slides/template_deck/compile.sh lecture24.md`

## Key Files
- `slides/week9/lecture24.md` — main lecture file (18 slides)
- `slides/week9/thinking_demo.ipynb` — companion notebook
- `slides/week9/figs/` — SVG diagrams directory
- `.omc/plans/moe-slides-plan.md` — detailed execution plan
