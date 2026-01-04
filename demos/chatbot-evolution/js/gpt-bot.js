/**
 * GPT-style Bot (2020s) - Modern LLM via Transformers.js v3
 * 
 * Model hierarchy (SmolLM2 family - HuggingFace's browser-optimized models):
 * 1. SmolLM2-135M-Instruct - Ultra-light, works on any device
 * 2. SmolLM2-360M-Instruct - Balanced quality/speed (default for 4GB RAM)
 * 3. SmolLM2-1.7B-Instruct - Best quality (requires 8GB+ RAM)
 * 
 * Auto-selects based on device RAM (navigator.deviceMemory)
 */

export class GPTBot {
    constructor() {
        this.generator = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;
        this.loadAttempt = 0;

        // SmolLM2 family - all have native Transformers.js support (ONNX bundled)
        this.models = [
            {
                name: 'HuggingFaceTB/SmolLM2-135M-Instruct',
                displayName: 'SmolLM2 135M',
                dtype: 'q4',
                params: '135M',
                sizeMB: 85,
                minRAM: 2,  // Works on 2GB+ devices
                year: 2024,
                org: 'HuggingFace'
            },
            {
                name: 'HuggingFaceTB/SmolLM2-360M-Instruct',
                displayName: 'SmolLM2 360M',
                dtype: 'q4',
                params: '360M',
                sizeMB: 210,
                minRAM: 4,  // Recommended for 4GB+ devices
                year: 2024,
                org: 'HuggingFace'
            },
            {
                name: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
                displayName: 'SmolLM2 1.7B',
                dtype: 'q4',
                params: '1.7B',
                sizeMB: 1410,
                minRAM: 8,
                year: 2024,
                org: 'HuggingFace'
            }
        ];
        
        this.systemPrompt = 'You are a helpful assistant.';
        
        this.conversationHistory = [];
        this.currentModel = null;
        this.selectedModelIndex = this.getDefaultModelIndex();
    }
    
    /**
     * Detect device RAM and select the largest model that fits
     * Uses 50% of available RAM as the threshold
     */
    getDefaultModelIndex() {
        const deviceRAM = navigator.deviceMemory || 4;
        
        // Cap at 360M (index 1) - 1.7B model exceeds browser WASM memory limits
        const maxSafeIndex = 1;
        
        for (let i = Math.min(maxSafeIndex, this.models.length - 1); i >= 0; i--) {
            if (deviceRAM >= this.models[i].minRAM) {
                console.log(`[GPT] Detected ${deviceRAM}GB RAM, auto-selecting ${this.models[i].displayName}`);
                return i;
            }
        }
        
        console.log(`[GPT] Low RAM (${deviceRAM}GB), using smallest model`);
        return 0;
    }
    
    getAvailableModels() {
        return this.models.map((m, i) => ({
            index: i,
            name: m.displayName,
            params: m.params,
            org: m.org,
            sizeMB: m.sizeMB,
            selected: i === this.selectedModelIndex
        }));
    }
    
    async selectModel(index) {
        if (index < 0 || index >= this.models.length) {
            return;
        }
        
        this.selectedModelIndex = index;
        
        if (this.generator) {
            console.log('[GPT] Disposing previous model before switching...');
            try {
                await this.generator.dispose();
            } catch (e) {
                console.warn('[GPT] Error disposing model:', e);
            }
            this.generator = null;
        }
        
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.conversationHistory = [];
    }
    
    clearHistory() {
        this.conversationHistory = [];
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

            // Try selected model first, then fall back to SMALLER models
            for (let i = this.selectedModelIndex; i >= 0; i--) {
                this.loadAttempt = this.selectedModelIndex - i + 1;
                const model = this.models[i];
                this.currentModel = model;

                try {
                    console.log(`[GPT] Attempting to load model: ${model.name}`);
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
                    this.selectedModelIndex = i;
                    this.reportProgress(`${model.displayName} loaded successfully!`, 100);
                    return true;

                } catch (modelError) {
                    const errorMsg = modelError?.message || String(modelError);
                    console.error(`[GPT] Failed to load ${model.displayName}:`, errorMsg);
                    
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
                            this.selectedModelIndex = i;
                            this.reportProgress(`${model.displayName} loaded (WASM)!`, 100);
                            return true;
                        } catch (wasmError) {
                            console.error(`[GPT] WASM fallback also failed:`, wasmError?.message || wasmError);
                        }
                    }
                    
                    if (i > 0) {
                        this.reportProgress(`${model.displayName} failed, trying smaller model...`);
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
            this.conversationHistory.push({ role: 'user', content: input.trim() });
            
            const maxHistoryLength = 6;
            const recentHistory = this.conversationHistory.slice(-maxHistoryLength);
            
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...recentHistory
            ];

            const result = await this.generator(messages, {
                max_new_tokens: 256,
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

            const cleanedResponse = this.cleanResponse(response);
            this.conversationHistory.push({ role: 'assistant', content: cleanedResponse });
            
            return cleanedResponse;
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

        if (cleaned.length > 500 && !cleaned.includes('```')) {
            const lastPunct = Math.max(
                cleaned.lastIndexOf('.'),
                cleaned.lastIndexOf('!'),
                cleaned.lastIndexOf('?')
            );
            if (lastPunct > 50) {
                cleaned = cleaned.substring(0, lastPunct + 1);
            } else {
                cleaned = cleaned.substring(0, 500) + '...';
            }
        }

        return cleaned || response;
    }
    
    formatResponseAsHTML(response) {
        let html = response;
        
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'plaintext';
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .trim();
            return `<pre class="code-block" data-language="${language}"><code>${escapedCode}</code></pre>`;
        });
        
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        html = html.replace(/\n/g, '<br>');
        
        return html;
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
        const model = this.currentModel || this.models[this.selectedModelIndex];
        
        const specs = {
            'SmolLM2-135M': { layers: 9, hiddenSize: 576, attentionHeads: 9 },
            'SmolLM2-360M': { layers: 16, hiddenSize: 960, attentionHeads: 15 },
            'SmolLM2-1.7B': { layers: 24, hiddenSize: 2048, attentionHeads: 32 }
        };
        
        const modelKey = model.name.includes('135M') ? 'SmolLM2-135M' :
                         model.name.includes('360M') ? 'SmolLM2-360M' : 'SmolLM2-1.7B';
        const spec = specs[modelKey];
        
        return {
            name: model.displayName,
            type: 'Decoder-Only Transformer',
            parameters: model.params,
            layers: spec.layers,
            hiddenSize: spec.hiddenSize,
            attentionHeads: spec.attentionHeads,
            contextLength: 8192,
            vocabulary: '~49K tokens',
            trainingData: 'FineWeb-Edu, DCLM, The Stack, synthetic data',
            year: 2024,
            organization: 'HuggingFace',
            keyFeatures: [
                'Optimized for browser/edge deployment',
                'Instruction-tuned for helpful conversations',
                'Auto-selects based on device RAM',
                'Runs via WebGPU or WASM fallback',
                'Open-source with Apache 2.0'
            ],
            architecture: {
                type: 'decoder-only',
                attention: 'Grouped-Query Attention (GQA)',
                normalization: 'RMSNorm',
                activation: 'SwiGLU',
                positionEncoding: 'RoPE'
            }
        };
    }
}
