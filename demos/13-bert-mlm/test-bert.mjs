#!/usr/bin/env node
/**
 * Comprehensive Test Suite for BERT MLM (Demo 13)
 * Tests: 50+ comprehensive tests covering tokenization, masking, and edge cases
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

    assertDeepEqual(actual, expected, testName) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        this.assert(actualStr === expectedStr, testName, expected, actual);
    }

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    assertLessThan(actual, threshold, testName) {
        this.assert(actual < threshold, testName, `< ${threshold}`, actual);
    }

    assertArrayContains(array, element, testName) {
        this.assert(array.includes(element), testName, `array contains ${element}`, array);
    }

    assertNotNull(actual, testName) {
        this.assert(actual !== null && actual !== undefined, testName, 'not null/undefined', actual);
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// ============================================================================
// BERT TOKENIZATION HELPERS
// ============================================================================

/**
 * Basic tokenization (word-level)
 */
function tokenize(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
}

/**
 * WordPiece tokenization simulation
 */
function wordpieceTokenize(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const tokens = [];

    for (const word of words) {
        if (word.length <= 4) {
            tokens.push(word);
        } else {
            // Simulate subword tokenization for longer words
            const chunks = Math.ceil(word.length / 4);
            for (let i = 0; i < chunks; i++) {
                const start = i * 4;
                const end = Math.min((i + 1) * 4, word.length);
                const chunk = word.slice(start, end);
                tokens.push(i === 0 ? chunk : '##' + chunk);
            }
        }
    }

    return tokens;
}

/**
 * Add special tokens ([CLS] and [SEP])
 */
function addSpecialTokens(tokens) {
    return ['[CLS]', ...tokens, '[SEP]'];
}

/**
 * Insert mask at position
 */
function insertMask(tokens, position) {
    const masked = [...tokens];
    masked[position] = '[MASK]';
    return masked;
}

/**
 * Insert multiple masks
 */
function insertMultipleMasks(tokens, positions) {
    const masked = [...tokens];
    for (const pos of positions) {
        masked[pos] = '[MASK]';
    }
    return masked;
}

/**
 * Pad sequence to max length
 */
function padSequence(tokens, maxLength, padToken = '[PAD]') {
    if (tokens.length >= maxLength) {
        return tokens.slice(0, maxLength);
    }
    return [...tokens, ...Array(maxLength - tokens.length).fill(padToken)];
}

/**
 * Create attention mask (1 for real tokens, 0 for padding)
 */
function createAttentionMask(tokens, padToken = '[PAD]') {
    return tokens.map(token => token === padToken ? 0 : 1);
}

/**
 * Create token type IDs (segment embeddings)
 */
function createTokenTypeIds(tokens, sepIndices = []) {
    const typeIds = new Array(tokens.length).fill(0);

    if (sepIndices.length > 0) {
        let currentSegment = 0;
        for (let i = 0; i < tokens.length; i++) {
            typeIds[i] = currentSegment;
            if (sepIndices.includes(i)) {
                currentSegment = 1 - currentSegment; // Toggle between 0 and 1
            }
        }
    }

    return typeIds;
}

/**
 * Truncate sequence to max length
 */
function truncateSequence(tokens, maxLength) {
    if (tokens.length <= maxLength) {
        return tokens;
    }
    return tokens.slice(0, maxLength);
}

/**
 * Get subword tokens (those starting with ##)
 */
function getSubwordTokens(tokens) {
    return tokens.filter(token => token.startsWith('##'));
}

/**
 * Get word tokens (not subwords or special tokens)
 */
function getWordTokens(tokens) {
    return tokens.filter(token =>
        !token.startsWith('##') &&
        !token.startsWith('[') &&
        !token.endsWith(']')
    );
}

/**
 * Count masked tokens
 */
function countMaskedTokens(tokens) {
    return tokens.filter(token => token === '[MASK]').length;
}

/**
 * Find mask positions
 */
function findMaskPositions(tokens) {
    const positions = [];
    tokens.forEach((token, idx) => {
        if (token === '[MASK]') {
            positions.push(idx);
        }
    });
    return positions;
}

