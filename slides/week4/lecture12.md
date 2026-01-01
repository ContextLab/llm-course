---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication - Week 4'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Contextual Embeddings: ELMo, USE, BERT
## Lecture 12: Beyond Static Word Representations

**PSYC 51.07: Models of Language and Communication - Week 4**

Winter 2026

---

# Today's Lecture 📋



1. 🔄 **From Static to Contextual**
2. 🧬 **Language Models as Feature Extractors**
3. 🔮 **ELMo: Embeddings from Language Models**
4. 🌐 **Universal Sentence Encoder**
5. 🎭 **BERT: Bidirectional Transformers**
6. 📊 **Comparison & Applications**

*Goal: Understand how context transforms word representation*

---

# The Polysemy Problem Revisited 🤔


**Recall: Static embeddings assign ONE vector per word**

<div class="columns">
<div class="column">

**Example: "bank"**

1. "I deposited money at the **bank**"
   (financial institution)
2. "We sat by the river **bank**"
   (riverside)
3. "The plane will **bank** left"
   (tilt/turn)

**Word2Vec/GloVe:** All three get the SAME vector!

**Contextual embeddings:** Each gets a DIFFERENT vector based on context

</div>
<div class="column">

**Cosine Similarity Demo:**

```python
# Static embeddings (Word2Vec)
sim(bank_sent1, bank_sent2) = 1.0  # Same!

# Contextual embeddings (BERT)
sim(bank_sent1, bank_sent2) = 0.45
sim(bank_sent1, bank_sent3) = 0.32
sim(bank_sent2, bank_sent3) = 0.28

# "bank" (financial) is closer to
# "bank" (river) than to "bank" (tilt)
# because nouns are more similar!
```

</div>
</div>


---

# Static vs. Contextual Embeddings 🔄


<div class="columns">
<div class="column">

**Static (Word2Vec, GloVe, FastText):**

```python
# Same vector every time
model = Word2Vec(...)
vec1 = model['bank']
vec2 = model['bank']

assert vec1 == vec2  # True!
```

**Characteristics:**
- One vector per word type
- Context-independent
- Fast lookup (dictionary)
- Fixed after training
- Polysemy conflation

</div>
<div class="column">

**Contextual (ELMo, BERT):**

```python
# Different vector per occurrence
model = BertModel.from_pretrained('bert-base')

sent1 = "river bank"
sent2 = "money bank"

vec1 = get_embedding(model, sent1, 'bank')
vec2 = get_embedding(model, sent2, 'bank')

assert vec1 != vec2  # True!
```

**Characteristics:**
- Different vector per occurrence
- Context-dependent
- Requires forward pass
- Dynamic representations
- Handles polysemy naturally

</div>
</div>


---

# Language Models as Feature Extractors 🧬


**Key Insight:** Train a language model, use its internal states as embeddings

**Language Modeling Task:**

Predict the next word given previous words: $P(w_t | w_1, w_2, ..., w_{t-1})$

<div class="callout tip">
<div class="callout-title">Worked Example</div>

Input: "The cat sat on the ___"

| Model predicts probabilities: | |
|-------------------------------|-------|
| "mat" | 0.25 |
| "floor" | 0.18 |
| "couch" | 0.12 |
| "dog" | 0.001 |

To predict well, the model learns: "sat on the" suggests a surface!
</div>

**Why This Works:**
- To predict "mat", model must encode that "sat on" precedes surfaces
- Hidden states capture this contextual understanding
- We extract these rich hidden states as embeddings!


---

# ELMo: Embeddings from Language Models 🔮


**The first widely-adopted contextual embedding (2018)**

<div class="columns">
<div class="column">

**Key Ideas:**
1. Train deep bidirectional language model
2. Use all layer activations
3. Weighted combination per task
4. Pre-train on large corpus

**Architecture:**
- 2-layer biLSTM
- Forward LM: $P(w_t | w_1...w_{t-1})$
- Backward LM: $P(w_t | w_{t+1}...w_n)$
- Character-based input (handles OOV!)

</div>
<div class="column">

**Bidirectional Processing:**

```
Forward:  The → cat → sat → ...
Backward: ... ← sat ← cat ← The
```

Each word gets info from BOTH directions!

**Layer Weighting Example:**

