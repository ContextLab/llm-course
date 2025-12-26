#!/usr/bin/env node
/**
 * Test suite for Embeddings Comparison (Demo 14)
 * Run with: node test-comparison.mjs
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

    assertClose(actual, expected, tolerance, testName) {
        const diff = Math.abs(actual - expected);
        this.assert(
            diff <= tolerance,
            testName,
            `${expected} ± ${tolerance}`,
            actual
        );
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// Comparison metrics
function cosineSimilarity(v1, v2) {
    const dot = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
    return dot / (mag1 * mag2);
}

function compareModels(embeddings1, embeddings2) {
    const similarities = [];
    const words = Object.keys(embeddings1);

    for (const word of words) {
        if (embeddings2[word]) {
            const sim = cosineSimilarity(embeddings1[word], embeddings2[word]);
            similarities.push(sim);
        }
    }

    return {
        avgSimilarity: similarities.reduce((a, b) => a + b, 0) / similarities.length,
        count: similarities.length
    };
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('Embeddings Comparison Test Suite (Demo 14)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Cosine Similarity
    console.log('\n--- Test Group 1: Cosine Similarity ---\n');

    const sim1 = cosineSimilarity([1, 0, 0], [1, 0, 0]);
    runner.assertClose(sim1, 1.0, 0.001, "Identical vectors should have similarity 1.0");

    const sim2 = cosineSimilarity([1, 0, 0], [0, 1, 0]);
    runner.assertClose(sim2, 0.0, 0.001, "Orthogonal vectors should have similarity 0.0");

    // Test 2: Model Comparison
    console.log('\n--- Test Group 2: Model Comparison ---\n');

    const model1 = {
        'cat': [1, 0.5, 0.2],
        'dog': [0.9, 0.6, 0.3]
    };

    const model2 = {
        'cat': [1.1, 0.45, 0.25],
        'dog': [0.85, 0.65, 0.35]
    };

    const comparison = compareModels(model1, model2);
    runner.assertEqual(comparison.count, 2, "Should compare 2 common words");
    runner.assert(
        comparison.avgSimilarity > 0.9,
        "Similar embeddings should have high average similarity",
        "> 0.9",
        comparison.avgSimilarity.toFixed(3)
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
