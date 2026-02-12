# Week 7 Diffusion Rewrite — Session Notes (2026-02-12)

## Status: COMPLETE
Replaced Week 7 from "GPT/Decoder Models" to "Diffusion Models".
Commit: `721d55a` — pushed to main.

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
