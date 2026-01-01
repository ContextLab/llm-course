/**
 * Attention Extractor - Extract attention weights from transformer models
 * Uses Transformers.js to load models and retrieve attention patterns
 */

import { pipeline, AutoTokenizer, AutoModel } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

export class AttentionExtractor {
    constructor() {
        this.currentModel = null;
        this.currentTokenizer = null;
        this.currentModelName = null;
    }

    /**
     * Extract attention weights from a transformer model
     * @param {string} modelName - The model identifier
     * @param {string} text - Input text to analyze
     * @returns {Object} Object containing attention weights and tokens
     */
    async extractAttention(modelName, text) {
        try {
            // Load model and tokenizer if needed
            if (this.currentModelName !== modelName) {
                console.log(`Loading model: ${modelName}`);
                await this.loadModel(modelName);
            }

            console.log('Tokenizing input...');
            const inputs = await this.currentTokenizer(text, {
                return_tensors: 'pt',
                padding: true,
                truncation: true
            });

            console.log('Running model inference...');
            const outputs = await this.currentModel(inputs, {
                output_attentions: true
            });

            // Extract attention weights
            // Transformers.js returns attentions as a list of tensors
            const attentions = outputs.attentions;

            if (!attentions || attentions.length === 0) {
                throw new Error('Model did not return attention weights. Make sure to use a model that supports attention output.');
            }

            // Get tokens for display
            const tokens = this.getTokens(inputs.input_ids);

            // Process attention tensors into arrays
            const processedAttentions = this.processAttentions(attentions);

            console.log(`Extracted attention from ${processedAttentions.length} layers`);

            return {
                attentions: processedAttentions,
                tokens: tokens,
                modelName: modelName
            };

        } catch (error) {
            console.error('Error extracting attention:', error);
            throw new Error(`Failed to extract attention: ${error.message}`);
        }
    }

    /**
     * Load model and tokenizer
     * @param {string} modelName - The model identifier
     */
    async loadModel(modelName) {
        try {
            // Load tokenizer
            this.currentTokenizer = await AutoTokenizer.from_pretrained(modelName);

            // Load model (attention output is requested during inference)
            this.currentModel = await AutoModel.from_pretrained(modelName);

            this.currentModelName = modelName;
            console.log(`Model ${modelName} loaded successfully`);

        } catch (error) {
            console.error('Error loading model:', error);
            throw new Error(`Failed to load model: ${error.message}`);
        }
    }

    /**
     * Process attention tensors into nested arrays
     * @param {Array} attentions - Raw attention tensors from model
     * @returns {Array} Processed attention weights [layers][heads][query][key]
     */
    processAttentions(attentions) {
        const processed = [];

        for (let layerIdx = 0; layerIdx < attentions.length; layerIdx++) {
            const layerAttention = attentions[layerIdx];

            // Attention shape is typically [batch, heads, seq_len, seq_len]
            const attentionData = layerAttention.data;
            const shape = layerAttention.dims;

            if (!shape || shape.length !== 4) {
                console.warn(`Unexpected attention shape at layer ${layerIdx}:`, shape);
                continue;
            }

            const [batch, numHeads, seqLen, seqLen2] = shape;

            // We only process the first batch
            const layerHeads = [];

            for (let headIdx = 0; headIdx < numHeads; headIdx++) {
                const headMatrix = [];

                for (let queryIdx = 0; queryIdx < seqLen; queryIdx++) {
                    const row = [];

                    for (let keyIdx = 0; keyIdx < seqLen2; keyIdx++) {
                        // Calculate index in flat array
                        // [batch, head, query, key]
                        const idx = (0 * numHeads * seqLen * seqLen2) +
                                  (headIdx * seqLen * seqLen2) +
                                  (queryIdx * seqLen2) +
                                  keyIdx;

                        row.push(attentionData[idx]);
                    }

                    headMatrix.push(row);
                }

                layerHeads.push(headMatrix);
            }

            processed.push(layerHeads);
        }

        return processed;
    }

