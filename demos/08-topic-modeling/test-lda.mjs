#!/usr/bin/env node
/**
 * Comprehensive test suite for Topic Modeling - LDA (Demo 08)
 * Tests Latent Dirichlet Allocation implementation
 * Run with: node test-lda.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the LDA module
const ldaCode = await readFile(join(__dirname, 'js/lda.js'), 'utf-8');
const executableCode = ldaCode
    .replace(/export class (\w+)/g, 'globalThis.$1 = class $1')
    .replace(/export default .+;?/g, '');
eval(executableCode);

const LDAModel = globalThis.LDAModel;

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

    assertBetween(actual, min, max, testName) {
        this.assert(
            actual >= min && actual <= max,
            testName,
            `between ${min} and ${max}`,
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
    console.log('Topic Modeling - LDA Test Suite (Demo 08)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Initialization
    console.log('\n--- Test Group 1: LDA Initialization ---\n');

    const lda = new LDAModel();
    runner.assertEqual(lda.numTopics, 5, "Default topics should be 5");
    runner.assertEqual(lda.alpha, 0.5, "Default alpha should be 0.5");
    runner.assertEqual(lda.beta, 0.1, "Default beta should be 0.1");

    const customLDA = new LDAModel({ numTopics: 10, alpha: 1.0, beta: 0.5 });
    runner.assertEqual(customLDA.numTopics, 10, "Custom topics should be set");
    runner.assertEqual(customLDA.alpha, 1.0, "Custom alpha should be set");

    // Test 2: Tokenization
    console.log('\n--- Test Group 2: Tokenization ---\n');

    const text1 = "The quick brown fox jumps over the lazy dog";
    const tokens1 = lda.tokenize(text1);
    runner.assert(
        Array.isArray(tokens1),
        "Should return array of tokens",
        "array",
        typeof tokens1
    );
    runner.assertGreaterThan(tokens1.length, 0, "Should have tokens");

    // Test stopword removal
    const hasThe = tokens1.includes("the");
    runner.assert(
        !hasThe,
        "Should remove stopwords like 'the'",
        false,
        hasThe
    );

    // Test minimum length
    const allLongEnough = tokens1.every(t => t.length > 2);
    runner.assert(
        allLongEnough,
        "All tokens should be > 2 characters",
        true,
        allLongEnough
    );

    // Test 3: Stemming
    console.log('\n--- Test Group 3: Stemming ---\n');

    const stemmingLDA = new LDAModel({ useStemming: true });
    const stemText = "running jumped flying played";
    const stemmed = stemmingLDA.tokenize(stemText);

    runner.assert(
        stemmed.every(t => !t.endsWith('ing') && !t.endsWith('ed')),
        "Should remove common suffixes",
        true,
        stemmed
    );

    // Test 4: Vocabulary Building
    console.log('\n--- Test Group 4: Vocabulary Building ---\n');

    const docs = [
        ["cat", "dog", "pet"],
        ["dog", "bark", "pet"],
        ["cat", "meow", "pet"]
    ];

    const vocabSize = lda.buildVocabulary(docs);
    runner.assertEqual(vocabSize, 5, "Should find 5 unique words");
    runner.assertEqual(lda.vocabulary.size, 5, "Vocabulary map should have 5 entries");

    runner.assert(
        lda.vocabulary.has("cat"),
        "Vocabulary should contain 'cat'",
        true,
        lda.vocabulary.has("cat")
    );

    // Test 5: Fit and Train
    console.log('\n--- Test Group 5: Training ---\n');

    const trainTexts = [
        "machine learning models",
        "neural networks deep learning",
        "data science statistics",
        "artificial intelligence algorithms"
    ];

    const trainLDA = new LDAModel({ numTopics: 2, iterations: 5 });
    trainLDA.fit(trainTexts);

    runner.assert(
        trainLDA.documents.length === trainTexts.length,
        "Should process all documents",
        trainTexts.length,
        trainLDA.documents.length
    );

    runner.assertGreaterThan(
        trainLDA.vocabulary.size,
        0,
        "Should build vocabulary"
    );

    // Test 6: Topic Extraction
    console.log('\n--- Test Group 6: Topic Extraction ---\n');

    const topics = trainLDA.getTopWords(3);
    runner.assertEqual(
        topics.length,
        2,
        "Should return topics equal to numTopics"
    );

    runner.assert(
        topics.every(topic => Array.isArray(topic) && topic.length === 3),
        "Each topic should have 3 top words",
        "all have 3 words",
        topics
    );

    // Test 7: Document-Topic Distribution
    console.log('\n--- Test Group 7: Document-Topic Distribution ---\n');

    const docTopics = trainLDA.getDocumentTopics();
    runner.assertEqual(
        docTopics.length,
        trainTexts.length,
        "Should return distribution for each document"
    );

    docTopics.forEach((dist, idx) => {
        const sum = dist.reduce((a, b) => a + b, 0);
        runner.assert(
            Math.abs(sum - 1.0) < 0.01,
            `Document ${idx} topic distribution should sum to ~1.0`,
            "~1.0",
            sum.toFixed(3)
        );
    });

    // Test 8: Perplexity
    console.log('\n--- Test Group 8: Perplexity Calculation ---\n');

    const perplexity = trainLDA.calculatePerplexity();
    runner.assert(
        perplexity > 0 && !isNaN(perplexity),
        "Perplexity should be positive number",
        "> 0",
        perplexity
    );

    // Test 9: Prediction
    console.log('\n--- Test Group 9: New Document Prediction ---\n');

    const newDoc = "machine learning algorithms";
    const prediction = trainLDA.predict(newDoc, 5);

    runner.assert(
        Array.isArray(prediction),
        "Prediction should return array",
        "array",
        typeof prediction
    );

    runner.assertEqual(
        prediction.length,
        2,
        "Prediction should match numTopics"
    );

    const predSum = prediction.reduce((a, b) => a + b, 0);
    runner.assert(
        Math.abs(predSum - 1.0) < 0.01,
        "Prediction distribution should sum to ~1.0",
        "~1.0",
        predSum.toFixed(3)
    );

    // Test 10: Edge Cases
    console.log('\n--- Test Group 10: Edge Cases ---\n');

    // Empty document
    const emptyTokens = lda.tokenize("");
    runner.assertEqual(emptyTokens.length, 0, "Empty text should return no tokens");

    // Single word
    const singleTokens = lda.tokenize("hello");
    runner.assertGreaterThan(singleTokens.length, 0, "Single word should be tokenized");

    // All stopwords
    const stopwordText = "the and but or is";
    const stopwordTokens = lda.tokenize(stopwordText);
    runner.assertEqual(stopwordTokens.length, 0, "All stopwords should be removed");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
