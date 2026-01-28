---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 12: Contextual embeddings
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will">

1. Understand the polysemy problem and why static embeddings struggle
2. Explain how ELMo uses bidirectional LSTMs for context
3. Apply Universal Sentence Encoder for semantic similarity
4. Understand BERT's masked language modeling approach
5. Compare contextual embedding methods and their trade-offs

</div>

<div class="definition-box" data-title="The contextual revolution">

Contextual embeddings changed NLP: same word, different vectors depending on context!

</div>

---

# The polysemy problem

<div class="warning-box" data-title="Static embeddings: ONE vector per word">

Word2Vec, GloVe, and FastText assign the **same** vector to every occurrence of a word.

</div>

<div class="example-box" data-title='The word "bank"'>

1. "I deposited money at the **bank**" (financial institution)
2. "We sat by the river **bank**" (riverside)
3. "The plane will **bank** left" (tilt/turn)

**Static embeddings:** All three get the SAME vector!

**Contextual embeddings:** Each gets a DIFFERENT vector based on context.

</div>

---

# Static embeddings (Word2Vec, GloVe, FastText)

<div class="example-box" data-title="Same vector every time">

```python
model = Word2Vec(...)
vec1 = model['bank']
vec2 = model['bank']
assert vec1 == vec2  # Always True!
```

</div>

<div class="note-box" data-title="Characteristics">

- **One vector per word type** — lookup table
- **Context-independent** — ignores surrounding words
- **Fast** — dictionary lookup, no computation

</div>

---

# Contextual embeddings (ELMo, BERT)

<div class="example-box" data-title="Different vector per occurrence">

```python
sent1 = "river bank"
sent2 = "money bank"
vec1 = get_embedding(model, sent1, 'bank')
vec2 = get_embedding(model, sent2, 'bank')
assert vec1 != vec2  # Always True!
```

</div>

<div class="note-box" data-title="Characteristics">

- **Different vector per occurrence** — context-dependent
- **Bidirectional context** — sees words before AND after
- **Slower** — requires forward pass through neural network

</div>

---

# Language models as feature extractors

<div class="definition-box" data-title="Key insight">

Train a language model, use its internal states as embeddings!

</div>

<div class="note-box" data-title="Modern language models are predictors">

Fundamental goal: predict the next word given previous words: $P(w_t | w_1, w_2, ..., w_{t-1})$

</div>

<div class="example-box" data-title="Concrete example">

Input: "The cat sat on the ___"

Model predicts: "mat" (0.25), "floor" (0.18), "couch" (0.12), "dog" (0.001)

To predict well, the model learns: "sat on the" suggests a surface!

</div>

<div class="tip-box" data-title="Why this works">

Hidden states capture contextual understanding. We extract these rich hidden states as embeddings!

</div>

---

# ELMo: Embeddings from Language Models

<div class="note-box" data-title="Further reading">

