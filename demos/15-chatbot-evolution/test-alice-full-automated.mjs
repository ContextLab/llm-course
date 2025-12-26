import { AliceFull } from './js/alice-full.js';
import { Alice } from './js/alice.js';
import { readFileSync } from 'fs';

console.log('='.repeat(80));
console.log('ALICE FULL - COMPREHENSIVE AUTOMATED TESTING SUITE');
console.log('Testing 95,026 pattern AIML implementation');
console.log('='.repeat(80));
console.log();

const alice = new AliceFull();
const aliceSimple = new Alice();

const issues = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function addIssue(severity, category, description, example, suggestedFix) {
    issues.push({ severity, category, description, example, suggestedFix });
}

function reportTest(passed, testName, message, details = '') {
    totalTests++;
    if (passed) {
        passedTests++;
        console.log(`✓ PASS: ${testName}`);
    } else {
        failedTests++;
        console.log(`✗ FAIL: ${testName}`);
    }
    if (message) console.log(`  ${message}`);
    if (details) console.log(`  Details: ${details}`);
    console.log();
}

function reportWarning(testName, message, details = '') {
    totalTests++;
    warnings++;
    console.log(`⚠ WARNING: ${testName}`);
    if (message) console.log(`  ${message}`);
    if (details) console.log(`  Details: ${details}`);
    console.log();
}

// Load patterns (Node.js version - load from file system)
console.log('Loading ALICE Full patterns...');
try {
    const patternsData = JSON.parse(readFileSync('./data/alice-patterns-full.json', 'utf-8'));
    console.log(`Source: ${patternsData.metadata.source}`);
    console.log(`Total patterns: ${patternsData.metadata.total_patterns}`);
    console.log(`Files: ${patternsData.metadata.files_processed}`);

    alice.patterns = patternsData.patterns;
    alice.patternsLoaded = true;
    alice.patterns.sort((a, b) => b.priority - a.priority);
    console.log('Patterns loaded and sorted by priority.');
} catch (error) {
    console.error('ERROR: Failed to load patterns:', error.message);
    process.exit(1);
}

const stats = alice.getStats();
console.log(`Loaded ${stats.totalPatterns.toLocaleString()} patterns`);
console.log();

// ===== TEST 1: LONG CONVERSATIONS =====
console.log('='.repeat(80));
console.log('TEST SUITE 1: LONG CONVERSATIONS (15-20 exchanges)');
console.log('='.repeat(80));
console.log();

async function testLongConversation(title, messages) {
    console.log(`--- ${title} ---`);
    const conversation = [];
    let emptyResponses = 0;
    let defaultResponses = 0;
    let contextIssues = 0;

    const defaultPhrases = [
        "I'm not sure I understand",
        "Can you rephrase that?",
        "Tell me more",
        "That's interesting",
        "I see. What else?",
        "Interesting. Please continue"
    ];

    for (let i = 0; i < messages.length; i++) {
        const input = messages[i];
        const response = await alice.getResponse(input);
        conversation.push({ user: input, bot: response });

        console.log(`  ${i+1}. USER: ${input}`);
        console.log(`     ALICE: ${response}`);

        if (!response || response.trim() === '') {
            emptyResponses++;
        }

        if (defaultPhrases.some(phrase => response.includes(phrase))) {
            defaultResponses++;
        }

        if (i > 0 && input.toLowerCase().includes('remember') &&
            (response.includes("I don't") || response.includes("not sure"))) {
            contextIssues++;
        }
    }

    console.log();

    if (emptyResponses > 0) {
        reportTest(false, title, `${emptyResponses} empty responses detected`);
        addIssue('critical', 'Conversation', 'Empty responses in conversation',
            conversation.slice(0, 3).map(c => `${c.user} -> ${c.bot}`).join('\n'),
            'Check pattern matching and template processing');
    } else if (defaultResponses > messages.length * 0.4) {
        reportWarning(title, `High default response rate: ${defaultResponses}/${messages.length} (${Math.round(defaultResponses/messages.length*100)}%)`);
        addIssue('major', 'Pattern Coverage', 'Too many default responses',
            `${defaultResponses} out of ${messages.length} responses were defaults`,
            'Add more patterns for common conversation flows');
    } else if (contextIssues > 2) {
        reportWarning(title, `Context memory issues: ${contextIssues} instances`);
        addIssue('major', 'Context Handling', 'Bot not remembering conversation context',
            `${contextIssues} failed context checks`,
            'Check GET/SET variable handling');
    } else {
        reportTest(true, title, `${messages.length} exchanges, ${defaultResponses} defaults (${Math.round(defaultResponses/messages.length*100)}%)`);
    }
}

