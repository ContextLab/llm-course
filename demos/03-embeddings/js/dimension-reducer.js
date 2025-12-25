/**
 * DimensionReducer - Implements UMAP, t-SNE, and PCA for dimension reduction
 * Uses simplified implementations suitable for browser-based visualization
 */

export class DimensionReducer {
    constructor() {
        this.fittedReducer = null;
        this.method = null;
        this.params = null;
    }

    /**
     * Reduce dimensions of embeddings
     */
    async reduce(embeddings, method, params) {
        this.method = method;
        this.params = params;

        console.log(`Reducing ${embeddings.length} embeddings using ${method}...`);

        let reduced;
        switch (method) {
            case 'pca':
                reduced = await this.pca(embeddings, params.nComponents);
                break;
            case 'tsne':
                reduced = await this.tsne(embeddings, params.nComponents, params.perplexity);
                break;
            case 'umap':
                reduced = await this.umap(embeddings, params.nComponents, params.nNeighbors, params.minDist);
                break;
            default:
                throw new Error(`Unknown reduction method: ${method}`);
        }

        console.log(`Reduction complete: ${reduced.length} points in ${reduced[0].length}D`);
        return reduced;
    }

    /**
     * PCA (Principal Component Analysis)
     */
    async pca(data, nComponents) {
        const n = data.length;
        const d = data[0].length;

        // Center the data
        const mean = this.computeMean(data);
        const centered = data.map(row =>
            row.map((val, i) => val - mean[i])
        );

        // Compute covariance matrix
        const cov = this.computeCovariance(centered);

        // Compute eigenvectors using power iteration (simplified)
        const { vectors } = this.powerIteration(cov, nComponents);

        // Project data onto principal components
        const reduced = centered.map(row => {
            const projected = [];
            for (let i = 0; i < nComponents; i++) {
                let val = 0;
                for (let j = 0; j < d; j++) {
                    val += row[j] * vectors[i][j];
                }
                projected.push(val);
            }
            return projected;
        });

        this.fittedReducer = { method: 'pca', mean, vectors, nComponents };
        return reduced;
    }

    /**
     * t-SNE (t-Distributed Stochastic Neighbor Embedding)
     * Simplified implementation for browser use
     */
    async tsne(data, nComponents, perplexity = 30) {
        const n = data.length;

        // Initialize with PCA
        const initial = await this.pca(data, nComponents);

        // Compute pairwise distances
        const distances = this.pairwiseDistances(data);

        // Compute P (joint probabilities)
        const P = this.computeP(distances, perplexity);

        // Gradient descent
        let Y = initial.map(row => [...row]);
        const learningRate = 100;
        const iterations = 500;

        for (let iter = 0; iter < iterations; iter++) {
            // Compute Q (low-dimensional probabilities)
            const Q = this.computeQ(Y, nComponents);

            // Compute gradient
            const gradient = this.computeGradient(P, Q, Y, n, nComponents);

            // Update Y
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < nComponents; j++) {
                    Y[i][j] -= learningRate * gradient[i][j];
                }
            }

