#!/usr/bin/env python3
"""Debug pattern expansion issues"""

import json
import re

def expand_synonyms(pattern, synonyms):
    """Expand @synonym markers in pattern."""
    result = pattern
    for match in re.finditer(r'@(\w+)', pattern):
        syn_key = match.group(1)
        if syn_key in synonyms:
            alternatives = '|'.join(synonyms[syn_key])
            result = result.replace(match.group(0), f'({alternatives})')
    return result

def pattern_to_regex(pattern, synonyms):
    """Convert ELIZA pattern to regex."""
    # Escape special chars except * and ()
    regex = re.sub(r'([.+^${}[\]\\])', r'\\\1', pattern)
    # Expand synonyms
    regex = expand_synonyms(regex, synonyms)
    # Convert * to (.*)
    regex = regex.replace('*', '(.*)')
    # Add anchors
    regex = '^' + regex + '$'
    return re.compile(regex, re.IGNORECASE)

# Load rules
with open('/home/user/llm-course/demos/01-eliza/data/eliza-rules.json', 'r') as f:
    rules_data = json.load(f)

synonyms = rules_data['synonyms']

print("TESTING PATTERN EXPANSION")
print("=" * 80)
print()

# Test 1: @everyone synonym
print("Test 1: @everyone synonym expansion")
print("-" * 80)
pattern = "* @everyone *"
regex = pattern_to_regex(pattern, synonyms)
print(f"Original pattern: {pattern}")
print(f"Expanded regex: {regex.pattern}")
print()

test_inputs = [
    " everyone hates me ",
    " everybody hates me ",
    " nobody hates me ",
    " noone hates me "
]

for inp in test_inputs:
    match = regex.match(inp)
    print(f"Input: '{inp}' -> Match: {bool(match)}")
    if match:
        print(f"  Captures: {[g.strip() if g else '' for g in match.groups()]}")
print()

# Test 2: @family synonym
print("Test 2: @family synonym expansion")
print("-" * 80)
pattern = "* my * @family *"
regex = pattern_to_regex(pattern, synonyms)
print(f"Original pattern: {pattern}")
print(f"Expanded regex: {regex.pattern}")
print()

test_inputs = [
    " my mother is sick ",
    " my father was strict ",
    " my sister is nice ",
    " i love my mother "
]

for inp in test_inputs:
    match = regex.match(inp)
    print(f"Input: '{inp}' -> Match: {bool(match)}")
    if match:
        print(f"  Captures: {[g.strip() if g else '' for g in match.groups()]}")
print()

# Test 3: @sad synonym
print("Test 3: @sad synonym expansion")
print("-" * 80)
pattern = "* i am * @sad *"
regex = pattern_to_regex(pattern, synonyms)
print(f"Original pattern: {pattern}")
print(f"Expanded regex: {regex.pattern}")
print()

test_inputs = [
    " i am sad ",
    " i am depressed ",
    " i am unhappy ",
    " i am sick ",
    " i am very sad "
]

for inp in test_inputs:
    match = regex.match(inp)
    print(f"Input: '{inp}' -> Match: {bool(match)}")
    if match:
        print(f"  Captures: {[g.strip() if g else '' for g in match.groups()]}")
print()

# Test 4: Check the actual "i am * @sad *" pattern (note the order)
print("Test 4: Pattern '* i am * @sad *' (with leading *)")
print("-" * 80)
pattern = "* i am * @sad *"
regex = pattern_to_regex(pattern, synonyms)
print(f"Original pattern: {pattern}")
print(f"Expanded regex: {regex.pattern}")
print()

test_inputs = [
    " i am sad ",
    " i am depressed ",
    " well i am sad today "
]

for inp in test_inputs:
    match = regex.match(inp)
    print(f"Input: '{inp}' -> Match: {bool(match)}")
    if match:
        print(f"  Captures: {[g.strip() if g else '' for g in match.groups()]}")
