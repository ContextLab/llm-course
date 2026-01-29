# Lecture 13 Dimensionality Reduction Update

## TL;DR

> **Quick Summary**: Update Lecture 13 with new content on matrix factorization and manifold learning, fix figure generation and scaling, add hypertools slides, fix README links, and compile/verify.
> 
> **Deliverables**:
> - 5 regenerated PNG figures (3 individual + 2 grids) with transparent backgrounds
> - Updated `lecture13.md` with 5 new slides
> - Updated `slides/README.md` with corrected links and descriptions
> - Compiled `lecture13.html` and `lecture13.pdf`
> - Converted `xhour_dimred_demo.html` notebook
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (figures) → Task 2 (slides) → Task 5 (compile) → Task 6 (verify)

---

## Context

### Original Request
Update Lecture 13 (Dimensionality Reduction) for PSYC 51.17 with:
1. Fix plots (transparent backgrounds, real UMAP)
2. Fix image scaling on slides
3. Update README.md Week 4 description + fix broken notebook link
4. Add matrix factorization content and grid figure
5. Add manifold learning slide and grid figure
6. Add Geoff Hinton quote
7. Add two hypertools slides
8. Verify all links/references
9. Recompile and verify rendering
10. Convert notebook to HTML

### Interview Summary
**Key Findings**:
- `generate_dimred_figures.py` already has transparent backgrounds (`transparent=True`) and real UMAP code
- Grid figure code exists but figures aren't generated - script needs to be run
- README.md links to `.html` but only `.ipynb` exists
- Hypertools GIF URL verified: `https://github.com/ContextLab/hypertools/raw/master/images/hypertools.gif`
- Hypertools tutorials verified at `https://hypertools.readthedocs.io/en/latest/tutorials.html`

### Metis Review
**Identified Gaps** (addressed):
- UMAP fallback: Verified script uses real UMAP with no PCA fallback (lines 214-235)
- Slide ordering: Specified exact positions for all new slides
- Link verification: Scope is lecture13.md + README.md links
- GIF in Marp: Known to work with HTML output (Marp supports standard img tags)

---

## Work Objectives

### Core Objective
Enhance Lecture 13 with broader dimensionality reduction context (matrix factorization, manifold learning, hypertools) while fixing existing issues with figures and links.

### Concrete Deliverables
1. `slides/week4/figures/pca_visualization.png` - regenerated with transparent bg
2. `slides/week4/figures/tsne_visualization.png` - regenerated with transparent bg
3. `slides/week4/figures/umap_visualization.png` - regenerated with real UMAP
4. `slides/week4/figures/matrix_factorization_grid.png` - NEW
5. `slides/week4/figures/manifold_learning_grid.png` - NEW
6. `slides/week4/lecture13.md` - updated with 5 new slides
7. `slides/README.md` - updated Week 4 description and fixed link
8. `slides/week4/lecture13.html` - compiled
9. `slides/week4/lecture13.pdf` - compiled
10. `slides/week4/xhour_dimred_demo.html` - converted from notebook

### Definition of Done
- [ ] All 5 figures exist and have transparent backgrounds (verified with `file` command)
- [ ] UMAP figure shows distinct clusters (not PCA-like overlap)
- [ ] All slides render without image cutoff
- [ ] Hinton quote appears on slide 3 (after learning objectives)
- [ ] Matrix factorization slide includes Y ≈ WF equation
- [ ] Hypertools GIF animates in HTML view
- [ ] README.md links resolve without 404
- [ ] Notebook HTML renders correctly

### Must Have
- Transparent backgrounds on all figures
- Real UMAP (not PCA fallback)
- Matrix factorization equation: Y ≈ WF
- Geoff Hinton quote verbatim
- Hypertools GIF animation working
- All new slides follow cdl-theme styling

### Must NOT Have (Guardrails)
- NO PCA fallback in UMAP code
- NO changes to other lectures
- NO modifications to cdl-theme CSS
- NO changes to compile.sh or autoscale.js
- NO new dependencies beyond what's already in environment
- NO oversized images (keep width ≤ 800px for safety margin)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (slides project - visual verification only)
- **User wants tests**: NO - Manual visual verification
- **Framework**: N/A - Use Playwright browser for visual checks

### Manual QA Approach
Each task includes visual verification using Playwright browser automation or command-line checks.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Generate figures with Python script
└── Task 3: Update README.md

Wave 2 (After Wave 1):
├── Task 2: Update lecture13.md (needs figures from Task 1)
└── Task 4: Convert notebook to HTML

