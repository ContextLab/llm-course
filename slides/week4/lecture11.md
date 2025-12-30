---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication - Week 4'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Cognitive Models of Semantic Representation
## Lecture 11: How Humans Represent Meaning

**PSYC 51.07: Models of Language and Communication - Week 4**

Winter 2026

---

# Today's Lecture 📋



1. 🧠 **Human vs. Computational Semantics**
2. 🔬 **Cognitive Theories of Meaning**
3. 🌐 **Embodied & Grounded Cognition**
4. 📊 **Semantic Similarity: What Does It Mean?**
5. 🔍 **Empirical Evidence from Cognitive Science**
6. 🤖 **Bridging the Gap: Models Meet Minds**

*Goal: Understand what computational models are really learning*

---

# The Fundamental Question 🤔



**What does "meaning" actually mean?**

<div class="columns">
<div class="column">

**Computational View:**
- Vectors in high-dimensional space
- Learned from text co-occurrence
- Distributional patterns
- Statistical relationships
- "You shall know a word by the company it keeps"

</div>
<div class="column">

**Human View:**
- Sensory experiences
- Emotional associations
- Physical grounding
- Social context
- Multimodal integration
- Embodied understanding

</div>
</div>

*This lecture explores the relationship between computational and cognitive semantics*


---

# How Do Humans Represent Meaning? 🧠


**Example: The word "coffee"**

<div class="columns">
<div class="column">

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
<div class="column">

**Word2Vec representation:**

`coffee = [0.23, -0.45, 0.67, 0.12, -0.89, ...]`

(300 numbers learned from text)

**What's missing?**
- No sensory grounding
- No embodied experience
- No emotional content
- No perceptual features
- No action affordances
- Purely linguistic

<div class="callout warning">
<div class="callout-title">The Grounding Problem</div>

Computational models lack the rich, multimodal, embodied understanding that humans have.

</div>

</div>
</div>


---

# The Symbol Grounding Problem 🔗


**Harnad (1990): Can symbols have intrinsic meaning?**

<div class="callout tip">
<div class="callout-title">The Chinese Room Argument (Searle, 1980)</div>

- Person in room, doesn't understand Chinese
- Receives Chinese symbols, has rule book
- Follows rules to produce Chinese responses
- From outside: appears to understand Chinese
- But has no understanding of meaning!

**Analogy:** Language models manipulate symbols without grounding

</div>

<div class="columns">
<div class="column">

**Symbol Systems:**
- Symbols refer to other symbols
- Purely syntactic manipulation
- No connection to world
- "Ungrounded" semantics

</div>
<div class="column">

**Grounded Systems:**
- Symbols connected to perception
- Linked to action
- Embodied in physical world
- "Intrinsic" semantics

</div>
</div>

*References: Searle (1980). "Minds, Brains, and Programs"; Harnad (1990). "The Symbol Grounding Problem"*

---

# Embodied Cognition Theory 🏃


**Meaning arises from bodily experience and sensorimotor interaction**

<div class="columns">
<div class="column">

**Key Principles:**
1. **Embodiment:** Cognition shaped by body
2. **Situatedness:** Meaning context-dependent
3. **Enactivism:** Knowing through doing
4. **Grounding:** Concepts tied to perception/action

**Evidence:**
- Reading "kick": activates motor cortex
- Understanding "grasp": simulates action
- Processing emotions: activates body maps
- Conceptual metaphors based on physical experience

</div>
<div class="column">

<!-- Flowchart - manual conversion needed -->

**Implications for AI:**
- Text-only models miss embodiment
- Need multimodal grounding
- Interaction with environment
- Sensorimotor foundations

</div>
</div>

*Reference: Barsalou (2008). "Grounded Cognition"*

---

# The Distributional Hypothesis Revisited 📖



*"You shall know a word by the company it keeps"*

--- J.R. Firth (1957)

**Strong version:** Word meaning IS distributional patterns

**Weak version:** Distributional patterns REFLECT meaning

<div class="columns">
<div class="column">

**Supports:**
- Works remarkably well in practice
- Captures semantic similarity
- Enables analogical reasoning
- Scales to huge vocabularies
- Unsupervised learning
- Aligned with usage-based linguistics

</div>
<div class="column">

**Limitations:**
- Correlation $≠$ causation
- Lacks perceptual grounding
- No embodied understanding
- Missing common sense
- Can't handle novel situations
- Reflects training data biases

</div>
</div>

<div class="callout warning">
<div class="callout-title">Key Question</div>

Is distributional semantics sufficient for meaning, or just a useful approximation?

</div>

*Reference: Boleda (2020). "Distributional Semantics and Linguistic Theory"*

---

# What Does "Semantic Similarity" Really Mean? 🔍


