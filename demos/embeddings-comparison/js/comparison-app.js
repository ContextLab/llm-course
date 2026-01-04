/**
 * Main Comparison App
 * Orchestrates the embeddings comparison demo
 */

import { EmbeddingModelsManager } from './embedding-models.js';
import { BenchmarkTasks } from './benchmark-tasks.js';
import { Visualization } from './visualization.js';

class ComparisonApp {
    constructor() {
        this.modelsManager = new EmbeddingModelsManager();
        this.benchmarkTasks = new BenchmarkTasks(this.modelsManager);
        this.visualization = new Visualization();
        this.testsRun = 0;
    }

    async init() {
        this.setupEventListeners();
        this.setupPresets();
    }

    setupEventListeners() {
        // Load models button
        document.getElementById('load-models-btn').addEventListener('click', () => this.loadSelectedModels());

        // Task tabs
        document.querySelectorAll('.task-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTask(e.target.dataset.task));
        });

        // Task run buttons
        document.getElementById('run-similarity-btn').addEventListener('click', () => this.runSimilarityTask());
        document.getElementById('run-analogy-btn').addEventListener('click', () => this.runAnalogyTask());
        document.getElementById('run-categorization-btn').addEventListener('click', () => this.runCategorizationTask());
        document.getElementById('run-custom-btn').addEventListener('click', () => this.runCustomTask());
    }

    setupPresets() {
        // Similarity presets
        const simPresets = {
            'high-sim': {
                sent1: 'The cat is sleeping on the couch.',
                sent2: 'A cat is napping on the sofa.'
            },
            'medium-sim': {
                sent1: 'I love programming in Python.',
                sent2: 'I enjoy coding in JavaScript.'
            },
            'low-sim': {
                sent1: 'The weather is sunny today.',
                sent2: 'Machine learning is fascinating.'
            }
        };

        document.querySelectorAll('#similarity-task .preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = simPresets[btn.dataset.preset];
                document.getElementById('sim-sent1').value = preset.sent1;
                document.getElementById('sim-sent2').value = preset.sent2;
            });
        });

        // Analogy presets
        const analogyPresets = {
            'royalty': { a: 'king', b: 'queen', c: 'man' },
            'capitals': { a: 'Paris', b: 'France', c: 'London' },
            'grammar': { a: 'good', b: 'better', c: 'bad' }
        };

        document.querySelectorAll('#analogy-task .preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = analogyPresets[btn.dataset.preset];
                document.getElementById('analogy-a').value = preset.a;
                document.getElementById('analogy-b').value = preset.b;
                document.getElementById('analogy-c').value = preset.c;
            });
        });
    }

    async loadSelectedModels() {
        const selectedModels = [];

        document.querySelectorAll('.model-card input[type="checkbox"]:checked').forEach(checkbox => {
            const card = checkbox.closest('.model-card');
            selectedModels.push(card.dataset.model);
        });

        if (selectedModels.length === 0) {
            alert('Please select at least one model');
            return;
        }

        this.showLoading(true);
        const statusEl = document.getElementById('load-status');

        try {
            await this.modelsManager.loadModels(selectedModels, (progress) => {
                const percent = ((progress.current / progress.total) * 100).toFixed(0);
                statusEl.textContent = `Loading ${progress.modelName}... (${percent}%)`;
                document.getElementById('loading-text').textContent = `Loading ${progress.modelName}...`;
                document.getElementById('loading-bar').style.width = percent + '%';
            });

            statusEl.textContent = `Loaded ${selectedModels.length} model(s)`;
            setTimeout(() => statusEl.textContent = '', 3000);

            this.updateStats();

        } catch (error) {
            console.error('Error loading models:', error);
            statusEl.textContent = 'Error loading models';
            alert('Error loading models: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    switchTask(taskName) {
        // Update tabs
        document.querySelectorAll('.task-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.task === taskName);
        });

        // Update panels
        document.querySelectorAll('.task-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${taskName}-task`);
        });
    }

    async runSimilarityTask() {
        if (!this.checkModelsLoaded()) return;

        const sent1 = document.getElementById('sim-sent1').value.trim();
        const sent2 = document.getElementById('sim-sent2').value.trim();

        if (!sent1 || !sent2) {
            alert('Please enter both sentences');
            return;
        }

        this.showLoading(true);
        try {
            const modelIds = this.modelsManager.getLoadedModels();
            const results = await this.benchmarkTasks.runSimilarityTest(sent1, sent2, modelIds);

            this.visualization.displaySimilarityResults(results);
            this.visualization.updateLeaderboard(results, 'similarity');
            this.visualization.plotRadarChart(results);
            this.visualization.plotTradeoffChart(results);

            this.testsRun++;
            this.updateStats();

        } catch (error) {
            console.error('Error running similarity test:', error);
            alert('Error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async runAnalogyTask() {
        if (!this.checkModelsLoaded()) return;

        const wordA = document.getElementById('analogy-a').value.trim();
        const wordB = document.getElementById('analogy-b').value.trim();
        const wordC = document.getElementById('analogy-c').value.trim();

        if (!wordA || !wordB || !wordC) {
            alert('Please enter all three words');
            return;
        }

        this.showLoading(true);
        try {
            const modelIds = this.modelsManager.getLoadedModels();
            const results = await this.benchmarkTasks.runAnalogyTest(wordA, wordB, wordC, modelIds);

            this.visualization.displayAnalogyResults(results);
            this.visualization.updateLeaderboard(results, 'confidence');
            this.visualization.plotRadarChart(results);
            this.visualization.plotTradeoffChart(results);

            this.testsRun++;
            this.updateStats();

        } catch (error) {
            console.error('Error running analogy test:', error);
            alert('Error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async runCategorizationTask() {
        if (!this.checkModelsLoaded()) return;

        const itemsText = document.getElementById('cat-items').value.trim();
        const numCategories = parseInt(document.getElementById('cat-num').value);

        if (!itemsText) {
            alert('Please enter items to categorize');
            return;
        }

        const items = itemsText.split('\n').map(s => s.trim()).filter(s => s);

        if (items.length < numCategories * 2) {
            alert('Please enter at least ' + (numCategories * 2) + ' items');
            return;
        }

        this.showLoading(true);
        try {
            const modelIds = this.modelsManager.getLoadedModels();
            const results = await this.benchmarkTasks.runCategorizationTest(items, numCategories, modelIds);

            this.visualization.displayCategorizationResults(results);
            this.visualization.updateLeaderboard(results, 'time');
            this.visualization.plotRadarChart(results);
            this.visualization.plotTradeoffChart(results);

            this.testsRun++;
            this.updateStats();

        } catch (error) {
            console.error('Error running categorization test:', error);
            alert('Error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async runCustomTask() {
        if (!this.checkModelsLoaded()) return;

        const sentencesText = document.getElementById('custom-sentences').value.trim();

        if (!sentencesText) {
            alert('Please enter sentences to compare');
            return;
        }

        const sentences = sentencesText.split('\n').map(s => s.trim()).filter(s => s);

        if (sentences.length < 2) {
            alert('Please enter at least 2 sentences');
            return;
        }

        this.showLoading(true);
        try {
            const modelIds = this.modelsManager.getLoadedModels();
            const results = await this.benchmarkTasks.runCustomTest(sentences, modelIds);

            this.visualization.displayCustomResults(results);
            this.visualization.updateLeaderboard(results, 'avgSimilarity');
            this.visualization.plotRadarChart(results);
            this.visualization.plotTradeoffChart(results);

            this.testsRun++;
            this.updateStats();

        } catch (error) {
            console.error('Error running custom test:', error);
            alert('Error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    checkModelsLoaded() {
        if (this.modelsManager.getLoadedModels().length === 0) {
            alert('Please load models first');
            return false;
        }
        return true;
    }

    updateStats() {
        const modelIds = this.modelsManager.getLoadedModels();

        document.getElementById('stat-models').textContent = modelIds.length;
        document.getElementById('stat-tests').textContent = this.testsRun;

        if (modelIds.length > 0) {
            const avgSpeed = modelIds.reduce((sum, id) => {
                const perf = this.modelsManager.getModelPerformance(id);
                return sum + (perf?.avgTime || 0);
            }, 0) / modelIds.length;

            document.getElementById('stat-speed').textContent = avgSpeed > 0
                ? avgSpeed.toFixed(1) + 'ms'
                : '-';

            // Find top model by speed
            let fastestModel = null;
            let fastestTime = Infinity;

            modelIds.forEach(id => {
                const perf = this.modelsManager.getModelPerformance(id);
                if (perf && perf.avgTime < fastestTime && perf.numCalls > 0) {
                    fastestTime = perf.avgTime;
                    fastestModel = this.modelsManager.getModelConfig(id).name;
                }
            });

            document.getElementById('stat-top').textContent = fastestModel || '-';
        }
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new ComparisonApp();
    await app.init();

    // Expose for debugging
    window.comparisonApp = app;
});
