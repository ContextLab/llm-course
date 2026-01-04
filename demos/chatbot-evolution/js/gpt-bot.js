/**
 * GPT-style Bot (2020s) - Modern LLM via Transformers.js v3
 * 
 * Model hierarchy:
 * 1. DeepSeek-R1-Distill-Qwen-1.5B - Advanced reasoning model (2025)
 * 2. Gemma 3 1B IT - Google's efficient instruction model (2025)
 * 3. Gemma 3 270M IT - Lightweight fallback (2025)
 */

export class GPTBot {
    constructor() {
        this.generator = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;
        this.loadAttempt = 0;

        this.models = [
            {
                name: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',
                displayName: 'DeepSeek-R1 1.5B',
                dtype: 'q4',
                params: '1.5B',
                year: 2025,
                org: 'DeepSeek'
            },
            {
                name: 'onnx-community/gemma-3-1b-it-ONNX',
                displayName: 'Gemma 3 1B',
                dtype: 'q4',
                params: '1B',
                year: 2025,
                org: 'Google'
            },
            {
                name: 'onnx-community/gemma-3-270m-it-ONNX',
                displayName: 'Gemma 3 270M',
                dtype: 'q4',
                params: '270M',
                year: 2025,
                org: 'Google'
            }
        ];

        this.currentModel = null;
    }

    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    reportProgress(stage, progress = null) {
        if (this.onProgress) {
            this.onProgress({ 
                stage, 
                progress, 
                model: this.currentModel?.displayName || 'Loading...',
                attempt: this.loadAttempt
            });
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
            this.reportProgress('Importing Transformers.js v3');
            const transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');
            const { pipeline } = transformers;

            for (let i = 0; i < this.models.length; i++) {
                this.loadAttempt = i + 1;
                const model = this.models[i];
                this.currentModel = model;

                try {
                    this.reportProgress(`Loading ${model.displayName} (${model.params})`);

                    this.generator = await pipeline('text-generation', model.name, {
                        dtype: model.dtype,
                        progress_callback: (progress) => {
                            if (progress.status === 'downloading' || progress.status === 'progress') {
                                const pct = progress.progress || 0;
                                this.reportProgress(`Downloading ${model.displayName}`, pct);
                            } else if (progress.status === 'loading' || progress.status === 'initiate') {
                                this.reportProgress(`Loading ${model.displayName} into memory`);
                            } else if (progress.status === 'ready' || progress.status === 'done') {
                                this.reportProgress(`${model.displayName} ready`, 100);
                            }
                        }
                    });

                    this.isReady = true;
                    this.isLoading = false;
                    this.reportProgress(`${model.displayName} loaded successfully!`, 100);
                    return true;

                } catch (modelError) {
                    console.warn(`Failed to load ${model.displayName}:`, modelError.message);
                    
                    if (i < this.models.length - 1) {
                        this.reportProgress(`${model.displayName} failed, trying next model...`);
                    }
                }
            }

            throw new Error('All models failed to load');

        } catch (error) {
            console.error('Error loading GPT model:', error);
            this.error = error.message;
            this.isLoading = false;
            this.reportProgress('Failed to load any model');
            return false;
        }
    }

    async getResponse(input) {
        if (!this.isReady) {
            if (this.isLoading) {
                return "Model is still loading... Please wait.";
            }
            if (this.error) {
                return `Model loading failed: ${this.error}. Please refresh.`;
            }
            return "Model not initialized.";
        }

        if (!input || input.trim().length === 0) {
            return "Please say something!";
        }

        try {
            const messages = [
                { role: 'user', content: input.trim() }
            ];

            const result = await this.generator(messages, {
                max_new_tokens: 150,
                temperature: 0.7,
                do_sample: true,
                top_k: 40,
                top_p: 0.9,
                repetition_penalty: 1.1
            });

            let response = '';
            if (result && result[0] && result[0].generated_text) {
                const generated = result[0].generated_text;
                if (Array.isArray(generated)) {
                    const lastMessage = generated[generated.length - 1];
                    response = lastMessage?.content || '';
                } else {
                    response = generated;
                }
            }

            return this.cleanResponse(response);
        } catch (error) {
            console.error('Error generating response:', error);
            return "I'm having trouble generating a response.";
        }
    }

