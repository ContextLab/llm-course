# Diffusion Model Animation GIFs for Lecture 21

This directory contains Python Manim scripts to generate animated GIFs for the diffusion model lecture slides.

## Prerequisites

1. Python 3.9+
2. System dependencies for Manim:
   - macOS: `brew install py3cairo ffmpeg pango`
   - Ubuntu: `sudo apt install libcairo2-dev ffmpeg libpango1.0-dev`

3. Avenir font (for macOS, this is pre-installed)

## Setup

```bash
cd slides/week7/animations
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

## Rendering GIFs

```bash
python render_gifs.py
```

This will:
1. Render each scene as an MP4 via Manim
2. Convert to high-quality GIFs with transparent backgrounds
3. Save GIFs to `./gifs/` directory

## Output

Generated GIFs:
- `forwarddiffusion.gif` - Progressive noising from clean image to pure noise
- `noiseschedule.gif` - Linear vs cosine noise schedules
- `reverseprocess.gif` - Iterative denoising from noise to clean image
- `unetarchitecture.gif` - U-Net encoder-decoder with skip connections
- `timestepembedding.gif` - Sinusoidal timestep conditioning
- `trainingobjective.gif` - Training loop visualization
- `simplifiedloss.gif` - DDPM simplified loss equation breakdown
- `scorematching.gif` - Score function vector field visualization
- `samplingprocess.gif` - DDPM sampling algorithm step by step
- `diffusionvstransformer.gif` - Autoregressive vs diffusion paradigm comparison

## Rendering Individual Scenes

```bash
# Render a single scene
manim -qh --format=mp4 -r 1920,1080 --fps 24 diffusion_scenes.py ForwardDiffusion

# Preview (faster, lower quality)
manim -ql --format=gif --transparent diffusion_scenes.py ForwardDiffusion
```

## Customization

Edit `diffusion_scenes.py` to modify:
- Colors (Dartmouth palette used throughout)
- Font sizes
- Animation timing
- Grid sizes and values

## Integration with Slides

The generated GIFs are designed to have transparent backgrounds, allowing them to overlay seamlessly on the slide background. Reference them in lecture21.md like:

```markdown
![height:500](animations/gifs/forwarddiffusion.gif)
```

## Content Source

Animation content based on:
- [Ho, Jain & Abbeel (2020)](https://arxiv.org/abs/2006.11239) - DDPM
- [Song & Ermon (2019)](https://arxiv.org/abs/1907.05600) - Score matching
- [Ronneberger et al. (2015)](https://arxiv.org/abs/1505.04597) - U-Net architecture
