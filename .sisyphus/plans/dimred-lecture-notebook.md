# Dimensionality Reduction Lecture & Notebook

## TL;DR

> **Quick Summary**: Shorten lecture 13 from 22 to ~13-15 slides with visualization figures, create a companion X-hour notebook demonstrating dim reduction + clustering + BERTopic visualization, and update README with notebook link.
> 
> **Deliverables**:
> - Shortened `lecture13.md` (~13-15 slides with visualization figures)
> - New `generate_dimred_figures.py` script (creates PCA/t-SNE/UMAP visualizations)
> - New `xhour_dimred_demo.ipynb` notebook (Colab-ready)
> - Updated `README.md` with notebook link
> - Compiled `lecture13.html` and `lecture13.pdf`
> - Visual verification evidence (screenshots of plots, BERTopic labels)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 3 → Task 4 → Task 6 → Task 7

---

## Context

### Original Request
User wants to:
1. Shorten lecture 13 from 22 slides to ~10-12 slides (later revised to ~13-15 with visualizations)
2. Create a companion Colab notebook with IncrementalPCA, t-SNE, UMAP, HDBSCAN, BERTopic, and datamapplot
3. Link the notebook in the course README
4. Manually verify BERTopic labels are high quality and plots render correctly

### Interview Summary
**Key Discussions**:
- **PCA type**: Use regular PCA for lecture slides (educational standard); notebook can use either
- **Slide structure**: ~2 slides per technique + 1 visualization slide each + intro/conclusion = ~13-15 total
- **Notebook scope**: Pure visualization workflow only (no classification task)
- **Test strategy**: Manual verification only (no automated tests for notebooks)
- **Figure generation**: New Python script to generate sample visualizations using Avenir font

**Research Findings**:
- Image syntax in Marp: `![width:Xpx](figures/name.png)`
- Week4 has no `figures/` directory yet - needs creation
- Font standard: `'Avenir LT Std', Avenir, 'Avenir Next', sans-serif`
- README update location: lines 340-344 (Week 4 Thursday X-hour section)
- Existing X-hour notebooks follow consistent structure with Learning Objectives, Setup, Parts, Exercises

### Metis Review
**Identified Gaps** (addressed):
- Font fallback: Script should handle case where Avenir not installed (use matplotlib font stack)
- Directory creation: Must create `slides/week4/figures/` before saving images
- Notebook execution environment: Must work in Google Colab (pip install commands)

---

## Work Objectives

### Core Objective
Deliver a streamlined lecture 13 with visualization figures and a hands-on X-hour notebook demonstrating dimensionality reduction techniques with modern visualization tools.

### Concrete Deliverables
- `slides/week4/lecture13.md` - shortened to ~13-15 slides
- `slides/week4/figures/pca_visualization.png` - PCA 2D projection
- `slides/week4/figures/tsne_visualization.png` - t-SNE 2D projection  
- `slides/week4/figures/umap_visualization.png` - UMAP 2D projection
- `slides/week4/generate_dimred_figures.py` - figure generation script
- `slides/week4/xhour_dimred_demo.ipynb` - X-hour companion notebook
- `slides/README.md` - updated with notebook link
- `slides/week4/lecture13.html` - compiled slides
- `slides/week4/lecture13.pdf` - compiled slides (PDF)
- `.sisyphus/evidence/` - screenshots of working visualizations

### Definition of Done
- [ ] Lecture 13 has 13-15 slides (verify with grep for `^---$`)
- [ ] All three visualization PNGs exist and are non-empty
- [ ] Notebook runs successfully in Google Colab
- [ ] datamapplot interactive visualization renders
- [ ] BERTopic labels are meaningful (not "Topic -1" garbage)
- [ ] README contains notebook link on line after 343

### Must Have
- Avenir font (or fallback) in generated figures
- "Open in Colab" badge in notebook first cell
- 20 Newsgroups dataset for consistency with week3
- HDBSCAN clustering integration with BERTopic
- datamapplot for interactive visualization

### Must NOT Have (Guardrails)
- Document classification tasks in notebook (out of scope)
- Automated tests for notebook (manual verification only)
- Changes to other lectures or demos
- IncrementalPCA in lecture slides (use regular PCA)
- Over-complicated multi-part exercises (keep focused on visualization)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no test infra for notebooks)
- **User wants tests**: NO (manual verification only)
- **Framework**: None
- **QA approach**: Manual verification

