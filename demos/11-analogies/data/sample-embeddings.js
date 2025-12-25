/**
 * Real pre-trained word embeddings from GloVe (Global Vectors for Word Representation)
 *
 * This module loads genuine word embeddings trained by Stanford NLP on 6 billion tokens.
 * Unlike the previous hand-crafted embeddings, these are real pre-trained vectors that
 * capture semantic relationships learned from actual text data.
 *
 * Source: GloVe 6B dataset (https://nlp.stanford.edu/projects/glove/)
 * Citation: Jeffrey Pennington, Richard Socher, and Christopher D. Manning. 2014.
 *           GloVe: Global Vectors for Word Representation.
 */

/**
 * Load GloVe embeddings from JSON file
 */
async function loadGloVeEmbeddings() {
    try {
        console.log('Loading real GloVe embeddings...');
        const response = await fetch('./data/glove-50d.json');

        if (!response.ok) {
            throw new Error(`Failed to load embeddings: ${response.status} ${response.statusText}`);
        }

        const embeddings = await response.json();
        console.log(`Loaded ${Object.keys(embeddings).length} word embeddings (50 dimensions)`);

        return embeddings;
    } catch (error) {
        console.error('Error loading GloVe embeddings:', error);
        throw error;
    }
}

/**
 * Create a minimal set of hand-crafted embeddings for immediate testing
 * This is only used as a fallback if the real embeddings fail to load
 */
function createFallbackEmbeddings() {
    console.warn('Using fallback embeddings - real embeddings could not be loaded');

    // Just a tiny set for basic functionality
    const embeddings = {};
    const words = ['king', 'queen', 'man', 'woman', 'paris', 'france', 'berlin', 'germany'];

    words.forEach((word, i) => {
        const vec = new Array(50).fill(0);
        // Create simple distinct vectors
        vec[i % 50] = 1.0;
        vec[(i + 1) % 50] = 0.5;
        embeddings[word] = vec;
    });

    return embeddings;
}

// Export a promise that resolves to the embeddings
let glove50Promise = null;

export const SAMPLE_EMBEDDINGS = {
    get glove50() {
        if (!glove50Promise) {
            glove50Promise = loadGloVeEmbeddings().catch(err => {
                console.error('Failed to load real embeddings, using fallback:', err);
                return createFallbackEmbeddings();
            });
        }
        return glove50Promise;
    },

    // For backwards compatibility, but not recommended
    get word2vec100() {
        console.warn('word2vec100 is no longer available. Use glove50 instead.');
        return this.glove50;
    }
};

// For easier async/await usage
export async function loadEmbeddings(modelName = 'glove50') {
    if (modelName === 'glove50' || modelName === 'glove-50') {
        return await SAMPLE_EMBEDDINGS.glove50;
    } else if (modelName === 'word2vec100' || modelName === 'word2vec-100') {
        console.warn('word2vec100 is no longer available. Loading glove50 instead.');
        return await SAMPLE_EMBEDDINGS.glove50;
    } else {
        throw new Error(`Unknown model: ${modelName}`);
    }
}
