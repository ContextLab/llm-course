/**
 * Probability Visualizer
 * Handles visualization of token probabilities, entropy, and alternatives
 */

export class ProbabilityVisualizer {
    constructor() {
        this.entropyData = [];
        this.entropyChart = null;
        this.maxEntropyPoints = 100;
    }

    /**
     * Initialize the entropy chart
     */
    initEntropyChart() {
        const canvas = document.getElementById('entropyCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.entropyChart = {
            canvas,
            ctx,
            width: canvas.width,
            height: canvas.height
        };

        // Set canvas size
        const container = canvas.parentElement;
        canvas.width = container.clientWidth - 30;
        canvas.height = 200;
    }

    /**
     * Display token probabilities for the current step
     * @param {Object} tokenInfo - Information about the selected token
     * @param {number} step - Current generation step
     */
    displayTokenProbabilities(tokenInfo, step) {
        const container = document.getElementById('probabilityViz');
        if (!container) return;

        const stepDiv = document.createElement('div');
        stepDiv.className = 'token-step';

        // Header
        const header = document.createElement('div');
        header.className = 'step-header';

        const stepNumber = document.createElement('span');
        stepNumber.className = 'step-number';
        stepNumber.textContent = `Step ${step}`;

        const entropy = document.createElement('span');
        entropy.className = 'step-entropy';
        entropy.textContent = `Entropy: ${tokenInfo.entropy.toFixed(2)} bits`;

        header.appendChild(stepNumber);
        header.appendChild(entropy);
        stepDiv.appendChild(header);

        // Show top 5 tokens
        const topTokens = tokenInfo.topTokens.slice(0, 5);
        topTokens.forEach((token, idx) => {
            const barDiv = document.createElement('div');
            barDiv.className = 'probability-bar';

            const label = document.createElement('div');
            label.className = 'prob-bar-label';

            const tokenText = document.createElement('span');
            tokenText.className = 'token-text';
            tokenText.textContent = token.text || `Token ${token.tokenId}`;

            const probText = document.createElement('span');
            probText.className = 'token-prob';
            probText.textContent = `${(token.probability * 100).toFixed(2)}%`;

            label.appendChild(tokenText);
            label.appendChild(probText);

            const barContainer = document.createElement('div');
            barContainer.className = 'prob-bar-container';

            const barFill = document.createElement('div');
            barFill.className = 'prob-bar-fill';
            barFill.style.width = `${token.probability * 100}%`;

            // Highlight selected token
            if (idx === 0 || token.tokenId === tokenInfo.tokenId) {
                barFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
            }

            barContainer.appendChild(barFill);

            barDiv.appendChild(label);
            barDiv.appendChild(barContainer);
            stepDiv.appendChild(barDiv);
        });

        container.appendChild(stepDiv);

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;

        // Limit number of steps shown
        while (container.children.length > 10) {
            container.removeChild(container.firstChild);
        }
    }

    /**
     * Display alternative tokens
     * @param {Array} topTokens - Top token alternatives
     */
    displayAlternatives(topTokens) {
        const container = document.getElementById('alternativesViz');
        if (!container) return;

        // Clear previous alternatives
        container.innerHTML = '';

        const listDiv = document.createElement('div');
        listDiv.className = 'alternatives-list';

        topTokens.slice(0, 10).forEach(token => {
            const tokenDiv = document.createElement('div');
            tokenDiv.className = 'alternative-token';

            const text = document.createElement('span');
            text.className = 'token-text';
            text.textContent = token.text || `Token ${token.tokenId}`;

            const prob = document.createElement('span');
            prob.className = 'token-prob';
            prob.textContent = `${(token.probability * 100).toFixed(1)}%`;

            tokenDiv.appendChild(text);
            tokenDiv.appendChild(prob);
            listDiv.appendChild(tokenDiv);
        });

        container.appendChild(listDiv);
    }

    /**
     * Update entropy chart
     * @param {number} entropy - Current entropy value
     */
    updateEntropyChart(entropy) {
        this.entropyData.push(entropy);

        // Limit data points
        if (this.entropyData.length > this.maxEntropyPoints) {
            this.entropyData.shift();
        }

        this.drawEntropyChart();
    }

    /**
     * Draw the entropy chart on canvas
     */
    drawEntropyChart() {
        if (!this.entropyChart) {
            this.initEntropyChart();
        }

        if (!this.entropyChart || this.entropyData.length === 0) return;

        const { ctx, canvas } = this.entropyChart;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Calculate scales
        const maxEntropy = Math.max(...this.entropyData, 10);
        const xScale = width / Math.max(this.entropyData.length - 1, 1);
        const yScale = (height - 40) / maxEntropy;

        // Draw grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = height - 20 - (i * (height - 40) / 5);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px sans-serif';
            ctx.fillText((i * maxEntropy / 5).toFixed(1), 5, y - 3);
        }

