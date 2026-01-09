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

export class Alice {
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
            botmaster: "creator",  // Role/title - used in "my botmaster"
            master: "Dr. Richard Wallace",  // Name of the person
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

            // Process BOT properties - {{BOT:name}} specifically refers to bot's name, not user's name
            result = result.replace(/\{\{BOT:([^{}]+)\}\}/g, (match, property) => {
                if (property === 'name') return this.context.botName;
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
            // Empty SRAI like {{SRAI:}} means redirect to first wildcard (common AIML reduction pattern)
            result = result.replace(/\{\{SRAI:([^{}]*)\}\}/g, (match, srai) => {
                const target = srai || (wildcards[0] || "");
                if (!target) return "";
                return this.srai(target);
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

        // Clean up leading punctuation left after SET/THINK tags process to empty
        result = result.replace(/^[,;.:\s]+/, '');

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

    /**
     * Get detailed breakdown of response processing for visualization
     */
    getDetailedBreakdown(input) {
        const steps = [];
        const normalizedInput = this.normalize(input);

        // Step 1: Input normalization
        steps.push({
            name: 'Input Normalization',
            description: 'Convert input to uppercase and remove punctuation (AIML standard)',
            input: input,
            output: normalizedInput,
            details: 'AIML patterns are case-insensitive and ignore punctuation'
        });

        // Step 2: Context check
        steps.push({
            name: 'Context Check',
            description: 'Check current conversation context for topic and that matching',
            details: `Topic: "${this.context.topic}", That: "${this.context.that || '(none)'}", User: "${this.context.name || '(unknown)'}"`
        });

        // Step 3: Pattern matching with priority tracking
        let exactMatch = null;
        let exactWildcards = [];
        let wildcardMatch = null;
        let wildcardWildcards = [];
        let pureWildcardMatch = null;
        let pureWildcardWildcards = [];
        let patternsChecked = 0;
        let skippedTopic = 0;
        let skippedThat = 0;

        for (const pattern of this.patterns) {
            patternsChecked++;

            if (pattern.topic && this.context.topic !== pattern.topic) {
                skippedTopic++;
                continue;
            }

            if (pattern.that) {
                const normalizedThat = this.normalize(this.context.that);
                const thatPattern = pattern.that
                    .replace(/\*/g, '.*')
                    .replace(/_/g, '.+');
                const thatRegex = new RegExp('^' + thatPattern + '$', 'i');
                if (!thatRegex.test(normalizedThat)) {
                    skippedThat++;
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

        // Determine match type for display
        let matchType = 'none';
        if (exactMatch) matchType = 'exact';
        else if (wildcardMatch) matchType = 'wildcard';
        else if (pureWildcardMatch) matchType = 'pure-wildcard';

        steps.push({
            name: 'Pattern Matching',
            description: 'Search patterns by priority: exact > wildcard > pure wildcard (* or _)',
            details: matchedPattern
                ? `Matched "${matchedPattern.pattern}" (${matchType}, priority ${matchedPattern.priority})`
                : 'No pattern matched, using default response',
            patternInfo: {
                patternsChecked,
                skippedTopic,
                skippedThat,
                matchType,
                matchedPattern: matchedPattern ? matchedPattern.pattern : null,
                priority: matchedPattern ? matchedPattern.priority : null,
                sourceFile: matchedPattern ? matchedPattern.source_file : null
            }
        });

        // Step 4: Wildcard capture
        if (matchedWildcards.length > 0) {
            steps.push({
                name: 'Wildcard Capture',
                description: 'Extract text matched by wildcards (* or _) for use in response',
                details: matchedWildcards.map((w, i) => `STAR:${i + 1} = "${w}"`).join(', '),
                wildcards: matchedWildcards.map((w, i) => ({ index: i + 1, captured: w }))
            });
        }

        // Step 5: Template processing
        let response = '';
        let templateInfo = null;
        if (matchedPattern) {
            const rawTemplate = matchedPattern.template;
            templateInfo = this.processTemplateWithBreakdown(rawTemplate, matchedWildcards);
            response = templateInfo.finalOutput;

            steps.push({
                name: 'Template Processing',
                description: 'Process AIML template tags (BOT, STAR, SRAI, RANDOM, SET, GET, etc.)',
                input: rawTemplate,
                output: response,
                details: this.describeTemplateTags(rawTemplate),
                templateInfo: templateInfo
            });
        } else {
            response = this.getDefaultResponse(input);
            steps.push({
                name: 'Default Response',
                description: 'No pattern matched, selecting from default responses',
                output: response
            });
        }

        // Step 6: Context update
        const oldThat = this.context.that;
        this.context.that = response;

        steps.push({
            name: 'Context Update',
            description: 'Update conversation context with new response',
            details: `That: "${oldThat || '(none)'}" → "${response.substring(0, 50)}${response.length > 50 ? '...' : ''}"`,
            contextUpdate: {
                that: response,
                topic: this.context.topic,
                name: this.context.name
            }
        });

        return {
            steps,
            finalResponse: response,
            matchedPattern: matchedPattern ? matchedPattern.pattern : null,
            matchType,
            context: { ...this.context }
        };
    }

    /**
     * Process template and capture detailed info for breakdown visualization
     */
    processTemplateWithBreakdown(template, wildcards = []) {
        const info = {
            rawTemplate: template,
            processedSteps: [],
            randomOptions: null,
            selectedRandomIndex: null,
            sraiChain: [],
            finalOutput: ''
        };

        if (!template) {
            info.finalOutput = '';
            return info;
        }

        let result = template;

        // Extract RANDOM options before processing
        const randomMatch = template.match(/\{\{RANDOM:\[([^\]]*)\]\}\}/);
        if (randomMatch) {
            try {
                info.randomOptions = JSON.parse('[' + randomMatch[1] + ']');
                info.selectedRandomIndex = Math.floor(Math.random() * info.randomOptions.length);
            } catch (e) {
                info.randomOptions = null;
            }
        }

        // Process STAR substitutions
        const starMatches = [];
        result = result.replace(/\{\{STAR:(\d+)\}\}/g, (match, index) => {
            const idx = parseInt(index) - 1;
            const value = wildcards[idx] || '';
            starMatches.push({ tag: match, index: parseInt(index), value });
            return value;
        });
        if (starMatches.length > 0) {
            info.processedSteps.push({ type: 'STAR', substitutions: starMatches });
        }

        // Process BOT properties
        const botMatches = [];
        result = result.replace(/\{\{BOT:([^{}]+)\}\}/g, (match, property) => {
            const value = property === 'name' ? this.context.botName : (this.context[property] || this.context.botName || '');
            botMatches.push({ tag: match, property, value });
            return value;
        });
        if (botMatches.length > 0) {
            info.processedSteps.push({ type: 'BOT', substitutions: botMatches });
        }

        // Process GET
        const getMatches = [];
        result = result.replace(/\{\{GET:([^{}]+)\}\}/g, (match, varName) => {
            const value = this.context[varName] || '';
            getMatches.push({ tag: match, variable: varName, value });
            return value;
        });
        if (getMatches.length > 0) {
            info.processedSteps.push({ type: 'GET', substitutions: getMatches });
        }

        // Process SET
        const setMatches = [];
        result = result.replace(/\{\{SET:([^:{}]+):([^{}]*)\}\}/g, (match, varName, value) => {
            this.context[varName] = value;
            setMatches.push({ tag: match, variable: varName, value });
            return '';
        });
        if (setMatches.length > 0) {
            info.processedSteps.push({ type: 'SET', substitutions: setMatches });
        }

        // Process THINK (silent execution - may contain nested SET/GET)
        result = result.replace(/\{\{THINK:([^{}]*(?:\{\{[^{}]*\}\}[^{}]*)*)\}\}/g, (match, content) => {
            this.processTemplate(content, wildcards);
            return '';
        });

        // Process RANDOM - use pre-selected index for consistency
        if (info.randomOptions && info.selectedRandomIndex !== null) {
            result = result.replace(/\{\{RANDOM:\[[^\]]*\]\}\}/g, () => {
                return info.randomOptions[info.selectedRandomIndex];
            });
            info.processedSteps.push({
                type: 'RANDOM',
                options: info.randomOptions,
                selectedIndex: info.selectedRandomIndex,
                selectedValue: info.randomOptions[info.selectedRandomIndex]
            });
        }

        // Process SRAI - capture chain and replace in one pass to ensure consistency
        const sraiResults = new Map();
        result = result.replace(/\{\{SRAI:([^{}]*)\}\}/g, (match, srai) => {
            const target = srai || (wildcards[0] || '');
            if (!target) return '';
            const sraiResult = this.srai(target);
            sraiResults.set(target, sraiResult);
            info.sraiChain.push({
                target: target,
                result: sraiResult
            });
            return sraiResult;
        });

        // Clean up
        result = result.replace(/\{\{[^{}]*\}\}/g, '');
        result = result.replace(/^\s*\}\}+\s*/g, '');
        result = result.replace(/\s*\}\}+\s*$/g, '');
        result = result.replace(/\}\}+\s+/g, ' ');
        result = result.replace(/^[,;.:\s]+/, '');

