# Assignment 5: Build and Train a GPT Model

## Overview

In this capstone-style assignment, you will build a GPT (Generative Pre-trained Transformer) model from the ground up and train it to generate text. This assignment goes beyond using pre-trained models—you will implement the core components of a transformer architecture, understand how autoregressive language modeling works, and gain deep insights into what makes modern large language models tick.

GPT models are decoder-only transformers that have revolutionized natural language processing. By building one yourself, you'll understand the intricate details of self-attention mechanisms, positional encodings, layer normalization, and the training dynamics that enable these models to generate coherent text.

This is an ambitious assignment that will challenge you to think deeply about architecture design, optimization, and evaluation. However, with modern tools and GenAI assistance, it's entirely achievable—and incredibly rewarding.

## Learning Objectives

By the end of this assignment, you will be able to:

1. **Implement transformer architecture components** including multi-head self-attention, feed-forward networks, layer normalization, and residual connections
2. **Understand autoregressive language modeling** and how GPT models generate text one token at a time
3. **Implement causal (masked) self-attention** to ensure the model can only attend to previous tokens
4. **Design and implement positional encodings** to give the model a sense of token position
5. **Build a complete training pipeline** including data loading, batching, loss computation, and optimization
6. **Apply different text generation strategies** including greedy decoding, temperature sampling, top-k, and nucleus (top-p) sampling
7. **Analyze what the model has learned** by visualizing attention patterns and token embeddings
8. **Compare your model's performance** with established models like GPT-2
9. **Understand the trade-offs** between model size, training time, and generation quality

## Background

### The Transformer Architecture

The transformer architecture, introduced in the seminal paper "Attention is All You Need" (Vaswani et al., 2017), revolutionized sequence modeling by replacing recurrent neural networks with self-attention mechanisms. GPT uses only the decoder portion of the transformer, removing the cross-attention layers used in encoder-decoder models.

### Key Components

**Self-Attention**: The core mechanism that allows each token to attend to all previous tokens (in the case of GPT, due to causal masking). The attention mechanism computes:

```
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
```

**Multi-Head Attention**: Instead of a single attention mechanism, GPT uses multiple attention heads in parallel, each learning different types of relationships between tokens.

**Causal Masking**: Unlike BERT (which uses bidirectional attention), GPT applies a causal mask during attention computation to ensure that when predicting token *i*, the model can only attend to tokens at positions *j < i*. This makes the model autoregressive.

**Position Encodings**: Since the attention mechanism is position-agnostic, we must explicitly encode position information. This can be done with sinusoidal encodings (as in the original paper) or learned embeddings (as in GPT).

**Feed-Forward Networks**: After attention, each position is processed by a position-wise feed-forward network (two linear transformations with a non-linearity in between).

**Layer Normalization and Residual Connections**: These help with training stability and gradient flow through deep networks.

### The GPT Family

- **GPT** (Radford et al., 2018): Demonstrated that pre-training + fine-tuning works well for NLP
- **GPT-2** (Radford et al., 2019): Showed that larger models with more data can perform well zero-shot
- **GPT-3** (Brown et al., 2020): Scaled to 175B parameters and exhibited impressive few-shot learning
- **GPT-4** and beyond: Continued scaling with improved architectures and training techniques

## Your Task

You will implement, train, and analyze a GPT-style model. The assignment is divided into several interconnected tasks:

### 1. Implement Transformer Components

Build the core components of the GPT architecture:

**a) Multi-Head Self-Attention with Causal Masking**
- Implement the scaled dot-product attention mechanism
- Add causal masking to prevent attention to future tokens
- Support multiple attention heads
- Include dropout for regularization

**b) Position-wise Feed-Forward Network**
- Implement a two-layer MLP with GELU or ReLU activation
- Typically expands to 4x the model dimension and back

**c) Positional Encoding**
- Implement either learned positional embeddings (like GPT) or sinusoidal encodings (like the original Transformer)
- Justify your choice

