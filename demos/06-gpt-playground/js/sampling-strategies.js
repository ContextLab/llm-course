/**
 * Sampling Strategies for Text Generation
 * Implements various decoding strategies for GPT models
 */

export class SamplingStrategies {
    /**
     * Apply temperature scaling to logits
     * @param {Array} logits - Raw model logits
     * @param {number} temperature - Temperature parameter (0.0 to 2.0)
     * @returns {Array} Scaled logits
     */
    static applyTemperature(logits, temperature = 1.0) {
        if (temperature === 1.0) return logits;
        if (temperature === 0.0) temperature = 0.001; // Avoid division by zero
        return logits.map(logit => logit / temperature);
    }

    /**
     * Apply repetition penalty to discourage repeated tokens
     * @param {Array} logits - Raw model logits
     * @param {Array} generatedTokens - Previously generated token IDs
     * @param {number} penalty - Repetition penalty (>= 1.0)
     * @returns {Array} Penalized logits
     */
    static applyRepetitionPenalty(logits, generatedTokens, penalty = 1.0) {
        if (penalty === 1.0) return logits;

        const penalizedLogits = [...logits];
        const seenTokens = new Set(generatedTokens);

        seenTokens.forEach(tokenId => {
            if (tokenId >= 0 && tokenId < penalizedLogits.length) {
                // If logit is positive, divide; if negative, multiply
                if (penalizedLogits[tokenId] > 0) {
                    penalizedLogits[tokenId] /= penalty;
                } else {
                    penalizedLogits[tokenId] *= penalty;
                }
            }
        });

        return penalizedLogits;
    }

    /**
     * Convert logits to probabilities using softmax
     * @param {Array} logits - Input logits
     * @returns {Array} Probability distribution
     */
    static softmax(logits) {
        const maxLogit = Math.max(...logits);
        const expScores = logits.map(logit => Math.exp(logit - maxLogit));
        const sumExp = expScores.reduce((a, b) => a + b, 0);
        return expScores.map(score => score / sumExp);
    }

    /**
     * Calculate entropy of a probability distribution
     * @param {Array} probs - Probability distribution
     * @returns {number} Entropy value
     */
    static calculateEntropy(probs) {
        return -probs.reduce((sum, p) => {
            if (p > 0) {
                return sum + p * Math.log2(p);
            }
            return sum;
        }, 0);
    }

    /**
     * Greedy decoding - select token with highest probability
     * @param {Array} logits - Raw model logits
     * @param {Object} options - Additional options
     * @returns {Object} Selected token info
     */
    static greedyDecoding(logits, options = {}) {
        const probs = this.softmax(logits);
        const maxIndex = probs.indexOf(Math.max(...probs));

        return {
            tokenId: maxIndex,
            probability: probs[maxIndex],
            entropy: this.calculateEntropy(probs),
            topTokens: this.getTopTokens(logits, probs, 10)
        };
    }

    /**
     * Temperature sampling
     * @param {Array} logits - Raw model logits
     * @param {Object} options - {temperature}
     * @returns {Object} Selected token info
     */
    static temperatureSampling(logits, options = {}) {
        const { temperature = 1.0 } = options;

        const scaledLogits = this.applyTemperature(logits, temperature);
        const probs = this.softmax(scaledLogits);
        const tokenId = this.sampleFromDistribution(probs);

        return {
            tokenId,
            probability: probs[tokenId],
            entropy: this.calculateEntropy(probs),
            topTokens: this.getTopTokens(scaledLogits, probs, 10)
        };
    }

    /**
     * Top-k sampling
     * @param {Array} logits - Raw model logits
     * @param {Object} options - {topK, temperature}
     * @returns {Object} Selected token info
     */
    static topKSampling(logits, options = {}) {
        const { topK = 50, temperature = 1.0 } = options;

        // Apply temperature
        const scaledLogits = this.applyTemperature(logits, temperature);

        // Get top-k indices
        const indexedLogits = scaledLogits.map((logit, idx) => ({ logit, idx }));
        indexedLogits.sort((a, b) => b.logit - a.logit);
        const topKIndices = indexedLogits.slice(0, topK);

        // Create filtered probability distribution
        const filteredLogits = new Array(logits.length).fill(-Infinity);
        topKIndices.forEach(({ logit, idx }) => {
            filteredLogits[idx] = logit;
        });

        const probs = this.softmax(filteredLogits);
        const tokenId = this.sampleFromDistribution(probs);

        return {
            tokenId,
            probability: probs[tokenId],
            entropy: this.calculateEntropy(probs),
            topTokens: this.getTopTokens(filteredLogits, probs, 10)
        };
    }

    /**
     * Top-p (nucleus) sampling
     * @param {Array} logits - Raw model logits
     * @param {Object} options - {topP, temperature}
     * @returns {Object} Selected token info
     */
    static topPSampling(logits, options = {}) {
        const { topP = 0.9, temperature = 1.0 } = options;

        // Apply temperature
        const scaledLogits = this.applyTemperature(logits, temperature);
        const probs = this.softmax(scaledLogits);

        // Sort probabilities in descending order
        const indexedProbs = probs.map((prob, idx) => ({ prob, idx }));
        indexedProbs.sort((a, b) => b.prob - a.prob);

        // Find nucleus (smallest set with cumulative prob >= topP)
        let cumulativeProb = 0;
        const nucleus = [];
        for (const item of indexedProbs) {
            nucleus.push(item);
            cumulativeProb += item.prob;
            if (cumulativeProb >= topP) break;
        }

        // Create filtered distribution
        const filteredProbs = new Array(probs.length).fill(0);
        nucleus.forEach(({ prob, idx }) => {
            filteredProbs[idx] = prob;
        });

        // Renormalize
        const sum = filteredProbs.reduce((a, b) => a + b, 0);
        const normalizedProbs = filteredProbs.map(p => p / sum);

        const tokenId = this.sampleFromDistribution(normalizedProbs);

        return {
            tokenId,
            probability: normalizedProbs[tokenId],
            entropy: this.calculateEntropy(normalizedProbs),
            topTokens: this.getTopTokens(scaledLogits, normalizedProbs, 10)
        };
    }

