#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Embeddings Comparison (Demo 14)
 * Run with: node test-comparison.mjs
 *
 * Tests cover:
 * - Cosine similarity calculations
 * - Euclidean distance calculations
 * - Manhattan distance calculations
 * - Vector arithmetic operations
 * - Model comparison metrics
 * - K-means clustering
 * - Edge cases and special vectors
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
            this.assert(false, testName, `array length ${expected.length}`, `array length ${actual.length}`);
            return;
        }

        const allClose = actual.every((val, i) => Math.abs(val - expected[i]) <= tolerance);
        this.assert(
            allClose,
            testName,
            expected.map(v => v.toFixed(4)),
            actual.map(v => v.toFixed(4))
        );
    }

    assertThrows(fn, testName) {
        this.total++;
        try {
            fn();
            console.log(`✗ FAIL: ${testName}`);
            console.log(`  Expected: Error to be thrown`);
            console.log(`  Actual: No error thrown`);
            this.failed++;
        } catch (error) {
            console.log(`✓ PASS: ${testName}`);
            this.passed++;
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// ============================================================================
// DISTANCE AND SIMILARITY METRICS
// ============================================================================

function cosineSimilarity(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error('Vectors must have the same length');
    }

    const dot = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));

    if (mag1 === 0 || mag2 === 0) {
        return 0;
    }

    return dot / (mag1 * mag2);
}

