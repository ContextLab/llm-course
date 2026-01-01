/**
 * ClusteringEngine - Implements K-means and DBSCAN clustering algorithms
 */

export class ClusteringEngine {
    constructor() {
        this.clusters = null;
        this.centroids = null;
    }

    /**
     * Cluster data points
     */
    async cluster(data, method, params) {
        console.log(`Clustering ${data.length} points using ${method}...`);

        let clusters;
        switch (method) {
            case 'kmeans':
                clusters = await this.kmeans(data, params.k);
                break;
            case 'dbscan':
                clusters = await this.dbscan(data, params.eps, params.minSamples);
                break;
            default:
                throw new Error(`Unknown clustering method: ${method}`);
        }

        this.clusters = clusters;
        console.log(`Clustering complete: ${new Set(clusters).size} clusters found`);
        return clusters;
    }

    /**
     * K-means clustering
     */
    async kmeans(data, k, maxIterations = 100) {
        const n = data.length;
        const d = data[0].length;

        // Initialize centroids using k-means++
        let centroids = this.initializeCentroidsKMeansPlusPlus(data, k);

        let assignments = Array(n).fill(0);
        let converged = false;
        let iteration = 0;

        while (!converged && iteration < maxIterations) {
            // Assignment step: assign each point to nearest centroid
            const newAssignments = Array(n);
            for (let i = 0; i < n; i++) {
                let minDist = Infinity;
                let minIdx = 0;

                for (let j = 0; j < k; j++) {
                    const dist = this.euclideanDistance(data[i], centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        minIdx = j;
                    }
                }

                newAssignments[i] = minIdx;
            }

            // Check convergence
            converged = newAssignments.every((val, idx) => val === assignments[idx]);
            assignments = newAssignments;

            // Update step: recalculate centroids
            const newCentroids = Array(k).fill(0).map(() => Array(d).fill(0));
            const counts = Array(k).fill(0);

            for (let i = 0; i < n; i++) {
                const cluster = assignments[i];
                counts[cluster]++;
                for (let j = 0; j < d; j++) {
                    newCentroids[cluster][j] += data[i][j];
                }
            }

            for (let i = 0; i < k; i++) {
                if (counts[i] > 0) {
                    for (let j = 0; j < d; j++) {
                        newCentroids[i][j] /= counts[i];
                    }
                } else {
                    // Reinitialize empty centroid
                    newCentroids[i] = data[Math.floor(Math.random() * n)].slice();
                }
            }

            centroids = newCentroids;
            iteration++;

            // Allow UI to update periodically
            if (iteration % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        this.centroids = centroids;
        return assignments;
    }

    /**
     * K-means++ initialization
     */
    initializeCentroidsKMeansPlusPlus(data, k) {
        const n = data.length;
        const centroids = [];

        // Choose first centroid randomly
        const firstIdx = Math.floor(Math.random() * n);
        centroids.push(data[firstIdx].slice());

        // Choose remaining centroids
        for (let i = 1; i < k; i++) {
            const distances = Array(n);

            // Compute distance to nearest centroid
            for (let j = 0; j < n; j++) {
                let minDist = Infinity;
                for (let c = 0; c < centroids.length; c++) {
                    const dist = this.euclideanDistance(data[j], centroids[c]);
                    if (dist < minDist) {
                        minDist = dist;
                    }
                }
                distances[j] = minDist * minDist; // Square for probability
            }

            // Choose next centroid with probability proportional to distance
            const totalDist = distances.reduce((sum, d) => sum + d, 0);
            let threshold = Math.random() * totalDist;
            let cumSum = 0;

            for (let j = 0; j < n; j++) {
                cumSum += distances[j];
                if (cumSum >= threshold) {
                    centroids.push(data[j].slice());
                    break;
                }
            }
        }

        return centroids;
    }

    /**
     * DBSCAN clustering
     */
    async dbscan(data, eps, minSamples) {
        const n = data.length;
        const labels = Array(n).fill(-1); // -1 means unclassified
        let clusterId = 0;

        // Compute all pairwise distances (can be optimized with spatial indexing)
        const neighbors = this.findNeighbors(data, eps);

        for (let i = 0; i < n; i++) {
            if (labels[i] !== -1) continue; // Already classified

            const neighborIndices = neighbors[i];

            if (neighborIndices.length < minSamples) {
                labels[i] = -2; // Mark as noise
                continue;
            }

            // Start new cluster
            clusterId++;
            labels[i] = clusterId;

            // Expand cluster
            const seeds = [...neighborIndices];
            let seedIdx = 0;

            while (seedIdx < seeds.length) {
                const current = seeds[seedIdx];

                if (labels[current] === -2) {
                    // Change noise to border point
                    labels[current] = clusterId;
                } else if (labels[current] === -1) {
                    // Unclassified point
                    labels[current] = clusterId;

                    const currentNeighbors = neighbors[current];
                    if (currentNeighbors.length >= minSamples) {
                        // Add neighbors to seeds
                        for (let j = 0; j < currentNeighbors.length; j++) {
                            if (!seeds.includes(currentNeighbors[j])) {
                                seeds.push(currentNeighbors[j]);
                            }
                        }
                    }
                }

                seedIdx++;
            }

            // Allow UI to update
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        // Convert noise points (-2) to cluster 0, and renumber clusters
        const uniqueClusters = new Set(labels.filter(l => l > 0));
        const clusterMap = {};
        let newId = 1;

        uniqueClusters.forEach(id => {
            clusterMap[id] = newId++;
        });

        return labels.map(label => {
            if (label === -1 || label === -2) return 0; // Noise
            return clusterMap[label];
        });
    }

    /**
     * Find neighbors within epsilon distance
     */
    findNeighbors(data, eps) {
        const n = data.length;
        const neighbors = Array(n).fill(0).map(() => []);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    const dist = this.euclideanDistance(data[i], data[j]);
                    if (dist <= eps) {
                        neighbors[i].push(j);
                    }
                }
            }
        }

        return neighbors;
    }

