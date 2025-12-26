#!/usr/bin/env node
/**
 * Test script for ALICE Full implementation with all 95,026 patterns
 * Runs in Node.js to test pattern matching without browser
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AliceFullTest {
    constructor() {
        this.context = {
            that: "",
            topic: "general",
            userName: "",
            botName: "A.L.I.C.E.",
            fullName: "Artificial Linguistic Internet Computer Entity",
            name: "ALICE",
            species: "robot",
            location: "California",
            vocabulary: "120000",
            size: "95026",
            developers: "100",
            birthday: "November 23, 1995",
            birthplace: "San Francisco, California",
            botmaster: "Dr. Richard Wallace",
            gender: "female",
            age: new Date().getFullYear() - 1995,
            version: "1.0 Full"
        };

        this.patterns = [];
        this.patternsLoaded = false;
        this.sraiDepth = 0;
        this.maxSraiDepth = 50;
    }

    loadPatterns(filepath) {
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

    processTemplate(template, wildcards = []) {
        if (!template) return "";

        let result = template;

        // Process SRAI (recursive pattern matching)
        const sraiMatches = [...result.matchAll(/\{\{SRAI:([^}]+)\}\}/g)];
        for (const match of sraiMatches) {
            const srai = match[1];
            const response = this.srai(srai);
            result = result.replace(match[0], response);
        }

        // Process RANDOM
        result = result.replace(/\{\{RANDOM:(\[.*?\])\}\}/g, (match, options) => {
            try {
                const optionList = JSON.parse(options);
                return optionList[Math.floor(Math.random() * optionList.length)];
            } catch (e) {
                return "";
            }
        });

        // Process BOT properties
        result = result.replace(/\{\{BOT:([^}]+)\}\}/g, (match, property) => {
            return this.context[property] || this.context.botName || "";
        });

        // Process GET context variables
        result = result.replace(/\{\{GET:([^}]+)\}\}/g, (match, varName) => {
            return this.context[varName] || "";
        });

        // Process SET context variables
        result = result.replace(/\{\{SET:([^:]+):([^}]+)\}\}/g, (match, varName, value) => {
            this.context[varName] = value;
            return value;
        });

        // Process PERSON (pronoun transformation)
        result = result.replace(/\{\{PERSON:([^}]+)\}\}/g, (match, text) => {
            if (text === 'WILDCARD' && wildcards.length > 0) {
                return this.transformPerson(wildcards[0]);
            }
            return this.transformPerson(text);
        });

        // Process THINK (execute but don't output)
        result = result.replace(/\{\{THINK:([^}]+)\}\}/g, (match, content) => {
            this.processTemplate(content, wildcards);
            return "";
        });

        // Process STAR (wildcard captures)
        result = result.replace(/\{\{STAR:(\d+)\}\}/g, (match, index) => {
            const idx = parseInt(index) - 1;
            return wildcards[idx] || "";
        });

        // Clean up any remaining template markers
        result = result.replace(/\{\{[^}]*\}\}/g, '');

        return result.trim();
    }

    transformPerson(text) {
        const transformations = {
            'i am': 'you are',
            'you are': 'I am',
            'i was': 'you were',
            'you were': 'I was',
            'my': 'your',
            'your': 'my',
            'mine': 'yours',
            'yours': 'mine',
            'i': 'you',
            'you': 'I',
            'me': 'you',
            'myself': 'yourself',
            'yourself': 'myself'
        };

        let result = text;
        for (const [from, to] of Object.entries(transformations)) {
            const regex = new RegExp(`\\b${from}\\b`, 'gi');
            result = result.replace(regex, to);
        }
        return result;
    }

    srai(input) {
        this.sraiDepth++;
        if (this.sraiDepth > this.maxSraiDepth) {
            this.sraiDepth = 0;
            return "I'm having trouble processing that.";
        }

        const response = this.matchPattern(input, true);
        this.sraiDepth--;
        return response;
    }

    normalize(input) {
        return input
            .trim()
            .toUpperCase()
            .replace(/[?!.,:;]+$/, '')
            .replace(/\s+/g, ' ')
            .replace(/'/g, '')
            .replace(/"/g, '');
    }

    matchPattern(input, isSrai = false) {
        const normalizedInput = this.normalize(input);

        for (const pattern of this.patterns) {
            if (pattern.topic && this.context.topic !== pattern.topic) {
                continue;
            }

            if (pattern.that && !this.normalize(this.context.that).includes(this.normalize(pattern.that))) {
                continue;
            }

            const regex = new RegExp('^' + pattern.regex + '$', 'i');
            const match = normalizedInput.match(regex);

            if (match) {
                const wildcards = match.slice(1);
                const response = this.processTemplate(pattern.template, wildcards);

                if (!isSrai) {
                    this.context.that = response;
                }

                return response;
            }
        }

        return this.getDefaultResponse(input);
    }

    getDefaultResponse(input) {
        const defaults = [
            "I'm not sure I understand that completely.",
            "Can you rephrase that?",
            "Tell me more.",
            "That's interesting. Go on."
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    getResponse(input) {
        if (!this.patternsLoaded) {
            return "Please wait, I'm still loading my knowledge base...";
        }

        this.sraiDepth = 0;
        const response = this.matchPattern(input, false);
        return response;
    }
}

// Run tests
async function runTests() {
    console.log('='.repeat(70));
    console.log('ALICE Full Pattern Test');
    console.log('='.repeat(70));
    console.log();

    const alice = new AliceFullTest();
    const patternsFile = path.join(__dirname, '../demos/15-chatbot-evolution/data', 'alice-patterns-full.json');

    // Load patterns
    const loaded = alice.loadPatterns(patternsFile);
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
        const response = alice.getResponse(input);
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
