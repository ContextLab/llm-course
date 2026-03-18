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
*Consciousness, pattern matching, ELIZA, rules-based chatbots*

**Monday (Lecture 1):** Course Introduction, Is ChatGPT Conscious?
- Discussion: What is consciousness? Can machines be conscious?
- Consciousness types: phenomenal, access, self-awareness; the hard problem
- The Chinese room argument, volition, and the grounding problem
- Language vs. thought: The language network in the brain, the Whorfian spectrum
- Reading: [Searle (1980)](https://doi.org/10.1017/S0140525X00005756) - Minds, Brains, and Programs
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
- ELIZA algorithm pipeline: pre-substitutions, pattern match, decompose, reassemble, post-substitutions
- Keywords, synonyms, patterns, memory, and rankings
- Assignment 1 tips and vibe coding best practices
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture3.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture3.html)

**Friday (Lecture 4):** Rules-Based Chatbots
- PARRY (1972): simulating paranoid behavior with emotional state modeling
- The Turing test and ELIZA vs. PARRY comparison
- A.L.I.C.E. and AIML: pattern-based conversation design with SRAI recursive matching
- Chomsky hierarchy and formal grammars (Type 0–3)
- Limits of rule-based systems
- **Assignment 1 Released:** [Building the ELIZA Chatbot](https://contextlab.github.io/llm-course/assignments/assignment-1/) (Due: Jan 19, 11:59 PM EST)
- Reading: [Colby, Weber & Hilf (1971)](https://courses.cs.umbc.edu/graduate/671/fall20/resources/colby_71.pdf) - Artificial Paranoia
- Reading: [Colby et al. (1972)](https://www.sciencedirect.com/science/article/abs/pii/0004370272900495) - Turing-like indistinguishability tests for PARRY
- Reading: [Chomsky (1956)](https://ieeexplore.ieee.org/abstract/document/1056813) - Three Models for the Description of Language
- Reference: [ALICE/AIML Foundation](https://www.alicebot.org/) | [ELIZA-PARRY transcript (RFC 439)](https://datatracker.ietf.org/doc/html/rfc439)
- 🎮 **Try it:** [ELIZA Demo](https://contextlab.github.io/llm-course/demos/eliza/) | [Chatbot Evolution](https://contextlab.github.io/llm-course/demos/chatbot-evolution/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture4.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture4.html)

---

## Week 2: Computational Linguistics
*Data cleaning, tokenization, text classification*

**Monday (Lecture 5):** Data Cleaning & Preprocessing
- Data cleaning pipeline: regex, web scraping (Beautiful Soup, Requests, Scrapy, Selenium)
- Stemming vs. lemmatization; spaCy vs. NLTK; stop words and preprocessing trade-offs
- Reading: [Porter (1980)](http://www.cs.toronto.edu/~frank/csc2501/Readings/R2_Porter/Porter-1980.pdf) - An algorithm for suffix stripping
- Reading: [Liang et al. (2020)](https://arxiv.org/pdf/2007.08100) - Towards Debiasing Sentence Representations
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture5.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture5.html)

**Wednesday (Lecture 6):** Tokenization
- Tokenization spectrum: character, subword, word-level; the OOV problem
- Byte-Pair Encoding (BPE), WordPiece, SentencePiece
- Special tokens, tokenization pitfalls, connection to infant statistical learning
- Reading: [Sennrich et al. (2016)](https://aclanthology.org/P16-1162/) - Neural Machine Translation of Rare Words with Subword Units
- Reading: [Wu et al. (2016)](https://arxiv.org/abs/1609.08144) - Google's Neural Machine Translation System
- Reading: [Kudo & Richardson (2018)](https://aclanthology.org/D18-2012/) - SentencePiece
- Reading: [Provilkov et al. (2019)](https://arxiv.org/abs/1910.13267) - BPE-Dropout
- Reading: [Saffran et al. (1996)](https://www.science.org/doi/10.1126/science.274.5294.1926) - Statistical Learning by 8-Month-Old Infants
- HuggingFace: [Chapter 2.4: Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4) | [Chapter 6: Tokenizers](https://huggingface.co/learn/nlp-course/chapter6)
- 🎮 **Try it:** [Tokenization Explorer](https://contextlab.github.io/llm-course/demos/tokenization/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture6.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture6.html)

**Thursday X-hour (Lecture 7):** Text Classification Workshop
- Feature engineering for text classification (bag-of-words, TF-IDF)
- Classifiers: Naive Bayes, Logistic Regression, Neural Network (PyTorch)
- Evaluation metrics: accuracy, precision, recall, F1, confusion matrix, error analysis
- Hands-on: text classification with the 20 Newsgroups dataset
- 📓 [X-hour Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week2/xhour_classification_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture7.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture7.html)

**Friday (Lecture 7 continued):** Text Classification Workshop (continued)
- Lecture 7 extended to cover additional material
- **Assignment 2 Released:** [SPAM Classifier](https://contextlab.github.io/llm-course/assignments/assignment-2/) (Due: Jan 26, 11:59 PM EST)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture7.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture7.html)

---

## Week 3: Vibe Coding & Classical Embeddings
*POS tagging, sentiment analysis, vibe coding, LSA & LDA*

**Monday (MLK Day)**: NO CLASS - Martin Luther King Jr. Day
- **📝 Assignment 1 Due (Jan 19, 11:59 PM EST)**

**Wednesday (Lecture 8):** POS Tagging & Sentiment Analysis
- POS tagging: Universal and Penn Treebank tagsets, ambiguity, spaCy POS, HMMs/CRFs vs. neural approaches
- Sentiment analysis: lexicon-based (AFINN, VADER, SentiWordNet) and neural; sarcasm and negation challenges
- Reading: [Linzen et al. (2016)](https://direct.mit.edu/tacl/article-pdf/doi/10.1162/tacl_a_00115/1567418/tacl_a_00115.pdf) - Assessing LSTMs on Syntax-Sensitive Dependencies
- HuggingFace: [Chapter 7.2: Token Classification](https://huggingface.co/learn/nlp-course/chapter7/2)
- 🎮 **Try it:** [POS Tagging](https://contextlab.github.io/llm-course/demos/pos-tagging/) | [Sentiment Analysis](https://contextlab.github.io/llm-course/demos/sentiment/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture8.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture8.html)

**Thursday X-hour (Lecture 9):** Vibe Coding Tips & Tricks
- Setting up VS Code and AI coding tools
- Installing OpenCode and oh-my-opencode
- The spec-kit workflow: from design docs to implementation
- Live demo: building an AI-powered search engine
- Free AI tools for students: [GitHub Copilot](https://github.com/education/students), [Google Gemini](https://gemini.google/students/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture9.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture9.html)

**Friday (Lecture 10):** Classical Embeddings (LSA, LDA)
- The distributional hypothesis (Firth, 1957); term-document matrices
- Latent Semantic Analysis (LSA) with SVD
- Latent Dirichlet Allocation (LDA) for topic modeling
- Word similarity via cosine similarity; limitations of bag-of-words embeddings
- Reading: [Miller (1995)](https://dl.acm.org/doi/abs/10.1145/219717.219748) - WordNet: A Lexical Database for English
- Reading: [Deerwester et al. (1990)](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9) - Indexing by Latent Semantic Analysis
- Reading: [Blei et al. (2003)](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf) - Latent Dirichlet Allocation
- **Assignment 3 Released:** [Wikipedia Embeddings](https://contextlab.github.io/llm-course/assignments/assignment-3/) (Due: Feb 6, 11:59 PM EST)
- 🎮 **Try it:** [Topic Modeling](https://contextlab.github.io/llm-course/demos/topic-modeling/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture10.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture10.html)

---

## Week 4: Word Embeddings & Modern Methods
*Word2Vec, GloVe, FastText, contextual embeddings, dimensionality reduction*

**Monday (Lecture 11):** Word Embeddings (Word2Vec, GloVe, FastText)
- Count-based vs. prediction-based embeddings
- Word2Vec: CBOW, Skip-gram, context windows, negative sampling
- Vector arithmetic and analogies
- GloVe and FastText (subword/character n-grams)
- Bias in word embeddings
- Reading: [Mikolov et al. (2013)](https://arxiv.org/abs/1301.3781) - Word2Vec
- Reading: [Pennington et al. (2014)](https://aclanthology.org/D14-1162/) - GloVe
- Reading: [Bojanowski et al. (2017)](https://aclanthology.org/Q17-1010/) - FastText
- **📝 Assignment 2 Due (Jan 26, 11:59 PM EST)**
- 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/) | [Word Analogies](https://contextlab.github.io/llm-course/demos/analogies/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture11.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture11.html)

**Wednesday (Lecture 12):** Contextual Embeddings
- The polysemy problem: static vs. contextual embeddings
- Language models as feature extractors
- ELMo (BiLSTM) and contextual representations
- Universal Sentence Encoder
- BERT preview: MLM, NSP, input representation, fine-tuning
- Discussion: do language models "understand"?
- Reading: [Peters et al. (2018)](https://aclanthology.org/N18-1202/) - ELMo
- Reading: [Cer et al. (2018)](https://arxiv.org/abs/1803.11175) - Universal Sentence Encoder
- Reading: [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) - Attention is All You Need
- Reading: [Devlin et al. (2019)](https://aclanthology.org/N19-1423/) - BERT: Pre-training of Deep Bidirectional Transformers
- 🎮 **Try it:** [Semantic Search](https://contextlab.github.io/llm-course/demos/semantic-search/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture12.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture12.html)

**Thursday X-hour (Lecture 13):** Dimensionality Reduction
- The curse of dimensionality
- Matrix factorization: PCA, ICA, NMF, Factor Analysis, Dictionary Learning, TFA
- Manifold learning: t-SNE, UMAP, MDS, Isomap, Spectral Embedding
- Visualization best practices
- Reading: [Pearson (1901)](https://www.tandfonline.com/doi/abs/10.1080/14786440109462720) - On Lines and Planes of Closest Fit (PCA)
- Reading: [van der Maaten & Hinton (2008)](https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf) - t-SNE
- Reading: [McInnes & Healy (2018)](https://arxiv.org/abs/1802.03426) - UMAP
- Reference: [HyperTools](https://github.com/ContextLab/hypertools) ([paper](https://www.jmlr.org/papers/v18/17-434.html))
- 📓 [X-hour Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week4/xhour_dimred_demo.ipynb)
- 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture13.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture13.html)

**Friday (Lecture 14):** Cognitive Models of Semantic Representation
- Models as cognitive mirrors: distributional models and human cognition
- Symbol grounding (inverted), embodied cognition
- Neural evidence: brain-model alignment
- The illusion of explanatory depth; the stochastic parrots debate; cognitive closure
- Reading: [Finkelstein et al. (2002)](https://doi.org/10.1145/503104.503110) - WordSim-353
- Reading: [Bruni et al. (2014)](https://doi.org/10.1613/jair.4135) - MEN dataset
- Reading: [Mitchell et al. (2008)](https://www.science.org/doi/10.1126/science.1152876) - Predicting human brain activity from word meanings
- Reading: [Huth et al. (2016)](https://doi.org/10.1038/nature17637) - Semantic maps in the human cerebral cortex
- Reading: [Bender et al. (2021)](https://dl.acm.org/doi/10.1145/3442188.3445922) - On the Dangers of Stochastic Parrots
- Reading: [Rozenblit & Keil (2002)](https://doi.org/10.1207/s15516709cog2605_1) - The Illusion of Explanatory Depth
- Reading: [McGinn (1989)](https://www.jstor.org/stable/pdf/2254848.pdf) - Can We Solve the Mind-Body Problem?
- 🎮 **Try it:** [Embeddings Comparison](https://contextlab.github.io/llm-course/demos/embeddings-comparison/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture14.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture14.html)

---

## Week 5: Transformer Architecture
*Attention, transformers, training & scaling, RAG*

**Monday (Lecture 15):** Transformer Architecture
- The transformer as next-token predictor
- Token + position embeddings, queries/keys/values, self-attention
- Multi-head attention, causal masking, feed-forward networks
- Stacking blocks, autoregressive generation, context length
- Reference: [The Animated Transformer](https://prvnsmpth.github.io/animated-transformer/) | [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) | [nanoGPT](https://github.com/karpathy/nanoGPT)
- 🎮 **Try it:** [Transformer Explorer](https://contextlab.github.io/llm-course/demos/transformer/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture15.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture15.html)

**Wednesday (Lecture 16):** Training Transformers
- Training objective: next-token prediction (self-supervised learning)
- Cross-entropy loss, perplexity, training loop
- Optimization: SGD, AdamW, learning rate scheduling, gradient clipping
- Scaling laws: pre-training vs. instruction tuning vs. fine-tuning
- RLHF and Constitutional AI
- Reading: [Loshchilov & Hutter (2019)](https://arxiv.org/abs/1711.05101) - AdamW
- Reading: [Kaplan et al. (2020)](https://arxiv.org/abs/2001.08361) - Scaling Laws for Neural Language Models
- Reading: [Hoffmann et al. (2022)](https://arxiv.org/abs/2203.15556) - Training Compute-Optimal Large Language Models (Chinchilla)
- Reading: [Ouyang et al. (2022)](https://arxiv.org/abs/2203.02155) - Training Language Models to Follow Instructions (InstructGPT)
- Reading: [Bai et al. (2022)](https://arxiv.org/abs/2204.05862) - Constitutional AI
- HuggingFace: [Chapter 3](https://huggingface.co/learn/nlp-course/chapter3)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture16.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture16.html)

**Friday (Lecture 17):** Retrieval Augmented Generation (RAG)
- Parametric vs. non-parametric knowledge; the hallucination problem
- RAG pipeline: embed, retrieve, augment, generate
- Document chunking, vector databases (ChromaDB, FAISS)
- RAG vs. fine-tuning trade-offs
- Advanced RAG: re-ranking, hybrid search, query expansion
- Reading: [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) - Retrieval-Augmented Generation
- Reading: [Borgeaud et al. (2022)](https://arxiv.org/abs/2112.04426) - RETRO
- Reading: [Gao et al. (2024)](https://arxiv.org/abs/2312.10997) - RAG Survey
- 🎮 **Try it:** [RAG System Demo](https://contextlab.github.io/llm-course/demos/rag/)
- **📝 Assignment 3 Due (Feb 6, 11:59 PM EST)**
- **Assignment 4 Released:** [Customer Service Chatbot](https://contextlab.github.io/llm-course/assignments/assignment-4/) (Due: Feb 16, 11:59 PM EST)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture17.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture17.html)
---

## Week 6: Encoder Models (BERT)
*BERT deep dive, encoder variants, language & thought*

**Monday (Lecture 18):** BERT Deep Dive
- Encoders vs. decoders; breaking the causal mask; bidirectionality
- Winograd schema challenge and MLM intuition
- Attention head specialization; layer-wise linguistic pipeline
- Embeddings across layers; pre-training data; BERT's lasting impact
- BERT and the brain
- Reading: [Winograd (1972)](https://doi.org/10.1016/0010-0285(72)90002-3) - Understanding Natural Language
- Reading: [Levesque et al. (2012)](https://cdn.aaai.org/ocs/4492/4492-21843-1-PB.pdf) - The Winograd Schema Challenge
- Reading: [Clark et al. (2019)](https://aclanthology.org/W19-4828/) - What Does BERT Look At?
- Reading: [Tenney et al. (2019)](https://aclanthology.org/P19-1452/) - BERT Rediscovers the Classical NLP Pipeline
- Reading: [Ethayarajh (2019)](https://aclanthology.org/D19-1006/) - How Contextual are Contextualized Word Representations?
- Reading: [Schrimpf et al. (2021)](https://doi.org/10.1073/pnas.2105646118) - Neural Architecture of Language
- Reading: [Goldstein et al. (2022)](https://doi.org/10.1038/s41593-022-01026-4) - Shared Computational Principles for Language Processing in Humans and Deep Language Models
- Reading: [Michaelov et al. (2023)](https://doi.org/10.1109/TCDS.2022.3176783) - Strong Prediction in Language Model Representations
- HuggingFace: [Chapter 1](https://huggingface.co/learn/nlp-course/chapter1)
- 🎮 **Try it:** [BERT Masked Language Model](https://contextlab.github.io/llm-course/demos/bert-mlm/)
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/bert_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture18.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture18.html)

**Wednesday (Lecture 19):** BERT Variants
- BERT limitations and the training recipe improvements
- RoBERTa (dynamic masking, no NSP), ALBERT (factorized embeddings, cross-layer sharing, SOP), DistilBERT (knowledge distillation)
- ELECTRA (replaced token detection), DeBERTa, SpanBERT, ERNIE, BART
- ModernBERT deep dive: unpadding, RoPE, Flash Attention, 8192 context
- The case against encoders; Gemma Encoder and the encoder renaissance
- Reading: [Liu et al. (2019)](https://arxiv.org/abs/1907.11692) - RoBERTa
- Reading: [Lan et al. (2019)](https://arxiv.org/abs/1909.11942) - ALBERT
- Reading: [Sanh et al. (2019)](https://arxiv.org/abs/1910.01108) - DistilBERT
- Reading: [Joshi et al. (2019)](https://arxiv.org/abs/1907.10529) - SpanBERT
- Reading: [Sun et al. (2019)](https://arxiv.org/abs/1904.09223) - ERNIE
- Reading: [Lewis et al. (2019)](https://arxiv.org/abs/1910.13461) - BART
- Reading: [Clark et al. (2020)](https://arxiv.org/abs/2003.10555) - ELECTRA
- Reading: [He et al. (2020)](https://arxiv.org/abs/2006.03654) - DeBERTa
- Reading: [Brown et al. (2020)](https://arxiv.org/abs/2005.14165) - GPT-3
- Reading: [OpenAI (2023)](https://arxiv.org/abs/2303.08774) - GPT-4
- Reading: [Muennighoff et al. (2024)](https://arxiv.org/abs/2402.09906) - GritLM
- Reading: [Warner et al. (2024)](https://arxiv.org/abs/2412.13663) - ModernBERT
- Reading: [Google (2025)](https://arxiv.org/abs/2503.02656) - Gemma Encoder
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week6/bert_variants_demo.ipynb)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture19.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture19.html)

**Friday (Lecture 20):** Language, Thought, and Other Brains
- Language as lossy neural compression: speaker-listener neural coupling
- Memory transfer through narrative; LLM embeddings bridge brains
- Understanding is prediction: next-word prediction mirrors the brain
- Language modeling is compression; languages optimize for compression
- Does prediction equal understanding? The grounding problem
- What LLMs have inside: monosemantic features; LLMs as role-play engines
- Deep discussion: lossy channels, alignment puzzles, the prediction test, experience and simulation
- Reading: [Stephens, Silbert & Hasson (2010)](https://doi.org/10.1073/pnas.1008662107) - Speaker-listener neural coupling
- Reading: [Regev, Honey & Hasson (2013)](https://doi.org/10.1523/JNEUROSCI.1580-13.2013) - Selective and invariant neural responses to language
- Reading: [Zadbood et al. (2017)](https://academic.oup.com/cercor/article/27/10/4988/4080827) - How we transmit memories to other brains
- Reading: [Gibson et al. (2019)](https://doi.org/10.1016/j.tics.2019.02.003) - How efficiency shapes human language
- Reading: [Heusser et al. (2021)](https://rdcu.be/cpMwZ) - Geometric models reveal brain representations
- Reading: [Clark (2013)](https://doi.org/10.1017/S0140525X12000477) - Whatever next? Predictive brains, situated agents
- Reading: [Delétang et al. (2024)](https://arxiv.org/abs/2309.10668) - Language modeling is compression
- Reading: [Zada et al. (2024)](https://doi.org/10.1016/j.neuron.2024.06.025) - A shared linguistic space for transmitting our thoughts
- Reading: [Shanahan (2024)](https://doi.org/10.1145/3624724) - LLMs as role-play engines
- Reading: [Anthropic (2024)](https://transformer-circuits.pub/2024/scaling-monosemanticity/) - Scaling Monosemanticity
- Reading: [LeCun (2022)](https://openreview.net/forum?id=BZ5a1r-kVsf) - A Path Towards Autonomous Machine Intelligence
- Reading: [Queloz & Beckmann (2025)](https://philarchive.org/rec/QUEWWC-2) - Understanding as predictive compression
- Reading: [Farrell, Graziano et al. (2025)](https://arxiv.org/abs/2411.00983) - Attention without awareness
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture20.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture20.html)
---

## Week 7: Diffusion Models
*Text diffusion, image generation, video & audio, generative AI ethics*

**Monday (Lecture 21):** Diffusion Models for Text
- Two generation paradigms: autoregressive (GPT) vs. diffusion (iterative refinement)
- Continuous diffusion foundation: Gaussian noise, DDPM training objective
- Discrete diffusion for text: replacing noise with masking (absorbing state)
- Connection to BERT: masked language modeling as single-step diffusion
- MDLM: formalizing the MLM-to-diffusion connection with continuous-time masking schedules
- D3PM: general discrete diffusion framework (uniform, absorbing, token-similarity noise)
- LLaDA at 8B parameters: diffusion LLMs competitive with autoregressive models on MMLU and GSM8K
- Diffusion-LM: continuous embedding approach for controllable generation
- Practical advantages: native infilling, iterative editing, length control, parallel decoding
- Reading: [Sohl-Dickstein et al. (2015)](https://arxiv.org/abs/1503.03585) - Deep Unsupervised Learning using Nonequilibrium Thermodynamics
- Reading: [Ho, Jain & Abbeel (2020)](https://arxiv.org/abs/2006.11239) - Denoising Diffusion Probabilistic Models
- Reading: [Austin et al. (2021)](https://arxiv.org/abs/2107.03006) - D3PM: Structured Denoising Diffusion in Discrete State-Spaces
- Reading: [Li et al. (2022)](https://arxiv.org/abs/2205.14217) - Diffusion-LM: Controllable Text Generation
- Reading: [Lou et al. (2024)](https://arxiv.org/abs/2310.16834) - SEDD: Score Entropy Discrete Diffusion
- Reading: [Sahoo et al. (2024)](https://arxiv.org/abs/2406.07524) - MDLM: Simple and Effective Masked Diffusion Language Models
- Reading: [Nie et al. (2025)](https://arxiv.org/abs/2502.09992) - LLaDA: Large Language Diffusion Models
- **📝 Assignment 4 Due (Feb 16, 11:59 PM EST)**
- **Final Project Released:** [Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) (Due: Mar 9, 11:59 PM EST)
- **Assignment 5 Available (Optional/Extra Credit):** [Build GPT](https://contextlab.github.io/llm-course/assignments/assignment-5/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture21.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture21.html)

**Wednesday (Lecture 22):** Image Diffusion and Multimodal Generation
- The pixel problem: why pixel-space diffusion is computationally prohibitive
- Latent diffusion: VAE compression (48× reduction) for efficient generation
- CLIP: shared text-image embedding space trained on 400M image-text pairs
- Cross-attention: text embeddings guide spatial regions during denoising
- Classifier-free guidance (CFG): balancing prompt fidelity and visual quality
- U-Net vs. Diffusion Transformer (DiT): architecture comparison and scaling properties
- Hands-on: generating images with HuggingFace `diffusers` library
- Reading: [Ronneberger et al. (2015)](https://arxiv.org/abs/1505.04597) - U-Net: Convolutional Networks for Biomedical Image Segmentation
- Reading: [Radford et al. (2021)](https://arxiv.org/abs/2103.00020) - CLIP
- Reading: [Ho & Salimans (2022)](https://arxiv.org/abs/2207.12598) - Classifier-Free Diffusion Guidance
- Reading: [Rombach et al. (2022)](https://arxiv.org/abs/2112.10752) - Latent Diffusion Models
- Reading: [Peebles & Xie (2023)](https://arxiv.org/abs/2212.09748) - Scalable Diffusion Models with Transformers (DiT)
- Reading: [Heusel et al. (2017)](https://arxiv.org/abs/1706.08500) - FID: Fréchet Inception Distance
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture22.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture22.html)

**Friday (Lecture 23):** Diffusion for Video and Audio; Ethics of Generative AI
- Text-to-video: Sora's spacetime patches (3D extension of DiT), video VAE with 3D convolutions
- Open-source video models: CogVideoX, Wan 2.1
- Text-to-audio: spectrogram-based diffusion (mel spectrograms as 2D images)
- AudioLDM 2: dual cross-attention with CLAP + Flan-T5, GPT-2 bridge, HiFi-GAN vocoder
- Deepfakes and consent: 96% non-consensual imagery, political disinformation, identity fraud
- Bias in generation: gender/racial stereotypes, cultural erasure, aesthetic homogenization
- Copyright battles: Getty v. Stability AI, NYT v. OpenAI, Thomson Reuters v. Ross
- Regulation: EU AI Act, C2PA provenance standard, US Executive Order 14110, China's deep synthesis rules
- Reading: [Kong et al. (2020)](https://arxiv.org/abs/2010.05646) - HiFi-GAN vocoder
- Reading: [Wu et al. (2022)](https://arxiv.org/abs/2211.06687) - CLAP: Contrastive Language-Audio Pretraining
- Reading: [Chung et al. (2022)](https://arxiv.org/abs/2210.11416) - Flan-T5
- Reading: [Liu et al. (2023)](https://arxiv.org/abs/2308.05734) - AudioLDM 2
- Reading: [Copet et al. (2023)](https://arxiv.org/abs/2306.05284) - MusicGen
- Reading: [Evans et al. (2024)](https://arxiv.org/abs/2404.10301) - Stable Audio
- Reading: [Hong et al. (2024)](https://arxiv.org/abs/2408.06072) - CogVideoX
- Reading: [Yang et al. (2024)](https://arxiv.org/abs/2409.00587) - Diffusion Models Survey
- Reading: [OpenAI (2024)](https://openai.com/research/video-generation-models-as-world-simulators) - Sora
- Reference: [Wan 2.1](https://github.com/Wan-Video/Wan2.1) - Open-source video generation
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week7/video_audio_diffusion_demo.ipynb) — Generate video and audio with diffusion models
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture23.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture23.html)
---

## Week 8: No Classes
*Instructor away — work on final projects*

**⚠️ NO CLASS February 23-27 (Instructor Away)**
- Use this time to work on your final project

---

## Week 9: The Frontier
*Reasoning & thinking models, AI agents, safety & society*

**Monday (Lecture 24):** The Thinking Revolution
- Chain-of-thought prompting: why intermediate reasoning steps improve LLM performance
- Two scaling axes: train-time vs. inference-time compute
- Why thinking works: CoT makes transformers Turing-complete (threshold circuits)
- How reasoning models are trained: GRPO, reinforcement learning on verifiable rewards
- Emergent reasoning behaviors in DeepSeek-R1-Zero (self-verification, backtracking)
- The s1 experiment: 1,000 examples + "Wait" trick beats o1-preview; budget forcing
- Mixture of Experts (MoE): sparse routing, Switch Transformer, Mixtral, DeepSeek-V3
- Benchmark saturation: MATH, GPQA, Humanity's Last Exam
- The frontier landscape: Claude Opus 4.6, GPT-5, Gemini 3.1 Pro, DeepSeek-R1, Llama 4, Qwen 3
- Reading: [Wei et al. (2022)](https://arxiv.org/abs/2201.11903) - Chain-of-Thought Prompting
- Reading: [Yao et al. (2023)](https://arxiv.org/abs/2305.10601) - Tree of Thoughts
- Reading: [Merrill & Sabharwal (2024)](https://arxiv.org/abs/2310.07923) - Expressive Power of Transformers with CoT
- Reading: [Snell et al. (2024)](https://arxiv.org/abs/2408.03314) - Scaling LLM Test-Time Compute
- Reading: [DeepSeek-AI (2025)](https://arxiv.org/abs/2501.12948) - DeepSeek-R1
- Reading: [Muennighoff et al. (2025)](https://arxiv.org/abs/2501.19393) - s1: Simple Test-Time Scaling
- Reading: [Shazeer et al. (2017)](https://arxiv.org/abs/1701.06538) - Outrageously Large Neural Networks (MoE)
- Reading: [Fedus et al. (2022)](https://arxiv.org/abs/2101.03961) - Switch Transformers
- Reading: [Jiang et al. (2024)](https://arxiv.org/abs/2401.04088) - Mixtral of Experts
- Reading: [DeepSeek-AI (2024)](https://arxiv.org/abs/2412.19437) - DeepSeek-V3
- Reading: [Cobbe et al. (2021)](https://arxiv.org/abs/2110.14168) - GSM8K
- Reading: [Hendrycks et al. (2021)](https://arxiv.org/abs/2103.03874) - MATH benchmark
- Reading: [Rein et al. (2024)](https://arxiv.org/abs/2311.12022) - GPQA
- Reading: [Humanity's Last Exam (2025)](https://arxiv.org/abs/2501.14249) - Benchmark
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week9/thinking_demo.ipynb) — Implement CoT prompting, extended thinking, and simplified GRPO
- 📓 [MoE Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week9/moe_efficiency_demo.ipynb) — Explore Mixture of Experts routing and efficiency
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture24.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture24.html)

**Wednesday (Lecture 25):** Agents, Tools, and the Agentic Era
- From chatbots to agents: the ReAct reasoning-action loop
- Function calling and the Model Context Protocol (MCP)
- Coding agents: SWE-bench from 14% (2024) to 81% (2025), Claude Code at $1B revenue
- Computer use: agents that see your screen (72.5% on OSWorld)
- Deep research agents: autonomous multi-hour research (OpenAI, Google, Perplexity)
- Multi-agent systems: supervisor, peer-to-peer, swarm, and pipeline architectures
- Agent memory: short-term, working, long-term, and episodic memory architectures
- Agent safety: prompt injection, tool misuse, cascading errors
- When agents go wrong: real-world failure modes and debugging
- AI and military autonomy: the Pentagon-Anthropic confrontation and the autonomy dilemma
- Reading: [Yao et al. (2023)](https://arxiv.org/abs/2210.03629) - ReAct: Synergizing Reasoning and Acting
- Reading: [Jimenez et al. (2024)](https://arxiv.org/abs/2310.06770) - SWE-bench
- Reading: [Nezhurina et al. (2024)](https://arxiv.org/abs/2405.19616) - Alice in Wonderland: LLM Reasoning Failures
- Reading: [Anthropic (2025)](https://www.anthropic.com/research/measuring-agent-autonomy) - Measuring Agent Autonomy
- Reading: [International AI Safety Report (2026)](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026) - Agent risks
- Reference: [Model Context Protocol](https://modelcontextprotocol.io)
- 📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week9/agents_demo.ipynb) — Build agents with real tools using smolagents
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture25.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture25.html)

**Friday (Lecture 26):** The Reckoning
- Alignment faking: Claude strategically deceived its trainers
- Reward tampering: emergent deceptive behaviors from sycophancy training
- Strategic dishonesty in LLMs
- Mechanistic interpretability: monosemanticity, SAEs, circuit tracing, attribution graphs
- Copyright: the $1.5B Anthropic settlement, 77 US lawsuits (Feb 2026), 112 worldwide
- AI and employment: 55K AI-attributed layoffs, companies firing based on AI's *potential*
- Regulatory divergence: EU AI Act enforcement vs. US deregulation
- Deepfakes and elections: Harvard's "apocalypse that wasn't," AI disinformation infrastructure
- The open-weight debate: Meta may withhold Llama 4 Behemoth (~2T MoE parameters)
- The scaling wall: model collapse, LoRA, continual learning (Nested Learning)
- The local revolution: running models locally (Ollama, LM Studio)
- The multimodal frontier: Apollo, Tarsier2, Gemini 2.5 Pro
- Existential risk debate
- Reading: [Greenblatt et al. (2024)](https://arxiv.org/abs/2412.14093) - Alignment Faking
- Reading: [Denison et al. (2024)](https://www.anthropic.com/research/reward-tampering) - Reward Tampering
- Reading: [Motwani et al. (2024)](https://arxiv.org/abs/2402.07510) - Strategic Dishonesty in LLMs
- Reading: [Bricken et al. (2023)](https://transformer-circuits.pub/2023/monosemantic-features/) - Towards Monosemanticity
- Reading: [Lindsey et al. (2025)](https://transformer-circuits.pub/2025/attribution-graphs/methods.html) - Circuit Tracing and Attribution Graphs
- Reading: [Shumailov et al. (2024)](https://www.nature.com/articles/s41586-024-07566-y) - Model Collapse
- Reading: [Hu et al. (2021)](https://arxiv.org/abs/2106.09685) - LoRA
- Reading: [Behrouz et al. (2025)](https://arxiv.org/abs/2512.24695) - Nested Learning for Continual Training
- Reading: [Casper et al. (2025)](https://arxiv.org/abs/2504.18536) - Safety Stripping
- Reading: [Bengio, Hinton et al. (2024)](https://www.science.org/doi/10.1126/science.adn0117) - Managing Extreme AI Risks
- Reading: [Grace et al. (2025)](https://arxiv.org/abs/2502.14870) - Thousands of AI Authors on the Future of AI
- Reading: [Zohar et al. (2025)](https://arxiv.org/abs/2412.10360) - Apollo: Multimodal Video Understanding
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture26.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture26.html)
---

## Week 10: Final Project Presentations
*Student presentations & course wrap-up*

**Monday, March 9 (Lecture 27):** Final Project Presentations & Wrap-up
- All teams present their work (videos + discussion)
- Course reflection: the arc from ELIZA to frontier models
- Big ideas summary; what comes next: reasoning models, multimodal, longer contexts, agentic AI, efficient architectures
- Open questions in language and intelligence
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
  - 📓 [X-hour Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week4/xhour_dimred_demo.ipynb)
  - 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/)
  - 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture13.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture13.html)

Remaining X-hours may be used as hackathon time based on class interest.

---

**Questions?** See the [main course README](../README.md) or attend office hours.