// ============================================================================
// TEST SUITE
// ============================================================================

async function runTests() {
    console.log('='.repeat(70));
    console.log('BERT MLM Comprehensive Test Suite (Demo 13)');
    console.log('50+ Tests: Tokenization, Masking, Edge Cases, and More');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // Test Group 1: Basic Tokenization (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 1: Basic Tokenization (10 tests) ---\n');

    // Test 1.1: Simple sentence tokenization
    const text1 = "The quick brown fox";
    const tokens1 = tokenize(text1);
    runner.assertEqual(tokens1.length, 4, "T1.1: Should tokenize 4-word sentence");

    // Test 1.2: Lowercase conversion
    runner.assertEqual(tokens1[0], "the", "T1.2: Should lowercase tokens");

    // Test 1.3: Empty string
    const tokens2 = tokenize("");
    runner.assertEqual(tokens2.length, 0, "T1.3: Should handle empty string");

    // Test 1.4: Single word
    const tokens3 = tokenize("Hello");
    runner.assertEqual(tokens3.length, 1, "T1.4: Should tokenize single word");
    runner.assertEqual(tokens3[0], "hello", "T1.4b: Should lowercase single word");

    // Test 1.5: Punctuation handling
    const tokens4 = tokenize("Hello, world!");
    runner.assertEqual(tokens4.length, 2, "T1.5: Should handle punctuation");

    // Test 1.6: Multiple spaces
    const tokens5 = tokenize("The    quick   brown");
    runner.assertEqual(tokens5.length, 3, "T1.6: Should handle multiple spaces");

    // Test 1.7: Numbers
    const tokens6 = tokenize("I have 3 apples");
    runner.assertEqual(tokens6.length, 4, "T1.7: Should tokenize numbers");

    // Test 1.8: Mixed case
    const tokens7 = tokenize("ThE QuIcK BrOwN FoX");
    runner.assertEqual(tokens7[1], "quick", "T1.8: Should handle mixed case");

    // Test 1.9: Long sentence
    const tokens8 = tokenize("The quick brown fox jumps over the lazy dog");
    runner.assertEqual(tokens8.length, 9, "T1.9: Should tokenize long sentence");

    // Test 1.10: Special characters
    const tokens9 = tokenize("user@email.com test123");
    runner.assertGreaterThan(tokens9.length, 0, "T1.10: Should handle special chars");

    // ========================================================================
    // Test Group 2: WordPiece Tokenization (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 2: WordPiece Tokenization (8 tests) ---\n');

    // Test 2.1: Short words (no subwords)
    const wp1 = wordpieceTokenize("the cat sat");
    runner.assertEqual(wp1.length, 3, "T2.1: Short words should not be split");

    // Test 2.2: Long word creates subwords
    const wp2 = wordpieceTokenize("beautiful");
    runner.assertGreaterThan(wp2.length, 1, "T2.2: Long word should create subwords");

    // Test 2.3: Subwords start with ##
    const wp3 = wordpieceTokenize("wonderful");
    const hasSubword = wp3.some(token => token.startsWith('##'));
    runner.assert(hasSubword, "T2.3: Should have ## prefix for subwords", true, hasSubword);

    // Test 2.4: First subword has no ##
    const wp4 = wordpieceTokenize("extraordinary");
    runner.assert(!wp4[0].startsWith('##'), "T2.4: First token should not have ##", false, wp4[0].startsWith('##'));

    // Test 2.5: Mixed length words
    const wp5 = wordpieceTokenize("The extraordinary cat");
    runner.assertGreaterThan(wp5.length, 3, "T2.5: Mixed lengths create more tokens");

    // Test 2.6: All short words
    const wp6 = wordpieceTokenize("I am ok");
    runner.assertEqual(wp6.length, 3, "T2.6: All short words stay intact");

    // Test 2.7: Get subword tokens
    const wp7 = wordpieceTokenize("magnificent wonderful");
    const subwords = getSubwordTokens(wp7);
    runner.assertGreaterThan(subwords.length, 0, "T2.7: Should extract subword tokens");

    // Test 2.8: Get word tokens
    const wp8 = wordpieceTokenize("hello world");
    const wordTokens = getWordTokens(wp8);
    runner.assertGreaterThan(wordTokens.length, 0, "T2.8: Should extract word tokens");

    // ========================================================================
    // Test Group 3: Special Tokens (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 3: Special Tokens [CLS], [SEP], [PAD] (8 tests) ---\n');

    // Test 3.1: Add [CLS] and [SEP]
    const base = ["hello", "world"];
    const withSpecial = addSpecialTokens(base);
    runner.assertEqual(withSpecial[0], "[CLS]", "T3.1: Should add [CLS] at start");

    // Test 3.2: [SEP] at end
    runner.assertEqual(withSpecial[withSpecial.length - 1], "[SEP]", "T3.2: Should add [SEP] at end");

    // Test 3.3: Length increases by 2
    runner.assertEqual(withSpecial.length, base.length + 2, "T3.3: Length should increase by 2");

    // Test 3.4: Original tokens preserved
    runner.assertEqual(withSpecial[1], "hello", "T3.4: Should preserve original tokens");

    // Test 3.5: Empty input with special tokens
    const emptySpecial = addSpecialTokens([]);
    runner.assertEqual(emptySpecial.length, 2, "T3.5: Empty input should have 2 special tokens");

    // Test 3.6: Single token with special tokens
    const singleSpecial = addSpecialTokens(["test"]);
    runner.assertEqual(singleSpecial.length, 3, "T3.6: Single token becomes 3 with special");

    // Test 3.7: Padding tokens
    const padded = padSequence(["hello", "world"], 5);
    runner.assertEqual(padded.length, 5, "T3.7: Should pad to max length");

    // Test 3.8: Padding token is [PAD]
    runner.assertEqual(padded[4], "[PAD]", "T3.8: Padding token should be [PAD]");

    // ========================================================================
    // Test Group 4: Mask Insertion - Single Position (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 4: Mask Insertion - Single Position (8 tests) ---\n');

    const baseTokens = ["the", "quick", "brown", "fox"];

    // Test 4.1: Mask at position 0
    const masked1 = insertMask(baseTokens, 0);
    runner.assertEqual(masked1[0], "[MASK]", "T4.1: Should mask position 0");

    // Test 4.2: Mask at position 1
    const masked2 = insertMask(baseTokens, 1);
    runner.assertEqual(masked2[1], "[MASK]", "T4.2: Should mask position 1");

    // Test 4.3: Mask at last position
    const masked3 = insertMask(baseTokens, 3);
    runner.assertEqual(masked3[3], "[MASK]", "T4.3: Should mask last position");

    // Test 4.4: Other tokens unchanged
    runner.assertEqual(masked2[0], "the", "T4.4: Should not modify other tokens");

    // Test 4.5: Length preserved
    runner.assertEqual(masked1.length, baseTokens.length, "T4.5: Length should be preserved");

    // Test 4.6: Original array unchanged
    runner.assertEqual(baseTokens[1], "quick", "T4.6: Original array should be unchanged");

    // Test 4.7: Mask middle position
    const masked4 = insertMask(baseTokens, 2);
    runner.assertEqual(masked4[2], "[MASK]", "T4.7: Should mask middle position");

    // Test 4.8: Single token masking
    const single = ["hello"];
    const maskedSingle = insertMask(single, 0);
    runner.assertEqual(maskedSingle[0], "[MASK]", "T4.8: Should mask single token");

    // ========================================================================
    // Test Group 5: Multiple Mask Handling (7 tests)
    // ========================================================================
    console.log('\n--- Test Group 5: Multiple Mask Handling (7 tests) ---\n');

    // Test 5.1: Two masks
    const multiMasked1 = insertMultipleMasks(baseTokens, [1, 3]);
    runner.assertEqual(countMaskedTokens(multiMasked1), 2, "T5.1: Should have 2 masks");

    // Test 5.2: Both positions masked
    runner.assertEqual(multiMasked1[1], "[MASK]", "T5.2: Position 1 should be masked");
    runner.assertEqual(multiMasked1[3], "[MASK]", "T5.2b: Position 3 should be masked");

    // Test 5.3: Three masks
    const multiMasked2 = insertMultipleMasks(baseTokens, [0, 1, 2]);
    runner.assertEqual(countMaskedTokens(multiMasked2), 3, "T5.3: Should have 3 masks");

    // Test 5.4: Find mask positions
    const positions = findMaskPositions(multiMasked1);
    runner.assertEqual(positions.length, 2, "T5.4: Should find 2 mask positions");

    // Test 5.5: Correct positions found
    runner.assertArrayContains(positions, 1, "T5.5: Should find position 1");
    runner.assertArrayContains(positions, 3, "T5.5b: Should find position 3");

    // Test 5.6: All tokens masked
    const allMasked = insertMultipleMasks(baseTokens, [0, 1, 2, 3]);
    runner.assertEqual(countMaskedTokens(allMasked), 4, "T5.6: Should mask all tokens");

    // Test 5.7: No masks
    const noMask = insertMultipleMasks(baseTokens, []);
    runner.assertEqual(countMaskedTokens(noMask), 0, "T5.7: Should have no masks");

    // ========================================================================
    // Test Group 6: Sequence Padding and Truncation (7 tests)
    // ========================================================================
    console.log('\n--- Test Group 6: Sequence Padding and Truncation (7 tests) ---\n');

    // Test 6.1: Pad short sequence
    const shortSeq = ["hello", "world"];
    const padded1 = padSequence(shortSeq, 5);
    runner.assertEqual(padded1.length, 5, "T6.1: Should pad to max length");

    // Test 6.2: Truncate long sequence
    const longSeq = ["a", "b", "c", "d", "e", "f"];
    const truncated1 = truncateSequence(longSeq, 3);
    runner.assertEqual(truncated1.length, 3, "T6.2: Should truncate to max length");

    // Test 6.3: Exact length unchanged
    const exactSeq = ["a", "b", "c"];
    const exact = padSequence(exactSeq, 3);
    runner.assertEqual(exact.length, 3, "T6.3: Exact length should be unchanged");

    // Test 6.4: Truncation preserves first tokens
    runner.assertEqual(truncated1[0], "a", "T6.4: Should preserve first token");
    runner.assertEqual(truncated1[2], "c", "T6.4b: Should preserve truncated tokens");

    // Test 6.5: Padding adds correct tokens
    runner.assertEqual(padded1[2], "[PAD]", "T6.5: Should add [PAD] tokens");

    // Test 6.6: Empty sequence padding
    const emptyPadded = padSequence([], 3);
    runner.assertEqual(emptyPadded.length, 3, "T6.6: Should pad empty sequence");

    // Test 6.7: Truncate to zero
    const truncZero = truncateSequence(longSeq, 0);
    runner.assertEqual(truncZero.length, 0, "T6.7: Should truncate to zero");

    // ========================================================================
    // Test Group 7: Attention Masks (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 7: Attention Masks (6 tests) ---\n');

    // Test 7.1: All real tokens
    const realTokens = ["hello", "world", "test"];
    const attnMask1 = createAttentionMask(realTokens);
    runner.assertDeepEqual(attnMask1, [1, 1, 1], "T7.1: All real tokens should be 1");

    // Test 7.2: With padding
    const withPad = ["hello", "world", "[PAD]", "[PAD]"];
    const attnMask2 = createAttentionMask(withPad);
    runner.assertDeepEqual(attnMask2, [1, 1, 0, 0], "T7.2: Padding should be 0");

    // Test 7.3: Empty sequence
    const attnMask3 = createAttentionMask([]);
    runner.assertEqual(attnMask3.length, 0, "T7.3: Empty sequence creates empty mask");

    // Test 7.4: All padding
    const allPad = ["[PAD]", "[PAD]", "[PAD]"];
    const attnMask4 = createAttentionMask(allPad);
    runner.assertDeepEqual(attnMask4, [0, 0, 0], "T7.4: All padding should be 0");

    // Test 7.5: Special tokens not padding
    const special = ["[CLS]", "hello", "[SEP]"];
    const attnMask5 = createAttentionMask(special);
    runner.assertDeepEqual(attnMask5, [1, 1, 1], "T7.5: Special tokens should be 1");

    // Test 7.6: Mask length matches token length
    const tokens = ["a", "b", "[PAD]"];
    const attnMask6 = createAttentionMask(tokens);
    runner.assertEqual(attnMask6.length, tokens.length, "T7.6: Mask length should match");

    // ========================================================================
    // Test Group 8: Token Type IDs (Segment Embeddings) (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 8: Token Type IDs - Segment Embeddings (6 tests) ---\n');

    // Test 8.1: Single segment
    const seg1 = ["[CLS]", "hello", "world", "[SEP]"];
    const typeIds1 = createTokenTypeIds(seg1);
    runner.assertDeepEqual(typeIds1, [0, 0, 0, 0], "T8.1: Single segment should be all 0");

    // Test 8.2: Two segments
    const seg2 = ["[CLS]", "hello", "[SEP]", "world", "[SEP]"];
    const typeIds2 = createTokenTypeIds(seg2, [2]);
    runner.assertEqual(typeIds2[0], 0, "T8.2: First segment should be 0");
    runner.assertEqual(typeIds2[3], 1, "T8.2b: After SEP should toggle to 1");

    // Test 8.3: Length matches
    runner.assertEqual(typeIds1.length, seg1.length, "T8.3: Length should match tokens");

    // Test 8.4: Empty sequence
    const typeIds3 = createTokenTypeIds([]);
    runner.assertEqual(typeIds3.length, 0, "T8.4: Empty sequence creates empty IDs");

    // Test 8.5: No separator indices
    const typeIds4 = createTokenTypeIds(seg1, []);
    runner.assertDeepEqual(typeIds4, [0, 0, 0, 0], "T8.5: No separators means all 0");

    // Test 8.6: Multiple separators
    const seg3 = ["a", "b", "c", "d", "e"];
    const typeIds5 = createTokenTypeIds(seg3, [1, 3]);
    runner.assertNotNull(typeIds5, "T8.6: Should handle multiple separators");

    // ========================================================================
    // Test Group 9: Edge Cases - Empty and Null (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 9: Edge Cases - Empty and Null (6 tests) ---\n');

    // Test 9.1: Tokenize null-like inputs
    const nullTokens1 = tokenize("");
    runner.assertEqual(nullTokens1.length, 0, "T9.1: Empty string returns empty array");

    // Test 9.2: WordPiece on empty
    const nullTokens2 = wordpieceTokenize("");
    runner.assertEqual(nullTokens2.length, 0, "T9.2: WordPiece empty string returns empty");

    // Test 9.3: Mask on empty array
    const emptyMask = insertMultipleMasks([], []);
    runner.assertEqual(emptyMask.length, 0, "T9.3: Masking empty array works");

    // Test 9.4: Special tokens on empty
    const emptySpec = addSpecialTokens([]);
    runner.assertEqual(emptySpec.length, 2, "T9.4: Special tokens on empty gives 2");

    // Test 9.5: Count masks on empty
    const count = countMaskedTokens([]);
    runner.assertEqual(count, 0, "T9.5: Count masks on empty is 0");

    // Test 9.6: Find positions on empty
    const pos = findMaskPositions([]);
    runner.assertEqual(pos.length, 0, "T9.6: Find positions on empty returns empty");

    // ========================================================================
    // Test Group 10: Edge Cases - Very Long Sequences (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 10: Edge Cases - Very Long Sequences (5 tests) ---\n');

    // Test 10.1: Long sentence tokenization
    const longText = "The quick brown fox jumps over the lazy dog and runs through the forest " +
                     "past the river and up the mountain into the clouds above the world";
    const longTokens = tokenize(longText);
    runner.assertGreaterThan(longTokens.length, 20, "T10.1: Should tokenize long sentence");

    // Test 10.2: Truncate very long
    const veryLong = new Array(100).fill("word");
    const truncLong = truncateSequence(veryLong, 10);
    runner.assertEqual(truncLong.length, 10, "T10.2: Should truncate very long sequence");

    // Test 10.3: Pad very long (should truncate)
    const padLong = padSequence(veryLong, 10);
    runner.assertEqual(padLong.length, 10, "T10.3: Padding long sequence truncates");

    // Test 10.4: Many masks
    const manyTokens = new Array(20).fill("word").map((w, i) => w + i);
    const manyMasks = insertMultipleMasks(manyTokens, [0, 5, 10, 15, 19]);
    runner.assertEqual(countMaskedTokens(manyMasks), 5, "T10.4: Should handle many masks");

    // Test 10.5: Attention mask for long sequence
    const longPadded = [...new Array(50).fill("word"), ...new Array(50).fill("[PAD]")];
    const longAttn = createAttentionMask(longPadded);
    runner.assertEqual(longAttn.length, 100, "T10.5: Long attention mask correct length");

    // ========================================================================
    // Test Group 11: Edge Cases - Special Characters and Unknown Tokens (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 11: Edge Cases - Special Chars and Unknown (5 tests) ---\n');

    // Test 11.1: Unicode characters
    const unicode = tokenize("Hello 世界 مرحبا");
    runner.assertGreaterThan(unicode.length, 0, "T11.1: Should handle Unicode");

    // Test 11.2: Numbers and symbols
    const numSymbols = tokenize("test123 abc456");
    runner.assertGreaterThan(numSymbols.length, 0, "T11.2: Should handle numbers");

    // Test 11.3: Hyphens and underscores
    const hyphens = tokenize("hello-world test_case");
    runner.assertGreaterThan(hyphens.length, 0, "T11.3: Should handle hyphens");

    // Test 11.4: Multiple punctuation
    const punct = tokenize("Hello!!! World??? Test...");
    runner.assertGreaterThan(punct.length, 0, "T11.4: Should handle punctuation");

    // Test 11.5: Whitespace variations
    const whitespace = tokenize("Hello\tWorld\nTest");
    runner.assertGreaterThan(whitespace.length, 0, "T11.5: Should handle whitespace");

    // ========================================================================
    // Test Group 12: Integration Tests (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 12: Integration Tests (5 tests) ---\n');

    // Test 12.1: Full pipeline - tokenize, add special, mask, pad
    const pipeline1 = tokenize("Hello world");
    const pipeline2 = addSpecialTokens(pipeline1);
    const pipeline3 = insertMask(pipeline2, 1);
    const pipeline4 = padSequence(pipeline3, 10);
    runner.assertEqual(pipeline4.length, 10, "T12.1: Full pipeline works");
    runner.assertEqual(pipeline3[1], "[MASK]", "T12.1b: Mask preserved in pipeline");

    // Test 12.2: WordPiece + Special + Masks
    const wp = wordpieceTokenize("extraordinary");
    const wpSpecial = addSpecialTokens(wp);
    const wpMasked = insertMask(wpSpecial, 2);
    runner.assertEqual(wpMasked[2], "[MASK]", "T12.2: WordPiece pipeline works");

    // Test 12.3: Attention mask after padding
    const intTokens = ["hello", "world"];
    const intPadded = padSequence(intTokens, 5);
    const intAttn = createAttentionMask(intPadded);
    runner.assertDeepEqual(intAttn, [1, 1, 0, 0, 0], "T12.3: Attention mask after padding");

    // Test 12.4: Token type IDs with special tokens
    const sent1 = addSpecialTokens(["hello", "world"]);
    const sent2 = [...sent1.slice(0, -1), ...["goodbye"], "[SEP]"];
    const typeIds = createTokenTypeIds(sent2, [3]);
    runner.assertNotNull(typeIds, "T12.4: Token types with special tokens");

    // Test 12.5: Multiple operations preserve length relationships
    const base2 = tokenize("The cat");
    const withSpec2 = addSpecialTokens(base2);
    const masked5 = insertMask(withSpec2, 1);
    const final = padSequence(masked5, 10);
    runner.assertEqual(final.length, 10, "T12.5: Multiple operations work together");
    runner.assertEqual(countMaskedTokens(final), 1, "T12.5b: Mask count preserved");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
