/**
 * Sentiment Analysis Module
 * Supports both rule-based (VADER-like) and transformer-based models
 */

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';

export class SentimentAnalyzer {
    constructor() {
        this.transformerModel = null;
        this.isLoadingTransformer = false;

        // VADER-like lexicon (simplified version)
        this.lexicon = {
            // Positive words
            'love': 3.0, 'excellent': 3.0, 'amazing': 3.0, 'wonderful': 3.0, 'fantastic': 3.0,
            'great': 2.5, 'good': 2.0, 'nice': 2.0, 'beautiful': 2.5, 'awesome': 3.0,
            'perfect': 3.0, 'best': 3.0, 'brilliant': 3.0, 'outstanding': 3.0, 'superb': 3.0,
            'magnificent': 3.0, 'delightful': 2.5, 'happy': 2.5, 'joy': 2.5, 'pleased': 2.0,
            'satisfied': 2.0, 'enjoy': 2.0, 'like': 1.5, 'appreciate': 2.0, 'recommend': 2.0,
            'impressive': 2.5, 'exceptional': 3.0, 'favorable': 2.0, 'positive': 2.0,
            'beneficial': 2.0, 'valuable': 2.0, 'worthwhile': 2.0, 'helpful': 2.0,

            // Negative words
            'hate': -3.0, 'terrible': -3.0, 'awful': -3.0, 'horrible': -3.0, 'worst': -3.0,
            'bad': -2.0, 'poor': -2.0, 'disappointing': -2.5, 'disappointed': -2.5,
            'useless': -2.5, 'worthless': -3.0, 'pathetic': -2.5, 'disgusting': -3.0,
            'appalling': -3.0, 'dreadful': -3.0, 'atrocious': -3.0, 'nasty': -2.5,
            'sad': -2.0, 'unfortunate': -2.0, 'negative': -2.0, 'wrong': -1.5,
            'fail': -2.0, 'failed': -2.0, 'failure': -2.5, 'problem': -1.5,
            'issue': -1.0, 'difficult': -1.5, 'hard': -1.0, 'complicated': -1.0,
            'disappointing': -2.5, 'regret': -2.0, 'sorry': -1.5, 'waste': -2.5,

            // Intensifiers
            'very': 1.5, 'really': 1.5, 'extremely': 2.0, 'absolutely': 2.0,
            'completely': 1.5, 'totally': 1.5, 'utterly': 2.0, 'highly': 1.5,
            'incredibly': 2.0, 'remarkably': 1.5, 'particularly': 1.3,

            // Diminishers
            'somewhat': 0.5, 'slightly': 0.5, 'barely': 0.5, 'hardly': 0.5,
            'kind of': 0.5, 'sort of': 0.5, 'a bit': 0.5, 'little': 0.5,

            // Negations (handled separately)
            'not': 0, 'no': 0, 'never': 0, 'none': 0, 'nobody': 0,
            'nothing': 0, 'neither': 0, 'nowhere': 0, 'cannot': 0, 'can\'t': 0,
            'don\'t': 0, 'doesn\'t': 0, 'didn\'t': 0, 'won\'t': 0, 'wouldn\'t': 0,
            'shouldn\'t': 0, 'couldn\'t': 0, 'isn\'t': 0, 'aren\'t': 0, 'wasn\'t': 0,
            'weren\'t': 0, 'hasn\'t': 0, 'haven\'t': 0, 'hadn\'t': 0
        };

        this.negations = new Set([
            'not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither', 'nowhere',
            'cannot', 'can\'t', 'don\'t', 'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t',
            'shouldn\'t', 'couldn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t',
            'hasn\'t', 'haven\'t', 'hadn\'t'
        ]);

        this.intensifiers = new Set(['very', 'really', 'extremely', 'absolutely', 'completely', 'totally', 'utterly', 'highly', 'incredibly', 'remarkably', 'particularly']);
        this.diminishers = new Set(['somewhat', 'slightly', 'barely', 'hardly', 'kind of', 'sort of', 'a bit', 'little']);

        // Punctuation boosters
        this.exclamationBoost = 0.292;
        this.questionBoost = 0.18;
    }

    /**
     * Main analysis method
     */
    async analyze(text, model = 'rule-based') {
        if (model === 'transformer') {
            return await this.analyzeWithTransformer(text);
        } else {
            return this.analyzeWithRules(text);
        }
    }

