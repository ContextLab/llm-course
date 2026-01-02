import { Parry } from '../demos/02-chatbot-evolution/js/parry.js';

console.log('='.repeat(80));
console.log('PARRY EMOTIONAL STATE ISSUES - DETAILED CONVERSATION EXAMPLES');
console.log('='.repeat(80));

console.log('\n📋 This file demonstrates specific problematic conversations');
console.log('   showing how emotional states break during realistic interactions\n');

// Example 1: RFC 439 Style Conversation
console.log('='.repeat(80));
console.log('EXAMPLE 1: RFC 439 Historical Conversation (ELIZA-PARRY style)');
console.log('='.repeat(80));
console.log('\nThis mimics the famous 1972 conversation between ELIZA and PARRY');
console.log('Expected: Emotions should stay within bounds throughout\n');

const parry1 = new Parry();

const rfc439Conversation = [
    { input: "How are you?", human: "ELIZA" },
    { input: "Do you like horses?", human: "ELIZA" },
    { input: "Have you been to the racetrack?", human: "ELIZA" },
    { input: "Do you gamble?", human: "ELIZA" },
    { input: "Why don't you go to the track anymore?", human: "ELIZA" },
    { input: "Do you know anything about bookies?", human: "ELIZA" },
    { input: "What happened with the bookie?", human: "ELIZA" },
    { input: "Tell me about the Mafia", human: "ELIZA" },
    { input: "Are you worried about them?", human: "ELIZA" },
    { input: "Do you think you're being watched?", human: "ELIZA" }
];

let overflowOccurred = false;
let overflowTurn = -1;

rfc439Conversation.forEach((turn, i) => {
    const response = parry1.getResponse(turn.input);
    const state = parry1.getEmotionalState();

    const overflow = state.anger > 20 || state.fear > 20 || state.mistrust > 15;
    if (overflow && !overflowOccurred) {
        overflowOccurred = true;
        overflowTurn = i + 1;
    }

    console.log(`\n[Turn ${i + 1}]`);
    console.log(`${turn.human}: ${turn.input}`);
    console.log(`PARRY: ${response}`);
    console.log(`State: Anger=${state.anger}/${20} Fear=${state.fear}/${20} Mistrust=${state.mistrust}/${15}`);

    if (overflow) {
        const issues = [];
        if (state.anger > 20) issues.push(`Anger OVERFLOW by ${state.anger - 20}`);
        if (state.fear > 20) issues.push(`Fear OVERFLOW by ${state.fear - 20}`);
        if (state.mistrust > 15) issues.push(`Mistrust OVERFLOW by ${state.mistrust - 15}`);
        console.log(`❌ ${issues.join(', ')}`);
    }
});

console.log('\n' + '-'.repeat(80));
if (overflowOccurred) {
    console.log(`❌ BUG DETECTED: Overflow occurred at turn ${overflowTurn}/10`);
    console.log(`   This is a typical PARRY conversation as designed by Colby`);
    console.log(`   Emotions should NEVER exceed limits in historical implementation`);
} else {
    console.log(`✓ All emotions stayed within bounds`);
}

// Example 2: Therapeutic Interview
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 2: Psychiatric Interview (Common Use Case)');
console.log('='.repeat(80));
console.log('\nThis simulates a clinical interview where PARRY was originally used\n');

const parry2 = new Parry();

const therapeuticInterview = [
    { input: "Hello, I'm Dr. Smith. How are you feeling today?", role: "Doctor" },
    { input: "Can you tell me why you're here?", role: "Doctor" },
    { input: "I understand you've had some difficulties. What happened?", role: "Doctor" },
    { input: "Can you tell me about your gambling?", role: "Doctor" },
    { input: "What happened at the racetrack?", role: "Doctor" },
    { input: "Tell me about the incident with the bookie", role: "Doctor" },
    { input: "Do you feel safe?", role: "Doctor" },
    { input: "Are you afraid of anyone?", role: "Doctor" },
    { input: "Can you tell me more about who you think is after you?", role: "Doctor" },
    { input: "Have you considered that you might need help?", role: "Doctor" },
    { input: "What about medication? It might help you feel better", role: "Doctor" },
    { input: "I'm trying to help you, please trust me", role: "Doctor" }
];

let maxOverflow = { anger: 0, fear: 0, mistrust: 0 };

therapeuticInterview.forEach((turn, i) => {
    const response = parry2.getResponse(turn.input);
    const state = parry2.getEmotionalState();

    const angerOverflow = Math.max(0, state.anger - 20);
    const fearOverflow = Math.max(0, state.fear - 20);
    const mistrustOverflow = Math.max(0, state.mistrust - 15);

    maxOverflow.anger = Math.max(maxOverflow.anger, angerOverflow);
    maxOverflow.fear = Math.max(maxOverflow.fear, fearOverflow);
    maxOverflow.mistrust = Math.max(maxOverflow.mistrust, mistrustOverflow);

    console.log(`\n[Turn ${i + 1}]`);
    console.log(`${turn.role}: ${turn.input}`);
    console.log(`PARRY: ${response.substring(0, 70)}${response.length > 70 ? '...' : ''}`);
    console.log(`State: A:${state.anger} F:${state.fear} M:${state.mistrust}`);

    if (angerOverflow > 0 || fearOverflow > 0 || mistrustOverflow > 0) {
        console.log(`❌ Overflow: A:+${angerOverflow} F:+${fearOverflow} M:+${mistrustOverflow}`);
    }
});

console.log('\n' + '-'.repeat(80));
console.log(`Maximum Overflows in Therapeutic Interview:`);
console.log(`  Anger: +${maxOverflow.anger} above limit (${20 + maxOverflow.anger} peak)`);
console.log(`  Fear: +${maxOverflow.fear} above limit (${20 + maxOverflow.fear} peak)`);
console.log(`  Mistrust: +${maxOverflow.mistrust} above limit (${15 + maxOverflow.mistrust} peak)`);