        // Draw line
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.entropyData.forEach((value, idx) => {
            const x = idx * xScale;
            const y = height - 20 - (value * yScale);

            if (idx === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#818cf8';
        this.entropyData.forEach((value, idx) => {
            const x = idx * xScale;
            const y = height - 20 - (value * yScale);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw axis labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.fillText('Entropy (bits)', 10, 15);
        ctx.fillText('Token Position', width - 100, height - 5);
    }

    /**
     * Display surprise visualization
     * @param {Array} tokens - Array of token objects with surprise values
     */
    displaySurprise(tokens) {
        const container = document.getElementById('surpriseViz');
        if (!container) return;

        container.innerHTML = '';

        // Legend
        const legend = document.createElement('div');
        legend.className = 'surprise-legend';
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #10b981;"></div>
                <span>Low Surprise (&lt; 2 bits)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f59e0b;"></div>
                <span>High Surprise (5-8 bits)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ef4444;"></div>
                <span>Very High (&gt; 8 bits)</span>
            </div>
        `;
        container.appendChild(legend);

        // Token list with surprise values
        const tokenList = document.createElement('div');
        tokenList.style.marginTop = '15px';

        tokens.forEach(token => {
            if (!token.surprise) return;

            const tokenDiv = document.createElement('div');
            tokenDiv.style.display = 'inline-block';
            tokenDiv.style.margin = '3px';
            tokenDiv.style.padding = '5px 10px';
            tokenDiv.style.borderRadius = '4px';
            tokenDiv.style.background = '#1e293b';
            tokenDiv.style.border = '2px solid';

            // Color based on surprise
            if (token.surprise < 2) {
                tokenDiv.style.borderColor = '#10b981';
            } else if (token.surprise < 5) {
                tokenDiv.style.borderColor = '#3b82f6';
            } else if (token.surprise < 8) {
                tokenDiv.style.borderColor = '#f59e0b';
            } else {
                tokenDiv.style.borderColor = '#ef4444';
            }

            tokenDiv.innerHTML = `
                <span style="font-weight: 500;">${token.text}</span>
                <span style="color: #94a3b8; font-size: 0.85em; margin-left: 5px;">
                    ${token.surprise.toFixed(2)} bits
                </span>
            `;

            tokenList.appendChild(tokenDiv);
        });

        container.appendChild(tokenList);
    }

    /**
     * Clear all visualizations
     */
    clear() {
        // Clear probability viz
        const probViz = document.getElementById('probabilityViz');
        if (probViz) probViz.innerHTML = '';

        // Clear alternatives
        const altViz = document.getElementById('alternativesViz');
        if (altViz) altViz.innerHTML = '';

        // Clear surprise
        const surpriseViz = document.getElementById('surpriseViz');
        if (surpriseViz) surpriseViz.innerHTML = '';

        // Clear entropy data
        this.entropyData = [];
        this.drawEntropyChart();
    }

    /**
     * Update statistics display
     * @param {Object} stats - Statistics object
     */
    updateStats(stats) {
        const elements = {
            tokenCount: document.getElementById('tokenCount'),
            avgProb: document.getElementById('avgProb'),
            avgEntropy: document.getElementById('avgEntropy'),
            timeElapsed: document.getElementById('timeElapsed')
        };

        if (elements.tokenCount) {
            elements.tokenCount.textContent = stats.tokenCount || 0;
        }

        if (elements.avgProb && stats.avgProbability !== undefined) {
            elements.avgProb.textContent = (stats.avgProbability * 100).toFixed(2) + '%';
        }

        if (elements.avgEntropy && stats.avgEntropy !== undefined) {
            elements.avgEntropy.textContent = stats.avgEntropy.toFixed(2);
        }

        if (elements.timeElapsed && stats.timeElapsed !== undefined) {
            elements.timeElapsed.textContent = stats.timeElapsed.toFixed(1) + 's';
        }
    }

    /**
     * Show or hide visualization sections based on options
     * @param {Object} options - Visibility options
     */
    setVisibilityOptions(options) {
        const sections = {
            probabilitySection: options.showProbabilities,
            alternativesSection: options.showAlternatives,
            entropySection: options.showEntropy,
            surpriseSection: options.showSurprise
        };

        Object.keys(sections).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = sections[sectionId] ? 'block' : 'none';
            }
        });
    }

    /**
     * Create a token element with tooltip
     * @param {string} text - Token text
     * @param {Object} info - Token information (probability, surprise, etc.)
     * @returns {HTMLElement} Token element
     */
    createTokenElement(text, info) {
        const span = document.createElement('span');
        span.className = 'token new';
        span.textContent = text;

        // Add surprise class if applicable
        if (info.surprise) {
            if (info.surprise > 8) {
                span.classList.add('very-high-surprise');
            } else if (info.surprise > 5) {
                span.classList.add('high-surprise');
            }
        }

        // Create tooltip
        if (info.probability || info.surprise) {
            const tooltip = document.createElement('div');
            tooltip.className = 'token-tooltip';

            let tooltipText = '';
            if (info.probability) {
                tooltipText += `Prob: ${(info.probability * 100).toFixed(2)}%`;
            }
            if (info.surprise) {
                if (tooltipText) tooltipText += '\n';
                tooltipText += `Surprise: ${info.surprise.toFixed(2)} bits`;
            }

            tooltip.textContent = tooltipText;
            span.appendChild(tooltip);
        }

        // Remove 'new' class after animation
        setTimeout(() => {
            span.classList.remove('new');
        }, 500);

        return span;
    }
}

export default ProbabilityVisualizer;
