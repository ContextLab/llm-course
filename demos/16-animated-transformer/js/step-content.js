// Transformer Animation Step Content
// Each step contains educational content and visual configuration

export const TRANSFORMER_STEPS = [
    {
        id: 1,
        title: "Tokenization",
        description: "Text is split into tokens - subword units that the model can process. Each word may become one or more tokens depending on the vocabulary.",
        formula: null,
        keyInsight: "Tokenization converts human-readable text into a sequence of integers that the model understands.",
        visualConfig: {
            type: "tokenization",
            showArrows: true
        }
    },
    {
        id: 2,
        title: "Token IDs",
        description: "Each token is mapped to a unique integer ID from the model's vocabulary. A typical vocabulary contains 30,000-50,000 tokens.",
        formula: "token → vocab[token] → ID",
        keyInsight: "The vocabulary is learned during training and includes common words, subwords, and special tokens.",
        visualConfig: {
            type: "token-ids",
            showVocab: true
        }
    },
    {
        id: 3,
        title: "Token embeddings",
        description: "Each token ID is converted to a dense vector (embedding) by looking it up in a learned embedding matrix. These vectors capture semantic meaning.",
        formula: "E[token_id] → vector ∈ ℝᵈ",
        keyInsight: "Similar tokens have similar embeddings - this is how the model 'knows' that 'cat' and 'dog' are related.",
        visualConfig: {
            type: "embeddings",
            dimensions: 768
        }
    },
    {
        id: 4,
        title: "Positional encoding",
        description: "Since transformers process all tokens in parallel, we add positional information so the model knows the order of tokens.",
        formula: "PE(pos, 2i) = sin(pos / 10000^(2i/d))\nPE(pos, 2i+1) = cos(pos / 10000^(2i/d))",
        keyInsight: "Without positional encoding, 'The cat sat' and 'sat cat The' would look identical to the model.",
        visualConfig: {
            type: "positional",
            showWaves: true
        }
    },
    {
        id: 5,
        title: "Combined embeddings",
        description: "Token embeddings and positional encodings are added together to create the input representation for the transformer.",
        formula: "X = TokenEmbed + PosEncode",
        keyInsight: "The input to the transformer now contains both 'what' (token meaning) and 'where' (position) information.",
        visualConfig: {
            type: "combined",
            showAddition: true
        }
    },
    {
        id: 6,
        title: "Query, Key, Value projections",
        description: "Each embedding is projected into three separate vectors: Query (what am I looking for?), Key (what do I contain?), and Value (what information do I provide?).",
        formula: "Q = XW_Q,  K = XW_K,  V = XW_V",
        keyInsight: "Think of Q/K/V like a search engine: Query is your search, Keys are document titles, Values are document contents.",
        visualConfig: {
            type: "qkv",
            showMatrices: true
        }
    },
    {
        id: 7,
        title: "Attention scores",
        description: "We compute how much each token should 'attend to' every other token by taking the dot product of Queries and Keys.",
        formula: "Scores = Q · Kᵀ / √d_k",
        keyInsight: "The scaling factor √d_k prevents the dot products from getting too large, which would make softmax outputs too peaked.",
        visualConfig: {
            type: "attention-scores",
            showMatrix: true
        }
    },
    {
        id: 8,
        title: "Softmax normalization",
        description: "Attention scores are normalized using softmax so they sum to 1. This creates a probability distribution over which tokens to attend to.",
        formula: "Attention = softmax(Scores)",
        keyInsight: "After softmax, each row sums to 1 - representing how much 'attention budget' each token allocates to others.",
        visualConfig: {
            type: "softmax",
            showDistribution: true
        }
    },
    {
        id: 9,
        title: "Attention output",
        description: "The final attention output is a weighted sum of Value vectors, where weights come from the attention probabilities.",
        formula: "Output = Attention · V",
        keyInsight: "Each token's new representation is now 'informed' by relevant context from other tokens.",
        visualConfig: {
            type: "attention-output",
            showWeightedSum: true
        }
    },
    {
        id: 10,
        title: "Multi-head attention",
        description: "Instead of one attention mechanism, we run multiple 'heads' in parallel. Each head can learn to focus on different types of relationships.",
        formula: "MultiHead = Concat(head_1, ..., head_h)W_O",
        keyInsight: "One head might learn syntax, another semantics, another coreference - the model decides what's useful.",
        visualConfig: {
            type: "multihead",
            numHeads: 8
        }
    },
    {
        id: 11,
        title: "Feed-forward network",
        description: "After attention, each position passes through a feed-forward network (two linear layers with ReLU activation) independently.",
        formula: "FFN(x) = ReLU(xW_1 + b_1)W_2 + b_2",
        keyInsight: "The FFN adds non-linearity and allows the model to transform representations - attention alone is linear!",
        visualConfig: {
            type: "ffn",
            showLayers: true
        }
    },
    {
        id: 12,
        title: "Stacking and output",
        description: "Multiple transformer blocks are stacked. The final layer's output is projected to vocabulary size to predict the next token.",
        formula: "logits = LayerN_output · W_vocab\nP(next) = softmax(logits)",
        keyInsight: "Deeper layers capture more abstract patterns. GPT-3 has 96 layers, each refining the representation.",
        visualConfig: {
            type: "stacking",
            numLayers: 6
        }
    }
];

export function getStep(stepNumber) {
    return TRANSFORMER_STEPS.find(s => s.id === stepNumber) || TRANSFORMER_STEPS[0];
}

export function getTotalSteps() {
    return TRANSFORMER_STEPS.length;
}
