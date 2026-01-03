/**
 * Attention Visualizer - Create interactive visualizations of attention patterns
 * Supports heatmaps, arc diagrams, and matrix views
 */

export class AttentionVisualizer {
    constructor() {
        this.colorScale = this.createColorScale();
    }

    /**
     * Create a color scale for attention weights
     * @returns {Function} Function that maps [0,1] to color
     */
    createColorScale() {
        // Color scale from light blue to dark blue
        return (value) => {
            const intensity = Math.floor(value * 255);
            const r = Math.floor(255 - intensity * 0.8);
            const g = Math.floor(255 - intensity * 0.5);
            const b = 255;
            return `rgb(${r}, ${g}, ${b})`;
        };
    }

    /**
     * Render attention as a heatmap on canvas
     * @param {Array} attentionMatrix - 2D array of attention weights [query][key]
     * @param {Array} tokens - Array of token strings
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {HTMLElement} tooltip - Tooltip element
     */
    renderHeatmap(attentionMatrix, tokens, canvas, tooltip) {
        const seqLen = attentionMatrix.length;
        const cellSize = Math.min(40, Math.floor(800 / seqLen));
        const labelWidth = 100;
        const labelHeight = 80;

        // Set canvas size
        canvas.width = seqLen * cellSize + labelWidth;
        canvas.height = seqLen * cellSize + labelHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw heatmap cells
        for (let query = 0; query < seqLen; query++) {
            for (let key = 0; key < seqLen; key++) {
                const value = attentionMatrix[query][key];
                const x = key * cellSize + labelWidth;
                const y = query * cellSize + labelHeight;

                ctx.fillStyle = this.colorScale(value);
                ctx.fillRect(x, y, cellSize, cellSize);

                // Draw cell border
                ctx.strokeStyle = '#e0e0e0';
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }

        // Draw labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';

        // Row labels (queries)
        for (let i = 0; i < seqLen; i++) {
            const token = this.truncateToken(tokens[i], 12);
            const y = i * cellSize + labelHeight + cellSize / 2 + 4;
            ctx.fillText(token, labelWidth - 5, y);
        }

        // Column labels (keys)
        ctx.save();
        ctx.textAlign = 'left';
        for (let i = 0; i < seqLen; i++) {
            const token = this.truncateToken(tokens[i], 12);
            const x = i * cellSize + labelWidth + cellSize / 2;
            const y = labelHeight - 5;

            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(token, 0, 0);
            ctx.rotate(Math.PI / 4);
            ctx.translate(-x, -y);
        }
        ctx.restore();

        // Add axis labels
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Keys (Attended To) →', canvas.width / 2 + labelWidth / 2, 20);

        ctx.save();
        ctx.translate(15, canvas.height / 2 + labelHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Queries (Attending From) →', 0, 0);
        ctx.restore();

        // Add interactivity
        this.addHeatmapInteractivity(canvas, tooltip, attentionMatrix, tokens, cellSize, labelWidth, labelHeight);
    }

    /**
     * Add mouse interactivity to heatmap
     */
    addHeatmapInteractivity(canvas, tooltip, attentionMatrix, tokens, cellSize, labelWidth, labelHeight) {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const key = Math.floor((x - labelWidth) / cellSize);
            const query = Math.floor((y - labelHeight) / cellSize);

            if (key >= 0 && key < tokens.length && query >= 0 && query < tokens.length) {
                const weight = attentionMatrix[query][key];
                const queryToken = tokens[query];
                const keyToken = tokens[key];

                tooltip.innerHTML = `
                    <strong>${queryToken}</strong> → <strong>${keyToken}</strong><br>
                    Weight: ${weight.toFixed(4)}<br>
                    Position: [${query}, ${key}]
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX + 10) + 'px';
                tooltip.style.top = (e.clientY + 10) + 'px';

                canvas.style.cursor = 'pointer';
            } else {
                tooltip.style.display = 'none';
                canvas.style.cursor = 'default';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }

    /**
     * Render attention as an arc diagram
     * @param {Array} attentionMatrix - 2D array of attention weights
     * @param {Array} tokens - Array of token strings
     * @param {SVGElement} svg - SVG element
     * @param {HTMLElement} tooltip - Tooltip element
     */
    renderArcDiagram(attentionMatrix, tokens, svg, tooltip) {
        const seqLen = tokens.length;
        const width = Math.max(800, seqLen * 80);
        const height = 500;
        const margin = { top: 100, right: 50, bottom: 100, left: 50 };

        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.innerHTML = '';

        const tokenSpacing = (width - margin.left - margin.right) / (seqLen - 1);
        const baselineY = height - margin.bottom;

        // Draw arcs for attention
        const arcsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(arcsGroup);

        // Find max weight for normalization
        const maxWeight = Math.max(...attentionMatrix.flat());

        // Draw arcs (filter to show only significant attention)
        const threshold = 0.1;
        for (let query = 0; query < seqLen; query++) {
            for (let key = 0; key < seqLen; key++) {
                if (query === key) continue; // Skip self-attention

                const weight = attentionMatrix[query][key];
                if (weight < threshold) continue;

                const x1 = margin.left + query * tokenSpacing;
                const x2 = margin.left + key * tokenSpacing;
                const distance = Math.abs(x2 - x1);
                const controlY = baselineY - distance * 0.5;

                // Create path
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = `M ${x1} ${baselineY} Q ${(x1 + x2) / 2} ${controlY} ${x2} ${baselineY}`;

                path.setAttribute('d', d);
                path.setAttribute('stroke', this.colorScale(weight / maxWeight));
                path.setAttribute('stroke-width', Math.max(1, weight * 5));
                path.setAttribute('fill', 'none');
                path.setAttribute('opacity', '0.6');
                path.classList.add('attention-arc');

                // Add interactivity
                path.addEventListener('mouseenter', (e) => {
                    path.setAttribute('opacity', '1');
                    path.setAttribute('stroke-width', Math.max(2, weight * 5 + 1));

                    tooltip.innerHTML = `
                        <strong>${tokens[query]}</strong> → <strong>${tokens[key]}</strong><br>
                        Weight: ${weight.toFixed(4)}
                    `;
                    tooltip.style.display = 'block';
                });

                path.addEventListener('mousemove', (e) => {
                    tooltip.style.left = (e.clientX + 10) + 'px';
                    tooltip.style.top = (e.clientY + 10) + 'px';
                });

                path.addEventListener('mouseleave', () => {
                    path.setAttribute('opacity', '0.6');
                    path.setAttribute('stroke-width', Math.max(1, weight * 5));
                    tooltip.style.display = 'none';
                });

                arcsGroup.appendChild(path);
            }
        }

        // Draw tokens
        const tokensGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(tokensGroup);

        for (let i = 0; i < seqLen; i++) {
            const x = margin.left + i * tokenSpacing;

            // Token circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', baselineY);
            circle.setAttribute('r', 8);
            circle.setAttribute('fill', '#4CAF50');
            circle.setAttribute('stroke', '#333');
            circle.setAttribute('stroke-width', '2');
            tokensGroup.appendChild(circle);

            // Token text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', baselineY + 25);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', '#333');
            text.textContent = this.truncateToken(tokens[i], 10);
            tokensGroup.appendChild(text);

            // Position number
            const posText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            posText.setAttribute('x', x);
            posText.setAttribute('y', baselineY - 15);
            posText.setAttribute('text-anchor', 'middle');
            posText.setAttribute('font-size', '10');
            posText.setAttribute('fill', '#666');
            posText.textContent = i;
            tokensGroup.appendChild(posText);
        }

        // Title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', width / 2);
        title.setAttribute('y', 30);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '16');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('fill', '#333');
        title.textContent = 'Attention Arc Diagram';
        svg.appendChild(title);

        // Legend
        const legend = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        legend.setAttribute('x', width / 2);
        legend.setAttribute('y', 55);
        legend.setAttribute('text-anchor', 'middle');
        legend.setAttribute('font-size', '12');
        legend.setAttribute('fill', '#666');
        legend.textContent = 'Arc thickness and color indicate attention strength';
        svg.appendChild(legend);
    }

    /**
     * Render attention as a detailed matrix view
     * @param {Array} attentionMatrix - 2D array of attention weights
     * @param {Array} tokens - Array of token strings
     * @param {HTMLElement} container - Container element
     * @param {HTMLElement} tooltip - Tooltip element
     */
    renderMatrixView(attentionMatrix, tokens, container, tooltip) {
        container.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'matrix-table';

        // Header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const emptyCell = document.createElement('th');
        emptyCell.textContent = 'Q \\ K';
        headerRow.appendChild(emptyCell);

        tokens.forEach((token, idx) => {
            const th = document.createElement('th');
            th.innerHTML = `<div class="matrix-header">${this.truncateToken(token, 8)}<br><span class="pos-num">${idx}</span></div>`;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body rows
        const tbody = document.createElement('tbody');

        attentionMatrix.forEach((row, queryIdx) => {
            const tr = document.createElement('tr');

            // Row header
            const th = document.createElement('th');
            th.innerHTML = `<div class="matrix-header">${this.truncateToken(tokens[queryIdx], 8)}<br><span class="pos-num">${queryIdx}</span></div>`;
            tr.appendChild(th);

            // Cells
            row.forEach((weight, keyIdx) => {
                const td = document.createElement('td');
                td.textContent = weight.toFixed(3);
                td.style.backgroundColor = this.colorScale(weight);

                // Adjust text color based on background
                if (weight > 0.5) {
                    td.style.color = '#fff';
                }

                // Add hover effect
                td.addEventListener('mouseenter', (e) => {
                    td.style.transform = 'scale(1.2)';
                    td.style.zIndex = '10';
                    td.style.fontWeight = 'bold';

                    tooltip.innerHTML = `
                        <strong>${tokens[queryIdx]}</strong> → <strong>${tokens[keyIdx]}</strong><br>
                        Weight: ${weight.toFixed(6)}<br>
                        Position: [${queryIdx}, ${keyIdx}]
                    `;
                    tooltip.style.display = 'block';
                });

                td.addEventListener('mousemove', (e) => {
                    tooltip.style.left = (e.clientX + 10) + 'px';
                    tooltip.style.top = (e.clientY + 10) + 'px';
                });

                td.addEventListener('mouseleave', () => {
                    td.style.transform = 'scale(1)';
                    td.style.zIndex = '1';
                    td.style.fontWeight = 'normal';
                    tooltip.style.display = 'none';
                });

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.appendChild(table);
    }

    /**
     * Render multi-head comparison view
     * @param {Array} layerAttention - All heads for a layer [heads][query][key]
     * @param {Array} tokens - Array of token strings
     * @param {HTMLElement} container - Container element
     */
    renderMultiHead(layerAttention, tokens, container) {
        container.innerHTML = '';

        const numHeads = layerAttention.length;
        const gridSize = Math.ceil(Math.sqrt(numHeads));

        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${Math.min(gridSize, 4)}, 1fr)`;
        container.style.gap = '20px';

        layerAttention.forEach((headAttention, headIdx) => {
            const headDiv = document.createElement('div');
            headDiv.className = 'head-minimap';

            const title = document.createElement('h4');
            title.textContent = `Head ${headIdx + 1}`;
            headDiv.appendChild(title);

            const canvas = document.createElement('canvas');
            const size = 150;
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d');
            const seqLen = headAttention.length;
            const cellSize = size / seqLen;

            // Draw miniature heatmap
            for (let query = 0; query < seqLen; query++) {
                for (let key = 0; key < seqLen; key++) {
                    const value = headAttention[query][key];
                    ctx.fillStyle = this.colorScale(value);
                    ctx.fillRect(key * cellSize, query * cellSize, cellSize, cellSize);
                }
            }

            // Add border
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(0, 0, size, size);

            headDiv.appendChild(canvas);

            // Add stats
            const stats = this.computeHeadStats(headAttention);
            const statsDiv = document.createElement('div');
            statsDiv.className = 'head-stats';
            statsDiv.innerHTML = `
                <small>
                    Max: ${stats.max.toFixed(3)}<br>
                    Avg: ${stats.avg.toFixed(3)}
                </small>
            `;
            headDiv.appendChild(statsDiv);

            container.appendChild(headDiv);
        });
    }

    /**
     * Compute statistics for a single attention head
     */
    computeHeadStats(headAttention) {
        const flat = headAttention.flat();
        const max = Math.max(...flat);
        const min = Math.min(...flat);
        const avg = flat.reduce((a, b) => a + b, 0) / flat.length;

        return { max, min, avg };
    }

    /**
     * Truncate token for display
     */
    truncateToken(token, maxLen = 10) {
        if (token.length <= maxLen) return token;
        return token.substring(0, maxLen - 1) + '…';
    }

    /**
     * Get color for value in range [0, 1]
     */
    getColor(value) {
        return this.colorScale(value);
    }
}
