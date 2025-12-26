/**
 * Test script to verify ELIZA fixes from Demo 01 work in Demo 15
 * Run with: node test-eliza-fixes.mjs
 */

import { ElizaEngine } from '../demos/15-chatbot-evolution/js/eliza-engine.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTests() {
    console.log('='.repeat(60));
    console.log('ELIZA Fixes Verification - Demo 15');
    console.log('='.repeat(60));
    console.log();

    try {
        // Initialize ELIZA
        console.log('Loading ELIZA engine...');
        const eliza = new ElizaEngine();

        // Load rules manually (path relative to this script file)
        const rulesData = JSON.parse(
            await readFile(join(__dirname, '../demos/15-chatbot-evolution/data', 'eliza-rules.json'), 'utf-8')
        );
        await eliza.loadRules(rulesData);

        console.log('✓ ELIZA loaded successfully!\n');

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

        // Test 2: Sorry priority
        console.log('Test 2: "Sorry" Keyword Priority');
        console.log('-'.repeat(60));

        const sorryTests = [
            { input: "I am sad and depressed.", shouldMatchSorry: false },
            { input: "I feel unhappy.", shouldMatchSorry: false },
            { input: "I need help.", shouldMatchSorry: false },
            { input: "I'm sorry.", shouldMatchSorry: true },
            { input: "I apologise.", shouldMatchSorry: true }
        ];

        let sorryPassed = 0;
        for (const test of sorryTests) {
            const response = eliza.getResponse(test.input);
            const matchedSorry = response.matchInfo &&
                (response.matchInfo.keyword === 'sorry' || response.matchInfo.keyword === 'apologise');
            const pass = matchedSorry === test.shouldMatchSorry;

            console.log(`Input: "${test.input}"`);
            console.log(`Response: ${response.response}`);
            console.log(`Matched "sorry": ${matchedSorry} (expected: ${test.shouldMatchSorry})`);
            console.log(`Result: ${pass ? '✓ PASS' : '✗ FAIL'}\n`);

            if (pass) sorryPassed++;
        }

        console.log(`Sorry Priority Test Summary: ${sorryPassed}/${sorryTests.length} passed\n`);

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
        const totalTests = classicTests.length + sorryTests.length + formatTests.length;
        const totalPassed = classicPassed + sorryPassed + formatPassed;

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
