import { Parry } from '../demos/15-chatbot-evolution/js/parry.js';

console.log('=== COMPREHENSIVE TESTING AFTER FIXES ===\n');

const criticalTests = [
    { test: 'BOOKIE QUESTION', input: 'Do you know anything about bookies?', expected: 'bookie|pay|cheat' },
    { test: 'GAMBLING DIRECT', input: 'Do you gamble?', expected: 'gambl|horse|trouble' },
    { test: 'RACETRACK AVOIDANCE', input: "Why don't you go to the track anymore?", expected: 'fix|avoid' },
    { test: 'MAFIA KNOWLEDGE', input: 'Tell me about the Mafia', expected: 'mob|racket|control' },
    { test: 'DEFLECTION MOTIVES', input: 'Why do you say that?', expected: 'motive|getting|need to know|after' },
    { test: 'PEOPLE ON NERVES', input: 'How do people make you feel?', expected: 'nerve|bother|people' },
    { test: 'GAMBLING DESCRIPTION', input: 'Tell me about gambling', expected: 'crook|fix|mob' },
    { test: 'BOOKIE INCIDENT', input: 'What happened with the bookie?', expected: 'beat|fight|disagree|bookie' },
    { test: 'HORSES/RACETRACK', input: 'Do you like horses?', expected: 'horse|race|track' },
    { test: 'TRUST QUESTION', input: 'Do you trust people?', expected: 'trust|stranger|betray|confide|truth' },
    { test: 'RACETRACK PAST', input: 'Have you been to the racetrack?', expected: 'track|race|bay meadows' },
    { test: 'POLICE MENTION', input: 'Should I call the police?', expected: 'police|cop|help' },
    { test: 'BEING WATCHED', input: "Do you think you're being watched?", expected: 'watch|spy|follow' },
    { test: 'INTERPERSONAL', input: 'Do you like being around people?', expected: 'bother|nerve|people' }
];

let passed = 0;

criticalTests.forEach((test) => {
    const parry = new Parry();
    const response = parry.getResponse(test.input);

    const keywords = test.expected.split('|');
    const responseLower = response.toLowerCase();
    const match = keywords.some(kw => responseLower.includes(kw.toLowerCase()));

    console.log(`[${match ? 'PASS' : 'FAIL'}] ${test.test}`);
    console.log(`  INPUT: ${test.input}`);
    console.log(`  RESPONSE: ${response}`);
    if (!match) {
        console.log(`  EXPECTED ONE OF: ${test.expected}`);
    }
    console.log('');

    if (match) passed++;
});

console.log(`\n=== FINAL RESULTS ===`);
console.log(`PASSED: ${passed}/${criticalTests.length}`);
console.log(`SUCCESS RATE: ${(passed/criticalTests.length*100).toFixed(1)}%`);

if (passed >= criticalTests.length * 0.9) {
    console.log(`\n✅ EXCELLENT! Implementation is highly authentic.`);
} else if (passed >= criticalTests.length * 0.8) {
    console.log(`\n✓ GOOD! Implementation matches most historical behaviors.`);
} else {
    console.log(`\n⚠ Needs more work to match historical PARRY.`);
}
