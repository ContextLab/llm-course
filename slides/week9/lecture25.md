---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication'
footer: 'Week 9'
---

<!-- _class: lead -->

# Lecture 25: Mixture of Experts \& Efficiency
## Scaling Efficiently with Sparse Models 🚀

**PSYC 51.07: Models of Language and Communication**

Week 9

---

# Today's Journey 🗺️

<!-- TODO: Add manual table of contents or navigation -->


---

# The Scaling Dilemma 📈



Larger models perform better... but at what cost?

**Training a 175B parameter model (GPT-3 scale):**
- 💰 Cost: $4-12 million in compute
- 🔥 Energy: Equivalent to 120 homes for a year
- ⏳ Time: Weeks to months on thousands of GPUs
- 🐌 Inference: Slow and expensive ($0.002-0.02 per 1K tokens)
- 🌍 Environmental: Massive carbon footprint

<div class="callout warning">
<div class="callout-title">The Challenge</div>

Can we get the benefits of scale without the full computational cost?

</div>

**Key Insight:** Not all parameters need to be active for every input!

---

# Dense vs Sparse Models 🎯


<div class="columns">
<div class="column">

**Dense Models (e.g., GPT-3):**

<!-- Timeline - see original for details -->

- All parameters used
- High compute per token
- Expensive inference
- Simple architecture

</div>
<div class="column">

**Sparse Models (MoE):**

<!-- Timeline - see original for details -->

- Subset of parameters
- Lower compute per token
- Faster, cheaper
- More complex routing

</div>
</div>

MoE: More total parameters, but fewer active parameters per forward pass!


---

# What is Mixture of Experts? 🧠


<div class="callout info">
<div class="callout-title">Mixture of Experts (MoE)</div>

A neural network architecture where different "expert" sub-networks specialize in different parts of the input space, with a gating mechanism that routes inputs to the appropriate experts.

</div>

**Key Components:**
1. **Experts**: Multiple specialized feed-forward networks
2. **Router/Gate**: Learned function that assigns inputs to experts
3. **Sparse Activation**: Only top-k experts process each input

**Intuition:**
- Different experts become good at different things
- Math expert, code expert, language expert, etc.
- Router learns which expert(s) to use for each input

*Reference: Shazeer et al. (2017) - "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer"*

---

# MoE Architecture 🏗️



```
$x$ -> Router/Gate $g(x)$ -> Expert 1 (Math) -> Expert 2 (Code) -> Expert 3 (Lang) -> Expert N (...) -> $y$ -> $y = \sum_{i=1
```

**Typical setup:** N=8-64 experts, but only top-2 are active per token

---

# The Router Mechanism 🎯


**How does routing work?**

**Step 1: Compute routing scores**
$$h(x) = W_{} \cdot x$$

**Step 2: Apply softmax to get probabilities**
$$g(x) = (h(x))$$

**Step 3: Select top-k experts (typically k=2)**
$$(g(x)) \rightarrow {i_1, i_2}$$

**Step 4: Route token only to selected experts**
$$y = \sum_{i \in } g(x)_i \cdot E_i(x)$$

**Benefits:**
- ✅ Sparse computation: Only 2 out of N experts active
- ✅ Scalable: Can add more experts without increasing per-token cost
- ✅ Specialization: Experts learn different capabilities
- ✅ Better quality/compute ratio


---

# MoE in PyTorch (Simplified) 💻


```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MoELayer(nn.Module):
    def __init__(self, d_model, num_experts, expert_capacity, k=2):
        super().__init__()
        self.num_experts = num_experts
        self.k = k  # Top-k routing

        # Router
        self.gate = nn.Linear(d_model, num_experts)

        # Experts (simple FFN for each)
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(d_model, 4 * d_model),
                nn.ReLU(),
                nn.Linear(4 * d_model, d_model)
            )
            for _ in range(num_experts)
        ])

    def forward(self, x):
        # x: (batch_size, seq_len, d_model)
        batch_size, seq_len, d_model = x.shape

        # Compute routing scores
        router_logits = self.gate(x)  # (batch, seq, num_experts)
        router_probs = F.softmax(router_logits, dim=-1)

        # Select top-k experts
        top_k_probs, top_k_indices = torch.topk(router_probs, self.k, dim=-1)
        # top_k_probs: (batch, seq, k)
        # top_k_indices: (batch, seq, k)
```