    /**
     * Euclidean distance between two points
     */
    euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            const diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Get cluster statistics
     */
    getClusterStats() {
        if (!this.clusters) {
            return null;
        }

        const stats = {};
        this.clusters.forEach((cluster, idx) => {
            if (!stats[cluster]) {
                stats[cluster] = {
                    count: 0,
                    points: []
                };
            }
            stats[cluster].count++;
            stats[cluster].points.push(idx);
        });

        return stats;
    }

    /**
     * Compute silhouette score for clustering quality
     */
    computeSilhouetteScore(data, clusters) {
        const n = data.length;
        const scores = Array(n);

        for (let i = 0; i < n; i++) {
            const clusterI = clusters[i];

            // Compute a(i): mean distance to points in same cluster
            let sameClusterDists = [];
            for (let j = 0; j < n; j++) {
                if (i !== j && clusters[j] === clusterI) {
                    sameClusterDists.push(this.euclideanDistance(data[i], data[j]));
                }
            }
            const a = sameClusterDists.length > 0 ?
                sameClusterDists.reduce((sum, d) => sum + d, 0) / sameClusterDists.length : 0;

            // Compute b(i): min mean distance to points in other clusters
            const otherClusters = new Set(clusters.filter(c => c !== clusterI));
            let b = Infinity;

            otherClusters.forEach(cluster => {
                let otherClusterDists = [];
                for (let j = 0; j < n; j++) {
                    if (clusters[j] === cluster) {
                        otherClusterDists.push(this.euclideanDistance(data[i], data[j]));
                    }
                }
                const meanDist = otherClusterDists.reduce((sum, d) => sum + d, 0) / otherClusterDists.length;
                b = Math.min(b, meanDist);
            });

            // Silhouette score
            scores[i] = (b - a) / Math.max(a, b);
        }

        return scores.reduce((sum, s) => sum + s, 0) / n;
    }

    /**
     * Hierarchical clustering (optional bonus)
     */
    async hierarchicalClustering(data, k, linkage = 'average') {
        const n = data.length;

        // Initialize each point as its own cluster
        let clusters = data.map((point, idx) => ({
            id: idx,
            points: [idx],
            centroid: point.slice()
        }));

        // Merge until we have k clusters
        while (clusters.length > k) {
            // Find closest pair of clusters
            let minDist = Infinity;
            let mergeI = 0;
            let mergeJ = 1;

            for (let i = 0; i < clusters.length; i++) {
                for (let j = i + 1; j < clusters.length; j++) {
                    const dist = this.clusterDistance(clusters[i], clusters[j], data, linkage);
                    if (dist < minDist) {
                        minDist = dist;
                        mergeI = i;
                        mergeJ = j;
                    }
                }
            }

            // Merge clusters
            const merged = {
                id: clusters.length,
                points: [...clusters[mergeI].points, ...clusters[mergeJ].points],
                centroid: this.computeCentroid(
                    [...clusters[mergeI].points, ...clusters[mergeJ].points],
                    data
                )
            };

            // Remove merged clusters and add new one
            clusters = clusters.filter((_, idx) => idx !== mergeI && idx !== mergeJ);
            clusters.push(merged);

            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        // Convert to cluster assignments
        const assignments = Array(n);
        clusters.forEach((cluster, clusterIdx) => {
            cluster.points.forEach(pointIdx => {
                assignments[pointIdx] = clusterIdx;
            });
        });

        return assignments;
    }

    /**
     * Compute distance between clusters
     */
    clusterDistance(cluster1, cluster2, data, linkage) {
        if (linkage === 'single') {
            // Minimum distance
            let minDist = Infinity;
            for (let i of cluster1.points) {
                for (let j of cluster2.points) {
                    const dist = this.euclideanDistance(data[i], data[j]);
                    minDist = Math.min(minDist, dist);
                }
            }
            return minDist;
        } else if (linkage === 'complete') {
            // Maximum distance
            let maxDist = 0;
            for (let i of cluster1.points) {
                for (let j of cluster2.points) {
                    const dist = this.euclideanDistance(data[i], data[j]);
                    maxDist = Math.max(maxDist, dist);
                }
            }
            return maxDist;
        } else {
            // Average linkage
            let totalDist = 0;
            let count = 0;
            for (let i of cluster1.points) {
                for (let j of cluster2.points) {
                    totalDist += this.euclideanDistance(data[i], data[j]);
                    count++;
                }
            }
            return totalDist / count;
        }
    }

    /**
     * Compute centroid of cluster
     */
    computeCentroid(pointIndices, data) {
        const d = data[0].length;
        const centroid = Array(d).fill(0);

        pointIndices.forEach(idx => {
            for (let j = 0; j < d; j++) {
                centroid[j] += data[idx][j];
            }
        });

        return centroid.map(val => val / pointIndices.length);
    }
}
