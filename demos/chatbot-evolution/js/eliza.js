/**
 * ELIZA Implementation (1966)
 * Classic pattern-matching chatbot by Joseph Weizenbaum
 *
 * This is a wrapper around the full ELIZA engine from Demo 01
 * to maintain compatibility with the timeline app interface.
 */

import { ElizaEngine } from '../../eliza/js/eliza-engine.js';

export class Eliza {
    constructor() {
        this.engine = null;
        this.initialized = false;
        this.initPromise = this.init();
    }

    async init() {
        this.engine = new ElizaEngine();

        // Load rules from Demo 01 (the canonical source)
        // Use path relative to HTML page location (not JS file)
        await this.engine.loadRules('../eliza/data/eliza-rules.json');
        this.initialized = true;
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
    }

    // Async interface that ensures rules are loaded before responding
    async getResponse(input) {
        await this.ensureInitialized();
        const result = this.engine.getResponse(input);
        return result.response;
    }

    reset() {
        if (this.engine) {
            this.engine.reset();
        }
    }

    // Expose breakdown methods from Demo 01 engine for rule visualization
    getDetailedBreakdown(input) {
        if (!this.initialized || !this.engine) {
            return null;
        }
        return this.engine.getDetailedBreakdown(input);
    }

    getDetailedBreakdownPreview(input) {
        if (!this.initialized || !this.engine) {
            return null;
        }
        // Demo 01's getDetailedBreakdown doesn't modify conversation state,
        // so it's safe to use directly as a preview
        return this.engine.getDetailedBreakdown(input);
    }

    // Expose other useful methods from the engine
    getHistory() {
        if (this.engine) {
            return this.engine.getHistory();
        }
        return [];
    }

    getRulesAsJSON() {
        if (this.engine) {
            return this.engine.getRulesAsJSON();
        }
        return null;
    }
}
