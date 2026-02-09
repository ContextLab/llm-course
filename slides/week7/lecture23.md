---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 23: Implementing GPT from scratch

### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Implement a **complete GPT model** from scratch in PyTorch (~30M parameters)
2. Build each component: **embeddings**, **masked attention**, **transformer block**, **LM head**
3. Write a **training loop** with AdamW, gradient clipping, and LR scheduling
4. Implement **text generation** with temperature, top-k, and nucleus sampling
5. Explain how **KV caching** and **FlashAttention** make modern LLMs practical

</div>

---

# Announcements and roadmap

<div class="warning-box" data-title="Week 8: no classes">

There are **no classes February 23–27** (instructor away). Use this time to work on your **final project** and the optional Assignment 5 (Build GPT).

</div>

<div class="tip-box" data-title="Companion notebook">

📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week7/gpt_from_scratch_demo.ipynb) — build and train a mini-GPT step by step. All code from this lecture runs in the notebook.

</div>

---

# What we are building today

<div class="definition-box" data-title="A complete mini-GPT">

We will implement every component of a GPT language model from scratch — small enough to train on a laptop, but architecturally identical to GPT-2:

1. **Tokenization** with tiktoken (GPT-2's BPE tokenizer — see Lecture 6)
2. **Token + position embeddings**
3. **Masked multi-head attention** (causal mask — see Lecture 21)
4. **Transformer decoder blocks** (pre-norm with residual connections)
5. **Language model head** for next-token prediction
6. **Training loop** with AdamW and gradient clipping
7. **Text generation** with multiple sampling strategies

</div>

---

# Setup and hyperparameters

<div class="example-box" data-title="Required libraries and configuration">

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import tiktoken  # OpenAI's BPE tokenizer

device = 'cuda' if torch.cuda.is_available() else 'cpu'

config = {
    'vocab_size': 50257,    # GPT-2 vocabulary size
    'd_model': 384,         # Embedding dimension
    'n_layers': 6,          # Number of transformer blocks
    'n_heads': 6,           # Number of attention heads
    'max_seq_len': 256,     # Maximum sequence length
    'dropout': 0.1,
    'batch_size': 32,
    'learning_rate': 3e-4,
    'num_epochs': 10
}
```

</div>

---

# Tokenization with tiktoken

<div class="example-box" data-title="Using GPT-2's BPE tokenizer (see Lecture 6 for BPE details)">

```python
tokenizer = tiktoken.get_encoding("gpt2")

text = "Hello, how are you doing today?"
tokens = tokenizer.encode(text)
# [15496, 11, 703, 389, 345, 1804, 1909, 30]

# Decode back to text
decoded = tokenizer.decode(tokens)  # "Hello, how are you doing today?"

# Inspect individual tokens
for tid in tokens:
    print(f"  {tid}: '{tokenizer.decode([tid])}'")
```

</div>

---

# Creating a text dataset

<div class="example-box" data-title="Sliding window over tokenized text">

```python
class TextDataset(Dataset):
    def __init__(self, text_file, tokenizer, max_seq_len):
        with open(text_file, 'r', encoding='utf-8') as f:
            text = f.read()
        self.tokens = tokenizer.encode(text)
        self.max_seq_len = max_seq_len

    def __len__(self):
        return len(self.tokens) - self.max_seq_len

    def __getitem__(self, idx):
        chunk = self.tokens[idx : idx + self.max_seq_len + 1]
        x = torch.tensor(chunk[:-1], dtype=torch.long)  # Input
        y = torch.tensor(chunk[1:],  dtype=torch.long)  # Target
        return x, y

dataset = TextDataset('shakespeare.txt', tokenizer, config['max_seq_len'])
dataloader = DataLoader(dataset, batch_size=config['batch_size'], shuffle=True)
```

</div>

<div class="note-box" data-title="Why offset by 1?">

The target at each position is the *next* token. For input `[A, B, C, D]`, the targets are `[B, C, D, E]`. This is the autoregressive training signal.

</div>

---

# Token and position embeddings

<div class="example-box" data-title="Embedding layer implementation">

```python
class Embeddings(nn.Module):
    def __init__(self, vocab_size, d_model, max_seq_len, dropout):
        super().__init__()
        self.token_embed = nn.Embedding(vocab_size, d_model)
        self.pos_embed = nn.Embedding(max_seq_len, d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        seq_len = x.size(1)
        tok_emb = self.token_embed(x)                        # (B, T, D)
        pos_emb = self.pos_embed(torch.arange(seq_len, device=x.device))  # (T, D)
        return self.dropout(tok_emb + pos_emb)               # Broadcasting adds positions
```

</div>

<div class="note-box" data-title="Two sources of information combined">

**Token embeddings** encode *what* each token means. **Position embeddings** encode *where* each token sits in the sequence. Their sum gives the model both word identity and word order.

</div>

---

# Masked multi-head attention

<div class="example-box" data-title="Attention with causal masking (part 1: projections)">

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads, dropout):
        super().__init__()
        assert d_model % n_heads == 0
        self.n_heads = n_heads
        self.head_dim = d_model // n_heads

        self.q_linear = nn.Linear(d_model, d_model)
        self.k_linear = nn.Linear(d_model, d_model)
        self.v_linear = nn.Linear(d_model, d_model)
        self.out_linear = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        B, T, D = x.shape
        Q = self.q_linear(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        K = self.k_linear(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        V = self.v_linear(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        # Q, K, V shape: (B, n_heads, T, head_dim)
```

</div>

---

# Attention computation

<div class="example-box" data-title="Attention with causal masking (part 2: scores and output)">

```python
        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.head_dim ** 0.5)

        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))

        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)

        # Apply attention to values and concatenate heads
        out = torch.matmul(attn_weights, V)                  # (B, n_heads, T, head_dim)
        out = out.transpose(1, 2).contiguous().view(B, T, D) # (B, T, D)
        return self.out_linear(out)
```

</div>

<div class="note-box" data-title="The causal mask">

```python
def create_causal_mask(seq_len, device):
    return torch.tril(torch.ones(seq_len, seq_len, device=device))
```

Each row `i` has 1s at positions `0..i` and 0s at positions `i+1..T-1`, blocking attention to future tokens.

</div>

---

# Feed-forward network and transformer block

<div class="example-box" data-title="The two sub-layers of each GPT block">

```python
class FeedForward(nn.Module):
    def __init__(self, d_model, dropout):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_model, 4 * d_model),
            nn.GELU(),                        # GPT uses GELU, not ReLU
            nn.Linear(4 * d_model, d_model),
            nn.Dropout(dropout)
        )
    def forward(self, x):
        return self.net(x)

class TransformerBlock(nn.Module):
    def __init__(self, d_model, n_heads, dropout):
        super().__init__()
        self.ln1 = nn.LayerNorm(d_model)
        self.attention = MultiHeadAttention(d_model, n_heads, dropout)
        self.ln2 = nn.LayerNorm(d_model)
        self.ffn = FeedForward(d_model, dropout)

    def forward(self, x, mask):
        x = x + self.attention(self.ln1(x), mask)   # Pre-norm + residual
        x = x + self.ffn(self.ln2(x))               # Pre-norm + residual
        return x
```

</div>

---

# Complete GPT model

<div class="example-box" data-title="Assembling all components">

```python
class GPT(nn.Module):
    def __init__(self, vocab_size, d_model, n_layers, n_heads, max_seq_len, dropout):
        super().__init__()
        self.max_seq_len = max_seq_len
        self.embeddings = Embeddings(vocab_size, d_model, max_seq_len, dropout)
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, n_heads, dropout) for _ in range(n_layers)
        ])
        self.ln_f = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        self.apply(self._init_weights)

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
```

</div>

---

# GPT forward pass

<div class="example-box" data-title="Forward pass with optional loss computation">

```python
    def forward(self, x, targets=None):
        seq_len = x.size(1)
        mask = create_causal_mask(seq_len, x.device)

        x = self.embeddings(x)
        for block in self.blocks:
            x = block(x, mask)
        x = self.ln_f(x)
        logits = self.lm_head(x)          # (batch, seq_len, vocab_size)

        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)),
                targets.view(-1)
            )
        return logits, loss
```

</div>

<div class="note-box" data-title="Parameter count for our mini-GPT">

With `d_model=384`, `n_layers=6`, `n_heads=6`, and `vocab_size=50257`, this model has approximately **30 million parameters** -- small enough to train on a single GPU in a few hours.

</div>

---

# Training loop

<div class="example-box" data-title="Training with AdamW and gradient clipping">

```python
model = GPT(
    config['vocab_size'], config['d_model'], config['n_layers'],
    config['n_heads'], config['max_seq_len'], config['dropout']
).to(device)

optimizer = torch.optim.AdamW(
    model.parameters(), lr=config['learning_rate'],
    betas=(0.9, 0.95), weight_decay=0.1
)

model.train()
for epoch in range(config['num_epochs']):
    total_loss = 0
    for x, y in dataloader:
        x, y = x.to(device), y.to(device)
        logits, loss = model(x, targets=y)
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}, Loss: {total_loss / len(dataloader):.4f}")
```

</div>

---

# Training best practices

<div class="note-box" data-title="Five key techniques for stable GPT training">

| Technique | Why it matters |
|-----------|---------------|
| **Gradient clipping** (max norm 1.0) | Prevents exploding gradients that destabilize training |
| **AdamW optimizer** | Decoupled weight decay; better than standard Adam for transformers |
| **Learning rate warmup** | Gradually increase LR over first ~1,000 steps to avoid early instability |
| **Cosine LR decay** | Smoothly reduce LR after warmup for fine-grained convergence |
| **Mixed precision** (float16/bfloat16) | 2--3x speedup on modern GPUs with minimal quality loss |

</div>

<div class="tip-box" data-title="Practical advice">

If loss is not decreasing: check learning rate (try 1e-4 to 3e-4), verify data pipeline outputs correct input/target pairs, and watch for NaN values. If you run out of memory: reduce batch size or sequence length first, then try gradient accumulation.

</div>

---

# Greedy decoding

<div class="example-box" data-title="Generating text by always picking the most likely token">

```python
@torch.no_grad()
def generate_greedy(model, tokenizer, prompt, max_new_tokens=50):
    model.eval()
    tokens = tokenizer.encode(prompt)
    x = torch.tensor([tokens], dtype=torch.long, device=device)

    for _ in range(max_new_tokens):
        x_crop = x[:, -model.max_seq_len:]
        logits, _ = model(x_crop)
        logits = logits[:, -1, :]                # Last position only
        next_token = torch.argmax(logits, dim=-1, keepdim=True)
        x = torch.cat([x, next_token], dim=1)

    return tokenizer.decode(x[0].tolist())
```

</div>

<div class="warning-box" data-title="Greedy decoding is deterministic but repetitive">

Always picking `argmax` produces the same output every time and tends to get stuck in repetitive loops. Real applications use **sampling** to introduce controlled randomness.

</div>

---

# Sampling strategies

<div class="definition-box" data-title="Three ways to add controlled randomness">

- **Temperature** ($T$): Scale logits by $1/T$ before softmax. $T < 1$ sharpens the distribution (more conservative); $T > 1$ flattens it (more creative).
- **Top-k**: Sample only from the $k$ most probable tokens. Typical: $k = 40$.
- **Nucleus (top-p)**: Sample from the smallest set of tokens whose cumulative probability exceeds $p$. Typical: $p = 0.9$ or $0.95$.

</div>

<div class="note-box" data-title="Comparison">

| Strategy | Pros | Cons |
|----------|------|------|
| Greedy | Deterministic, fast | Repetitive, boring |
| Temperature | Simple control knob | Can produce nonsense at high $T$ |
| Top-k | Filters unlikely tokens | Fixed $k$ may be too broad or narrow |
| Nucleus (top-p) | Adapts to distribution shape | Slightly more complex |

</div>

---

# Implementing sampling

<div class="example-box" data-title="Top-k and nucleus sampling in PyTorch">

```python
def sample_next_token(logits, temperature=1.0, top_k=None, top_p=None):
    logits = logits / temperature

    if top_k is not None:
        top_k = min(top_k, logits.size(-1))
        threshold = torch.topk(logits, top_k)[0][..., -1, None]
        logits[logits < threshold] = float('-inf')

    if top_p is not None:
        sorted_logits, sorted_idx = torch.sort(logits, descending=True)
        cumprobs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
        remove = cumprobs > top_p
        remove[..., 1:] = remove[..., :-1].clone()
        remove[..., 0] = False
        logits[sorted_idx[remove]] = float('-inf')

    probs = F.softmax(logits, dim=-1)
    return torch.multinomial(probs, num_samples=1)
```

</div>

---

# Complete generation function

<div class="example-box" data-title="Putting it all together">

```python
@torch.no_grad()
def generate(model, tokenizer, prompt, max_new_tokens=100,
             temperature=0.8, top_k=40, top_p=0.9):
    model.eval()
    tokens = tokenizer.encode(prompt)
    x = torch.tensor([tokens], dtype=torch.long, device=device)

    for _ in range(max_new_tokens):
        x_crop = x[:, -model.max_seq_len:]
        logits, _ = model(x_crop)
        next_token = sample_next_token(
            logits[0, -1, :], temperature=temperature, top_k=top_k, top_p=top_p
        )
        x = torch.cat([x, next_token.unsqueeze(0)], dim=1)

    return tokenizer.decode(x[0].tolist())

# Generate text
print(generate(model, tokenizer, "Once upon a time"))
```

</div>

---

# Debugging and common issues

<div class="warning-box" data-title="Problems you will encounter">

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Loss not decreasing | LR too high/low, data bug | Try LR in [1e-4, 3e-4]; verify x/y offset |
| Out of memory | Batch/sequence too large | Reduce batch size; use gradient accumulation |
| Poor generation quality | Undertrained | Train longer; use more/better data |
| Repetitive output | Greedy decoding or low temperature | Use nucleus sampling ($p = 0.9$) |
| NaN loss | Numerical instability | Add gradient clipping; check for empty batches |

</div>

---

# KV cache: fast generation

<div class="definition-box" data-title="Avoiding redundant computation during generation">

Without caching, generating token $n$ requires recomputing attention over *all* $n-1$ previous tokens. The **KV cache** stores previously computed key/value tensors and only computes Q/K/V for the *new* token.

</div>

<div class="example-box" data-title="Generation with KV cache (conceptual)">

```python
# Without KV cache: recompute everything each step → O(n²) per token
for step in range(100):
    logits = model(all_tokens[:step+1])  # Reprocesses all tokens

# With KV cache: only process the NEW token → O(n) per token
cache = {}
for step in range(100):
    logits, cache = model(new_token_only, past_kv=cache)
    # cache stores K, V from all previous steps
```

</div>

<div class="important-box" data-title="Impact">

KV caching makes generation **10–50× faster** for long sequences. It's the reason ChatGPT responds in seconds, not minutes. The tradeoff is memory: the cache grows linearly with sequence length.

</div>

---
<!-- _class: scale-85 -->

# FlashAttention: memory-efficient attention

<div class="definition-box" data-title="Dao et al. (2022, 2023); Dao (2024)">

Standard attention materializes the full $N \times N$ attention matrix in GPU memory — $O(N^2)$ memory. [FlashAttention](https://arxiv.org/abs/2205.14135) computes attention in **tiled blocks** that fit in fast SRAM, never materializing the full matrix.

</div>

<div class="note-box" data-title="Why it matters">

| Metric | Standard attention | FlashAttention-3 |
|--------|-------------------|-------------------|
| Memory | $O(N^2)$ | $O(N)$ |
| Speed | Baseline | **1.5–2× faster** |
| Max sequence | ~4K (memory limited) | **128K+** |
| Wall-clock for 8K seq | ~50ms | ~25ms |

[FlashAttention-3](https://arxiv.org/abs/2407.08608) adds hardware-aware pipelining for H100 GPUs, approaching 75% of theoretical FLOPS.

</div>

---

# GPT-2 vs modern decoders

<div class="note-box" data-title="Upgrading our mini-GPT to a modern architecture (see Lecture 21)">

```python
# GPT-2 style (what we built today)
self.ln = nn.LayerNorm(d_model)              # LayerNorm
self.ffn = nn.Sequential(
    nn.Linear(d_model, 4 * d_model),
    nn.GELU(),                                # GELU activation
    nn.Linear(4 * d_model, d_model))
self.pos_embed = nn.Embedding(max_len, d)    # Learned absolute positions

# Modern style (LLaMA, Mistral, etc.)
self.ln = RMSNorm(d_model)                   # RMSNorm: 10-15% faster
self.ffn = SwiGLU(d_model, int(8/3 * d_model))  # SwiGLU: ~1% better
self.pos_embed = None  # RoPE applied inside attention (extrapolates to any length)
```

</div>

<div class="tip-box" data-title="The takeaway">

Our mini-GPT is *architecturally* identical to GPT-2. To reach LLaMA-class performance, swap in RMSNorm, SwiGLU, RoPE, and GQA — all incremental changes to the same basic structure. The conceptual framework you built today is the same one powering frontier models.

</div>

---

# Further reading

<div class="note-box" data-title="Further reading">

[**Karpathy, "Let's build GPT"**](https://www.youtube.com/watch?v=kCc8FmEb1nY) Step-by-step video tutorial (2h) — the inspiration for this lecture.

[**nanoGPT**](https://github.com/karpathy/nanoGPT) Clean, minimal GPT-2 implementation in ~300 lines of PyTorch.

[**Dao et al. (2022, *NeurIPS*)**](https://arxiv.org/abs/2205.14135) "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness" — $O(N)$ memory attention.

[**Shah et al. (2024, *arXiv*)**](https://arxiv.org/abs/2407.08608) "FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision" — Latest version for H100s.

[**Radford et al. (2018)**](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) "Improving Language Understanding by Generative Pre-Training" — The original GPT paper.

</div>

---

# Questions?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label"><a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label"><a href="https://context-lab.youcanbook.me">Office hours</a></span>
  </div>
</div>

<div class="tip-box" data-title="Up next...">

Week 9 (after break): Agents and tool use -- giving language models the ability to act

</div>
