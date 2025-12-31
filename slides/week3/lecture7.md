---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication - Week 3'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Classic Embeddings: LSA \& LDA
## Lecture 7: The Foundations of Distributional Semantics

**PSYC 51.07: Models of Language and Communication - Week 3**

Winter 2026

---

# Today's Lecture 📋



1. 🧠 **The Distributional Hypothesis**
2. 📊 **Vector Space Models**
3. 📚 **Latent Semantic Analysis (LSA)**
4. 🎲 **Latent Dirichlet Allocation (LDA)**
5. 🎨 **Modern Topic Modeling: BERTopic**
6. 🔍 **Evaluation & Applications**

*Goal: Understand how classic methods represent meaning through co-occurrence*

---

# The Fundamental Question 🤔



**How do we represent the meaning of words in a way that computers can understand?**

\pause

<div class="columns">
<div class="column">

**Traditional Approach:**
- Dictionaries
- Taxonomies (WordNet)
- Manual feature engineering
- Knowledge bases

 Labor-intensive, hard to scale

</div>
<div class="column">

**Distributional Approach:**
- Learn from data
- Context-based
- Scalable
- Unsupervised

 Let the data tell us what words mean!

</div>
</div>


---

# The Distributional Hypothesis 📖



*"You shall know a word by the company it keeps"*

--- J.R. Firth (1957)

\pause

**Key Idea:**
Words that appear in similar contexts tend to have similar meanings.

<div class="callout tip">
<div class="callout-title">Example</div>

- "The **cat** sat on the mat"
- "The **dog** sat on the mat"
- "The **kitten** sat on the mat"

$\rightarrow$ *cat*, *dog*, *kitten* are semantically related

</div>

*Reference: Firth, J.R. (1957). "A synopsis of linguistic theory 1930-1955"*

---

# From Words to Vectors 🗺️


**Goal:** Represent each word as a point in high-dimensional space

<!-- Flowchart - manual conversion needed -->

**Problem:** Real vocabularies have 10,000+ words, contexts are even more numerous!

$\rightarrow$ We need **dimensionality reduction** 📉

---

# Building a Term-Document Matrix 📊


**Step 1:** Count how often each word appears in each document

| cat | 0 | 4 | 1 | 0 |
| --- | --- | --- | --- | --- |
| computer | 0 | 0 | 0 | 5 |
| code | 0 | 0 | 0 | 3 |
| animal | 2 | 3 | 2 | 0 |

**Issues:**
- Very sparse (mostly zeros)
- High dimensional (vocab size × doc count)
- Doesn't capture semantic relationships

\pause

 Apply TF-IDF weighting and dimensionality reduction!

---

# TF-IDF Weighting ⚖️


**Term Frequency - Inverse Document Frequency**

(t,d) = (t,d) \times (t)

<div class="columns">
<div class="column">

**Term Frequency (TF):**

(t,d) = (t,d)}{\sum_{t'} (t',d)}

How often does term $t$ appear in document $d$?

*Rewards frequent terms in document*

</div>
<div class="column">

**Inverse Document Frequency (IDF):**

(t) = \log {|{d : t \in d}|}

How rare is term $t$ across all documents?

*Penalizes common words like "the", "and"*

</div>
</div>

<div class="callout tip">
<div class="callout-title">Intuition</div>

Important words appear frequently in a document but rarely across all documents

</div>


---

# Latent Semantic Analysis (LSA) 📚


**The OG of semantic embeddings (1990)**

<div class="columns">
<div class="column">

**Algorithm:**
1. Build term-document matrix $X$
2. Apply TF-IDF weighting
3. Perform SVD: $X = U\Sigma V^T$
4. Keep top $k$ dimensions
5. Use $U_k$ as word embeddings

**Key Innovation:**
- Discovers latent topics
- Solves synonymy problem
- Matrix factorization
- Captures semantic similarity

</div>
<div class="column">

<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

    % Term-Document Matrix
    
    
    
    

    % SVD
    

    % U
    
    

    % Sigma
    
    

    % V^T
    
    
