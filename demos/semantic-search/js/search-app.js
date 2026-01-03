/**
 * Main Search Application
 * Integrates all search components and manages UI
 */

import { BM25 } from './bm25.js';
import { SemanticSearch } from './semantic-search.js';
import { HybridSearch } from './hybrid-search.js';
import { CorpusLoader } from './corpus-loader.js';

class SearchApp {
    constructor() {
        this.corpusLoader = new CorpusLoader();
        this.bm25 = new BM25();
        this.semanticSearch = new SemanticSearch();
        this.hybridSearch = null;

        this.currentResults = {
            semantic: null,
            keyword: null,
            hybrid: null
        };

        this.isReady = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        this.setupEventListeners();
        await this.loadDefaultCorpus();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Search button
        document.getElementById('search-btn').addEventListener('click', () => this.performSearch());

        // Enter key in search box
        document.getElementById('search-query').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Load corpus button
        document.getElementById('load-corpus-btn').addEventListener('click', () => this.loadCorpus());

        // Range sliders
        this.setupRangeSlider('top-k', 'top-k-value');
        this.setupRangeSlider('hybrid-weight', 'hybrid-weight-value', (v) => parseFloat(v).toFixed(2));

        // Example queries
        document.querySelectorAll('.example-query').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.dataset.query;
                document.getElementById('search-query').value = query;
                this.performSearch();
            });
        });

        // Method checkboxes
        ['enable-semantic', 'enable-keyword', 'enable-hybrid'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateResultsVisibility());
        });
    }

    /**
     * Setup range slider with value display
     */
    setupRangeSlider(sliderId, valueId, formatter = (v) => v) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = formatter(e.target.value);
        });
    }

    /**
     * Load default corpus on startup
     */
    async loadDefaultCorpus() {
        this.showLoading(true);
        try {
            const corpusId = document.getElementById('corpus-select').value;
            await this.loadCorpus(corpusId);
        } catch (error) {
            console.error('Error loading default corpus:', error);
            alert('Error loading default corpus. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Load a corpus and build indices
     */
    async loadCorpus(corpusId = null) {
        this.showLoading(true);
        const statusEl = document.getElementById('corpus-status');

        try {
            if (!corpusId) {
                corpusId = document.getElementById('corpus-select').value;
            }

            statusEl.textContent = 'Loading corpus...';

            // Load documents
            const documents = await this.corpusLoader.loadCorpus(corpusId);

            // Build BM25 index
            statusEl.textContent = 'Building keyword search index...';
            this.bm25.buildIndex(documents);

            // Load embedding model and build semantic index
            statusEl.textContent = 'Loading embedding model...';
            if (!this.semanticSearch.isReady) {
                await this.semanticSearch.loadModel();
            }

            statusEl.textContent = 'Building semantic search index...';
            await this.semanticSearch.buildIndex(documents, (progress) => {
                statusEl.textContent = `Building semantic index... ${progress.progress.toFixed(0)}%`;
            });

            // Create hybrid search
            this.hybridSearch = new HybridSearch(this.semanticSearch, this.bm25);

            this.isReady = true;
            statusEl.textContent = 'Ready!';
            setTimeout(() => statusEl.textContent = '', 2000);

            // Update statistics
            this.updateStatistics();

        } catch (error) {
            console.error('Error loading corpus:', error);
            statusEl.textContent = 'Error loading corpus';
            alert('Error loading corpus: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Perform search across all enabled methods
     */
    async performSearch() {
        if (!this.isReady) {
            alert('Please wait for the corpus to finish loading');
            return;
        }

        const query = document.getElementById('search-query').value.trim();
        if (!query) {
            alert('Please enter a search query');
            return;
        }

        this.showLoading(true);

        try {
            const topK = parseInt(document.getElementById('top-k').value);
            const hybridWeight = parseFloat(document.getElementById('hybrid-weight').value);

            const enableSemantic = document.getElementById('enable-semantic').checked;
            const enableKeyword = document.getElementById('enable-keyword').checked;
            const enableHybrid = document.getElementById('enable-hybrid').checked;

            // Perform searches
            const searches = [];

            if (enableSemantic) {
                searches.push(
                    this.semanticSearch.search(query, topK)
                        .then(results => { this.currentResults.semantic = results; })
                );
            }

            if (enableKeyword) {
                searches.push(
                    Promise.resolve(this.bm25.search(query, topK))
                        .then(results => { this.currentResults.keyword = results; })
                );
            }

            if (enableHybrid) {
                searches.push(
                    this.hybridSearch.search(query, hybridWeight, topK)
                        .then(results => { this.currentResults.hybrid = results; })
                );
            }

            await Promise.all(searches);

            // Display results
            this.displayResults(query);

            // Update visualizations
            this.updateVisualizations(query);

        } catch (error) {
            console.error('Error performing search:', error);
            alert('Error performing search: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Display search results
     */
    displayResults(query) {
        // Semantic results
        if (this.currentResults.semantic) {
            this.displayMethodResults(
                'semantic',
                this.currentResults.semantic,
                query
            );
        }

        // Keyword results
        if (this.currentResults.keyword) {
            this.displayMethodResults(
                'keyword',
                this.currentResults.keyword,
                query
            );
        }

        // Hybrid results
        if (this.currentResults.hybrid) {
            this.displayMethodResults(
                'hybrid',
                this.currentResults.hybrid,
                query
            );
        }

        this.updateResultsVisibility();
    }

    /**
     * Display results for a specific method
     */
    displayMethodResults(method, results, query) {
        const listEl = document.getElementById(`${method}-list`);
        const timeEl = document.getElementById(`${method}-time`);
        const avgEl = document.getElementById(`${method}-avg`);

        // Update metrics
        timeEl.textContent = `${results.time.toFixed(1)}ms`;
        avgEl.textContent = results.avgScore.toFixed(3);

        // Clear previous results
        listEl.innerHTML = '';

        if (results.results.length === 0) {
            listEl.innerHTML = '<p class="placeholder">No results found</p>';
            return;
        }

        // Display results
        results.results.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const snippet = result.document.substring(0, 200) + (result.document.length > 200 ? '...' : '');
            const highlightedSnippet = method === 'keyword'
                ? this.bm25.highlightTerms(snippet, query)
                : snippet;

            item.innerHTML = `
                <span class="result-rank">${index + 1}</span>
                <span class="result-score">${result.normalizedScore.toFixed(3)}</span>
                <div class="result-snippet">${highlightedSnippet}</div>
            `;

            listEl.appendChild(item);
        });
    }

    /**
     * Update visibility of result columns based on checkboxes
     */
    updateResultsVisibility() {
        const semantic = document.getElementById('enable-semantic').checked;
        const keyword = document.getElementById('enable-keyword').checked;
        const hybrid = document.getElementById('enable-hybrid').checked;

        document.getElementById('semantic-results').style.display = semantic ? 'flex' : 'none';
        document.getElementById('keyword-results').style.display = keyword ? 'flex' : 'none';
        document.getElementById('hybrid-results').style.display = hybrid ? 'flex' : 'none';

        // Adjust grid layout
        const container = document.querySelector('.comparison-container');
        const numVisible = [semantic, keyword, hybrid].filter(x => x).length;
        container.style.gridTemplateColumns = numVisible > 0
            ? `repeat(${numVisible}, 1fr)`
            : '1fr';
    }

    /**
     * Update visualizations
     */
    async updateVisualizations(query) {
        // Score comparison plot
        this.plotScoreComparison();

        // Overlap analysis
        if (this.currentResults.semantic && this.currentResults.keyword) {
            const overlap = await this.hybridSearch.analyzeOverlap(query,
                parseInt(document.getElementById('top-k').value));
            this.displayOverlapAnalysis(overlap);
        }

        // Performance chart
        this.plotPerformanceChart();
    }

    /**
     * Plot score comparison
     */
    plotScoreComparison() {
        const traces = [];
        const maxResults = Math.max(
            this.currentResults.semantic?.results.length || 0,
            this.currentResults.keyword?.results.length || 0,
            this.currentResults.hybrid?.results.length || 0
        );

        if (this.currentResults.semantic) {
            traces.push({
                x: Array.from({length: this.currentResults.semantic.results.length}, (_, i) => i + 1),
                y: this.currentResults.semantic.results.map(r => r.normalizedScore),
                name: 'Semantic',
                type: 'bar',
                marker: { color: '#4a90e2' }
            });
        }

        if (this.currentResults.keyword) {
            traces.push({
                x: Array.from({length: this.currentResults.keyword.results.length}, (_, i) => i + 1),
                y: this.currentResults.keyword.results.map(r => r.normalizedScore),
                name: 'Keyword',
                type: 'bar',
                marker: { color: '#7b68ee' }
            });
        }

        if (this.currentResults.hybrid) {
            traces.push({
                x: Array.from({length: this.currentResults.hybrid.results.length}, (_, i) => i + 1),
                y: this.currentResults.hybrid.results.map(r => r.normalizedScore),
                name: 'Hybrid',
                type: 'bar',
                marker: { color: '#50c878' }
            });
        }

        const layout = {
            title: 'Relevance Scores by Rank',
            xaxis: { title: 'Rank' },
            yaxis: { title: 'Normalized Score' },
            barmode: 'group',
            height: 400
        };

        Plotly.newPlot('score-plot', traces, layout, { responsive: true });
    }

    /**
     * Display overlap analysis
     */
    displayOverlapAnalysis(overlap) {
        const text = `
            <strong>Results Overlap Analysis:</strong><br>
            • Semantic only: ${overlap.semanticOnly} documents<br>
            • Keyword only: ${overlap.keywordOnly} documents<br>
            • Both methods: ${overlap.intersection} documents (${overlap.overlapPercentage.toFixed(1)}%)<br>
            <br>
            This shows how different the ranking strategies are.
            ${overlap.overlapPercentage < 30 ? 'Low overlap suggests the methods capture different aspects of relevance.' : ''}
            ${overlap.overlapPercentage > 70 ? 'High overlap suggests the methods agree on relevant documents.' : ''}
        `;
        document.getElementById('overlap-text').innerHTML = text;

        // Create Venn diagram
        const vennData = [{
            type: 'scatter',
            x: [0],
            y: [0],
            mode: 'text',
            text: [`${overlap.intersection}`],
            textfont: { size: 20 },
            showlegend: false
        }];

        const vennLayout = {
            shapes: [
                {
                    type: 'circle',
                    xref: 'x',
                    yref: 'y',
                    x0: -1.5, y0: -1, x1: 1.5, y1: 2,
                    line: { color: '#4a90e2', width: 3 },
                    fillcolor: 'rgba(74, 144, 226, 0.2)'
                },
                {
                    type: 'circle',
                    xref: 'x',
                    yref: 'y',
                    x0: -0.5, y0: -1, x1: 2.5, y1: 2,
                    line: { color: '#7b68ee', width: 3 },
                    fillcolor: 'rgba(123, 104, 238, 0.2)'
                }
            ],
            annotations: [
                { x: -0.8, y: 1.5, text: `Semantic<br>${overlap.semanticOnly}`, showarrow: false },
                { x: 0.8, y: 1.5, text: `Keyword<br>${overlap.keywordOnly}`, showarrow: false }
            ],
            xaxis: { visible: false, range: [-2, 3] },
            yaxis: { visible: false, range: [-1.5, 2.5] },
            height: 300,
            margin: { l: 20, r: 20, t: 20, b: 20 }
        };

        Plotly.newPlot('overlap-venn', vennData, vennLayout, { responsive: true });
    }

    /**
     * Plot performance comparison chart
     */
    plotPerformanceChart() {
        const methods = [];
        const times = [];
        const scores = [];

        if (this.currentResults.semantic) {
            methods.push('Semantic');
            times.push(this.currentResults.semantic.time);
            scores.push(this.currentResults.semantic.avgScore);
        }

        if (this.currentResults.keyword) {
            methods.push('Keyword');
            times.push(this.currentResults.keyword.time);
            scores.push(this.currentResults.keyword.avgScore);
        }

        if (this.currentResults.hybrid) {
            methods.push('Hybrid');
            times.push(this.currentResults.hybrid.time);
            scores.push(this.currentResults.hybrid.avgScore);
        }

        const trace = {
            type: 'scatterpolar',
            r: [
                ...times.map(t => t / Math.max(...times)),
                ...scores
            ],
            theta: [
                ...methods.map(m => `${m} Speed`),
                ...methods.map(m => `${m} Quality`)
            ],
            fill: 'toself',
            name: 'Performance'
        };

        const layout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 1]
                }
            },
            height: 300,
            margin: { l: 40, r: 40, t: 40, b: 40 }
        };

        Plotly.newPlot('performance-chart', [trace], layout, { responsive: true });
    }

    /**
     * Update corpus statistics
     */
    updateStatistics() {
        const stats = this.corpusLoader.getStatistics();
        if (!stats) return;

        document.getElementById('stat-docs').textContent = stats.numDocuments;
        document.getElementById('stat-length').textContent = `${stats.avgLength} words`;
        document.getElementById('stat-vocab').textContent = stats.vocabularySize;
        document.getElementById('stat-model').textContent = 'MiniLM-L6-v2';
    }

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new SearchApp();
    await app.init();

    // Expose for debugging
    window.searchApp = app;
});
