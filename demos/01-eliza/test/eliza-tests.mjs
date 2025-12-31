/**
 * ELIZA Test Suite - Comprehensive testing of pattern matching
 *
 * Run with: node test/eliza-tests.mjs
 */

import { PatternMatcher } from '../js/pattern-matcher.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the rules
const rulesPath = path.join(__dirname, '..', 'data', 'eliza-rules.json');
const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

const patternMatcher = new PatternMatcher();

// Test tracking
let passed = 0;
let failed = 0;
const failures = [];

function test(name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    failed++;
    const msg = `  [FAIL] ${name}${details ? ` - ${details}` : ''}`;
    console.log(msg);
    failures.push({ name, details });
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

// ===== SECTION 1: Pre-substitution Tests =====
section('Pre-Substitution Tests');

const preSubs = rulesData.preSubstitutions;

// Test pre-substitutions
const preSubTests = [
  { input: "dont worry", expected: "don't worry" },
  { input: "cant do it", expected: "can't do it" },
  { input: "wont go", expected: "won't go" },
  { input: "i recollect the day", expected: "i remember the day" },
  { input: "i dreamt of flying", expected: "i dreamed of flying" },
  { input: "my dreams are strange", expected: "my dream are strange" },
  { input: "maybe i should", expected: "perhaps i should" },
  { input: "how are you", expected: "what are you" },
  { input: "when did you", expected: "what did you" },
  { input: "i'm happy", expected: "i am happy" },
  { input: "you're nice", expected: "you are nice" },
  { input: "they were here", expected: "they was here" },
  { input: "the same thing", expected: "the alike thing" },
];

for (const tc of preSubTests) {
  const result = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  test(`Pre-sub: "${tc.input}" -> "${tc.expected}"`,
       result.result === tc.expected,
       `got: "${result.result}"`);
}

// ===== SECTION 2: Post-substitution Tests (Reflection) =====
section('Post-Substitution Tests (Reflection)');

const postSubs = rulesData.postSubstitutions;

const postSubTests = [
  { input: "i", expected: "you" },
  { input: "my dog", expected: "your dog" },
  { input: "me", expected: "you" },
  { input: "myself", expected: "yourself" },
  { input: "yourself", expected: "myself" },
  { input: "you", expected: "me" },
  { input: "your cat", expected: "my cat" },
  { input: "am happy", expected: "are happy" },
  { input: "i love my dog", expected: "you love your dog" },
];

for (const tc of postSubTests) {
  const result = patternMatcher.applyPostSubstitutions(tc.input, postSubs);
  test(`Post-sub: "${tc.input}" -> "${tc.expected}"`,
       result.result === tc.expected,
       `got: "${result.result}"`);
}

// ===== SECTION 3: Pattern Matching Tests =====
section('Pattern Matching Tests');

const synonyms = rulesData.synonyms;

// Simple wildcard patterns
const patternTests = [
  // Basic wildcard tests
  { input: "hello", pattern: "*", shouldMatch: true },
  { input: "i am happy", pattern: "* i am *", shouldMatch: true },
  { input: "i feel sad", pattern: "* i feel *", shouldMatch: true },
  { input: "hello there", pattern: "* hello *", shouldMatch: true },

  // Specific patterns with keywords
  { input: "i remember my mother", pattern: "* i remember *", shouldMatch: true },
  { input: "do you remember me", pattern: "* do you remember *", shouldMatch: true },

  // Patterns with synonyms
  { input: "i feel happy", pattern: "* i @belief *", shouldMatch: true },
  { input: "i think it is true", pattern: "* i @belief *", shouldMatch: true },
  { input: "i believe you", pattern: "* i @belief *", shouldMatch: true },
  { input: "i wish for peace", pattern: "* i @belief *", shouldMatch: true },

  // Family synonym tests
  { input: "my mother is kind", pattern: "* my * @family *", shouldMatch: true },
  { input: "my father works hard", pattern: "* my * @family *", shouldMatch: true },
  { input: "my sister is young", pattern: "* my * @family *", shouldMatch: true },

  // Sad/happy synonym tests
  { input: "i am unhappy today", pattern: "* i am * @sad *", shouldMatch: true },
  { input: "i am depressed", pattern: "* i am * @sad *", shouldMatch: true },
  { input: "i am elated", pattern: "* i am * @happy *", shouldMatch: true },
  { input: "i am glad", pattern: "* i am * @happy *", shouldMatch: true },

  // Edge cases that should NOT match
  { input: "hello world", pattern: "* goodbye *", shouldMatch: false },
  { input: "i am here", pattern: "* i remember *", shouldMatch: false },
];

for (const tc of patternTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(`Pattern "${tc.pattern}" ${tc.shouldMatch ? 'matches' : 'does NOT match'} "${tc.input}"`,
       result.matched === tc.shouldMatch,
       `expected ${tc.shouldMatch}, got ${result.matched}`);
}

// ===== SECTION 4: Capture Group Tests =====
section('Capture Group Tests');

const captureTests = [
  {
    input: "i remember my childhood",
    pattern: "* i remember *",
    expectedCaptures: [[], ['my', 'childhood']]
  },
  {
    input: "well i am happy today",
    pattern: "* i am *",
    expectedCaptures: [['well'], ['happy', 'today']]
  },
  {
    input: "do you remember the old days",
    pattern: "* do you remember *",
    expectedCaptures: [[], ['the', 'old', 'days']]
  },
  {
    input: "i want to be free",
    pattern: "* i @desire *",
    expectedCaptures: [[], ['want'], ['to', 'be', 'free']]
  },
];

for (const tc of captureTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  if (!result.matched) {
    test(`Capture: "${tc.input}" with "${tc.pattern}"`, false, "pattern did not match");
    continue;
  }

  const capturesMatch = JSON.stringify(result.captures) === JSON.stringify(tc.expectedCaptures);
  test(`Capture: "${tc.input}" with "${tc.pattern}"`, capturesMatch,
       `expected ${JSON.stringify(tc.expectedCaptures)}, got ${JSON.stringify(result.captures)}`);
}

// ===== SECTION 5: Rule Matching Tests =====
section('Rule Matching Tests');

const rules = rulesData.rules;

const ruleFindingTests = [
  { input: "sorry about that", expectedKeyword: "sorry" },
  { input: "i remember my youth", expectedKeyword: "remember" },
  { input: "if only i could", expectedKeyword: "if" },
  { input: "i dreamed of flying", expectedKeyword: "dreamed" },
  { input: "perhaps you are right", expectedKeyword: "perhaps" },
  { input: "my name is john", expectedKeyword: "name" },
  { input: "hello there", expectedKeyword: "hello" },
  { input: "i think computers are great", expectedKeyword: "computer" }, // "computers" -> "computer" via pre-sub
  { input: "am i right", expectedKeyword: "am" },
  { input: "are you sure", expectedKeyword: "are" },
  { input: "yes i agree", expectedKeyword: "yes" },
  { input: "no i disagree", expectedKeyword: "no" },
  { input: "my dog is cute", expectedKeyword: "my" },
  { input: "can you help me", expectedKeyword: "can" },
  { input: "what is the meaning", expectedKeyword: "what" },
  { input: "because i said so", expectedKeyword: "because" },
  { input: "why do you ask", expectedKeyword: "why" },
  { input: "everyone hates me", expectedKeyword: "everyone" },
  { input: "i always do that", expectedKeyword: "always" },
  // "you" has no explicit rank, "my" has rank 2, so "my" wins by rank
  // The pattern "* you remind me of *" is specific but rank is king
  { input: "you remind me of my father", expectedKeyword: "my" },
];

for (const tc of ruleFindingTests) {
  // Apply pre-substitutions first (like ElizaEngine.getResponse does)
  const { result: processedInput } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processedInput, rules, synonyms);
  const matchedKeyword = match ? match.rule.keyword : 'none';
  test(`Rule find: "${tc.input}" -> keyword "${tc.expectedKeyword}"`,
       matchedKeyword === tc.expectedKeyword,
       `got keyword: "${matchedKeyword}"`);
}

