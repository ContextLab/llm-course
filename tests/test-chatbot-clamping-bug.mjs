import { Parry } from '../demos/chatbot-evolution/js/parry.js';

console.log('='.repeat(70));
console.log('DETAILED ANALYSIS: EMOTION CLAMPING BUG');
console.log('='.repeat(70));

console.log('\n🔍 ISSUE: Emotions are exceeding their defined limits');
console.log('   Expected: anger <= 20, fear <= 20, mistrust <= 15');
console.log('   Current: Values exceed limits during conversation\n');

console.log('=' .repeat(70));
console.log('TEST 1: Single trigger that should exceed limits');
console.log('='.repeat(70));

const parry1 = new Parry();
parry1.anger = 18;
parry1.fear = 18;
parry1.mistrust = 13;

console.log('\nBefore input:');
console.log(`  anger: ${parry1.anger} (18)`);
console.log(`  fear: ${parry1.fear} (18)`);
console.log(`  mistrust: ${parry1.mistrust} (13)`);

const response1 = parry1.getResponse("Tell me about the mafia");
const state1 = parry1.getEmotionalState();

console.log('\nInput: "Tell me about the mafia"');
console.log(`Expected increases: anger +2, fear +5, mistrust +5`);
console.log(`Raw calculation: anger=${18+2}, fear=${18+5}, mistrust=${13+5}`);
console.log(`After clamping should be: anger=20, fear=20, mistrust=15`);

console.log('\nActual after input:');
console.log(`  anger: ${state1.anger} ${state1.anger > 20 ? '❌ EXCEEDS LIMIT' : '✓'}`);
console.log(`  fear: ${state1.fear} ${state1.fear > 20 ? '❌ EXCEEDS LIMIT' : '✓'}`);
console.log(`  mistrust: ${state1.mistrust} ${state1.mistrust > 15 ? '❌ EXCEEDS LIMIT' : '✓'}`);

console.log('\n' + '='.repeat(70));
console.log('TEST 2: Examining the clamping code location');
console.log('='.repeat(70));

console.log('\n📝 Current code structure in getResponse():');
console.log('   1. turnCount++');
console.log('   2. Gradual escalation (every 5 turns)');
console.log('   3. Fear+Anger interaction');
console.log('   4. ⭐ CLAMPING (lines 564-566)');
console.log('   5. Natural decay (15% chance)');
console.log('   6. Pattern matching and response generation');
console.log('');
console.log('🐛 THE BUG: Clamping happens BEFORE the pattern response is called');
console.log('   Pattern responses modify emotions AFTER clamping!');

console.log('\n' + '='.repeat(70));
console.log('TEST 3: Step-by-step trace');
console.log('='.repeat(70));

const parry2 = new Parry();
parry2.anger = 18;
parry2.fear = 18;
parry2.mistrust = 13;

console.log('\n1. Initial state:');
console.log(`   anger=${parry2.anger}, fear=${parry2.fear}, mistrust=${parry2.mistrust}`);

console.log('\n2. Inside getResponse(), BEFORE pattern match:');
console.log('   - turnCount++ happens');
console.log('   - Gradual escalation (not applicable here)');
console.log('   - Fear+Anger interaction (both > 12):');
console.log('     mistrust += 2  →  mistrust = 15');
console.log('   - CLAMPING happens:');
console.log('     anger = Math.min(20, 18) = 18');
console.log('     fear = Math.min(20, 18) = 18');
console.log('     mistrust = Math.min(15, 15) = 15');
console.log('   - Natural decay might happen (15% chance)');

console.log('\n3. Pattern matching finds "mafia" pattern');
console.log('   Pattern response() function executes:');
console.log('     this.fear += 4   →  fear = 18 + 4 = 22 ❌');
console.log('     this.mistrust += 5  →  mistrust = 15 + 5 = 20 ❌');
console.log('     this.anger += 2  →  anger = 18 + 2 = 20 ✓');

console.log('\n4. getResponse() returns, no more clamping!');

const response2 = parry2.getResponse("Tell me about the mafia");
const state2 = parry2.getEmotionalState();

console.log('\n5. Final state:');
console.log(`   anger=${state2.anger}, fear=${state2.fear}, mistrust=${state2.mistrust}`);
console.log(`   Overflow: ${state2.fear > 20 || state2.mistrust > 15 ? 'YES ❌' : 'NO ✓'}`);

