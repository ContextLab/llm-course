#!/usr/bin/env python3
"""
Debug specific pattern matching issues in ELIZA
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import json

# Load rules
script_dir = os.path.dirname(os.path.abspath(__file__))
rules_path = os.path.join(script_dir, '..', 'data', 'eliza-rules.json')
with open(rules_path, 'r') as f:
    data = json.load(f)
    rules = data['rules']
    synonyms = data['synonyms']

# Test cases that are failing
test_cases = [
    ("I am happy", "Should match 'i' keyword pattern '* i am * @happy *'"),
    ("I am depressed", "Should match 'i' keyword pattern '* i am * @sad *'"),
    ("My mother is sick", "Should match 'my' keyword pattern '* my * @family *'"),
    ("You are my friend", "Should match 'you' keyword pattern before 'my' keyword"),
]

print("=" * 80)
print("DEBUGGING PATTERN MATCHING FAILURES")
print("=" * 80)

for test_input, description in test_cases:
    print(f"\n{'='*80}")
    print(f"Input: {test_input}")
    print(f"Description: {description}")
    print(f"{'='*80}")

    # Normalize input
    normalized = test_input.lower()

    # Extract words
    words = normalized.replace(',', ' ').replace('.', ' ').replace('!', ' ').replace('?', ' ').replace(';', ' ').replace(':', ' ')
    words = [w for w in words.split() if w]

    print(f"\nNormalized: {normalized}")
    print(f"Words: {words}")

    # Find matching keywords
    matching_keywords = []
    for rule in rules:
        keyword = rule['keyword'].lower()
        if keyword in words:
            rank = rule.get('rank', 0)
            matching_keywords.append({
                'keyword': keyword,
                'rank': rank,
                'rule': rule
            })

    # Sort by rank (descending)
    matching_keywords.sort(key=lambda x: x['rank'], reverse=True)

    print(f"\nMatching keywords (sorted by rank):")
    for mk in matching_keywords:
        print(f"  - {mk['keyword']} (rank: {mk['rank']})")

    # Check each keyword's patterns
    print(f"\nPattern matching attempts:")
    for mk in matching_keywords:
        print(f"\n  Keyword: {mk['keyword']} (rank: {mk['rank']})")
        for i, pattern_obj in enumerate(mk['rule']['patterns']):
            pattern = pattern_obj['pattern']
            print(f"    Pattern #{i+1}: {pattern}")

            # Check if pattern has synonyms
            if '@' in pattern:
                # Find synonym placeholders
                import re
                syn_matches = re.findall(r'@(\w+)', pattern)
                for syn_key in syn_matches:
                    if syn_key in synonyms:
                        print(f"      Synonym @{syn_key} = {synonyms[syn_key]}")
                    else:
                        print(f"      WARNING: Synonym @{syn_key} not found!")

print("\n" + "=" * 80)
print("ANALYSIS")
print("=" * 80)
print("""
KEY FINDINGS:

1. MISSING RANKS: The 'i' keyword has no rank (defaults to 0)
   - 'am' keyword also has no rank (defaults to 0)
   - When ranks are equal, the keyword appearing first in rules array is tested first
   - 'am' appears before 'i' in the rules array
   - Solution: Add rank to 'i' keyword (suggest rank: 1 or 2)

2. PATTERN ORDER: Within a keyword's patterns array, patterns are tested in order
   - First matching pattern wins
   - More specific patterns should come before general ones

3. SYNONYM EXPANSION: Check that all synonym keys used in patterns exist

RECOMMENDED FIXES:
1. Add "rank": 1 to the "i" keyword
2. Verify all synonym patterns have the correct @synonym_key
3. Ensure pattern order within keywords is correct (specific before general)
""")
