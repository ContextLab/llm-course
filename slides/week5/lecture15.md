---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.17: Models of Language and Communication'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Lecture 15: Attention Mechanisms
## Week 5, Lecture 1 - From Seq2Seq to Attention

**PSYC 51.17: Models of Language and Communication**

Winter 2026

---

# Today's Agenda 



1. **The Context Problem**: Why static embeddings aren't enough
2. **Sequence-to-Sequence Models**: The foundation
3. **The Bottleneck Problem**: Why vanilla Seq2Seq struggles
4. **Attention Mechanisms**: The breakthrough innovation
5. **How Attention Works**: Step-by-step computation
6. **Visualizing Attention**: Interpreting the weights

*Goal: Understand why and how attention revolutionized NLP*

---

# The Context Problem 



**Why do we need context-aware models?**

<div class="callout tip">
<div class="callout-title">Example: The word "bank"</div>

1. "I deposited money at the **bank**" (financial institution)
2. "We sat by the river **bank**" (riverside)
3. "The plane started to **bank** left" (tilt/turn)

</div>

<div class="columns">
<div class="column">

**Static Embeddings (Word2Vec):**
- One vector per word
- Context-independent
- "bank" = [0.2, -0.5, 0.8, ...] always

</div>
<div class="column">

**Context-Aware Models:**
- Different representation per occurrence
- Uses surrounding context
- Handles polysemy naturally

</div>
</div>


---

# Sequence-to-Sequence Models 


**The breakthrough for variable-length input/output problems**

**Applications:**
- Machine Translation: English → French
- Summarization: Long text → Short summary
- Question Answering: Question + Context → Answer
- Dialogue Systems: User input → System response

<div class="callout tip">
<div class="callout-title">Concrete Example: Machine Translation</div>

**Input:** "The cat sat on the mat" (6 tokens)
**Output:** "Le chat s'est assis sur le tapis" (7 tokens)

Different input/output lengths require flexible architecture!

</div>

*Reference: Sutskever et al. (2014) - "Sequence to Sequence Learning with Neural Networks"*

---

# Encoder-Decoder Architecture 


**Two-part architecture: Encode then Decode**

<div class="columns">
<div class="column">

**Encoder:**
- Reads input sequence
- Compresses to fixed-size vector
- Captures semantic meaning

**Decoder:**
- Starts from context vector
- Generates output sequence
- One token at a time

</div>
<div class="column">

**Worked Example:**
```
Input: "The" → "cat" → "sat"
 ↓ ↓ ↓
 h₁ → h₂ → h₃ = context
 ↓
Output: "Le" ← "chat" ← [START]
```

The final hidden state h₃ summarizes the entire input!

</div>
</div>


---

# The Seq2Seq Bottleneck Problem 


**Challenge: All information compressed into single vector!**

<div class="callout warning">
<div class="callout-title">The Problem</div>

- Long sequences → information loss
- Fixed-size context vector is a bottleneck
- Early tokens forgotten by the time we reach the end
- Performance degrades with sequence length

</div>

<div class="callout tip">
<div class="callout-title">Concrete Example: Long Sentence Translation</div>

**Input (20 words):** "The quick brown fox jumps over the lazy dog while the cat watches from the warm sunny windowsill nearby"

**Problem:** All 20 words must fit into one 256-dim vector!
- Early words ("The quick brown") get overwritten
- By the time we translate, we've "forgotten" the beginning

</div>

**Solution: Attention! **


---

# Attention Mechanism: The Big Idea 


**Instead of compressing everything into one vector...**

**Let the decoder look at all encoder hidden states!**

```
$h_1$ -> $h_2$ -> $h_3$ -> $h_4$ -> Encoder: -> $s_t$ -> Decoder: -> Input: "The cat sat down"
```

**Key Insight:** When generating "chat" (cat), pay more attention to "cat" in the input!

*Reference: Bahdanau et al. (2015) - "Neural Machine Translation by Jointly Learning to Align and Translate"*

---

# How Attention Works: Step by Step 


**Computing attention weights:**

1. **Score**: How relevant is each encoder state to current decoder state?
 - e_{t,i} = score(s_t, h_i) = s_t^T W_a h_i

2. **Normalize**: Convert scores to probabilities (softmax)
 - alpha_{t,i} = exp(e_{t,i}) / sum_j exp(e_{t,j})

3. **Context**: Weighted sum of encoder states
 - c_t = sum_i alpha_{t,i} * h_i

