#!/usr/bin/env python3
"""
Test the ELIZA chatbot with the corrected rules.
Verify that the classic conversation examples work correctly.
"""

import sys
import os

# Add parent directory to path so we can import eliza
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from eliza import ELIZA

def test_conversation():
    """Test the classic ELIZA conversation from Weizenbaum's paper."""

    # Initialize ELIZA
    eliza = ELIZA()

    test_cases = [
        {
            'input': "Men are all alike.",
            'expected_keyword': 'alike',
            'expected_pattern': 'In what way',
            'description': 'Should match "alike" keyword and respond with "In what way?"'
        },
        {
            'input': "They're always bugging us about something or other.",
            'expected_keyword': 'always',
            'expected_pattern': 'Can you think of a specific example',
            'description': 'Should match "always" keyword'
        },
        {
            'input': "Well, my boyfriend made me come here.",
            'expected_keyword': 'my',
            'expected_pattern': 'Your boyfriend',
            'description': 'Should match "my" keyword and transform pronouns'
        },
        {
            'input': "He says I'm depressed much of the time.",
            'expected_keyword': 'sad',
            'expected_pattern': 'I am sorry to hear',
            'description': 'Should match depressed (sad synonym) and give sympathetic response'
        },
        {
            'input': "I need some help, that much seems certain.",
            'expected_keyword': 'desire',
            'expected_pattern': 'What would it mean to you if you got',
            'description': 'Should match "need" (desire synonym)'
        },
        {
            'input': "Perhaps I could learn to get along with my mother.",
            'expected_keyword': 'family',
            'expected_pattern': 'Tell me more about your family',
            'description': 'Should match "mother" (family synonym)'
        },
        {
            'input': "I am sad.",
            'expected_keyword': 'sad',
            'expected_pattern': 'sorry to hear',
            'description': 'Should recognize sad emotion'
        },
        {
            'input': "I want to be happy.",
            'expected_keyword': 'desire',
            'expected_pattern': None,  # Various responses possible
            'description': 'Should match "want" (desire synonym)'
        },
        {
            'input': "I'm sorry.",
            'expected_keyword': 'sorry',
            'expected_pattern': 'apologise',
            'description': 'Should match "sorry" keyword but not too often'
        },
        {
            'input': "Can you help me?",
            'expected_keyword': 'can',
            'expected_pattern': None,
            'description': 'Should match "can" keyword'
        },
        {
            'input': "Why do you ask?",
            'expected_keyword': 'why',
            'expected_pattern': None,
            'description': 'Should match "why" keyword'
        },
        {
            'input': "Everyone hates me.",
            'expected_keyword': 'everyone',
            'expected_pattern': 'Really',
            'description': 'Should match "everyone" keyword'
        },
        {
            'input': "You are like my father.",
            'expected_keyword': 'like',
            'expected_pattern': None,
            'description': 'Should match "like" keyword with @be pattern'
        },
        {
            'input': "I remember my childhood.",
            'expected_keyword': 'remember',
            'expected_pattern': 'Do you often think',
            'description': 'Should match "remember" keyword'
        },
        {
            'input': "If only I could be better.",
            'expected_keyword': 'if',
            'expected_pattern': None,
            'description': 'Should match "if" keyword'
        },
        {
            'input': "I dreamed about you.",
            'expected_keyword': 'dreamed',
            'expected_pattern': None,
            'description': 'Should match "dreamed" keyword'
        },
        {
            'input': "What is your name?",
            'expected_keyword': 'name',
            'expected_pattern': 'not interested in names',
            'description': 'Should match "name" keyword'
        },
        {
            'input': "Do computers think?",
            'expected_keyword': 'computer',
            'expected_pattern': 'computers worry you',
            'description': 'Should match "computer" keyword'
        },
    ]

    print("=" * 80)
    print("TESTING ELIZA WITH CORRECTED RULES")
    print("=" * 80)
    print()

    passed = 0
    failed = 0

    for i, test in enumerate(test_cases, 1):
        print(f"Test {i}: {test['description']}")
        print(f"  Input: {test['input']}")

        response = eliza.respond(test['input'])
        print(f"  Response: {response}")

        # Check if expected pattern appears in response
        if test['expected_pattern']:
            if test['expected_pattern'].lower() in response.lower():
                print(f"  ✓ PASS: Found expected pattern '{test['expected_pattern']}'")
                passed += 1
            else:
                print(f"  ✗ FAIL: Expected pattern '{test['expected_pattern']}' not found")
                failed += 1
        else:
            # Just verify we got a response
            if response and len(response) > 0:
                print(f"  ✓ PASS: Got valid response")
                passed += 1
            else:
                print(f"  ✗ FAIL: No response")
                failed += 1

        print()

    print("=" * 80)
    print(f"RESULTS: {passed} passed, {failed} failed out of {passed + failed} tests")
    print("=" * 80)

    return passed, failed

