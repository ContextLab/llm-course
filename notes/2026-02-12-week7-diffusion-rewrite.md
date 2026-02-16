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

## Key Constraints
- Assignment announcements ONLY in lecture21 (not 22/23)
- Companion notebook referenced ONLY in lecture23
- Animation GIFs ONLY in lecture21
- gpt_from_scratch_demo.ipynb stays as-is (Assignment 5 ref)
- Sentence case capitalization
- Use 'C' for embedding dimension (consistency with lecture 15)
