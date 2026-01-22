---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.17: Models of Language and Communication'
footer: 'Week 9'
---

<!-- _class: lead -->

# Lecture 25: Mixture of Experts \& Efficiency
## Scaling Efficiently with Sparse Models 

**PSYC 51.17: Models of Language and Communication**

Week 9

---

# Today's Journey 

<div class="callout info">
<div class="callout-title">What we'll cover</div>

1. **The Scaling Problem**: Why bigger isn't always better
2. **Mixture of Experts**: Sparse activation for efficiency
3. **How MoE Works**: Routing, load balancing, training
4. **Real-World MoE**: Mixtral and production systems
5. **Other Efficiency Techniques**: Quantization, pruning, distillation

</div>

---

# The Scaling Dilemma 



Larger models perform better... but at what cost?

**Training a 175B parameter model (GPT-3 scale):**
- Cost: $4-12 million in compute
- Energy: Equivalent to 120 homes for a year
- Time: Weeks to months on thousands of GPUs
- Inference: Slow and expensive ($0.002-0.02 per 1K tokens)
- Environmental: Massive carbon footprint

<div class="callout warning">
<div class="callout-title">The Challenge</div>

Can we get the benefits of scale without the full computational cost?

</div>

**Key Insight:** Not all parameters need to be active for every input!

---

# Dense vs Sparse Models 

<div class="columns">
<div class="column">

**Dense Models (e.g., GPT-3):**
```
Input Token
 ↓
[] ← All neurons active
[] ← 100% of parameters used
[] ← Every forward pass
 ↓
Output
```
- 175B parameters, 175B active
- High compute per token
- Simple architecture

</div>
<div class="column">

**Sparse Models (MoE):**
```
Input Token
 ↓
[] ← Only 2 experts active
[] ← ~25% of parameters used
[] ← Per forward pass
 ↓
Output
```
- 56B total, 14B active (Mixtral)
- Low compute per token
- Complex routing logic

</div>
</div>

<div class="callout info">
<div class="callout-title">Key Insight</div>

MoE = More capacity (learning), less compute (inference). Best of both worlds!

</div>

---

# What is Mixture of Experts? 


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

# MoE Architecture 

```flow
[Input x] --> [Router g(x)] --> [Expert 1: Math] --> [Weighted Sum] --> [Output y]
 --> [Expert 2: Code] --> [Weighted Sum]
 --> [Expert 3: Language] --> [Weighted Sum]
 --> [Expert 4-8: Inactive]
```

**Concrete Example: Processing "def factorial(n):"**

```python
# Router computes scores for each expert
router_logits = router(token_embedding) # Shape: (8,) for 8 experts
# [0.1, 0.9, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1] # Expert 2 (Code) scores highest!

# Select top-2 experts
top_k_indices = [1, 2] # Expert 2 (Code) and Expert 3 (Language)
top_k_weights = [0.75, 0.25] # Normalized weights

# Only these 2 experts process the token
output = 0.75 * expert_2(x) + 0.25 * expert_3(x)
# Other 6 experts do NO computation for this token!
```

**Typical setup:** N=8-64 experts, but only top-2 are active per token

---

# The Router Mechanism 

**Step-by-step routing for a single token:**

```python
import torch.nn.functional as F

def route_token(x, router_weights, num_experts=8, k=2):
 """Route a token to top-k experts"""
 # Step 1: Compute routing scores (linear projection)
 # router_weights: (hidden_dim, num_experts)
 logits = x @ router_weights # Shape: (num_experts,)
 # Example: [-0.5, 2.1, 1.3, 0.2, -0.1, 0.0, -0.3, 0.1]

 # Step 2: Convert to probabilities
 probs = F.softmax(logits, dim=-1)
 # Example: [0.04, 0.52, 0.24, 0.08, 0.03, 0.03, 0.03, 0.03]

 # Step 3: Select top-k experts
 top_k_probs, top_k_indices = torch.topk(probs, k)
 # indices: [1, 2], probs: [0.52, 0.24]

 # Step 4: Normalize selected probabilities
 top_k_probs = top_k_probs / top_k_probs.sum()
 # [0.68, 0.32] # Now sums to 1

 return top_k_indices, top_k_probs
 # Expert 1 handles 68%, Expert 2 handles 32%
```

---

# MoE in PyTorch (Simplified) 


```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MoELayer(nn.Module):
 def __init__(self, d_model, num_experts, expert_capacity, k=2):
 super().__init__()
 self.num_experts = num_experts
 self.k = k # Top-k routing

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
 router_logits = self.gate(x) # (batch, seq, num_experts)
 router_probs = F.softmax(router_logits, dim=-1)

 # Select top-k experts
 top_k_probs, top_k_indices = torch.topk(router_probs, self.k, dim=-1)
 # top_k_probs: (batch, seq, k)
 # top_k_indices: (batch, seq, k)
```