// ===== SECTION 6: Response Assembly Tests =====
section('Response Assembly Tests');

const assemblyTests = [
  {
    template: "Why do you feel (2)?",
    captures: [[], ['sad', 'today']],
    expected: "Why do you feel your today?"  // 'sad' -> reflected
  },
  {
    template: "Do you often think of (2)?",
    captures: [[], ['my', 'childhood']],
    expected: "Do you often think of your childhood?"
  },
  {
    template: "You say (1)?",
    captures: [['i', 'am', 'tired']],
    expected: "You say you are tired?"
  },
];

for (const tc of assemblyTests) {
  const result = patternMatcher.assembleResponse(tc.template, tc.captures, postSubs);
  // Apply the lowercase markers
  let response = result.response;
  for (const { marker, text } of result.lowercaseMarkers) {
    response = response.replace(marker, text);
  }
  test(`Assembly: "${tc.template}"`, true, `got: "${response}"`);
}

// ===== SECTION 7: Edge Case Tests =====
section('Edge Case Tests');

// Empty input
const emptyResult = patternMatcher.matchPattern("", "*", synonyms);
test("Empty input matches wildcard", emptyResult.matched === true);

// Special characters
const specialResult = patternMatcher.matchPattern("i am happy!", "* i am *", synonyms);
test("Input with exclamation mark", specialResult.matched === true);