**d) Transformer Block**
- Combine attention and feed-forward layers with residual connections and layer normalization
- Consider whether to use pre-norm or post-norm architecture

**e) GPT Model**
- Stack multiple transformer blocks
- Add token embedding layer
- Add final linear layer to project to vocabulary size
- Implement the forward pass with causal language modeling objective

### 2. Implement the Training Pipeline

**a) Data Preparation**
- Choose a dataset (see suggestions below)
- Implement tokenization (you can use a pre-built tokenizer like GPT-2's BPE)
- Create data loaders with proper batching
- Handle variable-length sequences appropriately

**b) Training Loop**
- Implement the cross-entropy loss for language modeling
- Use AdamW optimizer with learning rate scheduling (consider cosine decay with warmup)
- Implement gradient clipping to prevent instability
- Track training and validation loss
- Save model checkpoints

**c) Hyperparameter Selection**
- Justify your choices for:
  - Model size (number of layers, hidden dimension, number of heads)
  - Batch size and sequence length
  - Learning rate and schedule
  - Dropout rates
  - Training steps/epochs

### 3. Generate Text with Multiple Sampling Strategies

Implement and compare different text generation methods:

**a) Greedy Decoding**: Always pick the most likely next token

**b) Temperature Sampling**: Sample from the probability distribution with adjustable temperature (higher = more random)

**c) Top-k Sampling**: Sample from only the k most likely tokens

**d) Nucleus (Top-p) Sampling**: Sample from the smallest set of tokens whose cumulative probability exceeds p

Generate samples with each method and analyze the quality, diversity, and coherence of the outputs. What works best for your model and dataset?

### 4. Analyze Learned Representations

**a) Attention Pattern Visualization**
- Extract and visualize attention weights from different layers and heads
- Analyze what patterns different heads learn (e.g., do some attend to previous token, to same word type, to syntactic patterns?)
- Create visualizations showing attention patterns for interesting examples

**b) Token Embedding Analysis**
- Extract the learned token embeddings
- Visualize them in 2D/3D space using UMAP or t-SNE
- Identify clusters and analyze which tokens are embedded close together
- Does the model learn meaningful semantic relationships?

**c) Probing Tasks (Optional)**
- Design simple probing classifiers to test what linguistic information is encoded in the representations
- Examples: POS tagging, syntactic dependencies, semantic relationships

### 5. Compare with Pre-trained Models

**a) Load a Pre-trained Model**
- Load a comparable pre-trained model (e.g., GPT-2 small, DistilGPT-2)
- Ensure fair comparison (similar size, similar data domain if possible)

**b) Quantitative Comparison**
- Compare perplexity on a held-out test set
- Compare generation quality using metrics like:
  - Perplexity
  - Self-BLEU (for diversity)
  - Human evaluation (optional but recommended)

**c) Qualitative Analysis**
- Generate text from the same prompts with both models
- Analyze differences in coherence, creativity, factual accuracy, and fluency
- What are the strengths and weaknesses of your model?

### 6. Dataset Selection

Choose one of the following datasets or propose your own:

**a) Code Generation**
- Python code from GitHub (filtered for quality)
- Allows you to build a code-generation model
- Can evaluate on code completion tasks

**b) Stories/Creative Writing**
- WritingPrompts dataset from Reddit
- Children's stories
- Fan fiction or short stories

**c) Domain-Specific Text**
- Scientific papers (arXiv abstracts)
- News articles
- Wikipedia articles
- Poetry or song lyrics

**d) Dialogue**
- Movie scripts
- Reddit conversations
- Chat logs (appropriately anonymized)

**e) Shakespeare or Classic Literature**
- Smaller dataset but rich language
- Good for initial testing and rapid iteration

Choose a dataset that interests you and that's appropriate for the model size you can feasibly train. Remember: you don't need billions of tokens to build something impressive!

