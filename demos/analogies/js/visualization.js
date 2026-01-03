/**
 * Embedding Space Visualization
 * Renders vector arithmetic and embedding space plots
 */

export class EmbeddingVisualizer {
    constructor() {
        this.colors = {
            wordA: '#e74c3c',
            wordB: '#3498db',
            wordC: '#2ecc71',
            result: '#f39c12',
            general: '#95a5a6'
        };
    }

    /**
     * Render vector arithmetic visualization
     */
    renderVectorArithmetic(vectors, wordA, wordB, wordC, resultWord) {
        const container = document.getElementById('vector-plot');

        const vecA = vectors[wordA];
        const vecB = vectors[wordB];
        const vecC = vectors[wordC];

        // Use first 3 dimensions for 3D visualization
        const dim1 = 0, dim2 = 1, dim3 = 2;

        // Calculate intermediate vectors
        const diff = vecA.map((val, i) => val - vecB[i]);
        const result = diff.map((val, i) => val + vecC[i]);

        const traces = [];

        // Origin point
        traces.push({
            x: [0],
            y: [0],
            z: [0],
            mode: 'markers',
            type: 'scatter3d',
            name: 'Origin',
            marker: {
                size: 8,
                color: 'black',
                symbol: 'circle'
            }
        });

        // Word A
        traces.push(this.createVectorTrace(
            [0, vecA[dim1]],
            [0, vecA[dim2]],
            [0, vecA[dim3]],
            wordA,
            this.colors.wordA
        ));

        // Word B
        traces.push(this.createVectorTrace(
            [0, vecB[dim1]],
            [0, vecB[dim2]],
            [0, vecB[dim3]],
            wordB,
            this.colors.wordB
        ));

        // Word C
        traces.push(this.createVectorTrace(
            [0, vecC[dim1]],
            [0, vecC[dim2]],
            [0, vecC[dim3]],
            wordC,
            this.colors.wordC
        ));

        // Difference vector (A - B)
        traces.push(this.createVectorTrace(
            [0, diff[dim1]],
            [0, diff[dim2]],
            [0, diff[dim3]],
            `${wordA} - ${wordB}`,
            '#9b59b6',
            true
        ));

        // Result vector
        traces.push(this.createVectorTrace(
            [0, result[dim1]],
            [0, result[dim2]],
            [0, result[dim3]],
            `Result ≈ ${resultWord}`,
            this.colors.result
        ));

        // Result word actual position
        if (vectors[resultWord]) {
            const vecResult = vectors[resultWord];
            traces.push(this.createVectorTrace(
                [0, vecResult[dim1]],
                [0, vecResult[dim2]],
                [0, vecResult[dim3]],
                resultWord,
                this.colors.result,
                false,
                true
            ));
        }

        const layout = {
            title: `Vector Arithmetic: ${wordA} - ${wordB} + ${wordC} ≈ ${resultWord}`,
            scene: {
                xaxis: { title: `Dimension ${dim1 + 1}` },
                yaxis: { title: `Dimension ${dim2 + 1}` },
                zaxis: { title: `Dimension ${dim3 + 1}` },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.5 }
                }
            },
            height: 600,
            showlegend: true,
            legend: {
                x: 0,
                y: 1
            }
        };

        const config = {
            responsive: true,
            displayModeBar: true
        };

        Plotly.newPlot(container, traces, layout, config);
    }

    /**
     * Create a vector trace for 3D plot
     */
    createVectorTrace(x, y, z, name, color, dashed = false, points = false) {
        return {
            x: x,
            y: y,
            z: z,
            mode: points ? 'markers+text' : 'lines+markers+text',
            type: 'scatter3d',
            name: name,
            text: [null, name],
            textposition: 'top center',
            line: {
                color: color,
                width: points ? 0 : 6,
                dash: dashed ? 'dash' : 'solid'
            },
            marker: {
                size: points ? 10 : [4, 8],
                color: color,
                symbol: points ? 'diamond' : 'circle'
            }
        };
    }

    /**
     * Render embedding space visualization
     */
    async renderEmbeddingSpace(model, mode, numWords, showLabels) {
        const container = document.getElementById('embedding-plot');

        // Get random subset of words
        const words = model.getRandomWords(Math.min(numWords, model.vocabularySize));
        const vectors = words.map(w => model.getVector(w));

        let projected;

        if (mode.includes('pca')) {
            const numComponents = mode.includes('3d') ? 3 : 2;
            const pca = await model.computePCA(numComponents);
            projected = pca.projected.filter((_, i) => words.includes(model.words[i]));
        } else {
            // t-SNE
            const numComponents = mode.includes('3d') ? 3 : 2;

            // Create subset model for t-SNE
            const subsetEmbeddings = {};
            words.forEach(w => {
                subsetEmbeddings[w] = model.getVector(w);
            });

            const subModel = new (model.constructor)(subsetEmbeddings);
            await subModel.initialize();

            projected = await subModel.computeTSNE(numComponents, 30, 200);
        }

        const is3D = mode.includes('3d');

        const trace = {
            x: projected.map(p => p[0]),
            y: projected.map(p => p[1]),
            z: is3D ? projected.map(p => p[2]) : undefined,
            mode: showLabels ? 'markers+text' : 'markers',
            type: is3D ? 'scatter3d' : 'scatter',
            text: words,
            textposition: 'top center',
            marker: {
                size: 6,
                color: this.colors.general,
                opacity: 0.7,
                line: {
                    color: 'white',
                    width: 1
                }
            },
            hovertemplate: '<b>%{text}</b><br>x: %{x:.3f}<br>y: %{y:.3f}' +
                          (is3D ? '<br>z: %{z:.3f}' : '') + '<extra></extra>'
        };

        const methodName = mode.includes('pca') ? 'PCA' : 't-SNE';
        const dimName = is3D ? '3D' : '2D';

        const layout = {
            title: `Embedding Space Visualization (${methodName} ${dimName})`,
            xaxis: { title: 'Component 1', zeroline: false },
            yaxis: { title: 'Component 2', zeroline: false },
            scene: is3D ? {
                xaxis: { title: 'Component 1' },
                yaxis: { title: 'Component 2' },
                zaxis: { title: 'Component 3' }
            } : undefined,
            height: 600,
            hovermode: 'closest',
            showlegend: false
        };

        const config = {
            responsive: true,
            displayModeBar: true
        };

        Plotly.newPlot(container, [trace], layout, config);
    }

    /**
     * Render 2D vector space for analogy
     */
    render2DVectorSpace(vectors, wordA, wordB, wordC, resultWord) {
        const container = document.getElementById('vector-plot');

        // Use PCA to project to 2D
        const words = [wordA, wordB, wordC, resultWord];
        const vecs = words.map(w => vectors[w]);

        // Simple 2D projection (use first 2 dimensions)
        const traces = [];

        // Draw vectors
        const styles = [
            { color: this.colors.wordA, name: wordA },
            { color: this.colors.wordB, name: wordB },
            { color: this.colors.wordC, name: wordC },
            { color: this.colors.result, name: resultWord }
        ];

        words.forEach((word, i) => {
            const vec = vecs[i];
            traces.push({
                x: [0, vec[0]],
                y: [0, vec[1]],
                mode: 'lines+markers+text',
                name: word,
                text: [null, word],
                textposition: 'top center',
                line: {
                    color: styles[i].color,
                    width: 4
                },
                marker: {
                    size: [4, 10],
                    color: styles[i].color
                }
            });
        });

        // Draw analogy operation
        const vecA = vecs[0];
        const vecB = vecs[1];
        const vecC = vecs[2];

        const diff = [vecA[0] - vecB[0], vecA[1] - vecB[1]];
        const result = [diff[0] + vecC[0], diff[1] + vecC[1]];

        // Difference vector from origin
        traces.push({
            x: [0, diff[0]],
            y: [0, diff[1]],
            mode: 'lines',
            name: `${wordA} - ${wordB}`,
            line: {
                color: '#9b59b6',
                width: 3,
                dash: 'dash'
            }
        });

        // Result vector
        traces.push({
            x: [0, result[0]],
            y: [0, result[1]],
            mode: 'lines+markers',
            name: 'Computed Result',
            line: {
                color: '#e67e22',
                width: 4,
                dash: 'dot'
            },
            marker: {
                size: [4, 12],
                color: '#e67e22',
                symbol: 'star'
            }
        });

        const layout = {
            title: `Vector Arithmetic in 2D: ${wordA} - ${wordB} + ${wordC}`,
            xaxis: { title: 'Dimension 1', zeroline: true, zerolinewidth: 2 },
            yaxis: { title: 'Dimension 2', zeroline: true, zerolinewidth: 2 },
            height: 600,
            showlegend: true,
            hovermode: 'closest'
        };

        Plotly.newPlot(container, traces, layout, { responsive: true });
    }

    /**
     * Create similarity heatmap
     */
    renderSimilarityHeatmap(words, model) {
        const n = words.length;
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const vecI = model.getVector(words[i]);
                const vecJ = model.getVector(words[j]);
                matrix[i][j] = model.cosineSimilarity(vecI, vecJ);
            }
        }

        const trace = {
            z: matrix,
            x: words,
            y: words,
            type: 'heatmap',
            colorscale: 'Viridis',
            showscale: true
        };

        const layout = {
            title: 'Word Similarity Matrix',
            xaxis: { tickangle: -45 },
            height: 500
        };

        return { data: [trace], layout };
    }

    /**
     * Render neighborhood graph
     */
    renderNeighborhoodGraph(word, neighbors, model) {
        // Create a graph showing the word and its neighbors

        const nodes = [word, ...neighbors.map(n => n.word)];
        const vectors = nodes.map(w => model.getVector(w));

        // Use first 2 dimensions
        const x = vectors.map(v => v[0]);
        const y = vectors.map(v => v[1]);

        const edges = [];
        neighbors.forEach((n, i) => {
            edges.push({
                x: [x[0], x[i + 1]],
                y: [y[0], y[i + 1]],
                mode: 'lines',
                line: {
                    color: '#ddd',
                    width: 2
                },
                showlegend: false,
                hoverinfo: 'skip'
            });
        });

        const nodeTrace = {
            x: x,
            y: y,
            mode: 'markers+text',
            text: nodes,
            textposition: 'top center',
            marker: {
                size: nodes.map((_, i) => i === 0 ? 20 : 12),
                color: nodes.map((_, i) => i === 0 ? this.colors.wordA : this.colors.general),
                line: {
                    color: 'white',
                    width: 2
                }
            },
            hovertemplate: '<b>%{text}</b><extra></extra>'
        };

        const layout = {
            title: `Neighborhood of "${word}"`,
            xaxis: { title: 'Dimension 1', showgrid: false },
            yaxis: { title: 'Dimension 2', showgrid: false },
            height: 500,
            showlegend: false
        };

        return { data: [...edges, nodeTrace], layout };
    }
}