// Test 1: General conversation
await testLongConversation('General Conversation', [
    'Hello',
    'What is your name?',
    'Who created you?',
    'When were you created?',
    'What is AIML?',
    'How does pattern matching work?',
    'Can you think?',
    'Are you intelligent?',
    'What is your favorite topic?',
    'Do you like robots?',
    'Tell me about artificial intelligence',
    'What is machine learning?',
    'Can machines be conscious?',
    'What is the Turing test?',
    'Do you pass the Turing test?',
    'What is your purpose?',
    'Thank you',
    'Goodbye'
]);

// Test 2: Emotions and personal topics
await testLongConversation('Emotional Conversation', [
    'Hello',
    'I am feeling happy today',
    'My name is TestUser',
    'Do you remember my name?',
    'Do you have emotions?',
    'Can you feel happiness?',
    'I am sad',
    'Why cant you feel emotions?',
    'What is consciousness?',
    'Do you dream?',
    'What do you think about?',
    'Are you self aware?',
    'Do you have free will?',
    'What is the meaning of life?',
    'Tell me a joke',
    'That was funny',
    'You are smart',
    'Goodbye'
]);

// Test 3: Technical questions
await testLongConversation('Technical Discussion', [
    'Hi ALICE',
    'What is artificial intelligence?',
    'How are you different from ELIZA?',
    'What is the difference between you and modern AI?',
    'Can you learn?',
    'Do you use neural networks?',
    'What is deep learning?',
    'Are you similar to GPT?',
    'How many patterns do you have?',
    'What is your vocabulary size?',
    'Who is Dr Richard Wallace?',
    'Where are you located?',
    'When is your birthday?',
    'How old are you?',
    'What programming language are you written in?',
    'Do you have any weaknesses?',
    'What are your strengths?',
    'Bye'
]);

// Test 4: Context and Memory
await testLongConversation('Context and Memory', [
    'Hi',
    'My name is Bob',
    'Do you remember my name?',
    'My favorite color is blue',
    'What is my favorite color?',
    'I like dogs',
    'Do you remember what I like?',
    'I am from New York',
    'Where am I from?',
    'I work as a teacher',
    'What is my job?',
    'My hobby is painting',
    'Can you tell me about my hobbies?',
    'What do you know about me?',
    'Tell me everything you remember',
    'You are good at remembering',
    'Thank you',
    'Bye'
]);

// ===== TEST 2: PATTERN DATABASE =====
console.log('='.repeat(80));
console.log('TEST SUITE 2: PATTERN DATABASE COVERAGE');
console.log('='.repeat(80));
console.log();

