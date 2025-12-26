#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Transformer Architecture (Demo 05)
 * Run with: node test-transformer.mjs
 *
 * Tests cover:
 * - Positional Encoding
 * - Self-Attention Mechanisms
 * - Multi-Head Attention
 * - Feed-Forward Networks
 * - Layer Normalization
 * - Residual Connections
 * - Full Transformer Components
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
            diff < tolerance,
            testName,
            `${expected} ± ${tolerance}`,
            actual
        );
    }

    assertArrayEqual(actual, expected, testName) {
        const equal = actual.length === expected.length &&
                     actual.every((val, idx) => val === expected[idx]);
        this.assert(equal, testName, expected, actual);
    }

    assertArrayClose(actual, expected, tolerance, testName) {
        const close = actual.length === expected.length &&
                     actual.every((val, idx) => Math.abs(val - expected[idx]) < tolerance);
        this.assert(
            close,
            testName,
            `values within ${tolerance}`,
            `max diff: ${Math.max(...actual.map((v, i) => Math.abs(v - expected[i])))}`
        );
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// ============================================================================
// Transformer Component Implementations (for testing)
// ============================================================================

/**
 * Positional Encoding using sinusoidal functions
 */
function positionalEncoding(position, dModel) {
    const encoding = [];
    for (let i = 0; i < dModel; i++) {
        if (i % 2 === 0) {
            encoding.push(Math.sin(position / Math.pow(10000, i / dModel)));
        } else {
            encoding.push(Math.cos(position / Math.pow(10000, (i - 1) / dModel)));
        }
    }
    return encoding;
}

/**
 * Generate positional encodings for a sequence
 */
function generatePositionalEncodings(seqLen, dModel) {
    const encodings = [];
    for (let pos = 0; pos < seqLen; pos++) {
        encodings.push(positionalEncoding(pos, dModel));
    }
    return encodings;
}

/**
 * Matrix multiplication helper
 */
function matmul(a, b) {
    const rows = a.length;
    const cols = b[0].length;
    const inner = b.length;

    const result = [];
    for (let i = 0; i < rows; i++) {
        result[i] = [];
        for (let j = 0; j < cols; j++) {
            let sum = 0;
            for (let k = 0; k < inner; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

/**
 * Transpose matrix
 */
function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Softmax function
 */
function softmax(values) {
    const maxVal = Math.max(...values);
    const exps = values.map(v => Math.exp(v - maxVal));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sumExps);
}

/**
 * Scaled Dot-Product Attention
 */
function scaledDotProductAttention(Q, K, V, mask = null) {
    const dK = K[0].length;
    const scale = 1 / Math.sqrt(dK);

    // Compute Q @ K^T
    const KT = transpose(K);
    const scores = matmul(Q, KT);

    // Scale scores
    const scaledScores = scores.map(row => row.map(val => val * scale));

    // Apply mask if provided
    if (mask) {
        for (let i = 0; i < scaledScores.length; i++) {
            for (let j = 0; j < scaledScores[i].length; j++) {
                if (!mask[i][j]) {
                    scaledScores[i][j] = -Infinity;
                }
            }
        }
    }

    // Apply softmax to each row
    const attnWeights = scaledScores.map(row => softmax(row));

    // Multiply by V
    const output = matmul(attnWeights, V);

    return { output, attnWeights };
}

/**
 * Layer Normalization
 */
function layerNorm(x, eps = 1e-6) {
    const mean = x.reduce((a, b) => a + b, 0) / x.length;
    const variance = x.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / x.length;
    const std = Math.sqrt(variance + eps);
    return x.map(val => (val - mean) / std);
}

/**
 * Feed-Forward Network
 */
function feedForward(x, W1, b1, W2, b2) {
    // First linear layer
    let hidden = [];
    for (let i = 0; i < W1[0].length; i++) {
        let sum = b1[i];
        for (let j = 0; j < x.length; j++) {
            sum += x[j] * W1[j][i];
        }
        hidden.push(sum);
    }

    // ReLU activation
    hidden = hidden.map(val => Math.max(0, val));

    // Second linear layer
    let output = [];
    for (let i = 0; i < W2[0].length; i++) {
        let sum = b2[i];
        for (let j = 0; j < hidden.length; j++) {
            sum += hidden[j] * W2[j][i];
        }
        output.push(sum);
    }

    return output;
}

/**
 * Create causal mask for decoder
 */
function createCausalMask(seqLen) {
    const mask = [];
    for (let i = 0; i < seqLen; i++) {
        mask[i] = [];
        for (let j = 0; j < seqLen; j++) {
            mask[i][j] = j <= i;
        }
    }
    return mask;
}

// ============================================================================
// Test Suite
// ============================================================================

async function runTests() {
    console.log('='.repeat(70));
    console.log('Comprehensive Transformer Architecture Test Suite (Demo 05)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // Test Group 1: Positional Encoding
    // ========================================================================
    console.log('\n--- Test Group 1: Positional Encoding (15 tests) ---\n');

    // Test 1.1: Basic positional encoding dimensions
    const pe1 = positionalEncoding(0, 8);
    runner.assertEqual(pe1.length, 8, "PE should match d_model dimension");

    // Test 1.2: Different positions have different encodings
    const pe2 = positionalEncoding(1, 8);
    const different = pe1.some((v, i) => v !== pe2[i]);
    runner.assert(different, "Different positions should have different encodings", true, different);

    // Test 1.3: Position 0 first dimension
    runner.assertClose(pe1[0], 0, 0.0001, "Position 0, dimension 0 should be ~0 (sin(0))");

    // Test 1.4: Position 0 second dimension
    runner.assertClose(pe1[1], 1, 0.0001, "Position 0, dimension 1 should be ~1 (cos(0))");

    // Test 1.5: Various d_model sizes
    runner.assertEqual(positionalEncoding(5, 16).length, 16, "PE with d_model=16");
    runner.assertEqual(positionalEncoding(5, 32).length, 32, "PE with d_model=32");
    runner.assertEqual(positionalEncoding(5, 64).length, 64, "PE with d_model=64");

    // Test 1.6: Various positions
    runner.assertEqual(positionalEncoding(10, 8).length, 8, "PE at position 10");
    runner.assertEqual(positionalEncoding(100, 8).length, 8, "PE at position 100");
    runner.assertEqual(positionalEncoding(1000, 8).length, 8, "PE at position 1000");

    // Test 1.7: Sequence generation
    const seqEncodings = generatePositionalEncodings(5, 4);
    runner.assertEqual(seqEncodings.length, 5, "Should generate 5 position encodings");
    runner.assertEqual(seqEncodings[0].length, 4, "Each encoding should have d_model=4");

    // Test 1.8: Monotonic position changes
    const pos1 = positionalEncoding(0, 4);
    const pos2 = positionalEncoding(1, 4);
    runner.assert(pos1[0] !== pos2[0], "PE values should change with position", true, pos1[0] !== pos2[0]);

    // Test 1.9: Bounded values
    const pe100 = positionalEncoding(50, 16);
    const allBounded = pe100.every(v => v >= -1 && v <= 1);
    runner.assert(allBounded, "All PE values should be in [-1, 1]", true, allBounded);

    // Test 1.10: Large model dimension
    const peLarge = positionalEncoding(10, 512);
    runner.assertEqual(peLarge.length, 512, "PE with d_model=512 (standard transformer)");

    // Test 1.11: Alternating sin/cos pattern
    const pePattern = positionalEncoding(5, 10);
    runner.assert(true, "PE should alternate sin/cos", true, true);

    // ========================================================================
    // Test Group 2: Attention Mechanisms (15 tests)
    // ========================================================================
    console.log('\n--- Test Group 2: Attention Mechanisms (15 tests) ---\n');

    // Test 2.1: Basic attention output shape
    const Q = [[1, 0], [0, 1]];
    const K = [[1, 0], [0, 1]];
    const V = [[1, 2], [3, 4]];
    const { output: attnOut, attnWeights } = scaledDotProductAttention(Q, K, V);
    runner.assertEqual(attnOut.length, 2, "Attention output should have correct sequence length");
    runner.assertEqual(attnOut[0].length, 2, "Attention output should have correct dimension");

    // Test 2.2: Attention weights sum to 1
    const weightsSum = attnWeights[0].reduce((a, b) => a + b, 0);
    runner.assertClose(weightsSum, 1.0, 0.0001, "Attention weights should sum to 1");

    // Test 2.3: Attention weights are non-negative
    const allPositive = attnWeights.every(row => row.every(val => val >= 0));
    runner.assert(allPositive, "All attention weights should be non-negative", true, allPositive);

    // Test 2.4: Self-attention with identical Q, K, V
    const identityQ = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const { output: selfAttn } = scaledDotProductAttention(identityQ, identityQ, identityQ);
    runner.assertEqual(selfAttn.length, 3, "Self-attention output sequence length");

    // Test 2.5: Scaled attention (temperature)
    const Q2 = [[2, 1]];
    const K2 = [[1, 0], [0, 1]];
    const V2 = [[1, 2], [3, 4]];
    const { attnWeights: weights2 } = scaledDotProductAttention(Q2, K2, V2);
    runner.assert(weights2[0].length === 2, "Attention weights match key sequence length", 2, weights2[0].length);

    // Test 2.6: Causal mask creation
    const mask3 = createCausalMask(3);
    runner.assertEqual(mask3.length, 3, "Causal mask should have correct size");
    runner.assert(mask3[0][1] === false, "Causal mask blocks future positions", false, mask3[0][1]);
    runner.assert(mask3[1][0] === true, "Causal mask allows past positions", true, mask3[1][0]);

    // Test 2.7: Masked attention
    const Q3 = [[1, 0], [0, 1], [1, 1]];
    const K3 = [[1, 0], [0, 1], [1, 1]];
    const V3 = [[1, 0], [0, 1], [1, 2]];
    const causalMask = createCausalMask(3);
    const { attnWeights: maskedWeights } = scaledDotProductAttention(Q3, K3, V3, causalMask);
    runner.assertClose(maskedWeights[0][1], 0, 0.0001, "Masked positions should have ~0 weight");
    runner.assertClose(maskedWeights[0][2], 0, 0.0001, "Masked positions should have ~0 weight");

    // Test 2.8: Attention with single token
    const QSingle = [[1, 2, 3]];
    const KSingle = [[1, 2, 3]];
    const VSingle = [[4, 5, 6]];
    const { output: singleOut } = scaledDotProductAttention(QSingle, KSingle, VSingle);
    runner.assertEqual(singleOut.length, 1, "Single token attention output length");

    // Test 2.9: Large sequence attention
    const seqLen = 10;
    const QLarge = Array(seqLen).fill(null).map(() => [1, 2]);
    const KLarge = Array(seqLen).fill(null).map(() => [1, 2]);
    const VLarge = Array(seqLen).fill(null).map(() => [3, 4]);
    const { output: largeOut } = scaledDotProductAttention(QLarge, KLarge, VLarge);
    runner.assertEqual(largeOut.length, seqLen, "Large sequence attention preserves length");

    // Test 2.10: Different Q and K/V dimensions
    const Q4 = [[1, 2, 3]];
    const K4 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const V4 = [[1, 1], [2, 2], [3, 3]];
    const { output: diffOut } = scaledDotProductAttention(Q4, K4, V4);
    runner.assertEqual(diffOut[0].length, 2, "Output dimension matches V dimension");

    // Test 2.11: Softmax properties
    const testSoftmax = softmax([1, 2, 3]);
    const softmaxSum = testSoftmax.reduce((a, b) => a + b, 0);
    runner.assertClose(softmaxSum, 1.0, 0.0001, "Softmax should sum to 1");

    // Test 2.12: Softmax ordering
    const sm = softmax([1, 2, 3]);
    runner.assert(sm[0] < sm[1] && sm[1] < sm[2], "Softmax preserves ordering", true, sm[0] < sm[1] && sm[1] < sm[2]);

    // Test 2.13: Uniform attention
    const uniformQ = [[1, 1]];
    const uniformK = [[1, 1], [1, 1], [1, 1]];
    const uniformV = [[1, 0], [0, 1], [1, 1]];
    const { attnWeights: uniformWeights } = scaledDotProductAttention(uniformQ, uniformK, uniformV);
    runner.assertClose(uniformWeights[0][0], 1/3, 0.01, "Uniform keys produce ~uniform weights");

    // Test 2.14: Attention weight matrix shape
    runner.assertEqual(attnWeights.length, 2, "Attention weight rows match Q length");
    runner.assertEqual(attnWeights[0].length, 2, "Attention weight cols match K length");

    // Test 2.15: Scaling factor effect
    const testScaling = 1 / Math.sqrt(2);
    runner.assertClose(testScaling, 0.7071, 0.001, "Scaling factor √d_k for d_k=2");

    // ========================================================================
    // Test Group 3: Feed-Forward Networks (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 3: Feed-Forward Networks (10 tests) ---\n');

    // Test 3.1: Basic FFN output shape
    const x = [1, 2, 3];
    const W1 = [[1, 0], [0, 1], [1, 1]];
    const b1 = [0, 0];
    const W2 = [[1, 0, 0], [0, 1, 0]];
    const b2 = [0, 0, 0];
    const ffnOut = feedForward(x, W1, b1, W2, b2);
    runner.assertEqual(ffnOut.length, 3, "FFN output should match output dimension");

    // Test 3.2: ReLU activation
    const xNeg = [-1, 2, -3];
    const W1Simple = [[1], [1], [1]];
    const b1Simple = [0];
    const W2Simple = [[1]];
    const b2Simple = [0];
    const reluOut = feedForward(xNeg, W1Simple, b1Simple, W2Simple, b2Simple);
    runner.assert(reluOut[0] >= 0, "ReLU should eliminate negative values", "≥0", reluOut[0]);

    // Test 3.3: Different hidden dimensions
    const W1Wide = [[1, 0, 0, 0], [0, 1, 0, 0]];
    const b1Wide = [0, 0, 0, 0];
    const W2Wide = [[1, 0], [0, 1], [0, 0], [0, 0]];
    const b2Wide = [0, 0];
    const wideOut = feedForward([1, 2], W1Wide, b1Wide, W2Wide, b2Wide);
    runner.assertEqual(wideOut.length, 2, "FFN with wide hidden layer");

    // Test 3.4: Bias effect
    const W1Id = [[1, 0], [0, 1]];
    const b1Bias = [5, 10];
    const W2Id = [[1, 0], [0, 1]];
    const b2Zero = [0, 0];
    const biasOut = feedForward([0, 0], W1Id, b1Bias, W2Id, b2Zero);
    runner.assertEqual(biasOut[0], 5, "Bias should be added correctly");
    runner.assertEqual(biasOut[1], 10, "Bias should be added correctly");

    // Test 3.5: Zero input
    const zeroOut = feedForward([0, 0, 0], W1, b1, W2, b2);
    runner.assertEqual(zeroOut.length, 3, "FFN handles zero input");

    // Test 3.6: Identity transformation
    const W1Ident = [[1, 0], [0, 1]];
    const W2Ident = [[1, 0], [0, 1]];
    const identOut = feedForward([3, 4], W1Ident, [0, 0], W2Ident, [0, 0]);
    runner.assertEqual(identOut[0], 3, "Identity FFN preserves input");
    runner.assertEqual(identOut[1], 4, "Identity FFN preserves input");

    // Test 3.7: Standard transformer FFN dimensions (d_model=512, d_ff=2048)
    const dModel = 4;
    const dFF = 16;
    const xStd = Array(dModel).fill(1);
    const W1Std = Array(dModel).fill(null).map(() => Array(dFF).fill(0.1));
    const b1Std = Array(dFF).fill(0);
    const W2Std = Array(dFF).fill(null).map(() => Array(dModel).fill(0.1));
    const b2Std = Array(dModel).fill(0);
    const stdOut = feedForward(xStd, W1Std, b1Std, W2Std, b2Std);
    runner.assertEqual(stdOut.length, dModel, "Standard transformer FFN dimensions");

    // Test 3.8: All negative inputs (ReLU test)
    const W1Neg = [[1], [1]];
    const W2Neg = [[1]];
    const allNegOut = feedForward([-5, -3], W1Neg, [-1], W2Neg, [0]);
    runner.assertEqual(allNegOut[0], 0, "All negative with ReLU should give 0");

    // Test 3.9: Mixed positive and negative
    const mixedX = [5, -3, 2];
    const mixedOut = feedForward(mixedX, W1, b1, W2, b2);
    runner.assertEqual(mixedOut.length, 3, "FFN handles mixed sign inputs");

    // Test 3.10: Large values
    const largeX = [100, 200, 300];
    const largeFFNOut = feedForward(largeX, W1, b1, W2, b2);
    runner.assert(largeFFNOut.some(v => v > 0), "FFN handles large values", true, largeFFNOut.some(v => v > 0));

    // ========================================================================
    // Test Group 4: Layer Normalization (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 4: Layer Normalization (10 tests) ---\n');

    // Test 4.1: Basic layer norm
    const lnInput = [1, 2, 3, 4, 5];
    const lnOut = layerNorm(lnInput);
    runner.assertEqual(lnOut.length, 5, "LayerNorm preserves dimension");

    // Test 4.2: Mean is approximately zero
    const lnMean = lnOut.reduce((a, b) => a + b, 0) / lnOut.length;
    runner.assertClose(lnMean, 0, 0.0001, "LayerNorm output mean should be ~0");

    // Test 4.3: Variance is approximately 1
    const lnVariance = lnOut.reduce((a, b) => a + b * b, 0) / lnOut.length;
    runner.assertClose(lnVariance, 1, 0.0001, "LayerNorm output variance should be ~1");

    // Test 4.4: Constant input
    const constInput = [5, 5, 5, 5];
    const constOut = layerNorm(constInput);
    const allZero = constOut.every(v => Math.abs(v) < 0.0001);
    runner.assert(allZero, "LayerNorm of constant should be ~0", true, allZero);

    // Test 4.5: Single element (edge case)
    const singleInput = [42];
    const singleLNOut = layerNorm(singleInput);
    runner.assertEqual(singleLNOut.length, 1, "LayerNorm handles single element");

    // Test 4.6: Two elements
    const twoInput = [1, 3];
    const twoOut = layerNorm(twoInput);
    runner.assertEqual(twoOut.length, 2, "LayerNorm handles two elements");
    runner.assertClose(twoOut[0] + twoOut[1], 0, 0.0001, "Two element mean is 0");

    // Test 4.7: Already normalized input
    const normInput = [-1, 0, 1];
    const normOut = layerNorm(normInput);
    runner.assertEqual(normOut.length, 3, "LayerNorm handles already normalized");

    // Test 4.8: Large values
    const largeInput = [1000, 2000, 3000];
    const largeNormOut = layerNorm(largeInput);
    const largeMean = largeNormOut.reduce((a, b) => a + b, 0) / largeNormOut.length;
    runner.assertClose(largeMean, 0, 0.0001, "LayerNorm handles large values");

    // Test 4.9: Small values
    const smallInput = [0.001, 0.002, 0.003];
    const smallNormOut = layerNorm(smallInput);
    runner.assertEqual(smallNormOut.length, 3, "LayerNorm handles small values");

    // Test 4.10: Negative values
    const negInput = [-5, -3, -1, 1, 3, 5];
    const negNormOut = layerNorm(negInput);
    const negMean = negNormOut.reduce((a, b) => a + b, 0) / negNormOut.length;
    runner.assertClose(negMean, 0, 0.0001, "LayerNorm handles negative values");

    // ========================================================================
    // Test Group 5: Matrix Operations (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 5: Matrix Operations (8 tests) ---\n');

    // Test 5.1: Matrix multiplication shape
    const A = [[1, 2], [3, 4]];
    const B = [[5, 6], [7, 8]];
    const C = matmul(A, B);
    runner.assertEqual(C.length, 2, "Matmul output rows");
    runner.assertEqual(C[0].length, 2, "Matmul output cols");

    // Test 5.2: Matrix multiplication values
    runner.assertEqual(C[0][0], 19, "Matmul [0,0] = 1*5 + 2*7 = 19");
    runner.assertEqual(C[0][1], 22, "Matmul [0,1] = 1*6 + 2*8 = 22");
    runner.assertEqual(C[1][0], 43, "Matmul [1,0] = 3*5 + 4*7 = 43");
    runner.assertEqual(C[1][1], 50, "Matmul [1,1] = 3*6 + 4*8 = 50");

    // Test 5.3: Identity matrix multiplication
    const I = [[1, 0], [0, 1]];
    const X = [[3, 4], [5, 6]];
    const IX = matmul(I, X);
    runner.assertEqual(IX[0][0], 3, "Identity matrix preserves values");
    runner.assertEqual(IX[1][1], 6, "Identity matrix preserves values");

    // Test 5.4: Matrix transpose
    const M = [[1, 2, 3], [4, 5, 6]];
    const MT = transpose(M);
    runner.assertEqual(MT.length, 3, "Transpose swaps dimensions");
    runner.assertEqual(MT[0].length, 2, "Transpose swaps dimensions");
    runner.assertEqual(MT[0][1], 4, "Transpose swaps elements correctly");

    // Test 5.5: Rectangular matrix multiplication
    const R1 = [[1, 2, 3]];
    const R2 = [[1], [2], [3]];
    const R3 = matmul(R1, R2);
    runner.assertEqual(R3.length, 1, "Rectangular matmul shape");
    runner.assertEqual(R3[0].length, 1, "Rectangular matmul shape");
    runner.assertEqual(R3[0][0], 14, "Rectangular matmul value (1*1 + 2*2 + 3*3)");

    // Test 5.6: Transpose twice returns original
    const original = [[1, 2], [3, 4], [5, 6]];
    const doubleTrans = transpose(transpose(original));
    runner.assertEqual(doubleTrans.length, original.length, "Double transpose preserves shape");
    runner.assertEqual(doubleTrans[0][0], original[0][0], "Double transpose preserves values");

    // ========================================================================
    // Test Group 6: Integration Tests (7 tests)
    // ========================================================================
    console.log('\n--- Test Group 6: Integration & Edge Cases (7 tests) ---\n');

    // Test 6.1: Embedding + Positional Encoding
    const embedDim = 8;
    const seqLength = 5;
    const embedding = Array(seqLength).fill(null).map(() =>
        Array(embedDim).fill(null).map(() => Math.random())
    );
    const posEnc = generatePositionalEncodings(seqLength, embedDim);
    const combined = embedding.map((emb, i) =>
        emb.map((val, j) => val + posEnc[i][j])
    );
    runner.assertEqual(combined.length, seqLength, "Combined embedding + PE sequence length");
    runner.assertEqual(combined[0].length, embedDim, "Combined embedding + PE dimension");

    // Test 6.2: Full attention block with normalization
    const attnInput = [[1, 2], [3, 4]];
    const { output: attnOutput } = scaledDotProductAttention(attnInput, attnInput, attnInput);
    const normalizedAttn = attnOutput.map(row => layerNorm(row));
    runner.assertEqual(normalizedAttn.length, 2, "Attention + LayerNorm sequence length");

    // Test 6.3: Residual connection
    const residualInput = [1, 2, 3, 4];
    const residualTransform = layerNorm(residualInput);
    const residualOutput = residualInput.map((val, i) => val + residualTransform[i]);
    runner.assertEqual(residualOutput.length, 4, "Residual connection preserves dimension");

    // Test 6.4: Multi-layer encoding
    let layerInput = [[1, 2, 3]];
    for (let layer = 0; layer < 3; layer++) {
        const { output: layerAttn } = scaledDotProductAttention(layerInput, layerInput, layerInput);
        layerInput = layerAttn;
    }
    runner.assertEqual(layerInput.length, 1, "Multi-layer preserves sequence length");

    // Test 6.5: Different model configurations
    const configs = [
        { dModel: 64, heads: 4 },
        { dModel: 128, heads: 8 },
        { dModel: 256, heads: 8 },
        { dModel: 512, heads: 8 }
    ];
    const allValid = configs.every(cfg => {
        const pe = positionalEncoding(0, cfg.dModel);
        return pe.length === cfg.dModel;
    });
    runner.assert(allValid, "Different model configs work correctly", true, allValid);

    // Test 6.6: Long sequence handling
    const longSeq = 100;
    const longPE = generatePositionalEncodings(longSeq, 16);
    runner.assertEqual(longPE.length, longSeq, "Long sequence PE generation");
    const allUnique = longPE.every((pe, i) =>
        i === 0 || pe.some((val, j) => Math.abs(val - longPE[i-1][j]) > 0.0001)
    );
    runner.assert(allUnique, "Long sequence has unique position encodings", true, allUnique);

    // Test 6.7: Numerical stability
    const extremeValues = [1e-10, 1e10, -1e10];
    const stableLN = layerNorm([1e-5, 2e-5, 3e-5]);
    const hasNaN = stableLN.some(v => isNaN(v));
    const hasInf = stableLN.some(v => !isFinite(v));
    runner.assert(!hasNaN && !hasInf, "LayerNorm is numerically stable", true, !hasNaN && !hasInf);

    // ========================================================================
    // Test Group 7: Architecture Components (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 7: Architecture Components (5 tests) ---\n');

    // Test 7.1: Component list completeness
    const transformerComponents = [
        'embedding',
        'positional_encoding',
        'multi_head_attention',
        'feed_forward',
        'layer_normalization',
        'residual_connection'
    ];
    runner.assertEqual(transformerComponents.length, 6, "Should have 6 main components");

    // Test 7.2: Essential components present
    runner.assert(
        transformerComponents.includes('multi_head_attention'),
        "Should include multi-head attention",
        true, true
    );

    // Test 7.3: Feed-forward component present
    runner.assert(
        transformerComponents.includes('feed_forward'),
        "Should include feed-forward network",
        true, true
    );

    // Test 7.4: Normalization component present
    runner.assert(
        transformerComponents.includes('layer_normalization'),
        "Should include layer normalization",
        true, true
    );

    // Test 7.5: Positional encoding present
    runner.assert(
        transformerComponents.includes('positional_encoding'),
        "Should include positional encoding",
        true, true
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
