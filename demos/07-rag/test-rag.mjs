#!/usr/bin/env node
/**
 * Test suite for RAG (Demo 07) - Chunking and retrieval logic
 * Run with: node test-rag.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
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

    assertGreaterThan(actual, threshold, testName) {
        this.assert(actual > threshold, testName, `> ${threshold}`, actual);
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// Test chunking strategies
function chunkBySentence(text, chunkSize = 500) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
}

function chunkByTokens(text, chunkSize = 100, overlap = 20) {
    const words = text.split(/\s+/);
    const chunks = [];
    let i = 0;

    while (i < words.length) {
        const end = Math.min(i + chunkSize, words.length);
        chunks.push(words.slice(i, end).join(' '));
        i += chunkSize - overlap;
    }
    return chunks;
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('RAG Chunking Test Suite (Demo 07)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // Test 1: Sentence Chunking
    console.log('\n--- Test Group 1: Sentence Chunking ---\n');

    const text1 = "First sentence. Second sentence. Third sentence.";
    const chunks1 = chunkBySentence(text1, 25);

    runner.assertGreaterThan(chunks1.length, 0, "Should create chunks");
    runner.assert(
        chunks1.every(c => typeof c === 'string'),
        "All chunks should be strings",
        "all strings",
        "checked"
    );

    // Test 2: Token Chunking
    console.log('\n--- Test Group 2: Token Chunking ---\n');

    const text2 = "word ".repeat(50);
    const chunks2 = chunkByTokens(text2, 10, 2);

    runner.assertGreaterThan(chunks2.length, 0, "Should create token chunks");
    runner.assert(
        chunks2[0].split(/\s+/).length <= 10,
        "First chunk should have <= 10 tokens",
        "<= 10",
        chunks2[0].split(/\s+/).length
    );

    // Test 3: Overlap
    console.log('\n--- Test Group 3: Chunk Overlap ---\n');

    const text3 = "a b c d e f g h i j";
    const overlapping = chunkByTokens(text3, 5, 2);

    runner.assertGreaterThan(overlapping.length, 1, "Should create multiple overlapping chunks");

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
