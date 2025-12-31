---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Lecture 17: Applications of Encoder Models
## Week 6, Lecture 3 - From Theory to Practice

**PSYC 51.07: Models of Language and Communication**

Winter 2026

---

# Today's Agenda 📋



1. 🚀 **Real-World Applications**: Where BERT shines
2. 🧠 **Cognitive Neuroscience**: Brain-model parallels
3. 🤔 **Understanding vs. Pattern Matching**: The big debate
4. ⚠️ **Limitations**: What BERT can't do
5. 💡 **Practical Tips**: Deployment and optimization
6. 🔮 **Future Directions**: Where are we heading?

*Goal: Connect BERT to real applications and understand broader implications*

---

# BERT Applications 🚀



**BERT excels at understanding tasks:**

<div class="columns">
<div class="column">

**Classification Tasks:**
- Sentiment Analysis
- Topic Classification
- Spam Detection
- Intent Recognition

**Token-Level Tasks:**
- Named Entity Recognition (NER)
- Part-of-Speech Tagging
- Word Sense Disambiguation

</div>
<div class="column">

**Span-Level Tasks:**
- Question Answering
- Extractive Summarization
- Information Extraction

**Sentence-Pair Tasks:**
- Semantic Similarity
- Natural Language Inference
- Paraphrase Detection

</div>
</div>

<div class="callout info">
<div class="callout-title">Industry Impact</div>

BERT powers:
- Google Search (understanding queries)
- Customer service chatbots
- Content moderation
- Document understanding

</div>


---

# Case Study: Google Search 🔍


**BERT revolutionized search in 2019**

**Problem:**
- Search queries often depend on context and word order
- Traditional keyword matching misses nuance
- Example: "2019 brazil traveler to usa need a visa"

<div class="columns">
<div class="column">

**Before BERT:**
- Focused on "brazil" and "usa"
- Missed importance of "to"
- Returned results about US travelers to Brazil

\includegraphics[width=0.9\textwidth]{example-image-a}

 Wrong: US → Brazil

</div>
<div class="column">

**With BERT:**
- Understands "to" is critical
- Grasps full context and direction
- Returns correct results about Brazilian travelers to US

\includegraphics[width=0.9\textwidth]{example-image-b}

 Correct: Brazil → US

</div>
</div>

*Google reported BERT improved 1 in 10 searches in English*

---

# Question Answering with BERT 💬


**Extractive QA: Find answer span in passage**

<div class="callout tip">
<div class="callout-title">Example</div>

**Context:** "The Normans (Norman: Nourmands; French: Normands; Latin: Normanni) were the people who in the 10th and 11th centuries gave their name to Normandy, a region in France."

**Question:** "In what country is Normandy located?"

**Answer:** France

</div>

```python
from transformers import pipeline

# Load QA pipeline with BERT
qa_pipeline = pipeline("question-answering", model="bert-large-uncased-whole-word-masking-finetuned-squad")

# Ask question
result = qa_pipeline(
    question="In what country is Normandy located?",
    context="The Normans were the people who in the 10th and 11th centuries gave their name to Normandy, a region in France."
)

print(result)
# {'answer': 'France', 'score': 0.987, 'start': 134, 'end': 140}
```

**BERT predicts start and end positions of the answer span!**

---

# Named Entity Recognition 🏷️


**Token-level classification task**

<div class="callout tip">
<div class="callout-title">Example</div>

**Input:** "Apple Inc. is headquartered in Cupertino, California."

**Output:**
- Apple Inc. → {ORGANIZATION}
- Cupertino → {LOCATION}
- California → {LOCATION}

</div>

```python
from transformers import pipeline

# Load NER pipeline
ner_pipeline = pipeline("ner", model="dslim/bert-base-NER")

# Extract entities
text = "Apple Inc. is headquartered in Cupertino, California."
entities = ner_pipeline(text)

for entity in entities:
    print(f"{entity['word']}: {entity['entity']} (score: {entity['score']:.2f})")

# Output:
# Apple: B-ORG (score: 0.99)
# Inc: I-ORG (score: 0.99)
# Cupertino: B-LOC (score: 0.99)
# California: B-LOC (score: 0.99)
```


---

# Sentiment Analysis 😊😐😢


**Sequence classification task**

<div class="callout tip">
<div class="callout-title">Examples</div>

- "This movie was absolutely amazing!" → {POSITIVE}
- "The product broke after one week." → {NEGATIVE}
- "The weather is cloudy today." → {NEUTRAL}

</div>