    cleanResponse(response) {
        if (!response || response.length < 3) {
            const fallbacks = [
                "I understand. Tell me more.",
                "That's interesting.",
                "Could you elaborate?",
                "I see what you mean."
            ];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        let cleaned = response
            .replace(/<\|.*?\|>/g, '')
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .trim();

        if (cleaned.length > 300) {
            const lastPunct = Math.max(
                cleaned.lastIndexOf('.'),
                cleaned.lastIndexOf('!'),
                cleaned.lastIndexOf('?')
            );
            if (lastPunct > 50) {
                cleaned = cleaned.substring(0, lastPunct + 1);
            } else {
                cleaned = cleaned.substring(0, 300) + '...';
            }
        }

        return cleaned || response;
    }

    getModelInfo() {
        const model = this.currentModel || this.models[0];
        return {
            name: model.name,
            displayName: model.displayName,
            type: 'Decoder-Only Transformer',
            parameters: model.params,
            year: String(model.year),
            isReady: this.isReady,
            isLoading: this.isLoading
        };
    }

    getArchitectureInfo() {
        const model = this.currentModel || this.models[0];
        
        if (model.name.includes('DeepSeek')) {
            return {
                name: 'DeepSeek-R1-Distill-Qwen-1.5B',
                type: 'Decoder-Only Transformer',
                parameters: '1.5 Billion',
                layers: 28,
                hiddenSize: 1536,
                attentionHeads: 12,
                contextLength: 131072,
                vocabulary: '~151K tokens',
                trainingData: 'Distilled from DeepSeek-R1 reasoning model',
                year: 2025,
                organization: 'DeepSeek',
                benchmarks: {
                    AIME2024: '28.9%',
                    MATH500: '83.9%',
                    LiveCodeBench: '16.9%'
                },
                keyFeatures: [
                    'Distilled from DeepSeek-R1 reasoning model',
                    'Chain-of-thought reasoning capabilities',
                    'Efficient Qwen architecture base',
                    'Strong math and coding performance',
                    'Open-source with MIT license'
                ],
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA)',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'RoPE'
                }
            };
        } else if (model.name.includes('gemma-3-1b')) {
            return {
                name: 'Gemma 3 1B IT',
                type: 'Decoder-Only Transformer',
                parameters: '1 Billion',
                layers: 26,
                hiddenSize: 1152,
                attentionHeads: 8,
                contextLength: 32768,
                vocabulary: '~262K tokens',
                trainingData: 'Web documents, code, mathematics',
                year: 2025,
                organization: 'Google',
                keyFeatures: [
                    'Instruction-tuned for helpfulness',
                    'Efficient sliding window attention',
                    'Multilingual support',
                    'Strong reasoning for size',
                    'Open weights under Gemma license'
                ],
                architecture: {
                    type: 'decoder-only',
                    attention: 'Sliding Window + Global Attention',
                    normalization: 'RMSNorm',
                    activation: 'GeGLU',
                    positionEncoding: 'RoPE'
                }
            };
        } else {
            return {
                name: 'Gemma 3 270M IT',
                type: 'Decoder-Only Transformer',
                parameters: '270 Million',
                layers: 18,
                hiddenSize: 768,
                attentionHeads: 8,
                contextLength: 8192,
                vocabulary: '~262K tokens',
                trainingData: 'Web documents, code, mathematics',
                year: 2025,
                organization: 'Google',
                keyFeatures: [
                    'Ultra-lightweight for edge deployment',
                    'Instruction-tuned',
                    'Fast inference',
                    'Good quality for size'
                ],
                architecture: {
                    type: 'decoder-only',
                    attention: 'Multi-Head Attention',
                    normalization: 'RMSNorm',
                    activation: 'GeGLU',
                    positionEncoding: 'RoPE'
                }
            };
        }
    }
}
