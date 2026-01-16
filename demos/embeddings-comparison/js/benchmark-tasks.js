/**
 * Benchmark Tasks
 * Various benchmark tasks for comparing embeddings
 */

export class BenchmarkTasks {
    constructor(modelsManager) {
        this.modelsManager = modelsManager;
    }

    async runSimilarityTest(sent1, sent2, modelIds) {
        const results = [];

        for (const modelId of modelIds) {
            const result1 = await this.modelsManager.embed(modelId, sent1);
            const result2 = await this.modelsManager.embed(modelId, sent2);

            const similarity = this.modelsManager.cosineSimilarity(
                result1.embedding,
                result2.embedding
            );

            results.push({
                modelId,
                modelName: this.modelsManager.getModelConfig(modelId).name,
                similarity,
                time: result1.time + result2.time,
                sent1,
                sent2
            });
        }

        return results;
    }

    async runAnalogyTest(wordA, wordB, wordC, modelIds, candidates = []) {
        const results = [];

        // Generate intelligent candidates based on the analogy type
        if (candidates.length === 0) {
            candidates = this.generateAnalogyCandidates(wordA, wordB, wordC);
        }

        // Sentence-based analogy approach: embed words in context sentences
        // This works better for sentence embedding models than raw word vectors
        const contextTemplate = (word) => `The word "${word}" represents a concept.`;
        
        for (const modelId of modelIds) {
            const startTime = performance.now();
            
            // Embed words in sentence context for better representations
            const [embA, embB, embC] = await Promise.all([
                this.modelsManager.embed(modelId, contextTemplate(wordA)),
                this.modelsManager.embed(modelId, contextTemplate(wordB)),
                this.modelsManager.embed(modelId, contextTemplate(wordC))
            ]);

            // Calculate analogy vector: B - A + C
            const analogyVec = this.vectorArithmetic(
                embB.embedding,
                embA.embedding,
                embC.embedding
            );

            // Find best match among candidates
            const candidateResults = [];
            for (const candidate of candidates) {
                const embD = await this.modelsManager.embed(modelId, contextTemplate(candidate));
                const similarity = this.modelsManager.cosineSimilarity(
                    analogyVec,
                    embD.embedding
                );
                candidateResults.push({ word: candidate, similarity });
            }

            candidateResults.sort((a, b) => b.similarity - a.similarity);
            const endTime = performance.now();

            results.push({
                modelId,
                modelName: this.modelsManager.getModelConfig(modelId).name,
                prediction: candidateResults[0].word,
                confidence: candidateResults[0].similarity,
                allCandidates: candidateResults.slice(0, 5),
                time: endTime - startTime
            });
        }

        return results;
    }

    vectorArithmetic(vecB, vecA, vecC) {
        const result = [];
        for (let i = 0; i < vecB.length; i++) {
            result.push(vecB[i] - vecA[i] + vecC[i]);
        }

        const norm = Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
        return result.map(val => val / norm);
    }

