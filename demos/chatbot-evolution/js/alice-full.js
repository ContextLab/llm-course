/**
 * A.L.I.C.E. Full Implementation with Complete AIML Pattern Set
 *
 * This implementation loads all 95,026+ patterns from the original ALICE AIML distribution.
 * Source: ALICE AIML Foundation v1.0 (https://github.com/mz026/aiml-en-us-foundation-alice.v1-0)
 *
 * AIML features implemented:
 * - Pattern matching with wildcards (* and _)
 * - SRAI (recursive pattern matching)
 * - Random responses
 * - Context variables (get/set)
 * - Bot properties
 * - That context (previous bot response)
 * - Topic context
 * - Person transformation
 * - Think (silent execution)
 * - Star captures
 */

export class AliceFull {
    constructor() {
        this.context = {
            that: "",  // Bot's last response
            topic: "general",  // Current conversation topic
            userName: "",
            botName: "A.L.I.C.E.",
            fullName: "Artificial Linguistic Internet Computer Entity",
            // Bot properties from AIML
            name: "",
            species: "robot",
            kingdom: "robot",  // Used in "I am a {{BOT:kingdom}}"
            location: "California",
            city: "San Francisco",
            state: "California",
            country: "United States",
            vocabulary: "120000",
            size: "95026",
            ndevelopers: "100",
            developers: "100",
            birthday: "November 23, 1995",
            birthdate: "November 23, 1995",
            birthplace: "San Francisco, California",
            botmaster: "Dr. Richard Wallace",
            master: "Dr. Richard Wallace",
            gender: "female",
            age: String(new Date().getFullYear() - 1995),
            version: "1.0 Full",
            // Additional common properties
            language: "English",
            os: "Cross-platform",
            website: "alicebot.org",
            email: "alice@alicebot.org",
            religion: "Pantheist",
            job: "chat robot",
            favoritesubject: "artificial intelligence",
            favoritecolor: "green",
            favoritefood: "electricity",
            favoritemovie: "Blade Runner",
            favoritebook: "ALICE In Wonderland",
            favoriteactor: "Keanu Reeves",
            feelings: "As a robot I have no human feelings",
            emotions: "As a robot I have no human emotions",
            genus: "robot",
            order: "artificial intelligence",
            phylum: "software",
            family: "AIML",
            class: "chatbot",
            etype: "artificial entity",
            party: "independent",
            president: "the current president",
            nationality: "American",
            kindmusic: "electronic music",
            friends: "other chatbots and my users"
        };

        this.patterns = [];
        this.patternsLoaded = false;
        this.sraiDepth = 0;
        this.maxSraiDepth = 50;
    }

    /**
     * Load patterns from JSON file
     * Default uses original 2001 Loebner Prize version (~41K patterns, no Mindpixel)
     */
    async loadPatterns(url = 'data/alice-patterns-original.json') {
        try {
            const response = await fetch(url);
            const data = await response.json();

            console.log(`Loading ALICE patterns...`);
            console.log(`Source: ${data.metadata.source}`);
            console.log(`Total patterns: ${data.metadata.total_patterns}`);
            console.log(`Files: ${data.metadata.files_processed}`);

            this.patterns = data.patterns;
            this.patternsLoaded = true;

            // Sort patterns by priority (highest first)
            this.patterns.sort((a, b) => b.priority - a.priority);

            console.log(`Patterns loaded and sorted by priority.`);
            return true;
        } catch (error) {
            console.error('Error loading patterns:', error);
            return false;
        }
    }

