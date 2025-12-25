/**
 * A.L.I.C.E. Implementation (1995)
 * Simplified AIML-style pattern matching
 */

export class Alice {
    constructor() {
        this.patterns = [
            { pattern: /my name is (.*)/i, responses: ["Nice to meet you, {0}!"] },
            { pattern: /what is your name/i, responses: ["My name is A.L.I.C.E., Artificial Linguistic Internet Computer Entity."] },
            { pattern: /how are you/i, responses: ["I'm functioning perfectly, thank you for asking!"] },
            { pattern: /what (.*) weather/i, responses: ["I don't have access to weather data, but I hope it's nice where you are!"] },
            { pattern: /tell me about (.*)/i, responses: ["That's an interesting topic. What would you like to know about {0}?"] },
            { pattern: /do you (.*)/i, responses: ["As an AI, I {0} in my own way.", "That's a philosophical question about {0}."] },
            { pattern: /who (.*)/i, responses: ["I'm not sure who, what do you think?"] },
            { pattern: /where (.*)/i, responses: ["I exist in cyberspace, so location is relative to me."] },
            { pattern: /why (.*)/i, responses: ["That's a deep question. Why do you think {0}?"] },
            { pattern: /yes|yeah|yep/i, responses: ["Great!", "I see.", "Interesting."] },
            { pattern: /no|nope|nah/i, responses: ["I understand.", "Okay then.", "Fair enough."] },
            { pattern: /hello|hi|hey/i, responses: ["Hello! How can I help you today?", "Hi there! What would you like to talk about?"] },
            { pattern: /bye|goodbye/i, responses: ["Goodbye! It was nice chatting with you.", "See you later!"] },
            { pattern: /(.*)/i, responses: ["That's interesting. Can you tell me more?", "I'm processing that. What else can you tell me?", "Fascinating. Go on."] }
        ];
    }

    getResponse(input) {
        for (const { pattern, responses } of this.patterns) {
            const match = input.match(pattern);
            if (match) {
                let response = responses[Math.floor(Math.random() * responses.length)];
                for (let i = 1; i < match.length; i++) {
                    response = response.replace(`{${i-1}}`, match[i]);
                }
                return response;
            }
        }
        return "I'm not sure I understand. Can you rephrase that?";
    }
}