            // Progress update every 100 iterations
            if (iter % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI to update
            }
        }

        return Y;
    }

    /**
     * UMAP (Uniform Manifold Approximation and Projection)
     * Simplified implementation
     */
    async umap(data, nComponents, nNeighbors = 15, minDist = 0.1) {
        const n = data.length;

        // Start with PCA initialization
        const initial = await this.pca(data, nComponents);

        // Compute k-nearest neighbors
        const distances = this.pairwiseDistances(data);
        const neighbors = this.knn(distances, nNeighbors);

        // Compute fuzzy simplicial set
        const graph = this.computeFuzzySimplicialSet(neighbors, distances, nNeighbors);

        // Optimize embedding
        let Y = initial.map(row => [...row]);
        const learningRate = 1.0;
        const iterations = 500;
        const negSampleRate = 5;

        for (let iter = 0; iter < iterations; iter++) {
            const alpha = learningRate * (1 - iter / iterations); // Decay learning rate

            for (let i = 0; i < n; i++) {
                // Positive samples (edges in graph)
                for (let j = 0; j < neighbors[i].length; j++) {
                    const neighbor = neighbors[i][j];
                    const weight = graph[i][neighbor] || 0;

                    if (weight > 0) {
                        this.attractForce(Y, i, neighbor, alpha, minDist);
                    }
                }

                // Negative samples
                for (let k = 0; k < negSampleRate; k++) {
                    const j = Math.floor(Math.random() * n);
                    if (i !== j) {
                        this.repelForce(Y, i, j, alpha, minDist);
                    }
                }
            }

            // Progress update
            if (iter % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return Y;
    }

    /**
     * Transform a single point using fitted reducer
     */
    async transformSingle(embedding, method) {
        if (!this.fittedReducer || this.fittedReducer.method !== method) {
            throw new Error('Reducer not fitted. Call reduce() first.');
        }

        if (method === 'pca') {
            const { mean, vectors, nComponents } = this.fittedReducer;
            const centered = embedding.map((val, i) => val - mean[i]);

            const projected = [];
            for (let i = 0; i < nComponents; i++) {
                let val = 0;
                for (let j = 0; j < embedding.length; j++) {
                    val += centered[j] * vectors[i][j];
                }
                projected.push(val);
            }
            return projected;
        }

        // For t-SNE and UMAP, we'd need to refit (approximation)
        // Return random position near center as placeholder
        const nComponents = this.params.nComponents;
        return Array(nComponents).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }

    /**
     * Helper: Compute mean of data
     */
    computeMean(data) {
        const n = data.length;
        const d = data[0].length;
        const mean = Array(d).fill(0);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < d; j++) {
                mean[j] += data[i][j];
            }
        }

        return mean.map(val => val / n);
    }

    /**
     * Helper: Compute covariance matrix
     */
    computeCovariance(centered) {
        const n = centered.length;
        const d = centered[0].length;
        const cov = Array(d).fill(0).map(() => Array(d).fill(0));

        for (let i = 0; i < d; i++) {
            for (let j = i; j < d; j++) {
                let sum = 0;
                for (let k = 0; k < n; k++) {
                    sum += centered[k][i] * centered[k][j];
                }
                cov[i][j] = sum / (n - 1);
                cov[j][i] = cov[i][j];
            }
        }

        return cov;
    }

    /**
     * Helper: Power iteration for eigenvalue decomposition
     */
    powerIteration(matrix, nComponents) {
        const d = matrix.length;
        const vectors = [];
        const values = [];

        for (let comp = 0; comp < nComponents; comp++) {
            let v = Array(d).fill(0).map(() => Math.random());

            // Normalize
            let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
            v = v.map(val => val / norm);

            // Power iteration
            for (let iter = 0; iter < 100; iter++) {
                const v_new = Array(d).fill(0);

                // Matrix-vector multiplication
                for (let i = 0; i < d; i++) {
                    for (let j = 0; j < d; j++) {
                        v_new[i] += matrix[i][j] * v[j];
                    }
                }

                // Normalize
                norm = Math.sqrt(v_new.reduce((sum, val) => sum + val * val, 0));
                v = v_new.map(val => val / norm);
            }

            vectors.push(v);

            // Compute eigenvalue
            let eigenvalue = 0;
            for (let i = 0; i < d; i++) {
                for (let j = 0; j < d; j++) {
                    eigenvalue += v[i] * matrix[i][j] * v[j];
                }
            }
            values.push(eigenvalue);

            // Deflate matrix for next component
            for (let i = 0; i < d; i++) {
                for (let j = 0; j < d; j++) {
                    matrix[i][j] -= eigenvalue * v[i] * v[j];
                }
            }
        }

        return { vectors, values };
    }

    /**
     * Helper: Compute pairwise distances
     */
    pairwiseDistances(data) {
        const n = data.length;
        const distances = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const dist = this.euclideanDistance(data[i], data[j]);
                distances[i][j] = dist;
                distances[j][i] = dist;
            }
        }

        return distances;
    }

    /**
     * Helper: Euclidean distance
     */
    euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            const diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Helper: K-nearest neighbors
     */
    knn(distances, k) {
        const n = distances.length;
        const neighbors = [];

        for (let i = 0; i < n; i++) {
            const dists = distances[i].map((d, idx) => ({ idx, dist: d }));
            dists.sort((a, b) => a.dist - b.dist);
            neighbors.push(dists.slice(1, k + 1).map(x => x.idx));
        }

        return neighbors;
    }

    /**
     * Helper: Compute P matrix for t-SNE
     */
    computeP(distances, perplexity) {
        const n = distances.length;
        const P = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            const beta = this.findBeta(distances[i], perplexity);

            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    P[i][j] = Math.exp(-distances[i][j] * distances[i][j] * beta);
                    sum += P[i][j];
                }
            }

            // Normalize
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    P[i][j] /= sum;
                }
            }
        }

        // Symmetrize
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const avg = (P[i][j] + P[j][i]) / (2 * n);
                P[i][j] = avg;
                P[j][i] = avg;
            }
        }

        return P;
    }

    /**
     * Helper: Find beta for perplexity (binary search)
     */
    findBeta(distances, perplexity) {
        let beta = 1.0;
        let betaMin = 0;
        let betaMax = Infinity;

        for (let iter = 0; iter < 50; iter++) {
            let sum = 0;
            let sumP = 0;

            for (let j = 0; j < distances.length; j++) {
                const p = Math.exp(-distances[j] * distances[j] * beta);
                sum += p;
                sumP += p;
            }

            if (sum === 0) sum = 1e-10;

            const H = Math.log(sum) + beta * distances.reduce((s, d) =>
                s + d * d * Math.exp(-d * d * beta), 0) / sum;

            const Hdiff = H - Math.log(perplexity);

            if (Math.abs(Hdiff) < 1e-5) break;

            if (Hdiff > 0) {
                betaMin = beta;
                beta = betaMax === Infinity ? beta * 2 : (beta + betaMax) / 2;
            } else {
                betaMax = beta;
                beta = (beta + betaMin) / 2;
            }
        }

        return beta;
    }

    /**
     * Helper: Compute Q matrix for t-SNE
     */
    computeQ(Y, nComponents) {
        const n = Y.length;
        const Q = Array(n).fill(0).map(() => Array(n).fill(0));

        let sum = 0;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const dist = this.euclideanDistance(Y[i], Y[j]);
                const q = 1 / (1 + dist * dist);
                Q[i][j] = q;
                Q[j][i] = q;
                sum += 2 * q;
            }
        }

        // Normalize
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                Q[i][j] /= sum;
            }
        }

        return Q;
    }

    /**
     * Helper: Compute gradient for t-SNE
     */
    computeGradient(P, Q, Y, n, nComponents) {
        const gradient = Array(n).fill(0).map(() => Array(nComponents).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    const dist = this.euclideanDistance(Y[i], Y[j]);
                    const mult = (P[i][j] - Q[i][j]) / (1 + dist * dist);

                    for (let k = 0; k < nComponents; k++) {
                        gradient[i][k] += 4 * mult * (Y[i][k] - Y[j][k]);
                    }
                }
            }
        }

        return gradient;
    }

    /**
     * Helper: Compute fuzzy simplicial set for UMAP
     */
    computeFuzzySimplicialSet(neighbors, distances, nNeighbors) {
        const n = neighbors.length;
        const graph = {};

        for (let i = 0; i < n; i++) {
            if (!graph[i]) graph[i] = {};

            const neighborDists = neighbors[i].map(j => distances[i][j]);
            const rho = Math.min(...neighborDists);
            const sigma = this.smoothKNNDist(neighborDists, nNeighbors);

            for (let k = 0; k < neighbors[i].length; k++) {
                const j = neighbors[i][k];
                const d = distances[i][j];
                const weight = Math.exp(-Math.max(0, d - rho) / sigma);

                if (!graph[i][j]) graph[i][j] = 0;
                if (!graph[j]) graph[j] = {};
                if (!graph[j][i]) graph[j][i] = 0;

                graph[i][j] = Math.max(graph[i][j], weight);
            }
        }

        return graph;
    }

    /**
     * Helper: Smooth k-NN distance
     */
    smoothKNNDist(distances, k) {
        return distances.reduce((sum, d) => sum + d, 0) / k;
    }

    /**
     * Helper: Attract force for UMAP
     */
    attractForce(Y, i, j, alpha, minDist) {
        const d = this.euclideanDistance(Y[i], Y[j]);
        const grad = d > minDist ? 2 * (d - minDist) / (d * (1 + d * d)) : 0;

        for (let k = 0; k < Y[i].length; k++) {
            const delta = Y[i][k] - Y[j][k];
            Y[i][k] -= alpha * grad * delta;
            Y[j][k] += alpha * grad * delta;
        }
    }

    /**
     * Helper: Repel force for UMAP
     */
    repelForce(Y, i, j, alpha, minDist) {
        const d = this.euclideanDistance(Y[i], Y[j]);
        const grad = 2 / ((0.001 + d) * (1 + d * d));

        for (let k = 0; k < Y[i].length; k++) {
            const delta = Y[i][k] - Y[j][k];
            Y[i][k] += alpha * grad * delta;
        }
    }
}