    generateAnalogyCandidates(wordA, wordB, wordC) {
        const lower = (w) => w.toLowerCase();
        const a = lower(wordA), b = lower(wordB), c = lower(wordC);
        
        const analogyMap = {
            'king:queen:man': ['woman', 'lady', 'female', 'girl', 'wife', 'mother', 'queen', 'princess'],
            'actor:actress:waiter': ['waitress', 'hostess', 'woman', 'female', 'lady', 'stewardess', 'maid'],
            'hero:heroine:prince': ['princess', 'lady', 'queen', 'duchess', 'woman', 'girl', 'female'],
            'paris:france:london': ['England', 'Britain', 'UK', 'United Kingdom', 'British', 'London', 'Europe'],
            'tokyo:japan:berlin': ['Germany', 'German', 'Deutschland', 'Europe', 'Berlin', 'Austria'],
            'rome:italy:madrid': ['Spain', 'Spanish', 'Espana', 'Europe', 'Portugal', 'Madrid'],
            'good:better:bad': ['worse', 'worst', 'terrible', 'awful', 'poor', 'inferior', 'bad'],
            'big:bigger:small': ['smaller', 'tinier', 'little', 'tiny', 'minor', 'lesser', 'small'],
            'walk:walked:run': ['ran', 'running', 'runs', 'sprinted', 'jogged', 'run', 'raced'],
            'dog:puppy:cat': ['kitten', 'kitty', 'baby cat', 'young cat', 'cub', 'feline', 'cat'],
            'wood:tree:paper': ['pulp', 'plant', 'fiber', 'bamboo', 'reed', 'tree', 'forest'],
            'hammer:nail:screwdriver': ['screw', 'bolt', 'fastener', 'nut', 'nail', 'pin', 'rivet']
        };

        const key = `${a}:${b}:${c}`;
        if (analogyMap[key]) {
            return analogyMap[key];
        }

        if ((a === 'king' && b === 'queen') || (a === 'man' && b === 'woman') || 
            (a === 'boy' && b === 'girl') || (a === 'father' && b === 'mother')) {
            return ['woman', 'lady', 'female', 'girl', 'wife', 'mother', 'queen', 'princess', 'daughter'];
        }
        
        if (['paris', 'london', 'berlin', 'tokyo', 'rome', 'madrid'].includes(a)) {
            return ['England', 'Britain', 'UK', 'Germany', 'Spain', 'Italy', 'Japan', 'France', 'Europe'];
        }
        
        if (['good', 'bad', 'big', 'small', 'fast', 'slow'].includes(a)) {
            return ['worse', 'smaller', 'slower', 'faster', 'bigger', 'better', 'terrible', 'great'];
        }
        
        if (['walk', 'run', 'swim', 'fly', 'drive', 'eat'].includes(a)) {
            return ['ran', 'walked', 'swam', 'flew', 'drove', 'ate', 'slept', 'jumped'];
        }

        return [
            'woman', 'man', 'person', 'thing', 'place', 'time',
            'good', 'bad', 'big', 'small', 'new', 'old',
            wordB, wordC
        ];
    }

    async runCategorizationTest(items, numCategories, modelIds) {
        const results = [];

        for (const modelId of modelIds) {
            const startTime = performance.now();

            // Get embeddings for all items
            const embeddings = [];
            for (const item of items) {
                const result = await this.modelsManager.embed(modelId, item);
                embeddings.push(result.embedding);
            }

            // Simple k-means clustering
            const { assignments, centroids } = this.kMeansClusteringWithCentroids(embeddings, numCategories);

            const endTime = performance.now();

            // Organize items by cluster
            const categories = Array.from({ length: numCategories }, () => []);
            items.forEach((item, idx) => {
                categories[assignments[idx]].push(item);
            });

            // Calculate silhouette score as quality metric
            const silhouetteScore = this.calculateSilhouetteScore(embeddings, assignments, numCategories);

            results.push({
                modelId,
                modelName: this.modelsManager.getModelConfig(modelId).name,
                categories,
                time: endTime - startTime,
                silhouetteScore,
                // Use silhouetteScore for similarity field so charts display it
                similarity: (silhouetteScore + 1) / 2  // Normalize from [-1,1] to [0,1]
            });
        }

        return results;
    }

    /**
     * Calculate Silhouette Score for clustering quality
     * Score ranges from -1 to 1:
     *   1: Perfect clustering (points are far from other clusters)
     *   0: Overlapping clusters
     *  -1: Wrong clustering (points closer to other clusters)
     */
    calculateSilhouetteScore(embeddings, assignments, k) {
        const n = embeddings.length;
        if (n <= k) return 0; // Not enough points

        let totalScore = 0;
        let validPoints = 0;

        for (let i = 0; i < n; i++) {
            const myCluster = assignments[i];

            // Calculate a(i): average distance to points in same cluster
            let sameClusterDist = 0;
            let sameClusterCount = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j && assignments[j] === myCluster) {
                    sameClusterDist += this.euclideanDistance(embeddings[i], embeddings[j]);
                    sameClusterCount++;
                }
            }
            const a = sameClusterCount > 0 ? sameClusterDist / sameClusterCount : 0;

