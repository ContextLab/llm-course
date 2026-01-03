/**
 * ELIZA Comprehensive Rule Coverage Tests
 *
 * This test suite systematically tests ALL rules defined in eliza-rules.json
 * for use in student assessment.
 *
 * Test Categories:
 * 1. Pre-substitutions (input normalization)
 * 2. Post-substitutions (pronoun reflection)
 * 3. Pattern matching for each keyword/rule
 * 4. Variable capture (parenthetical groups)
 * 5. Response assembly
 * 6. Synonym matching
 * 7. Goto rule resolution
 * 8. Rank priority
 * 9. Edge cases
 * 10. Fallback behavior
 *
 * Run with: node demos/eliza/tests/rule-coverage.test.js
 */

import { PatternMatcher } from '../js/pattern-matcher.js';
import { ElizaEngine } from '../js/eliza-engine.js';
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
let currentSection = '';

/**
 * Assert helper with descriptive failure messages
 */
function test(name, condition, expected = null, actual = null) {
  if (condition) {
    passed++;
    console.log(`    [PASS] ${name}`);
  } else {
    failed++;
    let details = '';
    if (expected !== null && actual !== null) {
      details = `\n           Expected: ${JSON.stringify(expected)}\n           Actual:   ${JSON.stringify(actual)}`;
    }
    console.log(`    [FAIL] ${name}${details}`);
    failures.push({ section: currentSection, name, expected, actual });
  }
}

