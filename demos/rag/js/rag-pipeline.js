/**
 * RAG Pipeline - Main orchestrator for Retrieval Augmented Generation
 */

class RAGPipeline {
    constructor() {
        this.vectorStore = null;
        this.retriever = null;
        this.generator = null;
        this.ready = false;
        this.documents = [];
    }

    /**
     * Initialize the RAG pipeline
     */
    async initialize(onProgress = null) {
        try {
            if (onProgress) onProgress('Initializing vector store...', 0);

            // Initialize vector store
            this.vectorStore = new VectorStore();
            await this.vectorStore.initialize();

            if (onProgress) onProgress('Initializing retriever...', 30);

            // Initialize retriever
            this.retriever = new Retriever(this.vectorStore);

            if (onProgress) onProgress('Loading generator model...', 50);

            // Initialize generator
            await this.initializeGenerator();

            if (onProgress) onProgress('Loading Wikipedia articles...', 80);

            // Load Wikipedia articles
            await this.loadSampleDocuments();

            if (onProgress) onProgress('Ready!', 100);

            this.ready = true;
            console.log('RAG Pipeline initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing RAG pipeline:', error);
            throw error;
        }
    }

    /**
     * Initialize the text generation model
     */
    async initializeGenerator() {
        try {
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');

            // Use a small, efficient generation model
            this.generator = await pipeline(
                'text2text-generation',
                'Xenova/flan-t5-small'
            );

            console.log('Generator model initialized');
        } catch (error) {
            console.error('Error initializing generator:', error);
            throw error;
        }
    }

    /**
     * Load Wikipedia articles from JSON file
     * By default loads 100 articles for faster demo experience
     * Full 2000 articles available but takes 10+ minutes to index
     */
    async loadSampleDocuments(maxArticles = 100) {
        try {
            const response = await fetch('data/wikipedia-articles.json');
            const rawArticles = await response.json();

            // Limit articles for faster demo (can be overridden)
            const articlesToLoad = rawArticles.slice(0, maxArticles);

            // Transform Wikipedia articles to match expected document format
            this.documents = articlesToLoad.map((article, index) => ({
                id: `wiki-${index}`,
                title: article.title,
                content: article.content,
                metadata: {
                    source: 'Wikipedia',
                    url: article.url,
                    category: 'Encyclopedia',
                    date: '2024'
                }
            }));

            this.retriever.loadDocuments(this.documents);
            console.log(`Loaded ${this.documents.length} Wikipedia articles (of ${rawArticles.length} available)`);
        } catch (error) {
            console.error('Error loading Wikipedia articles:', error);
            throw error;
        }
    }

    /**
     * Load custom documents
     */
    loadCustomDocuments(documents) {
        this.documents = documents;
        this.retriever.loadDocuments(documents);
        console.log(`Loaded ${documents.length} custom documents`);
    }

    /**
     * Process documents (chunk and index)
     */
    async processDocuments(strategy = 'fixed', chunkSize = 200, overlap = 50, onProgress = null) {
        try {
            // Clear existing data
            this.vectorStore.clear();

            // Chunk documents
            const chunks = this.retriever.chunkDocuments(strategy, chunkSize, overlap);

            if (onProgress) {
                onProgress('Chunking complete, starting indexing...', 0, chunks.length);
            }

            // Index chunks
            await this.retriever.indexChunks((current, total) => {
                if (onProgress) {
                    onProgress(`Indexing chunk ${current}/${total}...`, current, total);
                }
            });

            console.log('Document processing complete');
            return this.retriever.getChunkingStats();
        } catch (error) {
            console.error('Error processing documents:', error);
            throw error;
        }
    }

