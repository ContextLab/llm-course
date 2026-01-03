/**
 * GPT-style Bot (2020s)
 * Uses Transformers.js for generation with Qwen2.5-1.5B-Instruct
 *
 * Model selection rationale:
 * - Qwen2.5-1.5B-Instruct: High-quality 1.5B instruction-tuned model from Alibaba
 *   Uses q4f16 quantization (~900MB) with WebGPU acceleration
 * - Qwen2.5-0.5B-Instruct: Fallback for devices without WebGPU (~300MB)
 * - SmolLM-135M-Instruct: Legacy fallback if Qwen fails
 */

export class GPTBot {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;

        // Primary model: Qwen2.5-1.5B-Instruct with q4f16 quantization + WebGPU
        // Falls back to Qwen2.5-0.5B if WebGPU unavailable
        this.modelName = 'onnx-community/Qwen2.5-1.5B-Instruct';
        this.fallbackModelName = 'onnx-community/Qwen2.5-0.5B-Instruct';
        this.legacyFallbackName = 'HuggingFaceTB/SmolLM-135M-Instruct';
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

            // Check WebGPU support for Qwen2.5-1.5B
            const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

            if (hasWebGPU) {
                // Try Qwen2.5-1.5B with WebGPU (highest quality)
                this.reportProgress('Loading Qwen2.5-1.5B (WebGPU accelerated)');
                this.currentModel = this.modelName;

                try {
                    this.model = await pipeline('text-generation', this.modelName, {
                        dtype: 'q4f16',
                        device: 'webgpu',
                        progress_callback: (progress) => {
                            if (progress.status === 'downloading') {
                                const pct = progress.progress || 0;
                                this.reportProgress(`Downloading Qwen2.5-1.5B model`, pct);
                            } else if (progress.status === 'loading') {
                                this.reportProgress('Loading model into GPU memory');
                            } else if (progress.status === 'ready') {
                                this.reportProgress('Model ready', 100);
                            }
                        }
                    });

                    this.isReady = true;
                    this.isLoading = false;
                    this.reportProgress('Qwen2.5-1.5B loaded successfully!', 100);
                    return true;
                } catch (qwenError) {
                    console.warn('Qwen2.5-1.5B failed:', qwenError.message);
                    this.reportProgress('Qwen2.5-1.5B unavailable, trying Qwen2.5-0.5B');
                }
            } else {
                this.reportProgress('WebGPU not available, using Qwen2.5-0.5B');
            }

