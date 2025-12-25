# Demo 14: Embeddings Comparison Lab

## Overview

An interactive benchmarking tool for comparing multiple embedding models across various NLP tasks. Test and visualize the performance characteristics of different embedding approaches to understand their strengths and trade-offs.

## Learning Objectives

- Compare different embedding models (MiniLM, MPNet, BGE, Multilingual)
- Understand quality vs. speed trade-offs
- Test models on diverse NLP tasks
- Interpret performance metrics and visualizations
- Make informed model selection decisions

## Features

### Supported Models

1. **MiniLM-L6-v2** (384d, 22M params)
   - Fast and lightweight
   - Good general-purpose performance
   - Recommended for real-time applications

2. **MPNet-base-v2** (768d, 110M params)
   - Higher quality embeddings
   - Slower inference
   - Best for offline processing

3. **Multilingual-MiniLM** (384d, 118M params)
   - Supports 50+ languages
   - Balanced speed and quality
   - Cross-lingual transfer

4. **BGE-small-en** (384d, 33M params)
   - State-of-the-art retrieval performance
   - Optimized for English
   - Fast and effective

### Benchmark Tasks

#### 1. Semantic Similarity
Tests how well models capture semantic similarity between sentence pairs.

**What it measures:**
- Understanding of paraphrasing
- Semantic equivalence detection
- Contextual understanding

**Example queries:**
- High similarity: "The cat is sleeping" vs "A cat is napping"
- Low similarity: "Weather is sunny" vs "Machine learning is fascinating"

#### 2. Word Analogies
Tests reasoning capabilities using the classic "A is to B as C is to ?" format.

**What it measures:**
- Relational understanding
- Semantic composition
- Vector arithmetic quality

**Classic analogies:**
- king : queen :: man : ?
- Paris : France :: London : ?
- good : better :: bad : ?

#### 3. Topic Categorization
Groups similar items using clustering on embeddings.

**What it measures:**
- Semantic grouping ability
- Clustering quality
- Topic coherence

**Example:**
Group items like: apple, banana, carrot, broccoli, orange, spinach into fruit/vegetable categories

#### 4. Custom Tests
Run your own benchmarks with custom sentences.

**What it measures:**
- Pairwise similarities
- Overall consistency
- Domain-specific performance

### Visualizations

#### Leaderboard
- Ranks models by task performance
- Medal indicators for top 3
- Real-time updates

#### Performance Radar Chart
- Multi-dimensional view
- Quality, speed, and consistency metrics
- Easy comparison across models

#### Speed vs Quality Plot
- Scatter plot showing trade-offs
- Log scale for time
- Interactive model labels

## How to Use

### Getting Started

1. **Select Models**: Check the models you want to compare
2. **Load Models**: Click "Load Selected Models" (may take a minute)
3. **Choose Task**: Select from Similarity, Analogy, Categorization, or Custom
4. **Run Test**: Enter inputs and click the run button
5. **Analyze Results**: View results, leaderboard, and charts

### Running Similarity Tests

```
1. Enter two sentences to compare
2. Click "Run Similarity Test"
3. View similarity scores for each model
4. Compare which model best captures semantic similarity
```

**Quick Tests:**
- High Similarity: Nearly identical meaning, different words
- Medium Similarity: Related but distinct concepts
- Low Similarity: Unrelated sentences

### Running Analogy Tests

```
1. Enter three words: A, B, C
2. Click "Solve Analogy"
3. Models predict D such that "A:B::C:D"
4. View top candidates and confidence scores
```

**Tips:**
- Use well-known analogies first
- Try domain-specific relations
- Compare how models handle different types (gender, geography, grammar)

### Running Categorization Tests

```
1. Enter items (one per line)
2. Specify number of categories
3. Click "Run Categorization"
4. See how each model groups items
```

**Best practices:**
- Provide at least 2x items as categories
- Use clearly separable groups
- Test on your domain

### Running Custom Tests

```
1. Enter multiple sentences
2. Click "Run Custom Test"
3. View pairwise similarities
4. Compare consistency across models
```

## Understanding Results

### Similarity Scores

- **> 0.8**: Very similar (paraphrases, synonyms)
- **0.5 - 0.8**: Related (same topic, related concepts)
- **0.3 - 0.5**: Somewhat related (distant connection)
- **< 0.3**: Unrelated (different topics)

