/**
 * Word Embedding Model for Analogies
 * Handles vector operations and similarity computations
 */

export class EmbeddingModel {
    constructor(embeddings) {
        this.embeddings = embeddings; // Map of word -> vector
        this.words = [];
        this.vectors = [];
        this.dimensions = 0;
        this.vocabularySize = 0;
    }

    /**
     * Initialize the model
     */
    async initialize() {
        this.words = Object.keys(this.embeddings);
        this.vectors = Object.values(this.embeddings);
        this.vocabularySize = this.words.length;
        this.dimensions = this.vectors[0].length;

        console.log(`Initialized model with ${this.vocabularySize} words, ${this.dimensions} dimensions`);

        // Normalize all vectors for faster cosine similarity
        this.normalizedVectors = this.vectors.map(v => this.normalize(v));

        return true;
    }

    /**
     * Get vector for a word
     */
    getVector(word) {
        word = word.toLowerCase();
        return this.embeddings[word] || null;
    }

    /**
     * Check if word exists in vocabulary
     */
    hasWord(word) {
        return word.toLowerCase() in this.embeddings;
    }

    /**
     * Normalize a vector
     */
    normalize(vector) {
        const magnitude = this.vectorMagnitude(vector);
        if (magnitude === 0) return vector;
        return vector.map(v => v / magnitude);
    }

    /**
     * Calculate vector magnitude
     */
    vectorMagnitude(vector) {
        return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    }

    /**
     * Add two vectors
     */
    vectorAdd(v1, v2) {
        return v1.map((val, i) => val + v2[i]);
    }

    /**
     * Subtract two vectors
     */
    vectorSubtract(v1, v2) {
        return v1.map((val, i) => val - v2[i]);
    }

    /**
     * Cosine similarity between two vectors
     */
    cosineSimilarity(v1, v2) {
        const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
        const mag1 = this.vectorMagnitude(v1);
        const mag2 = this.vectorMagnitude(v2);

        if (mag1 === 0 || mag2 === 0) return 0;
        return dotProduct / (mag1 * mag2);
    }

    /**
     * Solve word analogy: a - b + c = ?
     * Example: king - man + woman = queen
     */
    solveAnalogy(wordA, wordB, wordC, topK = 10) {
        const vecA = this.getVector(wordA);
        const vecB = this.getVector(wordB);
        const vecC = this.getVector(wordC);

        if (!vecA || !vecB || !vecC) {
            console.error('One or more words not found:', { wordA, wordB, wordC });
            return null;
        }

        // Calculate: vecA - vecB + vecC
        const diff = this.vectorSubtract(vecA, vecB);
        const result = this.vectorAdd(diff, vecC);

        // Find most similar words (excluding input words)
        const excludeWords = new Set([wordA, wordB, wordC]);
        const predictions = this.findNearestNeighbors(result, topK + 3, excludeWords);

        return {
            predictions: predictions.slice(0, topK),
            resultVector: result,
            intermediateVectors: {
                vecA,
                vecB,
                vecC,
                diff,
                result
            }
        };
    }

