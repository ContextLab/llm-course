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
2. Apply the symbol grounding problem to evaluate large language models
3. Understand embodied cognition and conceptual metaphors
4. Distinguish between taxonomic similarity and thematic relatedness
5. Interpret neuroscience evidence on semantic maps in the brain (Mitchell, Huth)
6. Critically evaluate whether LLMs truly "understand" language

</div>

---

# Today's Lecture 

<div class="note-box" data-title="Outline">

1. **Human vs. Computational Semantics**
2. **The Symbol Grounding Problem**
3. **Embodied & Grounded Cognition**
4. **Semantic Similarity: Taxonomic vs. Thematic**
5. **Neural Evidence: Mapping Meaning in the Brain**
6. **The Understanding Debate**

**Goal:** Understand what computational models are really learning—and what they're missing

</div>

---

# The Fundamental Question 

<div class="important-box" data-title='What does "meaning" actually mean?'>

**Computational View:**
- Vectors in high-dimensional space
- Learned from text co-occurrence
- Distributional patterns
- Statistical relationships

</div>

<div class="note-box" data-title="Human View">

- Sensory experiences
- Emotional associations
- Physical grounding
- Social context
- Multimodal integration
- Embodied understanding

</div>

*This lecture explores the gap between these perspectives*

---

# How Do Humans Represent Meaning? 

<div class="example-box" data-title='Example: The word "coffee"'>

**What comes to YOUR mind?**
- **Visual:** brown liquid, mug, steam, beans
- **Olfactory:** aroma, roasted smell
- **Gustatory:** bitter taste, smooth texture
- **Tactile:** hot, warm cup, liquid
- **Motor:** lifting cup, drinking motion
- **Emotional:** comfort, alertness, pleasure
- **Social:** conversations, meetings, cafés

</div>

<div class="note-box" data-title="Word2Vec representation">

`coffee = [0.23, -0.45, 0.67, 0.12, -0.89, ...]` (300 numbers learned from text)

**What's missing?** No sensory grounding, no embodied experience, no emotional content—purely linguistic.

</div>

---

# 💭 Discussion: Your Mental Lexicon

<div class="important-box" data-title="Think-Pair-Share (3 min)">

**Think:** Pick a word with strong personal meaning (a food, place, or activity).

**Pair:** Describe to a partner what aspects of that word's meaning would be IMPOSSIBLE to learn from text alone.

**Share:** What patterns emerged?

</div>

<div class="warning-box" data-title="Key Insight">

The richness of human meaning comes from lived experience. What does this imply for AI systems trained only on text?

</div>

---

# The Symbol Grounding Problem 

<div class="tip-box" data-title="Recall from Lecture 1">

We introduced Searle's Chinese Room argument: producing correct outputs doesn't imply understanding. See [Lecture 1](../week1/lecture1.html) for the full thought experiment.

</div>

<div class="definition-box" data-title="Applying to LLMs (Harnad, 1990)">

**Analogy:**
Input: "Is a penguin a bird?" → [Pattern: "X is a bird" often follows penguins in text] → Output: "Yes, a penguin is a bird"

Correct! But does it "know" what birds ARE? This is the **symbol grounding problem**.

</div>

<div class="note-box" data-title="Symbol vs. Grounded Systems">

**Symbol Systems:** Symbols refer to other symbols; purely syntactic; no connection to world.

**Grounded Systems:** Symbols connected to perception. A child learns "dog" by SEEING, PETTING, HEARING dogs. The word is grounded in experience!

</div>

<div class="note-box" data-title="Further reading">

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

Reading "kick the ball" → Motor cortex activates (Leg area specifically!)
Reading "pick up the cup" → Motor cortex activates (Hand area!)
*Even without moving!*

</div>

<div class="example-box" data-title="Conceptual Metaphors (Lakoff & Johnson)">

Physical → Abstract mapping:
- "WARM personality" ← holding warm drink primes positive judgments!
- "HIGH status" ← up = good, down = bad
- "GRASPING an idea" ← physical grasping simulated mentally

**These metaphors are NOT in Word2Vec!** Models learn patterns, not embodied experience.

</div>

<div class="note-box" data-title="Further reading">