### If Manual QA Only

**CRITICAL**: Without automated tests, manual verification MUST be exhaustive.

Each TODO includes detailed verification procedures.

**Evidence Required:**
- [ ] Screenshots saved to `.sisyphus/evidence/`
- [ ] Terminal output captured for compilation
- [ ] Notebook cell outputs visible

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Create figure generation script
└── Task 2: Create X-hour notebook structure

Wave 2 (After Wave 1):
├── Task 3: Run figure generation script (depends on Task 1)
├── Task 4: Shorten lecture13.md with figure references (depends on Task 3)
└── Task 5: Update README.md with notebook link (depends on Task 2)

Wave 3 (After Wave 2):
├── Task 6: Compile lecture13.md (depends on Task 4)
└── Task 7: Manual verification in browser/Colab (depends on Tasks 2, 3, 6)

Critical Path: Task 1 → Task 3 → Task 4 → Task 6 → Task 7
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | 5, 7 | 1 |
| 3 | 1 | 4 | 5 |
| 4 | 3 | 6 | 5 |
| 5 | 2 | None | 3, 4 |
| 6 | 4 | 7 | None |
| 7 | 2, 3, 6 | None | None (final verification) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | `category="ultrabrain"` for Python scripting |
| 2 | 3, 4, 5 | `category="quick"` for edits and script execution |
| 3 | 6, 7 | `category="visual-engineering"` + `load_skills=["playwright"]` for verification |

---

## TODOs

- [ ] 1. Create figure generation script (`generate_dimred_figures.py`)

  **What to do**:
  - Create Python script at `slides/week4/generate_dimred_figures.py`
  - Load 20 Newsgroups dataset (subset of 8 categories like week3 notebook)
  - Generate TF-IDF embeddings and reduce to 100D with TruncatedSVD
  - Apply PCA, t-SNE, and UMAP to project to 2D
  - Create matplotlib scatter plots with category coloring
  - Use Avenir font family with fallback: `plt.rcParams['font.family'] = ['Avenir', 'Avenir Next', 'Helvetica Neue', 'sans-serif']`
  - Create `figures/` directory if not exists
  - Save as `pca_visualization.png`, `tsne_visualization.png`, `umap_visualization.png`
  - Use consistent styling: dark background optional, clear legend, ~1000x700 resolution

  **Must NOT do**:
  - Don't use GPU-specific code (must run on CPU)
  - Don't save to wrong directory
  - Don't use fonts that won't be available

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex Python scripting with multiple libraries
  - **Skills**: None specific needed
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for script creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `slides/week3/xhour_embeddings_demo.ipynb:cells[8-12]` - TF-IDF + SVD pattern for embeddings
  - `slides/week3/xhour_embeddings_demo.ipynb:cells[45-50]` - UMAP visualization pattern
  - `slides/template_deck/process_markdown.py:414` - Avenir font family specification

  **API/Type References** (contracts to implement against):
  - sklearn.decomposition.TruncatedSVD, PCA
  - sklearn.manifold.TSNE
  - umap.UMAP
  - matplotlib.pyplot

  **External References** (libraries and frameworks):
  - UMAP docs: https://umap-learn.readthedocs.io/en/latest/
  - sklearn manifold: https://scikit-learn.org/stable/modules/manifold.html

  **WHY Each Reference Matters**:
  - Week3 notebook shows exact embedding generation pattern for 20 Newsgroups
  - process_markdown.py shows the exact Avenir font stack to use

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Run: `python slides/week4/generate_dimred_figures.py`
  - [ ] Exit code: 0
  - [ ] Output contains: "Saved pca_visualization.png"
  - [ ] Output contains: "Saved tsne_visualization.png"  
  - [ ] Output contains: "Saved umap_visualization.png"
  - [ ] Verify files exist: `ls -la slides/week4/figures/*.png` → 3 PNG files
  - [ ] Each PNG is >10KB (not empty/corrupt)

  **Commit**: YES
  - Message: `feat(slides): add figure generation script for lecture 13`
  - Files: `slides/week4/generate_dimred_figures.py`, `slides/week4/figures/*.png`
  - Pre-commit: None

---

