---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 8: POS tagging & sentiment analysis
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will">

1. Understand part-of-speech (POS) tagging and its applications
2. Explore how neural networks learn grammatical structure
3. Apply sentiment analysis to real-world text
4. Fine-tune pre-trained models for domain-specific tasks
5. Critically evaluate whether models "understand" language

</div>

<div class="tip-box" data-title="Central questions">

- Can statistical patterns capture grammatical knowledge?
- What does it mean for a model to "understand" emotion?

</div>

---

# Part-of-speech (POS) tagging

<div class="definition-box" data-title="What is POS tagging?">

- Assigning grammatical category to each word
- Categories: noun, verb, adjective, adverb, pronoun, preposition, etc.
- A fundamental NLP task

</div>

<div class="example-box" data-title="Example">

```
The   cat   sat   on   the   mat
DET   NOUN  VERB  ADP  DET   NOUN
```

</div>

<div class="note-box" data-title="Why it matters">

- Disambiguation: "book" as noun vs. verb
- Syntax parsing and understanding
- Information extraction, machine translation

</div>

---
<!-- _class: scale-90 -->

# POS tagsets: universal vs. fine-grained

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Universal POS (17 tags):**
- ADJ, ADV, ADP, AUX
- CONJ, DET, NOUN, NUM
- PRON, PROPN, VERB, ...

</div>
<div style="flex: 1;">

**Penn Treebank (45+ tags):**
- NN/NNS/NNP/NNPS (nouns)
- VB/VBD/VBG/VBN/VBP/VBZ (verbs)
- Much finer distinctions!

</div>
</div>

<div class="tip-box" data-title="Trade-off">

Simplicity vs. linguistic detail

</div>

---
<!-- _class: scale-90 -->

# Context matters: ambiguous words

| Sentence | Word | POS | Explanation |
|----------|------|-----|-------------|
| "I read a **book**" | book | NOUN | Object being read |
| "Please **book** a table" | book | VERB | Action of reserving |
| "She runs **fast**" | fast | ADV | Modifies "runs" |
| "I will **fast** today" | fast | VERB | Action of not eating |
| "Please **close** the door" | close | VERB | Action |
| "Stay **close** to me" | close | ADV | Modifies position |

<div class="tip-box" data-title="Key insight">

Context determines POS! Models must look at surrounding words.

</div>

---
<!-- _class: scale-65 -->

# spaCy resolves ambiguity using context

<div class="example-box" data-title="Code example">

```python
import spacy
nlp = spacy.load("en_core_web_sm")

sentences = [
    "I need to book a flight",      # book = VERB
    "I'm reading a great book",     # book = NOUN
    "The record was broken",        # record = NOUN
    "Please record the meeting",    # record = VERB
]

for sent in sentences:
    doc = nlp(sent)
    for token in doc:
        if token.text.lower() in ["book", "record"]:
            print(f'"{sent}"')
            print(f'  "{token.text}" -> {token.pos_} ({spacy.explain(token.pos_)})\n')
```

</div>

<div class="note-box" data-title="Context helps to disambiguate parts of speech">

Examples: `"to book"` vs `"a book"`.  Preceeding words tell us whether `"book"` is a verb or noun.

</div>

---
<!-- _class: scale-70 -->

# What methods are used for POS tagging?

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Traditional approaches (pre-neural network)**
- Rule-based: hand-crafted grammar rules
- Hidden Markov Models (HMMs): probabilistic sequences
- Conditional Random Fields (CRFs): structured prediction

</div>
<div style="flex: 1;">

**Modern neural network approaches**
- Recurrent Neural Networks (RNNs/LSTMs): process sequences
- Transformers (BERT, etc.): bidirectional context
- Fine-tune pre-trained models on POS data

</div>
</div>

<div class="note-box" data-title="Advantages of neural network approaches">

- Learn patterns from data (no hand-crafted rules)
- Capture long-range dependencies
- Handle ambiguity through context
- State-of-the-art accuracy (>97% on English!)

</div>

---

# POS tagging is tricky!

<div class="note-box" data-title="Further reading...">