For sentiment task, ELMo might learn:
- Layer 0 (characters): weight = 0.1
- Layer 1 (syntax): weight = 0.3
- Layer 2 (semantics): weight = 0.6

Higher layers matter more for meaning!

</div>
</div>

*Reference: Peters et al. (2018). "Deep contextualized word representations"*

---

# ELMo: How It Works 🔍


**Training:**

1. Pre-train on large corpus (1B Word Benchmark)
2. Each position gets representation from all layers

**Usage (downstream tasks):**

1. Freeze ELMo weights
2. For each token, extract representations from all layers
3. Learn task-specific weighted combination
4. Concatenate with task model

<div class="callout tip">
<div class="callout-title">Concrete Example: Sentiment Analysis</div>

**Input:** "The movie was absolutely terrible"

| Token | Char Emb | Layer 1 | Layer 2 | Weighted Sum |
|-------|----------|---------|---------|--------------|
| terrible | [0.1, ...] | [0.3, ...] | [-0.8, ...] | [-0.5, ...] |

The final representation captures that "terrible" is strongly negative in this context!

</div>

**Impact:** Improved state-of-the-art on 6 NLP tasks!

---

# ELMo in Practice 💻


```python
from allennlp.modules.elmo import Elmo, batch_to_ids

# Initialize ELMo
options_file = "https://s3-us-west-2.amazonaws.com/allennlp/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_options.json"
weight_file = "https://s3-us-west-2.amazonaws.com/allennlp/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_weights.hdf5"

elmo = Elmo(options_file, weight_file, 2, dropout=0)

# Prepare sentences
sentences = [
    ['I', 'deposited', 'money', 'at', 'the', 'bank'],
    ['We', 'sat', 'by', 'the', 'river', 'bank']
]

# Convert to character ids
character_ids = batch_to_ids(sentences)

# Get embeddings
embeddings = elmo(character_ids)

# embeddings['elmo_representations'] contains:
# - List of 2 tensors (one per layer)
# - Shape: [batch_size, seq_len, 1024]

# Different vectors for "bank"!
bank1 = embeddings['elmo_representations'][0][0, 5, :]  # first sentence
bank2 = embeddings['elmo_representations'][0][1, 5, :]  # second sentence

# Cosine similarity will be lower than for static embeddings
```


---

# Universal Sentence Encoder (USE) 🌐


**Sentence-level embeddings for semantic similarity**

<div class="columns">
<div class="column">

**Motivation:**
- Word embeddings: good for words
- But what about sentences?
- Average of word vectors? Too simple!
- Need compositionality

**Two Variants:**

**1. Transformer-based:**
- Higher accuracy
- Slower (compute intensive)
- Better for quality

**2. Deep Averaging Network (DAN):**
- Lower accuracy
- Much faster
- Better for scale

</div>
<div class="column">

**Training Objectives:**
1. Unsupervised: Skip-thought
2. Supervised: SNLI (entailment)
3. Multi-task learning

**Output:**
- 512-dimensional vector
- Fixed-length (any sentence length)
- Optimized for similarity tasks

**Use Cases:**
- Semantic search
- Question answering
- Text classification
- Clustering
- Duplicate detection

</div>
</div>

*Reference: Cer et al. (2018). "Universal Sentence Encoder"*

---

# Universal Sentence Encoder in Practice 💻


```python
import tensorflow_hub as hub
import numpy as np

# Load model
embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")

# Example sentences
sentences = [
    "The cat sat on the mat.",
    "A feline rested on the rug.",
    "The dog ran in the park.",
    "I love machine learning."
]

# Generate embeddings
embeddings = embed(sentences)

# Shape: [4, 512]
print(embeddings.shape)

# Compute similarity
from sklearn.metrics.pairwise import cosine_similarity

sim_matrix = cosine_similarity(embeddings)
print(sim_matrix)

# Sentences 1 and 2 should be very similar (paraphrases)
# Sentence 3 somewhat similar (animals)
# Sentence 4 dissimilar

# Use for semantic search
query = "cat on mat"
query_embedding = embed([query])
similarities = cosine_similarity(query_embedding, embeddings)[0]
most_similar_idx = np.argmax(similarities)
print(f"Most similar: {sentences[most_similar_idx]}")
```


---

