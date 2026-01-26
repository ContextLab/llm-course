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

1. Understand Word2Vec (CBOW and Skip-gram)
2. Explain how negative sampling makes training efficient
3. Compare Word2Vec, GloVe, and FastText
4. Use word embeddings to solve analogies and compute similarities
5. Recognize biases in word embeddings

</div>

<div class="definition-box" data-title="The Word2Vec revolution">

[Word2Vec](https://arxiv.org/abs/1301.3781) showed that neural networks can
learn powerful semantic representations from raw text alone.

</div>

---

# From **count-based** to **prediction-based** embeddings

<div class="example-box" data-title="Count-based methods (LSA, LDA)">

- Input: term-document matrices
- Uses term co-occurrence statistics across documents
- Captures **global** patterns and linear relationships

</div>

<div class="note-box" data-title="Prediction-based methods (Word2Vec)">

- Input: raw text sequences
- Learn to predict context from word (and vice versa)
- Use **local** context to learn embeddings
- Captures non-linear relationships

</div>

<div class="tip-box" data-title="Core difference">

Beyond the implementation details, there is an even more fundamental difference between the two classes of approaches. Whereas count-based methods learn by counting (where embeddings are the end goal), prediction-based methods like Word2Vec learn by predicting; the embeddings come "for free" as a consequence of learning to predict.

</div>

---

# Word2Vec: words that appear in similar contexts should have similar embeddings

<div class="definition-box" data-title="Context">

In NLP, **context** refers to the words surrounding a target word within a specified window size (i.e., number of preceding and proceeding words/tokens).

</div>

<div class="example-box" data-title="Example context window">

"The quick brown **[TARGET]** jumped over the lazy dog"

**Context:** [The, quick, brown, jumped, over, the, lazy, dog]
**Target:** fox

</div>

<div class="note-box" data-title="Key idea">

- Train a model to predict target from context (or vice versa)
- The learned **weights** become our embedding vectors!
- We don't actually care about the prediction task; we just want the embeddings!

</div>

---

# CBOW: Continuous Bag of Words

<div class="definition-box" data-title="CBOW architecture">

Given context words, predict the center word

</div>

<div class="example-box" data-title="Example">

**Input:** "the, cat, on, the" &rarr; **Predict:** "sat"

</div>

<div class="note-box" data-title="Characteristics">

- Quick training (averages context vectors)
- Better performance for frequent words (word appears in many contexts)
- Smooths over distributional information

</div>

---

# Skip-gram

<div class="definition-box" data-title="Skip-gram architecture">

Given center word, predict the context words

</div>

<div class="example-box" data-title="Example">

**Input:** "sat" &rarr; **Predict:** "the, cat, on, the"

</div>

<div class="note-box" data-title="Characteristics">

- Slower than CBOW but often results in better quality embeddings
- Better performance for rare words (more focus on specific contexts where the word appears)
- **Most commonly used** in practice

</div>

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

**Skip-gram training pairs** (target &rarr; context):
```
(The, cat), (The, sat), (cat, The), (cat, sat), (cat, on), ...
```

---

# The efficiency problem

<div class="warning-box" data-title="Challenge">

Softmax over entire vocabulary is expensive!

</div>

$$P(w_{context}|w_{center}) = \frac{\exp(v_{context}^T v_{center})}{\sum_{w=1}^V \exp(v_w^T v_{center})}$$

For 100k vocabulary: 100k exponentials per training example!

---

# Solution: Negative sampling

<div class="definition-box" data-title="Key insight">

Instead of predicting across all words, create binary classification:
- **Positive:** Actual context word (label = 1)
- **Negative:** $k$ random words (label = 0)

</div>

<div class="tip-box" data-title="Efficiency gain">

Training becomes $O(k)$ instead of $O(V)$!

Typical $k$: 5&ndash;20 negative samples per positive example.

</div>

---
<!-- _class: scale-80 -->

# Negative sampling example

**Training pair:** ("cat", "sat") &mdash; cat is center, sat is context

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

---

# The famous result: vector arithmetic

$$\overrightarrow{\text{King}} - \overrightarrow{\text{Man}} + \overrightarrow{\text{Woman}} \approx \overrightarrow{\text{Queen}}$$

<div class="example-box" data-title="Other analogies">

- $\overrightarrow{\text{Paris}} - \overrightarrow{\text{France}} + \overrightarrow{\text{Italy}} \approx \overrightarrow{\text{Rome}}$
- $\overrightarrow{\text{Walking}} - \overrightarrow{\text{Walk}} + \overrightarrow{\text{Swim}} \approx \overrightarrow{\text{Swimming}}$
- $\overrightarrow{\text{Bigger}} - \overrightarrow{\text{Big}} + \overrightarrow{\text{Small}} \approx \overrightarrow{\text{Smaller}}$

</div>

<div class="note-box" data-title="Why does this work?">

Subtracting "man" removes the "male" component; adding "woman" adds the "female" component. Result: "female royal" = queen!

</div>

<div class="important-box" data-title="Deeper insight">

By learning embeddings that predict context, Word2Vec ends up capturing how each word relates to the contexts in which it appears. It's like each word has some "pull" on the surrounding words (and vice versa). When we do vector arithmetic, we're manipulating these "pulls" to find words that fit the same relational pattern.

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

# GloVe: Global Vectors

<div class="note-box" data-title="Further reading">

[**Pennington, Socher, and Manning (2014, *EMNLP*)**](https://aclanthology.org/D14-1162/) GloVe: Global Vectors for Word Representation.

</div>

<div class="definition-box" data-title="Key insight">

Ratios of co-occurrence probabilities encode meaning better than raw probabilities!

</div>

---
<!-- _class: scale-85 -->

# How does GloVe work?

<div class="example-box" data-title="Example: how ratios reveal meaning">

| Probe word | P(w\|ice) | P(w\|steam) | Ratio |
|------------|-----------|-------------|-------|
| solid | high | low | >> 1 |
| gas | low | high | << 1 |
| water | high | high | ~ 1 |

</div>

<div class="note-box" data-title="What GloVe does">

GloVe learns word vectors whose dot product relates to co-occurrence probability:

$$\vec{w}_i^T \vec{w}_j \approx \log P(i,j)$$

</div>

---
<!-- _class: scale-70 -->

# FastText: leveraging *subword information*

<div class="note-box" data-title="Further reading">

[**Bojanowski, Grave, Joulin, and Mikolov (2017, *TACL*)**](https://aclanthology.org/Q17-1010/) Enriching word vectors with subword information.

</div>

<div class="definition-box" data-title="Subword information">

Subword information refers to the smaller components that make up words, such as character n-grams, prefixes, suffixes, and morphemes. These components can provide valuable insights into the meaning and structure of words, especially for rare or out-of-vocabulary terms.

</div>

<div class="warning-box" data-title="The Out-of-Vocabulary (OOV) Problem">

Word2Vec and GloVe give ONE vector per word:
- New word? Unknown!
- Misspelling? Unknown!
- Rare morphological form? Unknown!

But "running", "runner", "runnable" share morphology, and we can exploit that!

</div>

<div class="tip-box" data-title="Remember...">

Remember back to when we introduced tokens made up of subword units (like Byte Pair Encoding)? FastText takes advantage of this idea by breaking words down into smaller parts, allowing it to create embeddings for words it hasn't seen before.

</div>

---

# FastText: character n-grams

<div class="definition-box" data-title="Character n-grams">

Character n-grams are contiguous sequences of 'n' characters extracted from a word. 

</div>

<div class="example-box" data-title="Example: character n-grams for 'where'">

Character trigrams: `<wh, whe, her, ere, re>`

Word vector = average of n-gram vectors:

$$\vec{w}_{where} = \frac{1}{6}(\vec{z}_{<wh} + \vec{z}_{whe} + \vec{z}_{her} + \vec{z}_{ere} + \vec{z}_{re>} + \vec{z}_{<where>})$$

</div>

<div class="tip-box" data-title="Why is this useful?">

- **Handles OOV words!** Can generate vectors for words never seen in training
- **Captures morphology:** "unhappiness" shares n-grams with "unhappy", "happiness"
- **Great for morphologically rich languages:** German, Turkish, Finnish
- **Robust to typos:** misspellings share many n-grams with correct spellings

</div>

---

# Bias in word embeddings

<div class="warning-box" data-title="Critical issue">

Embeddings learn biases from training data!

</div>

<div class="example-box" data-title="Gender bias examples">

- $\overrightarrow{\text{Man}} : \overrightarrow{\text{Computer programmer}} :: \overrightarrow{\text{Woman}} : \overrightarrow{\text{Homemaker}}$
- $\overrightarrow{\text{Man}} : \overrightarrow{\text{Doctor}} :: \overrightarrow{\text{Woman}} : \overrightarrow{\text{Nurse}}$

</div>

---
<!-- _class: scale-80 -->

# Estimating bias

<div class="example-box" data-title="Example: estimating term-specific gender bias">

```python
def gender_bias_score(word):
    return model.similarity(word, 'man') - model.similarity(word, 'woman')

# Results from Google News Word2Vec:
# programmer: +0.091 (toward man)
# nurse: -0.109 (toward woman)
```

</div>

<div class="important-box" data-title="Why this matters">

Embeddings used in hiring tools, search, and recommendations can perpetuate bias!

</div>

---

# Summary

<div class="note-box" data-title="What we learned">

1. **Word2Vec (2013):** neural revolution &mdash; predict context from words
   - Skip-gram most common, negative sampling for efficiency
2. **GloVe (2014):** global co-occurrence statistics
3. **FastText (2017):** character n-grams handle OOV
4. **Bias:** embeddings reflect training data biases

</div>

<div class="tip-box" data-title="An important limitation to think about...">

Word embeddings are fundamentally **static**: each word has a single vector representation, regardless of context. This means they cannot capture the different meanings a word might have in different sentences (e.g., "bank" as a financial institution vs. "bank" as the side of a river). Contextual embeddings (like ELMo, BERT) address this limitation by generating word representations that depend on the surrounding words.

</div>

---

# Assignment 3: Wikipedia Embeddings

<div class="note-box" data-title="What you'll do">

- Implement **10+ embedding methods** (LSA, Word2Vec, GloVe, FastText, SBERT, BGE, E5, ...)
- Visualize with **UMAP, clustering, and DataMapPlot**
- Evaluate via **document matching** (can embeddings match first/second halves?)
- Write some **reflection essays** on trade-offs and meaning

</div>

<div class="tip-box" data-title="Due: February 2, 11:59 PM EST">

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

<div class="tip-box" data-title="Up next...">

Contextual embeddings (ELMo, BERT)! These models construct embeddings based on the entire sentence, allowing for context-sensitive representations.

</div>
