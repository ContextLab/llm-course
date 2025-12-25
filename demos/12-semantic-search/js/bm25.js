/**
 * BM25 (Best Matching 25) Implementation
 * Classic keyword search algorithm based on TF-IDF with saturation
 */

export class BM25 {
    constructor(k1 = 1.5, b = 0.75) {
        this.k1 = k1;  // Term frequency saturation parameter
        this.b = b;    // Document length normalization parameter
        this.documents = [];
        this.tokenizedDocs = [];
        this.idf = {};
        this.avgDocLength = 0;
        this.docLengths = [];
    }

    /**
     * Tokenize text into words
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    /**
     * Build index from documents
     */
    buildIndex(documents) {
        this.documents = documents;
        this.tokenizedDocs = documents.map(doc => this.tokenize(doc));

        // Calculate document lengths
        this.docLengths = this.tokenizedDocs.map(doc => doc.length);
        this.avgDocLength = this.docLengths.reduce((a, b) => a + b, 0) / this.docLengths.length;

        // Calculate IDF for each term
        const docFrequency = {};
        const numDocs = this.tokenizedDocs.length;

        // Count document frequency for each term
        this.tokenizedDocs.forEach(doc => {
            const uniqueTerms = new Set(doc);
            uniqueTerms.forEach(term => {
                docFrequency[term] = (docFrequency[term] || 0) + 1;
            });
        });

        // Calculate IDF: log((N - df + 0.5) / (df + 0.5) + 1)
        for (const term in docFrequency) {
            const df = docFrequency[term];
            this.idf[term] = Math.log((numDocs - df + 0.5) / (df + 0.5) + 1);
        }
    }

    /**
     * Calculate BM25 score for a query against a document
     */
    calculateScore(queryTokens, docTokens, docLength) {
        let score = 0;

        // Count term frequency in document
        const termFreq = {};
        docTokens.forEach(term => {
            termFreq[term] = (termFreq[term] || 0) + 1;
        });

        // Calculate BM25 score
        queryTokens.forEach(queryTerm => {
            const tf = termFreq[queryTerm] || 0;
            const idf = this.idf[queryTerm] || 0;

            if (tf > 0) {
                const normalization = 1 - this.b + this.b * (docLength / this.avgDocLength);
                const tfComponent = (tf * (this.k1 + 1)) / (tf + this.k1 * normalization);
                score += idf * tfComponent;
            }
        });

        return score;
    }

    /**
     * Search for query and return top-k results
     */
    search(query, topK = 10) {
        const startTime = performance.now();
        const queryTokens = this.tokenize(query);

        if (queryTokens.length === 0) {
            return {
                results: [],
                time: 0,
                avgScore: 0
            };
        }

        // Calculate scores for all documents
        const scores = this.tokenizedDocs.map((docTokens, index) => ({
            index,
            score: this.calculateScore(queryTokens, docTokens, this.docLengths[index]),
            document: this.documents[index]
        }));

        // Sort by score (descending) and take top-k
        const results = scores
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        // Normalize scores to 0-1 range for better comparison
        if (results.length > 0) {
            const maxScore = results[0].score;
            results.forEach(result => {
                result.normalizedScore = maxScore > 0 ? result.score / maxScore : 0;
            });
        }

        const endTime = performance.now();
        const avgScore = results.length > 0
            ? results.reduce((sum, r) => sum + r.normalizedScore, 0) / results.length
            : 0;

        return {
            results,
            time: endTime - startTime,
            avgScore
        };
    }

    /**
     * Highlight query terms in text
     */
    highlightTerms(text, query) {
        const queryTokens = this.tokenize(query);
        let highlightedText = text;

        queryTokens.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, match => `<span class="result-highlight">${match}</span>`);
        });

        return highlightedText;
    }

    /**
     * Get vocabulary statistics
     */
    getVocabularySize() {
        return Object.keys(this.idf).length;
    }

    /**
     * Get top terms by IDF
     */
    getTopTermsByIDF(topK = 20) {
        return Object.entries(this.idf)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topK)
            .map(([term, idf]) => ({ term, idf }));
    }
}