# BERT: Bidirectional Encoder Representations 🎭



**The model that changed everything (2018)**

<div class="columns">
<div class="column">

**Key Innovations:**
1.  context (not just left-to-right)
2.  architecture (attention)
3.  pre-training

5. Deeply bidirectional

**Impact:**
- SOTA on 11 NLP tasks
- Sparked the "BERT-era"
- 1000+ variants (RoBERTa, ALBERT, DistilBERT, ...)
- Foundation for modern LLMs

</div>
<div class="column">

**Architecture Sizes:**

| BERT-Large | 24 | 1024 |
| --- | --- | --- |

**Training Data:**
- BooksCorpus (800M words)
- English Wikipedia (2.5B words)
- Total: 3.3B words

**Training Time:**
- 4 days on 64 TPU chips
- Or 4 weeks on 8 GPUs

</div>
</div>

*Reference: Devlin et al. (2018). "BERT: Pre-training of Deep Bidirectional Transformers"*

---

# Masked Language Modeling (MLM) 🎭


**BERT's key training innovation**

**The Problem with Traditional LM:**
- Left-to-right: Only sees previous words
- Right-to-left: Only sees next words
- Want: See both directions simultaneously
- But: Can't just show the answer during training!

**Solution: Mask some words, predict them**

<div class="callout tip">
<div class="callout-title">Worked Example: MLM Training</div>

**Original:** "The cat sat on the mat"

**Step 1:** Randomly select 15% of tokens → "cat" selected

**Step 2:** Apply masking strategy (80/10/10 rule):
- 80% chance: "The **[MASK]** sat on the mat"
- 10% chance: "The **dog** sat on the mat" (random word)
- 10% chance: "The **cat** sat on the mat" (unchanged)

**Step 3:** Model sees full context both ways to predict "cat":
```
← The [MASK] sat on the mat →
     ↑
   predict "cat"
```

</div>

**Training Procedure:**
1. Randomly select 15% of tokens
2. Replace 80% with [MASK], 10% with random word, 10% unchanged
3. Predict original tokens
4. Bidirectional context!


---

# Next Sentence Prediction (NSP) 🔗


**Second pre-training task: Understand sentence relationships**

**Task:** Given two sentences A and B, predict if B follows A in the text

<div class="callout tip">
<div class="callout-title">Positive Example (IsNext)</div>

**Sentence A:** "The cat sat on the mat."

**Sentence B:** "It was sleeping peacefully."

**Label:** IsNext ✓

</div>

<div class="callout tip">
<div class="callout-title">Negative Example (NotNext)</div>

**Sentence A:** "The cat sat on the mat."

**Sentence B:** "Machine learning is fascinating."

**Label:** NotNext ✗

</div>

**Why This Helps:**
- Captures discourse relationships
- Useful for QA, NLI, etc.
- Models sentence-level coherence
- Note: Later research (RoBERTa) found NSP less important than MLM


---

# BERT Architecture 🏗️

**Three types of embeddings are summed for each token:**

<div class="callout tip">
<div class="callout-title">Worked Example: Input Representation</div>

**Input:** "[CLS] I love NLP [SEP] It is fun [SEP]"

| Token | Token ID | Segment | Position | Final Embedding |
|-------|----------|---------|----------|-----------------|
| [CLS] | E_CLS | A | 0 | E_CLS + E_A + E_0 |
| I | E_I | A | 1 | E_I + E_A + E_1 |
| love | E_love | A | 2 | E_love + E_A + E_2 |
| NLP | E_NLP | A | 3 | E_NLP + E_A + E_3 |
| [SEP] | E_SEP | A | 4 | E_SEP + E_A + E_4 |
| It | E_It | B | 5 | E_It + E_B + E_5 |
| is | E_is | B | 6 | E_is + E_B + E_6 |
| fun | E_fun | B | 7 | E_fun + E_B + E_7 |
| [SEP] | E_SEP | B | 8 | E_SEP + E_B + E_8 |

- **Token Embedding:** What word is this?
- **Segment Embedding:** Which sentence (A or B)?
- **Position Embedding:** Where in the sequence?

</div>


---

# BERT in Practice 💻


