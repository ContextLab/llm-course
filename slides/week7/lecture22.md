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

- Describe how **GPT-2** demonstrated zero-shot task transfer through scale
- Explain how **GPT-3** enabled **few-shot learning** without fine-tuning
- State the key findings of **scaling laws** (Kaplan et al., 2020) and **Chinchilla** (Hoffmann et al., 2022)
- Outline the **RLHF** pipeline that transformed GPT-3 into ChatGPT
- Compare **open** vs. **closed** model ecosystems and their tradeoffs
- Apply **prompting techniques** including few-shot and chain-of-thought

</div>

---

# GPT-2: language models are unsupervised multitask learners

<div class="definition-box" data-title="The 10x scale-up">

GPT-2 (Radford et al., 2019) scaled GPT-1 by an order of magnitude and discovered that **larger models can perform tasks without any fine-tuning**.

| | GPT-1 (2018) | GPT-2 (2019) |
|---|---|---|
| Parameters | 117M | 1.5B (13x) |
| Training data | BooksCorpus (5B tokens) | WebText (40GB, ~8x) |
| Fine-tuning needed? | Yes | **No** (zero-shot transfer) |

</div>

<div class="important-box" data-title="The key claim">

"Language models are unsupervised multitask learners" -- a single model trained on next-token prediction implicitly learns to translate, summarize, answer questions, and more.

</div>

---

# The WebText dataset

<div class="note-box" data-title="Curated web scraping as training data">

GPT-2 introduced a new data curation strategy:

1. Scrape all outbound links from Reddit posts with **3+ karma** (community quality signal)
2. Filter for quality and diversity
3. Remove Wikipedia (to avoid test set contamination)
4. Result: **40GB of text** from ~8 million documents

</div>

<div class="tip-box" data-title="Why Reddit karma works as a quality filter">

Reddit's upvote system acts as human curation at scale. Links that receive 3+ karma have been judged interesting or valuable by at least a few people, filtering out spam and low-quality content without manual review.

</div>

---

# GPT-2 model sizes

<div class="note-box" data-title="Four progressively released models">

| Model | Parameters | Layers | Hidden size |
|-------|------------|--------|-------------|
| Small | 117M | 12 | 768 |
| Medium | 345M | 24 | 1,024 |
| Large | 762M | 36 | 1,280 |
| XL | 1.5B | 48 | 1,600 |

</div>

<div class="warning-box" data-title="Staged release for safety">

OpenAI released GPT-2 over 9 months (Feb--Nov 2019), starting with the smallest model, due to concerns about potential misuse for generating disinformation. This was one of the first high-profile cases of responsible AI release practices.

</div>

---

# Zero-shot task transfer

<div class="definition-box" data-title="Performing tasks without fine-tuning">

GPT-2 can perform tasks it was never explicitly trained for, simply by being prompted with the right text format. This works because the model encountered similar patterns in its diverse training data.

</div>

<div class="example-box" data-title="Zero-shot prompting examples">

**Translation**: `"English: I love machine learning\nFrench:"` → `"J'aime l'apprentissage automatique"`

**Question answering**: `"Q: What is the capital of France?\nA:"` → `"Paris"`

**Summarization**: `"[Long article]\n\nTL;DR:"` → generates a summary

The model learned these formats from web text where such patterns naturally occur (bilingual pages, Q&A forums, Reddit TL;DR summaries).

</div>

---

# GPT-2 zero-shot performance

<div class="note-box" data-title="Benchmark results (no fine-tuning)">

| Task | Fine-tuned SOTA | GPT-2 (zero-shot) |
|------|-----------------|-------------------|
| Translation (En→Fr) | 45.6 BLEU | 11.5 |
| Summarization | 40.2 ROUGE | 29.3 |
| Question answering | 89.4% | 63.1% |
| Reading comprehension | 91.8 F1 | 55.0 |

</div>

<div class="note-box" data-title="Interpretation">

GPT-2's zero-shot performance was far behind fine-tuned models, but the fact that it worked **at all** was groundbreaking. Performance improved consistently with model size, suggesting that further scaling might close the gap.

</div>

---

# GPT-2 text generation quality

<div class="example-box" data-title="The unicorn sample that went viral">

**Prompt**: "In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains."

**GPT-2 continued**: "Even more surprising to the researchers was the fact that the unicorns spoke perfect English. The scientist named the population, after their distinctive horn, Ovid's Unicorn. These four-horned, silver-white unicorns were previously unknown to science..."

</div>

<div class="warning-box" data-title="Key observations">

