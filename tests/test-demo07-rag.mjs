#!/usr/bin/env node
/**
 * Comprehensive Test Suite for RAG (Demo 07)
 * Tests chunking strategies, retrieval mechanisms, embeddings, and edge cases
 * Run with: node test-rag.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Test Runner Class
// =============================================================================

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
        this.currentGroup = '';
    }

    setGroup(groupName) {
        this.currentGroup = groupName;
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Test Group: ${groupName}`);
        console.log('='.repeat(70));
    }

    assert(condition, testName, expected, actual) {
        this.total++;
        if (condition) {
            console.log(`✓ PASS: ${testName}`);
            this.passed++;
        } else {
            console.log(`✗ FAIL: ${testName}`);
            console.log(`  Expected: ${JSON.stringify(expected)}`);
            console.log(`  Actual: ${JSON.stringify(actual)}`);
            this.failed++;
        }
    }

    assertEqual(actual, expected, testName) {
        this.assert(actual === expected, testName, expected, actual);
    }

    assertNotEqual(actual, notExpected, testName) {
        this.assert(actual !== notExpected, testName, `not ${notExpected}`, actual);
    }

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    assertGreaterThanOrEqual(actual, threshold, testName) {
        this.assert(actual >= threshold, testName, `>= ${threshold}`, actual);
    }

    assertLessThan(actual, threshold, testName) {
        this.assert(actual < threshold, testName, `< ${threshold}`, actual);
    }

    assertLessThanOrEqual(actual, threshold, testName) {
        this.assert(actual <= threshold, testName, `<= ${threshold}`, actual);
    }

    assertAlmostEqual(actual, expected, testName, epsilon = 0.0001) {
        this.assert(
            Math.abs(actual - expected) < epsilon,
            testName,
            `~${expected} (within ${epsilon})`,
            actual
        );
    }

    assertArrayLength(array, expectedLength, testName) {
        this.assert(
            Array.isArray(array) && array.length === expectedLength,
            testName,
            `array of length ${expectedLength}`,
            `array of length ${array.length}`
        );
    }

    assertArrayNotEmpty(array, testName) {
        this.assert(
            Array.isArray(array) && array.length > 0,
            testName,
            'non-empty array',
            `array of length ${array.length}`
        );
    }

    assertTrue(value, testName) {
        this.assert(value === true, testName, true, value);
    }

    assertFalse(value, testName) {
        this.assert(value === false, testName, false, value);
    }

    assertContains(array, item, testName) {
        this.assert(
            array.includes(item),
            testName,
            `array containing ${item}`,
            array
        );
    }

    assertThrows(fn, testName) {
        let threw = false;
        try {
            fn();
        } catch (e) {
            threw = true;
        }
        this.assert(threw, testName, 'function to throw', threw ? 'threw' : 'did not throw');
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log('FINAL TEST SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total Tests: ${this.total}`);
        console.log(`Passed: ${this.passed} (${((this.passed/this.total)*100).toFixed(1)}%)`);
        console.log(`Failed: ${this.failed} (${((this.failed/this.total)*100).toFixed(1)}%)`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// =============================================================================
// Chunking Functions (from retriever.js logic)
// =============================================================================

function fixedSizeChunking(text, chunkSize = 100, overlap = 20) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chunks = [];
    const step = chunkSize - overlap;

    for (let i = 0; i < words.length; i += step) {
        const chunkWords = words.slice(i, i + chunkSize);
        const chunkText = chunkWords.join(' ');
        if (chunkText.trim().length > 0) {
            chunks.push({
                text: chunkText,
                startWord: i,
                endWord: i + chunkWords.length,
                wordCount: chunkWords.length
            });
        }
    }

    return chunks;
}

function sentenceChunking(text, maxSentences = 5) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];

    for (let i = 0; i < sentences.length; i += maxSentences) {
        const chunkSentences = sentences.slice(i, i + maxSentences);
        const chunkText = chunkSentences.join(' ').trim();

        if (chunkText.length > 0) {
            chunks.push({
                text: chunkText,
                sentenceStart: i,
                sentenceEnd: i + chunkSentences.length,
                sentenceCount: chunkSentences.length
            });
        }
    }

    return chunks;
}

function paragraphChunking(text) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const finalParagraphs = paragraphs.length > 0 ? paragraphs : [text];

    return finalParagraphs.map((paragraph, index) => ({
        text: paragraph.trim(),
        paragraphIndex: index
    }));
}

function slidingWindowChunking(text, windowSize = 100, step = 50) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chunks = [];

    for (let i = 0; i < words.length; i += step) {
        const chunkWords = words.slice(i, i + windowSize);
        if (chunkWords.length > 0) {
            chunks.push({
                text: chunkWords.join(' '),
                startWord: i,
                endWord: i + chunkWords.length,
                wordCount: chunkWords.length
            });
        }
    }

    return chunks;
}

// =============================================================================
// Mock Vector Store for Testing
// =============================================================================

class MockVectorStore {
    constructor() {
        this.embeddings = [];
        this.chunks = [];
    }

    // Simple mock embedding (character frequency vector - smaller dimension)
    embed(text) {
        const vector = new Array(32).fill(0);
        for (let i = 0; i < Math.min(text.length, 100); i++) {  // Limit text length processed
            const charCode = text.charCodeAt(i) % 32;
            vector[charCode]++;
        }
        // Normalize
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
    }

    addChunks(chunks) {
        for (const chunk of chunks) {
            const embedding = this.embed(chunk.text);
            this.embeddings.push(embedding);
            this.chunks.push(chunk);
        }
    }

    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    search(query, topK = 5) {
        if (this.chunks.length === 0) {
            return [];
        }

        const queryEmbedding = this.embed(query);

        const similarities = this.embeddings.map((embedding, index) => ({
            index,
            chunk: this.chunks[index],
            similarity: this.cosineSimilarity(queryEmbedding, embedding)
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, topK);
    }

    clear() {
        this.embeddings = [];
        this.chunks = [];
    }
}

// =============================================================================
// Test Suite
// =============================================================================

async function runTests() {
    console.log('\n' + '='.repeat(70));
    console.log('COMPREHENSIVE RAG TEST SUITE (Demo 07)');
    console.log('Testing: Chunking, Retrieval, Embeddings, Edge Cases');
    console.log('='.repeat(70));

    const runner = new TestRunner();

    // =========================================================================
    // Test Group 1: Fixed-Size Chunking
    // =========================================================================
    runner.setGroup('1. Fixed-Size Chunking');

    const text1 = "word ".repeat(250);
    const chunks1 = fixedSizeChunking(text1, 50, 10);

    runner.assertArrayNotEmpty(chunks1, "Should create chunks from text");
    runner.assertGreaterThan(chunks1.length, 1, "Should create multiple chunks");
    runner.assertLessThanOrEqual(chunks1[0].wordCount, 50, "First chunk should be <= 50 words");
    runner.assertEqual(chunks1[0].startWord, 0, "First chunk should start at word 0");

    // Test overlap
    const overlap = 10;
    const expectedStep = 50 - overlap;
    runner.assertEqual(chunks1[1].startWord, expectedStep, "Second chunk should respect overlap");

    // Test chunk properties
    runner.assertTrue('text' in chunks1[0], "Chunk should have 'text' property");
    runner.assertTrue('startWord' in chunks1[0], "Chunk should have 'startWord' property");
    runner.assertTrue('endWord' in chunks1[0], "Chunk should have 'endWord' property");

    // =========================================================================
    // Test Group 2: Sentence-Based Chunking
    // =========================================================================
    runner.setGroup('2. Sentence-Based Chunking');

    const text2 = "First sentence. Second sentence! Third sentence? Fourth sentence. Fifth sentence.";
    const chunks2 = sentenceChunking(text2, 2);

    runner.assertArrayNotEmpty(chunks2, "Should create sentence chunks");
    runner.assertGreaterThan(chunks2.length, 1, "Should create multiple sentence chunks");
    runner.assertLessThanOrEqual(chunks2[0].sentenceCount, 2, "First chunk should have <= 2 sentences");

    // Verify sentence structure
    const firstChunk = chunks2[0].text;
    runner.assertTrue(
        firstChunk.includes('.') || firstChunk.includes('!') || firstChunk.includes('?'),
        "Sentence chunk should contain sentence terminators"
    );

    // Test with single sentence
    const singleSentence = "Just one sentence.";
    const singleChunks = sentenceChunking(singleSentence, 5);
    runner.assertEqual(singleChunks.length, 1, "Single sentence should create one chunk");

    // Test with no punctuation
    const noPunctuation = "This has no end punctuation";
    const noPuncChunks = sentenceChunking(noPunctuation, 5);
    runner.assertEqual(noPuncChunks.length, 1, "Text without punctuation should create one chunk");

    // =========================================================================
    // Test Group 3: Paragraph-Based Chunking
    // =========================================================================
    runner.setGroup('3. Paragraph-Based Chunking');

    const text3 = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
    const chunks3 = paragraphChunking(text3);

    runner.assertEqual(chunks3.length, 3, "Should create 3 paragraph chunks");
    runner.assertEqual(chunks3[0].paragraphIndex, 0, "First paragraph should have index 0");
    runner.assertEqual(chunks3[1].paragraphIndex, 1, "Second paragraph should have index 1");

    // Test single paragraph
    const singlePara = "Just one paragraph.";
    const singleParaChunks = paragraphChunking(singlePara);
    runner.assertEqual(singleParaChunks.length, 1, "Single paragraph should create one chunk");

    // Test with excessive newlines
    const multiNewlines = "Para 1.\n\n\n\nPara 2.";
    const multiChunks = paragraphChunking(multiNewlines);
    runner.assertEqual(multiChunks.length, 2, "Multiple newlines should still create 2 chunks");

    // =========================================================================
    // Test Group 4: Sliding Window Chunking
    // =========================================================================
    runner.setGroup('4. Sliding Window Chunking');

    const text4 = "word ".repeat(100);
    const chunks4 = slidingWindowChunking(text4, 30, 15);

    runner.assertArrayNotEmpty(chunks4, "Should create sliding window chunks");
    runner.assertGreaterThan(chunks4.length, 1, "Should create multiple sliding windows");
    runner.assertEqual(chunks4[1].startWord, 15, "Second window should start at step position");

    // Verify overlap between consecutive windows
    const window1Words = chunks4[0].text.split(/\s+/);
    const window2Words = chunks4[1].text.split(/\s+/);
    runner.assertGreaterThan(window1Words.length, 0, "First window should have words");
    runner.assertGreaterThan(window2Words.length, 0, "Second window should have words");

    // Test window size constraint
    runner.assertLessThanOrEqual(chunks4[0].wordCount, 30, "Window should not exceed max size");

    // =========================================================================
    // Test Group 5: Chunk Size Variations
    // =========================================================================
    runner.setGroup('5. Chunk Size Variations');

    // Very small chunks
    const smallChunks = fixedSizeChunking("word ".repeat(20), 5, 1);
    runner.assertGreaterThan(smallChunks.length, 1, "Small chunk size should create multiple chunks");
    runner.assertLessThanOrEqual(smallChunks[0].wordCount, 5, "Small chunks should respect size limit");

    // Very large chunks
    const largeChunks = fixedSizeChunking("word ".repeat(50), 1000, 0);
    runner.assertEqual(largeChunks.length, 1, "Large chunk size should create single chunk");

    // Zero overlap
    const noOverlap = fixedSizeChunking("word ".repeat(100), 25, 0);
    runner.assertEqual(noOverlap[1].startWord, 25, "Zero overlap should have no word reuse");

    // Maximum overlap
    const maxOverlap = fixedSizeChunking("word ".repeat(100), 25, 24);
    runner.assertEqual(maxOverlap[1].startWord, 1, "Maximum overlap should step by 1");

    // =========================================================================
    // Test Group 6: Edge Cases - Empty and Whitespace
    // =========================================================================
    runner.setGroup('6. Edge Cases - Empty and Whitespace');

    const emptyText = "";
    const emptyChunks = fixedSizeChunking(emptyText, 100, 10);
    runner.assertEqual(emptyChunks.length, 0, "Empty text should produce no chunks");

    const whitespaceOnly = "   \n\t   ";
    const whitespaceChunks = fixedSizeChunking(whitespaceOnly, 100, 10);
    runner.assertEqual(whitespaceChunks.length, 0, "Whitespace-only text should produce no chunks");

    const singleWord = "word";
    const singleWordChunks = fixedSizeChunking(singleWord, 100, 10);
    runner.assertEqual(singleWordChunks.length, 1, "Single word should produce one chunk");
    runner.assertEqual(singleWordChunks[0].text, "word", "Single word chunk should contain the word");

    // =========================================================================
    // Test Group 7: Edge Cases - Special Characters
    // =========================================================================
    runner.setGroup('7. Edge Cases - Special Characters');

    const specialChars = "Hello! @#$% world? Testing... 123.";
    const specialChunks = fixedSizeChunking(specialChars, 10, 2);
    runner.assertArrayNotEmpty(specialChunks, "Should handle special characters");
    runner.assertTrue(
        specialChunks[0].text.includes('!') || specialChunks[0].text.includes('@'),
        "Should preserve special characters"
    );

    const unicode = "Hello 世界 🌍 Мир";
    const unicodeChunks = fixedSizeChunking(unicode, 10, 2);
    runner.assertArrayNotEmpty(unicodeChunks, "Should handle unicode characters");

    const newlines = "Line 1\nLine 2\nLine 3";
    const newlineChunks = fixedSizeChunking(newlines, 5, 1);
    runner.assertArrayNotEmpty(newlineChunks, "Should handle newlines in fixed chunking");

    // =========================================================================
    // Test Group 8: Edge Cases - Very Long Text
    // =========================================================================
    runner.setGroup('8. Edge Cases - Very Long Text');

    const veryLongText = "word ".repeat(500);
    const longChunks = fixedSizeChunking(veryLongText, 100, 20);

    runner.assertGreaterThan(longChunks.length, 3, "Very long text should create many chunks");
    runner.assertLessThanOrEqual(longChunks[0].wordCount, 100, "Long text chunks should respect size");
    runner.assertLessThanOrEqual(
        longChunks[longChunks.length - 1].wordCount,
        100,
        "Last chunk of long text should respect size"
    );

    // =========================================================================
    // Test Group 9: Mock Vector Store - Embedding Generation
    // =========================================================================
    runner.setGroup('9. Embedding Generation');

    const vectorStore = new MockVectorStore();

    const embedding1 = vectorStore.embed("test text");
    runner.assertEqual(embedding1.length, 32, "Embedding should have correct dimension");
    runner.assertTrue(
        embedding1.every(v => typeof v === 'number'),
        "Embedding should contain only numbers"
    );

    const embedding2 = vectorStore.embed("test text");
    const identical = embedding1.every((v, i) => v === embedding2[i]);
    runner.assertTrue(identical, "Same text should produce identical embeddings");

    const embedding3 = vectorStore.embed("different text");
    const different = !embedding1.every((v, i) => v === embedding3[i]);
    runner.assertTrue(different, "Different text should produce different embeddings");

    // Test empty string embedding
    const emptyEmbedding = vectorStore.embed("");
    runner.assertEqual(emptyEmbedding.length, 32, "Empty string should still produce embedding");

    // =========================================================================
    // Test Group 10: Cosine Similarity Calculation
    // =========================================================================
    runner.setGroup('10. Cosine Similarity Calculation');

    const vec1 = [1, 0, 0, 0];
    const vec2 = [1, 0, 0, 0];
    const similarity1 = vectorStore.cosineSimilarity(vec1, vec2);
    runner.assertEqual(similarity1, 1, "Identical vectors should have similarity 1");

    const vec3 = [1, 0, 0, 0];
    const vec4 = [0, 1, 0, 0];
    const similarity2 = vectorStore.cosineSimilarity(vec3, vec4);
    runner.assertEqual(similarity2, 0, "Orthogonal vectors should have similarity 0");

    const vec5 = [1, 1, 0, 0];
    const vec6 = [1, 1, 0, 0];
    const similarity3 = vectorStore.cosineSimilarity(vec5, vec6);
    runner.assertAlmostEqual(similarity3, 1, "Parallel vectors should have similarity ~1");

    // Test zero vectors
    const zeroVec = [0, 0, 0, 0];
    const nonZeroVec = [1, 1, 1, 1];
    const zeroSim = vectorStore.cosineSimilarity(zeroVec, nonZeroVec);
    runner.assertEqual(zeroSim, 0, "Zero vector should have similarity 0");

    // =========================================================================
    // Test Group 11: Vector Store Operations
    // =========================================================================
    runner.setGroup('11. Vector Store Operations');

    vectorStore.clear();
    const testChunks = [
        { text: "Machine learning is fascinating" },
        { text: "Deep learning uses neural networks" },
        { text: "Natural language processing" }
    ];

    vectorStore.addChunks(testChunks);
    runner.assertEqual(vectorStore.chunks.length, 3, "Should store all chunks");
    runner.assertEqual(vectorStore.embeddings.length, 3, "Should generate all embeddings");

    vectorStore.clear();
    runner.assertEqual(vectorStore.chunks.length, 0, "Clear should remove all chunks");
    runner.assertEqual(vectorStore.embeddings.length, 0, "Clear should remove all embeddings");

    // =========================================================================
    // Test Group 12: Similarity Search - Basic
    // =========================================================================
    runner.setGroup('12. Similarity Search - Basic');

    vectorStore.clear();
    const searchChunks = [
        { text: "Python programming language" },
        { text: "JavaScript web development" },
        { text: "Python data science" },
        { text: "Java enterprise applications" }
    ];
    vectorStore.addChunks(searchChunks);

    const results1 = vectorStore.search("Python", 2);
    runner.assertEqual(results1.length, 2, "Should return top-k results");
    runner.assertTrue(results1[0].similarity >= results1[1].similarity, "Results should be sorted by similarity");
    runner.assertTrue('chunk' in results1[0], "Result should contain chunk");
    runner.assertTrue('similarity' in results1[0], "Result should contain similarity score");

    // =========================================================================
    // Test Group 13: Similarity Search - Top-K Variations
    // =========================================================================
    runner.setGroup('13. Similarity Search - Top-K Variations');

    const results2 = vectorStore.search("programming", 1);
    runner.assertEqual(results2.length, 1, "Top-1 should return single result");

    const results3 = vectorStore.search("development", 10);
    runner.assertLessThanOrEqual(results3.length, 4, "Should not return more results than available");

    const results4 = vectorStore.search("completely unrelated query xyz", 2);
    runner.assertEqual(results4.length, 2, "Should still return results even for unrelated query");

    // =========================================================================
    // Test Group 14: Similarity Search - Empty Store
    // =========================================================================
    runner.setGroup('14. Similarity Search - Empty Store');

    vectorStore.clear();
    const emptyResults = vectorStore.search("any query", 5);
    runner.assertEqual(emptyResults.length, 0, "Empty store should return no results");

    // =========================================================================
    // Test Group 15: Context Assembly
    // =========================================================================
    runner.setGroup('15. Context Assembly and Formatting');

    function formatContext(retrievedChunks) {
        let context = '';
        retrievedChunks.forEach((result, index) => {
            context += `Document ${index + 1}:\n`;
            context += `${result.chunk.text}\n`;
            context += `(Relevance: ${(result.similarity * 100).toFixed(1)}%)\n\n`;
        });
        return context;
    }

    vectorStore.clear();
    vectorStore.addChunks([
        { text: "First document about AI" },
        { text: "Second document about ML" }
    ]);

    const contextResults = vectorStore.search("AI", 2);
    const context = formatContext(contextResults);

    runner.assertTrue(context.includes("Document 1"), "Context should include document labels");
    runner.assertTrue(context.includes("Relevance:"), "Context should include relevance scores");
    runner.assertTrue(context.length > 0, "Context should not be empty");

    // =========================================================================
    // Test Group 16: Chunking Statistics
    // =========================================================================
    runner.setGroup('16. Chunking Statistics');

    function getChunkingStats(chunks) {
        if (chunks.length === 0) return null;

        const wordCounts = chunks.map(c => c.text.split(/\s+/).length);
        const avgLength = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
        const minLength = Math.min(...wordCounts);
        const maxLength = Math.max(...wordCounts);

        return {
            totalChunks: chunks.length,
            avgChunkLength: avgLength,
            minChunkLength: minLength,
            maxChunkLength: maxLength
        };
    }

    const statsChunks = fixedSizeChunking("word ".repeat(100), 20, 5);
    const stats = getChunkingStats(statsChunks);

    runner.assertNotEqual(stats, null, "Should return stats for non-empty chunks");
    runner.assertEqual(stats.totalChunks, statsChunks.length, "Should count all chunks");
    runner.assertGreaterThan(stats.avgChunkLength, 0, "Average length should be positive");
    runner.assertLessThanOrEqual(stats.maxChunkLength, 20, "Max length should respect chunk size");

    const emptyStats = getChunkingStats([]);
    runner.assertEqual(emptyStats, null, "Should return null for empty chunks");

    // =========================================================================
    // Test Group 17: Query Processing Edge Cases
    // =========================================================================
    runner.setGroup('17. Query Processing Edge Cases');

    vectorStore.clear();
    vectorStore.addChunks([
        { text: "Normal document text" },
        { text: "Another normal document" }
    ]);

    // Very short query
    const shortQuery = vectorStore.search("AI", 2);
    runner.assertEqual(shortQuery.length, 2, "Should handle very short queries");

    // Very long query
    const longQueryText = "word ".repeat(50);
    const longQuery = vectorStore.search(longQueryText, 2);
    runner.assertEqual(longQuery.length, 2, "Should handle very long queries");

    // Query with special characters
    const specialQuery = vectorStore.search("@#$%^&*()", 2);
    runner.assertEqual(specialQuery.length, 2, "Should handle special character queries");

    // Empty query
    const emptyQuery = vectorStore.search("", 2);
    runner.assertEqual(emptyQuery.length, 2, "Should handle empty queries");

    // =========================================================================
    // Test Group 18: Chunk Overlap Validation
    // =========================================================================
    runner.setGroup('18. Chunk Overlap Validation');

    const overlapText = "one two three four five six seven eight nine ten";
    const overlapChunks = fixedSizeChunking(overlapText, 5, 2);

    runner.assertGreaterThan(overlapChunks.length, 1, "Should create overlapping chunks");

    // Verify overlap exists
    const words1 = overlapChunks[0].text.split(/\s+/);
    const words2 = overlapChunks[1].text.split(/\s+/);
    const lastWords1 = words1.slice(-2).join(' ');
    const firstWords2 = words2.slice(0, 2).join(' ');

    runner.assertEqual(
        lastWords1,
        firstWords2,
        "Consecutive chunks should have overlapping content"
    );

    // =========================================================================
    // Test Group 19: Sentence Chunking Edge Cases
    // =========================================================================
    runner.setGroup('19. Sentence Chunking Edge Cases');

    // Multiple punctuation types
    const mixedPunct = "Question? Exclamation! Statement. Another?";
    const mixedChunks = sentenceChunking(mixedPunct, 2);
    runner.assertGreaterThan(mixedChunks.length, 1, "Should handle mixed punctuation");

    // Abbreviations (should not split incorrectly)
    const abbrev = "Dr. Smith works at U.S.A. Inc. in N.Y.C. He is great.";
    const abbrevChunks = sentenceChunking(abbrev, 10);
    runner.assertArrayNotEmpty(abbrevChunks, "Should handle abbreviations");

    // No ending punctuation
    const noEnd = "This sentence has no ending";
    const noEndChunks = sentenceChunking(noEnd, 5);
    runner.assertEqual(noEndChunks.length, 1, "Should handle sentences without ending punctuation");

    // =========================================================================
    // Test Group 20: Paragraph Chunking Edge Cases
    // =========================================================================
    runner.setGroup('20. Paragraph Chunking Edge Cases');

    // Single newline (should not split)
    const singleNewline = "Line 1\nLine 2";
    const singleNLChunks = paragraphChunking(singleNewline);
    runner.assertEqual(singleNLChunks.length, 1, "Single newline should not create separate paragraphs");

    // Triple newlines
    const tripleNewline = "Para 1\n\n\nPara 2";
    const tripleNLChunks = paragraphChunking(tripleNewline);
    runner.assertEqual(tripleNLChunks.length, 2, "Triple newlines should create 2 paragraphs");

    // Windows-style line endings
    const windowsLines = "Para 1\r\n\r\nPara 2";
    const windowsChunks = paragraphChunking(windowsLines);
    runner.assertGreaterThan(windowsChunks.length, 0, "Should handle Windows line endings");

    // =========================================================================
    // Test Group 21: Retrieval Ranking
    // =========================================================================
    runner.setGroup('21. Retrieval Ranking and Scoring');

    vectorStore.clear();
    vectorStore.addChunks([
        { text: "artificial intelligence and machine learning" },
        { text: "completely unrelated topic about cooking" },
        { text: "AI and deep learning neural networks" },
        { text: "gardening and plant care tips" }
    ]);

    const rankResults = vectorStore.search("artificial intelligence", 4);

    runner.assertEqual(rankResults.length, 4, "Should return all requested results");
    runner.assertGreaterThan(
        rankResults[0].similarity,
        rankResults[3].similarity,
        "First result should be more similar than last"
    );

    // Verify descending order
    for (let i = 0; i < rankResults.length - 1; i++) {
        runner.assertGreaterThanOrEqual(
            rankResults[i].similarity,
            rankResults[i + 1].similarity,
            `Result ${i} should be >= Result ${i + 1} in similarity`
        );
    }

    // =========================================================================
    // Test Group 22: Boundary Conditions
    // =========================================================================
    runner.setGroup('22. Boundary Conditions');

    // Chunk size = 1
    const size1Chunks = fixedSizeChunking("a b c d e", 1, 0);
    runner.assertEqual(size1Chunks.length, 5, "Chunk size 1 should create chunk per word");

    // Overlap = chunk size (invalid but should handle)
    const equalOverlap = fixedSizeChunking("word ".repeat(20), 10, 10);
    runner.assertGreaterThan(equalOverlap.length, 0, "Should handle overlap = chunk size");

    // Text shorter than chunk size
    const shortText = "short text";
    const shortChunks = fixedSizeChunking(shortText, 100, 10);
    runner.assertEqual(shortChunks.length, 1, "Short text should create single chunk");

    // =========================================================================
    // Test Group 23: Data Integrity
    // =========================================================================
    runner.setGroup('23. Data Integrity');

    const originalText = "This is the original text content";
    const integrityChunks = fixedSizeChunking(originalText, 3, 1);

    // Reconstruct text from chunks
    const reconstructed = integrityChunks.map(c => c.text).join(' ');
    runner.assertTrue(
        reconstructed.includes("original"),
        "Chunks should preserve original content"
    );

    // Verify no data loss
    const words = originalText.split(/\s+/).filter(w => w.length > 0);
    const chunkWords = integrityChunks.flatMap(c => c.text.split(/\s+/));
    runner.assertGreaterThanOrEqual(
        chunkWords.length,
        words.length,
        "Chunking should not lose words"
    );

    // =========================================================================
    // Test Group 24: Multiple Document Handling
    // =========================================================================
    runner.setGroup('24. Multiple Document Handling');

    const doc1Chunks = fixedSizeChunking("Doc one", 2, 0);
    const doc2Chunks = fixedSizeChunking("Doc two", 2, 0);
    const doc3Chunks = fixedSizeChunking("Doc three", 2, 0);

    const allDocChunks = [...doc1Chunks, ...doc2Chunks, ...doc3Chunks];
    runner.assertGreaterThan(allDocChunks.length, 2, "Should handle multiple documents");

    // =========================================================================
    // Final Summary
    // =========================================================================
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
    console.error('\n❌ FATAL ERROR running tests:', error);
    console.error(error.stack);
    process.exit(1);
});
