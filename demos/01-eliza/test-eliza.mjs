#!/usr/bin/env node
/**
 * Comprehensive test suite for ELIZA (Demo 01)
 * Tests pattern matching, substitutions, and conversation flow
 * Run with: node test-eliza.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock DOM globals for browser-based code
global.window = {};
global.document = {};

// Load the required modules
const patternMatcherCode = await readFile(join(__dirname, 'js/pattern-matcher.js'), 'utf-8');
const elizaEngineCode = await readFile(join(__dirname, 'js/eliza-engine.js'), 'utf-8');

// Execute PatternMatcher code
global.module = { exports: {} };
eval(patternMatcherCode);
const PatternMatcher = global.module.exports;

if (!PatternMatcher) {
    throw new Error('Failed to load PatternMatcher class');
}

// Make PatternMatcher globally available for ElizaEngine
global.PatternMatcher = PatternMatcher;

// Execute ElizaEngine code
global.module = { exports: {} };
eval(elizaEngineCode);
const ElizaEngine = global.module.exports;

if (!ElizaEngine) {
    throw new Error('Failed to load ElizaEngine class');
}

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

    assertContains(text, substring, testName) {
        const condition = text.toLowerCase().includes(substring.toLowerCase());
        this.assert(condition, testName, `contains "${substring}"`, text);
    }

    assertNotEmpty(value, testName) {
        this.assert(value && value.length > 0, testName, 'non-empty', value);
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('ELIZA Test Suite (Demo 01)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();
    const eliza = new ElizaEngine();

    // Load rules
    const rulesData = JSON.parse(await readFile(join(__dirname, 'data/eliza-rules.json'), 'utf-8'));
    await eliza.loadRules(rulesData);

    // Test 1: Pattern Matching - Classic conversation from original paper
    console.log('\n--- Test Group 1: Classic Pattern Matching ---\n');

    const classicTests = [
        {
            input: "Men are all alike.",
            expectedKeyword: "alike",
            description: "Test 'alike' keyword pattern"
        },
        {
            input: "They're always bugging us about something or other.",
            expectedKeyword: "always",
            description: "Test 'always' keyword pattern"
        },
        {
            input: "Well, my boyfriend made me come here.",
            expectedKeyword: "my",
            description: "Test possessive 'my' keyword"
        },
        {
            input: "I need some help, that much seems certain.",
            expectedKeyword: "i",
            description: "Test 'I' pronoun keyword"
        }
    ];

    for (const test of classicTests) {
        const response = eliza.getResponse(test.input);
        runner.assertEqual(
            response.matchInfo.keyword,
            test.expectedKeyword,
            test.description
        );
        runner.assertNotEmpty(response.response, `${test.description} - generates non-empty response`);
    }

    eliza.reset();

    // Test 2: Sorry Keyword Priority
    console.log('\n--- Test Group 2: Keyword Priority (Sorry) ---\n');

    const sorryTests = [
        { input: "I'm sorry.", shouldMatchSorry: true },
        { input: "I apologise.", shouldMatchSorry: true },
        { input: "I am sad and sorry.", shouldMatchSorry: true },
        { input: "I feel unhappy.", shouldMatchSorry: false },
        { input: "I need help.", shouldMatchSorry: false }
    ];

    for (const test of sorryTests) {
        const response = eliza.getResponse(test.input);
        const matchedSorry = response.matchInfo &&
            (response.matchInfo.keyword === 'sorry' || response.matchInfo.keyword === 'apologise');
        runner.assertEqual(
            matchedSorry,
            test.shouldMatchSorry,
            `"${test.input}" ${test.shouldMatchSorry ? 'should' : 'should not'} match sorry/apologise`
        );
    }

    eliza.reset();

    // Test 3: Response Formatting
    console.log('\n--- Test Group 3: Response Formatting ---\n');

    const formatTests = [
        "I feel happy.",
        "Tell me about computers.",
        "Can you help me?"
    ];

    for (const input of formatTests) {
        const response = eliza.getResponse(input);
        const isAllUppercase = response.response === response.response.toUpperCase();
        const isSentenceCase = response.response.charAt(0) === response.response.charAt(0).toUpperCase();

        runner.assert(
            !isAllUppercase || response.matchInfo.keyword === 'fallback',
            `"${input}" - Should not be all uppercase (unless fallback)`,
            'not all uppercase',
            response.response
        );

        runner.assert(
            isSentenceCase,
            `"${input}" - Should start with capital letter`,
            'sentence case',
            response.response
        );
    }

    eliza.reset();

    // Test 4: Pre-substitutions
    console.log('\n--- Test Group 4: Pre-substitutions ---\n');

    const patternMatcher = new PatternMatcher();
    const preSubTests = [
        { input: "don't", expected: "do not" },
        { input: "can't", expected: "can not" },
        { input: "won't", expected: "will not" },
        { input: "I'm", expected: "i am" }
    ];

    for (const test of preSubTests) {
        const result = patternMatcher.applyPreSubstitutions(test.input, rulesData.preSubstitutions);
        runner.assertContains(
            result.result,
            test.expected,
            `Pre-substitution: "${test.input}" → "${test.expected}"`
        );
    }

    // Test 5: Post-substitutions (Reflection)
    console.log('\n--- Test Group 5: Post-substitutions (Reflection) ---\n');

    const postSubTests = [
        { input: "I am", expected: "you are" },
        { input: "my problem", expected: "your problem" },
        { input: "myself", expected: "yourself" },
        { input: "you are", expected: "I am" }
    ];

    for (const test of postSubTests) {
        const result = patternMatcher.applyPostSubstitutions(test.input, rulesData.postSubstitutions);
        runner.assertContains(
            result.result,
            test.expected,
            `Post-substitution: "${test.input}" → "${test.expected}"`
        );
    }

    // Test 6: Wildcard Matching
    console.log('\n--- Test Group 6: Wildcard Pattern Matching ---\n');

    const wildcardTests = [
        {
            pattern: "* I need *",
            input: "I think I need some help",
            shouldMatch: true
        },
        {
            pattern: "* you *",
            input: "Sometimes you make me angry",
            shouldMatch: true
        },
        {
            pattern: "I * you",
            input: "I love you",
            shouldMatch: true
        }
    ];

    for (const test of wildcardTests) {
        const result = patternMatcher.matchPattern(test.input.toLowerCase(), test.pattern, rulesData.synonyms);
        runner.assertEqual(
            result.matched,
            test.shouldMatch,
            `Pattern "${test.pattern}" ${test.shouldMatch ? 'should match' : 'should not match'} "${test.input}"`
        );
    }

    // Test 7: Conversation State
    console.log('\n--- Test Group 7: Conversation State Management ---\n');

    eliza.reset();
    const greeting = eliza.getGreeting();
    runner.assertNotEmpty(greeting, "Initial greeting should not be empty");

    const history1 = eliza.getHistory();
    runner.assertEqual(history1.length, 1, "History should have 1 entry after greeting");

    eliza.getResponse("Hello");
    const history2 = eliza.getHistory();
    runner.assertEqual(history2.length, 3, "History should have 3 entries after one exchange");

    eliza.reset();
    const history3 = eliza.getHistory();
    runner.assertEqual(history3.length, 0, "History should be empty after reset");

    // Test 8: Quit Detection
    console.log('\n--- Test Group 8: Quit Word Detection ---\n');

    eliza.reset();
    const quitResponse = eliza.getResponse("quit");
    runner.assertEqual(quitResponse.isQuit, true, "Should detect 'quit' as quit word");

    eliza.reset();
    const byeResponse = eliza.getResponse("goodbye");
    runner.assertEqual(byeResponse.isQuit, true, "Should detect 'goodbye' as quit word");

    eliza.reset();
    const normalResponse = eliza.getResponse("I am happy");
    runner.assertEqual(normalResponse.isQuit, false, "Normal input should not be quit");

    // Test 9: Rules Validation
    console.log('\n--- Test Group 9: Rules Structure Validation ---\n');

    runner.assert(
        Array.isArray(rulesData.rules),
        "Rules data should contain rules array",
        "array",
        typeof rulesData.rules
    );

    runner.assert(
        rulesData.rules.length > 0,
        "Rules array should not be empty",
        "> 0",
        rulesData.rules.length
    );

    let allRulesValid = true;
    for (const rule of rulesData.rules) {
        if (!rule.keyword || !rule.patterns || !Array.isArray(rule.patterns)) {
            allRulesValid = false;
            break;
        }
        for (const pattern of rule.patterns) {
            if (!pattern.pattern || !pattern.responses || !Array.isArray(pattern.responses)) {
                allRulesValid = false;
                break;
            }
        }
    }
    runner.assert(allRulesValid, "All rules should have valid structure", "valid", allRulesValid ? "valid" : "invalid");

    // Test 10: Synonym Expansion
    console.log('\n--- Test Group 10: Synonym Expansion ---\n');

    // Test that synonyms are properly expanded in patterns
    const synonymTest = eliza.getResponse("I believe in ghosts");
    runner.assertNotEmpty(synonymTest.response, "Should handle 'believe' (synonym of 'think')");

    const familyTest = eliza.getResponse("Tell me about your mother");
    runner.assertNotEmpty(familyTest.response, "Should handle 'mother' (family synonym)");

    // Test 11: Response Cycling
    console.log('\n--- Test Group 11: Response Cycling ---\n');

    eliza.reset();
    const responses = [];
    for (let i = 0; i < 5; i++) {
        const resp = eliza.getResponse("I remember something");
        responses.push(resp.response);
    }

    // Check that we get different responses (cycling through)
    const uniqueResponses = new Set(responses);
    runner.assert(
        uniqueResponses.size > 1 || responses.length === 1,
        "Should cycle through multiple responses or have single response",
        "> 1 unique",
        `${uniqueResponses.size} unique`
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
