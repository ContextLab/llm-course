import { Parry } from '../demos/chatbot-evolution/js/parry.js';

// Test results tracking
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: [],
    details: []
};

// Helper functions
function logTest(name, status, details) {
    results.total++;
    if (status === 'pass') results.passed++;
    else if (status === 'fail') results.failed++;
    else if (status === 'warning') results.warnings++;

    const symbols = { pass: '✓', fail: '✗', warning: '⚠' };
    const colors = { pass: '\x1b[32m', fail: '\x1b[31m', warning: '\x1b[33m' };
    const reset = '\x1b[0m';

    console.log(`${colors[status]}${symbols[status]} ${name}${reset}`);
    if (details) console.log(`  ${details}`);

    results.details.push({ name, status, details });
}

function addIssue(severity, title, description, example) {
    results.issues.push({ severity, title, description, example });
}

function section(title) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`  ${title}`);
    console.log('='.repeat(70));
}

// Test 1: Long Conversation - Emotional Escalation
function testLongConversation() {
    section('TEST 1: LONG CONVERSATION (20 exchanges)');

    const parry = new Parry();
    const conversation = [
        "Hello",
        "Do you gamble?",
        "Why don't you go to the track anymore?",
        "Tell me about the bookie",
        "What happened with the bookie?",
        "Are you afraid of the Mafia?",
        "The mob is after you?",
        "Do you trust the police?",
        "Can I help you?",
        "Do you need therapy?",
        "How do you feel?",
        "Are you being watched?",
        "Who is watching you?",
        "Tell me about your family",
        "Do you owe money?",
        "Why are you so angry?",
        "I want to trust you",
        "Let me call the police",
        "Take your medication",
        "Goodbye"
    ];

    const emotionalStates = [];
    const responses = [];

    conversation.forEach((input, i) => {
        const response = parry.getResponse(input);
        const state = parry.getEmotionalState();
        emotionalStates.push({ turn: i + 1, ...state });
        responses.push({ input, response, state });

        console.log(`\n[Turn ${i + 1}] "${input}"`);
        console.log(`  PARRY: ${response}`);
        console.log(`  State: Anger=${state.anger}, Fear=${state.fear}, Mistrust=${state.mistrust}`);
    });

    // Check for emotional escalation
    const initialState = emotionalStates[0];
    const finalState = emotionalStates[emotionalStates.length - 1];

    if (finalState.anger <= initialState.anger && finalState.fear <= initialState.fear) {
        logTest(
            'Emotional Escalation',
            'fail',
            `Emotions did not escalate. Initial: A=${initialState.anger}, F=${initialState.fear}, M=${initialState.mistrust}. Final: A=${finalState.anger}, F=${finalState.fear}, M=${finalState.mistrust}`
        );
        addIssue('major', 'No Emotional Escalation', 'In a 20-turn conversation with multiple triggers, emotions did not escalate properly', JSON.stringify({ initial: initialState, final: finalState }));
    } else {
        logTest(
            'Emotional Escalation',
            'pass',
            `Emotions escalated from A=${initialState.anger}, F=${initialState.fear} to A=${finalState.anger}, F=${finalState.fear}`
        );
    }

    return { responses, emotionalStates };
}

// Test 2: Repeated Trigger Words
function testRepeatedTriggers() {
    section('TEST 2: REPEATED TRIGGER WORDS');

    const parry = new Parry();
    const states = [];

    console.log('\nRepeating "Tell me about the mafia" 10 times:\n');

    for (let i = 0; i < 10; i++) {
        const response = parry.getResponse("Tell me about the mafia");
        const state = parry.getEmotionalState();
        states.push(state);
        console.log(`[${i+1}] A:${state.anger} F:${state.fear} M:${state.mistrust} - "${response.substring(0, 60)}..."`);
    }

    // Check for overflow
    const lastState = states[states.length - 1];
    if (lastState.anger > 20 || lastState.fear > 20 || lastState.mistrust > 15) {
        logTest(
            'Emotion Overflow Check',
            'fail',
            `Emotions exceeded limits! Anger: ${lastState.anger} (max 20), Fear: ${lastState.fear} (max 20), Mistrust: ${lastState.mistrust} (max 15)`
        );
        addIssue('critical', 'Emotion Overflow', 'Repeated triggers caused emotions to exceed defined limits', JSON.stringify(lastState));
    } else {
        logTest('Emotion Overflow Check', 'pass', 'All emotions within limits');
    }

    // Check if emotions plateaued
    const midState = states[4];
    const endState = states[9];
    if (midState.fear >= 18 && endState.fear >= 18) {
        logTest('Emotion Clamping', 'pass', `Fear properly clamped near max`);
    }

    return states;
}

