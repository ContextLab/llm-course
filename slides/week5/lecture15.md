---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 15: The animated transformer
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will">

1. Understand the Transformer as a function that predicts the next word
2. Follow data from raw text through tokenization, embedding, and attention
3. Explain how queries, keys, and values enable self-attention
4. See how multiple attention heads capture different patterns
5. Understand how stacking blocks creates deep representations

</div>

---

# What is a Transformer?

The Transformer is a machine learning model for **sequence modeling**. Given a sequence of *things*, the model can predict what the next *thing* in the sequence might be.

<div class="definition-box" data-title="The big picture">

We can think of the Transformer as a function that operates on a phrase:

$$\text{Transformer}(X, \theta) \rightarrow Y$$

where $X$ is our input sequence and $\theta$ represents the model parameters.

</div>

---

# What is a Transformer?

<img src="animations/gifs/transformerfunc.gif" width="900" alt="Transformer function animation">

<div class="tip-box" data-title="Example">

**Input:** "the robots will bring ___"
**Output:** "prosperity" (the model's best guess for the next word)

</div>

---

# Tokenization

The Transformer operates on sequences, so we first need to **tokenize** the input phrase. One approach is to treat each word as a token.

<div class="definition-box" data-title="How it works">

The model doesn't understand words directly—it identifies tokens using unique numbers from a vocabulary.

</div>

---

# Tokenization

<img src="animations/gifs/tokenization.gif" width="900" alt="Tokenization animation">

<div class="example-box" data-title="Our running example">

"the robots will bring" → [3206, 2736, 3657, 400]

Each word maps to a unique ID in the vocabulary.

</div>

---

# 1. Embeddings: Numbers speak louder than words

For each token, the Transformer maintains a vector called an **embedding**. An embedding aims to capture the semantic meaning of the token—similar tokens have similar embeddings.

<div class="note-box" data-title="Recall from Lecture 11">

This is the same idea as Word2Vec, but the embeddings are learned jointly with the rest of the model.

</div>

---

# Token embeddings

<img src="animations/gifs/wordembeddings.gif" width="900" alt="Word embeddings animation">

<div class="definition-box" data-title="Dimensions">

Our transformer has embedding vectors of length **C = 768**. All embeddings can be packed together in a single $T \times C$ matrix, where $T = 4$ is the number of input tokens.

</div>

---

# Position embeddings

In order to capture the significance of the **position** of a token within a sequence, the Transformer also maintains embeddings for each position.

<div class="tip-box" data-title="Why positions matter">

Without position information, "cat sat" and "sat cat" would look identical to the model!

</div>

---

# Position embeddings

<img src="animations/gifs/positionembeddings.gif" width="900" alt="Position embeddings animation">

<div class="definition-box" data-title="Sinusoidal encoding">

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d}}\right)$$

Different frequencies encode both absolute position and relative distances.

</div>

---

# Combined embeddings

Finally, these two $T \times C$ matrices are **added together** to obtain a position-dependent embedding for each token.

---

# Combined embeddings

<img src="animations/gifs/preparingembeddings.gif" width="900" alt="Preparing embeddings animation">

<div class="tip-box" data-title="Result">

Each position now has a unique representation combining **what** (token meaning) and **where** (sequence position).

</div>

---

# 2. Queries, keys, and values

The Transformer computes three vectors for each of the $T$ input vectors: **query**, **key**, and **value**.

This is done by multiplying with learned weight matrices:

$$Q = XW_Q \quad K = XW_K \quad V = XW_V$$

---

# Queries, keys, and values

<img src="animations/gifs/querykeyvalue.gif" width="900" alt="QKV animation">

<div class="note-box" data-title="The weight matrices">

$W_Q$, $W_K$, and $W_V$ are all part of $\theta$—the learned model parameters.

</div>

---

# What are Q, K, V?

<div class="tip-box" data-title="Search engine analogy">

Imagine you have a database of images with text descriptions:

- **Query:** The user's search text
- **Key:** The text descriptions in your database
- **Value:** The actual images

Only those images (values) whose descriptions (keys) best match the search (query) are returned.

</div>

<div class="note-box" data-title="Self-attention intuition">

Self-attention works similarly—tokens "query" other tokens to find which ones they should pay attention to.

</div>

---

# 3. Two heads are better than one

The Transformer splits the Q, K, V matrices into multiple **heads**.

<div class="definition-box" data-title="Multi-head attention">

With C = 768 columns and 12 heads, each head operates on 64 dimensions.

</div>

---

# Splitting into heads

<img src="animations/gifs/splittingheads.gif" width="900" alt="Splitting heads animation">

<div class="tip-box" data-title="Why multiple heads?">

Different heads can specialize in different patterns—syntax, coreference, semantic roles, etc. The model decides what's useful!

</div>

---

# 4. Time to pay attention

Self-attention is the core idea behind the Transformer.

<div class="definition-box" data-title="Computing attention scores">

We compute an attention scores matrix by multiplying query and key matrices:

$$A = \frac{Q \cdot K^T}{\sqrt{d_k}}$$

</div>

---

# Attention scores

<img src="animations/gifs/selfattention.gif" width="900" alt="Self attention animation">

<div class="example-box" data-title="What the scores mean">

The attention matrix tells us how much attention each token should pay to every other token. E.g., "bring" might have a score of 0.3 for "robots" (row 4, column 2).

