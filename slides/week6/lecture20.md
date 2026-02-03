---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 20: Applications of encoder models
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Apply BERT to real-world NLP tasks: classification, NER, QA, and semantic similarity
2. Explain how BERT improved Google Search
3. Connect transformer representations to cognitive neuroscience findings
4. Evaluate the "understanding vs pattern matching" debate
5. Identify limitations and biases in deployed language models

</div>

---

# Where BERT excels

<div class="note-box" data-title="BERT powers a wide range of understanding tasks">

**Classification tasks:** Sentiment analysis, topic classification, spam detection, intent recognition

**Token-level tasks:** Named entity recognition (NER), part-of-speech tagging, word sense disambiguation

**Span-level tasks:** Question answering, extractive summarization, information extraction

**Sentence-pair tasks:** Semantic similarity, natural language inference, paraphrase detection

</div>

<div class="important-box" data-title="Industry impact">

BERT powers Google Search (understanding queries), customer service chatbots, content moderation systems, and document understanding pipelines at companies worldwide.

</div>

---
<!-- _class: scale-90 -->

# Case study: Google Search

<div class="definition-box" data-title="BERT revolutionized search in 2019">

Before BERT, search engines primarily matched keywords. BERT enabled Google to understand *how words relate to each other* — especially prepositions, negations, and context words.

</div>

<div class="example-box" data-title="Why word order matters">

```python
query = "2019 brazil traveler to usa need a visa"

# Before BERT (keyword matching):
# Matches both "US traveler to Brazil" AND "Brazil traveler to US"

# With BERT (contextual understanding):
# Understands "to USA" means the traveler's DESTINATION is the US
# Correctly ranks: "Brazil citizen visa requirements for USA"
```

</div>

<div class="note-box" data-title="More examples of context-sensitive queries">

| Query | Before BERT | With BERT |
|-------|-------------|-----------|
| "can you get medicine for someone pharmacy" | Generic pharmacy results | Picking up prescriptions for others |
| "do estheticians stand a lot at work" | Job listings | Physical demands of the job |
| "parking on a hill with no curb" | Parking tickets | How to park safely without a curb |

Google reported BERT improved 1 in 10 English searches.

</div>

---
<!-- _class: scale-85 -->

# Question answering with BERT

<div class="example-box" data-title="Extractive QA: find the answer span in a passage">

```python
from transformers import pipeline

qa = pipeline("question-answering",
              model="bert-large-uncased-whole-word-masking-finetuned-squad")

result = qa(
    question="In what country is Normandy located?",
    context="The Normans were the people who in the 10th and 11th centuries "
            "gave their name to Normandy, a region in France."
)
print(result)
# {'answer': 'France', 'score': 0.987, 'start': 134, 'end': 140}
```

</div>

<div class="note-box" data-title="How it works">

BERT predicts two things for each token in the passage: the probability that it's the **start** of the answer, and the probability that it's the **end** of the answer. The answer span is the highest-scoring (start, end) pair.

</div>

---
<!-- _class: scale-85 -->

# Named entity recognition

<div class="example-box" data-title="Token-level classification with BERT">

```python
from transformers import pipeline

ner = pipeline("ner", model="dslim/bert-base-NER")

text = "Apple Inc. is headquartered in Cupertino, California."
entities = ner(text)

for e in entities:
    print(f"{e['word']}: {e['entity']} (score: {e['score']:.2f})")
# Apple: B-ORG (0.99)
# Inc:   I-ORG (0.99)
# Cupertino:  B-LOC (0.99)
# California: B-LOC (0.99)
```

</div>

<div class="note-box" data-title="BIO tagging scheme">

- **B-** prefix: Beginning of an entity
- **I-** prefix: Inside (continuation) of an entity
- **O**: Outside any entity
- Entity types: PER (person), ORG (organization), LOC (location), MISC (miscellaneous)

</div>

---
<!-- _class: scale-85 -->

# Sentiment analysis

<div class="example-box" data-title="Sequence classification with BERT">

```python
from transformers import pipeline

sentiment = pipeline("sentiment-analysis",
                     model="distilbert-base-uncased-finetuned-sst-2-english")

texts = [
    "This movie was absolutely amazing!",
    "The product broke after one week.",
    "The weather is cloudy today."
]

for text in texts:
    result = sentiment(text)[0]
    print(f"{text}")
    print(f"  → {result['label']} (confidence: {result['score']:.2f})")
```

</div>

<div class="tip-box" data-title="Applications">

Sentiment analysis powers customer review analysis, social media monitoring, brand reputation tracking, and financial market sentiment indicators.

</div>

---
<!-- _class: scale-85 -->

# Semantic similarity

<div class="example-box" data-title="Measuring sentence similarity with BERT embeddings">