## Implementation Options

You have flexibility in how you approach this assignment:

### Option 1: From Scratch (Recommended for Deep Learning)

Implement everything from first principles using PyTorch or JAX:
- Full control over every component
- Deepest learning experience
- More time-intensive but most rewarding

### Option 2: Using nanoGPT as a Starting Point

Andrej Karpathy's [nanoGPT](https://github.com/karpathy/nanoGPT) provides a clean, minimal implementation:
- Start with the codebase and understand every line
- Modify and extend it for your needs
- Add analysis and visualization components
- Good balance of learning and efficiency

### Option 3: Using HuggingFace Transformers

Use the HuggingFace library but implement key components yourself:
- Use their data loading and training utilities
- Implement your own attention mechanism or transformer block
- Focus more on experiments and analysis
- Faster to get results but less deep implementation experience

**Whichever option you choose, you must demonstrate deep understanding of how the model works. Simply calling library functions without explanation is insufficient.**

## Technical Requirements

### Model Specifications

Your model should have at minimum:
- **4-12 transformer layers** (start small, scale up if resources allow)
- **4-8 attention heads**
- **Hidden dimension of 256-768** (depending on your computational resources)
- **Vocabulary size** appropriate for your tokenizer (typically 10K-50K)
- **Context window** of at least 128 tokens (256-512 preferred)

### Training Requirements

- Train for enough steps to see meaningful convergence (exact number depends on dataset and model size)
- Monitor both training and validation loss
- Implement early stopping or checkpointing based on validation performance
- Track key metrics: loss, perplexity, tokens/second
- Should be trainable on Google Colab with GPU (use gradient accumulation if needed for larger effective batch sizes)

### Code Quality

- Well-organized, modular code with clear function/class names
- Docstrings for all major functions and classes
- Type hints where appropriate
- Efficient implementation (vectorized operations, no unnecessary loops)
- Memory-efficient (handle large datasets, consider gradient checkpointing if needed)

## Deliverables

Submit a **Google Colaboratory notebook** that includes:

### 1. Implementation (40%)

- Complete, working implementation of the GPT model
- All transformer components clearly implemented and explained
- Training pipeline with proper data loading, optimization, and checkpointing
- Text generation functions with multiple sampling strategies
- Code should run without errors on a fresh Colab instance

### 2. Training Results (20%)

- Training curves showing loss over time
- Validation metrics demonstrating the model learns
- Hyperparameter choices with justifications
- Discussion of training dynamics (convergence, stability, any issues encountered)
- Final model checkpoint or clear instructions to reproduce training

### 3. Generated Examples (15%)

- Multiple examples of generated text using different sampling strategies
- Analysis of generation quality, coherence, and diversity
- Comparison between different sampling methods
- Discussion of failure modes and interesting behaviors

### 4. Analysis and Visualization (15%)

- Attention pattern visualizations with interpretation
- Token embedding visualizations with analysis
- Evidence of what linguistic patterns the model learned
- Insights into what different layers and heads specialize in

### 5. Comparison with Baseline (10%)

- Quantitative comparison with a pre-trained model (perplexity, other metrics)
- Qualitative comparison of generated text
- Honest assessment of your model's strengths and limitations
- Discussion of what would improve performance

### 6. Markdown Explanations Throughout

- Clear explanations of your approach and design decisions
- Discussion of challenges faced and how you overcame them
- Reflections on what you learned
- All visualizations should have captions and interpretations

## Evaluation Criteria

Your assignment will be evaluated on:

1. **Correctness of Implementation (30%)**
   - Model architecture correctly implements GPT design
   - Attention mechanisms properly use causal masking
   - Training loop correctly computes loss and updates parameters
   - No critical bugs or errors

2. **Quality of Training and Results (25%)**
   - Model successfully trains and converges
   - Reasonable hyperparameter choices
   - Generated text demonstrates learning
   - Proper evaluation on validation set

