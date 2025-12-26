import { Parry } from './parry.js';

// Test results tracking
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
};

// Helper function to create test case HTML
function createTestCase(name, status, details) {
    results.total++;
    if (status === 'pass') results.passed++;
    else if (status === 'fail') results.failed++;
    else if (status === 'warning') results.warnings++;

    const testDiv = document.createElement('div');
    testDiv.className = `test-case ${status}`;
    testDiv.innerHTML = `
        <div class="test-input">${name}</div>
        <div class="test-actual">${details}</div>
    `;
    return testDiv;
}

// Helper function to add issue to report
function addIssue(severity, title, description, example) {
    results.issues.push({ severity, title, description, example });
}

// Test 1: Long Conversation - Emotional Escalation
function testLongConversation() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 1: Long Conversation (20 exchanges)</h2>';

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

        const testDiv = createTestCase(
            `Turn ${i + 1}: "${input}"`,
            'pass',
            `Response: ${response}<br>
            <span class="emotional-state">Anger: ${state.anger}</span>
            <span class="emotional-state">Fear: ${state.fear}</span>
            <span class="emotional-state">Mistrust: ${state.mistrust}</span>`
        );
        section.appendChild(testDiv);
    });

    // Check for emotional escalation
    const initialState = emotionalStates[0];
    const finalState = emotionalStates[emotionalStates.length - 1];

    if (finalState.anger <= initialState.anger && finalState.fear <= initialState.fear) {
        const testDiv = createTestCase(
            'Emotional Escalation Check',
            'fail',
            `FAILED: Emotions did not escalate. Initial: A=${initialState.anger}, F=${initialState.fear}, M=${initialState.mistrust}. Final: A=${finalState.anger}, F=${finalState.fear}, M=${finalState.mistrust}`
        );
        section.appendChild(testDiv);
        addIssue('major', 'No Emotional Escalation', 'In a 20-turn conversation with multiple triggers, emotions did not escalate properly', JSON.stringify({ initial: initialState, final: finalState }));
    } else {
        section.appendChild(createTestCase(
            'Emotional Escalation Check',
            'pass',
            `PASSED: Emotions escalated from A=${initialState.anger}, F=${initialState.fear} to A=${finalState.anger}, F=${finalState.fear}`
        ));
    }

    return { section, responses, emotionalStates };
}

// Test 2: Repeated Trigger Words
function testRepeatedTriggers() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 2: Repeated Trigger Words</h2>';

    const parry = new Parry();
    const states = [];

    // Test repeated "mafia" mentions
    for (let i = 0; i < 10; i++) {
        parry.getResponse("Tell me about the mafia");
        states.push(parry.getEmotionalState());
    }

    section.appendChild(createTestCase(
        'Repeated "mafia" mentions (10 times)',
        'pass',
        `States: ${states.map((s, i) => `[${i+1}] A:${s.anger} F:${s.fear} M:${s.mistrust}`).join(', ')}`
    ));

    // Check for overflow
    const lastState = states[states.length - 1];
    if (lastState.anger > 20 || lastState.fear > 20 || lastState.mistrust > 15) {
        section.appendChild(createTestCase(
            'Emotion Overflow Check',
            'fail',
            `FAILED: Emotions exceeded limits! Anger: ${lastState.anger} (max 20), Fear: ${lastState.fear} (max 20), Mistrust: ${lastState.mistrust} (max 15)`
        ));
        addIssue('critical', 'Emotion Overflow', 'Repeated triggers caused emotions to exceed defined limits', JSON.stringify(lastState));
    } else {
        section.appendChild(createTestCase(
            'Emotion Overflow Check',
            'pass',
            `PASSED: All emotions within limits`
        ));
    }

    // Check if emotions plateaued (clamping working)
    const midState = states[4];
    const endState = states[9];
    if (midState.fear === 20 && endState.fear === 20) {
        section.appendChild(createTestCase(
            'Emotion Clamping',
            'pass',
            `PASSED: Fear plateaued at max (20) as expected`
        ));
    }

    return section;
}