def test_sorry_priority():
    """Test that 'sorry' doesn't match too frequently."""

    eliza = ELIZA()

    print("\n" + "=" * 80)
    print("TESTING 'SORRY' KEYWORD PRIORITY")
    print("=" * 80)
    print()
    print("Testing that 'sorry' doesn't incorrectly match non-apology statements...")
    print()

    # These should NOT trigger the sorry keyword
    non_apology_inputs = [
        "I am sad and depressed.",
        "I feel unhappy.",
        "I need help.",
        "Can you help me?",
        "I want to be better.",
        "Everyone hates me.",
        "I am lonely.",
        "Why do you ask?",
        "I don't know what to do.",
        "I feel lost.",
    ]

    sorry_count = 0
    for inp in non_apology_inputs:
        response = eliza.respond(inp)
        if 'apologis' in response.lower() or 'apologies' in response.lower():
            print(f"  ✗ FAIL: '{inp}' triggered sorry response: {response}")
            sorry_count += 1
        else:
            print(f"  ✓ PASS: '{inp}' -> {response}")

    if sorry_count == 0:
        print("\n✓ All non-apology inputs avoided 'sorry' response!")
    else:
        print(f"\n✗ {sorry_count} non-apology inputs incorrectly triggered 'sorry' response")

    # These SHOULD trigger the sorry keyword
    print("\nTesting that actual apologies DO trigger 'sorry' response...")
    print()

    apology_inputs = [
        "I'm sorry.",
        "Sorry about that.",
        "I apologize.",
        "I apologise.",
    ]

    for inp in apology_inputs:
        response = eliza.respond(inp)
        if 'apologis' in response.lower() or 'apologies' in response.lower():
            print(f"  ✓ PASS: '{inp}' -> {response}")
        else:
            print(f"  ✗ FAIL: '{inp}' should have triggered sorry response: {response}")

    print()

def interactive_mode():
    """Run ELIZA in interactive mode for manual testing."""

    eliza = ELIZA()

    print("\n" + "=" * 80)
    print("INTERACTIVE MODE")
    print("=" * 80)
    print()
    print(eliza.get_initial_greeting())
    print()
    print("Type 'quit' to exit.")
    print()

    while True:
        try:
            user_input = input("You: ").strip()
            if not user_input:
                continue

            response = eliza.respond(user_input)
            print(f"ELIZA: {response}")
            print()

        except (KeyboardInterrupt, EOFError):
            print("\n\n" + eliza.get_final_greeting())
            break

if __name__ == '__main__':
    # Run automated tests
    passed, failed = test_conversation()
    test_sorry_priority()

    # Optionally run interactive mode
    if len(sys.argv) > 1 and sys.argv[1] == '--interactive':
        interactive_mode()
    else:
        print("\nRun with --interactive flag to test manually.")

    # Exit with error code if tests failed
    sys.exit(0 if failed == 0 else 1)
