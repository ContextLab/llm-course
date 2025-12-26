/**
 * Test synonym pattern matching in ELIZA
 * Run with: node test_synonym_matching.js
 */

const fs = require('fs');
const path = require('path');

// Load the pattern matcher
const PatternMatcher = require('../js/pattern-matcher.js');

// Load rules
const rulesPath = path.join(__dirname, '..', 'data', 'eliza-rules.json');
const data = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
const rules = data.rules;
const synonyms = data.synonyms;
const preSubstitutions = data.preSubstitutions;
const postSubstitutions = data.postSubstitutions;

const matcher = new PatternMatcher();

console.log('='.repeat(80));
console.log('TESTING SYNONYM PATTERN MATCHING');
console.log('='.repeat(80));

// Test cases
const testCases = [
    {
        input: "I am happy",
        expectedKeyword: "i",
        expectedPattern: "* i am * @happy *"
    },
    {
        input: "I am depressed",
        expectedKeyword: "i",
        expectedPattern: "* i am * @sad *"
    },
    {
        input: "My mother is sick",
        expectedKeyword: "my",
        expectedPattern: "* my * @family *"
    }
];

for (const test of testCases) {
    console.log('\n' + '='.repeat(80));
    console.log(`Input: "${test.input}"`);
    console.log(`Expected keyword: ${test.expectedKeyword}`);
    console.log(`Expected pattern: ${test.expectedPattern}`);
    console.log('='.repeat(80));

    // Apply pre-substitutions
    const preSubResult = matcher.applyPreSubstitutions(test.input, preSubstitutions);
    const processedInput = preSubResult.result;
    console.log(`\nAfter pre-substitution: "${processedInput}"`);

    // Find matching rule
    const match = matcher.findMatchingRule(processedInput, rules, synonyms);

    if (match) {
        console.log(`\nMatched keyword: ${match.rule.keyword}`);
        console.log(`Matched pattern: ${match.pattern.pattern}`);
        console.log(`Pattern regex: ${match.matchResult.regex}`);
        console.log(`Captures: ${JSON.stringify(match.matchResult.captures)}`);

        // Test expected pattern directly
        console.log(`\n--- Testing expected pattern directly ---`);
        const expectedRule = rules.find(r => r.keyword === test.expectedKeyword);
        if (expectedRule) {
            const expectedPatternObj = expectedRule.patterns.find(p => p.pattern === test.expectedPattern);
            if (expectedPatternObj) {
                const directMatch = matcher.matchPattern(processedInput, test.expectedPattern, synonyms);
                console.log(`Direct match of expected pattern: ${directMatch.matched}`);
                if (directMatch.matched) {
                    console.log(`Captures: ${JSON.stringify(directMatch.captures)}`);
                } else {
                    console.log(`Regex: ${directMatch.regex}`);
                    console.log(`Input (padded): " ${processedInput} "`);

                    // Manually test regex
                    const paddedInput = ' ' + processedInput + ' ';
                    const regex = new RegExp(directMatch.regex.slice(1, -2), 'i'); // Remove /.../ and flags
                    const testMatch = paddedInput.match(regex);
                    console.log(`Manual regex test: ${testMatch !== null}`);
                    if (testMatch) {
                        console.log(`Manual match result: ${JSON.stringify(testMatch)}`);
                    }
                }
            } else {
                console.log(`Expected pattern "${test.expectedPattern}" not found in keyword "${test.expectedKeyword}"`);
            }
        }

        if (match.rule.keyword !== test.expectedKeyword || match.pattern.pattern !== test.expectedPattern) {
            console.log(`\n❌ MISMATCH!`);
        } else {
            console.log(`\n✓ CORRECT MATCH`);
        }
    } else {
        console.log('\n❌ NO MATCH FOUND!');
    }
}

console.log('\n' + '='.repeat(80));
console.log('END OF TESTS');
console.log('='.repeat(80));