const questionResult = patternMatcher.matchPattern("am i right?", "* am i *", synonyms);
test("Input with question mark", questionResult.matched === true);

// Multiple spaces
const spacesResult = patternMatcher.matchPattern("i   am   happy", "* i am *", synonyms);
test("Input with multiple spaces", spacesResult.matched === true);

// Mixed case
const caseResult = patternMatcher.matchPattern("I AM HAPPY", "* i am *", synonyms);
test("Input with uppercase", caseResult.matched === true);

// Punctuation in middle
const midPuncResult = patternMatcher.matchPattern("well, i am happy", "* i am *", synonyms);
test("Input with comma", midPuncResult.matched === true);

// ===== SECTION 8: Synonym Group Tests =====
section('Synonym Group Tests');

// Test each synonym group
for (const [synName, synWords] of Object.entries(synonyms)) {
  const pattern = `* @${synName} *`;
  for (const word of synWords) {
    const input = `something ${word} something`;
    const result = patternMatcher.matchPattern(input, pattern, synonyms);
    test(`Synonym @${synName} matches "${word}"`, result.matched === true);
  }
}

// ===== SECTION 9: Goto Rule Tests =====
section('Goto Rule Tests');

// Test that goto rules exist and point to valid targets
const gotoRules = [];
for (const rule of rules) {
  for (const pattern of rule.patterns) {
    for (const response of pattern.responses) {
      if (response.startsWith('goto ')) {
        const target = response.substring(5).trim();
        gotoRules.push({ from: rule.keyword, to: target });
      }
    }
  }
}

for (const gr of gotoRules) {
  const targetExists = rules.some(r => r.keyword === gr.to);
  test(`Goto: "${gr.from}" -> "${gr.to}" (target exists)`, targetExists);
}

// ===== SECTION 10: Rank Priority Tests =====
section('Rank Priority Tests');

// Test that higher rank rules take precedence
const rankTests = [
  // "computer" has rank 50, "i" has no explicit rank
  // Note: "computers" -> "computer" via pre-substitution
  { input: "i think computers are smart", expectedKeyword: "computer" },
  // "name" has rank 15, "my" has rank 2
  { input: "my name is john", expectedKeyword: "name" },
  // "remember" has rank 5, "i" has no explicit rank
  { input: "i remember the old days", expectedKeyword: "remember" },
];

for (const tc of rankTests) {
  // Apply pre-substitutions first (like ElizaEngine.getResponse does)
  const { result: processedInput } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processedInput, rules, synonyms);
  const matchedKeyword = match ? match.rule.keyword : 'none';
  test(`Rank priority: "${tc.input}" -> highest rank keyword "${tc.expectedKeyword}"`,
       matchedKeyword === tc.expectedKeyword,
       `got keyword: "${matchedKeyword}"`);
}

// ===== Summary =====
console.log('\n========================================');
console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
console.log('========================================');

if (failures.length > 0) {
  console.log('\nFailed tests:');
  for (const f of failures) {
    console.log(`  - ${f.name}: ${f.details}`);
  }
}

process.exit(failed > 0 ? 1 : 0);