```python
from transformers import BertTokenizer, BertModel
import torch.nn.functional as F

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def get_sentence_embedding(sentence):
    inputs = tokenizer(sentence, return_tensors='pt', padding=True, truncation=True)
    outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :]  # [CLS] token

sent1 = "The cat is sleeping on the couch"
sent2 = "A feline is resting on the sofa"     # Paraphrase
sent3 = "The weather is nice today"            # Unrelated

emb1, emb2, emb3 = [get_sentence_embedding(s) for s in [sent1, sent2, sent3]]

print(f"Paraphrase similarity: {F.cosine_similarity(emb1, emb2).item():.3f}")  # High
print(f"Unrelated similarity:  {F.cosine_similarity(emb1, emb3).item():.3f}")  # Low
```

</div>

---

# Cognitive neuroscience perspective

<div class="definition-box" data-title="How do brains and models process language?">

Both biological brains and transformer models process language through **predictive processing** — constantly anticipating upcoming input based on context.

**In the brain:**
- The N400 ERP component reflects surprise at unexpected words
- Left inferior frontal gyrus (IFG) handles syntax
- Left superior temporal gyrus (STG/MTG) handles semantics
- Prediction errors drive learning and adaptation

**In transformer models:**
- Cross-entropy loss measures surprise at each token
- Lower layers encode syntax, upper layers encode semantics
- Gradient descent optimizes predictions
- Both systems are hierarchical, context-sensitive, and predictive

</div>

---

# Prediction in brains vs language models

<div class="note-box" data-title="Parallels between neural and artificial systems">

| Phenomenon | Human brain | Transformer models |
|------------|-------------|-------------------|
| **Surprise** | N400 amplitude (EEG) | Cross-entropy loss |
| **Hierarchy** | Sounds → words → sentences | Tokens → phrases → meaning |
| **Context** | Prior discourse + world knowledge | Self-attention over sequence |
| **Representation** | Population coding (neurons) | Distributed embeddings (vectors) |

</div>

<div class="example-box" data-title="The N400 / surprisal parallel">

```python
sentence_a = "I take my coffee with cream and sugar"   # Expected
sentence_b = "I take my coffee with cream and socks"   # Surprising!

# Brain: N400 amplitude much higher for "socks"
# Model: Higher cross-entropy loss for "socks"

surprisal = -np.log(model.predict_prob("socks", context))
# Surprisal correlates with N400 amplitude in EEG studies!
```

</div>

---
<!-- _class: scale-85 -->

# Neural encoding with language models

<div class="example-box" data-title="Can we predict brain activity from BERT representations?">

```python
# Neural encoding experiment workflow
import numpy as np
from transformers import BertModel

# 1. Participant reads sentences while in fMRI scanner
sentences = ["The dog chased the cat", "She opened the door", ...]
brain_activity = fmri_scanner.record(sentences)  # (n_sentences, n_voxels)

# 2. Extract BERT representations for same sentences
bert = BertModel.from_pretrained("bert-base-uncased")
bert_embeddings = []
for sent in sentences:
    outputs = bert(tokenizer(sent, return_tensors="pt"))
    bert_embeddings.append(outputs.hidden_states[8].mean(dim=1))  # Layer 8

# 3. Train encoding model: BERT representations → brain activity
from sklearn.linear_model import Ridge
encoder = Ridge().fit(bert_embeddings[:80], brain_activity[:80])

# 4. Predict brain activity for held-out sentences
predictions = encoder.predict(bert_embeddings[80:])
correlation = np.corrcoef(predictions.flat, brain_activity[80:].flat)[0,1]
# Correlation ~ 0.3–0.5 in language areas (statistically significant!)
```

**Key finding:** BERT layer 8 best predicts semantic brain areas; layers 2–4 predict phonological areas.

</div>

---

# Understanding vs pattern matching

<div class="tip-box" data-title="Questions to consider">

**Evidence FOR understanding:**
- Captures syntax and semantics automatically
- Resolves lexical ambiguity based on context
- Handles long-range dependencies
- Generalizes to unseen examples
- Predicts brain activity patterns

**Evidence AGAINST understanding:**
- No grounding in the physical world
- No sensory or social experience
- Brittle to adversarial examples
- No common sense reasoning
- Might be "just" sophisticated pattern matching

**The key question:** Is there a meaningful difference between "understanding" and "very good pattern matching"? Does it matter for applications?

</div>

---
<!-- _class: scale-85 -->

# Adversarial examples and brittleness

<div class="example-box" data-title="BERT can be fooled by simple tricks">

```python
from transformers import pipeline
classifier = pipeline("sentiment-analysis")

# Works correctly
classifier("This movie was absolutely wonderful!")
# → POSITIVE (0.9998)

# Adding irrelevant negative words flips the prediction!
classifier("This movie was absolutely wonderful! [SEP] bad bad bad bad")
# → NEGATIVE (0.9234)  # WRONG!

# Synonym substitution changes confidence
classifier("The food was good")  # → POSITIVE (0.99)
classifier("The food was fine")  # → POSITIVE (0.72)  # Less confident
classifier("The food was ok")    # → NEGATIVE (0.51)  # Flipped!
```

</div>

