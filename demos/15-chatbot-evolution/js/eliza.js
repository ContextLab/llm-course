/**
 * ELIZA Implementation (1966)
 * Classic pattern-matching chatbot by Joseph Weizenbaum
 *
 * This is a wrapper around the full ELIZA engine from Demo 01
 * to maintain compatibility with the timeline app interface.
 */

import { ElizaEngine } from './eliza-engine.js';

export class Eliza {
    constructor() {
        this.engine = null;
        this.initialized = false;
        this.initPromise = this.init();
    }

    async init() {
        this.engine = new ElizaEngine();

        // Load rules from the correct location
        await this.engine.loadRules('data/eliza-rules.json');
        this.initialized = true;
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
    }

    async getResponseAsync(input) {
        await this.ensureInitialized();
        const result = this.engine.getResponse(input);
        return result.response;
    }

    // Synchronous interface for compatibility with timeline-app.js
    // Note: First call may return a loading message if not yet initialized
    getResponse(input) {
        if (!this.initialized) {
            // Queue the initialization and return a temporary message
            this.ensureInitialized().then(() => {
                // Ready for next call
            });
            return "WELCOME. WHAT BRINGS YOU HERE TODAY?";
        }

        const result = this.engine.getResponse(input);
        return result.response;
    }

    reset() {
        if (this.engine) {
            this.engine.reset();
        }
    }
}