Wave 3 (After Wave 2):
├── Task 5: Compile slides
└── Task 6: Verify all links

Wave 4 (After Wave 3):
└── Task 7: Visual verification with Playwright

Critical Path: Task 1 → Task 2 → Task 5 → Task 7
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | 3 |
| 2 | 1 | 5 | 4 |
| 3 | None | 6 | 1 |
| 4 | None | 7 | 2 |
| 5 | 2 | 7 | 6 |
| 6 | 3, 5 | 7 | 5 |
| 7 | 5, 6, 4 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 3 | `delegate_task(category="quick", load_skills=['python-programmer'])` × 2 in parallel |
| 2 | 2, 4 | `delegate_task(category="unspecified-low")` × 2 in parallel |
| 3 | 5, 6 | `delegate_task(category="quick")` × 2 in parallel |
| 4 | 7 | `delegate_task(category="visual-engineering", load_skills=['playwright'])` |

---

## TODOs

- [ ] 1. Generate All Dimensionality Reduction Figures

  **What to do**:
  - Run `python generate_dimred_figures.py` in `slides/week4/`
  - Verify 5 PNG files are created in `figures/` directory
  - Check UMAP output shows distinct clusters (not PCA-like overlap)
  - Verify transparent backgrounds by checking PNG alpha channel

  **Must NOT do**:
  - Do NOT modify the Python script unless UMAP actually fails
  - Do NOT use PCA as fallback for UMAP under any circumstances
  - Do NOT change figure dimensions in the script

  **Recommended Agent Profile**:
  - **Category**: `quick` 
    - Reason: Single script execution with verification, no complex logic
  - **Skills**: [`python-programmer`]
    - `python-programmer`: Needed to understand script output and troubleshoot if needed
  - **Skills Evaluated but Omitted**:
    - `data-scientist`: Not needed - just running existing script, not analyzing data

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 3)
  - **Blocks**: Task 2 (needs figures before adding to slides)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `slides/week4/generate_dimred_figures.py:123-169` - `create_scatter_plot()` function showing transparent background handling
  - `slides/week4/generate_dimred_figures.py:214-235` - `apply_umap()` function with real UMAP implementation

  **Documentation References**:
  - Script docstring (lines 1-17) documents expected outputs

  **External References**:
  - umap-learn docs: https://umap-learn.readthedocs.io/

  **WHY Each Reference Matters**:
  - `create_scatter_plot()`: Executor needs to verify `transparent=True` is being passed correctly
  - `apply_umap()`: Executor must confirm real UMAP is used, check for any try/except fallback

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Command: `cd slides/week4 && python generate_dimred_figures.py`
  - [ ] Expected output contains: "All figures generated successfully!"
  - [ ] Verify files exist: `ls figures/*.png` shows 5 files:
    - `pca_visualization.png`
    - `tsne_visualization.png`
    - `umap_visualization.png`
    - `matrix_factorization_grid.png`
    - `manifold_learning_grid.png`
  - [ ] Verify UMAP quality: Open `umap_visualization.png` - clusters should be distinct (not overlapping like PCA)
  - [ ] Verify transparency: `file figures/pca_visualization.png` should show PNG with alpha channel

  **Commit**: YES
  - Message: `feat(slides): regenerate dimred figures with transparent backgrounds`
  - Files: `slides/week4/figures/*.png`
  - Pre-commit: N/A (generated files)

---

