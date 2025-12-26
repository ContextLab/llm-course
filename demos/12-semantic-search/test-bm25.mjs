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

    assertLessThan(actual, threshold, testName) {
        this.assert(actual < threshold, testName, `< ${threshold}`, actual);
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

    // ========================================================================
    // Test Group 1: BM25 Initialization
    // ========================================================================
    console.log('\n--- Test Group 1: BM25 Initialization ---\n');

    const bm25 = new BM25();
    runner.assertEqual(bm25.k1, 1.5, "k1 parameter should default to 1.5");
    runner.assertEqual(bm25.b, 0.75, "b parameter should default to 0.75");
    runner.assertEqual(bm25.documents.length, 0, "Documents should be empty initially");
    runner.assertEqual(bm25.tokenizedDocs.length, 0, "Tokenized docs should be empty initially");
    runner.assertEqual(Object.keys(bm25.idf).length, 0, "IDF should be empty initially");
    runner.assertEqual(bm25.avgDocLength, 0, "Average doc length should be 0 initially");
    runner.assertEqual(bm25.docLengths.length, 0, "Doc lengths should be empty initially");

    const customBm25 = new BM25(2.0, 0.5);
    runner.assertEqual(customBm25.k1, 2.0, "Custom k1 should be set correctly");
    runner.assertEqual(customBm25.b, 0.5, "Custom b should be set correctly");

    const customBm25_2 = new BM25(1.2, 0.75);
    runner.assertEqual(customBm25_2.k1, 1.2, "k1=1.2 should be set correctly");
    runner.assertEqual(customBm25_2.b, 0.75, "b=0.75 should be set correctly");

    const customBm25_3 = new BM25(1.5, 0.0);
    runner.assertEqual(customBm25_3.k1, 1.5, "k1=1.5 should be set correctly");
    runner.assertEqual(customBm25_3.b, 0.0, "b=0.0 (no length normalization) should be set");

    const customBm25_4 = new BM25(1.5, 1.0);
    runner.assertEqual(customBm25_4.k1, 1.5, "k1=1.5 should be set correctly");
    runner.assertEqual(customBm25_4.b, 1.0, "b=1.0 (full length normalization) should be set");

    // ========================================================================
    // Test Group 2: Tokenization
    // ========================================================================
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

    const tokens6 = bm25.tokenize("UPPERCASE TEXT");
    runner.assertArrayEqual(
        tokens6,
        ["uppercase", "text"],
        "Should lowercase uppercase text"
    );

    const tokens7 = bm25.tokenize("MiXeD CaSe TeXt");
    runner.assertArrayEqual(
        tokens7,
        ["mixed", "case", "text"],
        "Should lowercase mixed case text"
    );

    const tokens8 = bm25.tokenize("one,two,three");
    runner.assertArrayEqual(
        tokens8,
        ["one", "two", "three"],
        "Should handle comma-separated words"
    );

    const tokens9 = bm25.tokenize("one.two.three");
    runner.assertArrayEqual(
        tokens9,
        ["one", "two", "three"],
        "Should handle period-separated words"
    );

    const tokens10 = bm25.tokenize("one!two?three");
    runner.assertArrayEqual(
        tokens10,
        ["one", "two", "three"],
        "Should handle exclamation/question marks"
    );

    const tokens11 = bm25.tokenize("test@email.com");
    runner.assert(
        tokens11.includes("test") && tokens11.includes("email") && tokens11.includes("com"),
        "Should tokenize email addresses",
        "includes test, email, com",
        tokens11
    );

    const tokens12 = bm25.tokenize("test's word");
    runner.assert(
        tokens12.includes("test") && tokens12.includes("s") && tokens12.includes("word"),
        "Should handle apostrophes",
        "includes test, s, word",
        tokens12
    );

    const tokens13 = bm25.tokenize("word1 word2");
    runner.assertArrayEqual(
        tokens13,
        ["word1", "word2"],
        "Should handle words with numbers"
    );

    const tokens14 = bm25.tokenize("a");
    runner.assertArrayEqual(
        tokens14,
        ["a"],
        "Should handle single character"
    );

    const tokens15 = bm25.tokenize("\t\n\r");
    runner.assertEqual(
        tokens15.length,
        0,
        "Should handle whitespace-only strings"
    );

    const tokens16 = bm25.tokenize("word1\tword2\nword3\rword4");
    runner.assertArrayEqual(
        tokens16,
        ["word1", "word2", "word3", "word4"],
        "Should handle tab, newline, carriage return"
    );

    // ========================================================================
    // Test Group 3: Index Building
    // ========================================================================
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

    const expectedAvgLength = (6 + 6 + 5) / 3;
    runner.assertClose(
        bm25.avgDocLength,
        expectedAvgLength,
        0.01,
        "Average document length should be calculated correctly"
    );

    runner.assertEqual(
        bm25.docLengths[0],
        6,
        "First document length should be 6"
    );

    runner.assertEqual(
        bm25.docLengths[1],
        6,
        "Second document length should be 6"
    );

    runner.assertEqual(
        bm25.docLengths[2],
        5,
        "Third document length should be 5"
    );

    // ========================================================================
    // Test Group 4: Average Document Length Calculation
    // ========================================================================
    console.log('\n--- Test Group 4: Average Document Length Calculation ---\n');

    const uniformDocs = ["one two three", "four five six", "seven eight nine"];
    const bm25Uniform = new BM25();
    bm25Uniform.buildIndex(uniformDocs);
    runner.assertEqual(
        bm25Uniform.avgDocLength,
        3,
        "Average length of uniform documents should be 3"
    );

    const variedDocs = ["a", "a b c d e"];
    const bm25Varied = new BM25();
    bm25Varied.buildIndex(variedDocs);
    runner.assertEqual(
        bm25Varied.avgDocLength,
        3,
        "Average length should be (1+5)/2 = 3"
    );

    const singleDoc = ["hello world"];
    const bm25Single = new BM25();
    bm25Single.buildIndex(singleDoc);
    runner.assertEqual(
        bm25Single.avgDocLength,
        2,
        "Average length of single document should equal its length"
    );

    // ========================================================================
    // Test Group 5: IDF Calculation
    // ========================================================================
    console.log('\n--- Test Group 5: IDF Calculation ---\n');

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

    // Test IDF for terms appearing in all documents
    const allDocsDocs = ["word", "word", "word"];
    const bm25AllDocs = new BM25();
    bm25AllDocs.buildIndex(allDocsDocs);
    runner.assertGreaterThan(
        bm25AllDocs.idf["word"],
        0,
        "IDF should be positive even for term in all documents"
    );

    // Test IDF for term in single document
    const rareTermDocs = ["unique term", "other words", "more words"];
    const bm25Rare = new BM25();
    bm25Rare.buildIndex(rareTermDocs);
    runner.assertGreaterThan(
        bm25Rare.idf["unique"],
        bm25Rare.idf["words"],
        "Term in 1 doc should have higher IDF than term in 2 docs"
    );

    // ========================================================================
    // Test Group 6: Term Frequency Calculation
    // ========================================================================
    console.log('\n--- Test Group 6: Term Frequency Calculation ---\n');

    const tfDocs = ["cat cat cat", "dog dog", "bird"];
    const bm25TF = new BM25();
    bm25TF.buildIndex(tfDocs);

    const catTokens = bm25TF.tokenize("cat");
    const scoreTF1 = bm25TF.calculateScore(catTokens, bm25TF.tokenizedDocs[0], bm25TF.docLengths[0]);
    const scoreTF2 = bm25TF.calculateScore(catTokens, bm25TF.tokenizedDocs[1], bm25TF.docLengths[1]);

    runner.assertGreaterThan(
        scoreTF1,
        0,
        "Document with term should have positive score"
    );

    runner.assertEqual(
        scoreTF2,
        0,
        "Document without term should have zero score"
    );

    // ========================================================================
    // Test Group 7: BM25 Scoring
    // ========================================================================
    console.log('\n--- Test Group 7: BM25 Scoring ---\n');

    const queryTokens = ["cat", "sat"];
    const doc1Tokens = bm25.tokenizedDocs[0];  // "the cat sat on the mat"
    const doc2Tokens = bm25.tokenizedDocs[1];  // "the dog sat on the log"
    const doc3Tokens = bm25.tokenizedDocs[2];  // "cats and dogs are pets"

    const scoreBM1 = bm25.calculateScore(queryTokens, doc1Tokens, bm25.docLengths[0]);
    const scoreBM2 = bm25.calculateScore(queryTokens, doc2Tokens, bm25.docLengths[1]);
    const scoreBM3 = bm25.calculateScore(queryTokens, doc3Tokens, bm25.docLengths[2]);

    runner.assertGreaterThan(
        scoreBM1,
        0,
        "Doc 1 should have positive score (contains 'cat' and 'sat')"
    );

    runner.assertGreaterThan(
        scoreBM1,
        scoreBM2,
        "Doc 1 should score higher than Doc 2 (has 'cat' and 'sat' vs just 'sat')"
    );

    runner.assertGreaterThan(
        scoreBM2,
        0,
        "Doc 2 should have positive score (contains 'sat')"
    );

    runner.assertEqual(
        scoreBM3,
        0,
        "Doc 3 should have zero score (contains neither 'cat' nor 'sat')"
    );

    // ========================================================================
    // Test Group 8: BM25 Parameter Variations (k1)
    // ========================================================================
    console.log('\n--- Test Group 8: BM25 Parameter Variations (k1) ---\n');

    const paramDocs = ["cat cat cat", "dog"];

    const bm25_k1_low = new BM25(0.5, 0.75);
    bm25_k1_low.buildIndex(paramDocs);
    const score_k1_low = bm25_k1_low.calculateScore(
        ["cat"],
        bm25_k1_low.tokenizedDocs[0],
        bm25_k1_low.docLengths[0]
    );

    const bm25_k1_high = new BM25(3.0, 0.75);
    bm25_k1_high.buildIndex(paramDocs);
    const score_k1_high = bm25_k1_high.calculateScore(
        ["cat"],
        bm25_k1_high.tokenizedDocs[0],
        bm25_k1_high.docLengths[0]
    );

    runner.assertGreaterThan(
        score_k1_high,
        score_k1_low,
        "Higher k1 should give higher scores for repeated terms"
    );

    // ========================================================================
    // Test Group 9: BM25 Parameter Variations (b)
    // ========================================================================
    console.log('\n--- Test Group 9: BM25 Parameter Variations (b) ---\n');

    const bDocs = ["cat", "cat cat cat cat cat cat cat cat cat cat"];

    const bm25_b_zero = new BM25(1.5, 0.0);  // No length normalization
    bm25_b_zero.buildIndex(bDocs);
    const score_b_zero_short = bm25_b_zero.calculateScore(
        ["cat"],
        bm25_b_zero.tokenizedDocs[0],
        bm25_b_zero.docLengths[0]
    );
    const score_b_zero_long = bm25_b_zero.calculateScore(
        ["cat"],
        bm25_b_zero.tokenizedDocs[1],
        bm25_b_zero.docLengths[1]
    );

    const bm25_b_one = new BM25(1.5, 1.0);  // Full length normalization
    bm25_b_one.buildIndex(bDocs);
    const score_b_one_short = bm25_b_one.calculateScore(
        ["cat"],
        bm25_b_one.tokenizedDocs[0],
        bm25_b_one.docLengths[0]
    );
    const score_b_one_long = bm25_b_one.calculateScore(
        ["cat"],
        bm25_b_one.tokenizedDocs[1],
        bm25_b_one.docLengths[1]
    );

    runner.assertGreaterThan(
        score_b_zero_long,
        score_b_zero_short,
        "With b=0, long doc with many occurrences should score higher"
    );

    runner.assert(
        score_b_one_short >= score_b_one_long,
        "With b=1, short doc should score >= long doc due to length penalty",
        `>= ${score_b_one_long}`,
        score_b_one_short
    );

    // ========================================================================
    // Test Group 10: Document Length Normalization
    // ========================================================================
    console.log('\n--- Test Group 10: Document Length Normalization ---\n');

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

    runner.assertGreaterThan(
        shortScore,
        longScore,
        "Shorter document should score higher (BM25 length normalization)"
    );

    // ========================================================================
    // Test Group 11: Search Functionality
    // ========================================================================
    console.log('\n--- Test Group 11: Search Functionality ---\n');

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

    runner.assert(
        searchResults.time !== undefined,
        "Search should return time",
        "defined",
        searchResults.time !== undefined ? "defined" : "undefined"
    );

    runner.assert(
        searchResults.avgScore !== undefined,
        "Search should return avgScore",
        "defined",
        searchResults.avgScore !== undefined ? "defined" : "undefined"
    );

    // ========================================================================
    // Test Group 12: Empty Query Handling
    // ========================================================================
    console.log('\n--- Test Group 12: Empty Query Handling ---\n');

    const emptyResults = bm25.search("", 10);
    runner.assertEqual(
        emptyResults.results.length,
        0,
        "Empty query should return no results"
    );

    runner.assertEqual(
        emptyResults.time,
        0,
        "Empty query should have 0 time"
    );

    runner.assertEqual(
        emptyResults.avgScore,
        0,
        "Empty query should have 0 avgScore"
    );

    const whitespaceResults = bm25.search("   ", 10);
    runner.assertEqual(
        whitespaceResults.results.length,
        0,
        "Whitespace-only query should return no results"
    );

    const punctuationResults = bm25.search("!!!", 10);
    runner.assertEqual(
        punctuationResults.results.length,
        0,
        "Punctuation-only query should return no results"
    );

    // ========================================================================
    // Test Group 13: Top-K Result Limiting
    // ========================================================================
    console.log('\n--- Test Group 13: Top-K Result Limiting ---\n');

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

    const allContainApple = topKResults.results.every(r =>
        r.document.toLowerCase().includes("apple")
    );
    runner.assert(
        allContainApple,
        "All results should contain query term 'apple'",
        true,
        allContainApple
    );

    const topK1Results = bm25Many.search("apple", 1);
    runner.assertEqual(
        topK1Results.results.length,
        1,
        "topK=1 should return only 1 result"
    );

    const topK10Results = bm25Many.search("banana", 10);
    runner.assert(
        topK10Results.results.length <= 10,
        "Should not return more than topK even if topK > num matching docs",
        "<= 10",
        topK10Results.results.length
    );

    // ========================================================================
    // Test Group 14: Score Normalization
    // ========================================================================
    console.log('\n--- Test Group 14: Score Normalization ---\n');

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

        // Scores should be in descending order
        const isSorted = normResults.results.every((r, i, arr) =>
            i === 0 || arr[i - 1].normalizedScore >= r.normalizedScore
        );
        runner.assert(
            isSorted,
            "Normalized scores should be in descending order",
            "sorted descending",
            isSorted ? "sorted" : "not sorted"
        );
    }

    // ========================================================================
    // Test Group 15: Ranking Correctness
    // ========================================================================
    console.log('\n--- Test Group 15: Ranking Correctness ---\n');

    const rankDocs = [
        "cat dog bird",
        "cat cat dog",
        "cat cat cat",
        "dog bird fish"
    ];

    const bm25Rank = new BM25();
    bm25Rank.buildIndex(rankDocs);

    const rankResults = bm25Rank.search("cat", 4);

    runner.assertEqual(
        rankResults.results[0].index,
        2,
        "Document with most 'cat' occurrences should rank first"
    );

    runner.assert(
        rankResults.results[0].score > rankResults.results[1].score,
        "First result should have higher score than second",
        "score[0] > score[1]",
        `${rankResults.results[0].score} > ${rankResults.results[1].score}`
    );

    // Scores should be strictly descending
    const scoresDescending = rankResults.results.every((r, i, arr) =>
        i === 0 || arr[i - 1].score >= r.score
    );
    runner.assert(
        scoresDescending,
        "Results should be sorted by score (descending)",
        "sorted",
        scoresDescending ? "sorted" : "not sorted"
    );

    // ========================================================================
    // Test Group 16: Multi-Term Queries
    // ========================================================================
    console.log('\n--- Test Group 16: Multi-Term Queries ---\n');

    const multiQueryDocs = [
        "machine learning algorithms",
        "deep learning neural networks",
        "machine learning and deep learning",
        "algorithms and data structures"
    ];

    const bm25Multi = new BM25();
    bm25Multi.buildIndex(multiQueryDocs);

    const multiResults = bm25Multi.search("machine learning", 4);

    runner.assert(
        multiResults.results[0].index === 0 || multiResults.results[0].index === 2,
        "Top result should be a document containing both query terms",
        "0 or 2",
        multiResults.results[0].index
    );

    const threeTermResults = bm25Multi.search("machine learning deep", 4);
    runner.assertEqual(
        threeTermResults.results[0].index,
        2,
        "Document with all three terms should rank first"
    );

    const multiResults2 = bm25Multi.search("neural networks deep learning", 4);
    runner.assertEqual(
        multiResults2.results[0].index,
        1,
        "Document with all four terms should rank first"
    );

    // ========================================================================
    // Test Group 17: Single-Term Queries
    // ========================================================================
    console.log('\n--- Test Group 17: Single-Term Queries ---\n');

    const singleResults = bm25Multi.search("algorithms", 4);
    runner.assertGreaterThan(
        singleResults.results.length,
        0,
        "Single-term query should return results"
    );

    runner.assert(
        singleResults.results.every(r => r.document.toLowerCase().includes("algorithms")),
        "All results should contain the single query term",
        true,
        "checked"
    );

    // ========================================================================
    // Test Group 18: Stopword Impact
    // ========================================================================
    console.log('\n--- Test Group 18: Stopword Impact ---\n');

    const stopwordDocs = [
        "the cat is on the mat",
        "cat mat",
        "the dog is on the log"
    ];

    const bm25Stop = new BM25();
    bm25Stop.buildIndex(stopwordDocs);

    const stopResults1 = bm25Stop.search("the cat mat", 3);
    const stopResults2 = bm25Stop.search("cat mat", 3);

    // Both queries should return same top documents
    runner.assert(
        stopResults1.results.length > 0 && stopResults2.results.length > 0,
        "Both queries with/without stopwords should return results",
        true,
        true
    );

    // Document 1 ("cat mat") should rank high for both
    const doc1InTop2_1 = stopResults1.results.slice(0, 2).some(r => r.index === 1);
    const doc1InTop2_2 = stopResults2.results.slice(0, 2).some(r => r.index === 1);
    runner.assert(
        doc1InTop2_1 && doc1InTop2_2,
        "Document with content words (no stopwords) should rank high",
        true,
        `${doc1InTop2_1} && ${doc1InTop2_2}`
    );

    // ========================================================================
    // Test Group 19: Rare vs Common Term Weighting
    // ========================================================================
    console.log('\n--- Test Group 19: Rare vs Common Term Weighting ---\n');

    const weightDocs = [
        "common common common unique",
        "common common common",
        "common common common",
        "common common common"
    ];

    const bm25Weight = new BM25();
    bm25Weight.buildIndex(weightDocs);

    const commonIDF = bm25Weight.idf["common"];
    const uniqueIDF = bm25Weight.idf["unique"];

    runner.assertGreaterThan(
        uniqueIDF,
        commonIDF,
        "Rare term 'unique' should have higher IDF than common term 'common'"
    );

    const rareResults = bm25Weight.search("unique", 4);
    runner.assertEqual(
        rareResults.results[0].index,
        0,
        "Document with rare term should rank first when searching for it"
    );

    // ========================================================================
    // Test Group 20: Edge Case - Empty Corpus
    // ========================================================================
    console.log('\n--- Test Group 20: Edge Case - Empty Corpus ---\n');

    const bm25Empty = new BM25();
    bm25Empty.buildIndex([]);

    const emptyCorpusResults = bm25Empty.search("query", 10);
    runner.assertEqual(
        emptyCorpusResults.results.length,
        0,
        "Search on empty corpus should return no results"
    );

    runner.assert(
        bm25Empty.avgDocLength === 0 || isNaN(bm25Empty.avgDocLength),
        "Average doc length should handle empty corpus (0 or NaN)",
        "0 or NaN",
        bm25Empty.avgDocLength
    );

    // ========================================================================
    // Test Group 21: Edge Case - Single Document
    // ========================================================================
    console.log('\n--- Test Group 21: Edge Case - Single Document ---\n');

    const bm25SingleDoc = new BM25();
    bm25SingleDoc.buildIndex(["hello world"]);

    const singleDocResults = bm25SingleDoc.search("hello", 10);
    runner.assertEqual(
        singleDocResults.results.length,
        1,
        "Single document corpus should return 1 result for matching query"
    );

    runner.assertEqual(
        singleDocResults.results[0].index,
        0,
        "Should return the only document"
    );

    runner.assertEqual(
        bm25SingleDoc.avgDocLength,
        2,
        "Average doc length for single doc corpus should equal doc length"
    );

    // ========================================================================
    // Test Group 22: Edge Case - Identical Documents
    // ========================================================================
    console.log('\n--- Test Group 22: Edge Case - Identical Documents ---\n');

    const identicalDocs = ["same text", "same text", "same text"];
    const bm25Identical = new BM25();
    bm25Identical.buildIndex(identicalDocs);

    const identicalResults = bm25Identical.search("same text", 3);
    runner.assertEqual(
        identicalResults.results.length,
        3,
        "Should return all identical documents"
    );

    // All should have same score
    const firstScore = identicalResults.results[0].score;
    const allSameScore = identicalResults.results.every(r => r.score === firstScore);
    runner.assert(
        allSameScore,
        "Identical documents should have identical scores",
        true,
        allSameScore
    );

    // All should have same normalized score
    const allNormScoreOne = identicalResults.results.every(r => r.normalizedScore === 1.0);
    runner.assert(
        allNormScoreOne,
        "All identical top-scoring documents should have normalized score of 1.0",
        true,
        allNormScoreOne
    );

    // ========================================================================
    // Test Group 23: Edge Case - Very Long Documents
    // ========================================================================
    console.log('\n--- Test Group 23: Edge Case - Very Long Documents ---\n');

    const veryLongDoc = "word " + "filler ".repeat(1000) + "target";
    const shortDocWithTarget = "word target";
    const bm25Long = new BM25();
    bm25Long.buildIndex([veryLongDoc, shortDocWithTarget]);

    const longDocResults = bm25Long.search("target", 2);
    runner.assertGreaterThan(
        longDocResults.results.length,
        0,
        "Should find term in very long document"
    );

    // Short doc should rank higher due to length normalization
    runner.assertEqual(
        longDocResults.results[0].index,
        1,
        "Short document should rank higher than very long document"
    );

    // ========================================================================
    // Test Group 24: Case Insensitivity
    // ========================================================================
    console.log('\n--- Test Group 24: Case Insensitivity ---\n');

    const caseDocs = ["HELLO WORLD", "hello world", "HeLLo WoRLd"];
    const bm25Case = new BM25();
    bm25Case.buildIndex(caseDocs);

    const upperResults = bm25Case.search("HELLO", 3);
    const lowerResults = bm25Case.search("hello", 3);
    const mixedResults = bm25Case.search("HeLLo", 3);

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

    runner.assertEqual(
        mixedResults.results.length,
        lowerResults.results.length,
        "Mixed case query should return same number of results"
    );

    // ========================================================================
    // Test Group 25: Vocabulary Statistics
    // ========================================================================
    console.log('\n--- Test Group 25: Vocabulary Statistics ---\n');

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

    const emptyVocabSize = bm25Empty.getVocabularySize();
    runner.assertEqual(
        emptyVocabSize,
        0,
        "Empty corpus should have vocabulary size of 0"
    );

    // ========================================================================
    // Test Group 26: Top Terms by IDF
    // ========================================================================
    console.log('\n--- Test Group 26: Top Terms by IDF ---\n');

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

    const idfValues = topTerms.map(t => t.idf);
    const isSorted = idfValues.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
    runner.assert(
        isSorted,
        "Top terms should be sorted by IDF (descending)",
        "sorted descending",
        isSorted ? "sorted" : "not sorted"
    );

    const top1Term = bm25.getTopTermsByIDF(1);
    runner.assertEqual(
        top1Term.length,
        1,
        "getTopTermsByIDF(1) should return exactly 1 term"
    );

    const allTerms = bm25.getTopTermsByIDF(100);
    runner.assertEqual(
        allTerms.length,
        vocabSize,
        "Should not return more terms than vocabulary size"
    );

    // ========================================================================
    // Test Group 27: Query Term Highlighting
    // ========================================================================
    console.log('\n--- Test Group 27: Query Term Highlighting ---\n');

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

    const highlightedUpper = bm25.highlightTerms("CAT and MAT", "cat mat");
    runner.assert(
        highlightedUpper.includes('<span class="result-highlight">CAT</span>'),
        "Should preserve case when highlighting",
        "preserves case",
        highlightedUpper.includes('CAT') ? "yes" : "no"
    );

    const noMatchHighlight = bm25.highlightTerms("dog log", "cat mat");
    runner.assertEqual(
        noMatchHighlight,
        "dog log",
        "Should return original text if no matches"
    );

    const emptyHighlight = bm25.highlightTerms("some text", "");
    runner.assertEqual(
        emptyHighlight,
        "some text",
        "Should handle empty query in highlighting"
    );

    // ========================================================================
    // Test Group 28: Score Comparison and Ordering
    // ========================================================================
    console.log('\n--- Test Group 28: Score Comparison and Ordering ---\n');

    const scoreDocs = [
        "cat",
        "cat cat",
        "cat cat cat",
        "dog dog dog"
    ];

    const bm25Score = new BM25();
    bm25Score.buildIndex(scoreDocs);

    const scoreResults = bm25Score.search("cat", 4);

    runner.assertEqual(
        scoreResults.results[0].index,
        2,
        "Document with most occurrences should rank first"
    );

    runner.assertEqual(
        scoreResults.results[1].index,
        1,
        "Document with second most occurrences should rank second"
    );

    runner.assertEqual(
        scoreResults.results[2].index,
        0,
        "Document with least occurrences should rank third"
    );

    runner.assertEqual(
        scoreResults.results.length,
        3,
        "Should not return non-matching document"
    );

    // Check scores are strictly decreasing
    for (let i = 1; i < scoreResults.results.length; i++) {
        runner.assertGreaterThan(
            scoreResults.results[i - 1].score,
            scoreResults.results[i].score,
            `Score at position ${i - 1} should be greater than score at position ${i}`
        );
    }

    // ========================================================================
    // Test Group 29: Tie-Breaking in Scores
    // ========================================================================
    console.log('\n--- Test Group 29: Tie-Breaking in Scores ---\n');

    const tieDocs = [
        "apple banana",
        "apple banana",
        "apple banana"
    ];

    const bm25Tie = new BM25();
    bm25Tie.buildIndex(tieDocs);

    const tieResults = bm25Tie.search("apple banana", 3);

    runner.assertEqual(
        tieResults.results.length,
        3,
        "Should return all tied documents"
    );

    // All should have the same score
    const tieScore = tieResults.results[0].score;
    runner.assert(
        tieResults.results.every(r => r.score === tieScore),
        "All identical documents should have identical scores",
        "all same score",
        "checked"
    );

    // ========================================================================
    // Test Group 30: Query Processing Edge Cases
    // ========================================================================
    console.log('\n--- Test Group 30: Query Processing Edge Cases ---\n');

    const specialResults = bm25.search("!@#$%^&*()", 10);
    runner.assertEqual(
        specialResults.results.length,
        0,
        "Query with only special characters should return no results"
    );

    const numberResults = bm25Many.search("123", 10);
    runner.assert(
        numberResults.results.length >= 0,
        "Query with numbers should not error",
        ">= 0",
        numberResults.results.length
    );

    const longQuery = "word ".repeat(100);
    const longQueryResults = bm25.search(longQuery, 10);
    runner.assert(
        longQueryResults.results !== undefined,
        "Very long query should not error",
        "defined",
        "defined"
    );

    // ========================================================================
    // Test Group 31: Search Result Properties
    // ========================================================================
    console.log('\n--- Test Group 31: Search Result Properties ---\n');

    const propResults = bm25.search("cat", 10);

    if (propResults.results.length > 0) {
        const result = propResults.results[0];

        runner.assert(
            result.hasOwnProperty('index'),
            "Result should have 'index' property",
            "has index",
            "checked"
        );

        runner.assert(
            result.hasOwnProperty('score'),
            "Result should have 'score' property",
            "has score",
            "checked"
        );

        runner.assert(
            result.hasOwnProperty('document'),
            "Result should have 'document' property",
            "has document",
            "checked"
        );

        runner.assert(
            result.hasOwnProperty('normalizedScore'),
            "Result should have 'normalizedScore' property",
            "has normalizedScore",
            "checked"
        );

        runner.assert(
            typeof result.index === 'number',
            "Index should be a number",
            "number",
            typeof result.index
        );

        runner.assert(
            typeof result.score === 'number',
            "Score should be a number",
            "number",
            typeof result.score
        );

        runner.assert(
            typeof result.document === 'string',
            "Document should be a string",
            "string",
            typeof result.document
        );

        runner.assert(
            typeof result.normalizedScore === 'number',
            "Normalized score should be a number",
            "number",
            typeof result.normalizedScore
        );
    }

    // ========================================================================
    // Test Group 32: Additional Coverage Tests
    // ========================================================================
    console.log('\n--- Test Group 32: Additional Coverage Tests ---\n');

    // Test with document containing only stopwords
    const stopOnlyDocs = ["the and or but", "meaningful content here"];
    const bm25StopOnly = new BM25();
    bm25StopOnly.buildIndex(stopOnlyDocs);

    const meaningfulResults = bm25StopOnly.search("meaningful", 2);
    runner.assertEqual(
        meaningfulResults.results[0].index,
        1,
        "Should find document with meaningful content"
    );

    // Test duplicate terms in query
    const dupQueryResults = bm25.search("cat cat cat", 10);
    runner.assertGreaterThan(
        dupQueryResults.results.length,
        0,
        "Query with duplicate terms should work"
    );

    // Test zero-score filtering
    const noMatchResults = bm25.search("nonexistent", 10);
    runner.assertEqual(
        noMatchResults.results.length,
        0,
        "Query with no matches should return empty results"
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
