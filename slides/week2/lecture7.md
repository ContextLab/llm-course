---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 7: Text Classification Workshop
### PSYC 51.07: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning Objectives

<div class="note-box" data-title="By the end of this session, you will">

1. Build text classifiers from scratch using scikit-learn
2. Understand different text representation methods (BoW, TF-IDF, embeddings)
3. Compare Naive Bayes, Logistic Regression, and Neural approaches
4. Evaluate classifier performance using appropriate metrics
5. Debug common issues in text classification pipelines

</div>

<div class="tip-box" data-title="Workshop format">

Hands-on coding with the 20 Newsgroups dataset

</div>

---

# Workshop Overview

<div class="definition-box" data-title="Today's agenda">

1. **Part 1:** Loading and exploring real data
2. **Part 2:** Feature engineering for text (BoW, TF-IDF)
3. **Part 3:** Building classifiers (Naive Bayes, Logistic Regression, Neural Networks)
4. **Part 4:** Model comparison and analysis
5. **Part 5:** Error analysis and improvements
6. **Part 6:** Real-world considerations (class imbalance)

</div>

<div class="note-box" data-title="Companion notebook">

`xhour_classification_demo.ipynb`

</div>

---

# Part 1: The 20 Newsgroups Dataset

<div class="definition-box" data-title="A classic text classification benchmark">

- Posts from 20 different newsgroups
- ~20,000 documents total
- Good for learning classification fundamentals

</div>

<div class="example-box" data-title="Today's subset (4 categories)">

- `sci.space` &mdash; Science discussions about space
- `rec.sport.hockey` &mdash; Sports discussions about hockey
- `talk.politics.misc` &mdash; Political discussions
- `comp.graphics` &mdash; Computer graphics

</div>

<div class="tip-box" data-title="Why these?">

Relatively distinct topics for easier learning.

</div>

---

# Loading the Data

```python
from sklearn.datasets import fetch_20newsgroups

categories = [
    'sci.space',
    'rec.sport.hockey',
    'talk.politics.misc',
    'comp.graphics'
]

train_data = fetch_20newsgroups(
    subset='train',
    categories=categories,
    shuffle=True,
    random_state=42,
    remove=('headers', 'footers', 'quotes')  # Remove metadata
)

print(f"Loaded {len(train_data.data)} training documents")
```

---

# Always explore your data before building models

<div class="note-box" data-title="Key questions to ask">

1. How many documents per category?
2. What do the documents look like?
3. What words/phrases might be good indicators?
4. Are there categories that might be hard to distinguish?

</div>

---
<!-- _class: scale-80 -->

# Exploring the Data: Concrete Example

```python
import pandas as pd
from collections import Counter

# Check class distribution
print("Documents per category:")
for i, name in enumerate(train_data.target_names):
    count = (train_data.target == i).sum()
    print(f"  {name}: {count}")
# sci.space: 593, rec.sport.hockey: 600, talk.politics.misc: 465, comp.graphics: 584

# Look at a sample document
idx = [i for i, t in enumerate(train_data.target) if t == 0][0]
print(train_data.data[idx][:500])
# "NASA announced today that the Mars rover has discovered evidence of water..."
```

<div class="tip-box" data-title="Notice">

Classes are roughly balanced (good!), but `talk.politics.misc` has fewer examples.

</div>

---

# Convert text to numbers for machine learning

<div class="note-box" data-title="Three approaches today">

1. **Bag of Words (BoW):** Count word frequencies
2. **TF-IDF:** Weight by document frequency
3. **Dense embeddings:** (Preview for future lectures)

</div>

---

# Bag of Words: count how many times each word appears

```python
from sklearn.feature_extraction.text import CountVectorizer

bow_vectorizer = CountVectorizer(
    max_features=5000,   # Keep only top 5000 words
    min_df=2,            # Word must appear in at least 2 docs
    max_df=0.8,          # Word must appear in <80% of docs
    stop_words='english' # Remove common words
)

X_train_bow = bow_vectorizer.fit_transform(train_data.data)
```

**Result:** Sparse matrix of word counts

---

# Bag of Words: Limitations

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

<div class="tip-box" data-title="What BoW captures">

- Word presence/frequency
- Vocabulary overlap between documents

</div>

</div>
<div style="flex: 1;">

<div class="warning-box" data-title="What BoW ignores">

- Word order ("not good" vs "good not")
- Semantics ("great" vs "excellent")
- Context

</div>

</div>
</div>

<div class="important-box" data-title="Key insight">

Common words dominate but are often uninformative!

</div>

---
<!-- _class: scale-80 -->

# BoW vectors are sparse: mostly zeros

<div class="definition-box" data-title="Example">

```python
from sklearn.feature_extraction.text import CountVectorizer

docs = ["NASA launches rocket to Mars", "Hockey game ends in overtime",
        "NASA discovers water on Mars"]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(docs)

print("Vocabulary:", vectorizer.vocabulary_)
# {'nasa': 5, 'launches': 4, 'rocket': 7, 'to': 8, 'mars': 6, ...}

print("\nDocument 1:", X[0].toarray())
# [0 0 0 0 1 1 1 1 1 0 0 0 0] <- counts for each word
```