- [ ] 2. Update lecture13.md with New Slides and Content

  **What to do**:
  - Add Geoff Hinton quote slide after "Learning objectives" (becomes slide 3)
  - Update PCA slide to mention "matrix factorization" family
  - Add Y ≈ WF equation with dimensions explanation
  - Add matrix factorization grid slide after PCA visualization
  - Add manifold learning slide after UMAP visualization
  - Add two hypertools slides before Summary
  - Reduce all image widths from 900px to 800px
  - Ensure all new slides use cdl-theme callout boxes

  **New slide order (after changes)**:
  1. Title slide
  2. Learning objectives
  3. **NEW: Hinton quote** 
  4. Why dimensionality reduction?
  5. PCA description (updated with matrix factorization mention)
  6. PCA visualization
  7. **NEW: Matrix Factorization Methods** (grid figure)
  8. t-SNE description
  9. t-SNE visualization
  10. UMAP description
  11. UMAP visualization
  12. **NEW: Manifold Learning Methods** (grid figure)
  13. PCA vs t-SNE vs UMAP comparison table
  14. Visualization best practices
  15. **NEW: Hypertools overview** (with GIF)
  16. **NEW: Hypertools code example**
  17. Summary (updated with hypertools reference)
  18. Questions

  **Must NOT do**:
  - Do NOT change the Marp frontmatter
  - Do NOT modify the cdl-theme CSS
  - Do NOT remove existing content (only add/update)
  - Do NOT use image widths > 800px

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Content editing requiring attention to markdown syntax and slide structure
  - **Skills**: []
    - No specialized skills needed - standard markdown editing
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed - using existing theme, not designing new UI

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 1)
  - **Blocks**: Task 5 (compilation needs updated markdown)
  - **Blocked By**: Task 1 (needs grid figures to exist)

  **References**:

  **Pattern References**:
  - `slides/week4/lecture13.md:20-28` - Learning objectives box pattern (note-box with data-title)
  - `slides/week4/lecture13.md:61-82` - PCA content slide pattern (definition-box, note-box, tip-box)
  - `slides/week4/lecture13.md:88` - Image reference pattern: `![width:900px](figures/filename.png)`
  - `slides/week4/lecture13.md:100-104` - Citation pattern with hyperlink

  **Content References**:
  - Hinton quote: "To deal with hyper-planes in a 14 dimensional space, visualize a 3D space and say 'fourteen' very loudly. Everyone does it." - Geoff Hinton
  - Hypertools GIF: `https://github.com/ContextLab/hypertools/raw/master/images/hypertools.gif`
  - Hypertools docs: `https://hypertools.readthedocs.io/`

  **Theme References**:
  - `slides/template_deck/STYLE_GUIDE.md` - Callout box syntax documentation

  **WHY Each Reference Matters**:
  - Learning objectives box: Template for Hinton quote slide styling
  - PCA content: Shows how to structure technical content with multiple callout boxes
  - Image reference pattern: Critical for correct figure insertion
  - Citation pattern: For hypertools reference formatting

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Count slides: `grep -c "^---$" slides/week4/lecture13.md` should return 17 (18 slides = 17 separators)
  - [ ] Verify Hinton quote: `grep -i "fourteen" slides/week4/lecture13.md` returns the quote
  - [ ] Verify Y ≈ WF equation: `grep "Y ≈ WF" slides/week4/lecture13.md` returns match
  - [ ] Verify matrix factorization grid: `grep "matrix_factorization_grid.png" slides/week4/lecture13.md` returns match
  - [ ] Verify manifold learning grid: `grep "manifold_learning_grid.png" slides/week4/lecture13.md` returns match
  - [ ] Verify hypertools GIF: `grep "hypertools.gif" slides/week4/lecture13.md` returns match
  - [ ] Verify image widths: `grep -c "width:900px" slides/week4/lecture13.md` returns 0 (all changed to 800px)
  - [ ] Verify image widths: `grep "width:800px" slides/week4/lecture13.md` returns matches

  **Commit**: YES
  - Message: `feat(slides): add matrix factorization, manifold learning, and hypertools content to lecture 13`
  - Files: `slides/week4/lecture13.md`
  - Pre-commit: `grep -c "^---$" slides/week4/lecture13.md` (verify slide count)

---

