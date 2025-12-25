# Topic Modeling Studio

An interactive demonstration of Latent Dirichlet Allocation (LDA) for topic modeling with real-time visualization.

## Features

### Core Functionality
- **LDA Implementation**: Full JavaScript implementation of LDA using Collapsed Gibbs Sampling
- **Multiple Datasets**: Pre-loaded news articles, scientific papers, and product reviews
- **Custom Text Input**: Process your own documents
- **Adjustable Parameters**:
  - Number of topics (K)
  - Alpha (document-topic Dirichlet prior)
  - Beta (topic-word Dirichlet prior)
  - Number of iterations
  - Stopword removal
  - Text stemming

### Visualizations

1. **Topic Overview**
   - Grid of topic cards showing top words per topic
   - Document count per topic
   - Interactive topic selection

2. **Word Clouds**
   - D3-based word clouds for each topic
   - Font size indicates word importance
   - Random rotation for visual appeal

3. **Document-Topic Distributions**
   - Bar charts showing topic distribution for each document
   - Document selector
   - Full document text preview

4. **Inter-topic Distance Map (pyLDAvis-style)**
   - 2D scatter plot of topics in reduced space
   - Topic sizes based on word counts
   - Clickable topics showing top words
   - Interactive topic exploration

### Statistics
- Document count and vocabulary size
- Average document length
- Perplexity score (model quality metric)
- Number of topics discovered

### Export Options
- Export topics as JSON
- Export visualizations as PNG images

## Technical Implementation

### Files
- `index.html` - Main HTML structure and application logic
- `css/topic-modeling.css` - Comprehensive styling
- `js/lda.js` - LDA algorithm implementation
- `js/visualization.js` - Visualization rendering
- `data/sample-docs.js` - Sample datasets

### Key Algorithms

**LDA Implementation**:
- Collapsed Gibbs Sampling for topic inference
- Configurable Dirichlet priors
- Iterative convergence
- Perplexity calculation for model evaluation

**Preprocessing**:
- Tokenization with regex
- Stopword filtering
- Simple Porter stemmer
- Vocabulary building

**Visualization**:
- D3 word clouds with custom layout
- Plotly interactive charts
- PCA-based dimensionality reduction for topic distance
- Cosine similarity for topic relationships

## Usage

1. **Load Dataset**: Select a pre-loaded dataset or enter custom text
2. **Configure Parameters**: Adjust LDA parameters using sliders
3. **Run LDA**: Click "Run LDA" to train the model
4. **Explore Results**: Switch between visualization modes
5. **Export**: Save topics or visualizations for later use

## Educational Value

This demo teaches:
- Topic modeling concepts and applications
- How LDA discovers latent topics in text
- The role of hyperparameters (alpha, beta)
- Trade-offs between topic count and coherence
- Relationship between topics in semantic space
- Model evaluation using perplexity

## Dependencies

- Plotly.js 2.27.0 - Interactive plotting
- D3.js v7 - Word cloud generation
- d3-cloud 1.2.5 - Word cloud layout algorithm