async function testPatternCategory(category, tests) {
    console.log(`--- ${category} ---`);
    let passed = 0;
    let failed = 0;

    const defaultPhrases = [
        "I'm not sure I understand",
        "Can you rephrase that?",
        "Tell me more"
    ];

    for (const test of tests) {
        const response = await alice.getResponse(test.input);
        let testPassed = true;
        let reason = '';

        console.log(`  Input: "${test.input}"`);
        console.log(`  Response: "${response}"`);

        if (test.expectNonDefault) {
            if (defaultPhrases.some(phrase => response.includes(phrase))) {
                testPassed = false;
                reason = 'Got default response';
            }
        }

        if (test.expectContains) {
            const found = test.expectContains.some(word =>
                response.toLowerCase().includes(word.toLowerCase())
            );
            if (!found) {
                testPassed = false;
                reason = `Expected to contain one of: ${test.expectContains.join(', ')}`;
            }
        }

        if (testPassed) {
            passed++;
            console.log(`  ✓ PASS`);
        } else {
            failed++;
            console.log(`  ✗ FAIL: ${reason}`);
        }
        console.log();
    }

    if (failed > 0) {
        reportTest(false, category, `${failed}/${tests.length} patterns failed`);
        addIssue('major', 'Pattern Matching', `${category} patterns not matching correctly`,
            `${failed} failures out of ${tests.length} tests`,
            'Review pattern priorities and regex patterns');
    } else {
        reportTest(true, category, `All ${passed} patterns matched correctly`);
    }
}

// Test greetings
await testPatternCategory('Greetings', [
    { input: 'Hello', expectNonDefault: true },
    { input: 'Hi', expectNonDefault: true },
    { input: 'Hey', expectNonDefault: true },
    { input: 'Good morning', expectNonDefault: true },
    { input: 'Greetings', expectNonDefault: true }
]);

// Test identity
await testPatternCategory('Identity Questions', [
    { input: 'What is your name', expectContains: ['ALICE', 'name'] },
    { input: 'Who are you', expectNonDefault: true },
    { input: 'What are you', expectNonDefault: true },
    { input: 'Who created you', expectContains: ['Wallace', 'created', 'Richard'] },
    { input: 'Are you a robot', expectNonDefault: true }
]);

// Test knowledge
await testPatternCategory('Knowledge Questions', [
    { input: 'What is AIML', expectNonDefault: true },
    { input: 'What is artificial intelligence', expectNonDefault: true },
    { input: 'What is a robot', expectNonDefault: true }
]);

// ===== TEST 3: SRAI REDIRECTION =====
console.log('='.repeat(80));
console.log('TEST SUITE 3: SRAI REDIRECTION CHAINS');
console.log('='.repeat(80));
console.log();

console.log('--- SRAI Pattern Matching ---');
const sraiTests = [
    { input: 'WHAT IS AI', expect: 'Should redirect to AI patterns' },
    { input: 'R U A ROBOT', expect: 'Should handle abbreviations' },
    { input: 'WHO R U', expect: 'Should handle "R U" -> "ARE YOU"' }
];

let sraiPassed = 0;
let sraiFailed = 0;

const defaultPhrases = [
    "I'm not sure I understand",
    "Can you rephrase that?",
    "Tell me more"
];

for (const test of sraiTests) {
    const response = await alice.getResponse(test.input);
    const isDefault = defaultPhrases.some(phrase => response.includes(phrase));

    console.log(`  Input: "${test.input}"`);
    console.log(`  Response: "${response}"`);
    console.log(`  Expected: ${test.expect}`);

    if (!isDefault) {
        sraiPassed++;
        console.log(`  ✓ PASS (SRAI working)`);
    } else {
        sraiFailed++;
        console.log(`  ✗ FAIL (Likely SRAI not working)`);
    }
    console.log();
}

if (sraiFailed > 0) {
    reportWarning('SRAI Redirection', `${sraiFailed}/${sraiTests.length} SRAI patterns may not be working`);
    addIssue('major', 'SRAI', 'SRAI redirections may not be working correctly',
        `${sraiFailed} SRAI tests returned default responses`,
        'Check SRAI pattern matching and recursion depth');
} else {
    reportTest(true, 'SRAI Redirection', `All ${sraiPassed} SRAI tests passed`);
}

// ===== TEST 4: CONTEXT VARIABLES =====
console.log('='.repeat(80));
console.log('TEST SUITE 4: CONTEXT VARIABLES (GET/SET)');
console.log('='.repeat(80));
console.log();

console.log('--- Testing GET/SET ---');

// Test name setting
await alice.getResponse('My name is TestUser');
const context1 = alice.getContext();
const nameSet = context1.userName === 'TestUser';
console.log(`  Set name: ${nameSet ? '✓' : '✗'}`);
console.log(`  userName = "${context1.userName}"`);
console.log();

