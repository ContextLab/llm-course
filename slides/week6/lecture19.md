---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication'
footer: 'Winter 2026'
---

<!-- _class: lead -->

# Lecture 19: BERT Variants
## Week 6, Lecture 2 - Improvements and Optimizations

**PSYC 51.07: Models of Language and Communication**

Winter 2026

---

# Today's Agenda 



1. **RoBERTa**: Robustly Optimized BERT
2. **ALBERT**: A Lite BERT with parameter sharing
3. **DistilBERT**: Knowledge distillation for efficiency
4. **ELECTRA**: Replace Token Detection
5. **Comparative Analysis**: When to use which variant
6. **Practical Considerations**: Model selection guide

*Goal: Understand improvements to BERT and choose the right model*

---

# BERT's Limitations 


**What could be improved?**

1. **Training Procedure**
 - Some choices seemed arbitrary
- NSP task might not be useful
- Static masking (same masks every epoch)

 

2. **Model Size**
 - 110M (Base) or 340M (Large) parameters
- Large memory footprint
- Slow inference

 

3. **Training Efficiency**
 - Only 15% of tokens are predicted
- 85% of computation "wasted"?
- Could we learn more efficiently?

 

4. **Data and Compute**
 - Trained on limited data (3.3B words)
- Modern datasets much larger
- Could benefit from more training

**Many variants address these issues!**

---

# RoBERTa: Robustly Optimized BERT 


**Key idea: Better training = Better performance**

**RoBERTa's Improvements (Liu et al. 2019):**

1. **Remove NSP Task**
 - Next Sentence Prediction hurt performance
