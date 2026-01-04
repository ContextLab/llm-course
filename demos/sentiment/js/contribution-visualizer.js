/**
 * Word-Level Sentiment Contribution Visualizer
 * Highlights individual words based on their sentiment contribution
 */

class ContributionVisualizer {
    constructor(container) {
        this.container = container;
    }

    /**
     * Visualize word contributions to overall sentiment
     */
    visualize(text, analysisResult) {
        this.container.innerHTML = '';

        if (!analysisResult.wordScores || analysisResult.wordScores.length === 0) {
            this.container.innerHTML = '<p class="placeholder">No word-level analysis available</p>';
            return;
        }

        // Create word elements with sentiment highlighting
        const fragment = document.createDocumentFragment();
        const wordScores = analysisResult.wordScores;

        // Find max absolute score for normalization
        const maxScore = Math.max(...wordScores.map(ws => Math.abs(ws.score)));

        wordScores.forEach((wordScore, index) => {
            const span = document.createElement('span');
            span.className = 'word-item';
            span.textContent = wordScore.token;

            // Calculate intensity (0 to 1)
            const intensity = maxScore > 0 ? Math.abs(wordScore.score) / maxScore : 0;

            let sentimentClass = 'neutral';
            if (wordScore.score >= 0.05) {
                sentimentClass = 'positive';
            } else if (wordScore.score <= -0.05) {
                sentimentClass = 'negative';
            }

            span.classList.add(`sentiment-${sentimentClass}`);

            // Set opacity based on intensity
            const opacity = 0.3 + (intensity * 0.7); // Range from 0.3 to 1.0
            span.style.opacity = opacity;

            // Add tooltip with score
            span.title = `Score: ${wordScore.score.toFixed(3)}`;

            // Add hover effect
            span.addEventListener('mouseenter', () => {
                this.highlightWord(span, wordScore);
            });

            span.addEventListener('mouseleave', () => {
                this.unhighlightWord(span);
            });

            fragment.appendChild(span);

            // Add space after word (except last)
            if (index < wordScores.length - 1) {
                fragment.appendChild(document.createTextNode(' '));
            }
        });

        this.container.appendChild(fragment);

        // Add statistics
        this.addStatistics(wordScores);
    }

    /**
     * Highlight a word on hover
     */
    highlightWord(element, wordScore) {
        element.style.transform = 'scale(1.1)';
        element.style.fontWeight = 'bold';
        element.style.zIndex = '10';

        // Show detailed tooltip
        this.showTooltip(element, wordScore);
    }

    /**
     * Remove highlight
     */
    unhighlightWord(element) {
        element.style.transform = 'scale(1)';
        element.style.fontWeight = 'normal';
        element.style.zIndex = '1';

        this.hideTooltip();
    }

    /**
     * Show detailed tooltip
     */
    showTooltip(element, wordScore) {
        // Remove existing tooltip
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'word-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-word">${wordScore.token}</div>
            <div class="tooltip-score">
                Score: <strong>${wordScore.score.toFixed(3)}</strong>
            </div>
            <div class="tooltip-impact">
                Impact: <strong>${this.getImpactLabel(Math.abs(wordScore.score))}</strong>
            </div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

        // Add class for animation
        requestAnimationFrame(() => {
            tooltip.classList.add('visible');
        });
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const existing = document.querySelector('.word-tooltip');
        if (existing) {
            existing.remove();
        }
    }

    /**
     * Get impact label based on score magnitude
     */
    getImpactLabel(absScore) {
        if (absScore >= 2.5) return 'Very High';
        if (absScore >= 2.0) return 'High';
        if (absScore >= 1.0) return 'Medium';
        if (absScore >= 0.5) return 'Low';
        return 'Minimal';
    }

    /**
     * Add word contribution statistics
     */
    addStatistics(wordScores) {
        const stats = this.calculateStatistics(wordScores);

        const statsDiv = document.createElement('div');
        statsDiv.className = 'contribution-stats';
        statsDiv.innerHTML = `
            <div class="stat-grid">
                <div class="stat">
                    <span class="stat-label">Positive Words</span>
                    <span class="stat-value positive">${stats.positiveCount}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Neutral Words</span>
                    <span class="stat-value neutral">${stats.neutralCount}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Negative Words</span>
                    <span class="stat-value negative">${stats.negativeCount}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Total Impact</span>
                    <span class="stat-value">${stats.totalImpact.toFixed(2)}</span>
                </div>
            </div>
        `;

        this.container.appendChild(statsDiv);

        // Add top contributors
        if (stats.topContributors.length > 0) {
            this.addTopContributors(stats.topContributors);
        }
    }