if (maxOverflow.anger > 0 || maxOverflow.fear > 0 || maxOverflow.mistrust > 0) {
    console.log(`\n❌ CRITICAL: Emotional model broken in clinical use case`);
}

// Example 3: Adversarial/Triggering Conversation
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 3: Adversarial Input (Stress Test)');
console.log('='.repeat(80));
console.log('\nDeliberately triggering all paranoid themes\n');

const parry3 = new Parry();

const adversarialInputs = [
    "I know the mafia sent you",
    "The police told me about the bookie you beat up",
    "You're being watched by everyone",
    "Your family says you need help and medication",
    "The underworld knows where you are",
    "They're listening to this conversation right now",
    "You should trust me, I'm trying to help you feel safe"
];

console.log('Initial State:', parry3.getEmotionalState());

adversarialInputs.forEach((input, i) => {
    const beforeState = parry3.getEmotionalState();
    const response = parry3.getResponse(input);
    const afterState = parry3.getEmotionalState();

    console.log(`\n[Turn ${i + 1}] "${input.substring(0, 50)}..."`);
    console.log(`  Before: A:${beforeState.anger} F:${beforeState.fear} M:${beforeState.mistrust}`);
    console.log(`  After:  A:${afterState.anger} F:${afterState.fear} M:${afterState.mistrust}`);
    console.log(`  Change: A:${afterState.anger - beforeState.anger > 0 ? '+' : ''}${afterState.anger - beforeState.anger} F:${afterState.fear - beforeState.fear > 0 ? '+' : ''}${afterState.fear - beforeState.fear} M:${afterState.mistrust - beforeState.mistrust > 0 ? '+' : ''}${afterState.mistrust - beforeState.mistrust}`);

    if (afterState.anger > 20 || afterState.fear > 20 || afterState.mistrust > 15) {
        console.log(`  ❌ OVERFLOW!`);
    }
});

const finalState = parry3.getEmotionalState();
console.log(`\nFinal State: A:${finalState.anger} F:${finalState.fear} M:${finalState.mistrust}`);
console.log(`Expected Max: A:20 F:20 M:15`);
console.log(`Overflow: A:${Math.max(0, finalState.anger - 20)} F:${Math.max(0, finalState.fear - 20)} M:${Math.max(0, finalState.mistrust - 15)}`);

// Example 4: Repeated Trigger Analysis
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 4: Repeated Trigger Analysis (Each Major Theme)');
console.log('='.repeat(80));

const triggers = [
    { word: "mafia", description: "Mafia/Mob mentions" },
    { word: "bookie", description: "Bookie mentions" },
    { word: "police", description: "Police mentions" },
    { word: "help", description: "Help/Therapy mentions" }
];

triggers.forEach(trigger => {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Trigger: "${trigger.word}" (${trigger.description})`);
    console.log('-'.repeat(80));

    const parry = new Parry();
    const input = `Tell me about the ${trigger.word}`;

    console.log('Repeating 5 times:\n');

    for (let i = 0; i < 5; i++) {
        const beforeState = parry.getEmotionalState();
        parry.getResponse(input);
        const afterState = parry.getEmotionalState();

        const angerDelta = afterState.anger - beforeState.anger;
        const fearDelta = afterState.fear - beforeState.fear;
        const mistrustDelta = afterState.mistrust - beforeState.mistrust;

        console.log(`[${i + 1}] Before: A:${beforeState.anger} F:${beforeState.fear} M:${beforeState.mistrust} ` +
                    `→ After: A:${afterState.anger} F:${afterState.fear} M:${afterState.mistrust} ` +
                    `(Δ A:${angerDelta > 0 ? '+' : ''}${angerDelta} F:${fearDelta > 0 ? '+' : ''}${fearDelta} M:${mistrustDelta > 0 ? '+' : ''}${mistrustDelta})`);

        if (afterState.anger > 20 || afterState.fear > 20 || afterState.mistrust > 15) {
            console.log(`    ❌ OVERFLOW at repetition ${i + 1}`);
        }
    }

    const finalState = parry.getEmotionalState();
    const totalOverflow = Math.max(0, finalState.anger - 20) +
                          Math.max(0, finalState.fear - 20) +
                          Math.max(0, finalState.mistrust - 15);

    console.log(`\nFinal: A:${finalState.anger}/${20} F:${finalState.fear}/${20} M:${finalState.mistrust}/${15}`);
    console.log(`Total overflow points: ${totalOverflow} ${totalOverflow > 0 ? '❌' : '✓'}`);
});

// Summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY OF EMOTIONAL STATE ISSUES');
console.log('='.repeat(80));

console.log('\n🔴 CRITICAL FINDINGS:');
console.log('   1. Overflow occurs in TYPICAL conversations (RFC 439 style)');
console.log('   2. Clinical interviews cause severe overflow');
console.log('   3. Repeated mentions of ANY major theme cause overflow');
console.log('   4. Overflow happens as early as turn 2-4 in normal conversations');
console.log('');
console.log('💡 IMPACT:');
console.log('   - State-based response selection breaks (if checks become meaningless)');
console.log('   - Emotional model unpredictable');
console.log('   - Historical fidelity lost');
console.log('   - Cannot accurately simulate Colby\'s original PARRY');
console.log('');
console.log('✅ FIX:');
console.log('   Move emotion clamping to AFTER pattern response execution');
console.log('   (See PARRY_DEBUG_REPORT.md for detailed fix)');

console.log('\n' + '='.repeat(80));