**Different types of similarity:**

<div class="columns">
<div class="column">

**1. Taxonomic:**
- dog $\sim$ cat (both animals)
- red $\sim$ blue (both colors)
- "Is-a" relationships

**2. Thematic:**
- dog $\sim$ leash (co-occur in events)
- coffee $\sim$ cup (functional relation)
- "Goes-with" relationships

**3. Synonymy:**
- big $\sim$ large (same meaning)
- happy $\sim$ joyful

**4. Functional:**
- knife $\sim$ scissors (similar function)
- chair $\sim$ stool

</div>
<div class="column">

**What do models capture?**

- Word2Vec: Mostly thematic + taxonomic
- BERT: Better at taxonomic
- Varies by context window size
- Training data matters!

**Human judgments:**
- SimLex-999: True similarity
- WordSim-353: Relatedness (broader)
- Models better at relatedness than similarity

<div class="callout tip">
<div class="callout-title">Example</div>

**Similar:** car $\sim$ automobile (0.9)

**Related:** car $\sim$ road (0.7)

Models often conflate these!

</div>

</div>
</div>

*Reference: Hill et al. (2015). "SimLex-999: Evaluating Semantic Models with Genuine Similarity Estimation"*

---

# Semantic Projection: Recovering Human Knowledge 🔬


**Grand et al. (2022): Can we extract human-like features from embeddings?**

<div class="columns">
<div class="column">

**The Experiment:**
1. Collect human ratings on perceptual features
    - Is it edible?
- Is it heavy?
- Is it alive?
- Can you hold it?
2. Train linear projections from word embeddings
3. Test if embeddings predict human ratings

**Key Findings:**
- Embeddings encode surprisingly rich knowledge
- Can predict perceptual features
- Even vision and motor properties!
- Better with larger models

</div>
<div class="column">

```
$[0.23, -0.45, ..., 0.12] -> Perceptual Features -> Size: 0.7 -> Edible: 0.1 -> Human -> Ratings
```

**Interpretation:**
- Text co-occurrence captures real-world properties
- Indirect grounding through language
- But still not true perceptual grounding

</div>
</div>

*Reference: Grand et al. (2022). "Semantic projection recovers rich human knowledge of multiple object features from word embeddings"*

---

# Multimodal Models: Bridging the Gap 🌉


**Combining language with perception**

<div class="columns">
<div class="column">

**Vision-Language Models:**
- CLIP (OpenAI)
- ALIGN (Google)
- Flamingo (DeepMind)
- GPT-4V (OpenAI)

**Key Idea:**
- Learn joint embedding space
- Text and images map to same space
- Enables cross-modal understanding
- Grounds language in vision

**Training:**
- Image-caption pairs
- Contrastive learning
- Matching images to descriptions
- Large-scale (400M+ pairs)

</div>
<div class="column">

```
Vision -> Encoder -> Text -> Encoder -> Similar!
```

**Benefits:**
- Visual grounding
- Zero-shot classification
- Better generalization
- More "human-like"

</div>
</div>

*Reference: Radford et al. (2021). "Learning Transferable Visual Models From Natural Language Supervision" (CLIP)*

---

# Conceptual Spaces Theory 🌌


**Gärdenfors (2000): Meaning as geometry**

<div class="columns">
<div class="column">

**Key Ideas:**
- Concepts represented in quality dimensions
- Dimensions: color, size, temperature, etc.
- Each dimension has a metric
- Concepts are regions in space
- Similarity = geometric proximity

**Example: Colors**
- Hue, saturation, brightness
- Natural categories (red, blue, green)
- Fuzzy boundaries
- Prototypes at centers

</div>
<div class="column">

<!-- Flowchart - see original for structure -->

**Relation to Embeddings:**
- Similar geometric structure
- But learned dimensions
- Not interpretable qualities
- No grounding in perception

</div>
</div>

*Reference: Gärdenfors (2000). "Conceptual Spaces: The Geometry of Thought"*

---

# Lexical Semantic Theories 📚


**How do linguists think about word meaning?**

<div class="columns">
<div class="column">

**1. Feature-Based:**
- Words = bundles of features
- bachelor = [+human, +male, +adult, -married]
- Compositional
- Logical

**2. Prototype Theory:**
- Categories have best examples
- Robin is a prototypical bird
- Penguin is peripheral
- Graded membership

**3. Frame Semantics:**
- Words evoke conceptual frames
- "Buy" activates commerce frame
- Buyer, seller, goods, money
- FrameNet resource

</div>
<div class="column">

**4. Construction Grammar:**
- Meaning from form-function pairings
- Idioms, patterns
- Usage-based

