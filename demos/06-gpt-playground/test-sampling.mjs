#!/usr/bin/env node
/**
 * Comprehensive test suite for GPT Playground Sampling Strategies (Demo 06)
 * Tests various decoding strategies (greedy, temperature, top-k, top-p)
 * Run with: node test-sampling.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the sampling strategies module
const samplingCode = await readFile(join(__dirname, 'js/sampling-strategies.js'), 'utf-8');

// Convert ES module to eval-able code and make class globally available
const executableCode = samplingCode
    .replace(/export class (\w+)/g, 'globalThis.$1 = class $1')
    .replace(/export default .+;?/g, '');
eval(executableCode);

const SamplingStrategies = globalThis.SamplingStrategies;

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
    console.log('GPT Playground Sampling Strategies Test Suite (Demo 06)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Softmax Function
    console.log('\n--- Test Group 1: Softmax Conversion ---\n');

    const logits1 = [1.0, 2.0, 3.0];
    const probs1 = SamplingStrategies.softmax(logits1);

    // Softmax probabilities should sum to 1
    const sum1 = probs1.reduce((a, b) => a + b, 0);
    runner.assertClose(sum1, 1.0, 0.0001, "Softmax probabilities should sum to 1");

    // All probabilities should be between 0 and 1
    const allValid1 = probs1.every(p => p >= 0 && p <= 1);
    runner.assert(allValid1, "All softmax probabilities should be in [0, 1]", true, allValid1);

    // Larger logits should have higher probabilities
    runner.assert(
        probs1[2] > probs1[1] && probs1[1] > probs1[0],
        "Larger logits should produce larger probabilities",
        "probs[2] > probs[1] > probs[0]",
        `${probs1[2].toFixed(4)} > ${probs1[1].toFixed(4)} > ${probs1[0].toFixed(4)}`
    );

    // Test with uniform logits
    const uniformLogits = [1.0, 1.0, 1.0];
    const uniformProbs = SamplingStrategies.softmax(uniformLogits);
    runner.assertClose(
        uniformProbs[0],
        1/3,
        0.0001,
        "Uniform logits should produce uniform probabilities"
    );

    // Test 2: Temperature Scaling
    console.log('\n--- Test Group 2: Temperature Scaling ---\n');

    const baseLogits = [1.0, 2.0, 3.0, 4.0];

    // Temperature = 1.0 should not change logits
    const temp1 = SamplingStrategies.applyTemperature(baseLogits, 1.0);
    runner.assertEqual(
        JSON.stringify(temp1),
        JSON.stringify(baseLogits),
        "Temperature 1.0 should not modify logits"
    );

    // Temperature > 1.0 should decrease logit differences (flatten distribution)
    const temp2 = SamplingStrategies.applyTemperature(baseLogits, 2.0);
    const probs_temp1 = SamplingStrategies.softmax(baseLogits);
    const probs_temp2 = SamplingStrategies.softmax(temp2);
    const entropy1 = SamplingStrategies.calculateEntropy(probs_temp1);
    const entropy2 = SamplingStrategies.calculateEntropy(probs_temp2);

    runner.assertGreaterThan(
        entropy2,
        entropy1,
        "Higher temperature should increase entropy (flatten distribution)"
    );

    // Temperature < 1.0 should increase logit differences (sharpen distribution)
    const temp0_5 = SamplingStrategies.applyTemperature(baseLogits, 0.5);
    const probs_temp0_5 = SamplingStrategies.softmax(temp0_5);
    const entropy0_5 = SamplingStrategies.calculateEntropy(probs_temp0_5);

    runner.assertLessThan(
        entropy0_5,
        entropy1,
        "Lower temperature should decrease entropy (sharpen distribution)"
    );

    // Test 3: Entropy Calculation
    console.log('\n--- Test Group 3: Entropy Calculation ---\n');

    // Uniform distribution has maximum entropy
    const uniformDist = [0.25, 0.25, 0.25, 0.25];
    const uniformEntropy = SamplingStrategies.calculateEntropy(uniformDist);
    runner.assertClose(
        uniformEntropy,
        2.0,
        0.0001,
        "Uniform distribution over 4 items should have entropy = 2.0"
    );

    // Deterministic distribution has zero entropy
    const deterministicDist = [1.0, 0.0, 0.0, 0.0];
    const zeroEntropy = SamplingStrategies.calculateEntropy(deterministicDist);
    runner.assertClose(
        zeroEntropy,
        0.0,
        0.0001,
        "Deterministic distribution should have entropy ≈ 0"
    );

    // Entropy should be non-negative
    const randomDist = [0.5, 0.3, 0.15, 0.05];
    const randomEntropy = SamplingStrategies.calculateEntropy(randomDist);
    runner.assertGreaterThan(
        randomEntropy,
        0,
        "Entropy should be non-negative"
    );

    // Test 4: Greedy Decoding
    console.log('\n--- Test Group 4: Greedy Decoding ---\n');

    const greedyLogits = [1.0, 3.0, 2.0, 0.5];
    const greedyResult = SamplingStrategies.greedyDecoding(greedyLogits);

    runner.assertEqual(
        greedyResult.tokenId,
        1,
        "Greedy decoding should select token with highest logit (index 1)"
    );

    runner.assert(
        greedyResult.probability > 0,
        "Selected token should have positive probability",
        "> 0",
        greedyResult.probability
    );

    runner.assert(
        greedyResult.hasOwnProperty('entropy'),
        "Greedy result should include entropy",
        "has entropy",
        greedyResult.hasOwnProperty('entropy') ? "present" : "missing"
    );

    // Test 5: Repetition Penalty
    console.log('\n--- Test Group 5: Repetition Penalty ---\n');

    const penaltyLogits = [2.0, 3.0, 4.0, 5.0];
    const generatedTokens = [1, 2]; // Tokens 1 and 2 have been generated

    // No penalty
    const noPenalty = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, generatedTokens, 1.0);
    runner.assertEqual(
        JSON.stringify(noPenalty),
        JSON.stringify(penaltyLogits),
        "Penalty of 1.0 should not modify logits"
    );

    // With penalty
    const withPenalty = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, generatedTokens, 2.0);

    runner.assertLessThan(
        withPenalty[1],
        penaltyLogits[1],
        "Penalty should decrease logit for previously generated token 1"
    );

    runner.assertLessThan(
        withPenalty[2],
        penaltyLogits[2],
        "Penalty should decrease logit for previously generated token 2"
    );

    runner.assertEqual(
        withPenalty[0],
        penaltyLogits[0],
        "Penalty should not affect token 0 (not generated)"
    );

    runner.assertEqual(
        withPenalty[3],
        penaltyLogits[3],
        "Penalty should not affect token 3 (not generated)"
    );

    // Test 6: Top-K Sampling
    console.log('\n--- Test Group 6: Top-K Sampling ---\n');

    const topKLogits = Array.from({ length: 100 }, (_, i) => Math.random() * 10);
    const topKResult = SamplingStrategies.topKSampling(topKLogits, { topK: 10, temperature: 1.0 });

    runner.assert(
        topKResult.tokenId >= 0 && topKResult.tokenId < 100,
        "Top-K should select valid token index",
        "0-99",
        topKResult.tokenId
    );

    runner.assertBetween(
        topKResult.probability,
        0,
        1,
        "Top-K probability should be in [0, 1]"
    );

    // Test 7: Top-P (Nucleus) Sampling
    console.log('\n--- Test Group 7: Top-P (Nucleus) Sampling ---\n');

    const topPLogits = [5.0, 4.0, 3.0, 2.0, 1.0, 0.5, 0.1];
    const topPResult = SamplingStrategies.topPSampling(topPLogits, { topP: 0.9, temperature: 1.0 });

    runner.assert(
        topPResult.tokenId >= 0 && topPResult.tokenId < topPLogits.length,
        "Top-P should select valid token index",
        `0-${topPLogits.length - 1}`,
        topPResult.tokenId
    );

    runner.assertBetween(
        topPResult.probability,
        0,
        1,
        "Top-P probability should be in [0, 1]"
    );

    // Test with very low topP (should select mostly the top token)
    const topPStrictLogits = [10.0, 1.0, 1.0, 1.0];
    const topPStrict = SamplingStrategies.topPSampling(topPStrictLogits, { topP: 0.5, temperature: 1.0 });
    runner.assert(
        topPStrict.tokenId !== undefined,
        "Top-P with low p should still select a token",
        "defined",
        topPStrict.tokenId
    );

    // Test 8: Temperature Effects on Distribution
    console.log('\n--- Test Group 8: Temperature Effects ---\n');

    const tempLogits = [2.0, 4.0, 6.0];

    // Low temperature (0.1) - very peaked
    const lowTemp = SamplingStrategies.temperatureSampling(tempLogits, { temperature: 0.1 });
    runner.assert(
        lowTemp.entropy !== undefined,
        "Low temperature sampling should compute entropy",
        "defined",
        lowTemp.entropy !== undefined ? "defined" : "undefined"
    );

    // High temperature (2.0) - very flat
    const highTemp = SamplingStrategies.temperatureSampling(tempLogits, { temperature: 2.0 });
    runner.assert(
        highTemp.entropy !== undefined,
        "High temperature sampling should compute entropy",
        "defined",
        highTemp.entropy !== undefined ? "defined" : "undefined"
    );

    // Test 9: Edge Cases
    console.log('\n--- Test Group 9: Edge Cases ---\n');

    // Single token
    const singleLogit = [5.0];
    const singleProb = SamplingStrategies.softmax(singleLogit);
    runner.assertClose(
        singleProb[0],
        1.0,
        0.0001,
        "Single logit should produce probability 1.0"
    );

    // Very large logits (numerical stability)
    const largeLogits = [100, 200, 300];
    const largeProbs = SamplingStrategies.softmax(largeLogits);
    const largeSum = largeProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(
        largeSum,
        1.0,
        0.0001,
        "Softmax should handle large logits without overflow"
    );

    // Very small logits
    const smallLogits = [-100, -200, -300];
    const smallProbs = SamplingStrategies.softmax(smallLogits);
    const smallSum = smallProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(
        smallSum,
        1.0,
        0.0001,
        "Softmax should handle small logits without underflow"
    );

    // Test 10: Combined Sampling
    console.log('\n--- Test Group 10: Combined Sampling (Top-K + Top-P + Temp) ---\n');

    const combinedLogits = Array.from({ length: 50 }, (_, i) => 10 - i * 0.2);
    const combinedResult = SamplingStrategies.combinedSampling(combinedLogits, {
        topK: 20,
        topP: 0.9,
        temperature: 0.8
    });

    runner.assert(
        combinedResult.tokenId >= 0 && combinedResult.tokenId < 50,
        "Combined sampling should select valid token",
        "0-49",
        combinedResult.tokenId
    );

    runner.assertBetween(
        combinedResult.probability,
        0,
        1,
        "Combined sampling probability should be in [0, 1]"
    );

    runner.assert(
        combinedResult.hasOwnProperty('entropy'),
        "Combined sampling should compute entropy",
        "has entropy",
        combinedResult.hasOwnProperty('entropy') ? "present" : "missing"
    );

    // Test 11: Probability Distribution Properties
    console.log('\n--- Test Group 11: Probability Distribution Properties ---\n');

    const testLogits = [1.5, 2.5, 3.5, 4.5];
    const testProbs = SamplingStrategies.softmax(testLogits);

    // All probabilities non-negative
    const allNonNeg = testProbs.every(p => p >= 0);
    runner.assert(
        allNonNeg,
        "All probabilities should be non-negative",
        "all >= 0",
        allNonNeg ? "all >= 0" : "some < 0"
    );

    // Sum equals 1
    const probSum = testProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(
        probSum,
        1.0,
        0.0001,
        "Probabilities should sum to 1.0"
    );

    // Monotonic relationship with logits
    runner.assert(
        testProbs[0] < testProbs[1] && testProbs[1] < testProbs[2] && testProbs[2] < testProbs[3],
        "Probabilities should maintain logit ordering",
        "monotonic",
        "monotonic"
    );

    // Test 12: Entropy Bounds
    console.log('\n--- Test Group 12: Entropy Bounds ---\n');

    const numTokens = 10;
    const maxEntropy = Math.log2(numTokens);

    // Random distributions should have entropy <= log2(n)
    for (let trial = 0; trial < 3; trial++) {
        const randomProbs = Array.from({ length: numTokens }, () => Math.random());
        const sum = randomProbs.reduce((a, b) => a + b, 0);
        const normalized = randomProbs.map(p => p / sum);
        const entropy = SamplingStrategies.calculateEntropy(normalized);

        runner.assertBetween(
            entropy,
            0,
            maxEntropy + 0.01,
            `Random distribution ${trial + 1} entropy should be in [0, log2(${numTokens})]`
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