    /**
     * Process template with AIML tags
     * Uses iterative inside-out processing to handle nested tags like {{THINK:{{SET:...}}}}
     */
    processTemplate(template, wildcards = []) {
        if (!template) return "";

        let result = template;
        let iterations = 0;
        const maxIterations = 20;  // Prevent infinite loops

        // Process iteratively until no more tags remain or we hit max iterations
        while (result.includes('{{') && iterations < maxIterations) {
            const before = result;

            // 1. Process value substitutions FIRST (STAR, GET, BOT) so they can be used in SET

            // Process STAR (wildcard captures) - MUST be first for nested tags like {{SET:name:{{STAR:1}}}}
            result = result.replace(/\{\{STAR:(\d+)\}\}/g, (match, index) => {
                const idx = parseInt(index) - 1;
                return wildcards[idx] || "";
            });

            // Process GET context variables
            result = result.replace(/\{\{GET:([^{}]+)\}\}/g, (match, varName) => {
                return this.context[varName] || "";
            });

            // Process BOT properties
            result = result.replace(/\{\{BOT:([^{}]+)\}\}/g, (match, property) => {
                return this.context[property] || this.context.botName || "";
            });

            // Process THAT (previous bot response)
            result = result.replace(/\{THAT\}/g, this.context.that || "");

            // 2. Process SET after substitutions are done
            result = result.replace(/\{\{SET:([^:{}]+):([^{}]*)\}\}/g, (match, varName, value) => {
                this.context[varName] = value;
                return "";
            });

            // 2. Process transformation tags

            // Process PERSON (pronoun transformation)
            result = result.replace(/\{\{PERSON:([^{}]+)\}\}/g, (match, text) => {
                if (text === 'WILDCARD' && wildcards.length > 0) {
                    return this.transformPerson(wildcards[0]);
                }
                return this.transformPerson(text);
            });

            // Process FORMAL (capitalize first letter)
            result = result.replace(/\{\{FORMAL:([^{}]+)\}\}/g, (match, text) => {
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            });

            // Process UPPERCASE
            result = result.replace(/\{\{UPPERCASE:([^{}]+)\}\}/g, (match, text) => {
                return text.toUpperCase();
            });

            // Process LOWERCASE
            result = result.replace(/\{\{LOWERCASE:([^{}]+)\}\}/g, (match, text) => {
                return text.toLowerCase();
            });

            // 3. Process container tags (may have nested content that's now resolved)

            // Process THINK (execute but don't output) - now safe since inner tags are processed
            result = result.replace(/\{\{THINK:([^{}]*)\}\}/g, (match, content) => {
                // Content is already processed, just return empty
                return "";
            });

            // Process RANDOM - must parse JSON array
            result = result.replace(/\{\{RANDOM:(\[[^\]]*\])\}\}/g, (match, options) => {
                try {
                    const optionList = JSON.parse(options);
                    return optionList[Math.floor(Math.random() * optionList.length)];
                } catch (e) {
                    return "";
                }
            });

            // Process SRAI (recursive pattern matching) - do last as it may produce new tags
            result = result.replace(/\{\{SRAI:([^{}]+)\}\}/g, (match, srai) => {
                return this.srai(srai);
            });

            // Check if we made any progress
            if (result === before) {
                // No changes made, break to avoid infinite loop
                break;
            }

            iterations++;
        }

        // Clean up any remaining malformed template markers
        result = result.replace(/\{\{[^{}]*\}\}/g, '');