```python
from transformers import pipeline

# Load sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# Analyze sentiments
texts = [
    "This movie was absolutely amazing!",
    "The product broke after one week.",
    "The weather is cloudy today."
]

for text in texts:
    result = sentiment_pipeline(text)[0]
    print(f"{text}")
    print(f"  → {result['label']} (confidence: {result['score']:.2f})\n")
```

**Applications:** Customer reviews, social media monitoring, brand sentiment

---

# Semantic Similarity 🔗


**Measuring sentence similarity with BERT embeddings**

```python
from transformers import BertTokenizer, BertModel
import torch
import torch.nn.functional as F

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def get_sentence_embedding(sentence):
    inputs = tokenizer(sentence, return_tensors='pt', padding=True, truncation=True)
    outputs = model(**inputs)
    # Use [CLS] token embedding as sentence representation
    return outputs.last_hidden_state[:, 0, :]

# Compare sentences
sent1 = "The cat is sleeping on the couch"
sent2 = "A feline is resting on the sofa"
sent3 = "The weather is nice today"

emb1 = get_sentence_embedding(sent1)
emb2 = get_sentence_embedding(sent2)
emb3 = get_sentence_embedding(sent3)

# Compute cosine similarities
sim_12 = F.cosine_similarity(emb1, emb2).item()
sim_13 = F.cosine_similarity(emb1, emb3).item()

print(f"Similarity (1-2): {sim_12:.3f}")  # High (paraphrases)
print(f"Similarity (1-3): {sim_13:.3f}")  # Low (different topics)
```


---

# Cognitive Neuroscience Perspective 🧠


**How do brains and models process language?**

<div class="columns">
<div class="column">

**Predictive Processing in the Brain:**
- Brain constantly predicts upcoming input
- N400: Neural response to unexpected words
- P600: Syntactic anomaly detection
- Context shapes predictions
- Prediction errors drive learning

**Key Brain Regions:**
- **Left IFG**: Syntax processing
- **Left STG/MTG**: Semantic processing
- **ATL**: Conceptual knowledge

</div>
<div class="column">

**Predictive Processing in Models:**
- BERT: Predict masked words
- GPT: Predict next word
- Both use context to predict
- Surprise = high loss
- Gradient descent = learning

**Similarities:**
- Both hierarchical
- Both context-sensitive
- Both predictive
- Both learn from errors

</div>
</div>

*References: Kuperberg & Jaeger (2016), Willems et al. (2016), Hagoort & Indefrey (2014)*

---

# Prediction in Brains vs. Language Models 🧠🤖


**Parallels between neural and artificial systems**

| p{5cm}} Human Brain | Transformer Models |
| --- | --- |
| (surprise at unexpected word) | High cross-entropy loss |
| (low probability prediction) |
| (sounds → words → sentences) | Layer-by-layer representations |
| (tokens → phrases → meaning) |
| (prior discourse, world knowledge) | Self-attention mechanism |
| (attend to relevant context) |
| (population coding) | Distributed embeddings |
| (vector representations) |

**Question:** Are these superficial analogies or deep connections?

*Reference: Kuperberg & Jaeger (2016) - "What do we mean by prediction in language comprehension?"*

---

# Neural Encoding with Language Models 🔬


**Can we predict brain activity from language models?**

**Approach:**
1. Show participants text while recording brain activity (fMRI/EEG)
2. Extract representations from language model (e.g., BERT layer 6)
3. Train regression model: Model embeddings → Brain activity
4. Test: Can we predict brain responses to new text?

**Findings:**
- **Better models → Better brain prediction**
- BERT outperforms Word2Vec at predicting brain activity
- Different layers correlate with different brain regions
- Middle layers best for semantic areas
- Suggests shared representations?

<div class="callout warning">
<div class="callout-title">But...</div>

Correlation ≠ Causation! Models might capture statistical regularities that brains use, without using the same mechanisms.

</div>

*Reference: Willems et al. (2016) - "Prediction during natural language comprehension"*

---

# Discussion: What Does the Model "Understand"? 🤔



**Does BERT understand language?**

<div class="columns">
<div class="column">

**Evidence FOR understanding:**
- Captures syntax and semantics
- Resolves ambiguity
- Handles long-range dependencies
- Generalizes to new examples
- Predicts brain activity
- Solves complex tasks

*"If it acts like it understands, maybe it does?"*

</div>
<div class="column">

**Evidence AGAINST understanding:**
- No grounding in physical world
- No sensory experience
- No social context
- Brittle to adversarial examples
- No common sense reasoning
- Only pattern matching?

*"Understanding requires more than statistical patterns"*

