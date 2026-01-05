---
marp: true
theme: cdl-theme
paginate: true
header: 'Models of Language and Conversation'
footer: 'Week 7'
---

<!-- _class: lead -->

# Lecture 21: GPT Architecture
## Generative Pre-Training for Language

**Models of Language and Conversation**

Week 7

---

# Today's Journey

1. **The GPT Revolution** - Pre-training + fine-tuning paradigm
2. **Transformer Decoder** - Architecture walkthrough
3. **Masked Self-Attention** - The core innovation
4. **Two-Stage Training** - Pre-training and fine-tuning
5. **Hands-on Code** - Building GPT blocks in PyTorch
6. **Key Results** - What made GPT successful

---

# The GPT Revolution

<div class="callout info">
<div class="callout-title">Discussion</div>

What made GPT different from previous language models?

</div>

**Key Innovation: Pre-training + Fine-tuning**
- **Pre-train** on massive unlabeled text (unsupervised)
- **Fine-tune** on specific tasks (supervised)
- Transfer learning for NLP
- One model, many tasks

<div class="callout warning">
<div class="callout-title">Paradigm Shift</div>

Before GPT: Task-specific models trained from scratch

After GPT: General-purpose models adapted to tasks

</div>

*Reference: Radford et al. (2018) - "Improving Language Understanding by Generative Pre-Training"*

---

# From BERT to GPT: Different Approaches

<div class="columns">
<div class="column">

**BERT (2018):**
- **Masked Language Model**
- Bidirectional context
- Fill in the blank
- Great for understanding
- Not designed for generation

*Example:*
"The [MASK] sat on the mat"

</div>
<div class="column">

**GPT (2018):**
- **Autoregressive Model**
- Left-to-right (causal)
- Predict next token
- Natural for generation
- Can also understand

*Example:*
"The cat sat" -> predict "on"

</div>
</div>

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Why is autoregressive modeling more natural for text generation?

</div>

---

# The Transformer Decoder

**GPT uses the Transformer *decoder* architecture**

<div class="columns">
<div class="column">

**Data Flow:**
1. Input tokens
2. Token + Position embeddings
3. N x Transformer blocks:
 - Masked self-attention
 - Feed-forward network
4. Output logits

</div>
<div class="column">

**Key Components:**
- **Embeddings**: Map tokens to vectors
- **Masked Attention**: Only see past tokens
- **Feed-Forward**: Process each position
- **Layer Norm**: Stabilize training

</div>
</div>

<div class="callout warning">
<div class="callout-title">Key Insight</div>

Masked attention prevents "peeking" at future tokens - essential for autoregressive generation!

</div>

---

# Transformer Decoder: Worked Example

**Example: Processing "The cat sat"**

```
Step 1: Token Embeddings
"The" -> [0.2, -0.1, 0.8, ...] (768-dim vector)
"cat" -> [0.5, 0.3, -0.2, ...]
"sat" -> [-0.1, 0.7, 0.4, ...]

Step 2: Add Position Embeddings
Position 0 embedding + "The" embedding
Position 1 embedding + "cat" embedding
Position 2 embedding + "sat" embedding

Step 3: Masked Self-Attention (for each layer)
"The" attends to: [The]
"cat" attends to: [The, cat]
"sat" attends to: [The, cat, sat]

Step 4: Predict Next Token
Output logits -> softmax -> "on" (highest probability)
```

---

# Masked Self-Attention

**The Core Innovation: Causal Masking**

**Attention Matrix for "The cat sat on":**

| | The | cat | sat | on |
|---------|------|------|------|------|
| **The** | 1.0 | -inf | -inf | -inf |
| **cat** | 0.3 | 0.7 | -inf | -inf |
| **sat** | 0.2 | 0.3 | 0.5 | -inf |
| **on** | 0.1 | 0.2 | 0.3 | 0.4 |

*Values show attention weights after softmax (masking sets values to -inf)*

**Each token can only attend to itself and previous tokens**
- Ensures autoregressive property
- No information leakage from future
- Allows parallel training

---

# Causal Mask: Code Implementation

```python
import torch

def create_causal_mask(seq_len):
 """Create lower-triangular mask for causal attention."""
 # Create a matrix of ones
 mask = torch.ones(seq_len, seq_len)
 # Keep only lower triangle (including diagonal)
 mask = torch.tril(mask)
 return mask

# Example for sequence length 4
mask = create_causal_mask(4)
print(mask)
# tensor([[1., 0., 0., 0.],
# [1., 1., 0., 0.],
# [1., 1., 1., 0.],
# [1., 1., 1., 1.]])

# In attention: scores.masked_fill(mask == 0, float('-inf'))
```

**This mask is applied before softmax to prevent attending to future tokens!**

---

# Position Encoding in GPT