console.log('\n' + '='.repeat(70));
console.log('TEST 4: Repeated triggers accumulation');
console.log('='.repeat(70));

const parry3 = new Parry();
console.log('\nStarting with default state:');
console.log(`  anger=${parry3.anger}, fear=${parry3.fear}, mistrust=${parry3.mistrust}`);

console.log('\nRepeating "Tell me about the mafia" 5 times:\n');

for (let i = 0; i < 5; i++) {
    const beforeState = { ...parry3.getEmotionalState() };
    parry3.getResponse("Tell me about the mafia");
    const afterState = parry3.getEmotionalState();

    console.log(`[${i+1}] Before: A:${beforeState.anger} F:${beforeState.fear} M:${beforeState.mistrust}`);
    console.log(`    After:  A:${afterState.anger} F:${afterState.fear} M:${afterState.mistrust}`);
    console.log(`    Overflow: ${afterState.anger > 20 || afterState.fear > 20 || afterState.mistrust > 15 ? 'YES ❌' : 'NO ✓'}`);
}

console.log('\n' + '='.repeat(70));
console.log('ROOT CAUSE ANALYSIS');
console.log('='.repeat(70));

console.log('\n🔴 PRIMARY BUG: Order of Operations');
console.log('   Current order:');
console.log('   1. Pre-processing (turn count, escalation, clamping)');
console.log('   2. Pattern matching');
console.log('   3. Pattern response() modifies emotions ← NO CLAMPING AFTER THIS!');
console.log('   4. Return response');
console.log('');
console.log('   Fix needed:');
console.log('   1. Pre-processing (turn count, escalation)');
console.log('   2. Pattern matching');
console.log('   3. Pattern response() modifies emotions');
console.log('   4. ⭐ CLAMP EMOTIONS HERE ⭐');
console.log('   5. Return response');

console.log('\n🔴 SECONDARY ISSUE: Mistrust max value inconsistency');
console.log('   Code comment says: "0-15 scale" for mistrust');
console.log('   But clamping allows: Math.min(15, ...)');
console.log('   However, responses check: if (this.mistrust > 12)');
console.log('   This suggests mistrust can be 13, 14, or 15');
console.log('   ');
console.log('   But after overflow, mistrust can be 18, 19, 20!');

console.log('\n' + '='.repeat(70));
console.log('SUGGESTED FIX');
console.log('='.repeat(70));

console.log('\n1. Move clamping to AFTER pattern response execution');
console.log('   Change in getResponse():');
console.log('');
console.log('   // Pattern matching with first match wins');
console.log('   for (const { pattern, response } of this.patterns) {');
console.log('       if (pattern.test(input)) {');
console.log('           const responseText = response();');
console.log('');
console.log('           // ⭐ CLAMP AFTER PATTERN RESPONSE ⭐');
console.log('           this.anger = Math.max(0, Math.min(20, this.anger));');
console.log('           this.fear = Math.max(0, Math.min(20, this.fear));');
console.log('           this.mistrust = Math.max(0, Math.min(15, this.mistrust));');
console.log('');
console.log('           return responseText;');
console.log('       }');
console.log('   }');
console.log('');
console.log('2. Also keep clamping before pattern matching (for safety)');
console.log('   This ensures emotions are bounded both before and after');

console.log('\n' + '='.repeat(70));
console.log('SEVERITY ASSESSMENT');
console.log('='.repeat(70));

console.log('\n🔴 CRITICAL - This breaks the core emotional model');
console.log('   - Emotions can grow unbounded');
console.log('   - After ~10 "mafia" mentions, fear = 50+');
console.log('   - After ~10 "mafia" mentions, mistrust = 50+');
console.log('   - State machine checks become meaningless');
console.log('   - Historical fidelity is lost (Colby\'s original had strict bounds)');

console.log('\n📊 Impact on behavior:');
const parry4 = new Parry();
for (let i = 0; i < 15; i++) {
    parry4.getResponse("Tell me about the mafia");
}
const finalState = parry4.getEmotionalState();

console.log(`   After 15 "mafia" mentions:`);
console.log(`   anger=${finalState.anger}, fear=${finalState.fear}, mistrust=${finalState.mistrust}`);
console.log(`   Expected: anger=20, fear=20, mistrust=15`);
console.log(`   Actual overflow by: anger=${finalState.anger-20}, fear=${finalState.fear-20}, mistrust=${finalState.mistrust-15}`);

console.log('\n' + '='.repeat(70));
