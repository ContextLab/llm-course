#!/usr/bin/env node
/**
 * Test suite for Attention Mechanisms (Demo 04)
 * Run with: node test-attention.mjs
 *
 * Comprehensive test coverage for:
 * - Softmax function
 * - Attention weight computation
 * - Attention statistics and analysis
 * - Normalization and scaling
 * - Edge cases and numerical stability
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

    assertClose(actual, expected, tolerance, testName) {
        const diff = Math.abs(actual - expected);
        this.assert(
            diff <= tolerance,
            testName,
            `${expected} ± ${tolerance}`,
            actual
        );
    }

    assertArrayClose(actual, expected, tolerance, testName) {
        if (actual.length !== expected.length) {
            this.assert(false, testName, expected, actual);
            return;
        }
        const allClose = actual.every((val, i) => Math.abs(val - expected[i]) <= tolerance);
        this.assert(allClose, testName, expected, actual);
    }

    assertTrue(condition, testName) {
        this.assert(condition, testName, true, condition);
    }

    assertFalse(condition, testName) {
        this.assert(!condition, testName, false, condition);
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// ============================================================================
// Attention Mechanism Functions
// ============================================================================

function softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
}

function computeAttentionWeights(query, keys) {
    const scores = keys.map(key => {
        return query.reduce((sum, q, i) => sum + q * key[i], 0);
    });
    return softmax(scores);
}

function scaledDotProductAttention(query, keys, values, scale = null) {
    const d_k = query.length;
    const scaleValue = scale || Math.sqrt(d_k);

    const scores = keys.map(key => {
        const dotProduct = query.reduce((sum, q, i) => sum + q * key[i], 0);
        return dotProduct / scaleValue;
    });

    const weights = softmax(scores);

    // Compute weighted sum of values
    const output = Array(values[0].length).fill(0);
    weights.forEach((weight, i) => {
        values[i].forEach((val, j) => {
            output[j] += weight * val;
        });
    });

    return { output, weights };
}

function getAverageAttention(layerAttention) {
    const numHeads = layerAttention.length;
    const seqLen = layerAttention[0].length;

    const avgMatrix = Array(seqLen).fill(null).map(() => Array(seqLen).fill(0));

    for (let head = 0; head < numHeads; head++) {
        for (let query = 0; query < seqLen; query++) {
            for (let key = 0; key < seqLen; key++) {
                avgMatrix[query][key] += layerAttention[head][query][key];
            }
        }
    }

    // Divide by number of heads
    for (let query = 0; query < seqLen; query++) {
        for (let key = 0; key < seqLen; key++) {
            avgMatrix[query][key] /= numHeads;
        }
    }

    return avgMatrix;
}

function getTopAttendedTokens(attentionRow, tokens, k = 5) {
    const indexed = attentionRow.map((weight, idx) => ({
        token: tokens[idx],
        index: idx,
        weight: weight
    }));

    indexed.sort((a, b) => b.weight - a.weight);

    return indexed.slice(0, k);
}

function computeStats(attentionMatrix) {
    const flat = attentionMatrix.flat();

    const max = Math.max(...flat);
    const min = Math.min(...flat);
    const mean = flat.reduce((a, b) => a + b, 0) / flat.length;

    const variance = flat.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / flat.length;
    const std = Math.sqrt(variance);

    const seqLen = attentionMatrix.length;
    const columnSums = Array(seqLen).fill(0);

    for (let query = 0; query < seqLen; query++) {
        for (let key = 0; key < seqLen; key++) {
            columnSums[key] += attentionMatrix[query][key];
        }
    }

    const mostAttendedIdx = columnSums.indexOf(Math.max(...columnSums));

    return {
        max,
        min,
        mean,
        std,
        mostAttendedPosition: mostAttendedIdx,
        columnSums
    };
}

function normalizeAttention(attentionMatrix) {
    const flat = attentionMatrix.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    const range = max - min;

    if (range === 0) return attentionMatrix;

    return attentionMatrix.map(row =>
        row.map(val => (val - min) / range)
    );
}

// ============================================================================
// Test Suite
// ============================================================================

async function runTests() {
    console.log('='.repeat(70));
    console.log('Attention Mechanisms Test Suite (Demo 04)');
    console.log('Comprehensive Testing: Softmax, Attention, Edge Cases');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // Test Group 1: Softmax Function - Basic Properties
    // ========================================================================
    console.log('\n--- Test Group 1: Softmax Function - Basic Properties ---\n');

    // Test 1: Softmax output sums to 1
    const logits1 = [1, 2, 3];
    const probs1 = softmax(logits1);
    const sum1 = probs1.reduce((a, b) => a + b, 0);
    runner.assertClose(sum1, 1.0, 0.0001, "Softmax should sum to 1");

    // Test 2: Softmax preserves ordering
    runner.assertTrue(
        probs1[2] > probs1[1] && probs1[1] > probs1[0],
        "Softmax should preserve ordering (3 > 2 > 1)"
    );

    // Test 3: Softmax with uniform inputs
    const uniformLogits = [1, 1, 1, 1];
    const uniformProbs = softmax(uniformLogits);
    uniformProbs.forEach((prob, i) => {
        runner.assertClose(prob, 0.25, 0.0001, `Uniform softmax [${i}] should be 0.25`);
    });

    // Test 4: Softmax sum is always 1 (different inputs)
    const logits2 = [0.5, 1.5, 2.5, 3.5];
    const probs2 = softmax(logits2);
    const sum2 = probs2.reduce((a, b) => a + b, 0);
    runner.assertClose(sum2, 1.0, 0.0001, "Softmax sum to 1 (test 2)");

    // Test 5: All softmax outputs are positive
    runner.assertTrue(
        probs2.every(p => p > 0),
        "All softmax outputs should be positive"
    );

    // Test 6: All softmax outputs are less than 1
    runner.assertTrue(
        probs2.every(p => p < 1),
        "All softmax outputs should be less than 1"
    );

    // ========================================================================
    // Test Group 2: Softmax Function - Edge Cases
    // ========================================================================
    console.log('\n--- Test Group 2: Softmax Function - Edge Cases ---\n');

    // Test 7: Softmax with negative numbers
    const negLogits = [-1, -2, -3];
    const negProbs = softmax(negLogits);
    const negSum = negProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(negSum, 1.0, 0.0001, "Softmax with negatives sums to 1");

    // Test 8: Softmax with negative numbers preserves order
    runner.assertTrue(
        negProbs[0] > negProbs[1] && negProbs[1] > negProbs[2],
        "Softmax with negatives preserves ordering (-1 > -2 > -3)"
    );

    // Test 9: Softmax with zeros
    const zeroLogits = [0, 0, 0];
    const zeroProbs = softmax(zeroLogits);
    runner.assertClose(zeroProbs[0], 1/3, 0.0001, "Softmax with zeros should be uniform (1/3)");

    // Test 10: Softmax with single element
    const singleLogit = [5.0];
    const singleProb = softmax(singleLogit);
    runner.assertClose(singleProb[0], 1.0, 0.0001, "Single element softmax should be 1.0");

    // Test 11: Softmax with two elements
    const twoLogits = [0, 0];
    const twoProbs = softmax(twoLogits);
    runner.assertClose(twoProbs[0], 0.5, 0.0001, "Two equal elements should be 0.5 each");

    // Test 12: Softmax with very large numbers (numerical stability)
    const largeLogits = [1000, 1001, 1002];
    const largeProbs = softmax(largeLogits);
    const largeSum = largeProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(largeSum, 1.0, 0.0001, "Softmax with large numbers should sum to 1");

    // Test 13: Softmax with very small numbers
    const smallLogits = [-1000, -1001, -1002];
    const smallProbs = softmax(smallLogits);
    const smallSum = smallProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(smallSum, 1.0, 0.0001, "Softmax with small numbers should sum to 1");

    // Test 14: Softmax with mixed large and small numbers
    const mixedLogits = [-100, 0, 100];
    const mixedProbs = softmax(mixedLogits);
    const mixedSum = mixedProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(mixedSum, 1.0, 0.0001, "Softmax with mixed range should sum to 1");

    // Test 15: Softmax output range check
    runner.assertTrue(
        mixedProbs.every(p => p >= 0 && p <= 1),
        "All softmax outputs in [0, 1] range"
    );

    // ========================================================================
    // Test Group 3: Attention Weights - Basic Functionality
    // ========================================================================
    console.log('\n--- Test Group 3: Attention Weights - Basic Functionality ---\n');

    // Test 16: Basic attention weight calculation
    const query1 = [1, 0];
    const keys1 = [[1, 0], [0, 1], [0.7, 0.7]];
    const weights1 = computeAttentionWeights(query1, keys1);

    runner.assertEqual(weights1.length, 3, "Should compute weight for each key");

    // Test 17: First key should have highest weight (most similar)
    runner.assertTrue(
        weights1[0] > weights1[1],
        "First key should have highest weight (most similar to query)"
    );

    // Test 18: Attention weights sum to 1
    const weightsSum1 = weights1.reduce((a, b) => a + b, 0);
    runner.assertClose(weightsSum1, 1.0, 0.0001, "Attention weights should sum to 1");

    // Test 19: All attention weights are positive
    runner.assertTrue(
        weights1.every(w => w > 0),
        "All attention weights should be positive"
    );

    // Test 20: Orthogonal query and key
    const query2 = [1, 0];
    const keys2 = [[0, 1]]; // Orthogonal to query
    const weights2 = computeAttentionWeights(query2, keys2);
    runner.assertClose(weights2[0], 1.0, 0.0001, "Single key gets weight 1.0");

    // ========================================================================
    // Test Group 4: Attention Weights - Multiple Dimensions
    // ========================================================================
    console.log('\n--- Test Group 4: Attention Weights - Multiple Dimensions ---\n');

    // Test 21: 3D vectors
    const query3d = [1, 0, 0];
    const keys3d = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const weights3d = computeAttentionWeights(query3d, keys3d);

    runner.assertTrue(
        weights3d[0] > weights3d[1] && weights3d[0] > weights3d[2],
        "First 3D key should have highest weight"
    );

    // Test 22: 4D vectors
    const query4d = [1, 1, 0, 0];
    const keys4d = [[1, 1, 0, 0], [1, 0, 1, 0], [0, 0, 0, 1]];
    const weights4d = computeAttentionWeights(query4d, keys4d);

    runner.assertTrue(
        weights4d[0] > weights4d[1] && weights4d[0] > weights4d[2],
        "Exact match in 4D should have highest weight"
    );

    // Test 23: High-dimensional vectors (64D)
    const dim = 64;
    const query64d = Array(dim).fill(0);
    query64d[0] = 1;
    const keys64d = [
        Array(dim).fill(0).map((_, i) => i === 0 ? 1 : 0),
        Array(dim).fill(0).map((_, i) => i === 1 ? 1 : 0),
    ];
    const weights64d = computeAttentionWeights(query64d, keys64d);

    runner.assertTrue(
        weights64d[0] > weights64d[1],
        "64D matching key should have higher weight"
    );

    // Test 24: Attention weights sum to 1 (3D)
    const sum3d = weights3d.reduce((a, b) => a + b, 0);
    runner.assertClose(sum3d, 1.0, 0.0001, "3D attention weights sum to 1");

    // Test 25: Attention weights sum to 1 (4D)
    const sum4d = weights4d.reduce((a, b) => a + b, 0);
    runner.assertClose(sum4d, 1.0, 0.0001, "4D attention weights sum to 1");

    // ========================================================================
    // Test Group 5: Scaled Dot-Product Attention
    // ========================================================================
    console.log('\n--- Test Group 5: Scaled Dot-Product Attention ---\n');

    // Test 26: Basic scaled dot-product attention
    const queryQ = [1, 0];
    const keysK = [[1, 0], [0, 1]];
    const valuesV = [[2, 3], [4, 5]];
    const result1 = scaledDotProductAttention(queryQ, keysK, valuesV);

    runner.assertEqual(result1.output.length, 2, "Output dimension matches value dimension");

    // Test 27: Attention weights sum to 1
    const sdpaWeightsSum = result1.weights.reduce((a, b) => a + b, 0);
    runner.assertClose(sdpaWeightsSum, 1.0, 0.0001, "SDPA weights sum to 1");

    // Test 28: Perfect match gives highest weight
    const queryExact = [1, 0, 0];
    const keysExact = [[1, 0, 0], [0, 1, 0]];
    const valuesExact = [[10, 20, 30], [40, 50, 60]];
    const resultExact = scaledDotProductAttention(queryExact, keysExact, valuesExact);

    runner.assertTrue(
        resultExact.weights[0] > resultExact.weights[1],
        "Exact match should have higher weight in SDPA"
    );

    // Test 29: Custom scaling factor
    const resultScaled = scaledDotProductAttention(queryQ, keysK, valuesV, 2.0);
    runner.assertEqual(resultScaled.output.length, 2, "Custom scale maintains output dimension");

    // Test 30: SDPA with single key-value pair
    const singleResult = scaledDotProductAttention([1, 0], [[1, 0]], [[5, 6]]);
    runner.assertArrayClose(singleResult.output, [5, 6], 0.0001, "Single KV pair returns value");

    // ========================================================================
    // Test Group 6: Multi-Head Attention Averaging
    // ========================================================================
    console.log('\n--- Test Group 6: Multi-Head Attention Averaging ---\n');

    // Test 31: Average of single head
    const singleHead = [
        [[0.5, 0.5], [0.3, 0.7]]
    ];
    const avgSingle = getAverageAttention(singleHead);
    runner.assertArrayClose(avgSingle[0], [0.5, 0.5], 0.0001, "Single head average row 0");

    // Test 32: Average of two identical heads
    const twoHeads = [
        [[0.6, 0.4], [0.2, 0.8]],
        [[0.6, 0.4], [0.2, 0.8]]
    ];
    const avgTwo = getAverageAttention(twoHeads);
    runner.assertArrayClose(avgTwo[0], [0.6, 0.4], 0.0001, "Two identical heads average");

    // Test 33: Average of two different heads
    const diffHeads = [
        [[1.0, 0.0], [0.0, 1.0]],
        [[0.0, 1.0], [1.0, 0.0]]
    ];
    const avgDiff = getAverageAttention(diffHeads);
    runner.assertArrayClose(avgDiff[0], [0.5, 0.5], 0.0001, "Different heads average to 0.5");

    // Test 34: Average of four heads
    const fourHeads = [
        [[0.8, 0.2], [0.3, 0.7]],
        [[0.6, 0.4], [0.5, 0.5]],
        [[0.4, 0.6], [0.7, 0.3]],
        [[0.2, 0.8], [0.1, 0.9]]
    ];
    const avgFour = getAverageAttention(fourHeads);
    const expectedAvg = (0.8 + 0.6 + 0.4 + 0.2) / 4;
    runner.assertClose(avgFour[0][0], expectedAvg, 0.0001, "Four heads average correctly");

    // Test 35: Averaged attention row sums
    const rowSum = avgDiff[0].reduce((a, b) => a + b, 0);
    runner.assertClose(rowSum, 1.0, 0.0001, "Averaged attention row sums to 1");

    // ========================================================================
    // Test Group 7: Top Attended Tokens
    // ========================================================================
    console.log('\n--- Test Group 7: Top Attended Tokens ---\n');

    // Test 36: Get top-3 tokens
    const attentionRow = [0.1, 0.5, 0.2, 0.15, 0.05];
    const tokens = ["the", "cat", "sat", "on", "mat"];
    const top3 = getTopAttendedTokens(attentionRow, tokens, 3);

    runner.assertEqual(top3.length, 3, "Should return top 3 tokens");

    // Test 37: Top token should be "cat" with weight 0.5
    runner.assertEqual(top3[0].token, "cat", "Top token should be 'cat'");
    runner.assertClose(top3[0].weight, 0.5, 0.0001, "Top weight should be 0.5");

    // Test 38: Second top token should be "sat"
    runner.assertEqual(top3[1].token, "sat", "Second token should be 'sat'");

    // Test 39: Top tokens are sorted by weight
    runner.assertTrue(
        top3[0].weight >= top3[1].weight && top3[1].weight >= top3[2].weight,
        "Top tokens should be sorted by weight"
    );

    // Test 40: Get top-1 token
    const top1 = getTopAttendedTokens(attentionRow, tokens, 1);
    runner.assertEqual(top1.length, 1, "Should return top 1 token");
    runner.assertEqual(top1[0].token, "cat", "Top 1 token should be 'cat'");

    // ========================================================================
    // Test Group 8: Attention Statistics
    // ========================================================================
    console.log('\n--- Test Group 8: Attention Statistics ---\n');

    // Test 41: Basic statistics
    const matrix1 = [
        [0.5, 0.3, 0.2],
        [0.2, 0.6, 0.2],
        [0.1, 0.1, 0.8]
    ];
    const stats1 = computeStats(matrix1);

    runner.assertClose(stats1.max, 0.8, 0.0001, "Max attention should be 0.8");

    // Test 42: Min statistic
    runner.assertClose(stats1.min, 0.1, 0.0001, "Min attention should be 0.1");

    // Test 43: Mean calculation
    const expectedMean = (0.5+0.3+0.2+0.2+0.6+0.2+0.1+0.1+0.8) / 9;
    runner.assertClose(stats1.mean, expectedMean, 0.0001, "Mean should be calculated correctly");

    // Test 44: Column sums
    runner.assertEqual(stats1.columnSums.length, 3, "Should have 3 column sums");

    // Test 45: Most attended position
    runner.assertEqual(stats1.mostAttendedPosition, 2, "Position 2 should be most attended");

    // Test 46: Statistics with uniform matrix
    const uniformMatrix = [
        [0.33, 0.33, 0.34],
        [0.33, 0.33, 0.34],
        [0.33, 0.33, 0.34]
    ];
    const statsUniform = computeStats(uniformMatrix);
    runner.assertClose(statsUniform.mean, 0.33, 0.01, "Uniform matrix mean ~0.33");

    // ========================================================================
    // Test Group 9: Attention Normalization
    // ========================================================================
    console.log('\n--- Test Group 9: Attention Normalization ---\n');

    // Test 47: Basic normalization
    const matrixNorm = [
        [0.2, 0.4],
        [0.6, 0.8]
    ];
    const normalized = normalizeAttention(matrixNorm);

    runner.assertClose(normalized[0][0], 0.0, 0.0001, "Min should map to 0");
    runner.assertClose(normalized[1][1], 1.0, 0.0001, "Max should map to 1");

    // Test 48: Normalization preserves shape
    runner.assertEqual(normalized.length, matrixNorm.length, "Normalized matrix same rows");
    runner.assertEqual(normalized[0].length, matrixNorm[0].length, "Normalized matrix same cols");

    // Test 49: Normalization with negative values
    const negMatrix = [
        [-1.0, -0.5],
        [0.0, 0.5]
    ];
    const normNeg = normalizeAttention(negMatrix);
    runner.assertClose(normNeg[0][0], 0.0, 0.0001, "Min negative maps to 0");
    runner.assertClose(normNeg[1][1], 1.0, 0.0001, "Max maps to 1");

    // Test 50: Normalization with uniform values
    const uniformValues = [
        [0.5, 0.5],
        [0.5, 0.5]
    ];
    const normUniform = normalizeAttention(uniformValues);
    runner.assertArrayClose(normUniform[0], [0.5, 0.5], 0.0001, "Uniform values unchanged");

    // ========================================================================
    // Test Group 10: Edge Cases and Robustness
    // ========================================================================
    console.log('\n--- Test Group 10: Edge Cases and Robustness ---\n');

    // Test 51: Very small attention values
    const tinyValues = [0.0001, 0.0002, 0.0003];
    const tinyProbs = softmax(tinyValues);
    const tinySum = tinyProbs.reduce((a, b) => a + b, 0);
    runner.assertClose(tinySum, 1.0, 0.0001, "Tiny values softmax sums to 1");

    // Test 52: Attention with zero query vector
    const zeroQuery = [0, 0, 0];
    const normalKeys = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const zeroWeights = computeAttentionWeights(zeroQuery, normalKeys);
    const zeroSum = zeroWeights.reduce((a, b) => a + b, 0);
    runner.assertClose(zeroSum, 1.0, 0.0001, "Zero query weights sum to 1");

    // Test 53: Attention with zero key vectors
    const normalQuery = [1, 2, 3];
    const zeroKeys = [[0, 0, 0], [0, 0, 0]];
    const zeroKeyWeights = computeAttentionWeights(normalQuery, zeroKeys);
    const zeroKeySum = zeroKeyWeights.reduce((a, b) => a + b, 0);
    runner.assertClose(zeroKeySum, 1.0, 0.0001, "Zero keys weights sum to 1");

    // Test 54: Large number of keys
    const manyKeys = Array(100).fill(null).map((_, i) => [i % 10, (i + 1) % 10]);
    const weightsMany = computeAttentionWeights([1, 0], manyKeys);
    runner.assertEqual(weightsMany.length, 100, "Should handle 100 keys");

    // Test 55: Attention weights positivity with many keys
    runner.assertTrue(
        weightsMany.every(w => w >= 0),
        "All weights non-negative with many keys"
    );

    // Test 56: Very high dimensional query/key (512D like transformers)
    const dim512 = 512;
    const query512 = Array(dim512).fill(0).map((_, i) => Math.random());
    const keys512 = Array(10).fill(null).map(() =>
        Array(dim512).fill(0).map(() => Math.random())
    );
    const weights512 = computeAttentionWeights(query512, keys512);
    const sum512 = weights512.reduce((a, b) => a + b, 0);
    runner.assertClose(sum512, 1.0, 0.001, "512D attention weights sum to 1");

    // Test 57: Scaled dot-product with high dimensions
    const values512 = keys512.map(k => [...k]);
    const result512 = scaledDotProductAttention(query512, keys512, values512);
    runner.assertEqual(result512.output.length, dim512, "512D SDPA maintains dimension");

    // Test 58: Attention with identical keys
    const identicalKeys = [[1, 2], [1, 2], [1, 2]];
    const identicalWeights = computeAttentionWeights([1, 2], identicalKeys);
    identicalWeights.forEach((w, i) => {
        runner.assertClose(w, 1/3, 0.0001, `Identical key ${i} should get equal weight`);
    });

    // Test 59: Multiple identical queries to same keys
    const query_a = [1, 0];
    const query_b = [1, 0];
    const sharedKeys = [[1, 0], [0, 1]];
    const weights_a = computeAttentionWeights(query_a, sharedKeys);
    const weights_b = computeAttentionWeights(query_b, sharedKeys);
    runner.assertArrayClose(weights_a, weights_b, 0.0001, "Identical queries give identical weights");

    // Test 60: Attention invariance to query scaling
    const queryOrig = [1, 2, 3];
    const queryScaled = [2, 4, 6];
    const testKeys = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const weightsOrig = computeAttentionWeights(queryOrig, testKeys);
    const weightsScaled = computeAttentionWeights(queryScaled, testKeys);
    // Note: Scaling affects the attention distribution, so they won't be identical
    // But the order should be preserved
    const maxIdxOrig = weightsOrig.indexOf(Math.max(...weightsOrig));
    const maxIdxScaled = weightsScaled.indexOf(Math.max(...weightsScaled));
    runner.assertEqual(maxIdxOrig, maxIdxScaled, "Scaling preserves max attention position");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
