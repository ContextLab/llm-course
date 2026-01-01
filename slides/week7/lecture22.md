---
marp: true
theme: cdl-theme
paginate: true
header: 'Models of Language and Conversation'
footer: 'Week 7'
---

<!-- _class: lead -->

# Lecture 22: Scaling Up to GPT-3 and Beyond
## The Era of Few-Shot Learning 🚀

**Models of Language and Conversation**

Week 7

---

# Today's Journey 🗺️

<!-- TODO: Add manual table of contents or navigation -->


---

# GPT-2: The Unexpected Leap 📈


    <div class="callout info">
<div class="callout-title">Discussion</div>

What happens when we scale up GPT by 10x?

</div>

    

    <div class="columns">
<div class="column">

**GPT (2018):**
            - 117M parameters
- 5B tokens training
- BooksCorpus
- Requires fine-tuning

</div>
<div class="column">

**GPT-2 (2019):**
            - 1.5B parameters (13x larger)
- 40GB text (8x more data)
- WebText dataset
- **No fine-tuning needed!**

</div>
</div>

    

    <div class="callout warning">
<div class="callout-title">Key Claim</div>

"Language models are unsupervised multitask learners"

</div>

    

    
    *Reference: Radford et al. (2019) - "Language Models are Unsupervised Multitask Learners"*

---

# The WebText Dataset 🌐



    **How GPT-2 was trained:**

    

    <div class="callout info">
<div class="callout-title">WebText Creation</div>

1. Scrape all outbound links from Reddit with ≥3 karma
2. Filter for quality and diversity
3. Remove Wikipedia (to avoid test set contamination)
4. Result: 40GB of text, 8 million documents

</div>

    

    **Why Reddit links?**
    - 👍 Community curation (karma = quality signal)
- 📚 Diverse topics and writing styles
- 🌍 Web-scale variety
- 🎯 Human-filtered content

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

This introduced a new paradigm: curated web scraping as training data!

</div>


---

# GPT-2 Model Sizes 📊


    **Four model sizes released progressively:**

    

    
        | Medium | 345M | 24 | 1024 |
| --- | --- | --- | --- |
| Large | 762M | 36 | 1280 |
| XL | 1.5B | 48 | 1600 |

    

    

    **Staged release strategy:**
    - Feb 2019: Released small model (117M)
- May 2019: Medium model (345M)
- Aug 2019: Large model (762M)
- Nov 2019: Full model (1.5B)
- Concerns about misuse led to gradual release


---

# Zero-Shot Task Transfer 🎯


    **The surprising finding: GPT-2 can perform tasks without fine-tuning!**

    

    <div class="callout info">
<div class="callout-title">Zero-Shot Prompting</div>

Instead of fine-tuning, just format the task as text:

        

        **Translation:**
        `English: I love machine learning\\
        French: `

        

        **Question Answering:**
        `Answer the question:\\
        Q: What is the capital of France?\\
        A: `

        

        **Summarization:**
        `[Article text]\\
        TL;DR: `

</div>

    

    <div class="callout warning">
<div class="callout-title">No task-specific training needed!</div>

</div>


---

# GPT-2 Performance 📈


    **Zero-shot results on various benchmarks:**

    

    
        
        | Translation (En→Fr) | BLEU | 45.6 | 11.5 |
| --- | --- | --- | --- |
| Summarization | ROUGE | 40.2 | 29.3 |
| Question Answering | Accuracy | 89.4 | 63.1 |

    

    

    <div class="columns">
<div class="column">

**✅ Promising:**
            - Works without fine-tuning
- Generalizes across tasks
- Improves with scale

</div>
<div class="column">

**⚠️ Limitations:**
            - Still behind fine-tuned models
- Inconsistent quality
- Hard to control

</div>
</div>


---

# Text Generation Quality 📝


    <div class="callout info">
<div class="callout-title">GPT-2 Generated Text Sample</div>

        **Prompt:** "In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains."

        

        **GPT-2 continues:**
        "Even more surprising to the researchers was the fact that the unicorns spoke perfect English. The scientist named the population, after their distinctive horn, Ovid's Unicorn. These four-horned, silver-white unicorns were previously unknown to science..."

</div>

    

    **Observations:**
    - ✅ Coherent and fluent
