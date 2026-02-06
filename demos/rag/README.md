# RAG (Retrieval Augmented Generation) System Demo

An interactive demonstration of a complete Retrieval Augmented Generation pipeline, showcasing how LLMs can be enhanced with external knowledge through document retrieval.

**Now featuring 2000 real Wikipedia articles as the knowledge base!**

## Features

### 1. Document Management
- **Real Wikipedia Dataset**: Choose from 100, 500, or 2000 Wikipedia articles covering diverse topics (science, history, arts, technology, and more)
- **Custom Upload**: Support for uploading custom text or JSON documents
- **Document Browser**: View loaded articles with links to original Wikipedia sources

### 2. Document Chunking Strategies
- **Fixed-size Chunking**: Split documents into fixed-length segments with configurable overlap
- **Sentence-based Chunking**: Group sentences into coherent chunks
- **Paragraph-based Chunking**: Use natural paragraph boundaries
- **Configurable Parameters**: Adjust chunk size and overlap for optimal retrieval

### 3. Vector Embeddings & Indexing
- **Transformers.js Integration**: Uses `all-MiniLM-L6-v2` for semantic embeddings
- **Automatic Indexing**: Generates embeddings for all chunks with progress tracking
- **Vector Store**: Efficient in-memory storage of embeddings
- **Statistics Dashboard**: View chunking statistics and metrics

### 4. Semantic Search & Retrieval
- **Cosine Similarity**: Find most relevant document chunks
- **Top-K Retrieval**: Configure number of documents to retrieve
- **Relevance Scores**: See exact similarity percentages for each retrieved chunk
- **Context Formatting**: Automatically format retrieved chunks for the generator

### 5. Context-Aware Generation
- **SmolLM2 Model**: Uses HuggingFace's SmolLM2 (135M or 360M parameters) for text generation
- **Auto Model Selection**: Automatically selects model size based on device RAM
- **WebGPU/WASM Support**: Runs via WebGPU when available, falls back to WASM
- **Prompt Engineering**: Automatically constructs prompts with retrieved context
- **Citation Support**: Links answers to source documents

### 6. Interactive Visualizations
- **2D/3D Embedding Visualization**: See document chunks in vector space using Plotly
- **Query Visualization**: Plot your query alongside document embeddings
- **Color-coded Documents**: Each document has a unique color in the visualization
- **Interactive Exploration**: Hover over points to see document content

### 7. Comparison Modes
- **With RAG vs Without RAG**: Side-by-side comparison of answers
- **Performance Metrics**: Timing for retrieval, generation, and total latency
- **Quality Assessment**: Observe how RAG improves factual accuracy

### 8. Sample Queries
Pre-configured example queries against the Wikipedia dataset:
- "Who is Stef Chura?"
- "What is buoyancy?"
- "What is inpainting?"
- "Tell me about the history of Allahabad"
- "What is a Sōryū-class submarine?"
- "Who was Stephen E. Ambrose?"

## Technical Implementation

### Architecture
```
User Query
    ↓
Query Embedding (Transformers.js)
    ↓
Semantic Search (Cosine Similarity)
    ↓
Retrieve Top-K Chunks
    ↓
Format Context + Query
    ↓
Generate Answer (FLAN-T5)
    ↓
Display with Sources
```

### Key Components

#### 1. Vector Store (`vector-store.js`)
- Manages document embeddings
- Implements cosine similarity search
- Handles model initialization and embedding generation
- Provides dimensionality reduction for visualization

#### 2. Retriever (`retriever.js`)
- Implements multiple chunking strategies
- Processes and indexes documents
- Formats retrieved context
- Provides chunking statistics

#### 3. RAG Pipeline (`rag-pipeline.js`)
- Orchestrates the entire RAG workflow
- Manages initialization and model loading
- Handles query processing
- Implements comparison functionality
- Generates visualizations

#### 4. Frontend (`index.html`)
- Progressive UI that reveals sections as you complete steps
- Real-time progress indicators
- Interactive visualizations with Plotly
- Responsive design for various screen sizes

