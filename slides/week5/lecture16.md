---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.17: Models of Language and Communication'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Lecture 16: Transformer architecture
## Week 5, Lecture 2 - Attention is all you need

**PSYC 51.17: Models of Language and Communication**

Winter 2026

---

# Today's agenda 



1. **The Transformer Revolution**: Why it changed everything
2. **Architecture Overview**: Encoder, Decoder, and components
3. **Self-Attention**: The core mechanism (Q, K, V)
4. **Self-Attention Example**: Understanding pronoun resolution
5. **Multi-Head Attention**: Learning diverse relationships
6. **Three Types of Attention**: Self, Masked, Cross

*Goal: Understand the Transformer architecture and self-attention*

---

# The transformer revolution 



**"Attention Is All You Need"**

<div class="columns">
<div class="column">

**Before Transformers (2017):**
- RNNs/LSTMs with attention
- Sequential processing
- Hard to parallelize
- Limited context window
- Slow training

</div>
<div class="column">

**After Transformers:**
- Parallel processing
- Scales to GPUs/TPUs
- Long-range dependencies
- Fast & effective

</div>
</div>

<div class="tip-box" data-title="Speed comparison">

Processing "The cat sat on the mat" (6 tokens):
- **RNN:** 6 sequential steps (must wait for each)
- **Transformer:** 1 parallel step (all tokens at once!)

Training speedup: **10-100x faster** on modern hardware

</div>

*Reference: Vaswani et al. (2017) - "Attention Is All You Need"*

---

# Why get rid of RNNs? 


**Limitations of Recurrent Architectures:**

<div class="columns">
<div class="column">

**1. Sequential Bottleneck**
- Must process token t before t+1
- Cannot parallelize across sequence

**2. Long-Range Dependencies**
- Info flows through many steps
- Gradient vanishing problems

**3. Memory Constraints**
- Hidden state must remember all

</div>
<div class="column">

**Concrete Example:**
```
Sentence: "The cat that I saw
yesterday at the park sat down"

Token 1 ("The") to token 11 ("sat"):
- RNN: Info passes through 10 steps
- Gradients shrink: 0.9^10 = 0.35
- By token 11, "The" is almost gone!

Transformer: Direct connection!
- "sat" attends directly to "cat"
- No information degradation
```

</div>
</div>

**Transformer Solution:** Every token can attend to every other token directly!

---

# Transformer architecture overview

**Key Components:**
- **Multi-Head Self-Attention**: Relate all positions to each other
- **Feed-Forward Networks**: Transform representations
- **Residual Connections & Layer Norm**: Training stability
- **Positional Encoding**: Inject position information


---

# Self-attention: the core mechanism 


**Key idea: Each word attends to all other words in the sequence**

**Three learned projections:**
- **Query (Q)**: What am I looking for?
- **Key (K)**: What do I contain?
- **Value (V)**: What information do I have?

**Computation:**
```
Q = X @ W_Q # Transform input to queries
K = X @ W_K # Transform input to keys
V = X @ W_V # Transform input to values

Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d)) @ V
```

<div class="tip-box" data-title="Intuition">

Each token asks: "Which other tokens are relevant to me?" (Q vs K)
Then collects information from relevant tokens (weighted sum of V)

</div>


---

# Understanding query, key, value 



**Analogy: Database lookup or information retrieval**

<div class="columns">
<div class="column">

**Information Retrieval:**
- **Query**: Your search query
- **Key**: Document titles/keywords
- **Value**: Document contents

**Process:**
1. Compare query to all keys
2. Get similarity scores
3. Weight values by scores
4. Return weighted combination

</div>
<div class="column">

**Self-Attention:**
- **Query**: What token $i$ is looking for
- **Key**: What token $j$ offers
- **Value**: Information from token $j$

**Process:**
1. Compare $Q_i$ to all $K_j$
2. Get attention scores
3. Weight all $V_j$ by scores
4. Return new representation for $i$

</div>
</div>

<div class="note-box" data-title="Key insight">