...
-->

```
[Diagram placeholder - manual conversion required]
```

**Matrix Interpretation:**
- $U$: word-topic associations
- $\Sigma$: topic strengths
- $V^T$: topic-document associations

</div>
</div>

*Reference: Deerwester et al. (1990) - "Indexing by Latent Semantic Analysis"*

---

# LSA: How It Works 🔍


**Example: Discovering latent topics**

<div class="columns">
<div class="column">

**Original Dimensions:**
- 50,000 terms
- 10,000 documents
- Matrix: 50k × 10k
- Sparse and noisy

**After LSA:**
- 100-300 latent dimensions
- Dense representation
- Captures semantic patterns
- Easier to compute

</div>
<div class="column">

**Discovered Topics (example):**

<div class="callout info">
<div class="callout-title">Topic 1: Technology</div>

computer (0.8), software (0.7), code (0.6), algorithm (0.5)

</div>

<div class="callout info">
<div class="callout-title">Topic 2: Animals</div>

dog (0.9), cat (0.8), pet (0.7), animal (0.6)

</div>

<div class="callout info">
<div class="callout-title">Topic 3: Sports</div>

game (0.8), team (0.7), player (0.6), win (0.5)

</div>

Words with similar topic distributions are semantically similar!

</div>
</div>


---

# LSA Limitations ⚠️


<div class="columns">
<div class="column">

**Computational Issues:**
- SVD is expensive: $O(min(nm^2, n^2m))$
- Hard to update with new documents
- Memory intensive for large corpora

**Modeling Issues:**
- Linear relationships only
- Bag-of-words (loses word order)
- No polysemy handling
- Negative values (hard to interpret)

</div>
<div class="column">

**Example Problem: Polysemy**

<div class="callout tip">
<div class="callout-title">Word: "bank"</div>

1. Financial institution
2. River bank
3. Banking (airplane maneuver)

</div>

LSA gives  for all meanings!

**But...**
- Still useful for many tasks
- Foundation for modern methods
- Fast for medium-sized corpora

</div>
</div>


---

# Latent Dirichlet Allocation (LDA) 🎲


**A probabilistic approach to topic modeling**

*What if we model documents as probabilistic mixtures of topics?*

<div class="columns">
<div class="column">

**Key Assumptions:**
1. Each document is a mixture of topics
2. Each topic is a distribution over words
3. The mixture proportions vary per document

**Advantages over LSA:**
- Probabilistic interpretation
- Non-negative weights
- Better for topic discovery
- More interpretable

</div>
<div class="column">

```
Topic 1 -> Topic 2 -> Topic 3 -> sports, game -> tech, code -> animal, pet
```

</div>
</div>

*Reference: Blei et al. (2003) - "Latent Dirichlet Allocation"*

---

# LDA: The Generative Story 📖


**How LDA imagines documents are created:**

<div class="columns">
<div class="column">

**Generative Process:**
1. Choose number of topics $K$
2. For each topic $k$:
    - Draw word distribution $\phi_k \sim (\beta)$
3. For each document $d$:
    - Draw topic distribution $\theta_d \sim (\alpha)$
- For each word position $n$:
        
- Choose topic $z_{dn} \sim (\theta_d)$
- Choose word $w_{dn} \sim (\phi_{z_{dn}})$

</div>
<div class="column">

**Key Parameters:**
- $\alpha$: Document-topic density
    
- Low $\alpha$ $\rightarrow$ few topics per doc
- High $\alpha$ $\rightarrow$ many topics per doc

    \item $\beta$: Topic-word density
    - Low $\beta$ $\rightarrow$ focused topics
- High $\beta$ $\rightarrow$ general topics

**Inference:**
- Given documents, infer topics
- Use Gibbs sampling or variational inference
- Iterative process

</div>
</div>


---

# LDA in Practice 💻


