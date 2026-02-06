/**
 * InteractivePlot - Creates interactive 3D/2D visualizations using Plotly.js
 */

export class InteractivePlot {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.plotData = null;
        this.customPoints = [];
        this.selectedPoint = null;
        this.colorScales = this.initializeColorScales();
    }

    /**
     * Initialize color scales for different categories
     */
    initializeColorScales() {
        return {
            category: [
                '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
                '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
                '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
            ],
            sentiment: {
                'positive': '#2ecc71',
                'negative': '#e74c3c',
                'neutral': '#95a5a6'
            },
            cluster: [
                '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
                '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
                '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
                '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
            ]
        };
    }

    /**
     * Render the plot
     */
    render(plotData) {
        this.plotData = plotData;
        const { points, texts, labels, clusters, colorBy, showLabels, showConnections, is3D } = plotData;

        // Prepare data for Plotly
        const traces = this.createTraces(points, texts, labels, clusters, colorBy, showLabels, is3D);

        // Add connection lines if requested
        if (showConnections) {
            const connectionTrace = this.createConnectionTrace(points, is3D);
            if (connectionTrace) {
                traces.push(connectionTrace);
            }
        }

        // Configure layout
        const layout = this.createLayout(is3D, colorBy);

        // Configure options
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d'],
            displaylogo: false
        };

        // Plot
        Plotly.newPlot(this.container, traces, layout, config);

        // Add click handler
        this.container.on('plotly_click', (data) => {
            this.handlePointClick(data);
        });
    }

    /**
     * Create Plotly traces
     */
    createTraces(points, texts, labels, clusters, colorBy, showLabels, is3D) {
        // Group points by color category
        const groups = this.groupByColorCategory(labels, clusters, colorBy);
        const traces = [];

        Object.entries(groups).forEach(([groupName, indices]) => {
            const groupPoints = indices.map(i => points[i]);
            const groupTexts = indices.map(i => texts[i]);

            const trace = {
                type: is3D ? 'scatter3d' : 'scatter',
                mode: 'markers',
                name: groupName,
                marker: {
                    size: 6,
                    color: this.getColorForGroup(groupName, colorBy),
                    opacity: 0.8,
                    line: {
                        color: 'white',
                        width: 0.5
                    }
                },
                hoverinfo: showLabels ? 'text' : 'skip',
                hovertext: groupTexts.map((text, idx) =>
                    `<b>${groupName}</b><br>${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`
                ),
                customdata: indices
            };

            if (is3D) {
                trace.x = groupPoints.map(p => p[0]);
                trace.y = groupPoints.map(p => p[1]);
                trace.z = groupPoints.map(p => p[2]);
            } else {
                trace.x = groupPoints.map(p => p[0]);
                trace.y = groupPoints.map(p => p[1]);
            }

            traces.push(trace);
        });

        // Add custom points if any
        if (this.customPoints.length > 0) {
            const customTrace = this.createCustomPointsTrace(is3D);
            traces.push(customTrace);
        }

        return traces;
    }

    /**
     * Group points by color category
     */
    groupByColorCategory(labels, clusters, colorBy) {
        const groups = {};

        labels.forEach((label, idx) => {
            let groupName;

            if (colorBy === 'category') {
                groupName = label;
            } else if (colorBy === 'cluster' && clusters) {
                groupName = `Cluster ${clusters[idx]}`;
            } else if (colorBy === 'sentiment') {
                groupName = label; // Assuming labels contain sentiment
            } else {
                groupName = 'All';
            }

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(idx);
        });

        return groups;
    }

    /**
     * Get color for group
     */
    getColorForGroup(groupName, colorBy) {
        if (colorBy === 'sentiment' && this.colorScales.sentiment[groupName]) {
            return this.colorScales.sentiment[groupName];
        }

        if (colorBy === 'cluster') {
            const clusterNum = parseInt(groupName.split(' ')[1]);
            return this.colorScales.cluster[clusterNum % this.colorScales.cluster.length];
        }

        // Hash group name to get consistent color
        let hash = 0;
        for (let i = 0; i < groupName.length; i++) {
            hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % this.colorScales.category.length;
        return this.colorScales.category[index];
    }

    /**
     * Create trace for custom points
     */
    createCustomPointsTrace(is3D) {
        const trace = {
            type: is3D ? 'scatter3d' : 'scatter',
            mode: 'markers+text',
            name: 'Custom Points',
            marker: {
                size: 12,
                color: '#ff0000',
                opacity: 1,
                symbol: 'diamond',
                line: {
                    color: 'white',
                    width: 2
                }
            },
            text: this.customPoints.map((_, i) => `Custom ${i + 1}`),
            textposition: 'top center',
            hovertext: this.customPoints.map(p => p.text),
            hoverinfo: 'text',
            showlegend: true
        };

        if (is3D) {
            trace.x = this.customPoints.map(p => p.point[0]);
            trace.y = this.customPoints.map(p => p.point[1]);
            trace.z = this.customPoints.map(p => p.point[2]);
        } else {
            trace.x = this.customPoints.map(p => p.point[0]);
            trace.y = this.customPoints.map(p => p.point[1]);
        }

        return trace;
    }

    /**
     * Create connection trace for k-NN visualization
     */
    createConnectionTrace(points, is3D, k = 5) {
        if (points.length > 200) {
            // Too many points, skip connections
            return null;
        }

        const x = [], y = [], z = [];

        // Compute k nearest neighbors for each point
        for (let i = 0; i < points.length; i++) {
            const neighbors = this.findKNearestNeighbors(points, i, k);

            neighbors.forEach(j => {
                x.push(points[i][0], points[j][0], null);
                y.push(points[i][1], points[j][1], null);
                if (is3D) {
                    z.push(points[i][2], points[j][2], null);
                }
            });
        }

        const trace = {
            type: is3D ? 'scatter3d' : 'scatter',
            mode: 'lines',
            name: 'Connections',
            line: {
                color: 'rgba(150, 150, 150, 0.2)',
                width: 1
            },
            hoverinfo: 'skip',
            showlegend: false
        };

        if (is3D) {
            trace.x = x;
            trace.y = y;
            trace.z = z;
        } else {
            trace.x = x;
            trace.y = y;
        }

        return trace;
    }

    /**
     * Find k nearest neighbors
     */
    findKNearestNeighbors(points, index, k) {
        const distances = points.map((point, idx) => ({
            idx,
            dist: this.euclideanDistance(points[index], point)
        }));

        distances.sort((a, b) => a.dist - b.dist);
        return distances.slice(1, k + 1).map(d => d.idx);
    }

    /**
     * Euclidean distance
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
     * Get theme-aware colors for Plotly
     */
    getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            paper: isDark ? '#1a1a2e' : 'white',
            plot: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(240, 240, 240, 0.5)',
            text: isDark ? '#e0e0e0' : '#333',
            grid: isDark ? '#444' : '#ddd',
            axis: isDark ? '#2a2a4a' : 'white'
        };
    }

    /**
     * Create layout configuration
     */
    createLayout(is3D, colorBy) {
        const colors = this.getThemeColors();
        
        const layout = {
            title: {
                text: `Text Embeddings Visualization (colored by ${colorBy})`,
                font: { size: 16, color: colors.text }
            },
            showlegend: true,
            legend: {
                x: 1.02,
                y: 1,
                orientation: 'v',
                font: { size: 10, color: colors.text }
            },
            margin: { l: 0, r: 0, b: 0, t: 40 },
            hovermode: 'closest',
            paper_bgcolor: colors.paper,
            plot_bgcolor: colors.plot
        };

        if (is3D) {
            layout.scene = {
                xaxis: { title: 'Component 1', backgroundcolor: colors.axis, gridcolor: colors.grid, color: colors.text },
                yaxis: { title: 'Component 2', backgroundcolor: colors.axis, gridcolor: colors.grid, color: colors.text },
                zaxis: { title: 'Component 3', backgroundcolor: colors.axis, gridcolor: colors.grid, color: colors.text },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.5 }
                }
            };
        } else {
            layout.xaxis = {
                title: 'Component 1',
                zeroline: false,
                gridcolor: colors.grid,
                color: colors.text
            };
            layout.yaxis = {
                title: 'Component 2',
                zeroline: false,
                gridcolor: colors.grid,
                color: colors.text
            };
        }

        return layout;
    }

    /**
     * Handle point click
     */
    handlePointClick(data) {
        const point = data.points[0];
        const customdata = point.customdata;

        if (customdata !== undefined) {
            this.selectedPoint = customdata;
            this.highlightPoint(customdata);
        }
    }

    /**
     * Highlight a specific point
     */
    highlightPoint(index) {
        if (!this.plotData) return;

        const { points, is3D } = this.plotData;

        // Find nearest neighbors
        const neighbors = this.findKNearestNeighbors(points, index, 5);

        // Create highlight trace
        const highlightTrace = {
            type: is3D ? 'scatter3d' : 'scatter',
            mode: 'markers',
            name: 'Selected',
            marker: {
                size: 15,
                color: 'yellow',
                symbol: 'circle-open',
                line: {
                    color: 'red',
                    width: 3
                }
            },
            showlegend: false
        };

        if (is3D) {
            highlightTrace.x = [points[index][0]];
            highlightTrace.y = [points[index][1]];
            highlightTrace.z = [points[index][2]];
        } else {
            highlightTrace.x = [points[index][0]];
            highlightTrace.y = [points[index][1]];
        }

        // Create neighbor highlights
        const neighborTrace = {
            type: is3D ? 'scatter3d' : 'scatter',
            mode: 'markers',
            name: 'Neighbors',
            marker: {
                size: 10,
                color: 'orange',
                opacity: 0.6
            },
            showlegend: false
        };

        if (is3D) {
            neighborTrace.x = neighbors.map(i => points[i][0]);
            neighborTrace.y = neighbors.map(i => points[i][1]);
            neighborTrace.z = neighbors.map(i => points[i][2]);
        } else {
            neighborTrace.x = neighbors.map(i => points[i][0]);
            neighborTrace.y = neighbors.map(i => points[i][1]);
        }

        // Add traces
        Plotly.addTraces(this.container, [highlightTrace, neighborTrace]);

        // Remove after 3 seconds
        setTimeout(() => {
            const numTraces = this.container.data.length;
            Plotly.deleteTraces(this.container, [numTraces - 2, numTraces - 1]);
        }, 3000);
    }

    /**
     * Add a custom point to the visualization
     */
    addCustomPoint(point, text) {
        this.customPoints.push({ point, text });

        // Re-render to include custom point
        if (this.plotData) {
            this.render(this.plotData);
        }

        // Animate the custom point
        this.animateCustomPoint(point, this.plotData.is3D);
    }

    /**
     * Animate custom point addition
     */
    animateCustomPoint(point, is3D) {
        const pulseTrace = {
            type: is3D ? 'scatter3d' : 'scatter',
            mode: 'markers',
            marker: {
                size: [20],
                color: 'red',
                opacity: 0.5
            },
            showlegend: false
        };

        if (is3D) {
            pulseTrace.x = [point[0]];
            pulseTrace.y = [point[1]];
            pulseTrace.z = [point[2]];
        } else {
            pulseTrace.x = [point[0]];
            pulseTrace.y = [point[1]];
        }

        Plotly.addTraces(this.container, pulseTrace);

        // Animate size
        let size = 20;
        const interval = setInterval(() => {
            size = size === 20 ? 30 : 20;
            const update = { 'marker.size': [[size]] };
            const traceIndex = this.container.data.length - 1;
            Plotly.restyle(this.container, update, traceIndex);
        }, 300);

        // Remove after animation
        setTimeout(() => {
            clearInterval(interval);
            const numTraces = this.container.data.length;
            Plotly.deleteTraces(this.container, numTraces - 1);
        }, 2000);
    }

    /**
     * Clear custom points
     */
    clearCustomPoints() {
        this.customPoints = [];
        if (this.plotData) {
            this.render(this.plotData);
        }
    }

    /**
     * Export plot as image
     */
    async exportAsImage(format = 'png') {
        return Plotly.toImage(this.container, {
            format: format,
            width: 1200,
            height: 800
        });
    }

    /**
     * Update camera view (3D only)
     */
    updateCamera(eye) {
        if (this.plotData && this.plotData.is3D) {
            const update = {
                'scene.camera.eye': eye
            };
            Plotly.relayout(this.container, update);
        }
    }

    /**
     * Reset view
     */
    resetView() {
        Plotly.relayout(this.container, {
            'scene.camera.eye': { x: 1.5, y: 1.5, z: 1.5 }
        });
    }
}
