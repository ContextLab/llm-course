---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication - Week 4'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Cognitive Models of Semantic Representation
## Lecture 14: How Humans Represent Meaning

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

<div class="columns">
<div class="column">

**The Chinese Room (Searle, 1980):**

```
Input:  你好吗？
        ↓
[Rule Book: If see 你好吗
            output 我很好]
        ↓
Output: 我很好

Correct response! But no
understanding of Chinese.
```

**Analogy to LLMs:**

```
Input:  "Is a penguin a bird?"
        ↓
[Pattern: "X is a bird" often
 follows penguins in text]
        ↓
Output: "Yes, a penguin is a bird"

Correct! But does it "know" birds?
```

</div>
<div class="column">

**Symbol Systems:**
- Symbols refer to other symbols
- Purely syntactic manipulation
- No connection to world

**Grounded Systems:**
- Symbols connected to perception
- A child learns "dog" by:
  - SEEING dogs
  - PETTING dogs
  - HEARING barking
  - Being LICKED by dogs

The word "dog" is grounded in experience!

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

**Neuroscience Evidence:**

```
Reading "kick the ball":
→ Motor cortex activates
→ Leg area specifically!

Reading "pick up the cup":
→ Hand area activates
→ Even without moving!
```

</div>
<div class="column">

**Conceptual Metaphors (Lakoff & Johnson):**

```
Physical → Abstract mapping:

"WARM personality" ← holding warm drink
                     primes positive judgments!

"HIGH status" ← up = good, down = bad
               (heads held high)

"GRASPING an idea" ← physical grasping
                     simulated mentally

"Heavy heart" ← weight = emotional burden
```

**These metaphors are NOT in Word2Vec!**
Models learn word patterns, not embodied experience.

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

**Taxonomic (IS-A):**
```
dog ↔ cat: Both are animals
         Similarity: HIGH
```

**Thematic (GOES-WITH):**
```
dog ↔ leash: Co-occur in events
            Relatedness: HIGH
            Similarity: LOW!
```

**Test Yourself:**
```
Which is more SIMILAR to "coffee"?
A) tea      ← Same category (beverages)
B) cup      ← Co-occurs (thematic)

Answer: A (tea) is more SIMILAR
        B (cup) is more RELATED
```

</div>
<div class="column">

**What Word2Vec Says:**

```python
# Word2Vec often gets this wrong!
model.similarity('coffee', 'cup')   # 0.65
model.similarity('coffee', 'tea')   # 0.62

# Cup ranked higher due to co-occurrence!
# But tea is categorically more similar
```

**SimLex-999 vs WordSim-353:**

| Pair | SimLex | WordSim |
|------|--------|---------|
| car-auto | 0.96 | 0.92 |
| car-road | 0.23 | 0.73 |

SimLex measures true SIMILARITY.
WordSim measures RELATEDNESS.

Models score better on WordSim!

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

**Physical Intuition Failures:**

```
Q: "Can you fit an elephant
    in a refrigerator?"

GPT-3: "Yes, if you open the
       door wide enough..."
```

**Winograd Schema (reasoning):**

```
"The trophy doesn't fit in the
 brown suitcase because it is
 too [small/large]."

What does "it" refer to?
- "small" → suitcase
- "large" → trophy

Requires world knowledge!
```

</div>
<div class="column">

**Social Intuition Failures:**

```
Q: "John told Mary he loved her.
    How did Mary feel?"

Depends on context:
- First date? → Surprised/happy
- After argument? → Relieved
- Unwanted? → Uncomfortable

Models miss social nuance!
```

**Why Models Struggle:**
- Physical/social knowledge rarely stated
- Assumed as background knowledge
- Requires embodied experience
- Needs causal reasoning

</div>
</div>

---

# Compositionality: Phrases and Sentences 🧩


**How do we combine word meanings?**

<div class="columns">
<div class="column">

**The Problem:**

```python
# Vector math doesn't work!
vec("hot") + vec("dog") ≠ vec("hot dog")

# "hot dog" = food item
# "hot" + "dog" = warm canine

# Same issue:
vec("red") + vec("herring") ≠ vec("red herring")
# red herring = distraction, not a fish!
```

**Non-compositional Phrases:**
- Kick the bucket (= die)
- Spill the beans (= reveal secret)
- Break a leg (= good luck)

</div>
<div class="column">

**What Transformers Learn:**

```
Input: "break a leg"
       ↓
Attention sees this phrase
often in "good luck" contexts
       ↓
Output: idiomatic meaning

But fails on novel combinations!
```

**The Negation Problem:**

```python
# BERT struggles with negation
sent1 = "The movie was good"
sent2 = "The movie was not good"

# Embeddings are very similar!
# "not" should flip the meaning
cosine_sim(sent1, sent2) ≈ 0.85
```

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

Instead of "Do they understand?", ask: What do they represent? How does it differ from humans? What are the limits?

</div>


---

# Summary 🎯


**What we learned today:**

1. **Symbol Grounding:** Computational models lack perceptual grounding
2. **Embodied Cognition:** Human meaning tied to bodily experience
3. **Distributional Semantics:** Powerful but incomplete theory
4. **Semantic Similarity:** Multiple types, models capture some
5. **Empirical Evidence:** Models align with neural patterns but miss multimodality
6. **Common Sense:** Models struggle with physical and social reasoning
7. **Compositionality:** Non-literal language remains challenging

**The gap between computation and cognition remains, but we're making progress!**


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

**Critical Perspectives:**
- Bender & Koller (2020). "Climbing towards NLU"
- Bender et al. (2021). "On the Dangers of Stochastic Parrots"


---

# Questions? 🙋



**Next Week:**

Advanced Topics in Language Models

*Scaling, emergent abilities, and the future of NLP*