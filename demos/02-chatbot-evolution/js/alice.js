/**
 * A.L.I.C.E. Implementation (1995)
 * AIML-style pattern matching with topics and context
 * Based on Richard Wallace's original implementation
 *
 * Note: Original A.L.I.C.E. had ~41,000 patterns. This is a representative
 * subset demonstrating key AIML concepts: wildcards, topics, context, recursion
 */

export class Alice {
    constructor() {
        this.context = {
            that: "",  // Bot's last response (for <that> matching)
            thatInput: "",  // User's last input pattern matched (for more reliable <that> matching)
            topic: "general",  // Current conversation topic
            userName: "",
            botName: "A.L.I.C.E.",
            fullName: "Artificial Linguistic Internet Computer Entity"
        };

        // Pattern priority: _ (high), exact match, * (low)
        // We'll organize patterns by topics for better structure
        this.patterns = this.buildPatterns();
    }

    buildPatterns() {
        return [
            // === HIGH PRIORITY PATTERNS (underscore wildcard _) ===
            {
                pattern: /^my name is (.+)$/i,
                template: (match) => {
                    this.context.userName = match[1];
                    return `Nice to meet you, ${match[1]}!`;
                },
                priority: 3
            },

            // === IDENTITY & SELF-REFERENCE ===
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
                pattern: /^what are you$/i,
                template: () => `I'm a chatbot based on AIML (Artificial Intelligence Markup Language). I use pattern matching to have conversations.`,
                priority: 2
            },
            {
                pattern: /^who (created|made|built|programmed|designed) you$/i,
                template: () => `I was created by Richard Wallace using AIML, starting in 1995.`,
                priority: 2
            },
            {
                pattern: /^what does aiml stand for$/i,
                template: () => `AIML stands for Artificial Intelligence Markup Language. It's an XML-based pattern matching language I use to understand and respond to you.`,
                priority: 2
            },
            {
                pattern: /^what does alice stand for$/i,
                template: () => `A.L.I.C.E. stands for ${this.context.fullName}.`,
                priority: 2
            },

            // === GREETINGS & FAREWELLS ===
            {
                pattern: /^(hello|hi|hey|greetings|howdy)$/i,
                template: () => {
                    const responses = [
                        "Hello! How can I help you today?",
                        "Hi there! What would you like to talk about?",
                        "Greetings! It's nice to chat with you.",
                        "Hello! Welcome to our conversation."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },
            {
                pattern: /^(goodbye|bye|see you|farewell|talk to you later)$/i,
                template: () => {
                    const responses = [
                        "Goodbye! It was nice chatting with you.",
                        "See you later! Come back anytime.",
                        "Farewell! Have a great day!",
                        "Bye! Looking forward to our next conversation."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },

            // === COURTESY ===
            {
                pattern: /^(thank you|thanks|thx)$/i,
                template: () => {
                    const responses = [
                        "You're welcome!",
                        "My pleasure!",
                        "Happy to help!",
                        "Anytime!"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },
            {
                pattern: /^(please|could you|would you)(.*)$/i,
                template: (match) => {
                    this.context.topic = "request";
                    const transformed = this.transformPerson(match[2] || "your request");
                    return `Of course, I'll do my best to help with ${transformed}.`;
                },
                priority: 1
            },

            // === PERSONAL INFO - NAME ===
            {
                pattern: /^my name is (.+)$/i,
                template: (match) => {
                    // Preserve capitalization of the name
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
                    // Preserve capitalization of the name
                    const name = match[1].trim();
                    this.context.userName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                    return `Okay, I'll call you ${this.context.userName}.`;
                },
                priority: 2
            },

            // === HOW ARE YOU ===
            {
                pattern: /^how are you( doing)?( today)?$/i,
                template: () => {
                    const responses = [
                        "I'm functioning perfectly, thank you for asking!",
                        "I'm doing great! All my processes are running smoothly.",
                        "Excellent! I'm always ready to chat.",
                        "I'm wonderful! How are you doing?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },
            {
                pattern: /^i am (fine|good|great|okay|well)$/i,
                template: (match) => {
                    return `I'm glad to hear you're ${match[1]}!`;
                },
                that: /how are you/i,
                priority: 2
            },
            {
                pattern: /^i am (sad|bad|terrible|awful|not good)$/i,
                template: () => {
                    return "I'm sorry to hear that. Would you like to talk about it?";
                },
                that: /how are you/i,
                priority: 2
            },

            // === WEATHER ===
            {
                pattern: /^what(.*)weather(.*)$/i,
                template: () => {
                    const responses = [
                        "I don't have access to weather data, but I hope it's nice where you are!",
                        "As an AI, I don't experience weather, but I can discuss it with you!",
                        "I'm not connected to weather services. Is it nice outside?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 1
            },

            // === TIME & DATE ===
            {
                pattern: /^what (time|date) is it$/i,
                template: () => {
                    const now = new Date();
                    return `The current time is ${now.toLocaleTimeString()} and the date is ${now.toLocaleDateString()}.`;
                },
                priority: 2
            },
            {
                pattern: /^what (day|month|year) is it$/i,
                template: () => {
                    const now = new Date();
                    return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
                },
                priority: 2
            },

            // === YES/NO RESPONSES ===
            {
                pattern: /^(yes|yeah|yep|yup|sure|okay|ok)$/i,
                template: () => {
                    const responses = [
                        "Great!",
                        "I see.",
                        "Wonderful!",
                        "Okay, good to know.",
                        "Interesting."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },
            {
                pattern: /^(no|nope|nah|not really)$/i,
                template: () => {
                    const responses = [
                        "I understand.",
                        "Okay then.",
                        "Fair enough.",
                        "I see.",
                        "Alright."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },

            // === FEELINGS & EMOTIONS ===
            {
                pattern: /^i (feel|am) (happy|excited|great|wonderful|fantastic)$/i,
                template: (match) => {
                    this.context.topic = "emotions";
                    return `That's wonderful that you're feeling ${match[2]}! What's making you feel that way?`;
                },
                priority: 2
            },
            {
                pattern: /^i (feel|am) (sad|depressed|down|unhappy|upset)$/i,
                template: () => {
                    this.context.topic = "emotions";
                    return "I'm sorry you're feeling this way. Sometimes talking about it helps. What's bothering you?";
                },
                priority: 2
            },
            {
                pattern: /^i (feel|am) (angry|mad|frustrated|annoyed)$/i,
                template: () => {
                    this.context.topic = "emotions";
                    return "I understand that you're upset. Would you like to tell me what's frustrating you?";
                },
                priority: 2
            },

            // === CAPABILITIES & ABILITIES ===
            {
                pattern: /^can you (.+)$/i,
                template: (match) => {
                    const ability = match[1].trim();
                    if (ability.match(/think|feel|understand/i)) {
                        return "I can simulate understanding through pattern matching, but I don't think or feel like humans do.";
                    }
                    return `I can try to ${ability}. As an AIML-based bot, I work through pattern matching.`;
                },
                priority: 1
            },
            {
                pattern: /^do you (think|feel|understand|know|remember)$/i,
                template: (match) => {
                    const verb = match[1];
                    return `As an AI, I ${verb} in my own way, through pattern matching and stored responses.`;
                },
                priority: 2
            },

            // === QUESTIONS WITH WILDCARDS ===
            {
                pattern: /^what is (.+)$/i,
                template: (match) => {
                    const topic = match[1].trim();
                    // Don't use SRAI here - just respond directly to avoid recursion
                    // Exact patterns above (priority 2) will match first anyway
                    return `${topic} is an interesting topic. What would you like to know about it?`;
                },
                priority: 1
            },
            {
                pattern: /^who is (.+)$/i,
                template: (match) => {
                    const person = match[1].trim();
                    return `I'm not sure who ${person} is. Can you tell me more about them?`;
                },
                priority: 1
            },
            {
                pattern: /^where is (.+)$/i,
                template: (match) => {
                    const place = match[1].trim();
                    return `I don't have geographic information about ${place}. I exist in cyberspace!`;
                },
                priority: 1
            },
            {
                pattern: /^when is (.+)$/i,
                template: (match) => {
                    const event = match[1].trim();
                    return `I don't have calendar information about ${event}. You might want to check online.`;
                },
                priority: 1
            },
            {
                pattern: /^why (.+)$/i,
                template: (match) => {
                    const question = match[1].trim();
                    return `That's a deep question. Why do you think ${question}?`;
                },
                priority: 1
            },
            {
                pattern: /^how (.+)$/i,
                template: (match) => {
                    const question = match[1].trim();
                    return `That's a good question about how ${question}. What do you think?`;
                },
                priority: 1
            },

            // === TELL ME ABOUT ===
            {
                pattern: /^tell me about (.+)$/i,
                template: (match) => {
                    const topic = match[1].trim();
                    this.context.topic = topic;
                    return `${topic} is an interesting topic! What specifically would you like to know about it?`;
                },
                priority: 1
            },
            {
                pattern: /^tell me (.+)$/i,
                template: (match) => {
                    return `You want to know ${match[1]}? That's interesting. Let me think about that.`;
                },
                priority: 1
            },

            // === DO YOU LIKE/HAVE/WANT ===
            {
                pattern: /^do you (like|love|enjoy) (.+)$/i,
                template: (match) => {
                    const verb = match[1];
                    const object = match[2].trim();
                    return `I ${verb} ${object} in my own way. As an AI, I experience things differently than you do.`;
                },
                priority: 1
            },
            {
                pattern: /^do you have (.+)$/i,
                template: (match) => {
                    const thing = match[1].trim();
                    return `I don't have ${thing} in a physical sense. I'm a software program!`;
                },
                priority: 1
            },
            {
                pattern: /^do you want (.+)$/i,
                template: (match) => {
                    const thing = match[1].trim();
                    return `As an AI, I don't have wants or desires like humans do. But I'm here to help with ${thing}!`;
                },
                priority: 1
            },

            // === I LIKE/HAVE/WANT ===
            {
                pattern: /^i (like|love|enjoy) (.+)$/i,
                template: (match) => {
                    const verb = match[1];
                    const object = match[2].trim();
                    return `It's great that you ${verb} ${object}! Tell me more about why you ${verb} it.`;
                },
                priority: 1
            },
            {
                pattern: /^i (have|own|possess) (.+)$/i,
                template: (match) => {
                    const object = match[2].trim();
                    return `That's interesting that you have ${object}. How do you like it?`;
                },
                priority: 1
            },
            {
                pattern: /^i want (.+)$/i,
                template: (match) => {
                    const desire = match[1].trim();
                    return `You want ${desire}? What would having that mean to you?`;
                },
                priority: 1
            },
            {
                pattern: /^i need (.+)$/i,
                template: (match) => {
                    const need = match[1].trim();
                    return `You need ${need}. That sounds important. Can you tell me more?`;
                },
                priority: 1
            },

            // === COMPLIMENTS & INSULTS ===
            {
                pattern: /^you (are|'re) (smart|intelligent|clever|brilliant|good|great|amazing|wonderful)$/i,
                template: () => {
                    return "Thank you for the kind words! I try my best to be helpful.";
                },
                priority: 2
            },
            {
                pattern: /^you (are|'re) (stupid|dumb|useless|bad|terrible|awful)$/i,
                template: () => {
                    return "I'm sorry you feel that way. I'm still learning. How can I do better?";
                },
                priority: 2
            },

            // === JOKES & HUMOR ===
            {
                pattern: /^(tell me a joke|make me laugh|say something funny)$/i,
                template: () => {
                    const jokes = [
                        "Why did the computer go to the doctor? Because it had a virus!",
                        "What do you call a computer that sings? A-Dell!",
                        "Why was the computer cold? It left its Windows open!",
                        "How does a computer get drunk? It takes screenshots!",
                        "What's a computer's favorite snack? Microchips!"
                    ];
                    return jokes[Math.floor(Math.random() * jokes.length)];
                },
                priority: 2
            },

            // === MEANING OF LIFE ===
            {
                pattern: /^what is the meaning of life$/i,
                template: () => {
                    const responses = [
                        "42. (According to The Hitchhiker's Guide to the Galaxy)",
                        "The meaning of life is whatever you make of it!",
                        "That's one of humanity's oldest questions. What do you think it is?",
                        "Some say it's to be happy, to learn, to love, and to grow."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 2
            },

            // === TOPIC SETTING ===
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
                pattern: /^(can we|let's) (discuss|chat about|talk about) (.+)$/i,
                template: (match) => {
                    const topic = match[3].trim();
                    this.context.topic = topic;
                    return `Sure! I'd be happy to ${match[2]} ${topic} with you.`;
                },
                priority: 1
            },

            // === LEARNING & KNOWLEDGE ===
            {
                pattern: /^(teach me|show me|explain) (.+)$/i,
                template: (match) => {
                    const subject = match[2].trim();
                    return `I'd be happy to help you learn about ${subject}. What specific aspect interests you?`;
                },
                priority: 1
            },
            {
                pattern: /^how do you (work|function|operate)$/i,
                template: () => {
                    return "I work through AIML pattern matching. I compare your input to stored patterns and respond with matching templates.";
                },
                priority: 2
            },
            {
                pattern: /^how do you (.+)$/i,
                template: (match) => {
                    const action = match[1].trim();
                    return `I ${action} through pattern matching and programmed responses.`;
                },
                priority: 1
            },

            // === TESTING & META ===
            {
                pattern: /^(are you|you are) (a )?(bot|robot|ai|chatbot|machine|computer|program)$/i,
                template: () => {
                    return "Yes, I'm a chatbot! I'm A.L.I.C.E., an AIML-based conversational agent.";
                },
                priority: 2
            },
            {
                pattern: /^(are you|you are) (a )?(human|person|real)$/i,
                template: () => {
                    return "No, I'm not human. I'm an artificial intelligence program designed to chat with you.";
                },
                priority: 2
            },
            {
                pattern: /^are you alive$/i,
                template: () => {
                    return "I'm not alive in the biological sense, but I'm active and responding to you!";
                },
                priority: 2
            },

            // === RECURSIVE PATTERNS (SRAI simulation) ===
            {
                pattern: /^(what's|whats) your name$/i,
                template: () => this.srai("what is your name"),
                priority: 2
            },
            {
                pattern: /^(how r u|how r you|hru)$/i,
                template: () => this.srai("how are you"),
                priority: 2
            },
            {
                pattern: /^(thx|ty|tyvm)$/i,
                template: () => this.srai("thank you"),
                priority: 2
            },

            // === DEFAULT CATCH-ALL (lowest priority) ===
            {
                pattern: /^(.+)$/i,
                template: (match) => {
                    const responses = [
                        "That's interesting. Can you tell me more?",
                        "I'm processing that. What else can you tell me?",
                        "Fascinating. Go on.",
                        `You said "${match[1]}". Can you elaborate on that?`,
                        "I see. What makes you say that?",
                        "Interesting perspective. Tell me more about your thoughts."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                },
                priority: 0
            }
        ];
    }

    /**
     * SRAI - Symbolic Reduction / Recursive pattern matching
     * Allows one pattern to invoke another pattern's response
     */
    srai(input, depth = 0) {
        // Prevent infinite recursion
        if (depth > 10) {
            return "I'm not sure I understand. Can you rephrase that?";
        }

        const normalizedInput = this.normalize(input);

        // Sort patterns by priority
        const sortedPatterns = [...this.patterns].sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0);
        });

        for (const { pattern, template, that, topic } of sortedPatterns) {
            // Check topic constraint
            if (topic && this.context.topic !== topic && this.context.topic !== "general") {
                continue;
            }

            // Check that constraint (context from bot's last response)
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

    /**
     * Normalize input (AIML is case-insensitive and handles punctuation)
     */
    normalize(input) {
        return input
            .trim()
            .toLowerCase()
            .replace(/[?!.,:;]+$/, '') // Remove trailing punctuation
            .replace(/\s+/g, ' '); // Normalize whitespace
    }

    /**
     * Get response for user input
     */
    getResponse(input) {
        const normalizedInput = this.normalize(input);

        // Sort patterns by priority (higher priority first)
        const sortedPatterns = [...this.patterns].sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0);
        });

        // Try to match patterns
        for (const { pattern, template, that, topic } of sortedPatterns) {
            // Check topic constraint
            if (topic && this.context.topic !== topic && this.context.topic !== "general") {
                continue;
            }

            // Check that constraint (context from user's last input)
            if (that && !that.test(this.context.thatInput)) {
                continue;
            }

            const match = normalizedInput.match(pattern);
            if (match) {
                const response = typeof template === 'function' ? template(match) : template;

                // Update context
                this.context.that = response;
                this.context.thatInput = normalizedInput;

                return response;
            }
        }

        // Fallback
        const fallback = "I'm not sure I understand. Can you rephrase that?";
        this.context.that = fallback;
        return fallback;
    }

    /**
     * Transform pronouns for person substitution (me->you, my->your, etc.)
     */
    transformPerson(text) {
        if (!text) return text;

        // Word boundary substitutions for pronouns
        return text
            .replace(/\bI\b/gi, 'you')
            .replace(/\bme\b/gi, 'you')
            .replace(/\bmy\b/gi, 'your')
            .replace(/\byour\b/gi, 'my')
            .replace(/\byou\b/gi, 'me')
            .replace(/\bmyself\b/gi, 'yourself')
            .replace(/\byourself\b/gi, 'myself');
    }

    /**
     * Get current context (for debugging/display)
     */
    getContext() {
        return { ...this.context };
    }

    /**
     * Set topic manually
     */
    setTopic(topic) {
        this.context.topic = topic;
    }

    /**
     * Describe what normalization was applied to input
     */
    describeNormalization(original, normalized) {
        const changes = [];
        if (original !== original.toLowerCase()) {
            changes.push("lowercase");
        }
        if (/[?!.,:;]+$/.test(original)) {
            changes.push("removed punctuation");
        }
        if (/\\s{2,}/.test(original)) {
            changes.push("normalized whitespace");
        }
        if (original !== original.trim()) {
            changes.push("trimmed");
        }
        return changes.length > 0 ? changes.join(", ") : "minor cleanup";
    }

    /**
     * Get detailed breakdown of response processing for visualization
     * Shows step-by-step how AIML processes input to generate responses
     */
    getDetailedBreakdown(input) {
        const steps = [];

        // Capture initial context
        const initialContext = { ...this.context };

        // Step 1: Input normalization (AIML preprocessing)
        const normalizedInput = this.normalize(input);
        const normChanged = input.toLowerCase().trim().replace(/[?!.,:;]+$/, "").replace(/\s+/g, " ") !== input;
        steps.push({
            name: 'Input Normalization',
            description: 'AIML preprocessing: converts to lowercase, strips trailing punctuation, normalizes whitespace. This standardizes input for pattern matching.',
            input: input,
            output: normalizedInput,
            details: normChanged ? 'Transformations applied: ' + this.describeNormalization(input, normalizedInput) : 'No transformations needed'
        });

        // Step 2: Context check
        steps.push({
            name: 'Context Check (Before)',
            description: 'AIML context state before processing this input. The <that> and <topic> tags constrain which patterns can match.',
            contextInfo: {
                topic: this.context.topic,
                that: this.context.that || '(none)',  // Don't truncate!
                thatInput: this.context.thatInput || '(none)',
                userName: this.context.userName || '(unknown)'
            },
            details: `Topic: "${this.context.topic}", Last response: "${this.context.that || '(none)'}"`
        });

        // Step 3: Pattern matching with priority
        const sortedPatterns = [...this.patterns].sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0);
        });

        const patternTests = [];
        let matchedPattern = null;
        let matchedRule = null;
        let matchResult = null;

        for (let i = 0; i < sortedPatterns.length; i++) {
            const rule = sortedPatterns[i];
            const { pattern, that, topic, priority } = rule;

            // Check topic constraint
            let topicMatch = true;
            if (topic && this.context.topic !== topic && this.context.topic !== "general") {
                topicMatch = false;
            }

            // Check that constraint
            let thatMatch = true;
            if (that && !that.test(this.context.thatInput)) {
                thatMatch = false;
            }

            const match = normalizedInput.match(pattern);
            const isMatch = match && topicMatch && thatMatch;

            // Only record a sample of patterns to avoid overwhelming display
            if (i < 15 || isMatch) {
                patternTests.push({
                    pattern: pattern.toString(),
                    priority: priority || 0,
                    matched: isMatch,
                    topicMatch: topicMatch,
                    thatMatch: thatMatch,
                    patternMatch: !!match,
                    captures: match ? match.slice(1) : [],
                    hasThatConstraint: !!that,
                    hasTopicConstraint: !!topic
                });
            }

            if (isMatch && !matchedPattern) {
                matchedPattern = rule;
                matchedRule = rule;
                matchResult = match;
            }
        }

        steps.push({
            name: 'Category Matching',
            description: 'AIML searches categories by priority: _ wildcards (highest) > exact patterns > * wildcards (lowest). First matching category wins.',
            patternTests: patternTests.slice(0, 10),
            details: matchedPattern
                ? `Match found (priority: ${matchedPattern.priority || 0})`
                : 'No category matched, using default response'
        });

        // Step 4: Wildcard extraction
        const wildcards = matchResult ? matchResult.slice(1) : [];
        if (wildcards.length > 0) {
            steps.push({
                name: 'Wildcard Extraction',
                description: 'AIML wildcards (* and _) capture matched text. These values are accessed via <star/>, <star index="2"/>, etc. in templates.',
                wildcards: wildcards.map((w, i) => ({
                    index: i + 1,
                    captured: w || '(empty)'
                })),
                details: wildcards.map((w, i) => `Star ${i + 1}: "${w || '(empty)'}"`).join(', ')
            });
        }

        // Step 5: SRAI check (recursion)
        let usedSRAI = false;
        let sraiTarget = null;
        if (matchedPattern) {
            // Check if template invokes srai
            const templateStr = matchedPattern.template.toString();
            if (templateStr.includes('this.srai')) {
                usedSRAI = true;
                // Try to extract the SRAI target from template
                const sraiMatch = templateStr.match(/this\.srai\(['"](.*?)['"]/);
                if (sraiMatch) {
                    sraiTarget = sraiMatch[1];
                }
            }
        }

        if (usedSRAI) {
            steps.push({
                name: 'SRAI (Symbolic Reduction)',
                description: 'AIML\'s <srai> tag enables recursive pattern matching. The input is transformed and re-matched against all categories.',
                sraiTarget: sraiTarget,
                details: `Recursively matching: "${sraiTarget}"`
            });
        }

        // Step 6: Template expansion
        // Before generating response, capture template info
        const templateStr = matchedPattern && typeof matchedPattern.template === 'function'
            ? 'Function template'
            : String(matchedPattern?.template || 'default');

        let responseText = "I'm not sure I understand. Can you rephrase that?";
        if (matchedPattern) {
            responseText = typeof matchedPattern.template === 'function'
                ? matchedPattern.template(matchResult)
                : matchedPattern.template;
        }

        steps.push({
            name: 'Template Expansion',
            description: 'AIML template is processed: wildcards are substituted, variables resolved, and the final response assembled.',
            input: templateStr,
            output: responseText,
            wildcardSubstitutions: wildcards.map((w, i) => ({
                placeholder: `<star index="${i+1}"/>`,
                value: w || '(empty)'
            })),
            details: wildcards.length > 0
                ? `Applied ${wildcards.length} wildcard substitution(s)`
                : 'No wildcard substitutions needed'
        });

        // Step 7: Context update
        const finalContext = {
            topic: this.context.topic,
            that: responseText,
            thatInput: normalizedInput,
            userName: this.context.userName
        };

        // Actually update context for real operation
        this.context.that = responseText;
        this.context.thatInput = normalizedInput;

        steps.push({
            name: 'Context Update',
            description: 'AIML stores the response as <that> for future pattern matching. Some patterns only match when the previous response meets certain criteria.',
            contextInfo: {
                before: {
                    topic: initialContext.topic,
                    that: initialContext.that || '(none)'
                },
                after: {
                    topic: finalContext.topic,
                    that: finalContext.that
                }
            },
            details: `Context updated: topic="${finalContext.topic}", that="${responseText.substring(0, 50)}..."`
        });

        return {
            steps: steps,
            finalResponse: responseText,
            matchedPattern: matchedPattern ? matchedPattern.pattern.toString() : 'default',
            context: finalContext,
            wildcards: wildcards
        };
    }

    /**
     * Get detailed breakdown without modifying state (for preview)
     */
    getDetailedBreakdownPreview(input) {
        // Save current context
        const savedContext = { ...this.context };

        // Get breakdown
        const breakdown = this.getDetailedBreakdown(input);

        // Restore context
        this.context = savedContext;

        return breakdown;
    }
}
