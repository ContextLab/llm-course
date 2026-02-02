---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.17: Models of Language and Communication'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Lecture 17: Training transformers
## Week 5, Lecture 3 - From Architecture to Implementation

**PSYC 51.17: Models of Language and Communication**

Winter 2026

---

# Today's Agenda 



1. **Positional Encoding**: Injecting sequence order
2. **Feed-Forward Networks**: The other key component
3. **Layer Norm & Residuals**: Training deep networks
4. **FlashAttention**: Making transformers faster
5. **Three Architectures**: Encoder, Decoder, Both
6. **Practical Implementation**: Using HuggingFace

*Goal: Complete understanding of transformer training and implementation*

---

# Positional encoding


**Problem: Self-attention is permutation-invariant!**

Without position information:
- "The cat sat" = "sat cat the" = "cat the sat"
- Order matters in language!

**Solution: Add positional encodings to input embeddings**

<div class="columns">
<div class="column">

**Original Transformer (Sinusoidal):**
```python
# PE(pos, 2i) = sin(pos / 10000^(2i/d))
# PE(pos, 2i+1) = cos(pos / 10000^(2i/d))

# Position 0, dim 0: sin(0/10000^0) = 0
# Position 1, dim 0: sin(1/10000^0) = 0.84
# Position 2, dim 0: sin(2/10000^0) = 0.91
```

**Properties:**
- Deterministic, unique per position
- Generalizes to unseen lengths

</div>
<div class="column">

**Concrete Example:**
```
Token embeddings:
"The" = [0.2, 0.5, 0.1, 0.8]
"cat" = [0.9, 0.3, 0.7, 0.2]

Positional encodings:
pos_0 = [0.0, 1.0, 0.0, 1.0]
pos_1 = [0.84, 0.54, 0.01, 1.0]

Final input (add them):
"The" = [0.2, 1.5, 0.1, 1.8]
"cat" = [1.74, 0.84, 0.71, 1.2]
```

</div>
</div>

*References: Vaswani et al. (2017), Su et al. (2021)*

---

# Why sinusoidal positional encoding?


**Advantages of sine/cosine functions:**

<div class="columns">
<div class="column">

**1. Unique Patterns**
- Each position gets unique vector
- Different frequencies per dimension

**2. Relative Position Info**
- PE(pos+k) = linear function of PE(pos)
- Model learns relative positions

**3. Extrapolation**
- Works for sequences longer than training
- No need to retrain

**4. No Parameters**
- Deterministic, saves memory

</div>
<div class="column">

**Visualization:**
```
Dim 0 (high freq): ~~~~~ (fast oscillation)
Dim 1 (mid freq): ~~~ (medium)
Dim 2 (low freq): ~ (slow)

Position 0: [0.0, 0.0, 0.0, ...]
Position 1: [0.84, 0.01, 0.0001, ...]
Position 2: [0.91, 0.02, 0.0002, ...]
...
Position 100: [0.51, 0.86, 0.01, ...]

Each position has a unique "barcode"!
```

</div>
</div>


---

# Visualizing positional encodings


**Each position gets a unique pattern across dimensions**

```
Pos 0 -> Pos 5 -> Pos 9 -> Dim 0 -> Dim 4 -> Dim 7
```

**Key Insight:**
- Lower dimensions: Rapid oscillation (high frequency)
- Higher dimensions: Slow oscillation (low frequency)
- Creates a unique "barcode" for each position
- Model learns to use these patterns for positional awareness


---

# Feed-forward networks


**After attention, apply position-wise feed-forward network**

**Architecture:** Two linear layers with ReLU/GELU activation

```python
class FeedForward(nn.Module):
 def __init__(self, d_model=768, d_ff=3072): # 4x expansion
 super().__init__()
 self.linear1 = nn.Linear(d_model, d_ff) # 768 → 3072
 self.linear2 = nn.Linear(d_ff, d_model) # 3072 → 768
 self.relu = nn.ReLU()

 def forward(self, x):
 # x: [batch, seq_len, 768]
 x = self.linear1(x) # [batch, seq_len, 3072]
 x = self.relu(x) # Non-linearity!
 x = self.linear2(x) # [batch, seq_len, 768]
 return x

# Applied to each position independently
# Same weights for all positions
```

