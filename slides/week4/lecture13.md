---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 13: Dimensionality reduction
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will">

1. Understand **why** we need dimensionality reduction for embeddings
2. Apply **PCA** for fast, linear projection
3. Apply **t-SNE** for local structure preservation
4. Apply **UMAP** for scalable, global+local structure
5. Know **when to use** each technique

</div>

<div class="definition-box" data-title="The goal">

Reduce from $d$ dimensions (e.g., 300-768) to 2-3 dimensions while preserving meaningful structure for visualization.

</div>

---

# Why dimensionality reduction?

<div class="warning-box" data-title="The curse of dimensionality">

High-dimensional spaces behave counter-intuitively: all points tend to be equidistant!

- **Word2Vec / GloVe:** 300 dimensions
- **BERT:** 768 dimensions  
- **GPT-3:** 12,288 dimensions

</div>

<div class="note-box" data-title="Applications">

- **Visualization:** 2D/3D plots to explore semantic structure
- **Quality assurance:** Verify embeddings capture expected relationships
- **Preprocessing:** Reduce noise before clustering
- **Interpretation:** Understand relationships between words/documents

</div>

---

# PCA: Principal Component Analysis

<div class="definition-box" data-title="The classic linear method">

Finds directions of **maximum variance** and projects data onto these orthogonal "principal components."

</div>

<div class="note-box" data-title="Properties">

- **Linear transformation** — preserves global structure
- **Deterministic** — same result every time
- **Fast** — efficient computation via SVD
- **Interpretable** — PCs ranked by variance explained

</div>

<div class="tip-box" data-title="When to use PCA">

Quick first exploration, preprocessing for other methods (like t-SNE/UMAP), or when computational speed is critical.

</div>

---

# PCA: 20 Newsgroups visualization

![width:900px](figures/pca_visualization.png)

<div class="example-box" data-title="Observations">

- Categories overlap significantly — PCA captures global structure but loses local clusters
- Fast to compute (~100ms for 7000 documents)
- Only captures **linear** relationships

</div>

---

# t-SNE: t-Distributed Stochastic Neighbor Embedding

<div class="note-box" data-title="Further reading">

[**van der Maaten & Hinton (2008, *JMLR*)**](https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf) Visualizing Data using t-SNE.

</div>

<div class="definition-box" data-title="Non-linear visualization">

Models similarity as probability distributions. Preserves **local structure** — neighbors stay neighbors.

</div>

<div class="warning-box" data-title="Caveats">

- **Slow:** O(N²) complexity
- **Non-deterministic:** Different seeds → different layouts
- **Cluster sizes are arbitrary** — don't interpret "bigger" as "more variance"
- **Distances between clusters are meaningless**

</div>

---

# t-SNE: 20 Newsgroups visualization

![width:900px](figures/tsne_visualization.png)

<div class="example-box" data-title="Observations">

- Clear, tight clusters emerge — great for identifying groups
- Categories now well-separated
- Perplexity parameter controls local vs. global focus (here: 30)

</div>

---

# UMAP: Uniform Manifold Approximation & Projection

<div class="note-box" data-title="Further reading">

[**McInnes et al. (2018, *arXiv*)**](https://arxiv.org/abs/1802.03426) UMAP: Uniform Manifold Approximation and Projection.

</div>

<div class="definition-box" data-title="The modern standard (2018)">

Theoretically grounded in topology. Preserves **both local AND global** structure.

</div>

<div class="tip-box" data-title="Key advantages">

- **Fast:** O(N log N) complexity
- **Scalable:** Handles millions of points
- **Out-of-sample:** Can transform new points without refitting
- **Global structure:** Keeps related clusters near each other

</div>

---

# UMAP: 20 Newsgroups visualization

![width:900px](figures/umap_visualization.png)

<div class="example-box" data-title="Observations">

- Clear clusters like t-SNE, but preserves global relationships
- Related categories (sci.space, sci.med) remain nearby
- Much faster than t-SNE for large datasets

</div>

---

# PCA vs. t-SNE vs. UMAP

| Feature | PCA | t-SNE | UMAP |
| :--- | :--- | :--- | :--- |
| **Speed** | Very Fast | Slow | Fast |
| **Scalability** | Excellent | Poor (<10k) | Excellent |
| **Global structure** | Yes | No | Yes |
| **Local structure** | Partial | Yes | Yes |
| **Deterministic** | Yes | No | Partial |
| **Out-of-sample** | Yes | No | Yes |

<div class="tip-box" data-title="Best practice workflow">

1. **PCA to 50D:** Fast preprocessing, removes noise
2. **UMAP to 2D:** Preserves structure, scales well

</div>

---

# Visualization best practices

<div class="note-box" data-title="Preparation">

- **Standardize:** Use `StandardScaler` for PCA
- **Sample:** For very large datasets, subsample or use PCA first
- **Iterate:** Try multiple hyperparameters

</div>

<div class="tip-box" data-title="Presentation">

- **Color intelligently:** By semantic category, cluster, or feature
- **Interactive:** Use Plotly, datamapplot, or Bokeh for hover tooltips
- **Annotate selectively:** Label representative points, not every one

</div>

<div class="warning-box" data-title="What you CANNOT conclude">

- Exact distances or true high-D geometry
- Quantitative relationships between distant clusters  
- Absolute cluster sizes (especially in t-SNE)

</div>

---

# Summary

<div class="note-box" data-title="What we learned">

1. **Curse of Dimensionality:** High-D space is counter-intuitive; reduction essential for visualization
2. **PCA:** Linear, fast, global focus. Best for noise removal and preprocessing.
3. **t-SNE:** Non-linear, local focus. Great for clusters but slow.
4. **UMAP:** Fast, scalable, preserves local and global structure. The modern default.
5. **Workflow:** PCA (50D) → UMAP (2D) is the gold standard.

</div>

<div class="tip-box" data-title="Try it yourself!">

📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week4/xhour_dimred_demo.html) — Interactive demo with BERTopic and datamapplot

</div>

---

# Questions?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a> me</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label">Join our <a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label">Come to <a href="https://context-lab.youcanbook.me">office hours</a></span>
  </div>
</div>

<div class="tip-box" data-title="Up next">

Friday: Cognitive models of semantic representation — how do humans represent meaning?

</div>
