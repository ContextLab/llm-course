#!/usr/bin/env node
/**
 * Comprehensive test suite for Word Analogies (Demo 11)
 * Tests vector operations, similarity metrics, and analogy solving
 * Run with: node test-analogies.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the embeddings module
const embeddingsCode = await readFile(join(__dirname, '../demos/11-analogies/js/embeddings.js'), 'utf-8');
const executableCode = embeddingsCode
    .replace(/export class (\w+)/g, 'globalThis.$1 = class $1')
    .replace(/export default .+;?/g, '');
eval(executableCode);

const EmbeddingModel = globalThis.EmbeddingModel;

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
        this.skipped = 0;
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
        const equal = actual.length === expected.length &&
                     actual.every((val, i) => val === expected[i]);
        this.assert(equal, testName, expected, actual);
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

    assertVectorClose(actual, expected, tolerance, testName) {
        const allClose = actual.length === expected.length &&
                        actual.every((val, i) => Math.abs(val - expected[i]) <= tolerance);
        this.assert(allClose, testName, expected, actual);
    }

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    assertLessThan(actual, threshold, testName) {
        this.assert(actual < threshold, testName, `< ${threshold}`, actual);
    }

    assertInRange(actual, min, max, testName) {
        this.assert(
            actual >= min && actual <= max,
            testName,
            `${min} <= x <= ${max}`,
            actual
        );
    }

    assertNotNull(actual, testName) {
        this.assert(actual !== null, testName, 'not null', actual);
    }

    assertNull(actual, testName) {
        this.assert(actual === null, testName, 'null', actual);
    }

    assertTruthy(actual, testName) {
        this.assert(!!actual, testName, 'truthy', actual);
    }

    assertFalsy(actual, testName) {
        this.assert(!actual, testName, 'falsy', actual);
    }

    skip(testName) {
        this.total++;
        this.skipped++;
        console.log(`⊘ SKIP: ${testName}`);
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed, ${this.skipped} skipped`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('Word Analogies Comprehensive Test Suite (Demo 11)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // Test Group 1: Model Initialization
    // ========================================================================
    console.log('\n--- Test Group 1: Model Initialization (4 tests) ---\n');

    const testEmbeddings = {
        'king': [1.0, 0.5, 0.2],
        'queen': [0.9, 0.6, 0.3],
        'man': [0.8, 0.1, 0.1],
        'woman': [0.7, 0.2, 0.2],
        'cat': [0.1, 0.9, 0.8],
        'dog': [0.2, 0.85, 0.75]
    };

    const model = new EmbeddingModel(testEmbeddings);
    await model.initialize();

    runner.assertEqual(model.vocabularySize, 6, "1.1: Should have 6 words in vocabulary");
    runner.assertEqual(model.dimensions, 3, "1.2: Should have 3 dimensions");
    runner.assertEqual(model.words.length, 6, "1.3: Should store all 6 words");
    runner.assertTruthy(model.normalizedVectors, "1.4: Should have normalized vectors");

    // ========================================================================
    // Test Group 2: Vector Addition (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 2: Vector Addition (5 tests) ---\n');

    // 2D addition
    const v2d_1 = [1, 2];
    const v2d_2 = [3, 4];
    const sum2d = model.vectorAdd(v2d_1, v2d_2);
    runner.assertArrayEqual(sum2d, [4, 6], "2.1: 2D vector addition [1,2] + [3,4]");

    // 3D addition
    const v3d_1 = [1, 2, 3];
    const v3d_2 = [4, 5, 6];
    const sum3d = model.vectorAdd(v3d_1, v3d_2);
    runner.assertArrayEqual(sum3d, [5, 7, 9], "2.2: 3D vector addition [1,2,3] + [4,5,6]");

    // High-dimensional addition (50D)
    const v50d_1 = new Array(50).fill(1);
    const v50d_2 = new Array(50).fill(2);
    const sum50d = model.vectorAdd(v50d_1, v50d_2);
    runner.assert(
        sum50d.every(val => val === 3),
        "2.3: 50D vector addition all components should be 3",
        "all 3s",
        sum50d.slice(0, 3)
    );

    // Zero vector addition
    const vZero = [0, 0, 0];
    const vNonZero = [5, 10, 15];
    const sumZero = model.vectorAdd(vZero, vNonZero);
    runner.assertArrayEqual(sumZero, [5, 10, 15], "2.4: Adding zero vector should return original");

    // Negative values
    const vNeg1 = [1, -2, 3];
    const vNeg2 = [-1, 2, -3];
    const sumNeg = model.vectorAdd(vNeg1, vNeg2);
    runner.assertArrayEqual(sumNeg, [0, 0, 0], "2.5: Addition with negatives [1,-2,3] + [-1,2,-3]");

    // ========================================================================
    // Test Group 3: Vector Subtraction (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 3: Vector Subtraction (5 tests) ---\n');

    // 2D subtraction
    const diff2d = model.vectorSubtract([5, 7], [2, 3]);
    runner.assertArrayEqual(diff2d, [3, 4], "3.1: 2D vector subtraction [5,7] - [2,3]");

    // 3D subtraction
    const diff3d = model.vectorSubtract([10, 8, 6], [1, 2, 3]);
    runner.assertArrayEqual(diff3d, [9, 6, 3], "3.2: 3D vector subtraction [10,8,6] - [1,2,3]");

    // High-dimensional subtraction
    const v300d_1 = new Array(300).fill(5);
    const v300d_2 = new Array(300).fill(2);
    const diff300d = model.vectorSubtract(v300d_1, v300d_2);
    runner.assert(
        diff300d.every(val => val === 3),
        "3.3: 300D vector subtraction all components should be 3",
        "all 3s",
        diff300d.slice(0, 3)
    );

    // Subtracting from zero
    const diffZero = model.vectorSubtract([0, 0, 0], [1, 2, 3]);
    runner.assertArrayEqual(diffZero, [-1, -2, -3], "3.4: Subtracting from zero vector");

    // Self subtraction
    const selfDiff = model.vectorSubtract([5, 10, 15], [5, 10, 15]);
    runner.assertArrayEqual(selfDiff, [0, 0, 0], "3.5: Subtracting vector from itself should give zero");

    // ========================================================================
    // Test Group 4: Dot Product (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 4: Dot Product (5 tests) ---\n');

    // Orthogonal vectors
    const dotOrtho = model.dotProduct([1, 0, 0], [0, 1, 0]);
    runner.assertEqual(dotOrtho, 0, "4.1: Dot product of orthogonal vectors should be 0");

    // Parallel vectors
    const dotParallel = model.dotProduct([3, 4], [3, 4]);
    runner.assertEqual(dotParallel, 25, "4.2: Dot product [3,4]·[3,4] = 25");

    // General 3D
    const dot3d = model.dotProduct([1, 2, 3], [4, 5, 6]);
    runner.assertEqual(dot3d, 32, "4.3: Dot product [1,2,3]·[4,5,6] = 32");

    // High-dimensional
    const v100d = new Array(100).fill(2);
    const dotHigh = model.dotProduct(v100d, v100d);
    runner.assertEqual(dotHigh, 400, "4.4: Dot product of 100D vectors filled with 2s = 400");

    // With zero vector
    const dotZero = model.dotProduct([5, 10, 15], [0, 0, 0]);
    runner.assertEqual(dotZero, 0, "4.5: Dot product with zero vector should be 0");

    // ========================================================================
    // Test Group 5: Vector Magnitude (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 5: Vector Magnitude (8 tests) ---\n');

    // Classic 3-4-5 triangle
    const mag345 = model.vectorMagnitude([3, 4, 0]);
    runner.assertClose(mag345, 5.0, 0.001, "5.1: Magnitude of [3,4,0] should be 5");

    // Unit vector
    const magUnit = model.vectorMagnitude([1, 0, 0]);
    runner.assertClose(magUnit, 1.0, 0.001, "5.2: Magnitude of unit vector [1,0,0] should be 1");

    // Zero vector
    const magZero = model.vectorMagnitude([0, 0, 0]);
    runner.assertEqual(magZero, 0, "5.3: Magnitude of zero vector should be 0");

    // 2D vector
    const mag2d = model.vectorMagnitude([3, 4]);
    runner.assertClose(mag2d, 5.0, 0.001, "5.4: Magnitude of [3,4] should be 5");

    // 3D unit vector along diagonal
    const magDiag = model.vectorMagnitude([1, 1, 1]);
    runner.assertClose(magDiag, Math.sqrt(3), 0.001, "5.5: Magnitude of [1,1,1] should be sqrt(3)");

    // Very large magnitude
    const magLarge = model.vectorMagnitude([1e5, 1e5, 1e5]);
    runner.assertClose(magLarge, Math.sqrt(3) * 1e5, 1, "5.6: Large magnitude vector");

    // Very small magnitude
    const magSmall = model.vectorMagnitude([1e-5, 1e-5, 1e-5]);
    runner.assertClose(magSmall, Math.sqrt(3) * 1e-5, 1e-8, "5.7: Small magnitude vector");

    // High-dimensional
    const v50dUnit = new Array(50).fill(1);
    const mag50d = model.vectorMagnitude(v50dUnit);
    runner.assertClose(mag50d, Math.sqrt(50), 0.001, "5.8: Magnitude of 50D unit vector");

    // ========================================================================
    // Test Group 6: Vector Normalization (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 6: Vector Normalization (8 tests) ---\n');

    // Normalize [3,4,0]
    const norm345 = model.normalize([3, 4, 0]);
    runner.assertVectorClose(norm345, [0.6, 0.8, 0.0], 0.001, "6.1: Normalize [3,4,0] to [0.6,0.8,0]");

    // Check normalized magnitude is 1
    const normMag = model.vectorMagnitude(norm345);
    runner.assertClose(normMag, 1.0, 0.001, "6.2: Normalized vector should have magnitude 1");

    // Normalize already unit vector
    const normUnit = model.normalize([1, 0, 0]);
    runner.assertVectorClose(normUnit, [1, 0, 0], 0.001, "6.3: Normalizing unit vector should not change it");

    // Normalize zero vector (should return zero)
    const normZero = model.normalize([0, 0, 0]);
    runner.assertArrayEqual(normZero, [0, 0, 0], "6.4: Normalizing zero vector should return zero vector");

    // Normalize negative values
    const normNeg = model.normalize([-3, -4, 0]);
    runner.assertVectorClose(normNeg, [-0.6, -0.8, 0.0], 0.001, "6.5: Normalize [-3,-4,0]");

    // Normalize very large vector
    const normLarge = model.normalize([1e10, 0, 0]);
    runner.assertVectorClose(normLarge, [1, 0, 0], 0.001, "6.6: Normalize very large vector [1e10,0,0]");

    // Normalize very small vector
    const normSmall = model.normalize([1e-10, 0, 0]);
    runner.assertVectorClose(normSmall, [1, 0, 0], 0.001, "6.7: Normalize very small vector [1e-10,0,0]");

    // Normalize high-dimensional
    const v10d = new Array(10).fill(1);
    const norm10d = model.normalize(v10d);
    const norm10dMag = model.vectorMagnitude(norm10d);
    runner.assertClose(norm10dMag, 1.0, 0.001, "6.8: Normalized 10D vector should have magnitude 1");

    // ========================================================================
    // Test Group 7: Cosine Similarity - Basic Cases (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 7: Cosine Similarity - Basic Cases (10 tests) ---\n');

    // Identical vectors
    const simIdentical = model.cosineSimilarity([1, 2, 3], [1, 2, 3]);
    runner.assertClose(simIdentical, 1.0, 0.001, "7.1: Identical vectors should have similarity 1.0");

    // Orthogonal vectors (2D)
    const simOrtho2d = model.cosineSimilarity([1, 0], [0, 1]);
    runner.assertClose(simOrtho2d, 0.0, 0.001, "7.2: Orthogonal 2D vectors should have similarity 0.0");

    // Orthogonal vectors (3D)
    const simOrtho3d = model.cosineSimilarity([1, 0, 0], [0, 1, 0]);
    runner.assertClose(simOrtho3d, 0.0, 0.001, "7.3: Orthogonal 3D vectors should have similarity 0.0");

    // Opposite vectors
    const simOpposite = model.cosineSimilarity([1, 2, 3], [-1, -2, -3]);
    runner.assertClose(simOpposite, -1.0, 0.001, "7.4: Opposite vectors should have similarity -1.0");

    // Similar but scaled
    const simScaled = model.cosineSimilarity([1, 2, 3], [2, 4, 6]);
    runner.assertClose(simScaled, 1.0, 0.001, "7.5: Scaled vectors should have similarity 1.0");

    // Similar vectors (45 degrees)
    const sim45 = model.cosineSimilarity([1, 0], [1, 1]);
    runner.assertClose(sim45, Math.sqrt(2)/2, 0.001, "7.6: Vectors at 45° should have similarity sqrt(2)/2");

    // Zero vector with non-zero (should handle gracefully)
    const simZero1 = model.cosineSimilarity([0, 0, 0], [1, 2, 3]);
    runner.assertEqual(simZero1, 0, "7.7: Similarity with zero vector should be 0");

    // Both zero vectors
    const simZero2 = model.cosineSimilarity([0, 0, 0], [0, 0, 0]);
    runner.assertEqual(simZero2, 0, "7.8: Similarity of two zero vectors should be 0");

    // High-dimensional identical
    const v100dSame = new Array(100).fill(3);
    const simHighIdent = model.cosineSimilarity(v100dSame, v100dSame);
    runner.assertClose(simHighIdent, 1.0, 0.001, "7.9: High-dimensional identical vectors");

    // Negative similarity
    const simNeg = model.cosineSimilarity([1, 2, 3], [-2, -4, -5]);
    runner.assertLessThan(simNeg, 0, "7.10: Should have negative similarity for opposite-ish vectors");

    // ========================================================================
    // Test Group 8: Cosine Similarity - Bounds & Edge Cases (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 8: Cosine Similarity - Bounds & Edge Cases (5 tests) ---\n');

    // Verify bounds [-1, 1] for random vectors
    const randVec1 = [0.5, 0.7, 0.3];
    const randVec2 = [0.2, 0.9, 0.1];
    const simRand = model.cosineSimilarity(randVec1, randVec2);
    runner.assertInRange(simRand, -1, 1, "8.1: Cosine similarity should be in range [-1, 1]");

    // Very similar but not identical
    const simAlmost = model.cosineSimilarity([1.0, 2.0, 3.0], [1.001, 2.001, 3.001]);
    runner.assertGreaterThan(simAlmost, 0.999, "8.2: Very similar vectors should have similarity > 0.999");

    // Perpendicular high-dimensional
    const vPerp1 = [1, 0, 0, 0, 0];
    const vPerp2 = [0, 1, 0, 0, 0];
    const simPerp = model.cosineSimilarity(vPerp1, vPerp2);
    runner.assertClose(simPerp, 0.0, 0.001, "8.3: Perpendicular high-dim vectors");

    // Mixed positive and negative
    const simMixed = model.cosineSimilarity([1, -1, 1, -1], [1, 1, 1, 1]);
    runner.assertEqual(simMixed, 0, "8.4: Mixed components should give 0 similarity");

    // Large magnitude vectors
    const vLarge1 = [1e8, 2e8, 3e8];
    const vLarge2 = [1e8, 2e8, 3e8];
    const simLarge = model.cosineSimilarity(vLarge1, vLarge2);
    runner.assertClose(simLarge, 1.0, 0.001, "8.5: Large magnitude identical vectors");

    // ========================================================================
    // Test Group 9: Word Similarity (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 9: Word Similarity (4 tests) ---\n');

    const kingVec = model.getVector('king');
    const queenVec = model.getVector('queen');
    const manVec = model.getVector('man');
    const catVec = model.getVector('cat');

    const kingQueenSim = model.cosineSimilarity(kingVec, queenVec);
    runner.assertGreaterThan(kingQueenSim, 0.9, "9.1: King and queen should be very similar (> 0.9)");

    const kingManSim = model.cosineSimilarity(kingVec, manVec);
    runner.assertGreaterThan(kingManSim, 0.8, "9.2: King and man should be similar (> 0.8)");

    const kingCatSim = model.cosineSimilarity(kingVec, catVec);
    runner.assert(
        kingCatSim < kingQueenSim,
        "9.3: King should be more similar to queen than to cat",
        `sim(king,queen) > sim(king,cat)`,
        `${kingQueenSim.toFixed(3)} vs ${kingCatSim.toFixed(3)}`
    );

    const catDogSim = model.cosineSimilarity(
        model.getVector('cat'),
        model.getVector('dog')
    );
    runner.assertGreaterThan(catDogSim, 0.9, "9.4: Cat and dog should be very similar (> 0.9)");

    // ========================================================================
    // Test Group 10: Vocabulary Operations (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 10: Vocabulary Operations (8 tests) ---\n');

    // Word existence - lowercase
    runner.assert(model.hasWord('king'), "10.1: Should have 'king' in vocabulary", true, true);

    // Word existence - uppercase (case insensitive)
    runner.assert(model.hasWord('KING'), "10.2: Should handle 'KING' (case insensitive)", true, model.hasWord('KING'));

    // Word existence - mixed case
    runner.assert(model.hasWord('QuEeN'), "10.3: Should handle 'QuEeN' (case insensitive)", true, model.hasWord('QuEeN'));

    // Non-existent word
    runner.assert(!model.hasWord('unknown'), "10.4: Should not have 'unknown'", false, false);

    // Get vector - valid word
    const vecKing = model.getVector('king');
    runner.assertNotNull(vecKing, "10.5: Should retrieve vector for 'king'");

    // Get vector - case insensitive
    const vecKingUpper = model.getVector('KING');
    runner.assertNotNull(vecKingUpper, "10.6: Should retrieve vector for 'KING'");

    // Get vector - unknown word
    const vecUnknown = model.getVector('nonexistent');
    runner.assertNull(vecUnknown, "10.7: Should return null for unknown word");

    // Vector dimensions match
    runner.assertEqual(vecKing.length, 3, "10.8: Retrieved vector should have correct dimensions");

    // ========================================================================
    // Test Group 11: Nearest Neighbors - Basic (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 11: Nearest Neighbors - Basic (6 tests) ---\n');

    if (typeof model.findNearestNeighbors === 'function') {
        // k=1
        const neighbors1 = model.findNearestNeighbors(kingVec, 1, new Set(['king']));
        runner.assertEqual(neighbors1.length, 1, "11.1: Should return exactly 1 neighbor when k=1");

        // k=5
        const neighbors5 = model.findNearestNeighbors(kingVec, 5, new Set(['king']));
        runner.assertLessThan(neighbors5.length, 6, "11.2: Should return at most 5 neighbors (excluding king)");

        // k=10 (more than available)
        const neighbors10 = model.findNearestNeighbors(kingVec, 10, new Set(['king']));
        runner.assertEqual(neighbors10.length, 5, "11.3: Should return 5 neighbors (all available except king)");

        // Exclude query word
        const neighborsExclude = model.findNearestNeighbors(kingVec, 3, new Set(['king']));
        const hasKing = neighborsExclude.some(n => n.word === 'king');
        runner.assert(!hasKing, "11.4: Should exclude 'king' from results", false, hasKing);

        // Check result structure
        runner.assert(
            neighbors1[0].hasOwnProperty('word') && neighbors1[0].hasOwnProperty('similarity'),
            "11.5: Results should have 'word' and 'similarity' properties",
            true,
            true
        );

        // Check ordering (highest similarity first)
        const neighbors3 = model.findNearestNeighbors(kingVec, 3, new Set(['king']));
        const isDescending = neighbors3.every((item, i) =>
            i === 0 || item.similarity <= neighbors3[i-1].similarity
        );
        runner.assert(isDescending, "11.6: Results should be ordered by similarity (descending)", true, isDescending);
    } else {
        runner.skip("11.1-11.6: findNearestNeighbors method not available");
    }

    // ========================================================================
    // Test Group 12: Nearest Neighbors - Edge Cases (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 12: Nearest Neighbors - Edge Cases (4 tests) ---\n');

    if (typeof model.findNearestNeighbors === 'function') {
        // Empty exclude set
        const neighborsNoExclude = model.findNearestNeighbors(kingVec, 3, new Set());
        runner.assertEqual(neighborsNoExclude.length, 3, "12.1: Should work with empty exclude set");

        // Exclude multiple words
        const neighborsMultiExclude = model.findNearestNeighbors(
            kingVec,
            5,
            new Set(['king', 'queen', 'man'])
        );
        const hasExcluded = neighborsMultiExclude.some(n =>
            ['king', 'queen', 'man'].includes(n.word)
        );
        runner.assert(!hasExcluded, "12.2: Should exclude multiple words", false, hasExcluded);

        // k=0
        const neighbors0 = model.findNearestNeighbors(kingVec, 0, new Set(['king']));
        runner.assertEqual(neighbors0.length, 0, "12.3: Should return empty array when k=0");

        // All similarities should be in valid range (with small tolerance for floating point)
        const neighborsAll = model.findNearestNeighbors(kingVec, 10, new Set());
        const allValid = neighborsAll.every(n => n.similarity >= -1.001 && n.similarity <= 1.001);
        runner.assert(allValid, "12.4: All similarities should be in [-1, 1]", true, allValid);
    } else {
        runner.skip("12.1-12.4: findNearestNeighbors method not available");
    }

    // ========================================================================
    // Test Group 13: Find Similar Words (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 13: Find Similar Words (5 tests) ---\n');

    if (typeof model.findSimilar === 'function') {
        // Basic findSimilar
        const similar1 = model.findSimilar('king', 3);
        runner.assertNotNull(similar1, "13.1: findSimilar should return results");

        if (similar1) {
            runner.assertEqual(similar1.length, 3, "13.2: Should return 3 similar words");

            // Should not include query word
            const hasSelf = similar1.some(s => s.word === 'king');
            runner.assert(!hasSelf, "13.3: Should not include query word in results", false, hasSelf);

            // Check structure
            const hasProps = similar1.every(s => s.hasOwnProperty('word') && s.hasOwnProperty('similarity'));
            runner.assert(hasProps, "13.4: Results should have word and similarity", true, hasProps);
        } else {
            runner.skip("13.2-13.4: findSimilar returned null");
        }

        // Unknown word
        const similarUnknown = model.findSimilar('unknown', 3);
        runner.assertNull(similarUnknown, "13.5: Should return null for unknown word");
    } else {
        runner.skip("13.1-13.5: findSimilar method not available");
    }

    // ========================================================================
    // Test Group 14: Analogy Solving - Basic (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 14: Analogy Solving - Basic (8 tests) ---\n');

    if (typeof model.solveAnalogy === 'function') {
        // Classic analogy: king - man + woman
        const analogy1 = model.solveAnalogy('king', 'man', 'woman', 3);
        runner.assertNotNull(analogy1, "14.1: Should solve king - man + woman analogy");

        if (analogy1) {
            runner.assertTruthy(analogy1.predictions, "14.2: Should have predictions");
            runner.assert(
                Array.isArray(analogy1.predictions),
                "14.3: Predictions should be an array",
                true,
                Array.isArray(analogy1.predictions)
            );
            runner.assert(
                analogy1.predictions.length <= 3,
                "14.4: Should return at most 3 predictions",
                "<= 3",
                analogy1.predictions.length
            );

            // Check that input words are excluded
            const hasInputWords = analogy1.predictions.some(p =>
                ['king', 'man', 'woman'].includes(p.word)
            );
            runner.assert(
                !hasInputWords,
                "14.5: Should exclude input words from predictions",
                false,
                hasInputWords
            );

            // Check result vector exists
            runner.assertTruthy(analogy1.resultVector, "14.6: Should have result vector");

            // Check intermediate vectors
            runner.assertTruthy(analogy1.intermediateVectors, "14.7: Should have intermediate vectors");
        } else {
            runner.skip("14.2-14.7: analogy returned null");
        }

        // Different topK value
        const analogy2 = model.solveAnalogy('cat', 'dog', 'king', 5);
        if (analogy2 && analogy2.predictions) {
            runner.assert(
                analogy2.predictions.length <= 5,
                "14.8: Should respect topK parameter",
                "<= 5",
                analogy2.predictions.length
            );
        } else {
            runner.skip("14.8: analogy returned null");
        }
    } else {
        runner.skip("14.1-14.8: solveAnalogy method not available");
    }

    // ========================================================================
    // Test Group 15: Analogy Solving - Edge Cases (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 15: Analogy Solving - Edge Cases (5 tests) ---\n');

    if (typeof model.solveAnalogy === 'function') {
        // Unknown word A
        const analogyUnknown1 = model.solveAnalogy('unknown', 'man', 'woman', 3);
        runner.assertNull(analogyUnknown1, "15.1: Should return null when word A is unknown");

        // Unknown word B
        const analogyUnknown2 = model.solveAnalogy('king', 'unknown', 'woman', 3);
        runner.assertNull(analogyUnknown2, "15.2: Should return null when word B is unknown");

        // Unknown word C
        const analogyUnknown3 = model.solveAnalogy('king', 'man', 'unknown', 3);
        runner.assertNull(analogyUnknown3, "15.3: Should return null when word C is unknown");

        // Case insensitivity
        const analogyCase = model.solveAnalogy('KING', 'MAN', 'WOMAN', 2);
        runner.assertNotNull(analogyCase, "15.4: Should handle uppercase words");

        // topK = 1
        const analogy1Result = model.solveAnalogy('king', 'man', 'woman', 1);
        if (analogy1Result && analogy1Result.predictions) {
            runner.assertEqual(
                analogy1Result.predictions.length,
                1,
                "15.5: Should return exactly 1 prediction when topK=1"
            );
        } else {
            runner.skip("15.5: analogy returned null");
        }
    } else {
        runner.skip("15.1-15.5: solveAnalogy method not available");
    }

    // ========================================================================
    // Test Group 16: Dimensionality Tests (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 16: Dimensionality Tests (6 tests) ---\n');

    // 2D embeddings
    const embeddings2D = {
        'a': [1, 0],
        'b': [0, 1],
        'c': [1, 1]
    };
    const model2D = new EmbeddingModel(embeddings2D);
    await model2D.initialize();
    runner.assertEqual(model2D.dimensions, 2, "16.1: Should handle 2D embeddings");

    // 50D embeddings
    const embeddings50D = {
        'x': new Array(50).fill(1),
        'y': new Array(50).fill(2)
    };
    const model50D = new EmbeddingModel(embeddings50D);
    await model50D.initialize();
    runner.assertEqual(model50D.dimensions, 50, "16.2: Should handle 50D embeddings");

    // 300D embeddings (common for word2vec)
    const embeddings300D = {
        'w1': new Array(300).fill(0.1),
        'w2': new Array(300).fill(0.2)
    };
    const model300D = new EmbeddingModel(embeddings300D);
    await model300D.initialize();
    runner.assertEqual(model300D.dimensions, 300, "16.3: Should handle 300D embeddings");

    // Operations maintain dimensionality
    const sum2D = model2D.vectorAdd([1, 2], [3, 4]);
    runner.assertEqual(sum2D.length, 2, "16.4: Vector operations should maintain dimensionality (2D)");

    const norm50D = model50D.normalize(new Array(50).fill(3));
    runner.assertEqual(norm50D.length, 50, "16.5: Normalization should maintain dimensionality (50D)");

    const mag300D = model300D.vectorMagnitude(new Array(300).fill(1));
    runner.assertGreaterThan(mag300D, 0, "16.6: Should compute magnitude for 300D vectors");

    // ========================================================================
    // Test Group 17: Edge Cases - Zero Vectors (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 17: Edge Cases - Zero Vectors (5 tests) ---\n');

    const zeroVec3d = [0, 0, 0];
    const nonZeroVec = [1, 2, 3];

    // Add zero vector
    const addZero = model.vectorAdd(zeroVec3d, nonZeroVec);
    runner.assertArrayEqual(addZero, [1, 2, 3], "17.1: Adding zero vector should not change vector");

    // Subtract zero vector
    const subZero = model.vectorSubtract(nonZeroVec, zeroVec3d);
    runner.assertArrayEqual(subZero, [1, 2, 3], "17.2: Subtracting zero vector should not change vector");

    // Magnitude of zero
    const magZeroTest = model.vectorMagnitude(zeroVec3d);
    runner.assertEqual(magZeroTest, 0, "17.3: Magnitude of zero vector is 0");

    // Normalize zero vector
    const normZeroTest = model.normalize(zeroVec3d);
    runner.assertArrayEqual(normZeroTest, [0, 0, 0], "17.4: Normalized zero vector is still zero");

    // Dot product with zero
    const dotZeroTest = model.dotProduct(nonZeroVec, zeroVec3d);
    runner.assertEqual(dotZeroTest, 0, "17.5: Dot product with zero vector is 0");

    // ========================================================================
    // Test Group 18: Edge Cases - Large Magnitudes (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 18: Edge Cases - Large Magnitudes (4 tests) ---\n');

    const veryLarge = [1e10, 2e10, 3e10];

    // Magnitude of large vector
    const magVeryLarge = model.vectorMagnitude(veryLarge);
    runner.assertGreaterThan(magVeryLarge, 1e10, "18.1: Should handle very large magnitude");

    // Normalize large vector
    const normVeryLarge = model.normalize(veryLarge);
    const normVeryLargeMag = model.vectorMagnitude(normVeryLarge);
    runner.assertClose(normVeryLargeMag, 1.0, 0.01, "18.2: Should normalize very large vector to unit length");

    // Cosine similarity with large vectors
    const simVeryLarge = model.cosineSimilarity(veryLarge, veryLarge);
    runner.assertClose(simVeryLarge, 1.0, 0.001, "18.3: Cosine similarity of identical large vectors");

    // Add large vectors
    const sumVeryLarge = model.vectorAdd(veryLarge, veryLarge);
    runner.assertArrayEqual(sumVeryLarge, [2e10, 4e10, 6e10], "18.4: Should add very large vectors");

    // ========================================================================
    // Test Group 19: Edge Cases - Small Magnitudes (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 19: Edge Cases - Small Magnitudes (4 tests) ---\n');

    const verySmall = [1e-10, 2e-10, 3e-10];

    // Magnitude of small vector
    const magVerySmall = model.vectorMagnitude(verySmall);
    runner.assertGreaterThan(magVerySmall, 0, "19.1: Should handle very small magnitude");

    // Normalize small vector
    const normVerySmall = model.normalize(verySmall);
    const normVerySmallMag = model.vectorMagnitude(normVerySmall);
    runner.assertClose(normVerySmallMag, 1.0, 0.01, "19.2: Should normalize very small vector to unit length");

    // Cosine similarity with small vectors
    const simVerySmall = model.cosineSimilarity(verySmall, verySmall);
    runner.assertClose(simVerySmall, 1.0, 0.001, "19.3: Cosine similarity of identical small vectors");

    // Add small vectors
    const sumVerySmall = model.vectorAdd(verySmall, verySmall);
    runner.assertVectorClose(sumVerySmall, [2e-10, 4e-10, 6e-10], 1e-11, "19.4: Should add very small vectors");

    // ========================================================================
    // Test Group 20: Edge Cases - Single Word Vocabulary (3 tests)
    // ========================================================================
    console.log('\n--- Test Group 20: Edge Cases - Single Word Vocabulary (3 tests) ---\n');

    const singleWordEmbeddings = {
        'only': [1, 2, 3]
    };
    const singleModel = new EmbeddingModel(singleWordEmbeddings);
    await singleModel.initialize();

    runner.assertEqual(singleModel.vocabularySize, 1, "20.1: Single word vocabulary should have size 1");
    runner.assertTruthy(singleModel.hasWord('only'), "20.2: Should find the single word");

    if (typeof singleModel.findNearestNeighbors === 'function') {
        const singleNeighbors = singleModel.findNearestNeighbors([1, 2, 3], 5, new Set(['only']));
        runner.assertEqual(singleNeighbors.length, 0, "20.3: Should return no neighbors when all excluded");
    } else {
        runner.skip("20.3: findNearestNeighbors not available");
    }

    // ========================================================================
    // Test Group 21: Additional Vector Operations (3 tests)
    // ========================================================================
    console.log('\n--- Test Group 21: Additional Vector Operations (3 tests) ---\n');

    // Commutative property of addition
    const vA = [1, 2, 3];
    const vB = [4, 5, 6];
    const sumAB = model.vectorAdd(vA, vB);
    const sumBA = model.vectorAdd(vB, vA);
    runner.assertArrayEqual(sumAB, sumBA, "21.1: Vector addition should be commutative");

    // Associative property of addition
    const vC = [7, 8, 9];
    const sumAB_C = model.vectorAdd(sumAB, vC);
    const sumBC = model.vectorAdd(vB, vC);
    const sumA_BC = model.vectorAdd(vA, sumBC);
    runner.assertArrayEqual(sumAB_C, sumA_BC, "21.2: Vector addition should be associative");

    // Dot product symmetry
    const dotAB = model.dotProduct(vA, vB);
    const dotBA = model.dotProduct(vB, vA);
    runner.assertEqual(dotAB, dotBA, "21.3: Dot product should be symmetric");

    // ========================================================================
    // Test Group 22: Helper Methods (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 22: Helper Methods (4 tests) ---\n');

    if (typeof model.computeMean === 'function') {
        // Compute mean
        const vectors = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        const mean = model.computeMean(vectors);
        runner.assertVectorClose(mean, [4, 5, 6], 0.001, "22.1: Should compute mean of vectors");

        // Mean of single vector
        const meanSingle = model.computeMean([[5, 10, 15]]);
        runner.assertArrayEqual(meanSingle, [5, 10, 15], "22.2: Mean of single vector is itself");
    } else {
        runner.skip("22.1-22.2: computeMean not available");
    }

    if (typeof model.getRandomWords === 'function') {
        // Get random words
        const randomWords = model.getRandomWords(3);
        runner.assertEqual(randomWords.length, 3, "22.3: Should return 3 random words");

        const allValid = randomWords.every(word => model.hasWord(word));
        runner.assert(allValid, "22.4: Random words should all be in vocabulary", true, allValid);
    } else {
        runner.skip("22.3-22.4: getRandomWords not available");
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