[**Barsalou (2008, *Annual Review of Psychology*)**](https://doi.org/10.1146/annurev.psych.59.103006.093639) Grounded Cognition.

</div>

---

# The Distributional Hypothesis: A Cognitive Critique 

<div class="tip-box" data-title="Recall from Lectures 10-11">

We explored the distributional hypothesis ("You shall know a word by the company it keeps") and how Word2Vec operationalizes it. See [Lecture 10](../week3/lecture10.html) for LSA/LDA and [Lecture 11](lecture11.html) for Word2Vec.

</div>

<div class="important-box" data-title="The Cognitive Question">

**Strong version:** Word meaning IS distributional patterns
**Weak version:** Distributional patterns REFLECT meaning

Now that we've built these systems, we can ask: Is statistical co-occurrence *sufficient* for meaning?

</div>

<div class="warning-box" data-title="What's Missing?">

Even the best distributional models lack:
- **Perceptual grounding** in sensory experience
- **Embodied understanding** through physical interaction
- **Causal reasoning** about how the world works

This is the core tension between computational and cognitive approaches.

</div>

---

# What Does "Semantic Similarity" Really Mean? 

<div class="definition-box" data-title="Different types of similarity">

**Taxonomic (IS-A):** dog-cat (Both are animals) → Similarity: HIGH
**Thematic (GOES-WITH):** dog-leash (Co-occur in events) → Relatedness: HIGH, Similarity: LOW!

</div>

<div class="example-box" data-title="Test Yourself">

Which is more SIMILAR to "coffee"?
A) tea ← Same category (beverages)
B) cup ← Co-occurs (thematic)

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

Text co-occurrence captures real-world properties through *indirect* grounding in language. But still not true perceptual grounding.

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
5. **Word Sense Disambiguation:** Words have multiple senses (WordNet: Bank₁ vs Bank₂)

</div>

<div class="warning-box" data-title="Question">

Which theories align with distributional models?
**Answer:** Mostly usage-based views (Construction Grammar, Prototype Theory). Models struggle with feature analysis and frame semantics.

</div>

<div class="note-box" data-title="Further reading">