- Use only Masked Language Modeling
- Full sentences (don't need sentence pairs)

 

2. **Dynamic Masking**
 - Generate masking pattern every time
- BERT: static masks (same for every epoch)
- More diverse training signal

 

3. **Larger Batches, More Data**
 - Batch size: 8K sequences (vs BERT's 256)
- 160GB text (vs BERT's 16GB)
- Longer training (500K steps vs 100K)

 

4. **Longer Sequences**
 - Train with longer sequences
- Better for downstream tasks

*Reference: Liu et al. (2019) - "RoBERTa: A Robustly Optimized BERT Pretraining Approach"*

---

# RoBERTa Results 



**Consistent improvements over BERT**

| SQuAD 2.0 | 83.1 | 89.4 | +6.3 |
| --- | --- | --- | --- |
| MNLI | 86.7 | 90.2 | +3.5 |
| SST-2 | 94.9 | 96.4 | +1.5 |
| RACE | 72.0 | 83.2 | +11.2 |

**Key Findings:**

- Dynamic masking better than static
- More data + longer training = better results
- RoBERTa-Large matches or beats BERT-Large on all tasks
- Sometimes huge gains (RACE: +11.2 points!)

<div class="callout info">
<div class="callout-title">Takeaway</div>

Training procedure matters as much as architecture! RoBERTa shows that BERT was undertrained.

</div>


---

# Dynamic vs Static Masking 


**How masking patterns are generated**

<div class="columns">
<div class="column">

**Static Masking (BERT):**

**Preprocessing:**
- Mask tokens once
- Save masked dataset
- Same masks every epoch

**Epoch 1:** "My [MASK] is cute"

**Epoch 2:** "My [MASK] is cute"

**Epoch 3:** "My [MASK] is cute"

**Problem:**
- Model sees same masks repeatedly
- Less diverse training signal
- Potential overfitting to mask patterns

</div>
<div class="column">

**Dynamic Masking (RoBERTa):**

**On-the-fly:**
- Generate masks during training
- Different masks each time
- More variety

**Epoch 1:** "My [MASK] is cute"

**Epoch 2:** "My dog [MASK] cute"

**Epoch 3:** "My dog is [MASK]"

**Benefits:**
- More diverse training examples
- Better generalization
- Prevents memorization

</div>
</div>

**Cost:** Slight computational overhead, but worth it!

---

# ALBERT: A Lite BERT 

**Key idea: Parameter sharing for efficiency**

**ALBERT's Innovations (Lan et al. 2019):**

<div class="columns">
<div class="column">

**1. Factorized Embedding**
```python
# BERT: Direct embedding
# 30K vocab × 768 hidden = 23M params
bert_embed = nn.Embedding(30000, 768)

# ALBERT: Two-step embedding
# 30K × 128 + 128 × 768 = 3.8M + 0.1M
albert_embed = nn.Embedding(30000, 128)
albert_project = nn.Linear(128, 768)
# Savings: 83% fewer embedding params!
```

</div>
<div class="column">

**2. Cross-Layer Sharing**
- All 12 layers share same weights
- 89% parameter reduction

**3. Sentence Order Prediction**
```python
# NSP (BERT): Is B after A? (too easy)
# SOP (ALBERT): Are A,B in order?
# - Positive: [A, B] (correct order)
# - Negative: [B, A] (swapped order)
# Harder task → better representations
```

</div>
</div>

*Reference: Lan et al. (2019) - "ALBERT: A Lite BERT for Self-supervised Learning"*

---

# ALBERT Parameter Efficiency 



**Dramatic parameter reduction!**

| ALBERT-base | 12 | 768 | 12M |
| --- | --- | --- | --- |
| ALBERT-large | 24 | 1024 | 18M |
| ALBERT-xlarge | 24 | 2048 | 60M |
| ALBERT-xxlarge | 12 | 4096 | 235M |

**Key Observations:**
- ALBERT-base: than BERT-base
- Can train much larger hidden sizes with same memory
- ALBERT-xxlarge: 4096 hidden dim, still only 235M params
- Trade-off: fewer params but similar computation (layer sharing)

<div class="callout info">
<div class="callout-title">Benefits</div>

- Lower memory footprint
- Easier to deploy
- Can scale to larger hidden dimensions

</div>


---

# Cross-Layer Parameter Sharing 

**How ALBERT achieves parameter efficiency**

<div class="columns">
<div class="column">

**BERT (No Sharing):**
```python
class BERT:
 def __init__(self):
 # Each layer has unique parameters
 self.layers = [
 TransformerLayer() for _ in range(12)
 ]
 # 12 × 7M params = 85M params

 def forward(self, x):
 for layer in self.layers:
 x = layer(x) # Different weights
 return x
```

</div>
<div class="column">

**ALBERT (Full Sharing):**
```python
class ALBERT:
 def __init__(self):
 # Single shared layer!
 self.shared_layer = TransformerLayer()
 # 1 × 7M params = 7M params

 def forward(self, x):
 for _ in range(12):
 x = self.shared_layer(x) # Same weights!
 return x
```

</div>
</div>

**Intuition:** Each layer refines the representation. Like a "residual network unrolled" - iterative refinement with shared weights.

**Trade-off:** 89% fewer parameters, same compute (still 12 forward passes)


---

# DistilBERT: Knowledge Distillation 

**Key idea: Train small model to mimic large model**

```python
# Knowledge Distillation Training Loop
teacher = BertModel.from_pretrained("bert-base") # 12 layers, frozen
student = DistilBertModel(num_layers=6) # 6 layers, trainable

for batch in training_data:
 # Teacher provides "soft targets" (probability distributions)
 with torch.no_grad():
 teacher_logits = teacher(batch) # e.g., [0.7, 0.2, 0.1, ...]

 # Student tries to match teacher's distribution
 student_logits = student(batch)

 # Distillation loss: KL divergence between distributions
 # Temperature T=2 softens the distribution (more informative)
 loss_distill = KL_divergence(
 softmax(student_logits / T),
 softmax(teacher_logits / T)
 )

 # Also include MLM loss for language modeling
 loss_mlm = masked_lm_loss(student_logits, labels)

 # Combined loss
 loss = 0.5 * loss_distill + 0.5 * loss_mlm
```

**Why soft targets work:** Teacher's "wrong" predictions contain information (e.g., "dog" → "cat" more likely than "car")

*Reference: Sanh et al. (2019) - "DistilBERT, a distilled version of BERT"*

---

# DistilBERT Results 


**Significant efficiency gains!**

| Inference Speed | 1x | 1.6x | 60% faster |
| --- | --- | --- | --- |
| GLUE Score | 79.6 | 77.0 | 97% retained |

**Performance on Specific Tasks:**

| SST-2 (Acc) | 94.9 | 92.7 |
| --- | --- | --- |
| MNLI (Acc) | 86.7 | 82.2 |

**When to Use DistilBERT:**
- Production deployment (latency-critical)
- Edge devices (limited memory)
- High-throughput scenarios
- When 2-3% performance drop is acceptable


---

# ELECTRA: Efficient Learning 

**Key idea: Learn from all tokens, not just 15%**

```python
# ELECTRA Training: Generator + Discriminator setup
sentence = "The chef cooked a delicious meal"
masked = "The chef [MASK] a delicious meal"

# Small generator (like BERT) fills in masks
generator_output = generator(masked)
# Generator predicts: "ate" (plausible but wrong)

corrupted = "The chef ate a delicious meal"

# Discriminator classifies EACH token: original or replaced?
discriminator_output = discriminator(corrupted)
# Output per token: [orig, orig, REPLACED, orig, orig, orig]

# Loss computed on ALL tokens (not just 15%!)
labels = [0, 0, 1, 0, 0, 0] # 1 = replaced
loss = binary_cross_entropy(discriminator_output, labels)
```

<div class="callout tip">
<div class="callout-title">Efficiency Gain</div>

**BERT:** Learns from 15% of tokens (masked ones only)
**ELECTRA:** Learns from 100% of tokens (all get labeled)

Result: Same quality with 4x less compute!

</div>

*Reference: Clark et al. (2020) - "ELECTRA: Pre-training Text Encoders as Discriminators"*

---

# ELECTRA Benefits 



**More efficient pre-training**

**Advantages:**
1. **Sample Efficiency**
 - Learn from all tokens (100%) vs only masked (15%)
- Reaches same performance with less data
- Faster convergence

 

2. **Better Performance**
 - ELECTRA-Small outperforms BERT-Small
- ELECTRA-Base competitive with BERT-Large
- With same compute, ELECTRA is better

 

3. **Computational Efficiency**
 - Smaller generator (1/4 to 1/2 size of discriminator)
- Faster to train than BERT
- Lower computational cost for same quality

<div class="callout info">
<div class="callout-title">Key Insight</div>

Replace Token Detection is more sample-efficient than Masked LM because it provides a learning signal for every token!

</div>


---

# BERT Variants Comparison 


**Summary of key variants**

| p{3cm}p{3cm}} Model | Key Innovation | Advantages | Best For |
| --- | --- | --- | --- |

**General Guidelines:**
- **Best quality:** RoBERTa-Large
- **Best efficiency:** DistilBERT
- **Limited memory:** ALBERT
- **Limited training budget:** ELECTRA
- **Good default:** RoBERTa-Base or BERT-Base


---

# Other Notable BERT Variants 


**The BERT family keeps growing!**

1. **DeBERTa (Microsoft, 2020)**
 - Disentangled attention (separate content and position)
- Enhanced mask decoder
- State-of-the-art on SuperGLUE

 

2. **ERNIE (Baidu, 2019)**
 - Entity-level and phrase-level masking
- Knowledge enhancement
- Strong on Chinese NLP tasks

 

3. **SpanBERT (Facebook, 2019)**
 - Mask random spans instead of random tokens
- Span boundary objective
- Better for span-based tasks (QA, coreference)

 

4. **BART (Facebook, 2019)**
 - Encoder-decoder (not encoder-only)
- Denoising autoencoder with various corruptions
- Excellent for generation tasks


---

# Model Selection Guide 


**How to choose the right model for your task**

```
Start -> Quality or Speed? -> RoBERTa-Large -> Memory? -> DistilBERT -> ALBERT -> \begin{tabular
```

**Additional Considerations:**
- **Domain:** Consider domain-specific pre-trained models (BioBERT, SciBERT, etc.)
- **Language:** Multilingual? Use mBERT, XLM-R
- **Task type:** Generation? Consider BART/T5 instead


---

# Using Different BERT Variants 


**Easy switching with HuggingFace**

```python
from transformers import AutoModel, AutoTokenizer

# BERT
bert_model = AutoModel.from_pretrained("bert-base-uncased")
bert_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# RoBERTa
roberta_model = AutoModel.from_pretrained("roberta-base")
roberta_tokenizer = AutoTokenizer.from_pretrained("roberta-base")

# ALBERT
albert_model = AutoModel.from_pretrained("albert-base-v2")
albert_tokenizer = AutoTokenizer.from_pretrained("albert-base-v2")

# DistilBERT
distilbert_model = AutoModel.from_pretrained("distilbert-base-uncased")
distilbert_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# ELECTRA
electra_model = AutoModel.from_pretrained("google/electra-base-discriminator")
electra_tokenizer = AutoTokenizer.from_pretrained("google/electra-base-discriminator")

# All have the same API!
inputs = tokenizer("Hello, my dog is cute", return_tensors="pt")
outputs = model(**inputs)
```

---

# Benchmarking BERT Variants: Worked Example 

**Practical comparison on sentiment analysis**

```python
import time
from transformers import pipeline

# Load different models for sentiment analysis
models = {
 "bert-base": "textattack/bert-base-uncased-SST-2",
 "distilbert": "distilbert-base-uncased-finetuned-sst-2-english",
 "albert": "textattack/albert-base-v2-SST-2",
}

test_texts = ["This movie was fantastic!", "I hated every minute of it."] * 100

for name, model_id in models.items():
 pipe = pipeline("sentiment-analysis", model=model_id)

 start = time.time()
 results = pipe(test_texts)
 elapsed = time.time() - start

 print(f"{name}: {elapsed:.2f}s for 200 samples ({200/elapsed:.1f} samples/sec)")
```

**Typical Results:**
| Model | Accuracy | Speed (samples/sec) | Memory |
|-------|----------|---------------------|--------|
| bert-base | 93.2% | 45 | 420MB |
| distilbert | 91.3% | 85 | 250MB |
| albert | 92.7% | 38 | 45MB |

---

# Discussion Questions 


1. **Training vs Architecture:**
 - RoBERTa shows training matters. Is architecture overrated?
- How much can we improve with just better training?
- What's the right balance?

 

2. **Parameter Efficiency:**
 - ALBERT shares all layers. Why does this work?
- What are the limits of parameter sharing?
- Is there a "sweet spot"?

 

3. **Knowledge Distillation:**
 - Why does student learn better from teacher than from labels?
- What information is in the soft probabilities?
- Can we distill even further?

 

4. **Model Selection:**
 - How do you decide which model to use?
- Is it worth fine-tuning multiple variants?
- What about model ensembles?


---

# Looking Ahead 


**Today we learned:**
- RoBERTa: Better training matters
- ALBERT: Parameter sharing for efficiency
- DistilBERT: Knowledge distillation
- ELECTRA: Replace token detection
- How to choose the right variant

**Next lecture (Lecture 17 - Applications of Encoder Models):**

**From theory to practice! **


---

# Summary 


**Key Takeaways:**

1. **RoBERTa**
 - Training procedure matters as much as architecture
- Remove NSP, dynamic masking, more data = better results
2. **ALBERT**
 - Parameter sharing dramatically reduces model size
- Factorized embeddings for efficiency
- 89% fewer parameters than BERT
3. **DistilBERT**
 - Knowledge distillation for deployment
- 40% smaller, 60% faster, 97% performance
4. **ELECTRA**
 - Replace token detection more sample-efficient
- Learn from all tokens, not just 15%
5. **Model Selection**
 - Choose based on constraints (quality, speed, memory)
- HuggingFace makes it easy to experiment


---

# References 


**Essential Papers:**

- **Liu et al. (2019)** - "RoBERTa: A Robustly Optimized BERT Pretraining Approach"
- **Lan et al. (2019)** - "ALBERT: A Lite BERT for Self-supervised Learning"
- **Sanh et al. (2019)** - "DistilBERT, a distilled version of BERT"
- **Clark et al. (2020)** - "ELECTRA: Pre-training Text Encoders as Discriminators"
- **He et al. (2020)** - "DeBERTa: Decoding-enhanced BERT with Disentangled Attention"

**Resources:**
- HuggingFace Model Hub: https://huggingface.co/models
- Papers With Code: BERT variants leaderboard
- Model Cards: Detailed documentation for each variant


---

# Questions? 



**Discussion Time**

**Topics for discussion:**
- BERT variants and improvements
- Model selection strategies
- Knowledge distillation
- Parameter efficiency
- Implementation questions

Thank you! 

Next: Applications and Real-World Use Cases!

