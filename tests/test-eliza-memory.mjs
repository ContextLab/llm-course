
import { ElizaEngine } from '../demos/eliza/js/eliza-engine.js';
import fs from 'fs';
const rulesData = JSON.parse(fs.readFileSync('./demos/eliza/data/eliza-rules.json', 'utf8'));

const engine = new ElizaEngine();
await engine.loadRules(rulesData);

console.log('--- Testing Memory Mechanism ---');

// 1. Input that should trigger memory saving
const input1 = "My dog is fuzzy";
console.log(`User: ${input1}`);
const response1 = engine.getResponse(input1);
console.log(`Bot: ${response1.response}`);

// Check if memory was saved
if (engine.memoryStack.length === 1 && engine.memoryStack[0] === input1) {
    console.log('✓ PASS: Memory saved correctly');
} else {
    console.error('✗ FAIL: Memory not saved');
    console.error('Memory stack:', engine.memoryStack);
    process.exit(1);
}

// 2. Input that triggers fallback (and thus memory recall)
const input2 = "GibberishXYZ";
console.log(`\nUser: ${input2}`);
const response2 = engine.getResponse(input2);
console.log(`Bot: ${response2.response}`);

// Check if response came from memory
if (response2.matchInfo && response2.matchInfo.fromMemory) {
    console.log('✓ PASS: Response generated from memory');
} else {
    console.error('✗ FAIL: Response not generated from memory');
    console.log('Match Info:', response2.matchInfo);
    process.exit(1);
}

// Check if memory was consumed
if (engine.memoryStack.length === 0) {
    console.log('✓ PASS: Memory consumed from stack');
} else {
    console.error('✗ FAIL: Memory not consumed from stack');
    console.error('Memory stack:', engine.memoryStack);
    process.exit(1);
}

// 3. Verify standard fallback still works when memory is empty
const input3 = "MoreGibberish";
console.log(`\nUser: ${input3}`);
const response3 = engine.getResponse(input3);
console.log(`Bot: ${response3.response}`);

if (!response3.matchInfo.fromMemory && response3.matchInfo.keyword === 'fallback') {
    console.log('✓ PASS: Standard fallback used when memory empty');
} else {
    console.error('✗ FAIL: Standard fallback not used');
    process.exit(1);
}

console.log('\nAll memory tests passed!');
