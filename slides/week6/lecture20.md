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
2. Explain how BERT improved Google Search and reshaped the NLP industry
3. Connect encoder representations to brain-imaging findings (fMRI encoding)
4. Evaluate whether language models "understand" or merely pattern-match
5. Describe systematic approaches to measuring bias in language models

</div>

---

# Recall and roadmap

<div class="note-box" data-title="From earlier lectures">

We introduced BERT's architecture in Lecture 12, explored what BERT actually learns in Lecture 18, and compared BERT variants (RoBERTa, ALBERT, DistilBERT, ELECTRA) in Lecture 19.

</div>

<div class="tip-box" data-title="Today's focus">

Today: how encoder models are *used* — in industry, in neuroscience, and in the ongoing debate about whether any of this counts as "understanding."

</div>

<div class="tip-box" data-title="Companion notebook">

📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/encoder_applications_demo.ipynb) — hands-on with classification, NER, QA, and sentence similarity

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

# Encoders in industry (2025)

<div class="note-box" data-title="Encoder models are everywhere — even if you don't see them">

The NLP market reached **$7.73 billion** in 2025. Most of that is powered by encoder models, not chatbots:

| Application | Scale | Architecture |
|-------------|-------|-------------|
| Google Search | 8.5B queries/day | BERT → MUM |
| Sentence-BERT | 700K+ downloads/day | Bi-encoder |
| Microsoft Bing | Billions of queries | DeBERTa-based |
| E5 / NV-Embed | Leading retrieval benchmarks | Encoder embeddings |
| Content moderation | Billions of posts/day | Fine-tuned RoBERTa |

</div>

<div class="important-box" data-title="Why not just use GPT-4?">

GPT-4 costs ~$30/M tokens and takes ~500ms per request. A fine-tuned DistilBERT handles classification at ~$0.01/M tokens and ~5ms per request. For high-volume, single-task workloads, encoders are **3,000× cheaper** and **100× faster**.

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

# Brain-LLM alignment frontiers

<div class="note-box" data-title="The relationship between LLMs and brains is deeper than expected">

