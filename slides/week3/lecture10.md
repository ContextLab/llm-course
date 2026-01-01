---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication'
footer: ''
---

<!-- _class: lead -->

# Lecture 10: X-Hour Embeddings Workshop
## Week 3: Hands-On Dimensionality Reduction and Word Vectors

**PSYC 51.07: Models of Language and Communication**

---

# Learning Objectives

By the end of this session, you will:

1. Implement classic dimensionality reduction (LSA, LDA)
2. Train and analyze Word2Vec embeddings
3. Visualize high-dimensional embeddings using UMAP
4. Compare different embedding methods on real data
5. Understand semantic relationships captured by embeddings

**Workshop format:** Hands-on coding with the 20 Newsgroups dataset

---

# Workshop Overview

**Today's Agenda:**

1. **Part 1:** Why embeddings? From sparse to dense representations
2. **Part 2:** LSA - Latent Semantic Analysis with SVD
3. **Part 3:** LDA - Latent Dirichlet Allocation for topic modeling
4. **Part 4:** Word2Vec - Neural word embeddings
5. **Part 5:** Visualizing embeddings with UMAP
6. **Part 6:** Comparing methods and document classification

**Companion notebook:** `xhour_embeddings_demo.ipynb`

---

# Part 1: Why Embeddings?

**The problem with sparse representations:**

<div class="columns">
<div class="column">

**Last week (BoW, TF-IDF):**
- High dimensional (vocab size)
- Sparse (mostly zeros)
- No semantic similarity
- "dog" and "puppy" are orthogonal

</div>
<div class="column">

**Embeddings:**
- Low dimensional (50-300 dims)
- Dense (all non-zero)
- Similar words cluster together
- "dog" and "puppy" are close!

</div>
</div>

---

# The Magic of Word Vectors

**Famous example:** king - man + woman = queen

<div class="callout info">
<div class="callout-title">Vector Arithmetic</div>

Word embeddings capture semantic relationships as directions in space:
- Gender direction: woman - man
- Royalty direction: king - queen
- Pluralization: words - word

</div>

**Key insight:** Meaning encoded as geometry!

---

# Part 2: Latent Semantic Analysis (LSA)

**Using SVD to find latent topics:**

$$X \approx U_k \Sigma_k V_k^T$$

<div class="columns">
<div class="column">

**Algorithm:**
1. Build TF-IDF matrix $X$
2. Apply Singular Value Decomposition
3. Keep top $k$ dimensions
4. Use $U_k$ as word embeddings

</div>
<div class="column">

**Interpretation:**
- $U$: word-topic associations
- $\Sigma$: topic strengths
- $V^T$: doc-topic associations

</div>
</div>

---

# LSA in Code

```python
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer

# Build TF-IDF matrix
tfidf = TfidfVectorizer(max_features=5000, stop_words='english')
tfidf_matrix = tfidf.fit_transform(documents)

# Apply LSA
lsa = TruncatedSVD(n_components=100, random_state=42)
doc_embeddings = lsa.fit_transform(tfidf_matrix)
word_embeddings = lsa.components_.T

print(f"Explained variance: {lsa.explained_variance_ratio_.sum():.2%}")
```

**Try it:** Find similar words using cosine similarity!

---

# Part 3: LDA for Topic Modeling

**A probabilistic approach:**

<div class="callout tip">
<div class="callout-title">Generative Story</div>

LDA imagines documents are created by:
1. Choosing a mixture of topics
2. For each word, picking a topic
3. Sampling a word from that topic

</div>

**Key difference from LSA:**
- Probabilistic interpretation
- Non-negative weights
- More interpretable topics

---

# LDA Example Output

```python
Topic 0: hockey, game, team, player, season, nhl, play
Topic 1: space, nasa, launch, orbit, shuttle, satellite
Topic 2: computer, software, program, file, windows, system
Topic 3: medical, doctor, patient, disease, health, treatment
Topic 4: government, president, congress, law, political
```

<div class="callout info">

Each document is a **mixture** of topics:
Document #42: 60% Space + 25% Computer + 15% Other

</div>

---

# Part 4: Word2Vec

**Learning embeddings from context:**