</div>

<div class="tip-box" data-title="Observation">

Most entries are 0 (sparse!). Documents share "mars" and "nasa".

</div>

---

# Method 2: TF-IDF

<div class="definition-box" data-title="Term Frequency-Inverse Document Frequency">

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$$

where:
- $\text{TF}(t, d)$ = frequency of term $t$ in document $d$
- $\text{IDF}(t) = \log\frac{N}{\text{df}(t)}$ = inverse document frequency

</div>

<div class="tip-box" data-title="Intuition">

Downweight common words, upweight rare informative words!

</div>

---

# TF-IDF in Practice

```python
from sklearn.feature_extraction.text import TfidfVectorizer

tfidf_vectorizer = TfidfVectorizer(
    max_features=5000,
    min_df=2,
    max_df=0.8,
    stop_words='english',
    use_idf=True,
    sublinear_tf=True  # Use log scaling for term frequency
)

X_train_tfidf = tfidf_vectorizer.fit_transform(train_data.data)
```

**Result:** Sparse matrix of TF-IDF scores

---

# BoW vs TF-IDF Comparison

<div class="example-box" data-title="Same document, different representations">

| Word | BoW Count | TF-IDF Score |
|------|-----------|--------------|
| "the" | 15 | 0.02 (low &mdash; common everywhere) |
| "nasa" | 3 | 0.45 (high &mdash; rare, informative) |
| "space" | 5 | 0.38 (moderate &mdash; distinctive) |

</div>

<div class="tip-box" data-title="Key insight">

TF-IDF identifies the truly distinctive terms!

</div>

---

# Three classifier approaches to compare

<div class="note-box" data-title="Today's candidates">

1. **Naive Bayes:** Fast, probabilistic, good baseline
2. **Logistic Regression:** Linear, interpretable, often best
3. **Neural Network:** Flexible, can learn complex patterns

</div>

---

# Classifier 1: Naive Bayes

<div class="definition-box" data-title="Bayes' theorem with independence assumption">

$$P(y|x) \propto P(y) \prod_{i=1}^n P(x_i|y)$$

</div>

