# Week 7 Diffusion Rewrite — Session Notes (2026-02-12)

## Status: TEXT-FIRST REWRITE COMPLETE (compilation done, not yet committed)
Original rewrite: Replaced Week 7 from "GPT/Decoder Models" to "Diffusion Models" (image-focused).
Commit: `721d55a` — pushed to main.

### Second rewrite (2026-02-15): Text-first lecture 21
- Rewrote lecture21.md from image-focused to **text-first diffusion**
- Removed all 10 GIF animation references
- Removed U-Net, DDIM, noise schedule, score matching, DDPM sampling slides
- Added: discrete diffusion (D3PM, MDLM, LLaDA, SEDD, Diffusion-LM)
- Added: BERT connection, iterative unmasking, practical advantages, limitations
- Added: inline SVG pixel-grid diagram showing image corruption (historical context slide)
- Kept: 3 slides of continuous diffusion foundation (for L22/L23 continuity)
- Updated: slides/README.md Week 7 Monday entry
- Updated: lecture22.md line 36 reference to Lecture 21
- Result: 27 slides, 0 GIF refs, consistent ~ notation, 7 papers cited
- Grading redistribution (from prior session): proposal removed, Implementation 45%, Results 25%

### Session 2026-02-15 continued:
- Compiled all 3 week 7 lectures (lecture21, lecture22, lecture23) to HTML + PDF
- Fixed lecture23 temp file collision during parallel compilation
- All 1500+ tests pass (exit 0)
- MDLM slide updated: added Rao-Blackwellization definition box (hyperlinked to Wikipedia), simplified text to avoid Monte Carlo/expectations terminology, changed Sahoo et al. box from definition-box to note-box, changed "Why MDLM works so well" from note-box to tip-box
- Recompiled lecture21 after MDLM slide edits
- Branch is 1 commit ahead of origin/main (not yet pushed)

## What was done
1. **Three new lectures** written from scratch:
   - lecture21.md (446 lines, ~27 slides): Diffusion architecture deep-dive
   - lecture22.md (357 lines, ~19 slides): Extensions (latent diffusion, CFG, DiT, flow matching)
   - lecture23.md (393 lines, ~20 slides): Applications & ethics (DALL-E 2, Sora, MDLM, deepfakes)

2. **10 Manim animation GIFs** rendered (diffusion_scenes.py, 1113 lines):
   - forwarddiffusion.gif, noiseschedule.gif, reverseprocess.gif, unetarchitecture.gif
   - timestepembedding.gif, trainingobjective.gif, simplifiedloss.gif
   - scorematching.gif, samplingprocess.gif, diffusionvstransformer.gif

3. **Companion notebook**: diffusion_demo.ipynb (5 parts: forward process, toy denoiser, HuggingFace Diffusers, guidance, discussion)

4. **Cross-reference updates**:
   - slides/week6/lecture20.md: "Up next" box updated
   - slides/week10/lecture27.md: Review table row updated
   - slides/README.md: Week 7 section replaced
   - admin/syllabus.md: Overview table + detailed schedule updated

5. **All 3 lectures compiled** to HTML + PDF
6. **All 1500+ existing tests pass**

## Files changed (288 files, 7343 insertions, 2192 deletions)

## Previous commits in this effort
1. Create diffusion_demo.ipynb companion notebook
2. Render Manim GIFs (requires manim venv)
3. Compile all 3 lectures with compile.sh
4. Verify via Playwright screenshots
5. Verify citation URLs
6. Run tests
7. Commit and push

### Session 2026-02-15 (continued, session 3):
- Updated lecture 21 with multiple user-requested edits:
  - MMLU/GSM8K hyperlinks verified and added (LLaDA slide)
  - RLHF/DPO/KV-caching "Definitions" box added (Current limitations slide)
  - Take-home messages slide populated (third bullet about multimodal models)
  - New "Controlling generation" slide added (prompting, infilling, prefix completion — 3 flow diagrams)
- Committed submodule changes (final-project-llm-course at f97babc)
- Cleaned up arrow SVG references (slides/week7/images/ deleted)
- All 1500+ tests pass

### Session 2026-02-16 (Lectures 22 & 23 style update):
- **Lecture 22** style updates:
  - Added "Remember..." definition-box for CLIP on text conditioning slide
  - Added "Remember..." definition-box for ODE/SDE on flow matching slide
  - Added FID Wikipedia hyperlink on DiT slide
  - Added He et al. (2016) hyperlink on adaLN-Zero slide
  - Updated Liu et al. rectified flow to note ICLR 2023
  - Added "Take-home messages" slide (Think about it... note-box)
  - All 6 references verified accurate (via librarian agent)
  - Fixed overflow: removed VAE/U-Net Remember box from pixel problem slide (content already explained on next slide), split flow matching into 2 slides (definition + comparison table), added scale classes
- **Lecture 23** style updates + reference fixes:
  - Fixed Sahoo et al. venue: "arXiv" → "NeurIPS 2024"
  - Fixed survey citation: "Fei et al." → "Yang et al. (2024, ACM Computing Surveys)"
  - Added deepfake stat citations (Sensity AI 2019, Sumsub 2023)
  - Fixed Thomson Reuters v. Ross: "Settled 2024" → "Ruled 2025"
  - Added "Remember..." definition-box for CLIP + T5 on text-to-image slide
  - Added mel-spectrogram Wikipedia link and vocoder inline definition on audio slide
  - Added Stable Diffusion hyperlink to Rombach et al.
  - Added C2PA and LAION-5B hyperlinks
  - Added "Take-home messages" slide
- Both lectures recompiled to HTML + PDF
- Visual verification via Playwright: all key slides render without overflow
- Screenshots cleaned up, HTTP server killed

## Key Constraints
- Assignment announcements ONLY in lecture21 (not 22/23)
- Companion notebook referenced ONLY in lecture23
- Animation GIFs ONLY in lecture21
- gpt_from_scratch_demo.ipynb stays as-is (Assignment 5 ref)
- Sentence case capitalization
- Use 'C' for embedding dimension (consistency with lecture 15)
