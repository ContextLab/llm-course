/**
 * Visualization Module
 * Handles all charts and visual displays
 */

export class Visualization {
    constructor() {
        this.leaderboard = [];
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

        const traces = results.map(result => {
            // Normalize metrics to 0-1 scale
            const quality = result.similarity || result.confidence || result.avgSimilarity || 0.5;
            const speed = result.time ? Math.max(0, 1 - (result.time / 1000)) : 0.5;
            const consistency = quality; // Simplified

            return {
                type: 'scatterpolar',
                r: [quality, speed, consistency],
                theta: ['Quality', 'Speed', 'Consistency'],
                fill: 'toself',
                name: result.modelName,
                opacity: 0.7
            };
        });

        const layout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 1]
                }
            },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.2
            },
            height: 300,
            margin: { l: 40, r: 40, t: 20, b: 60 }
        };

        Plotly.newPlot('radar-chart', traces, layout, { responsive: true });
    }

    plotTradeoffChart(results) {
        if (!results || results.length === 0) return;

        const trace = {
            x: results.map(r => r.time),
            y: results.map(r => r.similarity || r.confidence || r.avgSimilarity || 0),
            mode: 'markers+text',
            type: 'scatter',
            text: results.map(r => r.modelName),
            textposition: 'top center',
            marker: {
                size: 15,
                color: results.map((_, i) => i),
                colorscale: 'Viridis'
            }
        };

        const layout = {
            xaxis: { title: 'Time (ms)', type: 'log' },
            yaxis: { title: 'Quality Score' },
            hovermode: 'closest',
            height: 300,
            margin: { l: 50, r: 20, t: 20, b: 50 }
        };

        Plotly.newPlot('tradeoff-chart', [trace], layout, { responsive: true });
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

            card.innerHTML = `
                <div class="result-model">
                    <span>${result.modelName}</span>
                </div>
                <div class="result-time">Processing time: ${result.time.toFixed(1)}ms</div>
                ${categoriesHTML}
            `;
            container.appendChild(card);
        });
    }

    displayCustomResults(results) {
        const container = document.getElementById('custom-results');
        container.innerHTML = '';

        results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'result-card';

            let similaritiesHTML = '<div style="margin-top: 10px; font-size: 0.85em;">Top similarities:<br>';
            result.similarities.slice(0, 5).forEach((s, i) => {
                similaritiesHTML += `${i + 1}. "${s.sentences[0]}..." ↔ "${s.sentences[1]}..." (${(s.similarity * 100).toFixed(1)}%)<br>`;
            });
            similaritiesHTML += '</div>';

            card.innerHTML = `
                <div class="result-model">
                    <span>${result.modelName}</span>
                    <span class="result-score">Avg: ${(result.avgSimilarity * 100).toFixed(1)}%</span>
                </div>
                <div class="result-time">Processing time: ${result.time.toFixed(1)}ms</div>
                ${similaritiesHTML}
            `;
            container.appendChild(card);
        });
    }
}