- [ ] 2. Create X-hour notebook structure (`xhour_dimred_demo.ipynb`)

  **What to do**:
  - Create Jupyter notebook at `slides/week4/xhour_dimred_demo.ipynb`
  - Follow X-hour notebook pattern from week3
  - Structure:
    - Cell 1: Markdown with title, course info, Learning Objectives, "Open in Colab" badge
    - Cell 2: pip install commands for Colab (umap-learn, hdbscan, bertopic, datamapplot)
    - Cell 3: Imports and setup
    - Part 1: Load and embed 20 Newsgroups data
    - Part 2: PCA visualization
    - Part 3: t-SNE visualization  
    - Part 4: UMAP visualization
    - Part 5: HDBSCAN clustering on UMAP coordinates
    - Part 6: BERTopic for topic labels
    - Part 7: datamapplot interactive visualization
    - Part 8: Discussion and Summary
  - Include exercises after each part
  - Use consistent styling with week3 notebook

  **Must NOT do**:
  - Don't include document classification (out of scope)
  - Don't use GPU-only code without fallback
  - Don't use deprecated APIs

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex notebook creation with multiple ML libraries
  - **Skills**: None specific needed
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for notebook creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 5, 7
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `slides/week3/xhour_embeddings_demo.ipynb` - Complete structure pattern
  - `slides/week1/xhour_eliza_demo.ipynb` - Alternative structure reference
  - `slides/week2/xhour_classification_demo.ipynb` - Exercise patterns

  **API/Type References** (contracts to implement against):
  - BERTopic: `topic_model = BERTopic(hdbscan_model=clusterer)`
  - datamapplot: `datamapplot.create_interactive_plot(coords_2d, labels, hover_text=docs)`
  - HDBSCAN: `hdbscan.HDBSCAN(min_cluster_size=15)`

  **External References** (libraries and frameworks):
  - BERTopic docs: https://maartengr.github.io/BERTopic/
  - datamapplot docs: https://datamapplot.readthedocs.io/
  - HDBSCAN docs: https://hdbscan.readthedocs.io/

  **WHY Each Reference Matters**:
  - Week3 notebook is the exact pattern to follow for structure and styling
  - BERTopic + datamapplot integration is the core visualization goal

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File exists: `slides/week4/xhour_dimred_demo.ipynb`
  - [ ] Valid JSON: `python -c "import json; json.load(open('slides/week4/xhour_dimred_demo.ipynb'))"`
  - [ ] Contains "Open in Colab" badge: grep for `colab.research.google.com`
  - [ ] Has Learning Objectives section
  - [ ] Has pip install cell with umap-learn, hdbscan, bertopic, datamapplot

  **Commit**: YES
  - Message: `feat(slides): add X-hour dimensionality reduction notebook`
  - Files: `slides/week4/xhour_dimred_demo.ipynb`
  - Pre-commit: None

---

- [ ] 3. Run figure generation script

  **What to do**:
  - Install required packages if needed: `pip install scikit-learn umap-learn matplotlib`
  - Run the script: `python slides/week4/generate_dimred_figures.py`
  - Verify all three PNG files are created
  - Visually inspect each figure for correctness

  **Must NOT do**:
  - Don't skip visual verification
  - Don't proceed if script fails

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple script execution
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - All skills omitted - simple execution task

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Task 1)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - Task 1 output: `slides/week4/generate_dimred_figures.py`

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Command: `python slides/week4/generate_dimred_figures.py`
  - [ ] Exit code: 0
  - [ ] Verify: `ls slides/week4/figures/` → 3 PNG files
  - [ ] Open each PNG and verify:
    - Points are colored by category
    - Legend is visible
    - Title indicates which algorithm
    - No rendering errors

  **Commit**: NO (files already committed in Task 1)

---