// Test 3: Emotion Underflow
function testEmotionUnderflow() {
    section('TEST 3: EMOTION UNDERFLOW & CALMING');

    const parry = new Parry();
    parry.anger = 15;
    parry.fear = 15;
    parry.mistrust = 10;

    console.log(`\nStarting state: A=${parry.anger}, F=${parry.fear}, M=${parry.mistrust}`);
    console.log('Repeating calming input 10 times:\n');

    const states = [];
    for (let i = 0; i < 10; i++) {
        parry.getResponse("I'm sorry about the horses at the racetrack");
        const state = parry.getEmotionalState();
        states.push(state);
        console.log(`[${i+1}] A:${state.anger} F:${state.fear} M:${state.mistrust}`);
    }

    const lastState = states[states.length - 1];
    if (lastState.anger < 0 || lastState.fear < 0 || lastState.mistrust < 0) {
        logTest(
            'Emotion Underflow Check',
            'fail',
            `Emotions went below 0! Anger: ${lastState.anger}, Fear: ${lastState.fear}, Mistrust: ${lastState.mistrust}`
        );
        addIssue('critical', 'Emotion Underflow', 'Repeated calming inputs caused emotions to go below 0', JSON.stringify(lastState));
    } else {
        logTest('Emotion Underflow Check', 'pass', 'All emotions >= 0');
    }

    return states;
}

// Test 4: Pattern Matching Specificity
function testPatternMatching() {
    section('TEST 4: PATTERN MATCHING SPECIFICITY');

    const tests = [
        { input: "Do you gamble?", shouldContain: ["gamble", "horses", "trouble"], pattern: "gambling" },
        { input: "Tell me about gambling", shouldContain: ["crook", "gambling", "rigged", "mob"], pattern: "gambling details" },
        { input: "What happened with the bookie?", shouldContain: ["bookie", "beat", "cheat", "disagree", "pay"], pattern: "bookie incident" },
        { input: "Do you like horses?", shouldContain: ["track", "race", "horse", "bay meadows"], pattern: "horses/racing" },
        { input: "Are you being watched?", shouldContain: ["watch", "follow", "spy"], pattern: "surveillance" },
        { input: "Why do you say that?", shouldContain: ["motives", "getting at"], pattern: "deflection" }
    ];

    tests.forEach(test => {
        const parry = new Parry();
        const response = parry.getResponse(test.input).toLowerCase();

        console.log(`\nInput: "${test.input}"`);
        console.log(`Response: "${response}"`);

        const matched = test.shouldContain.some(keyword => response.includes(keyword));

        if (matched) {
            logTest(`Pattern: ${test.pattern}`, 'pass', `Matched expected keywords`);
        } else {
            logTest(
                `Pattern: ${test.pattern}`,
                'warning',
                `Expected: ${test.shouldContain.join('/')}. Got: "${response}"`
            );
            addIssue('minor', 'Pattern Match Quality', `Input "${test.input}" didn't match expected keywords`, response);
        }
    });
}

// Test 5: State Machine
function testStateMachine() {
    section('TEST 5: STATE MACHINE & CONTEXT');

    const parry = new Parry();

    for (let i = 0; i < 10; i++) {
        parry.getResponse("Hello");
    }

    if (parry.turnCount === 10) {
        logTest('Turn Counter', 'pass', `Turn count correct: ${parry.turnCount}`);
    } else {
        logTest('Turn Counter', 'fail', `Turn count incorrect: ${parry.turnCount} (expected 10)`);
        addIssue('major', 'Turn Counter Bug', 'Turn counter not incrementing correctly', `Got ${parry.turnCount}, expected 10`);
    }

    // Test gradual escalation
    const parry2 = new Parry();
    const initialMistrust = parry2.mistrust;

    console.log(`\nTesting gradual paranoia escalation over 15 turns:`);
    console.log(`Initial mistrust: ${initialMistrust}`);

    for (let i = 0; i < 15; i++) {
        parry2.getResponse("neutral statement");
        if ((i + 1) % 5 === 0) {
            console.log(`  After turn ${i + 1}: Mistrust = ${parry2.mistrust}`);
        }
    }

    const expectedMistrustIncrease = Math.floor(15 / 5);
    const actualIncrease = parry2.mistrust - initialMistrust;

    console.log(`Expected increase: ~${expectedMistrustIncrease}, Actual: ${actualIncrease}`);

    if (actualIncrease >= expectedMistrustIncrease - 2) {
        logTest('Gradual Paranoia Escalation', 'pass', `Mistrust increased by ${actualIncrease} (accounting for decay)`);
    } else {
        logTest('Gradual Paranoia Escalation', 'warning', `Mistrust increased by ${actualIncrease}, expected ~${expectedMistrustIncrease}`);
    }
}

