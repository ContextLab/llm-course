# Course Slides - Models of Language and Communication

This directory contains lecture slides for all 10 weeks of the course. Each week includes **3 lectures** (Monday, Wednesday, Friday in the 10-hour slot), with slides provided in both PDF and web-viewable HTML formats.

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
- Introduction to ELIZA chatbot architecture
- Live demo of ELIZA in action
- The ELIZA effect: why users anthropomorphize chatbots
- Reading: [Weizenbaum (1966)](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf) - ELIZA: A Computer Program For Natural Language Communication
- 🎮 **Try it:** [ELIZA Demo](https://contextlab.github.io/llm-course/demos/eliza/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture2.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture2.html)

**Thursday X-hour (Lecture 3):** ELIZA Implementation
- ELIZA implementation: decomposition, reassembly, substitutions
- Vibe coding best practices for building chatbots
- **Assignment 1 Released:** [Building the ELIZA Chatbot](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%201%3A%20ELIZA) (Due: End of Week 2)
- 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week1/xhour_eliza_demo.html)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture3.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture3.html)

**Friday (Lecture 4):** Rules-Based Chatbots
- PARRY: simulating paranoid behavior with affect and intent modeling
- A.L.I.C.E. and AIML: pattern-based conversation design
- The evolution from ELIZA to modern rules-based systems
- Assignment 1 Q&A
- Reading: [Colby et al. (1971)](https://doi.org/10.1016/S0004-3702(71)80014-6) - Artificial Paranoia (PARRY)
- Reference: [ALICE/AIML Foundation](https://www.alicebot.org/)
- 🎮 **Try it:** [ELIZA Demo](https://contextlab.github.io/llm-course/demos/eliza/) | [Chatbot Evolution](https://contextlab.github.io/llm-course/demos/chatbot-evolution/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture4.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture4.html)

---

## Week 2: Computational Linguistics

**Monday (Lecture 5):** Data Cleaning & Preprocessing
- Web scraping with Beautiful Soup
- Lemmatization and text normalization
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture.pdf)

**Wednesday (Lecture 6):** Tokenization
- Byte-Pair Encoding (BPE), WordPiece, SentencePiece
- Reading: [Sennrich et al. (2016)](https://aclanthology.org/P16-1162/) - Neural Machine Translation of Rare Words with Subword Units
- Reading: [Kudo & Richardson (2018)](https://aclanthology.org/D18-2012/) - SentencePiece
- HuggingFace: [Chapter 2.4: Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4)
- HuggingFace: [Chapter 6: Tokenizers](https://huggingface.co/learn/nlp-course/chapter6)
- 🎮 **Try it:** [Tokenization Explorer](https://contextlab.github.io/llm-course/demos/tokenization/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture.pdf)

**Thursday X-hour:** Text Classification Workshop
- Feature engineering for text classification (bag-of-words, TF-IDF)
- Building classifiers with preprocessing and tokenization pipelines
- Introduction to evaluation metrics
- Hands-on: Explore SPAM classification approaches for Assignment 2
- 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week2/xhour_classification_demo.html)

**Friday (Lecture 7):** POS Tagging & Sentiment Analysis
- Part-of-speech tagging and token classification
- Sentiment analysis techniques
- Statistical learning in infants (connecting to modern NLP)
- Reading: [Linzen et al. (2016)](https://aclanthology.org/Q16-1037/) - LSTMs and Syntax-Sensitive Dependencies
- Reading: [Warstadt et al. (2020)](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00321/96452/) - BLiMP
- Reading: [Saffran et al. (1996)](https://www.science.org/doi/10.1126/science.274.5294.1926) - Statistical learning by infants
- HuggingFace: [Chapter 7.2: Token Classification](https://huggingface.co/learn/nlp-course/chapter7/2)
- **Assignment 2 Released:** [SPAM Classifier](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%202%3A%20SPAM%20classifier) (Due: End of Week 3)
- **📝 Assignment 1 Due**
- 🎮 **Try it:** [POS Tagging](https://contextlab.github.io/llm-course/demos/pos-tagging/) | [Sentiment Analysis](https://contextlab.github.io/llm-course/demos/sentiment/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture.pdf)

---

## Week 3: Text Embeddings I - Classical & Static Methods

**Monday (MLK Day):** NO CLASS - Martin Luther King Jr. Day

**Wednesday (Lecture 8):** Classical Embeddings & Distributional Semantics
- Latent Semantic Analysis (LSA)
- Latent Dirichlet Allocation (LDA)
- "You shall know a word by the company it keeps"
- Reading: [Deerwester et al. (1990)](http://wordvec.colorado.edu/papers/Deerwester_1990.pdf) - LSA
- Reading: [Blei et al. (2003)](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf) - LDA
- Reading: [Boyd-Graber et al. (2014)](https://home.cs.colorado.edu/~jbg/docs/2014_book_chapter_care_and_feeding.pdf) - Care and Feeding of Topic Models
- Reading: [Boleda (2020)](https://arxiv.org/pdf/1905.01896) - Distributional Semantics and Linguistic Theory
- 🎮 **Try it:** [Topic Modeling](https://contextlab.github.io/llm-course/demos/topic-modeling/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3-4/lecture.pdf)

**Thursday X-hour:** From Classical to Modern Embeddings
- Hands-on: Implementing and exploring LSA/LDA (review of Wednesday)
- Introduction: Word2Vec intuition and basic concepts
- Compare: Classical vs. neural embedding approaches
- Preview: Sets up Friday's formal treatment of Word2Vec/GloVe/FastText
- 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week3/xhour_embeddings_demo.html)

**Friday (Lecture 9):** Word Embeddings (Word2Vec, GloVe, FastText)
- Neural word embeddings
- Semantic relationships and analogies
- Reading: [Mikolov et al. (2013a)](https://arxiv.org/abs/1301.3781) - Word2Vec (Efficient Estimation)
- Reading: [Mikolov et al. (2013b)](https://arxiv.org/abs/1310.4546) - Word2Vec (Distributed Representations)
- Reading: [Pennington et al. (2014)](https://aclanthology.org/D14-1162/) - GloVe
- Reading: [Bojanowski et al. (2017)](https://arxiv.org/abs/1607.04606) - FastText
- **📝 Assignment 2 Due**
- 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/) | [Word Analogies](https://contextlab.github.io/llm-course/demos/analogies/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3-4/lecture.pdf)

---

## Week 4: Text Embeddings II - Modern Methods

**Monday (Lecture 10):** Dimensionality Reduction & Modern Topic Models
- PCA and UMAP for visualization
- BERTopic and Top2Vec
- Neural approaches to topic modeling
- Reading: [McInnes & Healy (2018)](https://arxiv.org/pdf/1802.03426) - UMAP
- Reading: [Angelov (2020)](https://arxiv.org/abs/2008.09470) - Top2Vec
- Reading: [Grootendorst (2022)](https://arxiv.org/abs/2203.05794) - BERTopic
- 🎮 **Try it:** [Topic Modeling](https://contextlab.github.io/llm-course/demos/topic-modeling/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3-4/lecture.pdf)

**Wednesday (Lecture 11):** Transformer Embeddings & Semantic Search
- BERT and GPT-2 embeddings
- Sentence-BERT for semantic similarity
- Reading: [Grand et al. (2022)](https://pubmed.ncbi.nlm.nih.gov/35422527/) - Semantic projection from embeddings
- HuggingFace: [Chapter 2.2: Models](https://huggingface.co/learn/nlp-course/chapter2/2)
- HuggingFace: [Chapter 5.6: Semantic Search with FAISS](https://huggingface.co/learn/nlp-course/chapter5/6)
- **Assignment 3 Released:** [Wikipedia Embeddings](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%203%3A%20Wikipedia) (Due: Wednesday, End of Week 4)
- **📝 Assignment 3 Due: Wednesday, End of Week 4**
- 🎮 **Try it:** [Semantic Search](https://contextlab.github.io/llm-course/demos/semantic-search/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3-4/lecture.pdf)

**Friday (Lecture 12):** Evaluation & Clustering
- Comparing embedding methods
- Clustering evaluation metrics
- 🎮 **Try it:** [Embeddings Comparison](https://contextlab.github.io/llm-course/demos/embeddings-comparison/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3-4/lecture.pdf)

---

## Week 5: Transformers & Attention Mechanisms

**Monday (Lecture 13):** Sequence-to-Sequence & Attention
- The evolution from RNNs to attention
- Attention mechanisms explained
- Reading: [Sutskever et al. (2014)](https://arxiv.org/abs/1409.3215) - Seq2Seq
- Reading: [Bahdanau et al. (2015)](https://arxiv.org/abs/1409.0473) - Neural Machine Translation with Attention
- 🎮 **Try it:** [Attention Mechanism](https://contextlab.github.io/llm-course/demos/attention/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5-6/lecture.pdf)

**Wednesday (Lecture 14):** The Transformer Architecture
- Self-attention, multi-head attention
- Positional encodings
- Reading: [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) - Attention is All You Need
- Reading: [Dao et al. (2022)](https://arxiv.org/abs/2205.14135) - FlashAttention
- Reading: [Su et al. (2021)](https://arxiv.org/abs/2104.09864) - RoPE (Rotary Position Embeddings)
- Tutorial: [The Animated Transformer](https://prvnsmpth.github.io/animated-transformer/)
- HuggingFace: [Chapter 1.4: How Transformers Work](https://huggingface.co/learn/nlp-course/chapter1/4)
- 🎮 **Try it:** [Transformer Explorer](https://contextlab.github.io/llm-course/demos/transformer/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5-6/lecture.pdf)

**Friday (Lecture 15):** BERT & Encoder Models
- Bidirectional attention and masked language modeling
- BERT variants (RoBERTa, DistilBERT, ALBERT)
- Reading: [Devlin et al. (2019)](https://arxiv.org/abs/1810.04805) - BERT
- Reading: [Liu et al. (2019)](https://arxiv.org/abs/1907.11692) - RoBERTa
- Reading: [Sanh et al. (2019)](https://arxiv.org/abs/1910.01108) - DistilBERT
- HuggingFace: [Chapter 1.5: Encoder Models](https://huggingface.co/learn/nlp-course/chapter1/5)
- HuggingFace: [Chapter 7.3: Fine-tuning MLM](https://huggingface.co/learn/nlp-course/chapter7/3)
- 🎮 **Try it:** [BERT Masked Language Model](https://contextlab.github.io/llm-course/demos/bert-mlm/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5-6/lecture.pdf)

---

## Week 6: Language Models & The Brain

**Monday (Lecture 16):** Cognitive Neuroscience of Language
- Predictive processing in brains and models
- Neural correlates of language comprehension
- Reading: [Kuperberg & Jaeger (2016)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4850025/) - Prediction in language comprehension
- Reading: [Willems et al. (2016)](https://academic.oup.com/cercor/article/26/6/2506/1754078) - Prediction during comprehension
- Reading: [Hagoort & Indefrey (2014)](https://www.annualreviews.org/content/journals/10.1146/annurev-neuro-071013-013847) - Neurobiology of language
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5-6/lecture.pdf)

**Wednesday (Lecture 17):** Applications & Fine-tuning
- Fine-tuning BERT for downstream tasks
- Practical applications of transformers
- **Assignment 4 Released:** [Customer Service Chatbot](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%204%3A%20Customer%20Service%20Chatbot) (Due: Friday, End of Week 6)
- **📝 Assignment 4 Due: Friday, End of Week 6**
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5-6/lecture.pdf)

**Friday (Lecture 18):** Hackathon / Work Session
- Work on Assignment 4
- Office hours and debugging help

---

## Week 7: Models of Conversation

**⚠️ NO CLASS February 23-27 (Instructor Away)**
- Use asynchronous materials and recordings
- Continue working on Assignment 4

---

## Week 8: GPT & Decoder Models

**Monday (Lecture 19):** Pragmatics, Dialogue, and Common Ground
- Language as action
- Grounding in communication
- Reading: [Clark & Brennan (1991)](https://www.semanticscholar.org/paper/Grounding-in-communication-Clark-Brennan/5a9cac54de14e58697d0315fe3c01f3dbe69c186) - Grounding in communication
- Reading: [Pickering & Garrod (2004)](https://pubmed.ncbi.nlm.nih.gov/15595235/) - Mechanistic psychology of dialogue
- Reading: [Bisk et al. (2020)](https://aclanthology.org/2020.emnlp-main.703/) - Experience Grounds Language
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture.pdf)

**Wednesday (Lecture 20):** GPT Architecture & Evolution
- GPT-1 through GPT-4
- Autoregressive generation
- Reading: [Radford et al. (2018)](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) - GPT-1
- Reading: [Radford et al. (2019)](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) - GPT-2
- Reading: [Brown et al. (2020)](https://arxiv.org/abs/2005.14165) - GPT-3
- Reading: [OpenAI (2023)](https://arxiv.org/abs/2303.08774) - GPT-4 Technical Report
- HuggingFace: [Chapter 1.6: Decoder Models](https://huggingface.co/learn/nlp-course/chapter1/6)
- HuggingFace: [Chapter 7.6: Causal Language Modeling](https://huggingface.co/learn/nlp-course/chapter7/6)
- Tutorial: [Let's build GPT (Karpathy)](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- **Assignment 5 Released:** [Build and Train GPT](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%205%3A%20GPT) (Due: Friday, March 6)
- 🎮 **Try it:** [GPT Playground](https://contextlab.github.io/llm-course/demos/gpt-playground/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture.pdf)

**Friday (Lecture 21):** Language Models & The Brain
- Do models and brains converge?
- Comparing LLM representations to neural activity
- The Turing Test revisited
- Reading: [Schrimpf et al. (2021)](https://www.pnas.org/doi/10.1073/pnas.2105646118) - Neural architecture converges on predictive processing
- Reading: [Caucheteux & King (2022)](https://www.nature.com/articles/s42003-022-03036-1) - Brains and algorithms converge
- Reading: [Hosseini et al. (2024)](https://direct.mit.edu/nol/article/5/1/43/119156/) - ANNs with realistic training
- Reading: [Turing (1950)](https://www.dropbox.com/scl/fi/aflxsbnqua01bl0eh950h/Turi50.pdf?rlkey=7fft5daq3i32vehd4nrm35ii2) - Computing Machinery and Intelligence
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture.pdf)

---

## Week 9: RAG & Advanced Techniques

**Monday (Lecture 22):** Retrieval Augmented Generation
- RAG architecture and applications
- Self-RAG and Corrective RAG
- Reading: [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) - RAG
- Reading: [Asai et al. (2023)](https://arxiv.org/abs/2310.11511) - Self-RAG
- Reading: [Yan et al. (2024)](https://arxiv.org/abs/2401.15884) - Corrective RAG
- HuggingFace: [Agentic RAG](https://huggingface.co/learn/agents-course/unit3/agentic-rag/agentic-rag)
- HuggingFace: [Advanced RAG Tutorial](https://huggingface.co/learn/cookbook/advanced_rag)
- 🎮 **Try it:** [RAG System Demo](https://contextlab.github.io/llm-course/demos/rag/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture.pdf)

**Wednesday (Lecture 23):** Mixture of Experts
- MoE architecture
- Mixtral and modern sparse models
- Reading: [Shazeer et al. (2017)](https://arxiv.org/abs/1701.06538) - Sparsely-Gated MoE
- Reading: [Jiang et al. (2024)](https://arxiv.org/abs/2401.04088) - Mixtral
- HuggingFace: [MoE Explained](https://huggingface.co/blog/moe)
- HuggingFace: [Implementing MoE](https://huggingface.co/blog/AviSoori1x/makemoe-from-scratch)
- **Final Project Released:** [Capstone Research Project](https://github.com/ContextLab/llm-course/tree/main/assignments/Final%20Project) (Due: Monday, March 9)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture.pdf)

**Friday (Lecture 24):** Future of LLMs & Project Formation
- Multimodal models, agents, reasoning
- Self-supervised and contrastive learning
- Final project brainstorming and team formation
- Reading: [Chen et al. (2020)](https://arxiv.org/abs/2002.05709) - SimCLR
- Reading: [Radford et al. (2021)](https://arxiv.org/abs/2103.00020) - CLIP
- **📝 Assignment 5 Due: Friday, March 6**
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture.pdf)

---

## Week 10: Final Project Presentations

**Monday, March 9 (Lecture 25):** Final Project Presentations & Wrap-up
- All teams present their work (videos + discussion)
- Course wrap-up and reflections
- Last day of classes
- **📝 Final Projects Due: Monday, March 9** (all materials submitted before presentations)

---

## Accessing Slides

### GitHub Pages (Recommended)
Slides are hosted on GitHub Pages and available in both PDF and interactive HTML formats:
- **Week 1:**
  - Lecture 1: [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture1.pdf) | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture1.html)
  - Lecture 2: [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture2.pdf) | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture2.html)
  - Lecture 3 (X-hour): [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture3.pdf) | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture3.html)
  - Lecture 4: [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture4.pdf) | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture4.html)
- Week 2: [slides/week2/lecture.pdf](https://contextlab.github.io/llm-course/slides/week2/lecture.pdf)
- Weeks 3-4: [slides/week3-4/lecture.pdf](https://contextlab.github.io/llm-course/slides/week3-4/lecture.pdf)
- Weeks 5-6: [slides/week5-6/lecture.pdf](https://contextlab.github.io/llm-course/slides/week5-6/lecture.pdf)
- Week 7 (no class - instructor away): N/A
- Week 8: [slides/week7/lecture.pdf](https://contextlab.github.io/llm-course/slides/week7/lecture.pdf)
- Week 9: [slides/week9/lecture.pdf](https://contextlab.github.io/llm-course/slides/week9/lecture.pdf)

### Repository Access
Or clone the repository to access all materials locally:
```bash
git clone https://github.com/ContextLab/llm-course.git
cd llm-course/slides
```

---

## Compiling Slides Locally

### Prerequisites

Install a LaTeX distribution:
- **Mac**: [MacTeX](https://www.tug.org/mactex/)
- **Windows**: [MiKTeX](https://miktex.org/) or [TeX Live](https://www.tug.org/texlive/)
- **Linux**: `sudo apt-get install texlive-full` (Debian/Ubuntu)

### Compiling Slides

Navigate to any week's directory and run:

```bash
cd slides/week1
pdflatex lecture.tex
pdflatex lecture.tex  # Run twice for references
```

Or use `xelatex` for better font support:
```bash
xelatex lecture.tex
xelatex lecture.tex
```

Or use `latexmk` for automated compilation:
```bash
latexmk -pdf lecture.tex
```

### Using Overleaf

Alternatively, upload `lecture.tex` to [Overleaf](https://www.overleaf.com/) for cloud-based compilation.

### Troubleshooting

- **Missing packages**: Install the full TeXLive distribution
- **Font errors**: Use `xelatex` instead of `pdflatex`
- **TikZ errors**: Ensure `texlive-latex-extra` is installed

---

## CDL Theme for Marp Slides

Week 1 slides use the [Marp](https://marp.app/) presentation framework with a custom CDL (Contextual Dynamics Lab) theme. The theme provides consistent styling based on the Dartmouth color palette.

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

X-hours will be used in the first 3 weeks to make up for missed class time (Feb 23-27):

- **Week 1 Thursday X-hour (Lecture 3):** ELIZA Implementation
  - ELIZA implementation: decomposition, reassembly, substitutions
  - Vibe coding best practices for building chatbots
  - Assignment 1 kickoff
  - 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week1/xhour_eliza_demo.html)
  - 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week1/lecture3.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week1/lecture3.html)

- **Week 2 Thursday X-hour:** Text Classification Workshop
  - Feature engineering for text classification (bag-of-words, TF-IDF)
  - Building classifiers with preprocessing and tokenization pipelines
  - Introduction to evaluation metrics
  - Hands-on: Explore SPAM classification approaches for Assignment 2
  - 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week2/xhour_classification_demo.html)

- **Week 3 Thursday X-hour:** From Classical to Modern Embeddings
  - Hands-on: Implementing and exploring LSA/LDA (review of Wednesday)
  - Introduction: Word2Vec intuition and basic concepts
  - Compare: Classical vs. neural embedding approaches
  - Preview: Sets up Friday's formal treatment of Word2Vec/GloVe/FastText
  - 📓 [X-hour Notebook](https://contextlab.github.io/llm-course/slides/week3/xhour_embeddings_demo.html)

Remaining X-hours may be used as hackathon time based on class interest.

---

**Questions?** See the [main course README](../README.md) or attend office hours.