</div>

---

# 5. Applying attention

The attention score for a token needs to be **masked** if it occurs later in the sequence.

<div class="warning-box" data-title="Causal masking">

"bring" can pay attention to "robots", but not vice-versa—a token shouldn't look at future tokens when predicting its own next token.

</div>

---

# Applying attention

<img src="animations/gifs/applyingattention.gif" width="900" alt="Applying attention animation">

<div class="definition-box" data-title="Three steps">

1. **Mask** future tokens (set upper triangle to $-\infty$)
2. **Softmax** each row (normalize to probabilities)
3. **Multiply by V** (weighted sum of value vectors)

</div>

---

# Weighted output

<div class="example-box" data-title="How outputs are computed">

The output for "robots" is a weighted sum of value vectors:

$$Y(\text{robots}) = 0.47 \cdot V(\text{the}) + 0.53 \cdot V(\text{robots})$$

Each token's new representation is informed by relevant context!

</div>

---

# 5. Putting all heads together

Having computed outputs for all 12 heads, we now **concatenate** them:

$$\text{MultiHead} = \text{Concat}(Y_1, Y_2, ..., Y_{12}) \cdot W_O$$

---

# Concatenating heads

<img src="animations/gifs/concatheads.gif" width="900" alt="Concat heads animation">

<div class="definition-box" data-title="Back to original size">

64 dimensions per head × 12 heads = 768 = C

The input and output of self-attention are both $T \times C$ matrices.

</div>

---

# 6. Feed forward

Everything so far has been **linear operations**. This isn't enough to capture complex relationships!

<div class="definition-box" data-title="Adding non-linearity">

$$\text{FFN}(x) = \text{ReLU}(xW_1 + b_1)W_2 + b_2$$

The hidden layer expands to $4C = 3072$ dimensions, then projects back to $C = 768$.

</div>

---

# Feed-forward network

<img src="animations/gifs/feedforward.gif" width="900" alt="Feed forward animation">

<div class="note-box" data-title="Why it matters">

All the weight matrices in the FFN are part of $\theta$. Research suggests this is where factual "knowledge" is stored.

</div>

---

# 7. We need to go deeper

All the steps in sections 2–6 constitute a single **Transformer block**.

<div class="definition-box" data-title="Stacking blocks">

Each block takes a $T \times C$ matrix as input and outputs a $T \times C$ matrix. To capture complex relationships, many blocks are stacked together.

</div>

---

# Stacking blocks

<img src="animations/gifs/goingdeeper.gif" width="900" alt="Going deeper animation">

<div class="tip-box" data-title="Model sizes">

- GPT-2: 12–48 blocks
- GPT-3: 96 blocks
- GPT-4: Unknown (estimated 120+)

</div>

---

# 8. Making a prediction

Finally, we're ready to predict the next token!

<div class="definition-box" data-title="The final step">

Take the last token's output vector and multiply by a $V \times C$ weight matrix, where $V$ is the vocabulary size. Apply softmax to get a probability distribution over all words.

</div>

---

# Making a prediction

<img src="animations/gifs/makingprediction.gif" width="900" alt="Making prediction animation">

<div class="example-box" data-title="Our example">

"prosperity" gets 92% probability, "destruction" only 5%.

So: "the robots will bring **prosperity**"

</div>

---

# 9. Text generator go brrr

Now that we can predict the next token, we can **generate text** one token at a time.

<div class="definition-box" data-title="Autoregressive generation">

The first token produced is added to the prompt and fed back to produce the second token, which is then fed back to produce the third, and so on.

</div>

---

# Autoregressive generation

<img src="animations/gifs/generatingtext.gif" width="900" alt="Generating text animation">

<div class="warning-box" data-title="Context limit">

Transformers have a maximum context length (N tokens). As generation continues, we may need to drop the oldest tokens.

</div>

---

# And that's it!

<div class="definition-box" data-title="The complete picture">

1. **Tokenize** text to IDs
2. **Embed** tokens + positions
3. **Project** to Q, K, V
4. **Split** into attention heads
5. **Compute** attention scores
6. **Apply** masking and softmax
7. **Multiply** by V for output
8. **Concatenate** heads
9. **Feed forward** with non-linearity
10. **Stack** many blocks
11. **Predict** next token

</div>

---

# What we left out

<div class="note-box" data-title="Details for another day">

To focus on the core concepts, we skipped:
- **Layer normalization** (stabilizes training)
- **Residual connections** (helps gradient flow)
- **Dropout** (regularization)
- **Training** (how $\theta$ is learned)

See [nanoGPT](https://github.com/karpathy/nanoGPT/blob/master/model.py) for a complete implementation.

</div>

---

# References

<div class="note-box" data-title="Further reading">

[**Vaswani et al. (2017)**](https://arxiv.org/abs/1706.03762) "Attention Is All You Need" — The original transformer paper.

[**The Animated Transformer**](https://prvnsmpth.github.io/animated-transformer/) — Visual walkthrough that inspired this lecture.

[**The Illustrated Transformer**](https://jalammar.github.io/illustrated-transformer/) — Jay Alammar's detailed visual guide.

[**nanoGPT**](https://github.com/karpathy/nanoGPT) — Andrej Karpathy's minimal GPT implementation.

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

**Lecture 16:** Training transformers — loss functions, optimization, and scaling laws

</div>