- [ ] 4. Shorten lecture13.md with figure references

  **What to do**:
  - Edit `slides/week4/lecture13.md` to reduce from 22 slides to ~13-15
  - Preserve Marp frontmatter and CDL theme
  - New structure:
    - Slide 1: Title (keep existing)
    - Slide 2: Learning objectives (condense)
    - Slide 3: Why dimensionality reduction? (merge curse + motivation)
    - Slide 4: PCA concept (condense 2 PCA slides)
    - Slide 5: PCA visualization `![width:900px](figures/pca_visualization.png)`
    - Slide 6: t-SNE concept (condense 2 t-SNE slides)
    - Slide 7: t-SNE visualization `![width:900px](figures/tsne_visualization.png)`
    - Slide 8: UMAP concept (condense)
    - Slide 9: UMAP visualization `![width:900px](figures/umap_visualization.png)`
    - Slide 10: Comparison table (keep existing)
    - Slide 11: Best practices (condense)
    - Slide 12: Summary
    - Slide 13: Further reading + Questions
  - Use `![width:900px](figures/...)` syntax for images
  - Keep note-box, example-box, etc. CDL theme elements

  **Must NOT do**:
  - Don't remove Marp frontmatter
  - Don't change theme to non-CDL
  - Don't use IncrementalPCA (use regular PCA)
  - Don't break image paths

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused text editing task
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - All skills omitted - content editing task

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after figures exist)
  - **Blocks**: Task 6
  - **Blocked By**: Task 3 (figures must exist first)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `slides/week4/lecture13.md` - Current content to condense
  - `slides/week3/lecture10.md:66,106,280` - Image embedding examples
  - `slides/week3/lecture9.md:86,112,119,126` - Image width syntax

  **API/Type References**:
  - Marp image syntax: `![width:Xpx](path)`

  **WHY Each Reference Matters**:
  - Current lecture13.md has all the content to condense
  - Week3 lectures show the exact image syntax used in this project

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Count slides: `grep -c '^---$' slides/week4/lecture13.md` → 12-14 (separators = slides - 1)
  - [ ] Verify image references: `grep 'figures/.*\.png' slides/week4/lecture13.md` → 3 matches
  - [ ] Verify frontmatter preserved: `head -10 slides/week4/lecture13.md` → contains `marp: true`
  - [ ] Verify theme boxes used: `grep -c 'note-box\|example-box\|tip-box' slides/week4/lecture13.md` → >5

  **Commit**: YES
  - Message: `refactor(slides): shorten lecture 13 to 13 slides with visualizations`
  - Files: `slides/week4/lecture13.md`
  - Pre-commit: None

---

- [ ] 5. Update README.md with notebook link

  **What to do**:
  - Edit `slides/README.md`
  - Find Week 4 Thursday X-hour section (lines 340-344)
  - Add notebook link after line 343 (before the slides links line)
  - Format: `  - 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week4/xhour_dimred_demo.html)`
  - Match indentation of surrounding lines (2 spaces)

  **Must NOT do**:
  - Don't change other sections
  - Don't break markdown formatting
  - Don't remove existing links

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple one-line edit
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - All skills omitted - trivial edit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: None
  - **Blocked By**: Task 2 (notebook must exist to link)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `slides/README.md:321-322` - Week 1 X-hour notebook link pattern
  - `slides/README.md:329-330` - Week 2 X-hour notebook link pattern

  **WHY Each Reference Matters**:
  - Existing notebook links show exact format and indentation

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Verify link added: `grep 'xhour_dimred_demo' slides/README.md` → 1 match
  - [ ] Verify format: line contains `📓` emoji and `X-hour Notebook` text
  - [ ] Verify in Week 4 section: `grep -A5 'Week 4 Thursday X-hour' slides/README.md`

  **Commit**: YES
  - Message: `docs(readme): add link to week 4 X-hour notebook`
  - Files: `slides/README.md`
  - Pre-commit: None

---

- [ ] 6. Compile lecture13.md to HTML/PDF

  **What to do**:
  - Navigate to `slides/week4/` directory
  - Run: `../template_deck/compile.sh lecture13.md`
  - Verify `lecture13.html` and `lecture13.pdf` are generated
  - Check for compilation errors

  **Must NOT do**:
  - Don't run from wrong directory
  - Don't skip error checking

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple shell command
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - All skills omitted - simple execution

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after slides edited)
  - **Blocks**: Task 7
  - **Blocked By**: Task 4

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `slides/AGENTS.md` - Compile command documentation
  - `slides/template_deck/compile.sh` - Compilation script

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Command: `cd slides/week4 && ../template_deck/compile.sh lecture13.md`
  - [ ] Exit code: 0
  - [ ] Files exist: `ls slides/week4/lecture13.html slides/week4/lecture13.pdf`
  - [ ] HTML file >100KB (contains content)
  - [ ] PDF file >500KB (contains content)

  **Commit**: YES (groups with Task 4)
  - Message: `build(slides): compile lecture 13 with new visualizations`
  - Files: `slides/week4/lecture13.html`, `slides/week4/lecture13.pdf`
  - Pre-commit: None