**Purpose:** Add non-linearity and increase model capacity
- Attention is mostly linear (weighted sums)
- FFN adds expressiveness through ReLU/GELU

---

# Why feed-forward networks?


**Role in the Transformer:**

1. **Add Non-linearity**
 - Attention is mostly linear operations (weighted sums)
- FFN introduces non-linear transformations
- ReLU/GELU activation adds expressiveness

 

2. **Position-wise Processing**
 - Attention mixes information across positions
- FFN processes each position independently
- Allows position-specific feature transformations

 

3. **Increase Model Capacity**
 - Expansion (4x) provides more parameters
- Can learn complex feature combinations
- Most parameters in transformer are in FFN layers!

 

4. **Feature Refinement**
 - Attention gathers context
- FFN refines and transforms the representation
- Two complementary operations


---

# Layer normalization & residual connections


**Critical for training deep transformers!**

<div class="columns">
<div class="column">

**Residual Connections:**
```python
# output = sublayer(x) + x
x = x + self.attention(x)
x = x + self.feedforward(x)
```
- Gradients flow directly through
- Prevents vanishing gradients
- Enables 96-layer models (GPT-3)!

</div>
<div class="column">

**Layer Normalization:**
```python
# Normalize across features (not batch)
def layer_norm(x, gamma, beta):
 mean = x.mean(dim=-1)
 std = x.std(dim=-1)
 return gamma * (x - mean) / std + beta

# Example: x = [0.2, 0.8, 0.5]
# mean=0.5, std=0.25
# normalized = [-1.2, 1.2, 0.0]
```

</div>
</div>

**Standard Pattern (Post-Norm):**
```python
x = LayerNorm(x + Attention(x))
x = LayerNorm(x + FeedForward(x))
```


---

# Pre-norm vs post-norm



**Two ways to arrange LayerNorm and residual connections**

<div class="columns">
<div class="column">

**Post-Norm (Original):**
```python
# Normalize AFTER residual
x = LayerNorm(x + Attention(x))
x = LayerNorm(x + FFN(x))
```
- Used in original Transformer, BERT
- Can be unstable for deep models
- Requires careful initialization

</div>
<div class="column">

**Pre-Norm (Modern):**
```python
# Normalize BEFORE sublayer
x = x + Attention(LayerNorm(x))
x = x + FFN(LayerNorm(x))
```
- Used in GPT-2, GPT-3, LLaMA
- More stable gradients
- Easier to train 96+ layer models

</div>
</div>

<div class="note-box" data-title="Recommendation">
For deep transformers (24+ layers), Pre-Norm is preferred due to better training stability. Post-Norm can achieve slightly better final performance with careful tuning.
</div>


---

# Complete transformer block


**Putting it all together:**

```python
class TransformerBlock(nn.Module):
 def __init__(self, d_model=768, n_heads=12, d_ff=3072):
 super().__init__()
 self.attention = MultiHeadAttention(d_model, n_heads)
 self.ffn = FeedForward(d_model, d_ff)
 self.norm1 = nn.LayerNorm(d_model)
 self.norm2 = nn.LayerNorm(d_model)

 def forward(self, x):
 # Self-attention with residual
 x = x + self.attention(self.norm1(x))
 # Feed-forward with residual
 x = x + self.ffn(self.norm2(x))
 return x

# Stack N blocks!
encoder = nn.Sequential(*[TransformerBlock() for _ in range(12)])
```

**Model sizes:**
- BERT-base: 12 blocks, 110M params | BERT-large: 24 blocks, 340M params
- GPT-3: 96 blocks, 175B params!


---

# FlashAttention: Making transformers faster


**Problem: Standard attention is slow and memory-hungry!**

<div class="warning-box" data-title="Standard Attention Complexity">
- Time: O(n^2) where n = sequence length
- Memory: O(n^2) to store attention matrix
- Bottleneck: Reading/writing to GPU memory (HBM)
</div>

<div class="columns">
<div class="column">

**FlashAttention Innovation:**
- Tile-based computation
- Uses fast SRAM instead of slow HBM
- Fused operations (fewer memory reads)
- Recomputation in backward pass

