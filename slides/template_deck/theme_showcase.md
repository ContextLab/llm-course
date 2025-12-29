---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Theme showcase
### PSYC 51.07: Models of language and conversation

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Simple bullet points

- First main point
- Second main point
- Third main point

---

# Text emphasis

- Use **bold** for strong emphasis
- Use *italics* for subtle emphasis
- Use `code` for inline code

---

# Code example

```python
def hello():
    """Simple function example."""
    print("Hello, Dartmouth!")
    return True
```

---

# Long code (auto-split demo)

```python
class MultiHeadAttention(nn.Module):
    """Multi-head attention mechanism for transformers."""

    def __init__(self, d_model, num_heads, dropout=0.1):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)

        # Linear projections
        Q = self.W_q(query)
        K = self.W_k(key)
        V = self.W_v(value)

        # Reshape for multi-head attention
        Q = Q.view(batch_size, -1, self.num_heads, self.d_k)
        K = K.view(batch_size, -1, self.num_heads, self.d_k)
        V = V.view(batch_size, -1, self.num_heads, self.d_k)

        # Compute attention scores
        scores = torch.matmul(Q, K.transpose(-2, -1))
        scores = scores / math.sqrt(self.d_k)

        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)

        attention = F.softmax(scores, dim=-1)
        attention = self.dropout(attention)

        # Apply attention to values
        output = torch.matmul(attention, V)
        output = output.view(batch_size, -1, self.d_model)

        return self.W_o(output)
```

---

# Equation

The attention mechanism:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

---

# Interleaved text and equations

The softmax function normalizes scores into probabilities:

$$\text{softmax}(x_i) = \frac{e^{x_i}}{\sum_j e^{x_j}}$$

We scale by the square root of dimension to prevent vanishing gradients:

$$\text{score} = \frac{QK^T}{\sqrt{d_k}}$$

This keeps variance stable during training.

---

# Equations in bullet lists

- The dot product measures similarity between vectors
- Attention scores: $\text{score}(q, k) = q \cdot k$
- Scaled version prevents large values:

$$\text{score}(q, k) = \frac{q \cdot k}{\sqrt{d_k}}$$

- Output is weighted sum of values

---

# Equations in numbered lists

1. Compute query, key, value projections
2. Calculate attention scores:

$$A = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)$$

3. Apply attention to values: $\text{output} = AV$
4. Project back to model dimension

---

# Simple table

| Model | Year | Params |
|-------|------|--------|
| GPT-2 | 2019 | 1.5B |
| GPT-3 | 2020 | 175B |
| GPT-4 | 2023 | Unknown |

---

# Detailed table

| Model | Architecture | Training data | Key capabilities |
|-------|--------------|---------------|------------------|
| BERT | Encoder-only transformer | BooksCorpus, Wikipedia | Bidirectional context understanding, masked language modeling |
| GPT-3 | Decoder-only transformer | Common Crawl, books, Wikipedia | Few-shot learning, text generation, code completion |
| T5 | Encoder-decoder transformer | C4 (Colossal Clean Crawled Corpus) | Text-to-text framework, translation, summarization |
| LLaMA | Decoder-only transformer | Publicly available data only | Open weights, efficient inference, fine-tuning friendly |
| Claude | Decoder-only transformer | Web, books, code, conversations | Constitutional AI, long context, instruction following |

---

# Long table (auto-split demo)

| Model | Architecture | Training data | Key capabilities |
|-------|--------------|---------------|------------------|
| BERT | Encoder-only transformer | BooksCorpus, Wikipedia | Bidirectional context, masked LM |
| GPT-2 | Decoder-only transformer | WebText | Text generation, zero-shot |
| GPT-3 | Decoder-only transformer | Common Crawl, books | Few-shot learning, code completion |
| T5 | Encoder-decoder transformer | C4 Corpus | Text-to-text, translation |
| XLNet | Transformer-XL | BooksCorpus, Wikipedia | Permutation LM, long context |
| RoBERTa | Encoder-only transformer | Extended pretraining | Robust optimization of BERT |
| ALBERT | Encoder-only transformer | Same as BERT | Parameter sharing, efficient |
| ELECTRA | Encoder-only transformer | Same as BERT | Replaced token detection |
| DeBERTa | Encoder-only transformer | Wikipedia, books | Disentangled attention |
| LLaMA | Decoder-only transformer | Public data only | Open weights, efficient |
| LLaMA 2 | Decoder-only transformer | 2T tokens | RLHF, chat-optimized |
| Mistral | Decoder-only transformer | Undisclosed | Sliding window attention |
| Claude | Decoder-only transformer | Web, books, code | Constitutional AI |
| Claude 2 | Decoder-only transformer | Extended training | Longer context, improved |
| GPT-4 | Decoder-only transformer | Undisclosed | Multimodal, reasoning |
| Gemini | Decoder-only transformer | Multimodal data | Native multimodal |
| PaLM | Decoder-only transformer | 780B tokens | Pathways, chain-of-thought |
| Falcon | Decoder-only transformer | RefinedWeb | Open source, efficient |

