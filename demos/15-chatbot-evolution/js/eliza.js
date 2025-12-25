/**
 * ELIZA Implementation (1966)
 * Classic pattern-matching chatbot by Joseph Weizenbaum
 */

export class Eliza {
    constructor() {
        this.patterns = [
            { pattern: /i need (.*)/i, responses: ["Why do you need {0}?", "Would it really help you to get {0}?", "Are you sure you need {0}?"] },
            { pattern: /why don'?t you (.*)/i, responses: ["Do you really think I don't {0}?", "Perhaps eventually I will {0}.", "Do you really want me to {0}?"] },
            { pattern: /why can'?t I (.*)/i, responses: ["Do you think you should be able to {0}?", "If you could {0}, what would you do?", "I don't know -- why can't you {0}?"] },
            { pattern: /i can'?t (.*)/i, responses: ["How do you know you can't {0}?", "Perhaps you could {0} if you tried.", "What would it take for you to {0}?"] },
            { pattern: /i am (.*)/i, responses: ["Did you come to me because you are {0}?", "How long have you been {0}?", "How do you feel about being {0}?"] },
            { pattern: /i'?m (.*)/i, responses: ["How does being {0} make you feel?", "Do you enjoy being {0}?", "Why do you tell me you're {0}?"] },
            { pattern: /are you (.*)/i, responses: ["Why does it matter whether I am {0}?", "Would you prefer it if I were not {0}?", "Perhaps you believe I am {0}."] },
            { pattern: /what (.*)/i, responses: ["Why do you ask?", "How would an answer to that help you?", "What do you think?"] },
            { pattern: /how (.*)/i, responses: ["How do you suppose?", "Perhaps you can answer your own question.", "What is it you're really asking?"] },
            { pattern: /because (.*)/i, responses: ["Is that the real reason?", "What other reasons come to mind?", "Does that reason apply to anything else?"] },
            { pattern: /(.*) sorry (.*)/i, responses: ["There are many times when no apology is needed.", "What feelings do you have when you apologize?"] },
            { pattern: /hello(.*)/i, responses: ["Hello... I'm glad you could drop by today.", "Hi there... how are you today?", "Hello, how are you feeling today?"] },
            { pattern: /i think (.*)/i, responses: ["Do you doubt {0}?", "Do you really think so?", "But you're not sure {0}?"] },
            { pattern: /(.*) friend (.*)/i, responses: ["Tell me more about your friends.", "When you think of a friend, what comes to mind?", "Why don't you tell me about a childhood friend?"] },
            { pattern: /yes/i, responses: ["You seem quite sure.", "OK, but can you elaborate a bit?"] },
            { pattern: /(.*) computer(.*)/i, responses: ["Are you really talking about me?", "Does it seem strange to talk to a computer?", "How do computers make you feel?"] },
            { pattern: /is it (.*)/i, responses: ["Do you think it is {0}?", "Perhaps it's {0} -- what do you think?", "If it were {0}, what would you do?"] },
            { pattern: /it is (.*)/i, responses: ["You seem very certain.", "If I told you that it probably isn't {0}, what would you feel?"] },
            { pattern: /can you (.*)/i, responses: ["What makes you think I can't {0}?", "If I could {0}, then what?", "Why do you ask if I can {0}?"] },
            { pattern: /can i (.*)/i, responses: ["Perhaps you don't want to {0}.", "Do you want to be able to {0}?", "If you could {0}, would you?"] },
            { pattern: /you are (.*)/i, responses: ["Why do you think I am {0}?", "Does it please you to think that I'm {0}?", "Perhaps you would like me to be {0}."] },
            { pattern: /you'?re (.*)/i, responses: ["Why do you say I am {0}?", "Why do you think I am {0}?", "Are we talking about you, or me?"] },
            { pattern: /i don'?t (.*)/i, responses: ["Don't you really {0}?", "Why don't you {0}?", "Do you want to {0}?"] },
            { pattern: /i feel (.*)/i, responses: ["Good, tell me more about these feelings.", "Do you often feel {0}?", "When do you usually feel {0}?"] },
            { pattern: /i have (.*)/i, responses: ["Why do you tell me that you've {0}?", "Have you really {0}?", "Now that you have {0}, what will you do next?"] },
            { pattern: /i would (.*)/i, responses: ["Could you explain why you would {0}?", "Why would you {0}?", "Who else knows that you would {0}?"] },
            { pattern: /is there (.*)/i, responses: ["Do you think there is {0}?", "It's likely that there is {0}.", "Would you like there to be {0}?"] },
            { pattern: /my (.*)/i, responses: ["I see, your {0}.", "Why do you say your {0}?", "When your {0}, how do you feel?"] },
            { pattern: /you (.*)/i, responses: ["We should be discussing you, not me.", "Why do you say that about me?", "Why do you care whether I {0}?"] },
            { pattern: /always (.*)/i, responses: ["Can you think of a specific example?", "When?", "What incident are you thinking of?", "Really, always?"] },
            { pattern: /(.*)/i, responses: ["Please tell me more.", "Let's change focus a bit... Tell me about your family.", "Can you elaborate on that?", "Why do you say that?", "I see.", "Very interesting.", "I see.  And what does that tell you?", "How does that make you feel?", "How do you feel when you say that?"] }
        ];
    }

    getResponse(input) {
        for (const { pattern, responses } of this.patterns) {
            const match = input.match(pattern);
            if (match) {
                let response = responses[Math.floor(Math.random() * responses.length)];
                for (let i = 1; i < match.length; i++) {
                    response = response.replace(`{${i-1}}`, this.transformPerspective(match[i]));
                }
                return response;
            }
        }
        return "Please tell me more.";
    }

    transformPerspective(text) {
        const replacements = {
            'am': 'are',
            'was': 'were',
            'i': 'you',
            'i\'d': 'you would',
            'i\'ve': 'you have',
            'i\'ll': 'you will',
            'my': 'your',
            'are': 'am',
            'you\'ve': 'I have',
            'you\'ll': 'I will',
            'your': 'my',
            'yours': 'mine',
            'you': 'me',
            'me': 'you'
        };

        return text.split(' ').map(word => {
            const lower = word.toLowerCase();
            return replacements[lower] || word;
        }).join(' ');
    }
}
