#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Sentiment Analysis (Demo 09)
 * Run with: node test-sentiment.mjs
 *
 * Tests cover:
 * - Positive/Negative/Neutral sentiment detection
 * - Intensity variations (mild to extreme)
 * - Negation handling (single, double, triple)
 * - Intensifiers and diminishers
 * - Mixed sentiment
 * - Edge cases (empty, punctuation, emojis, capitalization)
 * - Score calculation accuracy
 */

/**
 * Rule-based Sentiment Analyzer (VADER-like)
 * Standalone version for testing (no CDN dependencies)
 */
class SentimentAnalyzer {
    constructor() {
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
            'pleasant': 2.0,

            // Negative words
            'hate': -3.0, 'terrible': -3.0, 'awful': -3.0, 'horrible': -3.0, 'worst': -3.0,
            'bad': -2.0, 'poor': -2.0, 'disappointing': -2.5,
            'useless': -2.5, 'worthless': -3.0, 'pathetic': -2.5, 'disgusting': -3.0,
            'appalling': -3.0, 'dreadful': -3.0, 'atrocious': -3.0, 'nasty': -2.5,
            'sad': -2.0, 'unfortunate': -2.0, 'negative': -2.0, 'wrong': -1.5,
            'fail': -2.0, 'failed': -2.0, 'failure': -2.5, 'problem': -1.5,
            'issue': -1.0, 'difficult': -1.5, 'hard': -1.0, 'complicated': -1.0,
            'regret': -2.0, 'sorry': -1.5, 'waste': -2.5, 'disaster': -3.0,
            'expensive': -1.0,

            // Intensifiers
            'very': 1.5, 'really': 1.5, 'extremely': 2.0, 'absolutely': 2.0,
            'completely': 1.5, 'totally': 1.5, 'utterly': 2.0, 'highly': 1.5,
            'incredibly': 2.0, 'remarkably': 1.5, 'particularly': 1.3,

            // Diminishers
            'somewhat': 0.5, 'slightly': 0.5, 'barely': 0.5, 'hardly': 0.5,
            'kind': 0.5, 'sort': 0.5, 'bit': 0.5, 'little': 0.5,
        };

        this.negations = new Set([
            'not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither', 'nowhere',
            'cannot', 'can\'t', 'don\'t', 'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t',
            'shouldn\'t', 'couldn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t',
            'hasn\'t', 'haven\'t', 'hadn\'t'
        ]);

        this.intensifiers = new Set(['very', 'really', 'extremely', 'absolutely', 'completely', 'totally', 'utterly', 'highly', 'incredibly', 'remarkably', 'particularly']);
        this.diminishers = new Set(['somewhat', 'slightly', 'barely', 'hardly', 'kind', 'sort', 'bit', 'little']);

        // Punctuation boosters
        this.exclamationBoost = 0.292;
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
     * Tokenize text into words
     */
    tokenize(text) {
        // Simple tokenization
        return text
            .replace(/[.,!?;:]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }
}

/**
 * Emoji Sentiment Analyzer
 */
class EmojiAnalyzer {
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

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
    }

    assert(condition, testName, expected, actual) {
        this.total++;
        if (condition) {
            console.log(`✓ PASS: ${testName}`);
            this.passed++;
        } else {
            console.log(`✗ FAIL: ${testName}`);
            console.log(`  Expected: ${JSON.stringify(expected)}`);
            console.log(`  Actual: ${JSON.stringify(actual)}`);
            this.failed++;
        }
    }

    assertEqual(actual, expected, testName) {
        this.assert(actual === expected, testName, expected, actual);
    }

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    assertLessThan(actual, threshold, testName) {
        this.assert(actual < threshold, testName, `< ${threshold}`, actual);
    }

    assertGreaterThanOrEqual(actual, threshold, testName) {
        this.assert(actual >= threshold, testName, `>= ${threshold}`, actual);
    }

    assertLessThanOrEqual(actual, threshold, testName) {
        this.assert(actual <= threshold, testName, `<= ${threshold}`, actual);
    }

    assertInRange(actual, min, max, testName) {
        this.assert(actual >= min && actual <= max, testName, `${min} to ${max}`, actual);
    }

