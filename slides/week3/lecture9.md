---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 9: Classic embeddings
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will">

1. Understand the distributional hypothesis and why it matters
2. Implement Latent Semantic Analysis (LSA) with SVD
3. Apply Latent Dirichlet Allocation (LDA) for topic modeling
4. Compare classic embedding methods and their trade-offs
5. Visualize and interpret semantic relationships

</div>

<div class="tip-box" data-title="Central question">

*"You shall know a word by the company it keeps"* — J.R. Firth (1957)

</div>

---
<!-- _class: scale-90 -->

# The fundamental question

**How do we represent the meaning of words computationally?**

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Traditional Approach:**
- Dictionaries
- Taxonomies (WordNet)
- Manual feature engineering

Labor-intensive, hard to scale

</div>
<div style="flex: 1;">

**Distributional Approach:**
- Learn from data
- Context-based
- Scalable, unsupervised

Let the data tell us what words mean!

</div>
</div>

---

# The distributional hypothesis

**Key Idea:** Words that appear in similar contexts tend to have similar meanings.

<div class="example-box" data-title="Example">

- "The **cat** sat on the mat"
- "The **dog** sat on the mat"
- "The **kitten** sat on the mat"

→ *cat*, *dog*, *kitten* are semantically related

</div>

<div class="note-box" data-title="Implication">

We can learn word meaning from co-occurrence patterns alone!

</div>

---

# From words to vectors

**Goal:** Represent each word as a point in high-dimensional space

<div class="example-box" data-title="Word-context co-occurrence">

| Word | with "the" | with "sat" | with "ran" |
|------|------------|------------|------------|
| cat  | 2          | 1          | 0          |
| dog  | 2          | 0          | 1          |
| mat  | 1          | 1          | 0          |

</div>

**Problem:** Real vocabularies have 10,000+ words!

→ We need **dimensionality reduction**

---
<!-- _class: scale-80 -->

# Latent Semantic Analysis (LSA)

**The OG of semantic embeddings (1990)**

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Algorithm:**
1. Build term-document matrix $X$
2. Apply TF-IDF weighting (recall from last week!)
3. Perform SVD: $X = U\Sigma V^T$
4. Keep top $k$ dimensions
5. Use $U_k$ as word embeddings

</div>
<div style="flex: 1;">

**SVD Decomposition:**
```
X = U × Σ × V^T

U: word-topic associations
Σ: topic strengths
V^T: topic-document associations
```

</div>
</div>

<div class="note-box" data-title="Key innovation">

Discovers latent topics, solves synonymy problem, captures semantic similarity

</div>

---
<!-- _class: scale-70 -->

# LSA in Python

```python
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "The cat sat on the mat",
    "The dog ran in the park",
    "Machine learning is amazing",
]

# Build TF-IDF matrix (recall from week 2!)
tfidf = TfidfVectorizer(max_features=5000, stop_words='english')
tfidf_matrix = tfidf.fit_transform(documents)

# Apply LSA - reduce to 100 dimensions
lsa = TruncatedSVD(n_components=100, random_state=42)
doc_embeddings = lsa.fit_transform(tfidf_matrix)

print(f"Original: {tfidf_matrix.shape}")  # (3, vocab_size) - sparse
print(f"After LSA: {doc_embeddings.shape}")  # (3, 100) - dense!
```

---

# Finding similar words with LSA

```python
from sklearn.metrics.pairwise import cosine_similarity

# Get word embeddings
vocab = tfidf.get_feature_names_out()
word_embeddings = lsa.components_.T

def find_similar(word, top_n=5):
    idx = list(vocab).index(word)
    word_vec = word_embeddings[idx].reshape(1, -1)
    sims = cosine_similarity(word_vec, word_embeddings)[0]
    top_indices = sims.argsort()[-top_n-1:-1][::-1]
    return [(vocab[i], f"{sims[i]:.3f}") for i in top_indices]

print(find_similar("computer"))
# [('software', 0.82), ('program', 0.79), ('system', 0.71)]
```

<div class="tip-box" data-title="Key insight">

LSA finds semantically related words even without explicit labels!

</div>

---

# LSA limitations

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Issues:**
- SVD is expensive for large corpora
- Hard to update with new documents
- Linear relationships only
- No polysemy handling

</div>
<div style="flex: 1;">

**Example: Polysemy**

<div class="warning-box" data-title='Word: "bank"'>

1. Financial institution
2. River bank
3. Banking (airplane)

LSA gives ONE vector for all meanings!

</div>

</div>
</div>

---
<!-- _class: scale-80 -->

