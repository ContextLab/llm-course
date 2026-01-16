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

# Sentiment lexicons: words with predefined sentiment scores

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

---

# Lexicon-based sentiment analysis

```python
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
analyzer = SentimentIntensityAnalyzer()

texts = ["I love this product! It's amazing!", "This is the worst experience ever.",
         "It's okay, nothing special.", "Great food but terrible service!"]

for text in texts:
    scores = analyzer.polarity_scores(text)
    print(f"{text}")
    print(f"  Pos: {scores['pos']:.2f}, Neg: {scores['neg']:.2f}, Compound: {scores['compound']:.3f}\n")
# VADER handles emoji and punctuation! "Great!!!" scores higher than "Great"
```

---

# Modern approach: Pre-trained models

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

Fine-tune on labeled sentiment data (IMDb, Amazon reviews, etc.)

</div>

---

# VADER vs Neural: Head-to-head comparison

<div class="note-box" data-title="Testing both approaches on the same examples">

```python
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline

vader = SentimentIntensityAnalyzer()
neural = pipeline("sentiment-analysis")

test_cases = [
    "I absolutely love this product!",
    "This is not what I expected, but in a good way",
    "The movie was so bad it was actually hilarious",
]

for text in test_cases:
    v_score = vader.polarity_scores(text)['compound']
    n_result = neural(text)[0]
    print(f"Text: {text}")
    print(f"  VADER: {v_score:+.3f} ({'POS' if v_score > 0 else 'NEG'})")
    print(f"  Neural: {n_result['label']} ({n_result['score']:.3f})\n")
```

</div>

<div class="tip-box" data-title="Key finding">

Neural models handle nuance better, but VADER is faster and interpretable.

</div>

---

# Sentiment analysis with HuggingFace

```python
from transformers import pipeline
sentiment_analyzer = pipeline("sentiment-analysis")

texts = ["I love this product! It's amazing!", "This is the worst experience ever.",
         "It's okay, nothing special.", "I don't hate it, but I don't love it either."]

for text in texts:
    result = sentiment_analyzer(text)[0]
    print(f"{text}")
    print(f"  {result['label']}, Confidence: {result['score']:.3f}\n")
# "I love this product!" → POSITIVE (0.999)
```

<div class="note-box" data-title="Further reading">

