---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 14: Cognitive models of semantic representation
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will">

1. Compare and contrast computational vs. human views of semantic representation
2. Explain the symbol grounding problem and its relevance to large language models
3. Understand the principles of embodied cognition and conceptual metaphors
4. Distinguish between taxonomic similarity and thematic relatedness
5. Evaluate empirical evidence from neuroscience regarding semantic maps in the brain
6. Analyze the "stochastic parrots" debate and the limits of form-based learning

</div>

---

# Today's Lecture 

<div class="note-box" data-title="Outline">

1. **Human vs. Computational Semantics**
2. **Cognitive Theories of Meaning**
3. **Embodied & Grounded Cognition**
4. **Semantic Similarity: What Does It Mean?**
5. **Empirical Evidence from Cognitive Science**
6. **Bridging the Gap: Models Meet Minds**

**Goal:** Understand what computational models are really learning

</div>

---

# The Fundamental Question 

<div class="important-box" data-title='What does "meaning" actually mean?'>

**Computational View:**
- Vectors in high-dimensional space
- Learned from text co-occurrence
- Distributional patterns
- Statistical relationships
- "You shall know a word by the company it keeps"

</div>

<div class="note-box" data-title="Human View">

- Sensory experiences
- Emotional associations
- Physical grounding
- Social context
- Multimodal integration
- Embodied understanding

</div>

*This lecture explores the relationship between computational and cognitive semantics*

---

# How Do Humans Represent Meaning? 

<div class="example-box" data-title='Example: The word "coffee"'>

**What comes to YOUR mind?**
- **Visual:** brown liquid, mug, steam, beans
- **Olfactory:** aroma, roasted smell
- **Gustatory:** bitter taste, smooth texture
- **Tactile:** hot, warm cup, liquid
- **Auditory:** brewing sounds, pouring
- **Motor:** lifting cup, drinking motion
- **Contextual:** morning routine, work, café
- **Emotional:** comfort, alertness, pleasure
- **Social:** conversations, meetings
- **Cultural:** Starbucks, espresso, traditions

</div>

<div class="note-box" data-title="Word2Vec representation">

`coffee = [0.23, -0.45, 0.67, 0.12, -0.89, ...]` (300 numbers learned from text)

**What's missing?**
- No sensory grounding, embodied experience, or emotional content
- No perceptual features or action affordances
- Purely linguistic

</div>

<div class="warning-box" data-title="The Grounding Problem">

Computational models lack the rich, multimodal, embodied understanding that humans have.

</div>

---

# The Symbol Grounding Problem 

<div class="definition-box" data-title="Harnad (1990): Can symbols have intrinsic meaning?">

**The Chinese Room (Searle, 1980):**
Input &rarr; [Rule Book: If see X output Y] &rarr; Output. Correct response! But no understanding of Chinese.

**Analogy to LLMs:**
Input: "Is a penguin a bird?" &rarr; [Pattern: "X is a bird" often follows penguins in text] &rarr; Output: "Yes, a penguin is a bird". Correct! But does it "know" birds?

</div>

<div class="note-box" data-title="Symbol vs. Grounded Systems">

**Symbol Systems:** Symbols refer to other symbols; purely syntactic manipulation; no connection to world.

**Grounded Systems:** Symbols connected to perception. A child learns "dog" by SEEING, PETTING, HEARING, and being LICKED by dogs. The word "dog" is grounded in experience!

</div>

<div class="note-box" data-title="Further reading">

