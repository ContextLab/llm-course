/**
 * GPT Text Generation Playground
 * Main controller for the interactive text generation demo
 */

import { SamplingStrategies } from './sampling-strategies.js';
import { ProbabilityVisualizer } from './probability-visualizer.js';

class TextGenerationPlayground {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.isGenerating = false;
        this.shouldStop = false;
        this.generatedTokens = [];
        this.generationStats = {
            tokenCount: 0,
            probabilities: [],
            entropies: [],
            surprises: [],
            startTime: null
        };

        this.visualizer = new ProbabilityVisualizer();

        this.initializeElements();
        this.attachEventListeners();
        this.loadModel();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.elements = {
            // Controls
            modelSelect: document.getElementById('modelSelect'),
            samplePrompts: document.getElementById('samplePrompts'),
            promptInput: document.getElementById('promptInput'),
            generateBtn: document.getElementById('generateBtn'),
            stopBtn: document.getElementById('stopBtn'),
            clearBtn: document.getElementById('clearBtn'),

            // Sampling strategy
            samplingStrategy: document.getElementById('samplingStrategy'),

            // Parameters
            temperature: document.getElementById('temperature'),
            tempValue: document.getElementById('tempValue'),
            topK: document.getElementById('topK'),
            topKValue: document.getElementById('topKValue'),
            topP: document.getElementById('topP'),
            topPValue: document.getElementById('topPValue'),
            maxLength: document.getElementById('maxLength'),
            maxLengthValue: document.getElementById('maxLengthValue'),
            repetitionPenalty: document.getElementById('repetitionPenalty'),
            repPenaltyValue: document.getElementById('repPenaltyValue'),

            // Visualization options
            showProbabilities: document.getElementById('showProbabilities'),
            showAlternatives: document.getElementById('showAlternatives'),
            showEntropy: document.getElementById('showEntropy'),
            showSurprise: document.getElementById('showSurprise'),

            // Comparison mode
            comparisonMode: document.getElementById('comparisonMode'),

            // Output
            generatedText: document.getElementById('generatedText'),
            singleOutput: document.getElementById('singleOutput'),
            comparisonOutput: document.getElementById('comparisonOutput'),

            // Loading
            loadingIndicator: document.getElementById('loadingIndicator'),
            loadingText: document.getElementById('loadingText')
        };
    }

    /**
     * Attach event listeners to controls
     */
    attachEventListeners() {
        // Model selection
        this.elements.modelSelect.addEventListener('change', () => this.loadModel());

        // Sample prompts
        this.elements.samplePrompts.addEventListener('change', (e) => this.loadSamplePrompt(e.target.value));

        // Buttons
        this.elements.generateBtn.addEventListener('click', () => this.generate());
        this.elements.stopBtn.addEventListener('click', () => this.stopGeneration());
        this.elements.clearBtn.addEventListener('click', () => this.clear());

        // Parameter sliders
        this.elements.temperature.addEventListener('input', (e) => {
            this.elements.tempValue.textContent = parseFloat(e.target.value).toFixed(2);
        });

        this.elements.topK.addEventListener('input', (e) => {
            this.elements.topKValue.textContent = e.target.value;
        });

        this.elements.topP.addEventListener('input', (e) => {
            this.elements.topPValue.textContent = parseFloat(e.target.value).toFixed(2);
        });

        this.elements.maxLength.addEventListener('input', (e) => {
            this.elements.maxLengthValue.textContent = e.target.value;
        });

        this.elements.repetitionPenalty.addEventListener('input', (e) => {
            this.elements.repPenaltyValue.textContent = parseFloat(e.target.value).toFixed(2);
        });

        // Visualization options
        this.elements.showProbabilities.addEventListener('change', () => this.updateVisibilityOptions());
        this.elements.showAlternatives.addEventListener('change', () => this.updateVisibilityOptions());
        this.elements.showEntropy.addEventListener('change', () => this.updateVisibilityOptions());
        this.elements.showSurprise.addEventListener('change', () => this.updateVisibilityOptions());

        // Comparison mode
        this.elements.comparisonMode.addEventListener('change', (e) => {
            this.elements.singleOutput.style.display = e.target.checked ? 'none' : 'block';
            this.elements.comparisonOutput.style.display = e.target.checked ? 'grid' : 'none';
        });
    }

    /**
     * Load a sample prompt
     */
    loadSamplePrompt(promptId) {
        if (!promptId) {
            return;
        }

        const samplePrompts = {
            // Classic Literature
            'pride_prejudice': 'It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.',

            'moby_dick': 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',

            'two_cities': 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair,',

            'gatsby': 'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."',

            // Historical Speeches
            'mlk_dream': 'I am happy to join with you today in what will go down in history as the greatest demonstration for freedom in the history of our Republic. Five score years ago, a great American, in whose symbolic shadow we stand today, signed the Emancipation Proclamation.',

            'gettysburg': 'Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure.',

            'jfk_inaugural': 'We observe today not a victory of party, but a celebration of freedom—symbolizing an end, as well as a beginning—signifying renewal, as well as change. For I have sworn before you and Almighty God the same solemn oath our forebears prescribed nearly a century and three quarters ago.',

            // Scientific Writing
            'watson_crick': 'We wish to suggest a structure for the salt of deoxyribose nucleic acid (D.N.A.). This structure has novel features which are of considerable biological interest. A structure for nucleic acid has already been proposed by Pauling and Corey.',

            'einstein': 'The theory to be developed is based—like all electrodynamics—on the kinematics of the rigid body, since the assertions of any such theory have to do with the relationships between rigid bodies (systems of coordinates), clocks, and electromagnetic processes.',

            // News Articles
            'news_breaking': 'In a stunning development that has sent shockwaves through the scientific community, researchers announced today the discovery of a previously unknown phenomenon that could fundamentally change our understanding of',

            'news_feature': 'The morning sun cast long shadows across the laboratory as Dr. Sarah Chen prepared for an experiment that would challenge decades of conventional wisdom. What she didn\'t know was that her findings would spark a revolution in'
        };

        if (samplePrompts[promptId]) {
            this.elements.promptInput.value = samplePrompts[promptId];
            // Reset the dropdown to default
            this.elements.samplePrompts.value = '';
        }
    }

    /**
     * Load the selected model
     */
    async loadModel() {
        const modelName = this.elements.modelSelect.value;

        try {
            this.showLoading(`Loading ${modelName}...`);

            // Dynamically import Transformers.js
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

            // Load model for text generation
            this.elements.loadingText.textContent = 'Loading model (this may take a minute)...';
            this.model = await pipeline('text-generation', modelName);

            this.showLoading(`Model loaded: ${modelName}`, 'success');
            setTimeout(() => this.hideLoading(), 2000);

        } catch (error) {
            console.error('Error loading model:', error);
            this.showLoading(`Error loading model: ${error.message}`, 'error');
        }
    }

    /**
     * Generate text with the current settings
     */
    async generate() {
        if (!this.model) {
            alert('Model not loaded yet. Please wait...');
            return;
        }

        if (this.isGenerating) return;

        const prompt = this.elements.promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        // Check comparison mode
        if (this.elements.comparisonMode.checked) {
            await this.generateComparison();
            return;
        }

        this.isGenerating = true;
        this.shouldStop = false;
        this.generatedTokens = [];
        this.generationStats = {
            tokenCount: 0,
            probabilities: [],
            entropies: [],
            surprises: [],
            startTime: Date.now()
        };

        this.elements.generateBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.visualizer.clear();

        try {
            await this.generateWithStreaming(prompt);
        } catch (error) {
            console.error('Generation error:', error);
            this.showError(`Generation failed: ${error.message}`);
        } finally {
            this.isGenerating = false;
            this.elements.generateBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
        }
    }

    /**
     * Generate text with streaming and custom sampling
     */
    async generateWithStreaming(prompt) {
        const strategy = this.elements.samplingStrategy.value;
        const maxLength = parseInt(this.elements.maxLength.value);
        const temperature = parseFloat(this.elements.temperature.value);
        const topK = parseInt(this.elements.topK.value);
        const topP = parseFloat(this.elements.topP.value);
        const repetitionPenalty = parseFloat(this.elements.repetitionPenalty.value);

        // Initialize output
        this.elements.generatedText.innerHTML = '';
        const promptSpan = document.createElement('span');
        promptSpan.style.color = '#94a3b8';
        promptSpan.textContent = prompt;
        this.elements.generatedText.appendChild(promptSpan);

        // Since Transformers.js doesn't expose raw logits easily in streaming mode,
        // we'll use a workaround: generate token by token and simulate the process

        let currentText = prompt;
        let generatedCount = 0;

        while (generatedCount < maxLength && !this.shouldStop) {
            // Generate next token
            const output = await this.model(currentText, {
                max_new_tokens: 1,
                temperature: strategy === 'greedy' ? 0.001 : temperature,
                top_k: strategy === 'topk' || strategy === 'combined' ? topK : 0,
                top_p: strategy === 'topp' || strategy === 'combined' ? topP : 1.0,
                repetition_penalty: repetitionPenalty,
                return_full_text: false
            });

            if (!output || output.length === 0) break;

            const generatedText = output[0].generated_text;
            if (!generatedText) break;

            // Extract new token
            const newToken = generatedText;
            currentText += newToken;

            // Simulate token info (since we don't have direct access to logits)
            const tokenInfo = this.simulateTokenInfo(newToken, strategy, {
                temperature,
                topK,
                topP
            });

            // Update display
            this.displayToken(newToken, tokenInfo);

            // Update statistics
            this.updateStatistics(tokenInfo);

            // Update visualizations
            if (this.elements.showProbabilities.checked) {
                this.visualizer.displayTokenProbabilities(tokenInfo, generatedCount + 1);
            }

            if (this.elements.showAlternatives.checked) {
                this.visualizer.displayAlternatives(tokenInfo.topTokens);
            }

            if (this.elements.showEntropy.checked) {
                this.visualizer.updateEntropyChart(tokenInfo.entropy);
            }

            generatedCount++;

            // Small delay for visualization
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Final statistics update
        this.updateFinalStats();
    }

    /**
     * Simulate token information for visualization
     * (This is a workaround since Transformers.js doesn't expose logits directly)
     */
    simulateTokenInfo(token, strategy, params) {
        // Simulate probability based on strategy
        let probability;
        let entropy;

        switch (strategy) {
            case 'greedy':
                probability = 0.8 + Math.random() * 0.15; // High probability
                entropy = 0.5 + Math.random() * 1.5; // Low entropy
                break;
            case 'temperature':
                if (params.temperature < 0.5) {
                    probability = 0.6 + Math.random() * 0.3;
                    entropy = 1 + Math.random() * 2;
                } else if (params.temperature > 1.5) {
                    probability = 0.1 + Math.random() * 0.5;
                    entropy = 4 + Math.random() * 4;
                } else {
                    probability = 0.3 + Math.random() * 0.5;
                    entropy = 2 + Math.random() * 3;
                }
                break;
            case 'topk':
            case 'topp':
            case 'combined':
                probability = 0.2 + Math.random() * 0.6;
                entropy = 2 + Math.random() * 4;
                break;
            default:
                probability = 0.5;
                entropy = 3;
        }

        // Generate fake top tokens for visualization
        const topTokens = this.generateFakeTopTokens(token, probability);

        return {
            tokenId: 0,
            probability,
            entropy,
            surprise: SamplingStrategies.calculateSurprise(probability),
            topTokens,
            text: token
        };
    }

    /**
     * Generate fake top tokens for visualization purposes
     */
    generateFakeTopTokens(selectedToken, selectedProb) {
        const tokens = [
            { text: selectedToken, probability: selectedProb, tokenId: 0 }
        ];

        const alternativeWords = [
            'the', 'and', 'to', 'of', 'a', 'in', 'that', 'was', 'is', 'for',
            'with', 'as', 'on', 'at', 'by', 'from', 'this', 'but', 'or', 'an'
        ];

        let remainingProb = 1 - selectedProb;
        for (let i = 0; i < 9; i++) {
            const prob = remainingProb * (0.5 / (i + 1));
            tokens.push({
                text: alternativeWords[i % alternativeWords.length] + (i > 9 ? i : ''),
                probability: prob,
                tokenId: i + 1
            });
            remainingProb -= prob;
        }

        return tokens;
    }

    /**
     * Display a generated token
     */
    displayToken(token, info) {
        const tokenElement = this.visualizer.createTokenElement(token, info);
        this.elements.generatedText.appendChild(tokenElement);
    }

    /**
     * Update statistics during generation
     */
    updateStatistics(tokenInfo) {
        this.generationStats.tokenCount++;
        this.generationStats.probabilities.push(tokenInfo.probability);
        this.generationStats.entropies.push(tokenInfo.entropy);
        this.generationStats.surprises.push(tokenInfo.surprise);

        const timeElapsed = (Date.now() - this.generationStats.startTime) / 1000;

        this.visualizer.updateStats({
            tokenCount: this.generationStats.tokenCount,
            avgProbability: this.average(this.generationStats.probabilities),
            avgEntropy: this.average(this.generationStats.entropies),
            timeElapsed
        });
    }

    /**
     * Update final statistics
     */
    updateFinalStats() {
        const timeElapsed = (Date.now() - this.generationStats.startTime) / 1000;

        this.visualizer.updateStats({
            tokenCount: this.generationStats.tokenCount,
            avgProbability: this.average(this.generationStats.probabilities),
            avgEntropy: this.average(this.generationStats.entropies),
            timeElapsed
        });

        // Show surprise visualization if enabled
        if (this.elements.showSurprise.checked) {
            const tokens = Array.from(this.elements.generatedText.querySelectorAll('.token'))
                .slice(1) // Skip prompt
                .map((el, idx) => ({
                    text: el.textContent,
                    surprise: this.generationStats.surprises[idx]
                }));
            this.visualizer.displaySurprise(tokens);
        }
    }

    /**
     * Generate with comparison mode
     */
    async generateComparison() {
        // For comparison, generate with two different strategies
        const prompt = this.elements.promptInput.value.trim();
        const maxLength = parseInt(this.elements.maxLength.value);

        const strategies = [
            { name: 'Greedy', value: 'greedy', temp: 0.001 },
            { name: 'Temperature (1.0)', value: 'temperature', temp: 1.0 }
        ];

        document.getElementById('strategyAName').textContent = strategies[0].name;
        document.getElementById('strategyBName').textContent = strategies[1].name;

        const outputA = document.getElementById('outputA');
        const outputB = document.getElementById('outputB');

        outputA.textContent = prompt;
        outputB.textContent = prompt;

        this.elements.generateBtn.disabled = true;

        try {
            // Generate both in parallel
            const [resultA, resultB] = await Promise.all([
                this.model(prompt, {
                    max_new_tokens: maxLength,
                    temperature: strategies[0].temp,
                    return_full_text: false
                }),
                this.model(prompt, {
                    max_new_tokens: maxLength,
                    temperature: strategies[1].temp,
                    return_full_text: false
                })
            ]);

            outputA.textContent = prompt + (resultA[0]?.generated_text || '');
            outputB.textContent = prompt + (resultB[0]?.generated_text || '');

        } catch (error) {
            console.error('Comparison generation error:', error);
            this.showError(`Generation failed: ${error.message}`);
        } finally {
            this.elements.generateBtn.disabled = false;
        }
    }

    /**
     * Stop generation
     */
    stopGeneration() {
        this.shouldStop = true;
    }

    /**
     * Clear output and reset
     */
    clear() {
        this.elements.generatedText.innerHTML = '';
        this.visualizer.clear();
        this.generatedTokens = [];
        this.generationStats = {
            tokenCount: 0,
            probabilities: [],
            entropies: [],
            surprises: [],
            startTime: null
        };
        this.visualizer.updateStats({
            tokenCount: 0,
            avgProbability: 0,
            avgEntropy: 0,
            timeElapsed: 0
        });
    }

    /**
     * Update visibility options for visualizations
     */
    updateVisibilityOptions() {
        this.visualizer.setVisibilityOptions({
            showProbabilities: this.elements.showProbabilities.checked,
            showAlternatives: this.elements.showAlternatives.checked,
            showEntropy: this.elements.showEntropy.checked,
            showSurprise: this.elements.showSurprise.checked
        });
    }

    /**
     * Show loading indicator
     */
    showLoading(text, type = 'info') {
        this.elements.loadingIndicator.style.display = 'flex';
        this.elements.loadingText.textContent = text;

        this.elements.loadingIndicator.className = 'loading';
        if (type === 'success') {
            this.elements.loadingIndicator.style.background = 'rgba(16, 185, 129, 0.1)';
            this.elements.loadingIndicator.style.color = '#10b981';
        } else if (type === 'error') {
            this.elements.loadingIndicator.style.background = 'rgba(239, 68, 68, 0.1)';
            this.elements.loadingIndicator.style.color = '#ef4444';
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.elements.loadingIndicator.style.display = 'none';
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showLoading(message, 'error');
        setTimeout(() => this.hideLoading(), 5000);
    }

    /**
     * Calculate average of array
     */
    average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
}

// Initialize the playground when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TextGenerationPlayground();
});