Each token simultaneously acts as:
- A query (what it needs from other tokens)
- A key (how it should be retrieved)
- A value (what information it provides)

</div>


---

# Scaled dot-product attention 


**Step-by-step computation with concrete example:**

**Input:** 3 tokens, embedding dim = 4

```python
# Input embeddings (3 tokens x 4 dims)
X = [[0.1, 0.2, 0.3, 0.4], # "The"
 [0.5, 0.6, 0.7, 0.8], # "cat"
 [0.2, 0.3, 0.4, 0.5]] # "sat"

# Step 1: Compute Q, K, V (using learned weights W_q, W_k, W_v)
Q = X @ W_q # [3 x 4]
K = X @ W_k # [3 x 4]
V = X @ W_v # [3 x 4]

# Step 2: Compute attention scores
scores = Q @ K.T # [3 x 3] - each token vs each token

# Step 3: Scale by sqrt(d_k) to prevent large values
scores = scores / sqrt(4) # divide by 2

# Step 4: Softmax to get attention weights
weights = softmax(scores) # rows sum to 1

# Step 5: Weighted sum of values
output = weights @ V # [3 x 4] - new contextual embeddings
```


---

# Self-attention example: pronoun resolution 


**Sentence: "The animal didn't cross the street because it was too tired"**

**Question: What does "it" refer to?**

```
Attention weights when processing "it":

 The animal didn't cross the street because it was too tired
"it" → 0.02 [0.45] 0.03 0.05 0.02 0.08 0.05 0.15 0.05 0.02 0.08
 ↑
 High attention to "animal" - model learns coreference!
```

**Self-attention allows the model to:**
- Resolve pronouns ("it" → "animal", not "street")
- Understand long-range dependencies (8 tokens apart!)
- Capture syntactic and semantic relationships
- Do this in parallel for all positions!


---

# Visualizing the attention matrix 


**For sentence: "The cat sat on the mat"**

| To $\rightarrow$ | The | cat | sat | on | the | mat |
| --- | --- | --- | --- | --- | --- | --- |
| From $\downarrow$ | | | | | | |
| cat | 0.1 | 0.5 | 0.2 | 0.1 | 0.05 | 0.05 |
| sat | 0.05 | 0.3 | 0.4 | 0.15 | 0.05 | 0.05 |
| on | 0.05 | 0.1 | 0.2 | 0.3 | 0.1 | 0.25 |
| the | 0.05 | 0.05 | 0.05 | 0.1 | 0.3 | 0.45 |
| mat | 0.05 | 0.05 | 0.1 | 0.2 | 0.2 | 0.4 |

**Observations:**
- Each row sums to 1.0 (probability distribution)
- Diagonal elements often high (self-attention)
- "cat" attends to itself and "The" (determiner-noun relationship)
- "mat" attends to "the" (determiner) and "on" (preposition)
- Captures syntactic and semantic structure automatically!


---

# Multi-head attention 


**Why use multiple attention heads?**

<div class="columns">
<div class="column">

**Intuition:**
- Different heads learn different relationships
- Head 1: Syntactic relationships
- Head 2: Semantic relationships
- Head 3: Positional patterns

**Formula:**
```python
# Each head has its own W_Q, W_K, W_V
head_1 = Attention(Q @ W1_Q, K @ W1_K, V @ W1_V)
head_2 = Attention(Q @ W2_Q, K @ W2_K, V @ W2_V)
# ... more heads ...

# Concatenate and project
output = concat(head_1, head_2, ...) @ W_O
```

</div>
<div class="column">

**Concrete Example:**
```
Sentence: "The cat sat on the mat"

Head 1 (syntax):
 "sat" → "cat" (subject-verb)
 "mat" → "the" (determiner)

Head 2 (semantics):
 "sat" → "mat" (action-location)
 "cat" → "sat" (agent-action)

Head 3 (position):
 Each word → neighbors
```

</div>
</div>

*BERT-base: 12 heads, BERT-large: 16 heads, GPT-3: 96 heads!*

---

# Why multiple heads? 



