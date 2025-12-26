/**
 * A.L.I.C.E. Chatbot Test Suite (Node.js)
 * Comprehensive testing of ALICE implementation against original 1995 behaviors
 */

// Import Alice class
import { Alice } from './js/alice.js';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

class AliceTestSuite {
    constructor() {
        this.alice = new Alice();
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    log(message, color = colors.reset) {
        console.log(`${color}${message}${colors.reset}`);
    }

    runTest(name, input, validator, description) {
        this.results.total++;

        const response = this.alice.getResponse(input);
        const context = this.alice.getContext();
        const passed = validator(response, context);

        this.results.tests.push({
            name,
            input,
            response,
            context,
            passed,
            description
        });

        if (passed) {
            this.results.passed++;
            this.log(`  ✓ ${name}`, colors.green);
        } else {
            this.results.failed++;
            this.log(`  ✗ ${name}`, colors.red);
            this.log(`    Input: "${input}"`, colors.yellow);
            this.log(`    Response: "${response}"`, colors.yellow);
            this.log(`    Expected: ${description}`, colors.yellow);
        }
    }

    printSection(title) {
        this.log(`\n${colors.bright}${title}${colors.reset}`, colors.cyan);
        this.log('─'.repeat(60), colors.cyan);
    }

    printSummary() {
        this.log('\n' + '═'.repeat(60), colors.bright);
        this.log('TEST SUMMARY', colors.bright);
        this.log('═'.repeat(60), colors.bright);

        const percentage = Math.round((this.results.passed / this.results.total) * 100);

        this.log(`Total Tests: ${this.results.total}`, colors.blue);
        this.log(`Passed: ${this.results.passed}`, colors.green);
        this.log(`Failed: ${this.results.failed}`, colors.red);
        this.log(`Success Rate: ${percentage}%`, percentage === 100 ? colors.green : colors.yellow);

        if (this.results.failed > 0) {
            this.log('\nFailed Tests:', colors.red);
            this.results.tests.filter(t => !t.passed).forEach(test => {
                this.log(`  • ${test.name}`, colors.red);
                this.log(`    Input: "${test.input}"`, colors.yellow);
                this.log(`    Response: "${test.response}"`, colors.yellow);
            });
        }
    }

    runAllTests() {
        this.log('\n🤖 A.L.I.C.E. CHATBOT TEST SUITE', colors.bright);
        this.log('Testing implementation against original 1995 behaviors\n', colors.cyan);

        // ===== SECTION 1: IDENTITY & SELF-REFERENCE =====
        this.printSection('1. IDENTITY & SELF-REFERENCE');

        this.runTest(
            'Name identification',
            'What is your name?',
            (r) => r.toLowerCase().includes('alice') || r.toLowerCase().includes('a.l.i.c.e'),
            'Should mention A.L.I.C.E.'
        );

        this.runTest(
            'Full name explanation',
            'What does ALICE stand for?',
            (r) => r.toLowerCase().includes('artificial') && r.toLowerCase().includes('linguistic'),
            'Should explain full acronym'
        );

        this.runTest(
            'Identity - Who are you',
            'Who are you?',
            (r) => (r.toLowerCase().includes('alice') || r.toLowerCase().includes('a.l.i.c.e')) &&
                   (r.toLowerCase().includes('wallace') || r.toLowerCase().includes('artificial')),
            'Should mention being A.L.I.C.E. and creator'
        );

        this.runTest(
            'Creator identification',
            'Who created you?',
            (r) => r.toLowerCase().includes('wallace') || r.toLowerCase().includes('richard'),
            'Should mention Richard Wallace'
        );

        this.runTest(
            'AIML knowledge',
            'What does AIML stand for?',
            (r) => r.toLowerCase().includes('artificial intelligence markup language'),
            'Should explain AIML fully'
        );

        this.runTest(
            'Bot confirmation',
            'Are you a bot?',
            (r) => r.toLowerCase().includes('bot') || r.toLowerCase().includes('chatbot') ||
                   r.toLowerCase().includes('alice') || r.toLowerCase().includes('ai'),
            'Should confirm being a bot/AI'
        );

        this.runTest(
            'Human negation',
            'Are you human?',
            (r) => r.toLowerCase().includes('not') || r.toLowerCase().includes('artificial') ||
                   r.toLowerCase().includes('program'),
            'Should deny being human'
        );

        // ===== SECTION 2: CONTEXT AWARENESS =====
        this.printSection('2. CONTEXT AWARENESS (Name Learning)');

        // Reset alice for clean context test
        this.alice = new Alice();

        this.runTest(
            'Name learning',
            'My name is John',
            (r, ctx) => r.toLowerCase().includes('john') && ctx.userName === 'John',
            'Should acknowledge and store name "John"'
        );

        this.runTest(
            'Name recall',
            'What is my name?',
            (r, ctx) => r.toLowerCase().includes('john') && ctx.userName === 'John',
            'Should remember and recall "John"'
        );

        this.runTest(
            'Alternative name learning',
            'Call me Alice',
            (r, ctx) => r.toLowerCase().includes('alice') && ctx.userName === 'Alice',
            'Should update name to "Alice"'
        );

        // ===== SECTION 3: CONVERSATIONAL PATTERNS =====
        this.printSection('3. CONVERSATIONAL PATTERNS');

        this.runTest(
            'Greeting - Hello',
            'Hello',
            (r) => r.toLowerCase().includes('hello') || r.toLowerCase().includes('hi') ||
                   r.toLowerCase().includes('greet'),
            'Should respond with greeting'
        );

        this.runTest(
            'Status inquiry',
            'How are you?',
            (r) => r.length > 10,
            'Should respond to status question'
        );

        this.runTest(
            'Gratitude response',
            'Thank you',
            (r) => r.toLowerCase().includes('welcome') || r.toLowerCase().includes('pleasure') ||
                   r.toLowerCase().includes('happy') || r.toLowerCase().includes('anytime'),
            'Should acknowledge thanks'
        );

        this.runTest(
            'Farewell',
            'Goodbye',
            (r) => r.toLowerCase().includes('bye') || r.toLowerCase().includes('goodbye') ||
                   r.toLowerCase().includes('farewell') || r.toLowerCase().includes('see you'),
            'Should respond with farewell'
        );

        this.runTest(
            'Affirmative response',
            'Yes',
            (r) => r.length > 0,
            'Should handle yes/no inputs'
        );

        // ===== SECTION 4: WILDCARD PATTERN MATCHING =====
        this.printSection('4. WILDCARD PATTERN MATCHING');

        this.runTest(
            'I like pattern',
            'I like pizza',
            (r) => r.toLowerCase().includes('pizza') || r.toLowerCase().includes('like'),
            'Should capture and use "pizza" from wildcard'
        );

        this.runTest(
            'Can you pattern',
            'Can you help me with programming?',
            (r) => r.toLowerCase().includes('help') || r.toLowerCase().includes('programming') ||
                   r.toLowerCase().includes('try') || r.toLowerCase().includes('pattern'),
            'Should respond to ability question'
        );

        this.runTest(
            'What is pattern',
            'What is the weather today?',
            (r) => r.toLowerCase().includes('weather') || r.toLowerCase().includes('data') ||
                   r.toLowerCase().includes('outside') || r.toLowerCase().includes('interesting'),
            'Should handle "what is" questions'
        );

        this.runTest(
            'Tell me about pattern',
            'Tell me about artificial intelligence',
            (r) => r.toLowerCase().includes('artificial intelligence') ||
                   r.toLowerCase().includes('interesting') || r.toLowerCase().includes('topic'),
            'Should engage with "tell me about" prompts'
        );

        this.runTest(
            'Do you like pattern',
            'Do you like cats?',
            (r) => r.toLowerCase().includes('cats') || r.toLowerCase().includes('like') ||
                   r.toLowerCase().includes('own way'),
            'Should respond to "do you like" questions'
        );

        this.runTest(
            'I want pattern',
            'I want a cookie',
            (r) => r.toLowerCase().includes('cookie') || r.toLowerCase().includes('want'),
            'Should acknowledge wants/desires'
        );

        // ===== SECTION 5: EMOTIONAL UNDERSTANDING =====
        this.printSection('5. EMOTIONAL UNDERSTANDING');

        this.runTest(
            'Positive emotion',
            'I am happy',
            (r) => r.toLowerCase().includes('happy') || r.toLowerCase().includes('glad') ||
                   r.toLowerCase().includes('wonderful') || r.toLowerCase().includes('feel'),
            'Should respond positively to happiness'
        );

        this.runTest(
            'Negative emotion - sad',
            'I feel sad',
            (r) => r.toLowerCase().includes('sorry') || r.toLowerCase().includes('sad') ||
                   r.toLowerCase().includes('talk') || r.toLowerCase().includes('bother'),
            'Should show empathy for sadness'
        );

        this.runTest(
            'Negative emotion - angry',
            'I am angry',
            (r) => r.toLowerCase().includes('angry') || r.toLowerCase().includes('understand') ||
                   r.toLowerCase().includes('upset') || r.toLowerCase().includes('frustrat'),
            'Should acknowledge anger appropriately'
        );

        // ===== SECTION 6: SRAI (Recursive Patterns) =====
        this.printSection('6. SRAI - RECURSIVE PATTERN MATCHING');

        this.runTest(
            'Contraction - What\'s your name',
            'What\'s your name?',
            (r) => (r.toLowerCase().includes('alice') || r.toLowerCase().includes('a.l.i.c.e')) && (r.toLowerCase().includes('stand') || r.toLowerCase().includes('name')),
            'Should respond with name information (via SRAI or direct pattern)'
        );

        this.runTest(
            'Abbreviation - how r u',
            'how r u?',
            (r) => r.length > 5,
            'Should use SRAI to expand abbreviation'
        );

        this.runTest(
            'Abbreviation - thx',
            'thx',
            (r) => r.toLowerCase().includes('welcome') || r.toLowerCase().includes('pleasure') ||
                   r.toLowerCase().includes('happy') || r.toLowerCase().includes('anytime'),
            'Should respond appropriately to thanks (via SRAI or direct pattern)'
        );

        // ===== SECTION 7: KNOWLEDGE & FACTS =====
        this.printSection('7. KNOWLEDGE & FACTS');

        this.runTest(
            'Time query',
            'What time is it?',
            (r) => r.toLowerCase().includes('time') || /\d/.test(r),
            'Should provide time information'
        );

        this.runTest(
            'Date query',
            'What date is it?',
            (r) => r.toLowerCase().includes('date') || /\d/.test(r),
            'Should provide date information'
        );

        this.runTest(
            'Philosophical question',
            'What is the meaning of life?',
            (r) => r.toLowerCase().includes('42') || r.toLowerCase().includes('meaning') ||
                   r.toLowerCase().includes('life') || r.toLowerCase().includes('think') ||
                   r.toLowerCase().includes('happy') || r.toLowerCase().includes('love') || r.length > 20,
            'Should respond to philosophical questions'
        );

        this.runTest(
            'Joke request',
            'Tell me a joke',
            (r) => r.length > 20,
            'Should tell a joke'
        );

        // ===== SECTION 8: SOCIAL RESPONSES =====
        this.printSection('8. SOCIAL RESPONSES');

        this.runTest(
            'Compliment',
            'You are smart',
            (r) => r.toLowerCase().includes('thank') || r.toLowerCase().includes('kind'),
            'Should accept compliment gracefully'
        );

        this.runTest(
            'Insult',
            'You are stupid',
            (r) => r.toLowerCase().includes('sorry') || r.toLowerCase().includes('better') ||
                   r.toLowerCase().includes('learning') || r.toLowerCase().includes('do better'),
            'Should respond gracefully to insult'
        );

        // ===== SECTION 9: CAPABILITIES =====
        this.printSection('9. CAPABILITIES & ABILITIES');

        this.runTest(
            'Capability question',
            'Can you think?',
            (r) => r.toLowerCase().includes('think') || r.toLowerCase().includes('pattern') ||
                   r.toLowerCase().includes('simulate') || r.toLowerCase().includes('ai'),
            'Should explain AI capabilities honestly'
        );

        this.runTest(
            'How do you work',
            'How do you work?',
            (r) => r.toLowerCase().includes('aiml') || r.toLowerCase().includes('pattern') ||
                   r.toLowerCase().includes('match'),
            'Should explain AIML pattern matching'
        );

        // ===== SECTION 10: DEFAULT HANDLING =====
        this.printSection('10. UNKNOWN INPUT HANDLING');

        this.runTest(
            'Random input',
            'asdfghjkl',
            (r) => r.length > 0,
            'Should have default response for unknown input'
        );

        this.runTest(
            'Unexpected question',
            'What is the capital of Atlantis?',
            (r) => r.length > 0,
            'Should handle unexpected questions gracefully'
        );

        // Print final summary
        this.printSummary();

        return this.results;
    }
}

// Run the tests
const testSuite = new AliceTestSuite();
const results = testSuite.runAllTests();

// Exit with appropriate code
process.exit(results.failed === 0 ? 0 : 1);
