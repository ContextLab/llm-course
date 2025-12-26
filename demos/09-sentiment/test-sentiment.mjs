#!/usr/bin/env node
/**
 * Test suite for Sentiment Analysis (Demo 09)
 * Run with: node test-sentiment.mjs
 */

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

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// Simple rule-based sentiment analyzer
class SimpleSentiment {
    constructor() {
        this.positive = new Set(['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'happy']);
        this.negative = new Set(['bad', 'terrible', 'awful', 'horrible', 'hate', 'sad', 'angry']);
        this.intensifiers = new Set(['very', 'extremely', 'really', 'so']);
        this.negations = new Set(['not', 'no', 'never', 'none']);
    }

    tokenize(text) {
        return text.toLowerCase().match(/\b\w+\b/g) || [];
    }

    analyze(text) {
        const tokens = this.tokenize(text);
        let score = 0;
        let multiplier = 1.0;
        let isNegated = false;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (this.negations.has(token)) {
                isNegated = true;
                continue;
            }

            if (this.intensifiers.has(token)) {
                multiplier = 1.5;
                continue;
            }

            if (this.positive.has(token)) {
                score += (isNegated ? -1 : 1) * multiplier;
            } else if (this.negative.has(token)) {
                score -= (isNegated ? -1 : 1) * multiplier;
            }

            // Reset modifiers
            isNegated = false;
            multiplier = 1.0;
        }

        return {
            score,
            sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
        };
    }
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('Sentiment Analysis Test Suite (Demo 09)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();
    const analyzer = new SimpleSentiment();

    // Test 1: Positive Sentiment
    console.log('\n--- Test Group 1: Positive Sentiment ---\n');

    const pos1 = analyzer.analyze("This is great and wonderful!");
    runner.assertGreaterThan(pos1.score, 0, "Positive text should have positive score");
    runner.assertEqual(pos1.sentiment, 'positive', "Should classify as positive");

    // Test 2: Negative Sentiment
    console.log('\n--- Test Group 2: Negative Sentiment ---\n');

    const neg1 = analyzer.analyze("This is terrible and awful");
    runner.assertLessThan(neg1.score, 0, "Negative text should have negative score");
    runner.assertEqual(neg1.sentiment, 'negative', "Should classify as negative");

    // Test 3: Negation Handling
    console.log('\n--- Test Group 3: Negation Handling ---\n');

    const neg2 = analyzer.analyze("This is not good");
    runner.assertLessThan(neg2.score, 0, "Negation should flip sentiment");

    const neg3 = analyzer.analyze("This is not bad");
    runner.assertGreaterThan(neg3.score, 0, "Double negation should result in positive");

    // Test 4: Intensifiers
    console.log('\n--- Test Group 4: Intensifiers ---\n');

    const int1 = analyzer.analyze("good");
    const int2 = analyzer.analyze("very good");
    runner.assertGreaterThan(int2.score, int1.score, "Intensifier should increase score");

    // Test 5: Neutral Text
    console.log('\n--- Test Group 5: Neutral Text ---\n');

    const neutral = analyzer.analyze("The sky is blue");
    runner.assertEqual(neutral.sentiment, 'neutral', "Neutral text should be classified as neutral");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
