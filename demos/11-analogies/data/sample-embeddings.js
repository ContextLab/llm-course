/**
 * Sample word embeddings for demonstration
 * These are simplified, hand-crafted embeddings that preserve semantic relationships
 */

// Generate random but consistent embeddings
function generateEmbedding(seed, dim) {
    const random = (s) => {
        let x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    const vec = [];
    for (let i = 0; i < dim; i++) {
        vec.push((random(seed + i) - 0.5) * 2);
    }
    return vec;
}

// Create embeddings with semantic relationships
function createSemanticEmbeddings(dim) {
    const embeddings = {};

    // Base vectors for different semantic categories
    const categories = {
        // Royalty/Gender
        royalty: Array(dim).fill(0).map((_, i) => i < 5 ? 1 : 0),
        male: Array(dim).fill(0).map((_, i) => i >= 5 && i < 10 ? 1 : 0),
        female: Array(dim).fill(0).map((_, i) => i >= 10 && i < 15 ? 1 : 0),

        // Geography
        capital: Array(dim).fill(0).map((_, i) => i >= 15 && i < 20 ? 1 : 0),
        country: Array(dim).fill(0).map((_, i) => i >= 20 && i < 25 ? 1 : 0),

        // Quality
        good: Array(dim).fill(0).map((_, i) => i >= 25 && i < 30 ? 1 : 0),
        comparative: Array(dim).fill(0).map((_, i) => i >= 30 && i < 35 ? 0.5 : 0),
        superlative: Array(dim).fill(0).map((_, i) => i >= 30 && i < 35 ? 1 : 0),

        // Tense
        present: Array(dim).fill(0).map((_, i) => i >= 35 && i < 40 ? 1 : 0),
        past: Array(dim).fill(0).map((_, i) => i >= 40 && i < 45 ? 1 : 0)
    };

    // Add random noise
    const addNoise = (vec, scale = 0.1) => {
        return vec.map((v, i) => v + (Math.random() - 0.5) * scale);
    };

    // Combine category vectors
    const combine = (...vecs) => {
        const result = Array(dim).fill(0);
        vecs.forEach(vec => {
            vec.forEach((v, i) => result[i] += v);
        });
        return addNoise(result);
    };

    // Royalty words
    embeddings.king = combine(categories.royalty, categories.male);
    embeddings.queen = combine(categories.royalty, categories.female);
    embeddings.prince = combine(categories.royalty, categories.male, categories.comparative);
    embeddings.princess = combine(categories.royalty, categories.female, categories.comparative);
    embeddings.man = combine(categories.male);
    embeddings.woman = combine(categories.female);
    embeddings.boy = combine(categories.male, categories.comparative);
    embeddings.girl = combine(categories.female, categories.comparative);

    // Geography
    embeddings.paris = combine(categories.capital, categories.country);
    embeddings.france = combine(categories.country);
    embeddings.berlin = combine(categories.capital, categories.country);
    embeddings.germany = combine(categories.country);
    embeddings.london = combine(categories.capital, categories.country);
    embeddings.england = combine(categories.country);
    embeddings.tokyo = combine(categories.capital, categories.country);
    embeddings.japan = combine(categories.country);
    embeddings.rome = combine(categories.capital, categories.country);
    embeddings.italy = combine(categories.country);

    // Adjectives
    embeddings.good = combine(categories.good);
    embeddings.better = combine(categories.good, categories.comparative);
    embeddings.best = combine(categories.good, categories.superlative);
    embeddings.bad = combine(categories.good, Array(dim).fill(-0.5));
    embeddings.worse = combine(categories.good, Array(dim).fill(-0.5), categories.comparative);
    embeddings.worst = combine(categories.good, Array(dim).fill(-0.5), categories.superlative);

    // Verbs
    embeddings.walk = combine(categories.present);
    embeddings.walked = combine(categories.past);
    embeddings.walking = combine(categories.present, categories.comparative);
    embeddings.swim = combine(categories.present, Array(dim).fill(0.3));
    embeddings.swimming = combine(categories.present, categories.comparative, Array(dim).fill(0.3));
    embeddings.swam = combine(categories.past, Array(dim).fill(0.3));

    // Animals
    const animal = Array(dim).fill(0).map((_, i) => i >= 45 && i < 50 ? 1 : 0);
    embeddings.cat = combine(animal);
    embeddings.dog = combine(animal, Array(dim).fill(0.2));
    embeddings.kitten = combine(animal, categories.comparative);
    embeddings.puppy = combine(animal, categories.comparative, Array(dim).fill(0.2));

    // Add more common words with random embeddings
    const commonWords = [
        'the', 'a', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'this', 'that', 'these', 'those', 'here', 'there',
        'big', 'small', 'large', 'tiny', 'huge', 'great',
        'happy', 'sad', 'angry', 'excited', 'calm',
        'red', 'blue', 'green', 'yellow', 'black', 'white',
        'one', 'two', 'three', 'four', 'five',
        'first', 'second', 'third', 'last',
        'new', 'old', 'young', 'modern', 'ancient',
        'fast', 'slow', 'quick', 'rapid',
        'hot', 'cold', 'warm', 'cool',
        'day', 'night', 'morning', 'evening',
        'sun', 'moon', 'star', 'sky', 'earth',
        'water', 'fire', 'air', 'wind',
        'tree', 'flower', 'grass', 'plant',
        'book', 'pen', 'paper', 'write', 'read',
        'car', 'bike', 'train', 'plane', 'ship',
        'house', 'home', 'building', 'room',
        'food', 'eat', 'drink', 'cook',
        'love', 'like', 'hate', 'enjoy',
        'think', 'know', 'understand', 'learn',
        'speak', 'talk', 'say', 'tell',
        'see', 'look', 'watch', 'view',
        'hear', 'listen', 'sound', 'music',
        'work', 'play', 'study', 'teach',
        'buy', 'sell', 'give', 'take',
        'go', 'come', 'leave', 'arrive',
        'up', 'down', 'left', 'right',
        'north', 'south', 'east', 'west',
        'computer', 'phone', 'internet', 'email',
        'science', 'math', 'physics', 'chemistry',
        'art', 'music', 'sports', 'game',
        'movie', 'film', 'show', 'watch',
        'friend', 'family', 'mother', 'father',
        'brother', 'sister', 'son', 'daughter',
        'child', 'parent', 'adult', 'person',
        'city', 'town', 'village', 'country',
        'world', 'universe', 'space', 'time',
        'year', 'month', 'week', 'day',
        'hour', 'minute', 'second'
    ];

    commonWords.forEach((word, idx) => {
        if (!embeddings[word]) {
            embeddings[word] = generateEmbedding(idx * 100, dim);
        }
    });

    return embeddings;
}

// Create GloVe-style embeddings (50 dimensions)
const glove50 = createSemanticEmbeddings(50);

// Create Word2Vec-style embeddings (100 dimensions)
const word2vec100 = createSemanticEmbeddings(100);

export const SAMPLE_EMBEDDINGS = {
    glove50,
    word2vec100
};