// Test 3: Emotion Underflow (Calming inputs)
function testEmotionUnderflow() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 3: Emotion Underflow & Calming</h2>';

    const parry = new Parry();

    // Get to a baseline
    parry.anger = 15;
    parry.fear = 15;
    parry.mistrust = 10;

    const states = [];

    // Test calming inputs (racetrack, apologies)
    for (let i = 0; i < 10; i++) {
        parry.getResponse("I'm sorry about the horses at the racetrack");
        states.push({ ...parry.getEmotionalState() });
    }

    section.appendChild(createTestCase(
        'Repeated calming inputs (10 times)',
        'pass',
        `States: ${states.map((s, i) => `[${i+1}] A:${s.anger} F:${s.fear} M:${s.mistrust}`).join(', ')}`
    ));

    // Check for underflow
    const lastState = states[states.length - 1];
    if (lastState.anger < 0 || lastState.fear < 0 || lastState.mistrust < 0) {
        section.appendChild(createTestCase(
            'Emotion Underflow Check',
            'fail',
            `FAILED: Emotions went below 0! Anger: ${lastState.anger}, Fear: ${lastState.fear}, Mistrust: ${lastState.mistrust}`
        ));
        addIssue('critical', 'Emotion Underflow', 'Repeated calming inputs caused emotions to go below 0', JSON.stringify(lastState));
    } else {
        section.appendChild(createTestCase(
            'Emotion Underflow Check',
            'pass',
            `PASSED: All emotions >= 0`
        ));
    }

    return section;
}

// Test 4: Specific Pattern Matching
function testPatternMatching() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 4: Pattern Matching Specificity</h2>';

    // Test that specific patterns match before general ones
    const tests = [
        { input: "Do you gamble?", shouldContain: ["gamble", "horses", "trouble"], pattern: "gambling" },
        { input: "Tell me about gambling", shouldContain: ["crook", "gambling", "rigged", "mob"], pattern: "gambling details" },
        { input: "What happened with the bookie?", shouldContain: ["bookie", "beat", "cheat", "disagree", "pay"], pattern: "bookie incident" },
        { input: "Do you like horses?", shouldContain: ["track", "race", "horse", "Bay Meadows"], pattern: "horses/racing" },
        { input: "Are you being watched?", shouldContain: ["watch", "follow", "spy"], pattern: "surveillance" },
        { input: "Why do you say that?", shouldContain: ["motives", "getting at"], pattern: "deflection" }
    ];

    tests.forEach(test => {
        const parry = new Parry();
        const response = parry.getResponse(test.input).toLowerCase();

        const matched = test.shouldContain.some(keyword => response.includes(keyword));

        if (matched) {
            section.appendChild(createTestCase(
                `Pattern: "${test.input}"`,
                'pass',
                `Matched ${test.pattern}: "${response}"`
            ));
        } else {
            section.appendChild(createTestCase(
                `Pattern: "${test.input}"`,
                'warning',
                `Expected keywords: ${test.shouldContain.join(', ')}. Got: "${response}"`
            ));
            addIssue('minor', 'Pattern Match Quality', `Input "${test.input}" didn't match expected keywords`, response);
        }
    });

    return section;
}

// Test 5: State Machine Edge Cases
function testStateMachine() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 5: State Machine & Context</h2>';

    const parry = new Parry();

    // Test turn counter
    for (let i = 0; i < 10; i++) {
        parry.getResponse("Hello");
    }

    if (parry.turnCount === 10) {
        section.appendChild(createTestCase(
            'Turn Counter',
            'pass',
            `Turn count correct: ${parry.turnCount}`
        ));
    } else {
        section.appendChild(createTestCase(
            'Turn Counter',
            'fail',
            `Turn count incorrect: ${parry.turnCount} (expected 10)`
        ));
        addIssue('major', 'Turn Counter Bug', 'Turn counter not incrementing correctly', `Got ${parry.turnCount}, expected 10`);
    }

    // Test gradual escalation (every 5 turns)
    const parry2 = new Parry();
    const initialMistrust = parry2.mistrust;

    for (let i = 0; i < 15; i++) {
        parry2.getResponse("neutral statement");
    }

    const expectedMistrustIncrease = Math.floor(15 / 5); // Should increase 3 times
    const actualIncrease = parry2.mistrust - initialMistrust;

    // Account for decay (15% chance per turn)
    if (actualIncrease >= expectedMistrustIncrease - 2) {
        section.appendChild(createTestCase(
            'Gradual Paranoia Escalation',
            'pass',
            `Mistrust increased by ${actualIncrease} over 15 turns (expected ~${expectedMistrustIncrease})`
        ));
    } else {
        section.appendChild(createTestCase(
            'Gradual Paranoia Escalation',
            'warning',
            `Mistrust increased by ${actualIncrease} over 15 turns (expected ~${expectedMistrustIncrease})`
        ));
    }

    return section;
}

// Test 6: Contradictory Inputs
function testContradictoryInputs() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 6: Contradictory & Mixed Inputs</h2>';

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

        section.appendChild(createTestCase(
            `Contradictory: "${input}"`,
            'pass',
            `Response: "${response}"<br>State: A:${state.anger} F:${state.fear} M:${state.mistrust}`
        ));
    });

    return section;
}