    /**
     * Find k nearest neighbors to a vector
     */
    findNearestNeighbors(targetVector, k, excludeWords = new Set()) {
        const similarities = this.words.map((word, idx) => {
            if (excludeWords.has(word)) return null;

            const similarity = this.cosineSimilarity(targetVector, this.vectors[idx]);
            return { word, similarity };
        }).filter(item => item !== null);

        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, k);
    }

    /**
     * Find similar words
     */
    findSimilar(word, k = 10) {
        const vector = this.getVector(word);
        if (!vector) {
            console.error('Word not found:', word);
            return null;
        }

        const excludeWords = new Set([word]);
        return this.findNearestNeighbors(vector, k, excludeWords);
    }

    /**
     * Get random words from vocabulary
     */
    getRandomWords(count) {
        const shuffled = [...this.words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Compute PCA (Principal Component Analysis) for dimensionality reduction
     */
    async computePCA(numComponents = 2) {
        // Center the data
        const mean = this.computeMean(this.vectors);
        const centered = this.vectors.map(v => this.vectorSubtract(v, mean));

        // Compute covariance matrix
        const n = centered.length;
        const d = this.dimensions;

        // For efficiency, compute X^T X instead of X X^T when n < d
        const useTranspose = n < d;

        let eigenvectors, eigenvalues;

        if (useTranspose) {
            // Compute X X^T (n x n matrix)
            const gram = this.computeGramMatrix(centered);
            const eigen = this.powerIteration(gram, numComponents);

            eigenvalues = eigen.values;

            // Transform back to original space
            eigenvectors = [];
            for (let i = 0; i < numComponents; i++) {
                const v = new Array(d).fill(0);
                for (let j = 0; j < n; j++) {
                    for (let k = 0; k < d; k++) {
                        v[k] += centered[j][k] * eigen.vectors[i][j];
                    }
                }
                eigenvectors.push(this.normalize(v));
            }
        } else {
            // Compute X^T X (d x d matrix) - standard PCA
            const cov = this.computeCovarianceMatrix(centered);
            const eigen = this.powerIteration(cov, numComponents);

            eigenvalues = eigen.values;
            eigenvectors = eigen.vectors.map(v => this.normalize(v));
        }

        // Project data onto principal components
        const projected = centered.map(point => {
            return eigenvectors.map(component =>
                this.dotProduct(point, component)
            );
        });

        return {
            projected,
            components: eigenvectors,
            eigenvalues,
            mean
        };
    }

    /**
     * Compute t-SNE for dimensionality reduction
     */
    async computeTSNE(numComponents = 2, perplexity = 30, iterations = 500) {
        const n = this.vectors.length;

        // Compute pairwise distances
        const distances = this.computePairwiseDistances();

        // Convert distances to probabilities
        const P = this.computeGaussianSimilarities(distances, perplexity);

        // Initialize solution randomly
        let Y = Array(n).fill(0).map(() =>
            Array(numComponents).fill(0).map(() => (Math.random() - 0.5) * 0.0001)
        );

        // Gradient descent
        const learningRate = 200;
        const momentum = 0.5;
        let gains = Array(n).fill(0).map(() => Array(numComponents).fill(1));
        let velocity = Array(n).fill(0).map(() => Array(numComponents).fill(0));

        for (let iter = 0; iter < iterations; iter++) {
            // Compute Q (low-dimensional similarities)
            const Q = this.computeStudentTSimilarities(Y);

            // Compute gradient
            const gradient = this.computeTSNEGradient(P, Q, Y);

            // Update with momentum
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < numComponents; j++) {
                    // Adaptive learning rate
                    if (Math.sign(gradient[i][j]) !== Math.sign(velocity[i][j])) {
                        gains[i][j] += 0.2;
                    } else {
                        gains[i][j] *= 0.8;
                        if (gains[i][j] < 0.01) gains[i][j] = 0.01;
                    }

                    velocity[i][j] = momentum * velocity[i][j] -
                                    learningRate * gains[i][j] * gradient[i][j];
                    Y[i][j] += velocity[i][j];
                }
            }

            // Center Y
            const mean = this.computeMean(Y);
            Y = Y.map(point => this.vectorSubtract(point, mean));

            if (iter % 50 === 0) {
                console.log(`t-SNE iteration ${iter}/${iterations}`);
            }
        }

        return Y;
    }

    /**
     * Helper functions for PCA and t-SNE
     */

    computeMean(vectors) {
        const n = vectors.length;
        const d = vectors[0].length;
        const mean = new Array(d).fill(0);

        for (let vec of vectors) {
            for (let i = 0; i < d; i++) {
                mean[i] += vec[i];
            }
        }

        return mean.map(v => v / n);
    }

    dotProduct(v1, v2) {
        return v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    }

    computeGramMatrix(vectors) {
        const n = vectors.length;
        const gram = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = i; j < n; j++) {
                const dot = this.dotProduct(vectors[i], vectors[j]);
                gram[i][j] = dot;
                gram[j][i] = dot;
            }
        }

        return gram;
    }

    computeCovarianceMatrix(centered) {
        const n = centered.length;
        const d = centered[0].length;
        const cov = Array(d).fill(0).map(() => Array(d).fill(0));

        for (let i = 0; i < d; i++) {
            for (let j = i; j < d; j++) {
                let sum = 0;
                for (let k = 0; k < n; k++) {
                    sum += centered[k][i] * centered[k][j];
                }
                cov[i][j] = sum / n;
                cov[j][i] = sum / n;
            }
        }

        return cov;
    }

    powerIteration(matrix, numComponents) {
        const n = matrix.length;
        const vectors = [];
        const values = [];

        for (let comp = 0; comp < numComponents; comp++) {
            let v = Array(n).fill(0).map(() => Math.random());
            v = this.normalize(v);

            // Power iteration
            for (let iter = 0; iter < 100; iter++) {
                const Mv = this.matrixVectorMultiply(matrix, v);
                v = this.normalize(Mv);
            }

            // Compute eigenvalue
            const Mv = this.matrixVectorMultiply(matrix, v);
            const eigenvalue = this.dotProduct(v, Mv);

            vectors.push(v);
            values.push(eigenvalue);

            // Deflate matrix
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    matrix[i][j] -= eigenvalue * v[i] * v[j];
                }
            }
        }

        return { vectors, values };
    }

    matrixVectorMultiply(matrix, vector) {
        return matrix.map(row => this.dotProduct(row, vector));
    }

    computePairwiseDistances() {
        const n = this.vectors.length;
        const distances = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const diff = this.vectorSubtract(this.vectors[i], this.vectors[j]);
                const dist = this.vectorMagnitude(diff);
                distances[i][j] = dist;
                distances[j][i] = dist;
            }
        }

        return distances;
    }

    computeGaussianSimilarities(distances, perplexity) {
        const n = distances.length;
        const P = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            // Binary search for sigma
            const beta = this.findBeta(distances[i], i, perplexity);

            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    P[i][j] = Math.exp(-beta * distances[i][j] * distances[i][j]);
                }
            }

            // Normalize
            const sum = P[i].reduce((a, b) => a + b, 0);
            if (sum > 0) {
                P[i] = P[i].map(p => p / sum);
            }
        }

        return P;
    }

    findBeta(distances, i, perplexity) {
        let beta = 1.0;
        const targetEntropy = Math.log(perplexity);

        // Simple beta = 1 for efficiency
        return beta;
    }

    computeStudentTSimilarities(Y) {
        const n = Y.length;
        const Q = Array(n).fill(0).map(() => Array(n).fill(0));
        let sum = 0;

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const diff = this.vectorSubtract(Y[i], Y[j]);
                const dist2 = this.dotProduct(diff, diff);
                const q = 1 / (1 + dist2);
                Q[i][j] = q;
                Q[j][i] = q;
                sum += 2 * q;
            }
        }

        // Normalize
        if (sum > 0) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    Q[i][j] /= sum;
                }
            }
        }

        return Q;
    }

    computeTSNEGradient(P, Q, Y) {
        const n = Y.length;
        const d = Y[0].length;
        const gradient = Array(n).fill(0).map(() => Array(d).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) continue;

                const diff = this.vectorSubtract(Y[i], Y[j]);
                const dist2 = this.dotProduct(diff, diff);
                const factor = 4 * (P[i][j] - Q[i][j]) / (1 + dist2);

                for (let k = 0; k < d; k++) {
                    gradient[i][k] += factor * diff[k];
                }
            }
        }

        return gradient;
    }
}
