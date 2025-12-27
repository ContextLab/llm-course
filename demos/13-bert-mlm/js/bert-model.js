/**
 * BERT Model wrapper using Transformers.js
 * Handles masked language modeling and attention extraction
 */

export class BERTModel {
    constructor(modelId = 'bert-base-uncased') {
        this.modelId = modelId;
        this.model = null;
        this.tokenizer = null;
        this.maskTokenId = null;
    }

    /**
     * Load the model and tokenizer
     */
    async load() {
        console.log(`Loading model: ${this.modelId}`);

        try {
            // Import Transformers.js
            const { pipeline, AutoTokenizer, AutoModelForMaskedLM } = window.Transformers;

            // Load tokenizer
            this.tokenizer = await AutoTokenizer.from_pretrained(this.modelId);
            console.log('Tokenizer loaded');

            // Load model
            this.model = await AutoModelForMaskedLM.from_pretrained(this.modelId, {
                quantized: false,  // Use full precision for better quality
                output_attentions: true  // Enable attention outputs for visualization
            });
            console.log('Model loaded');

            // Get mask token ID
            this.maskTokenId = this.tokenizer.mask_token_id;
            console.log(`Mask token ID: ${this.maskTokenId}`);

            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            throw new Error('Failed to load model: ' + error.message);
        }
    }

    /**
     * Tokenize text and return tokens
     */
    async tokenize(text) {
        if (!this.tokenizer) {
            throw new Error('Tokenizer not loaded');
        }

        const encoded = await this.tokenizer(text, {
            return_tensors: false,
            add_special_tokens: true
        });

        // Convert token IDs back to tokens
        const tokens = encoded.input_ids.map(id => {
            return this.tokenizer.decode([id], { skip_special_tokens: false });
        });

        return tokens;
    }

    /**
     * Predict masked tokens
     */
    async predictMasked(tokens, maskedIndices, topK = 5, minProb = 0.01) {
        if (!this.model || !this.tokenizer) {
            throw new Error('Model not loaded');
        }

        console.log('Predicting masked tokens:', maskedIndices);

        // Convert tokens back to token IDs
        const inputIds = [];
        for (let i = 0; i < tokens.length; i++) {
            // Get token ID for each token
            const tokenId = this.tokenizer.model.convert_tokens_to_ids([tokens[i]])[0];
            inputIds.push(tokenId);
        }

        // Replace masked positions with [MASK] token ID
        const maskedInputIds = [...inputIds];
        maskedIndices.forEach(idx => {
            maskedInputIds[idx] = this.maskTokenId;
        });

        // Create input tensor
        const { Tensor } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
        const inputs = {
            input_ids: new Tensor('int64', BigInt64Array.from(maskedInputIds.map(id => BigInt(id))), [1, maskedInputIds.length]),
            attention_mask: new Tensor('int64', BigInt64Array.from(maskedInputIds.map(() => BigInt(1))), [1, maskedInputIds.length])
        };

        // Run model with attention outputs
        const outputs = await this.model({
            ...inputs,
            output_attentions: true
        });

        // Extract logits and attentions
        const logits = outputs.logits;
        const attentions = outputs.attentions;

        // Get predictions for each masked position
        const predictions = [];

        for (let idx of maskedIndices) {
            // Get logits for this position
            const positionLogits = logits[0][idx];

            // Apply softmax
            const probs = this.softmax(Array.from(positionLogits.data));

            // Get top-K predictions
            const topPredictions = this.getTopK(probs, topK, minProb);

            predictions.push(topPredictions);
        }

        // Process attentions
        const processedAttentions = this.processAttentions(attentions);

        return {
            predictions,
            attentions: processedAttentions,
            logits: logits
        };
    }

    /**
     * Apply softmax to convert logits to probabilities
     */
    softmax(logits) {
        const maxLogit = Math.max(...logits);
        const exps = logits.map(l => Math.exp(l - maxLogit));
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return exps.map(e => e / sumExps);
    }

    /**
     * Get top-K predictions
     */
    getTopK(probs, k, minProb = 0.01) {
        const indexed = probs.map((prob, idx) => ({ prob, idx }));

        // Filter by minimum probability
        const filtered = indexed.filter(item => item.prob >= minProb);

        // Sort by probability (descending)
        filtered.sort((a, b) => b.prob - a.prob);

        // Take top K
        const topK = filtered.slice(0, k);

        // Convert to tokens
        return topK.map(item => ({
            token: this.tokenizer.decode([item.idx], { skip_special_tokens: true }),
            tokenId: item.idx,
            probability: item.prob
        }));
    }

    /**
     * Process attention tensors into arrays
     */
    processAttentions(attentions) {
        if (!attentions) return null;

        const processed = [];

        // attentions is a tuple of tensors, one per layer
        for (let layerIdx = 0; layerIdx < attentions.length; layerIdx++) {
            const layerAttention = attentions[layerIdx];

            // Shape: [batch_size, num_heads, seq_len, seq_len]
            // We only have batch_size=1, so we take [0]
            const batchAttention = layerAttention[0];

            const numHeads = batchAttention.dims[0];
            const seqLen = batchAttention.dims[1];

            const layerHeads = [];

            for (let headIdx = 0; headIdx < numHeads; headIdx++) {
                const headAttention = [];

                for (let i = 0; i < seqLen; i++) {
                    const row = [];
                    for (let j = 0; j < seqLen; j++) {
                        const offset = headIdx * seqLen * seqLen + i * seqLen + j;
                        row.push(batchAttention.data[offset]);
                    }
                    headAttention.push(row);
                }

                layerHeads.push(headAttention);
            }

            processed.push(layerHeads);
        }

        return processed;
    }

    /**
     * Get embeddings for tokens
     */
    async getEmbeddings(text) {
        if (!this.model || !this.tokenizer) {
            throw new Error('Model not loaded');
        }

        const inputs = await this.tokenizer(text, {
            return_tensors: 'pt',
            add_special_tokens: true
        });

        const outputs = await this.model(inputs, { output_hidden_states: true });

        // Use last hidden state as embeddings
        const embeddings = outputs.hidden_states[outputs.hidden_states.length - 1];

        return embeddings;
    }

    /**
     * Fill mask using the fill-mask pipeline (alternative method)
     */
    async fillMaskPipeline(text) {
        const { pipeline } = window.Transformers;

        const unmasker = await pipeline('fill-mask', this.modelId);
        const results = await unmasker(text);

        return results;
    }
}
