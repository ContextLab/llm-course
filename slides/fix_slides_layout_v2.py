#!/usr/bin/env python3
"""
Enhanced LaTeX slides layout fixer for Beamer presentations.
Fixes additional spacing issues and improves TikZ scaling.
"""

import re
import sys
from pathlib import Path

def additional_spacing_fixes(content):
    """Apply additional spacing fixes"""

    # Reduce em-based spacing
    content = re.sub(r'\\vspace{2em}', r'\\vspace{1em}', content)
    content = re.sub(r'\\vspace{1\.5em}', r'\\vspace{1em}', content)
    content = re.sub(r'\\vspace{3em}', r'\\vspace{1\.5em}', content)

    # Reduce cm spacing that might have been missed
    content = re.sub(r'\\vspace{0\.8cm}', r'\\vspace{0\.4cm}', content)
    content = re.sub(r'\\vspace{0\.6cm}', r'\\vspace{0\.3cm}', content)

    # Reduce spacing before/after blocks
    content = re.sub(r'\\vspace{1cm}\s*\n\s*\\begin{(block|thinkaboutit|discussion|alertblock|exampleblock)}',
                    r'\\vspace{0.3cm}\n\\begin{\1}', content)

    return content

def fix_tikz_font_sizes(content):
    """Reduce font sizes in TikZ labels"""

    # Find TikZ pictures and reduce font sizes in node labels
    def process_tikz(match):
        tikz_content = match.group(0)

        # If nodes have font=\small, change to font=\tiny
        tikz_content = re.sub(r'font=\\small', r'font=\\footnotesize', tikz_content)

        # If nodes have no font specification but have labels, add font=\small
        # This is more complex and might need manual adjustment

        return tikz_content

    content = re.sub(
        r'\\begin{tikzpicture}.*?\\end{tikzpicture}',
        process_tikz,
        content,
        flags=re.DOTALL
    )

    return content

def add_shrink_to_frames_with_tikz(content):
    """Add shrink to frames containing large TikZ diagrams"""

    def process_frame(match):
        frame_content = match.group(0)

        # Check if frame has TikZ and no shrink
        has_tikz = '\\begin{tikzpicture}' in frame_content
        has_shrink = '[shrink' in frame_content or '[fragile' in frame_content

        if has_tikz and not has_shrink:
            # Check TikZ size - if it has drawing commands, likely needs shrink
            num_draw_commands = frame_content.count('\\draw')
            num_nodes = frame_content.count('\\node')

            if num_draw_commands >= 5 or num_nodes >= 5:
                # Add shrink=5 (light shrink for diagrams)
                frame_content = frame_content.replace(
                    '\\begin{frame}{',
                    '\\begin{frame}[shrink=5]{',
                    1
                )

        return frame_content

    content = re.sub(
        r'\\begin{frame}.*?\\end{frame}',
        process_frame,
        content,
        flags=re.DOTALL
    )

    return content

def fix_columns_spacing(content):
    """Reduce spacing in column environments"""

    # Reduce vspace within columns
    def process_columns(match):
        columns_content = match.group(0)

        # Reduce spacing within columns
        columns_content = re.sub(r'\\vspace{0\.5cm}', r'\\vspace{0.2cm}', columns_content)
        columns_content = re.sub(r'\\vspace{0\.3cm}', r'\\vspace{0.15cm}', columns_content)

        return columns_content

    content = re.sub(
        r'\\begin{columns}.*?\\end{columns}',
        process_columns,
        content,
        flags=re.DOTALL
    )

    return content

def process_file(filepath):
    """Process a single LaTeX file with additional fixes"""
    print(f"Processing {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply fixes
    original_content = content
    content = additional_spacing_fixes(content)
    content = fix_tikz_font_sizes(content)
    content = add_shrink_to_frames_with_tikz(content)
    content = fix_columns_spacing(content)

    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Applied additional fixes to {filepath}")
        return True
    else:
        print(f"  - No additional changes needed for {filepath}")
        return False


def main():
    slides_dir = Path('/Users/jmanning/llm-course/slides')

    # Find all lecture*.tex files in week* directories
    lecture_files = []
    for week_dir in sorted(slides_dir.glob('week*')):
        if week_dir.is_dir():
            lecture_files.extend(sorted(week_dir.glob('lecture*.tex')))

    print(f"Found {len(lecture_files)} lecture files for additional fixes\n")

    fixed_count = 0
    for filepath in lecture_files:
        if process_file(filepath):
            fixed_count += 1

    print(f"\n✓ Processed {len(lecture_files)} files")
    print(f"✓ Applied additional fixes to {fixed_count} files")


if __name__ == '__main__':
    main()