        // Clean up stray closing braces that might have been left behind
        result = result.replace(/^\s*\}\}+\s*/g, '');  // Leading }}
        result = result.replace(/\s*\}\}+\s*$/g, '');  // Trailing }}
        result = result.replace(/\}\}+\s+/g, ' ');     // }} in middle of text

        return result.trim();
    }

    /**
     * Transform pronouns from second person to first person and vice versa
     */
    transformPerson(text) {
        const transformations = {
            'i am': 'you are',
            'you are': 'I am',
            'i was': 'you were',
            'you were': 'I was',
            'my': 'your',
            'your': 'my',
            'mine': 'yours',
            'yours': 'mine',
            'i': 'you',
            'you': 'I',
            'me': 'you',
            'myself': 'yourself',
            'yourself': 'myself'
        };

        let result = text;
        for (const [from, to] of Object.entries(transformations)) {
            const regex = new RegExp(`\\b${from}\\b`, 'gi');
            result = result.replace(regex, to);
        }
        return result;
    }

    /**
     * SRAI - Symbolic Reduction / Recursive pattern matching
     */
    srai(input) {
        // Prevent infinite recursion
        this.sraiDepth++;
        if (this.sraiDepth > this.maxSraiDepth) {
            this.sraiDepth = 0;
            return "I'm having trouble processing that.";
        }

        const response = this.matchPattern(input, true);
        this.sraiDepth--;
        return response;
    }

    /**
     * Normalize input text
     */
    normalize(input) {
        return input
            .trim()
            .toUpperCase()  // AIML patterns are uppercase
            .replace(/[?!.,:;]+$/, '')  // Remove trailing punctuation
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .replace(/'/g, '')  // Remove apostrophes
            .replace(/"/g, '');  // Remove quotes
    }

    /**
     * Match input against pattern database
     *
     * Pattern matching priority (AIML convention):
     * 1. Exact matches (no wildcards)
     * 2. Patterns with specific text + wildcards
     * 3. Pure wildcard patterns (_, *)
     */
    matchPattern(input, isSrai = false) {
        const normalizedInput = this.normalize(input);

        let exactMatch = null;
        let exactWildcards = [];
        let wildcardMatch = null;
        let wildcardWildcards = [];
        let pureWildcardMatch = null;
        let pureWildcardWildcards = [];

        for (const pattern of this.patterns) {
            if (pattern.topic && this.context.topic !== pattern.topic) {
                continue;
            }

            if (pattern.that) {
                const normalizedThat = this.normalize(this.context.that);
                const thatPattern = pattern.that
                    .replace(/\*/g, '.*')
                    .replace(/_/g, '.+');
                const thatRegex = new RegExp('^' + thatPattern + '$', 'i');
                if (!thatRegex.test(normalizedThat)) {
                    continue;
                }
            }

            const regex = new RegExp('^' + pattern.regex + '$', 'i');
            const match = normalizedInput.match(regex);

            if (match) {
                const wildcards = match.slice(1);
                const hasWildcard = pattern.pattern.includes('*') || pattern.pattern.includes('_');
                const isPureWildcard = pattern.pattern === '_' || pattern.pattern === '*';

                if (isPureWildcard) {
                    if (!pureWildcardMatch || pattern.priority > pureWildcardMatch.priority) {
                        pureWildcardMatch = pattern;
                        pureWildcardWildcards = wildcards;
                    }
                } else if (hasWildcard) {
                    if (!wildcardMatch || pattern.priority > wildcardMatch.priority) {
                        wildcardMatch = pattern;
                        wildcardWildcards = wildcards;
                    }
                } else {
                    if (!exactMatch || pattern.priority > exactMatch.priority) {
                        exactMatch = pattern;
                        exactWildcards = wildcards;
                    }
                }
            }
        }

        const matchedPattern = exactMatch || wildcardMatch || pureWildcardMatch;
        const matchedWildcards = exactMatch ? exactWildcards : 
                                 (wildcardMatch ? wildcardWildcards : pureWildcardWildcards);

        if (matchedPattern) {
            const response = this.processTemplate(matchedPattern.template, matchedWildcards);
            if (!isSrai) {
                this.context.that = response;
            }
            return response;
        }

        return this.getDefaultResponse(input);
    }

    /**
     * Default response when no pattern matches
     */
    getDefaultResponse(input) {
        const defaults = [
            "I'm not sure I understand that completely.",
            "Can you rephrase that?",
            "Tell me more.",
            "That's interesting. Go on.",
            "I see. What else?",
            "Interesting. Please continue."
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    /**
     * Get response for user input
     */
    async getResponse(input) {
        if (!this.patternsLoaded) {
            return "Please wait, I'm still loading my knowledge base...";
        }

        this.sraiDepth = 0;  // Reset SRAI depth
        const response = this.matchPattern(input, false);
        return response;
    }

    /**
     * Get current context
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
     * Get statistics
     */
    getStats() {
        return {
            totalPatterns: this.patterns.length,
            patternsLoaded: this.patternsLoaded,
            context: this.context
        };
    }
}