[**Caucheteux & King (2022)**](https://doi.org/10.1038/s42003-022-03036-1): LLM activations predict brain activity in a **layer-specific** way — early model layers map to auditory cortex, deeper layers to high-level language areas. Published in *Communications Biology*.

[**Gao et al. (2025, *Nature Computational Science*)**](https://doi.org/10.1038/s43588-024-00752-6): "Brain-like" artificial neurons emerge in LLMs trained only on text — units that encode syntax, semantics, and even spatial concepts, mirroring brain organization.

</div>

<div class="definition-box" data-title="Mind's Transformer (Aw et al., 2026, ICLR)">

[The Mind's Transformer](https://openreview.net/forum?id=PgIlCCNxdB): Proposes that the brain implements a **Transformer-like** algorithm — not just analogous representations, but analogous *computation*. Attention-like gating and residual-stream-like updates appear across cortical circuits.

**Why this matters:** If the brain and LLMs converge on similar computational strategies, it suggests these are *good solutions* for processing sequential, context-dependent information — not just engineering coincidences.

</div>

---

# Understanding vs pattern matching

<div class="tip-box" data-title="The core philosophical question">

**Evidence FOR understanding:**
- Captures syntax and semantics automatically
- Resolves lexical ambiguity based on context
- Generalizes to unseen examples
- Predicts human brain activity patterns
- Layer structure mirrors human language processing hierarchy

**Evidence AGAINST understanding:**
- No grounding in the physical world
- No sensory or social experience
- Brittle to adversarial examples
- No causal reasoning
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

# Measuring bias systematically

<div class="note-box" data-title="Moving beyond anecdotes to systematic measurement">

Recall from Lecture 11 that word embeddings encode societal biases (e.g., "doctor" closer to "man," "nurse" closer to "woman"). BERT inherits these same biases from its training data. But how do we measure bias *systematically* across thousands of contexts?

</div>

<div class="definition-box" data-title="SAGED: systematic bias evaluation (Jiang et al., COLING 2025)">

[SAGED](https://aclanthology.org/2025.coling-main.202.pdf) proposes a five-step pipeline for measuring bias in language models:

1. **S**elect social groups (e.g., gender, race, age)
2. **A**ssemble evaluation contexts (template sentences)
3. **G**enerate model outputs for each group × context
4. **E**valuate using statistical tests (not cherry-picked examples)
5. **D**ocument findings with effect sizes and confidence intervals

**Key insight:** Individual examples (like doctor/nurse) are compelling but misleading. Systematic evaluation across thousands of contexts reveals that biases are *real but more nuanced* than anecdotes suggest.

</div>

---

# Limitations of current encoder models

<div class="warning-box" data-title="Despite impressive performance, significant limitations remain">

**Quadratic complexity**: Self-attention scales as $O(n^2)$ with sequence length, limiting context to 512–4096 tokens. (ModernBERT pushes this to 8,192 with Flash Attention.)

**No generation capability**: BERT is designed for understanding, not producing text. For generation tasks, use decoder models (GPT) or encoder-decoder models (T5, BART).

**Data hunger**: Pre-training requires billions of words. Humans learn language with orders of magnitude less data.

**No world model**: BERT learns statistical patterns in text but has no grounding in physical reality, sensory experience, or causal reasoning.

</div>

---

# Encoder vs decoder: the 2026 landscape

<div class="note-box" data-title="The architecture divide is narrowing">

| | Encoder (BERT) | Decoder (GPT) |
|---|---|---|
| **Training** | Masked language modeling | Autoregressive next-token |
| **Context** | Bidirectional | Left-to-right (causal) |
| **Best for** | Understanding tasks | Generation tasks |
| **Cost** | $0.01/M tokens | $1-30/M tokens |
| **Latency** | ~5ms | ~500ms |

</div>

<div class="tip-box" data-title="Where things are headed">

**Convergence:** Decoder-only models (GPT-4, Claude) now do classification via prompting. Meanwhile, encoder-decoder hybrids (T5, UL2) blur the distinction further. The field is converging toward flexible architectures that can handle both understanding and generation — but cost and speed still favor purpose-built encoders for production.

</div>

---

# Discussion

<div class="tip-box" data-title="Questions to consider">

1. **Understanding vs pattern matching:** If a model predicts brain activity, resolves ambiguity, and handles novel inputs — but has no physical experience — does it "understand"? What evidence would change your mind?

2. **The measurement problem:** SAGED shows bias is more nuanced than individual examples suggest. Does this make bias *less* concerning, or *more* concerning (because it's harder to detect)?

3. **Brain-model convergence:** If brains and LLMs independently converge on similar representations and computations, what does that tell us about the nature of language processing? Is there only one way to solve it?

4. **The cost-quality tradeoff:** GPT-4 can do anything an encoder can — but at 3,000× the cost. When does "good enough and cheap" beat "best and expensive"?

</div>

---
<!-- _class: scale-85 -->

# Further reading

<div class="note-box" data-title="Further reading">

[**Devlin et al. (2019, *NAACL*)**](https://aclanthology.org/N19-1423/) "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding" — The original BERT paper.

[**Caucheteux & King (2022, *Communications Biology*)**](https://doi.org/10.1038/s42003-022-03036-1) "Brains and algorithms partially converge in natural language processing" — Layer-specific brain-LLM alignment.

[**Aw et al. (2026, *ICLR*)**](https://openreview.net/forum?id=PgIlCCNxdB) "The Mind's Transformer" — Evidence that the brain implements Transformer-like computation.

[**Gao et al. (2025, *Nature Computational Science*)**](https://doi.org/10.1038/s43588-024-00752-6) "Brain-like artificial neurons in LLMs" — Emergent brain-like units in language models.

[**Jiang et al. (2025, *COLING*)**](https://aclanthology.org/2025.coling-main.202.pdf) "SAGED" — Systematic bias evaluation pipeline for language models.

[**Bender & Koller (2020, *ACL*)**](https://aclanthology.org/2020.acl-main.463/) "Climbing towards NLU" — The "understanding" debate.

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

Week 7: GPT and autoregressive generation — from decoder architecture to scaling laws

</div>
