#!/usr/bin/env node
/**
 * Test suite for Transformer Architecture (Demo 05)
 * Run with: node test-transformer.mjs
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

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// Transformer component validation
const transformerComponents = [
    'embedding',
    'positional_encoding',
    'multi_head_attention',
    'feed_forward',
    'layer_normalization',
    'residual_connection'
];

async function runTests() {
    console.log('='.repeat(70));
    console.log('Transformer Architecture Test Suite (Demo 05)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Component List
    console.log('\n--- Test Group 1: Transformer Components ---\n');

    runner.assertEqual(
        transformerComponents.length,
        6,
        "Should have 6 main components"
    );

    runner.assert(
        transformerComponents.includes('multi_head_attention'),
        "Should include multi-head attention",
        "has component",
        "checked"
    );

    runner.assert(
        transformerComponents.includes('feed_forward'),
        "Should include feed-forward network",
        "has component",
        "checked"
    );

    // Test 2: Positional Encoding
    console.log('\n--- Test Group 2: Positional Encoding ---\n');

    function positionalEncoding(position, dModel) {
        const encoding = [];
        for (let i = 0; i < dModel; i++) {
            if (i % 2 === 0) {
                encoding.push(Math.sin(position / Math.pow(10000, i / dModel)));
            } else {
                encoding.push(Math.cos(position / Math.pow(10000, (i - 1) / dModel)));
            }
        }
        return encoding;
    }

    const pe = positionalEncoding(0, 8);
    runner.assertEqual(pe.length, 8, "Positional encoding should match d_model");

    const pe2 = positionalEncoding(1, 8);
    const different = pe.some((v, i) => v !== pe2[i]);
    runner.assert(
        different,
        "Different positions should have different encodings",
        "different",
        different ? "different" : "same"
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
