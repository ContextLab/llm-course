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
            'DistilGPT2 (2019)': 'Input → Tokenizer → Transformer Layers → Softmax → Response'
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
window.sendMessage = function(botName) {
    window.timelineApp.sendMessage(botName);
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.timelineApp = new TimelineApp();
    await window.timelineApp.init();
});