- [ ] 3. Update README.md with Corrected Links and Description

  **What to do**:
  - Update Week 4 Thursday X-hour description to include "t-SNE" and "matrix factorization"
  - Change notebook link from `.html` to `.ipynb` (since HTML doesn't exist yet)
  - After Task 4 completes, link can point to `.html`
  - Update the X-Hour Schedule section similarly

  **Changes to make**:
  1. Line 154: "PCA and UMAP" → "PCA, t-SNE, UMAP, and matrix factorization"
  2. Line 156: `xhour_dimred_demo.html` → `xhour_dimred_demo.ipynb` (or .html after conversion)
  3. Line 341-345: Update X-Hour Schedule entry similarly

  **Must NOT do**:
  - Do NOT change links to other weeks
  - Do NOT modify the demo list section
  - Do NOT change assignment links

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple text replacement, 3 lines to change
  - **Skills**: []
    - No specialized skills needed
  - **Skills Evaluated but Omitted**:
    - All skills omitted - trivial text edit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 6 (link verification needs updated README)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `slides/README.md:153-158` - Week 4 Thursday X-hour entry
  - `slides/README.md:341-345` - X-Hour Schedule Week 4 entry

  **WHY Each Reference Matters**:
  - These are the exact lines that need editing

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Verify t-SNE mentioned: `grep -i "t-SNE" slides/README.md | grep -i "Week 4\|X-hour"` returns matches
  - [ ] Verify matrix factorization mentioned: `grep -i "matrix factorization" slides/README.md` returns match
  - [ ] Verify notebook link format: `grep "xhour_dimred_demo" slides/README.md` shows correct extension

  **Commit**: YES
  - Message: `docs(slides): update README week 4 description and fix notebook link`
  - Files: `slides/README.md`
  - Pre-commit: N/A

---

- [ ] 4. Convert Jupyter Notebook to HTML

  **What to do**:
  - Run `jupyter nbconvert --to html xhour_dimred_demo.ipynb`
  - Verify HTML file is created
  - Check HTML renders correctly (basic check)

  **Must NOT do**:
  - Do NOT modify the notebook content
  - Do NOT apply custom themes (basic nbconvert is fine)
  - Do NOT delete the .ipynb file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single command execution
  - **Skills**: []
    - No specialized skills needed
  - **Skills Evaluated but Omitted**:
    - `python-programmer`: Not needed - just running nbconvert

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 7 (visual verification)
  - **Blocked By**: None (but logically runs with Wave 2 to keep related work together)

  **References**:

  **Pattern References**:
  - `slides/week1/xhour_eliza_demo.html` - Reference for what converted notebook should look like (if exists)
  - `slides/week2/xhour_classification_demo.html` - Another reference

  **External References**:
  - nbconvert docs: https://nbconvert.readthedocs.io/

  **WHY Each Reference Matters**:
  - Other week's notebooks show the expected output format

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Command: `cd slides/week4 && jupyter nbconvert --to html xhour_dimred_demo.ipynb`
  - [ ] Verify file exists: `ls slides/week4/xhour_dimred_demo.html`
  - [ ] Verify non-empty: `wc -c slides/week4/xhour_dimred_demo.html` shows > 10000 bytes

  **Commit**: YES (group with Task 3 if convenient)
  - Message: `docs(slides): convert dimred notebook to HTML for GitHub Pages`
  - Files: `slides/week4/xhour_dimred_demo.html`
  - Pre-commit: N/A

---

- [ ] 5. Compile Slides to HTML and PDF

  **What to do**:
  - Run compile script from week4 directory
  - Generate both HTML and PDF outputs
  - Verify compilation succeeds without errors

  **Must NOT do**:
  - Do NOT modify compile.sh
  - Do NOT modify autoscale.js
  - Do NOT skip PDF generation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard compilation command
  - **Skills**: []
    - No specialized skills needed
  - **Skills Evaluated but Omitted**:
    - All omitted - just running existing script

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 6)
  - **Blocks**: Task 7 (visual verification)
  - **Blocked By**: Task 2 (needs updated markdown)

  **References**:

  **Pattern References**:
  - `slides/AGENTS.md` - Compilation instructions: `../template_deck/compile.sh lecture.md`

  **WHY Each Reference Matters**:
  - Shows exact compilation command syntax

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Command: `cd slides/week4 && ../template_deck/compile.sh lecture13.md`
  - [ ] Exit code: 0 (no errors)
  - [ ] Command: `cd slides/week4 && ../template_deck/compile.sh lecture13.md -f pdf`
  - [ ] Verify HTML exists: `ls slides/week4/lecture13.html`
  - [ ] Verify PDF exists: `ls slides/week4/lecture13.pdf`
  - [ ] Verify HTML is recent: `stat -f %Sm slides/week4/lecture13.html` shows current time

  **Commit**: YES
  - Message: `build(slides): recompile lecture 13 with new content`
  - Files: `slides/week4/lecture13.html`, `slides/week4/lecture13.pdf`
  - Pre-commit: N/A

---

- [ ] 6. Verify All Links and References

  **What to do**:
  - Check all URLs in lecture13.md are accessible
  - Check all URLs in README.md Week 4 section are accessible
  - Verify paper citations have working DOIs/links

  **Links to verify**:
  - `https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf` (t-SNE paper)
  - `https://arxiv.org/abs/1802.03426` (UMAP paper)
  - `https://github.com/ContextLab/hypertools/raw/master/images/hypertools.gif`
  - `https://hypertools.readthedocs.io/en/latest/tutorials.html`
  - Notebook link in README

  **Must NOT do**:
  - Do NOT change links that are working
  - Do NOT add new links beyond what's specified

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple HTTP checks
  - **Skills**: [`playwright`]
    - `playwright`: Can verify links work and pages load
  - **Skills Evaluated but Omitted**:
    - None needed beyond playwright for web checks

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 5)
  - **Blocks**: Task 7 (final verification)
  - **Blocked By**: Task 3 (needs updated README links)

  **References**:

  **Pattern References**:
  - `slides/week4/lecture13.md:100-104` - Citation links in lecture
  - `slides/README.md:153-158` - Week 4 links

  **WHY Each Reference Matters**:
  - These are the lines containing URLs to verify

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using curl or playwright, verify each URL returns 200:
    - `curl -sI https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf | head -1` → 200
    - `curl -sI https://arxiv.org/abs/1802.03426 | head -1` → 200
    - `curl -sI https://hypertools.readthedocs.io/en/latest/tutorials.html | head -1` → 200
  - [ ] List all URLs and their status

  **Commit**: NO (verification only, no file changes)

