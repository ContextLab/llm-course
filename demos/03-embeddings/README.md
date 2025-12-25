# Text Embeddings Explorer

An interactive 3D/2D visualization tool for exploring text embeddings with multiple models, datasets, and dimension reduction techniques.

## Features

### 🎯 Core Capabilities

- **Real Transformer-based Embedding Models**
  - **all-MiniLM-L6-v2** (384d): Fast, efficient sentence embeddings
  - **all-mpnet-base-v2** (768d): High-quality general-purpose embeddings
  - **paraphrase-multilingual** (384d): Multilingual sentence embeddings
  - All models powered by **Transformers.js** for client-side inference
  - These are real pre-trained models that generate true semantic embeddings

- **Diverse Datasets**
  - News Articles (50 samples, 10 categories)
  - Movie Reviews (30 samples, sentiment analysis)
  - **Wikipedia Articles (2000 real Wikipedia articles)** - Real text from Wikipedia with authentic content across diverse categories

- **Dimension Reduction**
  - **UMAP**: Uniform Manifold Approximation and Projection
  - **t-SNE**: t-Distributed Stochastic Neighbor Embedding
  - **PCA**: Principal Component Analysis
  - Adjustable parameters for fine-tuning
  - Support for both 2D and 3D visualization

### 📊 Interactive Visualization

- **3D/2D Scatter Plots** using Plotly.js
- **Color Coding** by category, cluster, or sentiment
- **Interactive Hover** to see full text content
- **Click Selection** to highlight points and nearest neighbors
- **Rotation and Zoom** for exploring 3D space
- **Search Functionality** to find specific texts

### 🔬 Clustering Analysis

- **K-Means Clustering**
  - Adjustable number of clusters (k)
  - K-means++ initialization
  - Real-time cluster statistics

- **DBSCAN Clustering**
  - Density-based spatial clustering
  - Adjustable epsilon and min samples
  - Automatic noise detection

### ✨ Advanced Features

- **Custom Text Embedding**
  - Add your own text to the visualization
  - See where it appears in embedding space
  - Find nearest neighbors automatically

- **Comparison Mode**
  - Side-by-side visualization of different models
  - Compare how different embeddings cluster the same data

- **k-NN Visualization**
  - Show connections between nearest neighbors
  - Understand local structure of embedding space

## Quick Start

### Option 1: Local Server

```bash
# Navigate to the demo directory
cd demos/03-embeddings

# Start a simple HTTP server
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Option 2: Direct File Access

Simply open `index.html` in a modern web browser. Note that some features may require a local server due to CORS restrictions.

## Usage Guide

### Basic Workflow

1. **Select a Model**
   - Choose from pre-loaded or Transformers.js models
   - Wait for model to load (first time may take a few moments)

2. **Load a Dataset**
   - Select from pre-loaded datasets
   - Click "Load Dataset" button

3. **Apply Dimension Reduction**
   - Choose reduction method (UMAP, t-SNE, or PCA)
   - Adjust parameters as needed
   - Select 2D or 3D visualization
   - Click "Apply Reduction"

4. **Explore the Visualization**
   - Rotate (click and drag)
   - Zoom (mouse wheel)
   - Hover over points to see text
   - Click points to highlight neighbors

### Advanced Features

#### Custom Text Embedding

1. Enter your text in the "Custom Text Embedding" section
2. Click "Embed & Visualize"
3. Your text appears as a red diamond in the plot
4. View nearest neighbors below the input

#### Clustering

1. Choose clustering method (K-Means or DBSCAN)
2. Adjust parameters using sliders
3. Click "Apply Clustering"
4. Change color mode to "Cluster" to see results

#### Search

1. Enter search term in the search box
2. Click "Search" or press Enter
3. Click on results to highlight in visualization

#### Comparison Mode

1. Check "Enable Comparison Mode"
2. Select a comparison model
3. View side-by-side visualizations

## Implementation Details

### Architecture

```
demos/03-embeddings/
├── index.html              # Main HTML interface
├── css/
│   └── embeddings.css      # Styling
├── js/
│   ├── embedding-loader.js # Model and dataset loading
│   ├── dimension-reducer.js # UMAP, t-SNE, PCA implementations
│   ├── clustering.js       # K-means and DBSCAN
│   └── interactive-plot.js # Plotly.js visualization
└── data/
    ├── sample-embeddings.json
    ├── news-dataset.json
    ├── movies-dataset.json
    └── wikipedia-dataset.json
