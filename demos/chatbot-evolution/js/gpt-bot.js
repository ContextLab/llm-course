/**
 * GPT-style Bot (2020s) - Modern LLM via Transformers.js v3
 * 
 * Model hierarchy (using onnx-community models for Transformers.js compatibility):
 * 1. SmolLM2-135M-Instruct-ONNX - Ultra-light (~110MB), works on any device
 * 2. SmolLM2-360M-Instruct-ONNX - Balanced quality/speed (~260MB)
 * 3. Qwen2.5-0.5B-Instruct - Best quality (~460MB, requires 4GB+ RAM)
 * 
 * IMPORTANT: Uses onnx-community models which are specifically exported and
 * tested for Transformers.js browser compatibility. The original HuggingFaceTB
 * models may have ONNX files but aren't guaranteed to work with Transformers.js.
 * 
 * Auto-selects based on device RAM and WASM memory limits.
 */

export class GPTBot {
    // Cached capability detection (computed once)
    static _wasmMaxMB = null;
    static _webGPUAvailable = null;
    
    /**
     * Probe maximum WASM memory available in this browser.
     * Uses binary search to find the largest allocatable memory.
     * @returns {number} Maximum WASM memory in MB
     */
    static probeWasmMemory() {
        if (GPTBot._wasmMaxMB !== null) {
            return GPTBot._wasmMaxMB;
        }
        
        // Binary search for max allocatable WASM pages
        // 1 page = 64 KiB, max theoretical = 65536 pages (4GB)
        let min = 1;
        let max = 65536; // 4GB theoretical max
        let best = min;
        
        while (min <= max) {
            const mid = Math.floor((min + max) / 2);
            try {
                // Try to create Memory with this maximum
                new WebAssembly.Memory({ initial: 1, maximum: mid });
                best = mid;
                min = mid + 1;
            } catch (e) {
                max = mid - 1;
            }
        }
        
        // Convert pages to MB (1 page = 64 KiB = 0.0625 MB)
        GPTBot._wasmMaxMB = Math.floor((best * 64) / 1024);
        console.log(`[GPT] Probed WASM memory limit: ${GPTBot._wasmMaxMB}MB (${best} pages)`);
        return GPTBot._wasmMaxMB;
    }
    
    /**
     * Check if WebGPU is available and functional.
     * WebGPU allows larger models since weights go to GPU memory.
     * @returns {Promise<boolean>}
     */
    static async checkWebGPU() {
        if (GPTBot._webGPUAvailable !== null) {
            return GPTBot._webGPUAvailable;
        }
        
        try {
            if (!navigator.gpu) {
                GPTBot._webGPUAvailable = false;
                console.log('[GPT] WebGPU not supported in this browser');
                return false;
            }
            
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                GPTBot._webGPUAvailable = false;
                console.log('[GPT] WebGPU adapter not available');
                return false;
            }
            
            const limits = adapter.limits;
            const maxBufferSize = limits.maxBufferSize || 0;
            const maxStorageBufferSize = limits.maxStorageBufferBindingSize || 0;
            
            console.log(`[GPT] WebGPU available - maxBufferSize: ${Math.floor(maxBufferSize / 1024 / 1024)}MB, maxStorageBuffer: ${Math.floor(maxStorageBufferSize / 1024 / 1024)}MB`);
            GPTBot._webGPUAvailable = true;
            return true;
        } catch (e) {
            console.log('[GPT] WebGPU check failed:', e.message);
            GPTBot._webGPUAvailable = false;
            return false;
        }
    }
    
    constructor() {
        this.generator = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;
        this.loadAttempt = 0;

        this.models = [
            {
                name: 'onnx-community/SmolLM2-135M-Instruct-ONNX',
                displayName: 'SmolLM2 135M',
                dtype: 'q4f16',
                params: '135M',
                sizeMB: 111,
                wasmMinMB: 400,
                minRAM: 2,
                year: 2024,
                org: 'HuggingFace'
            },
            {
                name: 'onnx-community/SmolLM2-360M-Instruct-ONNX',
                displayName: 'SmolLM2 360M',
                dtype: 'q4f16',
                params: '360M',
                sizeMB: 259,
                wasmMinMB: 700,
                minRAM: 4,
                year: 2024,
                org: 'HuggingFace'
            },
            {
                name: 'onnx-community/Qwen2.5-0.5B-Instruct',
                displayName: 'Qwen2.5 0.5B',
                dtype: 'q4f16',
                params: '0.5B',
                sizeMB: 460,
                wasmMinMB: 1200,
                minRAM: 4,
                year: 2024,
                org: 'Alibaba'
            }
        ];
        
        this.systemPrompt = 'You are a helpful assistant.';
        
        this.conversationHistory = [];
        this.currentModel = null;
        this.selectedModelIndex = this.getDefaultModelIndex();
    }
    
    /**
     * Detect device capabilities and select the best model.
     * 
     * Selection logic:
     * 1. Probe WASM memory limit
     * 2. Check WebGPU availability (allows larger models)
     * 3. Consider device RAM
     * 4. Select largest model that fits all constraints
     */
    getDefaultModelIndex() {
        const deviceRAM = navigator.deviceMemory || 4;
        const wasmMaxMB = GPTBot.probeWasmMemory();
        
        // WebGPU check is async, so we optimistically check the cached value
        // If WebGPU hasn't been checked yet, assume WASM-only for initial selection
        const hasWebGPU = GPTBot._webGPUAvailable === true;
        
        console.log(`[GPT] Capability detection: RAM=${deviceRAM}GB, WASM=${wasmMaxMB}MB, WebGPU=${hasWebGPU}`);
        
        for (let i = this.models.length - 1; i >= 0; i--) {
            const model = this.models[i];
            
            if (deviceRAM < model.minRAM) {
                console.log(`[GPT] ${model.displayName}: skipped (needs ${model.minRAM}GB RAM, have ${deviceRAM}GB)`);
                continue;
            }
            
            // WebGPU bypasses WASM heap limits by loading weights to GPU memory
            if (!hasWebGPU && wasmMaxMB < model.wasmMinMB) {
                console.log(`[GPT] ${model.displayName}: skipped (needs ${model.wasmMinMB}MB WASM, have ${wasmMaxMB}MB)`);
                continue;
            }
            
            console.log(`[GPT] Auto-selecting ${model.displayName} (RAM: ${deviceRAM}GB, WASM: ${wasmMaxMB}MB, WebGPU: ${hasWebGPU})`);
            return i;
        }
        
        console.log(`[GPT] Falling back to smallest model (limited resources)`);
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
            'Qwen2.5-0.5B': { layers: 24, hiddenSize: 896, attentionHeads: 14 }
        };
        
        const modelKey = model.name.includes('135M') ? 'SmolLM2-135M' :
                         model.name.includes('360M') ? 'SmolLM2-360M' : 'Qwen2.5-0.5B';
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
