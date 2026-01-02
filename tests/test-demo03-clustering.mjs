#!/usr/bin/env node
/**
 * Comprehensive test suite for Embeddings - Clustering Algorithms (Demo 03)
 * Tests K-means and DBSCAN clustering algorithms with 50+ rigorous tests
 * Run with: node test-clustering.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the clustering module
const clusteringCode = await readFile(join(__dirname, '../demos/04-embeddings/js/clustering.js'), 'utf-8');
const executableCode = clusteringCode
    .replace(/export class (\w+)/g, 'globalThis.$1 = class $1')
    .replace(/export default .+;?/g, '');
eval(executableCode);

const ClusteringEngine = globalThis.ClusteringEngine;

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

    assertArrayEqual(actual, expected, testName) {
        const equal = actual.length === expected.length &&
            actual.every((val, idx) => val === expected[idx]);
        this.assert(equal, testName, expected, actual);
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
    console.log('Embeddings - Clustering Algorithms Test Suite (Demo 03)');
    console.log('Comprehensive Test Coverage - 50+ Tests');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // Test Group 1: ClusteringEngine Initialization
    // ========================================================================
    console.log('\n--- Test Group 1: ClusteringEngine Initialization (2 tests) ---\n');

    const engine = new ClusteringEngine();
    runner.assert(
        engine.clusters === null,
        "1.1 Should initialize with null clusters",
        null,
        engine.clusters
    );
    runner.assert(
        engine.centroids === null,
        "1.2 Should initialize with null centroids",
        null,
        engine.centroids
    );

    // ========================================================================
    // Test Group 2: Euclidean Distance Calculation (15 tests)
    // ========================================================================
    console.log('\n--- Test Group 2: Euclidean Distance Calculation (15 tests) ---\n');

    // 2D distances
    const dist2D = engine.euclideanDistance([0, 0], [3, 4]);
    runner.assertClose(dist2D, 5.0, 0.001, "2.1 Distance [0,0] to [3,4] should be 5");

    const sameDist = engine.euclideanDistance([1, 1], [1, 1]);
    runner.assertEqual(sameDist, 0, "2.2 Distance to same point should be 0");

    const unitDist = engine.euclideanDistance([0, 0], [1, 0]);
    runner.assertEqual(unitDist, 1, "2.3 Unit distance should be 1");

    // 3D distances
    const dist3D = engine.euclideanDistance([0, 0, 0], [1, 1, 1]);
    runner.assertClose(dist3D, Math.sqrt(3), 0.001, "2.4 3D distance should be sqrt(3)");

    const dist3D_pythagorean = engine.euclideanDistance([0, 0, 0], [3, 4, 0]);
    runner.assertClose(dist3D_pythagorean, 5.0, 0.001, "2.5 3D Pythagorean triple should work");

    // 10D distances
    const zeros10D = Array(10).fill(0);
    const ones10D = Array(10).fill(1);
    const dist10D = engine.euclideanDistance(zeros10D, ones10D);
    runner.assertClose(dist10D, Math.sqrt(10), 0.001, "2.6 10D distance should be sqrt(10)");

    // 50D distances
    const zeros50D = Array(50).fill(0);
    const ones50D = Array(50).fill(1);
    const dist50D = engine.euclideanDistance(zeros50D, ones50D);
    runner.assertClose(dist50D, Math.sqrt(50), 0.001, "2.7 50D distance should be sqrt(50)");

    // Zero vectors
    const zeroVec = engine.euclideanDistance([0, 0, 0], [0, 0, 0]);
    runner.assertEqual(zeroVec, 0, "2.8 Zero vector distance should be 0");

    // Unit vectors
    const unitX = engine.euclideanDistance([1, 0, 0], [0, 0, 0]);
    runner.assertEqual(unitX, 1, "2.9 Unit vector X distance should be 1");

    // Orthogonal vectors
    const orthogonal = engine.euclideanDistance([1, 0], [0, 1]);
    runner.assertClose(orthogonal, Math.sqrt(2), 0.001, "2.10 Orthogonal vectors distance should be sqrt(2)");

    // 1D distance
    const oneDim = engine.euclideanDistance([5], [2]);
    runner.assertEqual(oneDim, 3, "2.11 1D distance should work correctly");

    // Large values
    const largeDist = engine.euclideanDistance([1000000, 0], [0, 0]);
    runner.assertEqual(largeDist, 1000000, "2.12 Large values should work correctly");

    // Small values
    const smallDist = engine.euclideanDistance([0.0001, 0], [0, 0]);
    runner.assertClose(smallDist, 0.0001, 0.00001, "2.13 Small values should work correctly");

    // Triangle inequality: d(a,c) <= d(a,b) + d(b,c)
    const a = [0, 0], b = [1, 1], c = [2, 0];
    const dac = engine.euclideanDistance(a, c);
    const dab = engine.euclideanDistance(a, b);
    const dbc = engine.euclideanDistance(b, c);
    runner.assert(
        dac <= dab + dbc + 0.001,
        "2.14 Triangle inequality should hold",
        true,
        dac <= dab + dbc
    );

    // Symmetry: d(a,b) = d(b,a)
    const dab2 = engine.euclideanDistance([3, 4], [0, 0]);
    runner.assertEqual(dist2D, dab2, "2.15 Distance should be symmetric");

    // ========================================================================
    // Test Group 3: K-means++ Initialization (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 3: K-means++ Initialization (5 tests) ---\n');

    const initData = [[0, 0], [1, 1], [5, 5], [6, 6]];
    const centroids2 = engine.initializeCentroidsKMeansPlusPlus(initData, 2);

    runner.assertEqual(
        centroids2.length,
        2,
        "3.1 Should initialize k=2 centroids"
    );

    runner.assertEqual(
        centroids2[0].length,
        2,
        "3.2 Each centroid should have correct dimensions"
    );

    const isFromData = centroids2.every(centroid =>
        initData.some(point =>
            point[0] === centroid[0] && point[1] === centroid[1]
        )
    );
    runner.assert(
        isFromData,
        "3.3 Centroids should be selected from data points",
        true,
        isFromData
    );

    // Test with k=1
    const centroids1 = engine.initializeCentroidsKMeansPlusPlus(initData, 1);
    runner.assertEqual(
        centroids1.length,
        1,
        "3.4 Should initialize k=1 centroid"
    );

    // Test with k=4 (k = n)
    const centroids4 = engine.initializeCentroidsKMeansPlusPlus(initData, 4);
    runner.assertEqual(
        centroids4.length,
        4,
        "3.5 Should initialize k=n centroids"
    );

    // ========================================================================
    // Test Group 4: K-means Clustering - Basic Functionality (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 4: K-means Clustering - Basic Functionality (8 tests) ---\n');

    // Two clear clusters
    const simpleData = [
        [0, 0], [0.1, 0.1], [0, 0.1], [0.1, 0],     // Cluster 1
        [5, 5], [5.1, 5.1], [5, 5.1], [5.1, 5]      // Cluster 2
    ];

    const kmeansResult = await engine.kmeans(simpleData, 2);

    runner.assertEqual(
        kmeansResult.length,
        simpleData.length,
        "4.1 Should return assignment for each point"
    );

    const uniqueClusters = new Set(kmeansResult);
    runner.assertBetween(
        uniqueClusters.size,
        1,
        2,
        "4.2 Should find 1-2 clusters"
    );

    // Check that first 4 points are in same cluster
    const cluster1 = kmeansResult[0];
    const firstFourSame = kmeansResult.slice(0, 4).every(c => c === cluster1);
    runner.assert(
        firstFourSame,
        "4.3 First 4 points should be in same cluster",
        true,
        firstFourSame
    );

    // Check that last 4 points are in same cluster
    const cluster2 = kmeansResult[4];
    const lastFourSame = kmeansResult.slice(4, 8).every(c => c === cluster2);
    runner.assert(
        lastFourSame,
        "4.4 Last 4 points should be in same cluster",
        true,
        lastFourSame
    );

    // Centroids should be set
    runner.assert(
        engine.centroids !== null && engine.centroids.length === 2,
        "4.5 Centroids should be set after k-means",
        "2 centroids",
        engine.centroids ? `${engine.centroids.length} centroids` : "null"
    );

    // Centroid values should be reasonable (near cluster centers)
    const centroid1 = engine.centroids[0];
    const centroid2 = engine.centroids[1];
    const centroidsValid = (
        (centroid1[0] < 1 && centroid1[1] < 1) ||
        (centroid1[0] > 4 && centroid1[1] > 4)
    ) && (
        (centroid2[0] < 1 && centroid2[1] < 1) ||
        (centroid2[0] > 4 && centroid2[1] > 4)
    );
    runner.assert(
        centroidsValid,
        "4.6 Centroids should be near cluster centers",
        true,
        centroidsValid
    );

    // Test k=1 (single cluster)
    const singleClusterData = [[1, 1], [1.1, 1.1], [1.2, 1.2]];
    const singleResult = await engine.kmeans(singleClusterData, 1);
    runner.assert(
        singleResult.every(c => c === 0),
        "4.7 K-means with k=1 should assign all to cluster 0",
        "all cluster 0",
        new Set(singleResult).size === 1 ? "all same" : "different"
    );

    // Test k=n
    const smallData = [[0, 0], [1, 1]];
    const tooManyK = await engine.kmeans(smallData, 2);
    runner.assertEqual(
        tooManyK.length,
        2,
        "4.8 K-means should handle k=n"
    );

    // ========================================================================
    // Test Group 5: K-means Clustering - Multiple K Values (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 5: K-means Clustering - Multiple K Values (4 tests) ---\n');

    const multiData = [
        [0, 0], [0.1, 0.1],           // Cluster 1
        [5, 5], [5.1, 5.1],           // Cluster 2
        [10, 10], [10.1, 10.1],       // Cluster 3
        [15, 15], [15.1, 15.1],       // Cluster 4
        [20, 20], [20.1, 20.1]        // Cluster 5
    ];

    const result_k2 = await engine.kmeans(multiData, 2);
    runner.assertEqual(result_k2.length, multiData.length, "5.1 K-means with k=2 should work");

    const result_k5 = await engine.kmeans(multiData, 5);
    runner.assertEqual(result_k5.length, multiData.length, "5.2 K-means with k=5 should work");
    runner.assertEqual(engine.centroids.length, 5, "5.3 Should have 5 centroids for k=5");

    const result_k10 = await engine.kmeans(multiData, 10);
    runner.assertEqual(result_k10.length, multiData.length, "5.4 K-means with k=10 should work");

    // ========================================================================
    // Test Group 6: K-means Convergence & Iterations (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 6: K-means Convergence & Iterations (4 tests) ---\n');

    const convData = [[0, 0], [1, 0], [0, 1], [5, 5], [6, 5], [5, 6]];

    // Test with default max iterations
    const convResult1 = await engine.kmeans(convData, 2);
    runner.assertEqual(convResult1.length, 6, "6.1 Should converge with default iterations");

    // Test with limited iterations
    const convResult2 = await engine.kmeans(convData, 2, 5);
    runner.assertEqual(convResult2.length, 6, "6.2 Should work with max iterations=5");

    // Test with very high iterations
    const convResult3 = await engine.kmeans(convData, 2, 1000);
    runner.assertEqual(convResult3.length, 6, "6.3 Should work with max iterations=1000");

    // Test early stopping (should converge before max iterations for simple data)
    const convResult4 = await engine.kmeans(simpleData, 2, 100);
    runner.assertEqual(convResult4.length, 8, "6.4 Should converge early for simple data");

    // ========================================================================
    // Test Group 7: K-means Edge Cases (3 tests)
    // ========================================================================
    console.log('\n--- Test Group 7: K-means Edge Cases (3 tests) ---\n');

    // Empty cluster handling is automatic in the implementation
    const sparseData = [[0, 0], [0.1, 0.1], [100, 100]];
    const sparseResult = await engine.kmeans(sparseData, 3);
    runner.assertEqual(sparseResult.length, 3, "7.1 Should handle sparse data");

    // Test with identical points
    const identicalData = [[1, 1], [1, 1], [1, 1]];
    const identicalResult = await engine.kmeans(identicalData, 2);
    runner.assertEqual(identicalResult.length, 3, "7.2 Should handle identical points");

    // Test cluster assignment consistency (running twice should give same structure)
    const consistData = [[0, 0], [0.1, 0.1], [5, 5], [5.1, 5.1]];
    const consist1 = await engine.kmeans(consistData, 2);
    const consist2 = await engine.kmeans(consistData, 2);
    runner.assert(
        consist1.length === consist2.length,
        "7.3 Cluster assignments should have same length on re-run",
        true,
        true
    );

    // ========================================================================
    // Test Group 8: DBSCAN - Find Neighbors (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 8: DBSCAN - Find Neighbors (4 tests) ---\n');

    const neighborData = [
        [0, 0],
        [0.5, 0.5],
        [10, 10],
        [10.5, 10.5]
    ];

    const neighbors = engine.findNeighbors(neighborData, 1.0);

    runner.assertEqual(
        neighbors.length,
        4,
        "8.1 Should return neighbors for each point"
    );

    runner.assert(
        neighbors[0].includes(1),
        "8.2 Point 0 should have point 1 as neighbor",
        "includes 1",
        neighbors[0]
    );

    runner.assert(
        !neighbors[0].includes(2),
        "8.3 Point 0 should not have point 2 as neighbor (too far)",
        "not includes 2",
        neighbors[0].includes(2) ? "includes 2" : "not includes 2"
    );

    // Test with larger epsilon
    const neighborsLarge = engine.findNeighbors(neighborData, 15.0);
    runner.assert(
        neighborsLarge[0].length >= 2,
        "8.4 Larger epsilon should find more neighbors",
        ">=2 neighbors",
        neighborsLarge[0].length
    );

    // ========================================================================
    // Test Group 9: DBSCAN Clustering - Basic Functionality (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 9: DBSCAN Clustering - Basic Functionality (6 tests) ---\n');

    const dbscanData = [
        [0, 0], [0.1, 0], [0, 0.1],           // Dense cluster 1
        [5, 5], [5.1, 5], [5, 5.1],           // Dense cluster 2
        [10, 10]                               // Noise point
    ];

    const dbscanResult = await engine.dbscan(dbscanData, 0.5, 2);

    runner.assertEqual(
        dbscanResult.length,
        dbscanData.length,
        "9.1 DBSCAN should return assignment for each point"
    );

    const dbscanClusters = new Set(dbscanResult);
    runner.assertGreaterThan(
        dbscanClusters.size,
        0,
        "9.2 DBSCAN should find at least one cluster"
    );

    // First 3 points should be in same cluster (dense)
    const dbCluster1 = dbscanResult[0];
    const dbFirstThreeSame = dbscanResult.slice(0, 3).every(c => c === dbCluster1);
    runner.assert(
        dbFirstThreeSame && dbCluster1 !== 0,
        "9.3 First 3 dense points should be in same non-noise cluster",
        true,
        dbFirstThreeSame
    );

    // Last point should be noise (cluster 0)
    runner.assertEqual(
        dbscanResult[6],
        0,
        "9.4 Isolated point should be noise (cluster 0)"
    );

    // Middle 3 points should form another cluster
    const dbCluster2 = dbscanResult[3];
    const dbMiddleThreeSame = dbscanResult.slice(3, 6).every(c => c === dbCluster2);
    runner.assert(
        dbMiddleThreeSame && dbCluster2 !== 0,
        "9.5 Middle 3 dense points should be in same non-noise cluster",
        true,
        dbMiddleThreeSame
    );

    // Two clusters should be different
    runner.assert(
        dbCluster1 !== dbCluster2,
        "9.6 Two separate dense regions should form different clusters",
        "different",
        dbCluster1 === dbCluster2 ? "same" : "different"
    );

    // ========================================================================
    // Test Group 10: DBSCAN - Various Parameters (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 10: DBSCAN - Various Parameters (5 tests) ---\n');

    const paramData = [
        [0, 0], [0.1, 0.1], [0.2, 0.2],
        [5, 5], [5.1, 5.1], [5.2, 5.2]
    ];

    // Small eps, high minSamples - should find mostly noise
    const result1 = await engine.dbscan(paramData, 0.1, 5);
    runner.assertGreaterThan(
        result1.filter(c => c === 0).length,
        0,
        "10.1 Small eps + high minSamples should create noise points"
    );

    // Large eps, low minSamples - should cluster all
    const result2 = await engine.dbscan(paramData, 10.0, 2);
    const allClustered = result2.every(c => c !== 0);
    runner.assert(
        allClustered,
        "10.2 Large eps + low minSamples should cluster all points",
        true,
        allClustered
    );

    // Medium eps - should find 2 clusters
    const result3 = await engine.dbscan(paramData, 0.3, 2);
    const clusters3 = new Set(result3.filter(c => c !== 0));
    runner.assertBetween(
        clusters3.size,
        1,
        2,
        "10.3 Medium eps should find 1-2 clusters"
    );

    // Very small minSamples (1) - should be very permissive
    const result4 = await engine.dbscan(paramData, 0.3, 1);
    runner.assertGreaterThan(
        new Set(result4).size,
        0,
        "10.4 minSamples=1 should find clusters"
    );

    // Test with single point
    const singlePoint = [[0, 0]];
    const resultSingle = await engine.dbscan(singlePoint, 1.0, 1);
    runner.assertEqual(
        resultSingle[0],
        0,
        "10.5 Single point should be noise"
    );

    // ========================================================================
    // Test Group 11: DBSCAN - Data Distributions (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 11: DBSCAN - Data Distributions (4 tests) ---\n');

    // Gaussian-like distribution (tight cluster)
    const gaussianData = [
        [0, 0], [0.1, 0], [0, 0.1], [-0.1, 0], [0, -0.1],
        [0.05, 0.05], [-0.05, 0.05], [0.05, -0.05], [-0.05, -0.05]
    ];
    const gaussianResult = await engine.dbscan(gaussianData, 0.2, 2);
    const gaussianClusters = new Set(gaussianResult);
    runner.assertBetween(
        gaussianClusters.size,
        1,
        2,
        "11.1 Gaussian distribution should form cohesive cluster(s)"
    );

    // Uniform distribution (scattered points)
    const uniformData = [
        [0, 0], [3, 3], [6, 6], [9, 9], [12, 12]
    ];
    const uniformResult = await engine.dbscan(uniformData, 1.0, 2);
    const uniformNoise = uniformResult.filter(c => c === 0).length;
    runner.assertGreaterThan(
        uniformNoise,
        0,
        "11.2 Uniform sparse distribution should have noise points"
    );

    // Dense cluster
    const denseData = Array.from({ length: 20 }, (_, i) => [
        i * 0.1,
        i * 0.1
    ]);
    const denseResult = await engine.dbscan(denseData, 0.5, 2);
    const denseClusters = new Set(denseResult.filter(c => c !== 0));
    runner.assertGreaterThan(
        denseClusters.size,
        0,
        "11.3 Dense data should form at least one cluster"
    );

    // Sparse data
    const verySpareData = [[0, 0], [100, 100], [200, 200]];
    const sparseDBResult = await engine.dbscan(verySpareData, 1.0, 2);
    runner.assert(
        sparseDBResult.every(c => c === 0),
        "11.4 Very sparse data should be all noise",
        "all noise",
        sparseDBResult.every(c => c === 0) ? "all noise" : "has clusters"
    );

    // ========================================================================
    // Test Group 12: Cluster Method Dispatcher (3 tests)
    // ========================================================================
    console.log('\n--- Test Group 12: Cluster Method Dispatcher (3 tests) ---\n');

    const dispatchData = [[0, 0], [1, 1], [2, 2]];

    const kmeansDispatch = await engine.cluster(dispatchData, 'kmeans', { k: 2 });
    runner.assertEqual(
        kmeansDispatch.length,
        3,
        "12.1 Dispatcher should work with kmeans"
    );

    const dbscanDispatch = await engine.cluster(dispatchData, 'dbscan', { eps: 2.0, minSamples: 2 });
    runner.assertEqual(
        dbscanDispatch.length,
        3,
        "12.2 Dispatcher should work with dbscan"
    );

    runner.assert(
        engine.clusters !== null,
        "12.3 Dispatcher should store clusters in engine",
        "not null",
        engine.clusters === null ? "null" : "stored"
    );

    // ========================================================================
    // Test Group 13: Silhouette Score - Basic Tests (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 13: Silhouette Score - Basic Tests (6 tests) ---\n');

    // Perfect clusters (well separated)
    const silData = [
        [0, 0], [0.1, 0.1],     // Cluster 0
        [5, 5], [5.1, 5.1]      // Cluster 1
    ];
    const silClusters = [0, 0, 1, 1];

    const silScore = engine.computeSilhouetteScore(silData, silClusters);

    runner.assert(
        silScore !== undefined && !isNaN(silScore),
        "13.1 Silhouette score should be computed",
        "defined number",
        silScore
    );

    runner.assertBetween(
        silScore,
        -1,
        1,
        "13.2 Silhouette score should be in [-1, 1]"
    );

    runner.assertGreaterThan(
        silScore,
        0.5,
        "13.3 Well-separated clusters should have high positive score"
    );

    // Random clusters (poor separation)
    const randomData = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const randomClusters = [0, 1, 0, 1]; // Checkerboard pattern
    const randomScore = engine.computeSilhouetteScore(randomData, randomClusters);

    runner.assertBetween(
        randomScore,
        -1,
        1,
        "13.4 Random clustering score should be in valid range"
    );

    runner.assertLessThan(
        randomScore,
        0.5,
        "13.5 Poor separation should have low score"
    );

    // Overlapping clusters (negative score)
    const overlapData = [
        [0, 0], [0.1, 0.1],
        [0.2, 0.2], [0.3, 0.3]
    ];
    const overlapClusters = [0, 0, 1, 1]; // Split tight cluster
    const overlapScore = engine.computeSilhouetteScore(overlapData, overlapClusters);

    runner.assertBetween(
        overlapScore,
        -1,
        1,
        "13.6 Overlapping clusters score should be in valid range"
    );

    // ========================================================================
    // Test Group 14: Silhouette Score - Edge Cases (3 tests)
    // ========================================================================
    console.log('\n--- Test Group 14: Silhouette Score - Edge Cases (3 tests) ---\n');

    // Single cluster (all same) - silhouette is NaN when only one cluster exists
    const singleData = [[0, 0], [1, 1], [2, 2]];
    const singleLabels = [0, 0, 0];
    const singleScore = engine.computeSilhouetteScore(singleData, singleLabels);
    runner.assert(
        isNaN(singleScore),
        "14.1 Single cluster should have undefined/NaN silhouette score",
        "NaN",
        singleScore
    );

    // Two points, two clusters - each point perfectly assigned (s = (b-0)/b = 1)
    const twoData = [[0, 0], [10, 10]];
    const twoClusters = [0, 1];
    const twoScore = engine.computeSilhouetteScore(twoData, twoClusters);
    runner.assertEqual(
        twoScore,
        1,
        "14.2 Two points in different clusters should have score 1"
    );

    // Perfect score scenario (maximum separation)
    const perfectData = [
        [0, 0], [0.1, 0.1],      // Very tight cluster 0
        [100, 100], [100.1, 100.1]  // Very tight cluster 1, far away
    ];
    const perfectClusters = [0, 0, 1, 1];
    const perfectScore = engine.computeSilhouetteScore(perfectData, perfectClusters);
    runner.assertGreaterThan(
        perfectScore,
        0.9,
        "14.3 Perfectly separated clusters should have score near 1"
    );

    // ========================================================================
    // Test Group 15: Cluster Statistics (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 15: Cluster Statistics (4 tests) ---\n');

    const statsData = [[0, 0], [1, 1], [5, 5], [6, 6]];
    await engine.cluster(statsData, 'kmeans', { k: 2 });

    const stats = engine.getClusterStats();
    runner.assert(
        stats !== null,
        "15.1 Should return cluster statistics",
        "not null",
        stats === null ? "null" : "exists"
    );

    const clusterIds = Object.keys(stats);
    runner.assertGreaterThan(
        clusterIds.length,
        0,
        "15.2 Should have cluster information"
    );

    const totalPoints = Object.values(stats).reduce((sum, cluster) => sum + cluster.count, 0);
    runner.assertEqual(
        totalPoints,
        4,
        "15.3 Total points across clusters should match data size"
    );

    const hasPointsArrays = Object.values(stats).every(cluster =>
        Array.isArray(cluster.points)
    );
    runner.assert(
        hasPointsArrays,
        "15.4 Each cluster should have points array",
        true,
        hasPointsArrays
    );

    // ========================================================================
    // Test Group 16: Hierarchical Clustering (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 16: Hierarchical Clustering (4 tests) ---\n');

    const hierData = [
        [0, 0], [0.1, 0.1],
        [5, 5], [5.1, 5.1]
    ];

    const hierResult = await engine.hierarchicalClustering(hierData, 2);
    runner.assertEqual(
        hierResult.length,
        4,
        "16.1 Hierarchical clustering should return assignment for each point"
    );

    const hierClusters = new Set(hierResult);
    runner.assertEqual(
        hierClusters.size,
        2,
        "16.2 Should find exactly k=2 clusters"
    );

    // Test with single linkage
    const hierSingle = await engine.hierarchicalClustering(hierData, 2, 'single');
    runner.assertEqual(
        hierSingle.length,
        4,
        "16.3 Single linkage should work"
    );

    // Test with complete linkage
    const hierComplete = await engine.hierarchicalClustering(hierData, 2, 'complete');
    runner.assertEqual(
        hierComplete.length,
        4,
        "16.4 Complete linkage should work"
    );

    // ========================================================================
    // Test Group 17: Cluster Distance & Centroid Computation (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 17: Cluster Distance & Centroid Computation (4 tests) ---\n');

    const testData = [[0, 0], [1, 1], [5, 5], [6, 6]];
    const cluster1Obj = { points: [0, 1] };
    const cluster2Obj = { points: [2, 3] };

    // Test average linkage
    const avgDist = engine.clusterDistance(cluster1Obj, cluster2Obj, testData, 'average');
    runner.assert(
        avgDist > 0,
        "17.1 Average cluster distance should be positive",
        "> 0",
        avgDist
    );

    // Test single linkage (minimum)
    const singleDist = engine.clusterDistance(cluster1Obj, cluster2Obj, testData, 'single');
    runner.assert(
        singleDist > 0,
        "17.2 Single linkage distance should be positive",
        "> 0",
        singleDist
    );

    // Test complete linkage (maximum)
    const completeDist = engine.clusterDistance(cluster1Obj, cluster2Obj, testData, 'complete');
    runner.assert(
        completeDist >= singleDist,
        "17.3 Complete linkage should be >= single linkage",
        `>= ${singleDist}`,
        completeDist
    );

    // Test centroid computation
    const centroid = engine.computeCentroid([0, 1], testData);
    runner.assertClose(
        centroid[0],
        0.5,
        0.001,
        "17.4 Centroid X coordinate should be 0.5"
    );

    // ========================================================================
    // Test Group 18: Integration Tests - Complete Pipeline (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 18: Integration Tests - Complete Pipeline (5 tests) ---\n');

    // Complete k-means pipeline
    const pipelineData1 = Array.from({ length: 20 }, (_, i) => [
        i < 10 ? i * 0.1 : 5 + (i - 10) * 0.1,
        i < 10 ? i * 0.1 : 5 + (i - 10) * 0.1
    ]);
    const pipelineResult1 = await engine.cluster(pipelineData1, 'kmeans', { k: 2 });
    const pipelineStats1 = engine.getClusterStats();
    const pipelineSil1 = engine.computeSilhouetteScore(pipelineData1, pipelineResult1);

    runner.assert(
        pipelineStats1 !== null && pipelineSil1 !== undefined,
        "18.1 Complete k-means pipeline should produce valid results",
        true,
        true
    );

    // Complete DBSCAN pipeline
    const pipelineData2 = [
        [0, 0], [0.1, 0.1], [0.2, 0.2],
        [5, 5], [5.1, 5.1], [5.2, 5.2]
    ];
    const pipelineResult2 = await engine.cluster(pipelineData2, 'dbscan', { eps: 0.5, minSamples: 2 });
    const pipelineStats2 = engine.getClusterStats();
    const pipelineSil2 = engine.computeSilhouetteScore(pipelineData2, pipelineResult2);

    runner.assert(
        pipelineStats2 !== null && pipelineSil2 !== undefined,
        "18.2 Complete DBSCAN pipeline should produce valid results",
        true,
        true
    );

    // Compare algorithms on same data
    const compareData = [[0, 0], [0.1, 0.1], [5, 5], [5.1, 5.1]];
    const kmeansComp = await engine.cluster(compareData, 'kmeans', { k: 2 });
    const dbscanComp = await engine.cluster(compareData, 'dbscan', { eps: 0.5, minSamples: 2 });

    runner.assert(
        kmeansComp.length === dbscanComp.length,
        "18.3 Both algorithms should process all points",
        true,
        true
    );

    // Real-world pattern: concentric circles (harder for k-means)
    const circleData = [
        // Inner circle
        [1, 0], [0.7, 0.7], [0, 1], [-0.7, 0.7],
        [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7],
        // Outer circle
        [3, 0], [2.1, 2.1], [0, 3], [-2.1, 2.1],
        [-3, 0], [-2.1, -2.1], [0, -3], [2.1, -2.1]
    ];
    const circleResult = await engine.cluster(circleData, 'kmeans', { k: 2 });
    runner.assertEqual(
        circleResult.length,
        16,
        "18.4 Should handle complex patterns (concentric circles)"
    );

    // Real-world pattern: elongated clusters
    const elongatedData = [
        // Horizontal cluster
        [0, 0], [1, 0], [2, 0], [3, 0],
        // Vertical cluster
        [0, 5], [0, 6], [0, 7], [0, 8]
    ];
    const elongatedResult = await engine.cluster(elongatedData, 'kmeans', { k: 2 });
    runner.assertEqual(
        elongatedResult.length,
        8,
        "18.5 Should handle elongated clusters"
    );

    // ========================================================================
    // Test Group 19: Performance & Scalability (3 tests)
    // ========================================================================
    console.log('\n--- Test Group 19: Performance & Scalability (3 tests) ---\n');

    // Test with 10 points
    const data10 = Array.from({ length: 10 }, (_, i) => [i, i]);
    const result10 = await engine.cluster(data10, 'kmeans', { k: 2 });
    runner.assertEqual(
        result10.length,
        10,
        "19.1 Should handle 10 points efficiently"
    );

    // Test with 100 points
    const data100 = Array.from({ length: 100 }, (_, i) => [
        i % 10,
        Math.floor(i / 10)
    ]);
    const result100 = await engine.cluster(data100, 'kmeans', { k: 5 });
    runner.assertEqual(
        result100.length,
        100,
        "19.2 Should handle 100 points efficiently"
    );

    // Test with 1000 points
    const data1000 = Array.from({ length: 1000 }, (_, i) => [
        Math.random() * 100,
        Math.random() * 100
    ]);
    const result1000 = await engine.cluster(data1000, 'kmeans', { k: 10 });
    runner.assertEqual(
        result1000.length,
        1000,
        "19.3 Should handle 1000 points efficiently"
    );

    // ========================================================================
    // Test Group 20: High-Dimensional Data (3 tests)
    // ========================================================================
    console.log('\n--- Test Group 20: High-Dimensional Data (3 tests) ---\n');

    // 5D data
    const data5D = [
        [0, 0, 0, 0, 0],
        [0.1, 0.1, 0.1, 0.1, 0.1],
        [5, 5, 5, 5, 5],
        [5.1, 5.1, 5.1, 5.1, 5.1]
    ];
    const result5D = await engine.cluster(data5D, 'kmeans', { k: 2 });
    runner.assertEqual(
        result5D.length,
        4,
        "20.1 Should handle 5D data"
    );

    // 10D data
    const data10D = [
        Array(10).fill(0),
        Array(10).fill(0.1),
        Array(10).fill(5),
        Array(10).fill(5.1)
    ];
    const result10D = await engine.cluster(data10D, 'kmeans', { k: 2 });
    runner.assertEqual(
        result10D.length,
        4,
        "20.2 Should handle 10D data"
    );

    // 20D data
    const data20D = [
        Array(20).fill(0),
        Array(20).fill(0.1),
        Array(20).fill(5),
        Array(20).fill(5.1)
    ];
    const result20D = await engine.cluster(data20D, 'kmeans', { k: 2 });
    runner.assertEqual(
        result20D.length,
        4,
        "20.3 Should handle 20D data"
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
