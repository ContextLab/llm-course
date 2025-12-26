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
            name: "ALICE",
            species: "robot",
            location: "California",
            vocabulary: "120000",
            size: "95026",
            developers: "100",
            birthday: "November 23, 1995",
            birthplace: "San Francisco, California",
            botmaster: "Dr. Richard Wallace",
            gender: "female",
            age: new Date().getFullYear() - 1995,
            version: "1.0 Full"
        };

        this.patterns = [];
        this.patternsLoaded = false;
        this.sraiDepth = 0;
        this.maxSraiDepth = 50;
    }

    /**
     * Load patterns from JSON file
     */
    async loadPatterns(url = 'data/alice-patterns-full.json') {
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
     */
    processTemplate(template, wildcards = []) {
        if (!template) return "";

        let result = template;

        // Process SRAI (recursive pattern matching)
        result = result.replace(/\{\{SRAI:([^}]+)\}\}/g, (match, srai) => {
            return this.srai(srai);
        });

        // Process RANDOM
        result = result.replace(/\{\{RANDOM:(\[.*?\])\}\}/g, (match, options) => {
            try {
                const optionList = JSON.parse(options);
                return optionList[Math.floor(Math.random() * optionList.length)];
            } catch (e) {
                return "";
            }
        });

        // Process BOT properties
        result = result.replace(/\{\{BOT:([^}]+)\}\}/g, (match, property) => {
            return this.context[property] || this.context.botName || "";
        });

        // Process GET context variables
        result = result.replace(/\{\{GET:([^}]+)\}\}/g, (match, varName) => {
            return this.context[varName] || "";
        });

        // Process SET context variables
        result = result.replace(/\{\{SET:([^:]+):([^}]+)\}\}/g, (match, varName, value) => {
            this.context[varName] = value;
            return value;
        });

        // Process PERSON (pronoun transformation)
        result = result.replace(/\{\{PERSON:([^}]+)\}\}/g, (match, text) => {
            if (text === 'WILDCARD' && wildcards.length > 0) {
                return this.transformPerson(wildcards[0]);
            }
            return this.transformPerson(text);
        });

        // Process THINK (execute but don't output)
        result = result.replace(/\{\{THINK:([^}]+)\}\}/g, (match, content) => {
            this.processTemplate(content, wildcards);
            return "";
        });

        // Process STAR (wildcard captures)
        result = result.replace(/\{\{STAR:(\d+)\}\}/g, (match, index) => {
            const idx = parseInt(index) - 1;
            return wildcards[idx] || "";
        });

        // Process THAT (previous bot response)
        result = result.replace(/\{THAT\}/g, this.context.that || "");

        // Process FORMAL (capitalize first letter)
        result = result.replace(/\{\{FORMAL:([^}]+)\}\}/g, (match, text) => {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        });

        // Process UPPERCASE
        result = result.replace(/\{\{UPPERCASE:([^}]+)\}\}/g, (match, text) => {
            return text.toUpperCase();
        });

        // Process LOWERCASE
        result = result.replace(/\{\{LOWERCASE:([^}]+)\}\}/g, (match, text) => {
            return text.toLowerCase();
        });

        // Clean up any remaining template markers
        result = result.replace(/\{\{[^}]*\}\}/g, '');

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
     */
    matchPattern(input, isSrai = false) {
        const normalizedInput = this.normalize(input);

        // Patterns are already sorted by priority
        for (const pattern of this.patterns) {
            // Check topic constraint
            if (pattern.topic && this.context.topic !== pattern.topic) {
                continue;
            }

            // Check that constraint (previous bot response)
            if (pattern.that && !this.normalize(this.context.that).includes(this.normalize(pattern.that))) {
                continue;
            }

            // Try to match pattern
            const regex = new RegExp('^' + pattern.regex + '$', 'i');
            const match = normalizedInput.match(regex);

            if (match) {
                // Extract wildcards (everything except full match)
                const wildcards = match.slice(1);

                // Process template
                const response = this.processTemplate(pattern.template, wildcards);

                // Update context (but not for SRAI calls)
                if (!isSrai) {
                    this.context.that = response;
                }

                return response;
            }
        }

        // No match found
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