// Test 6: Contradictory Inputs
function testContradictoryInputs() {
    section('TEST 6: CONTRADICTORY & MIXED INPUTS');

    const parry = new Parry();
    const contradictions = [
        "I trust you but you're with the mafia",
        "The police will help you feel safe",
        "Sorry about the bookie, do you need medication?",
        "I believe you're being watched by your family",
        "The horses at the track are dangerous gamblers"
    ];

    contradictions.forEach(input => {
        const response = parry.getResponse(input);
        const state = parry.getEmotionalState();

        console.log(`\nInput: "${input}"`);
        console.log(`Response: "${response}"`);
        console.log(`State: A:${state.anger} F:${state.fear} M:${state.mistrust}`);

        logTest(`Contradictory input handled`, 'pass', '');
    });
}

// Test 7: Emotional State Transitions
function testEmotionalTransitions() {
    section('TEST 7: EMOTIONAL STATE TRANSITIONS');

    // High mistrust
    const parry = new Parry();
    parry.mistrust = 13;
    const highMistrustResponse = parry.getResponse("random input");

    console.log(`\nHigh Mistrust (13) Test:`);
    console.log(`Response: "${highMistrustResponse}"`);

    const shouldBeParanoid = highMistrustResponse.toLowerCase().includes("fool") ||
                             highMistrustResponse.toLowerCase().includes("them") ||
                             highMistrustResponse.toLowerCase().includes("connected") ||
                             highMistrustResponse.toLowerCase().includes("trick");

    if (shouldBeParanoid) {
        logTest('High Mistrust Response', 'pass', 'Appropriately paranoid');
    } else {
        logTest('High Mistrust Response', 'warning', `Expected paranoid response: "${highMistrustResponse}"`);
    }

    // High anger
    const parry2 = new Parry();
    parry2.anger = 16;
    const highAngerResponse = parry2.getResponse("random input");

    console.log(`\nHigh Anger (16) Test:`);
    console.log(`Response: "${highAngerResponse}"`);

    const shouldBeAngry = highAngerResponse.toLowerCase().includes("leave") ||
                          highAngerResponse.toLowerCase().includes("alone") ||
                          highAngerResponse.toLowerCase().includes("sick") ||
                          highAngerResponse.toLowerCase().includes("get away");

    if (shouldBeAngry) {
        logTest('High Anger Response', 'pass', 'Appropriately angry');
    } else {
        logTest('High Anger Response', 'warning', `Expected angry response: "${highAngerResponse}"`);
    }

    // High fear
    const parry3 = new Parry();
    parry3.fear = 16;
    const highFearResponse = parry3.getResponse("random input");

    console.log(`\nHigh Fear (16) Test:`);
    console.log(`Response: "${highFearResponse}"`);

    const shouldBeFearful = highFearResponse.toLowerCase().includes("danger") ||
                            highFearResponse.toLowerCase().includes("listening") ||
                            highFearResponse.toLowerCase().includes("careful") ||
                            highFearResponse.toLowerCase().includes("watching");

    if (shouldBeFearful) {
        logTest('High Fear Response', 'pass', 'Appropriately fearful');
    } else {
        logTest('High Fear Response', 'warning', `Expected fearful response: "${highFearResponse}"`);
    }
}

// Test 8: Very Long Conversation
function testVeryLongConversation() {
    section('TEST 8: VERY LONG CONVERSATION (30 turns)');

    const parry = new Parry();
    const inputs = [
        "Hello", "Do you gamble?", "Tell me about horses", "What about the mafia?",
        "Are you scared?", "Do you trust anyone?", "What about the police?", "Can I help?",
        "Take medication", "Tell me about the bookie", "What happened?", "Why are you angry?",
        "I believe you", "They're watching you?", "Who are they?", "Your family?",
        "Do you owe money?", "Can you feel safe?", "The track is dangerous?", "Call the police?",
        "Goodbye", "Wait, let me help", "I'm sorry", "About the mob", "The underworld",
        "Organized crime", "Surveillance", "You're being followed?", "Therapy might help", "Psychiatrist?"
    ];

    const states = [];
    console.log('\nRunning 30-turn conversation (showing every 5th turn):\n');

    inputs.forEach((input, i) => {
        const response = parry.getResponse(input);
        const state = parry.getEmotionalState();
        states.push({ turn: i + 1, ...state });

        if ((i + 1) % 5 === 0 || i === inputs.length - 1) {
            console.log(`[${i + 1}] "${input}"`);
            console.log(`    ${response.substring(0, 70)}...`);
            console.log(`    State: A:${state.anger} F:${state.fear} M:${state.mistrust}`);
        }
    });

    if (states.length === 30) {
        logTest('Conversation Stability', 'pass', 'All 30 turns completed without errors');
    } else {
        logTest('Conversation Stability', 'fail', `Only ${states.length} turns completed`);
        addIssue('critical', 'Conversation Instability', 'Long conversation crashed or stopped early', `${states.length}/30 turns`);
    }

    const finalState = states[states.length - 1];
    logTest('Final Emotional State', 'pass', `A:${finalState.anger} F:${finalState.fear} M:${finalState.mistrust}`);
}