- **Coherent and fluent** across multiple paragraphs
- **Maintains context** and narrative style
- **Completely fabricated** -- confident hallucination of non-existent facts
- This dual nature (fluent but unreliable) remains a core challenge for all LLMs

</div>

---

# GPT-3: the 175 billion parameter model

<div class="definition-box" data-title="Brown et al. (2020): 'Language Models are Few-Shot Learners'">

GPT-3 scaled up another **100x** and discovered that at sufficient scale, models develop **in-context learning** -- the ability to learn new tasks from just a few examples in the prompt.

| Model | Parameters | Scale relative to GPT-1 |
|-------|------------|------------------------|
| GPT-1 | 117M | 1x |
| GPT-2 | 1.5B | 13x |
| GPT-3 | 175B | **1,500x** |

</div>

<div class="important-box" data-title="The central finding">

New capabilities *emerged* at this scale that were absent in smaller models -- arithmetic, basic reasoning, code generation, and robust few-shot learning across dozens of tasks.

</div>

---

<!-- _class: scale-90 -->

# GPT-3 specifications

<div class="note-box" data-title="Model architecture">

| Component | Value |
|-----------|-------|
| Transformer layers | 96 |
| Hidden size (d_model) | 12,288 |
| Attention heads | 96 |
| Context window | 2,048 tokens |
| Vocabulary size | 50,257 (BPE) |
| Total parameters | 175 billion |

</div>

<div class="note-box" data-title="Training details">

| Detail | Value |
|--------|-------|
| Training tokens | 300 billion |
| Training data | 570GB filtered (Common Crawl, WebText2, Books, Wikipedia) |
| Training compute | ~3,640 petaflop-days |
| Estimated cost | ~$4.6M |

</div>

---

# GPT-3 training data composition

<div class="note-box" data-title="A carefully balanced mixture">

| Dataset | Tokens | Weight in training |
|---------|--------|--------------------|
| Common Crawl (filtered) | 410B | 60% |
| WebText2 | 19B | 22% |
| Books1 | 12B | 8% |
| Books2 | 55B | 8% |
| Wikipedia | 3B | 3% |

</div>

<div class="tip-box" data-title="Questions to consider">

Notice that high-quality sources (WebText2, Books, Wikipedia) are sampled **more frequently** than their token count would suggest. Why might oversampling quality data improve performance even when more data is available?

</div>

---

# Few-shot learning: learning from examples in the prompt

<div class="definition-box" data-title="Three learning paradigms">

- **Zero-shot**: Task description only -- no examples
- **One-shot**: One input-output example provided
- **Few-shot**: Multiple examples (typically 3--100) provided in the prompt

Critically, **no gradient updates occur** -- the model's weights remain frozen. All "learning" happens through pattern recognition in the prompt context.

</div>

<div class="example-box" data-title="Few-shot translation">

```text
dog -> chien
cat -> chat
bird -> oiseau
I love AI ->
```

GPT-3 output: `"J'aime l'IA"`

</div>

---

# Few-shot sentiment classification

<div class="example-box" data-title="Classifying reviews with 3 examples">

```python
prompt = """Classify each review as Positive or Negative.

Review: "This movie was amazing, I loved every minute!"
Sentiment: Positive

Review: "Terrible film, complete waste of time."
Sentiment: Negative

Review: "A masterpiece of modern cinema."
Sentiment: Positive

Review: "The acting was wooden and the plot made no sense."
Sentiment:"""

# GPT-3 output: "Negative"
```

The model recognizes the pattern from examples and applies it to the new input -- no weight updates, no fine-tuning, pure inference.

</div>

---

# Emergent abilities

<div class="definition-box" data-title="Wei et al. (2022)">

**Emergent abilities** are capabilities that appear only above a certain model scale and are essentially absent in smaller models. They cannot be predicted by extrapolating from smaller models.

</div>

<div class="note-box" data-title="Examples of emergent capabilities">

| Capability | Approximate emergence threshold |
|------------|-------------------------------|
| Multi-digit arithmetic | ~10B parameters |
| Code generation | ~10B parameters |
| Multi-step reasoning | ~100B parameters |
| Chain-of-thought reasoning | ~100B parameters |
| Analogical reasoning | ~100B parameters |

</div>

<div class="warning-box" data-title="Caveat">

Recent work has questioned whether emergence is real or an artifact of evaluation metrics (Schaeffer et al., 2023). The debate continues.

</div>

---

# Scaling laws

<div class="definition-box" data-title="Kaplan et al. (2020): 'Scaling Laws for Neural Language Models'">

Model performance (measured by cross-entropy loss) scales as a **power law** with three factors:

$$L(N) \approx \left(\frac{N_c}{N}\right)^{\alpha_N}$$

where $N$ is the number of parameters, $N_c$ is a constant, and $\alpha_N \approx 0.076$.

</div>

<div class="note-box" data-title="Key findings">

1. Performance improves **smoothly and predictably** with scale
2. Model **shape** (depth vs. width) matters surprisingly little
3. 10x more parameters → ~15% lower loss
4. The three scaling axes (parameters, data, compute) can substitute for each other to some extent

</div>

---

# Chinchilla scaling laws

<div class="important-box" data-title="Hoffmann et al. (2022): 'Training Compute-Optimal Large Language Models'">

Previous models were **over-parameterized and under-trained**. For a given compute budget, the optimal allocation is approximately **20 tokens per parameter**.

</div>

<div class="note-box" data-title="GPT-3 was undertrained">

| Model | Parameters | Training tokens | Tokens/parameter |
|-------|------------|----------------|-----------------|
| GPT-3 | 175B | 300B | 1.7 (far below optimal) |
| Chinchilla | 70B | 1.4T | 20 (optimal) |

**Result**: Chinchilla (70B) **outperformed** GPT-3 (175B) despite being 2.5x smaller, because it was trained on 4.7x more data.

</div>

<div class="tip-box" data-title="Impact on the field">

Chinchilla scaling directly influenced Llama 2, Mistral, and other modern models that prioritize longer training over larger parameter counts.

</div>

---

# From GPT-3 to ChatGPT

<div class="note-box" data-title="The three-stage evolution">

| Stage | Model | Key innovation |
|-------|-------|----------------|
| 1 | GPT-3 (2020) | Next-token prediction at massive scale |
| 2 | InstructGPT (2022) | **Instruction tuning** on human-written responses |
| 3 | ChatGPT (Nov 2022) | **RLHF** for helpful, harmless conversation |

</div>

<div class="definition-box" data-title="What is instruction tuning?">

Fine-tune the model on (instruction, response) pairs so it learns to **follow commands** rather than merely continue text. Before instruction tuning, asking GPT-3 to "Write a haiku about AI" might produce an essay *about* haiku writing. After instruction tuning, it actually writes the haiku.

</div>

---

# RLHF: reinforcement learning from human feedback

<div class="note-box" data-title="The three-step RLHF pipeline (Ouyang et al., 2022)">

**Step 1 -- Supervised fine-tuning (SFT)**: Train on human-written example responses to learn basic instruction-following.

**Step 2 -- Reward model training**: Generate multiple responses to the same prompt, have humans rank them, and train a model to predict human preferences.

**Step 3 -- RL optimization (PPO)**: Use the reward model as a scoring function and optimize the language model's policy to maximize predicted human preference scores.

</div>

<div class="important-box" data-title="Why RLHF matters">

RLHF aligns the model's objective with **what humans actually want** (helpful, honest, harmless) rather than just next-token likelihood. This is what made ChatGPT feel qualitatively different from GPT-3.

</div>

---

# RLHF in practice

<div class="example-box" data-title="Training the reward model">

```text
Prompt: "How do I make a cake?"

Response A (human rank: 1st):
"Here's a simple recipe: Preheat oven to 350F.
 Mix 2 cups flour, 1.5 cups sugar..."

Response B (human rank: 2nd):
"Cake is a type of dessert that originated in
 ancient civilizations..."

Response C (human rank: 3rd):
"I cannot help with that request."
```

The reward model learns: direct, helpful answers score highest; tangential information scores lower; unhelpful refusals score lowest.

</div>

---

# ChatGPT's impact

<div class="note-box" data-title="The fastest-growing consumer application in history">

- Launched **November 30, 2022**
- **1 million users** in 5 days
- **100 million users** in 2 months
- Brought LLMs into mainstream public consciousness

</div>

<div class="tip-box" data-title="Questions to consider">

ChatGPT's architecture (GPT-3.5 + RLHF) was not dramatically different from what researchers had been building. Why did *this particular release* capture public attention so completely? What role did the conversational interface play vs. the underlying capabilities?

</div>

---

# The modern LLM landscape

<div class="note-box" data-title="Key milestones after GPT-3 (2020--2025)">

| Year | Milestone |
|------|-----------|
| 2022 | ChatGPT launched (OpenAI) |
| 2023 | GPT-4 -- multimodal, improved reasoning |
| 2023 | Llama 2 -- open weights from Meta (70B) |
| 2023 | Claude 2 (Anthropic), Gemini (Google) |
| 2024 | Claude 3.5, GPT-4o, Llama 3, Mistral Large |
| 2024--25 | Smaller efficient models (Phi, Qwen, Gemma) |

