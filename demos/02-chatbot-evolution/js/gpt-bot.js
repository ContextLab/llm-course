/**
 * GPT-style Bot (2020s)
 * Uses Transformers.js for generation with SmolLM3-3B
 *
 * Model selection rationale:
 * - SmolLM3-3B-ONNX: High-quality 3B model with q4f16 quantization (~1.5-2GB)
 *   Requires WebGPU-capable browser for reasonable performance
 * - SmolLM-135M-Instruct: Fallback for devices without WebGPU (~270MB)
 * - LaMini-GPT-124M: Legacy fallback if both fail
 */

export class GPTBot {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;

        // Primary model: SmolLM3-3B with q4f16 quantization + WebGPU
        // Falls back to SmolLM-135M if WebGPU unavailable
        this.modelName = 'HuggingFaceTB/SmolLM3-3B-ONNX';
        this.fallbackModelName = 'HuggingFaceTB/SmolLM-135M-Instruct';
        this.legacyFallbackName = 'Xenova/LaMini-GPT-124M';
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
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1');

            // Check WebGPU support for SmolLM3-3B
            const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

            if (hasWebGPU) {
                // Try SmolLM3-3B with WebGPU (highest quality)
                this.reportProgress('Loading SmolLM3-3B (WebGPU accelerated)');
                this.currentModel = this.modelName;

                try {
                    this.model = await pipeline('text-generation', this.modelName, {
                        dtype: 'q4f16',
                        device: 'webgpu',
                        progress_callback: (progress) => {
                            if (progress.status === 'downloading') {
                                const pct = progress.progress || 0;
                                this.reportProgress(`Downloading SmolLM3-3B model`, pct);
                            } else if (progress.status === 'loading') {
                                this.reportProgress('Loading model into GPU memory');
                            } else if (progress.status === 'ready') {
                                this.reportProgress('Model ready', 100);
                            }
                        }
                    });

                    this.isReady = true;
                    this.isLoading = false;
                    this.reportProgress('SmolLM3-3B loaded successfully!', 100);
                    return true;
                } catch (smol3Error) {
                    console.warn('SmolLM3-3B failed:', smol3Error.message);
                    this.reportProgress('SmolLM3-3B unavailable, trying SmolLM-135M');
                }
            } else {
                this.reportProgress('WebGPU not available, using SmolLM-135M');
            }

            // Fallback to SmolLM-135M-Instruct (works without WebGPU)
            this.currentModel = this.fallbackModelName;
            try {
                this.model = await pipeline('text-generation', this.fallbackModelName, {
                    quantized: true,
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading SmolLM-135M model`, pct);
                        } else if (progress.status === 'loading') {
                            this.reportProgress('Loading model into memory');
                        } else if (progress.status === 'ready') {
                            this.reportProgress('Model ready', 100);
                        }
                    }
                });

                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('SmolLM-135M loaded successfully!', 100);
                return true;
            } catch (smolError) {
                console.warn('SmolLM-135M failed, trying LaMini fallback:', smolError.message);
                this.reportProgress('SmolLM unavailable, trying LaMini-GPT fallback');

                // Legacy fallback to LaMini-GPT-124M
                this.currentModel = this.legacyFallbackName;
                this.model = await pipeline('text-generation', this.legacyFallbackName, {
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
            if (this.currentModel.includes('SmolLM3')) {
                // SmolLM3 uses chat messages format
                const messages = [
                    { role: 'user', content: input.trim() }
                ];

                result = await this.model(messages, {
                    max_new_tokens: 100,
                    temperature: 0.7,
                    do_sample: true,
                    top_k: 40,
                    top_p: 0.9,
                    repetition_penalty: 1.1
                });

                // SmolLM3 with messages format returns the response directly
                let response = result[0].generated_text.at(-1).content || '';
                return this.cleanResponse(response);

            } else if (this.currentModel.includes('SmolLM')) {
                // SmolLM-135M uses a chat template format
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

            return this.cleanResponse(response);
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
        const isSmolLM3 = this.currentModel.includes('SmolLM3');
        const isSmolLM = this.currentModel.includes('SmolLM');

        return {
            name: this.currentModel,
            type: 'Decoder-Only Transformer',
            isSmolLM3: isSmolLM3,
            isSmolLM: isSmolLM,
            parameters: isSmolLM3 ? '3B' : (isSmolLM ? '135M' : '124M'),
            year: isSmolLM3 ? '2025' : (isSmolLM ? '2024' : '2023'),
            isReady: this.isReady,
            isLoading: this.isLoading
        };
    }

    /**
     * Get detailed architecture information for educational display
     */
    getArchitectureInfo() {
        if (this.currentModel.includes('SmolLM3')) {
            return {
                name: 'SmolLM3-3B',
                type: 'Decoder-Only Transformer (LLaMA-style)',
                parameters: '3 Billion',
                layers: 28,
                hiddenSize: 2560,
                attentionHeads: 20,
                contextLength: 8192,
                vocabulary: '~128000 tokens',
                trainingData: '11.2T tokens (web, code, math, reasoning)',
                year: 2025,
                organization: 'Hugging Face',
                keyFeatures: [
                    'Decoder-only architecture with GQA',
                    'No RoPE (NoPE) positional encoding',
                    'Long context support (up to 128k)',
                    'Dual-mode reasoning capability',
                    'Multilingual (6 languages)',
                    'WebGPU accelerated in browser'
                ],
                whyThisModel: `SmolLM3-3B provides high-quality responses with WebGPU acceleration:
                    - Uses q4f16 quantization (~1.5-2GB download)
                    - Requires WebGPU-capable browser for best performance
                    - Falls back to SmolLM-135M if WebGPU unavailable`,
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA) 3:1 ratio',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'NoPE (No Positional Embedding)'
                }
            };
        } else if (this.currentModel.includes('SmolLM')) {
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
                whyThisModel: `SmolLM-135M is the fallback when WebGPU is unavailable:
                    - Compact size (~270MB quantized)
                    - Works on all browsers without GPU
                    - Instruction-tuned for conversational use`,
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