### Processing Times

- **< 50ms**: Very fast (real-time capable)
- **50-200ms**: Fast (interactive applications)
- **200-500ms**: Medium (batch processing)
- **> 500ms**: Slow (offline only)

### Quality vs Speed Trade-off

**When to prioritize speed:**
- Real-time search
- Autocomplete
- High-volume applications
- Resource-constrained devices

**When to prioritize quality:**
- Offline analysis
- Research applications
- High-stakes decisions
- Batch processing

## Technical Details

### Embedding Generation

All models use transformer-based architectures with:
- Mean pooling over token embeddings
- L2 normalization
- Cosine similarity for comparisons

### Similarity Calculation

```javascript
cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
```

Returns value in [-1, 1], typically [0, 1] for text.

### Analogy Solving

Vector arithmetic approach:
```
D = B - A + C
Find word with embedding closest to D
```

### Clustering Algorithm

K-means clustering:
1. Initialize k random centroids
2. Assign points to nearest centroid
3. Update centroids as cluster means
4. Repeat until convergence

## Performance Metrics

### Speed Metrics
- **Inference Time**: Time to generate embeddings
- **Batch Processing**: Time for multiple texts
- **Average Time**: Running average across all calls

### Quality Metrics
- **Similarity Score**: Cosine similarity values
- **Confidence**: Strength of predictions
- **Consistency**: Variance across similar tests

## Best Practices

### Model Selection Guidelines

**Choose MiniLM-L6-v2 when:**
- Need fast inference
- Building real-time apps
- Limited compute resources
- English text only

**Choose MPNet-base-v2 when:**
- Quality is paramount
- Offline processing is acceptable
- Have sufficient compute
- Need best retrieval performance

**Choose Multilingual when:**
- Working with multiple languages
- Need cross-lingual transfer
- Building global applications
- Translation or alignment tasks

**Choose BGE when:**
- Focused on retrieval tasks
- Need SOTA performance
- English documents
- Search applications

### Testing Strategy

1. **Start with similarity**: Easiest to interpret
2. **Test known cases**: Use examples with clear answers
3. **Try edge cases**: Test model boundaries
4. **Compare consistently**: Use same tests for all models
5. **Consider context**: Your specific use case matters most

## File Structure

```
14-embeddings-comparison/
├── index.html                  # Main UI
├── css/
│   └── embeddings-comparison.css
├── js/
│   ├── embedding-models.js     # Model loading and inference
│   ├── benchmark-tasks.js      # Task implementations
│   ├── visualization.js        # Charts and displays
│   └── comparison-app.js       # Main application
└── README.md                   # This file
```

## Dependencies

- **Transformers.js**: Model inference in browser
- **Plotly.js**: Interactive visualizations
- **Modern browser**: ES6 modules, WebGL support

## Extending the Demo

### Adding New Models

1. Update `modelConfigs` in `embedding-models.js`:
```javascript
'new-model': {
    name: 'New Model',
    fullName: 'Xenova/new-model',
    dimensions: 384,
    params: '50M'
}
```

2. Add model card in HTML

### Adding New Tasks

1. Create task method in `benchmark-tasks.js`
2. Add task panel in HTML
3. Wire up in `comparison-app.js`
4. Add visualization in `visualization.js`

### Custom Metrics

Implement in `benchmark-tasks.js`:
```javascript
async runCustomMetric(texts, modelIds) {
    // Your metric implementation
    return results;
}
```

## References

### Models

- [Sentence-BERT](https://www.sbert.net/) - Sentence embeddings with transformers
- [MPNet Paper](https://arxiv.org/abs/2004.09297) - Masked and Permuted Pre-training
- [BGE Paper](https://arxiv.org/abs/2309.07597) - C-Pack: Packaged Resources for General Chinese Embeddings

### Concepts

- [Word Embeddings](https://en.wikipedia.org/wiki/Word_embedding)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [K-means Clustering](https://en.wikipedia.org/wiki/K-means_clustering)

## Course Connection

This demo relates to:
- **Lecture 14**: Embeddings and Semantic Spaces
- **Assignment 7**: Embedding Applications
- **Concepts**: Vector representations, similarity metrics, model evaluation

---

**Last Updated**: December 2025
**Course**: PSYC 50/CS 72 - Language Models from Scratch
**Institution**: Dartmouth College