**Example: Different heads learn different patterns**

**Sentence: "The cat sat on the mat"**

<div class="columns">
<div class="column">

**Head 1: Syntactic Dependencies**
- "cat" → "The" (noun-determiner)
- "sat" → "cat" (verb-subject)
- "mat" → "the" (noun-determiner)
- Learns grammar structure

**Head 2: Semantic Relations**
- "sat" → "mat" (action-location)
- "cat" → "mat" (agent-location)
- Learns meaning relationships

</div>
<div class="column">

**Head 3: Local Context**
- Each word → neighbors
- Short-range dependencies
- N-gram like patterns

**Head 4: Long-Range**
- Distant word relationships
- Document-level context
- Coreference resolution

</div>
</div>

<div class="note-box" data-title="Ensemble effect">

Multiple heads provide a richer, more diverse representation by attending to different aspects of the input simultaneously!

</div>


---

# Three types of attention 


1. **Self-Attention (Encoder)**
 - Each position attends to all positions in same sequence
- Bidirectional: can see past and future
- Used in: BERT, encoder-only models

 

2. **Masked Self-Attention (Decoder)**
 - Each position attends only to previous positions
- Prevents "looking into the future"
- Used in: GPT, decoder-only models

 

3. **Cross-Attention (Encoder-Decoder)**
 - Decoder attends to encoder outputs
- Queries from decoder, Keys/Values from encoder
- Used in: T5, BART, machine translation

| Masked Self-Attention | Sequence | Same sequence (past only) |
| --- | --- | --- |
| Cross-Attention | Decoder | Encoder |


---

# Masked self-attention 


**Preventing the model from "cheating" during generation**

**Problem:** During training, we have the full target sequence. Without masking, the model could "peek" at future tokens!

**Solution:** Mask out future positions by setting attention scores to -infinity before softmax.

```python
# Example: Generating "The cat sat"
# When predicting "sat", model should only see "The cat"

scores = [[0.5, 0.3, 0.2], # "The" can see: The
 [0.4, 0.5, 0.1], # "cat" can see: The, cat
 [0.2, 0.4, 0.4]] # "sat" can see: The, cat, sat

# Apply causal mask (upper triangle = -infinity)
mask = [[ 0, -inf, -inf],
 [ 0, 0, -inf],
 [ 0, 0, 0 ]]

masked_scores = scores + mask
# After softmax: future positions get weight 0!
```

**Result:** Token at position t can only attend to positions <= t
- Maintains autoregressive property
- Enables parallel training while preserving causality


---

# Cross-attention 


**Connecting encoder and decoder in seq2seq models**

```
Encoder Outputs -> (Keys & Values) -> Decoder State -> (Queries) -> Cross-Attention -> Context-Aware Decoder
```

**Key Properties:**
- **Q** comes from decoder (what decoder needs)
- **K, V** come from encoder (what input provides)
- Allows decoder to "look at" relevant parts of input
- Similar to the original attention mechanism from Lecture 12!

**Used in:** Machine translation, summarization, any encoder-decoder task

---

# Implementing self-attention in PyTorch 


**Scaled dot-product attention**

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class SelfAttention(nn.Module):
 def __init__(self, embed_dim):
 super().__init__()
 self.embed_dim = embed_dim
 self.W_q = nn.Linear(embed_dim, embed_dim)
 self.W_k = nn.Linear(embed_dim, embed_dim)
 self.W_v = nn.Linear(embed_dim, embed_dim)

 def forward(self, x, mask=None):
 Q = self.W_q(x) # Queries: what am I looking for?
 K = self.W_k(x) # Keys: what do I contain?
 V = self.W_v(x) # Values: what info do I provide?

 # Attention scores: how similar are Q and K?
 scores = torch.matmul(Q, K.transpose(-2, -1))
 scores = scores / math.sqrt(self.embed_dim) # Scale!

 if mask is not None: # For causal/decoder attention
 scores = scores.masked_fill(mask == 0, -1e9)

 attn_weights = F.softmax(scores, dim=-1) # Normalize
 output = torch.matmul(attn_weights, V) # Weighted sum

 return output, attn_weights