# Latent Dirichlet Allocation (LDA)

**A probabilistic approach to topic modeling**

<div class="definition-box" data-title="Key assumptions">

1. Each document is a mixture of topics
2. Each topic is a distribution over words
3. The mixture proportions vary per document

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Advantages over LSA:**
- Probabilistic interpretation
- Non-negative weights
- More interpretable topics

</div>
<div style="flex: 1;">

**Example:** Doc about "tech pets":
- 60% Technology topic
- 30% Animals topic
- 10% Other

</div>
</div>

---
<!-- _class: scale-70 -->

# LDA in Python

```python
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer

# Create bag-of-words (not TF-IDF for LDA!)
vectorizer = CountVectorizer(max_features=1000, stop_words='english')
doc_term_matrix = vectorizer.fit_transform(documents)
vocab = vectorizer.get_feature_names_out()

# Fit LDA
lda = LatentDirichletAllocation(n_components=5, random_state=42)
doc_topics = lda.fit_transform(doc_term_matrix)

# Print top words per topic
for idx, topic in enumerate(lda.components_):
    top_words = [vocab[i] for i in topic.argsort()[-7:]]
    print(f"Topic {idx}: {', '.join(top_words)}")
```

---

# LDA topic examples

**Example Topics from News Corpus:**

<div class="note-box" data-title="Topic 1: Politics (20%)">

`government, election, president, vote, policy, senate`

</div>

<div class="note-box" data-title="Topic 2: Sports (15%)">

`game, team, player, score, win, season, coach`

</div>

<div class="note-box" data-title="Topic 3: Technology (25%)">

`software, computer, data, algorithm, system, AI`

</div>

**Document representation:** [0.20, 0.15, 0.25, 0.40] ← topic mixture

---

# LSA vs. LDA comparison

| Aspect | LSA | LDA |
|--------|-----|-----|
| Approach | Matrix factorization | Probabilistic |
| Interpretability | Medium | High |
| Speed | Fast | Medium |
| Topic coherence | Medium | High |
| Best for | Search, retrieval | Topic discovery |

<div class="tip-box" data-title="When to use what">

- **LSA**: Quick exploration, large-scale semantic search
- **LDA**: When you need interpretable topics

</div>

---
<!-- _class: scale-80 -->

# Visualizing embeddings with UMAP

**Project high-dimensional vectors to 2D:**

```python
import umap

# Reduce from 100D to 2D
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, metric='cosine')
embeddings_2d = reducer.fit_transform(word_embeddings)

# Plot - similar words cluster together!
plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1])
for i, word in enumerate(words_to_plot):
    plt.annotate(word, (embeddings_2d[i, 0], embeddings_2d[i, 1]))
```

<div class="note-box" data-title="What you should see">

Sports words cluster together, tech words cluster together, etc. — even though we never told the model about categories!

</div>

---
<!-- _class: scale-80 -->

# Discussion: Does this capture "meaning"?

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Arguments For:**
- Captures semantic similarity
- Works well in practice
- Aligns with linguistic theory
- Scalable to large corpora

</div>
<div style="flex: 1;">

**Arguments Against:**
- Text-only (no grounding)
- Missing embodied experience
- No common sense reasoning
- Reflects biases in data

</div>
</div>

<div class="warning-box" data-title="The Symbol Grounding Problem">

"How can meaning be intrinsic to the system, rather than parasitic on the meanings in our heads?" — Harnad (1990)

</div>

---
<!-- _class: scale-85 -->

# Summary

**What we learned:**

1. **Distributional Hypothesis:** Words in similar contexts have similar meanings
2. **LSA:** SVD on term-document matrix → dense embeddings
3. **LDA:** Probabilistic topic modeling → interpretable topics
4. **Visualization:** UMAP reveals semantic structure

<div class="note-box" data-title="Limitation">

These are **static** embeddings — one vector per word, no context!

</div>

**Tomorrow:** Neural word embeddings (Word2Vec, GloVe, FastText)

---

# Key references

**Classic Papers:**
- Deerwester et al. (1990). "Indexing by Latent Semantic Analysis"
- Blei et al. (2003). "Latent Dirichlet Allocation"

**Tools:**
- Scikit-learn: `TruncatedSVD`, `LatentDirichletAllocation`
- Gensim: `LsiModel`, `LdaModel`

<div class="tip-box" data-title="Try it out!">

Check out the [Topic Modeling demo](https://contextlab.github.io/llm-course/demos/topic-modeling/)

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

<div class="tip-box" data-title="See you tomorrow!">

Friday we dive into neural word embeddings!

</div>
