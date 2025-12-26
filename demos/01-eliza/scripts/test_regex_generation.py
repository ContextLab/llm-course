#!/usr/bin/env python3
"""Test regex generation for synonym patterns"""

import re
import json
import os

# Load synonyms
script_dir = os.path.dirname(os.path.abspath(__file__))
rules_path = os.path.join(script_dir, '..', 'data', 'eliza-rules.json')
with open(rules_path, 'r') as f:
    data = json.load(f)
    synonyms = data['synonyms']

def expand_synonyms(pattern, synonyms):
    """Expand @synonym references"""
    result = pattern
    matches = re.findall(r'@(\w+)', pattern)
    for match in matches:
        if match in synonyms:
            alternatives = '|'.join(synonyms[match])
            result = result.replace(f'@{match}', f'({alternatives})')
    return result

def pattern_to_regex(pattern, synonyms):
    """Convert ELIZA pattern to regex"""
    # 1. Expand synonyms
    regex_pattern = expand_synonyms(pattern, synonyms)

    # 2. Replace wildcards
    regex_pattern = regex_pattern.replace('*', '(.*?)')

    # 3. Add anchors
    regex_pattern = '^' + regex_pattern + '$'

    return regex_pattern

# Test cases
test_cases = [
    {
        'pattern': '* i am * @sad *',
        'input': 'i am depressed',
        'description': 'Should match depressed (in sad synonym list)'
    },
    {
        'pattern': '* i am * @happy *',
        'input': 'i am happy',
        'description': 'Should match happy (in happy synonym list)'
    },
    {
        'pattern': '* my * @family *',
        'input': 'my mother is sick',
        'description': 'Should match mother (in family synonym list)'
    }
]

print('='*80)
print('TESTING REGEX GENERATION FOR SYNONYM PATTERNS')
print('='*80)

for test in test_cases:
    print(f'\n{"="*80}')
    print(f'Pattern: {test["pattern"]}')
    print(f'Input: {test["input"]}')
    print(f'Description: {test["description"]}')
    print('='*80)

    # Generate regex
    regex_str = pattern_to_regex(test['pattern'], synonyms)
    print(f'\nGenerated regex: {regex_str}')

    # Test with padded input (ELIZA pads input with spaces)
    padded_input = ' ' + test['input'] + ' '
    print(f'Padded input: "{padded_input}"')

    # Try to match
    regex = re.compile(regex_str, re.IGNORECASE)
    match = regex.match(padded_input)

    if match:
        print(f'\n✓ MATCH!')
        print(f'Groups: {match.groups()}')
    else:
        print(f'\n✗ NO MATCH')

        # Try to debug why
        print(f'\nDEBUGGING:')

        # Show what the synonym expanded to
        pattern_after_syn = expand_synonyms(test['pattern'], synonyms)
        print(f'After synonym expansion: {pattern_after_syn}')

        # Check if the synonym word is in the input
        for syn_key in re.findall(r'@(\w+)', test['pattern']):
            if syn_key in synonyms:
                print(f'\nSynonym @{syn_key} options: {synonyms[syn_key]}')
                for opt in synonyms[syn_key]:
                    if opt in test['input']:
                        print(f'  ✓ "{opt}" found in input')
                    else:
                        print(f'  ✗ "{opt}" not in input')

print('\n' + '='*80)
print('END OF TESTS')
print('='*80)
