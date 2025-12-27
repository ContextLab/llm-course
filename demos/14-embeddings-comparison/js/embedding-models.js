/**
 * Embedding Models Manager
 * Handles loading and managing multiple embedding models
 */

export class EmbeddingModelsManager {
    constructor() {
        this.models = new Map();
        this.modelConfigs = {
            'all-MiniLM-L6-v2': {
                name: 'MiniLM-L6-v2',
                fullName: 'Xenova/all-MiniLM-L6-v2',
                dimensions: 384,
                params: '22M'
            },
            'all-mpnet-base-v2': {
                name: 'MPNet-base-v2',
                fullName: 'Xenova/all-mpnet-base-v2',
                dimensions: 768,
                params: '110M'
            },
            'paraphrase-multilingual-MiniLM-L12-v2': {
                name: 'Multilingual-MiniLM',
                fullName: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
                dimensions: 384,
                params: '118M'
            },
            'bge-small-en-v1.5': {
                name: 'BGE-small-en',
                fullName: 'Xenova/bge-small-en-v1.5',
                dimensions: 384,
                params: '33M'
            }
        };
        this.pipeline = null;
    }

    async loadModels(modelIds, progressCallback) {
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');

        for (let i = 0; i < modelIds.length; i++) {
            const modelId = modelIds[i];
            const config = this.modelConfigs[modelId];

            if (progressCallback) {
                progressCallback({
                    current: i,
                    total: modelIds.length,
                    modelName: config.name
                });
            }

            const extractor = await pipeline('feature-extraction', config.fullName);
            this.models.set(modelId, {
                extractor,
                config,
                performance: {
                    avgTime: 0,
                    numCalls: 0,
                    scores: []
                }
            });
        }

        return true;
    }

    async embed(modelId, text) {
        if (!this.models.has(modelId)) {
            throw new Error(`Model ${modelId} not loaded`);
        }

        const model = this.models.get(modelId);
        const startTime = performance.now();

        const output = await model.extractor(text, {
            pooling: 'mean',
            normalize: true
        });

        const endTime = performance.now();
        const time = endTime - startTime;

        // Update performance metrics
        model.performance.numCalls++;
        const prevAvg = model.performance.avgTime;
        model.performance.avgTime = prevAvg + (time - prevAvg) / model.performance.numCalls;

        return {
            embedding: Array.from(output.data),
            time
        };
    }

    cosineSimilarity(vecA, vecB) {
        // Handle vector length mismatch
        if (vecA.length !== vecB.length) {
            console.warn('Vector length mismatch in cosine similarity calculation');
            return 0;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        // Handle zero vectors (avoid division by zero)
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator === 0) {
            return 0;
        }

        return dotProduct / denominator;
    }

    getLoadedModels() {
        return Array.from(this.models.keys());
    }

    getModelConfig(modelId) {
        return this.modelConfigs[modelId];
    }

    getModelPerformance(modelId) {
        return this.models.get(modelId)?.performance;
    }
}
