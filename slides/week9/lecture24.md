---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 24: The thinking revolution

### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Explain **test-time compute scaling** and why it represents a new paradigm for AI
2. Describe how **reasoning models** (o1, o3, DeepSeek-R1) learn to "think" via reinforcement learning
3. Compare the **frontier model landscape** as of early 2026: Claude, GPT, Gemini, open-weight models
4. Analyze **benchmark saturation** and what it tells us about progress toward general intelligence
5. Evaluate whether longer "thinking" constitutes genuine reasoning or sophisticated pattern completion

</div>

---

# Welcome back

<div class="important-box" data-title="The last content week">

This is our final week of new material. Three lectures remain:

- **Today**: The thinking revolution — reasoning models and the frontier landscape
- **Wednesday**: Agents, tools, and the agentic era
- **Friday**: The reckoning — society, safety, and what comes next

</div>

<div class="tip-box" data-title="Final project reminder">

**Final Project** presentations are **March 9** (next Monday). Submit all materials before class.

</div>

---

# The biggest shift since transformers

<div class="definition-box" data-title="A new scaling axis">

Every model we've studied — from word embeddings to GPT — improved primarily by making **training** bigger: more data, more parameters, more compute during training. In late 2024, a new paradigm emerged: **test-time compute scaling** — spending more compute *at inference* to improve results.

</div>

<div class="important-box" data-title="The key insight">

A smaller model that "thinks longer" can outperform a larger model that answers immediately. This decouples model quality from model size in a way that changes everything about how we build and deploy AI.

</div>

---

# Two scaling axes

<div class="note-box" data-title="Training compute vs. inference compute">

| | Training compute | Inference compute |
|---|---|---|
| **When** | Before deployment (once) | At query time (every call) |
| **Cost structure** | Fixed, upfront, massive | Per-query, variable |
| **What improves** | Base knowledge, capabilities | Reasoning depth on hard problems |
| **Scaling law** | Kaplan et al. (2020) — Lecture 16 | Snell et al. (2024) — **new** |
| **Analogy** | Years of education | Minutes of careful thought |

</div>

![Two scaling axes](figs/two-scaling-axes.svg)

---
<!-- _class: scale-90 -->

# Test-time compute scaling

<div class="definition-box" data-title="Snell et al. (2024): 'Scaling LLM Test-Time Compute'">

