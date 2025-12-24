# Assignment 3: Representing Meaning - A Computational Exploration of Semantic Space

## Overview

**"You shall know a word by the company it keeps."** - J.R. Firth, 1957

In this assignment, you will embark on a deep exploration of how machines represent meaning. Working with 250,000 Wikipedia articles, you will implement and compare methods spanning five decades of computational linguistics and natural language processing - from classical statistical techniques to modern large language models.

This assignment asks fundamental questions: What does it mean to "understand" the meaning of a document? How do different computational approaches capture semantic relationships? What aspects of human semantic knowledge can be modeled through distributional representations? Which methods best capture the conceptual structure of human knowledge as encoded in Wikipedia?

You will implement ~10 different embedding methods, perform sophisticated quantitative and qualitative analyses, create beautiful interactive visualizations, and connect your findings to theories of meaning in cognitive science and linguistics. This is a substantial, 2-week assignment that will deepen your understanding of how we represent and compute with meaning.

## Dataset

You can automatically download the dataset from Dropbox if it doesn't already exist in your working directory. The following code will handle downloading the dataset, checking if it's present, and loading it into your notebook:

```python
import os
import urllib.request
import pickle

# Define the file name and URL
dataset_url = 'https://www.dropbox.com/s/v4juxkc5v2rd0xr/wikipedia.pkl?dl=1'
dataset_path = 'wikipedia.pkl'

# Download the dataset if it doesn't exist
if not os.path.exists(dataset_path):
    print("Downloading dataset...")
    urllib.request.urlretrieve(dataset_url, dataset_path)
    print("Download complete.")

# Load the dataset
with open(dataset_path, 'rb') as f:
    wikipedia = pickle.load(f)
```

The dataset is formatted as a `list` of dictionary (`dict`) objects, each with the following keys/values:
- **'title'**: The title of the article (string).
- **'text'**: The full text of the article (string).
- **'id'**: A unique identifier for the article (string).
- **'url'**: The link to the Wikipedia page (string).

