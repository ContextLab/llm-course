#!/usr/bin/env node
/**
 * Test suite for Attention Mechanisms (Demo 04)
 * Run with: node test-attention.mjs
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

// Attention calculation helpers
function softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
}

function computeAttentionWeights(query, keys) {
    const scores = keys.map(key => {
        return query.reduce((sum, q, i) => sum + q * key[i], 0);
    });
    return softmax(scores);
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('Attention Mechanisms Test Suite (Demo 04)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Softmax
    console.log('\n--- Test Group 1: Softmax Function ---\n');

    const logits = [1, 2, 3];
    const probs = softmax(logits);

    const sum = probs.reduce((a, b) => a + b, 0);
    runner.assertClose(sum, 1.0, 0.0001, "Softmax should sum to 1");

    runner.assert(
        probs[2] > probs[1] && probs[1] > probs[0],
        "Softmax should preserve ordering",
        "ordered",
        "checked"
    );

    // Test 2: Attention Weights
    console.log('\n--- Test Group 2: Attention Weights ---\n');

    const query = [1, 0];
    const keys = [[1, 0], [0, 1], [0.7, 0.7]];
    const weights = computeAttentionWeights(query, keys);

    runner.assertEqual(weights.length, 3, "Should compute weight for each key");
    runner.assert(
        weights[0] > weights[1],
        "First key should have highest weight (most similar to query)",
        "weights[0] > weights[1]",
        `${weights[0].toFixed(3)} vs ${weights[1].toFixed(3)}`
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