4. **Decode**: Use context vector along with decoder state
 - s_{t+1} = f(s_t, c_t, y_t)

**Result:** Decoder dynamically focuses on different parts of input!

---

# Worked Example: Attention Computation 


**Translating "I love cats" → "J'aime les chats"**

**Step 1: Encoder produces hidden states**
```
h₁ = [0.2, 0.8] ("I")
h₂ = [0.9, 0.3] ("love")
h₃ = [0.4, 0.7] ("cats")
```

**Step 2: When generating "chats", compute scores**
- Decoder state s = [0.5, 0.6]
- Score with h₁: s · h₁ = 0.5×0.2 + 0.6×0.8 = **0.58**
- Score with h₂: s · h₂ = 0.5×0.9 + 0.6×0.3 = **0.63**
- Score with h₃: s · h₃ = 0.5×0.4 + 0.6×0.7 = **0.62**

**Step 3: Softmax to get attention weights**
- alpha = softmax([0.58, 0.63, 0.62]) = **[0.31, 0.35, 0.34]**

**Step 4: Context = weighted sum**
- c = 0.31×h₁ + 0.35×h₂ + 0.34×h₃ = **[0.51, 0.58]**

Model focuses most on "love" and "cats" when generating "chats"!

---

# Attention Score Functions 


**Different ways to compute the score**

<div class="columns">
<div class="column">

**1. Additive (Bahdanau):**
```python
# score = v^T * tanh(W1*s + W2*h)
score = v @ tanh(W1 @ s + W2 @ h)
```
- More parameters, flexible

**2. Multiplicative (Luong):**
```python
# score = s^T * W * h
score = s @ W @ h
```
- Simpler, faster

</div>
<div class="column">

**3. Dot-Product:**
```python
# score = s^T * h
score = s @ h
```
- No parameters!

**4. Scaled Dot-Product (Transformers):**
```python
# score = (s^T * h) / sqrt(d)
score = (s @ h) / sqrt(dim)
```
- Prevents gradient issues

</div>
</div>

*Reference: Luong et al. (2015) - "Effective Approaches to Attention-based Neural Machine Translation"*

---

# Attention Visualization 


**Example: English → French translation with attention weights**

**Input:** "The European Economic Area"
**Output:** "La zone economique europeenne"

```
 The European Economic Area
La [0.8] 0.1 0.05 0.05
zone 0.05 [0.1] 0.1 [0.75] ← "zone" = "Area"
economique 0.05 0.1 [0.8] 0.05
europeenne 0.05 [0.8] 0.1 0.05 ← reordering!
```

**Observations:**
- Diagonal pattern for similar word order
- Model learns alignment automatically!
- "europeenne" attends to "European" (reordering handled!)
- No need for explicit word alignment annotations

*Attention provides interpretability: we can see what the model is "looking at"*

---

# Benefits of Attention Mechanisms 


1. **Solves the Bottleneck Problem**
 - Decoder has access to all encoder states
- No information compression into single vector
- Works well for long sequences

 

2. **Improves Performance**
 - Better BLEU scores on translation tasks
- Handles long-range dependencies
- More robust to sequence length

 

3. **Provides Interpretability**
 - Can visualize what the model focuses on
- Helps debug and understand model behavior
- Builds trust in model predictions

 

4. **Enables Better Alignment**
 - Learns source-target correspondences
- No need for external alignment tools
- Works across different language pairs

**Attention became the foundation for modern NLP!**

---

# Real-World Impact of Attention 



**Attention mechanisms revolutionized multiple domains:**

<div class="columns">
<div class="column">

**Machine Translation:**
- Google Translate (2016)
- DeepL
- Facebook translations
- Dramatic quality improvements

**Text Summarization:**
- News article summarization
- Document understanding
- Email auto-responses

</div>
<div class="column">

**Question Answering:**
- Reading comprehension
- Search engines
- Virtual assistants

**Speech Recognition:**
- Attend to acoustic features
- Better transcription accuracy
- Listen, Attend and Spell models

</div>
</div>

<div class="callout info">
<div class="callout-title">Key Milestone</div>

By 2016, attention-based models became the standard for sequence-to-sequence tasks, paving the way for the Transformer revolution in 2017.

</div>


---

# Implementing Attention in PyTorch 