[**Fillmore (1982)**](https://www.semanticscholar.org/paper/Frame-semantics-Fillmore/649666170f7f2400d05944737762bb922d1199ad) Frame Semantics.

[**Rosch (1975, *J Exp Psych: General*)**](https://doi.org/10.1037/0096-3445.104.3.192) Cognitive Representations of Semantic Categories.

</div>

---

# Neural Evidence: Predicting Brain Activity from Words

<div class="definition-box" data-title="Mitchell et al. (2008, Science): A landmark study">

**The Question:** Can we predict what the brain does when you think about a word?

**The Approach:**
1. Measure brain activity (fMRI) while people view 60 concrete nouns
2. Characterize words by co-occurrence with 25 sensory-motor verbs (eat, push, see, hear, smell...)
3. Train model to predict brain patterns from verb co-occurrence features
4. Test: Given two NEW words, which brain pattern goes with which?

</div>

<div class="tip-box" data-title="Key Result">

**~77% accuracy** on leave-two-out classification—far above chance (50%)!

The model could predict brain activity for words it had never seen during training.

</div>

---

# Mitchell et al. (2008): Implications

![bg right:40% fit](figures/mitchel_etal_2008.jpeg)

<div class="important-box" data-title="What This Means">

1. **Semantic representation is distributed** across cortex
2. **Sensory-motor features** predict neural patterns
3. **Text statistics** capture something real about brain organization
4. First demonstration that computational models and brains share structure

</div>

<div class="warning-box" data-title="Limitations">

- Only 25 hand-picked features—is this true distributional semantics?
- Works best for concrete, imageable nouns
- What about abstract concepts?

</div>

<div class="note-box" data-title="Further reading">

[**Mitchell et al. (2008, *Science*)**](https://doi.org/10.1126/science.1152876) Predicting Human Brain Activity Associated with the Meanings of Nouns.

</div>

---

# Neural Evidence: Semantic Maps Across the Brain

<div class="definition-box" data-title="Huth et al. (2016, Nature): The semantic atlas">

**The Challenge:** Map ALL of semantic space, not just 60 words

**The Approach:**
1. Participants listened to hours of natural stories in fMRI
2. Built encoding model: predict brain activity from word embeddings
3. Test which semantic categories activate which brain regions

</div>

<div class="tip-box" data-title="Key Findings">

- Semantic information is represented **throughout** cerebral cortex
- ~200 distinct semantic areas, each encoding different categories
- Organization is **remarkably consistent** across individuals
- **Both hemispheres** represent semantic information (not just left!)

</div>

---

# Huth et al. (2016): The Semantic Atlas

![bg right:45% fit](figures/huth_et_al_2016.webp)

<div class="note-box" data-title="What you're seeing">

Each color = different semantic category. The brain is tiled with ~200 distinct semantic areas!

Categories include: people, places, numbers, social concepts, visual properties, actions...

</div>

<div class="important-box" data-title="Takeaway">

Meaning isn't localized to "language areas"—it's **distributed across the entire cortex** in an organized, predictable way.

Computational models can predict this organization, suggesting shared representational principles.

</div>

<div class="note-box" data-title="Further reading">

[**Huth et al. (2016, *Nature*)**](https://doi.org/10.1038/nature17637) Natural speech reveals the semantic maps that tile human cerebral cortex.

</div>

---

# 💭 Discussion: Brains and Models

<div class="important-box" data-title="Group Discussion (5 min)">

**Given the Mitchell and Huth findings:**

1. What does it mean that text statistics can predict brain activity? Does this validate or challenge embodied cognition?

2. If we made a "perfect" model that predicts ALL brain activity from text—would that model "understand" language?

3. **Correlation ≠ Causation:** Models and brains may arrive at similar representations through completely different processes. How could we test this?

</div>

---

# The "Stochastic Parrots" Critique 

<div class="tip-box" data-title="Building on Lecture 12">

In [Lecture 12](lecture12.html), we questioned whether contextual embeddings reflect true understanding. Bender et al. (2021) formalized this critique.

</div>

<div class="warning-box" data-title="Bender et al. (2021): The Core Argument">

LLMs learn **form**, not **meaning**. They are "stochastic parrots"—repeating patterns without understanding the world or communicative intent.

**Risk:** Mistaking fluency for understanding.

</div>

<div class="important-box" data-title="The Fundamental Question">

**Can meaning arise from form alone?** Or do we need grounding in perception, action, and embodiment?

This remains an open question—and shapes how we evaluate what these models actually "know."

</div>

<div class="note-box" data-title="Further reading">

[**Bender et al. (2021, *FAccT*)**](https://doi.org/10.1145/3442188.3445922) On the Dangers of Stochastic Parrots.

</div>

---

# Common Sense Reasoning 

<div class="warning-box" data-title="What humans know but models don't">

**Physical Intuition Failures:**
Q: "Can you fit an elephant in a refrigerator?"
GPT-3: "Yes, if you open the door wide enough..."

**Winograd Schema (reasoning):**
"The trophy doesn't fit in the brown suitcase because it is too [small/large]."
What does "it" refer to? "small" → suitcase; "large" → trophy. Requires world knowledge!

</div>

<div class="warning-box" data-title="Social Intuition Failures">

Q: "John told Mary he loved her. How did Mary feel?"
Depends on context: First date? (Surprised/happy); After argument? (Relieved); Unwanted? (Uncomfortable). Models miss social nuance!

</div>

<div class="note-box" data-title="Why Models Struggle">

Physical/social knowledge is rarely stated; assumed as background. Requires embodied experience and causal reasoning.

</div>

---

# Compositionality: Phrases and Sentences 

<div class="warning-box" data-title="How do we combine word meanings?">

**The Problem:** Vector math doesn't work! `vec("hot") + vec("dog") ≠ vec("hot dog")`.
"hot dog" = food item; "hot" + "dog" = warm canine.

**Non-compositional Phrases:** Kick the bucket (= die); Spill the beans (= reveal secret); Break a leg (= good luck).

</div>

<div class="note-box" data-title="The Negation Puzzle">

BERT shows mixed results with negation:
- **Classification:** Can correctly identify "Not bad!" as positive sentiment ([Lecture 12](lecture12.html))
- **Embeddings:** "The movie was good" and "The movie was not good" have ~0.85 cosine similarity

The model handles negation for some tasks but the underlying representations remain problematically similar.

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

# 💭 Final Discussion: The Future of Meaning

<div class="important-box" data-title="Choose One Question (5 min)">

1. **Grounding:** Will multimodal models (text + vision + audio) solve the grounding problem? Or is embodiment essential?

2. **Understanding:** If a model passes every test but has no sensory experience—does it "understand"?

3. **Practical:** For real applications (chatbots, search), does true understanding matter? When might the difference be critical?

</div>

---

# Summary 

<div class="note-box" data-title="What we learned today">

1. **Symbol Grounding:** Revisited the Chinese Room—computational models lack perceptual grounding
2. **Embodied Cognition:** Human meaning is tied to bodily experience and conceptual metaphors
3. **Distributional Semantics:** Powerful but incomplete—captures patterns, not experience
4. **Semantic Similarity:** Taxonomic vs thematic; models conflate them
5. **Neural Evidence:** Mitchell (2008) and Huth (2016) show brain-model alignment—but correlation ≠ causation
6. **The Debate:** "Stochastic parrots" critique vs emergent capabilities
7. **Compositionality:** Idioms and negation remain challenging

**The gap between computation and cognition remains—but studying it teaches us about both!**

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