</div>
</div>

<div class="callout info">
<div class="callout-title">Key Questions</div>

- What is the difference between understanding and correlation?
- Can meaning exist without grounding?
- Is human understanding fundamentally different?

</div>

**Class Discussion: What do YOU think?**

---

# Adversarial Examples and Brittleness ⚠️


**BERT can be fooled easily**

<div class="callout tip">
<div class="callout-title">Example: Sentiment Analysis</div>

**Original:** "This movie was great!"

**Prediction:** POSITIVE ✓

**Modified:** "This movie was great! [SEP] terrible terrible terrible terrible"

**Prediction:** NEGATIVE ✗

Just adding repeated negative words after [SEP] flips the prediction!

</div>

<div class="callout warning">
<div class="callout-title">Other Brittleness Issues</div>

- **Word substitutions**: Replace "good" with synonym "excellent" → wrong prediction
- **Paraphrases**: Semantically equivalent but different words → different predictions
- **Meaningless additions**: Add irrelevant text → changes prediction
- **Typos and noise**: Small perturbations cause large errors

</div>

**Implication:** Models learn spurious patterns, not robust understanding

---

# Limitations of Current Models ⚠️


**Despite impressive performance, transformers have limitations:**

1. **Quadratic Complexity**
    - Self-attention scales as $O(n^2)$
- Limited context windows (512-4096 tokens)
- Cannot process very long documents efficiently
2. **No True Understanding**
    - Pattern matching vs. comprehension
- Lack of common sense
- No world model
3. **Data Efficiency**
    - Requires massive training data
- Humans learn language with much less data
- Not biologically plausible
4. **Biases and Fairness**
    - Inherits biases from training data
- Can amplify stereotypes
- Ethical concerns


---

# Bias in Language Models ⚖️


**Models reflect and can amplify societal biases**

<div class="callout warning">
<div class="callout-title">Examples of Bias</div>

- **Gender bias:**
    
- "The doctor said [MASK] was running late" → he (90%)
- "The nurse said [MASK] was running late" → she (80%)

    \item **Occupational stereotypes:**
    - Associates certain jobs with certain genders
- "Programmer" → male pronouns
- "Secretary" → female pronouns

    \item **Racial bias:**
    - Different sentiment for names associated with different races
- Can perpetuate harmful stereotypes

</div>

**Mitigation Strategies:**
- Debiasing techniques during training
- Balanced and diverse training data
- Post-processing and filtering
- Human oversight and auditing
- Ongoing research area!


---

# Practical Tips for Working with Transformers 💡


1. **Start with Pre-trained Models**
    - Don't train from scratch (too expensive!)
- Use HuggingFace Model Hub
- Choose appropriate model size
2. **Fine-tuning Best Practices**
    - Use small learning rate (1e-5 to 5e-5)
- Add warmup steps
- Monitor for overfitting
- Freeze early layers if data is limited
3. **Computational Efficiency**
    - Use mixed precision training (FP16)
- Gradient accumulation for larger batch sizes
- Consider DistilBERT for faster inference
- Use FlashAttention when available
4. **Evaluation**
    - Use task-specific metrics
- Test on out-of-distribution data
- Check for biases
- Visualize attention for interpretability


---

# Deployment Considerations 🚀


**Moving from research to production**

1. **Model Selection**
    - Balance quality vs. speed
- DistilBERT for low-latency applications
- BERT-Base for balanced performance
- BERT-Large when quality is critical

    

2. **Optimization**
    - Quantization: FP32 → INT8 (4x smaller, faster)
- Model pruning: Remove unnecessary weights
- Knowledge distillation: Compress to smaller model
- ONNX Runtime for optimized inference

    

3. **Infrastructure**
    - GPU acceleration for batch processing
- CPU optimization for single requests
- Caching for repeated queries
- Load balancing for high traffic

    

4. **Monitoring**
    - Track latency and throughput
- Monitor prediction quality
- Detect distribution drift
- A/B testing for improvements


---

# Future Directions 🔮


**Where is the field heading?**

1. **Longer Context**
    - Efficient attention mechanisms (linear, sparse)
- Models with 100K+ token context
- Better long-document understanding

    

2. **Multimodal Models**
    - Vision + Language (CLIP, DALL-E)
- Audio + Language (Whisper)
- Grounded understanding

    

3. **Better Pre-training**
    - More efficient objectives
- Curriculum learning
- Continual learning

    

4. **Smaller, More Efficient Models**
    - Better compression techniques
- Lottery ticket hypothesis
- Edge deployment

    

