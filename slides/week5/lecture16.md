---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 16: Training transformer models
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Explain what it means to "train" a transformer model
2. Describe the training loop: forward pass, loss, backward pass, update
3. Understand cross-entropy loss and perplexity as training metrics
4. Explain scaling laws and their practical implications
5. Distinguish between pre-training and fine-tuning

</div>

---

# Where we left off

<div class="note-box" data-title="Recap from lecture 15">

Last time we saw the transformer as a function:

$$\text{Transformer}(X, \theta) \rightarrow Y$$

We traced data from raw text through tokenization, embedding, attention, and feed-forward layers. But we treated the parameters $\theta$ as given.

</div>

<div class="tip-box" data-title="Today's question">

Where do the parameters $\theta$ come from? How does the model *learn* to predict the next token?

</div>

---

# What does "training" mean?

<div class="definition-box" data-title="Training a language model">

**Training** is the process of finding parameters $\theta$ that make the model's predictions match the data. Given a large corpus of text, we want:

$$\theta^* = \arg\min_\theta \mathcal{L}(\theta)$$

where $\mathcal{L}$ is a **loss function** that measures how wrong the model's predictions are.

</div>

<div class="tip-box" data-title="Intuition">

Imagine the model is a student learning to finish sentences. We show it millions of sentences, and every time it guesses the next word wrong, we nudge its parameters to make a better guess next time.

</div>

---

# The language modeling objective

<div class="definition-box" data-title="Next-token prediction">

Given a sequence of tokens $x_1, x_2, \ldots, x_{t-1}$, the model predicts a probability distribution over the vocabulary for the next token $x_t$:

$$P(x_t \mid x_1, x_2, \ldots, x_{t-1}; \theta)$$

The goal is to maximize the probability of the *actual* next token across the entire training corpus.

</div>

<div class="note-box" data-title="This is self-supervised learning">

No human labels needed! The "label" is simply the next word in the text. This is why we can train on virtually unlimited data from the internet.

</div>

---

# Cross-entropy loss

<div class="definition-box" data-title="The loss function">

**Cross-entropy loss** measures how different the model's predicted distribution $\hat{y}$ is from the true distribution $y$ (a one-hot vector for the correct token):

$$\mathcal{L} = -\sum_{i=1}^{V} y_i \log(\hat{y}_i)$$

Since $y$ is one-hot (only the correct token has $y_i = 1$), this simplifies to:

$$\mathcal{L} = -\log(\hat{y}_c)$$

where $c$ is the index of the correct next token.

</div>

---
<!-- _class: scale-80 -->

# Understanding cross-entropy

<div class="tip-box" data-title="Why negative log probability?">

- If the model assigns probability 1.0 to the correct token: $-\log(1.0) = 0$ (no loss!)
- If the model assigns probability 0.5: $-\log(0.5) = 0.69$
- If the model assigns probability 0.01: $-\log(0.01) = 4.6$ (high loss!)

The loss penalizes confident *wrong* predictions heavily and rewards confident *correct* predictions.

</div>

<div class="example-box" data-title="Concrete example">

```
Vocabulary: [the, cat, sat, on, mat]  (V=5)
True next token: "sat" → y = [0, 0, 1, 0, 0]

Model prediction: ŷ = [0.1, 0.2, 0.5, 0.15, 0.05]
Loss = -log(0.5) = 0.69

Better prediction: ŷ = [0.05, 0.05, 0.85, 0.03, 0.02]
Loss = -log(0.85) = 0.16  ← much lower!
```

</div>

---

# Perplexity

<div class="definition-box" data-title="Perplexity: a more intuitive metric">

**Perplexity** is the exponential of the average cross-entropy loss across a sequence:

$$\text{PPL} = e^{\mathcal{L}} = e^{-\frac{1}{N}\sum_{t=1}^{N} \log P(x_t \mid x_{<t})}$$

</div>

<div class="tip-box" data-title="Intuition">

Perplexity measures how "confused" the model is. A perplexity of $k$ means the model is, on average, as uncertain as if it were choosing uniformly among $k$ options.

- **PPL = 1**: Perfect prediction (impossible in practice)
- **PPL = 10**: Like choosing among 10 equally likely words
- **PPL = 100**: Very uncertain
- **GPT-3 on test data**: PPL ≈ 20

</div>

---

# The training loop

<div class="definition-box" data-title="Four steps, repeated millions of times">

1. **Forward pass**: feed a batch of text through the model to get predictions
2. **Compute loss**: compare predictions to actual next tokens using cross-entropy
3. **Backward pass**: compute gradients $\nabla_\theta \mathcal{L}$ via backpropagation
4. **Update parameters**: adjust $\theta$ to reduce the loss