```python
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer

# Prepare documents
documents = [
    "The cat sat on the mat",
    "The dog ran in the park",
    "Machine learning is amazing",
    # ... more documents
]

# Create bag-of-words representation
vectorizer = CountVectorizer(max_features=1000, stop_words='english')
doc_term_matrix = vectorizer.fit_transform(documents)
vocab = vectorizer.get_feature_names_out()

# Fit LDA model
lda = LatentDirichletAllocation(
    n_components=10,  # number of topics
    random_state=42,
    max_iter=50
)

doc_topics = lda.fit_transform(doc_term_matrix)

# Print top words per topic
for idx, topic in enumerate(lda.components_):
    top_words = [vocab[i] for i in topic.argsort()[-10:]]
    print(f"Topic {idx}: {', '.join(top_words)}")
```


---

# LDA Example: Topic Discovery 🔍



**Example Topics from News Corpus:**

<div class="callout info">
<div class="callout-title">Topic 1: Politics (20%)</div>

`government, election, president, vote, policy, senate, congress, party`

</div>

<div class="callout info">
<div class="callout-title">Topic 2: Sports (15%)</div>

`game, team, player, score, win, season, coach, championship`

</div>

<div class="callout info">
<div class="callout-title">Topic 3: Technology (25%)</div>

`software, computer, data, algorithm, system, internet, code, AI`

</div>

<div class="callout info">
<div class="callout-title">Topic 4: Finance (40%)</div>

`market, stock, price, investment, economy, trade, bank, profit`

</div>

**Document representation:** [0.20, 0.15, 0.25, 0.40] $\leftarrow$ mainly finance

---

# Modern Topic Modeling: BERTopic 🎨


**Combining neural embeddings with topic models**

<div class="columns">
<div class="column">

**BERTopic Pipeline:**
1. Embed documents with BERT
2. Reduce dimensionality with UMAP
3. Cluster with HDBSCAN
4. Generate topics via c-TF-IDF
5. Fine-tune with MaximalMarginalRelevance

**Advantages:**
- Leverages pre-trained models
- Better semantic understanding
- Automatic topic number detection
- Dynamic topic modeling
- Hierarchical topics

</div>
<div class="column">

```python
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer

# Initialize
embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

model = BERTopic(
    embedding_model=embedding_model,
    language="english",
    calculate_probabilities=True,
    verbose=True
)

# Fit and transform
topics, probs = model.fit_transform(
    documents
)

# Get topic info
topic_info = model.get_topic_info()

# Visualize
fig = model.visualize_topics()
```

</div>
</div>

*Reference: Grootendorst (2022) - "BERTopic: Neural topic modeling with a class-based TF-IDF procedure"*

---

# LSA vs. LDA vs. BERTopic 📊



| Interpretability | Medium | High | High |
| --- | --- | --- | --- |
| Topic coherence | Medium | High | Very High |
| Computation | Fast | Medium | Slow |
| Scalability | Good | Good | Medium |
| Pre-training | No | No | Yes |
| Hyperparameters | Few | Many | Many |
| Topic number | Fixed | Fixed | Automatic |

<div class="callout info">
<div class="callout-title">Recommendations</div>

- **LSA**: Quick exploration, large-scale retrieval
- **LDA**: Interpretable topics, when you know topic count
- **BERTopic**: State-of-the-art quality, exploratory analysis

</div>


---

# Evaluating Topic Models 📏


<div class="columns">
<div class="column">

**Intrinsic Metrics:**
- **Perplexity:** Lower is better
    
- Measures likelihood
- Can be misleading!

    \item **Topic Coherence:** Higher is better
    - Measures semantic similarity
- Better correlation with human judgment
- CV, UCI, UMass variants

    \item **Topic Diversity:**
    - Unique words across topics
- Avoids redundant topics

</div>
<div class="column">

**Extrinsic Metrics:**
- Document classification accuracy
- Information retrieval performance
- Clustering quality

**Human Evaluation:**
- Topic interpretability
- Word intruder detection
- Topic utility for task