---

- [ ] 7. Visual Verification with Playwright Browser

  **What to do**:
  - Open lecture13.html in browser
  - Navigate through all slides
  - Verify no images are cut off
  - Verify Hinton quote renders correctly
  - Verify matrix factorization equation displays
  - Verify hypertools GIF animates
  - Take screenshots as evidence

  **Must NOT do**:
  - Do NOT modify any files during verification
  - Do NOT skip any new slides

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual verification requires understanding of UI rendering
  - **Skills**: [`playwright`]
    - `playwright`: Required for browser automation and screenshots
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed - not designing, just verifying

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, sequential)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 4, 5, 6 (needs all outputs ready)

  **References**:

  **Pattern References**:
  - New slides to verify:
    - Slide 3: Hinton quote
    - Slide 7: Matrix factorization grid
    - Slide 12: Manifold learning grid
    - Slides 15-16: Hypertools

  **WHY Each Reference Matters**:
  - These are the specific slides that need visual verification

  **Acceptance Criteria**:

  **Using Playwright Browser Automation:**
  - [ ] Open: `file:///Users/jmanning/llm-course/slides/week4/lecture13.html`
  - [ ] Navigate to slide 3: Verify Hinton quote text is visible and styled correctly
  - [ ] Navigate to slide 7: Verify matrix factorization grid image displays fully (no cutoff)
  - [ ] Navigate to slide 12: Verify manifold learning grid image displays fully
  - [ ] Navigate to slide 15: Verify hypertools GIF is visible (may need to wait for animation)
  - [ ] Navigate to slide 16: Verify code example is formatted correctly
  - [ ] Screenshot each verified slide to `.sisyphus/evidence/lecture13-*.png`
  - [ ] Open notebook HTML and verify it renders

  **Evidence Required:**
  - [ ] Screenshot of Hinton quote slide
  - [ ] Screenshot of matrix factorization grid slide
  - [ ] Screenshot of manifold learning grid slide
  - [ ] Screenshot of hypertools slides
  - [ ] All screenshots saved to `.sisyphus/evidence/`

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(slides): regenerate dimred figures with transparent backgrounds` | `slides/week4/figures/*.png` | Check 5 files exist |
| 2 | `feat(slides): add matrix factorization, manifold learning, and hypertools content to lecture 13` | `slides/week4/lecture13.md` | Slide count = 17 separators |
| 3+4 | `docs(slides): update README and convert notebook to HTML` | `slides/README.md`, `slides/week4/xhour_dimred_demo.html` | Links work |
| 5 | `build(slides): recompile lecture 13 with new content` | `slides/week4/lecture13.html`, `slides/week4/lecture13.pdf` | Files recent |

---

## Success Criteria

### Verification Commands
```bash
# All 5 figures exist
ls slides/week4/figures/*.png | wc -l  # Expected: 5

# All images are 800px width in markdown
grep -c "width:800px" slides/week4/lecture13.md  # Expected: > 0
grep -c "width:900px" slides/week4/lecture13.md  # Expected: 0

# Slide count (18 slides = 17 separators)
grep -c "^---$" slides/week4/lecture13.md  # Expected: 17

# Notebook HTML exists
ls slides/week4/xhour_dimred_demo.html  # Should exist

# Compiled files are recent
stat -f %Sm slides/week4/lecture13.html  # Should show today's date
```

### Final Checklist
- [ ] All 5 figures generated with transparent backgrounds
- [ ] UMAP shows distinct clusters (not PCA-like)
- [ ] Hinton quote on slide 3
- [ ] Y ≈ WF equation present
- [ ] Matrix factorization methods listed: ICA, Factor Analysis, NMF, Dictionary Learning
- [ ] Manifold learning methods listed: MDS, Isomap, Spectral Embedding
- [ ] Hypertools GIF animates
- [ ] All images fit on slides without cutoff
- [ ] README.md links work
- [ ] Notebook HTML exists
- [ ] HTML and PDF compiled successfully