**Why we need position information:**

<div class="callout info">
<div class="callout-title">The Problem</div>

Self-attention is *permutation invariant* - it doesn't inherently know word order!

</div>

**GPT's Solution: Learned Position Embeddings**
- Each position gets a learnable embedding
- Added to token embeddings: `embedding = token_emb + pos_emb`
- Model learns position patterns during training
- Maximum sequence length: 512 tokens (GPT-1)

<div class="columns">
<div class="column">

**Alternative: Sinusoidal**
(Used in original Transformer)
- Fixed function
- Generalizes to longer sequences

</div>
<div class="column">

**GPT: Learned**
(More flexible)
- Learned from data
- Task-specific patterns

</div>
</div>

---

# Position Embedding: Code Example

```python
import torch
import torch.nn as nn

class GPTEmbedding(nn.Module):
 def __init__(self, vocab_size, d_model, max_seq_len):
 super().__init__()
 # Token embeddings: word -> vector
 self.token_embed = nn.Embedding(vocab_size, d_model)
 # Position embeddings: position -> vector
 self.pos_embed = nn.Embedding(max_seq_len, d_model)

 def forward(self, x):
 seq_len = x.size(1)
 # Create position indices [0, 1, 2, ..., seq_len-1]
 positions = torch.arange(seq_len, device=x.device)
 # Combine: token embedding + position embedding
 return self.token_embed(x) + self.pos_embed(positions)

# Example usage
embed = GPTEmbedding(vocab_size=50000, d_model=768, max_seq_len=512)
tokens = torch.tensor([[101, 2054, 2003]]) # "The cat sat"
embeddings = embed(tokens) # Shape: (1, 3, 768)
```

---

# GPT-1 Model Specifications

| Component | Value |
|-----------|-------|
| Layers | 12 |
| Hidden size | 768 |
| Attention heads | 12 |
| Max sequence length | 512 tokens |
| Vocabulary size | 40,000 (BPE) |
| Training data | BooksCorpus (7,000 books) |
| Training tokens | ~5 billion |
| Total parameters | ~117 million |

**Training objective:**

$$\mathcal{L} = \sum_{i} \log P(t_i | t_{<i}; \Theta)$$

Maximize likelihood of next token given previous context.

---

# GPT Architecture in Code

```python
import torch.nn as nn

class GPTBlock(nn.Module):
 def __init__(self, d_model, n_heads):
 super().__init__()
 self.attention = MaskedMultiHeadAttention(d_model, n_heads)
 self.norm1 = nn.LayerNorm(d_model)
 self.ffn = nn.Sequential(
 nn.Linear(d_model, 4 * d_model),
 nn.GELU(), # GPT uses GELU, not ReLU
 nn.Linear(4 * d_model, d_model)
 )
 self.norm2 = nn.LayerNorm(d_model)

 def forward(self, x):
 # Pre-norm architecture (LayerNorm before sublayer)
 # Self-attention with residual connection
 x = x + self.attention(self.norm1(x))
 # Feed-forward with residual connection
 x = x + self.ffn(self.norm2(x))
 return x
```

---

# Complete GPT Model Structure

```python
class GPT(nn.Module):
 def __init__(self, vocab_size, d_model, n_layers, n_heads, max_len):
 super().__init__()
 self.token_embed = nn.Embedding(vocab_size, d_model)
 self.pos_embed = nn.Embedding(max_len, d_model)
 self.blocks = nn.ModuleList([
 GPTBlock(d_model, n_heads) for _ in range(n_layers)
 ])
 self.norm = nn.LayerNorm(d_model)
 self.head = nn.Linear(d_model, vocab_size)

 def forward(self, x):
 seq_len = x.size(1)
 positions = torch.arange(seq_len, device=x.device)
 x = self.token_embed(x) + self.pos_embed(positions)
 for block in self.blocks:
 x = block(x)
 x = self.norm(x)
 logits = self.head(x) # (batch, seq_len, vocab_size)
 return logits
```

---

# Two-Stage Training

<div class="columns">
<div class="column">

**Stage 1: Pre-training**
- Dataset: BooksCorpus (5B tokens)
- Objective: Next token prediction
- Duration: Weeks of training
- Result: General language model

</div>
<div class="column">

**Stage 2: Fine-tuning**
- Dataset: Task-specific (1K-100K examples)
- Objective: Task loss + LM loss
- Duration: Hours of training
- Result: Task-specialized model

</div>
</div>

**Why this works:**
- Pre-training learns general language understanding
- Fine-tuning adapts to specific task format
- Much less task data needed!

---

# Pre-training: Language Modeling

**Objective: Predict next token**

<div class="callout info">
<div class="callout-title">Example Training Sequence</div>

**Text:** "The quick brown fox jumps over the lazy dog"

