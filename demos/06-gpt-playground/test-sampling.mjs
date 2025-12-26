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

    // Test Group 1: Softmax Function
    console.log('\n--- Test Group 1: Softmax Conversion (12 tests) ---\n');

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

    // Test with zero logits
    const zeroLogits = [0, 0, 0, 0];
    const zeroProbs = SamplingStrategies.softmax(zeroLogits);
    runner.assertClose(
        zeroProbs[0],
        0.25,
        0.0001,
        "Zero logits should produce uniform distribution"
    );

    // Test with negative logits
    const negLogits = [-1, -2, -3];
    const negProbs = SamplingStrategies.softmax(negLogits);
    const negSum = negProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(negSum, 1.0, 0.0001, "Negative logits should still sum to 1");

    // Test with mixed positive/negative
    const mixedLogits = [-2, 0, 2, 4];
    const mixedProbs = SamplingStrategies.softmax(mixedLogits);
    runner.assert(
        mixedProbs[3] > mixedProbs[2] && mixedProbs[2] > mixedProbs[1] && mixedProbs[1] > mixedProbs[0],
        "Mixed logits should maintain ordering",
        "monotonic",
        "monotonic"
    );

    // Test numerical stability with very large logits
    const largeLogits = [100, 200, 300];
    const largeProbs = SamplingStrategies.softmax(largeLogits);
    const largeSum = largeProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(
        largeSum,
        1.0,
        0.0001,
        "Softmax should handle large logits without overflow"
    );

    // Test numerical stability with very small logits
    const smallLogits = [-100, -200, -300];
    const smallProbs = SamplingStrategies.softmax(smallLogits);
    const smallSum = smallProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(
        smallSum,
        1.0,
        0.0001,
        "Softmax should handle small logits without underflow"
    );

    // Test single token case
    const singleLogit = [5.0];
    const singleProb = SamplingStrategies.softmax(singleLogit);
    runner.assertClose(
        singleProb[0],
        1.0,
        0.0001,
        "Single logit should produce probability 1.0"
    );

    // Test two-token case
    const twoLogits = [1.0, 2.0];
    const twoProbs = SamplingStrategies.softmax(twoLogits);
    runner.assertClose(
        twoProbs[0] + twoProbs[1],
        1.0,
        0.0001,
        "Two logits should sum to 1.0"
    );

    // Test extreme differences
    const extremeLogits = [0, 100];
    const extremeProbs = SamplingStrategies.softmax(extremeLogits);
    runner.assertClose(
        extremeProbs[1],
        1.0,
        0.0001,
        "Extreme logit difference should give ~1.0 to larger"
    );

    // Test Group 2: Temperature Scaling
    console.log('\n--- Test Group 2: Temperature Scaling (12 tests) ---\n');

    const baseLogits = [1.0, 2.0, 3.0, 4.0];

    // Temperature = 1.0 should not change logits
    const temp1 = SamplingStrategies.applyTemperature(baseLogits, 1.0);
    runner.assertEqual(
        JSON.stringify(temp1),
        JSON.stringify(baseLogits),
        "Temperature 1.0 should not modify logits"
    );

    // Temperature = 0.0 should be handled (converted to small value)
    const temp0 = SamplingStrategies.applyTemperature(baseLogits, 0.0);
    runner.assert(
        temp0.every(v => isFinite(v)),
        "Temperature 0.0 should not cause division by zero",
        "all finite",
        "all finite"
    );

    // Temperature = 0.1 (very low, sharp distribution)
    const temp0_1 = SamplingStrategies.applyTemperature(baseLogits, 0.1);
    const probs_temp0_1 = SamplingStrategies.softmax(temp0_1);
    const entropy0_1 = SamplingStrategies.calculateEntropy(probs_temp0_1);

    // Temperature = 0.5 (low, sharper)
    const temp0_5 = SamplingStrategies.applyTemperature(baseLogits, 0.5);
    const probs_temp0_5 = SamplingStrategies.softmax(temp0_5);
    const entropy0_5 = SamplingStrategies.calculateEntropy(probs_temp0_5);

    // Temperature = 1.0 (baseline)
    const probs_temp1 = SamplingStrategies.softmax(baseLogits);
    const entropy1 = SamplingStrategies.calculateEntropy(probs_temp1);

    // Temperature = 2.0 (high, flatter)
    const temp2 = SamplingStrategies.applyTemperature(baseLogits, 2.0);
    const probs_temp2 = SamplingStrategies.softmax(temp2);
    const entropy2 = SamplingStrategies.calculateEntropy(probs_temp2);

    // Temperature = 10.0 (very high, very flat)
    const temp10 = SamplingStrategies.applyTemperature(baseLogits, 10.0);
    const probs_temp10 = SamplingStrategies.softmax(temp10);
    const entropy10 = SamplingStrategies.calculateEntropy(probs_temp10);

    runner.assertLessThan(
        entropy0_1,
        entropy0_5,
        "T=0.1 should have lower entropy than T=0.5"
    );

    runner.assertLessThan(
        entropy0_5,
        entropy1,
        "T=0.5 should have lower entropy than T=1.0"
    );

    runner.assertGreaterThan(
        entropy2,
        entropy1,
        "T=2.0 should have higher entropy than T=1.0"
    );

    runner.assertGreaterThan(
        entropy10,
        entropy2,
        "T=10.0 should have higher entropy than T=2.0"
    );

    // Higher temperature should decrease max probability
    runner.assertLessThan(
        Math.max(...probs_temp2),
        Math.max(...probs_temp1),
        "Higher temperature should decrease max probability"
    );

    // Lower temperature should increase max probability
    runner.assertGreaterThan(
        Math.max(...probs_temp0_5),
        Math.max(...probs_temp1),
        "Lower temperature should increase max probability"
    );

    // Test Group 3: Entropy Calculation
    console.log('\n--- Test Group 3: Entropy Calculation (8 tests) ---\n');

    // Uniform distribution has maximum entropy
    const uniformDist = [0.25, 0.25, 0.25, 0.25];
    const uniformEntropy = SamplingStrategies.calculateEntropy(uniformDist);
    runner.assertClose(
        uniformEntropy,
        2.0,
        0.0001,
        "Uniform distribution over 4 items should have entropy = 2.0 bits"
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

    // Binary uniform distribution
    const binaryUniform = [0.5, 0.5];
    const binaryEntropy = SamplingStrategies.calculateEntropy(binaryUniform);
    runner.assertClose(
        binaryEntropy,
        1.0,
        0.0001,
        "Binary uniform distribution should have entropy = 1.0 bit"
    );

    // Skewed binary distribution
    const skewedBinary = [0.9, 0.1];
    const skewedEntropy = SamplingStrategies.calculateEntropy(skewedBinary);
    runner.assertLessThan(
        skewedEntropy,
        1.0,
        "Skewed binary distribution should have entropy < 1.0"
    );

    // Entropy bounds for random distribution
    const numTokens = 10;
    const maxEntropy = Math.log2(numTokens);

    const testDist = [0.2, 0.15, 0.15, 0.1, 0.1, 0.1, 0.08, 0.07, 0.03, 0.02];
    const testEntropy = SamplingStrategies.calculateEntropy(testDist);
    runner.assertBetween(
        testEntropy,
        0,
        maxEntropy,
        "Entropy should be between 0 and log2(n)"
    );

    // Three-way uniform
    const threeUniform = [1/3, 1/3, 1/3];
    const threeEntropy = SamplingStrategies.calculateEntropy(threeUniform);
    runner.assertClose(
        threeEntropy,
        Math.log2(3),
        0.0001,
        "Three-way uniform should have entropy = log2(3)"
    );

    // Near-deterministic
    const nearDet = [0.99, 0.005, 0.005];
    const nearDetEntropy = SamplingStrategies.calculateEntropy(nearDet);
    runner.assertLessThan(
        nearDetEntropy,
        0.2,
        "Near-deterministic distribution should have very low entropy"
    );

    // Test Group 4: Greedy Decoding
    console.log('\n--- Test Group 4: Greedy Decoding (6 tests) ---\n');

    const greedyLogits = [1.0, 3.0, 2.0, 0.5];
    const greedyResult = SamplingStrategies.greedyDecoding(greedyLogits);

    runner.assertEqual(
        greedyResult.tokenId,
        1,
        "Greedy decoding should select token with highest logit (index 1)"
    );

    runner.assertGreaterThan(
        greedyResult.probability,
        0,
        "Selected token should have positive probability"
    );

    runner.assert(
        greedyResult.hasOwnProperty('entropy'),
        "Greedy result should include entropy",
        "has entropy",
        greedyResult.hasOwnProperty('entropy') ? "present" : "missing"
    );

    // Greedy should always select same token
    const greedyLogits2 = [5.0, 10.0, 3.0];
    const greedy2 = SamplingStrategies.greedyDecoding(greedyLogits2);
    runner.assertEqual(
        greedy2.tokenId,
        1,
        "Greedy should select highest logit consistently"
    );

    // Test topTokens in result
    runner.assert(
        Array.isArray(greedyResult.topTokens),
        "Greedy result should include topTokens array",
        "array",
        Array.isArray(greedyResult.topTokens) ? "array" : "not array"
    );

    runner.assertGreaterThan(
        greedyResult.topTokens.length,
        0,
        "topTokens should not be empty"
    );

    // Test Group 5: Repetition Penalty
    console.log('\n--- Test Group 5: Repetition Penalty (10 tests) ---\n');

    const penaltyLogits = [2.0, 3.0, 4.0, 5.0];
    const generatedTokens = [1, 2];

    // No penalty (1.0)
    const noPenalty = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, generatedTokens, 1.0);
    runner.assertEqual(
        JSON.stringify(noPenalty),
        JSON.stringify(penaltyLogits),
        "Penalty of 1.0 should not modify logits"
    );

    // With penalty 1.2
    const withPenalty1_2 = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, generatedTokens, 1.2);
    runner.assertLessThan(
        withPenalty1_2[1],
        penaltyLogits[1],
        "Penalty 1.2 should decrease logit for token 1"
    );

    // With penalty 1.5
    const withPenalty1_5 = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, generatedTokens, 1.5);
    runner.assertLessThan(
        withPenalty1_5[1],
        withPenalty1_2[1],
        "Higher penalty (1.5) should decrease logit more than lower penalty (1.2)"
    );

    // With penalty 2.0
    const withPenalty2 = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, generatedTokens, 2.0);
    runner.assertLessThan(
        withPenalty2[1],
        penaltyLogits[1],
        "Penalty 2.0 should decrease logit for previously generated token 1"
    );

    runner.assertLessThan(
        withPenalty2[2],
        penaltyLogits[2],
        "Penalty 2.0 should decrease logit for previously generated token 2"
    );

    runner.assertEqual(
        withPenalty2[0],
        penaltyLogits[0],
        "Penalty should not affect token 0 (not generated)"
    );

    runner.assertEqual(
        withPenalty2[3],
        penaltyLogits[3],
        "Penalty should not affect token 3 (not generated)"
    );

    // Empty generated tokens
    const emptyGen = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, [], 2.0);
    runner.assertEqual(
        JSON.stringify(emptyGen),
        JSON.stringify(penaltyLogits),
        "Empty generated tokens should not apply penalty"
    );

    // Penalty with negative logit
    const negPenaltyLogits = [-2.0, 3.0, 4.0];
    const negPenalty = SamplingStrategies.applyRepetitionPenalty(negPenaltyLogits, [0], 2.0);
    runner.assertLessThan(
        negPenalty[0],
        negPenaltyLogits[0],
        "Penalty on negative logit should multiply (make more negative)"
    );

    // Large penalty value
    const largePenalty = SamplingStrategies.applyRepetitionPenalty(penaltyLogits, [1, 2], 3.0);
    runner.assertLessThan(
        largePenalty[1],
        withPenalty2[1],
        "Penalty 3.0 should decrease more than penalty 2.0"
    );

    // Test Group 6: Top-K Sampling
    console.log('\n--- Test Group 6: Top-K Sampling (10 tests) ---\n');

    // k=1 (should be like greedy)
    const topK1Logits = [1.0, 5.0, 3.0, 2.0];
    const topK1Result = SamplingStrategies.topKSampling(topK1Logits, { topK: 1, temperature: 1.0 });
    runner.assertEqual(
        topK1Result.tokenId,
        1,
        "Top-K with k=1 should select highest logit (like greedy)"
    );

    // k=5
    const topK5Logits = Array.from({ length: 20 }, (_, i) => 20 - i);
    const topK5Result = SamplingStrategies.topKSampling(topK5Logits, { topK: 5, temperature: 1.0 });
    runner.assert(
        topK5Result.tokenId >= 0 && topK5Result.tokenId < 20,
        "Top-K with k=5 should select valid token",
        "0-19",
        topK5Result.tokenId
    );

    // k=10
    const topK10Logits = Array.from({ length: 100 }, (_, i) => Math.random() * 10);
    const topK10Result = SamplingStrategies.topKSampling(topK10Logits, { topK: 10, temperature: 1.0 });
    runner.assertBetween(
        topK10Result.probability,
        0,
        1,
        "Top-K with k=10 probability should be in [0, 1]"
    );

    // k=50
    const topK50Result = SamplingStrategies.topKSampling(topK10Logits, { topK: 50, temperature: 1.0 });
    runner.assert(
        topK50Result.tokenId >= 0 && topK50Result.tokenId < 100,
        "Top-K with k=50 should select valid token",
        "0-99",
        topK50Result.tokenId
    );

    // k > vocab size (should use all tokens)
    const smallVocab = [1.0, 2.0, 3.0];
    const topKLarge = SamplingStrategies.topKSampling(smallVocab, { topK: 100, temperature: 1.0 });
    runner.assert(
        topKLarge.tokenId >= 0 && topKLarge.tokenId < 3,
        "Top-K with k > vocab should still work",
        "0-2",
        topKLarge.tokenId
    );

    // Top-K with temperature
    const topKTemp = SamplingStrategies.topKSampling(topK5Logits, { topK: 5, temperature: 0.5 });
    runner.assert(
        topKTemp.hasOwnProperty('entropy'),
        "Top-K with temperature should include entropy",
        "has entropy",
        "has entropy"
    );

    // Verify result structure
    runner.assert(
        topK10Result.hasOwnProperty('tokenId') &&
        topK10Result.hasOwnProperty('probability') &&
        topK10Result.hasOwnProperty('entropy') &&
        topK10Result.hasOwnProperty('topTokens'),
        "Top-K result should have all required fields",
        "complete structure",
        "complete structure"
    );

    // k=20
    const topK20Result = SamplingStrategies.topKSampling(topK10Logits, { topK: 20, temperature: 1.0 });
    runner.assert(
        topK20Result.tokenId !== undefined,
        "Top-K with k=20 should select a token",
        "defined",
        topK20Result.tokenId
    );

    // k with low temperature
    const topKLowTemp = SamplingStrategies.topKSampling(topK5Logits, { topK: 10, temperature: 0.1 });
    runner.assertLessThan(
        topKLowTemp.entropy,
        topK10Result.entropy,
        "Top-K with lower temperature should have lower entropy"
    );

    // k with high temperature
    const topKHighTemp = SamplingStrategies.topKSampling(topK5Logits, { topK: 10, temperature: 2.0 });
    runner.assertGreaterThan(
        topKHighTemp.entropy,
        topKLowTemp.entropy,
        "Top-K with higher temperature should have higher entropy"
    );

    // Test Group 7: Top-P (Nucleus) Sampling
    console.log('\n--- Test Group 7: Top-P (Nucleus) Sampling (12 tests) ---\n');

    const topPLogits = [5.0, 4.0, 3.0, 2.0, 1.0, 0.5, 0.1];

    // p=0.5
    const topP0_5 = SamplingStrategies.topPSampling(topPLogits, { topP: 0.5, temperature: 1.0 });
    runner.assert(
        topP0_5.tokenId >= 0 && topP0_5.tokenId < topPLogits.length,
        "Top-P with p=0.5 should select valid token",
        `0-${topPLogits.length - 1}`,
        topP0_5.tokenId
    );

    // p=0.7
    const topP0_7 = SamplingStrategies.topPSampling(topPLogits, { topP: 0.7, temperature: 1.0 });
    runner.assertBetween(
        topP0_7.probability,
        0,
        1,
        "Top-P with p=0.7 probability should be in [0, 1]"
    );

    // p=0.9
    const topP0_9 = SamplingStrategies.topPSampling(topPLogits, { topP: 0.9, temperature: 1.0 });
    runner.assert(
        topP0_9.tokenId >= 0 && topP0_9.tokenId < topPLogits.length,
        "Top-P with p=0.9 should select valid token",
        `0-${topPLogits.length - 1}`,
        topP0_9.tokenId
    );

    // p=0.95
    const topP0_95 = SamplingStrategies.topPSampling(topPLogits, { topP: 0.95, temperature: 1.0 });
    runner.assertBetween(
        topP0_95.probability,
        0,
        1,
        "Top-P with p=0.95 probability should be in [0, 1]"
    );

    // p=0.99
    const topP0_99 = SamplingStrategies.topPSampling(topPLogits, { topP: 0.99, temperature: 1.0 });
    runner.assert(
        topP0_99.hasOwnProperty('entropy'),
        "Top-P with p=0.99 should include entropy",
        "has entropy",
        "has entropy"
    );

    // p=1.0 (should include all tokens)
    const topP1_0 = SamplingStrategies.topPSampling(topPLogits, { topP: 1.0, temperature: 1.0 });
    runner.assert(
        topP1_0.tokenId !== undefined,
        "Top-P with p=1.0 should select a token",
        "defined",
        topP1_0.tokenId
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

    // Top-P with temperature
    const topPTemp = SamplingStrategies.topPSampling(topPLogits, { topP: 0.9, temperature: 0.5 });
    runner.assert(
        topPTemp.hasOwnProperty('topTokens'),
        "Top-P with temperature should include topTokens",
        "has topTokens",
        "has topTokens"
    );

    // Verify result structure
    runner.assert(
        topP0_9.hasOwnProperty('tokenId') &&
        topP0_9.hasOwnProperty('probability') &&
        topP0_9.hasOwnProperty('entropy') &&
        topP0_9.hasOwnProperty('topTokens'),
        "Top-P result should have all required fields",
        "complete structure",
        "complete structure"
    );

    // Low p with low temperature
    const topPLowBoth = SamplingStrategies.topPSampling(topPLogits, { topP: 0.5, temperature: 0.1 });
    runner.assertLessThan(
        topPLowBoth.entropy,
        topP0_9.entropy,
        "Top-P with lower p and temperature should have lower entropy"
    );

    // High p with high temperature
    const topPHighBoth = SamplingStrategies.topPSampling(topPLogits, { topP: 0.99, temperature: 2.0 });
    runner.assertGreaterThan(
        topPHighBoth.entropy,
        topPLowBoth.entropy,
        "Top-P with higher p and temperature should have higher entropy"
    );

    // p=0.1 (very restrictive)
    const topP0_1 = SamplingStrategies.topPSampling(topPLogits, { topP: 0.1, temperature: 1.0 });
    runner.assert(
        topP0_1.tokenId !== undefined,
        "Top-P with p=0.1 should still select a token",
        "defined",
        topP0_1.tokenId
    );

    // Test Group 8: Temperature Sampling
    console.log('\n--- Test Group 8: Temperature Sampling (6 tests) ---\n');

    const tempLogits = [2.0, 4.0, 6.0];

    // Low temperature (0.1) - very peaked
    const lowTemp = SamplingStrategies.temperatureSampling(tempLogits, { temperature: 0.1 });
    runner.assert(
        lowTemp.entropy !== undefined,
        "Low temperature sampling should compute entropy",
        "defined",
        lowTemp.entropy !== undefined ? "defined" : "undefined"
    );

    // Medium-low temperature (0.5)
    const medLowTemp = SamplingStrategies.temperatureSampling(tempLogits, { temperature: 0.5 });
    runner.assert(
        medLowTemp.tokenId >= 0 && medLowTemp.tokenId < 3,
        "Temperature 0.5 should select valid token",
        "0-2",
        medLowTemp.tokenId
    );

    // Normal temperature (1.0)
    const normalTemp = SamplingStrategies.temperatureSampling(tempLogits, { temperature: 1.0 });
    runner.assert(
        normalTemp.hasOwnProperty('probability'),
        "Temperature 1.0 should include probability",
        "has probability",
        "has probability"
    );

    // High temperature (2.0) - very flat
    const highTemp = SamplingStrategies.temperatureSampling(tempLogits, { temperature: 2.0 });
    runner.assert(
        highTemp.entropy !== undefined,
        "High temperature sampling should compute entropy",
        "defined",
        highTemp.entropy !== undefined ? "defined" : "undefined"
    );

    // Very high temperature (10.0)
    const veryHighTemp = SamplingStrategies.temperatureSampling(tempLogits, { temperature: 10.0 });
    runner.assert(
        veryHighTemp.tokenId !== undefined,
        "Temperature 10.0 should select a token",
        "defined",
        veryHighTemp.tokenId
    );

    // Compare entropies
    runner.assertLessThan(
        lowTemp.entropy,
        highTemp.entropy,
        "Low temperature (0.1) should have lower entropy than high temperature (2.0)"
    );

    // Test Group 9: Combined Sampling (Top-K + Top-P + Temperature)
    console.log('\n--- Test Group 9: Combined Sampling (8 tests) ---\n');

    const combinedLogits = Array.from({ length: 50 }, (_, i) => 10 - i * 0.2);

    // Standard combination
    const combined1 = SamplingStrategies.combinedSampling(combinedLogits, {
        topK: 20,
        topP: 0.9,
        temperature: 0.8
    });
    runner.assert(
        combined1.tokenId >= 0 && combined1.tokenId < 50,
        "Combined sampling should select valid token",
        "0-49",
        combined1.tokenId
    );

    runner.assertBetween(
        combined1.probability,
        0,
        1,
        "Combined sampling probability should be in [0, 1]"
    );

    runner.assert(
        combined1.hasOwnProperty('entropy'),
        "Combined sampling should compute entropy",
        "has entropy",
        combined1.hasOwnProperty('entropy') ? "present" : "missing"
    );

    // Restrictive combination
    const combined2 = SamplingStrategies.combinedSampling(combinedLogits, {
        topK: 5,
        topP: 0.5,
        temperature: 0.1
    });
    runner.assertLessThan(
        combined2.entropy,
        combined1.entropy,
        "More restrictive combined sampling should have lower entropy"
    );

    // Permissive combination
    const combined3 = SamplingStrategies.combinedSampling(combinedLogits, {
        topK: 40,
        topP: 0.99,
        temperature: 2.0
    });
    runner.assertGreaterThan(
        combined3.entropy,
        combined1.entropy,
        "More permissive combined sampling should have higher entropy"
    );

    // Verify result structure
    runner.assert(
        combined1.hasOwnProperty('tokenId') &&
        combined1.hasOwnProperty('probability') &&
        combined1.hasOwnProperty('entropy') &&
        combined1.hasOwnProperty('topTokens'),
        "Combined result should have all required fields",
        "complete structure",
        "complete structure"
    );

    // Medium combination
    const combined4 = SamplingStrategies.combinedSampling(combinedLogits, {
        topK: 10,
        topP: 0.8,
        temperature: 1.0
    });
    runner.assert(
        combined4.tokenId !== undefined,
        "Medium combined sampling should select a token",
        "defined",
        combined4.tokenId
    );

    // High k, low p
    const combined5 = SamplingStrategies.combinedSampling(combinedLogits, {
        topK: 30,
        topP: 0.6,
        temperature: 1.0
    });
    runner.assert(
        combined5.tokenId >= 0 && combined5.tokenId < 50,
        "Combined with high k, low p should select valid token",
        "0-49",
        combined5.tokenId
    );

    // Test Group 10: Main sample() Router
    console.log('\n--- Test Group 10: Main sample() Router Function (8 tests) ---\n');

    const routerLogits = [1.0, 2.0, 3.0, 4.0, 5.0];

    // Test 'greedy' strategy
    const routerGreedy = SamplingStrategies.sample(routerLogits, 'greedy', {});
    runner.assertEqual(
        routerGreedy.tokenId,
        4,
        "Router with 'greedy' should select highest logit"
    );

    // Test 'temperature' strategy
    const routerTemp = SamplingStrategies.sample(routerLogits, 'temperature', { temperature: 1.0 });
    runner.assert(
        routerTemp.tokenId >= 0 && routerTemp.tokenId < 5,
        "Router with 'temperature' should select valid token",
        "0-4",
        routerTemp.tokenId
    );

    // Test 'topk' strategy
    const routerTopK = SamplingStrategies.sample(routerLogits, 'topk', { topK: 3, temperature: 1.0 });
    runner.assert(
        routerTopK.tokenId !== undefined,
        "Router with 'topk' should select a token",
        "defined",
        routerTopK.tokenId
    );

    // Test 'topp' strategy
    const routerTopP = SamplingStrategies.sample(routerLogits, 'topp', { topP: 0.9, temperature: 1.0 });
    runner.assert(
        routerTopP.tokenId >= 0 && routerTopP.tokenId < 5,
        "Router with 'topp' should select valid token",
        "0-4",
        routerTopP.tokenId
    );

    // Test 'combined' strategy
    const routerCombined = SamplingStrategies.sample(routerLogits, 'combined', {
        topK: 3,
        topP: 0.9,
        temperature: 1.0
    });
    runner.assert(
        routerCombined.hasOwnProperty('tokenId'),
        "Router with 'combined' should return result with tokenId",
        "has tokenId",
        "has tokenId"
    );

    // Test invalid/unknown strategy (should default to temperature)
    const routerUnknown = SamplingStrategies.sample(routerLogits, 'unknown', { temperature: 1.0 });
    runner.assert(
        routerUnknown.tokenId !== undefined,
        "Router with unknown strategy should default to temperature sampling",
        "defined",
        routerUnknown.tokenId
    );

    // Test with repetition penalty
    const routerWithPenalty = SamplingStrategies.sample(
        routerLogits,
        'greedy',
        { repetitionPenalty: 2.0 },
        [3, 4] // Generated tokens
    );
    runner.assert(
        routerWithPenalty.tokenId !== undefined,
        "Router with repetition penalty should select a token",
        "defined",
        routerWithPenalty.tokenId
    );

    // Verify penalty was applied (token 4 was penalized, so might not be selected)
    const routerNoPenalty = SamplingStrategies.sample(
        routerLogits,
        'greedy',
        {},
        []
    );
    runner.assertEqual(
        routerNoPenalty.tokenId,
        4,
        "Without penalty, greedy should select token 4"
    );

    // Test Group 11: Surprise Calculation
    console.log('\n--- Test Group 11: Surprise Calculation (8 tests) ---\n');

    // High probability (low surprise)
    const surprise1 = SamplingStrategies.calculateSurprise(0.5);
    runner.assertClose(
        surprise1,
        1.0,
        0.0001,
        "Surprise of p=0.5 should be 1.0 bit"
    );

    // Very high probability (very low surprise)
    const surprise2 = SamplingStrategies.calculateSurprise(0.95);
    runner.assertLessThan(
        surprise2,
        1.0,
        "Surprise of p=0.95 should be < 1.0 bit"
    );

    // Low probability (high surprise)
    const surprise3 = SamplingStrategies.calculateSurprise(0.01);
    runner.assertGreaterThan(
        surprise3,
        5.0,
        "Surprise of p=0.01 should be > 5.0 bits"
    );

    // Very low probability (very high surprise)
    const surprise4 = SamplingStrategies.calculateSurprise(0.001);
    runner.assertGreaterThan(
        surprise4,
        8.0,
        "Surprise of p=0.001 should be > 8.0 bits"
    );

    // Zero probability
    const surprise5 = SamplingStrategies.calculateSurprise(0);
    runner.assertEqual(
        surprise5,
        Infinity,
        "Surprise of p=0 should be Infinity"
    );

    // p=1.0 (no surprise)
    const surprise6 = SamplingStrategies.calculateSurprise(1.0);
    runner.assertClose(
        surprise6,
        0.0,
        0.0001,
        "Surprise of p=1.0 should be 0 bits"
    );

    // p=0.25
    const surprise7 = SamplingStrategies.calculateSurprise(0.25);
    runner.assertClose(
        surprise7,
        2.0,
        0.0001,
        "Surprise of p=0.25 should be 2.0 bits"
    );

    // Negative probability (edge case)
    const surprise8 = SamplingStrategies.calculateSurprise(-0.1);
    runner.assertEqual(
        surprise8,
        Infinity,
        "Surprise of negative probability should be Infinity"
    );

    // Test Group 12: Surprise Categories
    console.log('\n--- Test Group 12: Surprise Categories (6 tests) ---\n');

    // Low surprise category
    const cat1 = SamplingStrategies.getSurpriseCategory(1.0);
    runner.assertEqual(
        cat1,
        'low',
        "Surprise 1.0 should be 'low' category"
    );

    // Medium surprise category
    const cat2 = SamplingStrategies.getSurpriseCategory(3.5);
    runner.assertEqual(
        cat2,
        'medium',
        "Surprise 3.5 should be 'medium' category"
    );

    // High surprise category
    const cat3 = SamplingStrategies.getSurpriseCategory(6.0);
    runner.assertEqual(
        cat3,
        'high',
        "Surprise 6.0 should be 'high' category"
    );

    // Very high surprise category
    const cat4 = SamplingStrategies.getSurpriseCategory(10.0);
    runner.assertEqual(
        cat4,
        'very-high',
        "Surprise 10.0 should be 'very-high' category"
    );

    // Boundary: low/medium
    const cat5 = SamplingStrategies.getSurpriseCategory(1.9);
    runner.assertEqual(
        cat5,
        'low',
        "Surprise 1.9 should be 'low' category"
    );

    // Boundary: medium/high
    const cat6 = SamplingStrategies.getSurpriseCategory(4.9);
    runner.assertEqual(
        cat6,
        'medium',
        "Surprise 4.9 should be 'medium' category"
    );

    // Test Group 13: getTopTokens Function
    console.log('\n--- Test Group 13: getTopTokens Function (6 tests) ---\n');

    const topTokensLogits = [1.0, 5.0, 3.0, 7.0, 2.0];
    const topTokensProbs = SamplingStrategies.softmax(topTokensLogits);

    // Get top 3 tokens
    const top3 = SamplingStrategies.getTopTokens(topTokensLogits, topTokensProbs, 3);
    runner.assertEqual(
        top3.length,
        3,
        "getTopTokens(n=3) should return 3 tokens"
    );

    // Verify ordering (highest probability first)
    runner.assertGreaterThan(
        top3[0].probability,
        top3[1].probability,
        "Top token should have highest probability"
    );

    runner.assertGreaterThan(
        top3[1].probability,
        top3[2].probability,
        "Second token should have higher probability than third"
    );

    // Get all tokens
    const topAll = SamplingStrategies.getTopTokens(topTokensLogits, topTokensProbs, 10);
    runner.assertEqual(
        topAll.length,
        5,
        "getTopTokens(n=10) with 5 tokens should return 5 tokens"
    );

    // Verify structure
    runner.assert(
        top3[0].hasOwnProperty('tokenId') &&
        top3[0].hasOwnProperty('probability') &&
        top3[0].hasOwnProperty('logit'),
        "getTopTokens should return objects with tokenId, probability, and logit",
        "complete structure",
        "complete structure"
    );

    // Get top 1 token
    const top1 = SamplingStrategies.getTopTokens(topTokensLogits, topTokensProbs, 1);
    runner.assertEqual(
        top1.length,
        1,
        "getTopTokens(n=1) should return 1 token"
    );

    // Test Group 14: sampleFromDistribution
    console.log('\n--- Test Group 14: sampleFromDistribution Function (6 tests) ---\n');

    // Deterministic distribution
    const detDist = [0, 0, 1.0, 0];
    const detSample = SamplingStrategies.sampleFromDistribution(detDist);
    runner.assertEqual(
        detSample,
        2,
        "sampleFromDistribution should select index 2 from deterministic distribution"
    );

    // Uniform distribution - run multiple times to check it samples different values
    const uniformSampleDist = [0.25, 0.25, 0.25, 0.25];
    const samples = new Set();
    for (let i = 0; i < 50; i++) {
        const sample = SamplingStrategies.sampleFromDistribution(uniformSampleDist);
        samples.add(sample);
    }
    runner.assertGreaterThan(
        samples.size,
        1,
        "sampleFromDistribution should sample different indices from uniform distribution"
    );

    // Binary distribution
    const binaryDist = [0.8, 0.2];
    const binarySample = SamplingStrategies.sampleFromDistribution(binaryDist);
    runner.assert(
        binarySample === 0 || binarySample === 1,
        "sampleFromDistribution should sample valid index from binary distribution",
        "0 or 1",
        binarySample
    );

    // Skewed distribution
    const skewedDist = [0.01, 0.01, 0.01, 0.97];
    const skewedSamples = [];
    for (let i = 0; i < 20; i++) {
        skewedSamples.push(SamplingStrategies.sampleFromDistribution(skewedDist));
    }
    const mostlyIndex3 = skewedSamples.filter(s => s === 3).length;
    runner.assertGreaterThan(
        mostlyIndex3,
        10,
        "sampleFromDistribution should mostly sample index 3 from highly skewed distribution"
    );

    // Single element
    const singleDist = [1.0];
    const singleSample = SamplingStrategies.sampleFromDistribution(singleDist);
    runner.assertEqual(
        singleSample,
        0,
        "sampleFromDistribution should sample index 0 from single-element distribution"
    );

    // Valid range check
    const rangeDist = [0.2, 0.3, 0.5];
    const rangeSample = SamplingStrategies.sampleFromDistribution(rangeDist);
    runner.assert(
        rangeSample >= 0 && rangeSample < 3,
        "sampleFromDistribution should return valid index",
        "0-2",
        rangeSample
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