---

# MoE Forward Pass (cont.) 


```python
# Initialize output
 output = torch.zeros_like(x)

 # Route to experts
 for i in range(self.k):
 # Get expert indices for this position
 expert_idx = top_k_indices[:, :, i] # (batch, seq)
 expert_weight = top_k_probs[:, :, i] # (batch, seq)

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

# Load Balancing Problem 

**Problem:** Without balancing, some experts get overused!

```
Expert Usage Distribution (Unbalanced):

E1: 40% ← Overloaded!
E2: 22%
E3: 15%
E4: 10%
E5: 5%
E6: 4%
E7: 3% ← Undertrained
E8: 1% ← "Dead" expert
```

**Desired (Balanced):**
```
E1: 12.5%
E2: 12.5%
E3: 12.5%
... (all equal)
```

**Why imbalance is bad:**
- "Dead" experts waste parameters (never trained properly)
- Popular experts become bottlenecks during parallel inference
- Model loses expressiveness it paid for in memory

---

# Load Balancing Solutions 

**Solution 1: Auxiliary Loss (Penalize Imbalance)**

```python
def compute_load_balance_loss(router_probs, expert_assignments, alpha=0.01):
 """Add penalty to main loss for imbalanced routing"""
 num_experts = router_probs.shape[-1]

 # f_i: fraction of tokens actually sent to expert i
 tokens_per_expert = expert_assignments.sum(dim=0) # Count per expert
 f = tokens_per_expert / tokens_per_expert.sum() # [0.4, 0.22, ...]

 # P_i: average routing probability for expert i
 P = router_probs.mean(dim=0) # [0.35, 0.2, ...]

 # Loss: encourages f and P to both be uniform (1/N each)
 aux_loss = alpha * num_experts * (f * P).sum()
 return aux_loss # Added to main training loss
```

**Solution 2: Expert Capacity Limits**

```python
capacity = (batch_size * seq_len) // num_experts * capacity_factor # e.g., 1.25x
# If Expert 1 already has `capacity` tokens, overflow goes to Expert 2
```

---

# Training Instability 


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

# Memory and Communication 


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

# Mixtral 8x7B 


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

# Mixtral Performance 

**Comparison with dense models:**

| Model | Total Params | Active Params | MMLU Score | Speed vs 70B |
|-------|--------------|---------------|------------|--------------|
| Llama 2 13B | 13B | 13B | 55.0 | 5× faster |
| **Mixtral 8x7B** | **47B** | **13B** | **70.6** | **5× faster** |
| Llama 2 70B | 70B | 70B | 69.7 | 1× (baseline) |
| GPT-3.5 | ~175B | ~175B | 70.0 | N/A (API) |

**The Magic of MoE:**

```
Mixtral achieves:

 Quality of 70B model (MMLU: 70.6 vs 69.7) 
 Speed of 13B model (only 13B active) 
 = Best of both worlds! 

```

<div class="callout warning">
<div class="callout-title">Catch</div>

Still need memory for all 47B params. Savings are in compute, not VRAM.

</div>

---

# What Do Experts Learn? 

**Experts naturally specialize without explicit supervision!**

**Analyzed routing patterns in Mixtral:**

```
Token Type → Most Active Experts

"def", "class", "import" → Expert 2 (Code)
"la", "le", "français" → Expert 5 (French)
"∑", "∫", "theorem" → Expert 7 (Math)
"the", "is", "and" → Expert 1 (Common words)
"neural", "gradient" → Expert 3 (Technical)
```

**Concrete Example: Sentence routing**

```
"The neural network learns via backpropagation"
 
 E1 E3 E3 E1 E1 E3

Different tokens in the same sentence use different experts!
```

<div class="callout info">
<div class="callout-title">Key Finding</div>

Specialization is **emergent**. Nobody told Expert 2 to handle code!

</div>

---

# Model Compression Methods 

**Beyond MoE: Making models smaller and faster**

<div class="columns">
<div class="column">

**1. Quantization**
```python
# Original: 32-bit float (4 bytes/param)
weight = 0.123456789 # Full precision

# INT8: 8-bit integer (1 byte/param)
weight_int8 = 31 # Scaled + quantized
# 4× memory reduction!

# INT4: 4-bit (0.5 byte/param)
# 8× memory reduction!
```

**Llama 2 7B Memory:**
- FP32: 28 GB
- FP16: 14 GB
- INT8: 7 GB
- INT4: 3.5 GB ← Fits on laptop!

</div>
<div class="column">

**2. Knowledge Distillation**
```python
# Teacher: Large model (GPT-4)
# Student: Small model (GPT-2)

teacher_output = gpt4(input)
student_output = gpt2(input)

