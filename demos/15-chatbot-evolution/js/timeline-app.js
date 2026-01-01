/**
 * Timeline App
 * Main application for chatbot evolution demo
 */

import { Eliza } from './eliza.js';
import { Parry } from './parry.js';
import { Alice } from './alice.js';
import { Seq2SeqBot } from './seq2seq-bot.js';
import { GPTBot } from './gpt-bot.js';

class TimelineApp {
    constructor() {
        this.bots = {
            eliza: new Eliza(),
            parry: new Parry(),
            alice: new Alice(),
            seq2seq: new Seq2SeqBot(),
            gpt: new GPTBot()
        };

        this.currentEra = '2020s';
    }

    async init() {
        this.setupEventListeners();
        this.initializeChats();

        // Load neural models asynchronously
        this.loadNeuralModels();

        this.displayArchitecture();
    }

    async loadNeuralModels() {
        // Load both neural models - don't block on them
        const seq2seqPromise = this.bots.seq2seq.loadModel().then(() => {
            this.updateBotStatus('seq2seq', 'Ready! Try chatting with the neural model.');
        }).catch(() => {
            this.updateBotStatus('seq2seq', 'Failed to load. Please refresh the page.');
        });

        const gptPromise = this.bots.gpt.loadModel().then(() => {
            this.updateBotStatus('gpt', 'Ready! Start chatting.');
        }).catch(() => {
            this.updateBotStatus('gpt', 'Failed to load. Please refresh the page.');
        });

        // Enable inputs once models are loaded
        Promise.all([seq2seqPromise, gptPromise]).then(() => {
            document.getElementById('seq2seq-input').disabled = false;
            const seq2seqBtn = document.querySelector('#era-2010s .chat-send');
            if (seq2seqBtn) {
                seq2seqBtn.disabled = false;
                seq2seqBtn.textContent = 'Send';
                seq2seqBtn.onclick = () => window.sendMessage('seq2seq');
            }
        });
    }

    updateBotStatus(botName, message) {
        const messagesContainer = document.getElementById(`${botName}-messages`);
        if (messagesContainer) {
            // Update or add status message
            const lastMessage = messagesContainer.lastElementChild;
            if (lastMessage && lastMessage.classList.contains('bot')) {
                lastMessage.textContent = message;
            }
        }
    }