    assertTruthy(actual, testName) {
        this.assert(!!actual, testName, 'truthy', actual);
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('Comprehensive Sentiment Analysis Test Suite (Demo 09)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();
    const analyzer = new SentimentAnalyzer();
    const emojiAnalyzer = new EmojiAnalyzer();

    // ========================================================================
    // Test Group 1: Basic Positive Sentiment (Various Intensities)
    // ========================================================================
    console.log('\n--- Test Group 1: Positive Sentiment (Various Intensities) ---\n');

    const pos1 = analyzer.analyzeWithRules("This is good");
    runner.assertEqual(pos1.sentiment, 'positive', "Basic positive word");
    runner.assertGreaterThan(pos1.compound, 0, "Positive compound score for 'good'");

    const pos2 = analyzer.analyzeWithRules("This is great");
    runner.assertEqual(pos2.sentiment, 'positive', "Strong positive word");
    runner.assertGreaterThan(pos2.compound, pos1.compound, "'Great' should score higher than 'good'");

    const pos3 = analyzer.analyzeWithRules("This is excellent");
    runner.assertEqual(pos3.sentiment, 'positive', "Very strong positive word");
    runner.assertGreaterThan(pos3.compound, pos2.compound, "'Excellent' should score higher than 'great'");

    const pos4 = analyzer.analyzeWithRules("I love this amazing product");
    runner.assertEqual(pos4.sentiment, 'positive', "Multiple positive words");
    runner.assertGreaterThan(pos4.compound, pos3.compound, "Multiple positives should amplify score");

    const pos5 = analyzer.analyzeWithRules("Wonderful, fantastic, and absolutely brilliant!");
    runner.assertEqual(pos5.sentiment, 'positive', "Multiple strong positive words");
    runner.assertGreaterThan(pos5.compound, 0.5, "Very high compound score for multiple positives");

    const pos6 = analyzer.analyzeWithRules("Nice and pleasant experience");
    runner.assertEqual(pos6.sentiment, 'positive', "Mild positive sentiment");

    const pos7 = analyzer.analyzeWithRules("I appreciate your help");
    runner.assertEqual(pos7.sentiment, 'positive', "Positive appreciation");

    const pos8 = analyzer.analyzeWithRules("Outstanding performance, highly recommend");
    runner.assertEqual(pos8.sentiment, 'positive', "Professional positive review");

    // ========================================================================
    // Test Group 2: Basic Negative Sentiment (Various Intensities)
    // ========================================================================
    console.log('\n--- Test Group 2: Negative Sentiment (Various Intensities) ---\n');

    const neg1 = analyzer.analyzeWithRules("This is bad");
    runner.assertEqual(neg1.sentiment, 'negative', "Basic negative word");
    runner.assertLessThan(neg1.compound, 0, "Negative compound score for 'bad'");

    const neg2 = analyzer.analyzeWithRules("This is terrible");
    runner.assertEqual(neg2.sentiment, 'negative', "Strong negative word");
    runner.assertLessThan(neg2.compound, neg1.compound, "'Terrible' should score lower than 'bad'");

    const neg3 = analyzer.analyzeWithRules("This is awful and horrible");
    runner.assertEqual(neg3.sentiment, 'negative', "Multiple negative words");
    runner.assertLessThan(neg3.compound, neg2.compound, "Multiple negatives should amplify score");

    const neg4 = analyzer.analyzeWithRules("I hate this terrible product");
    runner.assertEqual(neg4.sentiment, 'negative', "Strong negative emotion");
    runner.assertLessThan(neg4.compound, -0.3, "Strong negative compound score");

    const neg5 = analyzer.analyzeWithRules("Pathetic, useless, and utterly disappointing");
    runner.assertEqual(neg5.sentiment, 'negative', "Multiple strong negatives");
    runner.assertLessThan(neg5.compound, -0.5, "Very low compound for multiple negatives");

    const neg6 = analyzer.analyzeWithRules("Poor quality and unfortunate result");
    runner.assertEqual(neg6.sentiment, 'negative', "Mild negative sentiment");

    const neg7 = analyzer.analyzeWithRules("Complete waste of time");
    runner.assertEqual(neg7.sentiment, 'negative', "Negative with intensifier");

    const neg8 = analyzer.analyzeWithRules("Failed expectations, total disaster");
    runner.assertEqual(neg8.sentiment, 'negative', "Strong negative assessment");

    // ========================================================================
    // Test Group 3: Neutral Sentiment
    // ========================================================================
    console.log('\n--- Test Group 3: Neutral Sentiment ---\n');

    const neu1 = analyzer.analyzeWithRules("The sky is blue");
    runner.assertEqual(neu1.sentiment, 'neutral', "Factual statement");
    runner.assertInRange(neu1.compound, -0.05, 0.05, "Neutral compound score");

    const neu2 = analyzer.analyzeWithRules("The meeting is at 3pm");
    runner.assertEqual(neu2.sentiment, 'neutral', "Time statement");

    const neu3 = analyzer.analyzeWithRules("The document has 50 pages");
    runner.assertEqual(neu3.sentiment, 'neutral', "Numerical fact");

    const neu4 = analyzer.analyzeWithRules("This is a test");
    runner.assertEqual(neu4.sentiment, 'neutral', "Simple statement");

    const neu5 = analyzer.analyzeWithRules("I went to the store");
    runner.assertEqual(neu5.sentiment, 'neutral', "Activity statement");

    // ========================================================================
    // Test Group 4: Negation Handling
    // ========================================================================
    console.log('\n--- Test Group 4: Negation Handling ---\n');

    const negation1 = analyzer.analyzeWithRules("This is not good");
    runner.assertEqual(negation1.sentiment, 'negative', "Negation of positive");
    runner.assertLessThan(negation1.compound, 0, "Negated positive becomes negative");

    const negation2 = analyzer.analyzeWithRules("This is not bad");
    runner.assertEqual(negation2.sentiment, 'positive', "Negation of negative (double negative)");
    runner.assertGreaterThan(negation2.compound, 0, "Negated negative becomes positive");

    const negation3 = analyzer.analyzeWithRules("This is not great");
    runner.assertEqual(negation3.sentiment, 'negative', "Negation of strong positive");

    const negation4 = analyzer.analyzeWithRules("This is not terrible");
    runner.assertEqual(negation4.sentiment, 'positive', "Negation of strong negative");

    const negation5 = analyzer.analyzeWithRules("I don't hate it");
    runner.assertEqual(negation5.sentiment, 'positive', "Contraction negation");

    const negation6 = analyzer.analyzeWithRules("Never awful, never bad");
    runner.assertEqual(negation6.sentiment, 'positive', "Multiple negations");

    const negation7 = analyzer.analyzeWithRules("No problem at all");
    runner.assertInRange(negation7.compound, -0.05, 0.30, "Negation with neutral context");

    const negation8 = analyzer.analyzeWithRules("This isn't terrible but isn't great");
    runner.assertInRange(negation8.compound, -0.3, 0.3, "Mixed negations");

    // ========================================================================
    // Test Group 5: Intensifiers
    // ========================================================================
    console.log('\n--- Test Group 5: Intensifiers ---\n');

    const int1 = analyzer.analyzeWithRules("good");
    const int2 = analyzer.analyzeWithRules("very good");
    runner.assertGreaterThan(int2.compound, int1.compound, "'Very' should amplify 'good'");

    const int3 = analyzer.analyzeWithRules("extremely good");
    runner.assertGreaterThan(int3.compound, int2.compound, "'Extremely' stronger than 'very'");

    const int4 = analyzer.analyzeWithRules("incredibly amazing");
    runner.assertEqual(int4.sentiment, 'positive', "Intensifier + strong positive");
    runner.assertGreaterThan(int4.compound, 0.5, "High score for intensified positive");

    const int5 = analyzer.analyzeWithRules("really terrible");
    const int6 = analyzer.analyzeWithRules("terrible");
    runner.assertLessThanOrEqual(int5.compound, int6.compound, "Intensifier amplifies negative");

    const int7 = analyzer.analyzeWithRules("absolutely wonderful");
    runner.assertEqual(int7.sentiment, 'positive', "Strong intensifier");

    const int8 = analyzer.analyzeWithRules("totally awful");
    runner.assertEqual(int8.sentiment, 'negative', "Intensified negative");

    // ========================================================================
    // Test Group 6: Diminishers
    // ========================================================================
    console.log('\n--- Test Group 6: Diminishers ---\n');

    const dim1 = analyzer.analyzeWithRules("good");
    const dim2 = analyzer.analyzeWithRules("somewhat good");
    runner.assertLessThan(dim2.compound, dim1.compound, "'Somewhat' should reduce intensity");
    runner.assertEqual(dim2.sentiment, 'positive', "Still positive but weaker");

    const dim3 = analyzer.analyzeWithRules("slightly good");
    runner.assertLessThan(dim3.compound, dim1.compound, "'Slightly' reduces intensity");

    const dim4 = analyzer.analyzeWithRules("barely good");
    runner.assertLessThanOrEqual(dim4.compound, dim3.compound, "'Barely' is weaker than or equal to 'slightly'");

    const dim5 = analyzer.analyzeWithRules("somewhat bad");
    runner.assertEqual(dim5.sentiment, 'negative', "Diminished negative still negative");

    // ========================================================================
    // Test Group 7: Mixed Sentiment
    // ========================================================================
    console.log('\n--- Test Group 7: Mixed Sentiment ---\n');

    const mixed1 = analyzer.analyzeWithRules("The product is good but expensive");
    runner.assertInRange(mixed1.compound, -0.3, 0.3, "Mixed positive and neutral");

    const mixed2 = analyzer.analyzeWithRules("I love the design but hate the performance");
    runner.assertInRange(mixed2.compound, -0.3, 0.3, "Balanced positive and negative");

    const mixed3 = analyzer.analyzeWithRules("Great features, terrible support");
    runner.assertInRange(mixed3.compound, -0.3, 0.3, "Contrasting sentiments");

    const mixed4 = analyzer.analyzeWithRules("Not bad, but not great either");
    runner.assertInRange(mixed4.compound, -0.2, 0.2, "Mild mixed sentiment");

    const mixed5 = analyzer.analyzeWithRules("Excellent quality but disappointing delivery");
    runner.assertInRange(mixed5.compound, -0.3, 0.3, "Strong contrasts");

    // ========================================================================
    // Test Group 8: Punctuation Effects
    // ========================================================================
    console.log('\n--- Test Group 8: Punctuation Effects ---\n');

    const punct1 = analyzer.analyzeWithRules("This is great");
    const punct2 = analyzer.analyzeWithRules("This is great!");
    runner.assertGreaterThan(punct2.compound, punct1.compound, "Exclamation should boost positive");

    const punct3 = analyzer.analyzeWithRules("This is great!!");
    runner.assertGreaterThan(punct3.compound, punct2.compound, "Multiple exclamations boost more");

    const punct4 = analyzer.analyzeWithRules("Amazing!!!");
    runner.assertGreaterThan(punct4.compound, 0.5, "Strong positive with exclamations");

    const punct5 = analyzer.analyzeWithRules("Terrible!");
    const punct6 = analyzer.analyzeWithRules("Terrible");
    runner.assertLessThan(punct5.compound, punct6.compound, "Exclamation amplifies negative too");

    // ========================================================================
    // Test Group 9: Edge Cases
    // ========================================================================
    console.log('\n--- Test Group 9: Edge Cases ---\n');

    const edge1 = analyzer.analyzeWithRules("");
    runner.assertEqual(edge1.sentiment, 'neutral', "Empty string should be neutral");

    const edge2 = analyzer.analyzeWithRules("   ");
    runner.assertEqual(edge2.sentiment, 'neutral', "Whitespace only should be neutral");

    const edge3 = analyzer.analyzeWithRules("!!!???");
    runner.assertEqual(edge3.sentiment, 'neutral', "Punctuation only should be neutral");

    const edge4 = analyzer.analyzeWithRules("GREAT");
    runner.assertEqual(edge4.sentiment, 'positive', "All caps positive word");

    const edge5 = analyzer.analyzeWithRules("good GOOD Good");
    runner.assertEqual(edge5.sentiment, 'positive', "Mixed case repetition");

    const edge6 = analyzer.analyzeWithRules("123 456 789");
    runner.assertEqual(edge6.sentiment, 'neutral', "Numbers only");

    const edge7 = analyzer.analyzeWithRules("a");
    runner.assertEqual(edge7.sentiment, 'neutral', "Single character");

    // ========================================================================
    // Test Group 10: Complex Sentences
    // ========================================================================
    console.log('\n--- Test Group 10: Complex Sentences ---\n');

    const complex1 = analyzer.analyzeWithRules("Although the service was terrible, the food was absolutely amazing");
    runner.assertEqual(complex1.sentiment, 'positive', "Complex sentence with contrast");

    const complex2 = analyzer.analyzeWithRules("I really wanted to love it, but it was disappointing");
    runner.assertInRange(complex2.compound, -0.3, 0.5, "Disappointed expectation (mixed with strong positive)");

    const complex3 = analyzer.analyzeWithRules("Not only is it good, it's excellent!");
    runner.assertEqual(complex3.sentiment, 'positive', "Emphatic positive structure");

    const complex4 = analyzer.analyzeWithRules("I can't say it's bad, but it's not great either");
    runner.assertInRange(complex4.compound, -0.3, 0.3, "Nuanced mixed sentiment");

    // ========================================================================
    // Test Group 11: Emoji Analysis
    // ========================================================================
    console.log('\n--- Test Group 11: Emoji Analysis ---\n');

    const emoji1 = emojiAnalyzer.analyze("I love this! 😊❤️");
    runner.assertGreaterThan(emoji1.positive, 0, "Positive emojis detected");
    runner.assertEqual(emoji1.negative, 0, "No negative emojis");

    const emoji2 = emojiAnalyzer.analyze("This is terrible 😞😭");
    runner.assertEqual(emoji2.positive, 0, "No positive emojis");
    runner.assertGreaterThan(emoji2.negative, 0, "Negative emojis detected");

    const emoji3 = emojiAnalyzer.analyze("Mixed feelings 😊😞");
    runner.assertGreaterThan(emoji3.positive, 0, "Has positive emoji");
    runner.assertGreaterThan(emoji3.negative, 0, "Has negative emoji");

    const emoji4 = emojiAnalyzer.analyze("No emojis here");
    runner.assertEqual(emoji4.total, 0, "No emojis detected");

    const emoji5 = emojiAnalyzer.getEmojiSentiment("😊");
    runner.assertEqual(emoji5, 'positive', "Smile emoji is positive");

    const emoji6 = emojiAnalyzer.getEmojiSentiment("😭");
    runner.assertEqual(emoji6, 'negative', "Crying emoji is negative");

    // ========================================================================
    // Test Group 12: Score Accuracy and Ranges
    // ========================================================================
    console.log('\n--- Test Group 12: Score Accuracy and Ranges ---\n');

    const score1 = analyzer.analyzeWithRules("good");
    runner.assertInRange(score1.compound, -1, 1, "Compound score in valid range");
    runner.assertInRange(score1.scores.positive, 0, 1, "Positive score normalized");
    runner.assertInRange(score1.scores.negative, 0, 1, "Negative score normalized");
    runner.assertInRange(score1.scores.neutral, 0, 1, "Neutral score normalized");

    const score2 = analyzer.analyzeWithRules("terrible");
    const scoreSum = score2.scores.positive + score2.scores.negative + score2.scores.neutral;
    runner.assertInRange(scoreSum, 0.99, 1.01, "Scores sum to approximately 1");

    const score3 = analyzer.analyzeWithRules("I love this amazing product!");
    runner.assertGreaterThan(score3.scores.positive, score3.scores.negative, "Positive score dominant");
    runner.assertGreaterThan(score3.scores.positive, score3.scores.neutral, "Positive over neutral");

    const score4 = analyzer.analyzeWithRules("This is terrible and awful");
    runner.assertGreaterThan(score4.scores.negative, score4.scores.positive, "Negative score dominant");

    // ========================================================================
    // Test Group 13: Word-level Scores
    // ========================================================================
    console.log('\n--- Test Group 13: Word-level Scores ---\n');

    const word1 = analyzer.analyzeWithRules("I love great products");
    runner.assertTruthy(word1.wordScores, "Word scores exist");
    runner.assertGreaterThan(word1.wordScores.length, 0, "Has word scores");

    const word2 = analyzer.analyzeWithRules("terrible awful bad");
    const negativeWords = word2.wordScores.filter(w => w.score < 0);
    runner.assertGreaterThanOrEqual(negativeWords.length, 3, "Multiple negative word scores");

    // ========================================================================
    // Test Group 14: Consistency Tests
    // ========================================================================
    console.log('\n--- Test Group 14: Consistency Tests ---\n');

    const cons1a = analyzer.analyzeWithRules("This is great");
    const cons1b = analyzer.analyzeWithRules("This is great");
    runner.assertEqual(cons1a.compound, cons1b.compound, "Same input yields same score");
    runner.assertEqual(cons1a.sentiment, cons1b.sentiment, "Same input yields same sentiment");

    const cons2a = analyzer.analyzeWithRules("good");
    const cons2b = analyzer.analyzeWithRules("Good");
    runner.assertEqual(cons2a.compound, cons2b.compound, "Case insensitive scoring");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
