#!/usr/bin/env node
/**
 * Test script for ALICE Full implementation with original ~41K patterns
 * Uses the authentic 2001 Loebner Prize winning pattern set (no Mindpixel)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AliceFull } from '../demos/chatbot-evolution/js/alice-full.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test wrapper that loads patterns from file instead of URL
 */
class AliceFullTest extends AliceFull {
    loadPatternsFromFile(filepath) {
        try {
            const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            console.log(`Loading ALICE patterns...`);
            console.log(`Source: ${data.metadata.source}`);
            console.log(`Total patterns: ${data.metadata.total_patterns}`);
            console.log(`Files: ${data.metadata.files_processed}`);

            this.patterns = data.patterns;
            this.patternsLoaded = true;

            // Sort patterns by priority (highest first)
            this.patterns.sort((a, b) => b.priority - a.priority);

            console.log(`Patterns loaded and sorted by priority.\n`);
            return true;
        } catch (error) {
            console.error('Error loading patterns:', error);
            return false;
        }
    }
}

// Run tests
async function runTests() {
    console.log('='.repeat(70));
    console.log('ALICE Full Pattern Test');
    console.log('='.repeat(70));
    console.log();

    const alice = new AliceFullTest();
    const patternsFile = path.join(__dirname, '../demos/chatbot-evolution/data', 'alice-patterns-original.json');

    // Load patterns from file
    const loaded = alice.loadPatternsFromFile(patternsFile);
    if (!loaded) {
        console.error('Failed to load patterns!');
        process.exit(1);
    }

    // Test inputs
    const testInputs = [
        "Hello",
        "What is your name?",
        "Who created you?",
        "What does ALICE stand for?",
        "How are you different from ELIZA?",
        "Are you a robot?",
        "What is AIML?",
        "Tell me a joke",
        "What is the meaning of life?",
        "My name is Bob",
        "What is my name?",
        "Do you think?",
        "Can you learn?",
        "Are you alive?",
        "What is your purpose?",
        "Where do you live?",
        "How old are you?",
        "What is artificial intelligence?",
        "Do you have feelings?",
        "Goodbye"
    ];

    console.log('Running test conversations...\n');
    console.log('='.repeat(70));

    for (const input of testInputs) {
        const response = await alice.getResponse(input);
        console.log(`\nYOU: ${input}`);
        console.log(`ALICE: ${response}`);
        console.log('-'.repeat(70));
    }

    console.log('\n' + '='.repeat(70));
    console.log('Test Complete!');
    console.log(`Total patterns loaded: ${alice.patterns.length.toLocaleString()}`);
    console.log('='.repeat(70));
}

runTests().catch(console.error);