**Simple attention mechanism implementation**

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class BahdanauAttention(nn.Module):
 def __init__(self, hidden_dim):
 super().__init__()
 self.W_dec = nn.Linear(hidden_dim, hidden_dim)
 self.W_enc = nn.Linear(hidden_dim, hidden_dim)
 self.v = nn.Linear(hidden_dim, 1)

 def forward(self, decoder_hidden, encoder_outputs):
 # Compute scores: how relevant is each encoder state?
 dec = self.W_dec(decoder_hidden).unsqueeze(1) # [batch, 1, hidden]
 enc = self.W_enc(encoder_outputs) # [batch, seq_len, hidden]
 scores = self.v(torch.tanh(dec + enc)) # [batch, seq_len, 1]

 # Normalize to get attention weights (sum to 1)
 attn_weights = F.softmax(scores, dim=1) # [batch, seq_len, 1]

 # Weighted sum of encoder outputs
 context = torch.sum(attn_weights * encoder_outputs, dim=1)

 return context, attn_weights.squeeze(-1)
```

---

# Using the Attention Module 


**Complete example with sample data**

```python
# Initialize attention module
attn = BahdanauAttention(hidden_dim=64)

# Sample encoder outputs (3 words, 64-dim hidden state)
encoder_outputs = torch.randn(1, 3, 64) # [batch=1, seq_len=3, hidden=64]

# Current decoder hidden state
decoder_hidden = torch.randn(1, 64) # [batch=1, hidden=64]

# Compute attention
context, weights = attn(decoder_hidden, encoder_outputs)

print(f"Context shape: {context.shape}") # [1, 64]
print(f"Attention weights: {weights}") # [1, 3] - sums to 1.0!

# Example output:
# Attention weights: tensor([[0.28, 0.45, 0.27]])
# "The" "cat" "sat"
# Model focuses most on "cat" when generating next output word!
```


---

# Discussion Questions 


1. **Why is attention called "soft alignment"?**
 - How is it different from hard alignment?
- What are the advantages of soft vs. hard?

 

2. **Computational Cost:**
 - What is the time complexity of attention?
- How does it scale with sequence length?
- When might this be a problem?

 

3. **Interpretability:**
 - Can we always trust attention weights as explanations?
- What about when attention is uniform across all inputs?

 

4. **Beyond Seq2Seq:**
 - Where else might attention be useful?
- Can we apply it within a single sequence?
- (Spoiler: Yes! That's self-attention → next lecture!)


---

# Looking Ahead 


**What's Next?**

**Today we learned:**
- The context problem in NLP
- Sequence-to-sequence architecture
- The bottleneck problem
- How attention mechanisms work
- Attention as alignment and interpretation

**Next lecture (Lecture 13):**
- : Attention within a sequence
- : "Attention is All You Need"
- : The new framework
- : Learning diverse relationships
- : Injecting order information

**Get ready for the Transformer revolution! **


---

# Summary 


**Key Takeaways:**

1. **Context Matters**
 - Static embeddings can't capture context-dependent meanings
- Need dynamic representations based on context
2. **Seq2Seq Bottleneck**
 - Fixed-size context vector limits performance
- Information loss for long sequences
3. **Attention is the Solution**
 - Dynamic access to all encoder states
- Weighted combination based on relevance
- Attention weights sum to 1.0 (probability distribution)
4. **Benefits**
 - Better performance on long sequences
- Automatic alignment learning
- Model interpretability

**Attention mechanisms laid the foundation for modern transformer-based models!**

---

# References 


**Key Papers:**

- **Sutskever et al. (2014)** - "Sequence to Sequence Learning with Neural Networks"
 
- Introduced encoder-decoder architecture
- Foundation for seq2seq models

 

 \item **Bahdanau et al. (2015)** - "Neural Machine Translation by Jointly Learning to Align and Translate"
 - Introduced additive attention mechanism
- Solved the bottleneck problem

 

 \item **Luong et al. (2015)** - "Effective Approaches to Attention-based Neural Machine Translation"
 - Multiplicative attention variants
- Global vs. local attention

 

 \item **Vaswani et al. (2017)** - "Attention Is All You Need"
 - The Transformer architecture (next lecture!)
- Scaled dot-product attention

**Additional Resources:**
- Jay Alammar's blog: "Visualizing A Neural Machine Translation Model"
- Distill.pub: "Attention and Augmented Recurrent Neural Networks"


---

# Questions? 



**Discussion Time**

**Office Hours Topics:**
- Implementing attention from scratch
- Different attention mechanisms
- Debugging attention-based models
- Assignment 4 preparation

Thank you! 

See you next lecture for Transformers!

