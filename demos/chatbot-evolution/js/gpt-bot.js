/**
 * GPT-style Bot (2020s) - Modern LLM via Transformers.js v3
 * 
 * Model hierarchy:
 * 1. Qwen2.5-0.5B-Instruct - Alibaba's efficient instruction model (2024)
 * 2. SmolLM-360M-Instruct - HuggingFace's browser-optimized model (2024)
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
                name: 'onnx-community/Qwen2.5-0.5B-Instruct',
                displayName: 'Qwen 2.5 0.5B',
                dtype: 'q4',
                params: '0.5B',
                year: 2024,
                org: 'Alibaba'
            },
            {
                name: 'onnx-community/SmolLM-360M-Instruct',
                displayName: 'SmolLM 360M',
                dtype: 'q4',
                params: '360M',
                year: 2024,
                org: 'HuggingFace'
            }
        ];
        
        this.systemPrompt = 'You are a friendly AI chatbot in an educational demo about the evolution of conversational AI. Have natural, engaging conversations. Be concise and helpful.';

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
            console.log('[GPT] Importing @huggingface/transformers@3...');
            
            const transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');
            const { pipeline, env } = transformers;
            
            console.log('[GPT] Import successful, pipeline function available:', typeof pipeline);
            
            // Configure environment for browser
            env.allowLocalModels = false;
            env.useBrowserCache = true;
            
            // Check WebGPU availability
            let device = 'wasm'; // Default to WASM
            try {
                if (navigator.gpu) {
                    const adapter = await navigator.gpu.requestAdapter();
                    if (adapter) {
                        device = 'webgpu';
                        console.log('[GPT] WebGPU available, using GPU acceleration');
                    }
                }
            } catch (e) {
                console.log('[GPT] WebGPU not available, using WASM backend');
            }
            
            console.log(`[GPT] Using device: ${device}`);

            for (let i = 0; i < this.models.length; i++) {
                this.loadAttempt = i + 1;
                const model = this.models[i];
                this.currentModel = model;

                try {
                    console.log(`[GPT] Attempting to load model ${i + 1}/${this.models.length}: ${model.name}`);
                    this.reportProgress(`Loading ${model.displayName} (${model.params})`);

                    this.generator = await pipeline('text-generation', model.name, {
                        dtype: model.dtype,
                        device: device,
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

                    console.log(`[GPT] Successfully loaded ${model.displayName}`);
                    this.isReady = true;
                    this.isLoading = false;
                    this.reportProgress(`${model.displayName} loaded successfully!`, 100);
                    return true;

                } catch (modelError) {
                    // Extract meaningful error info
                    const errorMsg = modelError?.message || String(modelError);
                    const errorName = modelError?.name || 'Unknown';
                    
                    console.error(`[GPT] Failed to load ${model.displayName}:`, errorMsg);
                    console.error('[GPT] Error type:', errorName);
                    console.error('[GPT] Full error object:', modelError);
                    
                    if (modelError?.stack) {
                        console.error('[GPT] Stack trace:', modelError.stack);
                    }
                    
                    // If WebGPU failed, try WASM for this model
                    if (device === 'webgpu') {
                        console.log(`[GPT] Retrying ${model.displayName} with WASM backend...`);
                        try {
                            this.generator = await pipeline('text-generation', model.name, {
                                dtype: model.dtype,
                                device: 'wasm',
                                progress_callback: (progress) => {
                                    if (progress.status === 'downloading' || progress.status === 'progress') {
                                        const pct = progress.progress || 0;
                                        this.reportProgress(`Downloading ${model.displayName} (WASM)`, pct);
                                    } else if (progress.status === 'ready' || progress.status === 'done') {
                                        this.reportProgress(`${model.displayName} ready`, 100);
                                    }
                                }
                            });
                            
                            console.log(`[GPT] Successfully loaded ${model.displayName} with WASM`);
                            this.isReady = true;
                            this.isLoading = false;
                            this.reportProgress(`${model.displayName} loaded (WASM)!`, 100);
                            return true;
                        } catch (wasmError) {
                            console.error(`[GPT] WASM fallback also failed:`, wasmError?.message || wasmError);
                        }
                    }
                    
                    if (i < this.models.length - 1) {
                        this.reportProgress(`${model.displayName} failed, trying next model...`);
                    }
                }
            }

            throw new Error('All models failed to load');

        } catch (error) {
            console.error('[GPT] Fatal error loading GPT model:', error);
            console.error('[GPT] Error details:', {
                name: error?.name,
                message: error?.message,
                stack: error?.stack
            });
            this.error = error?.message || String(error);
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
                { role: 'system', content: this.systemPrompt },
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
        
        if (model.name.includes('SmolLM')) {
            return {
                name: 'SmolLM 360M Instruct',
                type: 'Decoder-Only Transformer',
                parameters: '360 Million',
                layers: 32,
                hiddenSize: 960,
                attentionHeads: 15,
                contextLength: 2048,
                vocabulary: '~49K tokens',
                trainingData: 'Cosmopedia v2, FineWeb-Edu, Stack-Edu',
                year: 2024,
                organization: 'HuggingFace',
                keyFeatures: [
                    'Designed for browser/on-device use',
                    'Optimized for WASM execution',
                    'Fast inference with small memory footprint',
                    'Instruction-tuned for conversations',
                    'Open-source with Apache 2.0 license'
                ],
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA)',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'RoPE'
                }
            };
        } else if (model.name.includes('Qwen2.5-Coder')) {
            return {
                name: 'Qwen 2.5 Coder 0.5B Instruct',
                type: 'Decoder-Only Transformer',
                parameters: '0.5 Billion',
                layers: 24,
                hiddenSize: 896,
                attentionHeads: 14,
                contextLength: 32768,
                vocabulary: '~151K tokens',
                trainingData: 'Code and text data',
                year: 2024,
                organization: 'Alibaba',
                keyFeatures: [
                    'Optimized for coding tasks',
                    'Instruction-tuned for helpfulness',
                    'Efficient architecture for browser',
                    'Strong code generation',
                    'Open-source with Apache 2.0'
                ],
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA)',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'RoPE'
                }
            };
        } else {
            return {
                name: 'Qwen 2.5 0.5B Instruct',
                type: 'Decoder-Only Transformer',
                parameters: '0.5 Billion',
                layers: 24,
                hiddenSize: 896,
                attentionHeads: 14,
                contextLength: 32768,
                vocabulary: '~151K tokens',
                trainingData: 'Web documents, code, multilingual text',
                year: 2024,
                organization: 'Alibaba',
                keyFeatures: [
                    'Compact yet capable model',
                    'Instruction-tuned for chat',
                    'Runs efficiently in browser',
                    'Multilingual support',
                    'Open-source with Apache 2.0'
                ],
                architecture: {
                    type: 'decoder-only',
                    attention: 'Grouped-Query Attention (GQA)',
                    normalization: 'RMSNorm',
                    activation: 'SiLU',
                    positionEncoding: 'RoPE'
                }
            };
        }
    }
}