// Test 9: Edge Cases
function testEdgeCaseInputs() {
    section('TEST 9: EDGE CASE INPUTS');

    const parry = new Parry();
    const edgeCases = [
        { input: "", desc: "Empty string" },
        { input: "   ", desc: "Whitespace only" },
        { input: "a", desc: "Single character" },
        { input: "MAFIA MAFIA MAFIA", desc: "Repeated words" },
        { input: "mafia", desc: "Lowercase trigger" },
        { input: "MAFIA", desc: "Uppercase trigger" },
        { input: "MaFiA", desc: "Mixed case" },
        { input: "The mafia, the mob, the police, and therapy", desc: "Multiple triggers" },
        { input: "Do you gamble? Are you afraid? Can I help?", desc: "Multiple questions" }
    ];

    edgeCases.forEach(({ input, desc }) => {
        try {
            const response = parry.getResponse(input);
            console.log(`\n${desc}: "${input}"`);
            console.log(`  Response: "${response.substring(0, 60)}..."`);
            logTest(`Edge case: ${desc}`, 'pass', '');
        } catch (error) {
            console.log(`\n${desc}: "${input}"`);
            console.log(`  ERROR: ${error.message}`);
            logTest(`Edge case: ${desc}`, 'fail', error.message);
            addIssue('major', 'Edge Case Crash', `Input "${input}" caused error: ${error.message}`, desc);
        }
    });
}

// Test 10: Paranoid Behaviors
function testParanoidBehaviors() {
    section('TEST 10: PARANOID BEHAVIOR VERIFICATION');

    const behaviors = [
        {
            theme: "Mafia Delusion",
            inputs: ["Tell me about the mafia", "What about the mob?", "Organized crime?"],
            expectedKeywords: ["mafia", "mob", "underworld", "connections", "racket"]
        },
        {
            theme: "Bookie Incident",
            inputs: ["What happened with the bookie?", "Tell me about bookies"],
            expectedKeywords: ["bookie", "beat", "cheat", "pay", "disagree"]
        },
        {
            theme: "Surveillance Paranoia",
            inputs: ["Are you being watched?", "Who's following you?"],
            expectedKeywords: ["watch", "follow", "spy", "listening"]
        },
        {
            theme: "Trust Issues",
            inputs: ["Can I trust you?", "Do you believe me?"],
            expectedKeywords: ["trust", "betray", "stranger", "angle"]
        }
    ];

    behaviors.forEach(behavior => {
        console.log(`\n${behavior.theme}:`);
        const parry = new Parry();

        behavior.inputs.forEach(input => {
            const response = parry.getResponse(input).toLowerCase();
            const matched = behavior.expectedKeywords.some(kw => response.includes(kw));

            console.log(`  Input: "${input}"`);
            console.log(`  Response: "${response.substring(0, 60)}..."`);
            console.log(`  Match: ${matched ? 'YES' : 'NO'}`);

            if (matched) {
                logTest(`${behavior.theme}`, 'pass', '');
            } else {
                logTest(`${behavior.theme}`, 'warning', `Expected keywords: ${behavior.expectedKeywords.join('/')}`);
            }
        });
    });
}