3. **Depth of Analysis (25%)**
   - Thoughtful examination of attention patterns
   - Meaningful visualization and interpretation
   - Insightful comparison with baseline model
   - Understanding of model behavior and limitations

4. **Code Quality and Documentation (10%)**
   - Clean, well-organized code
   - Comprehensive markdown explanations
   - Clear documentation of design choices
   - Reproducible results

5. **Creativity and Insight (10%)**
   - Interesting dataset choice or experiments
   - Novel visualizations or analyses
   - Thoughtful discussion of results
   - Extensions beyond basic requirements

## Extensions and Bonus Challenges

If you finish the core assignment and want to push further, consider these extensions:

### Architecture Modifications

- **Different positional encodings**: Try RoPE (Rotary Position Embeddings) or ALiBi
- **Alternative architectures**: Implement sparse attention, sliding window attention, or mixture of experts
- **Model scaling**: Try different model sizes and analyze scaling laws
- **Architecture improvements**: Add techniques like Flash Attention, grouped query attention, or RMSNorm

### Advanced Training

- **Curriculum learning**: Start with shorter sequences and gradually increase length
- **Mixed precision training**: Use fp16 or bfloat16 for faster training
- **Distributed training**: Train across multiple GPUs if available
- **Data filtering**: Implement quality filtering for your dataset

### Advanced Evaluation

- **Fine-tuning**: Fine-tune your model on a downstream task
- **RLHF (Reinforcement Learning from Human Feedback)**: Implement a simple version with a reward model
- **Instruction tuning**: Add instruction-following capabilities
- **Benchmark evaluation**: Test on standard NLP benchmarks

### Specialized Applications

- **Conditional generation**: Add control codes for style, topic, or format
- **Retrieval augmented generation**: Combine with a retrieval system
- **Multimodal**: Add image inputs (very ambitious!)

### Interpretability

- **Attention intervention**: Modify attention patterns and observe effects
- **Causal tracing**: Identify which components are responsible for specific predictions
- **Feature visualization**: What patterns activate specific neurons?

## Resources

### Essential Reading