- ✅ Maintains context and style
- ⚠️ Completely fabricated "facts"
- ⚠️ No grounding in reality

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

The model is *too good* at generating plausible-sounding nonsense!

</div>


---

# GPT-3: The 175B Parameter Model 🌟


    <div class="callout info">
<div class="callout-title">Discussion</div>

What happens when we scale up another 100x?

</div>

    

    
        
<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

            
            \addplot coordinates {
                (GPT, 0.117)
                (GPT-2, 1.5)
...
-->

```
[Diagram placeholder - manual conversion required]
```

    

    

    
    *Reference: Brown et al. (2020) - "Language Models are Few-Shot Learners"*

---

# GPT-3 Model Specifications 📊


    
        | Layers | 96 |
| --- | --- |
| Hidden size (d_model) | 12,288 |
| Attention heads | 96 |
| Context window | 2048 tokens |
| Training tokens | 300 billion |
| Training data | 570GB (filtered) |
| Training compute | ~3640 petaflop-days |
| Training cost | \textasciitilde$4.6M |

    

    

    <div class="callout warning">
<div class="callout-title">Scale</div>

GPT-3 is so large it has never been fully fine-tuned—only used via API!

</div>


---

# GPT-3 Training Data 📚


    **Training corpus composition:**

    

    
        
        | WebText2 | 19B tokens | 22% |
| --- | --- | --- |
| Books1 | 12B tokens | 8% |
| Books2 | 55B tokens | 8% |
| Wikipedia | 3B tokens | 3% |

    

    

    **Key differences from GPT-2:**
    - Much larger and more diverse
- Includes Common Crawl (with quality filtering)
- Multiple passes over high-quality data
- Carefully balanced mixture


---

# Few-Shot Learning 🎓



    **GPT-3's key capability: In-context learning**

    

    <div class="callout info">
<div class="callout-title">Learning Paradigms</div>

1. **Zero-shot**: Task description only
            - `Translate to French: I love AI →`

            

2. **One-shot**: One example
            - `sea otter → loutre de mer`
- `I love AI →`

            

3. **Few-shot**: Multiple examples (typically 10-100)
            - `dog → chien`
- `cat → chat`
- `bird → oiseau`
- `I love AI →`

</div>

    

    **No gradient updates! Just prompt engineering.**

---

# In-Context Learning Mechanism 🧠


    
        
```

                \t -> **GPT-3 -> Predicted output
```

    \end{center**

    

    **How does it work?**
    - Model recognizes pattern in examples
- Continues the pattern for new input
- No weight updates—pure inference!
- "Learning" happens at inference time


---

# GPT-3 Performance Across Tasks 📊


    
        
<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

            
```

    

    

    **Key observation: More examples = better performance**

---

# GPT-3's Emergent Abilities ✨


    <div class="callout info">
<div class="callout-title">Discussion</div>

What can GPT-3 do that smaller models can't?

</div>

    

    **Emergent capabilities:**
    - 🧮 **Arithmetic**: 2-3 digit addition/subtraction
- 💭 **Reasoning**: Simple logical deduction
- 🎨 **Code generation**: Write simple programs
- 🌍 **Knowledge synthesis**: Combine facts
- 📝 **Style transfer**: Mimic writing styles
- 🎯 **Task composition**: Multi-step procedures

    

    <div class="callout warning">
<div class="callout-title">Scaling Hypothesis</div>

These abilities weren't explicitly trained—they *emerged* from scale!

</div>

    

    
    *Reference: Wei et al. (2022) - "Emergent Abilities of Large Language Models"*

---

# The Scaling Laws Hypothesis 📈



    <div class="callout info">
<div class="callout-title">Kaplan et al. (2020) - "Scaling Laws for Neural Language Models"</div>

Model performance scales as a **power law** with:
        - Model size (parameters)
- Dataset size (tokens)
- Compute (FLOPs)

</div>

    

    **Key findings:**
    1. Performance depends strongly on scale
2. Very weak dependence on model shape (depth vs width)
3. Smooth, predictable improvements
4. Optimal compute allocation: Grow model and data together

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

If scaling laws hold, we can predict future model performance!

</div>


---

# The Scaling Law Formula ⚖️


    **Loss as a function of scale:**

    

    $$L(N) = \left({N}\right)^{\alpha_N}$$

    where:
    - $L$ = Cross-entropy loss
- $N$ = Number of parameters
- $N_c$ = Scaling constant
- $\alpha_N \approx 0.076$ (empirically determined)

    

    
        
<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

            
            \addplot[blue, thick, domain=1e6:1e11, samples=50] {2.5*(1e8/x)^0.076};
            
            \addplot[red, only marks, mark=*, mark size=2pt] coordinates {
                (1.1...
-->

```
[Diagram placeholder - manual conversion required]
```

    

---

# Implications of Scaling Laws 🎯


    <div class="columns">
<div class="column">

**✅ Good news:**
            - Predictable improvements
- Clear path to better models
- Can plan compute budgets
- Smooth progress curve

</div>
<div class="column">

**⚠️ Challenges:**
            - Diminishing returns
- Exponential cost increase
- Hardware limitations
- Environmental impact

</div>
</div>

    

    <div class="callout warning">
<div class="callout-title">The Scaling Question</div>

To improve loss by 0.1: \\
        $N_{new} = N_{old} \times \left(}{L_{new}}\right)^{1/\alpha} \approx N_{old} \times 10^{13}$

        

        Massive compute increase for small improvements!

</div>


---

# Chinchilla Scaling Laws 🐭


    <div class="callout info">
<div class="callout-title">Hoffmann et al. (2022) - "Training Compute-Optimal Large Language Models"</div>

Previous models were over-parameterized and under-trained!

</div>

    

    **Key insight:**
    - For a given compute budget, should balance model size and data
- **Optimal ratio**: 20 tokens per parameter
- GPT-3 (175B params, 300B tokens): Under-trained!
- Chinchilla (70B params, 1.4T tokens): Better performance

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

Instead of making models bigger, train longer on more data!

</div>

    

    
    *This influenced Llama 2, GPT-4, and other modern models*

---

# The Path to ChatGPT 🤖


    
        
```
**GPT-3 -> \textbf{InstructGPT -> \textbf{ChatGPT -> Predict next token -> Follow instructions -> Helpful & harmless
```

    \end{center**

    

    **Three key innovations:**
    1. **Instruction tuning**: Train to follow instructions
2. **RLHF**: Reinforcement Learning from Human Feedback
3. **Safety guardrails**: Reduce harmful outputs


---

# Instruction Tuning 📋



    <div class="callout info">
<div class="callout-title">What is Instruction Tuning?</div>

Fine-tune the model on (instruction, response) pairs to make it better at following user commands.

</div>

    

    **Training examples:**
    - *"Explain quantum computing to a 5-year-old"* → [explanation]
- *"Write a Python function to sort a list"* → [code]
- *"Summarize this article in 3 sentences"* → [summary]

    

    <div class="columns">
<div class="column">

**Before (GPT-3):**
            - Continues the text
- Often misunderstands intent
- Needs careful prompting

</div>
<div class="column">

**After (InstructGPT):**
            - Follows instructions
- Clear, helpful responses
- More controllable

</div>
</div>


---

# RLHF: Reinforcement Learning from Human Feedback 👍


    
        
```
 1. Generate respon ->  2. Humans rank ->  3. Train reward mo ->  4. Optimize with R
```

    

    

    **Why RLHF?**
    - Hard to write perfect instruction examples
- Easier to compare: "Which response is better?"
- Learns subtle preferences (tone, safety, helpfulness)
- Aligns model with human values


---

# ChatGPT's Impact 🌍


    **Launched: November 30, 2022**

    

    **Growth:**
    - 1 million users in 5 days
- 100 million users in 2 months
- Fastest-growing consumer application ever

    

    **Why so successful?**
    - ✅ Easy to use (conversational interface)
- ✅ Broadly capable (many tasks)
- ✅ Accessible (free tier)
- ✅ Impressive demos went viral
- ✅ Timing (post-pandemic digital adoption)

    

    <div class="callout warning">
<div class="callout-title">Cultural Impact</div>

ChatGPT brought LLMs into mainstream consciousness and sparked an AI revolution.

</div>


---

# The Modern LLM Landscape 🌈


    **Post-GPT-3 developments (2020-2024):**

    

    - **2021**: Anthropic founded (Claude)
- **2022**: ChatGPT launched
- **2023**: GPT-4 (multimodal, improved reasoning)
- **2023**: Llama 2 (open weights, 70B params)
- **2023**: Gemini (Google's multimodal LLM)
- **2024**: Claude 3, GPT-4o, Llama 3
- **2024**: Smaller efficient models (Phi, Mistral)

    

    **Key trends:**
    1. Multimodal capabilities (vision, audio)
2. Longer context windows (100K+ tokens)
3. Better reasoning and factuality
4. Open-source alternatives
5. Efficiency improvements


---

# Open Source LLMs 🔓



    <div class="callout info">
<div class="callout-title">Discussion</div>

Should powerful AI models be open or closed?

</div>

    

    <div class="columns">
<div class="column">

**Closed (GPT-4, Claude):**
            - ✅ Better safety control
- ✅ Monetization easier
- ✅ Protect IP
- ❌ No transparency
- ❌ Vendor lock-in
- ❌ Limited customization

</div>
<div class="column">

**Open (Llama, Mistral):**
            - ✅ Transparency
- ✅ Community innovation
- ✅ Full control
- ✅ No API costs
- ❌ Potential misuse
- ❌ Compute requirements

</div>
</div>

    

    <div class="callout tip">
<div class="callout-title">Think about it!</div>

The debate mirrors open source software vs proprietary—with higher stakes!

</div>


---

# Current Limitations 🚧


    **What LLMs still struggle with:**

    

    1. **Factual accuracy**
        - Hallucinations and confabulation
- No citations or sources
2. **Reasoning**
        - Multi-step logic
- Mathematical proofs
3. **Knowledge grounding**
        - Knowledge cutoff date
- Can't access real-time info
4. **Personalization**
        - No persistent memory
- Stateless conversations
5. **Reliability**
        - Inconsistent outputs
- Prompt sensitivity


---

# Key Takeaways 🔑


    1. **Scaling works**
        - GPT → GPT-2 → GPT-3 showed clear improvements
- Power law scaling continues to hold

        

2. **Few-shot learning emerged at scale**
        - No fine-tuning needed for many tasks
- In-context learning is powerful

        

3. **Scaling laws provide predictability**
        - But diminishing returns and compute costs are real
- Chinchilla scaling: balance model size and data

        

4. **RLHF changed everything**
        - ChatGPT = GPT-3.5 + instruction tuning + RLHF
- Alignment is crucial for deployment

        

5. **The field is rapidly evolving**
        - Open vs closed debate continues
- New capabilities emerging


---

# Readings 📖



    <div class="callout info">
<div class="callout-title">Required Readings</div>

1. **Radford et al. (2019)** - "Language Models are Unsupervised Multitask Learners" (GPT-2) \\
            [[PDF]](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)
2. **Brown et al. (2020)** - "Language Models are Few-Shot Learners" (GPT-3) \\
            [[ArXiv]](https://arxiv.org/abs/2005.14165)
3. **Kaplan et al. (2020)** - "Scaling Laws for Neural Language Models" \\
            [[ArXiv]](https://arxiv.org/abs/2001.08361)

</div>

    

    <div class="callout info">
<div class="callout-title">Recommended Readings</div>

- **Wei et al. (2022)** - "Emergent Abilities of Large Language Models" \\
            [[ArXiv]](https://arxiv.org/abs/2206.07682)
- **Ouyang et al. (2022)** - "Training language models to follow instructions with human feedback" (InstructGPT) \\
            [[ArXiv]](https://arxiv.org/abs/2203.02155)
- **Hoffmann et al. (2022)** - "Training Compute-Optimal Large Language Models" (Chinchilla) \\
            [[ArXiv]](https://arxiv.org/abs/2203.15556)

</div>


---

# Next Lecture Preview 🔮



    <div class="callout info">
<div class="callout-title">Lecture 20: Implementing GPT from Scratch</div>

- Building a mini-GPT in PyTorch
- Tokenization with BPE
- Training loop and optimization
- Sampling strategies (greedy, top-k, nucleus)
- Hands-on coding session

</div>

    

    
        Questions? 💬
    