- **Why "naive"?** Assumes features are independent (they're not!)
- **Why does it work?** Despite the wrong assumption, it often performs well for text.

```python
from sklearn.naive_bayes import MultinomialNB

nb = MultinomialNB()
nb.fit(X_train_tfidf, train_data.target)
```

---

# Classifier 2: Logistic Regression

<div class="definition-box" data-title="Learns weights for each feature">

$$P(y=k|x) = \frac{e^{w_k^T x}}{\sum_{j} e^{w_j^T x}}$$

</div>

<div class="tip-box" data-title="Advantages">

- Interpretable weights (which words matter?)
- Often outperforms Naive Bayes
- Fast training and prediction

</div>

```python
from sklearn.linear_model import LogisticRegression

lr = LogisticRegression(max_iter=1000, C=1.0)
lr.fit(X_train_tfidf, train_data.target)
```

---

# Logistic regression weights reveal which words matter

<div class="example-box" data-title="Top positive features per category">

| Category | Top Positive Features |
|----------|----------------------|
| sci.space | nasa, orbit, shuttle, moon, launch |
| rec.sport.hockey | hockey, nhl, team, game, play |
| talk.politics.misc | government, president, tax, policy |
| comp.graphics | image, graphics, 3d, rendering |

</div>

<div class="tip-box" data-title="Key insight">

The model learns what we'd expect! Interpretability matters.

</div>

---
<!-- _class: scale-80 -->

# Classifier 3: Simple Neural Network

```flow
[Input (TF-IDF):blue] --> [Hidden Layer 1 (256):teal] --> [Hidden Layer 2 (128):green] --> [Output (4 classes):orange]
```
<!-- caption: Feedforward architecture -->

```python
import torch.nn as nn

class TextClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim // 2)
        self.fc3 = nn.Linear(hidden_dim // 2, output_dim)
        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()
```

---

# Linear models are competitive with BoW features

<div class="example-box" data-title="Results on 20 Newsgroups">

| Model | Accuracy |
|-------|----------|
| Naive Bayes (BoW) | ~85% |
| Naive Bayes (TF-IDF) | ~87% |
| Logistic Regression | ~90% |
| Neural Network | ~89% |

</div>

<div class="tip-box" data-title="Key insight">

Neural networks shine with richer representations (embeddings), not BoW.

</div>

---

# Accuracy alone is not enough

<div class="definition-box" data-title="Better metrics">

- **Precision:** Of predicted positives, how many are truly positive?
- **Recall:** Of actual positives, how many did we catch?
- **F1-Score:** Harmonic mean: $F1 = 2 \times \frac{Precision \times Recall}{Precision + Recall}$

</div>

<div class="warning-box" data-title="Use precision/recall/F1 when...">

Datasets are imbalanced or different errors have different costs.

</div>

---
<!-- _class: scale-90 -->

# Confusion Matrix

<div class="example-box" data-title="Visual representation of classifier errors">

| | Predicted A | Predicted B | Predicted C | Predicted D |
|--|-------------|-------------|-------------|-------------|
| **Actual A** | 85 | 2 | 3 | 0 |
| **Actual B** | 1 | 92 | 2 | 5 |
| **Actual C** | 4 | 3 | 88 | 5 |
| **Actual D** | 0 | 8 | 2 | 90 |

</div>

<div class="tip-box" data-title="Interpretation">

Diagonal = correct predictions. Off-diagonal = errors.

</div>

---

# Error analysis: critical but often skipped

<div class="note-box" data-title="The process">

1. Find misclassified examples
2. Look for patterns
3. Understand why the model failed
4. Use insights to improve

</div>

<div class="warning-box" data-title="Common culprits">

Mixed topics, short documents, unusual vocabulary

</div>

---
<!-- _class: scale-75 -->

# Error Analysis: Concrete Example

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

```python
# Find misclassified examples
y_pred = lr.predict(X_test_tfidf)
errors = np.where(y_pred != test_data.target)[0]
idx = errors[0]

print(f"True: {test_data.target_names[test_data.target[idx]]}")
print(f"Pred: {test_data.target_names[y_pred[idx]]}")
print(test_data.data[idx][:300])
```

</div>
<div style="flex: 1;">

<div class="example-box" data-title="Example output">

**True:** sci.space  **Predicted:** comp.graphics

*"I'm working on a 3D visualization of the solar system for my graphics project..."*

</div>

<div class="tip-box" data-title="Insight">

Document mentions both graphics AND space. Model reasonably confused!

</div>

</div>
</div>

---

# Common Error Patterns

<div class="warning-box" data-title="Why do classifiers fail?">

1. **Ambiguous content:** Document mentions multiple topics
2. **Limited context:** Very short documents
3. **Domain shift:** Test data differs from training
4. **Rare vocabulary:** Important words not in training

</div>

<div class="tip-box" data-title="Solution ideas">

- Better preprocessing
- More features (bigrams, trigrams)
- Domain-specific fine-tuning

</div>

---

# Class imbalance makes models predict the majority class

<div class="note-box" data-title="Solutions">

1. **Class weights:** Penalize minority errors more
2. **Oversampling:** Duplicate minority examples
3. **Undersampling:** Remove majority examples
4. **SMOTE:** Generate synthetic minority examples

</div>

```python
lr_balanced = LogisticRegression(
    class_weight='balanced'  # Automatically adjust weights
)
```

---

# Discussion Questions

<div class="note-box" data-title="Think about these">

1. **BoW vs TF-IDF:** When would you prefer one over the other?

2. **Linear vs Neural:** Why didn't the neural network significantly outperform logistic regression?

3. **Feature Engineering:** How important was feature engineering compared to model choice?

4. **Scalability:** Which approach scales best to millions of documents?

5. **Interpretability:** Which models are most interpretable? Why does it matter?

</div>

---

# Key Takeaways

<div class="tip-box" data-title="Remember">

1. **Good features matter more than complex models** (for many tasks)
2. **TF-IDF usually beats raw BoW** for text classification
3. **Linear models are competitive** with neural networks on bag-of-words
4. **Always examine errors** to understand model behavior
5. **Consider class imbalance** and adjust accordingly

</div>

---

# Connection to Course Themes

<div class="note-box" data-title="This week's pipeline">

```flow
[Data Cleaning (Lecture 5):blue] --> [Tokenization (Lecture 6):teal] --> [Feature Extraction (Today):green] --> [Classification (Today):orange]
```

</div>

<div class="tip-box" data-title="Next lecture">

**POS Tagging & Sentiment Analysis** &mdash; How do these building blocks combine for real NLP applications?

</div>

---

# Hands-On Exercise

<div class="note-box" data-title="Open the companion notebook">

`xhour_classification_demo.ipynb`

</div>

<div class="example-box" data-title="Steps">

1. Load the 20 Newsgroups dataset
2. Experiment with different vectorizers
3. Train multiple classifiers
4. Analyze errors and improve
5. Try your own text examples!

</div>

<div class="tip-box" data-title="Goal">

Build intuition for text classification

</div>

---

# Additional Resources

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

<div class="note-box" data-title="Libraries">

- [scikit-learn](https://scikit-learn.org/)
- [PyTorch](https://pytorch.org/)

</div>

<div class="note-box" data-title="HuggingFace">

- [Chapter 1: Transformer Models](https://huggingface.co/learn/nlp-course/chapter1)

</div>

</div>
<div style="flex: 1;">

<div class="example-box" data-title="Datasets">

- **20 Newsgroups:** Classic benchmark
- **IMDb Reviews:** Sentiment classification
- **AG News:** News categorization

</div>

</div>
</div>

---

# Questions? Want to chat more?

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

<div class="tip-box" data-title="Next up">

Lecture 8 &mdash; POS Tagging & Sentiment Analysis

</div>