---

# Two-column layout

<div style="display: flex; gap: 2em;">
<div>

**Left column**
- Point A
- Point B

</div>
<div>

**Right column**
- Point X
- Point Y

</div>
</div>

---

# Quote

> This line is a quote that demonstrates the blockquote styling from the CDL theme.

&mdash; Anonymous

---

# Callout boxes

<div class="note-box">

This is useful background information that provides additional context for the main content.

</div>

<div class="example-box">

Consider the function `f(x) = x^2`. When `x = 3`, we get `f(3) = 9`.

</div>

<div class="warning-box">

Training large language models requires significant computational resources and careful consideration of potential biases in training data.

</div>

---

# Note box

<div class="note-box">

The attention mechanism was first introduced in the context of machine translation (Bahdanau et al., 2014), allowing models to focus on relevant parts of the input sequence.

Key insight: Instead of compressing the entire input into a fixed-length vector, attention allows the decoder to "look back" at the encoder states.

</div>

---

# Example box

<div class="example-box">

Computing self-attention for a sequence:

- Input: "The cat sat"
- Query for "cat": looks for related words
- High attention to "The" (determiner) and "sat" (verb)
- Low attention to unrelated tokens

</div>

---

# Warning box

<div class="warning-box">

Common pitfalls when fine-tuning LLMs:

- Overfitting on small datasets
- Catastrophic forgetting of pre-trained knowledge
- Learning rate too high can destabilize training
- Always validate on held-out data!

</div>

---

# Multiple callouts

<div class="note-box">

Transformers process all tokens in parallel, unlike RNNs which process sequentially.

</div>

<div class="warning-box">

The quadratic memory complexity of attention limits context length.

</div>

---

# Emoji figures

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">🎓</span>
    <span class="label">Students</span>
  </div>
  <span class="emoji emoji-lg">➡️</span>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-teal">🤖</span>
    <span class="label">LLM</span>
  </div>
  <span class="emoji emoji-lg">➡️</span>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-orange">💡</span>
    <span class="label">Insights</span>
  </div>
</div>

---

# Emoji sizes and states

<div class="emoji-row">
  <div class="emoji-col">
    <span class="emoji emoji-xs">🧠</span>
    <span class="label">xs (24px)</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-sm">🧠</span>
    <span class="label">sm (48px)</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-md">🧠</span>
    <span class="label">md (72px)</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-lg">🧠</span>
    <span class="label">lg (96px)</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl">🧠</span>
    <span class="label">xl (128px)</span>
  </div>
</div>

<div class="emoji-row" style="margin-top: 1em;">
  <div class="emoji-col">
    <span class="emoji emoji-lg">👤</span>
    <span class="label">Normal</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-lg emoji-faded">👤</span>
    <span class="label">Faded</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-lg emoji-gray">👤</span>
    <span class="label">Inactive</span>
  </div>
</div>

---

# Course Information

<div style="display: flex; gap: 2em;">
<div>

**Next Steps**
- Review: Chapter 3 of *Speech and Language Processing*
- Explore: Hugging Face Transformers documentation
- Try: Build a simple chatbot with the provided templates

**Assignments**
- Problem Set 2 due next Friday
- Final project proposal due in 2 weeks

</div>
<div>

**Course Resources**
- Canvas: Course materials and submissions
- GitHub: Code examples and notebooks
- Office hours: Tuesdays 2-4pm, Moore 354

**Contact**
- Email: jeremy@dartmouth.edu
- Slack: #psyc5107-discussion

</div>
</div>
