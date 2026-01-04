/**
 * Topic Modeling Visualization
 * Provides multiple visualization modes for LDA results
 */

export class TopicVisualizer {
    constructor() {
        this.currentResults = null;
        this.colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
            '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#ff6b6b',
            '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'
        ];
    }

    /**
     * Get theme-aware Plotly layout options
     */
    getPlotlyTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            paper_bgcolor: isDark ? '#1e1e2e' : '#ffffff',
            plot_bgcolor: isDark ? '#1e1e2e' : '#ffffff',
            font: {
                color: isDark ? '#e0e0e0' : '#333333'
            },
            xaxis: {
                gridcolor: isDark ? '#3a3a4a' : '#e0e0e0',
                linecolor: isDark ? '#3a3a4a' : '#e0e0e0',
                tickfont: { color: isDark ? '#e0e0e0' : '#333333' }
            },
            yaxis: {
                gridcolor: isDark ? '#3a3a4a' : '#e0e0e0',
                linecolor: isDark ? '#3a3a4a' : '#e0e0e0',
                tickfont: { color: isDark ? '#e0e0e0' : '#333333' }
            }
        };
    }

    /**
     * Render overview with topic cards
     */
    renderOverview(results) {
        this.currentResults = results;
        const container = document.getElementById('topics-grid');
        container.innerHTML = '';

        results.topics.forEach((topic, idx) => {
            const card = this.createTopicCard(topic, idx, results);
            container.appendChild(card);
        });
    }

    /**
     * Create a topic card element
     */
    createTopicCard(topic, topicIdx, results) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.style.borderLeftColor = this.colors[topicIdx % this.colors.length];
        card.style.borderLeftWidth = '4px';

        const topWords = topic.slice(0, 10);

        // Count documents where this is the dominant topic
        let dominantCount = 0;
        results.documentTopics.forEach(dist => {
            const maxTopic = dist.indexOf(Math.max(...dist));
            if (maxTopic === topicIdx) dominantCount++;
        });

        card.innerHTML = `
            <h3>Topic ${topicIdx + 1}</h3>
            <ul class="word-list">
                ${topWords.map(({ word, weight }) => `
                    <li class="word-item">
                        <span class="word">${word}</span>
                        <span class="weight">${(weight * 100).toFixed(1)}%</span>
                    </li>
                `).join('')}
            </ul>
            <div class="doc-count">
                <strong>${dominantCount}</strong> documents (${((dominantCount / results.documentTopics.length) * 100).toFixed(1)}%)
            </div>
        `;

        card.addEventListener('click', () => {
            this.showTopicDetails(topicIdx);
        });

        return card;
    }

    /**
     * Show detailed view of a topic
     */
    showTopicDetails(topicIdx) {
        document.getElementById('view-mode').value = 'intertopic';
        document.getElementById('selected-topic').value = topicIdx;

        // Switch to intertopic view and focus on this topic
        const event = new Event('change');
        document.getElementById('view-mode').dispatchEvent(event);

        // Highlight the topic
        this.focusTopic(topicIdx);
    }

    /**
     * Render word clouds for all topics
     */
    renderWordClouds(results) {
        this.currentResults = results;
        const container = document.getElementById('wordclouds-container');
        container.innerHTML = '';

        results.topics.forEach((topic, idx) => {
            const cloudDiv = document.createElement('div');
            cloudDiv.className = 'wordcloud-container';
            cloudDiv.innerHTML = `
                <h3>Topic ${idx + 1}</h3>
                <div class="wordcloud-canvas" id="wordcloud-${idx}"></div>
            `;
            container.appendChild(cloudDiv);

            // Generate word cloud
            setTimeout(() => {
                this.generateWordCloud(topic, idx);
            }, 100);
        });
    }

    /**
     * Generate a word cloud using D3
     */
    generateWordCloud(topic, topicIdx) {
        const containerId = `wordcloud-${topicIdx}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth || 400;
        const height = 300;

        // Prepare data
        const words = topic.slice(0, 30).map(({ word, weight }) => ({
            text: word,
            size: Math.max(12, weight * 1000) // Scale font size
        }));

        // Clear container
        container.innerHTML = '';

        // Create SVG
        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create word cloud layout
        const layout = d3.layout.cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => (Math.random() > 0.7 ? 90 : 0))
            .font('Impact')
            .fontSize(d => d.size)
            .on('end', draw);

        layout.start();

        function draw(words) {
            const color = d3.scaleOrdinal(d3.schemeCategory10);

            svg.append('g')
                .attr('transform', `translate(${width / 2},${height / 2})`)
                .selectAll('text')
                .data(words)
                .enter()
                .append('text')
                .style('font-size', d => `${d.size}px`)
                .style('font-family', 'Impact')
                .style('fill', (d, i) => color(i))
                .attr('text-anchor', 'middle')
                .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                .text(d => d.text)
                .style('cursor', 'pointer')
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.7);
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 1);
                });
        }
    }

    /**
     * Render document-topic distributions
     */
    renderDistributions(results, dataset) {
        this.currentResults = results;

        // Populate document selector
        const selector = document.getElementById('doc-select');
        selector.innerHTML = '';

        dataset.documents.forEach((doc, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = `Doc ${idx + 1}: ${doc.substring(0, 50)}...`;
            selector.appendChild(option);
        });

        // Show first document
        this.showDocumentDistribution(0, results, dataset);

        // Add event listener
        selector.onchange = (e) => {
            this.showDocumentDistribution(parseInt(e.target.value), results, dataset);
        };
    }

    /**
     * Show distribution for a specific document
     */
    showDocumentDistribution(docIdx, results, dataset) {
        const distribution = results.documentTopics[docIdx];

        // Get document title if available - safely handle undefined titles
        const hasTitle = dataset && dataset.titles && dataset.titles[docIdx];
        const docTitle = hasTitle ? dataset.titles[docIdx] : `Document ${docIdx + 1}`;

        // Create bar chart
        const data = [{
            x: distribution.map((_, i) => `Topic ${i + 1}`),
            y: distribution,
            type: 'bar',
            marker: {
                color: this.colors.slice(0, distribution.length)
            }
        }];

        const theme = this.getPlotlyTheme();
        const layout = {
            title: `Topic Distribution: ${docTitle}`,
            xaxis: { title: 'Topic', ...theme.xaxis },
            yaxis: { title: 'Probability', range: [0, 1], ...theme.yaxis },
            height: 400,
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: theme.font
        };

        Plotly.newPlot('doc-topic-plot', data, layout, { responsive: true });

        // Show document content with title if available
        const contentDiv = document.getElementById('doc-content');
        const titleHtml = hasTitle
            ? `<h4>${dataset.titles[docIdx]}</h4>`
            : `<h4>Document ${docIdx + 1}:</h4>`;

        // Truncate long documents for display
        const docText = dataset.documents[docIdx];
        const displayText = docText.length > 500
            ? docText.substring(0, 500) + '...'
            : docText;

        contentDiv.innerHTML = `
            ${titleHtml}
            <p>${displayText}</p>
        `;
    }

    /**
     * Render inter-topic distance map (pyLDAvis-style)
     */
    renderInterTopicDistance(results) {
        this.currentResults = results;

        // Calculate topic-topic similarity matrix
        const similarity = this.calculateTopicSimilarity(results);

        // Apply PCA for 2D projection
        const coords = this.pcaProjection(similarity);

        // Calculate topic sizes (based on total word counts)
        const sizes = results.topicCounts.map(count =>
            (count / Math.max(...results.topicCounts)) * 100
        );

        // Create scatter plot
        const trace = {
            x: coords.map(c => c[0]),
            y: coords.map(c => c[1]),
            mode: 'markers+text',
            type: 'scatter',
            text: coords.map((_, i) => `Topic ${i + 1}`),
            textposition: 'top center',
            marker: {
                size: sizes.map(s => Math.max(20, s)),
                color: this.colors.slice(0, coords.length),
                opacity: 0.7,
                line: {
                    color: 'white',
                    width: 2
                }
            },
            hovertemplate: '<b>%{text}</b><br>Size: %{marker.size:.1f}<extra></extra>'
        };

        const theme = this.getPlotlyTheme();
        const layout = {
            title: 'Inter-topic Distance Map',
            xaxis: { title: 'PC1', zeroline: false, showgrid: false, ...theme.xaxis },
            yaxis: { title: 'PC2', zeroline: false, showgrid: false, ...theme.yaxis },
            height: 600,
            hovermode: 'closest',
            showlegend: false,
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: theme.font
        };

        Plotly.newPlot('intertopic-plot', [trace], layout, { responsive: true });

        // Add click event to show topic details
        document.getElementById('intertopic-plot').on('plotly_click', (data) => {
            const pointIndex = data.points[0].pointIndex;
            this.showTopicWordBars(pointIndex, results);
        });

        // Show first topic details
        this.showTopicWordBars(0, results);
    }

    /**
     * Calculate topic similarity matrix using Jensen-Shannon divergence
     */
    calculateTopicSimilarity(results) {
        const numTopics = results.numTopics;
        const similarity = Array(numTopics).fill(0).map(() => Array(numTopics).fill(0));

        for (let i = 0; i < numTopics; i++) {
            for (let j = 0; j < numTopics; j++) {
                if (i === j) {
                    similarity[i][j] = 1;
                } else {
                    // Use cosine similarity of topic-word distributions
                    const topicI = results.topicWordCounts[i];
                    const topicJ = results.topicWordCounts[j];

                    let dotProduct = 0;
                    let normI = 0;
                    let normJ = 0;

                    for (let k = 0; k < topicI.length; k++) {
                        dotProduct += topicI[k] * topicJ[k];
                        normI += topicI[k] * topicI[k];
                        normJ += topicJ[k] * topicJ[k];
                    }

                    similarity[i][j] = dotProduct / (Math.sqrt(normI) * Math.sqrt(normJ));
                }
            }
        }

        return similarity;
    }

    /**
     * Simple PCA projection to 2D
     */
    pcaProjection(similarity) {
        const n = similarity.length;

        // Convert similarity to distance
        const dist = similarity.map(row => row.map(val => 1 - val));

        // Simple MDS-like projection
        const coords = [];
        const angleStep = (2 * Math.PI) / n;

        for (let i = 0; i < n; i++) {
            // Calculate average distance to other topics
            const avgDist = dist[i].reduce((sum, d) => sum + d, 0) / n;

            // Position on circle with radius based on distinctiveness
            const angle = i * angleStep;
            const radius = avgDist * 5;

            coords.push([
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            ]);
        }

        return coords;
    }

    /**
     * Show top words for a topic as horizontal bars
     */
    showTopicWordBars(topicIdx, results) {
        const topic = results.topics[topicIdx].slice(0, 15);

        const trace = {
            y: topic.map(w => w.word).reverse(),
            x: topic.map(w => w.weight).reverse(),
            type: 'bar',
            orientation: 'h',
            marker: {
                color: this.colors[topicIdx % this.colors.length]
            }
        };

        const theme = this.getPlotlyTheme();
        const layout = {
            title: `Top Words for Topic ${topicIdx + 1}`,
            xaxis: { title: 'Probability', ...theme.xaxis },
            yaxis: { title: '', ...theme.yaxis },
            height: 400,
            margin: { l: 150 },
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: theme.font
        };

        Plotly.newPlot('topic-words-bars', [trace], layout, { responsive: true });
    }

    /**
     * Focus on a specific topic
     */
    focusTopic(topicIdx) {
        if (!this.currentResults) return;

        const viewMode = document.getElementById('view-mode').value;

        if (viewMode === 'intertopic') {
            this.showTopicWordBars(topicIdx, this.currentResults);

            // Highlight the point in the scatter plot
            const plotDiv = document.getElementById('intertopic-plot');
            if (plotDiv.data) {
                const update = {
                    'marker.size': [plotDiv.data[0].marker.size.map((s, i) =>
                        i === topicIdx ? s * 1.5 : s
                    )],
                    'marker.line.width': [plotDiv.data[0].marker.size.map((_, i) =>
                        i === topicIdx ? 4 : 2
                    )]
                };
                Plotly.restyle(plotDiv, update, [0]);
            }
        }
    }
}
