---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 22: Scaling up to GPT-3 and beyond

### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Describe how **GPT-2** demonstrated zero-shot task transfer through scale
2. Explain how **GPT-3** enabled **few-shot learning** without fine-tuning
3. Outline the alignment pipeline from RLHF to DPO to GRPO
4. Explain how **reasoning models** (o1, DeepSeek-R1) work and why they matter
5. Critically evaluate the debate over **emergent abilities** in LLMs

</div>

---

# GPT-2: unsupervised multitask learning

<div class="definition-box" data-title="The 10× scale-up">

[GPT-2](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) (Radford et al., 2019) scaled GPT-1 by an order of magnitude and discovered that **larger models can perform tasks without any fine-tuning**.

| | GPT-1 (2018) | GPT-2 (2019) |
|---|---|---|
| Parameters | 117M | 1.5B (13×) |
| Training data | BooksCorpus (5B tokens) | WebText (40GB, ~8×) |
| Fine-tuning needed? | Yes | **No** (zero-shot transfer) |

</div>

<div class="important-box" data-title="The key claim">

"Language models are unsupervised multitask learners" — a single model trained on next-token prediction implicitly learns to translate, summarize, answer questions, and more. OpenAI staged the release over 9 months due to disinformation concerns — one of the first high-profile responsible AI releases.

</div>

---

# Zero-shot task transfer

<div class="definition-box" data-title="Performing tasks without fine-tuning">

GPT-2 can perform tasks it was never explicitly trained for, simply by prompting with the right text format. This works because the model encountered similar patterns in its diverse training data.

</div>

<div class="example-box" data-title="Zero-shot prompting examples">

**Translation**: `"English: I love machine learning\nFrench:"` → `"J'aime l'apprentissage automatique"`

**Question answering**: `"Q: What is the capital of France?\nA:"` → `"Paris"`

**Summarization**: `"[Long article]\n\nTL;DR:"` → generates a summary

The model learned these formats from web text where such patterns naturally occur (bilingual pages, Q&A forums, Reddit TL;DR summaries). Performance was far behind fine-tuned SOTA, but the fact that it worked *at all* was groundbreaking.

</div>

---

# GPT-3: few-shot learning at scale

<div class="definition-box" data-title="Brown et al. (2020): 'Language Models are Few-Shot Learners'">

