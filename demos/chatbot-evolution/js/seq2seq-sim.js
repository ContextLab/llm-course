/**
 * Seq2Seq Simulator (2014)
 * Simulated neural responses (actual model too large for browser)
 */

export class Seq2SeqSimulator {
    constructor() {
        this.responses = {
            'hello': 'hi there !',
            'how are you': 'i am fine , thanks .',
            'what is your name': 'i am a neural network .',
            'goodbye': 'bye !',
            'thank you': 'you are welcome .',
            'help': 'what do you need help with ?',
            'yes': 'okay .',
            'no': 'i see .'
        };
    }

    getResponse(input) {
        const normalized = input.toLowerCase().trim();

        // Check for exact matches
        if (this.responses[normalized]) {
            return this.responses[normalized];
        }

        // Check for partial matches
        for (const [key, value] of Object.entries(this.responses)) {
            if (normalized.includes(key)) {
                return value;
            }
        }

        // Generic neural-style responses
        const generic = [
            'i don\'t understand .',
            'can you say that differently ?',
            'interesting .',
            'tell me more .',
            'i see .'
        ];

        return generic[Math.floor(Math.random() * generic.length)];
    }
}