[**Linzen, Dupoux, & Goldberg (2016, *TACL*).**](https://direct.mit.edu/tacl/article-pdf/doi/10.1162/tacl_a_00115/1567418/tacl_a_00115.pdf) Assessing the ability of LSTMs to learn syntax-sensitive dependencies.

</div>

```flow
[The key:green] --> [to the cabinets:gray] --> [is/are?:blue] --> [...:gray]
```
<!-- caption: Challenge: distractor nouns between subject and verb -->

<div class="example-box" data-title="The challenge: which noun(s) go with the verb?">

- Model must identify "key" (singular) as subject
- Ignore "cabinets" (plural distractor)
- Predict correct verb form "is" (not "are")

</div>

---
<!-- _class: scale-70 -->

# Token classification with HuggingFace

```python
from transformers import pipeline
pos_tagger = pipeline("token-classification",
    model="vblagoje/bert-english-uncased-finetuned-pos",
    aggregation_strategy="simple")

sentence = "Apple Inc. is looking at buying a UK startup"
results = pos_tagger(sentence)

for result in results:
    print(f"{result['word']:<15} {result['entity_group']:<8} ({result['score']:.3f})")
# Apple           PROPN    (0.998)
# Inc.            PROPN    (0.995)
# is              AUX      (0.999)
# looking         VERB     (0.997)
```

<div class="note-box" data-title="Further reading">

[HuggingFace Chapter 7.2: Token Classification](https://huggingface.co/learn/nlp-course/chapter7/2)

</div>

---
<!-- _class: scale-80 -->

# So what? Why is POS tagging important?

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Applications**
- Syntax parsing
- Named entity recognition
- Information extraction
- Machine translation
- Sentiment analysis (e.g., adjectives)

</div>
<div style="flex: 1;">

**Linguistic insights**
- Study grammatical structure
- Analyze language acquisition
- Explore cross-linguistic patterns
- Understand model "knowledge" of syntax
- Stylometric analysis

</div>
</div>

<div class="note-box" data-title="Think about it...">

Consider how simple rule-based models like ELIZA parse user inputs versus what it means to explicitly model and identify parts of speech. Does POS tagging represent a deeper "understanding" of text? Or is it just another statistical pattern?

</div>

<div class="example-box" data-title="Try it out!">

Check out the [POS tagging demo](https://context-lab.com/llm-course/demos/pos-tagging/) to explore POS tagging interactively.

</div>

---

# Sentiment analysis overview

<div class="definition-box" data-title="What is sentiment analysis?">

- Identifying emotional tone in text
- Classifying as positive, negative, neutral
- Extracting subjective information

</div>

<div class="example-box" data-title="Example">

```
"I love this product!"           → Positive
"This is the worst experience."  → Negative
"It's okay, nothing special."    → Neutral
```

</div>

<div class="note-box" data-title="Use of POS tagging">

Sentiment is often linked to adjectives/adverbs (e.g., "great", "terrible"). POS tagging can help identify sentiment-bearing words. (Caveat: modern models often learn this implicitly!)

</div>

---
<!-- _class: scale-80 -->

# Sentiment analysis identifies emotional "tone"

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Applications**
- Social media monitoring
- Customer feedback analysis
- Market research
- Review analysis
- Political tracking
- Psychological studies (mood/emotion)
- Chatbots and virtual assistants

</div>
<div style="flex: 1;">

**Granularity levels**
- Binary: positive/negative
- Ternary: positive/negative/neutral
- Fine-grained: 1-5 stars
- Continuous: sentiment score
- Aspect-based: per-feature
- Emotion detection: joy, anger, sadness, etc.

</div>
</div>

---
<!-- _class: scale-80 -->

# Sentiment analysis challenges

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

<div class="example-box" data-title="Sarcasm and irony">

- "Oh great, another meeting" (negative, despite "great")
- "This is the best movie I've ever fallen asleep to" (negative!)

</div>

<div class="example-box" data-title="Context-dependent sentiment">

- "This movie is sick!" (positive in slang, negative literally)
- "The book was long" (neutral? negative?)

</div>

<div class="example-box" data-title="Mixed sentiment">

- "Great food but terrible service" (both positive and negative)
- Aspect-based sentiment: food=positive, service=negative

</div>

</div>
<div style="flex: 1;">

<div class="example-box" data-title="Negation">

- "not good" vs. "good"
- "I don't dislike it" (double negative = positive?)

</div>

<div class="example-box" data-title="Domain specificity">

- "Explosive growth" (positive in business, negative in safety)
- Different domains have different sentiment patterns

</div>

<div class="example-box" data-title="Subtlety and ambiguity">

- "It's okay, I guess" (neutral or slightly negative?)
- Subjective interpretations vary

</div>

</div>
</div>

---
<!-- _class: scale-65 -->

# Sentiment analysis with HuggingFace

<div class="example-box" data-title="Testing how models handle tricky cases">

```python
from transformers import pipeline
sentiment = pipeline("sentiment-analysis")

tricky_cases = [
    ("Oh great, another Monday meeting", "NEGATIVE"),    # Sarcasm
    ("This movie is not bad at all", "POSITIVE"),        # Negation
    ("I don't dislike this product", "POSITIVE"),        # Double negative
    ("Great camera but terrible battery life", "MIXED"), # Mixed sentiment
]

for text, expected in tricky_cases:
    result = sentiment(text)[0]
    print(f"{text}")
    print(f"  Model: {result['label']} ({result['score']:.3f}) | Expected: {expected}\n")
```

</div>

<div class="warning-box" data-title="An unsolved problem...">

Even modern models still struggle with sarcasm and complex negation!

</div>

<div class="note-box" data-title="Further reading">

[Hugging Face Chapter 1.2: NLP Tasks with Pipeline](https://huggingface.co/learn/nlp-course/chapter1/2)

</div>

---

# There are essentially two types of sentiment analysis approaches

- Lexicon-based methods: predefined word sentiment scores
- Machine learning methods: statistical models (traditional or neural)

---
<!-- _class: scale-80 -->


# Sentiment lexicons: sum up words with predefined sentiment scores

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Popular lexicons:**
- **AFINN:** -5 to +5 ratings
- **SentiWordNet:** pos/neg/neutral
- **VADER:** Social media focused

**Limitations:** Ignores context, word order, sarcasm

</div>
<div style="flex: 1;">

**Example (AFINN):**

| Word | Score |
|------|-------|
| great | +3 |
| good | +3 |
| hate | -3 |
| terrible | -3 |
| awful | -3 |

</div>
</div>

<div class="note-box" data-title="Why use lexicon-based methods?">

- Simple and interpretable
- Fast!
- No training data needed; "just works" out of the box

</div>

---

# Neural network approaches for sentiment analysis

<div class="note-box" data-title="Neural network advantages">

- Learn context-dependent representations
- Capture word order and negation
- Handle sarcasm better (though still imperfect)
- Transfer learning: pre-train on large corpus, fine-tune for sentiment

</div>

```flow
[Input Text:green] --> [Pre-trained Model (BERT):blue] --> [Classification Head:orange] --> [Sentiment Label:teal]
```
<!-- caption: Typical neural sentiment analysis architecture -->

<div class="tip-box" data-title="Training">

The pre-trained model learns general language patterns, and the classification head is trained specifically for sentiment analysis using labeled sentiment data (IMDb reviews, Amazon reviews, restaurant reviews, etc.).

</div>


---
<!-- _class: scale-80 -->

# Discussion: understanding emotion or "just" patterns?

<div class="note-box" data-title="Philosophical questions">

1. **Can models "feel" sentiment?**
   - They predict labels, but do they understand emotion?
2. **Is sentiment objective or subjective?**
   - Different annotators may disagree on sentiment
   - How do models handle ambiguity?
3. **Cultural and linguistic variation:**
   - Sentiment expressions vary across cultures
   - Can models capture these nuances?
4. **Ethical considerations:**
   - Automated sentiment analysis in hiring, lending...
   - Risks of bias and discrimination
   - Should we trust model judgments?

</div>

---
<!-- _class: scale-90 -->

# Looking back: week 2

```flow
[Data Cleaning:green] --> [Tokenization:teal] --> [POS Tagging:blue] --> [Sentiment Analysis:orange]
```
<!-- caption: The NLP pipeline (so far!) -->

- **Data cleaning:** reduces noise by removing unwanted elements
- **Tokenization:** break text into units to enable more efficient processing
- **POS tagging:** reveals grammatical structure
- **Sentiment analysis:** extracts emotional valence and tone

---
<!-- _class: scale-70 -->

# Assignment 2: SPAM email classifier

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Apply last week's concepts**
- **Data cleaning:** remove HTML tags and special characters, normalize text and formatting
- **Tokenization:** try different tokenizers (word, subword)
- **Features:** extract useful signals (POS patterns, sentiment, keywords, etc.)
- **Classification:** train a model to identify spam vs. legitimate emails

</div>
<div style="flex: 1;">

**Think about**
- Intuitively, what makes spam different from legitimate emails? Can you codify these differences?
- How does preprocessing affect accuracy?
- Can you create compute new features that improve performance?
- Can you leverage POS patterns? (e.g., does spam tend to have more imperative verbs?)
- Which model architectures work best for this task?

</div>
</div>

<div class="tip-box" data-title="Link">

[Assignment 2: SPAM classifier](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%202%3A%20SPAM%20classifier)

</div>

---
<!-- _class: scale-95 -->

# Key takeaways

- POS tagging assigns grammatical categories to words using context
- Neural networks (RNNs, Transformers) excel at POS tagging
- Sentiment analysis identifies emotional tone in text
- Lexicon-based and neural network methods have different strengths
- Challenges include sarcasm, negation, and context-dependence
- Critical thinking about model "understanding" is essential

---

# Looking ahead: the rest of this week

<div class="note-box" data-title="Coming up Thursday & Friday">

- Classic embeddings: LSA, LDA, topic modeling
- Word embeddings: Word2Vec, GloVe, FastText
- Distributional semantics and dimensionality reduction

</div>

<div class="definition-box" data-title="Central question">

*"You shall know a word by the company it keeps"*

How can we represent word *meaning* computationally?

</div>

<div class="tip-box" data-title="Prepare by">

- Finishing Assignment 2 (due Monday!)
- Thinking about what "meaning" is. How might you define it?

</div>

---

# Questions? Want to chat more?

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

<div class="tip-box" data-title="See you tomorrow!">

We'll diving into embeddings during our X-hour!

</div>
