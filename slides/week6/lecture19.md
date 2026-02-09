---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 19: BERT variants
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Identify key limitations of the original BERT training procedure
2. Explain how RoBERTa, ALBERT, DistilBERT, ELECTRA, and DeBERTa each address different limitations
3. Compare parameter efficiency, training efficiency, and inference speed across variants
4. Select the appropriate variant for a given task and resource constraint
5. Argue whether encoder models remain relevant in the era of GPT-4

</div>

---

# Recall: what BERT does

<div class="note-box" data-title="From lectures 12 and 18">

We covered BERT's architecture (MLM + NSP, bidirectional attention) in Lecture 12, and explored what BERT actually *learns* (attention patterns, layer probing, neuroscience connections) in Lecture 18.

</div>

<div class="tip-box" data-title="Today's focus">

Today: how researchers improved on BERT's original recipe, and whether encoder models still matter in 2026.

</div>

<div class="tip-box" data-title="Companion notebook">

📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/bert_variants_demo.ipynb) — try different BERT variants hands-on

</div>

---

# What could be improved?

<div class="warning-box" data-title="BERT's key limitations">

**Training procedure:** NSP may hurt performance; static masking reuses the same masks every epoch; only 15% of tokens provide training signal.

**Scale:** Trained on only 3.3B words with 100K steps — modern datasets are 100x larger.

**Efficiency:** 110M parameters are all active for every input. Large memory footprint for deployment.

</div>

---

# RoBERTa: robustly optimized BERT

<div class="definition-box" data-title="Key idea: better training = better performance">

