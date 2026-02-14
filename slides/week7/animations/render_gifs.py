#!/usr/bin/env python3
"""
Render all diffusion model animations as transparent looping GIFs.

Usage:
    pip install -r requirements.txt
    python render_gifs.py

Output:
    Creates GIF files in ./gifs/ directory
"""

import os
import subprocess
import sys
from pathlib import Path

# Scene names to render (must match class names in diffusion_scenes.py)
SCENES = [
    "ForwardDiffusion",
    "NoiseSchedule",
    "ReverseProcess",
    "UNetArchitecture",
    "TimestepEmbedding",
    "TrainingObjective",
    "SimplifiedLoss",
    "ScoreMatching",
    "SamplingProcess",
    "DiffusionVsTransformer",
]

# Output settings
OUTPUT_DIR = Path(__file__).parent / "gifs"
MEDIA_DIR = Path(__file__).parent / "media"

# Manim render settings - render as MP4 for quality, convert to GIF after
MANIM_ARGS = [
    "--format=mp4",
    "-r",
    "1920,1080",
    "-q",
    "h",
    "--fps",
    "24",
]


def render_scene(scene_name: str) -> Path:
    """Render a single scene to GIF with transparent background."""
    print(f"\n{'=' * 60}")
    print(f"Rendering: {scene_name}")
    print("=" * 60)

    cmd = [
        sys.executable,
        "-m",
        "manim",
        *MANIM_ARGS,
        "diffusion_scenes.py",
        scene_name,
    ]

    result = subprocess.run(
        cmd,
        cwd=Path(__file__).parent,
        capture_output=False,
    )

    if result.returncode != 0:
        print(f"ERROR: Failed to render {scene_name}")
        return None

    for quality in ["1080p60", "1080p30", "1080p24", "720p30", "480p15"]:
        quality_dir = MEDIA_DIR / "videos" / "diffusion_scenes" / quality
        if quality_dir.exists():
            for mp4_file in quality_dir.glob(f"{scene_name}*.mp4"):
                return mp4_file
    return None


def convert_to_gif(src: Path, scene_name: str):
    """Convert MP4 to high-quality GIF using ffmpeg with palette generation."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    file_name = scene_name.lower()
    dest = OUTPUT_DIR / f"{file_name}.gif"
    palette = OUTPUT_DIR / f"{file_name}_palette.png"

    vf_palette = "fps=24,scale=1920:-1:flags=lanczos,palettegen=reserve_transparent=1:stats_mode=diff"
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src), "-vf", vf_palette, str(palette)],
        capture_output=True,
    )

    vf_gif = "fps=24,scale=1920:-1:flags=lanczos,colorkey=white:0.1:0.0[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-i",
            str(palette),
            "-lavfi",
            vf_gif,
            str(dest),
        ],
        capture_output=True,
    )
    palette.unlink(missing_ok=True)
    subprocess.run(
        ["gifsicle", "--loopcount=1", str(dest), "-o", str(dest)], capture_output=True
    )
    print(f"  -> Saved: {dest}")
    return dest


def main():
    print("=" * 60)
    print("Diffusion Model Animation GIF Renderer")
    print("=" * 60)
    print(f"\nScenes to render: {len(SCENES)}")
    print(f"Output directory: {OUTPUT_DIR}")

    # Check for manim
    try:
        subprocess.run(
            [sys.executable, "-m", "manim", "--version"],
            capture_output=True,
            check=True,
        )
    except subprocess.CalledProcessError:
        print("\nERROR: Manim not installed. Run: pip install -r requirements.txt")
        sys.exit(1)

    # Render each scene
    successful = []
    failed = []

    for scene_name in SCENES:
        mp4_path = render_scene(scene_name)

        if mp4_path:
            dest = convert_to_gif(mp4_path, scene_name)
            successful.append((scene_name, dest))
        else:
            failed.append(scene_name)

    # Summary
    print("\n" + "=" * 60)
    print("RENDER SUMMARY")
    print("=" * 60)
    print(f"Successful: {len(successful)}/{len(SCENES)}")

    if successful:
        print("\nGenerated GIFs:")
        for name, path in successful:
            print(f"  - {path.name}")

    if failed:
        print(f"\nFailed: {len(failed)}")
        for name in failed:
            print(f"  - {name}")

    print(f"\nGIFs saved to: {OUTPUT_DIR.absolute()}")


if __name__ == "__main__":
    main()
