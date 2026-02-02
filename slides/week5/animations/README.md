# Transformer Animation GIFs for Lecture 15

This directory contains Python Manim scripts to generate animated GIFs for the transformer lecture slides.

## Prerequisites

1. Python 3.9+
2. System dependencies for Manim:
   - macOS: `brew install py3cairo ffmpeg pango`
   - Ubuntu: `sudo apt install libcairo2-dev ffmpeg libpango1.0-dev`

3. Avenir font (for macOS, this is pre-installed)

## Setup

```bash
cd slides/week5/animations
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

## Rendering GIFs

```bash
python render_gifs.py
```

This will:
1. Render each scene as a transparent GIF
2. Save GIFs to `./gifs/` directory
3. Use Avenir font to match course theme

## Output

Generated GIFs:
- `transformer-func.gif` - What is a Transformer?
- `tokenization.gif` - Tokenization process
- `word-embeddings.gif` - Token embeddings
- `position-embeddings.gif` - Positional encoding
- `preparing-embeddings.gif` - Combined embeddings
- `query-key-value.gif` - Q, K, V projections
- `splitting-heads.gif` - Multi-head splitting
- `self-attention.gif` - Attention score computation
- `applying-attention.gif` - Masking and softmax
- `concat-heads.gif` - Concatenating heads
- `feed-forward.gif` - FFN layer
- `going-deeper.gif` - Stacking blocks
- `making-prediction.gif` - Final prediction
- `generating-text.gif` - Autoregressive generation

## Rendering Individual Scenes

```bash
# Render a single scene
manim -qh --format=gif --transparent transformer_scenes.py TransformerFunc

# Preview (faster, lower quality)
manim -ql --format=gif --transparent transformer_scenes.py TransformerFunc
```

## Customization

Edit `transformer_scenes.py` to modify:
- Colors (Dartmouth palette is defined at top)
- Font sizes
- Animation timing
- Matrix values

## Integration with Slides

The generated GIFs are designed to have transparent backgrounds, allowing them to overlay seamlessly on the slide background. Reference them in lecture15.md like:

```markdown
![Transformer Function](animations/gifs/transformer-func.gif)
```

## Content Source

Animation content adapted from:
https://github.com/prvnsmpth/animated-transformer
https://prvnsmpth.github.io/animated-transformer/
