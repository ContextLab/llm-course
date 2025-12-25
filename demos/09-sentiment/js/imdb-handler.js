/**
 * IMDB Dataset Handler
 * Handles loading and processing of IMDB movie reviews
 */

export class IMDBHandler {
    constructor(analyzer) {
        this.analyzer = analyzer;
        this.data = [];
        this.loadedSize = null;
    }

    async loadDataset(size, numReviews) {
        const filename = size === 'sample' ? 'imdb-sample.json' : 'imdb-reviews.json';
        const maxReviews = size === 'sample' ? 500 : 5000;

        // Validate batch size
        if (numReviews > maxReviews) {
            throw new Error(`The ${size} dataset only has ${maxReviews} reviews. Please select a smaller number.`);
        }

        const response = await fetch(`data/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load dataset: ${response.statusText}`);
        }

        const allReviews = await response.json();

        // Shuffle and take requested number of reviews
        const shuffled = allReviews.sort(() => Math.random() - 0.5);
        this.data = shuffled.slice(0, numReviews);
        this.loadedSize = size;

        return this.data;
    }

    async analyzeBatch(reviews, model, progressCallback) {
        const results = [];

        for (let i = 0; i < reviews.length; i++) {
            const result = await this.analyzer.analyze(reviews[i].text, model);
            results.push({
                text: reviews[i].text,
                trueLabel: reviews[i].sentiment,
                ...result
            });

            if (progressCallback && ((i + 1) % 10 === 0 || i === reviews.length - 1)) {
                progressCallback(i + 1, reviews.length);
            }
        }

        return results;
    }

    calculateMetrics(results) {
        const correct = results.filter(r => r.sentiment === r.trueLabel).length;
        const accuracy = (correct / results.length * 100).toFixed(1);

        // Calculate confusion matrix
        const tp = results.filter(r => r.sentiment === 'positive' && r.trueLabel === 'positive').length;
        const tn = results.filter(r => r.sentiment === 'negative' && r.trueLabel === 'negative').length;
        const fp = results.filter(r => r.sentiment === 'positive' && r.trueLabel === 'negative').length;
        const fn = results.filter(r => r.sentiment === 'negative' && r.trueLabel === 'positive').length;

        const precision = tp + fp > 0 ? (tp / (tp + fp) * 100).toFixed(1) : 0;
        const recall = tp + fn > 0 ? (tp / (tp + fn) * 100).toFixed(1) : 0;
        const f1 = precision > 0 && recall > 0 ?
            (2 * precision * recall / (parseFloat(precision) + parseFloat(recall))).toFixed(1) : 0;

        return {
            accuracy,
            correct,
            total: results.length,
            precision,
            recall,
            f1,
            confusionMatrix: { tp, tn, fp, fn }
        };
    }

    getDatasetStats(data) {
        const positiveCount = data.filter(r => r.sentiment === 'positive').length;
        const negativeCount = data.filter(r => r.sentiment === 'negative').length;

        return {
            total: data.length,
            positive: positiveCount,
            negative: negativeCount,
            positivePercent: Math.round(positiveCount / data.length * 100),
            negativePercent: Math.round(negativeCount / data.length * 100)
        };
    }
}
