#!/usr/bin/env node
/**
 * Test suite for BERT MLM (Demo 13)
 * Run with: node test-bert.mjs
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

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// BERT tokenization helpers
function tokenize(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
}

function insertMask(tokens, position) {
    const masked = [...tokens];
    masked[position] = '[MASK]';
    return masked;
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('BERT MLM Test Suite (Demo 13)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Tokenization
    console.log('\n--- Test Group 1: Tokenization ---\n');

    const text = "The quick brown fox";
    const tokens = tokenize(text);

    runner.assertEqual(tokens.length, 4, "Should tokenize into 4 words");
    runner.assertEqual(tokens[0], "the", "Should lowercase tokens");

    // Test 2: Mask Insertion
    console.log('\n--- Test Group 2: Mask Insertion ---\n');

    const masked = insertMask(tokens, 1);
    runner.assertEqual(masked[1], '[MASK]', "Should insert [MASK] token");
    runner.assertEqual(masked[0], "the", "Should not modify other tokens");

    // Test 3: Multiple Masks
    console.log('\n--- Test Group 3: Multiple Masks ---\n');

    const multiMasked = insertMask(insertMask(tokens, 1), 3);
    const maskCount = multiMasked.filter(t => t === '[MASK]').length;
    runner.assertEqual(maskCount, 2, "Should support multiple masks");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
