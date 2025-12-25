/**
 * Retriever for RAG System
 * Handles document chunking and retrieval logic
 */

class Retriever {
    constructor(vectorStore) {
        this.vectorStore = vectorStore;
        this.documents = [];
        this.chunks = [];
    }

    /**
     * Load documents into the retriever
     */
    loadDocuments(documents) {
        this.documents = documents;
        console.log(`Loaded ${documents.length} documents`);
    }

    /**
     * Chunk documents using specified strategy
     */
    chunkDocuments(strategy = 'fixed', chunkSize = 200, overlap = 50) {
        this.chunks = [];

        for (const doc of this.documents) {
            const docChunks = this.chunkDocument(doc, strategy, chunkSize, overlap);
            this.chunks.push(...docChunks);
        }

        console.log(`Created ${this.chunks.length} chunks using ${strategy} strategy`);
        return this.chunks;
    }

    /**
     * Chunk a single document
     */
    chunkDocument(doc, strategy, chunkSize, overlap) {
        const chunks = [];

        switch (strategy) {
            case 'fixed':
                chunks.push(...this.fixedSizeChunking(doc, chunkSize, overlap));
                break;
            case 'sentence':
                chunks.push(...this.sentenceChunking(doc, chunkSize));
                break;
            case 'paragraph':
                chunks.push(...this.paragraphChunking(doc));
                break;
            default:
                chunks.push(...this.fixedSizeChunking(doc, chunkSize, overlap));
        }

        return chunks;
    }

    /**
     * Fixed-size chunking with overlap
     */
    fixedSizeChunking(doc, chunkSize, overlap) {
        const chunks = [];
        const words = doc.content.split(/\s+/);
        const step = chunkSize - overlap;

        for (let i = 0; i < words.length; i += step) {
            const chunkWords = words.slice(i, i + chunkSize);
            const chunkText = chunkWords.join(' ');

            if (chunkText.trim().length > 0) {
                chunks.push({
                    text: chunkText,
                    documentId: doc.id,
                    documentTitle: doc.title,
                    chunkIndex: chunks.length,
                    startWord: i,
                    endWord: i + chunkWords.length,
                    metadata: doc.metadata
                });
            }
        }

        return chunks;
    }

    /**
     * Sentence-based chunking
     */
    sentenceChunking(doc, maxSentences = 5) {
        const chunks = [];

        // Simple sentence splitting (improved regex)
        const sentences = doc.content.match(/[^.!?]+[.!?]+/g) || [doc.content];

        for (let i = 0; i < sentences.length; i += maxSentences) {
            const chunkSentences = sentences.slice(i, i + maxSentences);
            const chunkText = chunkSentences.join(' ').trim();

            if (chunkText.length > 0) {
                chunks.push({
                    text: chunkText,
                    documentId: doc.id,
                    documentTitle: doc.title,
                    chunkIndex: chunks.length,
                    sentenceStart: i,
                    sentenceEnd: i + chunkSentences.length,
                    metadata: doc.metadata
                });
            }
        }

        return chunks;
    }

    /**
     * Paragraph-based chunking
     */
    paragraphChunking(doc) {
        const chunks = [];

        // Split by double newlines or periods followed by whitespace
        const paragraphs = doc.content.split(/\n\n+/).filter(p => p.trim().length > 0);

        // If no paragraphs found, treat as single paragraph
        const finalParagraphs = paragraphs.length > 0 ? paragraphs : [doc.content];

        finalParagraphs.forEach((paragraph, index) => {
            const chunkText = paragraph.trim();

            if (chunkText.length > 0) {
                chunks.push({
                    text: chunkText,
                    documentId: doc.id,
                    documentTitle: doc.title,
                    chunkIndex: index,
                    paragraphIndex: index,
                    metadata: doc.metadata
                });
            }
        });

        return chunks;
    }

    /**
     * Index chunks in vector store
     */
    async indexChunks(onProgress = null) {
        if (this.chunks.length === 0) {
            throw new Error('No chunks to index. Call chunkDocuments first.');
        }

        await this.vectorStore.addChunks(this.chunks, onProgress);
        console.log('Chunks indexed successfully');
    }

    /**
     * Retrieve relevant chunks for a query
     */
    async retrieve(query, topK = 5) {
        const results = await this.vectorStore.search(query, topK);
        return results;
    }

    /**
     * Format retrieved chunks for context
     */
    formatContext(retrievedChunks) {
        let context = '';

        retrievedChunks.forEach((result, index) => {
            context += `Document ${index + 1}: ${result.chunk.documentTitle}\n`;
            context += `${result.chunk.text}\n`;
            context += `(Relevance: ${(result.similarity * 100).toFixed(1)}%)\n\n`;
        });

        return context;
    }

    /**
     * Get all chunks (for visualization)
     */
    getAllChunks() {
        return this.chunks;
    }

    /**
     * Get chunking statistics
     */
    getChunkingStats() {
        if (this.chunks.length === 0) {
            return null;
        }

        const chunkLengths = this.chunks.map(c => c.text.split(/\s+/).length);
        const avgLength = chunkLengths.reduce((a, b) => a + b, 0) / chunkLengths.length;
        const minLength = Math.min(...chunkLengths);
        const maxLength = Math.max(...chunkLengths);

        // Group by document
        const byDocument = {};
        this.chunks.forEach(chunk => {
            if (!byDocument[chunk.documentId]) {
                byDocument[chunk.documentId] = [];
            }
            byDocument[chunk.documentId].push(chunk);
        });

        return {
            totalChunks: this.chunks.length,
            totalDocuments: Object.keys(byDocument).length,
            avgChunkLength: avgLength.toFixed(1),
            minChunkLength: minLength,
            maxChunkLength: maxLength,
            chunksPerDocument: Object.entries(byDocument).map(([docId, chunks]) => ({
                documentId: docId,
                documentTitle: chunks[0].documentTitle,
                chunkCount: chunks.length
            }))
        };
    }

    /**
     * Clear all data
     */
    clear() {
        this.documents = [];
        this.chunks = [];
        this.vectorStore.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Retriever;
}
