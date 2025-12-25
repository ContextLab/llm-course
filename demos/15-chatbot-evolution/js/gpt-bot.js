/**
 * GPT-style Bot (2020s)
 * Uses Transformers.js for generation
 */

export class GPTBot {
    constructor() {
        this.model = null;
        this.isReady = false;
    }

    async loadModel() {
        try {
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
            this.model = await pipeline('text-generation', 'Xenova/distilgpt2');
            this.isReady = true;
            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            return false;
        }
    }

    async getResponse(input) {
        if (!this.isReady) {
            return "Model is still loading, please wait...";
        }

        try {
            const result = await this.model(input, {
                max_new_tokens: 30,
                temperature: 0.8,
                do_sample: true,
                top_k: 50
            });

            return result[0].generated_text.substring(input.length).trim();
        } catch (error) {
            console.error('Error generating response:', error);
            return "I'm having trouble generating a response right now.";
        }
    }
}
