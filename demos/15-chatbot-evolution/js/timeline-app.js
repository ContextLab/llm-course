/**
 * Timeline App
 * Main application for chatbot evolution demo
 */

import { Eliza } from './eliza.js';
import { Parry } from './parry.js';
import { Alice } from './alice.js';
import { Seq2SeqSimulator } from './seq2seq-sim.js';
import { GPTBot } from './gpt-bot.js';

class TimelineApp {
    constructor() {
        this.bots = {
            eliza: new Eliza(),
            parry: new Parry(),
            alice: new Alice(),
            seq2seq: new Seq2SeqSimulator(),
            gpt: new GPTBot()
        };

        this.currentEra = '2020s';
    }

    async init() {
        this.setupEventListeners();
        this.initializeChats();
        await this.bots.gpt.loadModel();
        this.displayArchitecture();
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
            eliza: "Hello. I am ELIZA. What brings you here today?",
            parry: "What do you want? I don't know you.",
            alice: "Hi! I'm A.L.I.C.E. How can I help you today?",
            seq2seq: "hello .",
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
            if (botName === 'gpt') {
                response = await this.bots[botName].getResponse(message);
            } else {
                response = this.bots[botName].getResponse(message);
            }

            // Add bot response
            setTimeout(() => {
                this.addMessage(botName, response, 'bot');
            }, 500);

        } catch (error) {
            console.error(`Error getting response from ${botName}:`, error);
            this.addMessage(botName, "Sorry, I encountered an error.", 'bot');
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

        // Get responses from all bots
        try {
            responses.eliza = this.bots.eliza.getResponse(prompt);
            responses.parry = this.bots.parry.getResponse(prompt);
            responses.alice = this.bots.alice.getResponse(prompt);
            responses.seq2seq = this.bots.seq2seq.getResponse(prompt);
            responses.gpt = await this.bots.gpt.getResponse(prompt);
        } catch (error) {
            console.error('Error in comparison:', error);
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
            'Seq2Seq (2014)': 'Input → Encoder (LSTM) → Context Vector → Decoder (LSTM) → Response',
            'GPT (2020s)': 'Input → Tokenizer → Transformer Layers → Softmax → Response'
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
