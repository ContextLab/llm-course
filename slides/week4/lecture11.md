---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 11: Word embeddings
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will">

1. Understand Word2Vec architectures (CBOW and Skip-gram)
2. Explain how negative sampling makes training efficient
3. Compare Word2Vec, GloVe, and FastText
4. Apply word embeddings for analogies and similarity
5. Recognize biases in word embeddings

</div>

<div class="definition-box" data-title="The 2013 revolution">

Word2Vec showed that neural networks can learn powerful semantic representations from raw text alone.

</div>

---
<!-- _class: scale-90 -->

# From count-based to prediction-based

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Count-Based (LSA, LDA):**
- Build co-occurrence matrix
- Apply matrix factorization
- Global statistics
- Linear relationships

</div>
<div style="flex: 1;">

**Prediction-Based (Word2Vec):**
- Predict context from word
- Train neural network
- Local context windows
- Non-linear relationships

</div>
</div>

<div class="tip-box" data-title="Key difference">

Word2Vec learns by predicting — the embeddings are a byproduct!

</div>

---
<!-- _class: scale-90 -->

# Word2Vec: Core intuition

*Words that appear in similar contexts should have similar representations*

<div class="example-box" data-title="Context window">

"The quick brown **[TARGET]** jumped over the lazy dog"

**Context:** [The, quick, brown, jumped, over, the, lazy, dog]
**Target:** fox

</div>

**Key Idea:**
- Train a model to predict target from context (or vice versa)
- The learned **weights** become our word vectors!
- We don't care about the prediction task — we want the embeddings!

---

# CBOW vs. Skip-gram

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**CBOW (Continuous Bag of Words):**
- Given context → predict center word
- "the, cat, on, the" → "sat"
- Faster to train
- Better for frequent words

</div>
<div style="flex: 1;">

**Skip-gram:**
- Given center word → predict context
- "sat" → "the, cat, on, the"
- Slower but better quality
- Better for rare words
- **Most commonly used**

</div>
</div>

```
Skip-gram objective: maximize P(context | center)
```

---
<!-- _class: scale-80 -->

# Context windows: worked example

**Sentence:** "The cat sat on the mat" | **Window size = 2**

```
Position 0: "The" → Context: [cat, sat]
Position 1: "cat" → Context: [The, sat, on]
Position 2: "sat" → Context: [The, cat, on, the]
Position 3: "on"  → Context: [cat, sat, the, mat]
Position 4: "the" → Context: [sat, on, mat]
Position 5: "mat" → Context: [on, the]
```

**Skip-gram training pairs** (target → context):
```
(The, cat), (The, sat), (cat, The), (cat, sat), (cat, on), ...
```

---
<!-- _class: scale-85 -->

# The efficiency problem

**Challenge:** Softmax over entire vocabulary is expensive!

$$P(w_{context}|w_{center}) = \frac{\exp(v_{context}^T v_{center})}{\sum_{w=1}^V \exp(v_w^T v_{center})}$$

For 100k vocabulary: 100k exponentials per training example!

<div class="warning-box" data-title="Solution: Negative Sampling">

Instead of predicting across all words, create binary classification:
- **Positive:** Actual context word (label = 1)
- **Negative:** K random words (label = 0)

Training becomes O(k) instead of O(V)!

</div>

---
<!-- _class: scale-80 -->

# Negative sampling example

**Training pair:** ("cat", "sat") — cat is center, sat is context

```python
# Positive sample: Does "sat" appear near "cat"? YES (label=1)
positive_pair = ("cat", "sat", label=1)

# Negative samples: Random words that DON'T appear near "cat"
negative_pairs = [
    ("cat", "algorithm", label=0),
    ("cat", "president", label=0),
    ("cat", "quantum", label=0),
]

# Train binary classifier: Is this a real context pair?
# Instead of 100k-way softmax → just 4 binary predictions!
```

**Typical k:** 5-20 negative samples per positive

---

# The famous result: vector arithmetic

$$\vec{king} - \vec{man} + \vec{woman} \approx \vec{queen}$$

<div class="example-box" data-title="Other analogies">

- $\vec{Paris} - \vec{France} + \vec{Italy} \approx \vec{Rome}$
- $\vec{walking} - \vec{walk} + \vec{swim} \approx \vec{swimming}$
- $\vec{bigger} - \vec{big} + \vec{small} \approx \vec{smaller}$

</div>

<div class="note-box" data-title="Why does this work?">

Subtracting "man" removes the "male" component; adding "woman" adds the "female" component. Result: "female royal" = queen!

</div>

---
<!-- _class: scale-70 -->

# Word2Vec in Python

```python
from gensim.models import Word2Vec
import gensim.downloader as api

# Load pre-trained model (3B words, 300 dimensions)
model = api.load('word2vec-google-news-300')

# Find similar words
model.most_similar('computer', topn=5)
# [('computers', 0.72), ('laptop', 0.69), ('PC', 0.68), ...]

# Word analogies: king - man + woman = ?
model.most_similar(positive=['king', 'woman'], negative=['man'], topn=1)
# [('queen', 0.71)]

# Train your own
sentences = [['the', 'cat', 'sat'], ['the', 'dog', 'ran']]
custom_model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, sg=1)
```

---
<!-- _class: scale-75 -->

# GloVe: Global Vectors

**Combining count-based and prediction-based methods**

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Key Insight:**
Ratios of co-occurrence probabilities encode meaning better than raw probabilities!

| Probe | P(w\|ice) | P(w\|steam) | Ratio |
|-------|-----------|-------------|-------|
| solid | high | low | >> 1 |
| gas | low | high | << 1 |
| water | high | high | ~ 1 |

