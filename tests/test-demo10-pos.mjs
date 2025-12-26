#!/usr/bin/env node
/**
 * Comprehensive Test Suite for POS Tagging (Demo 10)
 * Run with: node test-pos.mjs
 */

import nlp from 'compromise';

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
    }

    assert(condition, testName, expected, actual) {
        this.total++;
        if (condition) {
            console.log(`✓ PASS: ${testName}`);
            this.passed++;
        } else {
            console.log(`✗ FAIL: ${testName}`);
            console.log(`  Expected: ${JSON.stringify(expected)}`);
            console.log(`  Actual: ${JSON.stringify(actual)}`);
            this.failed++;
        }
    }

    assertEqual(actual, expected, testName) {
        this.assert(actual === expected, testName, expected, actual);
    }

    assertContains(array, value, testName) {
        this.assert(array.includes(value), testName, `array containing ${value}`, array);
    }

    assertGreaterThan(actual, expected, testName) {
        this.assert(actual > expected, testName, `> ${expected}`, actual);
    }

    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`Test Summary: ${this.passed}/${this.total} passed, ${this.failed} failed`);
        console.log('='.repeat(70));
        return this.failed === 0;
    }
}

// POS Tagger helper functions (extracted from pos-tagger.js for testing)
const POSTaggerHelpers = {
    getPrimaryTag(tags) {
        const priority = [
            'Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun',
            'Preposition', 'Conjunction', 'Determiner', 'Auxiliary',
            'Modal', 'Participle', 'Gerund', 'Infinitive',
            'Possessive', 'Negative'
        ];

        for (let tag of priority) {
            if (tags.includes(tag)) {
                return tag;
            }
        }

        return tags[0] || 'Other';
    },

    getTagClass(tag) {
        const classMap = {
            'Noun': 'noun',
            'Verb': 'verb',
            'Adjective': 'adjective',
            'Adverb': 'adverb',
            'Pronoun': 'pronoun',
            'Preposition': 'preposition',
            'Conjunction': 'conjunction',
            'Determiner': 'determiner',
            'Auxiliary': 'auxiliary',
            'Modal': 'modal',
            'Participle': 'participle',
            'Gerund': 'gerund',
            'Infinitive': 'infinitive',
            'Possessive': 'possessive',
            'Negative': 'negative'
        };

        return classMap[tag] || 'other';
    }
};

// Valid POS tags
const validTags = new Set(['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun',
                          'Preposition', 'Conjunction', 'Determiner', 'Auxiliary',
                          'Modal', 'Participle', 'Gerund', 'Infinitive',
                          'Possessive', 'Negative']);

function isValidPOSTag(tag) {
    return validTags.has(tag);
}