[**Searle (1980, *Behavioral and Brain Sciences*)**](https://doi.org/10.1017/S0140525X0000575X) Minds, Brains, and Programs.

[**Harnad (1990, *Physica D*)**](https://doi.org/10.1016/0167-2789(90)90087-6) The Symbol Grounding Problem.

</div>

---

# Embodied Cognition Theory 

<div class="definition-box" data-title="Meaning arises from bodily experience and sensorimotor interaction">

**Key Principles:**
1. **Embodiment:** Cognition shaped by body
2. **Situatedness:** Meaning context-dependent
3. **Enactivism:** Knowing through doing
4. **Grounding:** Concepts tied to perception/action

</div>

<div class="note-box" data-title="Neuroscience Evidence">

Reading "kick the ball" &rarr; Motor cortex activates (Leg area specifically!)
Reading "pick up the cup" &rarr; Motor cortex activates (Hand area activates)
*Even without moving!*

</div>

<div class="example-box" data-title="Conceptual Metaphors (Lakoff & Johnson)">

Physical &rarr; Abstract mapping:
- "WARM personality" &larr; holding warm drink primes positive judgments!
- "HIGH status" &larr; up = good, down = bad (heads held high)
- "GRASPING an idea" &larr; physical grasping simulated mentally
- "Heavy heart" &larr; weight = emotional burden

**These metaphors are NOT in Word2Vec!** Models learn word patterns, not embodied experience.

</div>

<div class="note-box" data-title="Further reading">

[**Barsalou (2008, *Annual Review of Psychology*)**](https://doi.org/10.1146/annurev.psych.59.103006.093639) Grounded Cognition.

</div>

---

# The Distributional Hypothesis Revisited 

<div class="definition-box" data-title='"You shall know a word by the company it keeps" — J.R. Firth (1957)'>

**Strong version:** Word meaning IS distributional patterns
**Weak version:** Distributional patterns REFLECT meaning

</div>

<div class="tip-box" data-title="Supports">

- Works remarkably well in practice; captures semantic similarity
- Enables analogical reasoning; scales to huge vocabularies
- Unsupervised learning; aligned with usage-based linguistics

</div>

<div class="warning-box" data-title="Limitations">

- Correlation $\neq$ causation; lacks perceptual grounding
- No embodied understanding; missing common sense
- Can't handle novel situations; reflects training data biases

</div>

<div class="warning-box" data-title="Key Question">

Is distributional semantics sufficient for meaning, or just a useful approximation?

</div>

<div class="note-box" data-title="Further reading">

[**Boleda (2020, *Annual Review of Linguistics*)**](https://doi.org/10.1146/annurev-linguistics-011619-030303) Distributional Semantics and Linguistic Theory.

</div>

---

# What Does "Semantic Similarity" Really Mean? 

<div class="definition-box" data-title="Different types of similarity">

**Taxonomic (IS-A):** dog-cat (Both are animals) &rarr; Similarity: HIGH
**Thematic (GOES-WITH):** dog-leash (Co-occur in events) &rarr; Relatedness: HIGH, Similarity: LOW!

</div>

<div class="example-box" data-title="Test Yourself">

Which is more SIMILAR to "coffee"?
A) tea &larr; Same category (beverages)
B) cup &larr; Co-occurs (thematic)

**Answer:** A (tea) is more SIMILAR; B (cup) is more RELATED.

</div>

<div class="warning-box" data-title="What Word2Vec Says">

Word2Vec often gets this wrong!
`model.similarity('coffee', 'cup') # 0.65`
`model.similarity('coffee', 'tea') # 0.62`
Cup ranked higher due to co-occurrence! But tea is categorically more similar.

</div>

<div class="note-box" data-title="SimLex-999 vs WordSim-353">

| Pair | SimLex | WordSim |
|------|--------|---------|
| car-auto | 0.96 | 0.92 |
| car-road | 0.23 | 0.73 |

SimLex measures true SIMILARITY. WordSim measures RELATEDNESS. Models score better on WordSim!

</div>

<div class="note-box" data-title="Further reading">

[**Hill et al. (2015, *Computational Linguistics*)**](https://doi.org/10.1162/COLI_a_00237) SimLex-999: Evaluating Semantic Models with Genuine Similarity Estimation.

</div>

---

# Semantic Projection: Recovering Human Knowledge 

<div class="definition-box" data-title="Grand et al. (2022): Can we extract human-like features from embeddings?">

**The Experiment:**
1. Collect human ratings on perceptual features (edible, heavy, alive, holdable, etc.)
2. Train linear projections from word embeddings
3. Test if embeddings predict human ratings

</div>

<div class="tip-box" data-title="Key Findings">

- Embeddings encode surprisingly rich knowledge
- Can predict perceptual features (even vision and motor properties!)
- Better with larger models

</div>

<div class="note-box" data-title="Interpretation">

Text co-occurrence captures real-world properties through indirect grounding in language. But still not true perceptual grounding.

</div>

<div class="note-box" data-title="Further reading">

[**Grand et al. (2022, *Nature Human Behaviour*)**](https://doi.org/10.1038/s41562-022-01316-x) Semantic projection recovers rich human knowledge of multiple object features from word embeddings.

</div>

---

# Multimodal Models: Bridging the Gap 

<div class="definition-box" data-title="Combining language with perception">

**Vision-Language Models:** CLIP (OpenAI), ALIGN (Google), Flamingo (DeepMind), GPT-4V (OpenAI)

**Key Idea:** Learn joint embedding space where text and images map to same space. Enables cross-modal understanding and grounds language in vision.

</div>

<div class="note-box" data-title="Training">

- Image-caption pairs; Contrastive learning
- Matching images to descriptions
- Large-scale (400M+ pairs)

</div>

<div class="tip-box" data-title="Benefits">

Visual grounding, zero-shot classification, better generalization, more "human-like".

</div>

<div class="note-box" data-title="Further reading">

[**Radford et al. (2021, *ICML*)**](https://arxiv.org/abs/2103.00020) Learning Transferable Visual Models From Natural Language Supervision (CLIP).

</div>

---

# Conceptual Spaces Theory 

<div class="definition-box" data-title="Gärdenfors (2000): Meaning as geometry">

**Key Ideas:**
- Concepts represented in quality dimensions (color, size, temperature, etc.)
- Each dimension has a metric; Concepts are regions in space
- Similarity = geometric proximity

</div>

<div class="example-box" data-title="Example: Colors">

- Hue, saturation, brightness
- Natural categories (red, blue, green) with fuzzy boundaries
- Prototypes at centers

</div>

<div class="note-box" data-title="Relation to Embeddings">

- Similar geometric structure but learned dimensions
- Not interpretable qualities; No grounding in perception

</div>

<div class="note-box" data-title="Further reading">

[**Gärdenfors (2000, *MIT Press*)**](https://mitpress.mit.edu/9780262571753/conceptual-spaces/) Conceptual Spaces: The Geometry of Thought.

</div>

---

# Lexical Semantic Theories 

<div class="note-box" data-title="How do linguists think about word meaning?">

1. **Feature-Based:** Words = bundles of features (e.g., bachelor = [+human, +male, +adult, -married])
2. **Prototype Theory:** Categories have best examples (Robin is prototypical; Penguin is peripheral)
3. **Frame Semantics:** Words evoke conceptual frames (e.g., "Buy" activates commerce frame)
4. **Construction Grammar:** Meaning from form-function pairings; usage-based
5. **Word Sense Disambiguation:** Words have multiple senses (WordNet: Bank$_1$ vs Bank$_2$)

</div>

<div class="warning-box" data-title="Question">

Which theories align with distributional models?
**Answer:** Mostly usage-based views (Construction Grammar, Prototype Theory). Models struggle with feature analysis and frame semantics.

</div>

<div class="note-box" data-title="Further reading">

[**Fillmore (1982, *The Linguistic Society of Korea*)**](https://www.semanticscholar.org/paper/Frame-semantics-Fillmore/649666170f7f2400d05944737762bb922d1199ad) Frame Semantics.

[**Rosch (1975, *Journal of Experimental Psychology: General*)**](https://doi.org/10.1037/0096-3445.104.3.192) Cognitive Representations of Semantic Categories.

</div>

---

# Empirical Evidence from Neuroscience 

<div class="definition-box" data-title="What does the brain tell us about semantic representation?">

**fMRI Studies:** Can predict brain activity from word embeddings. Semantic information is distributed across cortex in different regions for different features (Temporal: objects; Motor: actions; Visual: visual features).

</div>

<div class="tip-box" data-title="Findings">

- Word2Vec correlates with neural patterns, but imperfectly
- Human brain uses multimodal integration (Language areas + sensory areas)

</div>

<div class="note-box" data-title="Brain vs. Model Representations">

| Feature | Brain | Model (BERT) |
|---------|-------|--------------|
| Distributed | Yes | Yes |
| Hierarchical | Yes | Yes |
| Context-sensitive | Yes | Yes |
| Grounded | Yes | No |
| Fast | Yes | Yes |

</div>

<div class="note-box" data-title="Further reading">

[**Mitchell et al. (2008, *Science*)**](https://doi.org/10.1126/science.1152876) Predicting Human Brain Activity Associated with the Meanings of Nouns.

[**Huth et al. (2016, *Nature*)**](https://doi.org/10.1038/nature17637) Natural speech reveals the semantic maps that tile human cerebral cortex.

</div>

---

# The "Stochastic Parrots" Debate 

<div class="warning-box" data-title="Bender et al. (2021): On the Dangers of Stochastic Parrots">

**The Argument:** LLMs learn form, not meaning. They are "stochastic parrots" repeating patterns without understanding of the world or communicative intent. Risk: Mistaking fluency for understanding.

**Evidence:** Fail on simple reasoning; sensitive to phrasing; hallucinate facts; no common sense; brittle to adversarial inputs.

</div>

<div class="tip-box" data-title="Counter-Arguments">

Emergent capabilities at scale; performance on complex tasks; transfer to new domains. Maybe understanding = prediction? Pragmatic success criterion.

</div>

<div class="warning-box" data-title="The Core Question">

**Can meaning arise from form alone?** Or do we need grounding in perception, action, social interaction, and physical embodiment?

</div>

<div class="note-box" data-title="Further reading">

[**Bender & Koller (2020, *ACL*)**](https://aclanthology.org/2020.acl-main.463/) Climbing towards NLU: On Meaning, Form, and Understanding in the Age of Data.

[**Bender et al. (2021, *FAccT*)**](https://doi.org/10.1145/3442188.3445922) On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?

</div>

---

# Common Sense Reasoning 

<div class="warning-box" data-title="What humans know but models don't">

**Physical Intuition Failures:**
Q: "Can you fit an elephant in a refrigerator?"
GPT-3: "Yes, if you open the door wide enough..."

**Winograd Schema (reasoning):**
"The trophy doesn't fit in the brown suitcase because it is too [small/large]."
What does "it" refer to? "small" &rarr; suitcase; "large" &rarr; trophy. Requires world knowledge!

</div>

<div class="warning-box" data-title="Social Intuition Failures">

Q: "John told Mary he loved her. How did Mary feel?"
Depends on context: First date? (Surprised/happy); After argument? (Relieved); Unwanted? (Uncomfortable). Models miss social nuance!

</div>

<div class="note-box" data-title="Why Models Struggle">

Physical/social knowledge is rarely stated; assumed as background knowledge. Requires embodied experience and causal reasoning.

</div>

---

# Compositionality: Phrases and Sentences 

<div class="warning-box" data-title="How do we combine word meanings?">

**The Problem:** Vector math doesn't work! `vec("hot") + vec("dog") ≠ vec("hot dog")`.
"hot dog" = food item; "hot" + "dog" = warm canine.
Same issue: `vec("red") + vec("herring") ≠ vec("red herring")` (distraction, not a fish!).

**Non-compositional Phrases:** Kick the bucket (= die); Spill the beans (= reveal secret); Break a leg (= good luck).

</div>

<div class="note-box" data-title="What Transformers Learn">

Input: "break a leg" &rarr; Attention sees this phrase often in "good luck" contexts &rarr; Output: idiomatic meaning. But fails on novel combinations!

**The Negation Problem:** BERT struggles with negation. "The movie was good" vs "The movie was not good" embeddings are very similar (~0.85 cosine sim), but "not" should flip the meaning.

</div>

---

# Grand Discussion 

<div class="important-box" data-title="Do large language models 'understand' language?">

**Arguments FOR:**
- Solve complex tasks; Generalize to new domains; Emergent capabilities
- Capture linguistic structure; Pragmatic criterion: if it works...
- Maybe understanding = prediction; Human understanding also imperfect

*"The question is not whether machines think, but whether they behave intelligently" — Turing*

</div>

<div class="warning-box" data-title="Arguments AGAINST">

- No grounding in reality; No embodied experience; No intentionality
- Brittle, exploit shortcuts; Hallucinate confidently; No causal reasoning
- Missing common sense; Form without meaning

*"Understanding requires grounding in perception and action" — Embodied cognition*

</div>

<div class="warning-box" data-title="Perhaps the wrong question?">

Instead of "Do they understand?", ask: What do they represent? How does it differ from humans? What are the limits?

</div>

---

# Summary 

<div class="note-box" data-title="What we learned today">

1. **Symbol Grounding:** Computational models lack perceptual grounding
2. **Embodied Cognition:** Human meaning tied to bodily experience
3. **Distributional Semantics:** Powerful but incomplete theory
4. **Semantic Similarity:** Multiple types, models capture some
5. **Empirical Evidence:** Models align with neural patterns but miss multimodality
6. **Common Sense:** Models struggle with physical and social reasoning
7. **Compositionality:** Non-literal language remains challenging

**The gap between computation and cognition remains, but we're making progress!**

</div>

---

# Questions?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a> me</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label">Join our <a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label">Come to <a href="https://context-lab.youcanbook.me">office hours</a></span>
  </div>
</div>

**Coming up:** Attention mechanisms and the transformer revolution!
