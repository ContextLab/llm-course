# Draft: Dimensionality Reduction Lecture & Notebook

## Requirements (confirmed from user clarifications)

### NEW: Figure Generation Script
- Python script: `slides/week4/generate_dimred_figures.py`
- Use 20 Newsgroups dataset embeddings
- Project to 2D using PCA, t-SNE, UMAP
- Save as PNG to `slides/week4/figures/`
- **Use Avenir font** (project standard: `'Avenir LT Std', Avenir, 'Avenir Next', sans-serif`)
- One visualization slide per technique added to lecture

### Slide Count Update
- Original target: ~10-12 slides
- With visualization slides: ~13-15 slides acceptable

## Requirements (confirmed)

### Deliverable 1: Shortened Lecture 13
- **Current state**: 22 slides (543 lines)
- **Target state**: ~10-12 slides
- **Structure requested**:
  - Intro slide
  - ~2 slides per technique (IncrementalPCA, t-SNE, UMAP)
  - Conclusion/summary slide
- **Must preserve**: Marp frontmatter, CDL theme boxes

### Deliverable 2: X-hour Notebook
- **File**: `/slides/week4/xhour_dimred_demo.ipynb`
- **Pattern**: Follow existing X-hour notebooks (week1/2/3)
- **Must include**:
  - "Open in Colab" badge
  - Learning Objectives section
  - Setup cell with pip installs
  - Parts with exercises
- **Libraries required**:
  - IncrementalPCA (sklearn.decomposition)
  - t-SNE (sklearn.manifold)
  - UMAP (umap-learn)
  - HDBSCAN for clustering
  - BERTopic for human-readable cluster labels
  - datamapplot for interactive visualization
- **Dataset**: 20 Newsgroups (consistent with week3)

### Deliverable 3: README Update
- **File**: `/slides/README.md`
- **Location**: Week 4 Thursday X-hour section (line ~153-157)
- **Pattern to add**: `📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week4/xhour_dimred_demo.html)`

### Deliverable 4: Compile Lecture
- **Command**: `../template_deck/compile.sh lecture13.md` (from week4 dir)
- **Output**: lecture13.html, lecture13.pdf

### Deliverable 5: Manual Verification
- **BERTopic labels**: Must be meaningful (not garbage)
- **Plots**: Must render correctly
- **Tool**: Playwright browser automation

## Technical Decisions

### IncrementalPCA vs regular PCA
- User specifically requested "IncrementalPCA" - need to clarify if this is intentional
- IncrementalPCA is for streaming/large datasets, regular PCA is more common for educational demos
- May need to use both or clarify intent

### Integration Pattern
- BERTopic creates topic labels from HDBSCAN clusters
- datamapplot visualizes the 2D coordinates with labels
- Pipeline: Embeddings → UMAP → HDBSCAN → BERTopic → datamapplot

### Notebook Execution Environment
- Must work in Google Colab
- GPU not required but helps with BERTopic
- Need to verify all packages install correctly

## Research Findings

### Existing X-hour Notebook Pattern (week3)
- Title: "X-Hour N: [Topic] Workshop"
- Course label, week/day info
- Learning objectives (numbered list)
- Setup section with pip installs
- Parts 1-8 with exercises
- Discussion questions
- Summary and Key Takeaways

### README Update Location (week4 section)
- Lines 153-157 currently have Lecture 13 entry
- Need to add notebook link similar to weeks 1-3 pattern

### Slide Compilation
- From week4 directory: `../template_deck/compile.sh lecture13.md`
- Generates HTML and PDF

## User Decisions (Resolved)

1. **PCA type**: Use regular PCA for lecture slides (standard educational). Notebook can use either - educator's judgment.
2. **Slide structure**: Option A - structured approach with ~2 slides per technique + visualizations = ~13-15 total
3. **Notebook scope**: Option A - Focus purely on visualization workflow (embeddings → dim reduction → clustering → BERTopic → datamapplot)
4. **Test strategy**: Option A - Manual verification only (run notebook, visual inspection, screenshot evidence)

## Scope Boundaries

### INCLUDE
- Shortened lecture13.md (~10-12 slides)
- New xhour_dimred_demo.ipynb notebook
- README.md update with notebook link
- Compiled lecture13.html
- Visual verification of outputs

### EXCLUDE
- Changes to other lectures
- Changes to existing demos
- New test files
- CI/CD changes

## Research Findings (Additional)

### Image Embedding Pattern in Slides
- Marp syntax: `![width:Xpx](path/to/image.png)`
- Week3 uses `img/` subdirectory for images
- Week4 currently has no `figures/` or `img/` directory - need to create

### Font Configuration
- Project standard: `'Avenir LT Std', Avenir, 'Avenir Next', sans-serif`
- From `process_markdown.py` line 414

### README Update Location
- Lines 340-344 contain Week 4 Thursday X-hour entry
- Need to add `📓 [X-hour Notebook](...)` line after line 343
