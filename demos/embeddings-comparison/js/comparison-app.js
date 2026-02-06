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
    }

    setupPresets() {
        // Similarity example dropdown
        const simExamples = {
            'high-1': { sent1: 'The cat is sleeping on the couch.', sent2: 'A cat is napping on the sofa.' },
            'high-2': { sent1: 'It is raining heavily outside.', sent2: 'Heavy rain is falling outdoors.' },
            'high-3': { sent1: 'I love programming in Python.', sent2: 'I enjoy coding in Python.' },
            'med-1': { sent1: 'I love programming in Python.', sent2: 'I enjoy coding in JavaScript.' },
            'med-2': { sent1: 'The car drove down the highway.', sent2: 'The train traveled along the tracks.' },
            'med-3': { sent1: 'She cooked a delicious dinner.', sent2: 'He baked a wonderful cake.' },
            'low-1': { sent1: 'The weather is sunny today.', sent2: 'Machine learning is fascinating.' },
            'low-2': { sent1: 'The football game was exciting.', sent2: 'Quantum physics explains particle behavior.' },
            'low-3': { sent1: 'The guitar solo was amazing.', sent2: 'The equation had three variables.' }
        };

        document.getElementById('sim-example-select').addEventListener('change', (e) => {
            const example = simExamples[e.target.value];
            if (example) {
                document.getElementById('sim-sent1').value = example.sent1;
                document.getElementById('sim-sent2').value = example.sent2;
            }
        });

        // Analogy example dropdown
        const analogyExamples = {
            'royalty': { a: 'king', b: 'queen', c: 'man' },
            'actor': { a: 'actor', b: 'actress', c: 'waiter' },
            'hero': { a: 'hero', b: 'heroine', c: 'prince' },
            'capitals': { a: 'Paris', b: 'France', c: 'London' },
            'capitals2': { a: 'Tokyo', b: 'Japan', c: 'Berlin' },
            'capitals3': { a: 'Rome', b: 'Italy', c: 'Madrid' },
            'grammar': { a: 'good', b: 'better', c: 'bad' },
            'grammar2': { a: 'big', b: 'bigger', c: 'small' },
            'tense': { a: 'walk', b: 'walked', c: 'run' },
            'animal': { a: 'dog', b: 'puppy', c: 'cat' },
            'material': { a: 'wood', b: 'tree', c: 'paper' },
            'tool': { a: 'hammer', b: 'nail', c: 'screwdriver' }
        };

        document.getElementById('analogy-example-select').addEventListener('change', (e) => {
            const example = analogyExamples[e.target.value];
            if (example) {
                document.getElementById('analogy-a').value = example.a;
                document.getElementById('analogy-b').value = example.b;
                document.getElementById('analogy-c').value = example.c;
            }
        });

        // Categorization word groups
        const categoryWords = {
            'fruits': ['apple', 'banana', 'orange', 'grape', 'mango', 'strawberry'],
            'vegetables': ['carrot', 'broccoli', 'spinach', 'kale', 'tomato', 'cucumber'],
            'animals': ['dog', 'cat', 'elephant', 'tiger', 'dolphin', 'eagle'],
            'vehicles': ['car', 'bicycle', 'airplane', 'train', 'motorcycle', 'boat'],
            'sports': ['football', 'basketball', 'tennis', 'swimming', 'golf', 'soccer'],
            'colors': ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
            'countries': ['France', 'Japan', 'Brazil', 'Canada', 'Australia', 'Germany'],
            'professions': ['doctor', 'teacher', 'engineer', 'lawyer', 'chef', 'artist']
        };

        document.querySelectorAll('.cat-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                const words = categoryWords[category];
                if (words) {
                    const textarea = document.getElementById('cat-items');
                    const currentItems = textarea.value.trim();
                    const newItems = words.join('\n');
                    textarea.value = currentItems ? currentItems + '\n' + newItems : newItems;
                }
            });
        });

        document.getElementById('clear-cat-items').addEventListener('click', () => {
            document.getElementById('cat-items').value = '';
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

            this.visualization.clearCharts();
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
            this.visualization.updateLeaderboard(results, 'silhouetteScore');
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