5. **Addressing Limitations**
    - Debiasing and fairness
- Robustness and adversarial training
- Common sense reasoning
- Interpretability and explainability


---

# Encoder vs Decoder Models Revisited 🔄


**Different models for different tasks**

| p{4.5cm}} | Encoder (BERT) | Decoder (GPT) |
| --- | --- | --- |
| • Classification |
| • NER, QA |
| • Similarity | Generation tasks: |
| • Text completion |
| • Dialogue |
| • Creative writing |

**Interesting observation:**
- Decoder-only models (GPT-3, LLaMA) can also do classification via prompting!
- "In-context learning" blurs the distinction
- Trend toward unified decoder-only architectures


---

# Discussion Questions 💭


1. **Understanding vs. Pattern Matching:**
    - Where do you draw the line?
- Is there a test for "true" understanding?
- Does it matter for applications?

    

2. **Brain-Model Parallels:**
    - How useful are these comparisons?
- What can neuroscience learn from AI?
- What can AI learn from neuroscience?

    

3. **Bias and Fairness:**
    - Who is responsible for addressing bias?
- Can we ever have completely unbiased models?
- How do we balance accuracy and fairness?

    

4. **Future of NLP:**
    - Will encoder models remain relevant?
- Are decoder-only models the future?
- What's the next big breakthrough?


---

# Assignment 4: Context-Aware Models 📝


**Hands-on experience with transformers!**

**Tasks:**
1. **Implement Attention Mechanism**
    - Build scaled dot-product attention from scratch
- Visualize attention weights
2. **Fine-tune BERT**
    - Load pre-trained BERT
- Fine-tune on sentiment analysis
- Compare to baseline models
3. **Analyze Contextual Embeddings**
    - Extract embeddings for polysemous words
- Visualize how context changes representations
- Compare BERT vs Word2Vec
4. **Explore Different Architectures**
    - Compare BERT (encoder) vs GPT (decoder)
- Test on different tasks
- Analyze strengths/weaknesses
5. **Research Component**
    - Read one paper from references
- Write brief summary & critical analysis

**Due:** Check course website for deadline

---

# Summary: Weeks 5-6 🎯


**What we learned:**

1. **Evolution of Context**
    - Seq2Seq → Attention → Transformers
- From bottleneck to full parallelization
2. **Transformer Architecture**
    - Self-attention, multi-head attention
- Positional encoding, layer norm, residuals
- Encoder-only (BERT), Decoder-only (GPT), Both (T5)
3. **BERT & Variants**
    - Masked Language Modeling
- Pre-train then fine-tune paradigm
- RoBERTa, ALBERT, DistilBERT, ELECTRA
4. **Applications**
    - Classification, NER, QA, similarity
- Real-world impact (Google Search, etc.)
5. **Broader Implications**
    - Brain-model parallels
- Understanding vs. pattern matching
- Limitations and future directions


---

# Resources \& Further Reading 📚


**Key Papers:**
- Vaswani et al. (2017) - Attention Is All You Need
- Devlin et al. (2019) - BERT: Pre-training of Deep Bidirectional Transformers
- Liu et al. (2019) - RoBERTa
- Sanh et al. (2019) - DistilBERT
- Dao et al. (2022) - FlashAttention

**Cognitive Neuroscience:**
- Hagoort & Indefrey (2014) - The neurobiology of language beyond single words
- Kuperberg & Jaeger (2016) - What do we mean by prediction in language comprehension?
- Willems et al. (2016) - Prediction during natural language comprehension

**Tutorials:**
- HuggingFace Course: Chapters 1, 7
- The Illustrated Transformer: https://jalammar.github.io/illustrated-transformer/
- BertViz: https://github.com/jessevig/bertviz


---

# Looking Forward in the Course 🔮


**Where do we go from here?**

**Upcoming Topics:**
- **Week 7:** Decoder models and text generation (GPT family)
- **Week 8:** Scaling laws and large language models
- **Week 9:** Prompting, in-context learning, and instruction tuning
- **Week 10:** Alignment, RLHF, and ethical considerations

**The Journey Continues:**
- From understanding (BERT) to generation (GPT)
- From supervised learning to few-shot learning
- From narrow tasks to general-purpose models
- From academic research to societal impact

**The transformer revolution continues! 🚀**


---

# Questions? 🙋



**Discussion Time**

**Topics to discuss:**
- BERT applications
- Understanding vs. pattern matching
- Cognitive neuroscience connections
- Limitations and future work
- Assignment 4 questions

Thank you! 🙏

See you in Week 7 for GPT and text generation!

