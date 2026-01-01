/**
 * Semantic Search Implementation using Embeddings
 * Uses Transformers.js for generating embeddings
 */

export class SemanticSearch {
    constructor() {
        this.model = null;
        this.modelName = 'Xenova/all-MiniLM-L6-v2';
        this.documents = [];
        this.embeddings = [];
        this.isReady = false;
    }

    /**
     * Load the embedding model
     */
    async loadModel(modelName = null) {
        if (modelName) {
            this.modelName = modelName;
        }

        try {
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
            this.model = await pipeline('feature-extraction', this.modelName);
            this.isReady = true;
            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            throw new Error('Failed to load embedding model');
        }
    }

    /**
     * Generate embedding for a single text
     */
    async embed(text) {
        if (!this.isReady) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        const output = await this.model(text, {
            pooling: 'mean',
            normalize: true
        });

        return Array.from(output.data);
    }

    /**
     * Build index from documents
     */
    async buildIndex(documents, statusCallback = null) {
        this.documents = documents;
        this.embeddings = [];

        const batchSize = 10;
        const numBatches = Math.ceil(documents.length / batchSize);

        for (let i = 0; i < numBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, documents.length);
            const batch = documents.slice(start, end);

            if (statusCallback) {
                statusCallback({
                    current: end,
                    total: documents.length,
                    progress: (end / documents.length) * 100
                });
            }

            // Process batch
            for (const doc of batch) {
                const embedding = await this.embed(doc);
                this.embeddings.push(embedding);
            }
        }

        return true;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    /**
     * Search for query and return top-k results
     */
    async search(query, topK = 10) {
        const startTime = performance.now();

        if (!this.isReady) {
            throw new Error('Model not loaded');
        }

        if (this.embeddings.length === 0) {
            throw new Error('No documents indexed');
        }

        // Generate query embedding
        const queryEmbedding = await this.embed(query);

        // Calculate similarities with all documents
        const scores = this.embeddings.map((docEmbedding, index) => ({
            index,
            score: this.cosineSimilarity(queryEmbedding, docEmbedding),
            document: this.documents[index]
        }));

        // Sort by similarity (descending) and take top-k
        const results = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        // Scores are already normalized (cosine similarity is in [-1, 1], typically [0, 1] for text)
        results.forEach(result => {
            result.normalizedScore = result.score;
        });

        const endTime = performance.now();
        const avgScore = results.length > 0
            ? results.reduce((sum, r) => sum + r.normalizedScore, 0) / results.length
            : 0;

        return {
            results,
            time: endTime - startTime,
            avgScore
        };
    }

    /**
     * Find k-nearest neighbors for a document
     */
    findNearestNeighbors(docIndex, k = 5) {
        if (docIndex < 0 || docIndex >= this.embeddings.length) {
            throw new Error('Invalid document index');
        }

        const targetEmbedding = this.embeddings[docIndex];

        const similarities = this.embeddings.map((embedding, index) => ({
            index,
            similarity: index === docIndex ? -1 : this.cosineSimilarity(targetEmbedding, embedding),
            document: this.documents[index]
        }));

        return similarities
            .filter(item => item.similarity >= 0)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, k);
    }

    /**
     * Get embedding dimension
     */
    getEmbeddingDimension() {
        return this.embeddings.length > 0 ? this.embeddings[0].length : 0;
    }

    /**
     * Get model information
     */
    getModelInfo() {
        return {
            name: this.modelName,
            dimension: this.getEmbeddingDimension(),
            isReady: this.isReady,
            numDocuments: this.documents.length
        };
    }
}