[GPT-3](https://arxiv.org/abs/2005.14165) scaled up another **100×** (175B parameters, 300B tokens, ~$4.6M) and discovered **in-context learning** — the ability to learn new tasks from just a few examples in the prompt, with no gradient updates.

</div>

<div class="example-box" data-title="Few-shot sentiment classification">

```text
Classify each review as Positive or Negative.

Review: "This movie was amazing, I loved every minute!"
Sentiment: Positive

Review: "Terrible film, complete waste of time."
Sentiment: Negative

Review: "The acting was wooden and the plot made no sense."
Sentiment:
```

GPT-3 output: `"Negative"` — no weight updates, no fine-tuning, pure pattern recognition.

</div>

---

# Scaling laws recap

<div class="note-box" data-title="Recall from Lecture 16">

We covered scaling laws in detail in Lecture 16: [Kaplan et al. (2020)](https://arxiv.org/abs/2001.08361) showed power-law improvement with scale, and [Chinchilla (Hoffmann et al., 2022)](https://arxiv.org/abs/2203.15556) showed that GPT-3 was *undertrained* — optimal is ~20 tokens per parameter.

</div>

<div class="important-box" data-title="The practical impact">

| Model | Parameters | Training tokens | Tokens/parameter |
|-------|------------|----------------|-----------------|
| GPT-3 | 175B | 300B | 1.7 (undertrained) |
| Chinchilla | 70B | 1.4T | 20 (optimal) |
| LLaMA 3 | 70B | 15T | 214 (overtrained for inference) |

Chinchilla (70B) **outperformed** GPT-3 (175B) at 2.5× smaller. But the latest trend goes further: **overtrain** smaller models to minimize *inference* cost, since you deploy billions of times but train only once.

</div>

---

# From GPT-3 to ChatGPT

<div class="note-box" data-title="The three-stage evolution">

| Stage | Model | Key innovation |
|-------|-------|----------------|
| 1 | GPT-3 (2020) | Next-token prediction at massive scale |
| 2 | [InstructGPT](https://arxiv.org/abs/2203.02155) (2022) | **Instruction tuning** on human-written responses |
| 3 | ChatGPT (Nov 2022) | **RLHF** for helpful, harmless conversation |

</div>

<div class="definition-box" data-title="RLHF in brief">

Recall from Lecture 16: RLHF trains a **reward model** from human preference rankings, then optimizes the LLM to maximize that reward. This aligns the model's objective with **what humans actually want** — helpful, honest, harmless — rather than just next-token likelihood. ChatGPT reached 100M users in 2 months, the fastest-growing consumer app in history.

</div>

---

# Beyond RLHF: DPO and GRPO

<div class="definition-box" data-title="Simpler, cheaper alternatives to RLHF">

RLHF requires training a separate reward model and running PPO — complex and unstable. Two alternatives have emerged:

[**DPO**](https://arxiv.org/abs/2305.18290) (Rafailov et al., NeurIPS 2023): **Direct Preference Optimization** skips the reward model entirely. It directly optimizes the LLM to prefer winning responses over losing ones using a simple classification loss. Same quality as RLHF, ~3× less compute.

[**GRPO**](https://arxiv.org/abs/2402.03300) (Shao et al., 2024): **Group Relative Policy Optimization** from DeepSeekMath. Instead of human rankings, it generates multiple responses and uses a *verifiable reward* (e.g., "is the math answer correct?") to rank them. No humans needed for domains with checkable answers.

</div>

<div class="important-box" data-title="The trend">

Alignment is getting **cheaper, simpler, and more automated**. This democratizes the ability to create instruction-following models — but also lowers the barrier for misuse.

</div>

---

# Chain-of-thought prompting

<div class="definition-box" data-title="Wei et al. (2022); Kojima et al. (2022)">

**Chain-of-thought (CoT)** prompting asks the model to show its reasoning step by step before giving a final answer. This dramatically improves performance on reasoning tasks.

</div>

<div class="example-box" data-title="Chain-of-thought example">

```text
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis
   balls. Each can has 3 balls. How many does he have now?

Let's think step by step:
1. Roger starts with 5 tennis balls
2. He buys 2 cans × 3 balls per can = 6 new balls
3. Total = 5 + 6 = 11 tennis balls

A: 11
```

Simply adding **"Let's think step by step"** improves accuracy on GSM8K math problems from **17.7% to 78.7%** ([Kojima et al., 2022](https://arxiv.org/abs/2205.11916)). The model "knows" how to reason — it just needs permission to show its work.

</div>

---

# Reasoning models: thinking before answering

<div class="definition-box" data-title="A new paradigm: test-time compute scaling">

Instead of making models bigger (training-time scaling), **reasoning models** spend more compute at inference time by generating an internal chain-of-thought before answering.

</div>

<div class="note-box" data-title="Key reasoning models">

| Model | Organization | Key innovation |
|-------|-------------|---------------|
| [o1](https://arxiv.org/abs/2412.16720) (2024) | OpenAI | Hidden chain-of-thought, trained with RL to "think" |
| [o3](https://openai.com/index/deliberative-alignment/) (2025) | OpenAI | Extended reasoning, SOTA on ARC-AGI |
| [DeepSeek-R1](https://arxiv.org/abs/2501.12948) (2025) | DeepSeek | Open-weight, trained with GRPO, reasoning emerges from RL alone |

</div>

<div class="important-box" data-title="DeepSeek-R1's surprising finding">

R1 was trained with *pure RL* — no supervised reasoning examples. Yet it spontaneously developed chain-of-thought, self-correction, and even metacognition ("wait, let me reconsider..."). Then R1's reasoning was **distilled** into smaller models (Llama-70B, Qwen-32B), giving them reasoning abilities at a fraction of the cost.

</div>

---

# Are emergent abilities real?

<div class="definition-box" data-title="The debate">

[**Wei et al. (2022)**](https://arxiv.org/abs/2206.07682) claimed that abilities like arithmetic and reasoning *emerge* suddenly at certain scales — absent in small models, present in large ones.

[**Schaeffer et al. (2023, NeurIPS)**](https://arxiv.org/abs/2304.15004) challenged this: they showed that "emergence" disappears when you switch from **nonlinear metrics** (exact-match accuracy) to **linear metrics** (token-level accuracy). The abilities were developing gradually all along — the metric just couldn't detect partial progress.

</div>

<div class="tip-box" data-title="Why this matters for science">

If emergence is real, it means we can't predict what larger models will do — they might develop unexpected and potentially dangerous capabilities. If it's a measurement artifact, then scaling is *predictable* and we can plan for it. The answer has profound implications for AI safety policy.

</div>

---

# The modern LLM landscape (2025)

<div class="note-box" data-title="The field moves fast">

| Year | Milestone |
|------|-----------|
| 2022 | ChatGPT launched (OpenAI) — 100M users in 2 months |
| 2023 | GPT-4 (multimodal), Llama 2 (open weights), Claude 2 |
| 2024 | Claude 3.5, GPT-4o, Llama 3, Mistral Large, Gemini 1.5 |
| 2024–25 | Reasoning models (o1, o3, R1), small efficient models (Phi-4, Gemma 2) |

</div>

<div class="note-box" data-title="Five key trends">

1. **Reasoning at inference time** — spending more compute when thinking, not just when training
2. **Longer context windows** — 128K–1M+ tokens (Gemini 1.5 Pro)
3. **Open weight models** — LLaMA, Mistral, DeepSeek approaching frontier quality
4. **Multimodal** — text + vision + audio in a single model
5. **Efficiency** — smaller models matching larger predecessors (Phi-4 14B ≈ GPT-3.5 175B)

</div>

---

# Current limitations of LLMs

<div class="warning-box" data-title="What LLMs still struggle with">

- **Hallucinations**: Confidently generate false statements with no awareness of uncertainty
- **Reasoning depth**: Multi-step logic and mathematical proofs remain unreliable (even reasoning models have limits)
- **Knowledge currency**: Training data has a cutoff date; no access to real-time information
- **Consistency**: May give different answers to the same question across runs
- **Prompt sensitivity**: Small wording changes can dramatically alter outputs

</div>

<div class="note-box" data-title="Active areas of research">

Each limitation has spawned research directions: RAG for knowledge currency (Lecture 17), tool use and agents for grounding (Lecture 24), constitutional AI for alignment, reasoning models for reliability, and formal verification for correctness guarantees.

</div>

---

# Discussion

<div class="tip-box" data-title="Questions to consider">

1. **Emergent abilities:** If Schaeffer is right that "emergence" is a measurement artifact, does that make scaling *more* or *less* concerning? What if Wei is right?

2. **Reasoning models:** DeepSeek-R1 developed chain-of-thought reasoning through pure RL — no human examples. Does this constitute "learning to think"? How is this different from how children learn to reason?

3. **The alignment tax:** DPO and GRPO make alignment cheaper and more accessible. Is this good (more aligned models) or dangerous (easier to create models aligned to harmful objectives)?

4. **Open vs closed:** DeepSeek-R1 is fully open. OpenAI's o1 is closed. If open models reach frontier quality, can safety-through-secrecy still work? Should it?

</div>

---
<!-- _class: scale-85 -->

# Further reading

<div class="note-box" data-title="Further reading">

[**Brown et al. (2020, *NeurIPS*)**](https://arxiv.org/abs/2005.14165) "Language Models are Few-Shot Learners" — GPT-3: in-context learning at scale.

[**Rafailov et al. (2023, *NeurIPS*)**](https://arxiv.org/abs/2305.18290) "Direct Preference Optimization" — RLHF without the RL.

[**DeepSeek-AI (2025, *arXiv*)**](https://arxiv.org/abs/2501.12948) "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning" — Open-weight reasoning model.

[**Schaeffer et al. (2023, *NeurIPS*)**](https://arxiv.org/abs/2304.15004) "Are Emergent Abilities of Large Language Models a Mirage?" — The metric artifact hypothesis.

[**Kojima et al. (2022, *NeurIPS*)**](https://arxiv.org/abs/2205.11916) "Large Language Models are Zero-Shot Reasoners" — "Let's think step by step."

[**OpenAI (2024, *arXiv*)**](https://arxiv.org/abs/2412.16720) "o1 System Card" — Reasoning via test-time compute scaling.

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

Implementing GPT from scratch: building a language model in PyTorch

</div>
