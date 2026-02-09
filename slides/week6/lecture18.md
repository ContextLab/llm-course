---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 18: BERT deep dive
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Explain the ONE architectural change that makes BERT bidirectional
2. Analyze concrete examples where unidirectional models fail
3. Describe what different BERT layers and attention heads learn
4. Run BERT code to explore masked predictions and attention patterns
5. Connect BERT's design to cognitive and linguistic insights

</div>

---

# Stuff you already know...

<div class="note-box" data-title="Recall from lecture 12">

In lecture 12, we introduced BERT basics: Masked Language Modeling (MLM) with the 80/10/10 strategy, Next Sentence Prediction (NSP), and the input representation (token + segment + position embeddings).

</div>

<div class="note-box" data-title="Recall from lecture 15">

In lecture 15, we built the full transformer architecture, including Q/K/V attention and causal masking.

</div>

<div class="tip-box" data-title="Today's focus">

Today we go deeper into *why* these design choices matter and *what* BERT actually learns.

</div>

---

# How GPT pays attention

<div class="definition-box" data-title="Recall from lecture 15: scaled dot-product attention">

Each token produces a **query** $q$, **key** $k$, and **value** $v$. Attention scores tell each token how much to "listen to" every other token:

$$A = \text{softmax}\left(\frac{QK^T}{\sqrt{H}}\right)V$$

</div>

<div class="warning-box" data-title="The causal mask">

GPT adds a **causal mask** $M$ before the softmax: $M_{ij} = -\infty$ when $j > i$ (future positions). After softmax, $e^{-\infty} = 0$, so future tokens are invisible:

$$A_{\text{GPT}} = \text{softmax}\left(\frac{QK^T}{\sqrt{H}} + M_{\text{causal}}\right)V$$

This forces GPT to predict the next word using only the words that came before it — just like reading left to right.

</div>

---

# Encoders vs decoders

<div class="definition-box" data-title="Two ways to use a transformer">

- A **decoder** generates text one token at a time, left to right. It uses the causal mask so each token can only attend to previous tokens. GPT is a decoder.
- An **encoder** processes the entire input at once. Every token can attend to every other token — no mask needed. BERT is an encoder.

</div>

<div class="tip-box" data-title="Why chatbots use decoders">

In a conversation, future text from the user **doesn't exist yet** — the model must respond with only what it has seen so far. Decoders are built for exactly this: generate one token at a time, conditioning only on the past. Encoders like BERT need the *entire* input up front, which makes them great for understanding a complete document but unsuitable for open-ended generation.

</div>

---

# Breaking the causal mask

<div class="definition-box" data-title="One line of math changes everything">

BERT simply removes the causal mask — all positions attend to all positions:

$$A_{\text{BERT}} = \text{softmax}\left(\frac{QK^T}{\sqrt{H}}\right)V$$

That's it. Every token sees the full sentence, left and right, at every layer.

</div>

<div class="warning-box" data-title="Trade-off">

Removing the mask means BERT **cannot generate text** autoregressively — it sees the future! But it excels at *understanding* tasks where the full input is available.

</div>

---
<!-- _class: scale-85 -->

# Why bidirectionality matters

<div class="example-box" data-title="Contextual ambiguity">

