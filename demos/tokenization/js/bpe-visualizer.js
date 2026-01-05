// BPE Algorithm Visualizer
class BPEVisualizer {
    constructor() {
        this.text = '';
        this.tokens = [];
        this.mergeRules = [];
        this.currentStep = 0;
        this.mergeHistory = [];
        this.isRunning = false;
        this.autoPlayInterval = null;
        this.mode = 'simplified'; // 'simplified' or 'gpt2'
        this.gpt2Merges = null;
        this.gpt2MergesLoaded = false;

        // Simulated BPE merge rules (common English patterns) - Educational version
        this.commonMerges = [
            ['e', 'r'],
            ['h', 'e'],
            ['i', 'n'],
            ['t', 'h'],
            ['a', 'n'],
            ['o', 'r'],
            ['l', 'l'],
            ['o', 'o'],
            ['l', 'd'],
            ['w', 'o'],
            ['r', 'l'],
            ['he', 'r'],
            ['in', 'g'],
            ['th', 'e'],
            ['wor', 'ld'],
            ['er', 'e']
        ];

        this.setupEventListeners();
        this.loadGPT2Merges();
    }

    async loadGPT2Merges() {
        try {
            const response = await fetch('data/gpt2-merges.json');
            const data = await response.json();
            this.gpt2Merges = data.merges;
            this.gpt2MergesLoaded = true;
            console.log(`Loaded ${data.num_merges} GPT-2 merge rules`);

            // Enable GPT-2 mode toggle
            const gpt2ModeBtn = document.getElementById('bpe-mode-gpt2');
            if (gpt2ModeBtn) {
                gpt2ModeBtn.disabled = false;
                gpt2ModeBtn.title = `${data.num_merges} real GPT-2 merges loaded`;
            }
        } catch (error) {
            console.error('Failed to load GPT-2 merges:', error);
            this.gpt2MergesLoaded = false;
        }
    }