---

# MoE Forward Pass (cont.) 💻


```python
# Initialize output
        output = torch.zeros_like(x)

        # Route to experts
        for i in range(self.k):
            # Get expert indices for this position
            expert_idx = top_k_indices[:, :, i]  # (batch, seq)
            expert_weight = top_k_probs[:, :, i]  # (batch, seq)

            # Process through each expert
            for expert_id in range(self.num_experts):
                # Mask for tokens routed to this expert
                mask = (expert_idx == expert_id)

                if mask.any():
                    # Get tokens for this expert
                    expert_input = x[mask]

                    # Process through expert
                    expert_output = self.experts[expert_id](expert_input)

                    # Add weighted output
                    output[mask] += expert_weight[mask].unsqueeze(-1) * expert_output

        return output
```

*Note: This is simplified. Production implementations handle batching and load balancing more efficiently.*

---

# Load Balancing Problem ⚖️


**Problem:** Some experts get overused, others underutilized

<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

    
    \addplot coordinates {
        (E1, 5000)
        (E2, 200)
        (E3, 7000)
        (E4, 100)
        (E5, 150)
        (E6, 8000)
        (E7, 80)
        (E8, 120)
    };
    
...
-->

```
[Diagram placeholder - manual conversion required]
```

**Why this is bad:**
- Inefficient use of capacity
- Some experts undertrained
- Bottlenecks at popular experts
- Reduced model expressiveness


---

# Load Balancing Solutions 🔧


**1. Auxiliary Load Balancing Loss**

$$_{} = \alpha \cdot \sum_{i=1}^{N} f_i \cdot P_i$$

where:
- $f_i$ = fraction of tokens routed to expert $i$
- $P_i$ = expert $i$'s average routing probability
- $\alpha$ = balancing coefficient (e.g., 0.01)

**2. Expert Capacity**
- Limit number of tokens per expert
- Capacity $C = }{} \times $
- Overflow tokens routed to next-best expert or skipped

**3. Random Routing (with probability)**
- Add noise to routing decisions
- Prevents complete collapse to few experts


---

# Training Instability ⚠️


**Challenges in training MoE:**

1. **Routing Collapse**
    - All tokens routed to one or few experts
- *Solution:* Load balancing loss, initialization
2. **Expert Imbalance**
    - Some experts undertrained
- *Solution:* Balanced batching, capacity limits
3. **High Variance Gradients**
    - Discrete routing decisions
- *Solution:* Softmax gating, larger batch sizes
4. **Dead Experts**
    - Expert never gets activated
- *Solution:* Expert dropout, random routing

**Best Practice:** Start with dense model, then convert to MoE for fine-tuning

---

# Memory and Communication 💾


**MoE Memory Requirements:**

<div class="callout warning">
<div class="callout-title">Challenge</div>

All experts must be in memory, even if only 2 are active!

</div>

**Example: Mixtral 8x7B**
- 8 experts × 7B parameters each = 56B total
- But only 2 experts active → 14B active parameters
- **Memory:** Need to store all 56B parameters
- **Compute:** Only process 14B parameters per token

**Solutions:**
1. **Expert Parallelism**: Distribute experts across GPUs
2. **Offloading**: Keep inactive experts on CPU/disk
3. **Quantization**: Reduce precision (int8, int4)
4. **Shared Experts**: Some experts always active for all tokens


---

# Mixtral 8x7B 🎬


<div class="callout info">
<div class="callout-title">Mixtral (Jiang et al., 2024)</div>

A state-of-the-art sparse MoE model from Mistral AI with 8 experts, each 7B parameters.

</div>

**Architecture:**
- **Total parameters**: 47B (8 experts × 7B, minus shared layers)
- **Active parameters**: 13B (only 2 experts active per token)
- **Layers**: 32 transformer blocks
- **Context**: 32K tokens
- **Vocabulary**: 32K tokens (SentencePiece)