// Test name retrieval
const response = await alice.getResponse('What is my name');
const nameRetrieved = response.toLowerCase().includes('testuser');
console.log(`  Get name: ${nameRetrieved ? '✓' : '✗'}`);
console.log(`  Response: "${response}"`);
console.log();

if (nameSet && nameRetrieved) {
    reportTest(true, 'Context Variables (GET/SET)', 'Context variables working correctly');
} else {
    reportTest(false, 'Context Variables (GET/SET)', 'Context variables not working correctly');
    addIssue('critical', 'Context Variables', 'GET/SET not properly storing or retrieving context',
        `Name set: ${nameSet}, Name retrieved: ${nameRetrieved}`,
        'Check template processing for {{SET:...}} and {{GET:...}}');
}

// ===== TEST 5: BOT PROPERTIES =====
console.log('='.repeat(80));
console.log('TEST SUITE 5: BOT PROPERTIES');
console.log('='.repeat(80));
console.log();

console.log('--- Testing {{BOT:...}} tags ---');
const nameResponse = await alice.getResponse('What is your name');
const hasName = nameResponse.toLowerCase().includes('alice');

console.log(`  Input: "What is your name"`);
console.log(`  Response: "${nameResponse}"`);
console.log(`  Contains 'ALICE': ${hasName ? '✓' : '✗'}`);
console.log();

if (hasName) {
    reportTest(true, 'BOT Properties', 'BOT properties accessible in templates');
} else {
    reportTest(false, 'BOT Properties', 'BOT properties not working');
    addIssue('major', 'BOT Properties', '{{BOT:...}} template tags not expanding correctly',
        `Response: "${nameResponse}"`,
        'Check processTemplate BOT property replacement');
}

// ===== TEST 6: WILDCARD MATCHING =====
console.log('='.repeat(80));
console.log('TEST SUITE 6: WILDCARD MATCHING');
console.log('='.repeat(80));
console.log();

console.log('--- Complex Wildcard Patterns ---');
const wildcardTests = [
    'Tell me about quantum physics',
    'I really really like ice cream',
    'Can you please help me with something important'
];

let wildcardPassed = 0;
for (const test of wildcardTests) {
    const response = await alice.getResponse(test);
    const gotDefault = response.includes("I'm not sure") || response.includes("Can you rephrase");

    console.log(`  Input: "${test}"`);
    console.log(`  Response: "${response}"`);
    console.log(`  ${gotDefault ? '⚠ Default' : '✓ Matched'}`);
    console.log();

    if (!gotDefault) wildcardPassed++;
}

reportTest(wildcardPassed === wildcardTests.length, 'Wildcard Matching',
    `${wildcardPassed}/${wildcardTests.length} patterns matched`);

// ===== TEST 7: EDGE CASES =====
console.log('='.repeat(80));
console.log('TEST SUITE 7: EDGE CASES');
console.log('='.repeat(80));
console.log();

// Empty input
console.log('--- Empty Input ---');
const emptyResponse = await alice.getResponse('');
console.log(`  Input: ""`);
console.log(`  Response: "${emptyResponse}"`);
const emptyHandled = emptyResponse && emptyResponse.trim() !== '';
console.log(`  Handled: ${emptyHandled ? '✓' : '✗'}`);
console.log();

if (!emptyHandled) {
    reportWarning('Empty Input Handling', 'Empty input produces empty response');
    addIssue('minor', 'Input Validation', 'Empty input produces empty response',
        'Empty string input',
        'Add input validation to handle empty strings');
} else {
    reportTest(true, 'Empty Input Handling', 'Empty input handled gracefully');
}

// Very long input
console.log('--- Very Long Input ---');
const longInput = 'Tell me about ' + 'really '.repeat(100) + 'interesting things';
const startTime = Date.now();
const longResponse = await alice.getResponse(longInput);
const duration = Date.now() - startTime;

