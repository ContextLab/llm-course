/**
 * EmbeddingLoader - Handles loading embedding models and datasets
 * Supports both pre-computed embeddings and on-the-fly embedding with Transformers.js
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// Disable local model loading
env.allowLocalModels = false;

export class EmbeddingLoader {
    constructor() {
        this.currentModel = null;
        this.modelType = null;
        this.modelId = null;
        this.pipeline = null;
        this.precomputedEmbeddings = null;
    }

    /**
     * Load an embedding model
     */
    async loadModel(modelId) {
        this.modelId = modelId;
        this.updateStatus(`Loading model: ${modelId}...`);

        try {
            if (modelId === 'glove' || modelId === 'word2vec') {
                // Pre-computed embeddings
                this.modelType = 'precomputed';
                this.precomputedEmbeddings = await this.loadPrecomputedModel(modelId);
                this.updateStatus(`Model ${modelId} loaded (pre-computed)`);
            } else {
                // Transformers.js models
                this.modelType = 'transformers';
                const modelName = this.getTransformersModelName(modelId);
                this.pipeline = await pipeline('feature-extraction', modelName);
                this.updateStatus(`Model ${modelId} loaded successfully`);
            }
        } catch (error) {
            this.updateStatus(`Error loading model: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get HuggingFace model name from ID
     */
    getTransformersModelName(modelId) {
        const modelMap = {
            'all-MiniLM-L6-v2': 'Xenova/all-MiniLM-L6-v2',
            'all-mpnet-base-v2': 'Xenova/all-mpnet-base-v2',
            'paraphrase-multilingual': 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
        };
        return modelMap[modelId] || modelId;
    }

    /**
     * Load pre-computed embeddings (for faster demo with GloVe/Word2Vec)
     */
    async loadPrecomputedModel(modelId) {
        const response = await fetch(`data/${modelId}-embeddings.json`);
        if (!response.ok) {
            throw new Error(`Failed to load pre-computed embeddings for ${modelId}`);
        }
        return await response.json();
    }

    /**
     * Load a dataset
     */
    async loadDataset(datasetId) {
        this.updateStatus(`Loading dataset: ${datasetId}...`);

        try {
            let dataset;

            if (datasetId === 'custom-text' || datasetId === 'custom-file') {
                dataset = await this.loadCustomDataset(datasetId);
            } else {
                dataset = await this.loadPreloadedDataset(datasetId);
            }

            // Compute embeddings if not pre-computed
            if (!dataset.embeddings) {
                dataset.embeddings = await this.computeEmbeddings(dataset.texts);
            }

            this.updateStatus(`Dataset loaded: ${dataset.texts.length} samples`);
            return dataset;

        } catch (error) {
            this.updateStatus(`Error loading dataset: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load pre-loaded datasets
     */
    async loadPreloadedDataset(datasetId) {
        const response = await fetch(`data/${datasetId}-dataset.json`);
        if (!response.ok) {
            // If dataset file doesn't exist, generate synthetic data
            return this.generateSyntheticDataset(datasetId);
        }
        return await response.json();
    }

    /**
     * Generate synthetic dataset for demo purposes
     */
    async generateSyntheticDataset(datasetId) {
        const datasets = {
            'news': this.generateNewsDataset(),
            'movies': this.generateMovieReviewsDataset(),
            'wikipedia': this.generateWikipediaDataset()
        };

        const data = datasets[datasetId] || datasets['news'];

        // Compute embeddings
        const embeddings = await this.computeEmbeddings(data.texts);

        return {
            ...data,
            embeddings
        };
    }

    /**
     * Generate synthetic news dataset
     */
    generateNewsDataset() {
        const categories = [
            'technology', 'sports', 'politics', 'entertainment', 'science',
            'health', 'business', 'world', 'environment', 'education'
        ];

        const templates = {
            'technology': [
                'New AI model achieves breakthrough in natural language understanding',
                'Tech giant announces revolutionary quantum computing chip',
                'Cybersecurity experts warn of new ransomware threat',
                'Smartphone manufacturer unveils latest flagship device',
                'Software update brings major improvements to popular platform'
            ],
            'sports': [
                'Championship game ends in dramatic overtime victory',
                'Star athlete breaks long-standing world record',
                'Team announces surprising coaching change',
                'Young player emerges as breakout star of the season',
                'League introduces new rules to improve player safety'
            ],
            'politics': [
                'New legislation aims to address climate change concerns',
                'Political leaders meet to discuss international trade agreements',
                'Voter turnout reaches record high in recent election',
                'Government announces major infrastructure investment plan',
                'Policy debate intensifies ahead of upcoming referendum'
            ],
            'entertainment': [
                'Blockbuster film breaks box office records worldwide',
                'Popular streaming service announces new original series',
                'Music festival lineup features diverse array of artists',
                'Award-winning director begins production on anticipated project',
                'Celebrity couple announces engagement on social media'
            ],
            'science': [
                'Researchers discover new species in deep ocean exploration',
                'Study reveals surprising findings about human cognition',
                'Space telescope captures stunning images of distant galaxy',
                'Scientific breakthrough could lead to cancer treatment',
                'Climate scientists publish comprehensive environmental report'
            ],
            'health': [
                'New study shows benefits of Mediterranean diet',
                'Medical researchers develop innovative treatment approach',
                'Public health officials announce vaccination campaign',
                'Mental health awareness program launches nationwide',
                'Fitness experts recommend updated exercise guidelines'
            ],
            'business': [
                'Major corporation announces record quarterly earnings',
                'Startup raises significant funding for expansion plans',
                'Market analysts predict economic growth in coming quarter',
                'Company unveils new sustainability initiatives',
                'Merger creates industry-leading business entity'
            ],
            'world': [
                'International summit addresses global challenges',
                'Historic peace agreement signed between nations',
                'Natural disaster prompts humanitarian relief efforts',
                'Cultural festival celebrates diverse traditions',
                'Archaeological discovery sheds light on ancient civilization'
            ],
            'environment': [
                'Conservation efforts help endangered species population recover',
                'Renewable energy project begins operation in remote region',
                'Environmental activists organize climate action demonstration',
                'New recycling program aims to reduce plastic waste',
                'Wildlife sanctuary expands protection for natural habitat'
            ],
            'education': [
                'University announces groundbreaking research initiative',
                'Educational technology transforms classroom learning experience',
                'Students achieve impressive results in academic competition',
                'New curriculum focuses on critical thinking skills',
                'Scholarship program helps underprivileged students access education'
            ]
        };

        const texts = [];
        const labels = [];

        categories.forEach(category => {
            const categoryTexts = templates[category];
            categoryTexts.forEach(text => {
                texts.push(text);
                labels.push(category);
            });
        });

        return { texts, labels };
    }

    /**
     * Generate synthetic movie reviews dataset
     */
    generateMovieReviewsDataset() {
        const positiveReviews = [
            'An absolute masterpiece that will leave you speechless. The performances are outstanding!',
            'Brilliantly crafted with stunning visuals and a compelling storyline.',
            'One of the best films of the year. Highly recommended!',
            'A heartwarming tale that resonates deeply. Simply beautiful.',
            'Incredible acting and direction. A must-see cinematic experience.',
            'Captivating from start to finish. The plot twists are amazing!',
            'A triumph of storytelling. Every scene is perfectly executed.',
            'Phenomenal performances and breathtaking cinematography.',
            'This film exceeded all my expectations. Truly remarkable.',
            'A modern classic that will stand the test of time.'
        ];

        const negativeReviews = [
            'Disappointing and predictable. The plot was full of holes.',
            'A complete waste of time. Poor acting and weak storyline.',
            'I struggled to stay awake. Boring and uninspired.',
            'The worst film I have seen this year. Avoid at all costs.',
            'Terrible pacing and unconvincing performances throughout.',
            'A confusing mess that never finds its footing.',
            'Poorly written dialogue and forgettable characters.',
            'This film fails on every level. A major letdown.',
            'Overhyped and underwhelming. Not worth the ticket price.',
            'Lacking substance and originality. Very disappointing.'
        ];

        const neutralReviews = [
            'Decent entertainment but nothing particularly memorable.',
            'Has its moments but overall just average.',
            'Not bad but could have been much better with stronger writing.',
            'A mixed bag with some good scenes and some weak ones.',
            'Entertaining enough but forgettable once the credits roll.',
            'Adequate performances in a fairly standard storyline.',
            'Neither impressive nor terrible, just okay.',
            'Some interesting ideas that were not fully developed.',
            'Watchable but not something I would recommend strongly.',
            'A competent film that does not take many risks.'
        ];

        const texts = [...positiveReviews, ...negativeReviews, ...neutralReviews];
        const labels = [
            ...Array(positiveReviews.length).fill('positive'),
            ...Array(negativeReviews.length).fill('negative'),
            ...Array(neutralReviews.length).fill('neutral')
        ];

        return { texts, labels };
    }

    /**
     * Generate synthetic Wikipedia dataset
     */
    generateWikipediaDataset() {
        const articles = [
            { text: 'Artificial intelligence is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans.', label: 'Computer Science' },
            { text: 'Python is a high-level, interpreted programming language with dynamic semantics and a focus on code readability.', label: 'Computer Science' },
            { text: 'Machine learning is a subset of artificial intelligence that focuses on the development of algorithms that can learn from data.', label: 'Computer Science' },
            { text: 'The Theory of Relativity, developed by Albert Einstein, revolutionized our understanding of space, time, and gravity.', label: 'Physics' },
            { text: 'Quantum mechanics is a fundamental theory in physics that describes nature at the smallest scales of energy levels.', label: 'Physics' },
            { text: 'DNA, or deoxyribonucleic acid, is the hereditary material in humans and almost all other organisms.', label: 'Biology' },
            { text: 'Photosynthesis is the process by which plants use sunlight to synthesize nutrients from carbon dioxide and water.', label: 'Biology' },
            { text: 'Evolution is change in the heritable characteristics of biological populations over successive generations.', label: 'Biology' },
            { text: 'The Renaissance was a period in European history marking the transition from the Middle Ages to modernity.', label: 'History' },
            { text: 'World War II was a global war that lasted from 1939 to 1945 and involved the vast majority of the world nations.', label: 'History' },
            { text: 'Shakespeare was an English playwright and poet, widely regarded as the greatest writer in the English language.', label: 'Literature' },
            { text: 'Climate change refers to long-term shifts in temperatures and weather patterns, mainly caused by human activities.', label: 'Environment' },
            { text: 'The water cycle describes the continuous movement of water on, above, and below the surface of the Earth.', label: 'Environment' },
            { text: 'Democracy is a form of government in which the people have the authority to choose their governing representatives.', label: 'Politics' },
            { text: 'The stock market is a collection of markets where stocks are traded between investors.', label: 'Economics' },
            { text: 'Supply and demand is an economic model of price determination in a market economy.', label: 'Economics' },
            { text: 'The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex.', label: 'Archaeology' },
            { text: 'Classical music is art music produced in the traditions of Western culture over a long period of time.', label: 'Music' },
            { text: 'Abstract art uses visual language of shape, form, color and line to create compositions independent of visual references.', label: 'Art' },
            { text: 'The human brain is the central organ of the nervous system and the most complex organ in the human body.', label: 'Neuroscience' }
        ];

        return {
            texts: articles.map(a => a.text),
            labels: articles.map(a => a.label)
        };
    }

    /**
     * Load custom dataset
     */
    async loadCustomDataset(datasetId) {
        // This would be implemented with a file upload or text input modal
        throw new Error('Custom dataset loading not yet implemented in this demo');
    }

    /**
     * Compute embeddings for texts
     */
    async computeEmbeddings(texts) {
        if (this.modelType === 'precomputed') {
            return this.getPrecomputedEmbeddings(texts);
        } else if (this.modelType === 'transformers') {
            return this.getTransformersEmbeddings(texts);
        }
        throw new Error('No model loaded');
    }

    /**
     * Get pre-computed embeddings (simulate for demo)
     */
    async getPrecomputedEmbeddings(texts) {
        const dim = this.modelId === 'glove' ? 50 : 100;
        // Generate random embeddings as placeholder
        return texts.map(() => Array(dim).fill(0).map(() => (Math.random() - 0.5) * 2));
    }

    /**
     * Get embeddings using Transformers.js
     */
    async getTransformersEmbeddings(texts) {
        const embeddings = [];

        // Process in batches to show progress
        const batchSize = 5;
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchEmbeddings = await this.pipeline(batch, { pooling: 'mean', normalize: true });

            // Convert to regular arrays
            for (let j = 0; j < batch.length; j++) {
                const embedding = Array.from(batchEmbeddings[j].data);
                embeddings.push(embedding);
            }

            this.updateStatus(`Embedding progress: ${Math.min(i + batchSize, texts.length)}/${texts.length}`);
        }

        return embeddings;
    }

    /**
     * Embed a single text
     */
    async embedText(text) {
        if (this.modelType === 'precomputed') {
            const dim = this.modelId === 'glove' ? 50 : 100;
            return Array(dim).fill(0).map(() => (Math.random() - 0.5) * 2);
        } else if (this.modelType === 'transformers') {
            const output = await this.pipeline(text, { pooling: 'mean', normalize: true });
            return Array.from(output.data);
        }
        throw new Error('No model loaded');
    }

    /**
     * Update status display
     */
    updateStatus(message) {
        const statusEl = document.getElementById('model-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
        console.log(`[EmbeddingLoader] ${message}`);
    }
}
