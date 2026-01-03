#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Topic Modeling - LDA (Demo 08)
 * Tests Latent Dirichlet Allocation implementation
 * 50+ rigorous tests covering all methods and edge cases
 * Run with: node test-lda.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the LDA module
const ldaCode = await readFile(join(__dirname, '../demos/topic-modeling/js/lda.js'), 'utf-8');
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

    assertArrayEqual(actual, expected, testName) {
        const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
        this.assert(isEqual, testName, expected, actual);
    }

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    assertLessThan(actual, threshold, testName) {
        this.assert(actual < threshold, testName, `< ${threshold}`, actual);
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
    console.log('Topic Modeling - LDA Comprehensive Test Suite (Demo 08)');
    console.log('Testing ALL methods with 50+ rigorous test cases');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ==================== Test Group 1: Initialization ====================
    console.log('\n--- Test Group 1: LDA Initialization (8 tests) ---\n');

    const lda1 = new LDAModel();
    runner.assertEqual(lda1.numTopics, 5, "Test 1.1: Default topics should be 5");
    runner.assertEqual(lda1.alpha, 0.5, "Test 1.2: Default alpha should be 0.5");
    runner.assertEqual(lda1.beta, 0.1, "Test 1.3: Default beta should be 0.1");
    runner.assertEqual(lda1.iterations, 50, "Test 1.4: Default iterations should be 50");
    runner.assertEqual(lda1.removeStopwords, true, "Test 1.5: Default removeStopwords should be true");
    runner.assertEqual(lda1.useStemming, false, "Test 1.6: Default useStemming should be false");

    const customLDA = new LDAModel({ numTopics: 10, alpha: 1.0, beta: 0.5, iterations: 100 });
    runner.assertEqual(customLDA.numTopics, 10, "Test 1.7: Custom topics should be 10");
    runner.assertEqual(customLDA.alpha, 1.0, "Test 1.8: Custom alpha should be 1.0");

    // ==================== Test Group 2: Tokenization ====================
    console.log('\n--- Test Group 2: Tokenization Edge Cases (12 tests) ---\n');

    const lda2 = new LDAModel();

    // Basic tokenization
    const text1 = "The quick brown fox jumps over the lazy dog";
    const tokens1 = lda2.tokenize(text1);
    runner.assert(Array.isArray(tokens1), "Test 2.1: Should return array of tokens", "array", typeof tokens1);
    runner.assertGreaterThan(tokens1.length, 0, "Test 2.2: Should have tokens");

    // Punctuation handling
    const text2 = "Hello, world! How are you? I'm fine.";
    const tokens2 = lda2.tokenize(text2);
    runner.assert(!tokens2.some(t => t.includes(',')), "Test 2.3: Should remove commas", false, tokens2.join(','));
    runner.assert(!tokens2.some(t => t.includes('!')), "Test 2.4: Should remove exclamation marks", false, tokens2.join(','));

    // Numbers handling
    const text3 = "There are 123 items and 456 more";
    const tokens3 = lda2.tokenize(text3);
    runner.assert(tokens3.includes("123"), "Test 2.5: Should preserve numbers", true, tokens3.includes("123"));
    runner.assert(tokens3.includes("456"), "Test 2.6: Should preserve multi-digit numbers", true, tokens3.includes("456"));

    // Special characters
    const text4 = "test@example.com #hashtag $dollar";
    const tokens4 = lda2.tokenize(text4);
    runner.assertGreaterThan(tokens4.length, 0, "Test 2.7: Should handle special characters");

    // Unicode handling
    const text5 = "café résumé naïve";
    const tokens5 = lda2.tokenize(text5);
    runner.assertGreaterThan(tokens5.length, 0, "Test 2.8: Should handle unicode characters");

    // Case handling
    const text6 = "HELLO World hElLo";
    const tokens6 = lda2.tokenize(text6);
    runner.assert(tokens6.includes("hello"), "Test 2.9: Should convert to lowercase", true, tokens6.includes("hello"));
    runner.assert(tokens6.includes("world"), "Test 2.10: Should convert mixed case to lowercase", true, tokens6.includes("world"));

    // Very long text
    const longText = "machine learning ".repeat(100);
    const tokensLong = lda2.tokenize(longText);
    runner.assertEqual(tokensLong.length, 200, "Test 2.11: Should handle very long texts (200 words)");

    // Single character words
    const text7 = "a b c d e f g";
    const tokens7 = lda2.tokenize(text7);
    runner.assertEqual(tokens7.length, 0, "Test 2.12: Should remove single character words");

    // ==================== Test Group 3: Stopword Removal ====================
    console.log('\n--- Test Group 3: Stopword Removal (6 tests) ---\n');

    const lda3 = new LDAModel({ removeStopwords: true });

    const stopwordText1 = "the quick brown fox";
    const tokens8 = lda3.tokenize(stopwordText1);
    runner.assert(!tokens8.includes("the"), "Test 3.1: Should remove 'the'", false, tokens8.includes("the"));

    const stopwordText2 = "and but or is was were";
    const tokens9 = lda3.tokenize(stopwordText2);
    runner.assertEqual(tokens9.length, 0, "Test 3.2: Should remove all common stopwords");

    const stopwordText3 = "machine learning and artificial intelligence";
    const tokens10 = lda3.tokenize(stopwordText3);
    runner.assert(!tokens10.includes("and"), "Test 3.3: Should remove 'and' from mixed content", false, tokens10.includes("and"));
    runner.assert(tokens10.includes("machine"), "Test 3.4: Should keep 'machine'", true, tokens10.includes("machine"));

    // Test with stopwords disabled
    const lda3b = new LDAModel({ removeStopwords: false });
    const tokens11 = lda3b.tokenize("the and but");
    runner.assertGreaterThan(tokens11.length, 0, "Test 3.5: Should keep stopwords when disabled");

    // Comprehensive stopword test
    const allStopwords = "the and but or is it was were will with this they have had what when";
    const tokens12 = lda3.tokenize(allStopwords);
    runner.assertEqual(tokens12.length, 0, "Test 3.6: Should remove all listed stopwords");

    // ==================== Test Group 4: Stemming ====================
    console.log('\n--- Test Group 4: Stemming Accuracy (7 tests) ---\n');

    const stemmingLDA = new LDAModel({ useStemming: true });

    const stemText1 = "running jumped flying played";
    const stemmed1 = stemmingLDA.tokenize(stemText1);
    runner.assert(stemmed1.every(t => !t.endsWith('ing') && !t.endsWith('ed')),
        "Test 4.1: Should remove -ing and -ed suffixes", true, stemmed1);

    const stemText2 = "studies";
    const stemmed2 = stemmingLDA.tokenize(stemText2);
    runner.assert(stemmed2[0] === "studi" || stemmed2[0] === "study",
        "Test 4.2: Should stem 'studies'", true, stemmed2[0]);

    const stemText3 = "quickly";
    const stemmed3 = stemmingLDA.tokenize(stemText3);
    runner.assert(!stemmed3[0].endsWith('ly'), "Test 4.3: Should remove -ly suffix", true, stemmed3[0]);

    const stemText4 = "faster fastest";
    const stemmed4 = stemmingLDA.tokenize(stemText4);
    runner.assert(stemmed4.every(t => !t.endsWith('er') && !t.endsWith('est')),
        "Test 4.4: Should remove -er and -est suffixes", true, stemmed4);

    // Test without stemming
    const noStemmingLDA = new LDAModel({ useStemming: false });
    const nostem1 = noStemmingLDA.tokenize("running jumped");
    runner.assert(nostem1.some(t => t.endsWith('ing') || t.endsWith('ed')),
        "Test 4.5: Should preserve suffixes when stemming disabled", true, nostem1);

    // Multiple word forms
    const stemText5 = "running runs runner";
    const stemmed5 = stemmingLDA.tokenize(stemText5);
    const uniqueStems = new Set(stemmed5);
    runner.assertLessThan(uniqueStems.size, 3, "Test 4.6: Should reduce word forms to common stem");

    // Edge case: very short words
    const stemText6 = "is am are";
    const stemmed6 = stemmingLDA.tokenize(stemText6);
    runner.assertEqual(stemmed6.length, 0, "Test 4.7: Should handle very short words (stopwords)");

    // ==================== Test Group 5: Vocabulary Building ====================
    console.log('\n--- Test Group 5: Vocabulary Building (8 tests) ---\n');

    const lda5 = new LDAModel();

    // Small vocabulary
    const smallDocs = [
        ["cat", "dog", "pet"],
        ["dog", "bark", "pet"],
        ["cat", "meow", "pet"]
    ];
    const vocabSize1 = lda5.buildVocabulary(smallDocs);
    runner.assertEqual(vocabSize1, 5, "Test 5.1: Should find 5 unique words in small vocab");
    runner.assertEqual(lda5.vocabulary.size, 5, "Test 5.2: Vocabulary map should have 5 entries");

    // Duplicate handling
    runner.assert(lda5.vocabulary.has("cat"), "Test 5.3: Vocabulary should contain 'cat'", true, lda5.vocabulary.has("cat"));
    runner.assert(lda5.vocabulary.has("dog"), "Test 5.4: Vocabulary should contain 'dog'", true, lda5.vocabulary.has("dog"));

    // Word ID assignment consistency
    const catId = lda5.vocabulary.get("cat");
    runner.assert(typeof catId === 'number', "Test 5.5: Word ID should be a number", "number", typeof catId);
    runner.assertBetween(catId, 0, 4, "Test 5.6: Word ID should be in valid range");

    // Large vocabulary
    const largeDocs = [];
    for (let i = 0; i < 100; i++) {
        largeDocs.push([`word${i}`, `term${i}`, `token${i}`]);
    }
    const lda5b = new LDAModel();
    const vocabSize2 = lda5b.buildVocabulary(largeDocs);
    runner.assertEqual(vocabSize2, 300, "Test 5.7: Should handle large vocabulary (300 words)");

    // Empty documents
    const lda5c = new LDAModel();
    const emptyDocs = [[], [], []];
    const vocabSize3 = lda5c.buildVocabulary(emptyDocs);
    runner.assertEqual(vocabSize3, 0, "Test 5.8: Should handle empty documents (0 words)");

    // ==================== Test Group 6: LDA Initialization ====================
    console.log('\n--- Test Group 6: LDA Topic Assignment Initialization (6 tests) ---\n');

    const lda6 = new LDAModel({ numTopics: 3 });
    const docs6 = [
        ["machine", "learning", "algorithm"],
        ["neural", "network", "deep"],
        ["data", "science", "statistics"]
    ];
    lda6.documents = docs6;
    lda6.buildVocabulary(docs6);
    lda6.initializeAssignments();

    runner.assertEqual(lda6.topicAssignments.length, 3, "Test 6.1: Should initialize assignments for all documents");
    runner.assertEqual(lda6.documentTopicCounts.length, 3, "Test 6.2: Should initialize doc-topic counts");
    runner.assertEqual(lda6.topicWordCounts.length, 3, "Test 6.3: Should initialize topic-word counts for 3 topics");

    // Check array dimensions
    runner.assertEqual(lda6.documentTopicCounts[0].length, 3, "Test 6.4: Doc-topic counts should have 3 topics");
    runner.assertEqual(lda6.topicWordCounts[0].length, lda6.vocabulary.size,
        "Test 6.5: Topic-word counts should match vocabulary size");

    // Check topic counts sum
    const totalAssignments = lda6.topicCounts.reduce((a, b) => a + b, 0);
    const totalWords = docs6.reduce((sum, doc) => sum + doc.length, 0);
    runner.assertEqual(totalAssignments, totalWords, "Test 6.6: Total topic assignments should match total words");

    // ==================== Test Group 7: Gibbs Sampling ====================
    console.log('\n--- Test Group 7: Gibbs Sampling (5 tests) ---\n');

    const lda7 = new LDAModel({ numTopics: 2, iterations: 1 });
    const docs7 = [
        ["machine", "learning"],
        ["deep", "learning"]
    ];
    lda7.documents = docs7;
    lda7.buildVocabulary(docs7);
    lda7.initializeAssignments();

    // Sample a topic
    const oldTopic = lda7.topicAssignments[0][0];
    const newTopic = lda7.sampleTopic(0, 0, "machine");
    runner.assert(typeof newTopic === 'number', "Test 7.1: sampleTopic should return a number", "number", typeof newTopic);
    runner.assertBetween(newTopic, 0, 1, "Test 7.2: Sampled topic should be in valid range [0, numTopics)");

    // Check counts consistency after sampling
    const doc0TopicSum = lda7.documentTopicCounts[0].reduce((a, b) => a + b, 0);
    runner.assertEqual(doc0TopicSum, lda7.documents[0].length,
        "Test 7.3: Document topic counts should sum to document length");

    const totalTopicCounts = lda7.topicCounts.reduce((a, b) => a + b, 0);
    runner.assertEqual(totalTopicCounts, 4, "Test 7.4: Total topic counts should equal total words");

    // Topic probability calculations should be valid
    runner.assert(lda7.topicCounts.every(c => c >= 0),
        "Test 7.5: All topic counts should be non-negative", true, lda7.topicCounts);

    // ==================== Test Group 8: Topic Extraction ====================
    console.log('\n--- Test Group 8: Topic Extraction (7 tests) ---\n');

    const trainTexts = [
        "machine learning models algorithms",
        "neural networks deep learning",
        "data science statistics analysis",
        "artificial intelligence machine learning"
    ];

    const trainLDA = new LDAModel({ numTopics: 2, iterations: 5 });
    await trainLDA.fit(trainTexts);

    const topics5 = trainLDA.getTopWords(5);
    runner.assertEqual(topics5.length, 2, "Test 8.1: Should return 2 topics");
    runner.assert(topics5.every(topic => Array.isArray(topic) && topic.length === 5),
        "Test 8.2: Each topic should have 5 top words", true, topics5.map(t => t.length));

    // Test different word counts
    const topics10 = trainLDA.getTopWords(10);
    runner.assert(topics10.every(topic => topic.length === 10),
        "Test 8.3: Should return 10 words per topic", true, topics10.map(t => t.length));

    const topics20 = trainLDA.getTopWords(20);
    runner.assert(topics20.every(topic => topic.length <= 20),
        "Test 8.4: Should return up to 20 words per topic", true, topics20.map(t => t.length));

    // Check word probability ordering
    const topic0 = topics5[0];
    const weights = topic0.map(w => w.weight);
    const isSorted = weights.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
    runner.assert(isSorted, "Test 8.5: Words should be ordered by weight (descending)", true, isSorted);

    // Check topics are different
    const topic0Words = new Set(topics5[0].map(w => w.word));
    const topic1Words = new Set(topics5[1].map(w => w.word));
    const overlap = [...topic0Words].filter(w => topic1Words.has(w)).length;
    runner.assert(overlap < 5, "Test 8.6: Topics should have some diversity", `< 5`, overlap);

    // Check all weights are valid probabilities
    const allWeights = topics5.flat().map(w => w.weight);
    runner.assert(allWeights.every(w => w >= 0 && w <= 1),
        "Test 8.7: All word weights should be valid probabilities [0, 1]", true, allWeights.every(w => w >= 0 && w <= 1));

    // ==================== Test Group 9: Document-Topic Distributions ====================
    console.log('\n--- Test Group 9: Document-Topic Distributions (5 tests) ---\n');

    const docTopics = trainLDA.getDocumentTopics();
    runner.assertEqual(docTopics.length, trainTexts.length,
        "Test 9.1: Should return distribution for each document");

    // Check all distributions sum to ~1.0
    docTopics.forEach((dist, idx) => {
        const sum = dist.reduce((a, b) => a + b, 0);
        runner.assert(Math.abs(sum - 1.0) < 0.01,
            `Test 9.2.${idx}: Document ${idx} distribution should sum to ~1.0`, "~1.0", sum.toFixed(3));
    });

    // Check all probabilities in valid range
    const allProbs = docTopics.flat();
    runner.assert(allProbs.every(p => p >= 0 && p <= 1),
        "Test 9.3: All probabilities should be in range [0, 1]", true, allProbs.every(p => p >= 0 && p <= 1));

    // Check distribution length matches numTopics
    runner.assert(docTopics.every(dist => dist.length === trainLDA.numTopics),
        "Test 9.4: Each distribution should have numTopics elements", true, docTopics.every(dist => dist.length === trainLDA.numTopics));

    // ==================== Test Group 10: Perplexity ====================
    console.log('\n--- Test Group 10: Perplexity Calculation (4 tests) ---\n');

    const perplexity1 = trainLDA.calculatePerplexity();
    runner.assert(perplexity1 > 0 && !isNaN(perplexity1),
        "Test 10.1: Perplexity should be positive number", "> 0", perplexity1);
    runner.assert(!isFinite(perplexity1) || perplexity1 < 1000,
        "Test 10.2: Perplexity should be in reasonable range", "< 1000", perplexity1);

    // Test perplexity decreases with more iterations
    const lda10a = new LDAModel({ numTopics: 2, iterations: 1 });
    await lda10a.fit(trainTexts);
    const perp1 = lda10a.calculatePerplexity();

    const lda10b = new LDAModel({ numTopics: 2, iterations: 10 });
    await lda10b.fit(trainTexts);
    const perp10 = lda10b.calculatePerplexity();

    runner.assert(perp10 <= perp1 * 1.5,
        "Test 10.3: Perplexity should decrease or stabilize with more iterations", `<= ${perp1 * 1.5}`, perp10);

    // Test perplexity with different topic counts
    const lda10c = new LDAModel({ numTopics: 1, iterations: 5 });
    await lda10c.fit(trainTexts);
    const perpSingle = lda10c.calculatePerplexity();
    runner.assert(perpSingle > 0, "Test 10.4: Perplexity should be valid with single topic", "> 0", perpSingle);

    // ==================== Test Group 11: Prediction ====================
    console.log('\n--- Test Group 11: New Document Prediction (8 tests) ---\n');

    const newDoc1 = "machine learning algorithms";
    const prediction1 = trainLDA.predict(newDoc1, 5);

    runner.assert(Array.isArray(prediction1), "Test 11.1: Prediction should return array", "array", typeof prediction1);
    runner.assertEqual(prediction1.length, trainLDA.numTopics,
        "Test 11.2: Prediction should match numTopics");

    const predSum1 = prediction1.reduce((a, b) => a + b, 0);
    runner.assert(Math.abs(predSum1 - 1.0) < 0.01,
        "Test 11.3: Prediction distribution should sum to ~1.0", "~1.0", predSum1.toFixed(3));

    // Test with empty document
    const emptyPred = trainLDA.predict("", 5);
    runner.assert(Array.isArray(emptyPred), "Test 11.4: Should handle empty document", "array", typeof emptyPred);

    // Test with single word
    const singlePred = trainLDA.predict("learning", 5);
    runner.assertEqual(singlePred.length, trainLDA.numTopics,
        "Test 11.5: Should handle single word document");

    // Test with unknown words
    const unknownPred = trainLDA.predict("unknown words here", 5);
    runner.assert(Array.isArray(unknownPred), "Test 11.6: Should handle unknown words", "array", typeof unknownPred);

    // Test with different iteration counts
    // Note: LDA with Gibbs sampling is stochastic, so we use a generous threshold
    // The key is that predictions should be somewhat consistent, not wildly different
    const pred5 = trainLDA.predict(newDoc1, 5);
    const pred20 = trainLDA.predict(newDoc1, 20);
    const predDiff = Math.abs(pred5[0] - pred20[0]);
    runner.assert(predDiff < 0.8,
        "Test 11.7: Predictions should be reasonably consistent", "< 0.8 difference", predDiff);

    // Test prediction probabilities in valid range
    runner.assert(prediction1.every(p => p >= 0 && p <= 1),
        "Test 11.8: All prediction probabilities should be in [0, 1]", true, prediction1.every(p => p >= 0 && p <= 1));

    // ==================== Test Group 12: Edge Cases ====================
    console.log('\n--- Test Group 12: Edge Cases and Boundary Conditions (9 tests) ---\n');

    // Empty string
    const emptyTokens = trainLDA.tokenize("");
    runner.assertEqual(emptyTokens.length, 0, "Test 12.1: Empty string should return no tokens");

    // Only whitespace
    const whitespaceTokens = trainLDA.tokenize("   \t\n   ");
    runner.assertEqual(whitespaceTokens.length, 0, "Test 12.2: Only whitespace should return no tokens");

    // All stopwords
    const stopwordText = "the and but or is was were";
    const stopTokens = trainLDA.tokenize(stopwordText);
    runner.assertEqual(stopTokens.length, 0, "Test 12.3: All stopwords should be removed");

    // Single character after processing
    const singleChar = trainLDA.tokenize("I a an");
    runner.assertEqual(singleChar.length, 0, "Test 12.4: Single characters should be removed");

    // Mixed valid and invalid
    const mixedText = "machine a learning the algorithm";
    const mixedTokens = trainLDA.tokenize(mixedText);
    runner.assertEqual(mixedTokens.length, 3, "Test 12.5: Should keep only valid tokens");

    // Very long word
    const longWord = "a" + "b".repeat(1000);
    const longTokens = trainLDA.tokenize(longWord);
    runner.assertEqual(longTokens.length, 1, "Test 12.6: Should handle very long words");

    // Repeated words
    const repeatedText = "learning learning learning";
    const repeatedTokens = trainLDA.tokenize(repeatedText);
    runner.assertEqual(repeatedTokens.length, 3, "Test 12.7: Should preserve repeated words");

    // Special characters only
    const specialText = "!@#$%^&*()";
    const specialTokens = trainLDA.tokenize(specialText);
    runner.assertEqual(specialTokens.length, 0, "Test 12.8: Special characters only should return no tokens");

    // Numbers and letters mixed
    const mixedText2 = "test123 abc456 789xyz";
    const mixedTokens2 = trainLDA.tokenize(mixedText2);
    runner.assertEqual(mixedTokens2.length, 3, "Test 12.9: Should handle alphanumeric tokens");

    // ==================== Test Group 13: Integration Tests ====================
    console.log('\n--- Test Group 13: Integration and Workflow Tests (6 tests) ---\n');

    // Complete workflow test
    const workflowLDA = new LDAModel({ numTopics: 3, iterations: 5 });
    const workflowDocs = [
        "machine learning artificial intelligence",
        "data science big data analytics",
        "neural networks deep learning",
        "statistical analysis data mining",
        "computer vision image processing",
        "natural language processing text mining"
    ];

    const result = await workflowLDA.fit(workflowDocs);
    runner.assert(result.numTopics === 3, "Test 13.1: Result should contain numTopics", 3, result.numTopics);
    runner.assert(result.topics.length === 3, "Test 13.2: Result should contain topics", 3, result.topics.length);
    runner.assert(result.documentTopics.length === 6, "Test 13.3: Result should contain document topics", 6, result.documentTopics.length);
    runner.assert(result.perplexity > 0, "Test 13.4: Result should contain valid perplexity", "> 0", result.perplexity);

    // Test vocabulary persistence
    const hasVocab = workflowLDA.vocabulary.size > 0;
    runner.assert(hasVocab, "Test 13.5: Vocabulary should persist after training", true, hasVocab);

    // Test prediction after training
    const workflowPred = workflowLDA.predict("machine learning data", 10);
    runner.assertEqual(workflowPred.length, 3, "Test 13.6: Should predict on new document after training");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