<div class="columns">
<div class="column">

**Skip-gram:**
Given target word, predict context

"The **cat** sat on mat"
- cat → the, sat, on

**CBOW:**
Given context, predict target

the, sat, on → **cat**

</div>
<div class="column">

```python
from gensim.models import Word2Vec

model = Word2Vec(
    sentences=tokenized_docs,
    vector_size=100,
    window=5,
    min_count=5,
    sg=1  # Skip-gram
)
```

</div>
</div>

---

# Word2Vec: Semantic Similarity

```python
# Find similar words
model.wv.most_similar('computer', topn=5)
# [('software', 0.82), ('program', 0.79), ('system', 0.75), ...]

# Word analogies
model.wv.most_similar(
    positive=['woman', 'king'],
    negative=['man']
)
# [('queen', 0.71), ...]
```

<div class="callout warning">
<div class="callout-title">Hands-on Exercise</div>

Try creating your own word analogies! What works? What fails?

</div>

---

# Part 5: Visualizing with UMAP

**Projecting 100D → 2D:**

```python
import umap

reducer = umap.UMAP(
    n_neighbors=15,
    min_dist=0.1,
    metric='cosine'
)

embeddings_2d = reducer.fit_transform(word_vectors)
```

**UMAP advantages:**
- Faster than t-SNE
- Preserves global structure
- Better cluster separation

---

# What You Should See

When you visualize embeddings:

<div class="columns">
<div class="column">

**Sports cluster:**
- hockey, baseball, player, team, game

**Space cluster:**
- nasa, shuttle, orbit, launch, space

</div>
<div class="column">

**Tech cluster:**
- computer, software, program, windows

**Medical cluster:**
- doctor, patient, hospital, treatment

</div>
</div>

<div class="callout tip">

Related words should cluster together even though we never told the model they were related!

</div>

---

# Part 6: Comparing Methods

| Method | Speed | Interpretability | Quality | Data Needed |
|--------|-------|------------------|---------|-------------|
| LSA    | Fast  | Medium           | Medium  | Small-Medium |
| LDA    | Medium | High            | Medium  | Medium |
| Word2Vec | Medium | Low           | High    | Large |

**Recommendations:**
- **Quick exploration:** LSA
- **Interpretable topics:** LDA
- **Best semantic quality:** Word2Vec

---

# Document Classification with Embeddings

**Using embeddings as features:**

```python
def document_vector(doc, model):
    """Average word vectors for document."""
    tokens = preprocess(doc)
    vectors = [model.wv[w] for w in tokens if w in model.wv]
    return np.mean(vectors, axis=0) if vectors else np.zeros(100)

# Train classifier
X_train = [document_vector(doc, w2v) for doc in train_docs]
clf = LogisticRegression()
clf.fit(X_train, y_train)
```

**Compare to TF-IDF baseline!**

---

# Key Takeaways

1. **Embeddings capture semantic meaning** - similar words have similar vectors

2. **Different methods, different strengths:**
   - LSA: Fast, linear, interpretable
   - LDA: Probabilistic, topic-focused
   - Word2Vec: Neural, best for similarity

3. **Visualization reveals structure** - UMAP shows semantic clusters

4. **Limitations:**
   - Static (one vector per word, no context)
   - Requires substantial data
   - Can encode biases

**Next week:** Contextual embeddings (BERT, GPT)!

---

# Discussion Questions

1. **Why does vector arithmetic work?** What does "king - man + woman" really mean geometrically?

2. **Bias in embeddings:** If Word2Vec learns from news articles, what biases might it capture?

3. **Window size matters:** What happens with window=2 vs window=10?

4. **Out-of-vocabulary problem:** How do you handle words not in your vocabulary?

5. **When to use what:** For a sentiment analysis task, would you choose LSA, LDA, or Word2Vec?

---

# Next Steps

**For Assignment 2:**
- Use embeddings to improve your classifier
- Compare at least 2 embedding methods
- Visualize your embeddings

**Coming up in Lecture 11:**
- Modern neural word embeddings
- GloVe and FastText
- Subword tokenization

**Office hours:** Available if you need help with the notebook!