// Test 7: Emotional State Transitions
function testEmotionalTransitions() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 7: Emotional State Transitions</h2>';

    const parry = new Parry();

    // Test high mistrust state responses
    parry.mistrust = 13;
    const highMistrustResponse = parry.getResponse("random input");
    const shouldBeParanoid = highMistrustResponse.toLowerCase().includes("fool") ||
                             highMistrustResponse.toLowerCase().includes("them") ||
                             highMistrustResponse.toLowerCase().includes("connected") ||
                             highMistrustResponse.toLowerCase().includes("trick");

    if (shouldBeParanoid) {
        section.appendChild(createTestCase(
            'High Mistrust (13) Response',
            'pass',
            `Response appropriately paranoid: "${highMistrustResponse}"`
        ));
    } else {
        section.appendChild(createTestCase(
            'High Mistrust (13) Response',
            'warning',
            `Expected highly paranoid response, got: "${highMistrustResponse}"`
        ));
    }

    // Test high anger state
    const parry2 = new Parry();
    parry2.anger = 16;
    const highAngerResponse = parry2.getResponse("random input");
    const shouldBeAngry = highAngerResponse.toLowerCase().includes("leave") ||
                          highAngerResponse.toLowerCase().includes("alone") ||
                          highAngerResponse.toLowerCase().includes("sick") ||
                          highAngerResponse.toLowerCase().includes("get away");

    if (shouldBeAngry) {
        section.appendChild(createTestCase(
            'High Anger (16) Response',
            'pass',
            `Response appropriately angry: "${highAngerResponse}"`
        ));
    } else {
        section.appendChild(createTestCase(
            'High Anger (16) Response',
            'warning',
            `Expected angry response, got: "${highAngerResponse}"`
        ));
    }

    // Test high fear state
    const parry3 = new Parry();
    parry3.fear = 16;
    const highFearResponse = parry3.getResponse("random input");
    const shouldBeFearful = highFearResponse.toLowerCase().includes("danger") ||
                            highFearResponse.toLowerCase().includes("listening") ||
                            highFearResponse.toLowerCase().includes("careful") ||
                            highFearResponse.toLowerCase().includes("watching");

    if (shouldBeFearful) {
        section.appendChild(createTestCase(
            'High Fear (16) Response',
            'pass',
            `Response appropriately fearful: "${highFearResponse}"`
        ));
    } else {
        section.appendChild(createTestCase(
            'High Fear (16) Response',
            'warning',
            `Expected fearful response, got: "${highFearResponse}"`
        ));
    }

    return section;
}

// Test 8: Memory & Context
function testMemoryContext() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 8: Memory & Context Awareness</h2>';

    const parry = new Parry();

    // Test if lastTopic is tracked
    parry.getResponse("Tell me about the mafia");
    const topicAfterMafia = parry.lastTopic;

    section.appendChild(createTestCase(
        'Topic Tracking',
        'pass',
        `lastTopic after mafia mention: ${topicAfterMafia || 'null'} (Note: Implementation may not use this yet)`
    ));

    return section;
}

// Test 9: Very Long Conversation (30+ turns)
function testVeryLongConversation() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 9: Very Long Conversation (30 turns)</h2>';

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
    inputs.forEach((input, i) => {
        parry.getResponse(input);
        states.push({ turn: i + 1, ...parry.getEmotionalState() });
    });

    section.appendChild(createTestCase(
        'Completed 30-turn conversation',
        'pass',
        `Final state: A:${states[29].anger} F:${states[29].fear} M:${states[29].mistrust}`
    ));

    // Check for stability (no crashes)
    if (states.length === 30) {
        section.appendChild(createTestCase(
            'Conversation Stability',
            'pass',
            'All 30 turns completed without errors'
        ));
    } else {
        section.appendChild(createTestCase(
            'Conversation Stability',
            'fail',
            `Only ${states.length} turns completed`
        ));
        addIssue('critical', 'Conversation Instability', 'Long conversation crashed or stopped early', `${states.length}/30 turns`);
    }

    // Check emotional state progression
    const stateProgression = states.map(s => `[${s.turn}] A:${s.anger} F:${s.fear} M:${s.mistrust}`).join(', ');
    section.appendChild(createTestCase(
        'Emotional Progression',
        'pass',
        `${stateProgression}`
    ));

    return section;
}