    setupEventListeners() {
        // Era navigation
        document.querySelectorAll('.era').forEach(era => {
            era.addEventListener('click', (e) => {
                const eraId = e.currentTarget.dataset.era;
                this.switchEra(eraId);
            });
        });

        // Enter key support for all chat inputs
        document.querySelectorAll('.chat-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const botName = input.id.replace('-input', '');
                    window.sendMessage(botName);
                }
            });
        });

        // Compare button
        document.getElementById('compare-btn').addEventListener('click', () => this.compareAllBots());

        // Chatbot tab switching (for PARRY and ALICE)
        document.querySelectorAll('.chatbot-tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const bot = e.currentTarget.dataset.bot;
                const tab = e.currentTarget.dataset.tab;
                this.switchChatbotTab(bot, tab);
            });
        });

        // Breakdown input enter key support
        document.querySelectorAll('.breakdown-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const botName = input.id.replace('-breakdown-input', '');
                    if (botName === 'parry') {
                        window.analyzeParry();
                    } else if (botName === 'alice') {
                        window.analyzeAlice();
                    }
                }
            });
        });

        // Example selector change handlers
        const parrySelector = document.getElementById('parry-example-selector');
        if (parrySelector) {
            parrySelector.addEventListener('change', (e) => {
                if (e.target.value) {
                    document.getElementById('parry-breakdown-input').value = e.target.value;
                    window.analyzeParry();
                    e.target.value = '';
                }
            });
        }

        const aliceSelector = document.getElementById('alice-example-selector');
        if (aliceSelector) {
            aliceSelector.addEventListener('change', (e) => {
                if (e.target.value) {
                    document.getElementById('alice-breakdown-input').value = e.target.value;
                    window.analyzeAlice();
                    e.target.value = '';
                }
            });
        }
    }

    switchChatbotTab(bot, tab) {
        // Update tab buttons
        document.querySelectorAll('.chatbot-tab-button[data-bot="' + bot + '"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.getElementById(bot + '-chat-tab').classList.toggle('active', tab === 'chat');
        document.getElementById(bot + '-breakdown-tab').classList.toggle('active', tab === 'breakdown');
    }

    analyzeParry(input) {
        const inputText = input || document.getElementById('parry-breakdown-input').value.trim();

        if (!inputText) {
            alert('Please enter some text to analyze');
            return;
        }

        // Get breakdown using preview method to not affect chat state
        const breakdown = this.bots.parry.getDetailedBreakdownPreview(inputText);

        // Update emotional state display
        this.updateParryEmotionalDisplay(breakdown.emotionalState);

        // Display breakdown steps
        this.displayBreakdown('parry', breakdown);
    }

    updateParryEmotionalDisplay(state) {
        // Update progress bars
        document.getElementById('parry-anger-bar').style.width = ((state.anger / 20) * 100) + '%';
        document.getElementById('parry-fear-bar').style.width = ((state.fear / 20) * 100) + '%';
        document.getElementById('parry-mistrust-bar').style.width = ((state.mistrust / 15) * 100) + '%';

        // Update value labels
        document.getElementById('parry-anger-value').textContent = state.anger + '/20';
        document.getElementById('parry-fear-value').textContent = state.fear + '/20';
        document.getElementById('parry-mistrust-value').textContent = state.mistrust + '/15';
    }

    analyzeAlice(input) {
        const inputText = input || document.getElementById('alice-breakdown-input').value.trim();

        if (!inputText) {
            alert('Please enter some text to analyze');
            return;
        }

        // Get breakdown using preview method to not affect chat state
        const breakdown = this.bots.alice.getDetailedBreakdownPreview(inputText);

        // Update context display
        this.updateAliceContextDisplay(breakdown.context);

        // Display breakdown steps
        this.displayBreakdown('alice', breakdown);
    }

    updateAliceContextDisplay(context) {
        document.getElementById('alice-topic-value').textContent = context.topic || 'general';
        const thatText = context.that
            ? (context.that.length > 50 ? context.that.substring(0, 50) + '...' : context.that)
            : '(none)';
        document.getElementById('alice-that-value').textContent = thatText;
        document.getElementById('alice-username-value').textContent = context.userName || '(unknown)';
    }

    displayBreakdown(botName, breakdown) {
        const stepsDiv = document.getElementById(botName + '-breakdown-steps');
        stepsDiv.textContent = ''; // Clear previous content

        breakdown.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'breakdown-step';

            // Step header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'step-header';

            const numberDiv = document.createElement('div');
            numberDiv.className = 'step-number';
            numberDiv.textContent = index + 1;

            const titleDiv = document.createElement('div');
            titleDiv.className = 'step-title';
            titleDiv.textContent = step.name;

            headerDiv.appendChild(numberDiv);
            headerDiv.appendChild(titleDiv);
            stepDiv.appendChild(headerDiv);

            // Description
            const descDiv = document.createElement('div');
            descDiv.className = 'step-description';
            descDiv.textContent = step.description;
            stepDiv.appendChild(descDiv);

            // Add input/output visualization
            if (step.input !== undefined && step.output !== undefined) {
                const ioDiv = document.createElement('div');
                ioDiv.className = 'step-io';

                const inputDiv = document.createElement('div');
                const inputLabel = document.createElement('div');
                inputLabel.className = 'io-label';
                inputLabel.textContent = 'Input';
                const inputBox = document.createElement('div');
                inputBox.className = 'io-box';
                inputBox.textContent = step.input;
                inputDiv.appendChild(inputLabel);
                inputDiv.appendChild(inputBox);

                const arrowDiv = document.createElement('div');
                arrowDiv.className = 'arrow';
                arrowDiv.textContent = String.fromCharCode(8594); // Right arrow

                const outputDiv = document.createElement('div');
                const outputLabel = document.createElement('div');
                outputLabel.className = 'io-label';
                outputLabel.textContent = 'Output';
                const outputBox = document.createElement('div');
                outputBox.className = 'io-box';
                outputBox.textContent = step.output;
                outputDiv.appendChild(outputLabel);
                outputDiv.appendChild(outputBox);

                ioDiv.appendChild(inputDiv);
                ioDiv.appendChild(arrowDiv);
                ioDiv.appendChild(outputDiv);
                stepDiv.appendChild(ioDiv);
            }

            // Add emotional state display (PARRY)
            if (step.emotionalState) {
                const { before, after, changes } = step.emotionalState;
                const contentDiv = document.createElement('div');
                contentDiv.className = 'step-content';

                const changesDiv = document.createElement('div');
                changesDiv.className = 'emotional-changes';

                ['anger', 'fear', 'mistrust'].forEach(emotion => {
                    const changeSpan = document.createElement('span');
                    const change = changes[emotion];
                    changeSpan.className = 'emotion-change ' + (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral');
                    const sign = change >= 0 ? '+' : '';
                    changeSpan.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1) + ': ' + before[emotion] + ' -> ' + after[emotion] + ' (' + sign + change + ')';
                    changesDiv.appendChild(changeSpan);
                });

                contentDiv.appendChild(changesDiv);
                stepDiv.appendChild(contentDiv);
            }

            // Add context info (ALICE)
            if (step.contextInfo && step.name === 'Context Check') {
                const ctx = step.contextInfo;
                const contentDiv = document.createElement('div');
                contentDiv.className = 'step-content';

                const itemsDiv = document.createElement('div');
                itemsDiv.className = 'context-items';

                const topicItem = document.createElement('div');
                topicItem.className = 'context-item';
                const topicLabel = document.createElement('span');
                topicLabel.className = 'context-label';
                topicLabel.textContent = 'Topic:';
                const topicValue = document.createElement('span');
                topicValue.className = 'context-value';
                topicValue.textContent = ctx.topic;
                topicItem.appendChild(topicLabel);
                topicItem.appendChild(topicValue);
                itemsDiv.appendChild(topicItem);

                const thatItem = document.createElement('div');
                thatItem.className = 'context-item';
                const thatLabel = document.createElement('span');
                thatLabel.className = 'context-label';
                thatLabel.textContent = 'That:';
                const thatValue = document.createElement('span');
                thatValue.className = 'context-value';
                thatValue.textContent = ctx.that;
                thatItem.appendChild(thatLabel);
                thatItem.appendChild(thatValue);
                itemsDiv.appendChild(thatItem);

                contentDiv.appendChild(itemsDiv);
                stepDiv.appendChild(contentDiv);
            }

            // Add wildcards display (ALICE)
            if (step.wildcards && step.wildcards.length > 0) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'step-content';

                const wildcardsDiv = document.createElement('div');
                wildcardsDiv.className = 'wildcards-display';

                step.wildcards.forEach(w => {
                    const itemSpan = document.createElement('span');
                    itemSpan.className = 'wildcard-item';
                    const indexSpan = document.createElement('span');
                    indexSpan.className = 'index';
                    indexSpan.textContent = '*' + w.index + ':';
                    itemSpan.appendChild(indexSpan);
                    itemSpan.appendChild(document.createTextNode(' "' + w.captured + '"'));
                    wildcardsDiv.appendChild(itemSpan);
                });

                contentDiv.appendChild(wildcardsDiv);
                stepDiv.appendChild(contentDiv);
            }

            // Add pattern tests
            if (step.patternTests && step.patternTests.length > 0) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'step-content';

                let shownCount = 0;
                step.patternTests.forEach((test, i) => {
                    if (shownCount >= 6 && !test.matched) return;
                    shownCount++;

                    const testDiv = document.createElement('div');
                    testDiv.className = 'pattern-test ' + (test.matched ? 'matched' : 'not-matched');

                    const strongEl = document.createElement('strong');
                    strongEl.textContent = test.priority !== undefined ? '[P' + test.priority + ']' : '#' + (test.index + 1);
                    testDiv.appendChild(strongEl);
                    testDiv.appendChild(document.createTextNode(': ' + test.pattern));

                    if (test.matched) {
                        const highlightSpan = document.createElement('span');
                        highlightSpan.className = 'highlight';
                        highlightSpan.textContent = ' MATCHED';
                        testDiv.appendChild(highlightSpan);
                    }

                    // Show captures if available
                    if (test.captures && test.captures.length > 0 && test.matched) {
                        const capturesText = test.captures.map((c, j) => '(' + (j + 1) + '): "' + (c || '') + '"').join(', ');
                        testDiv.appendChild(document.createElement('br'));
                        testDiv.appendChild(document.createTextNode('Captures: ' + capturesText));
                    }

                    contentDiv.appendChild(testDiv);
                });

                // Show remaining count if truncated
                const remaining = step.patternTests.length - shownCount;
                if (remaining > 0) {
                    const moreDiv = document.createElement('div');
                    moreDiv.className = 'step-details';
                    moreDiv.textContent = '... and ' + remaining + ' more patterns tested';
                    contentDiv.appendChild(moreDiv);
                }

                stepDiv.appendChild(contentDiv);
            }

            // Add details
            if (step.details) {
                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'step-details';
                detailsDiv.textContent = step.details;
                stepDiv.appendChild(detailsDiv);
            }

            stepsDiv.appendChild(stepDiv);
        });

        // Add final result
        if (breakdown.finalResponse) {
            const finalDiv = document.createElement('div');
            finalDiv.className = 'breakdown-step';
            finalDiv.style.borderColor = 'var(--accent-color)';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'step-header';

            const checkDiv = document.createElement('div');
            checkDiv.className = 'step-number';
            checkDiv.style.background = 'var(--accent-color)';
            checkDiv.textContent = String.fromCharCode(10003); // Checkmark

            const titleDiv = document.createElement('div');
            titleDiv.className = 'step-title';
            titleDiv.style.color = 'var(--accent-color)';
            titleDiv.textContent = 'Final Response';

            headerDiv.appendChild(checkDiv);
            headerDiv.appendChild(titleDiv);
            finalDiv.appendChild(headerDiv);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'step-content';

            const responseBox = document.createElement('div');
            responseBox.className = 'io-box';
            responseBox.style.fontSize = '1.1rem';
            responseBox.style.fontWeight = '600';
            responseBox.textContent = breakdown.finalResponse;

            contentDiv.appendChild(responseBox);
            finalDiv.appendChild(contentDiv);
            stepsDiv.appendChild(finalDiv);
        }
    }

    switchEra(eraId) {
        this.currentEra = eraId;

        // Update timeline bar
        document.querySelectorAll('.era').forEach(era => {
            era.classList.toggle('active', era.dataset.era === eraId);
        });

        // Update chatbot display
        document.querySelectorAll('.chatbot-era').forEach(era => {
            era.classList.toggle('active', era.id === `era-${eraId}`);
        });
    }

    initializeChats() {
        const initialMessages = {
            eliza: "WELCOME. WHAT BRINGS YOU HERE TODAY?",
            parry: "What do you want? I don't know you.",
            alice: "Hi! I'm A.L.I.C.E. How can I help you today?",
            seq2seq: "Loading neural model... This may take a minute on first use.",
            gpt: "Loading model... Please wait before chatting."
        };

        for (const [bot, message] of Object.entries(initialMessages)) {
            this.addMessage(bot, message, 'bot');
        }
    }

    async sendMessage(botName) {
        const input = document.getElementById(`${botName}-input`);
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(botName, message, 'user');
        input.value = '';

        // Get bot response
        try {
            let response;
            // Neural models (seq2seq and gpt) use async
            if (botName === 'gpt' || botName === 'seq2seq') {
                // Show typing indicator for neural models
                this.addMessage(botName, 'Generating response...', 'bot-typing');
                response = await this.bots[botName].getResponse(message);
                // Remove typing indicator
                this.removeLastMessage(botName);
            } else {
                // Rule-based bots are synchronous
                response = this.bots[botName].getResponse(message);
            }

            // Add bot response with slight delay for realism
            setTimeout(() => {
                this.addMessage(botName, response, 'bot');
            }, 300);

        } catch (error) {
            console.error(`Error getting response from ${botName}:`, error);
            this.removeLastMessage(botName); // Remove typing indicator if present
            this.addMessage(botName, "Sorry, I encountered an error.", 'bot');
        }
    }

    removeLastMessage(botName) {
        const messagesContainer = document.getElementById(`${botName}-messages`);
        if (messagesContainer && messagesContainer.lastElementChild) {
            messagesContainer.removeChild(messagesContainer.lastElementChild);
        }
    }

    addMessage(botName, text, type) {
        const messagesContainer = document.getElementById(`${botName}-messages`);
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async compareAllBots() {
        const prompt = document.getElementById('compare-prompt').value.trim();

        if (!prompt) {
            alert('Please enter a prompt to compare');
            return;
        }

        const resultsDiv = document.getElementById('comparison-results');
        resultsDiv.innerHTML = '<p style="color: #999; text-align: center;">Processing...</p>';

        const responses = {};

        // Get responses from all bots with individual error handling
        try {
            // Rule-based bots (synchronous) - handle individually
            try {
                responses.eliza = this.bots.eliza.getResponse(prompt);
            } catch (error) {
                console.error('Error from ELIZA:', error);
                responses.eliza = 'Error: Unable to get response';
            }

            try {
                responses.parry = this.bots.parry.getResponse(prompt);
            } catch (error) {
                console.error('Error from PARRY:', error);
                responses.parry = 'Error: Unable to get response';
            }

            try {
                responses.alice = this.bots.alice.getResponse(prompt);
            } catch (error) {
                console.error('Error from ALICE:', error);
                responses.alice = 'Error: Unable to get response';
            }

            // Neural models (asynchronous) - handle individually
            try {
                responses.seq2seq = await this.bots.seq2seq.getResponse(prompt);
            } catch (error) {
                console.error('Error from Seq2Seq:', error);
                responses.seq2seq = 'Error: Unable to get response';
            }

            try {
                responses.gpt = await this.bots.gpt.getResponse(prompt);
            } catch (error) {
                console.error('Error from GPT:', error);
                responses.gpt = 'Error: Unable to get response';
            }
        } catch (error) {
            console.error('Unexpected error in comparison:', error);
        }

        // Display results
        resultsDiv.innerHTML = '';
        for (const [bot, response] of Object.entries(responses)) {
            const item = document.createElement('div');
            item.className = 'comparison-item';
            item.innerHTML = `
                <strong>${bot.toUpperCase()}:</strong><br>
                ${response}
            `;
            resultsDiv.appendChild(item);
        }
    }

    displayArchitecture() {
        const vizDiv = document.getElementById('architecture-viz');

        const architectures = {
            'ELIZA (1966)': 'Pattern → Rules → Response',
            'PARRY (1972)': 'Input → State Machine → Emotional Model → Response',
            'ALICE (1995)': 'Input → AIML Parser → Category Match → Response',
            'BlenderBot (2020)': 'Input → Encoder Transformer → Context → Decoder Transformer → Response',
            'LaMini-GPT (2023)': 'Input → Tokenizer → Transformer Layers (Instruction Tuned) → Response'
        };

        let html = '<div style="padding: 15px; text-align: left;">';
        for (const [name, arch] of Object.entries(architectures)) {
            html += `<div style="margin-bottom: 12px; font-size: 0.8em;">
                <strong>${name}</strong><br>
                <code style="font-size: 0.85em;">${arch}</code>
            </div>`;
        }
        html += '</div>';

        vizDiv.innerHTML = html;
    }
}

// Make sendMessage global for onclick handlers
window.sendMessage = function (botName) {
    window.timelineApp.sendMessage(botName);
};

// Make analyze functions global for onclick handlers
window.analyzeParry = function () {
    window.timelineApp.analyzeParry();
};

window.analyzeAlice = function () {
    window.timelineApp.analyzeAlice();
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.timelineApp = new TimelineApp();
    await window.timelineApp.init();
});