    /**
     * Convert input IDs to tokens for display
     * @param {Object} inputIds - Tensor containing token IDs
     * @returns {Array} Array of token strings
     */
    getTokens(inputIds) {
        try {
            // Get the data from the tensor
            const ids = Array.from(inputIds.data);

            // Decode to get tokens
            const tokens = ids.map(id => {
                const token = this.currentTokenizer.decode([id], {
                    skip_special_tokens: false
                });
                return token.trim() || `[${id}]`;
            });

            return tokens;

        } catch (error) {
            console.error('Error getting tokens:', error);
            // Fallback: return indices
            return Array.from(inputIds.data).map((_, i) => `Token ${i}`);
        }
    }

    /**
     * Get average attention across all heads for a layer
     * @param {Array} layerAttention - Attention for a single layer [heads][query][key]
     * @returns {Array} Average attention matrix [query][key]
     */
    getAverageAttention(layerAttention) {
        const numHeads = layerAttention.length;
        const seqLen = layerAttention[0].length;

        const avgMatrix = Array(seqLen).fill(null).map(() => Array(seqLen).fill(0));

        for (let head = 0; head < numHeads; head++) {
            for (let query = 0; query < seqLen; query++) {
                for (let key = 0; key < seqLen; key++) {
                    avgMatrix[query][key] += layerAttention[head][query][key];
                }
            }
        }

        // Divide by number of heads
        for (let query = 0; query < seqLen; query++) {
            for (let key = 0; key < seqLen; key++) {
                avgMatrix[query][key] /= numHeads;
            }
        }

        return avgMatrix;
    }

    /**
     * Get the top-k attended tokens for a query position
     * @param {Array} attentionRow - Attention weights for a single query [key]
     * @param {Array} tokens - Token strings
     * @param {number} k - Number of top tokens to return
     * @returns {Array} Array of {token, index, weight} objects
     */
    getTopAttendedTokens(attentionRow, tokens, k = 5) {
        const indexed = attentionRow.map((weight, idx) => ({
            token: tokens[idx],
            index: idx,
            weight: weight
        }));

        // Sort by weight descending
        indexed.sort((a, b) => b.weight - a.weight);

        return indexed.slice(0, k);
    }

    /**
     * Compute attention statistics for analysis
     * @param {Array} attentionMatrix - Single attention matrix [query][key]
     * @returns {Object} Statistics object
     */
    computeStats(attentionMatrix) {
        const flat = attentionMatrix.flat();

        const max = Math.max(...flat);
        const min = Math.min(...flat);
        const mean = flat.reduce((a, b) => a + b, 0) / flat.length;

        // Compute standard deviation
        const variance = flat.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / flat.length;
        const std = Math.sqrt(variance);

        // Find most attended positions
        const seqLen = attentionMatrix.length;
        const columnSums = Array(seqLen).fill(0);

        for (let query = 0; query < seqLen; query++) {
            for (let key = 0; key < seqLen; key++) {
                columnSums[key] += attentionMatrix[query][key];
            }
        }

        const mostAttendedIdx = columnSums.indexOf(Math.max(...columnSums));

        return {
            max,
            min,
            mean,
            std,
            mostAttendedPosition: mostAttendedIdx,
            columnSums
        };
    }

    /**
     * Normalize attention weights to [0, 1] range
     * @param {Array} attentionMatrix - Attention matrix [query][key]
     * @returns {Array} Normalized matrix
     */
    normalizeAttention(attentionMatrix) {
        const flat = attentionMatrix.flat();
        const min = Math.min(...flat);
        const max = Math.max(...flat);
        const range = max - min;

        if (range === 0) return attentionMatrix;

        return attentionMatrix.map(row =>
            row.map(val => (val - min) / range)
        );
    }
}