```

### Technologies

- **Transformers.js**: Client-side transformer models
- **Plotly.js**: Interactive 3D/2D plotting
- **Vanilla JavaScript**: No framework dependencies
- **ES6 Modules**: Modern JavaScript architecture

### Algorithms

#### Dimension Reduction

**PCA (Principal Component Analysis)**
- Computes covariance matrix
- Eigenvalue decomposition via power iteration
- Projects data onto principal components

**t-SNE (t-Distributed Stochastic Neighbor Embedding)**
- Computes pairwise similarities in high-dimensional space
- Optimizes low-dimensional embedding via gradient descent
- Preserves local structure

**UMAP (Uniform Manifold Approximation and Projection)**
- Constructs fuzzy simplicial set
- Optimizes layout with attractive/repulsive forces
- Balances local and global structure

#### Clustering

**K-Means**
- K-means++ initialization
- Iterative assignment and update steps
- Converges to local optimum

**DBSCAN**
- Density-based clustering
- Finds core points, border points, and noise
- No need to specify number of clusters

### Performance Considerations

- **Batch Processing**: Embeddings computed in batches
- **Async Operations**: UI remains responsive during computation
- **Progressive Updates**: Visual feedback during processing
- **Memory Efficient**: Optimized for browser constraints

## Educational Value

This demo is designed for:

- **Understanding Embeddings**: See how texts with similar meanings cluster together
- **Comparing Models**: Observe how different models represent the same text
- **Learning Dimensionality Reduction**: Understand UMAP vs t-SNE vs PCA
- **Exploring Clustering**: Compare density-based vs centroid-based methods
- **Hands-on Experimentation**: Add custom text and see immediate results

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- WebGL support for 3D visualization
- ES6 module support
- Sufficient RAM for model loading (512MB+ recommended)

## Customization

### Adding New Datasets

Create a JSON file in `data/` directory:

```json
{
  "texts": ["text 1", "text 2", ...],
  "labels": ["label 1", "label 2", ...]
}
```

Update the dataset selector in `index.html`.

### Adding New Transformer Models

You can add any Transformers.js-compatible model:

1. Find a model on [HuggingFace](https://huggingface.co/models?library=transformers.js)
2. Update the model selector in `index.html`
3. Add the mapping in `embedding-loader.js`:

```javascript
const modelMap = {
  'your-model-id': 'Xenova/your-model-name'
};
```

**Recommended models to try**:
- `Xenova/all-distilroberta-v1` (768d, RoBERTa-based)
- `Xenova/paraphrase-MiniLM-L3-v2` (384d, very fast)
- `Xenova/multilingual-e5-small` (384d, multilingual)

### Styling

Modify `css/embeddings.css` to customize:
- Color schemes
- Layout dimensions
- Typography
- Interactive elements

## Important Note: Why No GloVe or Word2Vec?

Earlier versions of this demo included "GloVe" and "Word2Vec" options, but **these were fake implementations that generated random vectors**. This was educationally dishonest and has been removed.

### Why Were They Fake?

Real GloVe and Word2Vec models:
- Are **word-level** embeddings (not sentence-level)
- Require large pre-trained weight files (100s of MB)
- Need special handling for out-of-vocabulary words
- Use different architectures than modern transformers

The previous implementation simply generated random numbers, which:
- Provided no actual semantic meaning
- Misled users about how these models work
- Created false comparisons with real transformer models

### Current Approach: Honest and Educational

This demo now **only includes real, working models**:
- All three models are genuine pre-trained transformers
- They generate actual semantic embeddings
- You can trust the visualizations and comparisons
- The code is honest about what it's doing

### Want to Add Real Classic Embeddings?

If you're interested in comparing classic word embeddings with modern sentence embeddings, here's how you could extend this demo:

1. **For GloVe**:
   - Download pre-trained GloVe vectors (e.g., `glove.6B.50d.txt` from Stanford NLP)
   - Convert to JSON format for browser loading
   - Implement word-level averaging for sentences
   - Handle out-of-vocabulary words (e.g., zero vectors or random initialization)

2. **For Word2Vec**:
   - Use Gensim to load pre-trained Word2Vec models
   - Export to a browser-friendly format
   - Implement similar word averaging strategy
   - Consider subword models (FastText) for better OOV handling

3. **Key Differences to Show**:
   - Word-level vs sentence-level representations
   - Static embeddings vs contextualized embeddings
   - Vocabulary limitations vs unlimited vocabulary
   - Performance on semantic similarity tasks

**Educational Resources**:
- [GloVe: Global Vectors for Word Representation](https://nlp.stanford.edu/projects/glove/)
- [Word2Vec Paper](https://arxiv.org/abs/1301.3781)
- [Understanding the Difference](https://jalammar.github.io/illustrated-word2vec/)

## Troubleshooting

**Model loading is slow**
- First load downloads model files (~10-50MB each)
- Subsequent loads use browser cache
- Consider starting with the smallest model (all-MiniLM-L6-v2)

**Visualization is laggy**
- Reduce number of data points
- Disable k-NN connections
- Use 2D instead of 3D

**Out of memory errors**
- Use smaller embedding models (all-MiniLM-L6-v2 instead of all-mpnet-base-v2)
- Reduce dataset size
- Close other browser tabs

## Future Enhancements

Possible additions:
- HuggingFace dataset integration
- Export visualizations as images
- Save/load embedding configurations
- More clustering algorithms (Hierarchical, GMM)
- Word-level embeddings visualization
- Embedding arithmetic (king - man + woman = ?)
- Fine-tuning support

## Resources

- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [UMAP Paper](https://arxiv.org/abs/1802.03426)
- [t-SNE Paper](https://www.jmlr.org/papers/v9/vandermaaten08a.html)
- [Sentence Transformers](https://www.sbert.net/)

## Changelog

### December 2025 - Added Real Wikipedia Dataset

**Enhancement**: Replaced synthetic Wikipedia text with 2000 real Wikipedia articles

**What changed:**
- ✅ Added `wikipedia-embeddings.json` with 2000 real Wikipedia articles
- ✅ Updated `embedding-loader.js` to load real Wikipedia data instead of generating synthetic samples
- ✅ Removed synthetic data generation functions (generateNewsDataset, generateMovieReviewsDataset, generateWikipediaDataset)
- ✅ Enhanced loading indicators to show progress for larger datasets
- ✅ Updated UI to reflect that Wikipedia dataset contains 2000 real articles
- ✅ Added batch processing with progress updates for better user experience

**Impact:** The Wikipedia dataset now provides authentic, real-world text data for meaningful embeddings exploration. Users can explore semantic relationships in actual Wikipedia content rather than synthetic samples.

### December 2025 - Removed Fake Embeddings

**Breaking Change**: Removed GloVe and Word2Vec options

**Why?** The previous implementation generated **random vectors** instead of using real pre-trained embeddings. This was educationally dishonest and could mislead students about how these classic embedding models actually work.

**What changed:**
- ✅ Removed fake GloVe (50d) and Word2Vec (100d) options from UI
- ✅ Removed random vector generation code
- ✅ Updated documentation to be honest about what's implemented
- ✅ Added guidance for students who want to integrate real classic embeddings
- ✅ All remaining models (all-MiniLM-L6-v2, all-mpnet-base-v2, paraphrase-multilingual) are **real, working transformer models**

**Impact:** The demo is now smaller, faster, and most importantly, **honest**. Students can trust that what they see represents actual semantic embeddings, not random noise.

## License

This demo is part of the LLM Course educational materials.

## Acknowledgments

- Transformers.js for browser-based model inference
- Plotly.js for visualization capabilities
- HuggingFace for pre-trained models
- The open-source NLP community