### Technologies Used
- **Transformers.js**: Browser-based ML models (embeddings and generation)
- **Plotly.js**: Interactive 2D/3D visualizations
- **Vanilla JavaScript**: No framework dependencies
- **Modern CSS**: Gradient backgrounds, flexbox/grid layouts, smooth animations

## Usage Instructions

### 1. Initialize the System
Select the number of Wikipedia articles to load (100 recommended for faster demo, up to 2000 for more comprehensive coverage). Click "Initialize System & Load Wikipedia Articles" to load the embedding model, retriever, generator, and articles.

### 2. Review Documents
Browse the loaded Wikipedia articles (first 20 shown as preview) or upload your own text files.

### 3. Configure Chunking
Select a chunking strategy and parameters:
- **Fixed size**: Good for consistent chunk sizes (recommended: 200 words, 50 overlap)
- **Sentence-based**: Preserves linguistic boundaries (recommended: 5 sentences)
- **Paragraph-based**: Maintains topical coherence

Click "Chunk & Index Documents" to process.

### 4. Visualize Embeddings
View your document chunks in 2D or 3D vector space. Points that are close together are semantically similar.

### 5. Ask Questions
- Enter a question in the query box
- Choose number of documents to retrieve (Top K)
- Select a mode:
  - **With RAG**: Uses retrieved context
  - **Without RAG**: Model knowledge only
  - **Compare Both**: Side-by-side comparison

### 6. Analyze Results
- View retrieved documents with relevance scores
- Read the generated answer
- Check performance timing
- Update visualization to see query position in embedding space

## Example Workflow

1. Select 100 articles (default) and initialize system
2. Review loaded Wikipedia articles
3. Set chunking to "Fixed size", 200 words, 50 overlap → Click process
4. View 2D visualization → Understand document distribution
5. Ask: "Who is Stef Chura?" → Compare both modes
6. Observe that RAG retrieves and cites the specific Wikipedia article
7. Try different chunking strategies → See impact on retrieval quality

## Performance Considerations

- **Model Loading**: 15-30 seconds first time (models cached after)
- **100 articles**: Fast demo experience (~5 seconds to load, ~300 chunks)
- **500 articles**: Moderate (~10 seconds, ~1500 chunks)
- **2000 articles**: Comprehensive but slower (~30 seconds, ~6000 chunks)
- **Query Processing**: 30-120 seconds depending on model and device
- **Data Sizes**:
  - Wikipedia articles: ~5MB JSON (full dataset)
  - Embedding model: ~25MB
  - SmolLM2 135M: ~170MB
  - SmolLM2 360M: ~370MB

## Educational Value

This demo teaches:
1. **RAG Fundamentals**: Complete pipeline from retrieval to generation
2. **Chunking Strategies**: Impact of different segmentation approaches
3. **Semantic Search**: How vector similarity enables semantic retrieval
4. **Embedding Spaces**: Visualization of high-dimensional representations
5. **Context Enhancement**: How retrieved information improves generation
6. **System Evaluation**: Comparing with/without RAG, timing analysis

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (14+)
- Mobile: ⚠️ Limited (large models may cause memory issues)

## Limitations

- Uses smaller models (SmolLM2 135M/360M) for browser compatibility
- Simplified PCA for visualization (not true UMAP/t-SNE)
- In-memory vector store (handles up to 2000 articles, ~6000 chunks)
- No persistent storage (refreshing resets everything)
- Wikipedia dataset is static (not dynamically updated)
- Generation can be slow (30-120 seconds per query)

## Extensions & Improvements

Potential enhancements:
- Add PDF upload support with PDF.js
- Implement true UMAP/t-SNE for visualization
- Add re-ranking step after initial retrieval
- Support for multi-hop retrieval
- Query expansion techniques
- Export results and statistics
- Persistent storage with IndexedDB
- Larger/better models when available in browser

## Educational Context

This demo is part of an LLM course curriculum demonstrating:
- How RAG addresses LLM limitations (hallucination, outdated knowledge)
- The importance of chunking strategy on retrieval quality
- Vector embeddings as semantic representations
- End-to-end system design and evaluation

## License

Educational use - part of LLM course materials
