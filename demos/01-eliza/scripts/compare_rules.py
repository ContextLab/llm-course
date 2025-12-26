#!/usr/bin/env python3
"""
Compare ELIZA rules from original instructions.txt with current eliza-rules.json
Identify all differences in keywords, ranks, patterns, responses, and synonyms.
"""

import json
import re
from typing import Dict, List, Tuple
from collections import defaultdict

def parse_instructions_txt(content: str) -> Dict:
    """Parse the original instructions.txt format into a structured dict."""
    lines = content.strip().split('\n')

    data = {
        'initial': [],
        'final': [],
        'quit': [],
        'pre': {},
        'post': {},
        'synon': {},
        'keys': {}
    }

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        if line.startswith('initial:'):
            data['initial'].append(line.split('initial:', 1)[1].strip())
        elif line.startswith('final:'):
            data['final'].append(line.split('final:', 1)[1].strip())
        elif line.startswith('quit:'):
            data['quit'].append(line.split('quit:', 1)[1].strip())
        elif line.startswith('pre:'):
            parts = line.split('pre:', 1)[1].strip().split(None, 1)
            if len(parts) == 2:
                data['pre'][parts[0]] = parts[1]
        elif line.startswith('post:'):
            parts = line.split('post:', 1)[1].strip().split(None, 1)
            if len(parts) == 2:
                data['post'][parts[0]] = parts[1]
        elif line.startswith('synon:'):
            synon_line = line.split('synon:', 1)[1].strip()
            parts = synon_line.split()
            if parts:
                key = parts[0]
                data['synon'][key] = parts[1:]
        elif line.startswith('key:'):
            # Parse keyword
            key_line = line.split('key:', 1)[1].strip()
            parts = key_line.split()
            keyword = parts[0]
            rank = None
            if len(parts) > 1 and parts[1].isdigit():
                rank = int(parts[1])

            decomps = []
            i += 1

            # Parse decompositions and reassemblies
            while i < len(lines):
                line = lines[i].strip()

                if line.startswith('key:'):
                    i -= 1
                    break
                elif line.startswith('decomp:'):
                    pattern = line.split('decomp:', 1)[1].strip()
                    reasms = []
                    i += 1

                    while i < len(lines):
                        line = lines[i].strip()
                        if line.startswith('decomp:') or line.startswith('key:') or not line:
                            i -= 1
                            break
                        elif line.startswith('reasmb:'):
                            reasm = line.split('reasmb:', 1)[1].strip()
                            reasms.append(reasm)
                        i += 1

                    decomps.append({'pattern': pattern, 'reasms': reasms})

                i += 1

            data['keys'][keyword] = {
                'rank': rank,
                'decomps': decomps
            }

        i += 1

    return data

