/**
 * Timeline App
 * Main application for chatbot evolution demo
 */

import { Eliza } from './eliza.js';
import { Parry } from './parry.js';
import { Alice } from './alice.js';
import { Seq2SeqBot } from './seq2seq-bot.js';
import { GPTBot } from './gpt-bot.js';
import { ElizaBreakdownRenderer } from '../../01-eliza/js/eliza-breakdown-renderer.js';

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
        
        this.elizaBreakdownRenderer = new ElizaBreakdownRenderer({
            containerId: 'eliza-breakdown-steps'
        });
    }

    async init() {
        this.setupEventListeners();
        this.initializeChats();

        // Load neural models asynchronously
        this.loadNeuralModels();

        this.displayArchitecture();
    }

    async loadNeuralModels() {
        // Set up progress callbacks for both models
        this.bots.seq2seq.setProgressCallback((progress) => {
            this.updateLoadingProgress('seq2seq', progress);
        });

        this.bots.gpt.setProgressCallback((progress) => {
            this.updateLoadingProgress('gpt', progress);
        });

        // Load both neural models in parallel
        const seq2seqPromise = this.bots.seq2seq.loadModel().then((success) => {
            if (success) {
                this.hideLoadingStatus('seq2seq');
                this.enableChatInterface('seq2seq');
                this.updateBotStatus('seq2seq', 'Ready! Try chatting with the neural model.');
            } else {
                this.showLoadingError('seq2seq', 'Failed to load model. Please refresh the page.');
            }
        }).catch((error) => {
            console.error('Seq2seq loading error:', error);
            this.showLoadingError('seq2seq', 'Failed to load. Please refresh the page.');
        });

        const gptPromise = this.bots.gpt.loadModel().then((success) => {
            if (success) {
                this.hideLoadingStatus('gpt');
                this.enableChatInterface('gpt');
                this.updateBotStatus('gpt', 'Ready! Start chatting.');
                // Update the demo note to reflect the actual model loaded
                const modelInfo = this.bots.gpt.getModelInfo();
                const demoNote = document.querySelector('#gpt-chat-tab .demo-note');
                if (demoNote && modelInfo) {
                    if (modelInfo.isSmolLM) {
                        demoNote.textContent = 'Using SmolLM-135M-Instruct - a compact instruction-tuned model optimized for browser deployment.';
                    } else {
                        demoNote.textContent = 'Using LaMini-GPT-124M (fallback) - an instruction-tuned model.';
                    }
                }
            } else {
                this.showLoadingError('gpt', 'Failed to load model. Please refresh the page.');
            }
        }).catch((error) => {
            console.error('GPT loading error:', error);
            this.showLoadingError('gpt', 'Failed to load. Please refresh the page.');
        });

        // Wait for both to complete (don't block, just log when done)
        Promise.all([seq2seqPromise, gptPromise]).then(() => {
            console.log('All neural models loaded');
        });
    }

    /**
     * Update the loading progress display for a neural model
     */
    updateLoadingProgress(botName, progress) {
        const progressEl = document.getElementById(`${botName}-progress`);
        const loadingTextEl = document.querySelector(`#${botName}-loading-status .loading-text`);

        if (progressEl) {
            if (progress.progress !== null) {
                progressEl.textContent = `${progress.stage} (${progress.progress.toFixed(0)}%)`;
            } else {
                progressEl.textContent = progress.stage;
            }
        }

        if (loadingTextEl && progress.model) {
            const modelName = progress.model.split('/').pop();
            loadingTextEl.textContent = `Loading ${modelName}...`;
        }
    }

    /**
     * Hide the loading status overlay for a bot
     */
    hideLoadingStatus(botName) {
        const loadingStatus = document.getElementById(`${botName}-loading-status`);
        if (loadingStatus) {
            loadingStatus.classList.add('hidden');
        }
    }

    /**
     * Show loading error
     */
    showLoadingError(botName, message) {
        const loadingStatus = document.getElementById(`${botName}-loading-status`);
        if (loadingStatus) {
            loadingStatus.classList.add('error');
            const loadingText = loadingStatus.querySelector('.loading-text');
            const loadingProgress = loadingStatus.querySelector('.loading-progress');
            if (loadingText) loadingText.textContent = 'Loading Failed';
            if (loadingProgress) loadingProgress.textContent = message;
        }
    }

    /**
     * Enable the chat interface for a bot after loading
     */
    enableChatInterface(botName) {
        const input = document.getElementById(`${botName}-input`);
        const sendBtn = document.getElementById(`${botName}-send-btn`);

        if (input) {
            input.disabled = false;
            input.placeholder = `Talk to ${botName === 'seq2seq' ? 'BlenderBot' : 'GPT-style model'}...`;
        }

        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
            sendBtn.onclick = () => window.sendMessage(botName);
        }
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

        // Chatbot tab switching (for all bots with tabs: ELIZA, PARRY, ALICE, Seq2Seq, GPT)
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
                    if (botName === 'eliza') {
                        window.analyzeEliza();
                    } else if (botName === 'parry') {
                        window.analyzeParry();
                    } else if (botName === 'alice') {
                        window.analyzeAlice();
                    }
                }
            });
        });

        // Example selector change handlers
        const elizaSelector = document.getElementById('eliza-example-selector');
        if (elizaSelector) {
            elizaSelector.addEventListener('change', (e) => {
                if (e.target.value) {
                    document.getElementById('eliza-breakdown-input').value = e.target.value;
                    window.analyzeEliza();
                    e.target.value = '';
                }
            });
        }

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

        // Update tab content - handle all possible tabs
        const chatTab = document.getElementById(bot + '-chat-tab');
        const breakdownTab = document.getElementById(bot + '-breakdown-tab');
        const architectureTab = document.getElementById(bot + '-architecture-tab');

        if (chatTab) chatTab.classList.toggle('active', tab === 'chat');
        if (breakdownTab) breakdownTab.classList.toggle('active', tab === 'breakdown');
        if (architectureTab) architectureTab.classList.toggle('active', tab === 'architecture');
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
        document.getElementById('alice-that-value').textContent = context.that || '(none)';
        document.getElementById('alice-username-value').textContent = context.userName || '(unknown)';
    }

    async analyzeEliza(input) {
        const inputText = input || document.getElementById('eliza-breakdown-input').value.trim();

        if (!inputText) {
            alert('Please enter some text to analyze');
            return;
        }

        await this.bots.eliza.ensureInitialized();

        if (!this.elizaBreakdownRenderer.engine) {
            this.elizaBreakdownRenderer.setEngine(this.bots.eliza.engine);
        }

        const breakdown = this.bots.eliza.getDetailedBreakdownPreview(inputText);

        if (!breakdown) {
            alert('Unable to analyze. Please try again.');
            return;
        }

        this.elizaBreakdownRenderer.displayBreakdown(breakdown);
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
            if (step.contextInfo && step.name === 'Context Check (Before)') {
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

            // Add SRAI display for ALICE
            if (step.sraiTarget) {
                const cd = document.createElement("div");
                cd.className = "step-content";
                const sd = document.createElement("div");
                sd.style.cssText = "background:#e0f2fe;padding:12px;border-radius:8px;border-left:4px solid #0284c7;";
                sd.innerHTML = '<div style="font-weight:600;color:#0369a1;margin-bottom:8px;">SRAI REDIRECT</div><code>\"' + (step.input || "") + '\" -> \"' + step.sraiTarget + '\"</code>';
                cd.appendChild(sd);
                stepDiv.appendChild(cd);
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
                    // Use test.index if available, otherwise fall back to loop index i
                    const displayIndex = test.index !== undefined ? test.index : i;
                    strongEl.textContent = test.priority !== undefined ? '[P' + test.priority + ']' : '#' + (displayIndex + 1);
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

                // Show remaining count if truncated (expandable)
                const remaining = step.patternTests.length - shownCount;
                if (remaining > 0) {
                    const detailsEl = document.createElement('details');
                    detailsEl.className = 'more-patterns';
                    const summaryEl = document.createElement('summary');
                    summaryEl.textContent = '...and ' + remaining + ' more patterns tested';
                    detailsEl.appendChild(summaryEl);

                    // Add the remaining patterns
                    const remainingPatterns = step.patternTests.slice(shownCount);
                    remainingPatterns.forEach(test => {
                        const testDiv = document.createElement('div');
                        testDiv.className = 'pattern-test ' + (test.matched ? 'matched' : 'not-matched');
                        testDiv.textContent = test.pattern;
                        detailsEl.appendChild(testDiv);
                    });

                    contentDiv.appendChild(detailsEl);
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
            eliza: "Welcome. What brings you here today?",
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

        // Add user message immediately
        this.addMessage(botName, message, 'user');
        input.value = '';

        // Get bot response
        try {
            let response;
            // Neural models show loading indicator
            if (botName === 'gpt' || botName === 'seq2seq') {
                // Show animated typing indicator for neural models
                this.addTypingIndicator(botName);
                response = await this.bots[botName].getResponse(message);
                // Remove typing indicator
                this.removeTypingIndicator(botName);
            } else if (botName === 'eliza') {
                // ELIZA uses async to ensure rules are loaded
                response = await this.bots.eliza.getResponse(message);
            } else {
                // Other rule-based bots (PARRY, ALICE) are synchronous
                response = this.bots[botName].getResponse(message);
            }

            // Add bot response with slight delay for realism
            setTimeout(() => {
                this.addMessage(botName, response, 'bot');
            }, 300);

        } catch (error) {
            console.error(`Error getting response from ${botName}:`, error);
            this.removeTypingIndicator(botName); // Remove typing indicator if present
            this.addMessage(botName, "Sorry, I encountered an error.", 'bot');
        }
    }

    removeLastMessage(botName) {
        const messagesContainer = document.getElementById(`${botName}-messages`);
        if (messagesContainer && messagesContainer.lastElementChild) {
            messagesContainer.removeChild(messagesContainer.lastElementChild);
        }
    }

    addTypingIndicator(botName) {
        const messagesContainer = document.getElementById(`${botName}-messages`);
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.id = `${botName}-typing`;
        // Create three animated dots using DOM methods
        for (let i = 0; i < 3; i++) {
            typingDiv.appendChild(document.createElement('span'));
        }
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator(botName) {
        const typingDiv = document.getElementById(`${botName}-typing`);
        if (typingDiv) {
            typingDiv.remove();
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
        const promptInput = document.getElementById('compare-prompt');
        const prompt = promptInput.value.trim();

        if (!prompt) {
            alert('Please enter a prompt to compare');
            return;
        }

        const resultsDiv = document.getElementById('comparison-results');
        resultsDiv.textContent = ''; // Clear previous results

        // Get compare button and set loading state
        const compareBtn = document.getElementById('compare-btn');
        compareBtn.disabled = true;
        compareBtn.textContent = 'Comparing...';

        // Ensure ELIZA is initialized before getting response
        await this.bots.eliza.ensureInitialized();

        // Add user message to display
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'comparison-item';
        userMsgDiv.style.background = 'var(--primary-color)';
        userMsgDiv.style.color = 'white';
        userMsgDiv.style.borderLeftColor = 'var(--secondary-color)';
        const userStrong = document.createElement('strong');
        userStrong.textContent = 'YOU:';
        userMsgDiv.appendChild(userStrong);
        userMsgDiv.appendChild(document.createElement('br'));
        userMsgDiv.appendChild(document.createTextNode(prompt));
        resultsDiv.appendChild(userMsgDiv);

        // Clear input
        promptInput.value = '';

        // Create bot response containers with loading indicators
        const botNames = ['eliza', 'parry', 'alice', 'seq2seq', 'gpt'];
        const botLabels = {
            eliza: 'ELIZA (1966)',
            parry: 'PARRY (1972)',
            alice: 'A.L.I.C.E. (1995)',
            seq2seq: 'BlenderBot (2020)',
            gpt: 'SmolLM (2024)'
        };
        const botDivs = {};

        // Create containers with typing indicators
        for (const bot of botNames) {
            const item = document.createElement('div');
            item.className = 'comparison-item';
            item.id = `compare-${bot}`;

            const strong = document.createElement('strong');
            strong.textContent = botLabels[bot] + ':';
            item.appendChild(strong);
            item.appendChild(document.createElement('br'));

            // Add typing indicator
            const typingSpan = document.createElement('span');
            typingSpan.className = 'typing-indicator';
            typingSpan.style.display = 'inline-flex';
            for (let i = 0; i < 3; i++) {
                typingSpan.appendChild(document.createElement('span'));
            }
            item.appendChild(typingSpan);

            resultsDiv.appendChild(item);
            botDivs[bot] = item;
        }

        // Scroll to show new content
        resultsDiv.scrollTop = resultsDiv.scrollHeight;

        // Get responses - rule-based first (sync), then neural (async)
        const updateBotResponse = (bot, response) => {
            const item = botDivs[bot];
            // Remove typing indicator and add response
            const typing = item.querySelector('.typing-indicator');
            if (typing) typing.remove();
            item.appendChild(document.createTextNode(response));
        };

        // ELIZA is async (needs to ensure rules loaded)
        try {
            const elizaResponse = await this.bots.eliza.getResponse(prompt);
            updateBotResponse('eliza', elizaResponse);
        } catch (error) {
            console.error('Error from ELIZA:', error);
            updateBotResponse('eliza', 'Error: Unable to get response');
        }

        // Rule-based bots (synchronous)
        try {
            updateBotResponse('parry', this.bots.parry.getResponse(prompt));
        } catch (error) {
            console.error('Error from PARRY:', error);
            updateBotResponse('parry', 'Error: Unable to get response');
        }

        try {
            updateBotResponse('alice', this.bots.alice.getResponse(prompt));
        } catch (error) {
            console.error('Error from ALICE:', error);
            updateBotResponse('alice', 'Error: Unable to get response');
        }

        // Neural models (asynchronous) - run in parallel
        const neuralPromises = [
            this.bots.seq2seq.getResponse(prompt).then(r => updateBotResponse('seq2seq', r))
                .catch(e => { console.error('Error from Seq2Seq:', e); updateBotResponse('seq2seq', 'Error: Unable to get response'); }),
            this.bots.gpt.getResponse(prompt).then(r => updateBotResponse('gpt', r))
                .catch(e => { console.error('Error from GPT:', e); updateBotResponse('gpt', 'Error: Unable to get response'); })
        ];

        await Promise.all(neuralPromises);

        // Restore button state
        compareBtn.disabled = false;
        compareBtn.textContent = 'Compare Responses';
    }

    displayArchitecture() {
        const vizDiv = document.getElementById('architecture-viz');

        const architectures = {
            'ELIZA (1966)': 'Pattern → Rules → Response',
            'PARRY (1972)': 'Input → State Machine → Emotional Model → Response',
            'ALICE (1995)': 'Input → AIML Parser → Category Match → Response',
            'BlenderBot (2020)': 'Input → Encoder → Decoder → Response',
            'SmolLM (2024)': 'Input → Decoder-Only Transformer → Response'
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

window.analyzeEliza = function () {
    window.timelineApp.analyzeEliza();
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.timelineApp = new TimelineApp();
    await window.timelineApp.init();
});
