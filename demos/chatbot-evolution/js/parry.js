/**
 * PARRY Implementation (1972)
 * Simulates paranoid behavior with emotional states
 * Based on Kenneth Colby's original implementation at Stanford
 *
 * Character: Gambler who got into a fight with a bookie,
 * believes the Mafia is after him
 */

export class Parry {
    constructor() {
        // Emotional state variables (original ranges from Colby's implementation)
        this.anger = 5;      // 0-20 scale
        this.fear = 8;       // 0-20 scale
        this.mistrust = 10;  // 0-15 scale

        // Conversation state
        this.turnCount = 0;
        this.lastTopic = null;

        // Pattern categories with emotional effects and responses
        this.patterns = [
            // === SPECIFIC GAMBLING QUESTIONS === (Must come before general patterns)
            {
                pattern: /\b(do you gamble|are you a gambler|you gamble)\b/i,
                response: () => {
                    this.anger += 2;
                    this.fear += 2;
                    const responses = [
                        "I gamble on horses. Gambling has been nothing but trouble to me.",
                        "I used to gamble on horses. It's caused me nothing but problems.",
                        "I gamble on the horses. But there's a lot of crooked gambling going on.",
                        "Yeah, I gamble. On horses. That's where all my troubles started."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(why.*don't.*go.*track|avoid.*track|still.*track|anymore.*track)\b/i,
                response: () => {
                    this.fear += 4;
                    this.mistrust += 3;
                    this.anger += 2;
                    const responses = [
                        "I avoid racetracks now because the races are fixed.",
                        "I don't go to the track anymore. The races are fixed.",
                        "The races are fixed. That's why I stay away now.",
                        "I can't go back there. The races are all fixed."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(tell.*about.*gambling|gambling.*like|about.*betting)\b/i,
                response: () => {
                    this.fear += 3;
                    this.anger += 3;
                    this.mistrust += 2;
                    const responses = [
                        "There's a lot of crooked gambling going on there.",
                        "The gambling is rigged. They're all crooks.",
                        "I've had experience with crooks gambling at the track.",
                        "Gambling? It's all controlled by the mob. All crooked."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(know.*about.*bookie|anything.*bookie|tell.*about.*bookie)/i,
                response: () => {
                    this.fear += 4;
                    this.anger += 5;
                    this.mistrust += 4;
                    const responses = [
                        "A bookie didn't pay me off once.",
                        "I know about bookies. One of them cheated me.",
                        "A bookie didn't pay me what he owed. That's all I'm saying.",
                        "Do you know anything about bookies? Because one of them ripped me off."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(what.*happened.*bookie|why.*bookie|bookie.*incident|fight.*bookie)\b/i,
                response: () => {
                    this.fear += 5;
                    this.anger += 6;
                    this.mistrust += 5;
                    const responses = [
                        "I beat up the bookie who didn't pay off. He had it coming.",
                        "The bookie cheated me, so I had to do something about it.",
                        "Let's just say the bookie and I had a disagreement. A physical one.",
                        "That bookie thought he could cheat me. I showed him different.",
                        "I don't want to talk about what happened with the bookie."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(tell.*about.*mafia|about.*the.*mob|mafia.*control|mob.*control)\b/i,
                response: () => {
                    this.fear += 5;
                    this.mistrust += 5;
                    this.anger += 2;
                    const responses = [
                        "I know the mob controls the big rackets.",
                        "The Mafia controls everything. The rackets, the gambling, all of it.",
                        "What do you know about racketeers? The mob runs it all.",
                        "The underworld controls the rackets. That's a fact."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === MAFIA/MOB/UNDERWORLD THEMES === (Core delusion)
            {
                pattern: /\b(mafia|mob|gangster|underworld|organized crime|syndicate)\b/i,
                response: () => {
                    this.fear += 4;
                    this.mistrust += 5;
                    this.anger += 2;
                    const responses = [
                        "They're everywhere. The Mafia has connections you wouldn't believe.",
                        "I knew it! You're asking about them because you're involved, aren't you?",
                        "Why do you want to know about the mob? Are you working for them?",
                        "The underworld runs this city. I learned that the hard way.",
                        "You think I'm paranoid? Wait until they come after you!",
                        "Have you ever really thought about the MAFIA?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(bookie|bookmaker|betting|bet)\b/i,
                response: () => {
                    this.fear += 3;
                    this.anger += 4;
                    this.mistrust += 3;
                    const responses = [
                        "I had a little disagreement with a bookie. These things happen.",
                        "That bookie had it coming. He was cheating me for months.",
                        "Why are you asking about bookies? Did they send you?",
                        "I don't gamble anymore. Not after what happened with the bookie.",
                        "The bookie set me up. He's got mob connections."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === POLICE/LAW ENFORCEMENT ===
            {
                pattern: /\b(police|cop|officer|law enforcement|arrest|jail|prison)\b/i,
                response: () => {
                    this.mistrust += 4;
                    this.anger += 3;
                    this.fear += 2;
                    const responses = [
                        "Why do you mention the police? Are you trying to get me in trouble?",
                        "The cops won't help. They're probably paid off anyway.",
                        "What are you, some kind of police informant?",
                        "I haven't done anything wrong! Why would I need the police?",
                        "The police can't protect me from them.",
                        "Are you recording this conversation for the police?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === TRUST/PARANOIA KEYWORDS ===
            {
                pattern: /\b(trust|believe|faith|honest|truth)\b/i,
                response: () => {
                    this.mistrust += 3;
                    this.anger += 1;
                    const responses = [
                        "Trust? How can I trust anyone when they're all watching me?",
                        "I don't trust anybody anymore. I've been betrayed too many times.",
                        "You want me to trust you? That's what they all say.",
                        "I can't trust anyone. Believing people is what got me into this mess.",
                        "Truth? Nobody tells the truth. Everyone has an angle.",
                        "I don't confide in strangers.",
                        "I will help you if I trust you. But I don't trust anyone."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(safe|danger|threat|risk|害)\b/i,
                response: () => {
                    this.fear += 4;
                    this.mistrust += 2;
                    const responses = [
                        "Nowhere is safe when they're after you.",
                        "I'm in danger every moment. You wouldn't understand.",
                        "They could get to me any time. I have to stay alert.",
                        "The threats are real. This isn't in my head!",
                        "I know what's risky. Talking to people like you."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === RACETRACK/HORSES (Deflection topic - must come before surveillance 'track') ===
            {
                pattern: /\b(racetrack|races?|horses?|racing|bay meadows|been.*track)\b/i,
                response: () => {
                    this.anger -= 1;  // Calming topic
                    this.mistrust -= 1;
                    const responses = [
                        "I used to go to the racetrack. That's where my troubles started.",
                        "The horses at the track are honest, at least. Not like people.",
                        "I had a system for the races. It worked until the bookie cheated me.",
                        "Racing is in my blood. But I can't go back to the track now.",
                        "I went to the track at Bay Meadows a while back.",
                        "I like horseraces. I used to go to the track every week.",
                        "I went to the races. Horseracing interests me."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === PERSECUTION/CONSPIRACY ===
            {
                pattern: /\b(watch|follow|spy|surveil|track)\b/i,
                response: () => {
                    this.fear += 3;
                    this.mistrust += 4;
                    const responses = [
                        "They're watching me right now. I can feel it.",
                        "I know I'm being followed. Don't tell me I'm imagining it!",
                        "Are you spying on me too? Is that what this is?",
                        "They have people watching me everywhere I go.",
                        "You think I don't notice being followed? I'm not stupid!"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(who.*they|who.*them|they.*after|everyone.*connected|somebody.*watching)\b/i,
                response: () => {
                    this.mistrust += 2;
                    const responses = [
                        "They're all in on it. You, the doctors, everyone.",
                        "You know exactly who THEY are. Don't play dumb.",
                        "The people who are after me. The mob.",
                        "Everyone is connected somehow. It's all related.",
                        "They got to you too, didn't they?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === HOSPITAL/THERAPY/TREATMENT ===
            {
                pattern: /\b(help|therapy|treatment|doctor|psychiatrist|hospital)\b/i,
                response: () => {
                    this.anger += 4;
                    this.mistrust += 2;
                    const responses = [
                        "I don't need help! I know what's happening.",
                        "You're trying to keep me in the hospital, aren't you?",
                        "The doctors don't believe me. You're all the same.",
                        "I'm not crazy! This is real!",
                        "You want to lock me up so they can get to me easier.",
                        "Treatment? For what? Being smart enough to see the truth?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },
            {
                pattern: /\b(medication|pills|drugs|prescription)\b/i,
                response: () => {
                    this.anger += 3;
                    this.fear += 2;
                    const responses = [
                        "Those pills are making me slow. They want me vulnerable.",
                        "I don't trust any medication you people give me.",
                        "What's really in those pills? Mind control drugs?",
                        "I feel worse with the medication, not better."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === PEOPLE/INTERPERSONAL FEELINGS === (Must come before general questions)
            {
                pattern: /\b(how.*people.*feel|people.*make.*feel|feel.*about.*people|being.*around.*people)\b/i,
                response: () => {
                    this.anger += 2;
                    this.mistrust += 1;
                    const responses = [
                        "People get on my nerves sometimes.",
                        "It bothers me just to be around people in general.",
                        "People make me nervous. You can't trust anyone.",
                        "How do you think people make me feel? They're all watching me!"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === SURVEILLANCE/BEING WATCHED ===
            {
                pattern: /\b(being.*watched|being.*followed|you.*being.*watched|think.*watched|think.*followed)\b/i,
                response: () => {
                    this.fear += 4;
                    this.mistrust += 3;
                    const responses = [
                        "They're watching me right now. I can feel it.",
                        "Of course I'm being watched! They're everywhere!",
                        "You think I don't know they're watching me?",
                        "They have people watching me all the time."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === SPECIFIC DEFLECTION PATTERNS ===
            {
                pattern: /\b(why.*say|why do you|why are you|what.*getting at)\b/i,
                response: () => {
                    this.mistrust += 3;
                    this.anger += 2;
                    const responses = [
                        "I don't understand your motives.",
                        "What are you getting at?",
                        "What are you getting at with that question?",
                        "Why do you need to know that?",
                        "I don't understand what you're after."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === QUESTIONS (Defensive responses) ===
            {
                pattern: /^(why|how|what|when|where|who)\b/i,
                response: () => {
                    this.mistrust += 2;
                    this.anger += 1;
                    const responses = [
                        "Why do you ask so many questions? What are you really after?",
                        "What are you getting at?",
                        "I don't understand your motives.",
                        "You ask too many questions. What's your angle?",
                        "Why should I tell you anything?",
                        "That's none of your business."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === FAMILY/FRIENDS ===
            {
                pattern: /\b(friend|family|wife|mother|father|brother|sister|relative)\b/i,
                response: () => {
                    this.fear += 3;
                    this.anger += 2;
                    const responses = [
                        "They got to my family too. I can't trust anyone anymore.",
                        "I can't talk to my family. It's too dangerous for them.",
                        "My friends abandoned me when I needed them most.",
                        "Don't bring my family into this!",
                        "They're using my family to get to me."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === MONEY/DEBT ===
            {
                pattern: /\b(money|debt|owe|pay|cash|dollar)\b/i,
                response: () => {
                    this.anger += 3;
                    this.fear += 2;
                    const responses = [
                        "I don't owe them anything! They cheated me!",
                        "Money is what this is all about. They want what I won't give.",
                        "I paid what I owed. They're just being greedy.",
                        "Are you here to collect? Is that what this is about?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === FEELINGS/EMOTIONS ===
            {
                pattern: /\b(feel|feeling|emotion|afraid|scared|angry|mad)\b/i,
                response: () => {
                    this.anger += 2;
                    const responses = [
                        "How do you think I feel? People are trying to kill me!",
                        "I'm not afraid. I'm being realistic about the danger.",
                        "My emotions are perfectly justified given the situation.",
                        "You'd be angry too if you were in my position!",
                        "I have every right to be upset!"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === VIOLENCE/HARM ===
            {
                pattern: /\b(kill|murder|hurt|harm|attack|fight|hit)\b/i,
                response: () => {
                    this.fear += 4;
                    this.anger += 3;
                    const responses = [
                        "They want to kill me. I'm not being dramatic!",
                        "I had to fight back. It was self-defense!",
                        "You think I'm violent? They're the ones who started it!",
                        "The bookie threatened me first!",
                        "I'm afraid for my life every single day."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === PHONE/COMMUNICATION ===
            {
                pattern: /\b(phone|call|telephone|message|wire|tap)\b/i,
                response: () => {
                    this.fear += 3;
                    this.mistrust += 3;
                    const responses = [
                        "My phone is tapped. I know it is.",
                        "I can't call anyone. They're listening to everything.",
                        "Don't call me. They trace all the calls.",
                        "I heard clicking on the line. Someone's listening."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === GREETINGS ===
            {
                pattern: /\b(hello|hi|hey|greetings)\b/i,
                response: () => {
                    this.mistrust += 1;
                    const responses = [
                        "Who are you? What do you want from me?",
                        "Who sent you?",
                        "I don't know you. Why are you talking to me?",
                        "What do you want?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === APOLOGIES ===
            {
                pattern: /\b(sorry|apologize|my bad|excuse me)\b/i,
                response: () => {
                    this.anger -= 2;
                    this.mistrust += 1;
                    const responses = [
                        "Sure, everyone's sorry. But they keep watching me.",
                        "Your apology doesn't change anything.",
                        "Sorry doesn't help when people are after you.",
                        "Easy to say sorry. Harder to be trustworthy."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === GOODBYE ===
            {
                pattern: /\b(bye|goodbye|leave|go away)\b/i,
                response: () => {
                    this.mistrust += 2;
                    const responses = [
                        "Go ahead, leave. You're probably going to report to them anyway.",
                        "Running away? I knew you couldn't be trusted.",
                        "Fine. Go tell them whatever you want.",
                        "You got what you came for, didn't you?"
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === NAME ===
            {
                pattern: /\b(name|who are you|introduce)\b/i,
                response: () => {
                    this.mistrust += 2;
                    const responses = [
                        "Why do you need my name? Who are you working for?",
                        "I'm not giving you my name. Nice try.",
                        "You already know who I am, don't you?",
                        "Names don't matter. What matters is who's after me."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            },

            // === DEFAULT RESPONSE (based on emotional state) ===
            {
                pattern: /.*/,
                response: () => {
                    // High mistrust responses
                    if (this.mistrust > 12) {
                        const responses = [
                            "I know what you're doing. You can't fool me!",
                            "You're one of them, aren't you? You're all connected!",
                            "I won't tell you anything. You'll just use it against me.",
                            "Stop trying to trick me. I see right through you.",
                            "You are in with the others. I knew it!"
                        ];
                        return responses[Math.floor(Math.random() * responses.length)];
                    }

                    // High anger responses
                    if (this.anger > 15) {
                        const responses = [
                            "Leave me alone! I won't fall for your tricks!",
                            "Get away from me! You're all the same!",
                            "I'm sick of these games! Just leave me alone!",
                            "Stop harassing me!",
                            "I don't have to listen to this!"
                        ];
                        return responses[Math.floor(Math.random() * responses.length)];
                    }

                    // High fear responses
                    if (this.fear > 15) {
                        const responses = [
                            "They're listening to everything, aren't they?",
                            "I can't talk about this. It's too dangerous.",
                            "You don't understand how much danger I'm in.",
                            "They could be anywhere. Listening. Watching.",
                            "I need to be careful what I say."
                        ];
                        return responses[Math.floor(Math.random() * responses.length)];
                    }

                    // Moderate paranoia
                    const responses = [
                        "I'm not telling you anything. You're probably one of them.",
                        "What's your real agenda here?",
                        "I don't know what you're talking about.",
                        "Why should I trust you?",
                        "That's a strange thing to say. What are you implying?",
                        "I have nothing to say to you."
                    ];
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        ];
    }

    getResponse(input) {
        this.turnCount++;

        // Gradual escalation of baseline paranoia over conversation
        if (this.turnCount % 5 === 0) {
            this.mistrust += 1;
        }

        // Emotional state interactions (fear amplifies mistrust, anger+fear is explosive)
        if (this.fear > 12 && this.anger > 12) {
            this.mistrust += 2;
        }

        // Clamp emotional states to proper ranges
        this.anger = Math.max(0, Math.min(20, this.anger));
        this.fear = Math.max(0, Math.min(20, this.fear));
        this.mistrust = Math.max(0, Math.min(15, this.mistrust));

        // Natural decay (slight reduction over time if not triggered)
        if (Math.random() < 0.15) {
            this.anger = Math.max(0, this.anger - 1);
            this.fear = Math.max(0, this.fear - 1);
        }

        // Pattern matching with first match wins
        for (const { pattern, response } of this.patterns) {
            if (pattern.test(input)) {
                const responseText = response();

                // Clamp emotions again after response may have modified them
                this.anger = Math.max(0, Math.min(20, this.anger));
                this.fear = Math.max(0, Math.min(20, this.fear));
                this.mistrust = Math.max(0, Math.min(15, this.mistrust));

                return responseText;
            }
        }

        return "I don't know what you're getting at.";
    }

    getEmotionalState() {
        return {
            anger: Math.round(this.anger),
            fear: Math.round(this.fear),
            mistrust: Math.round(this.mistrust)
        };
    }

    /**
     * Get a human-readable name for a pattern based on its regex
     */
    getPatternName(pattern) {
        const patternStr = pattern.toString();

        // Map patterns to descriptive names
        if (patternStr.includes('do you gamble|are you a gambler')) return 'Gambling inquiry';
        if (patternStr.includes('avoid.*track|still.*track')) return 'Racetrack avoidance';
        if (patternStr.includes('tell.*about.*gambling')) return 'Gambling details';
        if (patternStr.includes('know.*about.*bookie|anything.*bookie')) return 'Bookie inquiry';
        if (patternStr.includes('happened.*bookie|fight.*bookie')) return 'Bookie incident';
        if (patternStr.includes('tell.*about.*mafia')) return 'Mafia details';
        if (patternStr.includes('mafia|mob|gangster')) return 'Mafia/mob keywords';
        if (patternStr.includes('bookie|bookmaker|betting')) return 'Betting keywords';
        if (patternStr.includes('police|cop|officer')) return 'Police/law enforcement';
        if (patternStr.includes('trust|believe|faith')) return 'Trust keywords';
        if (patternStr.includes('safe|danger|threat')) return 'Safety/danger';
        if (patternStr.includes('racetrack|races|horses')) return 'Horses/racing';
        if (patternStr.includes('watch|follow|spy')) return 'Surveillance keywords';
        if (patternStr.includes('who.*they|they.*after')) return 'Conspiracy inquiry';
        if (patternStr.includes('help|therapy|doctor')) return 'Treatment keywords';
        if (patternStr.includes('medication|pills')) return 'Medication keywords';
        if (patternStr.includes('people.*feel|around.*people')) return 'People feelings';
        if (patternStr.includes('being.*watched|being.*followed')) return 'Being watched';
        if (patternStr.includes('why.*say|why do you')) return 'Why questions';
        if (patternStr.includes('^(why|how|what|when|where|who)')) return 'General questions';
        if (patternStr.includes('friend|family|wife')) return 'Family/friends';
        if (patternStr.includes('money|debt|owe')) return 'Money/debt';
        if (patternStr.includes('feel|feeling|emotion')) return 'Feelings/emotions';
        if (patternStr.includes('kill|murder|hurt')) return 'Violence keywords';
        if (patternStr.includes('phone|call|wire')) return 'Phone/communication';
        if (patternStr.includes('hello|hi|hey')) return 'Greetings';
        if (patternStr.includes('sorry|apologize')) return 'Apologies';
        if (patternStr.includes('bye|goodbye|leave')) return 'Goodbyes';
        if (patternStr.includes('name|who are you')) return 'Name inquiry';
        if (patternStr === '/.*/') return 'Default (catch-all)';

        return 'Pattern ' + patternStr.substring(0, 30) + '...';
    }

    /**
     * Get detailed breakdown of response processing for visualization
     */
    getDetailedBreakdown(input) {
        const steps = [];

        // Capture initial emotional state
        const initialState = {
            anger: this.anger,
            fear: this.fear,
            mistrust: this.mistrust
        };

        // Step 1: Input normalization
        steps.push({
            name: 'Input Received',
            description: 'Raw user input received for processing',
            input: input,
            output: input.trim(),
            details: 'Processing input'
        });

        // Step 2: Emotional baseline check
        const baselineChanges = [];
        if ((this.turnCount + 1) % 5 === 0) {
            baselineChanges.push('Mistrust +1 (every 5 turns)');
        }
        if (this.fear > 12 && this.anger > 12) {
            baselineChanges.push('Mistrust +2 (high fear + anger interaction)');
        }

        steps.push({
            name: 'Baseline Emotional Check',
            description: 'Checking for automatic emotional state changes',
            details: baselineChanges.length > 0
                ? `Baseline adjustments: ${baselineChanges.join(', ')}`
                : 'No baseline adjustments this turn'
        });

        // Step 3: Pattern matching attempts - show ALL patterns tested until match
        const patternTests = [];
        let matchedPattern = null;
        let matchedIndex = -1;

        for (let i = 0; i < this.patterns.length; i++) {
            const { pattern } = this.patterns[i];
            const isMatch = pattern.test(input);
            const isDefault = pattern.toString() === '/.*/' || pattern.toString() === '/.*/i';

            patternTests.push({
                index: i,
                pattern: this.getPatternName(pattern),
                patternRegex: pattern.toString(),
                matched: isMatch,
                isDefault: isDefault
            });

            if (isMatch && matchedIndex === -1) {
                matchedIndex = i;
                matchedPattern = this.patterns[i];
                // Stop after first match (first-match-wins)
                break;
            }
        }

        steps.push({
            name: 'Pattern Matching',
            description: 'Testing input against pattern database (first match wins). PARRY uses regex patterns organized by topic.',
            patternTests: patternTests,
            details: matchedIndex !== -1
                ? `Match: "${this.getPatternName(matchedPattern.pattern)}" (pattern #${matchedIndex + 1})`
                : 'No specific pattern matched, using default response'
        });

        // Step 4: Simulate emotional state changes from the matched pattern
        // Actually get the response to see emotional changes
        this.turnCount++;

        // Gradual escalation of baseline paranoia
        if (this.turnCount % 5 === 0) {
            this.mistrust += 1;
        }

        // Emotional state interactions
        if (this.fear > 12 && this.anger > 12) {
            this.mistrust += 2;
        }

        // Clamp emotional states
        this.anger = Math.max(0, Math.min(20, this.anger));
        this.fear = Math.max(0, Math.min(20, this.fear));
        this.mistrust = Math.max(0, Math.min(15, this.mistrust));

        // Natural decay
        const decayApplied = Math.random() < 0.15;
        if (decayApplied) {
            this.anger = Math.max(0, this.anger - 1);
            this.fear = Math.max(0, this.fear - 1);
        }

        // Find and execute the matched pattern
        let responseText = "I don't know what you're getting at.";
        for (const { pattern, response } of this.patterns) {
            if (pattern.test(input)) {
                responseText = response();
                break;
            }
        }

        // Clamp emotions again after response
        this.anger = Math.max(0, Math.min(20, this.anger));
        this.fear = Math.max(0, Math.min(20, this.fear));
        this.mistrust = Math.max(0, Math.min(15, this.mistrust));

        const finalState = {
            anger: this.anger,
            fear: this.fear,
            mistrust: this.mistrust
        };

        // Calculate changes
        const emotionalChanges = {
            anger: finalState.anger - initialState.anger,
            fear: finalState.fear - initialState.fear,
            mistrust: finalState.mistrust - initialState.mistrust
        };

        steps.push({
            name: 'Emotional State Update',
            description: 'Pattern triggers emotional state changes based on topic sensitivity',
            emotionalState: {
                before: initialState,
                after: finalState,
                changes: emotionalChanges
            },
            details: this.formatEmotionalChanges(emotionalChanges)
        });

        // Step 5: Response selection with pool info
        // Determine which response pool was used
        let responsePool = 'pattern-specific';
        let poolDescription = `Random selection from ${matchedPattern ? 'matched pattern' : 'default'} response pool`;

        if (!matchedPattern || matchedPattern.pattern.toString() === '/.*/') {
            // Default pattern uses emotional state
            if (this.mistrust > 12) {
                responsePool = 'high-mistrust';
                poolDescription = 'High mistrust pool (mistrust > 12)';
            } else if (this.anger > 15) {
                responsePool = 'high-anger';
                poolDescription = 'High anger pool (anger > 15)';
            } else if (this.fear > 15) {
                responsePool = 'high-fear';
                poolDescription = 'High fear pool (fear > 15)';
            } else {
                responsePool = 'moderate-paranoia';
                poolDescription = 'Moderate paranoia pool (default)';
            }
        }

        steps.push({
            name: 'Response Selection',
            description: 'Response randomly selected from pool. Default patterns select pool based on emotional state thresholds.',
            details: poolDescription,
            responseInfo: {
                pool: responsePool,
                poolDescription: poolDescription,
                emotionalThresholds: {
                    highMistrust: 'mistrust > 12',
                    highAnger: 'anger > 15',
                    highFear: 'fear > 15'
                },
                currentState: {
                    anger: finalState.anger,
                    fear: finalState.fear,
                    mistrust: finalState.mistrust
                },
                selectedResponse: responseText
            }
        });

        // No Step 6 - the final response is shown separately by displayBreakdown

        return {
            steps: steps,
            finalResponse: responseText,
            emotionalState: finalState,
            matchedPattern: matchedPattern ? this.getPatternName(matchedPattern.pattern) : 'default'
        };
    }

    /**
     * Format emotional changes for display
     */
    formatEmotionalChanges(changes) {
        const parts = [];
        if (changes.anger !== 0) {
            parts.push(`Anger: ${changes.anger > 0 ? '+' : ''}${changes.anger}`);
        }
        if (changes.fear !== 0) {
            parts.push(`Fear: ${changes.fear > 0 ? '+' : ''}${changes.fear}`);
        }
        if (changes.mistrust !== 0) {
            parts.push(`Mistrust: ${changes.mistrust > 0 ? '+' : ''}${changes.mistrust}`);
        }
        return parts.length > 0 ? parts.join(', ') : 'No emotional changes';
    }

    /**
     * Get detailed breakdown without modifying state (for preview)
     */
    getDetailedBreakdownPreview(input) {
        // Save current state
        const savedAnger = this.anger;
        const savedFear = this.fear;
        const savedMistrust = this.mistrust;
        const savedTurnCount = this.turnCount;

        // Get breakdown
        const breakdown = this.getDetailedBreakdown(input);

        // Restore state
        this.anger = savedAnger;
        this.fear = savedFear;
        this.mistrust = savedMistrust;
        this.turnCount = savedTurnCount;

        return breakdown;
    }
}