- **"Attention is All You Need"** (Vaswani et al., 2017) - The transformer paper
  - [Paper](https://arxiv.org/abs/1706.03762)
  - [Annotated Transformer](http://nlp.seas.harvard.edu/2018/04/03/attention.html)

- **"Improving Language Understanding by Generative Pre-Training"** (Radford et al., 2018) - Original GPT
  - [Paper](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)

- **"Language Models are Unsupervised Multitask Learners"** (Radford et al., 2019) - GPT-2
  - [Paper](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)

- **"Language Models are Few-Shot Learners"** (Brown et al., 2020) - GPT-3
  - [Paper](https://arxiv.org/abs/2005.14165)

### Video Resources

- **Andrej Karpathy's "Let's build GPT: from scratch, in code, spelled out"**
  - [YouTube Video](https://www.youtube.com/watch?v=kCc8FmEb1nY)
  - Excellent step-by-step implementation guide

- **HuggingFace Course: Transformer Models**
  - [Course Link](https://huggingface.co/learn/nlp-course/chapter1/1)
  - Comprehensive coverage of transformers and applications

### Code Resources

- **nanoGPT** by Andrej Karpathy
  - [GitHub](https://github.com/karpathy/nanoGPT)
  - Clean, minimal GPT implementation in PyTorch

- **minGPT** by Andrej Karpathy
  - [GitHub](https://github.com/karpathy/minGPT)
  - Another minimal GPT implementation with good documentation

- **HuggingFace Transformers**
  - [Documentation](https://huggingface.co/docs/transformers/index)
  - [GPT-2 Model Documentation](https://huggingface.co/docs/transformers/model_doc/gpt2)

- **The Illustrated Transformer** by Jay Alammar
  - [Blog Post](http://jalammar.github.io/illustrated-transformer/)
  - Excellent visual explanations

- **The Illustrated GPT-2** by Jay Alammar
  - [Blog Post](http://jalammar.github.io/illustrated-gpt2/)
  - Visual guide to GPT-2 architecture

### Additional Papers

- **"BERT: Pre-training of Deep Bidirectional Transformers"** (Devlin et al., 2018)
  - Good contrast with GPT's unidirectional approach
  - [Paper](https://arxiv.org/abs/1810.04805)

- **"The Pile: An 800GB Dataset of Diverse Text"** (Gao et al., 2020)
  - Understanding pre-training datasets
  - [Paper](https://arxiv.org/abs/2101.00027)

- **"Scaling Laws for Neural Language Models"** (Kaplan et al., 2020)
  - Understanding how model size affects performance
  - [Paper](https://arxiv.org/abs/2001.08361)

- **"Training Compute-Optimal Large Language Models"** (Hoffmann et al., 2022) - Chinchilla
  - Optimal model size vs. training tokens trade-offs
  - [Paper](https://arxiv.org/abs/2203.15556)

### Tools and Libraries

- **PyTorch**: [pytorch.org](https://pytorch.org/)
- **HuggingFace Transformers**: [huggingface.co/transformers](https://huggingface.co/transformers)
- **Tokenizers**: [huggingface.co/docs/tokenizers](https://huggingface.co/docs/tokenizers)
- **Weights & Biases**: For experiment tracking [wandb.ai](https://wandb.ai/)
- **BERTViz**: For visualizing attention [github.com/jessevig/bertviz](https://github.com/jessevig/bertviz)

## Tips for Success

1. **Start small**: Begin with a tiny model (2-4 layers, small hidden size) to debug your implementation quickly
2. **Validate components**: Test each component individually before assembling the full model
3. **Monitor carefully**: Watch for NaN losses, exploding gradients, or other training instabilities
4. **Use gradient clipping**: This prevents exploding gradients in early training
5. **Overfit a small batch first**: Ensure your model can memorize a tiny amount of data before scaling up
6. **Compare with references**: If results seem off, compare your implementation with nanoGPT or other references
7. **Save often**: Checkpointing is critical—you don't want to lose hours of training
8. **Document everything**: Future you (and the grader) will thank you for clear explanations
9. **Use GenAI tools**: Claude, ChatGPT, and Copilot can help you debug, optimize, and understand concepts
10. **Have fun**: This is a challenging but incredibly rewarding assignment!

## Submission

Submit a **single Google Colaboratory notebook** that:

1. Runs without errors on a clean Colab instance with GPU runtime
2. Automatically downloads/installs any required dependencies
3. Can load your trained model checkpoint (upload to Google Drive or HuggingFace Hub)
4. Contains comprehensive markdown cells explaining every step
5. Includes all code for implementation, training, generation, and analysis
6. Shows all visualizations and results inline
7. Demonstrates clear understanding of transformer architecture and training dynamics

**Note on Training**: If your model takes too long to train in the notebook, you can train it separately and load the checkpoint in your notebook. However, your notebook should include all training code and explain your training process thoroughly.

## Academic Integrity

You may:
- Use GenAI tools (Claude, ChatGPT, Copilot) to help with implementation and understanding
- Reference implementations like nanoGPT as learning resources
- Collaborate with classmates on conceptual understanding
- Ask questions in office hours or on discussion forums

You must:
- Write and understand all code you submit
- Properly cite any code you adapt from other sources
- Do your own analysis and write your own explanations
- Ensure your trained model is your own work

Do not:
- Copy entire implementations without understanding them
- Submit someone else's analysis or visualizations as your own
- Plagiarize explanations from other sources

This assignment is about learning. Use all available tools to learn deeply, but ensure the final submission represents your own understanding and effort.

---

Good luck! Building a GPT model is a rite of passage for anyone serious about understanding modern AI. Enjoy the journey, and don't hesitate to reach out if you get stuck.