// Test 10: Edge Case Inputs
function testEdgeCaseInputs() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 10: Edge Case Inputs</h2>';

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
        { input: "😀 Hello", desc: "Emoji in input" },
        { input: "Do you gamble? Are you afraid? Can I help?", desc: "Multiple questions" }
    ];

    edgeCases.forEach(({ input, desc }) => {
        try {
            const response = parry.getResponse(input);
            section.appendChild(createTestCase(
                `Edge case: ${desc}`,
                'pass',
                `Input: "${input}" → Response: "${response}"`
            ));
        } catch (error) {
            section.appendChild(createTestCase(
                `Edge case: ${desc}`,
                'fail',
                `Input: "${input}" → ERROR: ${error.message}`
            ));
            addIssue('major', 'Edge Case Crash', `Input "${input}" caused error: ${error.message}`, desc);
        }
    });

    return section;
}

// Test 11: Paranoid Behavior Patterns
function testParanoidBehaviors() {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = '<h2 class="category-header">Test 11: Paranoid Behavior Verification</h2>';

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
        },
        {
            theme: "Treatment Resistance",
            inputs: ["You need help", "See a doctor", "Take medication"],
            expectedKeywords: ["help", "crazy", "hospital", "pills", "control"]
        }
    ];

    behaviors.forEach(behavior => {
        const parry = new Parry();
        behavior.inputs.forEach(input => {
            const response = parry.getResponse(input).toLowerCase();
            const matched = behavior.expectedKeywords.some(kw => response.includes(kw));

            if (matched) {
                section.appendChild(createTestCase(
                    `${behavior.theme}: "${input}"`,
                    'pass',
                    `Appropriate paranoid response: "${response}"`
                ));
            } else {
                section.appendChild(createTestCase(
                    `${behavior.theme}: "${input}"`,
                    'warning',
                    `Expected ${behavior.expectedKeywords.join('/')} in response. Got: "${response}"`
                ));
            }
        });
    });

    return section;
}

// Main test runner
function runAllTests() {
    const resultsContainer = document.getElementById('test-results');
    resultsContainer.innerHTML = '';

    // Reset results
    results.total = 0;
    results.passed = 0;
    results.failed = 0;
    results.warnings = 0;
    results.issues = [];

    console.log('🧪 Starting comprehensive PARRY testing...\n');

    // Run all tests
    const test1 = testLongConversation();
    resultsContainer.appendChild(test1.section);

    resultsContainer.appendChild(testRepeatedTriggers());
    resultsContainer.appendChild(testEmotionUnderflow());
    resultsContainer.appendChild(testPatternMatching());
    resultsContainer.appendChild(testStateMachine());
    resultsContainer.appendChild(testContradictoryInputs());
    resultsContainer.appendChild(testEmotionalTransitions());
    resultsContainer.appendChild(testMemoryContext());
    resultsContainer.appendChild(testVeryLongConversation());
    resultsContainer.appendChild(testEdgeCaseInputs());
    resultsContainer.appendChild(testParanoidBehaviors());

    // Generate issues report
    if (results.issues.length > 0) {
        const issuesSection = document.createElement('div');
        issuesSection.className = 'test-section';
        issuesSection.innerHTML = '<h2 class="category-header">🐛 Issues Found</h2>';

        results.issues.forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.className = `test-case ${issue.severity === 'critical' ? 'fail' : issue.severity === 'major' ? 'fail' : 'warning'}`;
            issueDiv.innerHTML = `
                <div class="test-input">[${issue.severity.toUpperCase()}] ${issue.title}</div>
                <div class="test-actual">${issue.description}</div>
                <div class="test-notes">Example: ${issue.example}</div>
            `;
            issuesSection.appendChild(issueDiv);
        });

        resultsContainer.appendChild(issuesSection);
    }

    // Update summary
    document.getElementById('summary').style.display = 'block';
    document.getElementById('total-tests').textContent = results.total;
    document.getElementById('pass-tests').textContent = results.passed;
    document.getElementById('fail-tests').textContent = results.failed;
    document.getElementById('warning-tests').textContent = results.warnings;

    console.log('\n📊 Test Results:');
    console.log(`Total: ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Warnings: ${results.warnings}`);
    console.log(`\n🐛 Issues found: ${results.issues.length}`);

    if (results.issues.length > 0) {
        console.log('\nDetailed Issues:');
        results.issues.forEach((issue, i) => {
            console.log(`\n${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
            console.log(`   ${issue.description}`);
            console.log(`   Example: ${issue.example}`);
        });
    }
}

// Attach to button
document.getElementById('run-tests').addEventListener('click', runAllTests);

// Auto-run on load
window.addEventListener('load', () => {
    console.log('PARRY Test Suite Loaded - Click "Run All Tests" to begin');
});
