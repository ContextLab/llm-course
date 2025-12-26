#!/usr/bin/env node
/**
 * Test the actual JavaScript ELIZA implementation
 */

const fs = require('fs');
const path = require('path');

// Load the modules
const ElizaEnginePath = path.join(__dirname, '..', 'js', 'eliza-engine.js');
const PatternMatcherPath = path.join(__dirname, '..', 'js', 'pattern-matcher.js');
const rulesPath = path.join(__dirname, '..', 'data', 'eliza-rules.json');

// Read and eval the modules (since they're not proper Node modules)
eval(fs.readFileSync(PatternMatcherPath, 'utf8'));
eval(fs.readFileSync(ElizaEnginePath, 'utf8'));

async function runTests() {
    const eliza = new ElizaEngine();
    const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    await eliza.loadRules(rulesData);

    console.log('='.repeat(80));
    console.log('TESTING ACTUAL JAVASCRIPT IMPLEMENTATION');
    console.log('='.repeat(80));
    console.log();

    // Critical Bug Tests
    console.log('CRITICAL BUG TEST 1: Empty/Nonsense Inputs');
    console.log('-'.repeat(80));

    const emptyTests = [
        "",
        "   ",
        "asdfasdf qwerqwer",
        "zzz xxx ccc",
        "blahblahblah",
        "12345 67890"
    ];

    for (const input of emptyTests) {
        const result = eliza.getResponse(input);
        console.log(`Input: "${input}"`);
        console.log(`  Response: ${result.response}`);
        console.log(`  Keyword: ${result.matchInfo.keyword}, Pattern: ${result.matchInfo.pattern}`);
        if (result.matchInfo.keyword === 'sorry') {
            console.log(`  ⚠ BUG: Empty/nonsense matched 'sorry' keyword!`);
        }
        console.log();
    }

    // Reset for next test
    eliza.reset();

    console.log('CRITICAL BUG TEST 2: "I am sad/depressed" Pattern');
    console.log('-'.repeat(80));

    const sadTests = [
        "I am sad",
        "I am depressed",
        "I am unhappy",
        "I am sick"
    ];

    for (const input of sadTests) {
        const result = eliza.getResponse(input);
        console.log(`Input: "${input}"`);
        console.log(`  Response: ${result.response}`);
        console.log(`  Keyword: ${result.matchInfo.keyword}, Pattern: ${result.matchInfo.pattern}`);
        if (!result.response.toLowerCase().includes('sorry')) {
            console.log(`  ⚠ BUG: Should match 'i am @sad' pattern and include 'sorry'`);
        }
        console.log();
    }

    eliza.reset();

    console.log('CRITICAL BUG TEST 3: "Everyone hates me"');
    console.log('-'.repeat(80));

    const everyoneTests = [
        "Everyone hates me",
        "Nobody likes me",
        "Everybody is mean",
        "Noone cares"
    ];

    for (const input of everyoneTests) {
        const result = eliza.getResponse(input);
        console.log(`Input: "${input}"`);
        console.log(`  Response: ${result.response}`);
        console.log(`  Keyword: ${result.matchInfo.keyword}, Rank: ${result.matchInfo.rank}`);
        if (result.matchInfo.keyword !== 'everyone') {
            console.log(`  ⚠ BUG: Should match 'everyone' keyword, not '${result.matchInfo.keyword}'`);
        }
        console.log();
    }

    eliza.reset();

    console.log('MAJOR BUG TEST 4: Family Synonym Pattern');
    console.log('-'.repeat(80));

    const familyTests = [
        "My mother is sick",
        "My father was strict",
        "My sister is nice",
        "My brother helped me"
    ];

    for (const input of familyTests) {
        const result = eliza.getResponse(input);
        console.log(`Input: "${input}"`);
        console.log(`  Response: ${result.response}`);
        console.log(`  Keyword: ${result.matchInfo.keyword}, Pattern: ${result.matchInfo.pattern}`);
        if (!result.response.toLowerCase().includes('family')) {
            console.log(`  ⚠ BUG: Should match 'my * @family' pattern and mention family`);
        }
        console.log();
    }

    eliza.reset();

    console.log('MAJOR BUG TEST 5: Keyword Prioritization');
    console.log('-'.repeat(80));

    const priorityTests = [
        { input: "I always want to remember", expected: "remember", expectedRank: 5 },
        { input: "I want a computer", expected: "computer", expectedRank: 50 },
        { input: "Everyone always says I'm wrong", expected: "everyone", expectedRank: 2 },
        { input: "My name is always the same", expected: "name", expectedRank: 15 }
    ];

    for (const test of priorityTests) {
        const result = eliza.getResponse(test.input);
        console.log(`Input: "${test.input}"`);
        console.log(`  Expected: '${test.expected}' (rank ${test.expectedRank})`);
        console.log(`  Got: '${result.matchInfo.keyword}' (rank ${result.matchInfo.rank})`);
        console.log(`  Response: ${result.response}`);
        if (result.matchInfo.keyword !== test.expected) {
            console.log(`  ⚠ BUG: Wrong keyword priority!`);
        }
        console.log();
    }

    eliza.reset();

    console.log('MAJOR BUG TEST 6: Pronoun Reflection Issues');
    console.log('-'.repeat(80));

    const pronounTests = [
        { input: "My mother is sick", issue: "Check for 'is is' or similar" },
        { input: "My father was strict", issue: "Check for 'was was' or similar" },
        { input: "You are my friend", issue: "Check pronoun reflection" },
        { input: "I was happy", issue: "Check 'I was' -> 'you were'" }
    ];

    for (const test of pronounTests) {
        const result = eliza.getResponse(test.input);
        console.log(`Input: "${test.input}" (${test.issue})`);
        console.log(`  Response: ${result.response}`);
        if (/ is is | was was | are are /.test(result.response)) {
            console.log(`  ⚠ BUG: Double verb detected in response!`);
        }
        console.log();
    }

    eliza.reset();

    console.log('RESPONSE CYCLING TEST');
    console.log('-'.repeat(80));

    const responses = [];
    for (let i = 0; i < 6; i++) {
        const result = eliza.getResponse("I am sad");
        responses.push(result.response);
    }

    console.log("'I am sad' repeated 6 times:");
    responses.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
    console.log(`Unique responses: ${new Set(responses).size}/${responses.length}`);
    console.log();

    console.log('LONG CONVERSATION TEST');
    console.log('-'.repeat(80));

    eliza.reset();

    const conversation = [
        "Hello",
        "I am feeling depressed",
        "My boyfriend made me come here",
        "He says I need help",
        "I want to be happy",
        "My mother never loved me",
        "I remember when she would ignore me",
        "I always felt alone",
        "Everyone seems to hate me",
        "Can you help me?",
        "Why do I feel this way?",
        "I think I am broken",
        "I can't seem to fix myself",
        "Perhaps I should try harder",
        "If I could just be better"
    ];

    conversation.forEach((input, i) => {
        const result = eliza.getResponse(input);
        console.log(`${i + 1}. User: ${input}`);
        console.log(`   ELIZA: ${result.response}`);
        console.log(`   [keyword: ${result.matchInfo.keyword}, rank: ${result.matchInfo.rank}]`);
    });
}

runTests().catch(console.error);
