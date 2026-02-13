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

From engineering to understanding

<div class="tip-box" data-title="From earlier this week...">

We spent the last two lectures on the engineering of encoder models — what they do, how they work, and why they matter in production. But these models also reveal something unexpected about our own minds.

</div>

<div class="note-box" data-title="The rest of today is a discussion">

Today we step back and ask: **what do these models teach us about the nature of language, thought, and the connections between minds?**

The following slides present ideas from neuroscience, cognitive science, and philosophy of mind — each followed by discussion prompts. There are no right answers. The goal is to develop your own informed position.

</div>

---

# What language actually does

<div class="definition-box" data-title="Language as lossy neural compression">

Your brain lives in a sealed vault of bone, bathed in fluid that is essentially seawater. It has no direct contact with the outside world. Everything you know about reality is *constructed* by your neural circuits from noisy sensor data — you are, in the most literal sense, a brain floating in a vat.

</div>

<div class="definition-box" data-title="Language as a bridge">

Language breaks through that isolation. When you speak, you compress the electrical activity across your ~86 billion neurons into a handful of words per second — an extraordinarily lossy channel. The listener's brain decompresses those vibrations into neural activity of its own.

</div>

<div class="example-box" data-title="Communication literally replicates brain states">

Stephens et al (2010) found that successful communication **replicated the speaker's brain patterns in the listener's brain**, with the listener's responses temporally coupled to — and sometimes *anticipating* — the speaker's. Language doesn't just convey ideas: *it programs one brain to enter the same state as another*.

</div>

<div class="note-box" data-title="Further reading">

