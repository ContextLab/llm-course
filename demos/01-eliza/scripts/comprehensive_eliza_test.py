#!/usr/bin/env python3
"""
Comprehensive ELIZA Testing Suite
Tests pattern matching, pronoun substitution, keyword prioritization,
edge cases, and long conversations.
"""

import json
import re
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class ElizaTester:
    def __init__(self, rules_file):
        """Initialize the tester with rules."""
        with open(rules_file, 'r') as f:
            self.rules_data = json.load(f)

        self.pre_subs = self.rules_data.get('preSubstitutions', {})
        self.post_subs = self.rules_data.get('postSubstitutions', {})
        self.synonyms = self.rules_data.get('synonyms', {})
        self.rules = self.rules_data.get('rules', [])
        self.fallbacks = self.rules_data.get('fallbacks', [])

        # Track response indices for cycling
        self.response_indices = {}

        # Test results
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.issues = []

    def apply_pre_substitutions(self, text):
        """Apply pre-processing substitutions."""
        result = text.lower()
        for old, new in self.pre_subs.items():
            pattern = r'\b' + re.escape(old) + r'\b'
            result = re.sub(pattern, new, result, flags=re.IGNORECASE)
        return result

    def apply_post_substitutions(self, text):
        """Apply post-processing substitutions (reflection)."""
        result = ' ' + text + ' '
        # Sort by length (longer first) to avoid partial matches
        sorted_subs = sorted(self.post_subs.items(), key=lambda x: len(x[0]), reverse=True)
        for old, new in sorted_subs:
            pattern = r'\b' + re.escape(old) + r'\b'
            result = re.sub(pattern, new, result, flags=re.IGNORECASE)
        return result.strip()

    def expand_synonyms(self, pattern):
        """Expand @synonym markers in pattern."""
        result = pattern
        for match in re.finditer(r'@(\w+)', pattern):
            syn_key = match.group(1)
            if syn_key in self.synonyms:
                alternatives = '|'.join(self.synonyms[syn_key])
                result = result.replace(match.group(0), f'({alternatives})')
        return result

    def pattern_to_regex(self, pattern):
        """Convert ELIZA pattern to regex."""
        # Escape special chars except * and ()
        regex = re.sub(r'([.+^${}[\]\\])', r'\\\1', pattern)
        # Expand synonyms
        regex = self.expand_synonyms(regex)
        # Convert * to (.*)
        regex = regex.replace('*', '(.*)')
        # Add anchors
        regex = '^' + regex + '$'
        return re.compile(regex, re.IGNORECASE)

    def match_pattern(self, text, pattern):
        """Try to match text against pattern."""
        regex = self.pattern_to_regex(pattern)
        # Pad with spaces
        padded = ' ' + text + ' '
        match = regex.match(padded)
        if match:
            captures = [g.strip() if g else '' for g in match.groups()]
            return True, captures
        return False, []

    def find_best_match(self, text):
        """Find the best matching rule for input text."""
        # Extract words
        words = re.findall(r'\w+', text.lower())

        # Find rules with keywords in text
        matched_rules = []
        for rule in self.rules:
            keyword = rule['keyword'].lower()
            if keyword in words:
                matched_rules.append(rule)

        # Sort by rank (higher first)
        matched_rules.sort(key=lambda r: r.get('rank', 0), reverse=True)

        # Try to match patterns
        for rule in matched_rules:
            for pattern_obj in rule.get('patterns', []):
                pattern = pattern_obj['pattern']
                matched, captures = self.match_pattern(text, pattern)
                if matched:
                    return rule, pattern_obj, captures

        # Try fallback patterns
        for rule in self.rules:
            for pattern_obj in rule.get('patterns', []):
                if pattern_obj['pattern'] == '*':
                    matched, captures = self.match_pattern(text, pattern_obj['pattern'])
                    if matched:
                        return rule, pattern_obj, captures

        return None, None, []

    def assemble_response(self, template, captures):
        """Assemble response from template and captures."""
        result = template

        # Handle goto statements
        if result.startswith('goto '):
            target_keyword = result[5:].strip()
            target_rule = next((r for r in self.rules if r['keyword'] == target_keyword), None)
            if target_rule and target_rule.get('patterns'):
                pattern_obj = target_rule['patterns'][0]
                # Get and cycle response
                pattern_key = f"{target_keyword}:{pattern_obj['pattern']}"
                if pattern_key not in self.response_indices:
                    self.response_indices[pattern_key] = 0
                idx = self.response_indices[pattern_key]
                result = pattern_obj['responses'][idx]
                self.response_indices[pattern_key] = (idx + 1) % len(pattern_obj['responses'])

        # Replace capture groups
        for i, capture in enumerate(captures, 1):
            marker = f'({i})'
            if marker in result:
                # Apply post-substitutions to capture
                reflected = self.apply_post_substitutions(capture)
                result = result.replace(marker, reflected)

        return result

    def get_response(self, user_input):
        """Get ELIZA response for user input."""
        # Pre-process
        processed = self.apply_pre_substitutions(user_input)

        # Find match
        rule, pattern_obj, captures = self.find_best_match(processed)

        if rule and pattern_obj:
            # Get and cycle response
            pattern_key = f"{rule['keyword']}:{pattern_obj['pattern']}"
            if pattern_key not in self.response_indices:
                self.response_indices[pattern_key] = 0

            idx = self.response_indices[pattern_key]
            template = pattern_obj['responses'][idx]
            self.response_indices[pattern_key] = (idx + 1) % len(pattern_obj['responses'])

            response = self.assemble_response(template, captures)

            return {
                'response': response,
                'keyword': rule['keyword'],
                'pattern': pattern_obj['pattern'],
                'rank': rule.get('rank', 0),
                'captures': captures
            }
        else:
            # Fallback
            return {
                'response': self.fallbacks[0],
                'keyword': 'fallback',
                'pattern': 'none',
                'rank': 0,
                'captures': []
            }

    def log_issue(self, severity, test_name, description, example=None):
        """Log a test issue."""
        issue = {
            'severity': severity,
            'test': test_name,
            'description': description,
            'example': example
        }
        self.issues.append(issue)

    def test_case(self, name, user_input, expected_keyword=None, expected_pattern=None,
                  expected_in_response=None, should_not_contain=None):
        """Run a single test case."""
        self.total_tests += 1
        result = self.get_response(user_input)
        passed = True
        reasons = []

        if expected_keyword and result['keyword'] != expected_keyword:
            passed = False
            reasons.append(f"Expected keyword '{expected_keyword}', got '{result['keyword']}'")

        if expected_pattern and result['pattern'] != expected_pattern:
            passed = False
            reasons.append(f"Expected pattern '{expected_pattern}', got '{result['pattern']}'")

        if expected_in_response:
            if isinstance(expected_in_response, list):
                if not any(exp.lower() in result['response'].lower() for exp in expected_in_response):
                    passed = False
                    reasons.append(f"Expected one of {expected_in_response} in response")
            else:
                if expected_in_response.lower() not in result['response'].lower():
                    passed = False
                    reasons.append(f"Expected '{expected_in_response}' in response")

        if should_not_contain:
            if isinstance(should_not_contain, list):
                found = [s for s in should_not_contain if s.lower() in result['response'].lower()]
                if found:
                    passed = False
                    reasons.append(f"Response should not contain: {found}")
            else:
                if should_not_contain.lower() in result['response'].lower():
                    passed = False
                    reasons.append(f"Response should not contain '{should_not_contain}'")

        if passed:
            self.passed_tests += 1
            print(f"  ✓ {name}")
        else:
            self.failed_tests += 1
            print(f"  ✗ {name}")
            print(f"    Input: {user_input}")
            print(f"    Response: {result['response']}")
            print(f"    Keyword: {result['keyword']}, Pattern: {result['pattern']}")
            print(f"    Reasons: {'; '.join(reasons)}")

        return passed, result

