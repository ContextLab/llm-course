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

# What you already know

<div class="note-box" data-title="Recap from lectures 12 and 15">

In lecture 12, we introduced BERT basics: Masked Language Modeling (MLM) with the 80/10/10 strategy, Next Sentence Prediction (NSP), and the input representation (token + segment + position embeddings). In lecture 15, we built the full transformer architecture, including Q/K/V attention and causal masking. Today we go deeper into WHY these design choices matter and WHAT BERT actually learns.

</div>

---

# Breaking the causal mask

<div class="definition-box" data-title="The key difference is the mask">

Recall that attention scores are calculated as:
- GPT: $A_{\text{GPT}} = \text{softmax}\left(\frac{QK^T}{\sqrt{H}} + M_{\text{causal}}\right)$
- BERT: $A_{\text{BERT}} = \text{softmax}\left(\frac{QK^T}{\sqrt{H}}\right)$

**Bidirectionality**: One line of math — removing the causal mask — transforms a next-word predictor into a bidirectional understanding machine.

</div>

<div class="warning-box" data-title="Trade-off">

BERT cannot generate text autoregressively because it "sees the future" during processing. It is an encoder, not a decoder.

</div>

---
<!-- _class: scale-85 -->

# Why bidirectionality matters

<div class="example-box" data-title="Contextual ambiguity">

Consider these Winograd-style examples where left-context alone is insufficient:
- "The trophy didn't fit in the suitcase because **it** was too [big/small]" — "it" refers to trophy or suitcase depending on the final word.
- "The animal didn't cross the street because **it** was too [wide/tired]" — need right context to resolve "it".

</div>

<div class="tip-box" data-title="The BERT advantage">

A left-to-right model processes "it" before seeing "big" vs "small" — it must guess. BERT reads both directions and never has to guess.

</div>

---

# The Winograd schema challenge

<div class="definition-box" data-title="Winograd schemas">

Pronoun resolution challenges that test real-world understanding. Originally proposed by Terry Winograd (1972), formalized as a benchmark by Levesque et al. (2012).

**Ambiguous pronouns**:
- "The city councilmen refused the demonstrators a permit because **they** feared violence." (they = councilmen)
- "The city councilmen refused the demonstrators a permit because **they** advocated violence." (they = demonstrators)

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

# Try it: what does BERT predict?

<div class="example-box" data-title="Code example">

```python
from transformers import pipeline
fill_mask = pipeline("fill-mask", model="bert-base-uncased")
fill_mask("The [MASK] barked at the mailman.")
# → [{'token_str': 'dog', 'score': 0.65}, ...]

fill_mask("The capital of Japan is [MASK].")
# → [{'token_str': 'tokyo', 'score': 0.85}, ...]
```

</div>

---

# BERT reveals its biases

<div class="important-box" data-title="Exposing training data biases">

```python
fill_mask("The nurse said [MASK] would be right back.")
# → 'she' (0.58), 'he' (0.25), 'i' (0.06)
fill_mask("The doctor said [MASK] would be right back.")
# → 'he' (0.55), 'she' (0.22), 'i' (0.08)
```

</div>

<div class="warning-box" data-title="Feature and bug">

BERT learned gender stereotypes from its training data. This is useful for studying bias, but dangerous if deployed uncritically.

</div>

---

# What attention heads specialize in

<div class="definition-box" data-title="Linguistic specialization">

Clark et al. (2019) discovered that specific BERT attention heads specialize in linguistic relations:
- **Head 8-10**: Direct objects (verb → object)
- **Head 7-6**: Possessive pronouns (noun → its/his/her)
- **Head 5-4**: Coreference (pronoun → antecedent)

</div>

<div class="note-box" data-title="Emergent properties">

No one programmed these specializations — they emerged from masked language modeling alone.

</div>

---

# BERT learns a linguistic pipeline

<div class="definition-box" data-title="Layer-wise processing">

Tenney et al. (2019) showed BERT's layers form a processing pipeline:
1. **Lower layers (1–4)**: Surface features — POS tags, word boundaries
2. **Middle layers (5–8)**: Syntax — parse trees, dependency relations
3. **Upper layers (9–12)**: Semantics — word sense disambiguation, coreference

</div>

<div class="tip-box" data-title="Classical NLP">

This mirrors the classical NLP pipeline that used to require separate hand-crafted systems for each level.

</div>

---

# Embeddings change across layers

<div class="example-box" data-title="Word sense transformation">

Consider the word "cells" in: "The cells in the prison..." vs "The cells in the body..."
- **Layer 1**: Both "cells" have similar representations (surface form).
- **Layer 6**: Syntactic context starts differentiating them.
- **Layer 12**: Completely different vectors (prison vs biology).

