# Demo 12: Semantic Search Engine

## Overview

This interactive demo compares three different search methods on the same document corpus:
- **Semantic Search**: Uses embeddings and cosine similarity
- **Keyword Search**: Uses BM25 algorithm (TF-IDF with saturation)
- **Hybrid Search**: Combines both methods with configurable weights

## Learning Objectives

- Understand the difference between lexical and semantic search
- Learn how BM25 (Best Matching 25) algorithm works for keyword search
- Explore how embeddings enable semantic similarity matching
- Compare performance characteristics of different search approaches
- Experiment with hybrid search strategies

## Features

### Search Methods

1. **Semantic Search**
   - Uses Transformers.js with MiniLM-L6-v2 model
   - Generates 384-dimensional embeddings
   - Computes cosine similarity between query and documents
   - Finds semantically related content even with different wording

2. **Keyword Search (BM25)**
   - Classic information retrieval algorithm
   - Based on term frequency-inverse document frequency (TF-IDF)
   - Includes saturation and document length normalization
   - Fast and effective for exact keyword matching

3. **Hybrid Search**
   - Combines normalized scores from both methods
   - Configurable weight parameter (α)
   - Formula: `score = α × semantic_score + (1-α) × keyword_score`
   - Gets best of both approaches

### Interactive Features

- **Side-by-side comparison**: See results from all three methods simultaneously
- **Real-time search**: Updates as you type
- **Relevance visualization**: Bar charts showing score distributions
- **Overlap analysis**: Venn diagram showing result overlaps
- **Performance metrics**: Time and quality comparisons
- **Multiple corpora**: Switch between different document collections
- **Query highlighting**: Keyword matches highlighted in results

### Document Corpora

1. **Research Papers**: AI/ML paper abstracts
2. **News Articles**: Technology news
3. **Product Reviews**: User reviews
4. **Wikipedia**: General knowledge articles
5. **Medical**: Health and medical articles

## How to Use

### Basic Search

1. Enter a query in the search box
2. Click "Search All Methods" or press Enter
3. View results side-by-side from all three methods
4. Compare relevance scores and rankings

### Adjusting Parameters

- **Results per method**: Slider (1-20 results)
- **Hybrid weight**: Balance between semantic and keyword (0 = pure keyword, 1 = pure semantic)
- **Enable/disable methods**: Checkboxes to show/hide specific methods

### Example Queries

Try these queries to see the differences:

1. **"neural networks in medicine"**
   - Semantic finds related medical AI papers
   - Keyword requires exact phrase match

2. **"how to train ML models"**
   - Semantic understands "training" concept
   - Keyword looks for exact terms

3. **"deep learning for vision"**
   - Both methods work well
   - Hybrid may provide best ranking

### Interpreting Results

- **High semantic, low keyword**: Conceptually related but different vocabulary
- **High keyword, low semantic**: Contains exact terms but may not be relevant
- **High both**: Ideal match with both semantic relevance and keyword presence

## Technical Implementation

### BM25 Algorithm

```javascript
// BM25 score calculation
score = Σ IDF(qi) × (f(qi, D) × (k1 + 1)) / (f(qi, D) + k1 × (1 - b + b × |D| / avgdl))
```

Where:
- `qi`: query term i
- `f(qi, D)`: frequency of qi in document D
- `|D|`: length of document D
- `avgdl`: average document length
- `k1`: term frequency saturation parameter (default: 1.5)
- `b`: document length normalization parameter (default: 0.75)
- `IDF(qi)`: inverse document frequency of qi

### Semantic Search Process

1. **Embedding generation**: Convert text to vectors using transformer model
2. **Indexing**: Pre-compute embeddings for all documents
3. **Query encoding**: Generate embedding for search query
4. **Similarity computation**: Calculate cosine similarity with all documents
5. **Ranking**: Sort by similarity score (descending)

### Hybrid Fusion