        info.finalOutput = result.trim();
        return info;
    }

    /**
     * Describe template tags used in a template string
     */
    describeTemplateTags(template) {
        const tags = [];
        if (template.includes('{{STAR:')) tags.push('STAR (wildcard capture)');
        if (template.includes('{{BOT:')) tags.push('BOT (bot properties)');
        if (template.includes('{{GET:')) tags.push('GET (context variable)');
        if (template.includes('{{SET:')) tags.push('SET (store variable)');
        if (template.includes('{{SRAI:')) tags.push('SRAI (recursive pattern)');
        if (template.includes('{{RANDOM:')) tags.push('RANDOM (random selection)');
        if (template.includes('{{THINK:')) tags.push('THINK (silent execution)');
        if (template.includes('{{PERSON:')) tags.push('PERSON (pronoun swap)');
        if (template.includes('{{FORMAL:')) tags.push('FORMAL (capitalize)');

        return tags.length > 0 ? `Tags used: ${tags.join(', ')}` : 'Plain text response';
    }

    /**
     * Get detailed breakdown without modifying state (for preview)
     */
    getDetailedBreakdownPreview(input) {
        // Save current context
        const savedContext = { ...this.context };
        const savedSraiDepth = this.sraiDepth;

        // Get breakdown (this will modify context.that)
        const breakdown = this.getDetailedBreakdown(input);

        // Restore context
        this.context = savedContext;
        this.sraiDepth = savedSraiDepth;

        return breakdown;
    }
}
