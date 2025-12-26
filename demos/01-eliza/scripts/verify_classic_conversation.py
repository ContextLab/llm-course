#!/usr/bin/env python3
"""
Verify the classic ELIZA conversation works correctly.
This simulates the famous conversation from Weizenbaum's 1966 paper.
"""

import json
import re

def load_rules(filepath):
    """Load ELIZA rules from JSON file."""
    with open(filepath, 'r') as f:
        return json.load(f)

def apply_pre_substitutions(text, subs):
    """Apply pre-processing substitutions."""
    result = text.lower()
    for old, new in subs.items():
        # Word boundary matching
        pattern = r'\b' + re.escape(old) + r'\b'
        result = re.sub(pattern, new, result, flags=re.IGNORECASE)
    return result

def apply_post_substitutions(text, subs):
    """Apply post-processing substitutions (reflection)."""
    result = ' ' + text + ' '
    # Sort by length (longer first) to avoid partial matches
    sorted_subs = sorted(subs.items(), key=lambda x: len(x[0]), reverse=True)
    for old, new in sorted_subs:
        pattern = r'\b' + re.escape(old) + r'\b'
        result = re.sub(pattern, new, result, flags=re.IGNORECASE)
    return result.strip()

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

def match_pattern(text, pattern, synonyms):
    """Try to match text against pattern."""
    regex = pattern_to_regex(pattern, synonyms)
    # Pad with spaces
    padded = ' ' + text + ' '
    match = regex.match(padded)
    if match:
        captures = [g.strip() if g else '' for g in match.groups()]
        return True, captures
    return False, []

def find_best_match(text, rules, synonyms):
    """Find the best matching rule for input text."""
    # Extract words
    words = re.findall(r'\w+', text.lower())

    # Find rules with keywords in text
    matched_rules = []
    for rule in rules:
        keyword = rule['keyword'].lower()
        if keyword in words:
            matched_rules.append(rule)

    # Sort by rank (higher first)
    matched_rules.sort(key=lambda r: r.get('rank', 0), reverse=True)

    # Try to match patterns
    for rule in matched_rules:
        for pattern_obj in rule.get('patterns', []):
            pattern = pattern_obj['pattern']
            matched, captures = match_pattern(text, pattern, synonyms)
            if matched:
                return rule, pattern_obj, captures

    return None, None, []

def assemble_response(template, captures, post_subs):
    """Assemble response from template and captures."""
    result = template

    # Replace capture groups
    for i, capture in enumerate(captures, 1):
        marker = f'({i})'
        if marker in result:
            # Apply post-substitutions to capture
            reflected = apply_post_substitutions(capture, post_subs)
            result = result.replace(marker, reflected)

    return result

def simulate_conversation(rules_file):
    """Simulate the classic ELIZA conversation."""

    # Load rules
    rules = load_rules(rules_file)

    # Classic conversation from Weizenbaum's paper
    conversation = [
        ("Men are all alike.", "alike", "In what way"),
        ("They're always bugging us about something or other.", "always", "Can you think of a specific example"),
        ("Well, my boyfriend made me come here.", "my", "boyfriend"),
        ("He says I'm depressed much of the time.", "i", "sorry to hear"),
        ("I need some help, that much seems certain.", "i", "What would it mean to you if you got"),
        ("Perhaps I could learn to get along with my mother.", None, "Tell me more about your family"),
    ]

    print("=" * 80)
    print("CLASSIC ELIZA CONVERSATION VERIFICATION")
    print("=" * 80)
    print()

    passed = 0
    failed = 0

    for user_input, expected_keyword, expected_pattern in conversation:
        # Process input
        processed = apply_pre_substitutions(user_input, rules['preSubstitutions'])

        # Find match
        rule, pattern_obj, captures = find_best_match(
            processed,
            rules['rules'],
            rules['synonyms']
        )

        if rule and pattern_obj:
            # Get response
            template = pattern_obj['responses'][0]  # Use first response

            # Handle goto
            if template.startswith('goto '):
                target_keyword = template[5:].strip()
                target_rule = next((r for r in rules['rules'] if r['keyword'] == target_keyword), None)
                if target_rule:
                    template = target_rule['patterns'][0]['responses'][0]

            response = assemble_response(template, captures, rules['postSubstitutions'])
            keyword = rule['keyword']
            rank = rule.get('rank', 'None')
        else:
            # Fallback
            response = rules['fallbacks'][0]
            keyword = 'fallback'
            rank = 0

        # Check if test passed
        test_passed = True
        reasons = []

        if expected_keyword and keyword != expected_keyword:
            test_passed = False
            reasons.append(f"Expected keyword '{expected_keyword}', got '{keyword}'")

        if expected_pattern and expected_pattern.lower() not in response.lower():
            test_passed = False
            reasons.append(f"Expected pattern '{expected_pattern}' not found in response")

        # Print result
        print(f"User: {user_input}")
        print(f"ELIZA: {response}")
        print(f"Matched: keyword='{keyword}' (rank: {rank})")

        if test_passed:
            print("✓ PASS")
            passed += 1
        else:
            print(f"✗ FAIL: {'; '.join(reasons)}")
            failed += 1

        print()

    print("=" * 80)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 80)

    return passed, failed

if __name__ == '__main__':
    import sys

    rules_file = '/Users/jmanning/llm-course/demos/01-eliza/data/eliza-rules.json'

    passed, failed = simulate_conversation(rules_file)

    sys.exit(0 if failed == 0 else 1)
