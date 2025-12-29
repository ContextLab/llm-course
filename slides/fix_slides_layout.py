#!/usr/bin/env python3
"""
Systematic LaTeX slides layout fixer for Beamer presentations.
Applies common fixes to prevent overfull boxes and improve layout.
"""

import re
import sys
from pathlib import Path

def fix_frame_layout(content):
    """Apply systematic fixes to frame layouts"""

    # Pattern 1: Add shrink to frames with many itemize items or long content
    # Find frames with 5+ \item entries
    def count_items_in_frame(match):
        frame_content = match.group(0)
        item_count = frame_content.count('\\item')
        enum_count = frame_content.count('\\begin{enumerate}') + frame_content.count('\\begin{itemize}')

        # If frame has many items or nested lists, add shrink
        if item_count >= 6 or enum_count >= 2:
            # Check if it already has shrink
            if '[shrink' not in frame_content and '[fragile' not in frame_content:
                # Add shrink=10
                frame_content = frame_content.replace('\\begin{frame}{', '\\begin{frame}[shrink=10]{', 1)

        return frame_content

    # Process all frames
    content = re.sub(
        r'\\begin{frame}\{.*?\}.*?\\end{frame}',
        count_items_in_frame,
        content,
        flags=re.DOTALL
    )

    # Pattern 2: Reduce vspace in frames
    content = re.sub(r'\\vspace{0\.5cm}', r'\\vspace{0.3cm}', content)
    content = re.sub(r'\\vspace{0\.7cm}', r'\\vspace{0.4cm}', content)
    content = re.sub(r'\\vspace{1cm}', r'\\vspace{0.5cm}', content)

    # Pattern 3: Add \small to frames with tcolorbox + long itemize
    def add_small_to_busy_frames(match):
        frame_content = match.group(0)

        # Check if frame has tcolorbox and itemize
        has_tcolorbox = '\\begin{thinkaboutit}' in frame_content or '\\begin{discussion}' in frame_content or '\\begin{block}' in frame_content
        has_itemize = '\\begin{itemize}' in frame_content or '\\begin{enumerate}' in frame_content
        item_count = frame_content.count('\\item')

        if has_tcolorbox and has_itemize and item_count >= 4:
            # Add \small after \begin{frame}...
            if '\\small' not in frame_content:
                frame_content = re.sub(
                    r'(\\begin{frame}(?:\[.*?\])?\{.*?\}\n)',
                    r'\1\\small\n',
                    frame_content,
                    count=1
                )

        return frame_content

    content = re.sub(
        r'\\begin{frame}.*?\\end{frame}',
        add_small_to_busy_frames,
        content,
        flags=re.DOTALL
    )

    # Pattern 4: Add \setlength{\itemsep}{0pt} to itemize/enumerate
    # Match itemize environments without itemsep already set
    def fix_itemize(match):
        env_name = match.group(1)
        # Check if itemsep is already set
        if '\\setlength{\\itemsep}' not in match.group(0):
            return f'\\begin{{{env_name}}}\\setlength{{\\itemsep}}{{0pt}}'
        return match.group(0)

    content = re.sub(
        r'\\begin{(itemize|enumerate)}',
        fix_itemize,
        content
    )

    # Pattern 5: Scale down TikZ pictures that are likely too large
    def scale_tikz(match):
        tikz_content = match.group(0)

        # If no scale is set, add scale=0.85
        if 'scale=' not in tikz_content:
            tikz_content = tikz_content.replace(
                '\\begin{tikzpicture}',
                '\\begin{tikzpicture}[scale=0.85]',
                1
            )
        else:
            # Reduce existing scale by 10% if it's 1.0 or higher
            def reduce_scale(scale_match):
                current_scale = float(scale_match.group(1))
                if current_scale >= 1.0:
                    new_scale = current_scale * 0.9
                    return f'scale={new_scale:.2f}'
                return scale_match.group(0)

            tikz_content = re.sub(r'scale=(\d+\.?\d*)', reduce_scale, tikz_content)

        return tikz_content

    content = re.sub(
        r'\\begin{tikzpicture}(?:\[.*?\])?.*?\\end{tikzpicture}',
        scale_tikz,
        content,
        flags=re.DOTALL
    )

    # Pattern 6: Add shrink to titlepage if not present
    content = re.sub(
        r'\\begin{frame}\s*\n\\titlepage',
        r'\\begin{frame}[shrink=10]\n\\titlepage',
        content
    )

    # Pattern 7: Add shrink to table of contents if not present
    content = re.sub(
        r'\\begin{frame}\{([^}]*?Journey[^}]*?)\}\s*\n\\tableofcontents',
        r'\\begin{frame}[shrink=5]{\1}\n\\tableofcontents',
        content
    )

    return content


def process_file(filepath):
    """Process a single LaTeX file"""
    print(f"Processing {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply fixes
    original_content = content
    content = fix_frame_layout(content)

    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Fixed {filepath}")
        return True
    else:
        print(f"  - No changes needed for {filepath}")
        return False


def main():
    slides_dir = Path('/Users/jmanning/llm-course/slides')

    # Find all lecture*.tex files in week* directories
    lecture_files = []
    for week_dir in sorted(slides_dir.glob('week*')):
        if week_dir.is_dir():
            lecture_files.extend(sorted(week_dir.glob('lecture*.tex')))

    print(f"Found {len(lecture_files)} lecture files to process\n")

    fixed_count = 0
    for filepath in lecture_files:
        if process_file(filepath):
            fixed_count += 1

    print(f"\n✓ Processed {len(lecture_files)} files")
    print(f"✓ Fixed {fixed_count} files")


if __name__ == '__main__':
    main()