function analyzePOS(text) {
    const doc = nlp(text);
    const json = doc.json()[0];
    const results = [];

    if (json && json.terms) {
        json.terms.forEach(term => {
            const tags = term.tags || [];
            const word = term.text || '';
            const primaryTag = POSTaggerHelpers.getPrimaryTag(tags);

            results.push({
                word: word,
                tags: tags,
                primaryTag: primaryTag
            });
        });
    }

    return results;
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('Comprehensive POS Tagging Test Suite (Demo 10)');
    console.log('='.repeat(70));
    console.log();

    const runner = new TestRunner();

    // ========================================================================
    // Test Group 1: POS Tag Validation (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 1: POS Tag Validation (5 tests) ---\n');

    runner.assert(
        isValidPOSTag('Noun'),
        "NOUN should be valid tag",
        true,
        isValidPOSTag('Noun')
    );

    runner.assert(
        isValidPOSTag('Verb'),
        "VERB should be valid tag",
        true,
        isValidPOSTag('Verb')
    );

    runner.assert(
        isValidPOSTag('Adjective'),
        "Adjective should be valid tag",
        true,
        isValidPOSTag('Adjective')
    );

    runner.assert(
        !isValidPOSTag('INVALID'),
        "INVALID should not be valid tag",
        false,
        isValidPOSTag('INVALID')
    );

    runner.assertEqual(
        validTags.size,
        15,
        "Should have 15 valid tag types"
    );

    // ========================================================================
    // Test Group 2: Helper Function Tests (10 tests)
    // ========================================================================
    console.log('\n--- Test Group 2: Helper Function Tests (10 tests) ---\n');

    runner.assertEqual(
        POSTaggerHelpers.getPrimaryTag(['Noun', 'Verb']),
        'Noun',
        "getPrimaryTag should prioritize Noun over Verb"
    );

    runner.assertEqual(
        POSTaggerHelpers.getPrimaryTag(['Verb', 'Adjective']),
        'Verb',
        "getPrimaryTag should prioritize Verb over Adjective"
    );

    runner.assertEqual(
        POSTaggerHelpers.getPrimaryTag(['Auxiliary', 'Verb']),
        'Verb',
        "getPrimaryTag should prioritize Verb over Auxiliary"
    );

    runner.assertEqual(
        POSTaggerHelpers.getPrimaryTag([]),
        'Other',
        "getPrimaryTag should return 'Other' for empty tags"
    );

    runner.assertEqual(
        POSTaggerHelpers.getTagClass('Noun'),
        'noun',
        "getTagClass should return 'noun' for Noun tag"
    );

    runner.assertEqual(
        POSTaggerHelpers.getTagClass('Verb'),
        'verb',
        "getTagClass should return 'verb' for Verb tag"
    );

    runner.assertEqual(
        POSTaggerHelpers.getTagClass('Adjective'),
        'adjective',
        "getTagClass should return 'adjective' for Adjective tag"
    );

    runner.assertEqual(
        POSTaggerHelpers.getTagClass('Unknown'),
        'other',
        "getTagClass should return 'other' for unknown tag"
    );

    runner.assertEqual(
        POSTaggerHelpers.getPrimaryTag(['Modal', 'Verb']),
        'Verb',
        "getPrimaryTag should prioritize Verb over Modal"
    );

    runner.assertEqual(
        POSTaggerHelpers.getPrimaryTag(['Determiner', 'Adjective']),
        'Adjective',
        "getPrimaryTag should prioritize Adjective over Determiner"
    );

    // ========================================================================
    // Test Group 3: Noun Detection (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 3: Noun Detection (8 tests) ---\n');

    let result = analyzePOS("dog");
    runner.assertContains(
        result[0].tags,
        'Noun',
        "Single noun 'dog' should be tagged as Noun"
    );

    result = analyzePOS("The cat sleeps");
    runner.assertContains(
        result[1].tags,
        'Noun',
        "Common noun 'cat' should be tagged as Noun"
    );

    result = analyzePOS("happiness");
    runner.assertContains(
        result[0].tags,
        'Noun',
        "Abstract noun 'happiness' should be tagged as Noun"
    );

    result = analyzePOS("computer");
    runner.assertContains(
        result[0].tags,
        'Noun',
        "Concrete noun 'computer' should be tagged as Noun"
    );

    result = analyzePOS("The teacher teaches students");
    runner.assertContains(
        result[1].tags,
        'Noun',
        "Noun 'teacher' should be tagged as Noun"
    );

    result = analyzePOS("The books are here");
    runner.assertContains(
        result[1].tags,
        'Noun',
        "Plural noun 'books' should be tagged as Noun"
    );

    result = analyzePOS("information");
    runner.assertContains(
        result[0].tags,
        'Noun',
        "Uncountable noun 'information' should be tagged as Noun"
    );

    result = analyzePOS("The city is beautiful");
    runner.assertContains(
        result[1].tags,
        'Noun',
        "Common noun 'city' should be tagged as Noun"
    );

    // ========================================================================
    // Test Group 4: Verb Detection (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 4: Verb Detection (8 tests) ---\n');

    result = analyzePOS("run");
    runner.assertContains(
        result[0].tags,
        'Verb',
        "Base verb 'run' should be tagged as Verb"
    );

    result = analyzePOS("I am running");
    runner.assertContains(
        result[2].tags,
        'Verb',
        "Present participle 'running' should be tagged as Verb or Participle"
    );

    result = analyzePOS("She walked home");
    runner.assertContains(
        result[1].tags,
        'Verb',
        "Past tense 'walked' should be tagged as Verb"
    );

    result = analyzePOS("They think");
    runner.assertContains(
        result[1].tags,
        'Verb',
        "Present tense 'think' should be tagged as Verb"
    );

    result = analyzePOS("He has eaten");
    runner.assertContains(
        result[2].tags,
        'Verb',
        "Past participle 'eaten' should be tagged as Verb"
    );

    result = analyzePOS("We will go");
    runner.assertContains(
        result[2].tags,
        'Verb',
        "Future verb 'go' should be tagged as Verb"
    );

    result = analyzePOS("She can swim");
    runner.assertContains(
        result[2].tags,
        'Verb',
        "Modal verb phrase - 'swim' should be tagged as Verb"
    );

    result = analyzePOS("They are playing");
    runner.assertContains(
        result[2].tags,
        'Verb',
        "Progressive verb 'playing' should be tagged as Verb or Participle"
    );

    // ========================================================================
    // Test Group 5: Adjective Detection (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 5: Adjective Detection (6 tests) ---\n');

    result = analyzePOS("The quick fox");
    runner.assertContains(
        result[1].tags,
        'Adjective',
        "Adjective 'quick' should be tagged as Adjective"
    );

    result = analyzePOS("beautiful flowers");
    runner.assertContains(
        result[0].tags,
        'Adjective',
        "Adjective 'beautiful' should be tagged as Adjective"
    );

    result = analyzePOS("The tall building");
    runner.assertContains(
        result[1].tags,
        'Adjective',
        "Adjective 'tall' should be tagged as Adjective"
    );

    result = analyzePOS("red apple");
    runner.assertContains(
        result[0].tags,
        'Adjective',
        "Color adjective 'red' should be tagged as Adjective"
    );

    result = analyzePOS("happy people");
    runner.assertContains(
        result[0].tags,
        'Adjective',
        "Descriptive adjective 'happy' should be tagged as Adjective"
    );

    result = analyzePOS("The largest city");
    runner.assertContains(
        result[1].tags,
        'Adjective',
        "Superlative adjective 'largest' should be tagged as Adjective"
    );

    // ========================================================================
    // Test Group 6: Adverb Detection (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 6: Adverb Detection (5 tests) ---\n');

    result = analyzePOS("She runs quickly");
    runner.assertContains(
        result[2].tags,
        'Adverb',
        "Adverb 'quickly' should be tagged as Adverb"
    );

    result = analyzePOS("very good");
    runner.assertContains(
        result[0].tags,
        'Adverb',
        "Intensifier 'very' should be tagged as Adverb"
    );

    result = analyzePOS("He speaks well");
    runner.assertContains(
        result[2].tags,
        'Adverb',
        "Adverb 'well' should be tagged as Adverb"
    );

    result = analyzePOS("They often visit");
    runner.assertContains(
        result[1].tags,
        'Adverb',
        "Frequency adverb 'often' should be tagged as Adverb"
    );

    result = analyzePOS("She carefully opened the door");
    runner.assertContains(
        result[1].tags,
        'Adverb',
        "Manner adverb 'carefully' should be tagged as Adverb"
    );

    // ========================================================================
    // Test Group 7: Pronoun Detection (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 7: Pronoun Detection (6 tests) ---\n');

    result = analyzePOS("He runs");
    runner.assertContains(
        result[0].tags,
        'Pronoun',
        "Personal pronoun 'He' should be tagged as Pronoun"
    );

    result = analyzePOS("She likes it");
    runner.assertContains(
        result[2].tags,
        'Pronoun',
        "Object pronoun 'it' should be tagged as Pronoun"
    );

    result = analyzePOS("They are happy");
    runner.assertContains(
        result[0].tags,
        'Pronoun',
        "Plural pronoun 'They' should be tagged as Pronoun"
    );

    result = analyzePOS("Who is that");
    const whoHasQuestionWord = result[0].tags.includes('QuestionWord') || result[0].tags.includes('Pronoun');
    runner.assert(
        whoHasQuestionWord,
        "Interrogative pronoun 'Who' should be tagged as QuestionWord or Pronoun",
        true,
        whoHasQuestionWord
    );

    result = analyzePOS("This is my book");
    const myHasPossessive = result[2].tags.includes('Pronoun') || result[2].tags.includes('Possessive') || result[2].tags.includes('Determiner');
    runner.assert(
        myHasPossessive,
        "Possessive determiner 'my' should be tagged as Possessive, Pronoun, or Determiner",
        true,
        myHasPossessive
    );

    result = analyzePOS("We love them");
    runner.assertContains(
        result[2].tags,
        'Pronoun',
        "Object pronoun 'them' should be tagged as Pronoun"
    );

    // ========================================================================
    // Test Group 8: Preposition Detection (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 8: Preposition Detection (5 tests) ---\n');

    result = analyzePOS("in the house");
    runner.assertContains(
        result[0].tags,
        'Preposition',
        "Preposition 'in' should be tagged as Preposition"
    );

    result = analyzePOS("on the table");
    runner.assertContains(
        result[0].tags,
        'Preposition',
        "Preposition 'on' should be tagged as Preposition"
    );

    result = analyzePOS("at the park");
    runner.assertContains(
        result[0].tags,
        'Preposition',
        "Preposition 'at' should be tagged as Preposition"
    );

    result = analyzePOS("with my friend");
    runner.assertContains(
        result[0].tags,
        'Preposition',
        "Preposition 'with' should be tagged as Preposition"
    );

    result = analyzePOS("by the river");
    runner.assertContains(
        result[0].tags,
        'Preposition',
        "Preposition 'by' should be tagged as Preposition"
    );

    // ========================================================================
    // Test Group 9: Conjunction Detection (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 9: Conjunction Detection (4 tests) ---\n');

    result = analyzePOS("cats and dogs");
    runner.assertContains(
        result[1].tags,
        'Conjunction',
        "Conjunction 'and' should be tagged as Conjunction"
    );

    result = analyzePOS("I like it but she doesn't");
    runner.assertContains(
        result[3].tags,
        'Conjunction',
        "Conjunction 'but' should be tagged as Conjunction"
    );

    result = analyzePOS("tea or coffee");
    runner.assertContains(
        result[1].tags,
        'Conjunction',
        "Conjunction 'or' should be tagged as Conjunction"
    );

    result = analyzePOS("I stayed home because it rained");
    runner.assertContains(
        result[3].tags,
        'Conjunction',
        "Subordinating conjunction 'because' should be tagged as Conjunction"
    );

    // ========================================================================
    // Test Group 10: Determiner Detection (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 10: Determiner Detection (5 tests) ---\n');

    result = analyzePOS("the dog");
    runner.assertContains(
        result[0].tags,
        'Determiner',
        "Definite article 'the' should be tagged as Determiner"
    );

    result = analyzePOS("a cat");
    runner.assertContains(
        result[0].tags,
        'Determiner',
        "Indefinite article 'a' should be tagged as Determiner"
    );

    result = analyzePOS("an apple");
    runner.assertContains(
        result[0].tags,
        'Determiner',
        "Indefinite article 'an' should be tagged as Determiner"
    );

    result = analyzePOS("this book");
    runner.assertContains(
        result[0].tags,
        'Determiner',
        "Demonstrative determiner 'this' should be tagged as Determiner"
    );

    result = analyzePOS("that house");
    runner.assertContains(
        result[0].tags,
        'Determiner',
        "Demonstrative determiner 'that' should be tagged as Determiner"
    );

    // ========================================================================
    // Test Group 11: Complex Sentence Structures (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 11: Complex Sentence Structures (5 tests) ---\n');

    result = analyzePOS("The quick brown fox jumps over the lazy dog");
    runner.assertGreaterThan(
        result.length,
        8,
        "Complex sentence should have 8+ words tagged"
    );

    result = analyzePOS("I think that she knows what he wants");
    runner.assertGreaterThan(
        result.length,
        6,
        "Nested clause sentence should have 7+ words tagged"
    );

    result = analyzePOS("Although it was raining, we went outside");
    runner.assertGreaterThan(
        result.length,
        6,
        "Compound sentence should have 7+ words tagged"
    );

    result = analyzePOS("The student who studies hard will succeed");
    runner.assertGreaterThan(
        result.length,
        6,
        "Relative clause sentence should have 7+ words tagged"
    );

    result = analyzePOS("She is not only smart but also kind");
    runner.assertGreaterThan(
        result.length,
        6,
        "Correlative conjunction sentence should have 7+ words tagged"
    );

    // ========================================================================
    // Test Group 12: Ambiguous Words (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 12: Ambiguous Words (5 tests) ---\n');

    result = analyzePOS("I run every day");
    runner.assertContains(
        result[1].tags,
        'Verb',
        "Ambiguous word 'run' as verb should be tagged correctly"
    );

    result = analyzePOS("The morning run was great");
    runner.assertContains(
        result[2].tags,
        'Noun',
        "Ambiguous word 'run' as noun should be tagged correctly"
    );

    result = analyzePOS("The book is on the table");
    runner.assertContains(
        result[1].tags,
        'Noun',
        "Word 'book' as noun should be tagged correctly"
    );

    result = analyzePOS("I will book a flight");
    runner.assertContains(
        result[2].tags,
        'Verb',
        "Word 'book' as verb should be tagged correctly"
    );

    result = analyzePOS("The light is bright");
    runner.assertContains(
        result[1].tags,
        'Noun',
        "Word 'light' as noun should be tagged correctly"
    );

    // ========================================================================
    // Test Group 13: Edge Cases (8 tests)
    // ========================================================================
    console.log('\n--- Test Group 13: Edge Cases (8 tests) ---\n');

    result = analyzePOS("Hello");
    runner.assertEqual(
        result.length,
        1,
        "Single word should produce 1 tagged result"
    );

    result = analyzePOS("Hello world");
    runner.assertEqual(
        result.length,
        2,
        "Two words should produce 2 tagged results"
    );

    result = analyzePOS("I am happy and you are sad but we are friends");
    runner.assertGreaterThan(
        result.length,
        9,
        "Long sentence should produce 10+ tagged results"
    );

    result = analyzePOS("The");
    runner.assertEqual(
        result.length,
        1,
        "Single determiner should produce 1 tagged result"
    );

    result = analyzePOS("!");
    runner.assertEqual(
        result.length,
        1,
        "Single punctuation should be handled"
    );

    result = analyzePOS("Hello, world!");
    runner.assertGreaterThan(
        result.length,
        1,
        "Text with punctuation should produce multiple tagged results"
    );

    result = analyzePOS("Dr. Smith lives on Main St. in New York.");
    runner.assertGreaterThan(
        result.length,
        5,
        "Text with abbreviations should produce multiple tagged results"
    );

    result = analyzePOS("She said, \"Hello!\"");
    runner.assertGreaterThan(
        result.length,
        2,
        "Text with quotations should be handled properly"
    );

    // ========================================================================
    // Test Group 14: Tag Consistency (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 14: Tag Consistency (5 tests) ---\n');

    result = analyzePOS("The dog barks");
    const allHaveTags = result.every(r => r.tags.length > 0);
    runner.assert(
        allHaveTags,
        "All words in simple sentence should have at least one tag",
        true,
        allHaveTags
    );

    result = analyzePOS("I love programming");
    const allHaveWords = result.every(r => r.word && r.word.length > 0);
    runner.assert(
        allHaveWords,
        "All results should have non-empty word property",
        true,
        allHaveWords
    );

    result = analyzePOS("The cat sits on the mat");
    const allHavePrimary = result.every(r => r.primaryTag && r.primaryTag.length > 0);
    runner.assert(
        allHavePrimary,
        "All results should have a primary tag",
        true,
        allHavePrimary
    );

    result = analyzePOS("She is reading a book");
    runner.assertEqual(
        result.length,
        5,
        "Simple sentence with 5 words should produce 5 results"
    );

    result = analyzePOS("He quickly ran to the store");
    runner.assertEqual(
        result.length,
        6,
        "Simple sentence with 6 words should produce 6 results"
    );

    // ========================================================================
    // Test Group 15: Modal and Auxiliary Verbs (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 15: Modal and Auxiliary Verbs (6 tests) ---\n');

    result = analyzePOS("I can swim");
    const canHasModal = result[1].tags.includes('Modal') || result[1].tags.includes('Verb');
    runner.assert(
        canHasModal,
        "Modal 'can' should be tagged as Modal or Verb",
        true,
        canHasModal
    );

    result = analyzePOS("She should go");
    const shouldHasModal = result[1].tags.includes('Modal') || result[1].tags.includes('Verb');
    runner.assert(
        shouldHasModal,
        "Modal 'should' should be tagged as Modal or Verb",
        true,
        shouldHasModal
    );

    result = analyzePOS("They must leave");
    const mustHasModal = result[1].tags.includes('Modal') || result[1].tags.includes('Verb');
    runner.assert(
        mustHasModal,
        "Modal 'must' should be tagged as Modal or Verb",
        true,
        mustHasModal
    );

    result = analyzePOS("I am running");
    const amHasAux = result[1].tags.includes('Auxiliary') || result[1].tags.includes('Verb');
    runner.assert(
        amHasAux,
        "Auxiliary 'am' should be tagged as Auxiliary or Verb",
        true,
        amHasAux
    );

    result = analyzePOS("They have finished");
    const haveHasAux = result[1].tags.includes('Auxiliary') || result[1].tags.includes('Verb');
    runner.assert(
        haveHasAux,
        "Auxiliary 'have' should be tagged as Auxiliary or Verb",
        true,
        haveHasAux
    );

    result = analyzePOS("She will arrive soon");
    const willHasModal = result[1].tags.includes('Modal') || result[1].tags.includes('Verb');
    runner.assert(
        willHasModal,
        "Modal 'will' should be tagged as Modal or Verb",
        true,
        willHasModal
    );

    // ========================================================================
    // Test Group 16: Negative Words (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 16: Negative Words (4 tests) ---\n');

    result = analyzePOS("I do not like it");
    const notHasNegative = result[2].tags.includes('Negative') || result[2].tags.includes('Adverb');
    runner.assert(
        notHasNegative,
        "Negative 'not' should be tagged as Negative or Adverb",
        true,
        notHasNegative
    );

    result = analyzePOS("She never eats meat");
    const neverHasNegative = result[1].tags.includes('Negative') || result[1].tags.includes('Adverb');
    runner.assert(
        neverHasNegative,
        "Negative 'never' should be tagged as Negative or Adverb",
        true,
        neverHasNegative
    );

    result = analyzePOS("No problem");
    runner.assertGreaterThan(
        result.length,
        0,
        "Negative phrase 'No problem' should be tagged"
    );

    result = analyzePOS("I have nothing");
    runner.assertGreaterThan(
        result.length,
        2,
        "Sentence with 'nothing' should be tagged properly"
    );

    // ========================================================================
    // Test Group 17: Comparative and Superlative Forms (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 17: Comparative and Superlative Forms (5 tests) ---\n');

    result = analyzePOS("The bigger house");
    runner.assertContains(
        result[1].tags,
        'Adjective',
        "Comparative 'bigger' should be tagged as Adjective"
    );

    result = analyzePOS("She runs faster");
    const fasterHasAdverb = result[2].tags.includes('Adverb') || result[2].tags.includes('Adjective');
    runner.assert(
        fasterHasAdverb,
        "Comparative 'faster' should be tagged as Adverb or Adjective",
        true,
        fasterHasAdverb
    );

    result = analyzePOS("The best option");
    runner.assertContains(
        result[1].tags,
        'Adjective',
        "Superlative 'best' should be tagged as Adjective"
    );

    result = analyzePOS("The most beautiful");
    runner.assertContains(
        result[1].tags,
        'Adverb',
        "Intensifier 'most' should be tagged as Adverb"
    );

    result = analyzePOS("This is more expensive");
    runner.assertContains(
        result[2].tags,
        'Adverb',
        "Comparative marker 'more' should be tagged as Adverb"
    );

    // ========================================================================
    // Test Group 18: Proper Nouns and Named Entities (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 18: Proper Nouns and Named Entities (5 tests) ---\n');

    result = analyzePOS("John loves Mary");
    const johnHasNoun = result[0].tags.includes('Noun') || result[0].tags.includes('Person');
    runner.assert(
        johnHasNoun,
        "Proper noun 'John' should be tagged as Noun or Person",
        true,
        johnHasNoun
    );

    result = analyzePOS("I live in Paris");
    const parisHasNoun = result[3].tags.includes('Noun') || result[3].tags.includes('Place');
    runner.assert(
        parisHasNoun,
        "Proper noun 'Paris' should be tagged as Noun or Place",
        true,
        parisHasNoun
    );

    result = analyzePOS("Microsoft is a company");
    const microsoftHasNoun = result[0].tags.includes('Noun') || result[0].tags.includes('Organization');
    runner.assert(
        microsoftHasNoun,
        "Proper noun 'Microsoft' should be tagged as Noun or Organization",
        true,
        microsoftHasNoun
    );

    result = analyzePOS("She visited New York");
    runner.assertGreaterThan(
        result.length,
        3,
        "Multi-word proper noun 'New York' should be handled"
    );

    result = analyzePOS("Dr. Smith arrived");
    runner.assertGreaterThan(
        result.length,
        2,
        "Title with proper noun 'Dr. Smith' should be handled"
    );

    // ========================================================================
    // Test Group 19: Phrasal Verbs and Multi-word Expressions (4 tests)
    // ========================================================================
    console.log('\n--- Test Group 19: Phrasal Verbs and Multi-word Expressions (4 tests) ---\n');

    result = analyzePOS("I gave up smoking");
    runner.assertGreaterThan(
        result.length,
        3,
        "Phrasal verb 'gave up' should be tagged properly"
    );

    result = analyzePOS("She looked after the children");
    runner.assertGreaterThan(
        result.length,
        4,
        "Phrasal verb 'looked after' should be tagged properly"
    );

    result = analyzePOS("He turned on the light");
    runner.assertGreaterThan(
        result.length,
        4,
        "Phrasal verb 'turned on' should be tagged properly"
    );

    result = analyzePOS("They came back yesterday");
    runner.assertGreaterThan(
        result.length,
        3,
        "Phrasal verb 'came back' should be tagged properly"
    );

    // ========================================================================
    // Test Group 20: Numbers and Quantifiers (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 20: Numbers and Quantifiers (5 tests) ---\n');

    result = analyzePOS("I have five apples");
    runner.assertGreaterThan(
        result.length,
        3,
        "Sentence with number 'five' should be tagged properly"
    );

    result = analyzePOS("She has many friends");
    runner.assertGreaterThan(
        result.length,
        3,
        "Sentence with quantifier 'many' should be tagged properly"
    );

    result = analyzePOS("A few people came");
    runner.assertGreaterThan(
        result.length,
        3,
        "Multi-word quantifier 'a few' should be tagged properly"
    );

    result = analyzePOS("All students passed");
    runner.assertGreaterThan(
        result.length,
        2,
        "Quantifier 'all' should be tagged properly"
    );

    result = analyzePOS("Some people like it");
    runner.assertGreaterThan(
        result.length,
        3,
        "Quantifier 'some' should be tagged properly"
    );

    // ========================================================================
    // Test Group 21: Advanced Edge Cases (6 tests)
    // ========================================================================
    console.log('\n--- Test Group 21: Advanced Edge Cases (6 tests) ---\n');

    result = analyzePOS("COVID-19 is a virus");
    runner.assertGreaterThan(
        result.length,
        3,
        "Text with hyphenated technical term should be handled"
    );

    result = analyzePOS("The cost is $100");
    runner.assertGreaterThan(
        result.length,
        3,
        "Text with currency symbol should be handled"
    );

    result = analyzePOS("Email me at test@example.com");
    runner.assertGreaterThan(
        result.length,
        3,
        "Text with email address should be handled"
    );

    result = analyzePOS("Visit https://example.com for details");
    runner.assertGreaterThan(
        result.length,
        3,
        "Text with URL should be handled"
    );

    result = analyzePOS("She scored 95%");
    runner.assertGreaterThan(
        result.length,
        2,
        "Text with percentage should be handled"
    );

    result = analyzePOS("The meeting is at 3:30 PM");
    runner.assertGreaterThan(
        result.length,
        4,
        "Text with time format should be handled"
    );

    // ========================================================================
    // Test Group 22: Contractions and Informal Text (5 tests)
    // ========================================================================
    console.log('\n--- Test Group 22: Contractions and Informal Text (5 tests) ---\n');

    result = analyzePOS("I don't know");
    runner.assertGreaterThan(
        result.length,
        2,
        "Contraction 'don't' should be handled"
    );

    result = analyzePOS("She's happy");
    runner.assertGreaterThan(
        result.length,
        1,
        "Contraction 'She's' should be handled"
    );

    result = analyzePOS("They've arrived");
    runner.assertGreaterThan(
        result.length,
        1,
        "Contraction 'They've' should be handled"
    );

    result = analyzePOS("It's raining");
    runner.assertGreaterThan(
        result.length,
        1,
        "Contraction 'It's' should be handled"
    );

    result = analyzePOS("We'll see");
    runner.assertGreaterThan(
        result.length,
        1,
        "Contraction 'We'll' should be handled"
    );

    // Final summary
    const success = runner.printSummary();
    process.exit(success ? 0 : 1);
}

runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
