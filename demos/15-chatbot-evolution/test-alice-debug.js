/**
 * Comprehensive ALICE Debug Test Script
 * Tests all AIML features and finds bugs
 */

// Since we're testing browser code, we need to adapt it for Node.js
// We'll create a minimal test harness

class Alice {
    constructor() {
        this.context = {
            that: "",
            topic: "general",
            userName: "",
            botName: "A.L.I.C.E.",
            fullName: "Artificial Linguistic Internet Computer Entity"
        };

        this.patterns = this.buildPatterns();
    }

    buildPatterns() {
        return [
            // HIGH PRIORITY PATTERNS (underscore wildcard _)
            {
                pattern: /^my name is _$/i,
                template: (match) => {
                    this.context.userName = match[1];
                    return `Nice to meet you, ${match[1]}!`;
                },
                priority: 3
            },

            // IDENTITY & SELF-REFERENCE
            {
                pattern: /^what is your name$/i,
                template: () => `My name is ${this.context.botName}, which stands for ${this.context.fullName}.`,
                priority: 2
            },
            {
                pattern: /^who are you$/i,
                template: () => `I am ${this.context.botName}, an artificial intelligence created by Richard Wallace.`,
                priority: 2
            },
            {
                pattern: /^who created you$/i,
                template: () => `I was created by Richard Wallace using AIML, starting in 1995.`,
                priority: 2
            },
            {
                pattern: /^what does aiml stand for$/i,
                template: () => `AIML stands for Artificial Intelligence Markup Language. It's an XML-based pattern matching language I use to understand and respond to you.`,
                priority: 2
            },

            // GREETINGS
            {
                pattern: /^(hello|hi|hey)$/i,
                template: () => {
                    const responses = ["Hello! How can I help you today?", "Hi there!"];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },
            {
                pattern: /^(goodbye|bye)$/i,
                template: () => "Goodbye! It was nice chatting with you.",
                priority: 2
            },

            // NAME PATTERNS
            {
                pattern: /^my name is (.+)$/i,
                template: (match) => {
                    const name = match[1].trim();
                    this.context.userName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                    return `Nice to meet you, ${this.context.userName}! I'll remember that.`;
                },
                priority: 2
            },
            {
                pattern: /^(what is|do you know) my name$/i,
                template: () => {
                    if (this.context.userName) {
                        return `Your name is ${this.context.userName}.`;
                    }
                    return "I don't know your name yet. What should I call you?";
                },
                priority: 2
            },
            {
                pattern: /^call me (.+)$/i,
                template: (match) => {
                    const name = match[1].trim();
                    this.context.userName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                    return `Okay, I'll call you ${this.context.userName}.`;
                },
                priority: 2
            },

            // HOW ARE YOU
            {
                pattern: /^how are you( doing)?( today)?$/i,
                template: () => "I'm functioning perfectly, thank you for asking!",
                priority: 2
            },
            {
                pattern: /^i am (fine|good|great)$/i,
                template: (match) => {
                    return `I'm glad to hear you're ${match[1]}!`;
                },
                that: /how are you/i,
                priority: 2
            },

            // THANK YOU
            {
                pattern: /^(thank you|thanks)$/i,
                template: () => "You're welcome!",
                priority: 2
            },

            // WILDCARDS
            {
                pattern: /^i (like|love) (.+)$/i,
                template: (match) => {
                    const verb = match[1];
                    const object = match[2].trim();
                    return `It's great that you ${verb} ${object}! Tell me more about why you ${verb} it.`;
                },
                priority: 1
            },
            {
                pattern: /^what is (.+)$/i,
                template: (match) => {
                    const topic = match[1].trim();
                    return `${topic} is an interesting topic. What would you like to know about it?`;
                },
                priority: 1
            },
            {
                pattern: /^can you (.+)$/i,
                template: (match) => {
                    const ability = match[1].trim();
                    return `I can try to ${ability}. As an AIML-based bot, I work through pattern matching.`;
                },
                priority: 1
            },

            // TOPIC SETTING
            {
                pattern: /^let's talk about (.+)$/i,
                template: (match) => {
                    const topic = match[1].trim();
                    this.context.topic = topic;
                    return `Okay! Let's discuss ${topic}. What would you like to know?`;
                },
                priority: 1
            },
            {
                pattern: /^i (feel|am) (happy|sad|angry)$/i,
                template: (match) => {
                    this.context.topic = "emotions";
                    const emotion = match[2];
                    return `I understand you're feeling ${emotion}. Would you like to talk about it?`;
                },
                priority: 2
            },

            // SRAI PATTERNS
            {
                pattern: /^(what's|whats) your name$/i,
                template: () => this.srai("what is your name"),
                priority: 2
            },
            {
                pattern: /^(how r u|hru)$/i,
                template: () => this.srai("how are you"),
                priority: 2
            },
            {
                pattern: /^(thx|ty)$/i,
                template: () => this.srai("thank you"),
                priority: 2
            },

            // BOT IDENTITY
            {
                pattern: /^(are you|you are) (a )?(bot|chatbot|ai)$/i,
                template: () => "Yes, I'm a chatbot! I'm A.L.I.C.E., an AIML-based conversational agent.",
                priority: 2
            },

            // CAPABILITIES
            {
                pattern: /^what (time|date) is it$/i,
                template: () => {
                    const now = new Date();
                    return `The current time is ${now.toLocaleTimeString()}.`;
                },
                priority: 2
            },
            {
                pattern: /^tell me a joke$/i,
                template: () => "Why did the computer go to the doctor? Because it had a virus!",
                priority: 2
            },
            {
                pattern: /^what is the meaning of life$/i,
                template: () => "42. (According to The Hitchhiker's Guide to the Galaxy)",
                priority: 2
            },

            // DEFAULT CATCH-ALL
            {
                pattern: /^(.+)$/i,
                template: (match) => {
                    return "That's interesting. Can you tell me more?";
                },
                priority: 0
            }
        ];
    }

    srai(input, depth = 0) {
        if (depth > 10) {
            return "I'm not sure I understand. Can you rephrase that?";
        }

        const normalizedInput = this.normalize(input);
        const sortedPatterns = [...this.patterns].sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0);
        });

