/**
 * Test script to verify ELIZA fixes from Demo 01 work in Demo 15
 * Run with: node test-eliza-fixes.mjs
 */

import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock fetch for loading rules in Node.js environment
global.fetch = async function(url) {
    // Handle relative paths - resolve them relative to the demos directory
    let filePath;
    if (url.startsWith('../../')) {
        // Called from Demo 15 wrapper (e.g., '../../01-eliza/data/eliza-rules.json')
        // Resolve relative to demos/15-chatbot-evolution/js/
        filePath = join(__dirname, '../demos/15-chatbot-evolution/js', url);
    } else if (url.startsWith('../')) {
        // One level up
        filePath = join(__dirname, '../demos', url);
    } else if (url.startsWith('data/')) {
        // Called from Demo 01, resolve relative to demos/01-eliza/
        filePath = join(__dirname, '../demos/01-eliza', url);
    } else {
        // Absolute or other path
        filePath = url;
    }

    const content = await readFile(filePath, 'utf-8');
    return {
        json: async () => JSON.parse(content)
    };
};

// Import the Eliza wrapper from Demo 15 (which now imports from Demo 01)
const elizaWrapperPath = pathToFileURL(join(__dirname, '../demos/15-chatbot-evolution/js/eliza.js')).href;
const { Eliza } = await import(elizaWrapperPath);

// Import ElizaEngine directly from Demo 01 for testing
const elizaEnginePath = pathToFileURL(join(__dirname, '../demos/01-eliza/js/eliza-engine.js')).href;
const { ElizaEngine } = await import(elizaEnginePath);

async function runTests() {
    console.log('='.repeat(60));
    console.log('ELIZA Fixes Verification - Demo 15');
    console.log('Testing that Demo 15 correctly uses Demo 01 implementation');
    console.log('='.repeat(60));
    console.log();

    try {
        // Initialize ELIZA using Demo 15's wrapper (which loads from Demo 01)
        console.log('Loading ELIZA engine via Demo 15 wrapper...');
        const elizaWrapper = new Eliza();
        await elizaWrapper.ensureInitialized();
        const eliza = elizaWrapper.engine;

        console.log('✓ ELIZA loaded successfully from Demo 01!\n');

        // Test 1: Classic conversation
        console.log('Test 1: Classic ELIZA Conversation');
        console.log('-'.repeat(60));

        const classicTests = [
            { input: "Men are all alike.", expectedKeyword: "alike" },
            { input: "They're always bugging us about something or other.", expectedKeyword: "always" },
            { input: "Well, my boyfriend made me come here.", expectedKeyword: "my" },
            { input: "I need some help, that much seems certain.", expectedKeyword: "i" }
        ];

        let classicPassed = 0;
        for (const test of classicTests) {
            const response = eliza.getResponse(test.input);
            const matchedKeyword = response.matchInfo ? response.matchInfo.keyword : 'unknown';
            const pass = matchedKeyword === test.expectedKeyword;

            console.log(`Input: "${test.input}"`);
            console.log(`Response: ${response.response}`);
            console.log(`Matched keyword: ${matchedKeyword} (expected: ${test.expectedKeyword})`);
            console.log(`Result: ${pass ? '✓ PASS' : '✗ FAIL'}\n`);

            if (pass) classicPassed++;
        }

        console.log(`Classic Test Summary: ${classicPassed}/${classicTests.length} passed\n`);

        // Reset for next test
        eliza.reset();

        // Test 2: Keyword priority (matching original ELIZA behavior)
        console.log('Test 2: Keyword Priority (Original ELIZA Behavior)');
        console.log('-'.repeat(60));

        // Keywords are matched in the order they appear in the INPUT.
        // When "i" appears first, it gets tried first. If "i" has a matching pattern
        // (including catch-all "*" or specific patterns like "* i am * @sad *"),
        // it will be used before later keywords.
        const priorityTests = [
            { input: "I am sad and depressed.", expectedKeyword: "i" }, // "i" with "* i am * @sad *" matches
            { input: "I feel unhappy.", expectedKeyword: "i" },
            { input: "I need help.", expectedKeyword: "i" },
            { input: "I'm sorry.", expectedKeyword: "i" }, // "i" appears first, "* i am *" matches
            { input: "I apologise.", expectedKeyword: "i" } // "i" appears first, catch-all matches
        ];

        let priorityPassed = 0;
        for (const test of priorityTests) {
            const response = eliza.getResponse(test.input);
            const matchedKeyword = response.matchInfo ? response.matchInfo.keyword : 'unknown';
            const pass = matchedKeyword === test.expectedKeyword;

            console.log(`Input: "${test.input}"`);
            console.log(`Response: ${response.response}`);
            console.log(`Matched keyword: ${matchedKeyword} (expected: ${test.expectedKeyword})`);
            console.log(`Result: ${pass ? '✓ PASS' : '✗ FAIL'}\n`);

            if (pass) priorityPassed++;
        }

        console.log(`Keyword Priority Test Summary: ${priorityPassed}/${priorityTests.length} passed\n`);

        // Reset for next test
        eliza.reset();

        // Test 3: Formatting
        console.log('Test 3: Response Formatting (Sentence Case)');
        console.log('-'.repeat(60));

        const formatTests = [
            "I feel happy.",
            "Tell me about computers.",
            "Can you help me?"
        ];

        let formatPassed = 0;
        for (const input of formatTests) {
            const response = eliza.getResponse(input);
            const isAllUppercase = response.response === response.response.toUpperCase();
            const isSentenceCase = response.response.charAt(0) === response.response.charAt(0).toUpperCase();
            const pass = !isAllUppercase && isSentenceCase;

            console.log(`Input: "${input}"`);
            console.log(`Response: ${response.response}`);
            console.log(`All uppercase: ${isAllUppercase ? 'Yes (BAD)' : 'No (GOOD)'}`);
            console.log(`Sentence case: ${isSentenceCase ? 'Yes (GOOD)' : 'No (BAD)'}`);
            console.log(`Result: ${pass ? '✓ PASS' : '✗ FAIL'}\n`);

            if (pass) formatPassed++;
        }

        console.log(`Formatting Test Summary: ${formatPassed}/${formatTests.length} passed\n`);

        // Overall summary
        const totalTests = classicTests.length + priorityTests.length + formatTests.length;
        const totalPassed = classicPassed + priorityPassed + formatPassed;

        console.log('='.repeat(60));
        console.log(`OVERALL RESULTS: ${totalPassed}/${totalTests} tests passed`);
        console.log('='.repeat(60));

        if (totalPassed === totalTests) {
            console.log('✓ All tests passed! ELIZA fixes successfully integrated.');
            process.exit(0);
        } else {
            console.log('✗ Some tests failed. Please review the output above.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error running tests:', error);
        process.exit(1);
    }
}

// Run tests
runTests();