There are 250K articles in all, randomly selected from [this dataset](https://huggingface.co/datasets/legacy-datasets/wikipedia).


## Learning Objectives

By completing this assignment, you will:
- Understand the evolution of semantic representation from classical to modern NLP
- Implement and compare traditional, neural, and LLM-based embedding methods
- Develop expertise in clustering evaluation and unsupervised learning
- Connect computational methods to cognitive theories of semantic memory
- Create publication-quality visualizations of high-dimensional semantic spaces
- Think critically about what different methods capture (and miss) about meaning

---

## Part 1: Implementing the Embedding Zoo (40 points)

### Task 1.1: Classical Statistical Methods (8 points)

Implement two foundational approaches from classical NLP:

**Latent Semantic Analysis (LSA)**
- Use TF-IDF followed by truncated SVD (dimensionality reduction)
- Implementation: `sklearn.feature_extraction.text.TfidfVectorizer` + `sklearn.decomposition.TruncatedSVD`
- Reduce to 300 dimensions
- Resources: [Original LSA paper (Deerwester et al., 1990)](https://www.cs.bham.ac.uk/~pxt/IDA/lsa_ind_ar_02.pdf)

**Latent Dirichlet Allocation (LDA)**
- Classic probabilistic topic model
- Implementation: `sklearn.decomposition.LatentDirichletAllocation`
- Use 50-100 topics (experiment with different values)
- Resources: [Original LDA paper (Blei et al., 2003)](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf)

**Key questions to explore:**
- What do the LSA dimensions represent? What about LDA topics?
- How interpretable are the resulting representations?
- Do these methods capture syntactic or semantic relationships better?

### Task 1.2: Static Word Embeddings (8 points)

Implement three influential neural word embedding methods, aggregating word vectors to create document embeddings:

**Word2Vec**
- Use pre-trained `word2vec-google-news-300` from `gensim`
- Aggregate word vectors (try: mean, TF-IDF weighted mean, max pooling)
- Resources: [Efficient Estimation of Word Representations (Mikolov et al., 2013)](https://arxiv.org/abs/1301.3781)

**GloVe**
- Use pre-trained `glove-wiki-gigaword-300` from `gensim`
- Aggregate word vectors using same methods as Word2Vec
- Resources: [GloVe: Global Vectors (Pennington et al., 2014)](https://nlp.stanford.edu/pubs/glove.pdf)

**FastText**
- Use pre-trained `fasttext-wiki-news-subwords-300` from `gensim`
- Aggregate word vectors; FastText handles OOV words through subword embeddings
- Resources: [Enriching Word Vectors with Subword Information (Bojanowski et al., 2017)](https://arxiv.org/abs/1607.04606)

**Implementation notes:**
- For each method, experiment with different aggregation strategies
- Compare simple averaging vs. TF-IDF weighted averaging
- Handle articles longer than typical context windows appropriately

### Task 1.3: Contextualized Embeddings (8 points)

Implement transformer-based embeddings that capture context:

**BERT**
- Use `bert-base-uncased` from Hugging Face Transformers
- Extract embeddings from the [CLS] token or mean pool over all tokens
- Handle long documents with sliding windows or truncation
- Resources: [BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al., 2019)](https://arxiv.org/abs/1810.04805)

**GPT-2**
- Use `gpt2` from Hugging Face Transformers
- Extract embeddings from final token or mean pool
- Compare different pooling strategies
- Resources: [Language Models are Unsupervised Multitask Learners (Radford et al., 2019)](https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)

**Key questions:**
- How do contextualized embeddings differ from static ones?
- What information do [CLS] tokens capture?
- How does truncation affect representation quality?

### Task 1.4: Modern Sentence/Document Embeddings (8 points)

Implement state-of-the-art embedding methods designed specifically for sentences and documents:

**Sentence Transformers**
- Use `all-MiniLM-L6-v2` or `all-mpnet-base-v2` from `sentence-transformers`
- These are fine-tuned specifically for semantic similarity
- Resources: [Sentence-BERT (Reimers & Gurevych, 2019)](https://arxiv.org/abs/1908.10084)

**Llama 3 Embeddings**
- Use Llama 3 8B via `llm2vec` or similar embedding adapter
- Alternative: Use Llama 3 hidden states directly
- Resources: [LLM2Vec paper](https://arxiv.org/abs/2404.05961)

**Key questions:**
- Why are sentence transformers better for semantic similarity?
- How do LLM embeddings compare to smaller, specialized models?
- What's the trade-off between model size and embedding quality?

### Task 1.5: Modern Topic Models (8 points)

Implement neural topic models that combine traditional topic modeling with modern embeddings:

**BERTopic**
- Uses BERT embeddings + UMAP + HDBSCAN for topic discovery
- Implementation: `bertopic` library
- Analyze discovered topics and their coherence
- Resources: [BERTopic documentation](https://maartengr.github.io/BERTopic/)

**Top2Vec**
- Jointly learns document and word embeddings with topic vectors
- Implementation: `top2vec` library
- Compare topic quality with BERTopic and classical LDA
- Resources: [Top2Vec paper (Angelov, 2020)](https://arxiv.org/abs/2008.09470)

**Key questions:**
- How do neural topic models differ from LDA?
- Are the discovered topics more coherent? More diverse?
- Can you validate topics against known Wikipedia categories?

**Deliverable for Part 1:**
- Implementation of all 10+ embedding methods
- For each method: clear documentation of hyperparameters chosen
- Analysis of computational cost (time, memory) for each method
- Embeddings saved in a consistent format for downstream analysis

---

## Part 2: Sophisticated Evaluation and Analysis (30 points)

### Task 2.1: Clustering with Multiple Algorithms (10 points)

For each embedding method, apply multiple clustering algorithms:

**K-Means Clustering**
- Determine optimal k using: elbow method, silhouette analysis, gap statistic
- Compare different initialization strategies (k-means++, random)
- Implementation: `sklearn.cluster.KMeans`

**Hierarchical Clustering**
- Use agglomerative clustering with different linkage methods (ward, average, complete)
- Create dendrograms to visualize cluster relationships
- Implementation: `sklearn.cluster.AgglomerativeClustering`, `scipy.cluster.hierarchy`

**Density-Based Clustering (DBSCAN/HDBSCAN)**
- Automatically discover clusters without specifying k
- Handle noise and outliers
- Implementation: `sklearn.cluster.DBSCAN`, `hdbscan`

**Deliverable:**
- Systematic comparison of clustering results across methods
- Justification for final clustering choices for each embedding type
- Analysis: Do different embeddings suggest different optimal numbers of clusters?

### Task 2.2: Quantitative Evaluation Metrics (8 points)

Implement comprehensive metrics to evaluate embedding and clustering quality:

**Clustering Quality Metrics**
- Silhouette Score: measures cluster cohesion and separation
- Davies-Bouldin Index: ratio of within-cluster to between-cluster distances
- Calinski-Harabasz Index: ratio of between-cluster to within-cluster variance
- Dunn Index: ratio of minimum inter-cluster to maximum intra-cluster distance

**Embedding Quality Metrics**
- Intrinsic dimensionality: estimate effective dimensionality using PCA explained variance
- Local structure preservation: compare nearest neighbors before/after embedding
- Global structure preservation: correlation between distance matrices
- Isotropy: measure how uniformly embeddings fill the space

**Semantic Coherence Metrics**
- Topic coherence (for topic models): PMI, C_v, U_mass coherence scores
- Within-cluster semantic similarity: average cosine similarity within clusters
- Between-cluster semantic distance: separation of cluster centroids

**Deliverable:**
- Table comparing all embedding methods across all metrics
- Statistical significance testing (e.g., bootstrap confidence intervals)
- Radar/spider plots showing relative strengths of different methods
- Discussion: Which metrics matter most for this task?

### Task 2.3: Qualitative Analysis (6 points)

Go beyond numbers to understand what each method captures:

**Cluster Interpretation**
- For each embedding method, examine the top clusters
- Sample representative articles from each cluster
- Use Llama 3 via Ollama to generate descriptive labels for clusters
- Compare cluster interpretability across methods

**Error Analysis**
- Identify articles that are consistently mis-clustered across methods
- Find articles where different methods disagree strongly
- Analyze: what makes these articles difficult?

**Semantic Relationships**
- Use nearest neighbor search to find similar articles
- Compare: do different methods find different "neighbors"?
- Analyze specific examples (e.g., "Machine Learning" article - what's nearby?)

**Analogical Reasoning**
- Test if embeddings support analogies (e.g., "Paris:France :: London:?")
- Compare methods on capturing different relationship types (geographic, categorical, temporal)

**Deliverable:**
- Cluster labels for top 20 clusters from best-performing methods
- Case studies of interesting articles/clusters
- Analysis of what different embedding types capture (syntax vs. semantics, topics vs. style, etc.)

### Task 2.4: Cross-Method Comparison (6 points)

Directly compare embedding methods:

**Embedding Similarity Analysis**
- Compute correlation between distance matrices of different methods
- Use Mantel test for significance
- Create similarity matrix: which methods produce most similar embeddings?

**Consensus Clustering**
- Where do different methods agree on cluster assignments?
- Use co-association matrix to find robust clusters
- Identify method-specific vs. universal structure

**Performance vs. Cost Trade-offs**
- Plot quality metrics vs. computational cost (time, memory, CO2)
- Identify the "Pareto frontier" of methods
- Recommendation: which method for which use case?

**Deliverable:**
- Comprehensive comparison table/visualization
- Discussion of method families (classical vs. neural vs. LLM)
- Recommendations with justification

---

## Part 3: Advanced Clustering and Visualization (15 points)

### Task 3.1: Multi-Level Clustering (5 points)

Explore hierarchical structure in the Wikipedia knowledge space:

**Hierarchical Clustering Analysis**
- Create multi-level hierarchies (e.g., Science → Physics → Quantum Mechanics)
- Use recursive clustering or hierarchical agglomerative methods
- Validate against Wikipedia's actual category structure (if available)

**Dendrogram Analysis**
- Create informative dendrograms showing cluster relationships
- Color-code by major categories
- Interactive dendrograms with Plotly

**Deliverable:**
- Multi-level cluster hierarchy for best-performing method
- Visualization of cluster relationships
- Analysis: Does the automatic hierarchy match human organization?

### Task 3.2: Interactive Visualization (10 points)

Create publication-quality, interactive visualizations:

**Dimensionality Reduction for Visualization**
- Apply both UMAP and t-SNE to reduce embeddings to 2D and 3D
- Compare: how do the visualizations differ? Which preserves structure better?
- Experiment with hyperparameters (perplexity for t-SNE, n_neighbors for UMAP)

**Interactive Plotly Visualizations**

For each major embedding method, create:

1. **3D Interactive Scatter Plot**
   - Each point is an article
   - Color by cluster assignment
   - Size by article length or importance (e.g., page views)
   - Hover: show article title, cluster label, and snippet
   - Enable rotation, zoom, selection

2. **2D Hexbin Density Plot**
   - Show density of articles in embedding space
   - Overlay cluster boundaries
   - Interactive region selection

3. **Cluster Comparison View**
   - Side-by-side comparison of same data in different embedding spaces
   - Linked selections (select in one, highlight in others)
   - Show how cluster assignments change

**Advanced Visualizations**
- Embedding space "map" with topic regions labeled
- Trajectory visualization (if exploring temporal data)
- Network graph of nearest neighbors
- Confusion matrix of cluster assignments across methods

**Deliverable:**
- At least 5 high-quality interactive Plotly visualizations
- Comparison of t-SNE vs. UMAP for this dataset
- Insights discovered through visualization
- Embedded visualizations in notebook with clear captions

---

## Part 4: Cognitive Science Connection (10 points)

### Task 4.1: Distributional Semantics Theory (4 points)

Connect your computational work to theories of meaning:

**Theoretical Foundations**
- Explain the distributional hypothesis and its cognitive plausibility
- Discuss: How do computational embeddings relate to human semantic memory?
- Compare to theories: semantic networks, feature-based semantics, prototype theory

**Empirical Connection**
- Compare embedding similarities to human similarity judgments
  - Use datasets like SimLex-999, WordSim-353, or create your own
  - Compute correlation between embedding cosine similarity and human ratings
- Compare cluster structure to human categorization
  - Do the discovered clusters match human category boundaries?

**Deliverable:**
- Essay-style section (2-3 pages) connecting your work to cognitive science
- Quantitative comparison to human judgments
- Discussion: What do embeddings capture about human semantics? What do they miss?

### Task 4.2: What Is Meaning? (6 points)

Critically analyze what different methods capture:

**Philosophical Analysis**
- What notion of "meaning" does each method operationalize?
- Distinguish: sense vs. reference, intension vs. extension, connotation vs. denotation
- Discuss: Can meaning be reduced to distribution? What's missing?

**Comparative Semantics**
- Show concrete examples where methods disagree
- Analyze: When is LSA better than BERT? When is LDA better than BERTopic?
- Discuss: Compositionality - how well do methods handle phrases and documents?

**Limitations and Biases**
- What biases are baked into different embedding methods?
- How do corpus choice and size affect representations?
- Discuss the "Chinese Room" argument in the context of embeddings

**Deliverable:**
- Thoughtful analysis (2-3 pages) of what "meaning" means in your models
- Case studies showing different methods' strengths/weaknesses
- Reflection on the limits of distributional semantics

---

## Part 5: Advanced Extensions and Applications (5 points)

Choose at least ONE of the following extensions:

### Option A: Cross-Lingual Embeddings

**Implementation:**
- Use multilingual models (mBERT, XLM-R, LaBSE)
- Compare same concepts across languages
- Test: Do "Machine Learning" in English and "Apprentissage Automatique" in French cluster together?

**Analysis:**
- Evaluate cross-lingual alignment quality
- Identify language-specific vs. universal concepts
- Application: cross-lingual information retrieval

### Option B: Temporal Analysis

**Implementation:**
- If dataset has timestamps, analyze how topics evolve over time
- Use dynamic topic models or time-sliced embeddings
- Track: How has "AI" or "Climate Change" evolved in Wikipedia?

**Analysis:**
- Visualize concept drift over time
- Identify emerging vs. declining topics
- Connect to real-world events

### Option C: Practical Applications

Implement at least one real-world application:

**Semantic Search Engine**
- Given a query, find most relevant articles using embedding similarity
- Compare search quality across embedding methods
- Evaluation: NDCG, precision@k, user study

**Recommendation System**
- "Articles similar to this one" feature
- Diversity-aware recommendations (not all from same cluster)
- Evaluation: coverage, diversity, serendipity

**Automatic Summarization/Labeling**
- Use LLMs to generate cluster descriptions
- Create Wikipedia "portals" automatically
- Evaluation: human judgment of quality

**Knowledge Graph Construction**
- Extract relationships between articles from embedding space
- Build graph: nodes = articles, edges = strong semantic similarity
- Analysis: community detection, centrality measures

**Deliverable for Part 5:**
- Full implementation of chosen extension
- Evaluation demonstrating value
- Discussion of how it enhances understanding of semantic representations

---

## Submission Guidelines

Submit a **Google Colaboratory notebook** (or Jupyter notebook) that includes:

### Technical Requirements

1. **Reproducibility**
   - All code necessary to download datasets and models
   - Clear installation instructions for required packages
   - Random seeds set for reproducibility
   - Must run in Google Colab with GPU runtime (T4 or better)
   - Estimated runtime: 2-4 hours for full notebook

2. **Organization**
   - Clear section headers matching assignment parts
   - Table of contents with navigation links
   - Markdown cells explaining approach, decisions, and insights
   - Code comments for complex operations
   - Summary sections after each major part

3. **Outputs**
   - All visualizations embedded in notebook
   - Tables and metrics clearly formatted
   - Long outputs (model training) can be summarized
   - Save embeddings to files to avoid recomputation

4. **Writing Quality**
   - Clear, concise explanations
   - Proper citations for papers and methods
   - Academic writing style for analysis sections
   - Proofread for grammar and clarity

### What to Submit

1. **Primary Deliverable**: Google Colab notebook link (ensure sharing is enabled)
2. **Optional**: Saved embeddings and models (via Google Drive link)
3. **Optional**: Standalone HTML export of notebook with all outputs

### Collaboration Policy

- You may discuss high-level approaches with classmates
- You may use GenAI assistance (ChatGPT, Claude, GitHub Copilot)
  - Must document what assistance you used and how
  - Must understand and be able to explain all code
- All analysis, writing, and insights must be your own
- Cite any external code or ideas used

---

## Grading Rubric (100 points total)

### Part 1: Implementation (40 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| Classical Methods (LSA, LDA) | 8 | Correct implementation, reasonable hyperparameters, working embeddings |
| Static Embeddings (Word2Vec, GloVe, FastText) | 8 | Proper aggregation strategies, handling of OOV words, documented choices |
| Contextualized Embeddings (BERT, GPT-2) | 8 | Appropriate pooling, handling of long documents, clear methodology |
| Modern Embeddings (Sentence-BERT, Llama) | 8 | Correct model usage, comparison of approaches, quality embeddings |
| Topic Models (BERTopic, Top2Vec) | 8 | Proper configuration, coherent topics, analysis of topic quality |

**Grading notes:**
- Full credit requires all methods working with reasonable quality
- Partial credit for methods with minor issues or limited analysis
- Bonus points (up to +5) for additional methods or particularly elegant implementations

### Part 2: Evaluation and Analysis (30 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| Clustering Algorithms | 10 | Multiple algorithms implemented, systematic comparison, justified choices |
| Quantitative Metrics | 8 | Comprehensive metrics, correct implementation, statistical rigor |
| Qualitative Analysis | 6 | Thoughtful interpretation, case studies, error analysis |
| Cross-Method Comparison | 6 | Direct comparisons, correlation analysis, actionable insights |

**Grading notes:**
- Quality of analysis matters more than quantity
- Must go beyond surface-level observations
- Statistical significance testing required for comparisons

### Part 3: Visualization (15 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| Multi-Level Clustering | 5 | Clear hierarchy, validated against structure, insightful analysis |
| Interactive Visualizations | 10 | High-quality Plotly plots, appropriate techniques, informative and beautiful |

**Grading notes:**
- Visualizations must be publication-quality
- Interactivity should enhance understanding
- Captions and explanations required
- Bonus points (up to +3) for particularly creative or insightful visualizations

### Part 4: Cognitive Science Connection (10 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| Theoretical Connection | 4 | Clear explanation of distributional semantics, connection to cognitive science |
| Critical Analysis | 6 | Thoughtful discussion of meaning, limitations, philosophical depth |

**Grading notes:**
- Must engage seriously with cognitive science literature
- Superficial treatment will not receive full credit
- Depth and nuance valued over length

### Part 5: Advanced Extensions (5 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| Extension Implementation | 3 | Working implementation of chosen extension, appropriate methodology |
| Extension Analysis | 2 | Evaluation of extension, insights gained, discussion of implications |

**Grading notes:**
- Choose extension that interests you
- Quality over quantity
- Bonus points (up to +5) for multiple high-quality extensions

### Overall Quality (Holistic Assessment)

| Aspect | Impact on Grade |
|--------|-----------------|
| Code Quality | Clean, well-documented, efficient code can earn bonus points |
| Writing Quality | Clear, insightful writing enhances grade; poor writing reduces it |
| Creativity | Novel approaches or insights can earn significant bonus points |
| Reproducibility | Non-reproducible results may lose up to 10 points |
| Late Submission | Standard course late policy applies |

**Maximum Total: 110 points (100 base + 10 possible bonus)**

---

## Resources and References

### Key Papers (from Syllabus Weeks 3-4)

**Foundational Papers:**
- Deerwester et al. (1990). [Indexing by Latent Semantic Analysis](https://www.cs.bham.ac.uk/~pxt/IDA/lsa_ind_ar_02.pdf)
- Blei, Ng, & Jordan (2003). [Latent Dirichlet Allocation](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf)
- Mikolov et al. (2013). [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781)
- Pennington, Socher, & Manning (2014). [GloVe: Global Vectors for Word Representation](https://nlp.stanford.edu/pubs/glove.pdf)

**Neural Methods:**
- Bojanowski et al. (2017). [Enriching Word Vectors with Subword Information](https://arxiv.org/abs/1607.04606)
- Devlin et al. (2019). [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805)
- Radford et al. (2019). [Language Models are Unsupervised Multitask Learners](https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)
- Reimers & Gurevych (2019). [Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks](https://arxiv.org/abs/1908.10084)

**Modern Topic Models:**
- Angelov (2020). [Top2Vec: Distributed Representations of Topics](https://arxiv.org/abs/2008.09470)
- Grootendorst (2022). [BERTopic: Neural Topic Modeling with a Class-based TF-IDF Procedure](https://arxiv.org/abs/2203.05794)

**Evaluation and Analysis:**
- van der Maaten & Hinton (2008). [Visualizing Data using t-SNE](https://www.jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf)
- McInnes, Healy, & Melville (2018). [UMAP: Uniform Manifold Approximation and Projection](https://arxiv.org/abs/1802.03426)

**Cognitive Science Connection:**
- Lenci (2008). [Distributional semantics in linguistic and cognitive research](https://www.academia.edu/download/43947219/Distributional_semantics_in_linguistic_a20160320-31230-nwvv7i.pdf)
- Landauer & Dumais (1997). [A Solution to Plato's Problem: The Latent Semantic Analysis Theory of Acquisition](https://psycnet.apa.org/record/1997-03887-001)

### Tutorials and Documentation

**Libraries:**
- [Scikit-learn Clustering](https://scikit-learn.org/stable/modules/clustering.html)
- [Gensim Word Embeddings](https://radimrehurek.com/gensim/models/word2vec.html)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/)
- [Sentence Transformers](https://www.sbert.net/)
- [BERTopic Documentation](https://maartengr.github.io/BERTopic/)
- [Plotly Python](https://plotly.com/python/)
- [UMAP Documentation](https://umap-learn.readthedocs.io/)

**Tutorials:**
- [Jay Alammar's Illustrated Word2Vec](https://jalammar.github.io/illustrated-word2vec/)
- [Jay Alammar's Illustrated BERT](https://jalammar.github.io/illustrated-bert/)
- [Topic Modeling with BERTopic (walkthrough)](https://towardsdatascience.com/topic-modeling-with-bert-779f7db187e6)
- [Understanding UMAP](https://pair-code.github.io/understanding-umap/)

### Datasets for Human Judgments

- [SimLex-999](https://fh295.github.io/simlex.html) - Semantic similarity ratings
- [WordSim-353](http://alfonseca.org/eng/research/wordsim353.html) - Word similarity dataset
- [MEN Dataset](https://staff.fnwi.uva.nl/e.bruni/MEN) - Semantic relatedness

---

## Tips and Best Practices

### Computational Efficiency

**Working with Large Datasets:**
- Start with a subset (e.g., 10K articles) for development
- Once code works, scale to full 250K dataset
- Cache embeddings to avoid recomputation
- Use batch processing for transformer models

**GPU Utilization:**
- Request GPU runtime in Colab (Runtime → Change runtime type)
- Monitor GPU memory usage with `nvidia-smi`
- Use mixed precision (fp16) for large models
- Clear cache between models: `torch.cuda.empty_cache()`

**Time Management:**
- Budget ~30 minutes per embedding method for full dataset
- Topic models (BERTopic, Top2Vec) are slowest (1-2 hours)
- Clustering is fast (<5 minutes for most methods)
- Visualization can be slow for 250K points; consider downsampling

### Implementation Tips

**Handling Long Documents:**
- Transformers have max length (512 for BERT, 1024 for GPT-2)
- Strategies:
  - Truncate to first N tokens (simple but loses information)
  - Sliding window with averaging (more complete but slower)
  - Hierarchical: split document, embed chunks, aggregate
  - Use models with longer context (Longformer, BigBird)

**Aggregating Word Vectors:**
- Simple mean: `np.mean(word_vectors, axis=0)`
- TF-IDF weighted: weight by term importance
- Max pooling: `np.max(word_vectors, axis=0)`
- Try multiple strategies and compare

**Choosing Hyperparameters:**
- For clustering: use elbow method, silhouette scores
- For UMAP: `n_neighbors=15`, `min_dist=0.1` are good defaults
- For t-SNE: `perplexity=30-50` for large datasets
- Document your choices and justify them

### Analysis Tips

**Statistical Rigor:**
- Don't just report one number - use confidence intervals
- Compare methods with statistical tests (paired t-test, Wilcoxon)
- Use bootstrap resampling for uncertainty estimates
- Consider multiple random initializations for clustering

**Visualization Best Practices:**
- Use colorblind-friendly palettes (viridis, plasma, colorbrewer)
- Label axes and include legends
- Make plots large enough to read
- Interactive > static for exploratory analysis
- Include captions explaining what to look for

**Qualitative Analysis:**
- Look at actual examples, not just metrics
- Sample from best AND worst clusters
- Find interesting edge cases
- Use LLMs to help interpret, but verify their interpretations

### Common Pitfalls to Avoid

**Don't:**
- Forget to normalize embeddings before clustering (for cosine similarity)
- Use too many clusters (overfitting) or too few (underfitting)
- Trust metrics blindly - always inspect examples
- Cherry-pick results that fit expectations
- Plagiarize or use GenAI output without understanding

**Do:**
- Start simple, then add complexity
- Validate assumptions with examples
- Compare multiple approaches
- Document limitations and failures
- Be honest about what works and what doesn't

### Using GenAI Effectively

**Good uses:**
- Explaining error messages
- Suggesting library functions for specific tasks
- Helping debug code
- Generating boilerplate code
- Explaining concepts from papers

**Bad uses:**
- Generating analysis without understanding
- Writing interpretation sections wholesale
- Implementing methods you don't understand
- Avoiding learning the underlying concepts

**Remember:** You must understand and be able to explain everything you submit.

---

## Expected Timeline

This is a 2-week intensive assignment (Weeks 3-4 of the course). With GenAI assistance and focused implementation, here's a suggested timeline:

### Week 1: Implementation of All Methods, Initial Clustering
- Set up environment, download dataset
- Implement all classical methods (LSA, LDA)
- Implement all static embeddings (Word2Vec, GloVe, FastText)
- Implement contextualized embeddings (BERT, GPT-2)
- Implement modern embeddings (Sentence-BERT, Llama)
- Implement topic models (BERTopic, Top2Vec)
- Generate embeddings for full dataset
- Apply clustering algorithms (K-Means, Hierarchical, DBSCAN/HDBSCAN)
- Compute initial quantitative metrics

### Week 2: Analysis, Visualization, Cognitive Science Connection, and Extensions
- Perform qualitative analysis and error analysis
- Cross-method comparison and interpretation
- Create multi-level clustering hierarchies
- Create interactive Plotly visualizations (3D scatter, 2D hexbin, cluster comparisons)
- Implement dimensionality reduction (t-SNE and UMAP)
- Write cognitive science connection and theoretical analysis
- Implement advanced extension (Option A, B, or C)
- Polish all outputs and finalize documentation

**Total estimated effort: 25-35 hours** (with GenAI assistance for coding and documentation)

---

## Frequently Asked Questions

**Q: Do I really need to implement all 10+ methods?**
A: Yes. The comparison is the core of the assignment. However, if you have significant technical difficulties with one method, document the issue and move on.

**Q: Can I use a smaller subset of the data?**
A: For development, yes. For final submission, use the full 250K articles (or justify why you used fewer).

**Q: How do I handle out-of-memory errors?**
A: Use batch processing, reduce batch size, use smaller models, or process in chunks. Ask for help if stuck.

**Q: Can I use different Wikipedia data?**
A: Prefer the provided dataset for comparability, but you can use different data if you have a good reason (must justify).

**Q: How much analysis is enough?**
A: Quality > quantity. Deep analysis of a few interesting findings beats superficial treatment of many.

**Q: Can I work with a partner?**
A: Check course policy. Generally, collaboration is allowed but each person must submit their own work.

**Q: How important are the visualizations?**
A: Very important. They're worth 15 points and central to understanding the results. Invest time here.

**Q: What if my results are "bad" (low metrics, unclear clusters)?**
A: Document what you found! Negative results are still results. Analyze why and what it means.

**Q: Can I use commercial APIs (OpenAI, Anthropic)?**
A: Prefer open-source models, but if you have credits, you can use APIs for comparison.

---

## Getting Help

- **Office Hours**: Best place for debugging and conceptual questions
- **Course Forum**: Great for sharing tips and common issues
- **GenAI**: Useful for coding help, but understand before using
- **Library Documentation**: Always check official docs first
- **Papers**: When in doubt, read the original paper

---

## Learning Goals: What You'll Take Away

By completing this assignment, you will:

1. **Technical Skills**
   - Mastery of diverse embedding techniques
   - Experience with unsupervised learning and clustering
   - Expertise in evaluation metrics and analysis
   - Ability to create publication-quality visualizations

2. **Conceptual Understanding**
   - Deep understanding of distributional semantics
   - Knowledge of trade-offs between different approaches
   - Appreciation for the evolution of NLP methods
   - Critical thinking about what "meaning" means computationally

3. **Research Skills**
   - Ability to design and conduct comparative experiments
   - Statistical rigor in evaluation
   - Clear communication of findings
   - Connection between theory and practice

4. **Practical Knowledge**
   - Experience working with large-scale NLP datasets
   - Understanding of computational constraints
   - Ability to debug and troubleshoot ML pipelines
   - Portfolio-worthy project for job applications

---

## Final Words

This assignment is designed to be challenging, extensive, and deeply educational. It's not meant to be completed in a weekend. Take your time, explore the methods, think deeply about the results, and enjoy the process of discovering how machines represent meaning.

The goal isn't just to get high metrics or pretty plots - it's to develop a sophisticated understanding of how different computational approaches capture semantic information, and to think critically about what these methods reveal (and obscure) about language and meaning.

Don't hesitate to be creative, try additional ideas, and follow interesting threads you discover. The best projects will show intellectual curiosity, rigorous analysis, and genuine insight.

**Good luck, and enjoy exploring the semantic space!**