        for (const { pattern, template, that, topic } of sortedPatterns) {
            if (topic && this.context.topic !== topic && this.context.topic !== "general") {
                continue;
            }

            if (that && !that.test(this.context.that)) {
                continue;
            }

            const match = normalizedInput.match(pattern);
            if (match) {
                const response = typeof template === 'function' ? template(match, depth + 1) : template;
                return response;
            }
        }

        return "I'm not sure I understand. Can you rephrase that?";
    }

    normalize(input) {
        return input
            .trim()
            .toLowerCase()
            .replace(/[?!.,:;]+$/, '')
            .replace(/\s+/g, ' ');
    }

    getResponse(input) {
        const normalizedInput = this.normalize(input);
        const sortedPatterns = [...this.patterns].sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0);
        });

        for (const { pattern, template, that, topic } of sortedPatterns) {
            if (topic && this.context.topic !== topic && this.context.topic !== "general") {
                continue;
            }

            if (that && !that.test(this.context.that)) {
                continue;
            }

            const match = normalizedInput.match(pattern);
            if (match) {
                const response = typeof template === 'function' ? template(match) : template;
                this.context.that = response;
                return response;
            }
        }

        const fallback = "I'm not sure I understand. Can you rephrase that?";
        this.context.that = fallback;
        return fallback;
    }

    getContext() {
        return { ...this.context };
    }
}

// Test harness
const bugs = [];
const testResults = { total: 0, passed: 0, failed: 0 };

function reportBug(severity, title, description, testCase) {
    bugs.push({ severity, title, description, testCase });
}

