/**
 * Hybrid Search Implementation
 * Combines semantic and keyword search scores
 */

export class HybridSearch {
    constructor(semanticSearch, bm25Search) {
        this.semanticSearch = semanticSearch;
        this.bm25Search = bm25Search;
    }

    /**
     * Perform hybrid search combining semantic and keyword results
     * @param {string} query - Search query
     * @param {number} alpha - Weight for semantic search (0-1), (1-alpha) for keyword
     * @param {number} topK - Number of results to return
     */
    async search(query, alpha = 0.5, topK = 10) {
        const startTime = performance.now();

        // Get results from both search methods
        const [semanticResults, keywordResults] = await Promise.all([
            this.semanticSearch.search(query, topK * 2),  // Get more results for better fusion
            Promise.resolve(this.bm25Search.search(query, topK * 2))
        ]);

        // Create a map of document scores
        const scoreMap = new Map();

        // Add semantic scores
        semanticResults.results.forEach(result => {
            scoreMap.set(result.index, {
                index: result.index,
                document: result.document,
                semanticScore: result.normalizedScore,
                keywordScore: 0,
                hybridScore: 0
            });
        });

        // Add keyword scores
        keywordResults.results.forEach(result => {
            if (scoreMap.has(result.index)) {
                scoreMap.get(result.index).keywordScore = result.normalizedScore;
            } else {
                scoreMap.set(result.index, {
                    index: result.index,
                    document: result.document,
                    semanticScore: 0,
                    keywordScore: result.normalizedScore,
                    hybridScore: 0
                });
            }
        });

        // Calculate hybrid scores
        const results = Array.from(scoreMap.values()).map(item => {
            item.hybridScore = alpha * item.semanticScore + (1 - alpha) * item.keywordScore;
            item.score = item.hybridScore;
            item.normalizedScore = item.hybridScore;
            return item;
        });

        // Sort by hybrid score and take top-k
        const topResults = results
            .sort((a, b) => b.hybridScore - a.hybridScore)
            .slice(0, topK);

        const endTime = performance.now();
        const avgScore = topResults.length > 0
            ? topResults.reduce((sum, r) => sum + r.hybridScore, 0) / topResults.length
            : 0;

        return {
            results: topResults,
            time: endTime - startTime,
            avgScore,
            semanticTime: semanticResults.time,
            keywordTime: keywordResults.time
        };
    }

    /**
     * Analyze overlap between semantic and keyword results
     */
    async analyzeOverlap(query, topK = 10) {
        const [semanticResults, keywordResults] = await Promise.all([
            this.semanticSearch.search(query, topK),
            Promise.resolve(this.bm25Search.search(query, topK))
        ]);

        const semanticIndices = new Set(semanticResults.results.map(r => r.index));
        const keywordIndices = new Set(keywordResults.results.map(r => r.index));

        const intersection = new Set(
            [...semanticIndices].filter(x => keywordIndices.has(x))
        );

        const semanticOnly = new Set(
            [...semanticIndices].filter(x => !keywordIndices.has(x))
        );

        const keywordOnly = new Set(
            [...keywordIndices].filter(x => !semanticIndices.has(x))
        );

        return {
            semantic: semanticIndices.size,
            keyword: keywordIndices.size,
            intersection: intersection.size,
            semanticOnly: semanticOnly.size,
            keywordOnly: keywordOnly.size,
            overlapPercentage: (intersection.size / topK) * 100
        };
    }

    /**
     * Get statistics comparing different alpha values
     */
    async compareAlphas(query, alphas = [0, 0.25, 0.5, 0.75, 1.0], topK = 10) {
        const results = [];

        for (const alpha of alphas) {
            const result = await this.search(query, alpha, topK);
            results.push({
                alpha,
                avgScore: result.avgScore,
                time: result.time,
                topDocIndices: result.results.slice(0, 5).map(r => r.index)
            });
        }

        return results;
    }
}
