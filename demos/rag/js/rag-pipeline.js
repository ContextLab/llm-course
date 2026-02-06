/**
 * RAG Pipeline - Main orchestrator for Retrieval Augmented Generation
 * Uses SmolLM2 for text generation with RAM-based model selection
 */

class RAGPipeline {
    static _wasmMaxMB = null;
    static _webGPUAvailable = null;

    static probeWasmMemory() {
        if (RAGPipeline._wasmMaxMB !== null) return RAGPipeline._wasmMaxMB;
        let min = 1, max = 65536, best = min;
        while (min <= max) {
            const mid = Math.floor((min + max) / 2);
            try {
                new WebAssembly.Memory({ initial: 1, maximum: mid });
                best = mid;
                min = mid + 1;
            } catch (e) { max = mid - 1; }
        }
        RAGPipeline._wasmMaxMB = Math.floor((best * 64) / 1024);
        console.log(`[RAG] WASM memory limit: ${RAGPipeline._wasmMaxMB}MB`);
        return RAGPipeline._wasmMaxMB;
    }

    static async checkWebGPU() {
        if (RAGPipeline._webGPUAvailable !== null) return RAGPipeline._webGPUAvailable;
        try {
            if (!navigator.gpu) { RAGPipeline._webGPUAvailable = false; return false; }
            const adapter = await navigator.gpu.requestAdapter();
            RAGPipeline._webGPUAvailable = !!adapter;
            console.log(`[RAG] WebGPU: ${RAGPipeline._webGPUAvailable ? 'available' : 'not available'}`);
            return RAGPipeline._webGPUAvailable;
        } catch (e) { RAGPipeline._webGPUAvailable = false; return false; }
    }

    constructor() {
        this.vectorStore = null;
        this.retriever = null;
        this.generator = null;
        this.ready = false;
        this.documents = [];
        this.currentModel = null;
        this.device = 'wasm';
        
        this.models = [
            { name: 'onnx-community/SmolLM2-135M-Instruct-ONNX', displayName: 'SmolLM2 135M', dtype: 'q4', wasmMinMB: 500, minRAM: 2 },
            { name: 'onnx-community/SmolLM2-360M-Instruct-ONNX', displayName: 'SmolLM2 360M', dtype: 'q4', wasmMinMB: 900, minRAM: 4 }
        ];
    }

    getDefaultModelIndex() {
        const deviceRAM = navigator.deviceMemory || 4;
        const wasmMaxMB = RAGPipeline.probeWasmMemory();
        const hasWebGPU = RAGPipeline._webGPUAvailable === true;
        
        for (let i = this.models.length - 1; i >= 0; i--) {
            const model = this.models[i];
            if (deviceRAM < model.minRAM) continue;
            if (!hasWebGPU && wasmMaxMB < model.wasmMinMB) continue;
            console.log(`[RAG] Auto-selecting ${model.displayName}`);
            return i;
        }
        return 0;
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

    async initializeGenerator() {
        try {
            await RAGPipeline.checkWebGPU();
            
            const transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');
            const { pipeline, env } = transformers;
            
            env.allowLocalModels = false;
            env.useBrowserCache = true;
            
            this.device = RAGPipeline._webGPUAvailable ? 'webgpu' : 'wasm';
            const modelIndex = this.getDefaultModelIndex();
            
            for (let i = modelIndex; i >= 0; i--) {
                const model = this.models[i];
                try {
                    console.log(`[RAG] Loading ${model.displayName} (${this.device})...`);
                    this.generator = await pipeline('text-generation', model.name, {
                        dtype: model.dtype,
                        device: this.device
                    });
                    this.currentModel = model;
                    console.log(`[RAG] Generator loaded: ${model.displayName}`);
                    return;
                } catch (e) {
                    console.warn(`[RAG] Failed to load ${model.displayName}:`, e.message);
                    if (this.device === 'webgpu') {
                        console.log('[RAG] Retrying with WASM...');
                        this.device = 'wasm';
                        try {
                            this.generator = await pipeline('text-generation', model.name, {
                                dtype: model.dtype,
                                device: 'wasm'
                            });
                            this.currentModel = model;
                            console.log(`[RAG] Generator loaded: ${model.displayName} (WASM fallback)`);
                            return;
                        } catch (e2) {
                            console.warn(`[RAG] WASM fallback failed:`, e2.message);
                        }
                    }
                }
            }
            throw new Error('Failed to load any generator model');
        } catch (error) {
            console.error('[RAG] Error initializing generator:', error);
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
                // Generate answer without RAG (no context)
                const generationStart = performance.now();
                const messages = this.buildPrompt(query, null);
                answer = await this.generate(messages);
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
     * Build prompt with retrieved context as chat messages
     */
    buildPrompt(query, context) {
        const systemContent = context
            ? `You are a helpful assistant. Answer based on the provided context. Be concise and accurate.\n\nContext:\n${context}`
            : 'You are a helpful assistant. Be concise and accurate.';
        return [
            { role: 'system', content: systemContent },
            { role: 'user', content: query }
        ];
    }

    /**
     * Generate text using SmolLM2 with chat messages format
     */
    async generate(messages) {
        try {
            const result = await this.generator(messages, {
                max_new_tokens: 256,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true
            });

            const generated = result[0].generated_text;
            if (Array.isArray(generated)) {
                return generated[generated.length - 1]?.content || '';
            }
            return generated;
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
