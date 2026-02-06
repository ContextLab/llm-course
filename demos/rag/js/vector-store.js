/**
 * Vector Store for RAG System
 * Manages document embeddings and similarity search
 */

class VectorStore {
    constructor() {
        this.chunks = [];
        this.embeddings = [];
        this.embeddingModel = null;
        this.tokenizer = null;
        this.ready = false;
    }

    /**
     * Initialize the embedding model
     */
    async initialize() {
        try {
            console.log('Initializing embedding model...');

            // Use a small, efficient embedding model (v3 for WebGPU support)
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');

            // Create feature extraction pipeline for embeddings
            this.embeddingModel = await pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2'
            );

            this.ready = true;
            console.log('Embedding model initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing embedding model:', error);
            throw error;
        }
    }

    /**
     * Add chunks to the vector store with batched processing
     * Yields to UI thread periodically to prevent freezing
     */
    async addChunks(chunks, onProgress = null) {
        const newEmbeddings = [];
        const BATCH_SIZE = 5;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            if (onProgress) {
                onProgress(i + 1, chunks.length);
            }

            const embedding = await this.embed(chunk.text);
            newEmbeddings.push(embedding);

            // Yield to UI thread every BATCH_SIZE chunks to prevent freezing
            if ((i + 1) % BATCH_SIZE === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        this.chunks.push(...chunks);
        this.embeddings.push(...newEmbeddings);

        console.log(`Added ${chunks.length} chunks to vector store. Total: ${this.chunks.length}`);
    }

    /**
     * Generate embedding for text
     */
    async embed(text) {
        if (!this.ready) {
            throw new Error('Embedding model not initialized');
        }

        try {
            // Generate embedding
            const output = await this.embeddingModel(text, {
                pooling: 'mean',
                normalize: true
            });

            // Convert to array
            const embedding = Array.from(output.data);

            return embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    /**
     * Search for similar chunks
     */
    async search(query, topK = 5) {
        if (this.chunks.length === 0) {
            return [];
        }

        // Generate query embedding
        const queryEmbedding = await this.embed(query);

        // Calculate similarities
        const similarities = this.embeddings.map((embedding, index) => ({
            index,
            chunk: this.chunks[index],
            similarity: this.cosineSimilarity(queryEmbedding, embedding)
        }));

        // Sort by similarity (descending)
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Return top K results
        return similarities.slice(0, topK);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Get all embeddings for visualization
     */
    getAllEmbeddings() {
        return {
            embeddings: this.embeddings,
            chunks: this.chunks
        };
    }

    /**
     * Reduce embedding dimensionality for visualization using PCA
     */
    reduceDimensions(embeddings, dimensions = 2) {
        if (embeddings.length === 0) return [];

        // Simple PCA implementation
        const n = embeddings.length;
        const d = embeddings[0].length;

        // Center the data
        const mean = new Array(d).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < d; j++) {
                mean[j] += embeddings[i][j] / n;
            }
        }

        const centered = embeddings.map(emb =>
            emb.map((val, j) => val - mean[j])
        );

        // For simplicity, just take the first 'dimensions' components
        // In a real implementation, you'd compute actual principal components
        return centered.map(emb => emb.slice(0, dimensions));
    }

    /**
     * Clear the vector store
     */
    clear() {
        this.chunks = [];
        this.embeddings = [];
        console.log('Vector store cleared');
    }

    /**
     * Get statistics about the vector store
     */
    getStats() {
        return {
            totalChunks: this.chunks.length,
            embeddingDimension: this.embeddings.length > 0 ? this.embeddings[0].length : 0,
            ready: this.ready
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VectorStore;
}
