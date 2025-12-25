# Word Analogy Explorer

An interactive demonstration of word embeddings, vector arithmetic, and semantic relationships.

## Features

### Core Functionality
- **Word Analogy Solver**: Solve "A - B + C = ?" analogies
- **Similarity Search**: Find semantically similar words
- **Vector Arithmetic Visualization**: See how word vectors combine
- **Embedding Space Exploration**: Visualize high-dimensional embeddings
- **Real Pre-trained Embeddings**:
  - GloVe 50-dimensional (10,000 most common words)
  - Trained on 6 billion tokens from Wikipedia and Gigaword
  - Authentic word relationships learned from real text data
  - Custom embedding support

### Analogy Solver

The classic word analogy task:
- **Input**: Three words (A, B, C)
- **Output**: Word D such that A - B + C ≈ D
- **Examples**:
  - king - man + woman = queen
  - paris - france + germany = berlin
  - good - better + bad = worse
  - walking - walked + swimming = swam

**Features**:
- Top-K predictions with similarity scores
- Visual similarity bars
- Pre-loaded example analogies
- Click predictions to explore
- Detailed breakdown of vector arithmetic

### Similarity Search

Find words semantically similar to a query:
- Cosine similarity computation
- Configurable number of results (5-20)
- Ranked by similarity score
- Visual similarity indicators
- Click to explore neighborhoods

### Visualizations

1. **Vector Arithmetic (3D)**
   - Interactive 3D plot using first 3 dimensions
   - Shows individual word vectors
   - Displays difference vector (A - B)
   - Shows result vector
   - Actual result word position
   - Rotatable, zoomable view

2. **Embedding Space (2D/3D)**
   - t-SNE or PCA dimensionality reduction
   - 2D or 3D visualization modes
   - Configurable number of words (50-500)
   - Optional word labels
   - Interactive exploration
   - Hover for word details

3. **Analogy Breakdown**
   - Step-by-step explanation
   - Vector operation formulas
   - Magnitude calculations
   - Similarity scores
   - Educational annotations

### Statistics
- Total words loaded
- Analogies solved
- Similarity searches performed
- Average similarity score

## Technical Implementation

### Files
- `index.html` - Main HTML structure and application logic
- `css/analogies.css` - Comprehensive styling
- `js/embeddings.js` - Embedding model and vector operations
- `js/visualization.js` - 2D/3D visualization components
- `data/sample-embeddings.js` - Module for loading real GloVe embeddings
- `data/glove-50d.json` - Real pre-trained GloVe word vectors (10K words, ~4.6MB)
- `data/convert_glove_to_json.py` - Script to convert GloVe text format to JSON

### Key Algorithms

**Vector Operations**:
- Vector addition and subtraction
- Cosine similarity computation
- Vector normalization
- Magnitude calculation
- Nearest neighbor search

**Dimensionality Reduction**:
- **PCA (Principal Component Analysis)**:
  - Covariance matrix computation
  - Power iteration for eigenvectors
  - Efficient matrix operations
  - 2D/3D projection

- **t-SNE (t-Distributed Stochastic Neighbor Embedding)**:
  - Gaussian similarity computation
  - Student-t distribution in low dimensions
  - Gradient descent optimization
  - Momentum and adaptive learning rates
  - Perplexity parameter tuning

**Real Pre-trained Embeddings**:
- GloVe (Global Vectors for Word Representation)
- Trained on 6 billion tokens from Wikipedia 2014 and Gigaword 5
- Co-occurrence matrix factorization with global statistics
- 10,000 most frequent words included for browser performance
- 50-dimensional vectors capturing semantic and syntactic relationships

## Usage

1. **Load Model**: Select embedding model (loads automatically)
2. **Solve Analogies**:
   - Enter three words in the formula
   - Or click an example analogy
   - Click "Solve Analogy"
   - View predictions and visualizations

3. **Search Similar Words**:
   - Enter a word
   - Click "Find Similar"
   - Adjust number of results
   - Explore results

4. **Visualize Space**:
   - Select visualization mode (2D/3D, PCA/t-SNE)
   - Adjust number of words to display
   - Toggle labels on/off
   - Click "Update Visualization"

