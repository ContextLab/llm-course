#!/usr/bin/env node
/**
 * Comprehensive test suite for Semantic Search BM25 (Demo 12)
 * Tests BM25 algorithm, tokenization, IDF calculation, and scoring
 * Run with: node test-bm25.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock performance API for Node.js
global.performance = {
    now: () => Date.now()
};

// Load the BM25 module
const bm25Code = await readFile(join(__dirname, 'js/bm25.js'), 'utf-8');
const executableCode = bm25Code
    .replace(/export class (\w+)/g, 'globalThis.$1 = class $1')
    .replace(/export default .+;?/g, '');
eval(executableCode);

const BM25 = globalThis.BM25;

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

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    assertArrayEqual(actual, expected, testName) {
        this.assert(
            JSON.stringify(actual) === JSON.stringify(expected),
            testName,
            expected,
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

async function runTests() {
    console.log('='.repeat(70));
    console.log('Semantic Search BM25 Test Suite (Demo 12)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Initialization
    console.log('\n--- Test Group 1: BM25 Initialization ---\n');

    const bm25 = new BM25();
    runner.assertEqual(bm25.k1, 1.5, "k1 parameter should default to 1.5");
    runner.assertEqual(bm25.b, 0.75, "b parameter should default to 0.75");
    runner.assertEqual(bm25.documents.length, 0, "Documents should be empty initially");

    const customBm25 = new BM25(2.0, 0.5);
    runner.assertEqual(customBm25.k1, 2.0, "Custom k1 should be set correctly");
    runner.assertEqual(customBm25.b, 0.5, "Custom b should be set correctly");

    // Test 2: Tokenization
    console.log('\n--- Test Group 2: Tokenization ---\n');

    const tokens1 = bm25.tokenize("Hello, world!");
    runner.assertArrayEqual(
        tokens1,
        ["hello", "world"],
        "Should tokenize and lowercase simple text"
    );

    const tokens2 = bm25.tokenize("BM25 is great for search!");
    runner.assertArrayEqual(
        tokens2,
        ["bm25", "is", "great", "for", "search"],
        "Should handle punctuation and convert to lowercase"
    );

    const tokens3 = bm25.tokenize("  multiple   spaces  ");
    runner.assertArrayEqual(
        tokens3,
        ["multiple", "spaces"],
        "Should handle multiple spaces"
    );

    const tokens4 = bm25.tokenize("");
    runner.assertEqual(
        tokens4.length,
        0,
        "Should return empty array for empty string"
    );

    const tokens5 = bm25.tokenize("machine-learning");
    runner.assert(
        tokens5.includes("machine") && tokens5.includes("learning"),
        "Should split hyphenated words",
        "includes machine and learning",
        tokens5
    );

    // Test 3: Index Building
    console.log('\n--- Test Group 3: Index Building ---\n');

    const testDocs = [
        "The cat sat on the mat",
        "The dog sat on the log",
        "Cats and dogs are pets"
    ];

    bm25.buildIndex(testDocs);

    runner.assertEqual(
        bm25.documents.length,
        3,
        "Should store all documents"
    );

    runner.assertEqual(
        bm25.tokenizedDocs.length,
        3,
        "Should tokenize all documents"
    );

    runner.assertEqual(
        bm25.docLengths.length,
        3,
        "Should calculate lengths for all documents"
    );

    runner.assertGreaterThan(
        bm25.avgDocLength,
        0,
        "Average document length should be positive"
    );

    runner.assertGreaterThan(
        Object.keys(bm25.idf).length,
        0,
        "Should calculate IDF for terms"
    );

    // Test 4: IDF Calculation
    console.log('\n--- Test Group 4: IDF Calculation ---\n');

    // Term "the" appears in all docs, should have low IDF
    // Term "pets" appears in only one doc, should have high IDF
    const idfThe = bm25.idf["the"];
    const idfPets = bm25.idf["pets"];

    runner.assert(
        idfThe !== undefined,
        "Should calculate IDF for common term 'the'",
        "defined",
        idfThe !== undefined ? "defined" : "undefined"
    );

    runner.assert(
        idfPets !== undefined,
        "Should calculate IDF for rare term 'pets'",
        "defined",
        idfPets !== undefined ? "defined" : "undefined"
    );

    if (idfThe !== undefined && idfPets !== undefined) {
        runner.assert(
            idfPets > idfThe,
            "Rare terms should have higher IDF than common terms",
            `pets (${idfPets.toFixed(2)}) > the (${idfThe.toFixed(2)})`,
            `pets: ${idfPets.toFixed(2)}, the: ${idfThe.toFixed(2)}`
        );
    }

    // Test 5: BM25 Scoring
    console.log('\n--- Test Group 5: BM25 Scoring ---\n');

    const queryTokens = ["cat", "sat"];
    const doc1Tokens = bm25.tokenizedDocs[0];  // "the cat sat on the mat"
    const doc2Tokens = bm25.tokenizedDocs[1];  // "the dog sat on the log"
    const doc3Tokens = bm25.tokenizedDocs[2];  // "cats and dogs are pets"

    const score1 = bm25.calculateScore(queryTokens, doc1Tokens, bm25.docLengths[0]);
    const score2 = bm25.calculateScore(queryTokens, doc2Tokens, bm25.docLengths[1]);
    const score3 = bm25.calculateScore(queryTokens, doc3Tokens, bm25.docLengths[2]);

    runner.assertGreaterThan(
        score1,
        0,
        "Doc 1 should have positive score (contains 'cat' and 'sat')"
    );

    runner.assertGreaterThan(
        score1,
        score2,
        "Doc 1 should score higher than Doc 2 (has 'cat' and 'sat' vs just 'sat')"
    );

    runner.assertGreaterThan(
        score2,
        0,
        "Doc 2 should have positive score (contains 'sat')"
    );

    // Test 6: Search Functionality
    console.log('\n--- Test Group 6: Search Functionality ---\n');

    const searchResults = bm25.search("cat mat", 2);

    runner.assert(
        searchResults.results !== undefined,
        "Search should return results object",
        "defined",
        searchResults.results !== undefined ? "defined" : "undefined"
    );

    runner.assert(
        searchResults.results.length > 0,
        "Should return results for matching query",
        "> 0",
        searchResults.results.length
    );

    runner.assertEqual(
        searchResults.results[0].index,
        0,
        "First result should be document 0 (contains 'cat' and 'mat')"
    );

    runner.assertGreaterThan(
        searchResults.results[0].score,
        0,
        "Top result should have positive score"
    );

    // Test 7: Empty Query
    console.log('\n--- Test Group 7: Empty Query Handling ---\n');

    const emptyResults = bm25.search("", 10);
    runner.assertEqual(
        emptyResults.results.length,
        0,
        "Empty query should return no results"
    );

    // Test 8: Top-K Limiting
    console.log('\n--- Test Group 8: Top-K Result Limiting ---\n');

    const manyDocs = [
        "apple banana cherry",
        "apple banana date",
        "apple cherry date",
        "banana cherry date",
        "apple date elderberry",
        "banana cherry elderberry"
    ];

    const bm25Many = new BM25();
    bm25Many.buildIndex(manyDocs);

    const topKResults = bm25Many.search("apple", 3);
    runner.assert(
        topKResults.results.length <= 3,
        "Should return at most topK results",
        "<= 3",
        topKResults.results.length
    );

    // All results should contain 'apple'
    const allContainApple = topKResults.results.every(r =>
        r.document.toLowerCase().includes("apple")
    );
    runner.assert(
        allContainApple,
        "All results should contain query term 'apple'",
        true,
        allContainApple
    );

    // Test 9: Score Normalization
    console.log('\n--- Test Group 9: Score Normalization ---\n');

    const normResults = bm25Many.search("banana cherry", 5);

    if (normResults.results.length > 0) {
        runner.assertEqual(
            normResults.results[0].normalizedScore,
            1.0,
            "Top result should have normalized score of 1.0"
        );

        const allNormalized = normResults.results.every(r =>
            r.normalizedScore >= 0 && r.normalizedScore <= 1
        );
        runner.assert(
            allNormalized,
            "All normalized scores should be in [0, 1]",
            "all in [0,1]",
            allNormalized ? "all in [0,1]" : "some out of range"
        );
    }

    // Test 10: Vocabulary Statistics
    console.log('\n--- Test Group 10: Vocabulary Statistics ---\n');

    const vocabSize = bm25.getVocabularySize();
    runner.assertGreaterThan(
        vocabSize,
        0,
        "Vocabulary size should be positive"
    );

    const expectedUniqueTerms = new Set();
    testDocs.forEach(doc => {
        bm25.tokenize(doc).forEach(term => expectedUniqueTerms.add(term));
    });

    runner.assertEqual(
        vocabSize,
        expectedUniqueTerms.size,
        "Vocabulary size should match number of unique terms"
    );

    // Test 11: Top Terms by IDF
    console.log('\n--- Test Group 11: Top Terms by IDF ---\n');

    const topTerms = bm25.getTopTermsByIDF(5);

    runner.assert(
        Array.isArray(topTerms),
        "getTopTermsByIDF should return array",
        "array",
        Array.isArray(topTerms) ? "array" : typeof topTerms
    );

    runner.assert(
        topTerms.length > 0,
        "Should return at least one top term",
        "> 0",
        topTerms.length
    );

    runner.assert(
        topTerms.every(t => t.hasOwnProperty('term') && t.hasOwnProperty('idf')),
        "Each top term should have 'term' and 'idf' properties",
        "has properties",
        "checked"
    );

    // IDF values should be in descending order
    const idfValues = topTerms.map(t => t.idf);
    const isSorted = idfValues.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
    runner.assert(
        isSorted,
        "Top terms should be sorted by IDF (descending)",
        "sorted descending",
        isSorted ? "sorted" : "not sorted"
    );

    // Test 12: Highlighting
    console.log('\n--- Test Group 12: Query Term Highlighting ---\n');

    const originalText = "The cat sat on the mat";
    const highlightedText = bm25.highlightTerms(originalText, "cat mat");

    runner.assert(
        highlightedText.includes('<span class="result-highlight">cat</span>'),
        "Should highlight 'cat' in text",
        "contains highlighted cat",
        highlightedText.includes('cat') ? "yes" : "no"
    );

    runner.assert(
        highlightedText.includes('<span class="result-highlight">mat</span>'),
        "Should highlight 'mat' in text",
        "contains highlighted mat",
        highlightedText.includes('mat') ? "yes" : "no"
    );

    // Test 13: Document Length Normalization
    console.log('\n--- Test Group 13: Document Length Normalization ---\n');

    const shortDoc = "cat";
    const longDoc = "the cat sat on the mat and the cat played with the rat";

    const bm25Norm = new BM25();
    bm25Norm.buildIndex([shortDoc, longDoc]);

    const normQueryTokens = ["cat"];
    const shortScore = bm25Norm.calculateScore(
        normQueryTokens,
        bm25Norm.tokenizedDocs[0],
        bm25Norm.docLengths[0]
    );
    const longScore = bm25Norm.calculateScore(
        normQueryTokens,
        bm25Norm.tokenizedDocs[1],
        bm25Norm.docLengths[1]
    );

    runner.assertGreaterThan(
        shortScore,
        0,
        "Short document should have positive score"
    );

    runner.assertGreaterThan(
        longScore,
        0,
        "Long document should have positive score"
    );

    // With length normalization, shorter doc should typically score higher for same term density
    runner.assertGreaterThan(
        shortScore,
        longScore,
        "Shorter document should score higher (BM25 length normalization)"
    );

    // Test 14: Multiple Query Terms
    console.log('\n--- Test Group 14: Multiple Query Terms ---\n');

    const multiQueryDocs = [
        "machine learning algorithms",
        "deep learning neural networks",
        "machine learning and deep learning",
        "algorithms and data structures"
    ];

    const bm25Multi = new BM25();
    bm25Multi.buildIndex(multiQueryDocs);

    const multiResults = bm25Multi.search("machine learning", 4);

    // Document 0 and 2 contain both terms, should rank highly
    runner.assert(
        multiResults.results[0].index === 0 || multiResults.results[0].index === 2,
        "Top result should be a document containing both query terms",
        "0 or 2",
        multiResults.results[0].index
    );

    // Test 15: Case Insensitivity
    console.log('\n--- Test Group 15: Case Insensitivity ---\n');

    const caseDocs = ["HELLO WORLD", "hello world", "HeLLo WoRLd"];
    const bm25Case = new BM25();
    bm25Case.buildIndex(caseDocs);

    const upperResults = bm25Case.search("HELLO", 3);
    const lowerResults = bm25Case.search("hello", 3);

    runner.assertEqual(
        upperResults.results.length,
        lowerResults.results.length,
        "Uppercase and lowercase queries should return same number of results"
    );

    runner.assertEqual(
        upperResults.results[0].index,
        lowerResults.results[0].index,
        "Uppercase and lowercase queries should return same top result"
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
