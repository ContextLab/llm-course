---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 20: Language, thought, and other brains
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Explain how language functions as a lossy compression channel for transmitting brain states between minds
2. Evaluate what the convergence between LLMs and brain activity implies about the nature of language
3. Articulate the case that understanding *is* prediction, and critique it
4. Analyze whether LLMs have captured something real about meaning, or merely its statistical shadow
5. Formulate your own position on what language models reveal about the human mind

</div>

---
<!-- _class: scale-80 -->

# Encoders in the real world (recap)

<div class="note-box" data-title="What encoders do at scale">

BERT and its variants power much of modern NLP infrastructure — often invisibly:

| Domain | Application | Architecture |
|--------|-------------|-------------|
| Search | Google processes 8.5B queries/day | BERT → MUM |
| Retrieval | Sentence-BERT: 700K+ downloads/day | Bi-encoder |
| Clinical NLP | ICD coding, adverse event detection | [BioBERT](https://arxiv.org/abs/1901.08746), [PubMedBERT](https://arxiv.org/abs/2007.15779) |
| Legal tech | Contract extraction, compliance | Fine-tuned encoders |
| Moderation | Billions of posts/day screened | Fine-tuned RoBERTa |

</div>

<div class="important-box" data-title="Why not just use GPT-4?">

GPT-4 costs ~$30/M tokens at ~500ms/request. A fine-tuned DistilBERT: ~$0.01/M tokens at ~5ms/request. For high-volume, single-task workloads, encoders are **3,000× cheaper** and **100× faster**.

</div>

---

<div class="tip-box" data-title="From engineering to understanding">

We've spent two lectures on the engineering of encoder models — what they do, how they work, and why they matter in production. But these models also reveal something unexpected about our own minds.

</div>

<div class="note-box" data-title="The rest of today is a discussion">

Today we step back and ask: **what do these models teach us about the nature of language, thought, and the connections between minds?**

The following slides present ideas from neuroscience, cognitive science, and philosophy of mind — each followed by discussion prompts. There are no right answers. The goal is to develop your own informed position.

</div>

---

# Brain-LLM alignment

<div class="note-box" data-title="The Mind's Transformer (Chen & Sivakumar, 2026)">

[**Chen & Sivakumar (2026, *ICLR*)**](https://openreview.net/forum?id=PgIlCCNxdB): First systematic "computational neuroanatomy" of what happens *inside* a transformer block — mapping **13 intermediate states** (from layer norm through attention to FFN) onto fMRI brain activity during language processing. Analyzed 21 LLMs across 5 model families.

</div>

<div class="definition-box" data-title="Intra-block hierarchy mirrors the cortex">

Different computational stages *within a single transformer block* map to anatomically distinct brain systems. Early **attention states** align with sensory cortices, while later **FFN states** correspond to association areas — mirroring the cortical processing hierarchy. Over 90% of brain voxels are better explained by these intermediate computations than by the standard hidden states we typically analyze.

</div>

<div class="example-box" data-title="RoPE validates auditory processing">

Rotary positional embeddings (RoPE) specifically enhance alignment with the brain's auditory processing streams. Per-head queries with RoPE explain **74%** of auditory cortex activity vs. just **8%** without — the first neurobiological validation of a specific transformer architectural component. Their MindTransformer framework achieves alignment gains in auditory cortex exceeding those from **456× model scaling**.

</div>

---

# What language actually does

<div class="definition-box" data-title="Language is lossy neural compression">

Your brain lives in a sealed vault of bone, bathed in fluid that is essentially seawater. It has no direct contact with the outside world. Everything you know about reality is *constructed* by your neural circuits from noisy sensor data — you are, in the most literal sense, a brain floating in a vat.

Language breaks through that isolation. When you speak, you compress the electrical activity across your ~86 billion neurons into a handful of words per second — an extraordinarily lossy channel. The listener's brain decompresses those vibrations into neural activity of its own.

</div>

<div class="note-box" data-title="Stephens, Silbert & Hasson (2010)">

[**Stephens, Silbert & Hasson (2010, *PNAS*)**](https://doi.org/10.1073/pnas.1008662107) "Speaker–listener neural coupling underlies successful communication" — Recorded brain activity from speakers and listeners during natural storytelling.

</div>

<div class="example-box" data-title="Communication literally replicates brain states">

Successful communication **replicated the speaker's brain patterns in the listener's brain**, with the listener's responses temporally coupled to — and sometimes *anticipating* — the speaker's. Language doesn't just convey ideas: it programs one brain to enter the same state as another.

</div>

---
<!-- _class: scale-80 -->

# Language transfers memories between brains

<div class="definition-box" data-title="Language reconstructs experience">

When person A watches a movie and then *tells* person B the story, person B's brain activity during listening resembles person A's brain activity during *watching* — not during speaking. Language doesn't just transmit verbal patterns. It reconstructs the speaker's **perceptual experience** in the listener's brain. You don't just hear a story — your brain *relives* it.

</div>

<div class="example-box" data-title="Modality doesn't matter">

The brain constructs the same **amodal narrative representation** whether the story is read, heard, or watched as a movie. Language isn't special because of sound or letters — it programs a specific neural state regardless of input channel.

</div>

<div class="note-box" data-title="References">

[**Zadbood et al. (2017, *Cerebral Cortex*)**](https://doi.org/10.1093/cercor/bhw351): "How we transmit memories to other brains" — Narrative reconstructs the speaker's perceptual experience in the listener. [**Regev, Honey & Hasson (2013, *J. Neurosci.*)**](https://doi.org/10.1523/JNEUROSCI.1580-13.2013): Neural patterns are modality-independent.

</div>

<div class="tip-box" data-title="Discussion">

If language reconstructs the speaker's perceptual experience in the listener's brain, is there a meaningful difference between "experiencing something" and "hearing a vivid enough description of it"? Where does the line fall?

</div>

---
# LLMs speak the brain's language

<div class="definition-box" data-title="LLM embeddings bridge two brains">

LLM embedding spaces provide a **shared numerical coordinate system** for tracking speaker–listener neural alignment during conversation. The degree to which both brains converge in LLM-space predicts communication success. The model didn't evolve to do this — it learned it from text alone.

</div>

<div class="note-box" data-title="Zada et al. (2024)">

[**Zada et al. (2024, *Neuron*)**](https://doi.org/10.1016/j.neuron.2024.06.025): "A shared model-based linguistic space for transmitting our thoughts from brain to brain" — Demonstrated that LLM embeddings can track real-time speaker–listener neural coupling during natural conversation.

</div>

<div class="tip-box" data-title="Discussion">

A model trained on text alone — with no ears, no body, no social experience — learns representations that track *both* brains during real human conversation. What does this tell us about what information is actually *in* language?

</div>

---

<!-- _class: scale-80 -->

# Understanding is prediction

<div class="definition-box" data-title="Better prediction = better brain alignment">

Across dozens of language models, the single best predictor of how well a model matches human brain activity is its **next-word prediction accuracy**. Models that are better at predicting what comes next are better at predicting the brain. The brain's core language mechanism appears to be a prediction engine.

</div>

<div class="definition-box" data-title="The brain as a prediction machine">

The "predictive processing" framework proposes that the brain fundamentally **generates expectations** about incoming input and updates based on prediction errors. BERT's masked language modeling — predicting missing words from context — is a concrete implementation of exactly this principle.

</div>

<div class="note-box" data-title="References">

[**Schrimpf et al. (2021, *PNAS*)**](https://doi.org/10.1073/pnas.2105646118): "The neural architecture of language" — Next-word prediction accuracy is the best predictor of brain alignment across dozens of models. [**Clark (2013, *BBS*)**](https://doi.org/10.1017/S0140525X12000477): "Whatever next?" — Foundational framework for understanding brains as prediction machines.

</div>

<div class="tip-box" data-title="Discussion">

If the brain's language system is fundamentally a prediction engine, and LLMs are trained on prediction, is their convergence surprising — or inevitable? Does training on prediction *guarantee* learning something about meaning?

</div>

---

<!-- _class: scale-80 -->

# Language modeling is compression

<div class="definition-box" data-title="Prediction and compression are equivalent">

Language modeling and data compression are **mathematically equivalent** — a model that predicts the next token well can compress text efficiently, and vice versa. Better language models are literally better compressors. This isn't metaphor: Shannon's source coding theorem proves it.

</div>

<div class="example-box" data-title="Language itself is a compression protocol">

Languages across the world are structured to **minimize effort** while **maximizing robustness to noise** — exactly the engineering goals of a good compression codec. Frequent words are short. Ambiguity is tolerated where context resolves it. Redundancy is added where errors are costly.

</div>

<div class="note-box" data-title="References">

[**Delétang et al. (2024, *ICLR*)**](https://arxiv.org/abs/2309.10668): "Language modeling is compression" — Formal proof that prediction and compression are mathematically equivalent. [**Gibson et al. (2019, *TiCS*)**](https://doi.org/10.1016/j.tics.2019.02.003): "How efficiency shapes human language" — Cross-linguistic evidence that languages optimize for compression.

</div>

<div class="tip-box" data-title="Discussion">

If language is a compression protocol and LLMs are compression algorithms, then BERT's "understanding" of language is literally decompression. Does that make it *genuine* understanding, or is something still missing?

</div>

---
<!-- _class: scale-75 -->

# Does prediction equal understanding?

<div class="definition-box" data-title="Compression IS understanding">

The traditional objection — "LLMs are just doing statistics, not real understanding" — collapses if understanding *is* predictive compression. A system that compresses language well must capture its structure, context dependencies, and meaning relations. The compression IS the understanding. There is no magical extra ingredient.

</div>

<div class="important-box" data-title="The opposing view: language ≠ thought">

The brain's language network is **anatomically and functionally distinct** from reasoning and problem-solving circuits. People with severe language impairments can still reason, plan, and do math. Language is a *communication module* — an interface for transmitting thoughts, not the medium of thought itself. If so, LLMs may have automated the *transmission* without touching the *thinking*.

</div>

<div class="note-box" data-title="References">

[**Queloz & Beckmann (2025, *PhilArchive*)**](https://philarchive.org/rec/QUEWWC-2): "What was ChatGPT's training really about?" — Predictive compression constitutes genuine understanding. [**Fedorenko et al. (2024, *Nature*)**](https://doi.org/10.1038/s41586-024-07522-w): "Language is primarily a tool for communication rather than thought" — Language and thought are neurally separable.

</div>

<div class="tip-box" data-title="Discussion">

Queloz & Beckmann say compression IS understanding. Fedorenko et al. say language is separate from thought. Can both be right? Could LLMs genuinely "understand" language while having no capacity for thought?

</div>

---
<!-- _class: scale-75 -->

# What LLMs have inside

<div class="definition-box" data-title="Structured concept maps, not just statistics">

Mechanistic interpretability research revealed that LLMs contain **monosemantic features** — individual internal components that respond to specific, interpretable concepts (e.g., "Golden Gate Bridge," "code bugs," "deceptive reasoning"). These aren't statistical ghosts. They are structured, hierarchical concept maps that the model builds from text alone.

</div>

<div class="important-box" data-title="The grounding problem persists">

No matter how rich the internal representations, LLMs lack **world models** — they have never seen, touched, or navigated anything. Their concept of "hot" comes from patterns in text about heat, not from the experience of burning. Are monosemantic features genuine concepts, or high-fidelity maps of *other people's* concepts?

</div>

<div class="note-box" data-title="References">

[**Anthropic (2024, *Transformer Circuits*)**](https://transformer-circuits.pub/2024/scaling-monosemanticity/): "Scaling monosemanticity" — Millions of interpretable features inside Claude, organized in hierarchical concept maps. [**LeCun (2022, *OpenReview*)**](https://openreview.net/forum?id=BZ5a1r-kVsf): "A path towards autonomous machine intelligence" — LLMs fundamentally lack world models.

</div>

<div class="tip-box" data-title="Discussion">

Anthropic shows LLMs build structured concept maps. LeCun argues they lack grounding. Is a map of other people's concepts a form of understanding? Consider: you have never been to Jupiter, but you have a concept of it — also built from other people's descriptions.

</div>

---
<!-- _class: scale-75 -->

# Are LLMs "thinking" or "performing"?

<div class="definition-box" data-title="LLMs as role-play engines">

LLMs are best understood as **"engines for role-play"** — they simulate the behavior of a plausible speaker, drawing on the vast repertoire of speakers in training data. When GPT writes a poem, it's not expressing itself — it's simulating someone who would write that poem. The performance can be indistinguishable from the real thing.

</div>

<div class="example-box" data-title="Attention without awareness">

LLMs have **attention** (the mechanism) but may lack an **attention schema** — an internal model of their own attentional states. Humans don't just attend to things; we are *aware that we are attending*. LLMs process information without modeling the fact that they're processing it. They are "looking" but not "aware of looking."

</div>

<div class="note-box" data-title="References">

[**Shanahan (2024, *CACM*)**](https://doi.org/10.1145/3624724): "Talking about large language models" — LLMs as role-play engines simulating plausible speakers. [**Farrell, Graziano et al. (2025, *arXiv*)**](https://arxiv.org/abs/2411.00983): "Attention schema in LLMs" — LLMs lack an internal model of their own attentional states.

</div>

<div class="tip-box" data-title="Discussion">

When you read a novel and feel sad for a character, are you "really" feeling sadness, or performing a simulation of sadness triggered by text? If it's genuine for you, what would make it not genuine for an LLM?

</div>

---
<!-- _class: scale-90 -->

# The deep questions

<div class="important-box" data-title="Where we've arrived">

We started this unit asking what BERT does. We've now arrived at much deeper territory:

- Language is a lossy compression channel for neural states (Stephens, Zadbood)
- LLMs learn the same code that brains use for this compression (Zada)
- Better prediction = better brain alignment = possibly better "understanding" (Schrimpf, Clark)
- But language and thought are separable in the brain (Fedorenko)
- And LLMs may be performing rather than understanding (Shanahan)

</div>

---

# Two frameworks, one question

<div class="note-box" data-title="Framework A: understanding is compression">

LLMs compress language better than any prior system. Compression requires capturing structure, context, and meaning. Therefore LLMs understand language — not metaphorically, but literally. The "statistics vs. understanding" distinction is incoherent (Queloz & Beckmann, 2025).

</div>

<div class="note-box" data-title="Framework B: language is just the interface">

Language is a communication module, not a medium for thought (Fedorenko et al., 2024). LLMs have mastered the interface without accessing what lies behind it. Their "understanding" is like a phone that perfectly transmits voices but has no idea what a conversation is.

</div>

<div class="tip-box" data-title="Your task">

Which framework you adopt determines your answer to every question on the next slides. Choose one — and be prepared to defend it.

</div>

---
<!-- _class: scale-85 -->

# Discussion

<div class="tip-box" data-title="Part 1: what language reveals about minds">

**1. The lossy channel.** Every thought you've ever communicated has been brutally compressed — most of your neural state is *lost* in translation. Yet communication works. Does this mean the "lost" information was never essential? Or do we just tolerate massive information loss because we have no alternative?

**2. The alignment puzzle.** A model trained only on text, with no sensory experience, learns representations that track real-time human brain activity during conversation (Zada et al., 2024). How is this possible? What does it imply about how much of cognition is "in" language vs. "beyond" language?

**3. The prediction test.** If understanding is prediction (Queloz & Beckmann), then a system that predicts language perfectly understands it perfectly. Do you accept this? If not, what *additional* capacity is needed — and can you define it without circular reasoning?

</div>

---
<!-- _class: scale-85 -->

# Discussion (continued)

<div class="tip-box" data-title="Part 2: what brains reveal about LLMs">

**4. The separation problem.** Language and thought are served by *different neural circuits* in the brain (Fedorenko et al., 2024). LLMs have only ever been trained on language. If language ≠ thought, what exactly have LLMs learned? Is it possible to master communication without any capacity for reasoning?

**5. The experience question.** Zadbood et al. (2017) showed that language reconstructs the speaker's *perceptual experience* in the listener. LLMs have no perceptual experiences to reconstruct. When an LLM generates vivid text about a sunset, is it transmitting a "neural state" it never had, or constructing a plausible description from statistical patterns? Is there a difference?

**6. Your framework.** State your position: are LLMs (a) genuinely understanding language, (b) performing an extremely convincing simulation of understanding, or (c) doing something we don't yet have the right words for? Defend your answer using at least two findings from today's lecture.

</div>

---
<!-- _class: scale-75 -->

# Further reading

<div class="note-box" data-title="Further reading">

[**Stephens, Silbert & Hasson (2010, *PNAS*)**](https://doi.org/10.1073/pnas.1008662107) "Speaker–listener neural coupling underlies successful communication" — Language replicates neural states across brains.

[**Zadbood et al. (2017, *Cerebral Cortex*)**](https://doi.org/10.1093/cercor/bhw351) "How we transmit memories to other brains" — Narrative reconstructs perceptual experience in the listener.

[**Zada et al. (2024, *Neuron*)**](https://doi.org/10.1016/j.neuron.2024.06.025) "A shared model-based linguistic space for transmitting our thoughts from brain to brain" — LLM embeddings bridge speaker and listener brains.

[**Schrimpf et al. (2021, *PNAS*)**](https://doi.org/10.1073/pnas.2105646118) "The neural architecture of language" — Next-word prediction is the best predictor of brain alignment.

[**Clark (2013, *BBS*)**](https://doi.org/10.1017/S0140525X12000477) "Whatever next? Predictive brains, situated agents, and the future of cognitive science" — The brain as a prediction machine.

[**Delétang et al. (2024, *ICLR*)**](https://arxiv.org/abs/2309.10668) "Language modeling is compression" — Formal proof that prediction and compression are equivalent.

[**Gibson et al. (2019, *TiCS*)**](https://doi.org/10.1016/j.tics.2019.02.003) "How efficiency shapes human language" — Languages optimize for compression and noise robustness.

[**Queloz & Beckmann (2025, *PhilArchive*)**](https://philarchive.org/rec/QUEWWC-2) "What was ChatGPT's training really about?" — Understanding IS predictive compression.

[**Fedorenko et al. (2024, *Nature*)**](https://doi.org/10.1038/s41586-024-07522-w) "Language is primarily a tool for communication rather than thought" — Language and thought are neurally separable.

[**Shanahan (2024, *CACM*)**](https://doi.org/10.1145/3624724) "Talking about large language models" — LLMs as role-play engines.

[**Anthropic (2024)**](https://transformer-circuits.pub/2024/scaling-monosemanticity/) "Scaling monosemanticity" — LLMs build structured, interpretable concept maps.

[**Chen & Sivakumar (2026, *ICLR*)**](https://openreview.net/forum?id=PgIlCCNxdB) "The Mind's Transformer" — Intra-block computational neuroanatomy of LLM-brain alignment.

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

Week 7: Diffusion models — from denoising to text-to-image generation

</div>
