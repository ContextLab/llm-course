/**
 * GPT-style Bot (2020s)
 * Uses Transformers.js for generation with SmolLM-135M-Instruct
 *
 * Model selection rationale:
 * - SmolLM3-3B: Too large for browser (~6GB+ model size)
 * - SmolLM-360M: Workable but slow (~700MB)
 * - SmolLM-135M-Instruct: Optimal for browser (~270MB quantized), instruction-tuned
 * - LaMini-GPT-124M: Fallback option if SmolLM fails
 */

export class GPTBot {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;

        // Primary model: SmolLM-135M-Instruct (HuggingFace's optimized small LLM)
        // Uses the official ONNX version with quantization for browser deployment
        this.modelName = 'HuggingFaceTB/SmolLM-135M-Instruct';
        this.fallbackModelName = 'Xenova/LaMini-GPT-124M';
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

            // Try SmolLM-135M-Instruct first
            this.reportProgress('Loading SmolLM-135M-Instruct');
            this.currentModel = this.modelName;

            try {
                this.model = await pipeline('text-generation', this.modelName, {
                    // Use quantized version for faster loading and smaller size
                    quantized: true,
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading SmolLM model files`, pct);
                        } else if (progress.status === 'loading') {
                            this.reportProgress('Loading model into memory');
                        } else if (progress.status === 'ready') {
                            this.reportProgress('Model ready', 100);
                        }
                    }
                });

                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('SmolLM-135M-Instruct loaded successfully!', 100);
                return true;
            } catch (smolError) {
                console.warn('SmolLM failed, trying LaMini fallback:', smolError.message);
                this.reportProgress('SmolLM unavailable, trying LaMini-GPT fallback');

                // Fallback to LaMini-GPT-124M
                this.currentModel = this.fallbackModelName;
                this.model = await pipeline('text-generation', this.fallbackModelName, {
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading LaMini model`, pct);
                        }
                    }
                });

                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('LaMini-GPT loaded successfully!', 100);
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

        // Handle empty input
        if (!input || input.trim().length === 0) {
            return "Please say something!";
        }

        try {
            let prompt;
            let result;

            // Format prompt based on model type
            if (this.currentModel.includes('SmolLM')) {
                // SmolLM uses a chat template format
                prompt = `<|im_start|>user\n${input.trim()}<|im_end|>\n<|im_start|>assistant\n`;

                result = await this.model(prompt, {
                    max_new_tokens: 50,
                    temperature: 0.7,
                    do_sample: true,
                    top_k: 40,
                    top_p: 0.9,
                    repetition_penalty: 1.1
                });
            } else {
                // LaMini uses simple instruction format
                prompt = `Question: ${input.trim()}\nAnswer:`;

                result = await this.model(prompt, {
                    max_new_tokens: 40,
                    temperature: 0.8,
                    do_sample: true,
                    top_k: 50
                });
            }

            const generatedText = result[0].generated_text;

            // Extract only the new text (remove the input prompt)
            let response = generatedText.substring(prompt.length).trim();

            // Clean up SmolLM's end tokens if present
            if (this.currentModel.includes('SmolLM')) {
                response = response.replace(/<\|im_end\|>/g, '').trim();
                response = response.replace(/<\|im_start\|>.*/s, '').trim();
            }

            // If response is empty or too short, provide a fallback
            if (response.length < 3) {
                const fallbacks = [
                    "I understand. Tell me more.",
                    "That's interesting.",
                    "I see what you mean.",
                    "Could you elaborate on that?",
                    "Interesting thought."
                ];
                response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
        } catch (error) {
            console.error('Error generating response:', error);
            return "I'm having trouble generating a response right now.";
        }
    }

    getModelInfo() {
        return {
            name: this.currentModel,
            type: 'Decoder-Only Transformer',
            isSmolLM: this.currentModel.includes('SmolLM'),
            parameters: this.currentModel.includes('SmolLM') ? '135M' : '124M',
            year: this.currentModel.includes('SmolLM') ? '2024' : '2023',
            isReady: this.isReady,
            isLoading: this.isLoading
        };
    }

    /**
     * Get detailed architecture information for educational display
     */
    getArchitectureInfo() {
        if (this.currentModel.includes('SmolLM')) {
            return {
                name: 'SmolLM-135M-Instruct',
                type: 'Decoder-Only Transformer (LLaMA-style)',
                parameters: '135 Million',
                layers: 9,
                hiddenSize: 576,
                attentionHeads: 9,
                contextLength: 2048,
                vocabulary: '~49152 tokens',
                trainingData: 'SmolLM-Corpus (curated web text, code, math)',
                year: 2024,
                organization: 'Hugging Face',
                keyFeatures: [
                    'Decoder-only architecture (no encoder)',
                    'Causal/masked self-attention',
                    'Instruction-tuned for chat and Q&A',
                    'Optimized for edge deployment',
                    'RoPE positional embeddings',
                    'Grouped-query attention'
                ],
                whyThisModel: `SmolLM-135M was chosen over larger models because:
                    - SmolLM3-3B (3 billion params) would require ~6GB download, too large for browser
                    - SmolLM-360M works but is slower and larger (~700MB)
                    - SmolLM-135M provides good quality at ~270MB (quantized), suitable for browser deployment
                    - It's instruction-tuned, making it better for conversational use than base models`,
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA)',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'Rotary Position Embeddings (RoPE)'
                }
            };
        } else {
            return {
                name: 'LaMini-GPT-124M',
                type: 'Decoder-Only Transformer (GPT-2 style)',
                parameters: '124 Million',
                layers: 12,
                hiddenSize: 768,
                attentionHeads: 12,
                contextLength: 1024,
                vocabulary: '~50257 tokens (GPT-2 tokenizer)',
                trainingData: 'LaMini-instruction dataset (2.58M instruction-response pairs)',
                year: 2023,
                organization: 'MBZUAI',
                keyFeatures: [
                    'Based on GPT-2 architecture',
                    'Instruction-tuned for following prompts',
                    'Distilled from larger models',
                    'Compact size for deployment'
                ],
                whyFallback: 'LaMini-GPT is used as a fallback when SmolLM is unavailable. It has similar capabilities but uses an older GPT-2 architecture.'
            };
        }
    }
}
