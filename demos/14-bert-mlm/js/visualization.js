/**
 * Attention Visualization for BERT
 * Creates heatmaps and interactive visualizations
 */

export class AttentionVisualizer {
    constructor() {
        this.colorscale = [
            [0, '#f7fbff'],
            [0.2, '#deebf7'],
            [0.4, '#9ecae1'],
            [0.6, '#4292c6'],
            [0.8, '#2171b5'],
            [1, '#08519c']
        ];
    }

    /**
     * Render attention heatmap using Plotly
     */
    renderAttentionHeatmap(attentionMatrix, tokens, layer, head) {
        const container = document.getElementById('attention-heatmap');

        // Clean tokens (remove special characters)
        const cleanTokens = tokens.map(t => t.replace('##', ''));

        // Create heatmap data
        const data = [{
            z: attentionMatrix,
            x: cleanTokens,
            y: cleanTokens,
            type: 'heatmap',
            colorscale: this.colorscale,
            showscale: true,
            hoverongaps: false,
            hovertemplate: 'From: %{y}<br>To: %{x}<br>Attention: %{z:.3f}<extra></extra>'
        }];

        const layout = {
            title: `Attention Weights - Layer ${layer + 1}, Head ${head + 1}`,
            xaxis: {
                title: 'To Token',
                side: 'bottom',
                tickangle: -45
            },
            yaxis: {
                title: 'From Token',
                autorange: 'reversed'
            },
            width: null,
            height: Math.max(400, tokens.length * 30),
            margin: {
                l: 100,
                r: 50,
                t: 80,
                b: 120
            }
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        };

        Plotly.newPlot(container, data, layout, config);

        // Add click handler to show attention details
        container.on('plotly_click', (data) => {
            const point = data.points[0];
            this.showAttentionDetails(point, tokens, attentionMatrix);
        });

        // Show summary
        this.showAttentionSummary(attentionMatrix, tokens);
    }

