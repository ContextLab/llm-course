/**
 * GPT-style Bot (2020s) - Uses Qwen3-1.7B via Transformers.js
 * 
 * Model selection (data-driven):
 * - Qwen3-1.7B: MMLU 71.2, HumanEval 65.8%, outperforms Qwen2.5-3B
 * - Qwen3-0.6B fallback: MMLU 59.4, HumanEval 42.1%, fast/lightweight
 */

export class GPTBot {
    constructor() {
        this.generator = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;

        this.modelName = 'onnx-community/Qwen3-1.7B-ONNX';
        this.fallbackModelName = 'onnx-community/Qwen3-0.6B-ONNX';
        this.currentModel = this.modelName;
        this.useWebGPU = false;
    }

    setProgressCallback(callback) {
        this.onProgress = callback;
    }

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
            this.reportProgress('Importing Transformers.js v3');
            const transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1');
            const { pipeline, env } = transformers;

            const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
            
            if (hasWebGPU) {
                try {
                    const adapter = await navigator.gpu.requestAdapter();
                    this.useWebGPU = adapter !== null;
                } catch (e) {
                    this.useWebGPU = false;
                }
            }

            this.reportProgress(`Loading Qwen3-1.7B${this.useWebGPU ? ' (WebGPU)' : ''}`);
            this.currentModel = this.modelName;

            const pipelineOptions = {
                dtype: 'q4f16',
                progress_callback: (progress) => {
                    if (progress.status === 'downloading' || progress.status === 'progress') {
                        const pct = progress.progress || 0;
                        this.reportProgress(`Downloading model`, pct);
                    } else if (progress.status === 'loading' || progress.status === 'initiate') {
                        this.reportProgress('Loading into memory');
                    } else if (progress.status === 'ready' || progress.status === 'done') {
                        this.reportProgress('Model ready', 100);
                    }
                }
            };

            if (this.useWebGPU) {
                pipelineOptions.device = 'webgpu';
            }

            try {
                this.generator = await pipeline('text-generation', this.modelName, pipelineOptions);
                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('Qwen3-1.7B loaded!', 100);
                return true;
            } catch (primaryError) {
                console.warn('Primary model failed:', primaryError.message);
                this.reportProgress('Trying Qwen3-0.6B fallback');
                
                this.currentModel = this.fallbackModelName;
                pipelineOptions.dtype = 'q4';
                delete pipelineOptions.device;
                
                this.generator = await pipeline('text-generation', this.fallbackModelName, pipelineOptions);
                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('Qwen3-0.6B loaded!', 100);
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
        const is17B = this.currentModel.includes('1.7B');
        return {
            name: this.currentModel,
            type: 'Decoder-Only Transformer',
            parameters: is17B ? '1.7B' : '0.6B',
            year: '2025',
            isReady: this.isReady,
            isLoading: this.isLoading,
            useWebGPU: this.useWebGPU
        };
    }

    getArchitectureInfo() {
        const is17B = this.currentModel.includes('1.7B');
        return {
            name: is17B ? 'Qwen3-1.7B' : 'Qwen3-0.6B',
            type: 'Decoder-Only Transformer',
            parameters: is17B ? '1.7 Billion' : '0.6 Billion',
            layers: is17B ? 28 : 28,
            hiddenSize: is17B ? 2048 : 1024,
            attentionHeads: is17B ? 16 : 16,
            contextLength: is17B ? 65536 : 32768,
            vocabulary: '~151936 tokens',
            trainingData: '36T tokens (web, books, code, math, multilingual)',
            year: 2025,
            organization: 'Alibaba Qwen Team',
            benchmarks: is17B ? {
                MMLU: 71.2,
                HumanEval: '65.8%',
                GSM8K: 82.3
            } : {
                MMLU: 59.4,
                HumanEval: '42.1%',
                GSM8K: 68.5
            },
            keyFeatures: [
                'Hybrid thinking/non-thinking modes',
                'GQA attention for efficiency',
                'RoPE position embeddings',
                'Multilingual (100+ languages)',
                'Strong reasoning capabilities'
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