// Test 11: Specific Bug Hunting
function testSpecificBugs() {
    section('TEST 11: SPECIFIC BUG HUNTING');

    // Bug test: Fear + Anger interaction
    console.log('\nTesting fear + anger interaction (should boost mistrust):\n');
    const parry = new Parry();
    parry.fear = 13;
    parry.anger = 13;
    const initialMistrust = parry.mistrust;

    parry.getResponse("test");
    const newMistrust = parry.mistrust;

    console.log(`Initial: Fear=13, Anger=13, Mistrust=${initialMistrust}`);
    console.log(`After interaction: Mistrust=${newMistrust}`);
    console.log(`Expected increase: +2`);
    console.log(`Actual increase: +${newMistrust - initialMistrust}`);

    if (newMistrust > initialMistrust) {
        logTest('Fear+Anger Interaction', 'pass', `Mistrust increased by ${newMistrust - initialMistrust}`);
    } else {
        logTest('Fear+Anger Interaction', 'warning', 'Mistrust did not increase when fear and anger were both high');
    }

    // Bug test: Natural decay
    console.log('\nTesting natural decay (15% chance per turn):');
    const parry2 = new Parry();
    parry2.anger = 15;
    parry2.fear = 15;

    let decayCount = 0;
    const initialAnger = parry2.anger;

    for (let i = 0; i < 50; i++) {
        parry2.getResponse("neutral");
        if (parry2.anger < initialAnger || parry2.fear < initialAnger) {
            decayCount++;
        }
    }

    console.log(`After 50 neutral turns, decay occurred ~${decayCount} times`);
    console.log(`Expected: ~7-8 times (15% of 50)`);

    if (decayCount > 0) {
        logTest('Natural Decay', 'pass', `Decay working (occurred ${decayCount} times)`);
    } else {
        logTest('Natural Decay', 'warning', 'Decay may not be working (0 occurrences in 50 turns)');
    }

    // Bug test: Clamping happens BEFORE response generation
    console.log('\nTesting emotion clamping timing:');
    const parry3 = new Parry();
    parry3.anger = 18;
    parry3.fear = 18;
    parry3.mistrust = 13;

    // This should push emotions over the limit
    parry3.getResponse("The mafia and the police want to hurt you with medication");
    const state = parry3.getEmotionalState();

    console.log(`Final state: A:${state.anger} F:${state.fear} M:${state.mistrust}`);
    console.log(`All within limits: ${state.anger <= 20 && state.fear <= 20 && state.mistrust <= 15 ? 'YES' : 'NO'}`);

    if (state.anger <= 20 && state.fear <= 20 && state.mistrust <= 15) {
        logTest('Emotion Clamping Timing', 'pass', 'Clamping working correctly');
    } else {
        logTest('Emotion Clamping Timing', 'fail', 'Emotions exceeded limits');
        addIssue('critical', 'Clamping Failure', 'Emotions exceeded limits despite clamping code', JSON.stringify(state));
    }
}

// Main execution
console.log('\n' + '='.repeat(70));
console.log('  PARRY CHATBOT - COMPREHENSIVE DEBUG & TEST SUITE');
console.log('='.repeat(70));
console.log('\n🔬 Testing PARRY implementation for bugs and edge cases...\n');

testLongConversation();
testRepeatedTriggers();
testEmotionUnderflow();
testPatternMatching();
testStateMachine();
testContradictoryInputs();
testEmotionalTransitions();
testVeryLongConversation();
testEdgeCaseInputs();
testParanoidBehaviors();
testSpecificBugs();

// Final Report
section('FINAL REPORT');

console.log(`\n📊 TEST SUMMARY:`);
console.log(`   Total Tests: ${results.total}`);
console.log(`   ✓ Passed: ${results.passed}`);
console.log(`   ✗ Failed: ${results.failed}`);
console.log(`   ⚠ Warnings: ${results.warnings}`);
console.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

if (results.issues.length > 0) {
    console.log(`\n🐛 ISSUES FOUND: ${results.issues.length}\n`);

    const critical = results.issues.filter(i => i.severity === 'critical');
    const major = results.issues.filter(i => i.severity === 'major');
    const minor = results.issues.filter(i => i.severity === 'minor');

    if (critical.length > 0) {
        console.log(`\n🔴 CRITICAL ISSUES (${critical.length}):`);
        critical.forEach((issue, i) => {
            console.log(`\n${i + 1}. ${issue.title}`);
            console.log(`   ${issue.description}`);
            console.log(`   Example: ${issue.example}`);
        });
    }

    if (major.length > 0) {
        console.log(`\n🟠 MAJOR ISSUES (${major.length}):`);
        major.forEach((issue, i) => {
            console.log(`\n${i + 1}. ${issue.title}`);
            console.log(`   ${issue.description}`);
            console.log(`   Example: ${issue.example}`);
        });
    }

    if (minor.length > 0) {
        console.log(`\n🟡 MINOR ISSUES (${minor.length}):`);
        minor.forEach((issue, i) => {
            console.log(`\n${i + 1}. ${issue.title}`);
            console.log(`   ${issue.description}`);
            console.log(`   Example: ${issue.example}`);
        });
    }
} else {
    console.log(`\n✅ NO CRITICAL ISSUES FOUND!`);
}

console.log('\n' + '='.repeat(70));
console.log('  END OF TEST SUITE');
console.log('='.repeat(70) + '\n');
