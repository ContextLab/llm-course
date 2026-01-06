/**
 * Visualization Module
 * Handles all charts and visual displays
 */

export class Visualization {
    constructor() {
        this.leaderboard = [];
        this.setupThemeListener();
    }

    getPlotlyTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            paper_bgcolor: isDark ? 'rgba(30, 30, 46, 0)' : 'rgba(255, 255, 255, 0)',
            plot_bgcolor: isDark ? 'rgba(30, 30, 46, 0)' : 'rgba(255, 255, 255, 0)',
            font: {
                color: isDark ? '#e0e0e0' : '#333333',
                family: 'system-ui, -apple-system, sans-serif'
            },
            colorway: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'],
            xaxis: {
                gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                linecolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                tickfont: { color: isDark ? '#a0a0a0' : '#666666' },
                titlefont: { color: isDark ? '#e0e0e0' : '#333333' }
            },
            yaxis: {
                gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                linecolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                tickfont: { color: isDark ? '#a0a0a0' : '#666666' },
                titlefont: { color: isDark ? '#e0e0e0' : '#333333' }
            },
            polar: {
                bgcolor: isDark ? 'rgba(30, 30, 46, 0)' : 'rgba(255, 255, 255, 0)',
                radialaxis: {
                    gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    linecolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    tickfont: { color: isDark ? '#a0a0a0' : '#666666' }
                },
                angularaxis: {
                    gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    linecolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    tickfont: { color: isDark ? '#a0a0a0' : '#666666' }
                }
            }
        };
    }

    setupThemeListener() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.refreshAllCharts();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    }

    refreshAllCharts() {
        if (this.lastRadarResults) {
            this.plotRadarChart(this.lastRadarResults);
        }
        if (this.lastTradeoffResults) {
            this.plotTradeoffChart(this.lastTradeoffResults);
        }
    }

    clearCharts() {
        const radarEl = document.getElementById('radar-chart');
        const tradeoffEl = document.getElementById('tradeoff-chart');
        if (radarEl) Plotly.purge(radarEl);
        if (tradeoffEl) Plotly.purge(tradeoffEl);
        this.lastRadarResults = null;
        this.lastTradeoffResults = null;
    }

    updateLeaderboard(results, metric = 'similarity') {
        const leaderboardEl = document.getElementById('leaderboard');
        if (!results || results.length === 0) {
            leaderboardEl.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Run tests to see rankings</p>';
            return;
        }

        // Sort by metric
        const sorted = [...results].sort((a, b) => {
            const scoreA = a[metric] || a.confidence || a.avgSimilarity || 0;
            const scoreB = b[metric] || b.confidence || b.avgSimilarity || 0;
            return scoreB - scoreA;
        });

        leaderboardEl.innerHTML = '';
        sorted.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';

            const rank = document.createElement('div');
            rank.className = `leaderboard-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`;
            rank.textContent = index + 1;

            const name = document.createElement('div');
            name.className = 'leaderboard-name';
            name.textContent = result.modelName;

            const score = document.createElement('div');
            score.className = 'leaderboard-score';
            const scoreValue = result[metric] || result.confidence || result.avgSimilarity || 0;
            score.textContent = scoreValue.toFixed(3);

            item.appendChild(rank);
            item.appendChild(name);
            item.appendChild(score);
            leaderboardEl.appendChild(item);
        });
    }

    plotRadarChart(results, metrics = ['quality', 'speed', 'consistency']) {
        if (!results || results.length === 0) return;
        this.lastRadarResults = results;

        const theme = this.getPlotlyTheme();
        const colors = theme.colorway;

        const traces = results.map((result, idx) => {
            const quality = result.similarity || result.confidence || result.avgSimilarity || 0.5;
            const speed = result.time ? Math.max(0, 1 - (result.time / 1000)) : 0.5;
            const consistency = quality;

            return {
                type: 'scatterpolar',
                r: [quality, speed, consistency, quality],
                theta: ['Quality', 'Speed', 'Consistency', 'Quality'],
                fill: 'toself',
                name: result.modelName,
                opacity: 0.6,
                line: { color: colors[idx % colors.length], width: 2 },
                fillcolor: colors[idx % colors.length].replace(')', ', 0.3)').replace('rgb', 'rgba'),
                marker: { color: colors[idx % colors.length] }
            };
        });

        const layout = {
            polar: {
                bgcolor: theme.polar.bgcolor,
                radialaxis: {
                    visible: true,
                    range: [0, 1],
                    tickvals: [0.25, 0.5, 0.75, 1],
                    ticktext: ['0.25', '0.50', '0.75', '1.00'],
                    ...theme.polar.radialaxis
                },
                angularaxis: {
                    ...theme.polar.angularaxis,
                    tickfont: { size: 11, ...theme.polar.angularaxis.tickfont }
                }
            },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.15,
                x: 0.5,
                xanchor: 'center',
                font: theme.font,
                bgcolor: 'rgba(0,0,0,0)'
            },
            height: 320,
            margin: { l: 60, r: 60, t: 30, b: 80 },
            paper_bgcolor: theme.paper_bgcolor,
            font: theme.font
        };

        Plotly.newPlot('radar-chart', traces, layout, { responsive: true, displayModeBar: false });
    }

    plotTradeoffChart(results) {
        if (!results || results.length === 0) return;
        this.lastTradeoffResults = results;

        const theme = this.getPlotlyTheme();
        const colors = theme.colorway;

        const trace = {
            x: results.map(r => r.time),
            y: results.map(r => r.similarity || r.confidence || r.avgSimilarity || 0),
            mode: 'markers+text',
            type: 'scatter',
            text: results.map(r => r.modelName.split('-')[0]),
            textposition: 'top center',
            textfont: {
                size: 10,
                color: theme.font.color
            },
            marker: {
                size: 18,
                color: results.map((_, i) => colors[i % colors.length]),
                line: { color: 'white', width: 2 }
            },
            hovertemplate: '<b>%{text}</b><br>Time: %{x:.1f}ms<br>Quality: %{y:.3f}<extra></extra>'
        };

        const layout = {
            xaxis: {
                title: { text: 'Time (ms)', font: theme.xaxis.titlefont },
                type: 'log',
                ...theme.xaxis,
                automargin: true
            },
            yaxis: {
                title: { text: 'Quality Score', font: theme.yaxis.titlefont },
                range: [0, 1.1],
                ...theme.yaxis,
                automargin: true
            },
            hovermode: 'closest',
            height: 320,
            margin: { l: 60, r: 30, t: 40, b: 60 },
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: theme.font
        };

        Plotly.newPlot('tradeoff-chart', [trace], layout, { responsive: true, displayModeBar: false });
    }

    displaySimilarityResults(results) {
        const container = document.getElementById('similarity-results');
        container.innerHTML = '';

        results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="result-model">
                    <span>${result.modelName}</span>
                    <span class="result-score">${(result.similarity * 100).toFixed(1)}%</span>
                </div>
                <div class="result-time">Processing time: ${result.time.toFixed(1)}ms</div>
            `;
            container.appendChild(card);
        });
    }

    displayAnalogyResults(results) {
        const container = document.getElementById('analogy-results');
        container.innerHTML = '';

        results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'result-card';

            let candidatesHTML = '';
            if (result.allCandidates) {
                candidatesHTML = '<div style="margin-top: 10px; font-size: 0.85em;">Top candidates:<br>';
                result.allCandidates.slice(0, 3).forEach((c, i) => {
                    candidatesHTML += `${i + 1}. ${c.word} (${(c.similarity * 100).toFixed(1)}%)<br>`;
                });
                candidatesHTML += '</div>';
            }

            card.innerHTML = `
                <div class="result-model">
                    <span>${result.modelName}</span>
                    <span class="result-score">${result.prediction}</span>
                </div>
                <div class="result-time">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
                ${candidatesHTML}
            `;
            container.appendChild(card);
        });
    }

    displayCategorizationResults(results) {
        const container = document.getElementById('categorization-results');
        container.innerHTML = '';

        results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'result-card';

            let categoriesHTML = '';
            result.categories.forEach((category, i) => {
                categoriesHTML += `<div style="margin-top: 8px;">
                    <strong>Category ${i + 1}:</strong> ${category.join(', ')}
                </div>`;
            });

            const silhouetteDisplay = result.silhouetteScore !== undefined
                ? `<div class="result-quality">Cluster Quality: ${(result.silhouetteScore * 100).toFixed(1)}%</div>`
                : '';

            card.innerHTML = `
                <div class="result-model">
                    <span>${result.modelName}</span>
                    ${result.silhouetteScore !== undefined ? `<span class="result-score">${(result.silhouetteScore * 100).toFixed(1)}%</span>` : ''}
                </div>
                <div class="result-time">Processing time: ${result.time.toFixed(1)}ms</div>
                ${categoriesHTML}
            `;
            container.appendChild(card);
        });
    }

}