<div class="callout warning">
<div class="callout-title">Important</div>

Perplexity $≠$ usefulness!
Always check topic coherence and interpretability.

</div>

</div>
</div>


---

# Applications of Classic Embeddings 🚀


1. **Information Retrieval**
    - Semantic search
- Document similarity
- Query expansion
2. **Document Organization**
    - Clustering
- Topic discovery
- Trend analysis
3. **Text Mining**
    - Opinion mining
- Literature review
- Knowledge discovery
4. **Preprocessing**
    - Feature reduction for ML
- Noise reduction
- Transfer learning

**Real-world examples:**
- Academic paper recommendations (LSA)
- News article categorization (LDA)
- Social media trend detection (BERTopic)


---

# Discussion Question 💬



**Can distributional semantics truly capture meaning?**

<div class="columns">
<div class="column">

**Arguments For:**
- Captures semantic similarity
- Works well in practice
- Aligns with linguistic theory
- Scalable to large corpora
- Unsupervised learning

</div>
<div class="column">

**Arguments Against:**
- Text-only (no grounding)
- Missing embodied experience
- No common sense reasoning
- Cultural context limited
- Reflects biases in data

</div>
</div>

<div class="callout warning">
<div class="callout-title">The Symbol Grounding Problem</div>

"How can the semantic interpretation of a formal symbol system be made intrinsic to the system, rather than just parasitic on the meanings in our heads?" - Stevan Harnad (1990)

</div>

*Reference: Harnad, S. (1990). "The symbol grounding problem"*

---

# Practical Tips 💡


1. **Preprocessing Matters:**
    - Remove stopwords (but not always!)
- Lemmatization vs. stemming
- Handle punctuation carefully
- Consider bigrams/trigrams
2. **Choosing Parameters:**
    - Start with 10-50 topics for LDA
- Use perplexity for model selection
- Validate with coherence scores
- Try multiple random seeds
3. **Interpreting Results:**
    - Look at top 10-20 words per topic
- Examine representative documents
- Check for duplicate/junk topics
- Visualize with pyLDAvis
4. **When to Use What:**
    - LSA: Fast exploration, search
- LDA: Interpretable topics
- BERTopic: Best quality, latest research


---

# Summary 🎯


**What we learned today:**

1. **Distributional Hypothesis:** Words in similar contexts have similar meanings
2. **LSA (1990):**
    - SVD on term-document matrix
- Linear dimensionality reduction
- Fast but limited interpretability
3. **LDA (2003):**
    - Probabilistic topic modeling
- Documents as mixtures of topics
- Highly interpretable
4. **BERTopic (2022):**
    - Neural embeddings + clustering
- State-of-the-art coherence
- Automatic topic detection
5. **Evaluation:** Coherence $>$ perplexity
6. **Limitation:** Static representations, no grounding

**Next: Neural word embeddings (Word2Vec, GloVe, FastText)!**


---

# Key References 📚



**Classic Papers:**
- Firth, J.R. (1957). "A synopsis of linguistic theory 1930-1955"
- Deerwester et al. (1990). "Indexing by Latent Semantic Analysis"
- Blei et al. (2003). "Latent Dirichlet Allocation"
- Harnad, S. (1990). "The symbol grounding problem"

**Modern Extensions:**
- Boleda, G. (2020). "Distributional Semantics and Linguistic Theory"
- Grootendorst, M. (2022). "BERTopic: Neural topic modeling with a class-based TF-IDF procedure"
- Grand et al. (2022). "Semantic projection recovers rich human knowledge of multiple object features"

**Tools & Libraries:**
- Scikit-learn: `sklearn.decomposition.TruncatedSVD`, `LatentDirichletAllocation`
- Gensim: `gensim.models.LsiModel`, `LdaModel`
- BERTopic: `https://maartengr.github.io/BERTopic/`


---

# Questions? 🙋



**Next Lecture:**

Word Embeddings: Word2Vec, GloVe, FastText

*From count-based to prediction-based methods!*