function section(title) {
  currentSection = title;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function subsection(title) {
  console.log(`\n  --- ${title} ---`);
}

// ============================================================================
// SECTION 1: PRE-SUBSTITUTION TESTS
// ============================================================================
section('1. PRE-SUBSTITUTION TESTS');
console.log('  Tests that input normalization converts text to canonical form');

const preSubs = rulesData.preSubstitutions;

subsection('Contraction Expansion');
const contractionTests = [
  { input: "dont worry about it", expected: "don't worry about it", desc: "dont -> don't" },
  { input: "i cant do this", expected: "i can't do this", desc: "cant -> can't" },
  { input: "they wont help", expected: "they won't help", desc: "wont -> won't" },
  { input: "you're being silly", expected: "you are being silly", desc: "you're -> you are" },
  { input: "i'm feeling sad", expected: "i am feeling sad", desc: "i'm -> i am" },
];

for (const tc of contractionTests) {
  const result = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  test(tc.desc, result.result === tc.expected, tc.expected, result.result);
}

subsection('Word Normalization');
const normalizationTests = [
  { input: "i recollect the day", expected: "i remember the day", desc: "recollect -> remember" },
  { input: "i dreamt of flying", expected: "i dreamed of flying", desc: "dreamt -> dreamed" },
  { input: "my dreams are strange", expected: "my dream are strange", desc: "dreams -> dream" },
  { input: "maybe i should go", expected: "perhaps i should go", desc: "maybe -> perhaps" },
  { input: "the machine broke", expected: "the computer broke", desc: "machine -> computer" },
  { input: "computers are smart", expected: "computer are smart", desc: "computers -> computer" },
  { input: "they were here", expected: "they was here", desc: "were -> was" },
  { input: "the same thing", expected: "the alike thing", desc: "same -> alike" },
  { input: "certainly i will", expected: "yes i will", desc: "certainly -> yes" },
];

for (const tc of normalizationTests) {
  const result = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  test(tc.desc, result.result === tc.expected, tc.expected, result.result);
}

subsection('Question Word Normalization');
const questionTests = [
  { input: "how are you", expected: "what are you", desc: "how -> what" },
  { input: "when did you arrive", expected: "what did you arrive", desc: "when -> what" },
];

for (const tc of questionTests) {
  const result = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  test(tc.desc, result.result === tc.expected, tc.expected, result.result);
}

// ============================================================================
// SECTION 2: POST-SUBSTITUTION TESTS (PRONOUN REFLECTION)
// ============================================================================
section('2. POST-SUBSTITUTION TESTS (PRONOUN REFLECTION)');
console.log('  Tests that pronouns are reflected correctly in responses');

const postSubs = rulesData.postSubstitutions;

subsection('First-Person to Second-Person');
const firstToSecondTests = [
  { input: "i", expected: "you", desc: "i -> you" },
  { input: "my dog", expected: "your dog", desc: "my -> your" },
  { input: "me", expected: "you", desc: "me -> you" },
  { input: "myself", expected: "yourself", desc: "myself -> yourself" },
  { input: "am tired", expected: "are tired", desc: "am -> are" },
];

for (const tc of firstToSecondTests) {
  const result = patternMatcher.applyPostSubstitutions(tc.input, postSubs);
  test(tc.desc, result.result === tc.expected, tc.expected, result.result);
}

subsection('Second-Person to First-Person');
const secondToFirstTests = [
  { input: "you", expected: "me", desc: "you -> me" },
  { input: "your cat", expected: "my cat", desc: "your -> my" },
  { input: "yourself", expected: "myself", desc: "yourself -> myself" },
];

for (const tc of secondToFirstTests) {
  const result = patternMatcher.applyPostSubstitutions(tc.input, postSubs);
  test(tc.desc, result.result === tc.expected, tc.expected, result.result);
}

subsection('Complex Pronoun Reflection');
const complexReflectionTests = [
  { input: "i love my dog", expected: "you love your dog", desc: "multiple reflections in one phrase" },
  { input: "tell me about yourself", expected: "tell you about myself", desc: "me + yourself" },
  { input: "my friend and i", expected: "your friend and you", desc: "my + i" },
];

for (const tc of complexReflectionTests) {
  const result = patternMatcher.applyPostSubstitutions(tc.input, postSubs);
  test(tc.desc, result.result === tc.expected, tc.expected, result.result);
}

// ============================================================================
// SECTION 3: SYNONYM GROUP TESTS
// ============================================================================
section('3. SYNONYM GROUP TESTS');
console.log('  Tests that synonym groups (@belief, @family, etc.) match correctly');

const synonyms = rulesData.synonyms;

for (const [synName, synWords] of Object.entries(synonyms)) {
  subsection(`Synonym Group: @${synName}`);
  const pattern = `* @${synName} *`;

  // Test each word in the synonym group
  for (const word of synWords) {
    const input = `something ${word} something`;
    const result = patternMatcher.matchPattern(input, pattern, synonyms);
    test(`@${synName} matches "${word}"`, result.matched === true, true, result.matched);
  }

  // Test that the group name itself works
  const groupNameInput = `something ${synName} something`;
  const groupResult = patternMatcher.matchPattern(groupNameInput, pattern, synonyms);
  test(`@${synName} matches group name "${synName}"`, groupResult.matched === true, true, groupResult.matched);
}

// ============================================================================
// SECTION 4: INDIVIDUAL KEYWORD RULE TESTS
// ============================================================================
section('4. INDIVIDUAL KEYWORD RULE TESTS');
console.log('  Tests each keyword rule with pattern matching and variable capture');

const rules = rulesData.rules;

// ---------- SORRY Rule ----------
subsection('Keyword: sorry');
const sorryTests = [
  { input: "sorry about that", shouldMatch: true, desc: "Basic sorry" },
  // Note: "i am sorry" matches "i" keyword first (which has "* i am *" pattern)
  // because "i" appears before "sorry" in the input and both have no rank
  { input: "i am sorry", expectedKeyword: "i", desc: "I am sorry (i keyword matches first)" },
  { input: "so sorry for the trouble", shouldMatch: true, desc: "Sorry in middle" },
  { input: "SORRY", shouldMatch: true, desc: "Uppercase SORRY" },
];

for (const tc of sorryTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'sorry';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- APOLOGISE Rule ----------
subsection('Keyword: apologise (goto sorry)');
const apologiseTests = [
  // Note: "i apologise" matches "i" keyword first (which has catch-all "*" pattern)
  // because "i" appears before "apologise" in the input and both have no rank
  { input: "i apologise for that", expectedKeyword: "i", desc: "I apologise (i keyword matches first)" },
  { input: "let me apologise", shouldMatch: true, desc: "Apologise in phrase" },
];

for (const tc of apologiseTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'apologise';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- REMEMBER Rule (rank: 5) ----------
subsection('Keyword: remember (rank: 5)');
const rememberTests = [
  { input: "i remember my childhood", pattern: "* i remember *", shouldMatch: true, desc: "I remember pattern" },
  { input: "do you remember me", pattern: "* do you remember *", shouldMatch: true, desc: "Do you remember pattern" },
  // Note: "remember the times" has no specific pattern match - remember only has
  // "* i remember *" and "* do you remember *" patterns, no catch-all "*"
  // So it won't match the remember rule - it falls through
  { input: "remember the times", shouldMatch: false, desc: "Remember at start (no matching pattern)" },
];

for (const tc of rememberTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = !!(match && match.rule.keyword === 'remember');
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// Test capture for "i remember" pattern
const rememberCapture = patternMatcher.matchPattern("i remember my dog", "* i remember *", synonyms);
test("Capture: i remember <captures rest>",
  rememberCapture.matched && JSON.stringify(rememberCapture.captures) === JSON.stringify([[], ['my', 'dog']]),
  [[], ['my', 'dog']], rememberCapture.captures);

// ---------- IF Rule (rank: 3) ----------
subsection('Keyword: if (rank: 3)');
const ifTests = [
  { input: "if only i could", shouldMatch: true, desc: "If at start" },
  { input: "what if it rains", shouldMatch: true, desc: "What if" },
  { input: "i wonder if you know", shouldMatch: true, desc: "If in middle" },
];

for (const tc of ifTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'if';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- DREAMED Rule (rank: 4) ----------
subsection('Keyword: dreamed (rank: 4)');
const dreamedTests = [
  { input: "i dreamed of flying", shouldMatch: true, desc: "I dreamed pattern" },
  { input: "last night i dreamed about you", shouldMatch: true, desc: "I dreamed with prefix" },
  // Note: "dreamt" is pre-substituted to "dreamed"
  { input: "i dreamt of paradise", shouldMatch: true, desc: "Dreamt -> dreamed substitution" },
];

for (const tc of dreamedTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'dreamed';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- DREAM Rule (rank: 3) ----------
subsection('Keyword: dream (rank: 3)');
const dreamTests = [
  { input: "i had a dream", shouldMatch: true, desc: "Dream in phrase" },
  { input: "dream big", shouldMatch: true, desc: "Dream at start" },
];

for (const tc of dreamTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'dream';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- PERHAPS Rule ----------
subsection('Keyword: perhaps');
const perhapsTests = [
  { input: "perhaps you are right", shouldMatch: true, desc: "Perhaps at start" },
  // Note: "i think perhaps i should" - 'i' appears first and has no rank,
  // 'perhaps' also has no rank, but 'i' comes first in input order
  { input: "i think perhaps i should", expectedKeyword: "i", desc: "Perhaps in middle (i keyword first)" },
  // Note: "maybe" is pre-substituted to "perhaps"
  { input: "maybe i should go", shouldMatch: true, desc: "Maybe -> perhaps substitution" },
];

for (const tc of perhapsTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'perhaps';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- NAME Rule (rank: 15) ----------
subsection('Keyword: name (rank: 15)');
const nameTests = [
  { input: "my name is john", shouldMatch: true, desc: "My name is" },
  { input: "what is your name", shouldMatch: true, desc: "Your name" },
  { input: "name me one thing", shouldMatch: true, desc: "Name at start" },
];

for (const tc of nameTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'name';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- FOREIGN LANGUAGE Rules ----------
subsection('Foreign Language Keywords');
const foreignTests = [
  { input: "sprechen sie deutsch", keyword: "deutsch", desc: "German keyword" },
  { input: "parlez vous francais", keyword: "francais", desc: "French keyword" },
  { input: "parla italiano", keyword: "italiano", desc: "Italian keyword" },
  { input: "habla espanol", keyword: "espanol", desc: "Spanish keyword" },
];

for (const tc of foreignTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === tc.keyword;
  test(tc.desc, matched === true, true, matched);
}

// ---------- HELLO Rule ----------
subsection('Keyword: hello');
const helloTests = [
  { input: "hello there", shouldMatch: true, desc: "Hello at start" },
  { input: "well hello", shouldMatch: true, desc: "Hello after word" },
  { input: "Hello", shouldMatch: true, desc: "Just hello (capitalized)" },
];

for (const tc of helloTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'hello';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- COMPUTER Rule (rank: 50) ----------
subsection('Keyword: computer (rank: 50 - highest)');
const computerTests = [
  { input: "i hate computers", shouldMatch: true, desc: "Computers (pre-sub to computer)" },
  { input: "this computer is slow", shouldMatch: true, desc: "Computer in phrase" },
  // Note: "machine" is pre-substituted to "computer"
  { input: "the machine broke down", shouldMatch: true, desc: "Machine -> computer substitution" },
];

for (const tc of computerTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'computer';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- AM Rule ----------
subsection('Keyword: am');
const amTests = [
  { input: "am i right", pattern: "* am i *", shouldMatch: true, desc: "Am I pattern" },
  { input: "i am happy", shouldMatch: false, desc: "I am (should match 'i' keyword instead)" },
];

for (const tc of amTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'am';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// Test capture for "am i" pattern
const amCapture = patternMatcher.matchPattern("am i crazy", "* am i *", synonyms);
test("Capture: am i <captures rest>",
  amCapture.matched && JSON.stringify(amCapture.captures) === JSON.stringify([[], ['crazy']]),
  [[], ['crazy']], amCapture.captures);

// ---------- ARE Rule ----------
subsection('Keyword: are');
const areTests = [
  { input: "are you sure", pattern: "* are you *", shouldMatch: true, desc: "Are you pattern" },
  // Note: "how are things" - "how" is pre-substituted to "what", so input becomes "what are things"
  // "what" keyword has no rank, "are" has no rank - "what" comes first
  { input: "how are things", expectedKeyword: "what", desc: "How are (what keyword after pre-sub)" },
];

for (const tc of areTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'are';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- YOUR Rule ----------
subsection('Keyword: your');
const yourTests = [
  // Note: "i like your style" - 'i' keyword comes first
  { input: "i like your style", expectedKeyword: "i", desc: "Your in phrase (i keyword first)" },
  { input: "your ideas are good", shouldMatch: true, desc: "Your at start" },
];

for (const tc of yourTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'your';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- WAS Rule (rank: 2) ----------
subsection('Keyword: was (rank: 2)');
const wasTests = [
  { input: "was i wrong", pattern: "* was i *", shouldMatch: true, desc: "Was I pattern" },
  { input: "i was happy then", pattern: "* i was *", shouldMatch: true, desc: "I was pattern" },
  { input: "was you there", pattern: "* was you *", shouldMatch: true, desc: "Was you pattern" },
];

for (const tc of wasTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'was';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- I Rule (complex with many patterns) ----------
subsection('Keyword: i (complex patterns)');

const iRulePatternTests = [
  // @desire pattern
  { input: "i want a new car", pattern: "* i @desire *", shouldMatch: true, desc: "I want (desire)" },
  { input: "i need help", pattern: "* i @desire *", shouldMatch: true, desc: "I need (desire)" },

  // @sad pattern
  { input: "i am unhappy today", pattern: "* i am * @sad *", shouldMatch: true, desc: "I am unhappy (sad)" },
  { input: "i am depressed", pattern: "* i am * @sad *", shouldMatch: true, desc: "I am depressed (sad)" },
  { input: "i am sick of this", pattern: "* i am * @sad *", shouldMatch: true, desc: "I am sick (sad)" },

  // @happy pattern
  { input: "i am elated", pattern: "* i am * @happy *", shouldMatch: true, desc: "I am elated (happy)" },
  { input: "i am glad you came", pattern: "* i am * @happy *", shouldMatch: true, desc: "I am glad (happy)" },
  { input: "i am better now", pattern: "* i am * @happy *", shouldMatch: true, desc: "I am better (happy)" },

  // @belief pattern
  { input: "i feel that i am right", pattern: "* i @belief * i *", shouldMatch: true, desc: "I feel I (belief)" },
  { input: "i think that i should go", pattern: "* i @belief * i *", shouldMatch: true, desc: "I think I (belief)" },
  { input: "i believe i can", pattern: "* i @belief * i *", shouldMatch: true, desc: "I believe I (belief)" },

  // @cannot pattern
  { input: "i can't do this", pattern: "* i @cannot *", shouldMatch: true, desc: "I can't (cannot)" },

  // i don't pattern
  { input: "i don't understand", pattern: "* i don't *", shouldMatch: true, desc: "I don't pattern" },

  // do i feel pattern
  { input: "why do i feel sad", pattern: "* do i feel *", shouldMatch: true, desc: "Do I feel pattern" },

  // i * you pattern
  { input: "i love you", pattern: "* i * you *", shouldMatch: true, desc: "I love you pattern" },
  { input: "i hate you", pattern: "* i * you *", shouldMatch: true, desc: "I hate you pattern" },

  // Basic i am pattern
  { input: "i am a student", pattern: "* i am *", shouldMatch: true, desc: "I am basic pattern" },
];

for (const tc of iRulePatternTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

// ---------- YOU Rule ----------
subsection('Keyword: you');
const youTests = [
  { input: "you remind me of my father", pattern: "* you remind me of *", shouldMatch: true, desc: "You remind me of" },
  { input: "you are smart", pattern: "* you are *", shouldMatch: true, desc: "You are" },
  { input: "you hate me", pattern: "* you * me *", shouldMatch: true, desc: "You * me" },
  { input: "you seem nice", pattern: "* you *", shouldMatch: true, desc: "You general" },
];

for (const tc of youTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

// ---------- YES Rule ----------
subsection('Keyword: yes');
const yesTests = [
  { input: "yes i agree", shouldMatch: true, desc: "Yes at start" },
  { input: "oh yes indeed", shouldMatch: true, desc: "Yes in middle" },
  // Note: "certainly" is pre-substituted to "yes"
  { input: "certainly i will", shouldMatch: true, desc: "Certainly -> yes substitution" },
];

for (const tc of yesTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'yes';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- NO Rule ----------
subsection('Keyword: no');
const noTests = [
  { input: "no i disagree", shouldMatch: true, desc: "No at start" },
  // Note: "i said no" - 'i' keyword comes first (both have no rank)
  { input: "i said no", expectedKeyword: "i", desc: "No at end (i keyword first)" },
  { input: "no way", shouldMatch: true, desc: "No way" },
];

for (const tc of noTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'no';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- MY Rule (rank: 2) ----------
subsection('Keyword: my (rank: 2)');
const myTests = [
  // @family pattern
  { input: "my mother is kind", pattern: "* my * @family *", shouldMatch: true, desc: "My mother (family)" },
  { input: "my father works hard", pattern: "* my * @family *", shouldMatch: true, desc: "My father (family)" },
  { input: "my sister is young", pattern: "* my * @family *", shouldMatch: true, desc: "My sister (family)" },
  { input: "my brother and i", pattern: "* my * @family *", shouldMatch: true, desc: "My brother (family)" },
  { input: "i love my wife", pattern: "* my * @family *", shouldMatch: true, desc: "My wife (family)" },
  { input: "my children are great", pattern: "* my * @family *", shouldMatch: true, desc: "My children (family)" },

  // Basic my pattern
  { input: "my dog is cute", pattern: "* my *", shouldMatch: true, desc: "My dog" },
  { input: "i love my car", pattern: "* my *", shouldMatch: true, desc: "My car in phrase" },
];

for (const tc of myTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

// Test memory save pattern ($ prefix)
const memorySavePattern = "$ * my *";
const memoryInput = "my head hurts";
const memoryResult = patternMatcher.matchPattern(memoryInput, memorySavePattern.substring(2).trim(), synonyms);
test("Memory save pattern matches", memoryResult.matched === true, true, memoryResult.matched);

// ---------- CAN Rule ----------
subsection('Keyword: can');
const canTests = [
  { input: "can you help me", pattern: "* can you *", shouldMatch: true, desc: "Can you pattern" },
  { input: "can i ask you", pattern: "* can i *", shouldMatch: true, desc: "Can I pattern" },
];

for (const tc of canTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

// ---------- WHAT Rule ----------
subsection('Keyword: what');
const whatTests = [
  { input: "what is the meaning", shouldMatch: true, desc: "What at start" },
  // Note: "i wonder what you think" - 'i' keyword comes first (both have no rank)
  { input: "i wonder what you think", expectedKeyword: "i", desc: "What in middle (i keyword first)" },
  // Note: "how" and "when" are pre-substituted to "what"
  { input: "how are you", shouldMatch: true, desc: "How -> what substitution" },
  { input: "when will you come", shouldMatch: true, desc: "When -> what substitution" },
];

for (const tc of whatTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'what';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- BECAUSE Rule ----------
subsection('Keyword: because');
const becauseTests = [
  { input: "because i said so", shouldMatch: true, desc: "Because at start" },
  // Note: "i did it because i wanted to" - 'i' keyword comes first (both have no rank)
  { input: "i did it because i wanted to", expectedKeyword: "i", desc: "Because in middle (i keyword first)" },
];

for (const tc of becauseTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'because';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- WHY Rule ----------
subsection('Keyword: why');
const whyTests = [
  { input: "why don't you like me", pattern: "* why don't you *", shouldMatch: true, desc: "Why don't you pattern" },
  { input: "why can't i be happy", pattern: "* why can't i *", shouldMatch: true, desc: "Why can't I pattern" },
  { input: "why is the sky blue", shouldMatch: true, desc: "Why general question" },
];

for (const tc of whyTests) {
  if (tc.pattern) {
    const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
    test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
  } else {
    const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
    const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
    const matched = match && match.rule.keyword === 'why';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- EVERYONE Rule (rank: 2) ----------
subsection('Keyword: everyone (rank: 2)');
const everyoneTests = [
  { input: "everyone hates me", pattern: "* @everyone *", shouldMatch: true, desc: "Everyone pattern" },
  { input: "everybody knows that", pattern: "* @everyone *", shouldMatch: true, desc: "Everybody (synonym)" },
  { input: "nobody likes me", pattern: "* @everyone *", shouldMatch: true, desc: "Nobody (synonym)" },
  { input: "noone cares", pattern: "* @everyone *", shouldMatch: true, desc: "Noone (synonym)" },
];

for (const tc of everyoneTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

// ---------- ALWAYS Rule (rank: 1) ----------
subsection('Keyword: always (rank: 1)');
const alwaysTests = [
  { input: "you always do that", shouldMatch: true, desc: "Always in phrase" },
  { input: "i always forget", shouldMatch: true, desc: "I always" },
  // Note: "always the same" - 'same' is pre-substituted to 'alike' (rank 10)
  // 'alike' has rank 10, 'always' has rank 1, so 'alike' wins
  { input: "always the same", expectedKeyword: "alike", desc: "Always at start (alike rank 10 beats always rank 1)" },
];

for (const tc of alwaysTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  if (tc.expectedKeyword) {
    const matched = match && match.rule.keyword === tc.expectedKeyword;
    test(tc.desc, matched === true, tc.expectedKeyword, match ? match.rule.keyword : 'none');
  } else {
    const matched = match && match.rule.keyword === 'always';
    test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
  }
}

// ---------- ALIKE Rule (rank: 10) ----------
subsection('Keyword: alike (rank: 10)');
const alikeTests = [
  // Note: "same" is pre-substituted to "alike"
  { input: "we are the same", shouldMatch: true, desc: "Same -> alike substitution" },
  { input: "they look alike", shouldMatch: true, desc: "Alike directly" },
];

for (const tc of alikeTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matched = match && match.rule.keyword === 'alike';
  test(tc.desc, matched === tc.shouldMatch, tc.shouldMatch, matched);
}

// ---------- LIKE Rule (rank: 10) ----------
subsection('Keyword: like (rank: 10)');
const likeTests = [
  // @be pattern (am, is, are, was)
  { input: "you are like my father", pattern: "* @be * like *", shouldMatch: true, desc: "Are like pattern" },
  { input: "it is like a dream", pattern: "* @be * like *", shouldMatch: true, desc: "Is like pattern" },
  { input: "i am like him", pattern: "* @be * like *", shouldMatch: true, desc: "Am like pattern" },
  { input: "it was like magic", pattern: "* @be * like *", shouldMatch: true, desc: "Was like pattern" },
];

for (const tc of likeTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

// ============================================================================
// SECTION 5: GOTO RULE TESTS
// ============================================================================
section('5. GOTO RULE TESTS');
console.log('  Tests that goto statements reference valid target keywords');

const gotoRules = [];
for (const rule of rules) {
  for (const pattern of rule.patterns) {
    for (const response of pattern.responses) {
      if (response.startsWith('goto ')) {
        const target = response.substring(5).trim();
        gotoRules.push({ from: rule.keyword, to: target, response });
      }
    }
  }
}

subsection('Goto Target Validation');
for (const gr of gotoRules) {
  const targetExists = rules.some(r => r.keyword === gr.to);
  test(`"${gr.from}" -> goto "${gr.to}" (target exists)`, targetExists === true, true, targetExists);
}

// List all goto relationships for documentation
subsection('Goto Relationships Summary');
const gotoSummary = {};
for (const gr of gotoRules) {
  if (!gotoSummary[gr.from]) gotoSummary[gr.from] = [];
  if (!gotoSummary[gr.from].includes(gr.to)) gotoSummary[gr.from].push(gr.to);
}
console.log('    Goto chains found:');
for (const [from, tos] of Object.entries(gotoSummary)) {
  console.log(`      ${from} -> [${tos.join(', ')}]`);
}

// ============================================================================
// SECTION 6: RANK PRIORITY TESTS
// ============================================================================
section('6. RANK PRIORITY TESTS');
console.log('  Tests that higher rank rules take precedence over lower rank rules');

const rankPriorityTests = [
  // computer (rank 50) vs i (no rank)
  { input: "i think computers are smart", expectedKeyword: "computer", desc: "computer(50) beats i(0)" },
  // name (rank 15) vs my (rank 2)
  { input: "my name is john", expectedKeyword: "name", desc: "name(15) beats my(2)" },
  // remember (rank 5) vs i (no rank)
  { input: "i remember the old days", expectedKeyword: "remember", desc: "remember(5) beats i(0)" },
  // alike (rank 10) vs i (no rank)
  { input: "i feel the same way", expectedKeyword: "alike", desc: "alike(10) beats i(0) (same->alike)" },
  // dreamed (rank 4) vs i (no rank)
  { input: "i dreamed of you", expectedKeyword: "dreamed", desc: "dreamed(4) beats i(0)" },
  // dream (rank 3) vs if (rank 3) - first in input wins when equal rank
  { input: "if i dream of paradise", expectedKeyword: "if", desc: "if(3) and dream(3) - if appears first" },
  // was (rank 2) vs my (rank 2) - both rank 2, first keyword in input wins
  { input: "my father was kind", expectedKeyword: "my", desc: "my(2) and was(2) - my appears first" },
];

for (const tc of rankPriorityTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matchedKeyword = match ? match.rule.keyword : 'none';
  test(tc.desc, matchedKeyword === tc.expectedKeyword, tc.expectedKeyword, matchedKeyword);
}

// ============================================================================
// SECTION 7: EDGE CASE TESTS
// ============================================================================
section('7. EDGE CASE TESTS');
console.log('  Tests edge cases: empty input, punctuation, case, whitespace');

subsection('Empty and Minimal Input');
const emptyResult = patternMatcher.matchPattern("", "*", synonyms);
test("Empty input matches wildcard '*'", emptyResult.matched === true, true, emptyResult.matched);

const singleWordResult = patternMatcher.matchPattern("hello", "*", synonyms);
test("Single word matches wildcard", singleWordResult.matched === true, true, singleWordResult.matched);

subsection('Punctuation Handling');
const punctuationTests = [
  { input: "i am happy!", pattern: "* i am *", shouldMatch: true, desc: "Exclamation mark" },
  { input: "am i right?", pattern: "* am i *", shouldMatch: true, desc: "Question mark" },
  { input: "well, i am here.", pattern: "* i am *", shouldMatch: true, desc: "Comma and period" },
  { input: "what; why; how", pattern: "*", shouldMatch: true, desc: "Semicolons" },
  { input: "test: one two", pattern: "*", shouldMatch: true, desc: "Colon" },
];

for (const tc of punctuationTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

subsection('Case Sensitivity');
const caseTests = [
  { input: "I AM HAPPY", pattern: "* i am *", shouldMatch: true, desc: "All uppercase" },
  { input: "i am happy", pattern: "* i am *", shouldMatch: true, desc: "All lowercase" },
  { input: "I Am Happy", pattern: "* i am *", shouldMatch: true, desc: "Mixed case" },
  { input: "SORRY", expected: "sorry", desc: "Keyword match is case-insensitive" },
];

for (const tc of caseTests) {
  if (tc.pattern) {
    const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
    test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
  } else {
    const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
    const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
    const matched = match && match.rule.keyword === tc.expected;
    test(tc.desc, matched === true, true, matched);
  }
}

subsection('Whitespace Handling');
const whitespaceTests = [
  { input: "i   am   happy", pattern: "* i am *", shouldMatch: true, desc: "Multiple spaces between words" },
  { input: "  i am happy  ", pattern: "* i am *", shouldMatch: true, desc: "Leading/trailing spaces" },
  { input: "i\tam\thappy", pattern: "* i am *", shouldMatch: true, desc: "Tab characters" },
];

for (const tc of whitespaceTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

subsection('Pattern Position Edge Cases');
const positionTests = [
  { input: "sorry", pattern: "*", shouldMatch: true, desc: "Keyword only (no other words)" },
  { input: "i am", pattern: "* i am *", shouldMatch: true, desc: "Pattern at end, empty final capture" },
  { input: "well i am", pattern: "* i am *", shouldMatch: true, desc: "Words before, none after" },
  { input: "i am happy", pattern: "* i am *", shouldMatch: true, desc: "Nothing before, words after" },
];

for (const tc of positionTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, result.matched === tc.shouldMatch, tc.shouldMatch, result.matched);
}

subsection('Long Input');
const longInput = "this is a very long sentence that contains many many words and i am wondering if the pattern matcher can handle such a long input without any issues at all";
const longResult = patternMatcher.matchPattern(longInput, "* i am *", synonyms);
test("Long input (50+ words)", longResult.matched === true, true, longResult.matched);

subsection('Multiple Keyword Match Priority');
// When multiple keywords appear, highest rank should win
const multiKeywordTests = [
  { input: "i remember my computer", expectedKeyword: "computer", desc: "computer(50) beats remember(5) beats my(2)" },
  { input: "perhaps i always dream", expectedKeyword: "dream", desc: "dream(3) beats always(1) beats perhaps(0)" },
];

for (const tc of multiKeywordTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  const matchedKeyword = match ? match.rule.keyword : 'none';
  test(tc.desc, matchedKeyword === tc.expectedKeyword, tc.expectedKeyword, matchedKeyword);
}

// ============================================================================
// SECTION 8: RESPONSE ASSEMBLY TESTS
// ============================================================================
section('8. RESPONSE ASSEMBLY TESTS');
console.log('  Tests that responses are correctly assembled with captured text');

subsection('Single Capture Replacement');
const singleCaptureTests = [
  {
    template: "You say (1)?",
    captures: [['hello', 'world']],
    desc: "Single capture replacement"
  },
  {
    template: "Tell me more about (1).",
    captures: [['your', 'feelings']],
    desc: "Capture with pronoun to reflect"
  },
];

for (const tc of singleCaptureTests) {
  const result = patternMatcher.assembleResponse(tc.template, tc.captures, postSubs);
  let response = result.response;
  for (const { marker, text } of result.lowercaseMarkers) {
    response = response.replace(marker, text);
  }
  test(tc.desc, response.includes('__') === false, 'no markers remaining', response.includes('__') ? 'markers found' : 'clean');
}

subsection('Multiple Capture Replacement');
const multiCaptureTests = [
  {
    template: "Why do you (2) when you (3)?",
    captures: [[], ['feel', 'sad'], ['think', 'of', 'me']],
    desc: "Multiple captures in template"
  },
];

for (const tc of multiCaptureTests) {
  const result = patternMatcher.assembleResponse(tc.template, tc.captures, postSubs);
  let response = result.response;
  for (const { marker, text } of result.lowercaseMarkers) {
    response = response.replace(marker, text);
  }
  test(tc.desc, response.includes('__') === false, 'no markers remaining', response.includes('__') ? 'markers found' : 'clean');
}

subsection('Pronoun Reflection in Assembly');
const reflectionAssemblyTests = [
  {
    template: "Do you often think of (2)?",
    captures: [[], ['my', 'childhood']],
    expectedContains: "your childhood",
    desc: "my -> your reflection in capture"
  },
  {
    template: "You say (1)?",
    captures: [['i', 'am', 'tired']],
    expectedContains: "you are tired",
    desc: "i am -> you are reflection"
  },
];

for (const tc of reflectionAssemblyTests) {
  const result = patternMatcher.assembleResponse(tc.template, tc.captures, postSubs);
  let response = result.response;
  for (const { marker, text } of result.lowercaseMarkers) {
    response = response.replace(marker, text);
  }
  const containsExpected = response.toLowerCase().includes(tc.expectedContains.toLowerCase());
  test(tc.desc, containsExpected === true, `contains "${tc.expectedContains}"`, response);
}

// ============================================================================
// SECTION 9: VARIABLE CAPTURE TESTS
// ============================================================================
section('9. VARIABLE CAPTURE TESTS');
console.log('  Tests that parenthetical captures work correctly for each pattern type');

subsection('Wildcard Capture Variations');
const wildcardCaptureTests = [
  {
    input: "hello world",
    pattern: "*",
    expectedCaptures: [['hello', 'world']],
    desc: "Single wildcard captures all"
  },
  {
    input: "prefix i am suffix",
    pattern: "* i am *",
    expectedCaptures: [['prefix'], ['suffix']],
    desc: "Two wildcards with fixed words"
  },
  {
    input: "i am",
    pattern: "* i am *",
    expectedCaptures: [[], []],
    desc: "Two wildcards, both empty"
  },
  {
    input: "a b c i am d e f",
    pattern: "* i am *",
    expectedCaptures: [['a', 'b', 'c'], ['d', 'e', 'f']],
    desc: "Multiple words in each wildcard"
  },
];

for (const tc of wildcardCaptureTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  const capturesMatch = result.matched && JSON.stringify(result.captures) === JSON.stringify(tc.expectedCaptures);
  test(tc.desc, capturesMatch === true, tc.expectedCaptures, result.captures);
}

subsection('Synonym Capture');
const synonymCaptureTests = [
  {
    input: "i want a pony",
    pattern: "* i @desire *",
    expectedCaptureIndex: 1,
    expectedCapturedWord: "want",
    desc: "@desire captures the matched synonym 'want'"
  },
  {
    input: "i need help",
    pattern: "* i @desire *",
    expectedCaptureIndex: 1,
    expectedCapturedWord: "need",
    desc: "@desire captures the matched synonym 'need'"
  },
  {
    input: "i am unhappy",
    pattern: "* i am * @sad *",
    expectedCaptureIndex: 2,
    expectedCapturedWord: "unhappy",
    desc: "@sad captures the matched synonym 'unhappy'"
  },
];

for (const tc of synonymCaptureTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  const capturedWord = result.matched && result.captures[tc.expectedCaptureIndex]
    ? result.captures[tc.expectedCaptureIndex][0]
    : null;
  test(tc.desc, capturedWord === tc.expectedCapturedWord, tc.expectedCapturedWord, capturedWord);
}

subsection('Complex Pattern Captures');
const complexCaptureTests = [
  {
    input: "well i feel that i should leave",
    pattern: "* i @belief * i *",
    desc: "Belief pattern with multiple captures",
    validateFn: (result) => {
      if (!result.matched) return false;
      // Should have: [prefix], [belief word], [middle], [suffix]
      // Captures should include 'feel' as the belief word
      return result.captures.some(c => c.includes('feel'));
    }
  },
  {
    input: "my poor mother is sick",
    pattern: "* my * @family *",
    desc: "Family pattern captures member",
    validateFn: (result) => {
      if (!result.matched) return false;
      // Should capture 'mother' from family synonym
      return result.captures.some(c => c.includes('mother'));
    }
  },
];

for (const tc of complexCaptureTests) {
  const result = patternMatcher.matchPattern(tc.input, tc.pattern, synonyms);
  test(tc.desc, tc.validateFn(result) === true, 'captures valid', result.matched ? JSON.stringify(result.captures) : 'no match');
}

// ============================================================================
// SECTION 10: FALLBACK BEHAVIOR TESTS
// ============================================================================
section('10. FALLBACK BEHAVIOR TESTS');
console.log('  Tests that unmatched input triggers fallback responses');

subsection('No Keyword Match');
const noMatchTests = [
  { input: "xyzzy plugh", desc: "Nonsense words" },
  { input: "the quick brown fox", desc: "No keywords in input" },
  { input: "lorem ipsum dolor sit amet", desc: "Latin placeholder text" },
];

for (const tc of noMatchTests) {
  const { result: processed } = patternMatcher.applyPreSubstitutions(tc.input, preSubs);
  const match = patternMatcher.findMatchingRule(processed, rules, synonyms);
  test(`${tc.desc} -> no match`, match === null, null, match ? match.rule.keyword : null);
}

subsection('Fallback Response Availability');
test("Fallback responses array exists", rulesData.fallbacks && rulesData.fallbacks.length > 0, 'non-empty array', rulesData.fallbacks ? rulesData.fallbacks.length : 0);
test("Fallback responses count", rulesData.fallbacks.length >= 3, '>= 3 responses', rulesData.fallbacks.length);

// Test that fallback messages are sensible
for (const fallback of rulesData.fallbacks) {
  test(`Fallback "${fallback.substring(0, 30)}..." is non-empty`, fallback.length > 5, '> 5 chars', fallback.length);
}

// ============================================================================
// SECTION 11: QUIT WORD TESTS
// ============================================================================
section('11. QUIT WORD TESTS');
console.log('  Tests that quit words are correctly identified');

const quitWords = rulesData.quitWords;

test("Quit words array exists", quitWords && quitWords.length > 0, 'non-empty', quitWords ? quitWords.length : 0);

for (const qw of quitWords) {
  test(`Quit word "${qw}" in list`, quitWords.includes(qw), true, quitWords.includes(qw));
}

// Test case insensitivity
const engine = new ElizaEngine();
await engine.loadRules(rulesData);

for (const qw of quitWords) {
  test(`isQuitWord("${qw}")`, engine.isQuitWord(qw) === true, true, engine.isQuitWord(qw));
  test(`isQuitWord("${qw.toUpperCase()}")`, engine.isQuitWord(qw.toUpperCase()) === true, true, engine.isQuitWord(qw.toUpperCase()));
}

// ============================================================================
// SECTION 12: GREETING TESTS
// ============================================================================
section('12. GREETING TESTS');
console.log('  Tests that initial and final greetings are configured');

test("Initial greetings exist", rulesData.initialGreetings && rulesData.initialGreetings.length > 0, 'non-empty', rulesData.initialGreetings ? rulesData.initialGreetings.length : 0);
test("Final greetings exist", rulesData.finalGreetings && rulesData.finalGreetings.length > 0, 'non-empty', rulesData.finalGreetings ? rulesData.finalGreetings.length : 0);

// ============================================================================
// SECTION 13: INTEGRATION TESTS WITH ELIZA ENGINE
// ============================================================================
section('13. INTEGRATION TESTS WITH ELIZA ENGINE');
console.log('  Tests the full ElizaEngine response cycle');

const testEngine = new ElizaEngine();
await testEngine.loadRules(rulesData);

subsection('Basic Response Generation');
const integrationTests = [
  { input: "hello", expectsResponse: true, desc: "Greeting triggers response" },
  { input: "i am sad", expectsResponse: true, desc: "I am pattern triggers response" },
  { input: "my mother is kind", expectsResponse: true, desc: "Family pattern triggers response" },
  { input: "i remember my childhood", expectsResponse: true, desc: "Remember pattern triggers response" },
];

for (const tc of integrationTests) {
  testEngine.reset();
  const result = testEngine.getResponse(tc.input);
  test(tc.desc, result.response && result.response.length > 0, 'non-empty response', result.response ? result.response.substring(0, 50) : 'empty');
}

subsection('Response Contains Expected Elements');
const contentTests = [
  {
    input: "i remember my dog",
    expectedContains: null,  // Just check it's from the remember rule
    expectedKeyword: "remember",
    desc: "Remember rule triggers"
  },
  {
    input: "my father was strict",
    expectedKeyword: "my",
    desc: "Family/my rule triggers"
  },
];

for (const tc of contentTests) {
  testEngine.reset();
  const result = testEngine.getResponse(tc.input);
  const keywordMatch = result.matchInfo && result.matchInfo.keyword === tc.expectedKeyword;
  test(tc.desc, keywordMatch === true, tc.expectedKeyword, result.matchInfo ? result.matchInfo.keyword : 'none');
}

subsection('Quit Word Handling');
testEngine.reset();
const quitResult = testEngine.getResponse("goodbye");
test("Quit word returns isQuit: true", quitResult.isQuit === true, true, quitResult.isQuit);
test("Quit word returns final greeting", quitResult.response && rulesData.finalGreetings.includes(quitResult.response), 'in final greetings', quitResult.response);

// ============================================================================
// SECTION 14: RESPONSE CYCLING TESTS
// ============================================================================
section('14. RESPONSE CYCLING TESTS');
console.log('  Tests that responses cycle through available options');

const cycleEngine = new ElizaEngine();
await cycleEngine.loadRules(rulesData);

subsection('Response Variety');
// Test that the same input produces different responses (cycling)
// Note: We should NOT reset between calls, as reset() clears the response indices
const sameInputResponses = new Set();
for (let i = 0; i < 10; i++) {
  // Don't reset - we want to test cycling through responses
  const result = cycleEngine.getResponse("hello");
  sameInputResponses.add(result.response);
}

// Hello has 2 responses, so we should see at least 2 different ones
test("Hello produces multiple responses over cycles", sameInputResponses.size >= 2, '>= 2 unique', sameInputResponses.size);

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('  TEST SUMMARY');
console.log('='.repeat(60));
console.log(`\n    Total:  ${passed + failed}`);
console.log(`    Passed: ${passed}`);
console.log(`    Failed: ${failed}`);
console.log(`    Rate:   ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failures.length > 0) {
  console.log('\n' + '-'.repeat(60));
  console.log('  FAILED TESTS:');
  console.log('-'.repeat(60));
  for (const f of failures) {
    console.log(`\n    Section: ${f.section}`);
    console.log(`    Test: ${f.name}`);
    if (f.expected !== null) console.log(`    Expected: ${JSON.stringify(f.expected)}`);
    if (f.actual !== null) console.log(`    Actual: ${JSON.stringify(f.actual)}`);
  }
}

console.log('\n' + '='.repeat(60));

process.exit(failed > 0 ? 1 : 0);