Consider these [Winograd](https://en.wikipedia.org/wiki/Terry_Winograd)-style examples where left-context alone is insufficient:
- "The trophy didn't fit in the suitcase because **it** was too [big/small]" — "it" refers to trophy or suitcase depending on the final word.
- "The animal didn't cross the street because **it** was too [wide/tired]" — need right context to resolve "it".

</div>

<div class="tip-box" data-title="The BERT advantage">

A left-to-right model processes "it" before seeing "big" vs "small" — it must guess. BERT reads both directions and never has to guess.

</div>

---

# The Winograd schema challenge

<div class="definition-box" data-title="Winograd schemas">

Pronoun resolution challenges that test real-world understanding. Originally proposed by [Winograd (1972)](https://doi.org/10.1016/0010-0285(72)90002-3), formalized as a benchmark by [Levesque et al. (2012)](https://cdn.aaai.org/ocs/4492/4492-21843-1-PB.pdf).

**Ambiguous pronouns**:
- "The delivery workers couldn't fit the packages into the lockers because **they** were too [large/small]." (they = packages or lockers)
- "The teachers gave the students extra time because **they** were [struggling/generous]." (they = students or teachers)

</div>

<div class="note-box" data-title="Performance">

BERT-large was among the first models to approach human performance on Winograd schemas.

</div>

---

# What fill-in-the-blank teaches

<div class="definition-box" data-title="Intuition for MLM">

Filling in blanks forces BERT to learn grammar ("The [MASK] barked" → dog), semantics ("She [MASK] the exam" → passed/failed), and world knowledge ("The capital of France is [MASK]" → Paris).

</div>

<div class="tip-box" data-title="Self-supervised curriculum">

Think of MLM as a self-supervised curriculum: every masked position is a test question, and the surrounding text is the study material.

</div>

---

# Try it! what does BERT predict?

<div class="example-box" data-title="Run this in Google Colaboratory">

```python
from transformers import pipeline
fill_mask = pipeline("fill-mask", model="bert-base-uncased")
fill_mask("The [MASK] barked at the mailman.")

fill_mask("The capital of Japan is [MASK].")
```

</div>

---

# BERT reveals its biases

<div class="example-box" data-title="Exposing training data biases">

```python
fill_mask("The nurse said [MASK] would be right back.")
# highest probability word: "she"

fill_mask("The doctor said [MASK] would be right back.")
# highest probability word: "he"
```

</div>

<div class="warning-box" data-title="A feature and a bug">

BERT learned gender stereotypes from its training data. This is useful for studying bias, but dangerous if deployed uncritically.

</div>

<div class="note-box" data-title="Think about it...">

On one hand, biases can perpetuate harmful stereotypes. On the other hand, ignoring real-world distributions can lead to absurd outputs. How should we handle this trade-off?

</div>

---

# What attention heads specialize in

<div class="definition-box" data-title="Linguistic specialization">

[Clark et al. (2019)](https://aclanthology.org/W19-4828/) discovered that specific BERT attention heads specialize in linguistic relations:
- **Head 8-10**: Direct objects (verb → object)
- **Head 7-6**: Possessive pronouns (noun → its/his/her)
- **Head 5-4**: Coreference (pronoun → antecedent)

</div>

<div class="note-box" data-title="Emergent properties">

No one programmed these specializations — they emerged from masked language modeling alone!

</div>

---

# BERT learns a linguistic pipeline

<div class="definition-box" data-title="Layer-wise processing">

[Tenney et al. (2019)](https://aclanthology.org/P19-1452/) showed BERT's layers form a processing pipeline:
1. **Lower layers (1–4)**: Surface features — POS tags, word boundaries
2. **Middle layers (5–8)**: Syntax — parse trees, dependency relations
3. **Upper layers (9–12)**: Semantics — word sense disambiguation, coreference

</div>

<div class="note-box" data-title="Classical NLP">

This mirrors the classical NLP pipeline that used to require separate hand-crafted systems for each level. BERT learns it all in one model, end-to-end!

</div>

---
<!-- _class: scale-90 -->

# Embeddings change across layers

<div class="example-box" data-title="Word sense transformation">

Consider the word "cells" in: "The cells in the prison..." vs "The cells in the body..."
- **Layer 0 (embedding)**: Identical vectors — context hasn't been applied yet (cosine similarity = 1.00).
- **Layer 1**: Already diverging (cosine similarity ≈ 0.81).
- **Layer 6**: Syntactic context continues differentiating them (cosine similarity ≈ 0.68).
- **Layer 12**: Completely different vectors — prison vs biology (cosine similarity ≈ 0.45).

</div>

<div class="note-box" data-title="Further reading">

[**Ethayarajh (2019, *EMNLP*)**](https://aclanthology.org/D19-1006/) "How Contextual are Contextualized Word Representations?" — Shows that self-similarity drops from ~0.95 (layer 1) to ~0.45 (layer 12) on average across all words; polysemous words like "cells" diverge even faster.

</div>

---

# The pre-training data question

<div class="definition-box" data-title="What's in the data?">

BERT was trained on 3.3B words of BooksCorpus + Wikipedia:
- Primarily English, formal writing.
- Over-represents certain demographics and viewpoints.
- No social media, no conversations, no code.
- Cutoff: 2018 (no knowledge of recent events).

</div>

<div class="tip-box" data-title="Data shapes the model">

BERT "knows" what its training data contained. Its biases, gaps, and capabilities all trace back to these 3.3 billion words.

</div>

---

# BERT's lasting impact

<div class="note-box" data-title="Historical timeline">

- **2013**: Word2Vec — static word embeddings
- **2018 Feb**: ELMo — contextual, but RNN-based
- **2018 Oct**: BERT — bidirectional transformers
- **2019+**: RoBERTa, ALBERT, DistilBERT, ELECTRA, DeBERTa

</div>

<div class="important-box" data-title="The paradigm shift">

BERT established the "pre-train then fine-tune" paradigm that now dominates NLP. Even ChatGPT and Claude use this approach — they just use different architectures and much more data.

</div>

---
<!-- _class: scale-65 -->

# BERT and the brain

<div class="definition-box" data-title="Neural parallels">

Neuroscience studies have found striking parallels between BERT's internal representations and human brain activity during language processing.

**Cognitive insights**:
- BERT's layer progression mirrors the temporal cascade of language processing in the brain.
- Middle BERT layers best predict fMRI activity in language regions.
- The N400 *event related potential* (ERP) component correlates with BERT's prediction confidence. (*ERP*: brain voltage changes time-locked to specific stimuli.)

</div>

<div class="tip-box" data-title="Computational solutions">

Does BERT "understand" language like we do? Probably not — but it may have discovered similar computational solutions to the same problem.

</div>

<div class="note-box" data-title="Further reading">

[**Schrimpf et al. (2021, *PNAS*)**](https://doi.org/10.1073/pnas.2105646118) "The neural architecture of language" — Middle transformer layers best predict fMRI activity in language regions.

[**Goldstein et al. (2022, *Nature Neuroscience*)**](https://doi.org/10.1038/s41593-022-01026-4) "Shared computational principles for language processing in humans and deep language models" — Layer hierarchy of language models maps onto the temporal hierarchy of brain responses.

[**Michaelov et al. (2023, *IEEE TCDS*)**](https://doi.org/10.1109/TCDS.2022.3176783) "So Cloze yet so Far" — N400 amplitude is better predicted by language model surprisal than by human cloze probabilities. (*N400*: a negative brain-voltage deflection ~400 ms after an unexpected word; *cloze probability*: the proportion of people who fill in a given word when shown a sentence with a blank.)

</div>

---

# Demo time!

<div class="example-box" data-title="Exploring BERT interactively">

Check out this lecture's [companion notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/bert_demo.ipynb):
1. **Fill-in-the-blank predictions** — Probe BERT's world knowledge and uncover gender biases
2. **Attention visualization** — See which tokens attend to which across layers and heads
3. **Layer-by-layer embeddings** — Watch word senses diverge from surface form to semantics
4. **Sentence similarity** — Compute and visualize a similarity matrix with sentence-transformers

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

BERT variants: how RoBERTa, ALBERT, DistilBERT, and ELECTRA improved on the original.

</div>
