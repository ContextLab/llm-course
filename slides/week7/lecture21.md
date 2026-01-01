---
marp: true
theme: cdl-theme
paginate: true
header: 'Models of Language and Conversation'
footer: 'Week 7'
---

<!-- _class: lead -->

# Lecture 21: GPT Architecture
## Generative Pre-Training for Language 🤖

**Models of Language and Conversation**

Week 7

---

# Today's Journey 🗺️

<!-- TODO: Add manual table of contents or navigation -->


---

# The GPT Revolution 🚀


    <div class="callout info">
<div class="callout-title">Discussion</div>

What made GPT different from previous language models?

</div>

    

    **Key Innovation: Pre-training + Fine-tuning**
    - 📚 **Pre-train** on massive unlabeled text (unsupervised)
- 🎯 **Fine-tune** on specific tasks (supervised)
- 🔄 Transfer learning for NLP
- 🎨 One model, many tasks

    

    <div class="callout warning">
<div class="callout-title">Paradigm Shift</div>

Before GPT: Task-specific models trained from scratch \\
        After GPT: General-purpose models adapted to tasks

</div>

    

    
    *Reference: Radford et al. (2018) - "Improving Language Understanding by Generative Pre-Training"*

---

# From BERT to GPT: Different Approaches 🔀



    <div class="columns">
<div class="column">

**BERT (2018):**
            - 🎭 **Masked Language Model**
- Bidirectional context
- Fill in the blank
- Great for understanding
- Not designed for generation

            

            *Example:*
            "The [MASK] sat on the mat"

</div>
<div class="column">

**GPT (2018):**
            - ➡️ **Autoregressive Model**
- Left-to-right (causal)
- Predict next token
- Natural for generation
- Can also understand

            

            *Example:*
            "The cat sat" → predict "on"

</div>
</div>

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

Why is autoregressive modeling more natural for text generation?

</div>


---

# The Transformer Decoder 🏗️


    **GPT uses the Transformer *decoder** architecture*

    

    
        
```
Input Tokens -> Token + Position Embeddin -> Masked Self-Attention -> Feed Forward -> Masked Self-Attention -> Feed Forward -> Output Logits ->  Layer 1
```

    

    

    **Key: Masked attention prevents "peeking" at future tokens!**

---

# Masked Self-Attention 👀


    **The Core Innovation: Causal Masking**

    

    
        
```
 Tokens ->  $t_\i$ ->  $t_\i$ -> \textcolor{blue!30 -> □ Masked (cannot attend)
```

    

    

    **Each token can only attend to itself and previous tokens**
    - Ensures autoregressive property
- No information leakage from future
- Allows parallel training


---

# Position Encoding in GPT 📍


    **Why we need position information:**

    

    <div class="callout info">
<div class="callout-title">The Problem</div>

Self-attention is *permutation invariant*—it doesn't inherently know word order!

</div>

    

    **GPT's Solution: Learned Position Embeddings**
    - Each position gets a learnable embedding
- Added to token embeddings: $x_i = _i + _i$
- Model learns position patterns during training
- Maximum sequence length: 512 tokens (GPT-1)

    

    <div class="columns">
<div class="column">

**Alternative: Sinusoidal** \\
             (Used in original Transformer)
            - Fixed function
- Generalizes to longer sequences

</div>
<div class="column">

**GPT: Learned** \\
             (More flexible)
            - Learned from data
- Task-specific patterns

</div>
</div>


---

# GPT-1 Model Specifications 📊


    
        | Layers | 12 |
| --- | --- |
| Hidden size | 768 |
| Attention heads | 12 |
| Max sequence length | 512 tokens |
| Vocabulary size | 40,000 (BPE) |
| Training data | BooksCorpus (7,000 books) |
| Training tokens | ~5 billion |

    

    

    **Training objective:**
    $$ = \sum_{i} \log P(t_i | t_{<i}; \Theta)$$

    Maximize likelihood of next token given previous context

---

# GPT Architecture in Code 💻


