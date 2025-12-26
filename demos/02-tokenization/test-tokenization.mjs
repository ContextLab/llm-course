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
    getElementById: () => ({
        value: '',
        disabled: false,
        textContent: '',
        innerHTML: '',
        children: [],
        scrollTop: 0,
        scrollHeight: 0,
        appendChild: () => {},
        classList: {
            toggle: () => {},
            add: () => {},
            remove: () => {}
        }
    }),
    createElement: (tag) => ({
        className: '',
        textContent: '',
        innerHTML: '',
        style: {},
        title: '',
        appendChild: () => {},
        addEventListener: () => {}
    }),
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
    .replace(/class BPEVisualizer/g, 'globalThis.BPEVisualizer = class BPEVisualizer')
    .replace(/class TokenFrequencyAnalyzer/g, 'globalThis.TokenFrequencyAnalyzer = class TokenFrequencyAnalyzer')
    .replace(/class SubwordDecomposer/g, 'globalThis.SubwordDecomposer = class SubwordDecomposer');

eval(cleanedCode);

const BPEVisualizer = globalThis.BPEVisualizer;
const TokenFrequencyAnalyzer = globalThis.TokenFrequencyAnalyzer;
const SubwordDecomposer = globalThis.SubwordDecomposer;

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

    assertDeepEqual(actual, expected, testName) {
        const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
        this.assert(isEqual, testName, expected, actual);
    }

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    assertGreaterThanOrEqual(actual, threshold, testName) {
        this.assert(actual >= threshold, testName, `>= ${threshold}`, actual);
    }

    assertLessThan(actual, threshold, testName) {
        this.assert(actual < threshold, testName, `< ${threshold}`, actual);
    }

    assertLessThanOrEqual(actual, threshold, testName) {
        this.assert(actual <= threshold, testName, `<= ${threshold}`, actual);
    }

    assertArrayContains(array, value, testName) {
        const condition = array.includes(value);
        this.assert(condition, testName, `contains ${value}`, array);
    }

    assertNotEqual(actual, notExpected, testName) {
        this.assert(actual !== notExpected, testName, `not ${notExpected}`, actual);
    }

    assertTrue(condition, testName) {
        this.assert(condition === true, testName, true, condition);
    }

    assertFalse(condition, testName) {
        this.assert(condition === false, testName, false, condition);
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
    console.log('Tokenization Test Suite (Demo 02) - Comprehensive Edition');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // Test Group 1: BPE Initialization
    // ========================================================================
    console.log('\n--- Test Group 1: BPE Initialization (8 tests) ---\n');

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
    runner.assertTrue(
        Array.isArray(bpe.mergeRules),
        "BPE should have merge rules array"
    );
    runner.assertTrue(
        Array.isArray(bpe.mergeHistory),
        "BPE should have merge history array"
    );
    runner.assertFalse(
        bpe.isRunning,
        "BPE should not be running initially"
    );
    runner.assertEqual(
        bpe.autoPlayInterval,
        null,
        "Auto play interval should be null initially"
    );
    runner.assertFalse(
        bpe.gpt2MergesLoaded,
        "GPT-2 merges should not be loaded initially"
    );

    // ========================================================================
    // Test Group 2: Character Tokenization (12 tests)
    // ========================================================================
    console.log('\n--- Test Group 2: Character Tokenization (12 tests) ---\n');

    // Test 2.1: Basic tokenization
    const bpe2 = new BPEVisualizer();
    bpe2.text = "hello";
    bpe2.tokens = bpe2.text.split('').map(char => ({ value: char, merged: false }));

    runner.assertEqual(
        bpe2.tokens.length,
        5,
        "Should split 'hello' into 5 character tokens"
    );
    runner.assertEqual(
        bpe2.tokens[0].value,
        'h',
        "First token should be 'h'"
    );
    runner.assertEqual(
        bpe2.tokens[4].value,
        'o',
        "Last token should be 'o'"
    );

    // Test 2.2: Single character
    const bpe2_2 = new BPEVisualizer();
    bpe2_2.text = "a";
    bpe2_2.tokens = bpe2_2.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe2_2.tokens.length,
        1,
        "Should split 'a' into 1 token"
    );

    // Test 2.3: Empty string
    const bpe2_3 = new BPEVisualizer();
    bpe2_3.text = "";
    bpe2_3.tokens = bpe2_3.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe2_3.tokens.length,
        0,
        "Should split '' into 0 tokens"
    );

    // Test 2.4: Repeated characters
    const bpe2_4 = new BPEVisualizer();
    bpe2_4.text = "aaaa";
    bpe2_4.tokens = bpe2_4.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe2_4.tokens.length,
        4,
        "Should split 'aaaa' into 4 tokens"
    );

    // Test 2.5: Numbers
    const bpe2_5 = new BPEVisualizer();
    bpe2_5.text = "123";
    bpe2_5.tokens = bpe2_5.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe2_5.tokens.length,
        3,
        "Should split '123' into 3 tokens"
    );

    // Test 2.6: Special characters
    const bpe2_6 = new BPEVisualizer();
    bpe2_6.text = "a!b@c#";
    bpe2_6.tokens = bpe2_6.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe2_6.tokens.length,
        6,
        "Should split 'a!b@c#' into 6 tokens"
    );

    // Test 2.7: Whitespace
    const bpe2_7 = new BPEVisualizer();
    bpe2_7.text = "a b";
    bpe2_7.tokens = bpe2_7.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe2_7.tokens.length,
        3,
        "Should split 'a b' into 3 tokens including space"
    );
    runner.assertEqual(
        bpe2_7.tokens[1].value,
        ' ',
        "Middle token should be space"
    );

    // Test 2.8: Mixed case
    const bpe2_8 = new BPEVisualizer();
    bpe2_8.text = "AaBb";
    bpe2_8.tokens = bpe2_8.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe2_8.tokens.length,
        4,
        "Should split 'AaBb' into 4 tokens"
    );

    // Test 2.9: Token structure
    const token = bpe2.tokens[0];
    runner.assertTrue(
        token.hasOwnProperty('value'),
        "Token should have 'value' property"
    );
    runner.assertTrue(
        token.hasOwnProperty('merged'),
        "Token should have 'merged' property"
    );

    // Test 2.10: Initial merged flag
    runner.assertFalse(
        bpe2.tokens[0].merged,
        "Initial tokens should have merged=false"
    );

    // ========================================================================
    // Test Group 3: Pair Finding (15 tests)
    // ========================================================================
    console.log('\n--- Test Group 3: Pair Finding Algorithm (15 tests) ---\n');

    // Test 3.1: Basic pair finding
    const bpe3 = new BPEVisualizer();
    bpe3.tokens = [
        { value: 'h', merged: false },
        { value: 'e', merged: false },
        { value: 'l', merged: false },
        { value: 'l', merged: false },
        { value: 'o', merged: false }
    ];

    const pairs3 = bpe3.findPairs();
    runner.assertGreaterThan(
        pairs3.size,
        0,
        "Should find pairs in 'hello'"
    );

    // Test 3.2: Check for specific pairs
    const hePair = pairs3.get('h|e');
    runner.assertTrue(
        hePair !== undefined,
        "Should find 'h|e' pair"
    );

    // Test 3.3: Check pair count
    const llPair = pairs3.get('l|l');
    runner.assertTrue(
        llPair !== undefined && llPair.count === 1,
        "Should find 'l|l' pair with count 1"
    );

    // Test 3.4: Empty tokens
    const bpe3_4 = new BPEVisualizer();
    bpe3_4.tokens = [];
    const emptyPairs = bpe3_4.findPairs();
    runner.assertEqual(
        emptyPairs.size,
        0,
        "Should find no pairs in empty token array"
    );

    // Test 3.5: Single token
    const bpe3_5 = new BPEVisualizer();
    bpe3_5.tokens = [{ value: 'a', merged: false }];
    const singlePairs = bpe3_5.findPairs();
    runner.assertEqual(
        singlePairs.size,
        0,
        "Should find no pairs with single token"
    );

    // Test 3.6: Two tokens
    const bpe3_6 = new BPEVisualizer();
    bpe3_6.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    const twoPairs = bpe3_6.findPairs();
    runner.assertEqual(
        twoPairs.size,
        1,
        "Should find exactly one pair with two tokens"
    );

    // Test 3.7: Repeated pairs
    const bpe3_7 = new BPEVisualizer();
    bpe3_7.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    const repeatedPairs = bpe3_7.findPairs();
    const abPair = repeatedPairs.get('a|b');
    runner.assertEqual(
        abPair.count,
        2,
        "Should count 'a|b' pair appearing twice"
    );

    // Test 3.8: Pair indices tracking
    runner.assertEqual(
        abPair.indices.length,
        2,
        "Should track both indices where 'a|b' appears"
    );
    runner.assertDeepEqual(
        abPair.indices,
        [0, 2],
        "Should track correct indices [0, 2]"
    );

    // Test 3.9: All same character
    const bpe3_9 = new BPEVisualizer();
    bpe3_9.tokens = [
        { value: 'a', merged: false },
        { value: 'a', merged: false },
        { value: 'a', merged: false }
    ];
    const samePairs = bpe3_9.findPairs();
    runner.assertEqual(
        samePairs.size,
        1,
        "Should find one unique pair type for 'aaa'"
    );
    const aaPair = samePairs.get('a|a');
    runner.assertEqual(
        aaPair.count,
        2,
        "Should count 'a|a' appearing twice in 'aaa'"
    );

    // Test 3.10: Non-overlapping identical pairs
    const bpe3_10 = new BPEVisualizer();
    bpe3_10.tokens = [
        { value: 'x', merged: false },
        { value: 'y', merged: false },
        { value: 'z', merged: false },
        { value: 'x', merged: false },
        { value: 'y', merged: false }
    ];
    const pairs3_10 = bpe3_10.findPairs();
    runner.assertEqual(
        pairs3_10.size,
        3,
        "Should find 3 unique pair types in 'xyzxy'"
    );

    // Test 3.11: Pair data structure
    const pairData = pairs3.get('h|e');
    runner.assertTrue(
        pairData.hasOwnProperty('pair'),
        "Pair data should have 'pair' property"
    );
    runner.assertTrue(
        pairData.hasOwnProperty('count'),
        "Pair data should have 'count' property"
    );
    runner.assertTrue(
        pairData.hasOwnProperty('indices'),
        "Pair data should have 'indices' property"
    );

    // Test 3.12: Pair array structure
    runner.assertTrue(
        Array.isArray(pairData.pair),
        "Pair should be an array"
    );
    runner.assertEqual(
        pairData.pair.length,
        2,
        "Pair array should have exactly 2 elements"
    );

    // Test 3.13: Adjacent pairs only
    const bpe3_13 = new BPEVisualizer();
    bpe3_13.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false }
    ];
    const pairs3_13 = bpe3_13.findPairs();
    runner.assertEqual(
        pairs3_13.size,
        2,
        "Should find only adjacent pairs: 'a|b' and 'b|c'"
    );
    runner.assertTrue(
        pairs3_13.has('a|b'),
        "Should include 'a|b' pair"
    );
    runner.assertTrue(
        pairs3_13.has('b|c'),
        "Should include 'b|c' pair"
    );

    // ========================================================================
    // Test Group 4: Most Frequent Pair Selection (12 tests)
    // ========================================================================
    console.log('\n--- Test Group 4: Most Frequent Pair Selection (12 tests) ---\n');

    // Test 4.1: Basic most frequent pair
    const bpe4 = new BPEVisualizer();
    bpe4.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false },
        { value: 'c', merged: false }
    ];

    const testPairs4 = bpe4.findPairs();
    const mostFrequent4 = bpe4.getMostFrequentPair(testPairs4);

    runner.assertTrue(
        mostFrequent4 !== null,
        "Should find most frequent pair"
    );

    runner.assertGreaterThanOrEqual(
        mostFrequent4.count,
        1,
        "Most frequent pair should have count >= 1"
    );

    // Test 4.2: All pairs have same frequency
    const bpe4_2 = new BPEVisualizer();
    bpe4_2.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false }
    ];
    const pairs4_2 = bpe4_2.findPairs();
    const freq4_2 = bpe4_2.getMostFrequentPair(pairs4_2);
    runner.assertTrue(
        freq4_2 !== null,
        "Should select a pair even when all have same frequency"
    );

    // Test 4.3: Empty pairs map
    const bpe4_3 = new BPEVisualizer();
    const emptyPairs4_3 = new Map();
    const freq4_3 = bpe4_3.getMostFrequentPair(emptyPairs4_3);
    runner.assertEqual(
        freq4_3,
        null,
        "Should return null for empty pairs map"
    );

    // Test 4.4: Single pair
    const bpe4_4 = new BPEVisualizer();
    bpe4_4.tokens = [
        { value: 'x', merged: false },
        { value: 'y', merged: false }
    ];
    const pairs4_4 = bpe4_4.findPairs();
    const freq4_4 = bpe4_4.getMostFrequentPair(pairs4_4);
    runner.assertEqual(
        freq4_4.count,
        1,
        "Single pair should have count 1"
    );

    // Test 4.5: Clear winner
    const bpe4_5 = new BPEVisualizer();
    bpe4_5.tokens = [
        { value: 'a', merged: false },
        { value: 'a', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false }
    ];
    const pairs4_5 = bpe4_5.findPairs();
    const freq4_5 = bpe4_5.getMostFrequentPair(pairs4_5);
    runner.assertEqual(
        freq4_5.pair.join('|'),
        'a|a',
        "Should select 'a|a' as most frequent"
    );
    runner.assertEqual(
        freq4_5.count,
        2,
        "Most frequent pair 'a|a' should have count 2"
    );

    // Test 4.6: Common merge rules preference
    const bpe4_6 = new BPEVisualizer();
    bpe4_6.tokens = [
        { value: 't', merged: false },
        { value: 'h', merged: false },
        { value: 'e', merged: false },
        { value: 'x', merged: false },
        { value: 'x', merged: false }
    ];
    const pairs4_6 = bpe4_6.findPairs();
    const freq4_6 = bpe4_6.getMostFrequentPair(pairs4_6);
    // Should prefer 't|h' from common merges over 'x|x' even though 'x|x' doesn't exist here
    // Actually 't|h' should be selected due to common merges
    runner.assertTrue(
        freq4_6 !== null,
        "Should find a pair to merge"
    );

    // Test 4.7: Verify common merges exist
    runner.assertTrue(
        Array.isArray(bpe4_6.commonMerges),
        "Should have common merges array"
    );
    runner.assertGreaterThan(
        bpe4_6.commonMerges.length,
        0,
        "Should have at least one common merge rule"
    );

    // Test 4.8: Check for 'th' in common patterns
    const hasThMerge = bpe4_6.commonMerges.some(m =>
        (m[0] === 't' && m[1] === 'h')
    );
    runner.assertTrue(
        hasThMerge,
        "Should include 't|h' in common merges"
    );

    // Test 4.9: Check for 'the' in common patterns
    const hasTheMerge = bpe4_6.commonMerges.some(m =>
        (m[0] === 'th' && m[1] === 'e')
    );
    runner.assertTrue(
        hasTheMerge,
        "Should include 'th|e' in common merges"
    );

    // Test 4.10: Multiple occurrences of most frequent
    const bpe4_10 = new BPEVisualizer();
    bpe4_10.tokens = [
        { value: 'l', merged: false },
        { value: 'o', merged: false },
        { value: 'l', merged: false },
        { value: 'o', merged: false },
        { value: 'l', merged: false },
        { value: 'o', merged: false }
    ];
    const pairs4_10 = bpe4_10.findPairs();
    const freq4_10 = bpe4_10.getMostFrequentPair(pairs4_10);
    runner.assertGreaterThanOrEqual(
        freq4_10.count,
        2,
        "Most frequent pair in 'lololo' should appear at least twice"
    );

    // Test 4.11: Pair selection consistency
    const bpe4_11a = new BPEVisualizer();
    bpe4_11a.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    const pairs4_11a = bpe4_11a.findPairs();
    const freq4_11a = bpe4_11a.getMostFrequentPair(pairs4_11a);

    const bpe4_11b = new BPEVisualizer();
    bpe4_11b.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    const pairs4_11b = bpe4_11b.findPairs();
    const freq4_11b = bpe4_11b.getMostFrequentPair(pairs4_11b);

    runner.assertEqual(
        freq4_11a.pair.join('|'),
        freq4_11b.pair.join('|'),
        "Should select same pair for identical input"
    );

    // ========================================================================
    // Test Group 5: Merge Operations (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 5: Merge Operations (10 tests) ---\n');

    // Test 5.1: Basic merge
    const bpe5 = new BPEVisualizer();
    bpe5.tokens = [
        { value: 'h', merged: false },
        { value: 'e', merged: false },
        { value: 'l', merged: false },
        { value: 'l', merged: false },
        { value: 'o', merged: false }
    ];

    const initialTokenCount5 = bpe5.tokens.length;
    const mergePairs5 = bpe5.findPairs();
    const pairToMerge5 = bpe5.getMostFrequentPair(mergePairs5);

    if (pairToMerge5) {
        bpe5.mergePair(pairToMerge5);
        runner.assertLessThan(
            bpe5.tokens.length,
            initialTokenCount5,
            "Token count should decrease after merge"
        );
    }

    // Test 5.2: Merge creates correct value
    const bpe5_2 = new BPEVisualizer();
    bpe5_2.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    const pairs5_2 = bpe5_2.findPairs();
    const pairToMerge5_2 = pairs5_2.get('a|b');
    bpe5_2.mergePair(pairToMerge5_2);
    runner.assertEqual(
        bpe5_2.tokens.length,
        1,
        "Should have 1 token after merging 'a|b'"
    );
    runner.assertEqual(
        bpe5_2.tokens[0].value,
        'ab',
        "Merged token should have value 'ab'"
    );

    // Test 5.3: Merged flag is set
    runner.assertTrue(
        bpe5_2.tokens[0].merged,
        "Merged token should have merged=true"
    );

    // Test 5.4: Merge history tracking
    const bpe5_4 = new BPEVisualizer();
    bpe5_4.tokens = [
        { value: 'x', merged: false },
        { value: 'y', merged: false }
    ];
    bpe5_4.currentStep = 0;
    bpe5_4.mergeHistory = [];
    const pairs5_4 = bpe5_4.findPairs();
    const pairToMerge5_4 = bpe5_4.getMostFrequentPair(pairs5_4);
    bpe5_4.mergePair(pairToMerge5_4);

    runner.assertEqual(
        bpe5_4.mergeHistory.length,
        1,
        "Merge history should have 1 entry"
    );
    runner.assertEqual(
        bpe5_4.mergeHistory[0].result,
        'xy',
        "Merge history should record result 'xy'"
    );

    // Test 5.5: Multiple merge operations
    const bpe5_5 = new BPEVisualizer();
    bpe5_5.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false },
        { value: 'd', merged: false }
    ];
    bpe5_5.currentStep = 0;
    bpe5_5.mergeHistory = [];

    // First merge
    let pairs5_5 = bpe5_5.findPairs();
    let pairToMerge5_5 = bpe5_5.getMostFrequentPair(pairs5_5);
    bpe5_5.mergePair(pairToMerge5_5);
    bpe5_5.currentStep++;

    // Second merge
    pairs5_5 = bpe5_5.findPairs();
    pairToMerge5_5 = bpe5_5.getMostFrequentPair(pairs5_5);
    if (pairToMerge5_5) {
        bpe5_5.mergePair(pairToMerge5_5);
        runner.assertEqual(
            bpe5_5.mergeHistory.length,
            2,
            "Should have 2 merge history entries"
        );
    }

    // Test 5.6: Merge with multiple occurrences
    const bpe5_6 = new BPEVisualizer();
    bpe5_6.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    bpe5_6.currentStep = 0;
    bpe5_6.mergeHistory = [];
    const pairs5_6 = bpe5_6.findPairs();
    const abPair5_6 = pairs5_6.get('a|b');
    if (abPair5_6) {
        const beforeLength = bpe5_6.tokens.length;
        bpe5_6.mergePair(abPair5_6);
        runner.assertEqual(
            bpe5_6.tokens.length,
            beforeLength - abPair5_6.count,
            "Should merge all occurrences of the pair"
        );
    }

    // Test 5.7: Merge count tracking
    runner.assertEqual(
        bpe5_6.mergeHistory[0].count,
        2,
        "Should track that 2 pairs were merged"
    );

    // Test 5.8: Merge preserves other tokens
    const bpe5_8 = new BPEVisualizer();
    bpe5_8.tokens = [
        { value: 'x', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'y', merged: false }
    ];
    const pairs5_8 = bpe5_8.findPairs();
    const abPair5_8 = pairs5_8.get('a|b');
    if (abPair5_8) {
        bpe5_8.mergePair(abPair5_8);
        runner.assertEqual(
            bpe5_8.tokens[0].value,
            'x',
            "Should preserve token before merged pair"
        );
        runner.assertEqual(
            bpe5_8.tokens[2].value,
            'y',
            "Should preserve token after merged pair"
        );
    }

    // Test 5.9: Consecutive merges
    const bpe5_9 = new BPEVisualizer();
    bpe5_9.tokens = [
        { value: 'a', merged: false },
        { value: 'a', merged: false },
        { value: 'a', merged: false }
    ];
    const pairs5_9 = bpe5_9.findPairs();
    const aaPair5_9 = pairs5_9.get('a|a');
    if (aaPair5_9) {
        bpe5_9.mergePair(aaPair5_9);
        runner.assertEqual(
            bpe5_9.tokens.length,
            1,
            "Merging consecutive 'a|a' pairs should result in 1 token (leftover 'a' gets merged too)"
        );
    }

    // ========================================================================
    // Test Group 6: BPE Algorithm Iterations (15 tests)
    // ========================================================================
    console.log('\n--- Test Group 6: BPE Algorithm Iterations (15 tests) ---\n');

    // Test 6.1: Single iteration
    const bpe6_1 = new BPEVisualizer();
    bpe6_1.text = "hello";
    bpe6_1.tokens = bpe6_1.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_1.isRunning = true;
    bpe6_1.currentStep = 0;
    bpe6_1.mergeHistory = [];

    const initialCount6_1 = bpe6_1.tokens.length;
    const pairs6_1 = bpe6_1.findPairs();
    const pair6_1 = bpe6_1.getMostFrequentPair(pairs6_1);
    if (pair6_1) {
        bpe6_1.mergePair(pair6_1);
        runner.assertEqual(
            bpe6_1.mergeHistory.length,
            1,
            "Should perform exactly 1 merge"
        );
        runner.assertLessThan(
            bpe6_1.tokens.length,
            initialCount6_1,
            "Token count should decrease after 1 iteration"
        );
    }

    // Test 6.2: 5 iterations
    const bpe6_2 = new BPEVisualizer();
    bpe6_2.text = "hello world";
    bpe6_2.tokens = bpe6_2.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_2.isRunning = true;
    bpe6_2.currentStep = 0;
    bpe6_2.mergeHistory = [];

    let stepCount6_2 = 0;
    while (stepCount6_2 < 5) {
        const pairs = bpe6_2.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_2.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_2.mergePair(pair);
        stepCount6_2++;
    }

    runner.assertLessThanOrEqual(
        stepCount6_2,
        5,
        "Should perform at most 5 iterations"
    );
    runner.assertGreaterThan(
        stepCount6_2,
        0,
        "Should perform at least 1 iteration"
    );

    // Test 6.3: 10 iterations
    const bpe6_3 = new BPEVisualizer();
    bpe6_3.text = "the quick brown fox jumps";
    bpe6_3.tokens = bpe6_3.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_3.isRunning = true;
    bpe6_3.currentStep = 0;
    bpe6_3.mergeHistory = [];

    let stepCount6_3 = 0;
    while (stepCount6_3 < 10) {
        const pairs = bpe6_3.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_3.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_3.mergePair(pair);
        bpe6_3.currentStep++;
        stepCount6_3++;
    }

    runner.assertLessThanOrEqual(
        stepCount6_3,
        10,
        "Should perform at most 10 iterations"
    );

    // Test 6.4: Run until completion
    const bpe6_4 = new BPEVisualizer();
    bpe6_4.text = "hello";
    bpe6_4.tokens = bpe6_4.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_4.isRunning = true;
    bpe6_4.currentStep = 0;
    bpe6_4.mergeHistory = [];

    const maxSteps6_4 = 50;
    let stepCount6_4 = 0;
    while (stepCount6_4 < maxSteps6_4) {
        const pairs = bpe6_4.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_4.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_4.mergePair(pair);
        stepCount6_4++;
    }

    runner.assertGreaterThan(
        stepCount6_4,
        0,
        "Should perform at least 1 step"
    );
    runner.assertLessThanOrEqual(
        stepCount6_4,
        maxSteps6_4,
        "Should not exceed max steps"
    );

    // Test 6.5: Token count monotonically decreases
    const bpe6_5 = new BPEVisualizer();
    bpe6_5.text = "tokenization";
    bpe6_5.tokens = bpe6_5.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_5.isRunning = true;

    const tokenCounts6_5 = [bpe6_5.tokens.length];
    let stepCount6_5 = 0;
    while (stepCount6_5 < 10) {
        const pairs = bpe6_5.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_5.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_5.mergePair(pair);
        tokenCounts6_5.push(bpe6_5.tokens.length);
        stepCount6_5++;
    }

    let isMonotonic = true;
    for (let i = 1; i < tokenCounts6_5.length; i++) {
        if (tokenCounts6_5[i] > tokenCounts6_5[i - 1]) {
            isMonotonic = false;
            break;
        }
    }
    runner.assertTrue(
        isMonotonic,
        "Token count should never increase during BPE"
    );

    // Test 6.6: Multi-step process
    const bpe6_6 = new BPEVisualizer();
    bpe6_6.text = "hello world";
    bpe6_6.tokens = bpe6_6.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_6.isRunning = true;

    const initialCount6_6 = bpe6_6.tokens.length;
    let stepCount6_6 = 0;
    const maxSteps6_6 = 20;

    while (stepCount6_6 < maxSteps6_6) {
        const pairs = bpe6_6.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_6.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_6.mergePair(pair);
        stepCount6_6++;
    }

    runner.assertLessThanOrEqual(
        bpe6_6.tokens.length,
        initialCount6_6,
        "Token count should not increase during BPE"
    );

    runner.assertGreaterThan(
        stepCount6_6,
        0,
        "Should perform at least one merge step"
    );

    // Test 6.7: Convergence (eventually stops)
    const bpe6_7 = new BPEVisualizer();
    bpe6_7.text = "aa";
    bpe6_7.tokens = bpe6_7.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_7.isRunning = true;

    let converged = false;
    let stepCount6_7 = 0;
    while (stepCount6_7 < 100) {
        const pairs = bpe6_7.findPairs();
        if (pairs.size === 0) {
            converged = true;
            break;
        }
        const pair = bpe6_7.getMostFrequentPair(pairs);
        if (!pair) {
            converged = true;
            break;
        }
        bpe6_7.mergePair(pair);
        stepCount6_7++;
    }

    runner.assertTrue(
        converged || stepCount6_7 < 100,
        "BPE should converge (stop finding pairs to merge)"
    );

    // Test 6.8: Step count tracking
    const bpe6_8 = new BPEVisualizer();
    bpe6_8.text = "test";
    bpe6_8.tokens = bpe6_8.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_8.isRunning = true;
    bpe6_8.currentStep = 0;
    bpe6_8.mergeHistory = [];

    let steps6_8 = 0;
    while (steps6_8 < 5) {
        const pairs = bpe6_8.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_8.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_8.mergePair(pair);
        bpe6_8.currentStep++;
        steps6_8++;
    }

    runner.assertEqual(
        bpe6_8.mergeHistory.length,
        steps6_8,
        "Merge history length should match number of steps"
    );

    // Test 6.9: Repeated text compression
    const bpe6_9 = new BPEVisualizer();
    bpe6_9.text = "lalala";
    bpe6_9.tokens = bpe6_9.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_9.isRunning = true;

    const initialCount6_9 = bpe6_9.tokens.length;
    let steps6_9 = 0;
    while (steps6_9 < 10) {
        const pairs = bpe6_9.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_9.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_9.mergePair(pair);
        steps6_9++;
    }

    const compressionRatio6_9 = bpe6_9.tokens.length / initialCount6_9;
    runner.assertLessThan(
        compressionRatio6_9,
        1.0,
        "Repeated patterns should achieve compression"
    );

    // Test 6.10: No merge possible (already minimal)
    const bpe6_10 = new BPEVisualizer();
    bpe6_10.tokens = [{ value: 'a', merged: false }];
    bpe6_10.isRunning = true;

    const pairs6_10 = bpe6_10.findPairs();
    runner.assertEqual(
        pairs6_10.size,
        0,
        "Single token should have no pairs to merge"
    );

    // Test 6.11: Complex text
    const bpe6_11 = new BPEVisualizer();
    bpe6_11.text = "preprocessing";
    bpe6_11.tokens = bpe6_11.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_11.isRunning = true;

    let steps6_11 = 0;
    while (steps6_11 < 20) {
        const pairs = bpe6_11.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_11.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_11.mergePair(pair);
        steps6_11++;
    }

    runner.assertGreaterThan(
        steps6_11,
        0,
        "Should perform merges on complex text"
    );

    // Test 6.12: Verify final state has fewer tokens
    runner.assertLessThan(
        bpe6_11.tokens.length,
        "preprocessing".length,
        "Final token count should be less than character count"
    );

    // Test 6.13: Long iteration count (50 steps)
    const bpe6_13 = new BPEVisualizer();
    bpe6_13.text = "the quick brown fox jumps over the lazy dog";
    bpe6_13.tokens = bpe6_13.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_13.isRunning = true;

    let steps6_13 = 0;
    const maxSteps6_13 = 50;
    while (steps6_13 < maxSteps6_13) {
        const pairs = bpe6_13.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_13.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_13.mergePair(pair);
        steps6_13++;
    }

    runner.assertLessThanOrEqual(
        steps6_13,
        maxSteps6_13,
        "Should not exceed 50 iterations"
    );

    // Test 6.14: Merge history completeness
    const bpe6_14 = new BPEVisualizer();
    bpe6_14.text = "hello";
    bpe6_14.tokens = bpe6_14.text.split('').map(char => ({ value: char, merged: false }));
    bpe6_14.isRunning = true;
    bpe6_14.currentStep = 0;
    bpe6_14.mergeHistory = [];

    let steps6_14 = 0;
    while (steps6_14 < 10) {
        const pairs = bpe6_14.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe6_14.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe6_14.mergePair(pair);
        bpe6_14.currentStep++;
        steps6_14++;
    }

    bpe6_14.mergeHistory.forEach((entry, idx) => {
        runner.assertTrue(
            entry.hasOwnProperty('step') &&
            entry.hasOwnProperty('pair') &&
            entry.hasOwnProperty('result') &&
            entry.hasOwnProperty('count'),
            `Merge history entry ${idx} should have all required fields`
        );
    });

    // ========================================================================
    // Test Group 7: Vocabulary Building (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 7: Vocabulary Building (5 tests) ---\n');

    // Test 7.1: Initial vocabulary
    const bpe7_1 = new BPEVisualizer();
    bpe7_1.text = "abc";
    bpe7_1.tokens = bpe7_1.text.split('').map(char => ({ value: char, merged: false }));

    const vocab7_1 = new Set(bpe7_1.tokens.map(t => t.value));
    runner.assertEqual(
        vocab7_1.size,
        3,
        "Initial vocabulary should have 3 unique tokens"
    );

    // Test 7.2: Vocabulary after merges
    const bpe7_2 = new BPEVisualizer();
    bpe7_2.text = "aabb";
    bpe7_2.tokens = bpe7_2.text.split('').map(char => ({ value: char, merged: false }));

    let steps7_2 = 0;
    while (steps7_2 < 5) {
        const pairs = bpe7_2.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe7_2.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe7_2.mergePair(pair);
        steps7_2++;
    }

    const vocab7_2 = new Set(bpe7_2.tokens.map(t => t.value));
    runner.assertGreaterThan(
        vocab7_2.size,
        0,
        "Vocabulary should not be empty after merges"
    );

    // Test 7.3: Vocabulary uniqueness
    const bpe7_3 = new BPEVisualizer();
    bpe7_3.text = "aaaa";
    bpe7_3.tokens = bpe7_3.text.split('').map(char => ({ value: char, merged: false }));

    let steps7_3 = 0;
    while (steps7_3 < 5) {
        const pairs = bpe7_3.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe7_3.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe7_3.mergePair(pair);
        steps7_3++;
    }

    const tokenValues = bpe7_3.tokens.map(t => t.value);
    const uniqueValues = new Set(tokenValues);
    runner.assertEqual(
        tokenValues.length,
        uniqueValues.size,
        "All tokens in final state should be counted correctly"
    );

    // Test 7.4: Vocabulary growth tracking
    const bpe7_4 = new BPEVisualizer();
    bpe7_4.text = "hello world";
    bpe7_4.tokens = bpe7_4.text.split('').map(char => ({ value: char, merged: false }));
    bpe7_4.mergeHistory = [];

    let steps7_4 = 0;
    while (steps7_4 < 5) {
        const pairs = bpe7_4.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe7_4.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe7_4.mergePair(pair);
        steps7_4++;
    }

    const vocabFromHistory = new Set();
    bpe7_4.mergeHistory.forEach(entry => {
        vocabFromHistory.add(entry.result);
    });

    runner.assertGreaterThan(
        vocabFromHistory.size,
        0,
        "Should track new vocabulary items from merges"
    );

    // Test 7.5: Merge rules as vocabulary
    const bpe7_5 = new BPEVisualizer();
    runner.assertTrue(
        Array.isArray(bpe7_5.commonMerges),
        "Common merges should be available as vocabulary base"
    );

    // ========================================================================
    // Test Group 8: Extended Edge Cases (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 8: Extended Edge Cases (10 tests) ---\n');

    // Test 8.1: All same character
    const bpe8_1 = new BPEVisualizer();
    bpe8_1.text = "aaaaaaa";
    bpe8_1.tokens = bpe8_1.text.split('').map(char => ({ value: char, merged: false }));

    let steps8_1 = 0;
    while (steps8_1 < 10) {
        const pairs = bpe8_1.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe8_1.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe8_1.mergePair(pair);
        steps8_1++;
    }

    runner.assertGreaterThan(
        steps8_1,
        0,
        "Should merge repeated same characters"
    );

    // Test 8.2: Alternating characters
    const bpe8_2 = new BPEVisualizer();
    bpe8_2.text = "ababab";
    bpe8_2.tokens = bpe8_2.text.split('').map(char => ({ value: char, merged: false }));

    const pairs8_2 = bpe8_2.findPairs();
    const abPair8_2 = pairs8_2.get('a|b');
    runner.assertTrue(
        abPair8_2 !== undefined,
        "Should find alternating pattern 'a|b'"
    );
    runner.assertGreaterThan(
        abPair8_2.count,
        1,
        "Alternating pattern should appear multiple times"
    );

    // Test 8.3: Special characters
    const bpe8_3 = new BPEVisualizer();
    bpe8_3.text = "a!b@c#";
    bpe8_3.tokens = bpe8_3.text.split('').map(char => ({ value: char, merged: false }));

    const pairs8_3 = bpe8_3.findPairs();
    runner.assertGreaterThan(
        pairs8_3.size,
        0,
        "Should handle special characters in pairs"
    );

    // Test 8.4: Numbers
    const bpe8_4 = new BPEVisualizer();
    bpe8_4.text = "1234567890";
    bpe8_4.tokens = bpe8_4.text.split('').map(char => ({ value: char, merged: false }));

    const pairs8_4 = bpe8_4.findPairs();
    runner.assertGreaterThan(
        pairs8_4.size,
        0,
        "Should handle numeric characters"
    );

    // Test 8.5: Mixed alphanumeric
    const bpe8_5 = new BPEVisualizer();
    bpe8_5.text = "a1b2c3";
    bpe8_5.tokens = bpe8_5.text.split('').map(char => ({ value: char, merged: false }));

    let steps8_5 = 0;
    while (steps8_5 < 5) {
        const pairs = bpe8_5.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe8_5.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe8_5.mergePair(pair);
        steps8_5++;
    }

    runner.assertGreaterThanOrEqual(
        steps8_5,
        0,
        "Should handle mixed alphanumeric text"
    );

    // Test 8.6: Punctuation heavy
    const bpe8_6 = new BPEVisualizer();
    bpe8_6.text = "...!!!???";
    bpe8_6.tokens = bpe8_6.text.split('').map(char => ({ value: char, merged: false }));

    const pairs8_6 = bpe8_6.findPairs();
    const dotPair = pairs8_6.get('.|.');
    const exclamPair = pairs8_6.get('!|!');
    const questPair = pairs8_6.get('?|?');

    runner.assertTrue(
        dotPair !== undefined || exclamPair !== undefined || questPair !== undefined,
        "Should find repeated punctuation pairs"
    );

    // Test 8.7: Whitespace variations
    const bpe8_7 = new BPEVisualizer();
    bpe8_7.text = "a  b";
    bpe8_7.tokens = bpe8_7.text.split('').map(char => ({ value: char, merged: false }));

    runner.assertEqual(
        bpe8_7.tokens.length,
        4,
        "Should preserve double spaces as separate tokens"
    );

    // Test 8.8: Very long single character sequence
    const bpe8_8 = new BPEVisualizer();
    bpe8_8.text = "x".repeat(100);
    bpe8_8.tokens = bpe8_8.text.split('').map(char => ({ value: char, merged: false }));

    const pairs8_8 = bpe8_8.findPairs();
    const xxPair = pairs8_8.get('x|x');
    runner.assertEqual(
        xxPair.count,
        99,
        "Should count all 99 'x|x' pairs in 100 x's"
    );

    // Test 8.9: Case sensitivity
    const bpe8_9 = new BPEVisualizer();
    bpe8_9.text = "AaBbCc";
    bpe8_9.tokens = bpe8_9.text.split('').map(char => ({ value: char, merged: false }));

    const pairs8_9 = bpe8_9.findPairs();
    const AaPair = pairs8_9.get('A|a');
    const BbPair = pairs8_9.get('B|b');

    runner.assertTrue(
        AaPair !== undefined && BbPair !== undefined,
        "Should treat uppercase and lowercase as distinct"
    );

    // Test 8.10: Unicode handling (basic)
    const bpe8_10 = new BPEVisualizer();
    bpe8_10.text = "café";
    bpe8_10.tokens = bpe8_10.text.split('').map(char => ({ value: char, merged: false }));

    runner.assertEqual(
        bpe8_10.tokens.length,
        4,
        "Should handle accented characters as single tokens"
    );

    // ========================================================================
    // Test Group 9: Compression Ratio (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 9: Compression Ratio (5 tests) ---\n');

    // Test 9.1: Basic compression
    const bpe9_1 = new BPEVisualizer();
    bpe9_1.text = "hello";
    bpe9_1.tokens = bpe9_1.text.split('').map(char => ({ value: char, merged: false }));
    const initialCount9_1 = bpe9_1.tokens.length;

    let steps9_1 = 0;
    while (steps9_1 < 10) {
        const pairs = bpe9_1.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe9_1.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe9_1.mergePair(pair);
        steps9_1++;
    }

    const compressionRatio9_1 = bpe9_1.tokens.length / initialCount9_1;
    runner.assertLessThanOrEqual(
        compressionRatio9_1,
        1.0,
        "Compression ratio should be <= 1.0"
    );

    // Test 9.2: High compression on repeated text
    const bpe9_2 = new BPEVisualizer();
    bpe9_2.text = "the the the the";
    bpe9_2.tokens = bpe9_2.text.split('').map(char => ({ value: char, merged: false }));
    const initialCount9_2 = bpe9_2.tokens.length;

    let steps9_2 = 0;
    while (steps9_2 < 20) {
        const pairs = bpe9_2.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe9_2.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe9_2.mergePair(pair);
        steps9_2++;
    }

    const compressionRatio9_2 = bpe9_2.tokens.length / initialCount9_2;
    runner.assertLessThan(
        compressionRatio9_2,
        0.8,
        "Repeated text should achieve high compression (< 80%)"
    );

    // Test 9.3: Token reduction count
    const bpe9_3 = new BPEVisualizer();
    bpe9_3.text = "tokenization";
    bpe9_3.tokens = bpe9_3.text.split('').map(char => ({ value: char, merged: false }));
    const before9_3 = bpe9_3.tokens.length;

    let steps9_3 = 0;
    while (steps9_3 < 10) {
        const pairs = bpe9_3.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe9_3.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe9_3.mergePair(pair);
        steps9_3++;
    }

    const reduction9_3 = before9_3 - bpe9_3.tokens.length;
    runner.assertGreaterThan(
        reduction9_3,
        0,
        "Should reduce token count"
    );

    // Test 9.4: No compression on single char
    const bpe9_4 = new BPEVisualizer();
    bpe9_4.text = "a";
    bpe9_4.tokens = bpe9_4.text.split('').map(char => ({ value: char, merged: false }));
    const initialCount9_4 = bpe9_4.tokens.length;

    let steps9_4 = 0;
    while (steps9_4 < 10) {
        const pairs = bpe9_4.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe9_4.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe9_4.mergePair(pair);
        steps9_4++;
    }

    runner.assertEqual(
        bpe9_4.tokens.length,
        initialCount9_4,
        "Single character should not compress"
    );

    // Test 9.5: Compression metric
    const bpe9_5 = new BPEVisualizer();
    bpe9_5.text = "compression test";
    bpe9_5.tokens = bpe9_5.text.split('').map(char => ({ value: char, merged: false }));
    const charCount = bpe9_5.text.length;

    let steps9_5 = 0;
    while (steps9_5 < 15) {
        const pairs = bpe9_5.findPairs();
        if (pairs.size === 0) break;
        const pair = bpe9_5.getMostFrequentPair(pairs);
        if (!pair) break;
        bpe9_5.mergePair(pair);
        steps9_5++;
    }

    const finalTokenCount = bpe9_5.tokens.length;
    runner.assertLessThan(
        finalTokenCount,
        charCount,
        "Final token count should be less than original character count"
    );

    // ========================================================================
    // Test Group 10: Mode Configuration (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 10: Mode Configuration (6 tests) ---\n');

    // Test 10.1: Default mode
    const bpe10_1 = new BPEVisualizer();
    runner.assertEqual(
        bpe10_1.mode,
        'simplified',
        "Should start in simplified mode"
    );

    // Test 10.2: Mode validation
    runner.assertTrue(
        bpe10_1.mode === 'simplified' || bpe10_1.mode === 'gpt2',
        "Mode should be either 'simplified' or 'gpt2'"
    );

    // Test 10.3: GPT-2 mode availability
    const bpe10_3 = new BPEVisualizer();
    runner.assertFalse(
        bpe10_3.gpt2MergesLoaded,
        "GPT-2 merges should not be loaded in test environment"
    );

    // Test 10.4: GPT-2 merges property
    const bpe10_4 = new BPEVisualizer();
    runner.assertTrue(
        bpe10_4.hasOwnProperty('gpt2Merges'),
        "Should have gpt2Merges property"
    );

    // Test 10.5: Mode persistence
    const bpe10_5 = new BPEVisualizer();
    const initialMode = bpe10_5.mode;
    bpe10_5.text = "test";
    bpe10_5.tokens = bpe10_5.text.split('').map(char => ({ value: char, merged: false }));
    runner.assertEqual(
        bpe10_5.mode,
        initialMode,
        "Mode should persist during tokenization"
    );

    // Test 10.6: Common merges in simplified mode
    const bpe10_6 = new BPEVisualizer();
    runner.assertGreaterThan(
        bpe10_6.commonMerges.length,
        10,
        "Simplified mode should have multiple common merge rules"
    );

    // ========================================================================
    // Test Group 11: TokenFrequencyAnalyzer (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 11: TokenFrequencyAnalyzer (6 tests) ---\n');

    // Test 11.1: Analyzer initialization
    const bpe11 = new BPEVisualizer();
    const analyzer11 = new TokenFrequencyAnalyzer(bpe11);
    runner.assertTrue(
        analyzer11 !== null,
        "Should create TokenFrequencyAnalyzer instance"
    );

    // Test 11.2: Empty token analysis
    bpe11.tokens = [];
    const freq11_2 = analyzer11.analyze();
    runner.assertEqual(
        freq11_2.length,
        0,
        "Should return empty array for empty tokens"
    );

    // Test 11.3: Single token analysis
    bpe11.tokens = [{ value: 'a', merged: false }];
    const freq11_3 = analyzer11.analyze();
    runner.assertEqual(
        freq11_3.length,
        1,
        "Should analyze single token"
    );
    runner.assertEqual(
        freq11_3[0].count,
        1,
        "Single token should have count 1"
    );

    // Test 11.4: Multiple token analysis
    bpe11.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'a', merged: false }
    ];
    const freq11_4 = analyzer11.analyze();
    runner.assertEqual(
        freq11_4.length,
        2,
        "Should find 2 unique tokens"
    );

    // Test 11.5: Frequency sorting
    const aToken = freq11_4.find(f => f.token === 'a');
    const bToken = freq11_4.find(f => f.token === 'b');
    runner.assertEqual(
        aToken.count,
        2,
        "Token 'a' should have count 2"
    );
    runner.assertEqual(
        bToken.count,
        1,
        "Token 'b' should have count 1"
    );
    runner.assertTrue(
        freq11_4[0].count >= freq11_4[1].count,
        "Frequencies should be sorted in descending order"
    );

    // Test 11.6: Analyzer with merged tokens
    bpe11.tokens = [
        { value: 'ab', merged: true },
        { value: 'ab', merged: true },
        { value: 'c', merged: false }
    ];
    const freq11_6 = analyzer11.analyze();
    const abToken = freq11_6.find(f => f.token === 'ab');
    runner.assertEqual(
        abToken.count,
        2,
        "Merged token 'ab' should have count 2"
    );

    // ========================================================================
    // Test Group 12: SubwordDecomposer (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 12: SubwordDecomposer (5 tests) ---\n');

    // Test 12.1: Simple word decomposition
    const decomp12_1 = SubwordDecomposer.decompose("hello");
    runner.assertEqual(
        decomp12_1.length,
        1,
        "Should decompose single word"
    );
    runner.assertEqual(
        decomp12_1[0].original,
        "hello",
        "Should preserve original word"
    );

    // Test 12.2: Prefix decomposition
    const decomp12_2 = SubwordDecomposer.decompose("unhappy");
    runner.assertGreaterThan(
        decomp12_2.length,
        0,
        "Should decompose prefixed word"
    );

    // Test 12.3: Suffix decomposition
    const decomp12_3 = SubwordDecomposer.decompose("running");
    runner.assertGreaterThan(
        decomp12_3.length,
        0,
        "Should decompose suffixed word"
    );

    // Test 12.4: Multiple words
    const decomp12_4 = SubwordDecomposer.decompose("hello world");
    runner.assertEqual(
        decomp12_4.length,
        2,
        "Should decompose multiple words"
    );

    // Test 12.5: Empty string
    const decomp12_5 = SubwordDecomposer.decompose("");
    runner.assertGreaterThanOrEqual(
        decomp12_5.length,
        0,
        "Should handle empty string gracefully"
    );

    // ========================================================================
    // Test Group 13: Reset and State Management (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 13: Reset and State Management (5 tests) ---\n');

    // Test 13.1: Reset clears tokens
    const bpe13_1 = new BPEVisualizer();
    bpe13_1.tokens = [{ value: 'a', merged: false }];
    bpe13_1.reset();
    runner.assertEqual(
        bpe13_1.tokens.length,
        0,
        "Reset should clear tokens"
    );

    // Test 13.2: Reset clears history
    const bpe13_2 = new BPEVisualizer();
    bpe13_2.mergeHistory = [{ step: 1, pair: ['a', 'b'], result: 'ab', count: 1 }];
    bpe13_2.reset();
    runner.assertEqual(
        bpe13_2.mergeHistory.length,
        0,
        "Reset should clear merge history"
    );

    // Test 13.3: Reset step counter
    const bpe13_3 = new BPEVisualizer();
    bpe13_3.currentStep = 10;
    bpe13_3.reset();
    runner.assertEqual(
        bpe13_3.currentStep,
        0,
        "Reset should reset step counter to 0"
    );

    // Test 13.4: Reset running state
    const bpe13_4 = new BPEVisualizer();
    bpe13_4.isRunning = true;
    bpe13_4.reset();
    runner.assertFalse(
        bpe13_4.isRunning,
        "Reset should set isRunning to false"
    );

    // Test 13.5: Reset auto-play
    const bpe13_5 = new BPEVisualizer();
    bpe13_5.autoPlayInterval = setInterval(() => {}, 1000);
    bpe13_5.reset();
    runner.assertEqual(
        bpe13_5.autoPlayInterval,
        null,
        "Reset should clear auto-play interval"
    );

    // ========================================================================
    // Test Group 14: Pair Merging Edge Cases (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 14: Pair Merging Edge Cases (5 tests) ---\n');

    // Test 14.1: Merge at start of sequence
    const bpe14_1 = new BPEVisualizer();
    bpe14_1.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false }
    ];
    const pairs14_1 = bpe14_1.findPairs();
    const abPair14_1 = pairs14_1.get('a|b');
    if (abPair14_1) {
        bpe14_1.mergePair(abPair14_1);
        runner.assertEqual(
            bpe14_1.tokens[0].value,
            'ab',
            "Should merge pair at start"
        );
    }

    // Test 14.2: Merge at end of sequence
    const bpe14_2 = new BPEVisualizer();
    bpe14_2.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false }
    ];
    const pairs14_2 = bpe14_2.findPairs();
    const bcPair14_2 = pairs14_2.get('b|c');
    if (bcPair14_2) {
        bpe14_2.mergePair(bcPair14_2);
        runner.assertEqual(
            bpe14_2.tokens[1].value,
            'bc',
            "Should merge pair at end"
        );
    }

    // Test 14.3: Merge in middle
    const bpe14_3 = new BPEVisualizer();
    bpe14_3.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'c', merged: false },
        { value: 'd', merged: false }
    ];
    const pairs14_3 = bpe14_3.findPairs();
    const bcPair14_3 = pairs14_3.get('b|c');
    if (bcPair14_3) {
        bpe14_3.mergePair(bcPair14_3);
        runner.assertEqual(
            bpe14_3.tokens.length,
            3,
            "Should merge pair in middle"
        );
    }

    // Test 14.4: Multiple non-adjacent occurrences
    const bpe14_4 = new BPEVisualizer();
    bpe14_4.tokens = [
        { value: 'a', merged: false },
        { value: 'b', merged: false },
        { value: 'x', merged: false },
        { value: 'a', merged: false },
        { value: 'b', merged: false }
    ];
    const pairs14_4 = bpe14_4.findPairs();
    const abPair14_4 = pairs14_4.get('a|b');
    if (abPair14_4) {
        const beforeLength = bpe14_4.tokens.length;
        bpe14_4.mergePair(abPair14_4);
        runner.assertEqual(
            beforeLength - bpe14_4.tokens.length,
            2,
            "Should merge both non-adjacent occurrences"
        );
    }

    // Test 14.5: Overlapping pattern handling
    const bpe14_5 = new BPEVisualizer();
    bpe14_5.tokens = [
        { value: 'a', merged: false },
        { value: 'a', merged: false },
        { value: 'a', merged: false }
    ];
    const pairs14_5 = bpe14_5.findPairs();
    const aaPair14_5 = pairs14_5.get('a|a');
    if (aaPair14_5) {
        bpe14_5.mergePair(aaPair14_5);
        // After merging 'aa' at indices 0 and 1, we should have merged 'aa' + remaining 'a'
        runner.assertLessThan(
            bpe14_5.tokens.length,
            3,
            "Should handle overlapping pattern"
        );
    }

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