</div>

<div class="note-box" data-title="Five key trends">

1. **Multimodal** capabilities (text + vision + audio)
2. **Longer context windows** (100K+ tokens)
3. **Better reasoning** (chain-of-thought, tool use)
4. **Open-source alternatives** approaching closed-model quality
5. **Efficiency gains** -- smaller models matching larger predecessors

</div>

---

# Open vs. closed models

<div class="note-box" data-title="The ongoing debate">

| Dimension | Closed (GPT-4, Claude) | Open (Llama, Mistral) |
|-----------|----------------------|---------------------|
| Safety control | Centralized moderation | Community-dependent |
| Transparency | Low (proprietary) | High (weights available) |
| Customization | Limited (API only) | Full (fine-tune, modify) |
| Cost model | Per-token API fees | One-time compute cost |
| Cutting-edge performance | Usually ahead | Rapidly closing gap |
| Misuse risk | Lower (gated access) | Higher (unrestricted) |

</div>

<div class="tip-box" data-title="Questions to consider">

Is AI safety better served by keeping models closed (preventing misuse) or open (enabling public scrutiny of flaws)? What lessons can we draw from open-source software?

</div>

---

# Prompting techniques

<div class="note-box" data-title="Practical strategies for getting better outputs">

**Zero-shot with clear instructions**:
```text
Classify the following text as spam or not spam.
Respond with only "spam" or "not spam".
Text: "Congratulations! You've won $1,000,000!"
```

**Few-shot with examples**:
```text
"Meeting at 3pm tomorrow" -> not spam
"URGENT: Send money now!" -> spam
"Can you review this document?" -> not spam
"You've been selected for a prize!" ->
```

</div>

---

# Chain-of-thought prompting

<div class="definition-box" data-title="Wei et al. (2022)">

**Chain-of-thought (CoT)** prompting asks the model to show its reasoning step by step before giving a final answer. This dramatically improves performance on reasoning tasks, especially math and logic problems.

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

Simply adding **"Let's think step by step"** can improve accuracy on math word problems from ~18% to ~79% (Kojima et al., 2022).

</div>

---

# Current limitations of LLMs

<div class="warning-box" data-title="What LLMs still struggle with">

- **Hallucinations**: Confidently generate false statements with no awareness of uncertainty
- **Reasoning depth**: Multi-step logic and mathematical proofs remain unreliable
- **Knowledge currency**: Training data has a cutoff date; no access to real-time information
- **Consistency**: May give different answers to the same question across runs
- **Prompt sensitivity**: Small wording changes can dramatically alter outputs

</div>

<div class="note-box" data-title="Active areas of research">

Each limitation has spawned research directions: RAG for knowledge currency (Lecture 17), tool use for grounding (Lecture 24), constitutional AI for alignment, and formal verification for reasoning reliability.

</div>

---

# Key takeaways

<div class="important-box" data-title="Core concepts from this lecture">

1. **GPT-2** showed that scale enables zero-shot task transfer without fine-tuning
2. **GPT-3** (175B) demonstrated few-shot in-context learning and emergent abilities
3. **Scaling laws** predict smooth power-law improvement with more parameters, data, and compute
4. **Chinchilla scaling** showed models should be trained longer on more data, not just made bigger
5. **RLHF** aligned GPT-3 with human preferences to create ChatGPT
6. **Chain-of-thought prompting** dramatically improves reasoning by eliciting step-by-step thinking

</div>

---

# Further reading

<div class="note-box" data-title="References">

- **Radford et al. (2019)** -- "Language Models are Unsupervised Multitask Learners" (GPT-2) [[PDF]](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)
- **Brown et al. (2020)** -- "Language Models are Few-Shot Learners" (GPT-3) [[arXiv]](https://arxiv.org/abs/2005.14165)
- **Kaplan et al. (2020)** -- "Scaling Laws for Neural Language Models" [[arXiv]](https://arxiv.org/abs/2001.08361)
- **Hoffmann et al. (2022)** -- "Training Compute-Optimal Large Language Models" (Chinchilla) [[arXiv]](https://arxiv.org/abs/2203.15556)
- **Ouyang et al. (2022)** -- "Training language models to follow instructions" (InstructGPT) [[arXiv]](https://arxiv.org/abs/2203.02155)
- **Wei et al. (2022)** -- "Emergent Abilities of Large Language Models" [[arXiv]](https://arxiv.org/abs/2206.07682)

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