[RoBERTa](https://arxiv.org/abs/1907.11692) (Liu et al., 2019) keeps BERT's architecture but fixes the training recipe:

1. **Remove NSP** — Next Sentence Prediction hurt performance. Use only MLM with full sentences.
2. **Dynamic masking** — Generate a new masking pattern every time a sequence is seen, instead of reusing the same mask.
3. **Larger batches, more data** — Batch size 8K sequences (vs BERT's 256), 160GB text (vs 16GB), 500K steps (vs 100K).
4. **Longer sequences** — Train on longer contiguous text for better long-range understanding.

</div>

<div class="tip-box" data-title="Takeaway">

Training procedure matters as much as architecture. RoBERTa shows that BERT was significantly **undertrained**.

</div>

---

# Dynamic vs static masking

<div class="note-box" data-title="How masking patterns are generated">

**Static masking (BERT):**
- Mask tokens once during preprocessing
- Same masks reused every epoch
- Example: "My [MASK] is cute" → same every time
- Risk: model memorizes mask positions

**Dynamic masking (RoBERTa):**
- Generate new masks on-the-fly during training
- Different masks each time the same sequence is seen
- Epoch 1: "My [MASK] is cute"
- Epoch 2: "My dog [MASK] cute"
- Epoch 3: "My dog is [MASK]"
- Result: more diverse training signal, better generalization

</div>

---

# RoBERTa results

<div class="note-box" data-title="Consistent improvements over BERT">

| Task | BERT-Large | RoBERTa | Improvement |
|------|-----------|---------|-------------|
| SQuAD 2.0 | 83.1 | 89.4 | +6.3 |
| MNLI | 86.7 | 90.2 | +3.5 |
| SST-2 | 94.9 | 96.4 | +1.5 |
| RACE | 72.0 | 83.2 | +11.2 |

</div>

<div class="important-box" data-title="Key findings">

- Dynamic masking consistently outperforms static masking
- More data + longer training = substantial gains
- Removing NSP improves downstream task performance
- Some tasks see enormous gains (RACE: +11.2 points!)

</div>

---

# ALBERT: a lite BERT

<div class="definition-box" data-title="Key idea: parameter sharing for efficiency">

[ALBERT](https://arxiv.org/abs/1909.11942) (Lan et al., 2019) dramatically reduces BERT's parameter count through two innovations:

**1. Factorized embedding parameters:**
- BERT: vocabulary (30K) × hidden size (768) = 23M parameters
- ALBERT: vocabulary (30K) × embedding size (128) + embedding (128) × hidden (768) = 3.9M parameters
- **83% fewer embedding parameters**

**2. Cross-layer parameter sharing:**
- All 12 transformer layers share the *same* weights
- Like running the same layer 12 times (iterative refinement)
- **89% fewer transformer parameters**

**3. Sentence Order Prediction (SOP):**
- Replaces NSP with a harder task: are sentences A, B in correct order or swapped?
- Forces the model to learn discourse coherence, not just topic matching

</div>

---
<!-- _class: scale-90 -->

# ALBERT parameter efficiency

<div class="note-box" data-title="Dramatic parameter reduction">

| Model | Layers | Hidden size | Parameters |
|-------|--------|-------------|------------|
| BERT-base | 12 | 768 | 110M |
| ALBERT-base | 12 | 768 | **12M** |
| ALBERT-large | 24 | 1024 | 18M |
| ALBERT-xlarge | 24 | 2048 | 60M |
| ALBERT-xxlarge | 12 | 4096 | 235M |

</div>

<div class="example-box" data-title="Factorized embedding in code">

```python
import torch.nn as nn

# BERT: direct embedding (30K vocab × 768 hidden = 23M params)
bert_embed = nn.Embedding(30000, 768)

# ALBERT: two-step embedding (30K × 128 + 128 × 768 = 3.9M params)
albert_embed = nn.Embedding(30000, 128)
albert_project = nn.Linear(128, 768)
# 83% fewer embedding parameters!
```

</div>

---
<!-- _class: scale-85 -->

# Cross-layer parameter sharing

<div class="example-box" data-title="BERT vs ALBERT layer structure">

```python
class BERT:
    def __init__(self):
        # Each layer has unique parameters
        self.layers = [TransformerLayer() for _ in range(12)]
        # 12 × 7M params = 85M params in transformer layers

    def forward(self, x):
        for layer in self.layers:
            x = layer(x)   # Different weights each time
        return x

class ALBERT:
    def __init__(self):
        # Single shared layer
        self.shared_layer = TransformerLayer()
        # 1 × 7M params = 7M params (89% reduction!)

    def forward(self, x):
        for _ in range(12):
            x = self.shared_layer(x)  # Same weights reused
        return x
```

</div>

<div class="note-box" data-title="Trade-off">

ALBERT has 89% fewer parameters but the **same compute cost** — it still performs 12 forward passes through the transformer layer. The savings are in memory, not speed.

</div>

---

# DistilBERT: knowledge distillation

<div class="definition-box" data-title="Key idea: train a small model to mimic a large model">

[Knowledge distillation](https://arxiv.org/abs/1910.01108) (Sanh et al., 2019) compresses BERT into a smaller, faster model:

- **Teacher**: Full BERT-base (12 layers, frozen)
- **Student**: DistilBERT (6 layers, trainable)
- **Training signal**: Student learns to match the teacher's *soft probability distributions*, not just the hard labels

The teacher's "wrong" predictions contain useful information — e.g., predicting "cat" is more likely than "car" for a masked animal slot tells the student about semantic similarity.

</div>

<div class="note-box" data-title="Results">

| Metric | BERT-base | DistilBERT | Change |
|--------|-----------|------------|--------|
| Parameters | 110M | 66M | 40% smaller |
| Inference speed | 1× | 1.6× | 60% faster |
| GLUE score | 79.6 | 77.0 | 97% retained |

</div>

---
<!-- _class: scale-85 -->

# DistilBERT training

<div class="example-box" data-title="Knowledge distillation training loop">

```python
teacher = BertModel.from_pretrained("bert-base")  # 12 layers, frozen
student = DistilBertModel(num_layers=6)            # 6 layers, trainable

for batch in training_data:
    # Teacher provides "soft targets" (probability distributions)
    with torch.no_grad():
        teacher_logits = teacher(batch)  # e.g., [0.7, 0.2, 0.1, ...]

    # Student tries to match teacher's distribution
    student_logits = student(batch)

    # Distillation loss: KL divergence between soft distributions
    # Temperature T=2 softens the distribution (more informative)
    loss_distill = KL_divergence(
        softmax(student_logits / T),
        softmax(teacher_logits / T)
    )
    loss_mlm = masked_lm_loss(student_logits, labels)

    loss = 0.5 * loss_distill + 0.5 * loss_mlm
```

</div>

---

# ELECTRA: efficient learning from all tokens

<div class="definition-box" data-title="Key idea: learn from 100% of tokens, not just 15%">

[ELECTRA](https://arxiv.org/abs/2003.10555) (Clark et al., 2020) uses a **generator-discriminator** setup:

1. A small **generator** (like a mini-BERT) fills in masked tokens with plausible replacements
2. A **discriminator** classifies *every* token as original or replaced
3. The discriminator provides a training signal for **all tokens** — not just the 15% that were masked

</div>

<div class="example-box" data-title="ELECTRA training example">

```python
sentence  = "The chef cooked a delicious meal"
masked    = "The chef [MASK] a delicious meal"

# Small generator fills in the mask
generator_output = generator(masked)  # Predicts: "ate" (plausible but wrong)
corrupted = "The chef ate a delicious meal"

# Discriminator classifies EVERY token: original or replaced?
discriminator(corrupted)
# Output: [orig, orig, REPLACED, orig, orig, orig]
# Loss computed on ALL 6 tokens (not just 1 masked token!)
```

</div>

---

# ELECTRA efficiency

<div class="note-box" data-title="Learning from every token">

**BERT:** Learns from 15% of tokens (masked ones only) — 85% of compute generates no training signal.

**ELECTRA:** Learns from 100% of tokens (all get a real/replaced label) — every position contributes to learning.

**Result:** ELECTRA reaches BERT-level performance with **4× less compute**.

</div>

<div class="tip-box" data-title="When to use ELECTRA">

ELECTRA is ideal when you have limited compute budget:
- ELECTRA-Small outperforms BERT-Small
- ELECTRA-Base is competitive with BERT-Large
- With the same compute budget, ELECTRA consistently wins

</div>

---

# Variant comparison summary

<div class="note-box" data-title="Choosing the right BERT variant">

| Model | Key innovation | Best for |
|-------|---------------|----------|
| **BERT** | MLM + NSP | Baseline, well-understood |
| **RoBERTa** | Better training recipe | Maximum quality |
| **ALBERT** | Parameter sharing | Memory-constrained deployment |
| **DistilBERT** | Knowledge distillation | Speed-critical production |
| **ELECTRA** | Replaced token detection | Limited training budget |

**General guidelines:**
- **Best quality:** RoBERTa-Large
- **Best efficiency:** DistilBERT
- **Limited memory:** ALBERT
- **Limited training budget:** ELECTRA
- **Good default:** RoBERTa-Base or BERT-Base

</div>

---

# Other notable BERT variants

<div class="note-box" data-title="The BERT family keeps growing">

[**DeBERTa**](https://arxiv.org/abs/2006.03654) (Microsoft, 2020): Disentangled attention separates content and position representations. Enhanced mask decoder. State-of-the-art on SuperGLUE.

[**SpanBERT**](https://arxiv.org/abs/1907.10529) (Facebook, 2019): Masks random contiguous *spans* instead of individual tokens. Span boundary objective. Better for extractive tasks (QA, coreference).

[**ERNIE**](https://arxiv.org/abs/1904.09223) (Baidu, 2019): Entity-level and phrase-level masking. Knowledge-enhanced pre-training. Strong on Chinese NLP tasks.

[**BART**](https://arxiv.org/abs/1910.13461) (Facebook, 2019): Encoder-decoder architecture (not encoder-only). Denoising autoencoder with various corruption strategies. Excellent for generation tasks.

</div>

---

# Model selection guide

<div class="tip-box" data-title="How to choose the right model for your task">

**Step 1:** What are your constraints?
- Need maximum quality? → **RoBERTa-Large**
- Need fast inference? → **DistilBERT**
- Need small memory footprint? → **ALBERT**
- Limited training compute? → **ELECTRA**
- Need text generation? → Consider **BART** or **GPT** instead

**Step 2:** Consider your domain
- Biomedical text? → **BioBERT**, **PubMedBERT**
- Scientific text? → **SciBERT**
- Legal text? → **LegalBERT**
- Multilingual? → **mBERT**, **XLM-RoBERTa**

**Step 3:** Start simple, iterate
- Begin with `bert-base-uncased` as a baseline
- Try RoBERTa-base for an easy quality boost
- Optimize for speed/memory only if needed

</div>

---
<!-- _class: scale-85 -->

# Using different variants with HuggingFace

<div class="example-box" data-title="Easy model switching with AutoModel">

```python
from transformers import AutoModel, AutoTokenizer

# All variants share the same API — just change the model name!

# BERT
model = AutoModel.from_pretrained("bert-base-uncased")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# RoBERTa
model = AutoModel.from_pretrained("roberta-base")
tokenizer = AutoTokenizer.from_pretrained("roberta-base")

# ALBERT
model = AutoModel.from_pretrained("albert-base-v2")
tokenizer = AutoTokenizer.from_pretrained("albert-base-v2")

# DistilBERT
model = AutoModel.from_pretrained("distilbert-base-uncased")
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# ELECTRA
model = AutoModel.from_pretrained("google/electra-base-discriminator")
tokenizer = AutoTokenizer.from_pretrained("google/electra-base-discriminator")
```

</div>

---
<!-- _class: scale-85 -->

# Benchmarking variants

<div class="example-box" data-title="Comparing models on sentiment analysis">

```python
import time
from transformers import pipeline

models = {
    "bert-base": "textattack/bert-base-uncased-SST-2",
    "distilbert": "distilbert-base-uncased-finetuned-sst-2-english",
    "albert": "textattack/albert-base-v2-SST-2",
}
test_texts = ["This movie was fantastic!", "I hated every minute."] * 100

for name, model_id in models.items():
    pipe = pipeline("sentiment-analysis", model=model_id)
    start = time.time()
    results = pipe(test_texts)
    elapsed = time.time() - start
    print(f"{name}: {elapsed:.2f}s ({200/elapsed:.0f} samples/sec)")
```

| Model | Accuracy | Speed (samples/sec) | Memory |
|-------|----------|---------------------|--------|
| bert-base | 93.2% | ~45 | 420MB |
| distilbert | 91.3% | ~85 | 250MB |
| albert | 92.7% | ~38 | 45MB |

</div>

---

# Architecture evolution

<div class="note-box" data-title="From BERT to ModernBERT: 6 years of progress">

| Model | Year | Key innovation | Quality vs BERT |
|-------|------|---------------|----------------|
| BERT | 2018 | MLM + NSP | Baseline |
| RoBERTa | 2019 | Better training recipe | +3-11 pts |
| ALBERT | 2019 | Parameter sharing | 89% fewer params |
| DistilBERT | 2019 | Knowledge distillation | 97% quality, 60% faster |
| ELECTRA | 2020 | Learn from all tokens | 4x less compute |
| DeBERTa | 2020 | Disentangled attention | SOTA on SuperGLUE |
| [ModernBERT](https://arxiv.org/abs/2412.13663) | 2024 | Modern training + RoPE + Flash Attention | SOTA on GLUE, retrieval |

</div>

---

# Is the encoder dead?

<div class="tip-box" data-title="Discussion: GPT-4 can classify text via prompting. Do we still need encoders?">

**The case for "yes, encoders are obsolete":**
- Decoder-only models (GPT-4, Claude) can do classification, NER, QA via prompting
- One model for all tasks vs. fine-tuning separate models
- In-context learning eliminates the need for task-specific architectures

**The case for "no, encoders still matter":**
- [ModernBERT](https://arxiv.org/abs/2412.13663) (Dec 2024): encoder with modern techniques (RoPE, Flash Attention, 8192 context) achieves SOTA on retrieval and classification — faster and cheaper than any decoder
- [Gemma Encoder](https://arxiv.org/abs/2503.02656) (2025): Google releases encoder-only Gemma, proving the architecture still has legs
- Encoders are 10-100x cheaper to run than decoder models for classification tasks
- Most production search and retrieval systems still use encoders (Sentence-BERT, E5, NV-Embed)

**The real answer:** It depends on your constraints. Encoders win on cost and latency. Decoders win on flexibility.

</div>

---

# Discussion

<div class="tip-box" data-title="Questions to consider">

1. **Training vs architecture:** RoBERTa shows that training matters enormously. How much of BERT's "limitations" were really just undertrained models?

2. **The distillation paradox:** Why does a student model learn *better* from soft probability distributions than from hard labels? What "dark knowledge" is in the teacher's mistakes?

3. **Encoders in 2026:** Google, Hugging Face, and others are *still* releasing encoder models. If decoders can do everything, why? What does this tell us about the efficiency-flexibility tradeoff?

4. **Parameter sharing (ALBERT):** All 12 layers share the same weights and it still works. What does this imply about what transformer layers actually learn?

</div>

---
<!-- _class: scale-85 -->

# Further reading

<div class="note-box" data-title="Further reading">

[**Liu et al. (2019, *arXiv*)**](https://arxiv.org/abs/1907.11692) "RoBERTa: A Robustly Optimized BERT Pretraining Approach" — Better training recipe, same architecture.

[**Lan et al. (2019, *ICLR*)**](https://arxiv.org/abs/1909.11942) "ALBERT: A Lite BERT" — 89% parameter reduction via sharing.

[**Sanh et al. (2019, *NeurIPS Workshop*)**](https://arxiv.org/abs/1910.01108) "DistilBERT" — Knowledge distillation for 60% speedup.

[**Clark et al. (2020, *ICLR*)**](https://arxiv.org/abs/2003.10555) "ELECTRA" — Learn from all tokens, not just masked ones.

[**He et al. (2020, *ICLR*)**](https://arxiv.org/abs/2006.03654) "DeBERTa" — Disentangled attention, SOTA on SuperGLUE.

[**Warner et al. (2024, *arXiv*)**](https://arxiv.org/abs/2412.13663) "ModernBERT" — Modern encoder with RoPE + Flash Attention.

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

Applications of encoder models: industry, neuroscience, and the "understanding" debate

</div>
