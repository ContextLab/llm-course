/**
 * Seq2Seq Neural Chatbot (2014-era)
 * Real neural conversational model using Transformers.js
 * Demonstrates the shift from rule-based to learned neural responses
 */

export class Seq2SeqBot {
    constructor() {
        this.model = null;
        this.isReady = false;
        this.isLoading = false;
        this.error = null;
        this.onProgress = null;

        // Using BlenderBot Small - a real neural conversation model
        // This represents the seq2seq era where models learned from conversation data
        this.modelName = 'Xenova/blenderbot_small-90M';
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
            this.onProgress({ stage, progress, model: this.modelName });
        }
        if (progress !== null) {
            console.log(`[Seq2Seq] ${stage}: ${progress.toFixed(1)}%`);
        } else {
            console.log(`[Seq2Seq] ${stage}`);
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

            this.reportProgress('Loading BlenderBot Small (90M)');

            // Load the conversational model with progress tracking
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
            this.reportProgress('BlenderBot loaded successfully!', 100);
            return true;
        } catch (error) {
            console.error('Error loading Seq2Seq model:', error);
            this.error = error.message;

            // Fallback to DialoGPT if BlenderBot fails
            try {
                this.reportProgress('Primary model failed, trying DialoGPT fallback');
                const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');

                this.model = await pipeline('text-generation', 'Xenova/DialoGPT-small', {
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            const pct = progress.progress || 0;
                            this.reportProgress(`Downloading fallback model`, pct);
                        }
                    }
                });

                this.modelName = 'Xenova/DialoGPT-small';
                this.isReady = true;
                this.isLoading = false;
                this.reportProgress('DialoGPT loaded successfully!', 100);
                return true;
            } catch (fallbackError) {
                console.error('Fallback model also failed:', fallbackError);
                this.error = 'Failed to load neural model';
                this.isLoading = false;
                this.reportProgress('All models failed to load');
                return false;
            }
        }
    }

    async getResponse(input) {
        if (!this.isReady) {
            if (this.isLoading) {
                return "Neural model is still loading... This may take a minute on first use.";
            }
            if (this.error) {
                return `Model loading failed: ${this.error}. Please refresh to try again.`;
            }
            return "Model not initialized. Please wait...";
        }

        try {
            // Clean and prepare input
            const cleanInput = input.trim();

            if (!cleanInput) {
                return "Please say something!";
            }

            // Generate response using the neural model
            let response;

            if (this.modelName.includes('blenderbot')) {
                // BlenderBot uses text2text-generation
                const result = await this.model(cleanInput, {
                    max_new_tokens: 60,
                    temperature: 0.7,
                    do_sample: true,
                    top_k: 50,
                    top_p: 0.9,
                    repetition_penalty: 1.2
                });

                response = result[0].generated_text;
            } else {
                // DialoGPT uses text-generation
                const conversationInput = `${cleanInput}`;
                const result = await this.model(conversationInput, {
                    max_new_tokens: 40,
                    temperature: 0.8,
                    do_sample: true,
                    top_k: 50,
                    top_p: 0.9,
                    repetition_penalty: 1.3
                });

                // Extract only the new response (remove the input)
                response = result[0].generated_text.substring(conversationInput.length).trim();
            }

            // Clean up the response
            response = this.cleanResponse(response);

            // Show neural characteristics - occasionally return generic responses
            // to demonstrate limitations of early neural models
            if (response.length < 3 || Math.random() < 0.05) {
                const genericResponses = [
                    "I see.",
                    "That's interesting.",
                    "Tell me more.",
                    "I understand.",
                    "Go on."
                ];
                return genericResponses[Math.floor(Math.random() * genericResponses.length)];
            }

            return response;

        } catch (error) {
            console.error('Error generating neural response:', error);

            // Return error-appropriate response
            if (error.message.includes('out of memory')) {
                return "Sorry, I'm having memory issues. Try a shorter message.";
            }

            return "I'm having trouble processing that right now.";
        }
    }

    cleanResponse(text) {
        // Remove common artifacts from neural generation
        let cleaned = text.trim();

        // Remove incomplete sentences at the end
        if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
            // If no punctuation at end, try to find last complete sentence
            const lastPunct = Math.max(
                cleaned.lastIndexOf('.'),
                cleaned.lastIndexOf('!'),
                cleaned.lastIndexOf('?')
            );
            if (lastPunct > 10) {
                cleaned = cleaned.substring(0, lastPunct + 1);
            }
        }

        // Remove repetitive patterns (common in early seq2seq)
        const words = cleaned.split(' ');
        if (words.length > 4) {
            // Check for word repetition
            const uniqueWords = new Set(words);
            if (uniqueWords.size < words.length * 0.5) {
                // Too much repetition, return first part
                cleaned = words.slice(0, Math.ceil(words.length / 2)).join(' ');
            }
        }

        // Ensure reasonable length
        if (cleaned.length > 200) {
            cleaned = cleaned.substring(0, 200).trim();
            const lastSpace = cleaned.lastIndexOf(' ');
            if (lastSpace > 0) {
                cleaned = cleaned.substring(0, lastSpace) + '...';
            }
        }

        return cleaned;
    }

    getModelInfo() {
        return {
            name: this.modelName,
            type: 'Neural Seq2Seq',
            architecture: this.modelName.includes('blenderbot') ? 'Encoder-Decoder Transformer' : 'Decoder-only Transformer',
            parameters: this.modelName.includes('blenderbot') ? '90M' : '117M',
            year: '2014-2019',
            isReady: this.isReady,
            isLoading: this.isLoading
        };
    }

    /**
     * Get detailed architecture information for educational display
     */
    getArchitectureInfo() {
        if (this.modelName.includes('blenderbot')) {
            return {
                name: 'BlenderBot Small',
                type: 'Encoder-Decoder Transformer',
                parameters: '90 Million',
                layers: '6 encoder + 6 decoder',
                hiddenSize: 512,
                attentionHeads: 8,
                vocabulary: '~8000 BPE tokens',
                trainingData: 'Blended Skill Talk, ConvAI2, Empathetic Dialogues, Wizard of Wikipedia',
                year: 2020,
                organization: 'Facebook AI Research (Meta)',
                keyFeatures: [
                    'Encoder processes input bidirectionally',
                    'Decoder generates response autoregressively',
                    'Cross-attention connects encoder and decoder',
                    'Trained for engagingness, knowledge, empathy, and personality'
                ],
                architecture: {
                    encoder: {
                        description: 'Processes the entire input sequence',
                        components: ['Self-Attention', 'Feed Forward Network', 'Layer Normalization'],
                        bidirectional: true
                    },
                    decoder: {
                        description: 'Generates output one token at a time',
                        components: ['Masked Self-Attention', 'Cross-Attention', 'Feed Forward Network'],
                        autoregressive: true
                    }
                }
            };
        } else {
            return {
                name: 'DialoGPT Small',
                type: 'Decoder-Only Transformer',
                parameters: '117 Million',
                layers: '12 decoder layers',
                hiddenSize: 768,
                attentionHeads: 12,
                vocabulary: '~50000 BPE tokens',
                trainingData: 'Reddit conversations',
                year: 2019,
                organization: 'Microsoft',
                keyFeatures: [
                    'GPT-2 architecture fine-tuned for dialogue',
                    'Autoregressive generation only',
                    'No explicit encoder component',
                    'Conversation history as context'
                ]
            };
        }
    }
}