def run_all_tests():
    """Run comprehensive test suite."""
    rules_file = '/home/user/llm-course/demos/01-eliza/data/eliza-rules.json'
    tester = ElizaTester(rules_file)

    print("=" * 80)
    print("COMPREHENSIVE ELIZA TESTING SUITE")
    print("=" * 80)
    print()

    # Test 1: Pronoun Substitution
    print("TEST 1: Pronoun Substitution")
    print("-" * 80)
    tester.test_case("I -> you", "I am happy", expected_in_response="you are")
    tester.test_case("my -> your", "my mother", expected_keyword="my", expected_in_response="your")
    tester.test_case("me -> you", "you help me", expected_in_response="you")
    tester.test_case("myself -> yourself", "I hurt myself", expected_in_response="yourself")
    print()

    # Test 2: Keyword Prioritization
    print("TEST 2: Keyword Prioritization")
    print("-" * 80)
    tester.test_case("Computer (rank 50) beats other keywords",
                     "I want a computer", expected_keyword="computer")
    tester.test_case("Name (rank 15) beats lower ranks",
                     "I want to know your name", expected_keyword="name")
    tester.test_case("Always (rank 1) is low priority",
                     "I always want to remember", expected_keyword="remember")
    print()

    # Test 3: Pattern Matching
    print("TEST 3: Pattern Matching Accuracy")
    print("-" * 80)
    tester.test_case("Exact pattern: 'i remember *'",
                     "I remember my childhood", expected_keyword="remember")
    tester.test_case("Pattern with synonym: 'i @desire *'",
                     "I want happiness", expected_keyword="i")
    tester.test_case("Pattern with synonym: 'i am @sad'",
                     "I am depressed", expected_keyword="i", expected_in_response="sorry")
    tester.test_case("Wildcard pattern match",
                     "You are my friend", expected_keyword="you")
    print()

    # Test 4: Synonym Expansion
    print("TEST 4: Synonym Expansion")
    print("-" * 80)
    tester.test_case("Family synonym: mother",
                     "My mother is sick", expected_keyword="my", expected_in_response="family")
    tester.test_case("Family synonym: father",
                     "My father was strict", expected_keyword="my", expected_in_response="family")
    tester.test_case("Sad synonym: depressed",
                     "I am depressed", expected_in_response="sorry")
    tester.test_case("Desire synonym: need",
                     "I need help", expected_in_response=["mean", "want", "got"])
    print()

    # Test 5: Edge Cases - Empty and Short Inputs
    print("TEST 5: Edge Cases - Empty and Short Inputs")
    print("-" * 80)
    result = tester.get_response("")
    print(f"  Empty input -> {result['response']} (keyword: {result['keyword']})")

    result = tester.get_response("   ")
    print(f"  Whitespace only -> {result['response']} (keyword: {result['keyword']})")

    result = tester.get_response("I")
    print(f"  Single word 'I' -> {result['response']} (keyword: {result['keyword']})")
    print()

    # Test 6: Edge Cases - Very Long Inputs
    print("TEST 6: Edge Cases - Very Long Inputs")
    print("-" * 80)
    long_input = "I remember when I was young and my mother and father would take me to the park and we would play and I was so happy and I felt so loved and everyone was kind to me and I want to go back to that time because I need that happiness again and I can't find it now and I am so depressed and sad all the time."
    result = tester.get_response(long_input)
    print(f"  Very long input ({len(long_input)} chars)")
    print(f"    -> Keyword: {result['keyword']}, Pattern: {result['pattern'][:50]}...")
    print(f"    -> Response: {result['response'][:100]}...")
    print()

    # Test 7: Edge Cases - Special Characters
    print("TEST 7: Edge Cases - Special Characters")
    print("-" * 80)
    result = tester.get_response("I'm sad!!!")
    print(f"  Multiple punctuation 'I'm sad!!!' -> {result['response']}")

    result = tester.get_response("My mother???")
    print(f"  Question marks 'My mother???' -> {result['response']}")

    result = tester.get_response("I... am... confused...")
    print(f"  Ellipses 'I... am... confused...' -> {result['response']}")

    result = tester.get_response("@#$% I need help @#$%")
    print(f"  Special chars with valid input -> {result['response']}")
    print()

    # Test 8: Edge Cases - Repeated Patterns
    print("TEST 8: Edge Cases - Repeated Patterns")
    print("-" * 80)
    responses = []
    for i in range(5):
        result = tester.get_response("I am sad")
        responses.append(result['response'])
    print(f"  'I am sad' repeated 5 times:")
    for i, r in enumerate(responses, 1):
        print(f"    {i}. {r}")
    unique_responses = len(set(responses))
    print(f"  Unique responses: {unique_responses}/5")
    if unique_responses == 1:
        tester.log_issue("MINOR", "Response Cycling",
                        "Same input returns same response repeatedly",
                        "Input: 'I am sad' -> Always: " + responses[0])
    print()

    # Test 9: Multiple Keywords in One Input
    print("TEST 9: Multiple Keywords in One Input")
    print("-" * 80)
    result = tester.get_response("I always remember my mother")
    print(f"  'I always remember my mother' (contains: i, always, remember, my, mother)")
    print(f"    -> Matched keyword: '{result['keyword']}' (rank: {result['rank']})")
    print(f"    -> Response: {result['response']}")

    result = tester.get_response("Can you help me with my computer")
    print(f"  'Can you help me with my computer' (contains: can, you, me, my, computer)")
    print(f"    -> Matched keyword: '{result['keyword']}' (rank: {result['rank']})")
    print(f"    -> Response: {result['response']}")
    print()

    # Test 10: Context Switching
    print("TEST 10: Context Switching")
    print("-" * 80)
    topics = [
        ("I am sad", "sad topic"),
        ("Do you like computers", "computer topic"),
        ("My mother is great", "family topic"),
        ("I remember my childhood", "memory topic"),
        ("I am happy now", "happy topic")
    ]
    for input_text, desc in topics:
        result = tester.get_response(input_text)
        print(f"  {desc}: '{input_text}'")
        print(f"    -> Keyword: {result['keyword']}, Response: {result['response'][:60]}...")
    print()

    # Test 11: LONG CONVERSATION (20 exchanges)
    print("TEST 11: Long Conversation Test (20 exchanges)")
    print("-" * 80)

    # Reset for clean conversation
    tester.response_indices = {}

    conversation = [
        "Hello",
        "I am feeling depressed",
        "My boyfriend made me come here",
        "He says I need help",
        "I want to be happy",
        "My mother never loved me",
        "I remember when she would ignore me",
        "I always felt alone",
        "Everyone seems to hate me",
        "Can you help me?",
        "Why do I feel this way?",
        "I think I am broken",
        "I can't seem to fix myself",
        "Perhaps I should try harder",
        "If I could just be better",
        "I dreamed about my father last night",
        "He was like my mother, cold and distant",
        "You remind me of him",
        "What is your name?",
        "I'm sorry for bothering you"
    ]

    for i, user_input in enumerate(conversation, 1):
        result = tester.get_response(user_input)
        print(f"  {i}. User: {user_input}")
        print(f"     ELIZA: {result['response']}")
        print(f"     [keyword: {result['keyword']}, rank: {result['rank']}]")
        print()

    # Test 12: Goto Statements
    print("TEST 12: Goto Statement Handling")
    print("-" * 80)
    result = tester.get_response("I apologise")
    print(f"  'I apologise' -> keyword: {result['keyword']}")
    print(f"    Response: {result['response']}")
    if 'apologise' in result['response'].lower() or 'apologies' in result['response'].lower():
        print(f"    ✓ Goto 'sorry' worked")
    else:
        print(f"    ✗ Goto 'sorry' may have failed")
        tester.log_issue("MAJOR", "Goto Statements",
                        "'apologise' keyword should goto 'sorry'",
                        f"Input: 'I apologise' -> {result['response']}")

    result = tester.get_response("Everyone hates me")
    print(f"  'Everyone hates me' -> keyword: {result['keyword']}")
    print(f"    Response: {result['response']}")
    print()

    # Test 13: Pre-substitutions
    print("TEST 13: Pre-substitution Handling")
    print("-" * 80)
    test_cases = [
        ("I cant do it", "can't", "i @cannot"),
        ("I dont know", "don't", "i don't"),
        ("Maybe I will", "perhaps", "perhaps"),
        ("I dreamt about you", "dreamed", "i dreamed"),
        ("The machine is broken", "computer", "computer")
    ]
    for input_text, should_convert, expected_pattern in test_cases:
        result = tester.get_response(input_text)
        print(f"  '{input_text}' (should convert '{should_convert}')")
        print(f"    -> Keyword: {result['keyword']}, Response: {result['response'][:60]}...")
    print()

    # Test 14: Response Variety
    print("TEST 14: Response Variety (Response Cycling)")
    print("-" * 80)
    tester.response_indices = {}  # Reset

    all_responses = []
    for i in range(10):
        result = tester.get_response("Why do you ask?")
        all_responses.append(result['response'])

    unique = set(all_responses)
    print(f"  Asked 'Why do you ask?' 10 times")
    print(f"  Unique responses: {len(unique)}")
    for i, resp in enumerate(unique, 1):
        print(f"    {i}. {resp}")

    if len(unique) < 2:
        tester.log_issue("MINOR", "Response Variety",
                        "Same question returns same response without cycling",
                        f"Only got {len(unique)} unique response(s)")
    print()

    # Test 15: Fallback Triggers
    print("TEST 15: Fallback Response Triggers")
    print("-" * 80)
    nonsense_inputs = [
        "asdfasdf qwerqwer",
        "zzz xxx ccc",
        "blahblahblah",
        "12345 67890"
    ]
    for inp in nonsense_inputs:
        result = tester.get_response(inp)
        print(f"  '{inp}' -> {result['response']} (keyword: {result['keyword']})")
    print()

    # SUMMARY
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {tester.total_tests}")
    print(f"Passed: {tester.passed_tests}")
    print(f"Failed: {tester.failed_tests}")
    print(f"Success Rate: {100*tester.passed_tests/tester.total_tests if tester.total_tests > 0 else 0:.1f}%")
    print()

    if tester.issues:
        print("=" * 80)
        print("ISSUES FOUND")
        print("=" * 80)

        # Group by severity
        critical = [i for i in tester.issues if i['severity'] == 'CRITICAL']
        major = [i for i in tester.issues if i['severity'] == 'MAJOR']
        minor = [i for i in tester.issues if i['severity'] == 'MINOR']

        for severity, issues in [('CRITICAL', critical), ('MAJOR', major), ('MINOR', minor)]:
            if issues:
                print(f"\n{severity} Issues ({len(issues)}):")
                for i, issue in enumerate(issues, 1):
                    print(f"{i}. Test: {issue['test']}")
                    print(f"   Description: {issue['description']}")
                    if issue['example']:
                        print(f"   Example: {issue['example']}")
                    print()

    return tester

if __name__ == '__main__':
    tester = run_all_tests()

    # Exit with error code if any tests failed
    sys.exit(0 if tester.failed_tests == 0 else 1)
