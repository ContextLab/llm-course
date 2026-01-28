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

1. Understand the **curse of dimensionality** and why we need reduction
2. Explain how **PCA** finds directions of maximum variance
3. Understand **t-SNE** and how it preserves local structure
4. Apply **UMAP** for fast, scalable dimensionality reduction
5. Compare different techniques and follow visualization best practices

</div>

<div class="definition-box" data-title="The goal">

Reduce from $d$ dimensions (e.g., 300) to $k$ dimensions (e.g., 2 or 3) while preserving as much meaningful structure as possible.

</div>

---

# The curse of dimensionality

<div class="warning-box" data-title="The problem">

High-dimensional spaces behave in counter-intuitive ways that make visualization and computation difficult.

</div>

<div class="note-box" data-title="Embedding dimensions">

- **Word2Vec / GloVe / FastText:** 300 dimensions
- **BERT:** 768 dimensions
- **GPT-3:** 12,288 dimensions!

</div>

<div class="example-box" data-title="Distance concentration">

In high dimensions, all points tend to cluster around the same distance from the origin!

```python
import numpy as np
# Sample 1000 random points in different dims
for dim in [2, 10, 100, 300]:
    points = np.random.randn(1000, dim)
    dists = np.linalg.norm(points, axis=1)
    print(f"Dim={dim}: mean={dists.mean():.2f}, std={dists.std():.2f}")

# Dim=300: mean=17.3, std=0.50 (Very tight distribution!)
```

</div>

---

# Why dimensionality reduction?

<div class="note-box" data-title="Visualization">

- 2D/3D plots to explore semantic structure
- Identify clusters and discover patterns
- Quality assurance for embeddings

</div>

<div class="tip-box" data-title="Computation & ML">

- **Faster algorithms:** Less memory and compute required
- **Reduce overfitting:** Feature selection and noise removal
- **Scalability:** Enable real-time systems

</div>

<div class="important-box" data-title="Interpretation">

Understand relationships between words/documents and communicate results effectively.

</div>

---

# Principal Component Analysis (PCA)

<div class="definition-box" data-title="The classic linear method">

Finds directions of maximum variance and projects data onto these orthogonal "principal components."

</div>

<div class="note-box" data-title="Properties">

- **Linear transformation:** Preserves global structure
- **Deterministic:** Same result every time
- **Fast:** Efficient computation via SVD
- **Interpretable:** PCs are ranked by variance explained

</div>

<div class="example-box" data-title="Intuition">

- **PC1:** Captures the most variation in the data
- **PC2:** Captures the remaining variation (orthogonal to PC1)

</div>

---

# PCA: The algorithm

<div class="example-box" data-title="Worked example (3D → 2D)">

| Word | x1 | x2 | x3 |
|------|-----|-----|-----|
| king | 2.0 | 1.5 | 0.1 |
| queen | 1.8 | 1.6 | 0.2 |
| man | 1.0 | 0.5 | 0.1 |
| woman | 0.9 | 0.6 | 0.2 |

**Step 1:** Center data (subtract mean)
**Step 2:** Compute covariance matrix
**Step 3:** Find eigenvectors/eigenvalues

</div>

<div class="note-box" data-title="Variance retained">

- $\lambda_1 = 0.85$ (85% variance)
- $\lambda_2 = 0.13$ (13% variance)
- $\lambda_3 = 0.02$ (2% variance)

**Keep top 2 PCs → 98% variance retained!** Gender remains separable and royalty still clusters.

</div>

---

# PCA in Python

<div class="example-box" data-title="Using scikit-learn">

```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Standardize the data (recommended)
scaler = StandardScaler()
embeddings_scaled = scaler.fit_transform(embeddings)

# Apply PCA
pca = PCA(n_components=2)
embeddings_2d = pca.fit_transform(embeddings_scaled)

# Check variance explained
print(f"Total variance explained: {sum(pca.explained_variance_ratio_):.2%}")
```

</div>

<div class="tip-box" data-title="Visualization">

Use `plt.scatter` and `plt.annotate` to see how words like "king" and "queen" relate in the reduced space.

</div>

---

# PCA limitations