function euclideanDistance(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
        const diff = vecA[i] - vecB[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

function manhattanDistance(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
        sum += Math.abs(vecA[i] - vecB[i]);
    }
    return sum;
}

function dotProduct(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

function vectorMagnitude(vec) {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function normalizeVector(vec) {
    const mag = vectorMagnitude(vec);
    if (mag === 0) {
        return vec.map(() => 0);
    }
    return vec.map(val => val / mag);
}

function vectorArithmetic(vecB, vecA, vecC) {
    // B - A + C
    if (vecB.length !== vecA.length || vecB.length !== vecC.length) {
        throw new Error('All vectors must have the same length');
    }

    const result = [];
    for (let i = 0; i < vecB.length; i++) {
        result.push(vecB[i] - vecA[i] + vecC[i]);
    }

    // Normalize
    return normalizeVector(result);
}

function pearsonCorrelation(vecA, vecB) {
    if (vecA.length !== vecB.length || vecA.length === 0) {
        throw new Error('Vectors must have the same non-zero length');
    }

    const n = vecA.length;
    const meanA = vecA.reduce((a, b) => a + b, 0) / n;
    const meanB = vecB.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomA = 0;
    let denomB = 0;

    for (let i = 0; i < n; i++) {
        const diffA = vecA[i] - meanA;
        const diffB = vecB[i] - meanB;
        numerator += diffA * diffB;
        denomA += diffA * diffA;
        denomB += diffB * diffB;
    }

    if (denomA === 0 || denomB === 0) {
        return 0;
    }

    return numerator / Math.sqrt(denomA * denomB);
}

// ============================================================================
// MODEL COMPARISON FUNCTIONS
// ============================================================================

function compareModels(embeddings1, embeddings2) {
    const similarities = [];
    const correlations = [];
    const words = Object.keys(embeddings1);

    for (const word of words) {
        if (embeddings2[word]) {
            const sim = cosineSimilarity(embeddings1[word], embeddings2[word]);
            const corr = pearsonCorrelation(embeddings1[word], embeddings2[word]);
            similarities.push(sim);
            correlations.push(corr);
        }
    }

    if (similarities.length === 0) {
        return {
            avgSimilarity: 0,
            avgCorrelation: 0,
            count: 0,
            alignment: 0
        };
    }

    return {
        avgSimilarity: similarities.reduce((a, b) => a + b, 0) / similarities.length,
        avgCorrelation: correlations.reduce((a, b) => a + b, 0) / correlations.length,
        count: similarities.length,
        alignment: (similarities.reduce((a, b) => a + b, 0) + correlations.reduce((a, b) => a + b, 0)) / (2 * similarities.length)
    };
}

function crossModelWordSimilarity(word1, word2, model1, model2) {
    if (!model1[word1] || !model2[word2]) {
        throw new Error('Words not found in models');
    }

    return cosineSimilarity(model1[word1], model2[word2]);
}

// ============================================================================
// K-MEANS CLUSTERING
// ============================================================================

function kMeansClustering(embeddings, k, maxIters = 10) {
    if (k <= 0 || k > embeddings.length) {
        throw new Error('Invalid number of clusters');
    }

    const n = embeddings.length;
    const dim = embeddings[0].length;

    // Initialize centroids randomly
    const centroids = [];
    const indices = new Set();
    while (centroids.length < k) {
        const idx = Math.floor(Math.random() * n);
        if (!indices.has(idx)) {
            centroids.push([...embeddings[idx]]);
            indices.add(idx);
        }
    }

    let assignments = Array(n).fill(0);

    for (let iter = 0; iter < maxIters; iter++) {
        // Assign points to nearest centroid
        for (let i = 0; i < n; i++) {
            let minDist = Infinity;
            let bestCluster = 0;

            for (let j = 0; j < k; j++) {
                const dist = euclideanDistance(embeddings[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    bestCluster = j;
                }
            }

            assignments[i] = bestCluster;
        }

        // Update centroids
        const clusterSums = Array.from({ length: k }, () => Array(dim).fill(0));
        const clusterCounts = Array(k).fill(0);

        for (let i = 0; i < n; i++) {
            const cluster = assignments[i];
            clusterCounts[cluster]++;
            for (let d = 0; d < dim; d++) {
                clusterSums[cluster][d] += embeddings[i][d];
            }
        }

        for (let j = 0; j < k; j++) {
            if (clusterCounts[j] > 0) {
                for (let d = 0; d < dim; d++) {
                    centroids[j][d] = clusterSums[j][d] / clusterCounts[j];
                }
            }
        }
    }

    return assignments;
}

// ============================================================================
// TEST SUITE
// ============================================================================

async function runTests() {
    console.log('='.repeat(70));
    console.log('Comprehensive Embeddings Comparison Test Suite (Demo 14)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // TEST GROUP 1: COSINE SIMILARITY (20 tests)
    // ========================================================================
    console.log('\n--- Test Group 1: Cosine Similarity (20 tests) ---\n');

    // Test 1.1: Identical vectors
    runner.assertClose(
        cosineSimilarity([1, 0, 0], [1, 0, 0]),
        1.0,
        0.001,
        "1.1 Identical unit vectors should have similarity 1.0"
    );

    // Test 1.2: Orthogonal vectors
    runner.assertClose(
        cosineSimilarity([1, 0, 0], [0, 1, 0]),
        0.0,
        0.001,
        "1.2 Orthogonal vectors should have similarity 0.0"
    );

    // Test 1.3: Opposite vectors
    runner.assertClose(
        cosineSimilarity([1, 0, 0], [-1, 0, 0]),
        -1.0,
        0.001,
        "1.3 Opposite vectors should have similarity -1.0"
    );

    // Test 1.4: Identical non-unit vectors
    runner.assertClose(
        cosineSimilarity([3, 4, 0], [3, 4, 0]),
        1.0,
        0.001,
        "1.4 Identical non-unit vectors should have similarity 1.0"
    );

    // Test 1.5: Scaled vectors
    runner.assertClose(
        cosineSimilarity([1, 2, 3], [2, 4, 6]),
        1.0,
        0.001,
        "1.5 Scaled vectors should have similarity 1.0"
    );

    // Test 1.6: High-dimensional identical vectors
    const vec384 = Array(384).fill(1);
    runner.assertClose(
        cosineSimilarity(vec384, vec384),
        1.0,
        0.001,
        "1.6 High-dimensional (384D) identical vectors should have similarity 1.0"
    );

    // Test 1.7: High-dimensional orthogonal vectors
    const vecA = Array(384).fill(0);
    vecA[0] = 1;
    const vecB = Array(384).fill(0);
    vecB[1] = 1;
    runner.assertClose(
        cosineSimilarity(vecA, vecB),
        0.0,
        0.001,
        "1.7 High-dimensional orthogonal vectors should have similarity 0.0"
    );

    // Test 1.8: Zero vector with non-zero vector
    runner.assertClose(
        cosineSimilarity([0, 0, 0], [1, 2, 3]),
        0.0,
        0.001,
        "1.8 Zero vector with non-zero vector should have similarity 0.0"
    );

    // Test 1.9: Two zero vectors
    runner.assertClose(
        cosineSimilarity([0, 0, 0], [0, 0, 0]),
        0.0,
        0.001,
        "1.9 Two zero vectors should have similarity 0.0"
    );

    // Test 1.10: Near-identical vectors
    runner.assert(
        cosineSimilarity([1, 2, 3], [1.01, 2.01, 3.01]) > 0.999,
        "1.10 Near-identical vectors should have very high similarity",
        "> 0.999",
        cosineSimilarity([1, 2, 3], [1.01, 2.01, 3.01]).toFixed(5)
    );

    // Test 1.11: 45-degree angle vectors
    runner.assertClose(
        cosineSimilarity([1, 0], [1, 1]),
        Math.cos(Math.PI / 4),
        0.001,
        "1.11 Vectors at 45 degrees should have similarity cos(π/4)"
    );

    // Test 1.12: Negative similarity
    runner.assert(
        cosineSimilarity([1, 2, 3], [-1, -2, -3]) < 0,
        "1.12 Vectors in opposite directions should have negative similarity",
        "< 0",
        cosineSimilarity([1, 2, 3], [-1, -2, -3]).toFixed(5)
    );

    // Test 1.13: Mixed positive/negative values
    runner.assertClose(
        cosineSimilarity([1, -1, 1], [1, -1, 1]),
        1.0,
        0.001,
        "1.13 Identical vectors with mixed signs should have similarity 1.0"
    );

    // Test 1.14: Small values
    runner.assertClose(
        cosineSimilarity([0.001, 0.002, 0.003], [0.001, 0.002, 0.003]),
        1.0,
        0.001,
        "1.14 Small identical values should have similarity 1.0"
    );

    // Test 1.15: Large values
    runner.assertClose(
        cosineSimilarity([1000, 2000, 3000], [1000, 2000, 3000]),
        1.0,
        0.001,
        "1.15 Large identical values should have similarity 1.0"
    );

    // Test 1.16: Dimension 768 (MPNet size)
    const vec768a = Array(768).fill(0.5);
    const vec768b = Array(768).fill(0.5);
    runner.assertClose(
        cosineSimilarity(vec768a, vec768b),
        1.0,
        0.001,
        "1.16 768-dimensional identical vectors should have similarity 1.0"
    );

    // Test 1.17: Random normalized vectors
    const randVec1 = normalizeVector([0.5, 0.8, 0.3, 0.9]);
    const randVec2 = normalizeVector([0.6, 0.7, 0.4, 0.8]);
    const sim = cosineSimilarity(randVec1, randVec2);
    runner.assert(
        sim >= -1 && sim <= 1,
        "1.17 Similarity of random vectors should be in [-1, 1]",
        "[-1, 1]",
        sim.toFixed(5)
    );

    // Test 1.18: Perpendicular in 3D
    runner.assertClose(
        cosineSimilarity([1, 1, 0], [1, -1, 0]),
        0.0,
        0.001,
        "1.18 Perpendicular vectors in 3D should have similarity 0.0"
    );

    // Test 1.19: Unit sphere vectors
    runner.assertClose(
        cosineSimilarity([1/Math.sqrt(3), 1/Math.sqrt(3), 1/Math.sqrt(3)],
                        [1/Math.sqrt(3), 1/Math.sqrt(3), 1/Math.sqrt(3)]),
        1.0,
        0.001,
        "1.19 Identical unit sphere vectors should have similarity 1.0"
    );

    // Test 1.20: Different length vectors should throw error
    runner.assertThrows(
        () => cosineSimilarity([1, 2], [1, 2, 3]),
        "1.20 Different length vectors should throw error"
    );

    // ========================================================================
    // TEST GROUP 2: EUCLIDEAN DISTANCE (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 2: Euclidean Distance (10 tests) ---\n');

    // Test 2.1: Identical vectors
    runner.assertClose(
        euclideanDistance([1, 2, 3], [1, 2, 3]),
        0.0,
        0.001,
        "2.1 Identical vectors should have distance 0"
    );

    // Test 2.2: Unit distance
    runner.assertClose(
        euclideanDistance([0, 0, 0], [1, 0, 0]),
        1.0,
        0.001,
        "2.2 Unit vectors should have distance 1"
    );

    // Test 2.3: 3-4-5 triangle
    runner.assertClose(
        euclideanDistance([0, 0], [3, 4]),
        5.0,
        0.001,
        "2.3 3-4-5 right triangle should have distance 5"
    );

    // Test 2.4: Negative coordinates
    runner.assertClose(
        euclideanDistance([-1, -1, -1], [1, 1, 1]),
        Math.sqrt(12),
        0.001,
        "2.4 Distance with negative coordinates"
    );

    // Test 2.5: High-dimensional distance
    const hd1 = Array(384).fill(0);
    const hd2 = Array(384).fill(1);
    runner.assertClose(
        euclideanDistance(hd1, hd2),
        Math.sqrt(384),
        0.001,
        "2.5 384-dimensional unit hypercube distance"
    );

    // Test 2.6: Zero vectors
    runner.assertClose(
        euclideanDistance([0, 0, 0], [0, 0, 0]),
        0.0,
        0.001,
        "2.6 Zero vectors should have distance 0"
    );

    // Test 2.7: Symmetry property
    const distAB = euclideanDistance([1, 2, 3], [4, 5, 6]);
    const distBA = euclideanDistance([4, 5, 6], [1, 2, 3]);
    runner.assertClose(
        distAB,
        distBA,
        0.001,
        "2.7 Euclidean distance should be symmetric"
    );

    // Test 2.8: Triangle inequality
    const p1 = [0, 0];
    const p2 = [1, 0];
    const p3 = [1, 1];
    const d12 = euclideanDistance(p1, p2);
    const d23 = euclideanDistance(p2, p3);
    const d13 = euclideanDistance(p1, p3);
    runner.assert(
        d13 <= d12 + d23,
        "2.8 Triangle inequality: d(p1,p3) <= d(p1,p2) + d(p2,p3)",
        `<= ${(d12 + d23).toFixed(3)}`,
        d13.toFixed(3)
    );

    // Test 2.9: Large values
    runner.assertClose(
        euclideanDistance([1000, 2000], [1003, 2004]),
        5.0,
        0.001,
        "2.9 Distance with large coordinate values"
    );

    // Test 2.10: Different length vectors should throw error
    runner.assertThrows(
        () => euclideanDistance([1, 2], [1, 2, 3]),
        "2.10 Different length vectors should throw error"
    );

    // ========================================================================
    // TEST GROUP 3: MANHATTAN DISTANCE (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 3: Manhattan Distance (10 tests) ---\n');

    // Test 3.1: Identical vectors
    runner.assertClose(
        manhattanDistance([1, 2, 3], [1, 2, 3]),
        0.0,
        0.001,
        "3.1 Identical vectors should have Manhattan distance 0"
    );

    // Test 3.2: Unit distance
    runner.assertClose(
        manhattanDistance([0, 0, 0], [1, 0, 0]),
        1.0,
        0.001,
        "3.2 Single unit step should have distance 1"
    );

    // Test 3.3: Manhattan grid distance
    runner.assertClose(
        manhattanDistance([0, 0], [3, 4]),
        7.0,
        0.001,
        "3.3 Manhattan distance on grid (3,4) should be 7"
    );

    // Test 3.4: Negative coordinates
    runner.assertClose(
        manhattanDistance([-1, -1, -1], [1, 1, 1]),
        6.0,
        0.001,
        "3.4 Manhattan distance with negative coordinates"
    );

    // Test 3.5: High-dimensional distance
    const mh1 = Array(384).fill(0);
    const mh2 = Array(384).fill(1);
    runner.assertClose(
        manhattanDistance(mh1, mh2),
        384,
        0.001,
        "3.5 384-dimensional Manhattan distance"
    );

    // Test 3.6: Zero vectors
    runner.assertClose(
        manhattanDistance([0, 0, 0], [0, 0, 0]),
        0.0,
        0.001,
        "3.6 Zero vectors should have distance 0"
    );

    // Test 3.7: Symmetry property
    const mdistAB = manhattanDistance([1, 2, 3], [4, 5, 6]);
    const mdistBA = manhattanDistance([4, 5, 6], [1, 2, 3]);
    runner.assertClose(
        mdistAB,
        mdistBA,
        0.001,
        "3.7 Manhattan distance should be symmetric"
    );

    // Test 3.8: Comparison with Euclidean
    const eucDist = euclideanDistance([0, 0], [3, 4]);
    const manDist = manhattanDistance([0, 0], [3, 4]);
    runner.assert(
        manDist >= eucDist,
        "3.8 Manhattan distance should be >= Euclidean distance",
        `>= ${eucDist.toFixed(3)}`,
        manDist.toFixed(3)
    );

    // Test 3.9: Mixed positive/negative
    runner.assertClose(
        manhattanDistance([1, -2, 3], [-1, 2, -3]),
        12.0,
        0.001,
        "3.9 Manhattan distance with mixed signs"
    );

    // Test 3.10: Different length vectors should throw error
    runner.assertThrows(
        () => manhattanDistance([1, 2], [1, 2, 3]),
        "3.10 Different length vectors should throw error"
    );

    // ========================================================================
    // TEST GROUP 4: VECTOR ARITHMETIC (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 4: Vector Arithmetic (10 tests) ---\n');

    // Test 4.1: Simple arithmetic
    const result1 = vectorArithmetic([2, 0, 0], [1, 0, 0], [0, 0, 0]);
    runner.assertArrayClose(
        result1,
        [1, 0, 0],
        0.001,
        "4.1 Simple vector arithmetic: [2,0,0] - [1,0,0] + [0,0,0] normalized"
    );

    // Test 4.2: King-Queen-Man-Woman analogy structure
    const king = [1, 0.5];
    const queen = [1, -0.5];
    const man = [0.5, 0.5];
    const resultAnalogy = vectorArithmetic(queen, king, man);
    runner.assertEqual(
        resultAnalogy.length,
        2,
        "4.2 Analogy result should have correct dimensions"
    );

    // Test 4.3: Normalized result magnitude
    const arithResult = vectorArithmetic([1, 2, 3], [0, 1, 0], [1, 0, 1]);
    const magnitude = vectorMagnitude(arithResult);
    runner.assertClose(
        magnitude,
        1.0,
        0.001,
        "4.3 Vector arithmetic result should be normalized (magnitude 1)"
    );

    // Test 4.4: Zero result handling
    const zeroResult = vectorArithmetic([1, 0, 0], [1, 0, 0], [0, 0, 0]);
    runner.assertEqual(
        zeroResult.every(v => v === 0),
        true,
        "4.4 Zero vector result should remain zero"
    );

    // Test 4.5: High-dimensional arithmetic
    const hdB = Array(384).fill(0.5);
    const hdA = Array(384).fill(0.3);
    const hdC = Array(384).fill(0.1);
    const hdResult = vectorArithmetic(hdB, hdA, hdC);
    runner.assertEqual(
        hdResult.length,
        384,
        "4.5 384-dimensional vector arithmetic should preserve dimensions"
    );

    // Test 4.6: Consistent dimensions after arithmetic
    const res1 = vectorArithmetic([2, 2, 2], [1, 1, 1], [3, 3, 3]);
    const res2 = vectorArithmetic([5, 5, 5], [3, 3, 3], [2, 2, 2]);
    runner.assert(
        Math.abs(cosineSimilarity(res1, res2) - 1.0) < 0.001,
        "4.6 Equivalent vector operations should yield similar results",
        "similarity ≈ 1.0",
        cosineSimilarity(res1, res2).toFixed(5)
    );

    // Test 4.7: Negative values
    const negResult = vectorArithmetic([-1, -2, -3], [1, 2, 3], [0, 0, 0]);
    runner.assertEqual(
        negResult.length,
        3,
        "4.7 Negative values should work correctly"
    );

    // Test 4.8: Large values
    const largeResult = vectorArithmetic([1000, 2000, 3000], [100, 200, 300], [50, 100, 150]);
    const largeMag = vectorMagnitude(largeResult);
    runner.assertClose(
        largeMag,
        1.0,
        0.001,
        "4.8 Large values should still normalize to magnitude 1"
    );

    // Test 4.9: Mixed dimensions should throw error
    runner.assertThrows(
        () => vectorArithmetic([1, 2], [1, 2, 3], [1, 2]),
        "4.9 Different dimension vectors should throw error"
    );

    // Test 4.10: Analogy preservation check
    const analogyVec = vectorArithmetic([1, 1], [1, 0], [0, 1]);
    runner.assert(
        analogyVec.length === 2,
        "4.10 Analogy vector should preserve dimensionality",
        "length 2",
        `length ${analogyVec.length}`
    );

    // ========================================================================
    // TEST GROUP 5: MODEL COMPARISON (12 tests)
    // ========================================================================
    console.log('\n--- Test Group 5: Model Comparison (12 tests) ---\n');

    // Test 5.1: Identical models
    const model1 = {
        'cat': [1, 0.5, 0.2],
        'dog': [0.9, 0.6, 0.3]
    };
    const model2 = {
        'cat': [1, 0.5, 0.2],
        'dog': [0.9, 0.6, 0.3]
    };
    const comp1 = compareModels(model1, model2);
    runner.assertClose(
        comp1.avgSimilarity,
        1.0,
        0.001,
        "5.1 Identical models should have avgSimilarity 1.0"
    );

    // Test 5.2: Similar models
    const model3 = {
        'cat': [1.1, 0.45, 0.25],
        'dog': [0.85, 0.65, 0.35]
    };
    const comp2 = compareModels(model1, model3);
    runner.assert(
        comp2.avgSimilarity > 0.9,
        "5.2 Similar embeddings should have high average similarity",
        "> 0.9",
        comp2.avgSimilarity.toFixed(3)
    );

    // Test 5.3: Common word count
    runner.assertEqual(
        comp1.count,
        2,
        "5.3 Should compare 2 common words"
    );

    // Test 5.4: No common words
    const model4 = { 'bird': [1, 0, 0] };
    const model5 = { 'fish': [0, 1, 0] };
    const comp3 = compareModels(model4, model5);
    runner.assertEqual(
        comp3.count,
        0,
        "5.4 Models with no common words should have count 0"
    );

    // Test 5.5: Partial overlap
    const model6 = {
        'cat': [1, 0, 0],
        'dog': [0, 1, 0],
        'bird': [0, 0, 1]
    };
    const model7 = {
        'cat': [1, 0, 0],
        'fish': [1, 1, 0]
    };
    const comp4 = compareModels(model6, model7);
    runner.assertEqual(
        comp4.count,
        1,
        "5.5 Partial overlap should count only common words"
    );

    // Test 5.6: Correlation metric
    runner.assert(
        comp1.avgCorrelation !== undefined,
        "5.6 Should compute average correlation",
        "defined",
        comp1.avgCorrelation
    );

    // Test 5.7: Alignment metric
    runner.assert(
        comp1.alignment !== undefined,
        "5.7 Should compute alignment metric",
        "defined",
        comp1.alignment
    );

    // Test 5.8: High-dimensional models
    const hdModel1 = {
        'word1': Array(384).fill(0.5),
        'word2': Array(384).fill(0.3)
    };
    const hdModel2 = {
        'word1': Array(384).fill(0.51),
        'word2': Array(384).fill(0.29)
    };
    const hdComp = compareModels(hdModel1, hdModel2);
    runner.assert(
        hdComp.avgSimilarity > 0.95,
        "5.8 High-dimensional similar models should have high similarity",
        "> 0.95",
        hdComp.avgSimilarity.toFixed(5)
    );

    // Test 5.9: Cross-model word similarity
    const crossSim = crossModelWordSimilarity('cat', 'cat', model1, model2);
    runner.assertClose(
        crossSim,
        1.0,
        0.001,
        "5.9 Same word in identical models should have similarity 1.0"
    );

    // Test 5.10: Cross-model different words
    runner.assert(
        crossModelWordSimilarity('cat', 'dog', model1, model2) < 1.0,
        "5.10 Different words should have similarity < 1.0",
        "< 1.0",
        crossModelWordSimilarity('cat', 'dog', model1, model2).toFixed(3)
    );

    // Test 5.11: Empty models
    const emptyComp = compareModels({}, {});
    runner.assertEqual(
        emptyComp.count,
        0,
        "5.11 Empty models should have count 0"
    );

    // Test 5.12: Alignment in range [-1, 1]
    runner.assert(
        comp2.alignment >= -1 && comp2.alignment <= 1,
        "5.12 Alignment should be in range [-1, 1]",
        "[-1, 1]",
        comp2.alignment.toFixed(3)
    );

    // ========================================================================
    // TEST GROUP 6: HELPER FUNCTIONS (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 6: Helper Functions (8 tests) ---\n');

    // Test 6.1: Dot product
    runner.assertClose(
        dotProduct([1, 2, 3], [4, 5, 6]),
        32,
        0.001,
        "6.1 Dot product: 1*4 + 2*5 + 3*6 = 32"
    );

    // Test 6.2: Vector magnitude
    runner.assertClose(
        vectorMagnitude([3, 4]),
        5.0,
        0.001,
        "6.2 Magnitude of [3, 4] should be 5"
    );

    // Test 6.3: Normalize unit vector
    const normalized = normalizeVector([3, 4]);
    runner.assertClose(
        vectorMagnitude(normalized),
        1.0,
        0.001,
        "6.3 Normalized vector should have magnitude 1"
    );

    // Test 6.4: Normalize zero vector
    const normalizedZero = normalizeVector([0, 0, 0]);
    runner.assertArrayClose(
        normalizedZero,
        [0, 0, 0],
        0.001,
        "6.4 Normalized zero vector should remain zero"
    );

    // Test 6.5: Pearson correlation identical vectors
    runner.assertClose(
        pearsonCorrelation([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]),
        1.0,
        0.001,
        "6.5 Pearson correlation of identical vectors should be 1.0"
    );

    // Test 6.6: Pearson correlation opposite trend
    runner.assertClose(
        pearsonCorrelation([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]),
        -1.0,
        0.001,
        "6.6 Pearson correlation of opposite trends should be -1.0"
    );

    // Test 6.7: Pearson correlation moderate correlation
    const corrResult = pearsonCorrelation([1, 2, 3, 4], [2, 1, 4, 3]);
    runner.assert(
        Math.abs(corrResult) >= -1 && Math.abs(corrResult) <= 1,
        "6.7 Pearson correlation should be in valid range [-1, 1]",
        "[-1, 1]",
        corrResult.toFixed(3)
    );

    // Test 6.8: Dot product orthogonal vectors
    runner.assertClose(
        dotProduct([1, 0, 0], [0, 1, 0]),
        0.0,
        0.001,
        "6.8 Dot product of orthogonal vectors should be 0"
    );

    // ========================================================================
    // TEST GROUP 7: K-MEANS CLUSTERING (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 7: K-Means Clustering (6 tests) ---\n');

    // Test 7.1: Simple 2-cluster case
    const simpleData = [
        [0, 0],
        [0.1, 0.1],
        [10, 10],
        [10.1, 10.1]
    ];
    const clusters1 = kMeansClustering(simpleData, 2, 10);
    runner.assertEqual(
        clusters1.length,
        4,
        "7.1 Should assign cluster to each point"
    );

    // Test 7.2: All points get assigned
    runner.assert(
        clusters1.every(c => c === 0 || c === 1),
        "7.2 All cluster assignments should be valid (0 or 1)",
        "all 0 or 1",
        clusters1.join(', ')
    );

    // Test 7.3: Separated clusters should be correctly identified
    const sameCluster01 = clusters1[0] === clusters1[1];
    const sameCluster23 = clusters1[2] === clusters1[3];
    const differentClusters = clusters1[0] !== clusters1[2];
    runner.assert(
        sameCluster01 && sameCluster23 && differentClusters,
        "7.3 Clearly separated points should be in different clusters",
        "true",
        `${sameCluster01} && ${sameCluster23} && ${differentClusters}`
    );

    // Test 7.4: Single cluster
    const clusters2 = kMeansClustering([[1, 1], [2, 2]], 1, 10);
    runner.assert(
        clusters2.every(c => c === 0),
        "7.4 Single cluster should assign all to cluster 0",
        "all 0",
        clusters2.join(', ')
    );

    // Test 7.5: High-dimensional clustering
    const hdClusterData = [
        Array(384).fill(0),
        Array(384).fill(0.1),
        Array(384).fill(1),
        Array(384).fill(0.9)
    ];
    const hdClusters = kMeansClustering(hdClusterData, 2, 5);
    runner.assertEqual(
        hdClusters.length,
        4,
        "7.5 High-dimensional clustering should work"
    );

    // Test 7.6: Invalid k should throw error
    runner.assertThrows(
        () => kMeansClustering([[1, 2], [3, 4]], 0, 10),
        "7.6 k=0 should throw error"
    );

    // ========================================================================
    // TEST GROUP 8: EDGE CASES AND SPECIAL VECTORS (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 8: Edge Cases and Special Vectors (8 tests) ---\n');

    // Test 8.1: Very small numbers
    const tiny1 = [1e-10, 1e-10, 1e-10];
    const tiny2 = [1e-10, 1e-10, 1e-10];
    runner.assertClose(
        cosineSimilarity(tiny1, tiny2),
        1.0,
        0.001,
        "8.1 Very small identical values should have similarity 1.0"
    );

    // Test 8.2: Very large numbers
    const huge1 = [1e10, 1e10, 1e10];
    const huge2 = [1e10, 1e10, 1e10];
    runner.assertClose(
        cosineSimilarity(huge1, huge2),
        1.0,
        0.001,
        "8.2 Very large identical values should have similarity 1.0"
    );

    // Test 8.3: Mixed magnitude vectors
    const small = [0.001, 0.002, 0.003];
    const large = [1000, 2000, 3000];
    runner.assertClose(
        cosineSimilarity(small, large),
        1.0,
        0.001,
        "8.3 Scaled vectors regardless of magnitude should have similarity 1.0"
    );

    // Test 8.4: Single dimension vectors
    runner.assertClose(
        cosineSimilarity([5], [5]),
        1.0,
        0.001,
        "8.4 Single dimension identical vectors should have similarity 1.0"
    );

    // Test 8.5: Sparse vectors (mostly zeros)
    const sparse1 = Array(100).fill(0);
    sparse1[0] = 1;
    sparse1[50] = 1;
    const sparse2 = Array(100).fill(0);
    sparse2[0] = 1;
    sparse2[50] = 1;
    runner.assertClose(
        cosineSimilarity(sparse1, sparse2),
        1.0,
        0.001,
        "8.5 Sparse identical vectors should have similarity 1.0"
    );

    // Test 8.6: Nearly zero vector
    const nearlyZero = [1e-15, 1e-15, 1e-15];
    const normal = [1, 1, 1];
    const simNearZero = cosineSimilarity(nearlyZero, normal);
    runner.assert(
        !isNaN(simNearZero) && isFinite(simNearZero),
        "8.6 Nearly zero vector should not cause NaN or Infinity",
        "finite number",
        simNearZero
    );

    // Test 8.7: All same values
    runner.assertClose(
        cosineSimilarity([5, 5, 5], [5, 5, 5]),
        1.0,
        0.001,
        "8.7 Vectors with all same values should have similarity 1.0"
    );

    // Test 8.8: Numerical stability with normalization
    const unnorm1 = [100, 200, 300];
    const unnorm2 = [150, 250, 350];
    const norm1 = normalizeVector(unnorm1);
    const norm2 = normalizeVector(unnorm2);
    const simUnnorm = cosineSimilarity(unnorm1, unnorm2);
    const simNorm = cosineSimilarity(norm1, norm2);
    runner.assertClose(
        simUnnorm,
        simNorm,
        0.001,
        "8.8 Cosine similarity should be invariant to normalization"
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
