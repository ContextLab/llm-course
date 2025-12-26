#!/usr/bin/env node
/**
 * Comprehensive test suite for Embeddings - Clustering Algorithms (Demo 03)
 * Tests K-means and DBSCAN clustering algorithms
 * Run with: node test-clustering.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the clustering module
const clusteringCode = await readFile(join(__dirname, 'js/clustering.js'), 'utf-8');
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
    console.log('Embeddings - Clustering Algorithms Test Suite (Demo 03)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Initialization
    console.log('\n--- Test Group 1: ClusteringEngine Initialization ---\n');

    const engine = new ClusteringEngine();
    runner.assert(
        engine.clusters === null,
        "Should initialize with null clusters",
        null,
        engine.clusters
    );
    runner.assert(
        engine.centroids === null,
        "Should initialize with null centroids",
        null,
        engine.centroids
    );

    // Test 2: Euclidean Distance
    console.log('\n--- Test Group 2: Euclidean Distance Calculation ---\n');

    const point1 = [0, 0];
    const point2 = [3, 4];
    const dist = engine.euclideanDistance(point1, point2);
    runner.assertClose(dist, 5.0, 0.001, "Distance [0,0] to [3,4] should be 5");

    const samePoint = engine.euclideanDistance([1, 1], [1, 1]);
    runner.assertEqual(samePoint, 0, "Distance to same point should be 0");

    const dist3D = engine.euclideanDistance([0, 0, 0], [1, 1, 1]);
    runner.assertClose(dist3D, Math.sqrt(3), 0.001, "3D distance should be sqrt(3)");

    // Test 3: K-means Clustering - Simple Case
    console.log('\n--- Test Group 3: K-means Clustering - Simple Case ---\n');

    // Two clear clusters
    const simpleData = [
        [0, 0], [0.1, 0.1], [0, 0.1], [0.1, 0],     // Cluster 1
        [5, 5], [5.1, 5.1], [5, 5.1], [5.1, 5]      // Cluster 2
    ];

    const kmeansResult = await engine.kmeans(simpleData, 2);

    runner.assertEqual(
        kmeansResult.length,
        simpleData.length,
        "Should return assignment for each point"
    );

    // Check that points are assigned to clusters
    const uniqueClusters = new Set(kmeansResult);
    runner.assertBetween(
        uniqueClusters.size,
        1,
        2,
        "Should find 1-2 clusters"
    );

    // Check that first 4 points are in same cluster
    const cluster1 = kmeansResult[0];
    const firstFourSame = kmeansResult.slice(0, 4).every(c => c === cluster1);
    runner.assert(
        firstFourSame,
        "First 4 points should be in same cluster",
        true,
        firstFourSame
    );

    // Check that last 4 points are in same cluster
    const cluster2 = kmeansResult[4];
    const lastFourSame = kmeansResult.slice(4, 8).every(c => c === cluster2);
    runner.assert(
        lastFourSame,
        "Last 4 points should be in same cluster",
        true,
        lastFourSame
    );

    // Test 4: K-means++ Initialization
    console.log('\n--- Test Group 4: K-means++ Initialization ---\n');

    const initData = [[0, 0], [1, 1], [5, 5], [6, 6]];
    const centroids = engine.initializeCentroidsKMeansPlusPlus(initData, 2);

    runner.assertEqual(
        centroids.length,
        2,
        "Should initialize 2 centroids"
    );

    runner.assertEqual(
        centroids[0].length,
        2,
        "Each centroid should have 2 dimensions"
    );

    // Centroids should be from the data
    const isFromData = centroids.every(centroid =>
        initData.some(point =>
            point[0] === centroid[0] && point[1] === centroid[1]
        )
    );
    runner.assert(
        isFromData,
        "Centroids should be selected from data points",
        true,
        isFromData
    );

    // Test 5: Find Neighbors (DBSCAN helper)
    console.log('\n--- Test Group 5: Find Neighbors for DBSCAN ---\n');

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
        "Should return neighbors for each point"
    );

    // Point 0 should have point 1 as neighbor (distance ~0.707)
    runner.assert(
        neighbors[0].includes(1),
        "Point 0 should have point 1 as neighbor",
        "includes 1",
        neighbors[0]
    );

    // Point 0 should NOT have point 2 as neighbor (too far)
    runner.assert(
        !neighbors[0].includes(2),
        "Point 0 should not have point 2 as neighbor (too far)",
        "not includes 2",
        neighbors[0].includes(2) ? "includes 2" : "not includes 2"
    );

    // Test 6: DBSCAN Clustering
    console.log('\n--- Test Group 6: DBSCAN Clustering ---\n');

    const dbscanData = [
        [0, 0], [0.1, 0], [0, 0.1],           // Dense cluster 1
        [5, 5], [5.1, 5], [5, 5.1],           // Dense cluster 2
        [10, 10]                                // Noise point
    ];

    const dbscanResult = await engine.dbscan(dbscanData, 0.5, 2);

    runner.assertEqual(
        dbscanResult.length,
        dbscanData.length,
        "DBSCAN should return assignment for each point"
    );

    // Check that we found clusters
    const dbscanClusters = new Set(dbscanResult);
    runner.assertGreaterThan(
        dbscanClusters.size,
        0,
        "DBSCAN should find at least one cluster"
    );

    // First 3 points should be in same cluster (dense)
    const dbCluster1 = dbscanResult[0];
    const dbFirstThreeSame = dbscanResult.slice(0, 3).every(c => c === dbCluster1);
    runner.assert(
        dbFirstThreeSame && dbCluster1 !== 0,
        "First 3 dense points should be in same non-noise cluster",
        true,
        dbFirstThreeSame
    );

    // Test 7: Cluster Method Dispatcher
    console.log('\n--- Test Group 7: Cluster Method Dispatcher ---\n');

    const dispatchData = [[0, 0], [1, 1], [2, 2]];

    const kmeansDispatch = await engine.cluster(dispatchData, 'kmeans', { k: 2 });
    runner.assertEqual(
        kmeansDispatch.length,
        3,
        "Dispatcher should work with kmeans"
    );

    const dbscanDispatch = await engine.cluster(dispatchData, 'dbscan', { eps: 2.0, minSamples: 2 });
    runner.assertEqual(
        dbscanDispatch.length,
        3,
        "Dispatcher should work with dbscan"
    );

    // Test 8: Silhouette Score Calculation
    console.log('\n--- Test Group 8: Silhouette Score ---\n');

    const silData = [
        [0, 0], [0.1, 0.1],     // Cluster 0
        [5, 5], [5.1, 5.1]      // Cluster 1
    ];
    const silClusters = [0, 0, 1, 1];

    const silScore = engine.computeSilhouetteScore(silData, silClusters);

    runner.assert(
        silScore !== undefined && !isNaN(silScore),
        "Silhouette score should be computed",
        "defined number",
        silScore
    );

    runner.assertBetween(
        silScore,
        -1,
        1,
        "Silhouette score should be in [-1, 1]"
    );

    // For well-separated clusters, score should be positive
    runner.assertGreaterThan(
        silScore,
        0,
        "Well-separated clusters should have positive silhouette score"
    );

    // Test 9: Empty Cluster Handling in K-means
    console.log('\n--- Test Group 9: Edge Cases ---\n');

    // Single cluster
    const singleClusterData = [[1, 1], [1.1, 1.1], [1.2, 1.2]];
    const singleResult = await engine.kmeans(singleClusterData, 1);
    runner.assert(
        singleResult.every(c => c === 0),
        "K-means with k=1 should assign all to cluster 0",
        "all cluster 0",
        new Set(singleResult).size === 1 ? "all same" : "different"
    );

    // k >= n
    const smallData = [[0, 0], [1, 1]];
    const tooManyK = await engine.kmeans(smallData, 2);
    runner.assertEqual(
        tooManyK.length,
        2,
        "K-means should handle k=n"
    );

    // Test 10: Distance Calculation Edge Cases
    console.log('\n--- Test Group 10: Distance Edge Cases ---\n');

    // Higher dimensions
    const highDim = engine.euclideanDistance([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    runner.assertEqual(
        highDim,
        0,
        "Distance in 5D space to same point should be 0"
    );

    // Single dimension
    const oneDim = engine.euclideanDistance([5], [2]);
    runner.assertEqual(
        oneDim,
        3,
        "1D distance should work correctly"
    );

    // Test 11: Convergence
    console.log('\n--- Test Group 11: Algorithm Convergence ---\n');

    const convData = [[0, 0], [1, 0], [0, 1], [5, 5], [6, 5], [5, 6]];
    const convResult = await engine.kmeans(convData, 2, 100);

    runner.assertEqual(
        convResult.length,
        6,
        "Should converge within max iterations"
    );

    // Centroids should be set after convergence
    runner.assert(
        engine.centroids !== null && engine.centroids.length === 2,
        "Centroids should be set after k-means",
        "2 centroids",
        engine.centroids ? `${engine.centroids.length} centroids` : "null"
    );

    // Test 12: Cluster Storage
    console.log('\n--- Test Group 12: Cluster Storage ---\n');

    const storeData = [[0, 0], [1, 1], [5, 5]];
    await engine.cluster(storeData, 'kmeans', { k: 2 });

    runner.assert(
        engine.clusters !== null,
        "Clusters should be stored in engine",
        "not null",
        engine.clusters === null ? "null" : "stored"
    );

    runner.assertEqual(
        engine.clusters.length,
        3,
        "Stored clusters should have correct length"
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