**Training examples (teacher forcing):**
- Input: "The" -> Target: "quick"
- Input: "The quick" -> Target: "brown"
- Input: "The quick brown" -> Target: "fox"
- Input: "The quick brown fox" -> Target: "jumps"
- ...and so on

</div>

**Self-supervised learning:**
- No manual labels needed!
- Every text provides training signal
- Can use web-scale data
- Model learns: syntax, semantics, facts, reasoning

---

# Pre-training: Worked Example

**How loss is computed for one sequence:**

```python
# Input sequence: "The cat sat on the"
tokens = [101, 2054, 2003, 2006, 1996] # Token IDs

# Model predicts probability distribution for each position
# Position 0: P(next | "The") = {"cat": 0.3, "dog": 0.2, ...}
# Position 1: P(next | "The cat") = {"sat": 0.4, "ran": 0.1, ...}
# etc.

# Target tokens (shifted by 1)
targets = [2054, 2003, 2006, 1996, 2282] # "cat sat on the mat"

# Cross-entropy loss at each position
loss_0 = -log(0.3) # P("cat" | "The")
loss_1 = -log(0.4) # P("sat" | "The cat")
loss_2 = -log(0.35) # P("on" | "The cat sat")
# ...

total_loss = mean(loss_0, loss_1, loss_2, ...)
```

---

# Fine-tuning for Downstream Tasks

**Task Format: Input + Delimiter + Label**

<div class="columns">
<div class="column">

**Text Classification:**

```
[START] This movie is amazing! [DELIM]
```
Model predicts: "Positive"

**Entailment:**

```
[START] Premise [DELIM] Hypothesis [DELIM]
```
Model predicts: "Entailment" / "Contradiction"

</div>
<div class="column">

**Question Answering:**

```
[START] Context [DELIM] Question [DELIM]
```
Model predicts answer span

**Similarity:**

```
[START] Text1 [DELIM] Text2 [DELIM]
```
Model predicts similarity score

</div>
</div>

<div class="callout warning">
<div class="callout-title">Key Insight</div>

All tasks can be framed as text completion!

</div>

---

# Fine-tuning: Concrete Example

**Sentiment Classification Example:**

```python
# Training example
text = "This movie was absolutely fantastic!"
label = "positive"

# Format for GPT
input_text = "[START] This movie was absolutely fantastic! [DELIM]"
# Tokenize: [50256, 1212, 3807, 373, 5765, 12779, 0, 50257]

# During fine-tuning:
# 1. GPT processes the input
# 2. Take the hidden state at [DELIM] position
# 3. Pass through classification head
logits = classification_head(hidden_state) # [pos_score, neg_score]
# 4. Compute cross-entropy with label
loss = cross_entropy(logits, label_id)

# Fine-tuning hyperparameters
learning_rate = 6.25e-5 # Much lower than pre-training!
batch_size = 32
epochs = 3
```

---

# Fine-tuning Implementation Details

**What changes during fine-tuning?**

1. **Add task-specific input transformations**
 - Format inputs with delimiters
 - Add special tokens

2. **Add classification head (optional)**
 - Linear layer for classification
 - Or use language modeling head

3. **Train with supervised objective**
 - Cross-entropy loss
 - Much lower learning rate
 - Few epochs (3-5)

**Hyperparameters:**
- Learning rate: 6.25e-5 (much lower than pre-training!)
- Batch size: 32
- Max epochs: 3
- Linear learning rate decay to 0

---

# GPT-1 Results

**Performance on GLUE Benchmark:**

| Task | Previous SOTA | GPT-1 |
|------|---------------|-------|
| Question Answering | 86.7 | 88.1 |
| Semantic Similarity | 85.0 | 85.8 |
| Text Classification | 93.0 | 94.2 |
| Natural Language Inference | 80.6 | 82.1 |

<div class="callout warning">
<div class="callout-title">Key Findings</div>

- GPT achieved SOTA on 9 out of 12 tasks studied
- Large improvements on tasks with less training data
- Transfer learning works for NLP!

</div>

*Reference: Radford et al. (2018) - "Improving Language Understanding by Generative Pre-Training"*

---

# Zero-Shot and Few-Shot Learning

<div class="callout info">
<div class="callout-title">Discussion</div>

What if we could use the model *without* fine-tuning?

</div>

**Definitions:**
- **Zero-shot**: No task-specific training examples
- **Few-shot**: A few examples (1-10) as context
- **Fine-tuning**: Full supervised training

**GPT-1 observations:**
- Fine-tuning works best
- Zero-shot performance is weak
- Model has learned a lot, but needs task formatting

<div class="callout tip">
<div class="callout-title">Think about it!</div>

This limitation motivated GPT-2 and GPT-3: Can we make models that work zero-shot?

