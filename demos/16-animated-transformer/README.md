# Animated Transformer

An interactive step-by-step visualization of the transformer architecture.

## Overview

This demo walks through the transformer architecture one operation at a time, from text input to next token prediction. Each step includes:

- Animated visualizations built with p5.js
- Educational descriptions explaining the concept
- Mathematical formulas (where applicable)
- Key insights to build intuition

## Steps Covered

1. **Tokenization** - Splitting text into subword tokens
2. **Token IDs** - Mapping tokens to vocabulary indices
3. **Token Embeddings** - Converting IDs to dense vectors
4. **Positional Encoding** - Adding position information with sinusoids
5. **Combined Embeddings** - Merging token and position information
6. **Q/K/V Projections** - Creating Query, Key, and Value matrices
7. **Attention Scores** - Computing dot-product attention
8. **Softmax** - Normalizing scores to probabilities
9. **Attention Output** - Weighted sum of value vectors
10. **Multi-Head Attention** - Running parallel attention heads
11. **Feed-Forward Network** - Position-wise transformation
12. **Stacking & Output** - Multiple layers and final prediction

## Usage

1. Open the demo in a browser
2. Use **Next/Previous** buttons to step through operations
3. Click **Play** for automatic progression
4. Modify the input text to see different tokenizations
5. Click progress dots to jump to specific steps

## Technical Details

Built with:
- **p5.js** for canvas-based animations
- **KaTeX** for math formula rendering
- Custom animation utilities inspired by Manim.js

Font: Avenir (matches course theme)

## Related Lectures

- Lecture 15: Attention Mechanisms
- Lecture 16: Transformer Architecture
- Lecture 17: GPT and Autoregressive Models

## Credits

Inspired by [The Animated Transformer](https://prvnsmpth.github.io/animated-transformer/) and [Manim.js](https://github.com/JazonJiao/Manim.js).
