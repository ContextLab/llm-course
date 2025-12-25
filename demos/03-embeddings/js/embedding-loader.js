/**
 * EmbeddingLoader - Handles loading embedding models and datasets
 * Supports both pre-computed embeddings and on-the-fly embedding with Transformers.js
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// Disable local model loading
env.allowLocalModels = false;

export class EmbeddingLoader {
    constructor() {
        this.currentModel = null;
        this.modelType = null;
        this.modelId = null;
        this.pipeline = null;
        this.precomputedEmbeddings = null;
    }

    /**
     * Load an embedding model
     */
    async loadModel(modelId) {
        this.modelId = modelId;
        this.updateStatus(`Loading model: ${modelId}...`);

        try {
            // All models use Transformers.js for real embeddings
            this.modelType = 'transformers';
            const modelName = this.getTransformersModelName(modelId);
            this.pipeline = await pipeline('feature-extraction', modelName);
            this.updateStatus(`Model ${modelId} loaded successfully`);
        } catch (error) {
            this.updateStatus(`Error loading model: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get HuggingFace model name from ID
     */
    getTransformersModelName(modelId) {
        const modelMap = {
            'all-MiniLM-L6-v2': 'Xenova/all-MiniLM-L6-v2',
            'all-mpnet-base-v2': 'Xenova/all-mpnet-base-v2',
            'paraphrase-multilingual': 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
        };
        return modelMap[modelId] || modelId;
    }


    /**
     * Load a dataset
     */
    async loadDataset(datasetId) {
        this.updateStatus(`Loading dataset: ${datasetId}...`);

        try {
            let dataset;

            if (datasetId === 'custom-text' || datasetId === 'custom-file') {
                dataset = await this.loadCustomDataset(datasetId);
            } else {
                dataset = await this.loadPreloadedDataset(datasetId);
            }

            // Compute embeddings if not pre-computed
            if (!dataset.embeddings) {
                dataset.embeddings = await this.computeEmbeddings(dataset.texts);
            }

            this.updateStatus(`Dataset loaded: ${dataset.texts.length} samples`);
            return dataset;

        } catch (error) {
            this.updateStatus(`Error loading dataset: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load pre-loaded datasets
     */
    async loadPreloadedDataset(datasetId) {
        let dataFile;

        // Map dataset IDs to their data files
        if (datasetId === 'wikipedia') {
            dataFile = 'data/wikipedia-embeddings.json';
        } else {
            dataFile = `data/${datasetId}-dataset.json`;
        }

        const response = await fetch(dataFile);
        if (!response.ok) {
            throw new Error(`Failed to load dataset: ${datasetId}`);
        }

        const data = await response.json();

        // Handle the new Wikipedia format with array of objects
        if (datasetId === 'wikipedia' && Array.isArray(data)) {
            return {
                texts: data.map(item => item.text),
                labels: data.map(item => item.category),
                titles: data.map(item => item.title)
            };
        }

        return data;
    }


    /**
     * Load custom dataset
     */
    async loadCustomDataset(datasetId) {
        // This would be implemented with a file upload or text input modal
        throw new Error('Custom dataset loading not yet implemented in this demo');
    }

    /**
     * Compute embeddings for texts
     */
    async computeEmbeddings(texts) {
        if (this.modelType === 'transformers') {
            return this.getTransformersEmbeddings(texts);
        }
        throw new Error('No model loaded');
    }

    /**
     * Get embeddings using Transformers.js
     */
    async getTransformersEmbeddings(texts) {
        const embeddings = [];

        // Process in batches to show progress
        const batchSize = 10;
        const totalBatches = Math.ceil(texts.length / batchSize);

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchEmbeddings = await this.pipeline(batch, { pooling: 'mean', normalize: true });

            // Convert to regular arrays
            for (let j = 0; j < batch.length; j++) {
                const embedding = Array.from(batchEmbeddings[j].data);
                embeddings.push(embedding);
            }

            const currentBatch = Math.floor(i / batchSize) + 1;
            const percentage = Math.round((embeddings.length / texts.length) * 100);
            this.updateStatus(`Embedding progress: ${embeddings.length}/${texts.length} (${percentage}%) - Batch ${currentBatch}/${totalBatches}`);

            // Update loading message if available
            const loadingProgress = document.getElementById('loading-progress');
            if (loadingProgress) {
                loadingProgress.textContent = `Processing ${embeddings.length}/${texts.length} texts (${percentage}%)`;
            }
        }

        return embeddings;
    }

    /**
     * Embed a single text
     */
    async embedText(text) {
        if (this.modelType === 'transformers') {
            const output = await this.pipeline(text, { pooling: 'mean', normalize: true });
            return Array.from(output.data);
        }
        throw new Error('No model loaded');
    }

    /**
     * Update status display
     */
    updateStatus(message) {
        const statusEl = document.getElementById('model-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
        console.log(`[EmbeddingLoader] ${message}`);
    }
}