# Train student to match teacher
loss = KL_div(student_output,
 teacher_output)
```

**Results:**
- DistilBERT: 40% smaller, 97% quality
- TinyLlama: 1.1B matches 7B on tasks

</div>
</div>

---

# Inference Optimizations 

**Making generation faster:**

<div class="columns">
<div class="column">

**1. KV Cache (Essential)**
```python
# Without cache: Recompute all attention
# Token 100 attends to tokens 1-99
# = O(n) attention per token!

# With cache: Store previous K,V
cache = {}
for token in sequence:
 k, v = compute_kv(token)
 cache[pos] = (k, v) # Store!
 # Only compute attention once
```

**2. Flash Attention**
```
Standard: Load full attention matrix
FlashAtt: Tiled, memory-efficient
→ 2-4× faster, fits longer sequences
```

</div>
<div class="column">

**3. Speculative Decoding**
```python
# Draft model (fast, small): 7B
draft_tokens = small_model.generate(5)
# ["The", "cat", "sat", "on", "mat"]

# Target model (slow, large): 70B
verified = large_model.verify(draft_tokens)
# ["The", "cat", "sat", "on", "the"]
# 

# Accept 4/5 in one batch!
# 2-3× speedup, same quality
```

**4. Continuous Batching (vLLM)**
- New requests join mid-batch
- No waiting for longest sequence

</div>
</div>

---

# State Space Models: Mamba 

**Alternative to Transformers with linear-time complexity**

<div class="columns">
<div class="column">

**Transformer Attention: O(n)**
```
Sequence length: 1K 4K 16K 64K
Compute (relative): 1 16 256 4096
 ↑
 Gets expensive fast!
```

**Mamba SSM: O(n)**
```
Sequence length: 1K 4K 16K 64K
Compute (relative): 1 4 16 64
 ↑
 Linear scaling!
```

</div>
<div class="column">

**How SSMs Work (Simplified)**
```python
# State evolves with each token
state = initial_state # Fixed size!
for token in sequence:
 # Update state (no attention)
 state = A @ state + B @ token
 output = C @ state
 # Always O(1) per token!
```

**Key Insight:**
- Transformers: Every token attends to all previous tokens
- SSMs: Compress history into fixed-size state

</div>
</div>

*Reference: Gu & Dao (2023) - "Mamba: Linear-Time Sequence Modeling with Selective State Spaces"*

---

# Efficiency Trade-off Landscape 

**Choosing the Right Technique for Your Use Case:**

```
 Quality
 ↑
 GPT-4 (175B) Dense Large
 
 Mixtral (47B/13B) MoE
 
 Llama-7B-Q4 Quantized
 
 DistilGPT-2 Distilled
 
 → Speed/Cost
```

| Technique | Best For | Trade-off |
|-----------|----------|-----------|
| Dense Large | Maximum quality | Expensive, slow |
| MoE | Quality + speed | High memory |
| Quantization | Edge deployment | Slight quality loss |
| Distillation | Fixed tasks | Requires teacher |
| Pruning | Latency-critical | Irreversible |

<div class="callout tip">
<div class="callout-title">Decision Tree</div>

Need max quality? → Dense. Need speed on GPU? → MoE. Need to run locally? → Quantized.

</div>

---

# Environmental Impact 


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

# Democratizing Access 



Should powerful AI be accessible to everyone, or only large organizations?

**Current reality:**
- Training GPT-3 scale model: $4-12M
- Requires 1000+ GPUs
- Only big tech companies can afford
- Creates AI "haves" and "have-nots"

**Efficiency enables democratization:**
- Smaller models on consumer hardware
- Open-source weights (Llama, Mixtral, Mistral)
- Efficient fine-tuning (LoRA, QLoRA)
- Cloud access with pay-per-use pricing
- Edge deployment (on-device models)

<div class="callout warning">
<div class="callout-title">Goal</div>

Make AI accessible to researchers, startups, and developing nations—not just big tech!

</div>


---

# Open vs Closed Models 


<div class="columns">
<div class="column">

**Closed (GPT-4, Claude):**
- Better safety control
- Monetization easier
- Protect IP
- Can update/improve
- No transparency
- Vendor lock-in
- Limited customization
- Privacy concerns

</div>
<div class="column">

**Open (Llama, Mixtral):**
- Transparency
- Community innovation
- Full control
- No API costs
- Privacy (on-prem)
- Potential misuse
- Compute requirements
- Need ML expertise

</div>
</div>

**The debate:**
- Mirrors open-source software vs proprietary
- But higher stakes (safety, dual-use concerns)
- Trend: Moving toward more open models
- Efficiency helps open models (smaller = easier to distribute)


---

# Future of Efficient LLMs 


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

# Key Takeaways 


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

# Readings 


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


Questions? 

Next: Ethics, Bias, and Safety!

