#!/usr/bin/env node
/**
 * Comprehensive test suite for Tokenization (Demo 02)
 * Tests BPE algorithm and tokenizer comparison
 * Run with: node test-tokenization.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock DOM globals for browser-based code
global.document = {
    getElementById: () => ({ value: '', disabled: false }),
    querySelector: () => null,
    querySelectorAll: () => []
};
global.alert = () => {};
global.fetch = async (url) => {
    throw new Error('Fetch not available in test environment');
};

// Load the BPE visualizer code
const bpeCode = await readFile(join(__dirname, 'js/bpe-visualizer.js'), 'utf-8');

// Remove everything from document.addEventListener('DOMContentLoaded' onwards
const domContentLoadedIndex = bpeCode.indexOf("document.addEventListener('DOMContentLoaded'");
const testableBpeCode = domContentLoadedIndex > 0
    ? bpeCode.substring(0, domContentLoadedIndex)
    : bpeCode;

// Further cleanup and make classes globally available
const cleanedCode = testableBpeCode
    .replace(/this\.setupEventListeners\(\);/g, '// Event listeners disabled for testing')
    .replace(/this\.loadGPT2Merges\(\);/g, '// GPT-2 loading disabled for testing')
    .replace(/class BPEVisualizer/g, 'globalThis.BPEVisualizer = class BPEVisualizer');

eval(cleanedCode);

const BPEVisualizer = globalThis.BPEVisualizer;

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

    assertArrayContains(array, value, testName) {
        const condition = array.includes(value);
        this.assert(condition, testName, `contains ${value}`, array);
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
    console.log('Tokenization Test Suite (Demo 02)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: BPE Initialization
    console.log('\n--- Test Group 1: BPE Initialization ---\n');

    const bpe = new BPEVisualizer();
    runner.assert(
        bpe.tokens.length === 0,
        "BPE should initialize with empty tokens",
        0,
        bpe.tokens.length
    );
    runner.assertEqual(
        bpe.currentStep,
        0,
        "BPE should start at step 0"
    );
    runner.assertEqual(
        bpe.mode,
        'simplified',
        "BPE should default to simplified mode"
    );

    // Test 2: Token Initialization
    console.log('\n--- Test Group 2: Token Initialization ---\n');

    bpe.text = "hello";
    bpe.tokens = bpe.text.split('').map(char => ({ value: char, merged: false }));

    runner.assertEqual(
        bpe.tokens.length,
        5,
        "Should split 'hello' into 5 character tokens"
    );
    runner.assertEqual(
        bpe.tokens[0].value,
        'h',
        "First token should be 'h'"
    );
    runner.assertEqual(
        bpe.tokens[4].value,
        'o',
        "Last token should be 'o'"
    );

    // Test 3: Pair Finding
    console.log('\n--- Test Group 3: Pair Finding Algorithm ---\n');

    bpe.tokens = [
        { value: 'h', merged: false },
        { value: 'e', merged: false },
        { value: 'l', merged: false },
        { value: 'l', merged: false },
        { value: 'o', merged: false }
    ];

    const pairs = bpe.findPairs();
    runner.assertGreaterThan(
        pairs.size,
        0,
        "Should find pairs in 'hello'"
    );

    // Check for specific pairs
    const hePair = pairs.get('h|e');
    runner.assert(
        hePair !== undefined,
        "Should find 'h|e' pair",
        "defined",
        hePair ? "defined" : "undefined"
    );

    const llPair = pairs.get('l|l');
    runner.assert(
        llPair !== undefined && llPair.count === 1,
        "Should find 'l|l' pair with count 1",
        1,
        llPair ? llPair.count : 0
    );

    // Test 4: Most Frequent Pair Selection
    console.log('\n--- Test Group 4: Most Frequent Pair Selection ---\n');

    bpe.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false },
        { value: 'c', merged: false }
    ];

    const testPairs = bpe.findPairs();
    const mostFrequent = bpe.getMostFrequentPair(testPairs);

    runner.assert(
        mostFrequent !== null,
        "Should find most frequent pair",
        "not null",
        mostFrequent ? "found" : "null"
    );

    runner.assert(
        mostFrequent && mostFrequent.count >= 1,
        "Most frequent pair should have count >= 1",
        ">= 1",
        mostFrequent ? mostFrequent.count : 0
    );

    // Test 5: Pair Merging
    console.log('\n--- Test Group 5: Pair Merging ---\n');

    bpe.tokens = [
        { value: 'h', merged: false },
        { value: 'e', merged: false },
        { value: 'l', merged: false },
        { value: 'l', merged: false },
        { value: 'o', merged: false }
    ];

    const initialTokenCount = bpe.tokens.length;
    const mergePairs = bpe.findPairs();
    const pairToMerge = bpe.getMostFrequentPair(mergePairs);

    if (pairToMerge) {
        bpe.mergePair(pairToMerge);
        runner.assert(
            bpe.tokens.length < initialTokenCount,
            "Token count should decrease after merge",
            `< ${initialTokenCount}`,
            bpe.tokens.length
        );
    }

    // Test 6: BPE Common Merges
    console.log('\n--- Test Group 6: Common Merge Rules ---\n');

    runner.assert(
        Array.isArray(bpe.commonMerges),
        "Should have common merges array",
        "array",
        typeof bpe.commonMerges
    );

    runner.assertGreaterThan(
        bpe.commonMerges.length,
        0,
        "Should have at least one common merge rule"
    );

    // Check for expected common patterns
    const hasTheMerge = bpe.commonMerges.some(m =>
        (m[0] === 't' && m[1] === 'h') ||
        (m[0] === 'th' && m[1] === 'e')
    );
    runner.assert(
        hasTheMerge,
        "Should include 'th' or 'the' in common merges",
        "present",
        hasTheMerge ? "present" : "absent"
    );

    // Test 7: Multiple Step BPE
    console.log('\n--- Test Group 7: Multi-Step BPE Process ---\n');

    const testBpe = new BPEVisualizer();
    testBpe.text = "hello world";
    testBpe.tokens = testBpe.text.split('').map(char => ({
        value: char,
        merged: false
    }));
    testBpe.isRunning = true;

    const initialCount = testBpe.tokens.length;
    let stepCount = 0;
    const maxSteps = 20;

    while (stepCount < maxSteps) {
        const pairs = testBpe.findPairs();
        if (pairs.size === 0) break;

        const pair = testBpe.getMostFrequentPair(pairs);
        if (!pair) break;

        testBpe.mergePair(pair);
        stepCount++;
    }

    runner.assert(
        testBpe.tokens.length <= initialCount,
        "Token count should not increase during BPE",
        `<= ${initialCount}`,
        testBpe.tokens.length
    );

    runner.assertGreaterThan(
        stepCount,
        0,
        "Should perform at least one merge step"
    );

    // Test 8: Edge Cases
    console.log('\n--- Test Group 8: Edge Cases ---\n');

    // Empty text
    const emptyBpe = new BPEVisualizer();
    emptyBpe.tokens = [];
    const emptyPairs = emptyBpe.findPairs();
    runner.assertEqual(
        emptyPairs.size,
        0,
        "Should find no pairs in empty token array"
    );

    // Single character
    const singleBpe = new BPEVisualizer();
    singleBpe.tokens = [{ value: 'a', merged: false }];
    const singlePairs = singleBpe.findPairs();
    runner.assertEqual(
        singlePairs.size,
        0,
        "Should find no pairs with single token"
    );

    // Two characters
    const twoBpe = new BPEVisualizer();
    twoBpe.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    const twoPairs = twoBpe.findPairs();
    runner.assertEqual(
        twoPairs.size,
        1,
        "Should find exactly one pair with two tokens"
    );

    // Test 9: Merge History Tracking
    console.log('\n--- Test Group 9: Merge History ---\n');

    runner.assert(
        Array.isArray(bpe.mergeHistory),
        "Should maintain merge history array",
        "array",
        typeof bpe.mergeHistory
    );

    // Test 10: Mode Switching
    console.log('\n--- Test Group 10: Mode Configuration ---\n');

    const modeBpe = new BPEVisualizer();
    runner.assertEqual(
        modeBpe.mode,
        'simplified',
        "Should start in simplified mode"
    );

    // Test mode existence
    runner.assert(
        modeBpe.mode === 'simplified' || modeBpe.mode === 'gpt2',
        "Mode should be either 'simplified' or 'gpt2'",
        "simplified|gpt2",
        modeBpe.mode
    );

    // Test 11: Token Structure Validation
    console.log('\n--- Test Group 11: Token Structure ---\n');

    const structBpe = new BPEVisualizer();
    structBpe.tokens = [
        { value: 'test', merged: false }
    ];

    const token = structBpe.tokens[0];
    runner.assert(
        token.hasOwnProperty('value'),
        "Token should have 'value' property",
        "has value",
        token.hasOwnProperty('value') ? "has value" : "missing"
    );

    runner.assert(
        token.hasOwnProperty('merged'),
        "Token should have 'merged' property",
        "has merged",
        token.hasOwnProperty('merged') ? "has merged" : "missing"
    );

    // Test 12: Pair Counting Accuracy
    console.log('\n--- Test Group 12: Pair Counting Accuracy ---\n');

    const countBpe = new BPEVisualizer();
    countBpe.tokens = [
        { value: 'a', merged: false },
        { value: 'a', merged: false },
        { value: 'a', merged: false }
    ];

    const countPairs = countBpe.findPairs();
    const aaPair = countPairs.get('a|a');

    runner.assert(
        aaPair && aaPair.count === 2,
        "Should count 'a|a' pair correctly (appears at indices 0 and 1)",
        2,
        aaPair ? aaPair.count : 0
    );

    runner.assert(
        aaPair && aaPair.indices.length === 2,
        "Should track both indices where 'a|a' appears",
        2,
        aaPair ? aaPair.indices.length : 0
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