## Educational Value

This demo teaches:
- **Word embeddings** capture semantic relationships from real text data
- **Vector arithmetic** reveals linguistic patterns learned from billions of words
- **Cosine similarity** measures semantic distance
- **Dimensionality reduction** reveals structure in high-dimensional spaces
- **Distributional semantics** - words with similar contexts have similar meanings

### Real vs. Synthetic Embeddings

Unlike previous versions that used hand-crafted embeddings explicitly designed to make analogies work perfectly, this demo uses **real pre-trained GloVe embeddings**. This means:

- **Analogies won't always be perfect** - This is authentic behavior! Real embeddings capture complex, nuanced relationships from actual language use
- **Unexpected results are educational** - When "king - man + woman" doesn't perfectly yield "queen", it reveals the limitations and biases in training data
- **More realistic demonstration** - Shows how word embeddings actually work in practice, not an idealized version
- **Authentic semantic relationships** - The similarities and analogies come from real patterns in 6 billion words of text, not hand-coded rules

This educational honesty is crucial for understanding how language models and embeddings actually behave in real applications.

### Classic Analogies

**Gender**:
- king - man + woman = queen
- prince - boy + girl = princess

**Geography**:
- paris - france + germany = berlin
- tokyo - japan + italy = rome

**Comparative/Superlative**:
- good - better + bad = worse
- good - best + bad = worst

**Verb Tense**:
- walking - walked + swimming = swam
- walk - walked + swim = swam

## Mathematical Foundation

### Vector Arithmetic
```
analogy(A, B, C) = argmax_w similarity(vec(A) - vec(B) + vec(C), vec(w))
```

### Cosine Similarity
```
similarity(u, v) = (u · v) / (||u|| × ||v||)
```

### PCA
```
Find eigenvectors of covariance matrix Σ = (1/n) X^T X
Project: Y = X × V_k (top k eigenvectors)
```

### t-SNE
```
Minimize KL divergence between high-D and low-D distributions
P_ij = exp(-||x_i - x_j||²) / Σ_k exp(-||x_i - x_k||²)
Q_ij = (1 + ||y_i - y_j||²)^(-1) / Σ_k (1 + ||y_i - y_k||²)^(-1)
```

## Dependencies

- Plotly.js 2.27.0 - Interactive 2D/3D visualization
- TensorFlow.js 4.11.0 - Matrix operations (optional optimization)

## Performance

- Instant analogy solving (pure JavaScript)
- Fast similarity search using normalized vectors
- PCA: ~1-2 seconds for 200 words
- t-SNE: ~5-10 seconds for 200 words (more iterations = better quality)
- All computations run in browser

## Regenerating Embeddings

If you need to regenerate the embeddings file (e.g., to change vocabulary size or use different dimensions):

1. Download GloVe embeddings:
   ```bash
   cd data/
   wget https://nlp.stanford.edu/data/glove.6B.zip
   unzip glove.6B.zip
   ```

2. Run the conversion script:
   ```bash
   # Convert with default settings (10,000 words, 50 dimensions)
   python3 convert_glove_to_json.py

   # Or customize the vocabulary size
   python3 convert_glove_to_json.py glove.6B.50d.txt glove-50d.json 15000
   ```

3. The script will create `glove-50d.json` with the specified number of most common words

Note: The GloVe download is ~800MB and contains 400,000 words. The conversion script selects only the most common words to keep the browser-loaded JSON file at a reasonable size (~4.6MB for 10K words).

## Data Source and Citation

**GloVe: Global Vectors for Word Representation**
- Source: Stanford NLP - https://nlp.stanford.edu/projects/glove/
- Dataset: glove.6B (trained on 6 billion tokens)
- License: Public Domain

Citation:
```
Jeffrey Pennington, Richard Socher, and Christopher D. Manning. 2014.
GloVe: Global Vectors for Word Representation.
In Proceedings of EMNLP 2014.
```

## Extensions

Potential additions:
- Upload custom embeddings
- More pre-loaded models (fastText, etc.)
- Additional visualization modes
- Batch analogy processing
- Analogy accuracy evaluation
- Neighborhood graph visualization
