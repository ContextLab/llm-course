#!/usr/bin/env python3
"""
Script to update all lecture .tex files to use the Dartmouth theme
and update the course name to PSYC 51.07: Models of Language and Communication
"""

import os
import re
from pathlib import Path

# Define the slides directory
SLIDES_DIR = Path("/Users/jmanning/llm-course/slides")

# Course name variations to replace
OLD_COURSE_NAMES = [
    r"PSYC 51\.17",
    r"LLM Course",
    r"PSYC 51.17"
]

NEW_COURSE_NAME = "PSYC 51.07: Models of Language and Communication"

def update_tex_file(filepath):
    """Update a single .tex file"""
    print(f"Processing: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace theme
    content = re.sub(r'\\usetheme\{metropolis\}', r'\\usetheme{Dartmouth}', content)

    # Remove old emoji package setup (Dartmouth theme handles this)
    content = re.sub(r'\\usepackage\{emoji\}\s*', '', content)
    content = re.sub(r'\\setemojifont\{[^}]+\}\s*', '', content)

    # Remove old setmainfont calls (Dartmouth theme handles fonts)
    content = re.sub(r'\\setmainfont\{[^}]+\}\s*', '', content)

    # Update course names in author/title fields
    for old_name in OLD_COURSE_NAMES:
        content = re.sub(old_name, NEW_COURSE_NAME, content)

    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath.name}")
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