```python
# Standard: materialize full n×n matrix
attn = softmax(Q @ K.T / sqrt(d))
out = attn @ V # O(n^2) memory

# FlashAttention: compute in tiles
for tile in tiles:
 # Only load small tile to SRAM
 # Never materialize full matrix!
```

</div>
<div class="column">

**Concrete Speedup:**

| Method | Speed | Memory |
| --- | --- | --- |
| Standard | 1x | 1x |
| FlashAttention | 3x faster | 0.5x |

**Real Impact:**
- Sequence 1024→4096 on same GPU
- Training 2-4x faster
- Used in: LLaMA, GPT-4, Mistral

</div>
</div>

*Reference: Dao et al. (2022) - "FlashAttention"*

---

# Other attention optimizations


**Addressing the $O(n^2)$ problem:**

1. **Sparse Attention**
 - Only attend to subset of positions
- Local windows + global tokens
- Used in: Longformer, BigBird

 

2. **Linear Attention**
 - Approximate attention with linear complexity
- Kernel trick to avoid materializing attention matrix
- Used in: Performer, Linear Transformer

 

3. **Low-Rank Approximation**
 - Factorize attention matrix
- Reduce memory footprint
- Used in: Linformer

 

4. **Sliding Window**
 - Fixed-size local attention window
- Constant memory usage
- Used in: Mistral 7B

**Trade-off:** Efficiency vs. expressiveness. Full attention often still best for quality.

---

# Three transformer architectures



| Architecture | How it works | Examples | Uses |
| --- | --- | --- | --- |
| **Encoder-Only** | Full self-attention | BERT, RoBERTa | Classification, NER, QA |
| **Decoder-Only** | Causal/masked attention | GPT-2, GPT-3 | Generation, completion |
| **Encoder-Decoder** | Encoder + decoder with cross-attention | T5, BART, mT5 | Translation, summarization |

<div class="note-box" data-title="Key Difference: Attention Masking">
- **Encoder:** Full self-attention (bidirectional)
- **Decoder:** Causal/masked attention (unidirectional)
</div>


---

# Visual comparison: Encoder vs Decoder vs Both

**Encoder-Only (BERT):** Self-Attention → bidirectional

**Decoder-Only (GPT):** Masked Attention → causal

**Choosing the Right Architecture:**
- Need to understand full context? → **Encoder** (BERT)
- Need to generate text? → **Decoder** (GPT)
- Need both (translate, summarize)? → **Encoder-Decoder** (T5)


---

# Using transformers in practice


**HuggingFace makes it easy!**

```python
from transformers import AutoModel, AutoTokenizer

# Load pre-trained model (downloads ~440MB first time)
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Tokenize input
text = "The animal didn't cross the street because it was too tired"
inputs = tokenizer(text, return_tensors="pt")
print(inputs['input_ids'])
# tensor([[ 101, 1996, 4111, 2134, 1005, 1056, 2892, 1996,
# 2395, 2138, 2009, 2001, 2205, 5458, 102]])
# [CLS] The animal didn ' t cross the ...

# Get contextualized embeddings
outputs = model(**inputs)
hidden_states = outputs.last_hidden_state # [1, 15, 768]

# "it" is at position 10 - its embedding knows it refers to "animal"!
it_embedding = hidden_states[0, 10, :] # 768-dim context-aware vector
```

*Reference: HuggingFace Course - Chapter 1.4*

---

# Comparing architectures: Code examples


**Different architectures for different tasks**

```python
from transformers import AutoModelForSequenceClassification, \
 AutoModelForCausalLM, \
 AutoModelForSeq2SeqLM

# 1. ENCODER-ONLY (BERT): Classification
encoder_model = AutoModelForSequenceClassification.from_pretrained(
 "bert-base-uncased", num_labels=2
)
# Use for: Sentiment analysis, NER, classification

# 2. DECODER-ONLY (GPT): Text generation
decoder_model = AutoModelForCausalLM.from_pretrained("gpt2")
# Use for: Text completion, creative writing, few-shot learning

# 3. ENCODER-DECODER (T5): Seq2Seq tasks
seq2seq_model = AutoModelForSeq2SeqLM.from_pretrained("t5-base")
# Use for: Translation, summarization, question answering

# All use transformer architecture, different attention patterns!
```

**Key Takeaway:** Choose architecture based on your task!

---

# Practical tips for training transformers (Part 1)

