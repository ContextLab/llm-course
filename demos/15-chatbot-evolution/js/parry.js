/**
 * PARRY Implementation (1972)
 * Simulates paranoid behavior with emotional states
 */

export class Parry {
    constructor() {
        this.anger = 0;
        this.fear = 0;
        this.suspicion = 50;

        this.patterns = [
            { pattern: /police|cop|law|arrest/i, response: () => { this.suspicion += 20; this.anger += 10; return "Why do you mention the police? Are you trying to get me in trouble?"; }},
            { pattern: /mafia|mob|gang/i, response: () => { this.fear += 15; this.suspicion += 25; return "I knew it! They're after me, aren't they? You're working with them!"; }},
            { pattern: /trust|believe/i, response: () => { this.suspicion += 10; return "Trust? How can I trust anyone when they're all watching me?"; }},
            { pattern: /why|how|what/i, response: () => { this.suspicion += 5; return "You ask too many questions. What are you really after?"; }},
            { pattern: /help|therapy/i, response: () => { this.anger += 5; return "I don't need help! I know what's happening. You're all trying to confuse me."; }},
            { pattern: /friend|family/i, response: () => { this.fear += 5; return "They got to them too. I can't talk to anyone anymore."; }},
            { pattern: /hello|hi/i, response: () => "Who are you? What do you want from me?" },
            { pattern: /sorry/i, response: () => { this.anger -= 5; return "Sure, everyone's sorry. But they keep watching me."; }},
            { pattern: /.*/, response: () => {
                if (this.suspicion > 70) return "I know what you're doing. You can't fool me!";
                if (this.anger > 60) return "Leave me alone! I won't fall for your tricks!";
                if (this.fear > 50) return "They're listening to everything, aren't they?";
                return "I'm not telling you anything. You're probably one of them.";
            }}
        ];
    }

    getResponse(input) {
        this.suspicion = Math.max(0, Math.min(100, this.suspicion));
        this.anger = Math.max(0, Math.min(100, this.anger));
        this.fear = Math.max(0, Math.min(100, this.fear));

        for (const { pattern, response } of this.patterns) {
            if (pattern.test(input)) {
                return response();
            }
        }
        return "I'm not telling you anything.";
    }

    getEmotionalState() {
        return { anger: this.anger, fear: this.fear, suspicion: this.suspicion };
    }
}
