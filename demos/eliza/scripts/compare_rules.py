#!/usr/bin/env python3
"""
Compare ELIZA rules between the official instructions.txt and our JSON implementation.
This script identifies missing rules, extra rules, and differences.
"""

import json
import re
from pathlib import Path

def parse_instructions_txt(filepath):
    """Parse the official ELIZA instructions.txt format."""
    with open(filepath, 'r') as f:
        lines = f.readlines()

    data = {
        'initials': [],
        'finals': [],
        'quits': [],
        'pres': {},
        'posts': {},
        'synonyms': {},
        'keywords': []
    }

    current_key = None
    current_decomp = None

    for line in lines:
        line = line.rstrip('\n')
        if not line.strip():
            continue

        # Parse different line types
        if line.startswith('initial:'):
            data['initials'].append(line.split(':', 1)[1].strip())
        elif line.startswith('final:'):
            data['finals'].append(line.split(':', 1)[1].strip())
        elif line.startswith('quit:'):
            word = line.split(':', 1)[1].strip()
            if word not in data['quits']:
                data['quits'].append(word)
        elif line.startswith('pre:'):
            parts = line.split(':', 1)[1].strip().split(' ', 1)
            data['pres'][parts[0]] = parts[1] if len(parts) > 1 else ''
        elif line.startswith('post:'):
            parts = line.split(':', 1)[1].strip().split(' ', 1)
            data['posts'][parts[0]] = parts[1] if len(parts) > 1 else ''
        elif line.startswith('synon:'):
            parts = line.split(':', 1)[1].strip().split()
            data['synonyms'][parts[0]] = parts[1:] if len(parts) > 1 else []
        elif line.startswith('key:'):
            parts = line.split(':', 1)[1].strip().split()
            keyword = parts[0]
            weight = int(parts[1]) if len(parts) > 1 else 1
            current_key = {
                'keyword': keyword,
                'rank': weight,
                'decomps': []
            }
            data['keywords'].append(current_key)
        elif line.strip().startswith('decomp:'):
            pattern = line.split(':', 1)[1].strip()
            save = pattern.startswith('$')
            if save:
                pattern = pattern[1:].strip()
            current_decomp = {
                'pattern': pattern,
                'save': save,
                'responses': []
            }
            current_key['decomps'].append(current_decomp)
        elif line.strip().startswith('reasmb:'):
            response = line.split(':', 1)[1].strip()
            current_decomp['responses'].append(response)

    return data

def parse_json_rules(filepath):
    """Parse our current JSON rules format."""
    with open(filepath, 'r') as f:
        data = json.load(f)

    result = {
        'initials': data.get('initialGreetings', []),
        'finals': data.get('finalGreetings', []),
        'quits': data.get('quitWords', []),
        'pres': data.get('preSubstitutions', {}),
        'posts': data.get('postSubstitutions', {}),
        'synonyms': data.get('synonyms', {}),
        'keywords': [],
        'fallbacks': data.get('fallbacks', [])
    }

    for rule in data.get('rules', []):
        keyword = {
            'keyword': rule['keyword'],
            'rank': rule.get('rank', 1),
            'decomps': []
        }
        for pattern in rule.get('patterns', []):
            decomp = {
                'pattern': pattern.get('pattern', '*'),
                'save': pattern.get('save', False),
                'responses': pattern.get('responses', [])
            }
            keyword['decomps'].append(decomp)
        result['keywords'].append(keyword)

    return result

def compare_rules(official, current):
    """Compare official rules with current implementation."""
    issues = []

    # Compare keywords
    official_keywords = {k['keyword'] for k in official['keywords']}
    current_keywords = {k['keyword'] for k in current['keywords']}

    missing_keywords = official_keywords - current_keywords
    extra_keywords = current_keywords - official_keywords

    if missing_keywords:
        issues.append(f"MISSING KEYWORDS: {sorted(missing_keywords)}")
    if extra_keywords:
        issues.append(f"EXTRA KEYWORDS (not in official): {sorted(extra_keywords)}")

    # Compare each keyword's decomps and responses
    official_by_kw = {k['keyword']: k for k in official['keywords']}
    current_by_kw = {k['keyword']: k for k in current['keywords']}

    for kw in sorted(official_keywords & current_keywords):
        off = official_by_kw[kw]
        cur = current_by_kw[kw]

        # Check rank
        if off['rank'] != cur.get('rank', 1):
            issues.append(f"RANK MISMATCH for '{kw}': official={off['rank']}, current={cur.get('rank', 1)}")

        # Check number of decomps
        if len(off['decomps']) != len(cur['decomps']):
            issues.append(f"DECOMP COUNT MISMATCH for '{kw}': official={len(off['decomps'])}, current={len(cur['decomps'])}")

        # Check each decomp pattern
        for i, (off_d, cur_d) in enumerate(zip(off['decomps'], cur['decomps'])):
            if off_d['pattern'] != cur_d['pattern']:
                issues.append(f"PATTERN MISMATCH for '{kw}' decomp {i}: official='{off_d['pattern']}', current='{cur_d['pattern']}'")

            # Check responses
            if len(off_d['responses']) != len(cur_d['responses']):
                issues.append(f"RESPONSE COUNT MISMATCH for '{kw}' decomp {i}: official={len(off_d['responses'])}, current={len(cur_d['responses'])}")

    # Compare pre/post substitutions
    for sub_type in ['pres', 'posts']:
        off_subs = official[sub_type]
        cur_subs = current[sub_type]

        missing = set(off_subs.keys()) - set(cur_subs.keys())
        extra = set(cur_subs.keys()) - set(off_subs.keys())

        if missing:
            issues.append(f"MISSING {sub_type.upper()}: {sorted(missing)}")
        if extra:
            issues.append(f"EXTRA {sub_type.upper()}: {sorted(extra)}")

    # Compare synonyms
    off_syn = official['synonyms']
    cur_syn = current['synonyms']

    missing = set(off_syn.keys()) - set(cur_syn.keys())
    extra = set(cur_syn.keys()) - set(off_syn.keys())

    if missing:
        issues.append(f"MISSING SYNONYMS: {sorted(missing)}")
    if extra:
        issues.append(f"EXTRA SYNONYMS: {sorted(extra)}")

    return issues

def main():
    script_dir = Path(__file__).parent.parent
    json_path = script_dir / 'data' / 'eliza-rules.json'
    txt_path = Path('/tmp/eliza_instructions.txt')

    print("=" * 60)
    print("ELIZA Rules Comparison")
    print("=" * 60)
    print(f"\nOfficial: {txt_path}")
    print(f"Current:  {json_path}\n")

    official = parse_instructions_txt(txt_path)
    current = parse_json_rules(json_path)

    print(f"Official keywords: {len(official['keywords'])}")
    print(f"Current keywords:  {len(current['keywords'])}")
    print()

    issues = compare_rules(official, current)

    if issues:
        print("ISSUES FOUND:")
        print("-" * 40)
        for issue in issues:
            print(f"  • {issue}")
    else:
        print("✓ No issues found - rules match!")

    # Print summary
    print("\n" + "=" * 60)
    print("KEYWORD SUMMARY")
    print("=" * 60)

    official_keywords = sorted([k['keyword'] for k in official['keywords']])
    current_keywords = sorted([k['keyword'] for k in current['keywords']])

    print(f"\nOfficial keywords ({len(official_keywords)}):")
    print(", ".join(official_keywords))

    print(f"\nCurrent keywords ({len(current_keywords)}):")
    print(", ".join(current_keywords))

    return len(issues)

if __name__ == '__main__':
    exit(main())
