# Course Slides - Models of Language and Communication

This directory contains lecture slides for all 10 weeks of the course. Weeks 1-2 have **4 lectures** (M/W/X-hour/F), weeks 3-7 and 9 have **3 lectures** (M/W/F, with X-hour in week 3), week 8 is off, and week 10 has final presentations. Slides are provided in both PDF and web-viewable HTML formats.

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
- Reading: [Colby et al. (1971)](https://doi.org/10.1016/S0004-3702(71)80014-6) - Artificial Paranoia (PARRY)
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

**Friday (Lecture 8):** POS Tagging & Sentiment Analysis
- Part-of-speech tagging and token classification
- Sentiment analysis techniques
- Statistical learning in infants (connecting to modern NLP)
- Reading: [Linzen et al. (2016)](https://aclanthology.org/Q16-1037/) - LSTMs and Syntax-Sensitive Dependencies
- Reading: [Warstadt et al. (2020)](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00321/96452/) - BLiMP
- Reading: [Saffran et al. (1996)](https://www.science.org/doi/10.1126/science.274.5294.1926) - Statistical learning by infants
- HuggingFace: [Chapter 7.2: Token Classification](https://huggingface.co/learn/nlp-course/chapter7/2)
- **Assignment 2 Released:** [SPAM Classifier](https://contextlab.github.io/llm-course/assignments/assignment-2/) (Due: Jan 26, 11:59 PM EST)
- 🎮 **Try it:** [POS Tagging](https://contextlab.github.io/llm-course/demos/pos-tagging/) | [Sentiment Analysis](https://contextlab.github.io/llm-course/demos/sentiment/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week2/lecture8.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week2/lecture8.html)

---

## Week 3: Text Embeddings I - Classical & Static Methods

**Monday (MLK Day)**: NO CLASS - Martin Luther King Jr. Day
- **📝 Assignment 1 Due (Jan 19, 11:59 PM EST)**

**Wednesday (Lecture 9):** Classical Embeddings & Distributional Semantics
- Latent Semantic Analysis (LSA)
- Latent Dirichlet Allocation (LDA)
- "You shall know a word by the company it keeps"
- Reading: [Deerwester et al. (1990)](http://wordvec.colorado.edu/papers/Deerwester_1990.pdf) - LSA
- Reading: [Blei et al. (2003)](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf) - LDA
- Reading: [Boyd-Graber et al. (2014)](https://home.cs.colorado.edu/~jbg/docs/2014_book_chapter_care_and_feeding.pdf) - Care and Feeding of Topic Models
- Reading: [Boleda (2020)](https://arxiv.org/pdf/1905.01896) - Distributional Semantics and Linguistic Theory
- 🎮 **Try it:** [Topic Modeling](https://contextlab.github.io/llm-course/demos/topic-modeling/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture9.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture9.html)

**Thursday X-hour (Lecture 10):** Embeddings Workshop
- Hands-on: Implementing and exploring LSA/LDA (review of Wednesday)
- Introduction: Word2Vec intuition and basic concepts
- Compare: Classical vs. neural embedding approaches
- Preview: Sets up Friday's formal treatment of Word2Vec/GloVe/FastText
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture10.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture10.html)

**Friday (Lecture 11):** Word Embeddings (Word2Vec, GloVe, FastText)
- Neural word embeddings
- Semantic relationships and analogies
- Reading: [Mikolov et al. (2013a)](https://arxiv.org/abs/1301.3781) - Word2Vec (Efficient Estimation)
- Reading: [Mikolov et al. (2013b)](https://arxiv.org/abs/1310.4546) - Word2Vec (Distributed Representations)
- Reading: [Pennington et al. (2014)](https://aclanthology.org/D14-1162/) - GloVe
- Reading: [Bojanowski et al. (2017)](https://arxiv.org/abs/1607.04606) - FastText
- **Assignment 3 Released:** [Wikipedia Embeddings](https://contextlab.github.io/llm-course/assignments/assignment-3/) (Due: Feb 2, 11:59 PM EST)
- 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/) | [Word Analogies](https://contextlab.github.io/llm-course/demos/analogies/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week3/lecture11.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week3/lecture11.html)

---

## Week 4: Text Embeddings II - Modern Methods

**Monday (Lecture 12):** Contextual Embeddings
- ELMo and contextual representations
- Universal Sentence Encoder
- **📝 Assignment 2 Due (Jan 26, 11:59 PM EST)**
- Reading: [Peters et al. (2018)](https://aclanthology.org/N18-1202/) - ELMo
- Reading: [Cer et al. (2018)](https://arxiv.org/abs/1803.11175) - USE
- 🎮 **Try it:** [Semantic Search](https://contextlab.github.io/llm-course/demos/semantic-search/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture12.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture12.html)

**Wednesday (Lecture 13):** Dimensionality Reduction
- PCA and UMAP for visualization
- Reading: [McInnes & Healy (2018)](https://arxiv.org/pdf/1802.03426) - UMAP
- 🎮 **Try it:** [Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture13.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture13.html)

**Friday (Lecture 14):** Cognitive Models of Semantic Representation
- Reading: [Anderson et al. (2016)](https://www.jneurosci.org/content/36/45/11444)
- **Assignment 4 Released:** [Customer Service Chatbot](https://contextlab.github.io/llm-course/assignments/assignment-4/) (Due: Feb 9, 11:59 PM EST)
- 🎮 **Try it:** [Embeddings Comparison](https://contextlab.github.io/llm-course/demos/embeddings-comparison/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week4/lecture14.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week4/lecture14.html)

---

## Week 5: Transformers & Attention Mechanisms

**Monday (Lecture 15):** Attention Mechanisms
- The evolution from RNNs to attention
- Attention mechanisms explained
- **📝 Assignment 3 Due (Feb 2, 11:59 PM EST)**
- Reading: [Bahdanau et al. (2015)](https://arxiv.org/abs/1409.0473) - Neural Machine Translation with Attention
- Reading: [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) - Attention is All You Need
- 🎮 **Try it:** [Attention Mechanism](https://contextlab.github.io/llm-course/demos/attention/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture15.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture15.html)

**Wednesday (Lecture 16):** Transformer Architecture
- Self-attention, multi-head attention
- Positional encodings
- Reading: [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) - Attention is All You Need
- HuggingFace: [Chapter 3](https://huggingface.co/learn/nlp-course/chapter3)
- 🎮 **Try it:** [Transformer Explorer](https://contextlab.github.io/llm-course/demos/transformer/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture16.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture16.html)

**Friday (Lecture 17):** Training Transformers
- **Assignment 5 Released:** [Build GPT](https://contextlab.github.io/llm-course/assignments/assignment-5/) (Due: Feb 16, 11:59 PM EST)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week5/lecture17.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week5/lecture17.html)
---

## Week 6: Encoder Models (BERT)

**Monday (Lecture 18):** BERT Deep Dive
- Bidirectional attention and masked language modeling
- **📝 Assignment 4 Due (Feb 9, 11:59 PM EST)**
- Reading: [Devlin et al. (2019)](https://aclanthology.org/N19-1423/) - BERT
- HuggingFace: [Chapter 4](https://huggingface.co/learn/nlp-course/chapter4)
- 🎮 **Try it:** [BERT Masked Language Model](https://contextlab.github.io/llm-course/demos/bert-mlm/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture18.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture18.html)

**Wednesday (Lecture 19):** BERT Variants
- RoBERTa, DistilBERT, ALBERT
- Reading: [Liu et al. (2019)](https://arxiv.org/abs/1907.11692) - RoBERTa
- Reading: [Sanh et al. (2019)](https://arxiv.org/abs/1910.01108) - DistilBERT
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture19.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture19.html)

**Friday (Lecture 20):** Applications of Encoder Models
- **Final Project Released:** [Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) (Due: Mar 9, 11:59 PM EST)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week6/lecture20.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week6/lecture20.html)
---

## Week 7: Decoder Models & GPT

**Monday (Lecture 21):** GPT Architecture
- Autoregressive generation
- **📝 Assignment 5 Due (Feb 16, 11:59 PM EST)**
- Reading: [Radford et al. (2018)](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) - GPT-1
- Reading: [Radford et al. (2019)](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) - GPT-2
- 🎮 **Try it:** [GPT Playground](https://contextlab.github.io/llm-course/demos/gpt-playground/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture21.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture21.html)

**Wednesday (Lecture 22):** Scaling Up to GPT-3 and Beyond
- Reading: [Brown et al. (2020)](https://arxiv.org/abs/2005.14165) - GPT-3
- Reading: [OpenAI (2023)](https://arxiv.org/abs/2303.08774) - GPT-4 Technical Report
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture22.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture22.html)

**Friday (Lecture 23):** Implementing GPT from Scratch
- Tutorial: [Let's build GPT (Karpathy)](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week7/lecture23.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week7/lecture23.html)
---

## Week 8: No Classes

**⚠️ NO CLASS February 23-27 (Instructor Away)**
- Use this time to work on your final project

---

## Week 9: Advanced Topics

**Monday (Lecture 24):** Retrieval Augmented Generation (RAG)
- RAG architecture and applications
- Reading: [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) - RAG
- 🎮 **Try it:** [RAG System Demo](https://contextlab.github.io/llm-course/demos/rag/)
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture24.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture24.html)

**Wednesday (Lecture 25):** Mixture of Experts & Efficiency
- MoE architecture, Mixtral
- Reading: [Fedus et al. (2022)](https://arxiv.org/abs/2101.03961) - Switch Transformers
- Reading: [Jiang et al. (2024)](https://arxiv.org/abs/2401.04088) - Mixtral
- 📊 [Slides PDF](https://contextlab.github.io/llm-course/slides/week9/lecture25.pdf) | 🌐 [Slides HTML](https://contextlab.github.io/llm-course/slides/week9/lecture25.html)

**Friday (Lecture 26):** Ethics, Bias, and Safety
- Reading: [Bender et al. (2021)](https://dl.acm.org/doi/10.1145/3442188.3445922) - Stochastic Parrots
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

X-hours will be used in the first 3 weeks to make up for missed class time (Feb 23-27):

- **Week 1 Thursday X-hour (Lecture 3):** ELIZA Implementation
  - ELIZA implementation: decomposition, reassembly, substitutions
  - Vibe coding best practices for building chatbots
  - Assignment 1 preview (released Friday)
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