<div class="warning-box" data-title="Implications for deployment">

- **Adversarial attacks**: Malicious users can manipulate model predictions
- **Robustness testing**: Always test with perturbed inputs before deployment
- **Defense strategies**: Adversarial training, input validation, ensemble methods

</div>

---

# Bias in language models

<div class="warning-box" data-title="Models reflect and amplify societal biases">

BERT inherits biases from its training data (books and Wikipedia contain historical biases):

- Gender bias in occupations: "The doctor said [MASK] would be late" → "he" (62%) vs "she" (18%)
- "The nurse said [MASK] would be late" → "she" (71%) vs "he" (15%)
- Racial bias in sentiment: Different confidence scores for identical sentences with different names

</div>

<div class="note-box" data-title="Mitigation strategies">

1. **Data-level**: Balanced training corpora, counterfactual data augmentation
2. **Model-level**: Debiasing loss functions, fine-tuning on balanced datasets
3. **Output-level**: Post-hoc filtering, human review for sensitive applications
4. **Evaluation**: Regular bias audits using standardized benchmarks (WinoBias, StereoSet)

</div>

---

# Limitations of current encoder models

<div class="warning-box" data-title="Despite impressive performance, significant limitations remain">

**Quadratic complexity**: Self-attention scales as $O(n^2)$ with sequence length, limiting context to 512–4096 tokens.

**No generation capability**: BERT is designed for understanding, not producing text. For generation tasks, use decoder models (GPT) or encoder-decoder models (T5, BART).

**Data hunger**: Pre-training requires billions of words. Humans learn language with orders of magnitude less data.

**No world model**: BERT learns statistical patterns in text but has no grounding in physical reality, sensory experience, or causal reasoning.

**Fragility**: Small input perturbations can cause large output changes, making models unreliable in adversarial settings.

</div>

---

# Practical deployment tips

<div class="tip-box" data-title="Making BERT work in production">

**Start with pre-trained models** — never train from scratch. Use HuggingFace Model Hub.

**Fine-tuning best practices:**
- Learning rate: 1e-5 to 5e-5 (much lower than pre-training)
- Warmup steps: 6–10% of total training steps
- Monitor for overfitting; freeze early layers if data is limited
- 3–5 epochs is usually sufficient

**Optimization for speed:**
- Use DistilBERT for 60% faster inference with 97% quality
- Quantization (INT8) gives 2–4× speedup with minimal quality loss
- Export to ONNX Runtime for production serving
- Use FlashAttention when available

</div>

<div class="note-box" data-title="Optimization results">

| Optimization | Size | Latency | Quality |
|-------------|------|---------|---------|
| Original (FP32) | 420MB | 50ms | 100% |
| Quantized (INT8) | 110MB | 25ms | 99.5% |
| DistilBERT + ONNX | 65MB | 12ms | 97% |

</div>

---

# Encoder vs decoder: looking ahead

<div class="note-box" data-title="Different architectures for different tasks">

| | Encoder (BERT) | Decoder (GPT) |
|---|---|---|
| **Training** | Masked language modeling | Autoregressive next-token |
| **Context** | Bidirectional | Left-to-right (causal) |
| **Best for** | Understanding tasks | Generation tasks |
| **Examples** | Classification, NER, QA, similarity | Text completion, dialogue, creative writing |

**Interesting trend:** Decoder-only models (GPT-3, LLaMA) can also do classification via prompting. "In-context learning" blurs the distinction between understanding and generation architectures. The field is moving toward unified decoder-only models.

</div>

---

# Discussion

<div class="tip-box" data-title="Questions to consider">

1. **Understanding vs pattern matching:** Where do you draw the line? Is there a test for "true" understanding? Does it matter if the application works?

2. **Brain-model parallels:** How useful are comparisons between transformers and the brain? What can neuroscience learn from AI, and vice versa?

3. **Bias and fairness:** Who is responsible for addressing bias in language models? Can we ever have completely unbiased models? How do we balance accuracy and fairness?

4. **The future of encoder models:** Will BERT-style encoders remain relevant as GPT-style decoders get better at everything? Or do understanding and generation require fundamentally different approaches?

</div>

---

# References

<div class="note-box" data-title="Further reading">

[**Devlin et al. (2019, *NAACL*)**](https://aclanthology.org/N19-1423/) "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"

[**Caucheteux & King (2022, *Nature Communications*)**](https://doi.org/10.1038/s41467-022-28236-3) "Brains and algorithms partially converge in natural language processing"

[**Kuperberg & Jaeger (2016, *Language, Cognition and Neuroscience*)**](https://doi.org/10.1080/23273798.2015.1102299) "What do we mean by prediction in language comprehension?"

[**Bender & Koller (2020, *ACL*)**](https://aclanthology.org/2020.acl-main.463/) "Climbing towards NLU: On Meaning, Form, and Understanding in the Age of Data"

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

Week 7: GPT and autoregressive generation — from decoder architecture to text generation

</div>