<div class="warning-box" data-title="Assumes linearity">

- Only captures linear relationships
- Word embeddings often have non-linear structure (manifolds)
- May miss important semantic patterns

</div>

<div class="note-box" data-title="Other issues">

- **Variance ≠ Importance:** Noisy dimensions might have high variance
- **Global focus:** May lose local structure (clusters become blurred)
- **Interpretability:** PCs are linear combinations, hard to map to specific meanings

</div>

<div class="tip-box" data-title="When to use PCA">

Quick first exploration, preprocessing for other methods (like t-SNE/UMAP), or when speed is critical.

</div>

---

# t-SNE: t-Distributed Stochastic Neighbor Embedding

<div class="note-box" data-title="Further reading">

[**van der Maaten & Hinton (2008, *JMLR*)**](https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf) Visualizing Data using t-SNE.

</div>

<div class="definition-box" data-title="Non-linear visualization">

Models similarity as probability: Gaussian in high-D, t-distribution in low-D. Minimizes KL divergence between distributions.

</div>

<div class="tip-box" data-title="Advantages">

- Beautiful visualizations that reveal clusters
- Preserves local structure (neighbors stay neighbors)
- Widely used for high-dimensional data exploration

</div>

---

# t-SNE: Key concepts

<div class="important-box" data-title="The crowding problem">

In 2D, there isn't enough "room" to fit all the neighbors a point had in high-D. The **t-distribution** has heavier tails, allowing moderately-distant points to spread further apart.

</div>

<div class="example-box" data-title="Perplexity">

Balances attention between local and global aspects of the data.
- **Low (5):** Tight, fragmented clusters (fine structure)
- **Medium (30):** Balanced view (standard choice)
- **High (100):** Merged clusters (global view)

**Rule of thumb:** Perplexity $\approx \sqrt{N}$

</div>

---

# t-SNE in Python

<div class="example-box" data-title="Using scikit-learn">

```python
from sklearn.manifold import TSNE

tsne = TSNE(
    n_components=2,
    perplexity=30,
    n_iter=2000,
    random_state=42
)

embeddings_2d = tsne.fit_transform(embeddings)
```

</div>

<div class="tip-box" data-title="Pro tip">

t-SNE is computationally expensive. For large datasets, use PCA to reduce to 50 dimensions first, then run t-SNE.

</div>

---

# t-SNE limitations and caveats

<div class="warning-box" data-title="Performance & Determinism">

- **Slow:** $O(N^2)$ complexity (10k points can take 15+ minutes)
- **Non-deterministic:** Different random seeds produce different layouts
- **No out-of-sample:** Cannot transform new points without refitting everything

</div>

<div class="important-box" data-title="Interpretation pitfalls">

- **Cluster sizes are arbitrary:** A "bigger" cluster doesn't mean more variance
- **Distances between clusters are meaningless:** Global structure is not preserved
- **Axes have no meaning:** Don't try to label the x or y axis!

</div>

---

# UMAP: Uniform Manifold Approximation & Projection

<div class="note-box" data-title="Further reading">