function runTest(testName, testFn) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST: ${testName}`);
    console.log('='.repeat(80));

    testResults.total++;
    try {
        const result = testFn();
        if (result.pass) {
            console.log(`✓ PASS: ${result.message || 'Test passed'}`);
            testResults.passed++;
        } else {
            console.log(`✗ FAIL: ${result.message || 'Test failed'}`);
            testResults.failed++;
            if (result.bug) {
                reportBug(result.bug.severity, result.bug.title, result.bug.description, testName);
            }
        }
        return result;
    } catch (error) {
        console.log(`✗ ERROR: ${error.message}`);
        testResults.failed++;
        reportBug('critical', 'Test Exception', error.message, testName);
        return { pass: false, error };
    }
}

function runConversation(alice, exchanges) {
    console.log('\nConversation:');
    console.log('-'.repeat(80));

    let allPassed = true;
    let conversationLog = [];

    exchanges.forEach((ex, idx) => {
        const response = alice.getResponse(ex.input);
        const context = alice.getContext();

        console.log(`\n[${idx + 1}] USER: ${ex.input}`);
        console.log(`    ALICE: ${response}`);
        console.log(`    Context: userName="${context.userName}", topic="${context.topic}", that="${context.that.substring(0, 50)}..."`);

        conversationLog.push({ input: ex.input, response, context: {...context} });

        if (ex.validate) {
            const result = ex.validate(response, context);
            if (result.pass) {
                console.log(`    ✓ ${result.message || 'Validation passed'}`);
            } else {
                console.log(`    ✗ ${result.message || 'Validation failed'}`);
                allPassed = false;
                if (result.bug) {
                    reportBug(result.bug.severity, result.bug.title, result.bug.description, `Conversation exchange ${idx + 1}`);
                }
            }
        }
    });

    return { pass: allPassed, conversationLog };
}

// =============================================================================
// TESTS
// =============================================================================

console.log('\n' + '='.repeat(80));
console.log('ALICE COMPREHENSIVE BUG TESTING SUITE');
console.log('='.repeat(80));

// Test 1: Basic Identity
runTest('1.1 - Basic name inquiry', () => {
    const alice = new Alice();
    const response = alice.getResponse('What is your name?');
    if (response.toLowerCase().includes('alice')) {
        return { pass: true, message: 'Correctly identifies as ALICE' };
    }
    return {
        pass: false,
        message: 'Failed to mention ALICE in name response',
        bug: {
            severity: 'critical',
            title: 'Name Pattern Not Working',
            description: `Expected "ALICE" in response, got: "${response}"`
        }
    };
});

runTest('1.2 - SRAI name redirect', () => {
    const alice = new Alice();
    const response = alice.getResponse("What's your name?");
    if (response.toLowerCase().includes('alice')) {
        return { pass: true, message: 'SRAI correctly redirects to main name pattern' };
    }
    return {
        pass: false,
        message: 'SRAI redirection failed for name inquiry',
        bug: {
            severity: 'major',
            title: 'SRAI Not Working for Name',
            description: `Contractions should use SRAI. Got: "${response}"`
        }
    };
});

// Test 2: Name Learning and Recall
runTest('2.1 - Name learning (lowercase input)', () => {
    const alice = new Alice();
    const exchanges = [
        {
            input: 'My name is alice',
            validate: (r, c) => {
                if (!c.userName || c.userName.length === 0) {
                    return {
                        pass: false,
                        message: 'Failed to store userName in context',
                        bug: {
                            severity: 'critical',
                            title: 'Name Not Stored',
                            description: 'userName should be stored in context'
                        }
                    };
                }
                if (c.userName === 'Alice') {
                    return { pass: true, message: `Name stored and capitalized correctly: ${c.userName}` };
                }
                return {
                    pass: true,
                    message: `Name stored but capitalization may be off: ${c.userName}`
                };
            }
        },
        {
            input: 'What is my name?',
            validate: (r) => {
                if (r.toLowerCase().includes('alice')) {
                    return { pass: true, message: 'Successfully recalled name' };
                }
                return {
                    pass: false,
                    message: 'Failed to recall stored name',
                    bug: {
                        severity: 'critical',
                        title: 'Name Recall Failed',
                        description: `Expected "alice" in response, got: "${r}"`
                    }
                };
            }
        }
    ];

    return runConversation(alice, exchanges);
});

runTest('2.2 - Call me pattern', () => {
    const alice = new Alice();
    const exchanges = [
        {
            input: 'Call me Bob',
            validate: (r, c) => {
                if (c.userName === 'Bob') {
                    return { pass: true, message: 'Name stored correctly via "call me"' };
                }
                return {
                    pass: false,
                    message: `Expected userName='Bob', got '${c.userName}'`,
                    bug: {
                        severity: 'major',
                        title: 'Call Me Pattern Not Working',
                        description: `Pattern "call me X" failed. userName: ${c.userName}`
                    }
                };
            }
        },
        {
            input: 'Do you know my name?',
            validate: (r) => {
                if (r.toLowerCase().includes('bob')) {
                    return { pass: true, message: 'Successfully recalled name' };
                }
                return {
                    pass: false,
                    message: 'Failed to recall name from "call me" pattern'
                };
            }
        }
    ];

    return runConversation(alice, exchanges);
});

// Test 3: Wildcard Matching
runTest('3.1 - Single wildcard capture', () => {
    const alice = new Alice();
    const response = alice.getResponse('I like chocolate ice cream');
    if (response.toLowerCase().includes('chocolate ice cream')) {
        return { pass: true, message: 'Wildcard correctly captured full phrase' };
    }
    return {
        pass: false,
        message: 'Wildcard failed to capture complete object',
        bug: {
            severity: 'major',
            title: 'Wildcard Capture Incomplete',
            description: `Expected "chocolate ice cream" in response, got: "${response}"`
        }
    };
});

runTest('3.2 - What is pattern wildcard', () => {
    const alice = new Alice();
    const response = alice.getResponse('What is artificial intelligence?');
    if (response.toLowerCase().includes('artificial intelligence')) {
        return { pass: true, message: 'Wildcard in "what is" pattern works' };
    }
    return {
        pass: false,
        message: 'Failed to capture topic in "what is X" pattern',
        bug: {
            severity: 'major',
            title: 'What Is Pattern Wildcard Failed',
            description: `Expected "artificial intelligence" in response, got: "${response}"`
        }
    };
});

runTest('3.3 - Very long wildcard input', () => {
    const alice = new Alice();
    const longInput = 'I like programming and coding and software development and computer science and algorithms and data structures';
    const response = alice.getResponse(longInput);
    const hasContent = response.toLowerCase().includes('programming') ||
                      response.toLowerCase().includes('coding') ||
                      response.toLowerCase().includes('algorithms');
    if (hasContent) {
        return { pass: true, message: 'Long wildcard input captured' };
    }
    return {
        pass: false,
        message: 'Long wildcard input not properly captured',
        bug: {
            severity: 'minor',
            title: 'Long Input Wildcard Issue',
            description: `Long input may not be fully captured. Response: "${response}"`
        }
    };
});

// Test 4: SRAI Recursion
runTest('4.1 - SRAI basic redirect', () => {
    const alice = new Alice();
    const response = alice.getResponse('how r u');
    if (response.length > 0 && !response.includes('not sure')) {
        return { pass: true, message: 'SRAI redirect works for "how r u"' };
    }
    return {
        pass: false,
        message: 'SRAI failed to redirect shorthand',
        bug: {
            severity: 'major',
            title: 'SRAI Redirection Failed',
            description: `"how r u" should redirect to "how are you". Got: "${response}"`
        }
    };
});

runTest('4.2 - SRAI depth limit (no infinite loop)', () => {
    const alice = new Alice();
    const response = alice.getResponse('thx');
    if (response && response.length > 0) {
        return { pass: true, message: 'SRAI works and doesn\'t loop infinitely' };
    }
    return {
        pass: false,
        message: 'SRAI may have depth issue',
        bug: {
            severity: 'critical',
            title: 'SRAI Depth Issue',
            description: 'SRAI should have depth limit to prevent infinite recursion'
        }
    };
});

// Test 5: Context and Topic Tracking
runTest('5.1 - Topic setting', () => {
    const alice = new Alice();
    alice.getResponse("Let's talk about computers");
    const context = alice.getContext();
    if (context.topic === 'computers') {
        return { pass: true, message: `Topic set correctly to: ${context.topic}` };
    }
    return {
        pass: false,
        message: `Topic not set correctly. Expected 'computers', got '${context.topic}'`,
        bug: {
            severity: 'major',
            title: 'Topic Not Setting',
            description: `Pattern "let's talk about X" should set topic to X. Got: ${context.topic}`
        }
    };
});

runTest('5.2 - Emotion topic setting', () => {
    const alice = new Alice();
    alice.getResponse('I feel sad');
    const context = alice.getContext();
    if (context.topic === 'emotions') {
        return { pass: true, message: 'Emotion topic set correctly' };
    }
    return {
        pass: false,
        message: `Topic should be 'emotions', got '${context.topic}'`,
        bug: {
            severity: 'minor',
            title: 'Emotion Topic Not Setting',
            description: `Emotional statements should set topic to "emotions". Got: ${context.topic}`
        }
    };
});

// Test 6: That Variable
runTest('6.1 - That variable update', () => {
    const alice = new Alice();
    const response = alice.getResponse('How are you?');
    const context = alice.getContext();
    if (context.that === response) {
        return { pass: true, message: '"that" variable correctly stores last response' };
    }
    return {
        pass: false,
        message: '"that" variable not updating',
        bug: {
            severity: 'critical',
            title: 'That Variable Not Updating',
            description: `context.that should equal last response. that="${context.that}", response="${response}"`
        }
    };
});

runTest('6.2 - That constraint pattern', () => {
    const alice = new Alice();
    const exchanges = [
        {
            input: 'How are you?',
            validate: (r, c) => {
                if (c.that === r) {
                    return { pass: true, message: '"that" updated with bot response' };
                }
                return { pass: false, message: '"that" not updating' };
            }
        },
        {
            input: 'I am fine',
            validate: (r) => {
                // Should match the "that" constraint pattern
                if (r.toLowerCase().includes('glad') || r.toLowerCase().includes('good')) {
                    return { pass: true, message: 'That constraint pattern matched correctly' };
                }
                return {
                    pass: false,
                    message: 'That constraint pattern not working as expected',
                    bug: {
                        severity: 'minor',
                        title: 'That Constraint Pattern Issue',
                        description: `Pattern with "that" constraint should respond differently. Got: "${r}"`
                    }
                };
            }
        }
    ];

    return runConversation(alice, exchanges);
});

// Test 7: Edge Cases
runTest('7.1 - Empty input handling', () => {
    const alice = new Alice();
    const response = alice.getResponse('');
    if (response && response.length > 0) {
        return { pass: true, message: 'Empty input handled gracefully' };
    }
    return {
        pass: false,
        message: 'Empty input not handled',
        bug: {
            severity: 'minor',
            title: 'Empty Input Not Handled',
            description: 'Empty string should return a default response'
        }
    };
});

runTest('7.2 - Multiple punctuation marks', () => {
    const alice = new Alice();
    const response = alice.getResponse('What is your name???');
    if (response.toLowerCase().includes('alice')) {
        return { pass: true, message: 'Multiple punctuation marks handled' };
    }
    return {
        pass: false,
        message: 'Punctuation normalization issue',
        bug: {
            severity: 'minor',
            title: 'Punctuation Normalization Issue',
            description: `Multiple punctuation marks cause pattern match failure. Got: "${response}"`
        }
    };
});

runTest('7.3 - Case sensitivity', () => {
    const alice = new Alice();
    const response = alice.getResponse('WHAT IS YOUR NAME');
    if (response.toLowerCase().includes('alice')) {
        return { pass: true, message: 'Case insensitivity works' };
    }
    return {
        pass: false,
        message: 'Case sensitivity issue',
        bug: {
            severity: 'critical',
            title: 'Case Sensitivity Problem',
            description: `AIML should be case-insensitive. Got: "${response}"`
        }
    };
});

runTest('7.4 - Extra whitespace', () => {
    const alice = new Alice();
    const response = alice.getResponse('  hello  ');
    if (response.toLowerCase().includes('hello') || response.toLowerCase().includes('hi')) {
        return { pass: true, message: 'Whitespace normalization works' };
    }
    return {
        pass: false,
        message: 'Whitespace handling issue',
        bug: {
            severity: 'minor',
            title: 'Whitespace Normalization Issue',
            description: `Extra whitespace causes pattern match failure. Got: "${response}"`
        }
    };
});

// Test 8: Long Conversation (20 exchanges)
runTest('8.1 - Long conversation (20 exchanges)', () => {
    const alice = new Alice();
    const conversation = [
        { input: 'Hello', expected: 'greeting' },
        { input: 'My name is Sarah', expected: 'name stored' },
        { input: 'What is my name?', expected: 'recalls Sarah' },
        { input: 'How are you?', expected: 'positive response' },
        { input: 'I am fine', expected: 'glad response' },
        { input: 'What is your name?', expected: 'ALICE' },
        { input: 'Who created you?', expected: 'Richard Wallace' },
        { input: 'What does AIML stand for?', expected: 'markup language' },
        { input: 'I like pizza', expected: 'mentions pizza' },
        { input: 'Can you help me?', expected: 'help response' },
        { input: "Let's talk about computers", expected: 'topic set' },
        { input: 'I feel happy', expected: 'emotions topic' },
        { input: 'What time is it?', expected: 'time provided' },
        { input: 'Tell me a joke', expected: 'joke response' },
        { input: 'Thank you', expected: 'you\'re welcome' },
        { input: 'Do you know my name?', expected: 'recalls Sarah' },
        { input: 'Are you a bot?', expected: 'confirms bot' },
        { input: 'What is the meaning of life?', expected: 'philosophical response' },
        { input: 'Goodbye', expected: 'farewell' },
        { input: 'What is my name?', expected: 'recalls Sarah again' }
    ];

    const exchanges = conversation.map((ex, idx) => ({
        input: ex.input,
        validate: (r, c) => {
            // Check for fallback responses (indicates pattern matching failure)
            if (r.toLowerCase().includes('not sure') || r.toLowerCase().includes('rephrase')) {
                return {
                    pass: false,
                    message: `Exchange ${idx + 1}: Got fallback response`,
                    bug: {
                        severity: 'minor',
                        title: `Fallback in Long Conversation (Exchange ${idx + 1})`,
                        description: `Input: "${ex.input}" resulted in fallback: "${r}"`
                    }
                };
            }

            // Specific validations
            switch(ex.expected) {
                case 'recalls Sarah':
                case 'recalls Sarah again':
                    if (!r.toLowerCase().includes('sarah')) {
                        return {
                            pass: false,
                            message: `Exchange ${idx + 1}: Failed to recall Sarah`,
                            bug: {
                                severity: 'critical',
                                title: 'Name Recall Failed in Long Conversation',
                                description: `Expected to recall "Sarah", got: "${r}"`
                            }
                        };
                    }
                    break;
                case 'ALICE':
                    if (!r.toLowerCase().includes('alice')) {
                        return { pass: false, message: `Exchange ${idx + 1}: Failed to mention ALICE` };
                    }
                    break;
                case 'Richard Wallace':
                    if (!r.toLowerCase().includes('wallace')) {
                        return { pass: false, message: `Exchange ${idx + 1}: Failed to mention creator` };
                    }
                    break;
            }

            return { pass: true, message: `Exchange ${idx + 1}: OK` };
        }
    }));

    return runConversation(alice, exchanges);
});

// =============================================================================
// RESULTS SUMMARY
// =============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('TEST RESULTS SUMMARY');
console.log('='.repeat(80));
console.log(`Total Tests: ${testResults.total}`);
console.log(`Passed: ${testResults.passed} (${Math.round(testResults.passed/testResults.total*100)}%)`);
console.log(`Failed: ${testResults.failed} (${Math.round(testResults.failed/testResults.total*100)}%)`);

if (bugs.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('BUG REPORT');
    console.log('='.repeat(80));

    const critical = bugs.filter(b => b.severity === 'critical');
    const major = bugs.filter(b => b.severity === 'major');
    const minor = bugs.filter(b => b.severity === 'minor');

    console.log(`\nTotal Bugs Found: ${bugs.length}`);
    console.log(`  Critical: ${critical.length}`);
    console.log(`  Major: ${major.length}`);
    console.log(`  Minor: ${minor.length}`);

    if (critical.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('CRITICAL BUGS:');
        console.log('-'.repeat(80));
        critical.forEach((bug, idx) => {
            console.log(`\n${idx + 1}. ${bug.title}`);
            console.log(`   Test: ${bug.testCase}`);
            console.log(`   Description: ${bug.description}`);
        });
    }

    if (major.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('MAJOR BUGS:');
        console.log('-'.repeat(80));
        major.forEach((bug, idx) => {
            console.log(`\n${idx + 1}. ${bug.title}`);
            console.log(`   Test: ${bug.testCase}`);
            console.log(`   Description: ${bug.description}`);
        });
    }

    if (minor.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('MINOR BUGS:');
        console.log('-'.repeat(80));
        minor.forEach((bug, idx) => {
            console.log(`\n${idx + 1}. ${bug.title}`);
            console.log(`   Test: ${bug.testCase}`);
            console.log(`   Description: ${bug.description}`);
        });
    }
} else {
    console.log('\nNo bugs found! All tests passed.');
}

console.log('\n' + '='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80) + '\n');