</div>

---

# Zero-Shot vs Fine-tuning: Example

**Task: Sentiment Classification**

<div class="columns">
<div class="column">

**Zero-shot (GPT-1):**
```
Input: "Review: Great movie!
Sentiment:"
Output: ??? (unreliable)
```
GPT-1 might just continue the text randomly.

</div>
<div class="column">

**After Fine-tuning:**
```
Input: "[START] Great movie! [DELIM]"
Output: "Positive" (reliable)
```
Model learned task format from examples.

</div>
</div>

**Why the difference?**
- Pre-training teaches language, not task formats
- Fine-tuning teaches: "when you see [DELIM], output a label"
- GPT-2/3 would see enough examples in training to do this zero-shot

---

# Visualizing What GPT Learns

**Layer-by-layer analysis of GPT representations:**

| Layer | What it learns | Example |
|-------|----------------|---------|
| 1-3 | Word order, grammar | "The cat" vs "cat The" |
| 4-6 | Word meanings, syntax | Subject-verb agreement |
| 7-9 | Semantic relationships | "bank" in different contexts |
| 10-12 | World knowledge, task | "Paris is the capital of..." |

**Layer analysis shows:**
- Early layers: Syntactic patterns
- Middle layers: Semantic understanding
- Later layers: Task-specific reasoning
- Progressive abstraction!

---

# The Generative Pre-training Paradigm

**Why "Generative Pre-Training" was revolutionary:**

1. **Unified Architecture**
 - Same model for all tasks
 - vs. task-specific architectures

2. **Transfer Learning**
 - Learn once, apply many times
 - vs. training from scratch

3. **Scalability**
 - More data -> Better performance
 - Clear path to improvement

4. **Simplicity**
 - Just predict next token
 - No complex objectives

<div class="callout warning">
<div class="callout-title">This paradigm enabled GPT-2, GPT-3, and beyond!</div>

</div>

---

# Limitations of GPT-1

**What GPT-1 couldn't do well:**

- **Zero-shot performance**: Needed fine-tuning for each task
- **Model size**: 117M parameters (small by today's standards)
- **Training data**: Limited to ~5B tokens
- **Context length**: Only 512 tokens
- **Generation quality**: Sometimes incoherent
- **Factual accuracy**: Prone to hallucinations

<div class="callout info">
<div class="callout-title">Discussion</div>

How would you address these limitations?

*(Spoiler: GPT-2 and GPT-3 tried to solve these!)*

</div>

---

# Comparison with BERT

| Aspect | BERT | GPT |
|--------|------|-----|
| Training objective | Masked LM | Autoregressive LM |
| Context | Bidirectional | Left-to-right |
| Best for | Understanding | Generation |
| Fine-tuning | Task-specific heads | Unified format |
| Parameters (base) | 110M | 117M |

<div class="callout tip">
<div class="callout-title">Think about it!</div>

BERT dominated understanding tasks (2018-2019), but GPT's approach proved more scalable and versatile. Why?

</div>

**Answer:** Autoregressive modeling naturally supports generation, which unlocks zero-shot and few-shot capabilities!

---

# Key Takeaways

1. **GPT introduced generative pre-training**
 - Transformer decoder architecture
 - Autoregressive language modeling

2. **Two-stage training paradigm**
 - Unsupervised pre-training on massive text
 - Supervised fine-tuning on task data

3. **Masked self-attention is key**
 - Enables autoregressive generation
 - Prevents information leakage

4. **Transfer learning for NLP**
 - Learn general patterns once
 - Apply to many tasks

5. **Foundation for modern LLMs**
 - GPT-2, GPT-3, ChatGPT all build on this

---

# Readings

<div class="callout info">
<div class="callout-title">Required Reading</div>

**Radford et al. (2018)** - "Improving Language Understanding by Generative Pre-Training"

[[PDF]](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)

</div>

<div class="callout info">
<div class="callout-title">Recommended Readings</div>

- **Vaswani et al. (2017)** - "Attention is All You Need" [[ArXiv]](https://arxiv.org/abs/1706.03762)
- **Devlin et al. (2018)** - "BERT: Pre-training of Deep Bidirectional Transformers" [[ArXiv]](https://arxiv.org/abs/1810.04805)
- **The Illustrated GPT-2** by Jay Alammar [[Blog]](https://jalammar.github.io/illustrated-gpt2/)

</div>

---

# Next Lecture Preview

<div class="callout info">
<div class="callout-title">Lecture 22: Scaling Up to GPT-3 and Beyond</div>

- GPT-2: Language models as unsupervised multitask learners
- GPT-3: Few-shot learning at scale
- Scaling laws: Why bigger is better
- Emergent abilities of large language models
- From GPT-3 to ChatGPT

</div>

Questions?