</div>
<div style="flex: 1;">

**GloVe learns:**

$$\vec{w}_i^T \vec{w}_j \approx \log P(i,j)$$

Word vectors whose dot product relates to co-occurrence probability!

</div>
</div>

---
<!-- _class: scale-85 -->

# GloVe vs. Word2Vec

| Aspect | Word2Vec | GloVe |
|--------|----------|-------|
| Approach | Local context windows | Global co-occurrence |
| Training | Online (stochastic) | Batch (matrix factorization) |
| Speed | Medium | Fast for large corpora |
| Quality | Excellent | Excellent |

<div class="tip-box" data-title="In practice">

Similar performance on most tasks! Choose based on:
- Corpus size (GloVe better for very large)
- Training infrastructure (GloVe needs memory for matrix)

</div>

---

# FastText: Subword information

**The Problem:** Word2Vec/GloVe give ONE vector per word

<div class="warning-box" data-title="Out-of-Vocabulary (OOV) Problem">

- New word? Unknown!
- Misspelling? Unknown!
- Rare morphological form? Unknown!

But "running", "runner", "runnable" share morphology!

</div>

**FastText Solution:** Break words into character n-grams

---
<!-- _class: scale-80 -->

# FastText: Character n-grams

**Example: "where" (with n=3)**

Character trigrams: `<wh, whe, her, ere, re>`

Word vector = average of n-gram vectors:

$$\vec{w}_{where} = \frac{1}{6}(\vec{z}_{<wh} + \vec{z}_{whe} + \vec{z}_{her} + \vec{z}_{ere} + \vec{z}_{re>} + \vec{z}_{<where>})$$

<div class="tip-box" data-title="Benefits">

- Handles OOV words!
- Captures morphology ("unhappiness" shares n-grams with "unhappy", "happiness")
- Great for morphologically rich languages (German, Turkish, Finnish)
- Robust to typos

</div>

---
<!-- _class: scale-85 -->

# Method comparison

| Method | Year | OOV Handling | Best For |
|--------|------|--------------|----------|
| LSA | 1990 | No | Topic modeling |
| LDA | 2003 | No | Interpretable topics |
| Word2Vec | 2013 | No | General NLP |
| GloVe | 2014 | No | Large corpora |
| FastText | 2017 | Yes! | Morphology-rich languages |

<div class="note-box" data-title="Typical dimensions">

50-300 dimensions (100-300 most common for best quality)

</div>

---
<!-- _class: scale-80 -->

# Bias in word embeddings

**Embeddings learn biases from training data**

<div class="warning-box" data-title="Gender bias examples">

- $\vec{man} : \vec{computer\ programmer} :: \vec{woman} : \vec{homemaker}$
- $\vec{man} : \vec{doctor} :: \vec{woman} : \vec{nurse}$

</div>

```python
def gender_bias_score(word):
    return model.similarity(word, 'man') - model.similarity(word, 'woman')

# Results from Google News Word2Vec:
# programmer: +0.091 (toward man)
# nurse: -0.109 (toward woman)
```

<div class="important-box" data-title="Why this matters">

Embeddings used in hiring tools, search, recommendations can perpetuate bias!

</div>

---
<!-- _class: scale-80 -->

# Practical tips

1. **Start with pre-trained models**
   - Word2Vec: Google News (300d, 3B words)
   - GloVe: Common Crawl (300d, 840B tokens)
   - FastText: 157 languages available

2. **Use cosine similarity** (not Euclidean distance)
   $$\text{sim}(u,v) = \frac{u \cdot v}{||u|| \cdot ||v||}$$

3. **Be aware of biases** — test for bias, consider debiasing techniques

4. **Remember limitations** — static (one vector per word), no polysemy

---

# Summary

**What we learned:**

1. **Word2Vec (2013):** Neural revolution — predict context from words
   - Skip-gram most common, negative sampling for efficiency
2. **GloVe (2014):** Global co-occurrence statistics
3. **FastText (2017):** Character n-grams handle OOV
4. **Bias:** Embeddings reflect training data biases

<div class="note-box" data-title="Key limitation">

Static embeddings: one vector per word type

**Next week:** Contextual embeddings (ELMo, BERT) solve polysemy!

</div>

---
<!-- _class: scale-75 -->

# Key references

**Foundational Papers:**
- Mikolov et al. (2013). "Efficient Estimation of Word Representations"
- Pennington et al. (2014). "GloVe: Global Vectors for Word Representation"
- Bojanowski et al. (2017). "Enriching Word Vectors with Subword Information"

**Tools:**
- Gensim: `Word2Vec`, `FastText` | Pre-trained: `gensim.downloader`

<div class="tip-box" data-title="Try it out!">

[Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/) | [Word Analogies](https://contextlab.github.io/llm-course/demos/analogies/)

</div>

---
<!-- _class: scale-90 -->

# Assignment 3: Wikipedia Embeddings

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Apply this week's concepts:**
- Train embeddings on Wikipedia data
- Compare LSA vs. Word2Vec
- Explore semantic relationships
- Visualize with UMAP

</div>
<div style="flex: 1;">

**Think about:**
- How does corpus size affect quality?
- What analogies work? What fails?
- Can you detect bias?

</div>
</div>

<div class="tip-box" data-title="Link">

[Assignment 3: Wikipedia Embeddings](https://contextlab.github.io/llm-course/assignments/assignment-3/)

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

<div class="tip-box" data-title="Week 3 complete!">

Next week: Contextual embeddings and dimensionality reduction!

</div>