            // Calculate b(i): minimum average distance to points in other clusters
            let minOtherClusterDist = Infinity;
            for (let c = 0; c < k; c++) {
                if (c === myCluster) continue;

                let otherClusterDist = 0;
                let otherClusterCount = 0;
                for (let j = 0; j < n; j++) {
                    if (assignments[j] === c) {
                        otherClusterDist += this.euclideanDistance(embeddings[i], embeddings[j]);
                        otherClusterCount++;
                    }
                }
                if (otherClusterCount > 0) {
                    const avgDist = otherClusterDist / otherClusterCount;
                    if (avgDist < minOtherClusterDist) {
                        minOtherClusterDist = avgDist;
                    }
                }
            }
            const b = minOtherClusterDist === Infinity ? 0 : minOtherClusterDist;

            // Silhouette coefficient for point i
            if (Math.max(a, b) > 0) {
                const s = (b - a) / Math.max(a, b);
                totalScore += s;
                validPoints++;
            }
        }

        return validPoints > 0 ? totalScore / validPoints : 0;
    }

    kMeansClusteringWithCentroids(embeddings, k, maxIters = 50) {
        const n = embeddings.length;
        const dim = embeddings[0].length;

        const centroids = this.kMeansPlusPlusInit(embeddings, k);
        let assignments = Array(n).fill(0);
        let prevAssignments = null;

        for (let iter = 0; iter < maxIters; iter++) {
            for (let i = 0; i < n; i++) {
                let minDist = Infinity;
                let bestCluster = 0;

                for (let j = 0; j < k; j++) {
                    const dist = this.euclideanDistance(embeddings[i], centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCluster = j;
                    }
                }

                assignments[i] = bestCluster;
            }

            if (prevAssignments && assignments.every((a, i) => a === prevAssignments[i])) {
                break;
            }
            prevAssignments = [...assignments];

            const clusterSums = Array.from({ length: k }, () => Array(dim).fill(0));
            const clusterCounts = Array(k).fill(0);

            for (let i = 0; i < n; i++) {
                const cluster = assignments[i];
                clusterCounts[cluster]++;
                for (let d = 0; d < dim; d++) {
                    clusterSums[cluster][d] += embeddings[i][d];
                }
            }

            for (let j = 0; j < k; j++) {
                if (clusterCounts[j] > 0) {
                    for (let d = 0; d < dim; d++) {
                        centroids[j][d] = clusterSums[j][d] / clusterCounts[j];
                    }
                }
            }
        }

        return { assignments, centroids };
    }

    kMeansPlusPlusInit(embeddings, k) {
        const n = embeddings.length;
        const centroids = [];
        
        const firstIdx = Math.floor(Math.random() * n);
        centroids.push([...embeddings[firstIdx]]);
        
        while (centroids.length < k) {
            const distances = embeddings.map(emb => {
                let minDist = Infinity;
                for (const centroid of centroids) {
                    const dist = this.euclideanDistance(emb, centroid);
                    if (dist < minDist) minDist = dist;
                }
                return minDist * minDist;
            });
            
            const totalDist = distances.reduce((a, b) => a + b, 0);
            let threshold = Math.random() * totalDist;
            
            for (let i = 0; i < n; i++) {
                threshold -= distances[i];
                if (threshold <= 0) {
                    centroids.push([...embeddings[i]]);
                    break;
                }
            }
            
            if (centroids.length === centroids.length - 1) {
                centroids.push([...embeddings[Math.floor(Math.random() * n)]]);
            }
        }
        
        return centroids;
    }

    euclideanDistance(vecA, vecB) {
        let sum = 0;
        for (let i = 0; i < vecA.length; i++) {
            const diff = vecA[i] - vecB[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
}
