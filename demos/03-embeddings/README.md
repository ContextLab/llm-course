# Text Embeddings Explorer

An interactive 3D/2D visualization tool for exploring text embeddings with multiple models, datasets, and dimension reduction techniques.

## Features

### 🎯 Core Capabilities

- **Multiple Embedding Models**
  - Pre-loaded: GloVe (50d), Word2Vec (100d)
  - Transformers.js models: all-MiniLM-L6-v2, all-mpnet-base-v2, paraphrase-multilingual
  - Real-time embedding using state-of-the-art sentence transformers

- **Diverse Datasets**
  - News Articles (50 samples, 10 categories)
  - Movie Reviews (30 samples, sentiment analysis)
  - Wikipedia Excerpts (60 samples, multiple topics)

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

### Adding New Models

Modify the model selector and update `getTransformersModelName()` in `embedding-loader.js`:

```javascript
const modelMap = {
  'your-model-id': 'Xenova/your-model-name'
};
```

### Styling

Modify `css/embeddings.css` to customize:
- Color schemes
- Layout dimensions
- Typography
- Interactive elements

## Troubleshooting

**Model loading is slow**
- First load downloads model files
- Subsequent loads use browser cache
- Consider starting with smaller models

**Visualization is laggy**
- Reduce number of data points
- Disable k-NN connections
- Use 2D instead of 3D

**Out of memory errors**
- Use smaller embedding models
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

## License

This demo is part of the LLM Course educational materials.

## Acknowledgments

- Transformers.js for browser-based model inference
- Plotly.js for visualization capabilities
- HuggingFace for pre-trained models
- The open-source NLP community
