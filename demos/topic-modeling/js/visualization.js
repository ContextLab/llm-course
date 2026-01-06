/**
 * Topic Modeling Visualization
 * Provides multiple visualization modes for LDA results
 */

export class TopicVisualizer {
    constructor() {
        this.currentResults = null;
        this.currentDataset = null;
        this.colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
            '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#ff6b6b',
            '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'
        ];
        this.setupThemeListener();
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
        if (!this.currentResults) return;
        const viewMode = document.getElementById('view-mode')?.value;
        if (viewMode === 'distributions' && this.currentDataset) {
            const docIdx = parseInt(document.getElementById('doc-select')?.value || 0);
            this.showDocumentDistribution(docIdx, this.currentResults, this.currentDataset);
        } else if (viewMode === 'intertopic') {
            this.renderInterTopicDistance(this.currentResults);
        }
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

    createTopicCard(topic, topicIdx, results) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.style.borderLeftColor = this.colors[topicIdx % this.colors.length];
        card.style.borderLeftWidth = '4px';

        const topWordsCount = parseInt(document.getElementById('top-words')?.value || 10);
        const topWords = topic.slice(0, topWordsCount);

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

    showTopicDetails(topicIdx) {
        if (!this.currentResults || !this.currentDataset) {
            document.getElementById('view-mode').value = 'intertopic';
            document.getElementById('selected-topic').value = topicIdx;
            const event = new Event('change');
            document.getElementById('view-mode').dispatchEvent(event);
            this.focusTopic(topicIdx);
            return;
        }
        this.showTopicDocuments(topicIdx);
    }

    showTopicDocuments(topicIdx) {
        const results = this.currentResults;
        const dataset = this.currentDataset;
        
        const docsWithScores = results.documentTopics
            .map((dist, idx) => ({
                idx,
                score: dist[topicIdx],
                isDominant: dist.indexOf(Math.max(...dist)) === topicIdx
            }))
            .filter(d => d.score > 0.1)
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);

        let modal = document.getElementById('topic-docs-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'topic-docs-modal';
            modal.className = 'topic-docs-modal hidden';
            modal.innerHTML = `
                <div class="topic-docs-content">
                    <div class="topic-docs-header">
                        <h3 id="topic-docs-title">Topic Documents</h3>
                        <button class="close-btn" id="close-topic-docs">&times;</button>
                    </div>
                    <div class="topic-docs-body">
                        <div class="topic-docs-list" id="topic-docs-list"></div>
                        <div class="topic-doc-detail" id="topic-doc-detail">
                            <p class="placeholder-text">Select a document to see details</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('close-topic-docs').addEventListener('click', () => {
                modal.classList.add('hidden');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        }

        document.getElementById('topic-docs-title').textContent = 
            `Topic ${topicIdx + 1} Documents (${docsWithScores.length} found)`;
        
        const listContainer = document.getElementById('topic-docs-list');
        listContainer.innerHTML = '';
        
        docsWithScores.forEach((doc, i) => {
            const title = dataset.titles?.[doc.idx] || `Document ${doc.idx + 1}`;
            const preview = dataset.documents[doc.idx].substring(0, 80) + '...';
            
            const item = document.createElement('div');
            item.className = 'topic-doc-item';
            item.innerHTML = `
                <div class="topic-doc-item-title">${title}</div>
                <div class="topic-doc-item-preview">${preview}</div>
                <div class="topic-doc-item-score">
                    <span class="score-badge ${doc.isDominant ? 'dominant' : ''}">${(doc.score * 100).toFixed(1)}%</span>
                </div>
            `;
            item.addEventListener('click', () => {
                listContainer.querySelectorAll('.topic-doc-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                this.showDocumentDetailInModal(doc.idx, topicIdx, results, dataset);
            });
            listContainer.appendChild(item);
        });
        
        document.getElementById('topic-doc-detail').innerHTML = 
            '<p class="placeholder-text">Select a document to see details</p>';
        
        modal.classList.remove('hidden');
    }

    showDocumentDetailInModal(docIdx, focusTopicIdx, results, dataset) {
        const detailContainer = document.getElementById('topic-doc-detail');
        const distribution = results.documentTopics[docIdx];
        const title = dataset.titles?.[docIdx] || `Document ${docIdx + 1}`;
        const text = dataset.documents[docIdx];
        
        const barData = distribution.map((score, i) => ({
            topic: i,
            score,
            label: `Topic ${i + 1}`,
            color: this.colors[i % this.colors.length],
            isFocus: i === focusTopicIdx
        })).sort((a, b) => b.score - a.score);
        
        const barsHtml = barData.map(d => `
            <div class="dist-bar-row ${d.isFocus ? 'focus' : ''}">
                <span class="dist-bar-label">${d.label}</span>
                <div class="dist-bar-track">
                    <div class="dist-bar-fill" style="width: ${d.score * 100}%; background: ${d.color}"></div>
                </div>
                <span class="dist-bar-value">${(d.score * 100).toFixed(1)}%</span>
            </div>
        `).join('');

        const taggedText = this.tagTextByTopic(text, results, focusTopicIdx);
        
        detailContainer.innerHTML = `
            <h4>${title}</h4>
            <div class="doc-distribution-bars">${barsHtml}</div>
            <div class="doc-tagged-text">${taggedText}</div>
        `;
    }

    tagTextByTopic(text, results, focusTopicIdx) {
        const topWords = new Map();
        results.topics.forEach((topic, topicIdx) => {
            topic.slice(0, 15).forEach(({ word }) => {
                const lower = word.toLowerCase();
                if (!topWords.has(lower) || topicIdx === focusTopicIdx) {
                    topWords.set(lower, topicIdx);
                }
            });
        });
        
        const words = text.split(/(\s+)/);
        return words.map(word => {
            const cleaned = word.toLowerCase().replace(/[^\w]/g, '');
            if (cleaned.length < 3) return word;
            
            const topicIdx = topWords.get(cleaned);
            if (topicIdx !== undefined) {
                const color = this.colors[topicIdx % this.colors.length];
                const isFocus = topicIdx === focusTopicIdx;
                return `<span class="tagged-word ${isFocus ? 'focus' : ''}" 
                    style="background: ${color}20; border-bottom: 2px solid ${color};"
                    title="Topic ${topicIdx + 1}">${word}</span>`;
            }
            return word;
        }).join('');
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

        // Prepare data with normalized font sizes for better visual contrast
        const topWords = topic.slice(0, 30);
        const maxWeight = Math.max(...topWords.map(t => t.weight));
        const minWeight = Math.min(...topWords.map(t => t.weight));
        const weightRange = maxWeight - minWeight || 1;
        
        const words = topWords.map(({ word, weight }) => ({
            text: word,
            // Scale to 14-56px range based on normalized weight for clear visual hierarchy
            size: 14 + ((weight - minWeight) / weightRange) * 42
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

    renderDistributions(results, dataset) {
        this.currentResults = results;
        this.currentDataset = dataset;

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

    showTopicWordBars(topicIdx, results) {
        const topicDetails = document.getElementById('topic-details');
        if (topicDetails) {
            topicDetails.style.display = 'block';
        }
        
        const topWordsCount = parseInt(document.getElementById('top-words')?.value || 10);
        const topic = results.topics[topicIdx].slice(0, topWordsCount);

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
