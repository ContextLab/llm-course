#!/usr/bin/env python3
"""
Script to add the theme path to all lecture .tex files
"""

import os
import re
from pathlib import Path

# Define the slides directory
SLIDES_DIR = Path("/Users/jmanning/llm-course/slides")

def update_tex_file(filepath):
    """Update a single .tex file to include theme path"""
    print(f"Processing: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Check if \makeatletter and theme path already exist
    if r'\makeatletter' in content and r'\def\input@path' in content:
        print(f"  - Theme path already added to {filepath.name}")
        return False

    # Add the theme path before \usetheme{Dartmouth}
    # Calculate relative path from current file to slides directory
    rel_path = os.path.relpath(SLIDES_DIR, filepath.parent)

    theme_setup = f"""% Add slides directory to search path for Dartmouth theme
\\makeatletter
\\def\\input@path{{{{{rel_path}/}}}}
\\makeatother
"""

    # Insert after documentclass and before usetheme
    pattern = r'(\\documentclass\[.*?\]\{beamer\}\s*\n)(\\usetheme\{Dartmouth\})'

    # Use a lambda to avoid re.sub interpreting backslashes in theme_setup
    def replacer(match):
        return match.group(1) + theme_setup + match.group(2)

    content = re.sub(pattern, replacer, content)

    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Added theme path to {filepath.name}")
        return True
    else:
        print(f"  - No changes needed for {filepath.name}")
        return False

def main():
    """Main function to process all .tex files"""
    # Find all .tex files
    tex_files = list(SLIDES_DIR.glob("**/*.tex"))

    # Exclude test file
    tex_files = [f for f in tex_files if "test_dartmouth_theme" not in str(f)]

    print(f"Found {len(tex_files)} .tex files to process\n")

    updated_count = 0
    for tex_file in sorted(tex_files):
        if update_tex_file(tex_file):
            updated_count += 1

    print(f"\n{'='*60}")
    print(f"Summary: Updated {updated_count} out of {len(tex_files)} files")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