# Usage example:
attn = SelfAttention(embed_dim=64)
x = torch.randn(1, 5, 64) # 5 tokens, 64-dim embeddings
out, weights = attn(x)
# out: [1, 5, 64] - contextualized embeddings
# weights: [1, 5, 5] - attention matrix
```


---

# Computational complexity 


**Understanding the cost of self-attention**

| Component | Time Complexity | Memory |
| --- | --- | --- |
| Self-Attention | O(n^2 * d) | O(n^2) |
| Feed-Forward | O(n * d^2) | O(d) |

where n = sequence length, d = embedding dimension

<div class="tip-box" data-title="Concrete example: memory usage">

**Sequence length n = 1000 tokens, d = 768 (BERT-base)**

Attention matrix size: n x n = 1000 x 1000 = **1 million entries**
At fp32 (4 bytes): **4 MB** per layer, per head

BERT-base: 12 layers x 12 heads = 144 attention matrices
Total: **576 MB** just for attention weights!

**If n = 10,000:** 100x more = **57.6 GB** (won't fit on most GPUs!)

</div>

**Typical context limits:**
- BERT: 512 | GPT-2: 1024 | GPT-3: 2048 | GPT-4: 128k (with optimizations)


---

# Discussion questions 


1. **Self-Attention vs RNN Attention:**
 - What's the key difference?
- Why is self-attention more powerful?
- When might RNNs still be useful?

 

2. **Query, Key, Value Framework:**
 - Why three separate projections instead of one?
- What if we used $Q = K = V = X$?
- How does this relate to information retrieval?

 

3. **Multi-Head Attention:**
 - Why not just use one big attention head?
- How many heads is optimal?
- Can we interpret what each head learns?

 

4. **Scalability:**
 - $O(n^2)$ is problematic for long documents. Solutions?
- Sparse attention? Local attention? Other ideas?


---

# Looking ahead 


**What's Next?**

**Today we learned:**
- Why transformers replaced RNNs
- Self-attention mechanism (Q, K, V)
- Multi-head attention
- Three types of attention (self, masked, cross)

**Next lecture (Lecture 17 - Training Transformers):**
- Positional encodings: How to inject position information
- Feed-forward networks: The other key component
- Layer normalization: Training stability
- Optimization: Making transformers faster
- Full architectures: Encoder, Decoder, Encoder-Decoder
- Pre-training and fine-tuning: Training and using transformers

**We're building up to BERT and GPT!**


---

# Summary

<!-- _class: scale-90 --> 


**Key Takeaways:**

1. **Transformer Revolution**
 - Pure attention, no recurrence
- Parallel processing, faster training
2. **Self-Attention Mechanism**
 - Query, Key, Value framework
- Each token attends to all others
- Scaled dot-product: $(QK^T/)V$
3. **Multi-Head Attention**
 - Multiple heads learn diverse relationships
- Concatenate and project back
- Richer representations
4. **Three Attention Types**
 - Self (encoder), Masked (decoder), Cross (encoder-decoder)
- Different uses for different architectures

**Self-attention is the foundation of modern NLP!**

---

# References

<!-- _class: scale-85 --> 


**Essential Papers:**

- **Vaswani et al. (2017)** - "Attention Is All You Need"
  - The original Transformer paper
  - Introduced self-attention, multi-head attention
  - Foundation of modern NLP

- **Bahdanau et al. (2015)** - "Neural Machine Translation by Jointly Learning to Align and Translate"
  - Original attention mechanism (for comparison)

**Tutorials and Resources:**

- **The Illustrated Transformer** by Jay Alammar
  - https://jalammar.github.io/illustrated-transformer/
  - Visual step-by-step explanation

- **Annotated Transformer** by Harvard NLP
  - https://nlp.seas.harvard.edu/annotated-transformer/
  - Line-by-line implementation

- **HuggingFace Course** - Chapter 3
  - How Transformers work


---

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

**Next lecture:** Training transformers

