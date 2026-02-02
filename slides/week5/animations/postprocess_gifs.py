#!/usr/bin/env python3
"""Post-process GIFs: make white background transparent and play once."""

from pathlib import Path
from PIL import Image
import sys

GIFS_DIR = Path(__file__).parent / "gifs"


def process_gif(gif_path: Path) -> None:
    """Convert white background to transparent and set loop=1 (play once)."""
    img = Image.open(gif_path)
    frames = []
    durations = []

    for frame_num in range(img.n_frames):
        img.seek(frame_num)
        frame = img.convert("RGBA")
        data = frame.getdata()
        new_data = []
        for item in data:
            if item[0] > 250 and item[1] > 250 and item[2] > 250:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        frame.putdata(new_data)
        frames.append(frame)
        durations.append(img.info.get("duration", 30))

    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=1,
        disposal=2,
    )


def main():
    if not GIFS_DIR.exists():
        print(f"ERROR: {GIFS_DIR} not found")
        sys.exit(1)

    gif_files = sorted(GIFS_DIR.glob("*.gif"))
    print(f"Processing {len(gif_files)} GIFs...")

    for gif_path in gif_files:
        print(f"  {gif_path.name}...", end=" ", flush=True)
        try:
            process_gif(gif_path)
            print("done")
        except Exception as e:
            print(f"ERROR: {e}")

    print("\nAll GIFs processed.")


if __name__ == "__main__":
    main()