[**Peters, Neumann, Iyyer, Gardner, Clark, Lee, Zettlemoyer (2018, *NAACL*)**](https://aclanthology.org/N18-1202/) Deep contextualized word representations.

</div>

<div class="definition-box" data-title="The first widely-adopted contextual embedding (2018)">

- Train deep **bidirectional** language model
- Use all layer activations
- Weighted combination per task
- Character-based input (handles OOV!)

</div>

---
<!-- _class: scale-85 -->

# ELMo architecture

<div class="note-box" data-title="Bidirectional LSTM">

- **Forward LM:** $P(w_t | w_1...w_{t-1})$
- **Backward LM:** $P(w_t | w_{t+1}...w_n)$

Each word gets info from BOTH directions!

</div>

<div class="example-box" data-title="Layer weighting">

For sentiment analysis, ELMo might learn:
- Layer 0 (characters): weight = 0.1
- Layer 1 (syntax): weight = 0.3
- Layer 2 (semantics): weight = 0.6

Higher layers matter more for meaning!

</div>

<div class="important-box" data-title="Impact on NLP">

Improved state-of-the-art on many NLP tasks: question answering, sentiment analysis, named entity recognition, coreference resolution, semantic role labeling, and more!

</div>

---
<!-- _class: scale-65 -->

# ELMo in Python

```python
from allennlp.modules.elmo import Elmo, batch_to_ids

# Initialize ELMo (need to download these files first)
options_file = "elmo_options.json"
weight_file = "elmo_weights.hdf5"
elmo = Elmo(options_file, weight_file, 2, dropout=0)

# prepare inputs and get embeddings
sentences = [ 
    ['I', 'deposited', 'money', 'at', 'the', 'bank'],
    ['We', 'sat', 'by', 'the', 'river', 'bank']
]
character_ids = batch_to_ids(sentences)
embeddings = elmo(character_ids)

# Different vectors for "bank"!
bank1 = embeddings['elmo_representations'][0][0, 5, :]  # first sentence
bank2 = embeddings['elmo_representations'][0][1, 5, :]  # second sentence
```

---

# Universal Sentence Encoder (USE)

<div class="note-box" data-title="Further reading">

[**Cer et al. (2018, *EMNLP*)**](https://arxiv.org/abs/1803.11175) Universal Sentence Encoder.

</div>

<div class="definition-box" data-title="Sentence-level embeddings">

- Produces 512-dimensional vector for any sentence
- Two variants: Transformer (higher accuracy) and Deep Averaging Network (DAN; faster)
- Optimized for semantic similarity tasks
- Performs really well in practice (still widely used today!)

</div>

<div class="tip-box" data-title="Use cases">

Semantic search, question answering, text classification, clustering, duplicate detection.

</div>

---
<!-- _class: scale-65 -->

# Universal Sentence Encoder in Python

```python
import tensorflow_hub as hub
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Load model
embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")

sentences = [
    "The cat sat on the mat.",
    "A feline rested on the rug.",  # Paraphrase!
    "The dog ran in the park.",
    "I love machine learning."
]

embeddings = embed(sentences) # shape: [4, 512]

# Compute similarity - sentences 1 and 2 should be very similar
sim_matrix = cosine_similarity(embeddings)
```

---
<!-- _class: scale-75 -->

# BERT: Bidirectional Encoder Representations

<div class="note-box" data-title="Further reading">

[**Viswani et al. (2017, *NIPS*)**](https://arxiv.org/abs/1706.03762) Attention is All You Need.

[**Devlin, Chang, Lee, Toutanova (2019, *NAACL*)**](https://aclanthology.org/N19-1423/) BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding.

</div>

<div class="important-box" data-title="Transformer architecture">

We will cover Transformers in detail later. For now: it's a very powerful architecture for sequence modeling. The core idea is **self-attention**: each word "attends to" (i.e., is affected by) all other words in the sequence, capturing rich dependencies.

</div>

<div class="definition-box" data-title="Quickly surpassed ELMo (2018)">

- **Bidirectional** context (like ELMo, but captures much deeper patterns due to Transformer)
- **Massive** pre-training (3.3B word corpus)
- Two pre-training tasks: Masked Language Modeling (MLM) & Next Sentence Prediction (NSP)
- Fine-tunable for many downstream tasks

</div>

<div class="tip-box" data-title="Impact">

SOTA on 11 NLP tasks. Sparked the "BERT-era" with 1000+ variants (RoBERTa, ALBERT, DistilBERT, ...). We've already used some of these (e.g., DistilBERT for sentiment analysis)!

</div>

---

# Masked Language Modeling (MLM)

<div class="warning-box" data-title="A problem with traditional LM">

- Left-to-right: only sees **previous** words
- Right-to-left: only sees **next** words
- Ideally we would see both directions simultaneously...
- ...but we can't just show the answer during training!

</div>

<div class="note-box" data-title="Solution: Mask some words, predict them">

**Original:** "The cat sat on the mat"
**Masked:** "The **[MASK]** sat on the mat"
**Task:** Predict "cat" using context from BOTH sides!

</div>

---
<!-- _class: scale-85 -->

# MLM training procedure

<div class="example-box" data-title="Worked example">

**Step 1:** Randomly select 15% of tokens &rarr; "cat" selected

**Step 2:** Apply masking strategy (80/10/10 rule):
- 80%: "The **[MASK]** sat on the mat"
- 10%: "The **cat** sat on the mat" (unchanged)
- 10%: "The **answer** sat on the mat" (random word)

**Step 3:** Model predicts "cat" using full bidirectional context

</div>

<div class="tip-box" data-title="Why 80/10/10?">

Prevents model from only learning to predict [MASK] tokens. Forces it to make good predictions for any token.

</div>

---

# Next Sentence Prediction (NSP)

<div class="definition-box" data-title="Second pre-training task">

Given two sentences A and B, predict if B follows A in the text.

</div>

<div class="example-box" data-title="Positive example (IsNext)">

**A:** "The cat sat on the mat."
**B:** "It was sleeping peacefully."
**Label:** IsNext

</div>

<div class="example-box" data-title="Negative example (NotNext)">

**A:** "The cat sat on the mat."
**B:** "Machine learning is fascinating."
**Label:** NotNext

</div>

<div class="note-box" data-title="Note">

Later research (RoBERTa) found NSP less important than MLM for most tasks.

</div>

---
<!-- _class: scale-80 -->

# BERT input representation

<div class="example-box" data-title="Three embeddings summed for each token">

**Input:** "[CLS] I love NLP [SEP] It is fun [SEP]"

| Token | Token Emb | Segment | Position |
|-------|-----------|---------|----------|
| [CLS] | E_CLS | A | 0 |
| I | E_I | A | 1 |
| love | E_love | A | 2 |
| NLP | E_NLP | A | 3 |
| [SEP] | E_SEP | A | 4 |
| It | E_It | B | 5 |
| is | E_is | B | 6 |
| fun | E_fun | B | 7 |

</div>

**Final embedding** = Token + Segment + Position

---
<!-- _class: scale-60 -->

# BERT in Python

```python
from transformers import BertTokenizer, BertModel
import torch

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

sent1, sent2 = "I deposited money at the bank", "We sat by the river bank"

# Tokenize and get embeddings
tokens1 = tokenizer(sent1, return_tensors='pt')
tokens2 = tokenizer(sent2, return_tensors='pt')

with torch.no_grad():
    output1 = model(**tokens1)
    output2 = model(**tokens2)

# Extract "bank" embedding - different vectors!
bank1 = output1.last_hidden_state[0, 6, :]  # 768-dim
bank2 = output2.last_hidden_state[0, 6, :]  # 768-dim
```

---

# Fine-tuning BERT

<div class="definition-box" data-title="What is fine-tuning?">

Fine-tuning: starting with pre-trained model weights, then updating them on a specific downstream task (e.g., sentiment analysis, question answering).

</div>

<div class="note-box" data-title="Why fine-tune?">

- Leverages knowledge from massive pre-training
- Adapts model to specific task/domain
- Much faster than training from scratch

</div>

---

# Fine-tuning BERT

<div class="example-box" data-title="Feature extraction (freeze BERT)&mdash; fast, less data needed">

```python
for param in bert_model.parameters():
    param.requires_grad = False
classifier = nn.Linear(768, num_classes)
# Train only classifier
```

</div>

<div class="note-box" data-title="Fine-tuning (update BERT)&mdash; performant, needs more data">

```python
bert_model = BertModel.from_pretrained('bert-base-uncased')
classifier = nn.Linear(768, num_classes)
optimizer = Adam([...], lr=2e-5)  # Small learning rate!
# Train everything end-to-end
```

</div>

<div class="tip-box" data-title="Best practice">

Fine-tune with small learning rate (1e-5 to 5e-5) for few epochs (2-4).

</div>

---

# Real-world applications

<div class="example-box" data-title="Google search">

Query: "can you get medicine for someone pharmacy"

BERT understands: picking up a prescription FOR someone else (not just keyword matching!)

</div>

<div class="example-box" data-title="Question answering">

Context: "The Eiffel Tower was built in 1889 by Gustave Eiffel."
Q: "When was the Eiffel Tower built?"
A: "1889" &larr; BERT extracts this span

</div>

<div class="example-box" data-title="Sentiment analysis">

"Not bad at all!" &rarr; Positive (understands negation!)

</div>

<div class="example-box" data-title="Named entity recognition">

"Apple is looking at buying U.K. startup for $1 billion" &rarr; Recognizes "Apple" as ORG, "U.K." as LOC, "$1 billion" as MONEY.

</div>

---
<!-- _class: scale-65 -->


# Discussion: do contextual embeddings reflect "understanding"?

<div class="important-box" data-title="In some ways...">

- Capture complex semantic relationships
- Generalize to new contexts
- Handle compositional meaning (e.g., idioms, metaphors, sarcasm)
- Human-level performance on many benchmarks

</div>

<div class="note-box" data-title="...but probably not true understanding">

- Brittle to adversarial examples (small changes can fool them)
- Lack of world knowledge and reasoning: grammatical but nonsensical sentences can be rated as highly probable
- Struggle with out-of-distribution inputs that humans handle easily (e.g., novel metaphors, jokes)

</div>

<div class="important-box" data-title="...on the other hand">

Notice that with these models we are far beyond pre-defined symbolic rules and simple co-occurrence statistics. They capture a lot of nuance in language use that was previously out of reach. Arguing "where models fall short of true understanding" is (increasingly) becoming a moving target, and increasingly subtle.

</div>

<div class="note-box" data-title="...but on the OTHER other hand">

Lack of grounding in actual experience means that these models cannot distinguish between reasonable vs. unreasonable statements that happen to be linguistically well-formed. Whatever "understanding" these models might be said to have is fundamentally different from human understanding: it is based purely on patterns in text, without any connection to real-world referents or experiences.

</div>

---
<!-- _class: scale-90 -->

# Summary

1. **Contextual vs. static:** Different vectors per occurrence solves polysemy
2. **ELMo (2018):** BiLSTM language models, character-based, task-specific weighting
3. **USE (2018):** Sentence-level embeddings optimized for similarity
4. **BERT (2018):** Masked language modeling, deep bidirectional transformers
5. **Impact:** Established modern transfer learning paradigm in NLP


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

<div class="tip-box" data-title="Up next (tomorrow's X-hour)">

Dimensionality reduction techniques (PCA, t-SNE, UMAP) for visualizing embeddings!

</div>