    /**
     * Answer a query using RAG
     */
    async answerQuery(query, topK = 3, useRAG = true) {
        try {
            const startTime = performance.now();

            let answer = '';
            let retrievedChunks = [];
            let context = '';

            if (useRAG && this.retriever.getAllChunks().length > 0) {
                // Retrieve relevant chunks
                const retrievalStart = performance.now();
                retrievedChunks = await this.retriever.retrieve(query, topK);
                const retrievalTime = performance.now() - retrievalStart;

                // Format context
                context = this.retriever.formatContext(retrievedChunks);

                // Generate answer with context
                const generationStart = performance.now();
                const prompt = this.buildPrompt(query, context);
                answer = await this.generate(prompt);
                const generationTime = performance.now() - generationStart;

                const totalTime = performance.now() - startTime;

                return {
                    answer,
                    retrievedChunks,
                    context,
                    query,
                    useRAG: true,
                    timing: {
                        retrieval: retrievalTime,
                        generation: generationTime,
                        total: totalTime
                    }
                };
            } else {
                // Generate answer without RAG
                const generationStart = performance.now();
                answer = await this.generate(query);
                const generationTime = performance.now() - generationStart;
                const totalTime = performance.now() - startTime;

                return {
                    answer,
                    retrievedChunks: [],
                    context: '',
                    query,
                    useRAG: false,
                    timing: {
                        retrieval: 0,
                        generation: generationTime,
                        total: totalTime
                    }
                };
            }
        } catch (error) {
            console.error('Error answering query:', error);
            throw error;
        }
    }

    /**
     * Build prompt with retrieved context
     */
    buildPrompt(query, context) {
        return `Answer the following question based on the context provided. Be concise and accurate.

Context:
${context}

Question: ${query}

Answer:`;
    }

    /**
     * Generate text using the language model
     */
    async generate(prompt) {
        try {
            const output = await this.generator(prompt, {
                max_length: 200,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true
            });

            return output[0].generated_text;
        } catch (error) {
            console.error('Error generating text:', error);
            throw error;
        }
    }

    /**
     * Compare RAG vs non-RAG answers
     */
    async compareAnswers(query, topK = 3) {
        const withRAG = await this.answerQuery(query, topK, true);
        const withoutRAG = await this.answerQuery(query, topK, false);

        return {
            withRAG,
            withoutRAG,
            query
        };
    }

    /**
     * Get embeddings for visualization
     */
    async getEmbeddingsForVisualization(query = null) {
        const data = this.vectorStore.getAllEmbeddings();

        let queryEmbedding = null;
        if (query) {
            queryEmbedding = await this.vectorStore.embed(query);
        }

        // Reduce dimensionality for visualization
        const reduced2D = this.reduceDimensionsUMAP(data.embeddings, 2);
        const reduced3D = this.reduceDimensionsUMAP(data.embeddings, 3);

        let queryPoint2D = null;
        let queryPoint3D = null;

        if (queryEmbedding) {
            const allEmbeddings = [...data.embeddings, queryEmbedding];
            const allReduced2D = this.reduceDimensionsUMAP(allEmbeddings, 2);
            const allReduced3D = this.reduceDimensionsUMAP(allEmbeddings, 3);

            queryPoint2D = allReduced2D[allReduced2D.length - 1];
            queryPoint3D = allReduced3D[allReduced3D.length - 1];
        }

        return {
            chunks: data.chunks,
            embeddings2D: reduced2D,
            embeddings3D: reduced3D,
            queryPoint2D,
            queryPoint3D
        };
    }

    /**
     * Simple dimensionality reduction (PCA approximation)
     */
    reduceDimensionsUMAP(embeddings, dimensions = 2) {
        if (embeddings.length === 0) return [];

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

        // Simple projection (not real PCA, but works for visualization)
        // In production, use actual UMAP or t-SNE library
        return centered.map(emb => {
            if (dimensions === 2) {
                // Use first two principal components approximation
                return [
                    emb.slice(0, 20).reduce((a, b) => a + b, 0) / 20,
                    emb.slice(20, 40).reduce((a, b) => a + b, 0) / 20
                ];
            } else if (dimensions === 3) {
                return [
                    emb.slice(0, 20).reduce((a, b) => a + b, 0) / 20,
                    emb.slice(20, 40).reduce((a, b) => a + b, 0) / 20,
                    emb.slice(40, 60).reduce((a, b) => a + b, 0) / 20
                ];
            }
        });
    }

    /**
     * Get pipeline statistics
     */
    getStats() {
        return {
            ready: this.ready,
            documentsLoaded: this.documents.length,
            chunking: this.retriever.getChunkingStats(),
            vectorStore: this.vectorStore.getStats()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAGPipeline;
}