    /**
     * Show attention details for clicked cell
     */
    showAttentionDetails(point, tokens, matrix) {
        const fromIdx = point.y;
        const toIdx = point.x;
        const attention = point.z;

        const detailsDiv = document.getElementById('attention-details');

        const fromToken = tokens[fromIdx].replace('##', '');
        const toToken = tokens[toIdx].replace('##', '');

        // Get top attended tokens from this position
        const fromAttention = matrix[fromIdx];
        const topAttended = fromAttention
            .map((val, idx) => ({ token: tokens[idx].replace('##', ''), value: val, idx }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        detailsDiv.innerHTML = `
            <h4>Attention Detail</h4>
            <div style="margin: 15px 0;">
                <strong>From:</strong> <span class="token-highlight">${fromToken}</span> (position ${fromIdx})
                <br>
                <strong>To:</strong> <span class="token-highlight">${toToken}</span> (position ${toIdx})
                <br>
                <strong>Attention Weight:</strong> <span class="attention-value">${(attention * 100).toFixed(2)}%</span>
            </div>

            <div style="margin-top: 20px;">
                <h5>Top 5 Tokens Attended by "${fromToken}":</h5>
                <ol>
                    ${topAttended.map(item => `
                        <li>
                            <span class="token-highlight">${item.token}</span>
                            <span class="attention-value">${(item.value * 100).toFixed(2)}%</span>
                        </li>
                    `).join('')}
                </ol>
            </div>
        `;

        detailsDiv.style.display = 'block';
    }

    /**
     * Show summary statistics for attention
     */
    showAttentionSummary(matrix, tokens) {
        const n = matrix.length;

        // Calculate average attention per token
        const avgAttention = matrix.map(row => {
            const sum = row.reduce((a, b) => a + b, 0);
            return sum / n;
        });

        // Find tokens with highest average attention received
        const attentionReceived = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                attentionReceived[j] += matrix[i][j];
            }
        }

        const topReceived = attentionReceived
            .map((val, idx) => ({ token: tokens[idx].replace('##', ''), value: val / n, idx }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // Calculate attention entropy (measure of attention spread)
        const entropies = matrix.map(row => {
            let entropy = 0;
            for (let val of row) {
                if (val > 0) {
                    entropy -= val * Math.log2(val);
                }
            }
            return entropy;
        });

        const avgEntropy = entropies.reduce((a, b) => a + b, 0) / n;

        console.log('Attention Summary:');
        console.log('Average Entropy:', avgEntropy.toFixed(3));
        console.log('Top Attended Tokens:', topReceived);
    }

    /**
     * Render attention flow diagram (alternative visualization)
     */
    renderAttentionFlow(attentionMatrix, tokens, sourceIdx) {
        // Create a flow diagram showing attention from a specific token
        const attention = attentionMatrix[sourceIdx];

        const topAttention = attention
            .map((val, idx) => ({ token: tokens[idx].replace('##', ''), value: val, idx }))
            .filter(item => item.idx !== sourceIdx)
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        const data = [{
            type: 'bar',
            x: topAttention.map(item => item.token),
            y: topAttention.map(item => item.value),
            marker: {
                color: topAttention.map(item => item.value),
                colorscale: this.colorscale,
                showscale: true
            },
            text: topAttention.map(item => (item.value * 100).toFixed(2) + '%'),
            textposition: 'outside'
        }];

        const layout = {
            title: `Attention from "${tokens[sourceIdx].replace('##', '')}"`,
            xaxis: { title: 'Tokens' },
            yaxis: { title: 'Attention Weight', range: [0, Math.max(...attention) * 1.1] },
            height: 400
        };

        return { data, layout };
    }

    /**
     * Create attention statistics chart
     */
    createAttentionStats(attentions, tokens) {
        // Aggregate attention across all heads and layers
        const numLayers = attentions.length;
        const numHeads = attentions[0].length;
        const seqLen = tokens.length;

        const avgAttention = Array(seqLen).fill(0).map(() => Array(seqLen).fill(0));

        // Average over all layers and heads
        for (let layer of attentions) {
            for (let head of layer) {
                for (let i = 0; i < seqLen; i++) {
                    for (let j = 0; j < seqLen; j++) {
                        avgAttention[i][j] += head[i][j];
                    }
                }
            }
        }

        const total = numLayers * numHeads;
        for (let i = 0; i < seqLen; i++) {
            for (let j = 0; j < seqLen; j++) {
                avgAttention[i][j] /= total;
            }
        }

        return avgAttention;
    }

    /**
     * Render layer comparison
     */
    renderLayerComparison(attentions, tokens, tokenIdx) {
        // Show how attention to a specific token changes across layers

        const numLayers = attentions.length;
        const numHeads = attentions[0].length;

        const layerAttentions = [];

        for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
            let avgAttention = 0;

            for (let headIdx = 0; headIdx < numHeads; headIdx++) {
                const attention = attentions[layerIdx][headIdx];

                // Average attention to this token from all positions
                for (let i = 0; i < tokens.length; i++) {
                    avgAttention += attention[i][tokenIdx];
                }
            }

            avgAttention /= (numHeads * tokens.length);
            layerAttentions.push(avgAttention);
        }

        const data = [{
            type: 'scatter',
            mode: 'lines+markers',
            x: Array.from({ length: numLayers }, (_, i) => i + 1),
            y: layerAttentions,
            line: { color: '#6a11cb', width: 3 },
            marker: { size: 10, color: '#2575fc' }
        }];

        const layout = {
            title: `Attention to "${tokens[tokenIdx].replace('##', '')}" Across Layers`,
            xaxis: { title: 'Layer', dtick: 1 },
            yaxis: { title: 'Average Attention' },
            height: 350
        };

        return { data, layout };
    }

    /**
     * Create word cloud from attention weights
     */
    createAttentionWordCloud(attentionMatrix, tokens, sourceIdx) {
        const attention = attentionMatrix[sourceIdx];

        const words = tokens
            .map((token, idx) => ({
                text: token.replace('##', ''),
                size: attention[idx] * 100,
                value: attention[idx]
            }))
            .filter(w => w.size > 1 && w.text !== '[CLS]' && w.text !== '[SEP]');

        return words;
    }

    /**
     * Render multi-head attention comparison
     */
    renderMultiHeadComparison(layerAttention, tokens, tokenIdx) {
        const numHeads = layerAttention.length;

        const traces = [];

        for (let headIdx = 0; headIdx < numHeads; headIdx++) {
            const attention = layerAttention[headIdx][tokenIdx];

            traces.push({
                type: 'bar',
                name: `Head ${headIdx + 1}`,
                x: tokens.map(t => t.replace('##', '')),
                y: attention,
                visible: headIdx < 4 ? true : 'legendonly'  // Show first 4 heads by default
            });
        }

        const layout = {
            title: `Multi-Head Attention to "${tokens[tokenIdx].replace('##', '')}"`,
            xaxis: { title: 'Tokens', tickangle: -45 },
            yaxis: { title: 'Attention Weight' },
            barmode: 'group',
            height: 500,
            margin: { b: 120 }
        };

        return { data: traces, layout };
    }
}
