# RAG (Retrieval Augmented Generation) System Demo

An interactive demonstration of a complete Retrieval Augmented Generation pipeline, showcasing how LLMs can be enhanced with external knowledge through document retrieval.

## Features

### 1. Document Management
- **Pre-loaded Sample Documents**: 8 curated documents about LLMs, transformers, RAG, and related topics
- **Custom Upload**: Support for uploading custom text or JSON documents
- **Document Browser**: View all loaded documents with metadata

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
- **FLAN-T5 Model**: Uses lightweight but capable text generation model
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
Pre-configured example queries to demonstrate the system:
- "What is retrieval augmented generation?"
- "Explain the transformer architecture"
- "What are vector embeddings?"
- "How do you evaluate RAG systems?"
- "What are text chunking strategies?"
- "What are advanced RAG techniques?"

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
Click "Initialize System" to load the embedding model, retriever, and generator. This takes 20-30 seconds on first load (models are cached).

### 2. Review Documents
Browse the 8 pre-loaded sample documents or upload your own text files.

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

1. Initialize system → Wait for models to load
2. Review sample documents → See what knowledge is available
3. Set chunking to "Fixed size", 200 words, 50 overlap → Click process
4. View 2D visualization → Understand document distribution
5. Ask: "What is retrieval augmented generation?" → Compare both modes
6. Observe that RAG provides more detailed, accurate answer with sources
7. Try different chunking strategies → See impact on retrieval quality

## Performance Considerations

- **First Load**: 20-30 seconds (downloading models)
- **Subsequent Loads**: <5 seconds (cached models)
- **Query Processing**: 2-5 seconds typical
- **Embedding Generation**: ~0.5 seconds per chunk
- **Model Sizes**:
  - Embedding model: ~25MB
  - Generation model: ~150MB

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

- Uses smaller models (FLAN-T5-small) for browser compatibility
- Simplified PCA for visualization (not true UMAP/t-SNE)
- In-memory vector store (limited to thousands of chunks)
- No persistent storage (refreshing resets everything)

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