    /**
     * Combined sampling (Top-k + Top-p + Temperature)
     * @param {Array} logits - Raw model logits
     * @param {Object} options - {topK, topP, temperature}
     * @returns {Object} Selected token info
     */
    static combinedSampling(logits, options = {}) {
        const { topK = 50, topP = 0.9, temperature = 1.0 } = options;

        // Apply temperature
        let scaledLogits = this.applyTemperature(logits, temperature);

        // Apply top-k filtering
        const indexedLogits = scaledLogits.map((logit, idx) => ({ logit, idx }));
        indexedLogits.sort((a, b) => b.logit - a.logit);
        const topKIndices = indexedLogits.slice(0, topK);

        let filteredLogits = new Array(logits.length).fill(-Infinity);
        topKIndices.forEach(({ logit, idx }) => {
            filteredLogits[idx] = logit;
        });

        // Apply top-p filtering
        const probs = this.softmax(filteredLogits);
        const indexedProbs = probs.map((prob, idx) => ({ prob, idx }));
        indexedProbs.sort((a, b) => b.prob - a.prob);

        let cumulativeProb = 0;
        const nucleus = [];
        for (const item of indexedProbs) {
            if (item.prob > 0) {
                nucleus.push(item);
                cumulativeProb += item.prob;
                if (cumulativeProb >= topP) break;
            }
        }

        // Create final distribution
        const finalProbs = new Array(probs.length).fill(0);
        nucleus.forEach(({ prob, idx }) => {
            finalProbs[idx] = prob;
        });

        // Renormalize
        const sum = finalProbs.reduce((a, b) => a + b, 0);
        const normalizedProbs = finalProbs.map(p => p / sum);

        const tokenId = this.sampleFromDistribution(normalizedProbs);

        return {
            tokenId,
            probability: normalizedProbs[tokenId],
            entropy: this.calculateEntropy(normalizedProbs),
            topTokens: this.getTopTokens(filteredLogits, normalizedProbs, 10)
        };
    }

    /**
     * Sample from a probability distribution
     * @param {Array} probs - Probability distribution
     * @returns {number} Sampled index
     */
    static sampleFromDistribution(probs) {
        const random = Math.random();
        let cumulativeProb = 0;

        for (let i = 0; i < probs.length; i++) {
            cumulativeProb += probs[i];
            if (random < cumulativeProb) {
                return i;
            }
        }

        // Fallback (should rarely happen)
        return probs.length - 1;
    }

    /**
     * Get top N tokens with their probabilities
     * @param {Array} logits - Logits
     * @param {Array} probs - Probabilities
     * @param {number} n - Number of top tokens
     * @returns {Array} Top tokens
     */
    static getTopTokens(logits, probs, n = 10) {
        const indexed = probs.map((prob, idx) => ({
            tokenId: idx,
            probability: prob,
            logit: logits[idx]
        }));

        indexed.sort((a, b) => b.probability - a.probability);
        return indexed.slice(0, n).filter(item => item.probability > 0);
    }

    /**
     * Main sampling function that routes to the appropriate strategy
     * @param {Array} logits - Raw model logits
     * @param {string} strategy - Sampling strategy name
     * @param {Object} options - Strategy-specific options
     * @param {Array} generatedTokens - Previously generated tokens (for repetition penalty)
     * @returns {Object} Selected token info
     */
    static sample(logits, strategy, options = {}, generatedTokens = []) {
        // Apply repetition penalty if specified
        let processedLogits = logits;
        if (options.repetitionPenalty && options.repetitionPenalty > 1.0) {
            processedLogits = this.applyRepetitionPenalty(
                logits,
                generatedTokens,
                options.repetitionPenalty
            );
        }

        switch (strategy) {
            case 'greedy':
                return this.greedyDecoding(processedLogits, options);

            case 'temperature':
                return this.temperatureSampling(processedLogits, options);

            case 'topk':
                return this.topKSampling(processedLogits, options);

            case 'topp':
                return this.topPSampling(processedLogits, options);

            case 'combined':
                return this.combinedSampling(processedLogits, options);

            default:
                return this.temperatureSampling(processedLogits, options);
        }
    }

    /**
     * Calculate surprise (negative log probability) for a token
     * @param {number} probability - Token probability
     * @returns {number} Surprise value in bits
     */
    static calculateSurprise(probability) {
        if (probability <= 0) return Infinity;
        return -Math.log2(probability);
    }

    /**
     * Get surprise category for visualization
     * @param {number} surprise - Surprise value
     * @returns {string} Category name
     */
    static getSurpriseCategory(surprise) {
        if (surprise < 2) return 'low'; // Very likely (prob > 0.25)
        if (surprise < 5) return 'medium'; // Moderate (prob > 0.03)
        if (surprise < 8) return 'high'; // Surprising (prob > 0.004)
        return 'very-high'; // Very surprising (prob < 0.004)
    }
}

export default SamplingStrategies;