            // Fallback to Qwen2.5-0.5B-Instruct (works without WebGPU)
            this.currentModel = this.fallbackModelName;
            try {
                this.model = await pipeline('text-generation', this.fallbackModelName, {
                    dtype: 'q4',
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading Qwen2.5-0.5B model`, pct);
                        } else if (progress.status === 'loading') {
                            this.reportProgress('Loading model into memory');
                        } else if (progress.status === 'ready') {
                            this.reportProgress('Model ready', 100);
                        }
                    }
                });

                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('Qwen2.5-0.5B loaded successfully!', 100);
                return true;
            } catch (qwenSmallError) {
                console.warn('Qwen2.5-0.5B failed, trying SmolLM fallback:', qwenSmallError.message);
                this.reportProgress('Qwen unavailable, trying SmolLM-135M fallback');

                // Legacy fallback to SmolLM-135M-Instruct
                this.currentModel = this.legacyFallbackName;
                this.model = await pipeline('text-generation', this.legacyFallbackName, {
                    quantized: true,
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading SmolLM-135M model`, pct);
                        }
                    }
                });

                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('SmolLM-135M loaded successfully!', 100);
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
            if (this.currentModel.includes('Qwen2.5')) {
                // Qwen2.5 uses chat messages format with Transformers.js
                const messages = [
                    { role: 'user', content: input.trim() }
                ];

                result = await this.model(messages, {
                    max_new_tokens: 150,
                    temperature: 0.7,
                    do_sample: true,
                    top_k: 40,
                    top_p: 0.9,
                    repetition_penalty: 1.1
                });

                // Qwen2.5 with messages format returns the response in the last message
                let response = result[0].generated_text.at(-1).content || '';
                return this.cleanResponse(response);

            } else if (this.currentModel.includes('SmolLM')) {
                // SmolLM-135M uses a chat template format (ChatML)
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
                // Generic fallback uses simple instruction format
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

            // Clean up ChatML end tokens if present
            if (this.currentModel.includes('SmolLM') || this.currentModel.includes('Qwen')) {
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
        const isQwen15B = this.currentModel.includes('Qwen2.5-1.5B');
        const isQwen05B = this.currentModel.includes('Qwen2.5-0.5B');
        const isQwen = this.currentModel.includes('Qwen');
        const isSmolLM = this.currentModel.includes('SmolLM');

        let parameters = '135M';
        if (isQwen15B) parameters = '1.5B';
        else if (isQwen05B) parameters = '0.5B';
        else if (isSmolLM) parameters = '135M';

        return {
            name: this.currentModel,
            type: 'Decoder-Only Transformer',
            isQwen: isQwen,
            isQwen15B: isQwen15B,
            isSmolLM: isSmolLM,
            parameters: parameters,
            year: isQwen ? '2024' : '2024',
            isReady: this.isReady,
            isLoading: this.isLoading
        };
    }

    /**
     * Get detailed architecture information for educational display
     */
    getArchitectureInfo() {
        if (this.currentModel.includes('Qwen2.5-1.5B')) {
            return {
                name: 'Qwen2.5-1.5B-Instruct',
                type: 'Decoder-Only Transformer (LLaMA-style)',
                parameters: '1.5 Billion',
                layers: 28,
                hiddenSize: 1536,
                attentionHeads: 12,
                kvHeads: 2,
                contextLength: 32768,
                vocabulary: '~151936 tokens',
                trainingData: '18T tokens (web, books, code, math, multilingual)',
                year: 2024,
                organization: 'Alibaba Qwen Team',
                keyFeatures: [
                    'Decoder-only architecture with GQA',
                    'RoPE positional embeddings',
                    'Instruction-tuned for chat and Q&A',
                    'Strong multilingual support (29+ languages)',
                    'Excellent coding and math capabilities',
                    'WebGPU accelerated in browser'
                ],
                whyThisModel: `Qwen2.5-1.5B provides excellent quality for its size:
                    - Uses q4f16 quantization (~900MB download)
                    - Best-in-class for 1-2B parameter models
                    - Strong instruction following and reasoning`,
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA) 6:1 ratio',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'Rotary Position Embeddings (RoPE)'
                }
            };
        } else if (this.currentModel.includes('Qwen2.5-0.5B')) {
            return {
                name: 'Qwen2.5-0.5B-Instruct',
                type: 'Decoder-Only Transformer (LLaMA-style)',
                parameters: '0.5 Billion',
                layers: 24,
                hiddenSize: 896,
                attentionHeads: 14,
                kvHeads: 2,
                contextLength: 32768,
                vocabulary: '~151936 tokens',
                trainingData: '18T tokens (web, books, code, math, multilingual)',
                year: 2024,
                organization: 'Alibaba Qwen Team',
                keyFeatures: [
                    'Decoder-only architecture with GQA',
                    'RoPE positional embeddings',
                    'Compact size for edge deployment',
                    'Multilingual support',
                    'Good coding capabilities for size'
                ],
                whyThisModel: `Qwen2.5-0.5B is the fallback when WebGPU is unavailable:
                    - Compact size (~300MB quantized)
                    - Works on all browsers without GPU
                    - Reasonable quality for its small size`,
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA) 7:1 ratio',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'Rotary Position Embeddings (RoPE)'
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
                whyFallback: `SmolLM-135M is the legacy fallback:
                    - Ultra-compact size (~135MB)
                    - Works on all browsers
                    - Basic instruction following`,
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
                name: 'Unknown Model',
                type: 'Decoder-Only Transformer',
                parameters: 'Unknown',
                year: 2024,
                organization: 'Unknown',
                keyFeatures: ['Transformer-based architecture']
            };
        }
    }
}