    setupEventListeners() {
        document.getElementById('bpe-start-btn').addEventListener('click', () => this.start());
        document.getElementById('bpe-step-btn').addEventListener('click', () => this.step());
        document.getElementById('bpe-auto-btn').addEventListener('click', () => this.toggleAutoPlay());
        document.getElementById('bpe-reset-btn').addEventListener('click', () => this.reset());

        document.getElementById('bpe-mode-simplified').addEventListener('click', () => this.setMode('simplified'));
        document.getElementById('bpe-mode-gpt2').addEventListener('click', () => this.setMode('gpt2'));

        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-text');
                document.getElementById('bpe-input').value = text;
                this.reset();
            });
        });
    }

    setMode(mode) {
        if (mode === 'gpt2' && !this.gpt2MergesLoaded) {
            alert('GPT-2 merges are still loading. Please try again in a moment.');
            return;
        }

        this.mode = mode;

        // Update button states
        document.getElementById('bpe-mode-simplified').classList.toggle('active', mode === 'simplified');
        document.getElementById('bpe-mode-gpt2').classList.toggle('active', mode === 'gpt2');

        // Update mode indicator
        const modeIndicator = document.getElementById('bpe-mode-indicator');
        if (modeIndicator) {
            if (mode === 'simplified') {
                modeIndicator.innerHTML = '<strong>Mode:</strong> Simplified (Educational) - 16 common patterns';
            } else {
                modeIndicator.innerHTML = `<strong>Mode:</strong> Real GPT-2 BPE - ${this.gpt2Merges.length.toLocaleString()} merge rules from HuggingFace`;
            }
        }

        // Reset visualization if running
        if (this.isRunning || this.tokens.length > 0) {
            this.reset();
        }
    }

    start() {
        this.text = document.getElementById('bpe-input').value.trim();
        if (!this.text) {
            alert('Please enter some text first');
            return;
        }

        // Initialize tokens as individual characters
        if (this.mode === 'gpt2') {
            // For GPT-2 mode, handle spaces specially
            // GPT-2 uses Ġ to represent space at the beginning of words
            this.tokens = [];
            const chars = this.text.split('');

            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                if (char === ' ') {
                    // Replace space with GPT-2's space marker
                    this.tokens.push({
                        value: 'Ġ',
                        merged: false
                    });
                } else {
                    this.tokens.push({
                        value: char,
                        merged: false
                    });
                }
            }
        } else {
            // Simplified mode - just split into characters
            this.tokens = this.text.split('').map(char => ({
                value: char,
                merged: false
            }));
        }

        this.mergeHistory = [];
        this.currentStep = 0;
        this.isRunning = true;

        // Enable step and auto buttons
        document.getElementById('bpe-step-btn').disabled = false;
        document.getElementById('bpe-auto-btn').disabled = false;

        this.updateDisplay();

        const modeText = this.mode === 'gpt2' ? 'Real GPT-2 BPE' : 'Simplified BPE';
        this.updateStepInfo(`${modeText} initialized with ${this.tokens.length} characters. Click "Next Step" to begin merging pairs.`);
    }

    step() {
        if (!this.isRunning) return;

        // Find the most frequent pair
        const pairs = this.findPairs();
        if (pairs.size === 0) {
            this.finish();
            return;
        }

        // Get the most frequent pair (or use predefined merge rules)
        const mostFrequentPair = this.getMostFrequentPair(pairs);
        if (!mostFrequentPair) {
            this.finish();
            return;
        }

        // Perform merge
        this.mergePair(mostFrequentPair);

        this.currentStep++;
        this.updateDisplay();
    }

    findPairs() {
        const pairs = new Map();

        for (let i = 0; i < this.tokens.length - 1; i++) {
            const pair = [this.tokens[i].value, this.tokens[i + 1].value];
            const pairKey = pair.join('|');

            if (!pairs.has(pairKey)) {
                pairs.set(pairKey, { pair, count: 0, indices: [] });
            }

            const pairData = pairs.get(pairKey);
            pairData.count++;
            pairData.indices.push(i);
        }

        return pairs;
    }

    getMostFrequentPair(pairs) {
        if (this.mode === 'gpt2' && this.gpt2Merges) {
            // Use GPT-2 merge rules - merge priority is based on order in the list
            // Earlier merges have higher priority
            for (const mergeRule of this.gpt2Merges) {
                // Handle GPT-2's special space character (Ġ)
                const rule0 = mergeRule[0];
                const rule1 = mergeRule[1];

                // Create pair key
                const pairKey = [rule0, rule1].join('|');
                if (pairs.has(pairKey)) {
                    return pairs.get(pairKey);
                }
            }

            // If no GPT-2 merge rule matches, use the most frequent pair
            let maxCount = 0;
            let mostFrequent = null;

            for (const [key, data] of pairs.entries()) {
                if (data.count > maxCount) {
                    maxCount = data.count;
                    mostFrequent = data;
                }
            }

            return mostFrequent;
        } else {
            // Simplified mode: Try to use predefined merge rules first
            for (const mergeRule of this.commonMerges) {
                const pairKey = mergeRule.join('|');
                if (pairs.has(pairKey)) {
                    return pairs.get(pairKey);
                }
            }

            // Otherwise, use the most frequent pair
            let maxCount = 0;
            let mostFrequent = null;

            for (const [key, data] of pairs.entries()) {
                if (data.count > maxCount) {
                    maxCount = data.count;
                    mostFrequent = data;
                }
            }

            return mostFrequent;
        }
    }

    mergePair(pairData) {
        const { pair, indices } = pairData;
        const mergedValue = pair.join('');

        // Merge from right to left to preserve indices
        for (let i = indices.length - 1; i >= 0; i--) {
            const idx = indices[i];

            // Create merged token
            const mergedToken = {
                value: mergedValue,
                merged: true
            };

            // Replace the pair with merged token
            this.tokens.splice(idx, 2, mergedToken);
        }

        // Add to merge history
        this.mergeHistory.push({
            step: this.currentStep + 1,
            pair: pair,
            result: mergedValue,
            count: indices.length
        });

        // Format tokens for display
        const formatToken = (token) => {
            if (this.mode === 'gpt2') {
                return token.replace(/Ġ/g, '▁');
            }
            return token;
        };

        // Update step info
        this.updateStepInfo(
            `Step ${this.currentStep + 1}: Merged <span class="highlight">"${formatToken(pair[0])}" + "${formatToken(pair[1])}"</span> → <span class="highlight">"${formatToken(mergedValue)}"</span> (${indices.length} occurrence${indices.length > 1 ? 's' : ''})`
        );

        // Reset merged flag after animation
        setTimeout(() => {
            this.tokens.forEach(token => token.merged = false);
            this.updateDisplay();
        }, 500);
    }

    finish() {
        this.isRunning = false;
        document.getElementById('bpe-step-btn').disabled = true;
        document.getElementById('bpe-auto-btn').disabled = true;
        this.stopAutoPlay();

        this.updateStepInfo('BPE complete! No more pairs to merge. The text has been fully tokenized.');
    }

    reset() {
        this.tokens = [];
        this.mergeHistory = [];
        this.currentStep = 0;
        this.isRunning = false;

        this.stopAutoPlay();

        document.getElementById('bpe-step-btn').disabled = true;
        document.getElementById('bpe-auto-btn').disabled = true;
        document.getElementById('bpe-auto-btn').textContent = 'Auto Play';

        this.updateDisplay();
        this.updateStepInfo('Click "Load Text" to begin the BPE visualization');

        document.getElementById('merge-list').innerHTML = '';
        document.getElementById('bpe-tree').innerHTML = '';
    }

    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (this.isRunning) {
                this.step();
            } else {
                this.stopAutoPlay();
            }
        }, 1000);

        document.getElementById('bpe-auto-btn').textContent = 'Pause';
        document.getElementById('bpe-step-btn').disabled = true;
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }

        document.getElementById('bpe-auto-btn').textContent = 'Auto Play';
        if (this.isRunning) {
            document.getElementById('bpe-step-btn').disabled = false;
        }
    }

    updateDisplay() {
        // Update current state
        const stateDiv = document.getElementById('bpe-current-state');
        stateDiv.innerHTML = '';

        if (this.tokens.length === 0) {
            stateDiv.innerHTML = '<p class="placeholder">Visualization will appear here</p>';
        } else {
            this.tokens.forEach(token => {
                const span = document.createElement('span');
                span.className = 'bpe-token' + (token.merged ? ' merged' : '');

                // Display Ġ as a visible space marker for GPT-2 mode
                let displayValue = token.value;
                if (this.mode === 'gpt2' && token.value.includes('Ġ')) {
                    // Replace Ġ with a visible space representation
                    displayValue = token.value.replace(/Ġ/g, '▁');
                    span.title = token.value; // Show original on hover
                }

                span.textContent = displayValue;
                stateDiv.appendChild(span);
            });
        }

        // Update stats
        document.getElementById('bpe-current-step').textContent = this.currentStep;
        document.getElementById('bpe-token-count').textContent = this.tokens.length;

        const pairs = this.findPairs();
        document.getElementById('bpe-pairs-count').textContent = pairs.size;

        // Update merge history
        this.updateMergeHistory();

        // Update merge tree
        this.updateMergeTree();
    }

    updateStepInfo(message) {
        document.getElementById('bpe-step-info').innerHTML = `<p>${message}</p>`;
    }

    updateMergeHistory() {
        const mergeList = document.getElementById('merge-list');

        // Only add new items
        const existingCount = mergeList.children.length;
        const newMerges = this.mergeHistory.slice(existingCount);

        newMerges.forEach(merge => {
            const li = document.createElement('li');

            // Format tokens for display (replace Ġ with ▁ for readability)
            const formatToken = (token) => {
                if (this.mode === 'gpt2') {
                    return token.replace(/Ġ/g, '▁');
                }
                return token;
            };

            const pair0 = formatToken(merge.pair[0]);
            const pair1 = formatToken(merge.pair[1]);
            const result = formatToken(merge.result);

            li.textContent = `Step ${merge.step}: "${pair0}" + "${pair1}" → "${result}" (×${merge.count})`;
            mergeList.appendChild(li);
        });

        // Scroll to bottom
        mergeList.scrollTop = mergeList.scrollHeight;
    }

    updateMergeTree() {
        const treeDiv = document.getElementById('bpe-tree');

        if (this.mergeHistory.length === 0) {
            treeDiv.innerHTML = '<p class="placeholder">Merge tree will appear as you perform merges</p>';
            return;
        }

        treeDiv.innerHTML = '';

        // Format tokens for display
        const formatToken = (token) => {
            if (this.mode === 'gpt2') {
                return token.replace(/Ġ/g, '▁');
            }
            return token;
        };

        // Group merges by level
        const levels = [];
        let currentLevel = [];

        this.mergeHistory.forEach((merge, idx) => {
            currentLevel.push(merge);

            // Create a new level every 3 merges for better visualization
            if (currentLevel.length >= 3 || idx === this.mergeHistory.length - 1) {
                levels.push([...currentLevel]);
                currentLevel = [];
            }
        });

        // Display levels
        levels.forEach((level, levelIdx) => {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'tree-level';

            level.forEach(merge => {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = 'tree-node';
                nodeDiv.innerHTML = `
                    <div style="font-size: 0.8rem; color: #6b7280;">Step ${merge.step}</div>
                    <div style="font-weight: 600;">${formatToken(merge.result)}</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">${formatToken(merge.pair[0])} + ${formatToken(merge.pair[1])}</div>
                `;
                levelDiv.appendChild(nodeDiv);
            });

            treeDiv.appendChild(levelDiv);
        });
    }
}