**5. Word Sense Disambiguation:**
- Words have multiple senses
- WordNet: hierarchical ontology
- Bank$_1$ (financial), Bank$_2$ (riverside)

<div class="callout warning">
<div class="callout-title">Question</div>

Which theories align with distributional models?

Answer: Mostly usage-based views (Construction Grammar, Prototype Theory)

Struggle with: Feature analysis, Frame semantics

</div>

</div>
</div>

*References: Fillmore (1982). "Frame Semantics"; Rosch (1975). "Cognitive Representations of Semantic Categories"*

---

# Empirical Evidence from Neuroscience 🧬


**What does the brain tell us about semantic representation?**

<div class="columns">
<div class="column">

**fMRI Studies:**
- Can predict brain activity from word embeddings
- Semantic information distributed across cortex
- Different regions for different features
- Temporal lobe: objects
- Motor cortex: actions
- Visual cortex: visual features

**Findings:**
- Word2Vec correlates with neural patterns
- But: imperfect match
- Human brain uses multimodal integration
- Language areas + sensory areas

</div>
<div class="column">

**Brain vs. Model Representations:**

| Distributed | ✓ | ✓ |
| --- | --- | --- |
| Hierarchical | ✓ | ✓ |
| Context-sensitive | ✓ | ✓ (BERT) |
| Grounded | ✓ | ✗ |
| Fast | ✓ | ✓ |

**Key Insight:**
- Models capture some aspects
- But miss crucial grounding
- Convergent representation learning?
- Or fundamentally different?

</div>
</div>

*References: Mitchell et al. (2008). "Predicting Human Brain Activity Associated with the Meanings of Nouns"; Huth et al. (2016). "Natural speech reveals the semantic maps that tile human cerebral cortex"*

---

# The "Stochastic Parrots" Debate 🦜


**Bender et al. (2021): On the Dangers of Stochastic Parrots**

<div class="columns">
<div class="column">

**The Argument:**
- LLMs learn form, not meaning
- "Stochastic parrots" - repeating patterns
- No understanding of world
- No communicative intent
- Risk: Mistaking fluency for understanding

**Evidence:**
- Fail on simple reasoning
- Sensitive to phrasing
- Hallucinate facts
- No common sense
- Brittle to adversarial inputs

</div>
<div class="column">

**Counter-Arguments:**
- Emergent capabilities at scale
- Performance on complex tasks
- Transfer to new domains
- Maybe understanding = prediction?
- Pragmatic success criterion

<div class="callout warning">
<div class="callout-title">The Core Question</div>

**Can meaning arise from form alone?**

Or do we need grounding in:
- Perception?
- Action?
- Social interaction?
- Physical embodiment?

</div>

</div>
</div>

*References: Bender & Koller (2020). "Climbing towards NLU"; Bender et al. (2021). "On the Dangers of Stochastic Parrots"*

---

# Common Sense Reasoning 🤯


**What humans know but models don't**

<div class="columns">
<div class="column">

**Examples:**

<div class="callout tip">
<div class="callout-title">Physical</div>

- Water is wet
- Objects fall down
- You can't be in two places at once
- Heavy things are hard to lift

</div>

<div class="callout tip">
<div class="callout-title">Social</div>

- People have feelings
- Insults are hurtful
- Promises should be kept
- Eye contact shows attention

</div>

</div>
<div class="column">

**Why Models Struggle:**
- Not explicit in text
- Assumed background knowledge
- Requires world experience
- Needs causal reasoning
- Embodied understanding

**Benchmark Datasets:**
- Winograd Schema Challenge
- PIQA (Physical Interaction QA)
- SocialIQA
- CommonsenseQA

**Progress:**
- Large models do better
- But still far from human
- Often exploit shortcuts
- Memorization vs. reasoning?

</div>
</div>


---

# Compositionality: Phrases and Sentences 🧩


**How do we combine word meanings?**

<div class="columns">
<div class="column">

**The Problem:**
- "hot" + "dog" $≠$ "hot dog"
- "red" + "herring" $≠$ "red herring"
- Idioms, metaphors, collocations
- Non-compositional meaning

**Classical Approaches:**
- Vector addition: $ + $
- Element-wise multiplication
- Tensor products
- Fails for non-compositional phrases!

**Neural Approaches:**
- RNNs, LSTMs
- Transformers (BERT)
- Learn composition functions
- Better but not perfect

</div>
<div class="column">

**Compositionality Types:**

**1. Semantic Composition:**
- "big red ball" = big $\cap$ red $\cap$ ball
- Intersective

**2. Non-intersective:**
- "fake gun" $≠$ fake $\cap$ gun
- Adjective changes interpretation

**3. Metaphorical:**
- "Time is money"
- Cross-domain mapping

<div class="callout warning">
<div class="callout-title">Current Status</div>

