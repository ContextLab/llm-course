---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 20: Encoders in the real world
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
4. Analyze the societal consequences of cheap, accurate text classification at scale
5. Evaluate what brain-model convergence implies about the nature of language itself

</div>

---

# Novel encoder applications beyond NLP

<div class="note-box" data-title="Encoders power specialized domains where decoders are overkill">

**Clinical NLP:** De-identification of medical records, ICD code prediction, adverse drug event detection. [BioBERT](https://arxiv.org/abs/1901.08746) and [PubMedBERT](https://arxiv.org/abs/2007.15779) process millions of clinical notes daily.

**Legal tech:** Contract clause extraction, case law search, regulatory compliance checking. Fine-tuned encoders scan thousands of documents in seconds.

**Financial NER:** Extracting company names, monetary amounts, and dates from earnings calls and SEC filings. Bloomberg's internal models process billions of financial documents.

**Scientific literature:** [ChemBERTa](https://arxiv.org/abs/2010.09885) predicts molecular properties from SMILES strings. [SciBERT](https://arxiv.org/abs/1903.10676) powers semantic search across 100M+ papers.

</div>

<div class="tip-box" data-title="Companion notebook">

📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/encoder_applications_demo.ipynb) — hands-on with classification, NER, QA, and sentence similarity

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

# Sentence-BERT and modern retrieval

<div class="definition-box" data-title="Scaling sentence similarity to millions of documents">

Using BERT's [CLS] token for sentence similarity requires passing **both sentences through BERT together** — $O(n^2)$ comparisons for $n$ sentences. [Sentence-BERT](https://arxiv.org/abs/1908.10084) (Reimers & Gurevych, 2019) uses a **siamese architecture** that encodes sentences **independently**, then compares with cosine similarity.

</div>

<div class="example-box" data-title="Practical sentence embeddings">

```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')

sentences = ["The cat sat on the mat", "A feline rested on the rug"]
embeddings = model.encode(sentences)

from sklearn.metrics.pairwise import cosine_similarity
sim = cosine_similarity([embeddings[0]], [embeddings[1]])  # ~0.82
```

</div>

<div class="note-box" data-title="The evolution of text embeddings">

Sentence-BERT (2019) → [E5](https://arxiv.org/abs/2212.03533) (2022) → [NV-Embed](https://arxiv.org/abs/2405.17428) (2024). The [MTEB benchmark](https://huggingface.co/spaces/mteb/leaderboard) now ranks 200+ embedding models. Sentence embeddings power semantic search, RAG retrieval (Lecture 17), and recommendation systems at scale.

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
<!-- _class: scale-80 -->

# What language actually does

<div class="note-box" data-title="Language is wireless brain activity transmission">

Your brain lives in your skull — a vat of bone filled with fluid that is essentially seawater. It can't directly connect with anything on the outside. Everything you know about the world comes through sensors that *construct* a representation of reality, not measure it (recall Lecture 1: language shapes what we literally *see*). In the most fundamental sense, we are brains floating in vats, always alone.

Language breaks through that isolation. When you speak, you compress the electrical patterns across your hundred billion neurons into a few words per second — an extraordinarily lossy channel. The listener's brain unpacks those vibrations into neural activity of its own. [Stephens et al. (2010)](https://doi.org/10.1073/pnas.1008662107) showed that successful communication literally *replicates the speaker's brain activity patterns in the listener's brain*, with the listener's responses temporally coupled to — and sometimes *anticipating* — the speaker's.

</div>

<div class="tip-box" data-title="Why this reframes everything that follows">

If language is fundamentally about transmitting brain states through a lossy channel, then BERT's ability to capture those patterns isn't just an engineering trick — it's a compression algorithm that learned the same code brains use. The societal questions ahead aren't only about *technology*. They're about what happens when a machine can read and write in the language of human thought.

</div>

---

# When fluency is free

<div class="warning-box" data-title="What happens to institutions built on the assumption that writing is hard?">

A student submits a well-structured essay on Shakespeare's use of irony in *Othello*. The prose is clear, the argument is coherent, the citations are accurate. The student spent 45 seconds generating it with an encoder-powered writing assistant. A classmate spent 8 hours writing a messier but more original essay. They receive the same grade.

</div>

<div class="tip-box" data-title="Discussion: the purpose of writing">

The essay wasn't invented to produce text — it was invented to produce *thinking*. The struggle of organizing an argument, finding the right word, and revising a draft is where learning happens. If the output is indistinguishable but the process is absent, what did the student learn?

**Consider:** Is the problem that AI can write, or that we've been grading the *product* instead of the *process*? What would assessment look like if fluent text were free?

</div>

---
<!-- _class: scale-85 -->

# Classification as labor

<div class="note-box" data-title="Encoders are replacing human judgment at scale">

Content moderation at Meta employs thousands of human reviewers who screen posts for violence, hate speech, and self-harm — work linked to [PTSD and psychological trauma](https://www.theverge.com/2019/2/25/18229714/cognizant-facebook-content-moderator-interviews-trauma-working-conditions-arizona). Fine-tuned RoBERTa models now handle billions of these classifications daily.

**Medical coding:** Assigning ICD-10 codes to clinical notes was a $16B/year industry employing 300,000+ human coders. BERT-based systems achieve 92% accuracy on common codes — not perfect, but faster and cheaper.

**Legal discovery:** Reviewing documents for relevance in litigation once required armies of junior lawyers billing $200/hour. Encoder models scan millions of documents in hours.

</div>

<div class="tip-box" data-title="Discussion: the 'good enough' threshold">

When is 91% accuracy acceptable? When is it dangerous? Content moderation at 91% means ~340 million misclassified posts per day on a platform with 3.7B daily posts. Who is accountable for the errors — the model, the deployer, or the person who decided 91% was "good enough"?

</div>

---
<!-- _class: scale-90 -->

# Measuring harm at scale

<div class="note-box" data-title="From anecdotes to methodology">

In Lecture 11, we saw that word embeddings encode bias ("doctor"→"man," "nurse"→"woman"). In Lecture 18, we saw that BERT inherits these biases. But individual examples are *anecdotes*, not evidence. How do we measure bias *systematically*?

</div>

<div class="definition-box" data-title="SAGED: systematic bias evaluation (Jiang et al., COLING 2025)">

[SAGED](https://aclanthology.org/2025.coling-main.202.pdf) proposes a five-step pipeline:

1. **S**elect social groups (e.g., gender, race, age)
2. **A**ssemble evaluation contexts (template sentences across domains)
3. **G**enerate model outputs for each group × context
4. **E**valuate using statistical tests (not cherry-picked examples)
5. **D**ocument findings with effect sizes and confidence intervals

</div>

<div class="tip-box" data-title="Discussion: small bias × large scale">

Suppose an encoder-based hiring screener shows a 0.3% gender bias — barely detectable in any single decision. But the model processes 4 billion classifications per day. That's 12 million biased decisions *daily*. At what point does a "negligible" per-decision bias become a systemic problem?

</div>

---
<!-- _class: scale-80 -->

# Is language a statistical phenomenon?

<div class="note-box" data-title="A question that wasn't possible before BERT">

In Lecture 1, we established that language and thought are separable. Earlier in this lecture, we saw that language is fundamentally a lossy compression channel for transmitting brain states — and that LLMs learn to capture those same patterns. But we've been treating brain-model convergence as a puzzle about *brains*. Here's the deeper question: what does it tell us about *language*?

</div>

<div class="tip-box" data-title="Discussion: Universal Grammar vs Universal Statistics">

Chomsky argued that language requires an innate "Universal Grammar" — biological machinery that no statistical learner could replicate. But BERT learns syntactic structure, long-range dependencies, and even cross-linguistic patterns from raw text alone. [ChemBERTa](https://arxiv.org/abs/2010.09885) learns molecular "grammar" from SMILES strings — a domain with no biological basis at all.

**Two possibilities:**
1. Language is *fundamentally statistical* — the patterns are so strong that any sufficiently powerful learner will converge on the same structure, no innate grammar required
2. Language has *real structure* that both brains and models discover — the convergence tells us something about the structure of language itself, not just about the learners

**Which do you find more compelling? What evidence would distinguish them?**

</div>

---

# The next decade

<div class="note-box" data-title="The encoder/decoder boundary is dissolving">

ModernBERT (2024) borrows RoPE and Flash Attention from decoders. [GritLM](https://arxiv.org/abs/2402.09906) (2024) unifies embedding and generation in a single model. [Gemma Encoder](https://arxiv.org/abs/2503.02656) (2025) converts a decoder into an encoder. The architectural distinction that defined NLP since 2018 — "BERT for understanding, GPT for generation" — is collapsing.

</div>

<div class="tip-box" data-title="Discussion: what was BERT's real contribution?">

If the encoder/decoder distinction fades, what survives from the BERT era? Was BERT's insight the *architecture* (bidirectional attention), the *training objective* (masked language modeling), or the *paradigm* (pre-train, then fine-tune)? Which of these ideas will still matter in 2035?

</div>

---
<!-- _class: scale-90 -->

# Deep discussion

<div class="tip-box" data-title="Part 1: language, authorship, and accountability">

**1. Authorship.** If a student uses an encoder-powered tool to check grammar, that's acceptable. If they use it to restructure their argument, that's gray. If they use it to generate the essay, that's plagiarism. *Where exactly is the line, and who draws it?*

**2. Accountability at scale.** A hospital deploys a BERT model for ICD coding. It's 92% accurate — better than the average human coder (89%). A patient is harmed by a coding error. Is the hospital *more* liable (because they trusted a machine), *less* liable (because the machine is statistically better), or *equally* liable? Does the answer change if the error rate is 85%?

**3. The convergence puzzle.** Brains evolved over 300 million years. BERT was trained in 4 days. They converge on similar representations. Does this mean language processing has a *unique optimal solution*, or that both systems found *one of many* solutions that happens to look similar from the outside?

</div>

---
<!-- _class: scale-90 -->

# Deep discussion (continued)

<div class="tip-box" data-title="Part 2: economics, meaning, and prediction">

**4. The "good enough" economy.** A fine-tuned DistilBERT costs $0.01/M tokens. GPT-4 costs $30/M tokens but is more accurate. For content moderation, medical coding, and legal review, companies consistently choose the cheaper option. *What does it mean when "good enough" becomes the default for decisions that affect people's lives?*

**5. Language without intent.** BERT produces representations that capture meaning, resolve ambiguity, and predict brain activity — but BERT has no *intent* to communicate. If meaning can exist without a speaker who means it, is communication defined by the *speaker's* intent or the *listener's* interpretation? (This is not a hypothetical — it affects how we regulate AI-generated content.)

**6. Your prediction.** It's 2036. What role do encoder models play? Are they everywhere and invisible (like TCP/IP)? Merged into hybrid architectures? Replaced entirely by something we haven't invented yet? *Justify your prediction with evidence from this course.*

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

[**Reimers & Gurevych (2019, *EMNLP*)**](https://arxiv.org/abs/1908.10084) "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks" — Enabled practical semantic search.

[**Stephens, Silbert & Hasson (2010, *PNAS*)**](https://doi.org/10.1073/pnas.1008662107) "Speaker–listener neural coupling underlies successful communication" — Language as brain-to-brain transmission.

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
