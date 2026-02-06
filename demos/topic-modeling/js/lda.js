/**
 * LDA (Latent Dirichlet Allocation) Implementation
 * Using Collapsed Gibbs Sampling
 */

const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'this', 'but', 'they', 'have',
    'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'just',
    'should', 'now', 'i', 'you', 'we', 'or', 'been', 'their', 'them', 'also',
    'am', 'me', 'my', 'our', 'us', 'do', 'does', 'did', 'doing', 'if', 'no',
    'yes', 'any', 'may', 'might', 'must', 'shall', 'would', 'could',
    'his', 'her', 'she', 'him', 'hers', 'herself', 'himself', 'itself',
    'one', 'two', 'three', 'four', 'five', 'first', 'second', 'third',
    'new', 'old', 'many', 'much', 'about', 'into', 'over', 'after', 'before',
    'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'these', 'those', 'being', 'having', 'during', 'through', 'against',
    'while', 'until', 'within', 'without', 'since', 'another', 'because',
    'however', 'although', 'though', 'either', 'neither', 'whether',
    'your', 'yours', 'yourself', 'yourselves', 'themselves', 'ourselves',
    'get', 'got', 'getting', 'make', 'made', 'making', 'take', 'took', 'taking',
    'come', 'came', 'coming', 'go', 'went', 'going', 'say', 'said', 'saying',
    'see', 'saw', 'seen', 'seeing', 'know', 'knew', 'known', 'knowing',
    'think', 'thought', 'thinking', 'want', 'wanted', 'wanting',
    'use', 'used', 'using', 'find', 'found', 'finding',
    'give', 'gave', 'given', 'giving', 'tell', 'told', 'telling',
    'become', 'became', 'becoming', 'begin', 'began', 'begun', 'beginning',
    'seem', 'seemed', 'seeming', 'leave', 'left', 'leaving',
    'call', 'called', 'calling', 'keep', 'kept', 'keeping',
    'let', 'put', 'show', 'showed', 'shown', 'showing',
    'try', 'tried', 'trying', 'ask', 'asked', 'asking',
    'need', 'needed', 'needing', 'feel', 'felt', 'feeling',
    'way', 'ways', 'even', 'well', 'back', 'still', 'always', 'never',
    'also', 'often', 'ever', 'really', 'already', 'almost', 'probably',
    'actually', 'usually', 'perhaps', 'certainly', 'likely', 'simply',
    'something', 'anything', 'everything', 'nothing', 'someone', 'anyone',
    'everyone', 'no one', 'nobody', 'somebody', 'anybody', 'everybody',
    'part', 'parts', 'place', 'places', 'case', 'cases', 'thing', 'things',
    'people', 'person', 'year', 'years', 'time', 'times', 'day', 'days',
    'work', 'works', 'working', 'worked', 'world', 'life', 'hand', 'hands',
    'end', 'ends', 'point', 'points', 'home', 'side', 'sides',
    'high', 'long', 'little', 'small', 'large', 'great', 'good', 'bad',
    'right', 'left', 'next', 'last', 'early', 'late', 'young', 'later',
    'able', 'different', 'important', 'possible', 'certain', 'following',
    'known', 'several', 'including', 'according', 'based', 'along', 'rather'
]);

// Simple Porter Stemmer (basic rules)
class SimpleStemmer {
    static stem(word) {
        word = word.toLowerCase();

        // Remove common suffixes
        word = word.replace(/ing$/, '');
        word = word.replace(/ed$/, '');
        word = word.replace(/es$/, '');
        word = word.replace(/s$/, '');
        word = word.replace(/ly$/, '');
        word = word.replace(/er$/, '');
        word = word.replace(/est$/, '');

        return word;
    }
}

export class LDAModel {
    constructor(params = {}) {
        this.numTopics = params.numTopics || 5;
        this.alpha = params.alpha || 0.5;  // Document-topic prior
        this.beta = params.beta || 0.1;    // Topic-word prior
        this.iterations = params.iterations || 50;
        this.removeStopwords = params.removeStopwords !== false;
        this.useStemming = params.useStemming || false;

        this.vocabulary = new Map();  // word -> id
        this.documents = [];           // tokenized documents
        this.topicAssignments = [];    // topic assignment for each word
        this.documentTopicCounts = []; // doc-topic counts
        this.topicWordCounts = [];     // topic-word counts
        this.topicCounts = [];         // total words per topic
    }

