#!/usr/bin/env python3
"""
Generate correct ELIZA JSON rules from the official instructions.txt file.
This ensures our implementation EXACTLY matches the Weizenbaum specification.
"""

import json
from pathlib import Path

def parse_instructions_txt(filepath):
    """Parse the official ELIZA instructions.txt format and convert to JSON structure."""
    with open(filepath, 'r') as f:
        lines = f.readlines()

    data = {
        'preSubstitutions': {},
        'postSubstitutions': {},
        'synonyms': {},
        'quitWords': [],
        'initialGreetings': [],
        'finalGreetings': [],
        'rules': [],
        'fallbacks': []  # We'll extract these from xnone
    }

    current_rule = None
    current_pattern = None
    seen_quits = set()

    for line in lines:
        line = line.rstrip('\n')
        if not line.strip():
            continue

        # Parse different line types
        if line.startswith('initial:'):
            data['initialGreetings'].append(line.split(':', 1)[1].strip())
        elif line.startswith('final:'):
            data['finalGreetings'].append(line.split(':', 1)[1].strip())
        elif line.startswith('quit:'):
            word = line.split(':', 1)[1].strip()
            if word not in seen_quits:
                data['quitWords'].append(word)
                seen_quits.add(word)
        elif line.startswith('pre:'):
            parts = line.split(':', 1)[1].strip().split(' ', 1)
            # Store as array of words (matching JSON format)
            replacement = parts[1].split() if len(parts) > 1 else []
            data['preSubstitutions'][parts[0]] = ' '.join(replacement) if len(replacement) == 1 else replacement
        elif line.startswith('post:'):
            parts = line.split(':', 1)[1].strip().split(' ', 1)
            replacement = parts[1].split() if len(parts) > 1 else []
            data['postSubstitutions'][parts[0]] = ' '.join(replacement) if len(replacement) == 1 else replacement
        elif line.startswith('synon:'):
            parts = line.split(':', 1)[1].strip().split()
            # First word is the canonical form, rest are synonyms
            data['synonyms'][parts[0]] = parts[1:] if len(parts) > 1 else []
        elif line.startswith('key:'):
            parts = line.split(':', 1)[1].strip().split()
            keyword = parts[0]
            weight = int(parts[1]) if len(parts) > 1 else 1

            current_rule = {
                'keyword': keyword,
                'patterns': []
            }
            if weight != 1:
                current_rule['rank'] = weight

            data['rules'].append(current_rule)
        elif line.strip().startswith('decomp:'):
            pattern = line.split(':', 1)[1].strip()
            save = pattern.startswith('$')
            if save:
                pattern = pattern[2:].strip()  # Remove '$ ' prefix

            current_pattern = {
                'pattern': pattern,
                'responses': []
            }
            if save:
                current_pattern['save'] = True

            current_rule['patterns'].append(current_pattern)
        elif line.strip().startswith('reasmb:'):
            response = line.split(':', 1)[1].strip()
            current_pattern['responses'].append(response)

    # Extract fallbacks from xnone rule
    for rule in data['rules']:
        if rule['keyword'] == 'xnone':
            if rule['patterns']:
                data['fallbacks'] = rule['patterns'][0]['responses'][:]
            break

    return data

def convert_substitutions_to_strings(data):
    """Convert single-word arrays to strings for cleaner JSON."""
    for key, value in data['preSubstitutions'].items():
        if isinstance(value, list) and len(value) == 1:
            data['preSubstitutions'][key] = value[0]

    for key, value in data['postSubstitutions'].items():
        if isinstance(value, list) and len(value) == 1:
            data['postSubstitutions'][key] = value[0]

    return data

def main():
    txt_path = Path('/tmp/eliza_instructions.txt')
    output_path = Path('/Users/jmanning/llm-course/demos/01-eliza/data/eliza-rules.json')

    print(f"Reading official instructions from: {txt_path}")
    data = parse_instructions_txt(txt_path)
    data = convert_substitutions_to_strings(data)

    print(f"\nParsed:")
    print(f"  - {len(data['initialGreetings'])} initial greetings")
    print(f"  - {len(data['finalGreetings'])} final greetings")
    print(f"  - {len(data['quitWords'])} quit words")
    print(f"  - {len(data['preSubstitutions'])} pre-substitutions")
    print(f"  - {len(data['postSubstitutions'])} post-substitutions")
    print(f"  - {len(data['synonyms'])} synonym groups")
    print(f"  - {len(data['rules'])} keyword rules")
    print(f"  - {len(data['fallbacks'])} fallback responses")

    # List all keywords
    print(f"\nKeywords ({len(data['rules'])}):")
    keywords = [r['keyword'] for r in data['rules']]
    print(f"  {', '.join(keywords)}")

    # Write output
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✓ Wrote correct rules to: {output_path}")

if __name__ == '__main__':
    main()