def compare_rules(original: Dict, current: Dict) -> List[str]:
    """Compare original and current rules, return list of differences."""
    differences = []

    # Compare initial greetings
    orig_initial = set(original['initial'])
    curr_initial = set(current.get('initialGreetings', []))
    if orig_initial != curr_initial:
        differences.append("INITIAL GREETINGS DIFFER:")
        differences.append(f"  Original: {orig_initial}")
        differences.append(f"  Current:  {curr_initial}")
        differences.append("")

    # Compare final greetings
    orig_final = set(original['final'])
    curr_final = set(current.get('finalGreetings', []))
    if orig_final != curr_final:
        differences.append("FINAL GREETINGS DIFFER:")
        differences.append(f"  Original: {orig_final}")
        differences.append(f"  Current:  {curr_final}")
        differences.append("")

    # Compare quit words
    orig_quit = set(original['quit'])
    curr_quit = set(current.get('quitWords', []))
    if orig_quit != curr_quit:
        differences.append("QUIT WORDS DIFFER:")
        differences.append(f"  Original: {orig_quit}")
        differences.append(f"  Current:  {curr_quit}")
        differences.append("")

    # Compare pre-substitutions
    if original['pre'] != current.get('preSubstitutions', {}):
        differences.append("PRE-SUBSTITUTIONS DIFFER:")
        for key in set(list(original['pre'].keys()) + list(current.get('preSubstitutions', {}).keys())):
            orig_val = original['pre'].get(key)
            curr_val = current.get('preSubstitutions', {}).get(key)
            if orig_val != curr_val:
                differences.append(f"  {key}: '{orig_val}' (orig) vs '{curr_val}' (curr)")
        differences.append("")

    # Compare post-substitutions
    if original['post'] != current.get('postSubstitutions', {}):
        differences.append("POST-SUBSTITUTIONS DIFFER:")
        for key in set(list(original['post'].keys()) + list(current.get('postSubstitutions', {}).keys())):
            orig_val = original['post'].get(key)
            curr_val = current.get('postSubstitutions', {}).get(key)
            if orig_val != curr_val:
                differences.append(f"  {key}: '{orig_val}' (orig) vs '{curr_val}' (curr)")
        differences.append("")

    # Compare synonyms
    if original['synon'] != current.get('synonyms', {}):
        differences.append("SYNONYMS DIFFER:")
        all_synon_keys = set(list(original['synon'].keys()) + list(current.get('synonyms', {}).keys()))
        for key in sorted(all_synon_keys):
            orig_val = set(original['synon'].get(key, []))
            curr_val = set(current.get('synonyms', {}).get(key, []))
            if orig_val != curr_val:
                differences.append(f"  {key}:")
                differences.append(f"    Original: {sorted(orig_val)}")
                differences.append(f"    Current:  {sorted(curr_val)}")
        differences.append("")

    # Compare keywords
    orig_keys = set(original['keys'].keys())
    curr_rules = current.get('rules', [])
    curr_keys = set(r['keyword'] for r in curr_rules)

    missing_keys = orig_keys - curr_keys
    extra_keys = curr_keys - orig_keys

    if missing_keys:
        differences.append(f"MISSING KEYWORDS: {sorted(missing_keys)}")
        differences.append("")

    if extra_keys:
        differences.append(f"EXTRA KEYWORDS (not in original): {sorted(extra_keys)}")
        differences.append("")

    # Build current rules lookup
    curr_rules_dict = {r['keyword']: r for r in curr_rules}

    # Compare each keyword in detail
    for keyword in sorted(orig_keys & curr_keys):
        orig_rule = original['keys'][keyword]
        curr_rule = curr_rules_dict[keyword]

        keyword_diffs = []

        # Compare rank
        if orig_rule['rank'] != curr_rule.get('rank'):
            keyword_diffs.append(f"  Rank: {orig_rule['rank']} (orig) vs {curr_rule.get('rank')} (curr)")

        # Compare patterns
        orig_patterns = orig_rule['decomps']
        curr_patterns = curr_rule.get('patterns', [])

        if len(orig_patterns) != len(curr_patterns):
            keyword_diffs.append(f"  Pattern count: {len(orig_patterns)} (orig) vs {len(curr_patterns)} (curr)")

        for i, orig_decomp in enumerate(orig_patterns):
            if i >= len(curr_patterns):
                keyword_diffs.append(f"  Pattern {i+1}: MISSING in current")
                keyword_diffs.append(f"    Original: {orig_decomp['pattern']}")
                continue

            curr_pattern = curr_patterns[i]

            if orig_decomp['pattern'] != curr_pattern.get('pattern'):
                keyword_diffs.append(f"  Pattern {i+1} differs:")
                keyword_diffs.append(f"    Original: {orig_decomp['pattern']}")
                keyword_diffs.append(f"    Current:  {curr_pattern.get('pattern')}")

            # Compare responses
            orig_reasms = orig_decomp['reasms']
            curr_resps = curr_pattern.get('responses', [])

            if set(orig_reasms) != set(curr_resps):
                keyword_diffs.append(f"  Pattern {i+1} responses differ:")
                keyword_diffs.append(f"    Original ({len(orig_reasms)}): {orig_reasms}")
                keyword_diffs.append(f"    Current ({len(curr_resps)}):  {curr_resps}")

        if keyword_diffs:
            differences.append(f"KEYWORD '{keyword}' DIFFERS:")
            differences.extend(keyword_diffs)
            differences.append("")

    return differences

def main():
    # Read original instructions.txt
    with open('/Users/jmanning/llm-course/demos/01-eliza/scripts/instructions.txt', 'r') as f:
        original_content = f.read()

    # Read current eliza-rules.json
    with open('/Users/jmanning/llm-course/demos/01-eliza/data/eliza-rules.json', 'r') as f:
        current_data = json.load(f)

    # Parse original
    original_data = parse_instructions_txt(original_content)

    # Compare
    differences = compare_rules(original_data, current_data)

    # Output
    if differences:
        print("=" * 80)
        print("DIFFERENCES FOUND BETWEEN ORIGINAL AND CURRENT RULES")
        print("=" * 80)
        print()
        for diff in differences:
            print(diff)
        print("=" * 80)
        print(f"\nTotal difference sections: {len([d for d in differences if d.startswith('KEYWORD') or d.startswith('MISSING') or d.startswith('EXTRA')])}")
    else:
        print("No differences found - rules match perfectly!")

if __name__ == '__main__':
    main()