[Snell et al. (2024)](https://arxiv.org/abs/2408.03314) showed that **additional compute at inference** improves performance predictably and substantially — and on some problems, a small model thinking longer outperforms a large model thinking quickly.

Two mechanisms:
1. **Process-reward models**: Dense, step-level verifiers that score each reasoning step
2. **Adaptive self-revision**: The model critiques and refines its own output iteratively

</div>

<div class="note-box" data-title="The empirical result">

Compute-optimal test-time scaling improves efficiency **2–4×** over naive approaches. On certain problems, spending additional FLOPs at inference exceeds the benefit of spending the same FLOPs on pretraining.

</div>

---

# From chain-of-thought to reasoning models

<div class="note-box" data-title="The evolution">

| Year | Technique | Key idea |
|------|-----------|----------|
| 2022 | Chain-of-thought prompting | Show the model examples with reasoning steps |
| 2023 | Tree-of-thought, self-consistency | Generate multiple reasoning paths, pick the best |
| 2024 | **Reasoning models** (o1) | Train the model via RL to generate its own reasoning |
| 2025 | Adaptive thinking (Claude 4.x) | Model decides *when and how much* to think |

</div>

<div class="important-box" data-title="The conceptual leap">

Chain-of-thought prompting (Lecture 16) showed that intermediate reasoning helps. Reasoning models take this further: instead of *prompting* the model to reason, you **train it via reinforcement learning** on verifiable rewards (correct math, passing code tests). The model learns to generate its own internal reasoning traces — and these traces can be far more effective than human-written examples.

</div>

---

# OpenAI o1: the first reasoning model

<div class="definition-box" data-title="OpenAI (September 2024)">

**o1** was trained via large-scale RL where the reward signal is *outcome correctness* — verified math solutions, code that passes unit tests. The model learns to generate an internal chain-of-thought that maximizes this reward.

</div>

![Reasoning model pipeline](figs/reasoning-pipeline.svg)

<div class="warning-box" data-title="Key limitation">

OpenAI hides o1's thinking tokens and forbids prompting the model to reveal them. Whether the model performs genuine systematic reasoning or fluent post-hoc rationalization remains an open research question.

</div>

---

# o3 and o4-mini: reasoning scales up

<div class="note-box" data-title="OpenAI (April 2025)">

| Model | AIME 2025 | GPQA Diamond | Codeforces Elo | Key advance |
|-------|-----------|-------------|----------------|-------------|
| GPT-4o (baseline) | ~13% | ~53% | ~1200 | No reasoning |
| o1 (Sept 2024) | ~74% | ~78% | ~1900 | First reasoning model |
| **o3** (Apr 2025) | 88.9% | 87.7% | 2727 | 20% fewer errors than o1 |
| **o4-mini** (Apr 2025) | **92.7%** | ~87% | — | Multimodal + tool use in reasoning loop |

</div>

<div class="important-box" data-title="What changed">

o3 makes **20% fewer major errors** than o1. o4-mini — the *small* reasoning model — scores **92.7% on AIME 2025** (math olympiad problems), surpassing o1's 74%. And o4-mini adds native multimodal input and tool use *within* the reasoning loop — it can search the web and run code as part of its thinking process.

</div>

---

# DeepSeek-R1: open-source reasoning

<div class="definition-box" data-title="DeepSeek-AI (January 2025) — MIT License">

[DeepSeek-R1](https://arxiv.org/abs/2501.12948) proved that frontier reasoning capabilities can be achieved with **pure reinforcement learning** on an open-weight model — no proprietary data pipelines, no human preference labels.

</div>

<div class="note-box" data-title="The R1-Zero experiment">

**DeepSeek-R1-Zero** was trained with RL only (zero supervised fine-tuning):
- Algorithm: **GRPO** (Group Relative Policy Optimization) — generates multiple answers, ranks by correctness, updates toward better ones
- Reward: Only whether the final answer is correct — no step-level supervision
- Result: Self-verification, reflection, and long chain-of-thought **emerged spontaneously**
- AIME 2024: jumped from 15.6% → 71.0% (pass@1); 86.7% with majority voting

</div>

<div class="tip-box" data-title="Why this matters">

R1 matched OpenAI o1 as a fully open model. Its API costs ~1/30th of o1. Six distilled versions (1.5B–70B) outperform GPT-4 on math/coding. This democratized reasoning.

</div>

---

# Claude's extended thinking

<div class="definition-box" data-title="Anthropic (February 2025 — present)">

Anthropic implemented reasoning as a **toggle within a single model** — same weights, different inference behavior. Unlike OpenAI, Claude's thinking tokens are **visible** to developers.

</div>

<div class="example-box" data-title="API usage">

```python
response = client.messages.create(
    model="claude-opus-4-6",
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "Prove that √2 is irrational."}]
)
# Response includes a visible "thinking" block + final answer
```

</div>

<div class="note-box" data-title="Key differences from OpenAI">

| Feature | OpenAI o-series | Claude extended thinking |
|---------|----------------|------------------------|
| Thinking visibility | Hidden | **Visible** |
| Control mechanism | Reasoning effort (low/med/high) | Budget tokens (1K–128K) or adaptive |
| Latest innovation | o4-mini: tools in reasoning loop | **Interleaved thinking**: reason between tool calls |

</div>

---

# The s1 experiment: reasoning is surprisingly simple

<div class="definition-box" data-title="Muennighoff et al. (2025)">

[s1](https://arxiv.org/abs/2501.19393) showed that test-time scaling can be achieved with remarkably little effort:

1. Fine-tune Qwen2.5-32B on just **1,000 curated examples** (the "s1K" dataset)
2. At inference, apply **budget forcing**: append the word "Wait" to force continued reasoning
3. Result: Exceeds o1-preview on AIME 2024 by up to **27%**

</div>

<div class="important-box" data-title="The implication">

You don't need massive RL infrastructure to get reasoning capabilities. A small amount of high-quality reasoning data + a simple inference trick can unlock substantial test-time scaling. This suggests reasoning is latent in large pretrained models — it just needs to be activated.

</div>

---

# The frontier landscape: early 2026

<div class="note-box" data-title="Where we stand">

| Model | Developer | Release | Total params | Key capability |
|-------|-----------|---------|-------------|----------------|
| **Claude Opus 4.6** | Anthropic | Feb 2026 | — | 1M context, adaptive thinking |
| **GPT-5** | OpenAI | Aug 2025 | — | Native multimodal, 94.6% AIME |
| **Gemini 2.5 Pro** | Google | Mar 2025 | — | 1M context, built-in thinking |
| **DeepSeek-R1** | DeepSeek | Jan 2025 | 671B MoE | Open-weight reasoning, $5.5M training |
| **Llama 4 Maverick** | Meta | Apr 2025 | 400B MoE | Open-weight, 1M context, multimodal |
| **Qwen 3** | Alibaba | Apr 2025 | 235B | 89.7% AIME, open-weight |
| **Mistral Large 3** | Mistral AI | Dec 2025 | 675B MoE | Open-weight, 256K context, 40+ languages |

</div>

---

# The Mixture of Experts revolution

<div class="note-box" data-title="MoE is now the default for frontier models">

Nearly every frontier model released in 2025 uses **Mixture of Experts** (MoE) — sparse activation where only a fraction of parameters are used per token:

| Model | Total params | Active params | Experts | Training cost |
|-------|-------------|--------------|---------|--------------|
| DeepSeek-V3 | 671B | 37B | 256 + shared | **$5.6M** |
| Llama 4 Maverick | 400B | 17B | 128 + 1 shared | — |
| Llama 4 Scout | 109B | 17B | 16 | — |
| Qwen 3 | 235B | 22B | 128 (top-8) | — |
| Mistral Large 3 | 675B | 41B | — | — |

</div>

<div class="important-box" data-title="The DeepSeek effect">

DeepSeek-V3 trained a frontier model for ~$5.6M — roughly **1/20th** of GPT-4's estimated cost. This shattered the assumption that only billion-dollar labs can compete. The key innovations: Multi-head Latent Attention (MLA), auxiliary-loss-free load balancing, and multi-token prediction.

</div>

---

# Benchmark saturation

<div class="warning-box" data-title="We're running out of tests">

Most standard benchmarks are now **saturated** — frontier models score at or above human expert level:

| Benchmark | Status | Best score | Human baseline |
|-----------|--------|-----------|---------------|
| HumanEval (coding) | Saturated | 99.0% | ~95% |
| MMLU (knowledge) | Saturated | ~92% | ~89% expert |
| GPQA Diamond (PhD-level science) | Near-saturated | 94.3% | ~65% expert |
| MATH-500 | Near-saturated | 98.0% | — |
| SWE-bench Verified (real GitHub issues) | Active | 80.9% | — |
| **ARC-AGI-2** (novel reasoning) | **Not saturated** | **4.4%** | **60%** |
| **Humanity's Last Exam** | **Not saturated** | **48.1%** | **~90%** |

</div>

---

# Humanity's Last Exam

<div class="definition-box" data-title="2,500 expert-level questions across 100+ academic subjects">

[Humanity's Last Exam](https://lastexam.ai) (HLE) was designed to be the hardest public benchmark — questions submitted by domain experts that require deep specialist knowledge.

</div>

<div class="note-box" data-title="Progress in one year">

| System | HLE score | Date |
|--------|----------|------|
| Early 2025 frontier models | ~1–5% | Jan 2025 |
| OpenAI Deep Research | 26.0% | Feb 2025 |
| Claude Opus 4.6 (max thinking) | 36.7% | Feb 2026 |
| Gemini 3.1 Pro Preview | 44.7% | Feb 2026 |
| SOTA (Zoom AI) | **48.1%** | Late 2025 |
| Human graduate students | **~90%** | — |

</div>

<div class="tip-box" data-title="What this tells us">

Models went from ~3% to ~48% in one year — extraordinary progress. But the gap to human experts (~90%) remains large. HLE and ARC-AGI-2 suggest that while models excel at knowledge retrieval and pattern-matching, **novel reasoning and deep domain expertise** remain hard.

</div>

---

# ARC-AGI: the reasoning gap

<div class="note-box" data-title="Two versions, two very different stories">

**ARC-AGI-1** (Chollet, 2019): Visual pattern puzzles requiring novel reasoning.
- o3 scored **87.5%** at high compute ($17–20/puzzle) — near human level (95%)
- Declared "largely solved" → prize retired

**ARC-AGI-2** (2025): Harder puzzles, same format.
- o3 scored **2.9%** — humans score **60%**
- The **20× gap** between AI and humans on novel tasks remains enormous

</div>

<div class="important-box" data-title="The lesson">

Standard benchmarks can be saturated by scale and pattern matching. But **genuinely novel reasoning** — the kind that requires understanding abstract principles and applying them to situations never seen before — remains the frontier. ARC-AGI-2 is arguably the best current test of this capability.

</div>

---

# Native multimodal models

<div class="note-box" data-title="Models that see, hear, and generate across modalities">

A parallel revolution: frontier models are no longer text-only. They **natively** process and generate across modalities:

| Capability | GPT-5 | Gemini 2.5+ | Claude 4.6 | Llama 4 |
|-----------|-------|------------|-----------|---------|
| Text input/output | Yes | Yes | Yes | Yes |
| Image understanding | Yes | Yes | Yes | Yes |
| Audio input | Yes | Yes | No | No |
| Video understanding | Frames | **Native** | No | Yes |
| **Image generation** | **Native** | **Native** | No | No |
| Long context | 128K | **1M** | **1M** | 1M |

</div>

<div class="important-box" data-title="Native image generation (March 2025)">

Both OpenAI and Google shipped **native image generation** inside their main LLMs — not calling a separate diffusion model, but generating images autoregressively as tokens. GPT-4o generates images with far superior text rendering vs. DALL-E 3. Gemini does the same with SynthID watermarking built in.

</div>

---

# Small models, big capabilities

<div class="note-box" data-title="Not everyone needs 671B parameters">

| Model | Parameters | Key strength |
|-------|-----------|-------------|
| Phi-4-mini (Microsoft) | 3.8B | Matches 7–9B class on reasoning |
| Gemma 3n (Google) | 2B effective | Multimodal (text+image+audio+video), on-device |
| Qwen 3-0.6B (Alibaba) | 600M | Hybrid reasoning modes, tool use |
| Llama 3.2 1B (Meta) | 1B | 128K context, fits in 2–3 GB RAM |

</div>

<div class="tip-box" data-title="The inference-optimal paradigm">

These models are **massively overtrained** relative to Chinchilla-optimal scaling (Lecture 16): 700+ tokens/parameter vs. the "optimal" 20. The logic: train once, deploy millions of times. Smaller models are cheaper to run — and with quantization, a 3B model can run on a **phone**.

</div>

---

# On-device AI

<div class="note-box" data-title="LLMs in your pocket">

Flagship smartphones in 2025 can run 4B+ parameter models at conversational speeds:

| Platform | NPU capability | What runs locally |
|----------|---------------|-------------------|
| Apple A18 Pro | 35+ TOPS | ~3B model; sensitive tasks stay on-device |
| Qualcomm Snapdragon 8 Elite | 70+ TOPS | Llama 3.2 1B/3B natively |
| MediaTek Dimensity 9500 | 3nm NPU | Gemma 3n via LiteRT |

</div>

<div class="definition-box" data-title="Apple's privacy architecture">

Apple Intelligence uses a tiered approach:
1. **On-device**: ~3B model handles simple tasks privately
2. **Private Cloud Compute**: Complex tasks processed on Apple silicon servers — no data stored
3. **External**: ChatGPT integration for out-of-scope tasks (with user permission)

This is a principled answer to the privacy vs. capability tradeoff.

</div>

---

# Voice and real-time AI

<div class="note-box" data-title="End-to-end audio models">

**GPT-4o Advanced Voice Mode** processes audio natively — no speech-to-text → LLM → text-to-speech pipeline. One unified model:

- Detects sarcasm, urgency, hesitation from **acoustic signals**
- Handles natural **interruptions** (you can cut it off mid-sentence)
- Sub-second latency via WebRTC
- Modulates its own voice emotionally based on context

**Gemini Live** adds deep Google ecosystem grounding — it can check your Gmail, Calendar, and Drive while talking to you.

</div>

<div class="tip-box" data-title="Questions to consider">

When an AI can hear your tone of voice, see your face, and respond in real-time with emotional awareness — is this meaningfully different from human conversation? What does this mean for the ELIZA effect (Lecture 2)?

</div>

---

# Discussion: what does it mean to "think"?

<div class="tip-box" data-title="The deepest question in this course">

1. **Thinking or performing?** When o3 generates a 10,000-token reasoning trace to solve a math problem, is it *thinking* — or producing a sophisticated pattern that *looks like* thinking? How would you test the difference? (Revisit Lecture 1: is ChatGPT conscious?)

2. **The DeepSeek-R1 emergence:** R1-Zero developed self-verification and backtracking *without being taught these behaviors*. The model was rewarded only for correct answers — yet it learned to doubt itself, re-examine its work, and try alternative approaches. Is this "just optimization" — or is something deeper happening?

3. **Diminishing returns?** AIME scores went from 13% → 93% in 18 months. But ARC-AGI-2 scores went from 0% to 4%. Are we approaching a wall — or just need a different kind of reasoning training?

4. **The education analogy:** If a student solves a problem by thinking for 5 minutes vs. 5 seconds, we say the longer thinking was "deeper." Is the same true for an LLM using 50,000 thinking tokens vs. 500? What's the difference?

</div>

---
<!-- _class: scale-85 -->

# Further reading

<div class="note-box" data-title="Further reading">

[**Snell et al. (2024, *arXiv*)**](https://arxiv.org/abs/2408.03314) "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters" — The theoretical foundation for inference-time scaling.

[**DeepSeek-AI (2025, *arXiv*)**](https://arxiv.org/abs/2501.12948) "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning" — Open-weight reasoning model matching o1.

[**Muennighoff et al. (2025, *arXiv*)**](https://arxiv.org/abs/2501.19393) "s1: Simple Test-Time Scaling" — 1,000 examples + "Wait" trick beats o1-preview.

[**Wei et al. (2022, *NeurIPS*)**](https://arxiv.org/abs/2201.11903) "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" — Where it all started.

[**OpenAI (2025)**](https://openai.com/index/introducing-o3-and-o4-mini/) "Introducing o3 and o4-mini" — Latest reasoning models with multimodal capabilities.

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

Agents, tools, and the agentic era: when LLMs start acting in the world

</div>