**Training:**
- Open weights (Apache 2.0 license)
- Multilingual (English, French, German, Spanish, Italian)
- Code-capable

*Reference: Jiang et al. (2024) - "Mixtral of Experts"*

---

# Mixtral Performance 📊


**Comparison with dense models:**

| Llama 2 13B | 13B | 13B | 55.0 | 0.5× |
| --- | --- | --- | --- | --- |
| Llama 2 70B | 70B | 70B | 69.7 | 0.16× |
| Mixtral 8x7B | 47B | 13B | 70.6 | 6× |

**Key Results:**
- ✅ Matches/exceeds Llama 2 70B quality
- ✅ 6× faster inference (13B active vs 70B)
- ✅ Better cost/performance ratio
- ✅ Fits on fewer GPUs

MoE achieves 70B-model quality with 13B-model inference cost!


---

# What Do Experts Learn? 🔬


**Do experts actually specialize?**

**Analysis of Mixtral experts:**

- **Language-specific**: Some experts prefer French vs English
- **Domain-specific**: Code, math, natural language
- **Syntactic**: Different parts of speech
- **Positional**: Some activated more at start/end of sequences

**Interesting findings:**
- Specialization emerges without explicit supervision!
- Different tokens in same sentence may route to different experts
- Some experts are "generalists," others highly specialized
- Multilingual data leads to language-specific experts

How could we encourage specific types of specialization during training?


---

# Model Compression Methods 🗜️


**Beyond MoE: Other ways to make models efficient**

1. **Quantization**
    - Reduce precision: FP16, INT8, INT4
- 4-bit quantization: 4× memory reduction!
- QLoRA: Efficient fine-tuning with quantization
2. **Pruning**
    - Remove unimportant weights
- Structured (entire layers) vs unstructured (individual weights)
- Up to 50-90% sparsity with minimal quality loss
3. **Distillation**
    - Train small model to mimic large model
- DistilBERT, DistilGPT
- 40% size, 95% performance
4. **Parameter Sharing**
    - ALBERT: Share weights across layers
- Reduces parameters, not computation


---

# Inference Optimizations ⚡


**Making generation faster:**

1. **KV Cache**
    - Store key-value pairs from previous tokens
- Avoid recomputing attention for past tokens
- Essential for autoregressive generation
2. **Flash Attention**
    - Fused attention kernel
- 2-4× faster, less memory
- FlashAttention-2 even better
3. **Speculative Decoding**
    - Use small model to draft tokens
- Large model verifies in parallel
- 2-3× speedup with no quality loss
4. **Batch Processing**
    - Continuous batching (vLLM)
- Better GPU utilization
- Higher throughput


---

# State Space Models: Mamba 🐍


**Alternative to Transformers with linear-time complexity**

<div class="callout info">
<div class="callout-title">Mamba (Gu & Dao, 2023)</div>

State space models that can match Transformer performance with $O(n)$ instead of $O(n^2)$ complexity.

</div>

**Why this matters:**
- Attention scales quadratically with sequence length
- SSMs scale linearly
- Better for long sequences (100K+ tokens)
- Faster training and inference

**Trade-offs:**
- ❌ Less expressive than full attention (for some tasks)
- ❌ Newer, less mature
- ✅ Much more efficient
- ✅ Can combine with attention in hybrid models

*Reference: Gu & Dao (2023) - "Mamba: Linear-Time Sequence Modeling with Selective State Spaces"*

---

# Efficiency Trade-off Landscape 🗺️