    /**
     * Tokenize and preprocess text
     */
    tokenize(text) {
        // Convert to lowercase and split on non-alphanumeric
        let words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);

        // Remove stopwords
        if (this.removeStopwords) {
            words = words.filter(w => !STOPWORDS.has(w));
        }

        // Apply stemming
        if (this.useStemming) {
            words = words.map(w => SimpleStemmer.stem(w));
        }

        return words;
    }

    /**
     * Build vocabulary from documents
     */
    buildVocabulary(documents) {
        this.vocabulary.clear();
        let wordId = 0;

        documents.forEach(doc => {
            doc.forEach(word => {
                if (!this.vocabulary.has(word)) {
                    this.vocabulary.set(word, wordId++);
                }
            });
        });

        return this.vocabulary.size;
    }

    /**
     * Initialize topic assignments randomly
     */
    initializeAssignments() {
        const numDocs = this.documents.length;
        const vocabSize = this.vocabulary.size;

        // Initialize counts
        this.documentTopicCounts = Array(numDocs).fill(0).map(() =>
            Array(this.numTopics).fill(0)
        );
        this.topicWordCounts = Array(this.numTopics).fill(0).map(() =>
            Array(vocabSize).fill(0)
        );
        this.topicCounts = Array(this.numTopics).fill(0);
        this.topicAssignments = [];

        // Random initialization
        this.documents.forEach((doc, docIdx) => {
            const docAssignments = [];
            doc.forEach(word => {
                const wordId = this.vocabulary.get(word);
                const topic = Math.floor(Math.random() * this.numTopics);

                docAssignments.push(topic);
                this.documentTopicCounts[docIdx][topic]++;
                this.topicWordCounts[topic][wordId]++;
                this.topicCounts[topic]++;
            });
            this.topicAssignments.push(docAssignments);
        });
    }

    /**
     * Sample topic for a word using Gibbs sampling
     */
    sampleTopic(docIdx, wordIdx, word) {
        const wordId = this.vocabulary.get(word);
        const oldTopic = this.topicAssignments[docIdx][wordIdx];

        // Remove current assignment
        this.documentTopicCounts[docIdx][oldTopic]--;
        this.topicWordCounts[oldTopic][wordId]--;
        this.topicCounts[oldTopic]--;

        // Calculate probabilities for each topic
        const probs = [];
        let probSum = 0;
        const vocabSize = this.vocabulary.size;

        for (let topic = 0; topic < this.numTopics; topic++) {
            const docTopicProb = (this.documentTopicCounts[docIdx][topic] + this.alpha) /
                                 (this.documents[docIdx].length + this.numTopics * this.alpha);

            const topicWordProb = (this.topicWordCounts[topic][wordId] + this.beta) /
                                  (this.topicCounts[topic] + vocabSize * this.beta);

            const prob = docTopicProb * topicWordProb;
            probs.push(prob);
            probSum += prob;
        }

        // Sample new topic
        let sample = Math.random() * probSum;
        let newTopic = 0;
        let cumulative = 0;

        for (let topic = 0; topic < this.numTopics; topic++) {
            cumulative += probs[topic];
            if (sample <= cumulative) {
                newTopic = topic;
                break;
            }
        }

        // Add new assignment
        this.topicAssignments[docIdx][wordIdx] = newTopic;
        this.documentTopicCounts[docIdx][newTopic]++;
        this.topicWordCounts[newTopic][wordId]++;
        this.topicCounts[newTopic]++;

        return newTopic;
    }

    /**
     * Run Gibbs sampling
     */
    async runGibbsSampling() {
        for (let iter = 0; iter < this.iterations; iter++) {
            // Sample topic for each word in each document
            for (let docIdx = 0; docIdx < this.documents.length; docIdx++) {
                const doc = this.documents[docIdx];
                for (let wordIdx = 0; wordIdx < doc.length; wordIdx++) {
                    this.sampleTopic(docIdx, wordIdx, doc[wordIdx]);
                }
            }

            // Log progress every 10 iterations
            if ((iter + 1) % 10 === 0) {
                console.log(`Iteration ${iter + 1}/${this.iterations}`);
            }

            // Allow UI to update
            if (iter % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    }

    /**
     * Get top words for each topic
     */
    getTopWords(numWords = 10) {
        const topics = [];
        const vocabArray = Array.from(this.vocabulary.entries());

        for (let topic = 0; topic < this.numTopics; topic++) {
            const wordProbs = vocabArray.map(([word, wordId]) => ({
                word,
                weight: this.topicWordCounts[topic][wordId] / this.topicCounts[topic]
            }));

            wordProbs.sort((a, b) => b.weight - a.weight);
            topics.push(wordProbs.slice(0, numWords));
        }

        return topics;
    }

    /**
     * Get document-topic distributions
     */
    getDocumentTopics() {
        const distributions = [];

        this.documentTopicCounts.forEach((counts, docIdx) => {
            const total = this.documents[docIdx].length;
            const distribution = counts.map(count => count / total);
            distributions.push(distribution);
        });

        return distributions;
    }

    /**
     * Calculate perplexity (model quality metric)
     */
    calculatePerplexity() {
        let logLikelihood = 0;
        let totalWords = 0;

        this.documents.forEach((doc, docIdx) => {
            doc.forEach(word => {
                const wordId = this.vocabulary.get(word);
                let wordProb = 0;

                for (let topic = 0; topic < this.numTopics; topic++) {
                    const topicGivenDoc = this.documentTopicCounts[docIdx][topic] / doc.length;
                    const wordGivenTopic = this.topicWordCounts[topic][wordId] / this.topicCounts[topic];
                    wordProb += topicGivenDoc * wordGivenTopic;
                }

                if (wordProb > 0) {
                    logLikelihood += Math.log(wordProb);
                }
                totalWords++;
            });
        });

        return Math.exp(-logLikelihood / totalWords);
    }

    /**
     * Main fit method
     */
    async fit(documents) {
        console.log('Starting LDA...');

        // Tokenize documents
        this.documents = documents.map(doc => this.tokenize(doc));
        console.log(`Tokenized ${this.documents.length} documents`);

        // Build vocabulary
        const vocabSize = this.buildVocabulary(this.documents);
        console.log(`Vocabulary size: ${vocabSize}`);

        // Initialize
        this.initializeAssignments();
        console.log('Initialized topic assignments');

        // Run Gibbs sampling
        await this.runGibbsSampling();
        console.log('Gibbs sampling complete');

        // Get results
        const topics = this.getTopWords(30);
        const documentTopics = this.getDocumentTopics();
        const perplexity = this.calculatePerplexity();

        console.log(`Perplexity: ${perplexity.toFixed(2)}`);

        return {
            numTopics: this.numTopics,
            topics,
            documentTopics,
            vocabulary: this.vocabulary,
            perplexity,
            topicWordCounts: this.topicWordCounts,
            documentTopicCounts: this.documentTopicCounts,
            topicCounts: this.topicCounts
        };
    }

    /**
     * Predict topic distribution for new document
     */
    predict(document, iterations = 20) {
        const words = this.tokenize(document);
        const docTopicCounts = Array(this.numTopics).fill(0);

        // Initialize random assignments
        const assignments = words.map(word => {
            if (!this.vocabulary.has(word)) return null;
            const topic = Math.floor(Math.random() * this.numTopics);
            docTopicCounts[topic]++;
            return topic;
        });

        // Run Gibbs sampling for this document
        for (let iter = 0; iter < iterations; iter++) {
            words.forEach((word, idx) => {
                if (!this.vocabulary.has(word)) return;

                const wordId = this.vocabulary.get(word);
                const oldTopic = assignments[idx];

                // Remove current assignment
                docTopicCounts[oldTopic]--;

                // Calculate probabilities
                const probs = [];
                let probSum = 0;

                for (let topic = 0; topic < this.numTopics; topic++) {
                    const docProb = (docTopicCounts[topic] + this.alpha) /
                                   (words.length + this.numTopics * this.alpha);
                    const wordProb = this.topicWordCounts[topic][wordId] / this.topicCounts[topic];
                    const prob = docProb * wordProb;
                    probs.push(prob);
                    probSum += prob;
                }

                // Sample new topic
                let sample = Math.random() * probSum;
                let newTopic = 0;
                let cumulative = 0;

                for (let topic = 0; topic < this.numTopics; topic++) {
                    cumulative += probs[topic];
                    if (sample <= cumulative) {
                        newTopic = topic;
                        break;
                    }
                }

                assignments[idx] = newTopic;
                docTopicCounts[newTopic]++;
            });
        }

        // Normalize to distribution
        const total = words.length;
        return docTopicCounts.map(count => count / total);
    }
}