    /**
     * Rule-based sentiment analysis (VADER-like)
     */
    analyzeWithRules(text) {
        const tokens = this.tokenize(text);
        const sentiments = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i].toLowerCase();
            let score = this.lexicon[token] || 0;

            // Handle negations (look back 3 tokens)
            let negated = false;
            for (let j = Math.max(0, i - 3); j < i; j++) {
                if (this.negations.has(tokens[j].toLowerCase())) {
                    negated = true;
                    break;
                }
            }

            if (negated && score !== 0) {
                score = -score * 0.74; // VADER uses 0.74 as negation scalar
            }

            // Handle intensifiers and diminishers (look back 1 token)
            if (i > 0) {
                const prevToken = tokens[i - 1].toLowerCase();
                if (this.intensifiers.has(prevToken)) {
                    score *= (this.lexicon[prevToken] || 1.5);
                } else if (this.diminishers.has(prevToken)) {
                    score *= (this.lexicon[prevToken] || 0.5);
                }
            }

            sentiments.push({ token: tokens[i], score });
            i++;
        }

        // Calculate compound score
        let sumScores = sentiments.reduce((sum, s) => sum + s.score, 0);

        // Apply punctuation boosters
        const exclamationCount = (text.match(/!/g) || []).length;
        if (exclamationCount > 0) {
            sumScores += Math.sign(sumScores) * exclamationCount * this.exclamationBoost;
        }

        // Normalize using alpha (VADER uses 15)
        const alpha = 15;
        const compound = sumScores / Math.sqrt((sumScores * sumScores) + alpha);

        // Calculate individual scores
        const posSum = sentiments.filter(s => s.score > 0).reduce((sum, s) => sum + s.score, 0);
        const negSum = Math.abs(sentiments.filter(s => s.score < 0).reduce((sum, s) => sum + s.score, 0));
        const neuCount = sentiments.filter(s => s.score === 0).length;

        const total = posSum + negSum + neuCount;
        const scores = {
            positive: total > 0 ? posSum / total : 0,
            negative: total > 0 ? negSum / total : 0,
            neutral: total > 0 ? neuCount / total : 0
        };

        // Normalize scores to sum to 1
        const scoreSum = scores.positive + scores.negative + scores.neutral;
        if (scoreSum > 0) {
            scores.positive /= scoreSum;
            scores.negative /= scoreSum;
            scores.neutral /= scoreSum;
        }

        // Determine sentiment and confidence
        let sentiment;
        let confidence;

        if (compound >= 0.05) {
            sentiment = 'positive';
            confidence = scores.positive;
        } else if (compound <= -0.05) {
            sentiment = 'negative';
            confidence = scores.negative;
        } else {
            sentiment = 'neutral';
            confidence = scores.neutral;
        }

        return {
            sentiment,
            confidence,
            scores,
            compound,
            wordScores: sentiments
        };
    }

    /**
     * Transformer-based sentiment analysis
     */
    async analyzeWithTransformer(text) {
        if (!this.transformerModel) {
            await this.loadTransformerModel();
        }

        try {
            const result = await this.transformerModel(text);

            // Transformers.js returns array of label/score pairs
            const scoreMap = {};
            result.forEach(item => {
                const label = item.label.toLowerCase();
                scoreMap[label] = item.score;
            });

            // Map labels to our format (positive, neutral, negative)
            let scores = {
                positive: scoreMap.positive || 0,
                neutral: scoreMap.neutral || 0,
                negative: scoreMap.negative || 0
            };

            // If model uses different labels (like 5-star), map them
            if (scoreMap['5_stars'] !== undefined) {
                // Convert 5-star rating to sentiment
                scores = {
                    positive: (scoreMap['4_stars'] || 0) + (scoreMap['5_stars'] || 0),
                    neutral: scoreMap['3_stars'] || 0,
                    negative: (scoreMap['1_star'] || 0) + (scoreMap['2_stars'] || 0)
                };
            } else if (scoreMap['label_2'] !== undefined) {
                // Generic label format
                scores = {
                    positive: scoreMap['label_2'] || 0,
                    neutral: scoreMap['label_1'] || 0,
                    negative: scoreMap['label_0'] || 0
                };
            }

            // Ensure scores sum to 1
            const total = scores.positive + scores.neutral + scores.negative;
            if (total > 0) {
                scores.positive /= total;
                scores.neutral /= total;
                scores.negative /= total;
            }

            // Determine primary sentiment
            const maxScore = Math.max(scores.positive, scores.neutral, scores.negative);
            let sentiment;
            if (scores.positive === maxScore) {
                sentiment = 'positive';
            } else if (scores.negative === maxScore) {
                sentiment = 'negative';
            } else {
                sentiment = 'neutral';
            }

            // Use simple tokenization for word scores (approximation)
            const tokens = this.tokenize(text);
            const wordScores = tokens.map(token => ({
                token,
                score: this.approximateWordScore(token, sentiment)
            }));

            return {
                sentiment,
                confidence: maxScore,
                scores,
                compound: scores.positive - scores.negative,
                wordScores
            };
        } catch (error) {
            console.error('Transformer analysis error:', error);
            // Fallback to rule-based
            return this.analyzeWithRules(text);
        }
    }

    /**
     * Approximate word score for transformer model
     * (Transformers don't provide word-level scores by default)
     */
    approximateWordScore(token, overallSentiment) {
        const lower = token.toLowerCase();
        // Use lexicon if available
        if (this.lexicon[lower] !== undefined) {
            return this.lexicon[lower];
        }
        // Otherwise use very small score aligned with overall sentiment
        if (overallSentiment === 'positive') return 0.1;
        if (overallSentiment === 'negative') return -0.1;
        return 0;
    }

    /**
     * Load transformer model
     */
    async loadTransformerModel() {
        if (this.isLoadingTransformer) {
            // Wait for existing load to complete
            while (this.isLoadingTransformer) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }

        this.isLoadingTransformer = true;

        try {
            // Use a lightweight sentiment model
            this.transformerModel = await pipeline(
                'sentiment-analysis',
                'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
            );
        } catch (error) {
            console.error('Error loading transformer model:', error);
            throw new Error('Failed to load transformer model. Using rule-based analysis instead.');
        } finally {
            this.isLoadingTransformer = false;
        }
    }

    /**
     * Tokenize text into words
     */
    tokenize(text) {
        // Simple tokenization
        return text
            .replace(/[.,!?;:]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    /**
     * Get word importance for visualization
     */
    getWordImportance(text, sentiment) {
        const tokens = this.tokenize(text);
        const result = this.analyzeWithRules(text);

        return result.wordScores.map((ws, idx) => ({
            word: ws.token,
            score: ws.score,
            index: idx,
            importance: Math.abs(ws.score)
        }));
    }
}

// Additional utility for emoji sentiment
export class EmojiAnalyzer {
    constructor() {
        this.positiveEmojis = new Set([
            '😊', '😀', '😃', '😄', '😁', '😆', '🥰', '😍', '🤩', '😘',
            '😗', '😙', '😚', '🙂', '🤗', '🤭', '🤫', '🤔', '🤐', '😇',
            '😌', '😋', '😛', '😜', '😝', '🤑', '🤠', '👍', '👌', '🤝',
            '👏', '🙌', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '❤️', '💕',
            '💖', '💗', '💓', '💞', '💝', '💟', '❣️', '💌', '🌟', '⭐',
            '🌈', '☀️', '🌻', '🌺', '🌸', '🌷', '🌹', '💐', '🥳', '😎'
        ]);

        this.negativeEmojis = new Set([
            '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩',
            '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀',
            '☠️', '💔', '💢', '👎', '😰', '😨', '😱', '😓', '😪', '😥',
            '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '💩', '👹', '👺', '🤡'
        ]);
    }

    analyze(text) {
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const emojis = text.match(emojiRegex) || [];

        const positive = emojis.filter(e => this.positiveEmojis.has(e));
        const negative = emojis.filter(e => this.negativeEmojis.has(e));

        return {
            total: emojis.length,
            positive: positive.length,
            negative: negative.length,
            neutral: emojis.length - positive.length - negative.length,
            emojis: emojis
        };
    }

    getEmojiSentiment(emoji) {
        if (this.positiveEmojis.has(emoji)) return 'positive';
        if (this.negativeEmojis.has(emoji)) return 'negative';
        return 'neutral';
    }
}