**1. Learning Rate & Warmup**
```python
# Warmup: gradually increase LR
# Then decay (linear or cosine)
scheduler = get_linear_schedule_with_warmup(
 optimizer,
 num_warmup_steps=1000, # ~10% of training
 num_training_steps=10000
)
# Fine-tuning: lr=2e-5, From scratch: lr=1e-4
```

**2. Optimizer**
```python
optimizer = AdamW(
 model.parameters(),
 lr=2e-5,
 weight_decay=0.01 # L2 regularization
)
```

---

# Practical tips for training transformers (Part 2)

**3. Regularization**
```python
# Dropout after attention and FFN
self.dropout = nn.Dropout(0.1)

# Gradient clipping
torch.nn.utils.clip_grad_norm_(
 model.parameters(), max_norm=1.0
)
```

**4. Mixed Precision (FP16)**
```python
from torch.cuda.amp import autocast

with autocast(): # Use FP16
 outputs = model(inputs)
 loss = criterion(outputs, labels)
# 2x faster, 2x less memory!
```


---

# Computational efficiency tips (Part 1)

**1. Batch Size**
- Larger batches = better GPU utilization
- Use gradient accumulation if GPU memory limited
- Typical: effective batch size 256-2048 tokens

**2. Sequence Length**
- Shorter sequences train faster (quadratic complexity!)
- Consider truncation or sliding windows
- Pack multiple examples to maximize GPU usage

---

# Computational efficiency tips (Part 2)

**3. Model Size**
- Start small, scale up if needed
- DistilBERT: 40% smaller, 60% faster, 97% performance
- Consider model distillation for deployment

**4. Hardware**
- GPUs with high memory bandwidth (A100, H100)
- Multi-GPU training with data parallelism
- Use FlashAttention when available


---

# Discussion questions


1. **Positional Encoding:**
 - Why add instead of concatenate?
- What happens without positional encoding?
- Learned vs. fixed: which is better?

 

2. **Architecture Choice:**
 - When would you use encoder-only vs decoder-only?
- Can GPT do classification? Can BERT generate?
- Why has decoder-only become more popular recently?

 

3. **Scaling:**
 - Is bigger always better?
- What are the limits to scaling transformers?
- How do we make them more efficient?

 

4. **Training Stability:**
 - Why are residual connections so important?
- Pre-norm vs post-norm: trade-offs?


---

# Looking ahead to Week 6

**This week (Week 5) we learned:**
- Attention mechanisms (Lecture 15)
- Self-attention and transformer architecture (Lecture 16)
- Training transformers: all the components (Lecture 17)

**Next week (Week 6):**

- Masked Language Modeling
- Pre-training and fine-tuning
- Contextual embeddings in action
- RoBERTa, ALBERT, DistilBERT
- Improvements and optimizations
- Real-world BERT applications
- Cognitive neuroscience connections
- Understanding vs. pattern matching

**Assignment 4:** Building context-aware systems (check syllabus for details)

---

# Summary


**Key Takeaways:**

1. **Positional Encoding**
 - Sine/cosine functions inject position information
- Enables model to understand order
2. **Feed-Forward Networks**
 - Position-wise transformations
- Add non-linearity and capacity
3. **LayerNorm & Residuals**
 - Critical for training deep networks
- Stabilize gradients, enable deeper models
4. **Three Architectures**
 - Encoder (BERT), Decoder (GPT), Both (T5)
- Choose based on task requirements
5. **Practical Considerations**
 - Use HuggingFace for easy implementation
- FlashAttention for efficiency
- Careful hyperparameter tuning


---

# References


**Essential Papers:**

- **Vaswani et al. (2017)** - "Attention Is All You Need" - The original Transformer paper
- **Su et al. (2021)** - "RoFormer: Enhanced Transformer with Rotary Position Embedding" - Modern positional encoding approach
- **Dao et al. (2022)** - "FlashAttention: Fast and Memory-Efficient Exact Attention" - Making transformers faster

**Tutorials:**
- HuggingFace Course: Chapters 1.4, 1.5
- The Illustrated Transformer: https://jalammar.github.io/illustrated-transformer/
- Annotated Transformer: https://nlp.seas.harvard.edu/annotated-transformer/


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

**Next week:** BERT deep dive