[**McInnes et al. (2018, *arXiv*)**](https://arxiv.org/abs/1802.03426) UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction.

</div>

<div class="definition-box" data-title="The modern standard (2018)">

Theoretically grounded in topology. Faster than t-SNE and preserves both local AND global structure.

</div>

<div class="tip-box" data-title="Key advantages">

- **Fast:** $O(N \log N)$ complexity
- **Scalable:** Handles millions of points
- **Out-of-sample:** Can transform new points
- **Global structure:** Better at keeping related clusters near each other

</div>

---

# UMAP in Python

<div class="example-box" data-title="Using umap-learn">

```python
import umap

reducer = umap.UMAP(
    n_components=2,
    n_neighbors=15,  # Local vs. global balance
    min_dist=0.1,    # Cluster tightness
    metric='cosine', # Best for word embeddings
    random_state=42
)

embeddings_2d = reducer.fit_transform(embeddings)

# Transform new points!
new_2d = reducer.transform(new_embeddings)
```

</div>

<div class="note-box" data-title="Hyperparameters">

- **n_neighbors:** Small = local structure; Large = global structure
- **min_dist:** Small = tight clusters; Large = loose/spread out

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

1. **PCA to 50D:** Fast, removes noise
2. **UMAP to 2D:** Preserves structure and scales well

</div>

---

# Visualization best practices

<div class="note-box" data-title="Preparation">

- **Standardize:** Use `StandardScaler` for PCA
- **Sample:** For very large datasets, sample or use PCA first
- **Iterate:** Try multiple hyperparameters (perplexity, n_neighbors)

</div>

<div class="tip-box" data-title="Presentation">

- **Color intelligently:** By semantic category, cluster, or POS tag
- **Interactive:** Use Plotly or Bokeh for hover tooltips and zooming
- **Annotate selectively:** Label representative words, not every point

</div>

<div class="example-box" data-title="Interactive Plotly">

```python
import plotly.express as px
fig = px.scatter(df, x='x', y='y', color='category', hover_data=['word'])
fig.show()
```

</div>

---

# Applications in NLP

<div class="example-box" data-title="Embedding quality check">

Quick sanity check: Do "dog", "cat", "fish" cluster together? If it's a random scatter, your embeddings might be poor.

</div>

<div class="note-box" data-title="Finding polysemy">

"Apple" might appear in two clusters: one near "fruit" and another near "tech" (Google, Microsoft).

</div>

<div class="tip-box" data-title="Model layer comparison">

Visualize different BERT layers to see how syntax (lower layers) evolves into semantics (middle layers).

</div>

---

# Case study: Visualizing BERT layers

<div class="note-box" data-title="Further reading">

[**Jawahar et al. (2019, *ACL*)**](https://aclanthology.org/P19-1356/) What Does BERT Learn about the Structure of Language?

</div>

<div class="example-box" data-title="Findings">

- **Layers 0-2:** Syntactic (POS tags cluster)
- **Layers 3-8:** Semantic (meaning clusters)
- **Layers 9-12:** Task-specific adaptation

</div>

<div class="tip-box" data-title="Insight">

Confirms a linguistic hierarchy where the model builds complex meaning from basic structural components.

</div>

---

# Discussion: What do 2D views tell us?

<div class="warning-box" data-title="Information loss">

Compressing 300D to 2D involves >99% information loss. Projections are "shadows" of the true high-D structure.

</div>

<div class="note-box" data-title="What we CAN conclude">

- Rough semantic groupings and relative proximities
- Existence of clusters and outliers
- Qualitative patterns in the data

</div>

<div class="important-box" data-title="What we CANNOT conclude">

- Exact distances or true high-D geometry
- Quantitative relationships between distant clusters
- Absolute cluster sizes (especially in t-SNE)

</div>

---

# Summary

<div class="note-box" data-title="What we learned">

1. **Curse of Dimensionality:** High-D space is counter-intuitive; reduction is essential for visualization.
2. **PCA:** Linear, fast, global focus. Best for noise removal and preprocessing.
3. **t-SNE:** Non-linear, local focus. Great for clusters but slow and non-deterministic.
4. **UMAP:** Fast, scalable, preserves local and global structure. The modern default.
5. **Workflow:** PCA (50D) &rarr; UMAP (2D) is the gold standard for NLP visualization.

</div>

<div class="tip-box" data-title="Coming up">

Next: Cognitive models of semantic representation — how do humans represent meaning?

</div>

---

# Further reading

<div class="note-box" data-title="Foundational papers">

[**van der Maaten & Hinton (2008, *JMLR*)**](https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf) Visualizing Data using t-SNE.

[**McInnes et al. (2018, *arXiv*)**](https://arxiv.org/abs/1802.03426) UMAP: Uniform Manifold Approximation and Projection.

[**Jawahar et al. (2019, *ACL*)**](https://aclanthology.org/P19-1356/) What Does BERT Learn about the Structure of Language?

</div>

<div class="tip-box" data-title="Resources">

[How to Use t-SNE Effectively (Distill)](https://distill.pub/2016/misread-tsne/) | [UMAP Documentation](https://umap-learn.readthedocs.io/)

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

Friday: Cognitive models of semantic representation!

</div>
