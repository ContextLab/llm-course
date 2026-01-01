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
            // Using LaMini-GPT-124M - an instruction-tuned model better for chat than base DistilGPT2
            this.model = await pipeline('text-generation', 'Xenova/LaMini-GPT-124M');
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

        // Handle empty input
        if (!input || input.trim().length === 0) {
            return "Please say something!";
        }

        try {
            const result = await this.model(input, {
                max_new_tokens: 30,
                temperature: 0.8,
                do_sample: true,
                top_k: 50
            });

            const generatedText = result[0].generated_text;

            // Extract only the new text (remove the input prompt)
            let response = generatedText.substring(input.length).trim();

            // If response is empty or too short, return the full generation
            if (response.length < 3) {
                response = generatedText.trim();
            }

            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            return "I'm having trouble generating a response right now.";
        }
    }
}
