# Week 1: Introduction, String Manipulation

  - Discussion: is ChatGPT conscious?
  - Language vs. thought:
    - Reading: [Fedorenko et al. (2024)](https://www.nature.com/articles/s41586-024-07522-w) - The language network as a natural kind within the broader landscape of the human brain
    - Reading: [Lupyan et al. (2020)](https://doi.org/10.1016/j.tics.2020.08.005) - Effects of language on visual perception
  - Pattern matching and string manipulation
    - Reading: [Weizenbaum (1966)](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf) - ELIZA — A Computer Program For the Study of Natural Language Communication Between Man and Machine
  - **Assignment 1**: [Building the ELIZA Chatbot](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%201%3A%20ELIZA)

# Week 2: Computational Linguistics

  - Data cleaning:
    - Demo: Web scraping with Beautiful Soup
    - Lemmatization
    - Tokenization
      - Reading: [Sennrich et al. (2016)](https://aclanthology.org/P16-1162/) - Neural Machine Translation of Rare Words with Subword Units (BPE)
      - Reading: [Kudo & Richardson (2018)](https://aclanthology.org/D18-2012/) - SentencePiece: A simple and language independent approach
      - HuggingFace: [Chapter 2.4: Behind the Pipeline - Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4)
      - HuggingFace: [Chapter 6: Tokenizers](https://huggingface.co/learn/nlp-course/chapter6)
  - Part of speech tagging
    - HuggingFace: [Chapter 7.2: Token Classification](https://huggingface.co/learn/nlp-course/chapter7/2)
    - Reading: [Linzen et al. (2016)](https://aclanthology.org/Q16-1037/) - Assessing the Ability of LSTMs to Learn Syntax-Sensitive Dependencies
    - Reading: [Warstadt et al. (2020)](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00321/96452/) - BLiMP: The Benchmark of Linguistic Minimal Pairs for English
  - Sentiment analysis
    - HuggingFace: [Chapter 1.2: NLP Tasks with Pipeline](https://huggingface.co/learn/nlp-course/chapter1/2)
    - HuggingFace: [Chapter 3.2: Processing Data for Fine-tuning](https://huggingface.co/learn/nlp-course/chapter3/2)
  - Statistical learning and language acquisition:
    - Reading: [Saffran et al. (1996)](https://www.science.org/doi/10.1126/science.274.5294.1926) - Statistical learning by 8-month-old infants
  - **Assignment 2**: [Build a SPAM email classifier](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%202%3A%20SPAM%20classifier)

# Weeks 3--4: Dimensionality Reduction and Bag-of-words Text Embedding Models

- Principal Components Analysis, Uniform Manifold Approximation and Projection for Dimension Reduction
  - Reading: [McInnes and Healy (2018)](https://arxiv.org/pdf/1802.03426) - UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction
- Distributional semantics: cognitive and linguistic foundations
  - Reading: [Boleda (2020)](https://arxiv.org/pdf/1905.01896) - Distributional Semantics and Linguistic Theory
  - Reading: [Grand et al. (2022)](https://pubmed.ncbi.nlm.nih.gov/35422527/) - Semantic projection recovers rich human knowledge from word embeddings
- Latent Semantic Analysis
  - Reading: [Deerwester et al. (1990)](http://wordvec.colorado.edu/papers/Deerwester_1990.pdf) - Indexing by Latent Semantic Analysis
- Latent Dirichlet Allocation
  - Reading: [Blei et al. (2003)](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf) - Latent Dirichlet Allocation
  - Reading: [Boyd-Graber et al. (2014)](https://home.cs.colorado.edu/~jbg/docs/2014_book_chapter_care_and_feeding.pdf) - The Care and Feeding of Topic Models
- Modern neural topic modeling
  - Reading: [Angelov (2020)](https://arxiv.org/abs/2008.09470) - Top2Vec: Distributed Representations of Topics
  - Reading: [Grootendorst (2022)](https://arxiv.org/abs/2203.05794) - BERTopic: Neural topic modeling with a class-based TF-IDF procedure
- Word2Vec
  - Reading: [Mikolov et al. (2013a)](https://arxiv.org/abs/1301.3781) - Efficient Estimation of Word Representations in Vector Space
  - Reading: [Mikolov et al. (2013b)](https://arxiv.org/abs/1310.4546) - Distributed Representations of Words and Phrases and their Compositionality
- GloVe and FastText
  - Reading: [Pennington et al. (2014)](https://aclanthology.org/D14-1162/) - GloVe: Global Vectors for Word Representation
  - Reading: [Bojanowski et al. (2017)](https://arxiv.org/abs/1607.04606) - Enriching Word Vectors with Subword Information (FastText)
- Transformer-based embeddings (preview)
  - HuggingFace: [Chapter 2.2: Behind the Pipeline - Models](https://huggingface.co/learn/nlp-course/chapter2/2)
  - HuggingFace: [Chapter 5.6: Semantic Search with FAISS](https://huggingface.co/learn/nlp-course/chapter5/6)
- **Assignment 3**: [Modeling the structure and organization of Wikipedia](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%203%3A%20Wikipedia)

# Weeks 5--6: Context-Aware models
- Sequence-to-sequence models and attention mechanisms
  - Reading: [Sutskever et al. (2014)](https://arxiv.org/abs/1409.3215) - Sequence to Sequence Learning with Neural Networks
  - Reading: [Bahdanau et al. (2015)](https://arxiv.org/abs/1409.0473) - Neural Machine Translation by Jointly Learning to Align and Translate
- The Transformer architecture
  - Reading: [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) - Attention is All You Need
  - Reading: [Dao et al. (2022)](https://arxiv.org/abs/2205.14135) - FlashAttention: Fast and Memory-Efficient Exact Attention
  - Reading: [Su et al. (2021)](https://arxiv.org/abs/2104.09864) - RoFormer: Enhanced Transformer with Rotary Position Embedding
  - Tutorial: [The Animated Transformer](https://prvnsmpth.github.io/animated-transformer/)
  - HuggingFace: [Chapter 1.4: How Transformers Work](https://huggingface.co/learn/nlp-course/chapter1/4)
- BERT: Bidirectional Encoder Representations from Transformers
  - Reading: [Devlin et al. (2019)](https://arxiv.org/abs/1810.04805) - BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
  - Reading: [Liu et al. (2019)](https://arxiv.org/abs/1907.11692) - RoBERTa: A Robustly Optimized BERT Pretraining Approach
  - Reading: [Sanh et al. (2019)](https://arxiv.org/abs/1910.01108) - DistilBERT: smaller, faster, cheaper and lighter
  - HuggingFace: [Chapter 1.5: Encoder Models](https://huggingface.co/learn/nlp-course/chapter1/5)
  - HuggingFace: [Chapter 7.3: Fine-tuning a Masked Language Model](https://huggingface.co/learn/nlp-course/chapter7/3)
- Cognitive neuroscience of language comprehension
  - Reading: [Kuperberg & Jaeger (2016)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4850025/) - What do we mean by prediction in language comprehension?
  - Reading: [Willems et al. (2016)](https://academic.oup.com/cercor/article/26/6/2506/1754078) - Prediction During Natural Language Comprehension
  - Reading: [Hagoort & Indefrey (2014)](https://www.annualreviews.org/content/journals/10.1146/annurev-neuro-071013-013847) - The neurobiology of language beyond single words
- **Assignment 4**: [Build a context-aware customer service chatbot](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%204%3A%20Customer%20Service%20Chatbot)

# Week 7: Models of Conversation
- Discussion: what is language and what is it "used" for?
- Pragmatics and dialogue
  - Reading: [Clark & Brennan (1991)](https://www.semanticscholar.org/paper/Grounding-in-communication-Clark-Brennan/5a9cac54de14e58697d0315fe3c01f3dbe69c186) - Grounding in communication
  - Reading: [Pickering & Garrod (2004)](https://pubmed.ncbi.nlm.nih.gov/15595235/) - Toward a mechanistic psychology of dialogue
  - Reading: [Bisk et al. (2020)](https://aclanthology.org/2020.emnlp-main.703/) - Experience Grounds Language
- Thought trajectories
  - Reading: [Heusser et al. (2021)](https://www.dropbox.com/s/jec5q2r2f2d02wv/HeusEtal21.pdf)
  - Reading: [Manning (2021)](https://www.dropbox.com/s/7873vuevillrbze/Mann21.pdf)
- Demo: ConvoKit
- Positional coding, context, and memory
  - Reading: [Manning (2023)](https://www.dropbox.com/scl/fi/9amk5mlgeop0srtpwqesg/Mann23.pdf?rlkey=lc785xhq1pcjqdtarn692e21k)
- Language comprehension and inference
  - Reading: [Graesser et al. (1994)](https://www.researchgate.net/publication/15261574_Constructing_Inferences_During_Narrative_Text_Comprehension) - Constructing Inferences during Narrative Text Comprehension
  - Reading: [Tanenhaus et al. (1995)](https://www.science.org/doi/10.1126/science.7777863) - Integration of visual and linguistic information in spoken language comprehension

# Week 8: Generative Pretrained Transformers
- GPT architecture and evolution
  - Reading: [Radford et al. (2018)](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) - Improving Language Understanding by Generative Pre-Training (GPT-1)
  - Reading: [Radford et al. (2019)](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) - Language Models are Unsupervised Multitask Learners (GPT-2)
  - Reading: [Brown et al. (2020)](https://arxiv.org/abs/2005.14165) - Language Models are Few-Shot Learners (GPT-3)
  - Reading: [OpenAI (2023)](https://arxiv.org/abs/2303.08774) - GPT-4 Technical Report
  - HuggingFace: [Chapter 1.6: Decoder Models](https://huggingface.co/learn/nlp-course/chapter1/6)
  - HuggingFace: [Chapter 7.6: Causal Language Modeling](https://huggingface.co/learn/nlp-course/chapter7/6)
  - Tutorial video: [Let's build GPT: from scratch, in code, spelled out](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- Modern open-source LLMs
  - Reading: [Touvron et al. (2023)](https://arxiv.org/abs/2302.13971) - LLaMA: Open and Efficient Foundation Language Models
  - Reading: [Llama Team (2024)](https://arxiv.org/abs/2407.21783) - The Llama 3 Herd of Models
- Language models and the brain
  - Reading: [Schrimpf et al. (2021)](https://www.pnas.org/doi/10.1073/pnas.2105646118) - The neural architecture of language: Integrative modeling converges on predictive processing
  - Reading: [Caucheteux & King (2022)](https://www.nature.com/articles/s42003-022-03036-1) - Brains and algorithms partially converge in natural language processing
  - Reading: [Hosseini et al. (2024)](https://direct.mit.edu/nol/article/5/1/43/119156/) - ANNs predict human brain responses to language even after developmentally realistic training
- Discussion: the Turing test and ChatGPT
  - Reading: [Turing (1950)](https://www.dropbox.com/scl/fi/aflxsbnqua01bl0eh950h/Turi50.pdf?rlkey=7fft5daq3i32vehd4nrm35ii2)
- **Assignment 5**: [Build and train a GPT model](https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%205%3A%20GPT)

# Week 9: Retrieval Augmented Generation and Mixture of Experts Models
- Retrieval Augmented Generation
  - Reading: [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) - Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
  - Reading: [Asai et al. (2023)](https://arxiv.org/abs/2310.11511) - Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection
  - Reading: [Yan et al. (2024)](https://arxiv.org/abs/2401.15884) - Corrective Retrieval Augmented Generation
  - HuggingFace: [Agents Course - Agentic RAG](https://huggingface.co/learn/agents-course/unit3/agentic-rag/agentic-rag)
  - HuggingFace: [Advanced RAG Tutorial](https://huggingface.co/learn/cookbook/advanced_rag)
- Mixture of Experts Models
  - Reading: [Shazeer et al. (2017)](https://arxiv.org/abs/1701.06538) - Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer
  - Reading: [Jiang et al. (2024)](https://arxiv.org/abs/2401.04088) - Mixtral of Experts
  - HuggingFace: [Mixture of Experts Explained](https://huggingface.co/blog/moe)
  - HuggingFace: [Implementing MoE from Scratch](https://huggingface.co/blog/AviSoori1x/makemoe-from-scratch)
- Self-supervised learning and contrastive methods
  - Reading: [Chen et al. (2020)](https://arxiv.org/abs/2002.05709) - A Simple Framework for Contrastive Learning of Visual Representations (SimCLR)
  - Reading: [Radford et al. (2021)](https://arxiv.org/abs/2103.00020) - Learning Transferable Visual Models From Natural Language Supervision (CLIP)
- Discussion: What's next for large language models?
- Discussion: final project ideas and team formation
- **Assignment 6**: [Final Project](https://github.com/ContextLab/llm-course/tree/main/assignments/Final%20Project)

# Week 10: Final project presentations
- Discussion: ad-hoc discussions and demos about final projects
- **Final projects are due on the last day of class at 11:59PM Eastern Time**