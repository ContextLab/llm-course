#!/usr/bin/env node
/**
 * Test suite for POS Tagging (Demo 10)
 * Run with: node test-pos.mjs
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

// Simple POS tag validation
const validTags = new Set(['NOUN', 'VERB', 'ADJ', 'ADV', 'PRON', 'DET', 'ADP', 'CONJ', 'NUM', 'PUNCT']);

function isValidPOSTag(tag) {
    return validTags.has(tag);
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('POS Tagging Test Suite (Demo 10)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Valid Tags
    console.log('\n--- Test Group 1: POS Tag Validation ---\n');

    runner.assert(
        isValidPOSTag('NOUN'),
        "NOUN should be valid tag",
        true,
        isValidPOSTag('NOUN')
    );

    runner.assert(
        isValidPOSTag('VERB'),
        "VERB should be valid tag",
        true,
        isValidPOSTag('VERB')
    );

    runner.assert(
        !isValidPOSTag('INVALID'),
        "INVALID should not be valid tag",
        false,
        isValidPOSTag('INVALID')
    );

    // Test 2: Tag Set
    console.log('\n--- Test Group 2: Tag Set Size ---\n');

    runner.assertEqual(
        validTags.size,
        10,
        "Should have 10 valid tag types"
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