<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

    

    % Dense models
    \addplot[only marks, mark=*, mark size=4pt, blue] coordinates {
        (2, 9)  % Large dense
        (4, 7)  % Medium dense
        (6, 5)  % Small dense
    };
    \node[blue] at (axis cs:2,9.5) {\ti...
-->

```
[Diagram placeholder - manual conversion required]
```

**Key Insight:** Different techniques for different use cases!

---

# Environmental Impact 🌍


**The carbon cost of large language models:**

| GPT-3 | 502 | 112 cars for 1 year |
| --- | --- | --- |
| Llama 2 | ~539 | 120 cars for 1 year |

**Factors affecting carbon footprint:**
- Model size (more parameters = more compute)
- Training time
- Hardware efficiency (newer GPUs more efficient)
- Energy source (coal vs solar)
- Location of data center

*Source: Strubell et al. (2019) - "Energy and Policy Considerations for Deep Learning in NLP"*

---

# Democratizing Access 🔓



Should powerful AI be accessible to everyone, or only large organizations?

**Current reality:**
- Training GPT-3 scale model: $4-12M
- Requires 1000+ GPUs
- Only big tech companies can afford
- Creates AI "haves" and "have-nots"

**Efficiency enables democratization:**
- ✅ Smaller models on consumer hardware
- ✅ Open-source weights (Llama, Mixtral, Mistral)
- ✅ Efficient fine-tuning (LoRA, QLoRA)
- ✅ Cloud access with pay-per-use pricing
- ✅ Edge deployment (on-device models)

<div class="callout warning">
<div class="callout-title">Goal</div>

Make AI accessible to researchers, startups, and developing nations—not just big tech!

</div>


---

# Open vs Closed Models 🤔


<div class="columns">
<div class="column">

**Closed (GPT-4, Claude):**
- ✅ Better safety control
- ✅ Monetization easier
- ✅ Protect IP
- ✅ Can update/improve
- ❌ No transparency
- ❌ Vendor lock-in
- ❌ Limited customization
- ❌ Privacy concerns

</div>
<div class="column">

**Open (Llama, Mixtral):**
- ✅ Transparency
- ✅ Community innovation
- ✅ Full control
- ✅ No API costs
- ✅ Privacy (on-prem)
- ❌ Potential misuse
- ❌ Compute requirements
- ❌ Need ML expertise

</div>
</div>

**The debate:**
- Mirrors open-source software vs proprietary
- But higher stakes (safety, dual-use concerns)
- Trend: Moving toward more open models
- Efficiency helps open models (smaller = easier to distribute)


---

# Future of Efficient LLMs 🔮


**Where is the field heading?**

1. **Hybrid Architectures**
    - Combine MoE + attention + SSMs
- Use different mechanisms for different parts
- Dynamic architecture selection
2. **Conditional Computation**
    - Adjust depth/width based on input difficulty
- Early exit for easy examples
- More compute for hard problems
3. **Neural Architecture Search**
    - Automatically find efficient architectures
- Multi-objective optimization (quality + speed + size)
4. **Hardware Co-Design**
    - Design models for specific hardware
- Custom chips for LLMs (TPUs, Groq, Cerebras)
- Edge-specific models


---

# Key Takeaways 🔑


1. **MoE enables efficient scaling**
    - More parameters, fewer active per token
- Better quality/compute ratio

    

2. **Challenges exist but solvable**
    - Load balancing, training instability
- Solutions: auxiliary losses, capacity limits

    

3. **Mixtral proves MoE works at scale**
    - 70B-quality with 13B-cost
- Open weights accelerate adoption

    

4. **Many paths to efficiency**
    - Quantization, pruning, distillation
- Flash attention, speculative decoding
- SSMs, hybrid architectures

    

5. **Efficiency enables democratization**
    - Lower costs, environmental impact
- Accessible to more researchers


---

# Readings 📖


**Required:**
1. **Shazeer et al. (2017)**: Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer
    [[arXiv]](https://arxiv.org/abs/1701.06538)
2. **Jiang et al. (2024)**: Mixtral of Experts
    [[arXiv]](https://arxiv.org/abs/2401.04088)

**Recommended:**
- Fedus et al. (2022): Switch Transformers [[arXiv]](https://arxiv.org/abs/2101.03961)
- Gu & Dao (2023): Mamba [[arXiv]](https://arxiv.org/abs/2312.00752)
- Dao et al. (2022): FlashAttention [[arXiv]](https://arxiv.org/abs/2205.14135)
- Strubell et al. (2019): Energy and Policy Considerations [[arXiv]](https://arxiv.org/abs/1906.02243)
- HuggingFace MoE Blog [[Blog]](https://huggingface.co/blog/moe)


---


Questions? 💬

Next: Ethics, Bias, and Safety!