// Token Frequency Analyzer
class TokenFrequencyAnalyzer {
    constructor(visualizer) {
        this.visualizer = visualizer;
    }

    analyze() {
        if (!this.visualizer.tokens || this.visualizer.tokens.length === 0) {
            return [];
        }

        const frequency = new Map();

        this.visualizer.tokens.forEach(token => {
            const value = token.value;
            frequency.set(value, (frequency.get(value) || 0) + 1);
        });

        // Convert to array and sort by frequency
        return Array.from(frequency.entries())
            .map(([token, count]) => ({ token, count }))
            .sort((a, b) => b.count - a.count);
    }

    display() {
        const frequencies = this.analyze();

        if (frequencies.length === 0) {
            return '<p>No token data available</p>';
        }

        let html = '<h4>Token Frequency Distribution</h4><ul>';
        frequencies.slice(0, 10).forEach(item => {
            html += `<li><code>${item.token}</code>: ${item.count}</li>`;
        });
        html += '</ul>';

        return html;
    }
}

// Subword Decomposition Visualizer
class SubwordDecomposer {
    static decompose(text) {
        // Simple heuristic decomposition for educational purposes
        const words = text.split(/\s+/);
        const decompositions = [];

        words.forEach(word => {
            const subwords = [];
            let remaining = word;

            // Common prefixes
            const prefixes = ['un', 'pre', 're', 'dis', 'mis', 'over', 'under', 'sub'];
            for (const prefix of prefixes) {
                if (remaining.startsWith(prefix) && remaining.length > prefix.length + 2) {
                    subwords.push(prefix);
                    remaining = remaining.slice(prefix.length);
                    break;
                }
            }

            // Common suffixes
            const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'ness', 'ment', 'tion', 'able'];
            for (const suffix of suffixes) {
                if (remaining.endsWith(suffix) && remaining.length > suffix.length + 2) {
                    const root = remaining.slice(0, -suffix.length);
                    if (root.length >= 2) {
                        subwords.push(root);
                        subwords.push(suffix);
                        remaining = '';
                        break;
                    }
                }
            }

            // Add remaining part if any
            if (remaining) {
                subwords.push(remaining);
            }

            // If no decomposition found, use whole word
            if (subwords.length === 0) {
                subwords.push(word);
            }

            decompositions.push({
                original: word,
                subwords: subwords
            });
        });

        return decompositions;
    }

    static display(text) {
        const decompositions = this.decompose(text);

        let html = '<div style="padding: 15px;">';
        decompositions.forEach(item => {
            html += `<div style="margin-bottom: 10px;">`;
            html += `<strong>${item.original}</strong> → `;
            html += item.subwords.map(sw =>
                `<span class="bpe-token">${sw}</span>`
            ).join(' + ');
            html += '</div>';
        });
        html += '</div>';

        return html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bpeVisualizer = new BPEVisualizer();
    window.tokenFrequencyAnalyzer = new TokenFrequencyAnalyzer(window.bpeVisualizer);
    window.subwordDecomposer = SubwordDecomposer;
});

// Export for use in other modules
window.bpe = {
    visualizer: null,
    frequencyAnalyzer: null,
    subwordDecomposer: SubwordDecomposer
};