$$\theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}$$

where $\eta$ is the **learning rate** — how big a step we take.

</div>

<div class="warning-box" data-title="Scale matters">

GPT-3 has 175 billion parameters. Each training step updates *all* of them. Training took ~$4.6 million in compute costs and processed ~300 billion tokens. GPT-4 likely cost over $100 million to train, and GPT-5 (trillions of parameters) was even more expensive to train. Energy consumption and environmental impact are significant concerns at this scale.

</div>

---
<!-- _class: scale-90 -->

# Gradient descent intuition

<div class="tip-box" data-title="The hiking analogy">

Imagine you're lost in a foggy mountain range and want to reach the lowest valley:

1. **Feel the slope** under your feet (compute the gradient)
2. **Take a step downhill** (update parameters in the direction that reduces loss)
3. **Repeat** until you reach a valley (convergence)

The **learning rate** ($\eta$) controls your step size:
- Too large → you overshoot the valley and bounce around
- Too small → you make progress painfully slowly
- Just right → you descend efficiently

</div>

<div class="note-box" data-title="Stochastic gradient descent">

In practice, we don't compute the gradient over the *entire* dataset (too expensive). Instead, we use random **mini-batches** of data — this is called **stochastic gradient descent** (SGD).

</div>

---
<!-- _class: scale-90 -->

# Optimization: AdamW

<div class="definition-box" data-title="The optimizer of choice for transformers">

**AdamW** (Adaptive Moment Estimation with Weight Decay) improves on basic gradient descent:

1. **Adaptive learning rates**: Each parameter gets its own learning rate based on gradient history
2. **Momentum**: Uses exponential moving average of past gradients to smooth updates
3. **Weight decay**: Adds regularization to prevent parameters from growing too large

$$m_t = \beta_1 m_{t-1} + (1 - \beta_1) g_t \quad \text{(momentum)}$$
$$v_t = \beta_2 v_{t-1} + (1 - \beta_2) g_t^2 \quad \text{(squared gradients)}$$
$$\theta_t = \theta_{t-1} - \eta \frac{m_t}{\sqrt{v_t} + \epsilon} - \lambda \theta_{t-1} \quad \text{(update + decay)}$$

</div>

<div class="tip-box" data-title="Why AdamW?">

Standard Adam "hides" weight decay inside the adaptive learning rate, making it less effective. AdamW decouples weight decay from the gradient-based update, leading to better generalization.

</div>

---
<!-- _class: scale-70 -->

# Learning rate scheduling

<div class="definition-box" data-title="Warmup then decay">

Modern transformers use a **learning rate schedule** with two phases:

1. **Warmup** (first ~1-10% of training): Gradually increase $\eta$ from 0 to the target value. This prevents large, unstable updates early when the model is randomly initialized.

2. **Decay** (remaining training): Gradually decrease $\eta$ using a cosine or linear schedule. This allows fine-grained optimization as the model approaches convergence.

</div>

<div class="example-box" data-title="Learning rate schedule in Python">


```python
from transformers import get_cosine_schedule_with_warmup

optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)

scheduler = get_cosine_schedule_with_warmup(
    optimizer,
    num_warmup_steps=1000,     # warmup for 1000 steps
    num_training_steps=100000  # total training steps
)

# In training loop:
for batch in dataloader:
    loss = model(batch).loss
    loss.backward()
    optimizer.step()
    scheduler.step()  # update learning rate
    optimizer.zero_grad()
```

</div>

---

# Gradient clipping

<div class="warning-box" data-title="The exploding gradient problem">

During backpropagation through many layers, gradients can grow exponentially large — this is called **exploding gradients**. A single bad gradient can destroy hours of training progress by making a catastrophically large parameter update.

</div>

<div class="definition-box" data-title="The fix: gradient clipping">

Before updating parameters, cap the total gradient norm to a maximum value:

$$\text{if } \|\nabla_\theta \mathcal{L}\| > \text{max\_norm}: \quad \nabla_\theta \mathcal{L} \leftarrow \text{max\_norm} \cdot \frac{\nabla_\theta \mathcal{L}}{\|\nabla_\theta \mathcal{L}\|}$$

This preserves the gradient *direction* while limiting its *magnitude*. A common choice is $\text{max\_norm} = 1.0$.

</div>

---
<!-- _class: scale-90 -->

# Training with HuggingFace

<div class="example-box" data-title="A complete training loop">

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
from datasets import load_dataset