```python
from transformers import BertTokenizer, BertModel
import torch

# Load pre-trained BERT
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

# Example sentences with "bank"
sent1 = "I deposited money at the bank"
sent2 = "We sat by the river bank"

# Tokenize
tokens1 = tokenizer(sent1, return_tensors='pt')
tokens2 = tokenizer(sent2, return_tensors='pt')

# Get embeddings
with torch.no_grad():
    output1 = model(**tokens1)
    output2 = model(**tokens2)

# Last hidden state: [batch_size, seq_len, hidden_size]
embeddings1 = output1.last_hidden_state
embeddings2 = output2.last_hidden_state

# Extract "bank" embedding (position varies)
# tokens1: [CLS] i deposited money at the bank [SEP]
bank1_embedding = embeddings1[0, 6, :]  # 768-dim vector

# tokens2: [CLS] we sat by the river bank [SEP]
bank2_embedding = embeddings2[0, 6, :]  # 768-dim vector

# Different vectors for "bank"!
from torch.nn.functional import cosine_similarity
sim = cosine_similarity(bank1_embedding, bank2_embedding, dim=0)
print(f"Similarity: {sim:.3f}")  # Lower than with static embeddings
```


---

# Fine-tuning BERT 🎯


**Two ways to use BERT:**

<div class="columns">
<div class="column">

**1. Feature Extraction:**
- Freeze BERT weights
- Use embeddings as features
- Train classifier on top
- Faster, less data needed

```python
# Freeze BERT
for param in bert_model.parameters():
    param.requires_grad = False

# Add classifier
classifier = nn.Linear(768, num_classes)

# Train only classifier
optimizer = Adam(classifier.parameters())
```

</div>
<div class="column">

**2. Fine-tuning:**
- Update BERT weights
- Add task-specific head
- Train end-to-end
- Better performance, more data needed

```python
# Keep BERT trainable
bert_model = BertModel.from_pretrained(
    'bert-base-uncased'
)

# Add classifier
classifier = nn.Linear(768, num_classes)

# Train everything
optimizer = Adam(
    list(bert_model.parameters()) +
    list(classifier.parameters()),
    lr=2e-5  # Small learning rate!
)
```

</div>
</div>

**Best Practice:** Fine-tune with small learning rate (1e-5 to 5e-5) for few epochs (2-4)

---

# Contextual Embeddings Comparison 📊



| Pre-training | LM (forward+backward) | Multi-task | MLM + NSP |
| --- | --- | --- | --- |
| Bidirectional | Shallow | Yes | Deep |
| Granularity | Token | Sentence | Token |
| Hidden size | 1024 | 512 | 768/1024 |
| Parameters | 93M | 256M | 110M/340M |
| Speed | Medium | Fast | Slow |
| OOV handling | Characters | Subwords | WordPiece |
| Year | 2018 | 2018 | 2018 |

<div class="callout info">
<div class="callout-title">Recommendations</div>

- **ELMo:** Legacy systems, character-aware needs
- **USE:** Sentence similarity, semantic search, fast inference
- **BERT:** State-of-the-art quality, most NLP tasks (now superseded by larger models)

</div>


---

# Impact on NLP 🌟


**BERT revolutionized NLP:**

<div class="columns">
<div class="column">

**Before BERT (pre-2018):**
- Task-specific architectures
- Train from scratch
- Static embeddings (Word2Vec, GloVe)
- Limited transfer learning
- Moderate performance

**Tasks that improved:**
- Question Answering (+1.5 F1 on SQuAD)
- NER (+0.3 F1)
- Sentiment Analysis (+2% accuracy)
- NLI (+4% accuracy)
- Many others!

</div>
<div class="column">

**After BERT (post-2018):**
- Pre-train, then fine-tune
- Transfer learning standard
- Contextual embeddings
- Massive pre-trained models
- State-of-the-art results

**BERT Variants:**
- RoBERTa: Better training
- ALBERT: Parameter sharing
- DistilBERT: Smaller, faster
- ELECTRA: Different pre-training
- DeBERTa: Disentangled attention
- And 100+ more!

</div>
</div>


---

# Real-World Applications 🚀

<div class="columns">
<div class="column">

**1. Google Search:**
```
Query: "can you get medicine for
        someone pharmacy"

BERT understands: picking up a
prescription FOR someone else

Before BERT: matched "medicine"
and "pharmacy" keywords only
```