</div>

<div class="note-box" data-title="Measurement">

Cosine similarity between the two "cells" vectors drops from ~0.95 (layer 1) to ~0.45 (layer 12).

</div>

---

# Visualizing attention patterns

<div class="example-box" data-title="Bertviz exploration">

In the companion notebook, you'll use `bertviz` to see attention patterns. These visualizations show how tokens attend to each other across different heads and layers. Try sentences with pronouns — which attention head links "it" to its antecedent?

</div>

<div class="note-box" data-title="Attention maps">

Attention maps often show "ribbon" diagrams or heatmaps where lines connect tokens, indicating the strength of the attention weights.

</div>

---

# BERT-base vs BERT-large

<div class="note-box" data-title="Architecture comparison">

| Component | BERT-base | BERT-large |
|-----------|-----------|------------|
| Layers | 12 | 24 |
| Hidden size | 768 | 1024 |
| Attention heads | 12 | 16 |
| Parameters | 110M | 340M |
| Max sequence | 512 | 512 |

</div>

<div class="tip-box" data-title="Usage">

BERT-base fits on a single GPU and runs in seconds. BERT-large is ~3x slower but excels on complex reasoning tasks like Winograd schemas.

</div>

---

# The pre-training data question

<div class="warning-box" data-title="What's in the data?">

BERT was trained on 3.3B words of BooksCorpus + Wikipedia:
- Primarily English, formal writing.
- Over-represents certain demographics and viewpoints.
- No social media, no conversations, no code.
- Cutoff: 2018 (no knowledge of recent events).

</div>

<div class="important-box" data-title="Data shapes the model">

BERT "knows" what its training data contained. Its biases, gaps, and capabilities all trace back to these 3.3 billion words.

</div>

---

# From understanding to doing

<div class="definition-box" data-title="Pre-train then fine-tune">

- **Pre-training**: Expensive, one-time, learns general language understanding.
- **Fine-tuning**: Cheap, per-task, adds a task-specific head.

</div>

<div class="tip-box" data-title="Transfer learning">

The key insight: language understanding transfers. A model that can fill in blanks has learned enough about language to excel at classification, QA, NER, and more.

</div>

---

# Fine-tuning in 5 lines

<div class="example-box" data-title="Sentiment analysis pipeline">

```python
from transformers import pipeline
classifier = pipeline("sentiment-analysis")
classifier("This movie was absolutely wonderful!")
# → [{'label': 'POSITIVE', 'score': 0.9998}]
classifier("The plot was confusing and dull.")
# → [{'label': 'NEGATIVE', 'score': 0.9987}]
```

</div>

<div class="note-box" data-title="Abstraction">

Under the hood, this is a BERT model fine-tuned on sentiment data. The pipeline abstracts away tokenization, model loading, and inference.

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

BERT established the "pre-train then fine-tune" paradigm that now dominates NLP. Even GPT-4 and Claude use this approach — they just use different architectures and much more data.

</div>

---

# BERT and the brain

<div class="definition-box" data-title="Neural parallels">

Neuroscience studies have found striking parallels between BERT's internal representations and human brain activity during language processing.

**Cognitive insights**:
- BERT's layer progression mirrors the temporal cascade of language processing in the brain.
- Middle BERT layers best predict fMRI activity in language regions.
- The N400 ERP component correlates with BERT's prediction confidence.

</div>

<div class="tip-box" data-title="Computational solutions">

Does BERT "understand" language like we do? Probably not — but it may have discovered similar computational solutions to the same problem.

</div>

---

# Questions to think about

<div class="tip-box" data-title="Discussion questions">

1. Why can't BERT generate text like GPT? Is understanding fundamentally different from generation?
2. If BERT learns linguistic structure from fill-in-the-blank alone, what does that tell us about how much structure is in language itself?
3. Could you train a BERT-like model on music, images, or DNA sequences? What would "masking" mean in those domains?
4. BERT reveals gender biases. Should we fix the model, fix the data, or both?

</div>

---

# References

<div class="note-box" data-title="Further reading">

- Devlin et al. (2019, NAACL) — BERT original paper
- Tenney et al. (2019, ACL) — "BERT rediscovers the classical NLP pipeline"
- Clark et al. (2019, BlackboxNLP) — "What does BERT look at?"
- Levesque et al. (2012) — Winograd Schema Challenge
- Schrimpf et al. (2021, PNAS) — Neural language models and the brain
- HuggingFace Course, Chapter 1 — Practical introduction
- Jay Alammar: The Illustrated BERT

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

BERT variants: how RoBERTa, ALBERT, DistilBERT, and ELECTRA improved on the original. 📓 [Companion notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/xhour_bert_demo.ipynb)

</div>