# Load model and tokenizer
model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# Load and tokenize data
dataset = load_dataset("wikitext", "wikitext-2-raw-v1")
def tokenize(examples):
    return tokenizer(examples["text"], truncation=True, max_length=512)
tokenized = dataset.map(tokenize, batched=True)

# Configure training
args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    learning_rate=5e-5,
    warmup_steps=500,
    weight_decay=0.01,
    logging_steps=100,
)

# Train!
trainer = Trainer(model=model, args=args, train_dataset=tokenized["train"])
trainer.train()
```

</div>

---

# Scaling laws

<div class="definition-box" data-title="Kaplan et al. (2020): neural scaling laws">

OpenAI discovered that language model performance follows **predictable power laws** as you increase:

1. **Model size** ($N$ parameters): $\mathcal{L} \propto N^{-0.076}$
2. **Dataset size** ($D$ tokens): $\mathcal{L} \propto D^{-0.095}$
3. **Compute budget** ($C$ FLOPs): $\mathcal{L} \propto C^{-0.050}$

These relationships are remarkably smooth across **seven orders of magnitude**.

</div>

<div class="tip-box" data-title="What this means">

Performance improves as a straight line on a log-log plot. There are no sudden jumps or plateaus — just smooth, predictable improvement. This means we can *predict* how well a model will perform before training it.

</div>

---

# Visualizing scaling laws

<div class="note-box" data-title="Log-log plots reveal power laws">

When we plot loss vs. compute on log-log axes, the relationship is linear:

$$\log(\mathcal{L}) = -\alpha \log(C) + \beta$$

This means doubling compute reduces loss by a *fixed percentage* — not a fixed amount.

</div>

<div class="example-box" data-title="Concrete numbers">

```
Model        Parameters    Loss    Perplexity
GPT-2 small  117M         3.30    27.0
GPT-2 medium 345M         3.07    21.5
GPT-2 large  774M         2.93    18.8
GPT-2 XL     1.5B         2.85    17.4
GPT-3        175B         ~2.4    ~11.0
```

Each ~10x increase in parameters gives roughly the same *percentage* improvement in loss.

</div>

---

# Chinchilla scaling

<div class="definition-box" data-title="Hoffmann et al. (2022): compute-optimal training">

Kaplan et al. suggested scaling model size faster than data. **Chinchilla** showed this was wrong:

For a fixed compute budget, the optimal allocation is approximately:

$$\text{tokens} \approx 20 \times \text{parameters}$$

A 70B parameter model should be trained on ~1.4 trillion tokens.

</div>

<div class="warning-box" data-title="Many models were undertrained">

Chinchilla (70B params, 1.4T tokens) matched GPT-3 (175B params, 300B tokens) despite being **2.5x smaller**. GPT-3 was undertrained relative to its size — it needed more data, not more parameters.

</div>

---

# What scaling laws tell us

<div class="tip-box" data-title="Practical implications">

1. **Predictability**: We can estimate final performance from small-scale experiments — train small models first, then extrapolate
2. **Resource allocation**: Don't just make models bigger — balance parameters and data
3. **No free lunch**: Improving loss by 10% requires roughly 10x more compute
4. **Emergent abilities**: Some capabilities (like arithmetic, translation) appear suddenly at certain scales, even though the loss curve is smooth

</div>

<div class="note-box" data-title="The cost of scale">

| Model | Parameters | Training cost (est.) |
|-------|-----------|---------------------|
| BERT-base | 110M | ~$5,000 |
| GPT-2 | 1.5B | ~$50,000 |
| GPT-3 | 175B | ~$4,600,000 |
| GPT-4 | ~1.8T (rumored) | ~$100,000,000 |

</div>

---

# Pre-training vs fine-tuning

<div class="definition-box" data-title="Two phases of training">

**Pre-training**: Train a large model on a massive, general-purpose corpus (e.g., internet text). The model learns language patterns, facts, and reasoning. This is expensive and done once.

**Fine-tuning**: Take the pre-trained model and train it further on a smaller, task-specific dataset. This adapts the general knowledge to a specific use case. This is cheap and done many times.

</div>

<div class="tip-box" data-title="Analogy">

Pre-training is like getting a liberal arts education — broad knowledge about many topics. Fine-tuning is like specializing in medical school — adapting that broad foundation to a specific domain.

</div>

---

# Why does fine-tuning work?

<div class="note-box" data-title="Transfer learning">

During pre-training, the model learns:
- Grammar and syntax
- World knowledge and facts
- Reasoning patterns
- Contextual understanding

These capabilities **transfer** to new tasks. Fine-tuning only needs to teach the model *how to apply* its existing knowledge to the new task format.

</div>

<div class="definition-box" data-title="Key advantage">

Fine-tuning a pre-trained model on 1,000 labeled examples typically outperforms training from scratch on 100,000 examples. The pre-trained representations give the model a massive head start.

</div>

---
<!-- _class: scale-85 -->

# Fine-tuning with HuggingFace

<div class="example-box" data-title="Fine-tuning BERT for sentiment classification">

```python
from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset

# Load pre-trained BERT + add classification head
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=2  # positive/negative
)

# Load task-specific data
dataset = load_dataset("imdb")  # 50,000 movie reviews

# Fine-tuning hyperparameters (much smaller than pre-training!)
args = TrainingArguments(
    output_dir="./sentiment-model",
    num_train_epochs=3,           # just 3 epochs
    per_device_train_batch_size=16,
    learning_rate=2e-5,           # very small learning rate
    warmup_ratio=0.1,
    weight_decay=0.01,
    evaluation_strategy="epoch",
)

trainer = Trainer(model=model, args=args,
    train_dataset=dataset["train"], eval_dataset=dataset["test"])
trainer.train()
# Achieves ~93% accuracy in ~30 minutes on a single GPU!
```

</div>

---

# Practical training advice

<div class="tip-box" data-title="Rules of thumb">

1. **Start small**: Test your pipeline with a small model before scaling up
2. **Learning rate**: Fine-tuning uses 10-100x smaller learning rates than pre-training (typically 1e-5 to 5e-5)
3. **Epochs**: Fine-tuning needs only 2-5 epochs (vs. 1 epoch for pre-training on large data)
4. **Batch size**: Larger batches give more stable gradients but require more memory. Use gradient accumulation if your GPU is too small
5. **Evaluation**: Always hold out a validation set and monitor for overfitting

</div>

---

# Common training pitfalls

<div class="warning-box" data-title="Things that go wrong">

**Overfitting**: The model memorizes the training data instead of learning general patterns. Signs: training loss drops but validation loss increases. Fix: more data, dropout, early stopping.

**Catastrophic forgetting**: During fine-tuning, the model "forgets" its pre-trained knowledge. Fix: use small learning rates, freeze lower layers, or use techniques like LoRA.

**Data quality**: Garbage in, garbage out. Models trained on noisy, biased, or duplicated data learn those patterns. Fix: careful data curation and deduplication.

**Training instability**: Loss spikes or NaN values during training. Fix: gradient clipping, learning rate warmup, smaller batch sizes.

</div>

---

# Discussion: scaling and efficiency

<div class="tip-box" data-title="Questions to consider">

1. If scaling laws predict smooth improvement, will we reach human-level performance by just scaling up? Why or why not?
2. Training GPT-4 reportedly cost ~$100M. Is this sustainable? Who can afford to train these models?
3. Chinchilla showed we can match larger models with more data. What are the implications for open-source models?
4. How should we balance model performance against environmental cost (energy, carbon emissions)?

</div>

---

# Discussion: training data and ethics

<div class="tip-box" data-title="Questions to consider">

1. Pre-training data comes from the internet — who gave permission? What about copyright?
2. Models learn biases present in training data (gender, race, culture). Whose responsibility is it to fix this?
3. Fine-tuning with "human feedback" (RLHF) introduces the biases of the annotators. How do we account for this?
4. Should training data be publicly documented? What are the tradeoffs of transparency?

</div>

---

# References

<div class="note-box" data-title="Further reading">

[**Kaplan et al. (2020, *arXiv*)**](https://arxiv.org/abs/2001.08361) "Scaling Laws for Neural Language Models" — Discovered power-law scaling relationships.

[**Hoffmann et al. (2022, *arXiv*)**](https://arxiv.org/abs/2203.15556) "Training Compute-Optimal Large Language Models" — The Chinchilla paper on optimal data-parameter balance.

[**Vaswani et al. (2017, *NeurIPS*)**](https://arxiv.org/abs/1706.03762) "Attention Is All You Need" — The original transformer paper.

[**HuggingFace NLP Course, Chapter 3**](https://huggingface.co/learn/nlp-course/chapter3) — Hands-on tutorial for fine-tuning pre-trained models.

[**Loshchilov & Hutter (2019, *ICLR*)**](https://arxiv.org/abs/1711.05101) "Decoupled Weight Decay Regularization" — The AdamW optimizer paper.

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

Retrieval Augmented Generation (RAG): giving language models access to external knowledge!

</div>
