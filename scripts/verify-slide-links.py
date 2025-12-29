#!/usr/bin/env python3
"""
Verify all internal links in slides/README.md
Checks that referenced files actually exist in the repository.
"""

import re
import os
import sys
from pathlib import Path

def find_repo_root():
    """Find the repository root directory."""
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / '.git').exists():
            return current
        current = current.parent
    raise RuntimeError("Could not find repository root")

def extract_internal_links(readme_path):
    """Extract all internal GitHub links from README."""
    with open(readme_path, 'r') as f:
        content = f.read()

    # Match GitHub raw file links
    github_pattern = r'https://github\.com/ContextLab/llm-course/blob/main/([^\s\)]+)'
    # Match relative links
    relative_pattern = r'\[([^\]]+)\]\(([^http][^\s\)]+)\)'
    # Match GitHub Pages links for slides
    pages_pattern = r'https://contextlab\.github\.io/llm-course/slides/([^\s\)]+)'

    links = []

    for match in re.finditer(github_pattern, content):
        path = match.group(1)
        links.append(('github', path, match.start()))

    for match in re.finditer(pages_pattern, content):
        path = f"slides/{match.group(1)}"
        # Convert .html to source format
        if path.endswith('.html'):
            # Could be from .ipynb or .tex
            base = path[:-5]
            links.append(('pages', f"{base}.ipynb", match.start()))

    return links

def verify_links(repo_root, links):
    """Verify that all linked files exist."""
    errors = []
    warnings = []

    for link_type, path, position in links:
        # Handle PDF links - check for .tex source
        if path.endswith('.pdf'):
            tex_path = path[:-4] + '.tex'
            full_path = repo_root / tex_path
            if not full_path.exists():
                # Check for individual lecture files
                errors.append(f"Missing source for {path}: expected {tex_path}")
        elif path.endswith('.ipynb'):
            full_path = repo_root / path
            if not full_path.exists():
                errors.append(f"Missing file: {path}")
        else:
            full_path = repo_root / path
            if not full_path.exists():
                warnings.append(f"File not found: {path}")

    return errors, warnings

def main():
    repo_root = find_repo_root()
    readme_path = repo_root / 'slides' / 'README.md'

    if not readme_path.exists():
        print(f"❌ README not found: {readme_path}")
        sys.exit(1)

    print(f"🔍 Checking links in {readme_path}")
    print(f"📁 Repository root: {repo_root}")
    print()

    links = extract_internal_links(readme_path)
    print(f"Found {len(links)} internal links to verify")

    errors, warnings = verify_links(repo_root, links)

    if warnings:
        print(f"\n⚠️  Warnings ({len(warnings)}):")
        for w in warnings:
            print(f"  - {w}")

    if errors:
        print(f"\n❌ Errors ({len(errors)}):")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("\n✅ All critical links verified!")

if __name__ == '__main__':
    main()
