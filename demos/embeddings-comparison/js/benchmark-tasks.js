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

        for (const modelId of modelIds) {
            const [embA, embB, embC] = await Promise.all([
                this.modelsManager.embed(modelId, wordA),
                this.modelsManager.embed(modelId, wordB),
                this.modelsManager.embed(modelId, wordC)
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
                const embD = await this.modelsManager.embed(modelId, candidate);
                const similarity = this.modelsManager.cosineSimilarity(
                    analogyVec,
                    embD.embedding
                );
                candidateResults.push({ word: candidate, similarity });
            }

            candidateResults.sort((a, b) => b.similarity - a.similarity);

            results.push({
                modelId,
                modelName: this.modelsManager.getModelConfig(modelId).name,
                prediction: candidateResults[0].word,
                confidence: candidateResults[0].similarity,
                allCandidates: candidateResults.slice(0, 5),
                time: embA.time + embB.time + embC.time
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
        
        const candidateSets = {
            royalty: ['woman', 'girl', 'female', 'lady', 'princess', 'duchess', 'empress'],
            capitals: ['England', 'UK', 'Britain', 'Germany', 'Spain', 'Italy', 'Japan', 'China', 'Canada', 'Australia'],
            grammar: ['worse', 'worst', 'badly', 'poorly', 'terrible', 'awful'],
            tense: ['ran', 'walked', 'jumped', 'swam', 'flew', 'drove', 'ate', 'slept'],
            countries: ['French', 'German', 'Spanish', 'Italian', 'Japanese', 'Chinese', 'British', 'American'],
            profession: ['actress', 'waitress', 'hostess', 'stewardess', 'heroine', 'woman'],
            size: ['tiny', 'small', 'little', 'huge', 'giant', 'massive', 'enormous'],
            emotion: ['sad', 'angry', 'scared', 'excited', 'nervous', 'calm', 'joyful']
        };

        if ((a === 'king' && b === 'queen') || (a === 'man' && b === 'woman') || 
            (a === 'boy' && b === 'girl') || (a === 'father' && b === 'mother')) {
            return candidateSets.royalty;
        }
        
        if (['paris', 'london', 'berlin', 'tokyo', 'rome', 'madrid'].includes(a) ||
            ['france', 'england', 'germany', 'japan', 'italy', 'spain'].includes(a)) {
            return candidateSets.capitals;
        }
        
        if (['good', 'bad', 'big', 'small', 'fast', 'slow'].includes(a) &&
            ['better', 'worse', 'bigger', 'smaller', 'faster', 'slower'].includes(b)) {
            return candidateSets.grammar;
        }
        
        if (['walk', 'run', 'swim', 'fly', 'drive', 'eat'].includes(a)) {
            return candidateSets.tense;
        }

        return [
            wordB, `${wordB}s`, `${wordC}er`, `${wordC}ing`,
            'woman', 'man', 'person', 'thing', 'place',
            'good', 'bad', 'big', 'small', 'new', 'old'
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
            const clusters = this.kMeansClustering(embeddings, numCategories);

            const endTime = performance.now();

            // Organize items by cluster
            const categories = Array.from({ length: numCategories }, () => []);
            items.forEach((item, idx) => {
                categories[clusters[idx]].push(item);
            });

            results.push({
                modelId,
                modelName: this.modelsManager.getModelConfig(modelId).name,
                categories,
                time: endTime - startTime
            });
        }

        return results;
    }

    kMeansClustering(embeddings, k, maxIters = 10) {
        const n = embeddings.length;
        const dim = embeddings[0].length;

        // Initialize centroids randomly
        const centroids = [];
        const indices = new Set();
        while (centroids.length < k) {
            const idx = Math.floor(Math.random() * n);
            if (!indices.has(idx)) {
                centroids.push([...embeddings[idx]]);
                indices.add(idx);
            }
        }

        let assignments = Array(n).fill(0);

        for (let iter = 0; iter < maxIters; iter++) {
            // Assign points to nearest centroid
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

            // Update centroids
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

        return assignments;
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
