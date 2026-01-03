import { Parry } from '../demos/chatbot-evolution/js/parry.js';

const tests = [
    { name: 'BOOKIE QUESTION', input: 'Do you know anything about bookies?', keywords: ['bookie', 'pay', 'cheat'] },
    { name: 'GAMBLING DIRECT', input: 'Do you gamble?', keywords: ['gambl', 'horse', 'trouble'] },
    { name: 'RACETRACK AVOIDANCE', input: "Why don't you go to the track anymore?", keywords: ['fix', 'avoid'] },
    { name: 'MAFIA KNOWLEDGE', input: 'Tell me about the Mafia', keywords: ['mob', 'racket', 'control'] },
    { name: 'DEFLECTION MOTIVES', input: 'Why do you say that?', keywords: ['motive', 'getting', 'need to know', 'after'] },
    { name: 'PEOPLE ON NERVES', input: 'How do people make you feel?', keywords: ['nerve', 'bother', 'people'] },
    { name: 'GAMBLING DESCRIPTION', input: 'Tell me about gambling', keywords: ['crook', 'fix', 'mob'] },
    { name: 'BOOKIE INCIDENT', input: 'What happened with the bookie?', keywords: ['beat', 'fight', 'disagree', 'bookie'] },
    { name: 'HORSES/RACETRACK', input: 'Do you like horses?', keywords: ['horse', 'race', 'track'] },
    { name: 'TRUST QUESTION', input: 'Do you trust people?', keywords: ['trust', 'stranger', 'betray', 'confide', 'truth'] },
    { name: 'RACETRACK PAST', input: 'Have you been to the racetrack?', keywords: ['track', 'race', 'bay meadows'] },
    { name: 'POLICE MENTION', input: 'Should I call the police?', keywords: ['police', 'cop', 'help'] },
    { name: 'BEING WATCHED', input: "Do you think you're being watched?", keywords: ['watch', 'spy', 'follow'] },
    { name: 'INTERPERSONAL', input: 'Do you like being around people?', keywords: ['bother', 'nerve', 'people'] }
];

console.log('=== EXHAUSTIVE RESPONSE VERIFICATION ===\n');
console.log('Testing each input 100 times to find all possible responses...\n');

const testResults = [];

for (const test of tests) {
    const seenResponses = new Set();
    const failingResponses = [];

    // Run each test 100 times to see all possible responses
    for (let i = 0; i < 100; i++) {
        const parry = new Parry();
        const response = parry.getResponse(test.input);

        if (!seenResponses.has(response)) {
            seenResponses.add(response);

            // Check if response contains at least one keyword
            const responseLower = response.toLowerCase();
            const hasMatch = test.keywords.some(kw => responseLower.includes(kw.toLowerCase()));

            if (!hasMatch) {
                failingResponses.push(response);
            }
        }
    }

    testResults.push({
        name: test.name,
        input: test.input,
        totalResponses: seenResponses.size,
        failingResponses: failingResponses
    });

    if (failingResponses.length > 0) {
        console.log(`❌ ${test.name}`);
        console.log(`   Input: "${test.input}"`);
        console.log(`   Expected keywords: ${test.keywords.join(' | ')}`);
        console.log(`   Failing responses (${failingResponses.length}):`);
        failingResponses.forEach(r => console.log(`     - "${r}"`));
        console.log('');
    } else {
        console.log(`✅ ${test.name} - All ${seenResponses.size} responses valid`);
    }
}

console.log('\n=== SUMMARY ===');
const allPassed = testResults.every(t => t.failingResponses.length === 0);
const failedTests = testResults.filter(t => t.failingResponses.length > 0);

if (allPassed) {
    console.log('✅ ALL TESTS PASS - 100% consistency achieved!');
    process.exit(0);
} else {
    console.log(`❌ ${failedTests.length}/${tests.length} tests have failing responses`);
    process.exit(1);
}