**2. Question Answering:**
```
Context: "The Eiffel Tower was
built in 1889 by Gustave Eiffel."

Q: "When was the Eiffel Tower built?"
A: "1889" ← BERT extracts this span
```

</div>
<div class="column">

**3. Sentiment Analysis:**
```python
# Fine-tuned BERT
text = "Not bad at all!"
prediction = model(text)
# → Positive (understands negation!)
```

**4. Named Entity Recognition:**
```
Input: "Apple CEO Tim Cook announced..."

Output:
  Apple     → ORG
  Tim Cook  → PERSON
```

**5. Semantic Search:**
```
Query: "affordable laptop for students"
Matches: "budget-friendly notebook
          for college" ← synonyms!
```

</div>
</div>


---

# Discussion Question 💬



**Do contextual embeddings truly "understand" language?**

**Consider:**
- BERT can distinguish "bank" (financial) from "bank" (riverside)
- It achieves human-level performance on many benchmarks
- But it's trained only on text co-occurrence patterns

<div class="columns">
<div class="column">

**Arguments For:**
- Captures complex semantic relationships
- Generalizes to new contexts
- Emergent linguistic capabilities
- Handles compositional meaning

</div>
<div class="column">

**Arguments Against:**
- No grounding in physical world
- No common sense reasoning
- Exploits statistical shortcuts
- Brittle to adversarial examples
- "Stochastic parrots"?

</div>
</div>

<div class="callout warning">
<div class="callout-title">The Grounding Problem Persists</div>

Even with contextual embeddings, we still lack true grounding in experience, perception, and embodied cognition.

</div>

*Reference: Bender & Koller (2020). "Climbing towards NLU: On Meaning, Form, and Understanding"*

---

# Practical Tips 💡


1. **Choosing a Model:**
    - BERT-base: Good balance, 110M params
- DistilBERT: 40% smaller, 60% faster, 97% performance
- RoBERTa: Better than BERT, longer training
- Domain-specific: BioBERT, SciBERT, FinBERT, etc.
2. **Fine-tuning Best Practices:**
    - Small learning rate (2e-5 typical)
- Few epochs (2-4)
- Batch size: 16 or 32
- Warm-up steps
- Gradient clipping
3. **Computational Considerations:**
    - BERT-base: ~110M params, 512 max tokens
- Needs GPU (1-4 GB VRAM minimum)
- Batching for efficiency
- Consider DistilBERT for production
4. **Using HuggingFace:**
    - Easy access to 1000+ pre-trained models
- Standardized API
- Good documentation and community


---

# Summary 🎯


**What we learned today:**

1. **Contextual vs. Static:** Different vectors per occurrence
2. **ELMo (2018):**
    - BiLSTM language models
- Character-based, handles OOV
- Task-specific weighting
3. **Universal Sentence Encoder (2018):**
    - Sentence-level embeddings
- Two variants: Transformer & DAN
- Optimized for semantic similarity
4. **BERT (2018):**
    - Masked language modeling
- Deep bidirectional transformers
- Pre-train + fine-tune paradigm
- Revolutionized NLP
5. **Impact:** Established modern transfer learning in NLP
6. **Next:** Dimensionality reduction techniques for visualization


---

# Key References 📚



**Foundational Papers:**
- Peters et al. (2018). "Deep contextualized word representations" (ELMo)
- Cer et al. (2018). "Universal Sentence Encoder"
- Devlin et al. (2018). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"

**BERT Variants:**
- Liu et al. (2019). "RoBERTa: A Robustly Optimized BERT Pretraining Approach"
- Sanh et al. (2019). "DistilBERT, a distilled version of BERT"
- Lan et al. (2019). "ALBERT: A Lite BERT for Self-supervised Learning"

**Critical Perspectives:**
- Bender & Koller (2020). "Climbing towards NLU: On Meaning, Form, and Understanding"
- Bender et al. (2021). "On the Dangers of Stochastic Parrots"

**Resources:**
- HuggingFace Transformers: https://huggingface.co/transformers/
- BERT Paper: https://arxiv.org/abs/1810.04805


---

# Questions? 🙋



**Next Lecture:**

Dimensionality Reduction: PCA, t-SNE, UMAP

*Visualizing high-dimensional embeddings!*

