export class GPTBot {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;

        this.modelName = 'Xenova/LaMini-Flan-T5-248M';
        this.fallbackModelName = 'Xenova/distilgpt2';
        this.currentModel = this.modelName;
    }

    /**
     * Set a progress callback for loading updates
     * @param {function} callback - Function that receives progress updates
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * Report loading progress
     * @param {string} stage - Current loading stage
     * @param {number} progress - Progress percentage (0-100)
     */
    reportProgress(stage, progress = null) {
        if (this.onProgress) {
            this.onProgress({ stage, progress, model: this.currentModel });
        }
        if (progress !== null) {
            console.log(`[GPT] ${stage}: ${progress.toFixed(1)}%`);
        } else {
            console.log(`[GPT] ${stage}`);
        }
    }

    async loadModel() {
        if (this.isLoading || this.isReady) {
            return this.isReady;
        }

        this.isLoading = true;
        this.error = null;

        try {
            this.reportProgress('Importing Transformers.js library');
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');

            this.reportProgress('Loading LaMini-Flan-T5 (248M)');
            this.currentModel = this.modelName;

            try {
                this.model = await pipeline('text2text-generation', this.modelName, {
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading model files`, pct);
                        } else if (progress.status === 'loading') {
                            this.reportProgress('Loading model into memory');
                        } else if (progress.status === 'ready') {
                            this.reportProgress('Model ready', 100);
                        }
                    }
                });

                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('LaMini-Flan-T5 loaded successfully!', 100);
                return true;
            } catch (primaryError) {
                console.warn('Primary model failed:', primaryError.message);
                this.reportProgress('Primary model unavailable, trying fallback');

                this.currentModel = this.fallbackModelName;
                this.model = await pipeline('text-generation', this.fallbackModelName, {
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading fallback model`, pct);
                        }
                    }
                });

                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('DistilGPT2 loaded successfully!', 100);
                return true;
            }
        } catch (error) {
            console.error('Error loading GPT model:', error);
            this.error = error.message;
            this.isLoading = false;
            this.reportProgress('Failed to load model');
            return false;
        }
    }

    async getResponse(input) {
        if (!this.isReady) {
            if (this.isLoading) {
                return "Model is still loading... Please wait a moment.";
            }
            if (this.error) {
                return `Model loading failed: ${this.error}. Please refresh to try again.`;
            }
            return "Model not initialized. Please wait...";
        }

        if (!input || input.trim().length === 0) {
            return "Please say something!";
        }

        try {
            let result;

            if (this.currentModel.includes('LaMini')) {
                result = await this.model(input.trim(), {
                    max_new_tokens: 100,
                    temperature: 0.7,
                    do_sample: true,
                    top_k: 50,
                    top_p: 0.9,
                    repetition_penalty: 1.2
                });
                return this.cleanResponse(result[0].generated_text);
            } else {
                const prompt = `User: ${input.trim()}\nAssistant:`;
                result = await this.model(prompt, {
                    max_new_tokens: 60,
                    temperature: 0.8,
                    do_sample: true,
                    top_k: 50
                });
                let response = result[0].generated_text.substring(prompt.length).trim();
                return this.cleanResponse(response);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            return "I'm having trouble generating a response right now.";
        }
    }

    cleanResponse(response) {
        // Handle empty or too short responses
        if (!response || response.length < 3) {
            const fallbacks = [
                "I understand. Tell me more.",
                "That's interesting.",
                "I see what you mean.",
                "Could you elaborate on that?",
                "Interesting thought."
            ];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        // Truncate if too long
        if (response.length > 200) {
            const lastPunct = Math.max(
                response.lastIndexOf('.'),
                response.lastIndexOf('!'),
                response.lastIndexOf('?')
            );
            if (lastPunct > 50) {
                response = response.substring(0, lastPunct + 1);
            } else {
                response = response.substring(0, 200) + '...';
            }
        }

        return response;
    }

    getModelInfo() {
        const isLaMini = this.currentModel.includes('LaMini');
        const parameters = isLaMini ? '248M' : '82M';

        return {
            name: this.currentModel,
            type: isLaMini ? 'Encoder-Decoder (T5)' : 'Decoder-Only (GPT-2)',
            isLaMini: isLaMini,
            parameters: parameters,
            year: '2023',
            isReady: this.isReady,
            isLoading: this.isLoading
        };
    }

    getArchitectureInfo() {
        if (this.currentModel.includes('LaMini')) {
            return {
                name: 'LaMini-Flan-T5-248M',
                type: 'Encoder-Decoder Transformer (T5)',
                parameters: '248 Million',
                layers: 12,
                hiddenSize: 768,
                attentionHeads: 12,
                vocabulary: '~32000 tokens',
                trainingData: 'Distilled from larger LLMs on instruction data',
                year: 2023,
                organization: 'MBZUAI',
                keyFeatures: [
                    'T5-based encoder-decoder architecture',
                    'Instruction-tuned for Q&A and chat',
                    'Distilled knowledge from larger models',
                    'Efficient for browser deployment',
                    'Good general knowledge'
                ],
                architecture: {
                    type: 'encoder-decoder',
                    attention: 'Multi-Head Self-Attention',
                    normalization: 'Layer Normalization',
                    activation: 'GELU',
                    positionEncoding: 'Relative Position Bias'
                }
            };
        } else {
            return {
                name: 'DistilGPT2',
                type: 'Decoder-Only Transformer (GPT-2)',
                parameters: '82 Million',
                layers: 6,
                hiddenSize: 768,
                attentionHeads: 12,
                vocabulary: '~50257 tokens',
                trainingData: 'Distilled from GPT-2',
                year: 2019,
                organization: 'Hugging Face',
                keyFeatures: [
                    'Decoder-only autoregressive',
                    'Distilled from GPT-2',
                    'Fast inference',
                    'Compact size'
                ],
                architecture: {
                    type: 'decoder-only',
                    attention: 'Causal Self-Attention',
                    normalization: 'Layer Normalization',
                    activation: 'GELU',
                    positionEncoding: 'Learned Position Embeddings'
                }
            };
        }
    }
}