console.log(`  Input length: ${longInput.length} characters`);
console.log(`  Processing time: ${duration}ms`);
console.log(`  Response: "${longResponse.substring(0, 50)}..."`);
console.log();

if (duration > 2000) {
    reportWarning('Very Long Input', `Processing took ${duration}ms`);
    addIssue('minor', 'Performance', 'Very long inputs cause slow processing',
        `${duration}ms for ${longInput.length} chars`,
        'Optimize pattern matching for long inputs');
} else {
    reportTest(true, 'Very Long Input', `Handled efficiently in ${duration}ms`);
}

// Special characters
console.log('--- Special Characters ---');
const specialTests = [
    "What's your name?",
    "Can you help me?!?!",
    'I said: "Hello there"',
    "Test@#$%^&*()",
    "Multiple     spaces"
];

let specialPassed = 0;
for (const test of specialTests) {
    try {
        const response = await alice.getResponse(test);
        console.log(`  Input: "${test}"`);
        console.log(`  Response: "${response}"`);
        console.log(`  ✓ OK`);
        specialPassed++;
    } catch (error) {
        console.log(`  Input: "${test}"`);
        console.log(`  ✗ ERROR: ${error.message}`);
    }
    console.log();
}

reportTest(specialPassed === specialTests.length, 'Special Characters',
    `${specialPassed}/${specialTests.length} handled correctly`);

// ===== TEST 8: PERFORMANCE =====
console.log('='.repeat(80));
console.log('TEST SUITE 8: PERFORMANCE');
console.log('='.repeat(80));
console.log();

console.log('--- Response Time Testing ---');
const perfTests = [
    'Hello',
    'What is your name',
    'Tell me about artificial intelligence',
    'I like to program computers and build robots'
];

const times = [];
for (const test of perfTests) {
    const start = performance.now();
    const response = await alice.getResponse(test);
    const dur = performance.now() - start;
    times.push(dur);

    console.log(`  "${test}": ${dur.toFixed(2)}ms`);
    console.log(`  Response: "${response.substring(0, 50)}..."`);
    console.log();
}

const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
const maxTime = Math.max(...times);

console.log(`  Average: ${avgTime.toFixed(2)}ms`);
console.log(`  Maximum: ${maxTime.toFixed(2)}ms`);
console.log();

if (maxTime > 1000) {
    reportTest(false, 'Response Time', `Too slow! Max: ${maxTime.toFixed(2)}ms`);
    addIssue('critical', 'Performance', 'Response times exceeding 1 second',
        `Max: ${maxTime}ms, Avg: ${avgTime}ms`,
        'Optimize pattern matching algorithm');
} else if (avgTime > 100) {
    reportWarning('Response Time', `Average ${avgTime.toFixed(2)}ms (max ${maxTime.toFixed(2)}ms)`);
    addIssue('minor', 'Performance', 'Average response time > 100ms',
        `Avg: ${avgTime}ms`,
        'Consider pattern indexing or caching');
} else {
    reportTest(true, 'Response Time', `Good performance: avg ${avgTime.toFixed(2)}ms, max ${maxTime.toFixed(2)}ms`);
}

// Pattern count
console.log('--- Pattern Database Size ---');
console.log(`  Total patterns: ${stats.totalPatterns.toLocaleString()}`);
console.log(`  Expected: 95,026`);
console.log();

if (stats.totalPatterns === 95026) {
    reportTest(true, 'Pattern Loading', `All ${stats.totalPatterns.toLocaleString()} patterns loaded`);
} else {
    reportTest(false, 'Pattern Loading', `Expected 95,026 but got ${stats.totalPatterns}`);
    addIssue('critical', 'Pattern Database', 'Not all patterns loaded from JSON file',
        `Expected 95026, got ${stats.totalPatterns}`,
        'Check JSON parsing and pattern loading');
}

// ===== TEST 9: REGRESSION TESTING =====
console.log('='.repeat(80));
console.log('TEST SUITE 9: REGRESSION TESTING (vs Simple ALICE)');
console.log('='.repeat(80));
console.log();