Transformers handle many cases through attention, but still struggle with:
- Novel compositions
- Systematic generalization
- Logical operators (negation!)

</div>

</div>
</div>


---

# Grand Discussion 💬



**Do large language models "understand" language?**

<div class="columns">
<div class="column">

**Arguments FOR:**
- Solve complex tasks
- Generalize to new domains
- Show emergent capabilities
- Capture linguistic structure
- Pragmatic criterion: if it works...
- Maybe understanding = prediction
- Human understanding also imperfect

*"The question is not whether machines think, but whether they behave intelligently" - Turing*

</div>
<div class="column">

**Arguments AGAINST:**
- No grounding in reality
- No embodied experience
- No intentionality
- Brittle, exploit shortcuts
- Hallucinate confidently
- No causal reasoning
- Missing common sense
- Form without meaning

*"Understanding requires grounding in perception and action" - Embodied cognition*

</div>
</div>

<div class="callout warning">
<div class="callout-title">Perhaps the wrong question?</div>

Instead of "Do they understand?", ask:
- What do they represent?
- How does it differ from humans?
- What are the limits?
- How can we improve?

</div>


---

# Future Directions 🔮


**Bridging computational and cognitive semantics**

1. **Multimodal Learning:**
    - Vision + language (CLIP, Flamingo)
- Audio, tactile, proprioception
- Grounding in multiple modalities
2. **Embodied AI:**
    - Robots learning through interaction
- Simulation environments
- Sensorimotor grounding
3. **Neurosymbolic AI:**
    - Combining neural and symbolic
- Logical reasoning + learning
- Structured knowledge graphs
4. **Cognitively-Inspired Architectures:**
    - Memory systems
- Attention mechanisms
- Episodic learning
- Meta-learning
5. **Social Grounding:**
    - Learning through dialogue
- Cultural context
- Pragmatic understanding


---

# Practical Implications 💼


**What this means for NLP practitioners**

1. **Know the Limits:**
    - Models excel at pattern matching
- Struggle with true reasoning
- Need task-specific evaluation
- Don't assume understanding
2. **Choose Appropriate Tasks:**
    - Good: classification, retrieval, similarity
- Moderate: summarization, translation
- Challenging: reasoning, planning, common sense
3. **Augment with Structure:**
    - Knowledge graphs
- Rules and constraints
- Domain expertise
- Human-in-the-loop
4. **Evaluate Carefully:**
    - Beyond accuracy metrics
- Test edge cases
- Adversarial robustness
- Bias and fairness
- Interpretability
5. **Stay Informed:**
    - Rapidly evolving field
- New capabilities emerging
- Ethical considerations
- Interdisciplinary insights


---

# Summary 🎯


**What we learned today:**

1. **Symbol Grounding:** Computational models lack perceptual grounding
2. **Embodied Cognition:** Human meaning tied to bodily experience
3. **Distributional Semantics:** Powerful but incomplete theory
4. **Semantic Similarity:** Multiple types, models capture some
5. **Empirical Evidence:** Models align with neural patterns but miss multimodality
6. **Current Debates:**
    - Stochastic parrots vs. emergent understanding
- Form vs. meaning
- Prediction vs. comprehension
7. **Future:** Multimodal, embodied, neurosymbolic approaches

**The gap between computation and cognition remains,**

**but we're making progress! 🌉**


---

# Key References 📚



**Foundational Papers:**
- Searle, J. (1980). "Minds, Brains, and Programs"
- Harnad, S. (1990). "The Symbol Grounding Problem"
- Barsalou, L. (2008). "Grounded Cognition"
- Gärdenfors, P. (2000). "Conceptual Spaces: The Geometry of Thought"

**Distributional Semantics:**
- Firth, J.R. (1957). "A Synopsis of Linguistic Theory"
- Boleda, G. (2020). "Distributional Semantics and Linguistic Theory"
- Hill et al. (2015). "SimLex-999"
- Grand et al. (2022). "Semantic Projection Recovers Rich Human Knowledge"

**Critical Perspectives:**
- Bender & Koller (2020). "Climbing towards NLU: On Meaning, Form, and Understanding"
- Bender et al. (2021). "On the Dangers of Stochastic Parrots"

**Neuroscience:**
- Mitchell et al. (2008). "Predicting Human Brain Activity"
- Huth et al. (2016). "Natural Speech Reveals Semantic Maps"

**Multimodal:**
- Radford et al. (2021). "Learning Transferable Visual Models" (CLIP)


---

# Final Thoughts 🌟



**As we build ever-larger language models,**

**let's not forget to ask:**

*What are they really learning?*

*How does it compare to human understanding?*

*What's missing?*

*How can we do better?*

**Questions? 🙋**