[HuggingFace Chapter 1.2: NLP Tasks](https://huggingface.co/learn/nlp-course/chapter1/2)

</div>

---
<!-- _class: scale-80 -->

# Domain-specific sentiment models

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

<div class="warning-box" data-title="Problem">

General models miss domain-specific language

</div>

<div class="tip-box" data-title="Solution">

Fine-tune on domain-specific data!

</div>

**Why it works:** Domain-specific vocabulary ("bullish" in finance = positive), different sentiment expressions, adapted conventions.

</div>
<div style="flex: 1;">

| Domain | Model | Data |
|--------|-------|------|
| Medical | BioBERT | Patient feedback |
| Twitter | TwitterBERT | Social posts |
| Products | RoBERTa | Amazon reviews |
| Movies | BERT | IMDb reviews |

</div>
</div>

---
<!-- _class: scale-80 -->

# Comparing general vs. domain-specific

```python
from transformers import pipeline
general = pipeline("sentiment-analysis")
financial = pipeline("sentiment-analysis", model="ProsusAI/finbert")

texts = ["The company's earnings exceeded expectations",
         "Revenue declined but margins improved", "Stock prices plummeted"]

for text in texts:
    gen = general(text)[0]
    fin = financial(text)[0]
    print(f"{text}")
    print(f"  General: {gen['label']} ({gen['score']:.3f}) | "
          f"Financial: {fin['label']} ({fin['score']:.3f})\n")
# Financial model often more accurate for finance text!
```

---
<!-- _class: scale-80 -->

# Fine-tuning for sentiment analysis

<div class="definition-box" data-title="Process overview">

1. **Start with pre-trained model** (BERT, RoBERTa) &mdash; already knows language
2. **Prepare labeled dataset** &mdash; text + sentiment labels (pos/neg/neutral)
3. **Add classification head** &mdash; dense layer outputting class probabilities
4. **Fine-tune on sentiment data** &mdash; much faster than training from scratch!
5. **Evaluate** &mdash; accuracy, precision, recall, F1-score

</div>

<div class="note-box" data-title="Further reading">

[HuggingFace Chapter 3.2: Processing Data for Fine-tuning](https://huggingface.co/learn/nlp-course/chapter3/2)

</div>

---

# Fine-tuning example (simplified)

```python
from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments

# 1. Load pre-trained model
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

# 2. Define training arguments
training_args = TrainingArguments(output_dir="./results", num_train_epochs=3,
    per_device_train_batch_size=16, evaluation_strategy="epoch")

# 3. Create Trainer and train (train_dataset, eval_dataset prepared separately)
trainer = Trainer(model=model, args=training_args,
    train_dataset=train_dataset, eval_dataset=eval_dataset)
trainer.train()
```

---
<!-- _class: scale-80 -->

# Evaluation metrics for sentiment analysis

<div class="note-box" data-title="Beyond accuracy">

- **Precision:** Of predicted positives, how many are truly positive?
  $$\text{Precision} = \frac{TP}{TP + FP}$$
- **Recall:** Of actual positives, how many did we catch?
  $$\text{Recall} = \frac{TP}{TP + FN}$$
- **F1-Score:** Harmonic mean of precision and recall
  $$F1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

</div>

<div class="tip-box" data-title="Why not just accuracy?">

- Imbalanced datasets (e.g., 90% positive reviews)
- Different costs for false positives vs. false negatives
- F1 gives balanced view of model performance

</div>

---

# Confusion matrix example

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

|  | Predicted Positive | Predicted Negative |
|--|-------------------|-------------------|
| **Actual Positive** | TP = 90 | FN = 10 |
| **Actual Negative** | FP = 5 | TN = 95 |

</div>
<div style="flex: 1;">

<div class="example-box" data-title="Metrics">

- **Accuracy** = (90 + 95) / 200 = 92%
- **Precision** = 90 / 95 = 95%
- **Recall** = 90 / 100 = 90%
- **F1** = 2 × (0.95 × 0.90) / (0.95 + 0.90) = 92%

</div>

</div>
</div>

---
<!-- _class: scale-80 -->

# Aspect-based sentiment analysis

<div class="note-box" data-title="Problem">

Reviews often mention multiple aspects with different sentiments

</div>

<div class="example-box" data-title="Example">

"The **food was delicious** but the **service was terrible**. The **atmosphere was okay**."

- Food: Positive
- Service: Negative
- Atmosphere: Neutral

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Applications:**
- Restaurant reviews: food, service, ambiance, price
- Product reviews: quality, price, shipping, customer service
- Hotel reviews: room, location, staff, cleanliness

</div>
<div style="flex: 1;">

<div class="tip-box" data-title="Key insight">

More nuanced than overall sentiment! Provides actionable insights.

</div>

</div>
</div>

---
<!-- _class: scale-75 -->

# Aspect-based sentiment: Worked example

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1.2;">

```python
review = """The pasta was incredible - best I've had!
However, we waited 45 min which was frustrating.
Ambiance was nice but loud. Prices reasonable."""

aspects = {
    "food": ["pasta", "incredible"],    # POSITIVE
    "service": ["waited", "frustrating"], # NEGATIVE
    "ambiance": ["nice", "loud"],        # MIXED
    "price": ["reasonable"]              # POSITIVE
}
```

</div>
<div style="flex: 0.8;">

| Aspect | Sentiment |
|--------|-----------|
| Food | POSITIVE |
| Service | NEGATIVE |
| Ambiance | MIXED |
| Price | POSITIVE |

<div class="tip-box" data-title="Actionable">

Focus on improving wait times!

</div>

</div>
</div>

---

# Real-world application: Product review analysis

<div class="note-box" data-title="Business value">

- Identify product strengths and weaknesses
- Track sentiment trends over time
- Compare against competitors
- Prioritize product improvements

</div>

```flow
[Collect Reviews:green] --> [Extract Aspects:blue] --> [Analyze Sentiment:orange] --> [Generate Insights:teal]
```
<!-- caption: Product review analysis pipeline -->

<div class="example-box" data-title="Example insights">

- **Product A:** Stable positive sentiment
- **Product B:** Declining sentiment &rarr; investigate quality issues!

</div>

---
<!-- _class: scale-80 -->

# Hands-on exercise

<div class="tip-box" data-title="Try this yourself">

1. **Collect data:**
   - Scrape product reviews (Amazon, Yelp)
   - Or use public dataset (IMDb, Twitter)
2. **Compare approaches:**
   - Lexicon-based (VADER)
   - General pre-trained model (HuggingFace pipeline)
   - Domain-specific model (if available)
3. **Analyze results:**
   - Where do models disagree?
   - Which handles sarcasm better?
   - Which is most accurate for your domain?
4. **Bonus:** Fine-tune a model on your specific dataset!

</div>

---
<!-- _class: scale-80 -->

# Discussion: Understanding emotion

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

# Week 2: Each step builds on the previous one

```flow
[Data Cleaning:green] --> [Tokenization:teal] --> [POS Tagging:blue] --> [Sentiment Analysis:orange]
```
<!-- caption: The NLP pipeline -->

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

- **Data cleaning:** Remove noise
- **Tokenization:** Break into units

</div>
<div style="flex: 1;">

- **POS tagging:** Grammar structure
- **Sentiment:** Emotional meaning

</div>
</div>

---
<!-- _class: scale-80 -->

# Assignment 2: SPAM email classifier

<div class="note-box" data-title="Your task">

Build a classifier to detect spam emails

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Apply this week's concepts:**
- **Data cleaning:** Remove HTML tags, normalize text
- **Tokenization:** Try different tokenizers (word, subword)
- **Features:** Extract useful signals (POS patterns, sentiment?)
- **Classification:** Train a model to identify spam

</div>
<div style="flex: 1;">

**Think about:**
- What makes spam different from legitimate emails?
- How does preprocessing affect accuracy?
- Can you use sentiment as a feature?
- What about POS patterns? (e.g., spam has more imperatives?)

</div>
</div>

<div class="tip-box" data-title="Link">

[Assignment 2: SPAM classifier](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%202%3A%20SPAM%20classifier)

</div>

---
<!-- _class: scale-80 -->

# Key takeaways

<div class="note-box" data-title="What we learned">

1. **POS tagging reveals grammatical structure** &mdash; Neural nets learn syntax, but do they "understand" it?
2. **Sentiment analysis extracts emotional meaning** &mdash; Lexicons &rarr; neural networks; domain fine-tuning helps
3. **Statistical learning powers modern NLP** &mdash; Models learn patterns without explicit rules
4. **Context is crucial** &mdash; Words are ambiguous; Transformers excel at capturing context
5. **Critical thinking matters** &mdash; Question what "understanding" means; be aware of biases

</div>

---
<!-- _class: scale-80 -->

# Primary references

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**POS tagging and syntax:**
- Linzen, Dupoux, & Goldberg (2016). Assessing the Ability of LSTMs to Learn Syntax-Sensitive Dependencies. *TACL*.
- Warstadt et al. (2020). BLiMP: The Benchmark of Linguistic Minimal Pairs. *TACL*.

**Sentiment analysis:**
- Pang & Lee (2008). Opinion Mining and Sentiment Analysis. *Foundations and Trends in IR*.
- Hutto & Gilbert (2014). VADER: A Parsimonious Rule-based Model for Sentiment Analysis. *ICWSM*.

</div>
<div style="flex: 1;">

**HuggingFace resources:**
- [Chapter 1.2: NLP Tasks with Pipeline](https://huggingface.co/learn/nlp-course/chapter1/2)
- [Chapter 3.2: Processing Data for Fine-tuning](https://huggingface.co/learn/nlp-course/chapter3/2)
- [Chapter 7.2: Token Classification](https://huggingface.co/learn/nlp-course/chapter7/2)

</div>
</div>

---

# Looking ahead: Weeks 3-4

<div class="note-box" data-title="Next topics">

- Dimensionality reduction (PCA, UMAP)
- Bag-of-words and TF-IDF
- Word embeddings (Word2Vec, GloVe)
- Distributional semantics

</div>

<div class="definition-box" data-title="Central question">

*"You shall know a word by the company it keeps"*

How can we represent word *meaning* computationally?

</div>

<div class="tip-box" data-title="Prepare by">

- Completing Assignment 2
- Thinking about: What is "meaning"? How would you define it?
- Exploring: Vector representations and semantic similarity

</div>

---

# Additional resources

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Tools and libraries:**
- spaCy: https://spacy.io/
- HuggingFace Transformers: https://huggingface.co/docs/transformers/
- VADER Sentiment: https://github.com/cjhutto/vaderSentiment

</div>
<div style="flex: 1;">

**Datasets:**
- IMDb Movie Reviews: https://ai.stanford.edu/~amaas/data/sentiment/
- Amazon Product Reviews: https://registry.opendata.aws/amazon-reviews/
- Stanford Sentiment Treebank: https://nlp.stanford.edu/sentiment/

</div>
</div>

<div class="tip-box" data-title="Interactive demos">

HuggingFace Spaces: Try models in your browser! https://huggingface.co/spaces

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

<div class="tip-box" data-title="Congratulations!">

Week 2 complete! See you in Week 3!

</div>