[**Stephens, Silbert, & Hasson (2010, *PNAS*)**](https://doi.org/10.1073/pnas.1008662107) "Speaker–listener neural coupling underlies successful communication" — Recorded brain activity from speakers and listeners during natural storytelling.

</div>

---
<!-- _class: scale-65 -->

# Language transfers memories between brains

<div class="definition-box" data-title="Language reconstructs experience">

When person A watches a movie and then *tells* person B the story, person B's brain activity during listening resembles person A's brain activity during *watching* — not during speaking. Language doesn't just transmit verbal patterns. It reconstructs the speaker's **perceptual experience** in the listener's brain. You don't just hear a story — your brain *relives* it.

</div>

<div class="example-box" data-title="Modality doesn't matter">

The brain constructs the same **amodal narrative representation** whether the story is read, heard, or watched as a movie. Language isn't special because of sound or letters — it programs a specific neural state regardless of input channel.

</div>

<div class="note-box" data-title="Further reading">

[**Zadbood et al. (2017, *Cerebral Cortex*)**](https://academic.oup.com/cercor/article/27/10/4988/4080827): "How we transmit memories to other brains" — Narrative reconstructs the speaker's perceptual experience in the listener.

[**Regev, Honey, & Hasson (2013, *J. Neurosci.*)**](https://doi.org/10.1523/JNEUROSCI.1580-13.2013): "Selective and invariant neural responses to spoken and written narratives" — The same brain regions respond to stories regardless of modality.

</div>

<div class="tip-box" data-title="Discussion">

If language reconstructs the speaker's perceptual experience in the listener's brain, is there a meaningful difference between "experiencing something" and "hearing a vivid enough description of it"? Where does the line fall? (Note: "hearing" could also mean "reading" or "watching" — the specific input channel isn't the point here.)

When we communicate with other people, we're transmitting *our own* neural states. When LLMs generate text, whose neural states are they transmitting — if any?

</div>

---
<!-- _class: scale-70 -->

# LLMs speak the brain's language

<div class="definition-box" data-title="LLM embeddings bridge two brains">

Text embedding spaces provide a **shared numerical coordinate system** for tracking speaker–listener neural alignment during conversation. The degree to which both brains converge in LLM-space predicts communication success. LLMs didn't evolve to do this — they learn solely from text.

</div>

<div class="note-box" data-title="Further reading">

[**Zada et al. (2024, *Neuron*)**](https://doi.org/10.1016/j.neuron.2024.06.025): "A shared model-based linguistic space for transmitting our thoughts from brain to brain" — Demonstrated that LLM embeddings can track real-time speaker–listener neural coupling during natural conversation.

[**Heusser et al. (2021, *Nature Human Behaviour*)**](https://rdcu.be/cpMwZ): "Geometric models reveal behavioral and neural signatures of transforming naturalistic experiences into episodic memories" — Brain activity during movie watching predicts how you *recount* it later.

[**Fitzpatrick et al. (2026, *Nature Communications*)**](https://doi.org/10.31234/osf.io/dh3q2_v2): "Text embedding models yield high-resolution insights into conceptual knowledge from short multiple-choice quizzes" — Text embeddings can be used to accurately model (an approximation of) *everything* you know!

[**Manning & Kahana (2012, *Memory*)**](http://caligari.dartmouth.edu/~jmanning/pubs/MannKaha12.pdf): "Interpreting semantic clustering effects in free recall" — When we use the "wrong" embedding model to model our thoughts and memories, how misleading is it?

</div>

<div class="tip-box" data-title="Discussion">

Think about all *possible* concepts that "text" could express. LLMs cannot possibly learn this infinite space. Rather, they learn a **much** lower-dimensional subspace that captures something akin to "the concepts that are expressed in most text *in practice*." What are the implications of this idea? Does it speak to limitations of humans? Of language? Of text as a medium for thought and/or communication?

</div>

---

<!-- _class: scale-70 -->

# Understanding is prediction

<div class="definition-box" data-title="Better prediction = better brain alignment">

Across dozens of language models, the single best predictor of how well a model matches human brain activity is its **next-word prediction accuracy**. Models that are better at predicting what comes next are better at predicting the brain. The brain's core language mechanism appears to be a prediction engine.

</div>

<div class="definition-box" data-title="The brain as a prediction machine">

The "predictive processing" framework proposes that the brain fundamentally **generates expectations** about incoming input and updates based on prediction errors. GPT's next token prediction and BERT's masked language modeling — predicting missing words from context — are concrete implementations of exactly this principle.

</div>

<div class="note-box" data-title="References">

[**Schrimpf et al. (2021, *PNAS*)**](https://doi.org/10.1073/pnas.2105646118): "The neural architecture of language" — Next-word prediction accuracy is the best predictor of brain alignment across dozens of models.

[**Clark (2013, *BBS*)**](https://doi.org/10.1017/S0140525X12000477): "Whatever next?" — Foundational framework for understanding brains as prediction machines.

</div>

<div class="tip-box" data-title="Discussion">

*Why* might the brain have evolved to be a prediction machine? What are the advantages of prediction as a core computational principle? What are the limitations? And what does it tell us that prediction can be used to train language models really well?

</div>

---

<!-- _class: scale-75 -->

# Language modeling is compression

<div class="definition-box" data-title="Prediction and compression are equivalent">

Language modeling and data compression are **mathematically equivalent** — a model that predicts the next token well can compress text efficiently, and vice versa. Better language models are literally better compressors. This isn't metaphor: [Shannon's source coding theorem](https://en.wikipedia.org/wiki/Shannon%27s_source_coding_theorem) proves it.

</div>

<div class="example-box" data-title="Language itself is a compression protocol">

Languages across the world are structured to **minimize effort** while **maximizing robustness to noise** — exactly the engineering goals of a good compression codec. Frequent words are short. Ambiguity is tolerated where context resolves it. Redundancy is added where errors are costly.

</div>

<div class="note-box" data-title="References">

[**Delétang et al. (2024, *ICLR*)**](https://arxiv.org/abs/2309.10668): "Language modeling is compression" — Formal proof that prediction and compression are mathematically equivalent.

[**Gibson et al. (2019, *TiCS*)**](https://doi.org/10.1016/j.tics.2019.02.003): "How efficiency shapes human language" — Cross-linguistic evidence that languages optimize for compression.

</div>

<div class="tip-box" data-title="Discussion">

If language is a compression protocol and LLMs are compression algorithms, then LLMs' "understanding" of language is literally decompression. What does this mean about the nature of understanding and/or of linguistic communication?

</div>

---
<!-- _class: scale-70 -->

# Does prediction equal understanding?

<div class="definition-box" data-title="Maybe compression IS understanding">

The traditional objection — "LLMs are just doing statistics, not real understanding" — collapses if understanding *is* predictive compression. A system that compresses language well must capture its structure, context dependencies, and meaning relations. Maybe the compression IS the understanding, and there is no magical extra ingredient!

</div>

<div class="important-box" data-title="The opposing view: language ≠ thought">

The brain's language network is **anatomically and functionally distinct** from reasoning and problem-solving circuits. People with severe language impairments can still reason, plan, and do math. Language is a *communication module* — an interface for transmitting thoughts, not the medium of thought itself. If so, LLMs may have automated the *transmission* without touching the *thinking*.

</div>

<div class="note-box" data-title="References">

[**Queloz & Beckmann (2025, *PhilArchive*)**](https://philarchive.org/rec/QUEWWC-2): "What was ChatGPT's training really about?" — Predictive compression constitutes genuine understanding. 

[**Fedorenko et al. (2024, *Nature*)**](https://doi.org/10.1038/s41586-024-07522-w): "Language is primarily a tool for communication rather than thought" — Language and thought are neurally separable.

</div>

<div class="tip-box" data-title="Discussion">

Queloz & Beckmann say compression IS understanding. Fedorenko et al. say language is separate from thought. Can both be right? Could LLMs genuinely "understand" language while having no capacity for thought?

</div>

---
<!-- _class: scale-70 -->

# What LLMs have inside

<div class="definition-box" data-title="Structured concept maps, not just statistics">

Mechanistic interpretability research revealed that LLMs contain **monosemantic features** — individual internal components that respond to specific, interpretable concepts (e.g., "Golden Gate Bridge," "code bugs," "deceptive reasoning"). These aren't statistical ghosts. They are structured, hierarchical concept maps that the model builds from text alone.

</div>

<div class="important-box" data-title="The grounding problem persists">

No matter how rich the internal representations, LLMs lack **world models** — they have never seen, touched, or navigated anything. Their concept of "hot" comes from patterns in text about heat, not from the experience of burning. Are monosemantic features genuine concepts, or high-fidelity maps of *other people's* concepts?

</div>

<div class="note-box" data-title="References">

[**Anthropic (2024, *Transformer Circuits*)**](https://transformer-circuits.pub/2024/scaling-monosemanticity/): "Scaling monosemanticity" — Millions of interpretable features inside Claude, organized in hierarchical concept maps.

[**LeCun (2022, *OpenReview*)**](https://openreview.net/forum?id=BZ5a1r-kVsf): "A path towards autonomous machine intelligence" — LLMs fundamentally lack world models.

</div>

<div class="tip-box" data-title="Discussion">

Anthropic shows LLMs build structured concept maps. LeCun argues they lack grounding. Is a map of other people's concepts a form of understanding? Twist: as the Internet becomes "polluted" with LLM-generated text, how will this affect what LLMs can learn?

</div>

---
<!-- _class: scale-70 -->

# Are LLMs "thinking" or "performing"?

<div class="definition-box" data-title="LLMs as role-play engines">

LLMs are best understood as **"engines for role-play"** — they simulate the behavior of a plausible speaker, drawing on the vast repertoire of speakers in training data. When GPT writes a poem, it's not expressing itself — it's simulating someone who would write that poem. The performance can be indistinguishable from the real thing.

</div>

<div class="example-box" data-title="Attention without awareness">

LLMs have **attention** (the mechanism) but may lack an **attention schema** — an internal model of their own attentional states. Humans don't just attend to things; we are *aware that we are attending*. LLMs process information without modeling the fact that they're processing it. They are "looking" but not "aware of looking."

</div>

<div class="note-box" data-title="References">

[**Shanahan (2024, *CACM*)**](https://doi.org/10.1145/3624724): "Talking about large language models" — LLMs as role-play engines simulating plausible speakers.

[**Farrell, Graziano et al. (2025, *arXiv*)**](https://arxiv.org/abs/2411.00983): "Attention schema in LLMs" — LLMs lack an internal model of their own attentional states.

</div>

<div class="tip-box" data-title="Discussion">

When you read a novel and feel sad for a character, are you "really" feeling sadness, or performing a simulation of sadness triggered by text? If it's genuine for you, what would make it not genuine for an LLM?

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

Week 7: Diffusion models! Also remember **Assignment 4 is due on Monday**!

</div>