---

- [ ] 7. Manual verification: slides and notebook

  **What to do**:
  - **Slides verification**:
    - Open `slides/week4/lecture13.html` in browser
    - Navigate through all slides
    - Verify visualization images render correctly
    - Check no broken image placeholders
    - Screenshot representative slides
  - **Notebook verification**:
    - Open notebook in Google Colab
    - Run all cells sequentially
    - Verify BERTopic produces meaningful labels (not all "Topic -1")
    - Verify datamapplot renders interactive visualization
    - Screenshot the final visualization
  - Save all evidence to `.sisyphus/evidence/`

  **Must NOT do**:
  - Don't skip BERTopic label quality check
  - Don't approve if plots show errors
  - Don't proceed without evidence screenshots

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Browser automation and visual verification
  - **Skills**: `["playwright"]`
    - `playwright`: Required for browser automation, screenshots, navigation
  - **Skills Evaluated but Omitted**:
    - `dev-browser`: Less specialized than playwright for verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final verification)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 2, 3, 6 (all deliverables must exist)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - Task 3 output: `slides/week4/figures/*.png`
  - Task 6 output: `slides/week4/lecture13.html`
  - Task 2 output: `slides/week4/xhour_dimred_demo.ipynb`

  **Acceptance Criteria**:

  **For Slides (Using Playwright):**
  - [ ] Navigate to: `file:///.../slides/week4/lecture13.html`
  - [ ] Verify: All 13-15 slides load without errors
  - [ ] Verify: PCA, t-SNE, UMAP visualization slides show images (not broken icons)
  - [ ] Screenshot: Save to `.sisyphus/evidence/lecture13-slides.png`

  **For Notebook (Manual in Colab):**
  - [ ] Upload notebook to Google Colab
  - [ ] Run: Cell 2 (pip install) completes without error
  - [ ] Run: All remaining cells sequentially
  - [ ] Verify: BERTopic `topic_model.get_topic_info()` shows meaningful topic names (e.g., "space nasa shuttle" not just "Topic 0")
  - [ ] Verify: datamapplot interactive plot renders with hoverable points
  - [ ] Screenshot: Save BERTopic output and datamapplot to `.sisyphus/evidence/`

  **Evidence Required:**
  - [ ] `.sisyphus/evidence/lecture13-slides.png` - Compiled slides screenshot
  - [ ] `.sisyphus/evidence/notebook-bertopic.png` - BERTopic topic labels
  - [ ] `.sisyphus/evidence/notebook-datamapplot.png` - Interactive visualization

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(slides): add figure generation script for lecture 13` | generate_dimred_figures.py, figures/*.png | Script runs |
| 2 | `feat(slides): add X-hour dimensionality reduction notebook` | xhour_dimred_demo.ipynb | Valid JSON |
| 4+6 | `refactor(slides): shorten lecture 13 to 13 slides with visualizations` | lecture13.md, lecture13.html, lecture13.pdf | Compile succeeds |
| 5 | `docs(readme): add link to week 4 X-hour notebook` | README.md | Link present |

---

## Success Criteria

### Verification Commands
```bash
# Slide count (should be 12-14 separators = 13-15 slides)
grep -c '^---$' slides/week4/lecture13.md

# Figure files exist
ls -la slides/week4/figures/*.png

# Notebook is valid JSON
python -c "import json; json.load(open('slides/week4/xhour_dimred_demo.ipynb'))"

# README has notebook link
grep 'xhour_dimred_demo' slides/README.md

# Compiled files exist
ls -la slides/week4/lecture13.html slides/week4/lecture13.pdf
```

### Final Checklist
- [ ] Lecture13 has 13-15 slides (not 22)
- [ ] Three visualization PNGs in figures/ directory
- [ ] Figures use Avenir font (or fallback)
- [ ] Notebook runs in Google Colab
- [ ] BERTopic labels are meaningful (human-readable topic names)
- [ ] datamapplot interactive visualization works
- [ ] README contains notebook link
- [ ] Compiled HTML/PDF exist and render correctly
- [ ] All evidence screenshots saved