```javascript
// Score normalization and combination
normalized_semantic = semantic_score  // Already in [0, 1]
normalized_keyword = keyword_score / max_keyword_score

hybrid_score = α × normalized_semantic + (1 - α) × normalized_keyword
```

## Performance Characteristics

### Semantic Search
- **Speed**: Slower (10-100ms per query)
- **Quality**: Better for conceptual matches
- **Memory**: Higher (stores embeddings)
- **Best for**: Exploratory search, question answering

### Keyword Search
- **Speed**: Very fast (1-10ms per query)
- **Quality**: Better for exact matches
- **Memory**: Lower (stores term frequencies)
- **Best for**: Known-item search, exact phrase matching

### Hybrid Search
- **Speed**: Similar to semantic (dominated by embedding)
- **Quality**: Best overall robustness
- **Memory**: Combined requirements
- **Best for**: General-purpose search

## Educational Insights

### When Semantic Search Wins

- Synonyms: "automobile" finds "car"
- Paraphrasing: Different words, same meaning
- Conceptual queries: "space exploration" finds Mars missions
- Question answering: Natural language questions

### When Keyword Search Wins

- Exact terms: "iPhone 15" finds specific model
- Technical terms: Precise terminology
- Names and codes: Product IDs, paper titles
- Fast lookup: Real-time autocomplete

### When Hybrid Works Best

- Most real-world queries
- Balances recall and precision
- Robust to query formulation
- Production search systems

## File Structure

```
12-semantic-search/
├── index.html              # Main UI
├── css/
│   └── semantic-search.css # Styles
├── js/
│   ├── bm25.js            # BM25 implementation
│   ├── semantic-search.js # Embedding-based search
│   ├── hybrid-search.js   # Hybrid combination
│   ├── corpus-loader.js   # Data management
│   └── search-app.js      # Main application
├── data/
│   └── *.json             # Document corpora (optional)
└── README.md              # This file
```

## Dependencies

- **Plotly.js**: Interactive visualizations
- **Transformers.js**: Embedding model inference
- **Browser**: Modern browser with ES6 module support

## Extending the Demo

### Adding New Corpora

1. Create JSON file in `data/` directory:
```json
{
  "documents": [
    "Document 1 text...",
    "Document 2 text...",
    ...
  ]
}
```

2. Register in `corpus-loader.js`:
```javascript
this.corpora['my-corpus'] = {
    name: 'My Corpus',
    description: 'Description',
    url: 'data/my-corpus.json'
};
```

### Using Different Embedding Models

Modify `semantic-search.js`:
```javascript
this.modelName = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
```

Available models:
- `Xenova/all-MiniLM-L6-v2` (384d, fast)
- `Xenova/all-mpnet-base-v2` (768d, better quality)
- `Xenova/paraphrase-multilingual` (multilingual support)

### Customizing BM25 Parameters

Adjust in `bm25.js`:
```javascript
const bm25 = new BM25(k1=2.0, b=0.5);
```

- Higher `k1`: Less term frequency saturation
- Higher `b`: More document length normalization

## References

### Papers

- **BM25**: Robertson & Zaragoza (2009) "The Probabilistic Relevance Framework: BM25 and Beyond"
- **Sentence Embeddings**: Reimers & Gurevych (2019) "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks"
- **Hybrid Search**: Luan et al. (2021) "Sparse, Dense, and Attentional Representations for Text Retrieval"

### Resources

- [BM25 Wikipedia](https://en.wikipedia.org/wiki/Okapi_BM25)
- [Sentence Transformers](https://www.sbert.net/)
- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)

## Course Connection

This demo relates to:
- **Lecture 12**: Information Retrieval and Search
- **Assignment 6**: Building a Search System
- **Concepts**: Embeddings, similarity metrics, information retrieval

---

**Last Updated**: December 2025
**Course**: PSYC 51.17 - Language Models from Scratch
**Copyright**: Jeremy R. Manning