    /**
     * Calculate statistics from word scores
     */
    calculateStatistics(wordScores) {
        const positive = wordScores.filter(ws => ws.score >= 0.05);
        const negative = wordScores.filter(ws => ws.score <= -0.05);
        const neutral = wordScores.filter(ws => Math.abs(ws.score) < 0.05);

        const totalImpact = wordScores.reduce((sum, ws) => sum + Math.abs(ws.score), 0);

        const sorted = [...wordScores]
            .filter(ws => Math.abs(ws.score) >= 0.05)
            .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
            .slice(0, 5);

        return {
            positiveCount: positive.length,
            negativeCount: negative.length,
            neutralCount: neutral.length,
            totalImpact,
            topContributors: sorted
        };
    }

    /**
     * Add top contributor words
     */
    addTopContributors(contributors) {
        const contributorsDiv = document.createElement('div');
        contributorsDiv.className = 'top-contributors';
        contributorsDiv.innerHTML = `
            <h3>Top Contributing Words</h3>
            <div class="contributors-list">
                ${contributors.map((c, i) => `
                    <div class="contributor-item">
                        <span class="rank">#${i + 1}</span>
                        <span class="contributor-word sentiment-${c.score > 0 ? 'positive' : 'negative'}">
                            ${c.token}
                        </span>
                        <span class="contributor-score">${c.score.toFixed(2)}</span>
                        <div class="contributor-bar">
                            <div class="bar-fill ${c.score > 0 ? 'positive-bar' : 'negative-bar'}"
                                 style="width: ${Math.abs(c.score) * 20}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.container.appendChild(contributorsDiv);
    }

    /**
     * Create heatmap visualization
     */
    createHeatmap(text, wordScores) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 100;
        canvas.className = 'sentiment-heatmap';

        const ctx = canvas.getContext('2d');
        const words = text.split(/\s+/);

        // Calculate cell width
        const cellWidth = canvas.width / words.length;

        wordScores.forEach((ws, index) => {
            // Determine color based on sentiment score
            let color;
            const intensity = Math.min(Math.abs(ws.score) / 3, 1); // Normalize to 0-1

            if (ws.score > 0) {
                // Green for positive
                color = `rgba(34, 197, 94, ${intensity})`;
            } else if (ws.score < 0) {
                // Red for negative
                color = `rgba(239, 68, 68, ${intensity})`;
            } else {
                // Gray for neutral
                color = `rgba(148, 163, 184, 0.3)`;
            }

            // Draw cell
            ctx.fillStyle = color;
            ctx.fillRect(index * cellWidth, 0, cellWidth, canvas.height);

            // Draw border
            ctx.strokeStyle = '#e5e7eb';
            ctx.strokeRect(index * cellWidth, 0, cellWidth, canvas.height);
        });

        return canvas;
    }

    /**
     * Visualize sentiment flow over text
     */
    visualizeSentimentFlow(wordScores) {
        const flowDiv = document.createElement('div');
        flowDiv.className = 'sentiment-flow';

        // Create line chart showing cumulative sentiment
        let cumulative = 0;
        const points = wordScores.map((ws, index) => {
            cumulative += ws.score;
            return {
                x: index,
                y: cumulative,
                word: ws.token
            };
        });

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 600 200');
        svg.setAttribute('class', 'flow-chart');

        // Find min and max for scaling
        const maxY = Math.max(...points.map(p => p.y));
        const minY = Math.min(...points.map(p => p.y));
        const range = maxY - minY || 1;

        // Draw line
        const path = points.map((p, i) => {
            const x = (p.x / points.length) * 600;
            const y = 200 - ((p.y - minY) / range) * 180 - 10;
            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        }).join(' ');

        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('stroke', '#3b82f6');
        pathElement.setAttribute('stroke-width', '2');

        svg.appendChild(pathElement);

        // Add zero line
        const zeroY = 200 - ((-minY) / range) * 180 - 10;
        const zeroLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        zeroLine.setAttribute('x1', '0');
        zeroLine.setAttribute('y1', zeroY);
        zeroLine.setAttribute('x2', '600');
        zeroLine.setAttribute('y2', zeroY);
        zeroLine.setAttribute('stroke', '#94a3b8');
        zeroLine.setAttribute('stroke-dasharray', '5,5');
        zeroLine.setAttribute('stroke-width', '1');
        svg.appendChild(zeroLine);

        flowDiv.appendChild(svg);
        return flowDiv;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContributionVisualizer;
} else if (typeof window !== 'undefined') {
    window.ContributionVisualizer = ContributionVisualizer;
}
