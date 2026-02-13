# Course Slides - Models of Language and Communication

This directory contains lecture slides for all 10 weeks of the course. Weeks 1-2 have **4 lectures** (M/W/X-hour/F), weeks 3-4 have **4 lectures** (using X-hour to catch up), weeks 5-7 and 9 have **3 lectures** (M/W/F), week 8 is off, and week 10 has final presentations. Slides are provided in both PDF and web-viewable HTML formats.

**📅 Schedule:** MWF 10:10-11:15 | **📍 X-Hour:** Thursday 12:15-1:05 (first 3 weeks for makeup classes)

---

## Interactive Web Demos

Explore concepts hands-on with our interactive web demos! Each demo runs directly in your browser and provides real-time visualization of the concepts covered in lectures.

1. **[ELIZA Chatbot](https://contextlab.github.io/llm-course/demos/eliza/)** - Experience the original pattern-matching chatbot
2. **[Chatbot Evolution](https://contextlab.github.io/llm-course/demos/chatbot-evolution/)** - Journey from ELIZA to modern LLMs
3. **[Tokenization Explorer](https://contextlab.github.io/llm-course/demos/tokenization/)** - Visualize BPE, WordPiece, and SentencePiece tokenization
4. **[Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/)** - Interactive 3D exploration of word embeddings
5. **[Attention Mechanism](https://contextlab.github.io/llm-course/demos/attention/)** - See how attention weights work in real-time
6. **[Transformer Explorer](https://contextlab.github.io/llm-course/demos/transformer/)** - Step through transformer architecture layer by layer
7. **[GPT Playground](https://contextlab.github.io/llm-course/demos/gpt-playground/)** - Experiment with autoregressive text generation
8. **[RAG System Demo](https://contextlab.github.io/llm-course/demos/rag/)** - Explore Retrieval-Augmented Generation
9. **[Topic Modeling](https://contextlab.github.io/llm-course/demos/topic-modeling/)** - Visualize LSA, LDA, and BERTopic
10. **[Sentiment Analysis](https://contextlab.github.io/llm-course/demos/sentiment/)** - Classify text sentiment in real-time
11. **[POS Tagging](https://contextlab.github.io/llm-course/demos/pos-tagging/)** - Interactive part-of-speech tagging
12. **[Word Analogies](https://contextlab.github.io/llm-course/demos/analogies/)** - Explore semantic relationships in word embeddings
13. **[Semantic Search](https://contextlab.github.io/llm-course/demos/semantic-search/)** - Search by meaning, not just keywords
14. **[BERT Masked Language Model](https://contextlab.github.io/llm-course/demos/bert-mlm/)** - See how BERT predicts masked words
15. **[Embeddings Comparison](https://contextlab.github.io/llm-course/demos/embeddings-comparison/)** - Compare Word2Vec, GloVe, and FastText

**Browse all demos:** [https://contextlab.github.io/llm-course/demos/](https://contextlab.github.io/llm-course/demos/)

---

## Week 1: Introduction & String Manipulation

**Monday (Lecture 1):** Course Introduction, Is ChatGPT Conscious?
- Discussion: What is consciousness? Can machines be conscious?
- Language vs. thought: The language network in the brain
- Reading: [Fedorenko et al. (2024)](https://www.nature.com/articles/s41586-024-07522-w) - The language network as a natural kind
- Reading: [Lupyan et al. (2020)](https://doi.org/10.1016/j.tics.2020.08.005) - Effects of language on visual perception
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture1.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture1.html)

**Wednesday (Lecture 2):** Pattern Matching & ELIZA
- Pattern matching and string manipulation techniques
- Introduction to ELIZA chatbot
- Live demo of ELIZA in action
- The ELIZA effect: why users anthropomorphize chatbots
- Reading: [Weizenbaum (1966)](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf) - ELIZA: A Computer Program For Natural Language Communication
- 🎮 **Try it:** [ELIZA Demo](https://contextlab.github.io/llm-course/demos/eliza/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture2.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture2.html)

**Thursday X-hour (Lecture 3):** ELIZA Implementation
- ELIZA implementation: decomposition, reassembly, substitutions
- Vibe coding best practices for building chatbots
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture3.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture3.html)

**Friday (Lecture 4):** Rules-Based Chatbots
- PARRY: simulating paranoid behavior with affect and intent modeling
- A.L.I.C.E. and AIML: pattern-based conversation design
- The evolution from ELIZA to modern rules-based systems
- **Assignment 1 Released:** [Building the ELIZA Chatbot](https://contextlab.github.io/llm-course/assignments/assignment-1/) (Due: Jan 19, 11:59 PM EST)
- Reading: [Colby et al. (1971)](https://doi.org/10.1016/0004-3702(71)90002-6) - Artificial Paranoia (PARRY)
- Reference: [ALICE/AIML Foundation](https://www.alicebot.org/)
- 🎮 **Try it:** [ELIZA Demo](https://contextlab.github.io/llm-course/demos/eliza/) | [Chatbot Evolution](https://contextlab.github.io/llm-course/demos/chatbot-evolution/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture4.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture4.html)

---

## Week 2: Computational Linguistics

**Monday (Lecture 5):** Data Cleaning & Preprocessing
- Web scraping with Beautiful Soup
- Lemmatization and text normalization
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture5.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture5.html)

**Wednesday (Lecture 6):** Tokenization
- Byte-Pair Encoding (BPE), WordPiece, SentencePiece
- Reading: [Sennrich et al. (2016)](https://aclanthology.org/P16-1162/) - Neural Machine Translation of Rare Words with Subword Units
- Reading: [Kudo & Richardson (2018)](https://aclanthology.org/D18-2012/) - SentencePiece
- HuggingFace: [Chapter 2.4: Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4)
- HuggingFace: [Chapter 6: Tokenizers](https://huggingface.co/learn/nlp-course/chapter6)
- 🎮 **Try it:** [Tokenization Explorer](https://contextlab.github.io/llm-course/demos/tokenization/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture6.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture6.html)

**Thursday X-hour (Lecture 7):** Text Classification Workshop
- Feature engineering for text classification (bag-of-words, TF-IDF)
- Building classifiers with preprocessing and tokenization pipelines
- Introduction to evaluation metrics
- Hands-on: Explore SPAM classification approaches for Assignment 2
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture7.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture7.html)

**Friday (Lecture 7 continued):** Text Classification Workshop (continued)
- Lecture 7 extended to cover additional material
- **Assignment 2 Released:** [SPAM Classifier](https://contextlab.github.io/llm-course/assignments/assignment-2/) (Due: Jan 26, 11:59 PM EST)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture7.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture7.html)

---

## Week 3: Vibe Coding & Classical Embeddings

**Monday (MLK Day)**: NO CLASS - Martin Luther King Jr. Day
- **📝 Assignment 1 Due (Jan 19, 11:59 PM EST)**

**Wednesday (Lecture 8):** POS Tagging & Sentiment Analysis
- Part-of-speech tagging and token classification
- Sentiment analysis techniques
- Reading: [Linzen et al. (2016)](https://aclanthology.org/Q16-1037/) - LSTMs and Syntax-Sensitive Dependencies
- HuggingFace: [Chapter 7.2: Token Classification](https://huggingface.co/learn/nlp-course/chapter7/2)
- 🎮 **Try it:** [POS Tagging](https://contextlab.github.io/llm-course/demos/pos-tagging/) | [Sentiment Analysis](https://contextlab.github.io/llm-course/demos/sentiment/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture8.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture8.html)

**Thursday X-hour (Lecture 9):** Vibe Coding Tips & Tricks
- Setting up VS Code and AI coding tools
- Installing OpenCode and oh-my-opencode
- The spec-kit workflow: from design docs to implementation
- Live demo: building a chatbot analyzer
- Free AI tools for students: [GitHub Copilot](https://github.com/education/students), [Google Gemini](https://gemini.google/students/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture9.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture9.html)

**Friday (Lecture 10):** Classical Embeddings (LSA, LDA)
- The distributional hypothesis
- Latent Semantic Analysis (LSA) with SVD
- Latent Dirichlet Allocation (LDA) for topic modeling
- Reading: [Deerwester et al. (1990)](http://wordvec.colorado.edu/papers/Deerwester_1990.pdf) - LSA
- Reading: [Blei et al. (2003)](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf) - LDA
- **Assignment 3 Released:** [Wikipedia Embeddings](https://contextlab.github.io/llm-course/assignments/assignment-3/) (Due: Feb 6, 11:59 PM EST)
- 🎮 **Try it:** [Topic Modeling](https://contextlab.github.io/llm-course/demos/topic-modeling/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture10.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture10.html)

---

## Week 4: Word Embeddings & Modern Methods

**Monday (Lecture 11):** Word Embeddings (Word2Vec, GloVe, FastText)
- Neural word embeddings and the 2013 revolution
- CBOW, Skip-gram, negative sampling
- GloVe and FastText
- Bias in embeddings
- Reading: [Mikolov et al. (2013)](https://arxiv.org/abs/1301.3781) - Word2Vec
- Reading: [Pennington et al. (2014)](https://aclanthology.org/D14-1162/) - GloVe
- Reading: [Bojanowski et al. (2017)](https://arxiv.org/abs/1607.04606) - FastText
- **📝 Assignment 2 Due (Jan 26, 11:59 PM EST)**
- 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/) | [Word Analogies](https://contextlab.github.io/llm-course/demos/analogies/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture11.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture11.html)

**Wednesday (Lecture 12):** Contextual Embeddings
- ELMo and contextual representations
- Universal Sentence Encoder
- Reading: [Peters et al. (2018)](https://aclanthology.org/N18-1202/) - ELMo
- Reading: [Cer et al. (2018)](https://arxiv.org/abs/1803.11175) - USE
- 🎮 **Try it:** [Semantic Search](https://contextlab.github.io/llm-course/demos/semantic-search/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture12.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture12.html)

**Thursday X-hour (Lecture 13):** Dimensionality Reduction
- Matrix factorization (PCA, ICA, NMF) and manifold learning (t-SNE, UMAP)
- Reading: [van der Maaten & Hinton (2008)](https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf) - t-SNE
- Reading: [McInnes & Healy (2018)](https://arxiv.org/abs/1802.03426) - UMAP
- 📓 [X-hour Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week4/xhour_dimred_demo.ipynb)
- 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture13.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture13.html)

**Friday (Lecture 14):** Cognitive Models of Semantic Representation
- Reading: [Anderson et al. (2016)](https://www.jneurosci.org/content/36/45/11444)
- 🎮 **Try it:** [Embeddings Comparison](https://contextlab.github.io/llm-course/demos/embeddings-comparison/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture14.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture14.html)

---

## Week 5: Transformer Architecture

**Monday (Lecture 15):** Transformer Architecture
- The animated transformer: step-by-step walkthrough
- Tokenization, embeddings, attention, feed-forward networks
- Reading: [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) - Attention is All You Need
- Reference: [The Animated Transformer](https://prvnsmpth.github.io/animated-transformer/)
- 🎮 **Try it:** [Transformer Explorer](https://contextlab.github.io/llm-course/demos/transformer/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture15.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture15.html)

**Wednesday (Lecture 16):** Training Transformers
- Loss functions, optimization, scaling laws
- Reading: [Kaplan et al. (2020)](https://arxiv.org/abs/2001.08361) - Scaling Laws for Neural Language Models
- HuggingFace: [Chapter 3](https://huggingface.co/learn/nlp-course/chapter3)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture16.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture16.html)

**Friday (Lecture 17):** Retrieval Augmented Generation (RAG)
- RAG architecture and applications
- Reading: [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) - RAG
- 🎮 **Try it:** [RAG System Demo](https://contextlab.github.io/llm-course/demos/rag/)
- **📝 Assignment 3 Due (Feb 6, 11:59 PM EST)**
- **Assignment 4 Released:** [Customer Service Chatbot](https://contextlab.github.io/llm-course/assignments/assignment-4/) (Due: Feb 16, 11:59 PM EST)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture17.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture17.html)
---

## Week 6: Encoder Models (BERT)

**Monday (Lecture 18):** BERT Deep Dive
- Why bidirectionality matters, what BERT learns, attention patterns, layer probing
- Reading: [Devlin et al. (2019)](https://aclanthology.org/N19-1423/) - BERT
- Reading: [Tenney et al. (2019)](https://aclanthology.org/P19-1452/) - BERT Rediscovers the Classical NLP Pipeline
- Reading: [Clark et al. (2019)](https://aclanthology.org/W19-4828/) - What Does BERT Look At?
- HuggingFace: [Chapter 1](https://huggingface.co/learn/nlp-course/chapter1)
- 🎮 **Try it:** [BERT Masked Language Model](https://contextlab.github.io/llm-course/demos/bert-mlm/)
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/bert_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture18.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture18.html)

**Wednesday (Lecture 19):** BERT Variants
- RoBERTa, ALBERT, DistilBERT, ELECTRA, DeBERTa, ModernBERT, Gemma Encoder
- Training recipe improvements, parameter sharing, knowledge distillation, replaced token detection
- ModernBERT deep dive: unpadding, RoPE, Flash Attention, 8192 context
- Production deployment patterns: ONNX, TensorRT, quantization
- Are encoder models still relevant in the era of GPT-4?
- Reading: [Liu et al. (2019)](https://arxiv.org/abs/1907.11692) - RoBERTa
- Reading: [Sanh et al. (2019)](https://arxiv.org/abs/1910.01108) - DistilBERT
- Reading: [Clark et al. (2020)](https://arxiv.org/abs/2003.10555) - ELECTRA
- Reading: [Warner et al. (2024)](https://arxiv.org/abs/2412.13663) - ModernBERT
- Reading: [Google (2025)](https://arxiv.org/abs/2503.02656) - Gemma Encoder
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/bert_variants_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture19.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture19.html)

**Friday (Lecture 20):** Language, Thought, and Other Brains
- Encoder applications recap: industry scale, cost advantages over decoders
- Brain-LLM alignment: The Mind's Transformer — intra-block hierarchy mirrors cortical processing
- Language as wireless brain activity transmission: neural coupling (Stephens et al., 2010)
- Memory transfer through narrative (Zadbood et al., 2017), LLMs bridging brains (Zada et al., 2024)
- Understanding is prediction: next-word prediction mirrors the brain (Schrimpf et al., 2021)
- Language modeling is compression (Delétang et al., 2024), languages optimize for compression (Gibson et al., 2019)
- Does prediction equal understanding? Queloz & Beckmann (2025) vs. Fedorenko et al. (2024)
- What LLMs have inside: monosemantic features (Anthropic, 2024) vs. grounding problem (LeCun, 2022)
- Deep discussion: lossy channels, alignment puzzles, the prediction test, experience and simulation
- Reading: [Stephens, Silbert & Hasson (2010)](https://doi.org/10.1073/pnas.1008662107) - Speaker-listener neural coupling
- Reading: [Schrimpf et al. (2021)](https://doi.org/10.1073/pnas.2105646118) - Neural architecture of language
- Reading: [Delétang et al. (2024)](https://arxiv.org/abs/2309.10668) - Language modeling is compression
- Reading: [Queloz & Beckmann (2025)](https://philarchive.org/rec/QUEWWC-2) - Understanding as predictive compression
- Reading: [Fedorenko et al. (2024)](https://doi.org/10.1038/s41586-024-07522-w) - Language vs. thought
- Reading: [Shanahan (2024)](https://doi.org/10.1145/3624724) - LLMs as role-play engines
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture20.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture20.html)
---

## Week 7: Diffusion Models

**Monday (Lecture 21):** Diffusion Models
- The diffusion architecture: forward process, reverse process, noise schedules
- U-Net for noise prediction with timestep conditioning
- Training objective: predicting the noise (simplified DDPM loss)
- Score matching intuition and sampling algorithms (DDPM, DDIM)
- Animated walkthrough of the complete diffusion pipeline
- Reading: [Ho, Jain & Abbeel (2020)](https://arxiv.org/abs/2006.11239) - Denoising Diffusion Probabilistic Models
- Reading: [Sohl-Dickstein et al. (2015)](https://arxiv.org/abs/1503.03585) - Deep Unsupervised Learning using Nonequilibrium Thermodynamics
- Reading: [Song & Ermon (2019)](https://arxiv.org/abs/1907.05600) - Generative Modeling by Estimating Gradients
- Reading: [Nichol & Dhariwal (2021)](https://arxiv.org/abs/2102.09672) - Improved DDPM
- **📝 Assignment 4 Due (Feb 16, 11:59 PM EST)**
- **Final Project Released:** [Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) (Due: Mar 9, 11:59 PM EST)
- **Assignment 5 Available (Optional/Extra Credit):** [Build GPT](https://contextlab.github.io/llm-course/assignments/assignment-5/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture21.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture21.html)

**Wednesday (Lecture 22):** Diffusion Model Extensions
- Latent diffusion: VAE compression for efficient generation
- Classifier-free guidance for conditional generation
- Diffusion Transformer (DiT): replacing U-Net with transformers
- Flow matching and rectified flow: simpler, faster diffusion
- Stable Diffusion 3: MMDiT architecture
- Reading: [Rombach et al. (2022)](https://arxiv.org/abs/2112.10752) - Latent Diffusion Models
- Reading: [Ho & Salimans (2022)](https://arxiv.org/abs/2207.12598) - Classifier-Free Diffusion Guidance
- Reading: [Peebles & Xie (2023)](https://arxiv.org/abs/2212.09748) - Scalable Diffusion Models with Transformers (DiT)
- Reading: [Lipman et al. (2023)](https://arxiv.org/abs/2210.02747) - Flow Matching for Generative Modeling
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture22.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture22.html)

**Friday (Lecture 23):** Diffusion Applications and Ethics
- Text-to-image: DALL-E 2, Stable Diffusion, Imagen
- Text-to-video: Sora and spacetime patches
- Text-to-audio: FluxMusic and spectral diffusion
- Discrete diffusion for text generation (MDLM)
- Ethics: deepfakes, consent, bias in generation, regulation
- Reading: [Ramesh et al. (2022)](https://arxiv.org/abs/2204.06125) - DALL-E 2
- Reading: [OpenAI (2024)](https://openai.com/research/video-generation-models-as-world-simulators) - Sora
- Reading: [Sahoo et al. (2024)](https://arxiv.org/abs/2406.07524) - Masked Diffusion Language Models
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week7/diffusion_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture23.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture23.html)
---

## Week 8: No Classes

**⚠️ NO CLASS February 23-27 (Instructor Away)**
- Use this time to work on your final project

---

## Week 9: Advanced Topics

**Monday (Lecture 24):** Agents and Tool Use
- From chatbots to agents: function calling, ReAct framework, Toolformer
- Model Context Protocol (MCP): universal standard for tool integration
- Computer Use and agentic coding (Claude Code, Cursor, OpenHands)
- Agent safety: the principal-agent problem (97% attack success rate)
- Reading: [Yao et al. (2023)](https://arxiv.org/abs/2210.03629) - ReAct: Synergizing Reasoning and Acting
- Reading: [Schick et al. (2023)](https://arxiv.org/abs/2302.04761) - Toolformer
- Reading: [Hagendorff (2025)](https://arxiv.org/abs/2508.04039) - AI Agent Safety
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week9/agents_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture24.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture24.html)

**Wednesday (Lecture 25):** Mixture of Experts & Efficiency
- Dense vs sparse models, MoE architecture, routing and load balancing
- Mixtral 8x7B, DeepSeek-V3 ($5.5M frontier model), small language models
- Quantization, speculative decoding, state-space models (Mamba)
- The democratization paradox: efficiency enables access but also misuse
- Reading: [Jiang et al. (2024)](https://arxiv.org/abs/2401.04088) - Mixtral
- Reading: [DeepSeek-AI (2025)](https://arxiv.org/abs/2412.19437) - DeepSeek-V3
- Reading: [Gu & Dao (2023)](https://arxiv.org/abs/2312.00752) - Mamba
- Reading: [Patterson et al. (2021)](https://arxiv.org/abs/2104.10350) - Carbon Emissions and Large Neural Network Training
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week9/moe_efficiency_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture25.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture25.html)

**Friday (Lecture 26):** Ethics, Bias, and Safety
- EU AI Act (2024), AI and the 2024 elections, deepfakes and misinformation
- Strategic dishonesty: alignment faking and deceptive behavior in AI
- Copyright and intellectual property (80+ lawsuits, NYT v OpenAI)
- Building your own ethics framework for AI development
- Reading: [Bender et al. (2021)](https://dl.acm.org/doi/10.1145/3442188.3445922) - Stochastic Parrots
- Reading: [Greenblatt et al. (2024)](https://arxiv.org/abs/2412.14093) - Alignment Faking
- Reading: [Scheurer et al. (2025)](https://arxiv.org/abs/2311.07590) - Strategic Deception in AI
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture26.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture26.html)
---

## Week 10: Final Project Presentations

**Monday, March 9 (Lecture 27):** Final Project Presentations & Wrap-up
- All teams present their work (videos + discussion)
- Course wrap-up and reflections
- Last day of classes
- **📝 Final Project Due (Mar 9, 11:59 PM EST)** - [Assignment Page](https://contextlab.github.io/llm-course/assignments/final-project/) (all materials submitted before presentations)

---

## Accessing materials

### On GitHub

Clone the repository to access all materials locally:
```bash
git clone https://github.com/ContextLab/llm-course.git
cd llm-course/slides
```

---

## CDL Theme for Marp Slides

The slides for this course use the [Marp](https://marp.app/) presentation framework with a custom CDL (Contextual Dynamics Lab) theme. The theme provides consistent styling based on the Dartmouth color palette.

### Theme Features

- **Callout boxes**: Note, example, warning, tip, important, and definition boxes
- **Inline callouts**: Compact variants for stacked layouts
- **Definitions-examples layout**: Two-column layout for concept definitions with examples
- **Emoji figures**: Styled emoji with background colors and labels
- **Flow diagrams**: Auto-generated from simple markdown syntax
- **Charts**: Automated Chart.js styling with theme colors
- **Autoscaling**: Intelligent content scaling to fit slides

### Compiling Marp Slides

```bash
cd slides/week1
./compile.sh lecture1.md           # Compile to HTML
./compile.sh lecture1.md -f pdf    # Compile to PDF
```

### Documentation

For detailed usage instructions, see:
- **[STYLE_GUIDE.md](template_deck/STYLE_GUIDE.md)**: Complete theme documentation with examples
- **[template_deck/](template_deck/)**: Template files and theme assets

---

## X-Hour Schedule (Makeup Classes)

**Location:** TBD
**Time:** Thursday 12:15-1:05

X-hours will be used in the first 4 weeks to make up for missed class time (Feb 23-27):

- **Week 1 Thursday X-hour (Lecture 3):** ELIZA Implementation
  - ELIZA implementation: decomposition, reassembly, substitutions
  - Vibe coding best practices for building chatbots
  - Assignment 1 preview (released Friday)
  - 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week1/xhour_eliza_demo.html)
  - 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture3.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture3.html)

- **Week 2 Thursday X-hour (Lecture 7):** Text Classification Workshop
  - Feature engineering for text classification (bag-of-words, TF-IDF)
  - Building classifiers with preprocessing and tokenization pipelines
  - Introduction to evaluation metrics
  - Hands-on: Explore SPAM classification approaches for Assignment 2
  - 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week2/xhour_classification_demo.html)
  - 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture7.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture7.html)

- **Week 3 Thursday X-hour (Lecture 9):** Vibe Coding Tips & Tricks
  - Setting up VS Code and AI coding tools
  - Installing OpenCode and oh-my-opencode
  - The spec-kit workflow: from design docs to implementation
  - Live demo: building a chatbot analyzer
  - Free AI tools for students: [GitHub Copilot](https://github.com/education/students), [Google Gemini](https://gemini.google/students/)
  - 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture9.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture9.html)

- **Week 4 Thursday X-hour (Lecture 13):** Dimensionality Reduction
  - Matrix factorization (PCA, ICA, NMF) and manifold learning (t-SNE, UMAP)
  - Reading: [van der Maaten & Hinton (2008)](https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf) - t-SNE
  - Reading: [McInnes & Healy (2018)](https://arxiv.org/abs/1802.03426) - UMAP
  - 📓 [X-hour Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week4/xhour_dimred_demo.ipynb)
  - 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/)
  - 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture13.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture13.html)

Remaining X-hours may be used as hackathon time based on class interest.

---

**Questions?** See the [main course README](../README.md) or attend office hours.