```python
import torch.nn as nn

class GPTBlock(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.attention = MaskedMultiHeadAttention(d_model, n_heads)
        self.norm1 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, 4 * d_model),
            nn.GELU(),
            nn.Linear(4 * d_model, d_model)
        )
        self.norm2 = nn.LayerNorm(d_model)

    def forward(self, x):
        # Self-attention with residual
        x = x + self.attention(self.norm1(x))
        # Feed-forward with residual
        x = x + self.ffn(self.norm2(x))
        return x

class GPT(nn.Module):
    def __init__(self, vocab_size, d_model, n_layers, n_heads, max_len):
        super().__init__()
        self.token_embed = nn.Embedding(vocab_size, d_model)
        self.pos_embed = nn.Embedding(max_len, d_model)
        self.blocks = nn.ModuleList([
            GPTBlock(d_model, n_heads) for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab_size)
```


---

# Two-Stage Training 🎓


    
        
```
**Stage 1: Pre-trai -> \textbf{Stage 2: Fine-tun ->  BooksCorpus   5B t ->  Task dataset   1K- -> Task Model
```

    \end{center**

    

    **Why this works:**
    - Pre-training learns general language understanding
- Fine-tuning adapts to specific task format
- Much less task data needed!


---

# Pre-training: Language Modeling 📚



    **Objective: Predict next token**

    

    <div class="callout info">
<div class="callout-title">Example Training Sequence</div>

**Text:** "The quick brown fox jumps over the lazy dog"

        

        **Training examples:**
        - "The" → predict "quick"
- "The quick" → predict "brown"
- "The quick brown" → predict "fox"
- "The quick brown fox" → predict "jumps"
- ...

</div>

    

    **Self-supervised learning:**
    - No manual labels needed!
- Every text provides training signal
- Can use web-scale data
- Model learns: syntax, semantics, facts, reasoning


---

# Fine-tuning for Downstream Tasks 🎯


    **Task Format: Input + Delimiter + Label**

    

    <div class="columns">
<div class="column">

**Text Classification:**

            
            `[START] This movie is amazing! [DELIM] [LABEL]`

            

            Model predicts: "Positive"

            

            **Entailment:**

            
            `[START] Premise [DELIM] Hypothesis [DELIM] [LABEL]`

            

            Model predicts: "Entailment" / "Contradiction" / "Neutral"

</div>
<div class="column">

**Question Answering:**

            
            `[START] Context [DELIM] Question [DELIM] [ANSWER]`

            

            Model predicts answer span

            

            **Similarity:**

            
            `[START] Text1 [DELIM] Text2 [DELIM] [LABEL]`

            

            Model predicts similarity score

</div>
</div>

    

    <div class="callout warning">
<div class="callout-title">Key Insight</div>

All tasks can be framed as text completion! 🎯

</div>


---

# Fine-tuning Implementation Details ⚙️


    **What changes during fine-tuning?**

    

    1. **Add task-specific input transformations**
        - Format inputs with delimiters
- Add special tokens

        

2. **Add classification head (optional)**
        - Linear layer for classification
- Or use language modeling head

        

3. **Train with supervised objective**
        - Cross-entropy loss
- Much lower learning rate
- Few epochs (3-5)

    

    **Hyperparameters:**
    - Learning rate: 6.25e-5 (much lower than pre-training!)
- Batch size: 32
- Max epochs: 3
- Linear learning rate decay to 0


---

# GPT-1 Results 📊


    **Performance on GLUE Benchmark:**

    

    
        
        | Question Answering | 86.7 | 88.1 |
| --- | --- | --- |
| Semantic Similarity | 85.0 | 85.8 |
| Text Classification | 93.0 | 94.2 |

    

    

    <div class="callout warning">
<div class="callout-title">Key Findings</div>

- GPT achieved SOTA on 9 out of 12 tasks studied
- Large improvements on tasks with less training data
- Transfer learning works for NLP!

</div>

    

    
    *Reference: Radford et al. (2018) - "Improving Language Understanding by Generative Pre-Training"*

---

# Zero-Shot and Few-Shot Learning 🎯



    <div class="callout info">
<div class="callout-title">Discussion</div>

What if we could use the model *without* fine-tuning?

</div>

    

    **Definitions:**
    - **Zero-shot**: No task-specific training examples
- **Few-shot**: A few examples (1-10) as context
- **Fine-tuning**: Full supervised training

    

    **GPT-1 observations:**
    - ✅ Fine-tuning works best
- ⚠️ Zero-shot performance is weak
- 💡 Model has learned a lot, but needs task formatting

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

This limitation motivated GPT-2 and GPT-3: Can we make models that work zero-shot?

</div>


---

# Visualizing What GPT Learns 🎨


    
        
```
 \label ->  Word order,    gram ->  Word meanings ->  World knowledge ->  Task completion
```

    

    

    **Layer analysis shows:**
    - Early layers: Syntactic patterns
- Middle layers: Semantic understanding
- Later layers: Task-specific reasoning
- Progressive abstraction!


---

# The Generative Pre-training Paradigm 🌟


    **Why "Generative Pre-Training" was revolutionary:**

    

    1. **Unified Architecture**
        - Same model for all tasks
- vs. task-specific architectures

        

2. **Transfer Learning**
        - Learn once, apply many times
- vs. training from scratch

        

3. **Scalability**
        - More data → Better performance
- Clear path to improvement

        

4. **Simplicity**
        - Just predict next token
- No complex objectives

    

    <div class="callout warning">
<div class="callout-title">This paradigm enabled GPT-2, GPT-3, and beyond!</div>

</div>


---

# Limitations of GPT-1 ⚠️



    **What GPT-1 couldn't do well:**

    

    - ❌ **Zero-shot performance**: Needed fine-tuning for each task
- ❌ **Model size**: 117M parameters (small by today's standards)
- ❌ **Training data**: Limited to ~5B tokens
- ❌ **Context length**: Only 512 tokens
- ❌ **Generation quality**: Sometimes incoherent
- ❌ **Factual accuracy**: Prone to hallucinations

    

    <div class="callout info">
<div class="callout-title">Discussion</div>

How would you address these limitations? \\
        

        *(Spoiler: GPT-2 and GPT-3 tried to solve these!)*

</div>


---

# Comparison with BERT 🔄


    
        
        | Training objective | Masked LM | Autoregressive LM |
| --- | --- | --- |
| Context | Bidirectional | Left-to-right |
| Best for | Understanding | Generation |
| Fine-tuning | Task-specific heads | Unified format |
| Parameters (base) | 110M | 117M |

    

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

BERT dominated understanding tasks (2018-2019), but GPT's approach proved more scalable and versatile. Why?

</div>

    

    **Answer:** Autoregressive modeling naturally supports generation, which unlocks zero-shot and few-shot capabilities!

---

# Key Takeaways 🔑


    1. **GPT introduced generative pre-training**
        - Transformer decoder architecture
- Autoregressive language modeling

        

2. **Two-stage training paradigm**
        - Unsupervised pre-training on massive text
- Supervised fine-tuning on task data

        

3. **Masked self-attention is key**
        - Enables autoregressive generation
- Prevents information leakage

        

4. **Transfer learning for NLP**
        - Learn general patterns once
- Apply to many tasks

        

5. **Foundation for modern LLMs**
        - GPT-2, GPT-3, ChatGPT all build on this


---

# Readings 📖


    <div class="callout info">
<div class="callout-title">Required Reading</div>

**Radford et al. (2018)** - "Improving Language Understanding by Generative Pre-Training" \\
        [[PDF]](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)

</div>

    

    <div class="callout info">
<div class="callout-title">Recommended Readings</div>

- **Vaswani et al. (2017)** - "Attention is All You Need" \\
            [[ArXiv]](https://arxiv.org/abs/1706.03762)
- **Devlin et al. (2018)** - "BERT: Pre-training of Deep Bidirectional Transformers" \\
            [[ArXiv]](https://arxiv.org/abs/1810.04805)
- **The Illustrated GPT-2** by Jay Alammar \\
            [[Blog]](https://jalammar.github.io/illustrated-gpt2/)

</div>


---

# Next Lecture Preview 🔮



    <div class="callout info">
<div class="callout-title">Lecture 19: Scaling Up to GPT-3 and Beyond</div>

- GPT-2: Language models as unsupervised multitask learners
- GPT-3: Few-shot learning at scale
- Scaling laws: Why bigger is better
- Emergent abilities of large language models
- From GPT-3 to ChatGPT

</div>

    

    
        Questions? 💬
    