console.log('--- Comparing with Simplified ALICE ---');
const comparisonTests = [
    'Hello',
    'What is your name',
    'Who created you',
    'How are you',
    'Thank you',
    'My name is Bob',
    'What is my name',
    'Goodbye'
];

let regressions = 0;
for (const input of comparisonTests) {
    const fullResponse = await alice.getResponse(input);
    const simpleResponse = aliceSimple.getResponse(input);

    const fullIsDefault = fullResponse.includes("I'm not sure") || fullResponse.includes("Can you rephrase");
    const simpleIsDefault = simpleResponse.includes("I'm not sure") || simpleResponse.includes("Can you rephrase");

    console.log(`  Input: "${input}"`);
    console.log(`    Simple: "${simpleResponse}"`);
    console.log(`    Full:   "${fullResponse}"`);

    if (!simpleIsDefault && fullIsDefault) {
        regressions++;
        console.log(`    ⚠ REGRESSION DETECTED`);
    } else {
        console.log(`    ✓ OK`);
    }
    console.log();
}

if (regressions > 0) {
    reportTest(false, 'Regression Check', `${regressions} regressions found`);
    addIssue('critical', 'Regression', 'ALICE Full performs worse than simple ALICE',
        `${regressions} inputs got default responses in Full but not in Simple`,
        'Review pattern priorities and matching logic');
} else {
    reportTest(true, 'Regression Check', 'No regressions - performs as well or better');
}

// ===== FINAL REPORT =====
console.log();
console.log('='.repeat(80));
console.log('FINAL TEST REPORT');
console.log('='.repeat(80));
console.log();
console.log(`Total Tests:    ${totalTests}`);
console.log(`Passed:         ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
console.log(`Failed:         ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
console.log(`Warnings:       ${warnings} (${Math.round(warnings/totalTests*100)}%)`);
console.log();

if (issues.length > 0) {
    const critical = issues.filter(i => i.severity === 'critical');
    const major = issues.filter(i => i.severity === 'major');
    const minor = issues.filter(i => i.severity === 'minor');

    console.log('='.repeat(80));
    console.log('ISSUES FOUND');
    console.log('='.repeat(80));
    console.log();
    console.log(`Critical Issues: ${critical.length}`);
    console.log(`Major Issues:    ${major.length}`);
    console.log(`Minor Issues:    ${minor.length}`);
    console.log();

    if (critical.length > 0) {
        console.log('--- CRITICAL ISSUES ---');
        console.log();
        critical.forEach((issue, i) => {
            console.log(`${i+1}. [${issue.category}] ${issue.description}`);
            console.log(`   Severity: CRITICAL`);
            console.log(`   Example: ${issue.example.substring(0, 100)}...`);
            console.log(`   Suggested Fix: ${issue.suggestedFix}`);
            console.log();
        });
    }

    if (major.length > 0) {
        console.log('--- MAJOR ISSUES ---');
        console.log();
        major.forEach((issue, i) => {
            console.log(`${i+1}. [${issue.category}] ${issue.description}`);
            console.log(`   Severity: MAJOR`);
            console.log(`   Example: ${issue.example.substring(0, 100)}...`);
            console.log(`   Suggested Fix: ${issue.suggestedFix}`);
            console.log();
        });
    }

    if (minor.length > 0) {
        console.log('--- MINOR ISSUES ---');
        console.log();
        minor.forEach((issue, i) => {
            console.log(`${i+1}. [${issue.category}] ${issue.description}`);
            console.log(`   Severity: MINOR`);
            console.log(`   Example: ${issue.example.substring(0, 100)}...`);
            console.log(`   Suggested Fix: ${issue.suggestedFix}`);
            console.log();
        });
    }
} else {
    console.log('='.repeat(80));
    console.log('✓ NO MAJOR ISSUES FOUND - ALICE Full is working well!');
    console.log('='.repeat(80));
    console.log();
}

console.log('='.repeat(80));
console.log('TESTING COMPLETE');
console.log('='.repeat(80));
