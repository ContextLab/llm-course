#!/usr/bin/env python3
"""
Compare two ELIZA rules JSON files and report differences.

Usage:
    python scripts/compare_rules.py [old.json] [new.json]
"""

import argparse
import json
import sys
from pathlib import Path


def load_json(path: str) -> dict:
    """Load JSON file."""
    with open(path) as f:
        return json.load(f)


def compare_dicts(old: dict, new: dict, name: str) -> list:
    """Compare two dictionaries and return differences."""
    diffs = []

    old_keys = set(old.keys())
    new_keys = set(new.keys())

    # Keys only in old
    for key in old_keys - new_keys:
        diffs.append(f"  REMOVED: {key} = {old[key]}")

    # Keys only in new
    for key in new_keys - old_keys:
        diffs.append(f"  ADDED: {key} = {new[key]}")

    # Changed values
    for key in old_keys & new_keys:
        if old[key] != new[key]:
            diffs.append(f"  CHANGED: {key}")
            diffs.append(f"    OLD: {old[key]}")
            diffs.append(f"    NEW: {new[key]}")

    return diffs


def compare_lists(old: list, new: list, name: str) -> list:
    """Compare two lists and return differences."""
    diffs = []

    old_set = set(old)
    new_set = set(new)

    for item in old_set - new_set:
        diffs.append(f"  REMOVED: {item}")

    for item in new_set - old_set:
        diffs.append(f"  ADDED: {item}")

    return diffs


def compare_rules(old_rules: list, new_rules: list) -> list:
    """Compare rules arrays and return differences."""
    diffs = []

    old_by_keyword = {r['keyword']: r for r in old_rules}
    new_by_keyword = {r['keyword']: r for r in new_rules}

    old_keywords = set(old_by_keyword.keys())
    new_keywords = set(new_by_keyword.keys())

    # Removed keywords
    for kw in old_keywords - new_keywords:
        diffs.append(f"  KEYWORD REMOVED: {kw}")

    # Added keywords
    for kw in new_keywords - old_keywords:
        diffs.append(f"  KEYWORD ADDED: {kw}")

    # Changed keywords
    for kw in old_keywords & new_keywords:
        old_rule = old_by_keyword[kw]
        new_rule = new_by_keyword[kw]

        rule_diffs = []

        # Check rank
        old_rank = old_rule.get('rank')
        new_rank = new_rule.get('rank')
        if old_rank != new_rank:
            rule_diffs.append(f"    rank: {old_rank} -> {new_rank}")

        # Check patterns
        old_patterns = {p['pattern']: p['responses'] for p in old_rule['patterns']}
        new_patterns = {p['pattern']: p['responses'] for p in new_rule['patterns']}

        old_pattern_keys = set(old_patterns.keys())
        new_pattern_keys = set(new_patterns.keys())

        for p in old_pattern_keys - new_pattern_keys:
            rule_diffs.append(f"    pattern REMOVED: {p}")

        for p in new_pattern_keys - old_pattern_keys:
            rule_diffs.append(f"    pattern ADDED: {p}")

        for p in old_pattern_keys & new_pattern_keys:
            if old_patterns[p] != new_patterns[p]:
                rule_diffs.append(f"    pattern '{p}' responses changed:")
                old_resp_set = set(old_patterns[p])
                new_resp_set = set(new_patterns[p])
                for r in old_resp_set - new_resp_set:
                    rule_diffs.append(f"      REMOVED: {r}")
                for r in new_resp_set - old_resp_set:
                    rule_diffs.append(f"      ADDED: {r}")

        if rule_diffs:
            diffs.append(f"  KEYWORD CHANGED: {kw}")
            diffs.extend(rule_diffs)

    return diffs


def main():
    parser = argparse.ArgumentParser(description="Compare ELIZA rules files")
    parser.add_argument("old", nargs="?", default="/tmp/eliza-rules-backup.json",
                        help="Path to old rules file")
    parser.add_argument("new", nargs="?", default="demos/01-eliza/data/eliza-rules.json",
                        help="Path to new rules file")

    args = parser.parse_args()

    print(f"Comparing:")
    print(f"  OLD: {args.old}")
    print(f"  NEW: {args.new}")
    print()

    old = load_json(args.old)
    new = load_json(args.new)

    total_diffs = 0

    # Compare pre-substitutions
    print("Pre-substitutions:")
    diffs = compare_dicts(old.get('preSubstitutions', {}),
                          new.get('preSubstitutions', {}), 'preSubstitutions')
    if diffs:
        for d in diffs:
            print(d)
        total_diffs += len(diffs)
    else:
        print("  No changes")

    # Compare post-substitutions
    print("\nPost-substitutions:")
    diffs = compare_dicts(old.get('postSubstitutions', {}),
                          new.get('postSubstitutions', {}), 'postSubstitutions')
    if diffs:
        for d in diffs:
            print(d)
        total_diffs += len(diffs)
    else:
        print("  No changes")

    # Compare synonyms
    print("\nSynonyms:")
    old_syn = old.get('synonyms', {})
    new_syn = new.get('synonyms', {})

    old_syn_keys = set(old_syn.keys())
    new_syn_keys = set(new_syn.keys())

    for k in old_syn_keys - new_syn_keys:
        print(f"  REMOVED: {k} = {old_syn[k]}")
        total_diffs += 1

    for k in new_syn_keys - old_syn_keys:
        print(f"  ADDED: {k} = {new_syn[k]}")
        total_diffs += 1

    for k in old_syn_keys & new_syn_keys:
        if set(old_syn[k]) != set(new_syn[k]):
            print(f"  CHANGED: {k}")
            print(f"    OLD: {old_syn[k]}")
            print(f"    NEW: {new_syn[k]}")
            total_diffs += 1

    if total_diffs == 0:
        print("  No changes")

    # Compare quit words
    print("\nQuit words:")
    diffs = compare_lists(old.get('quitWords', []),
                          new.get('quitWords', []), 'quitWords')
    if diffs:
        for d in diffs:
            print(d)
        total_diffs += len(diffs)
    else:
        print("  No changes")

    # Compare greetings
    print("\nInitial greetings:")
    diffs = compare_lists(old.get('initialGreetings', []),
                          new.get('initialGreetings', []), 'initialGreetings')
    if diffs:
        for d in diffs:
            print(d)
        total_diffs += len(diffs)
    else:
        print("  No changes")

    print("\nFinal greetings:")
    diffs = compare_lists(old.get('finalGreetings', []),
                          new.get('finalGreetings', []), 'finalGreetings')
    if diffs:
        for d in diffs:
            print(d)
        total_diffs += len(diffs)
    else:
        print("  No changes")

    # Compare fallbacks
    print("\nFallbacks:")
    diffs = compare_lists(old.get('fallbacks', []),
                          new.get('fallbacks', []), 'fallbacks')
    if diffs:
        for d in diffs:
            print(d)
        total_diffs += len(diffs)
    else:
        print("  No changes")

    # Compare rules
    print("\nRules:")
    diffs = compare_rules(old.get('rules', []), new.get('rules', []))
    if diffs:
        for d in diffs:
            print(d)
        total_diffs += len(diffs)
    else:
        print("  No changes")

    # Summary
    print("\n" + "=" * 60)
    print(f"Total differences found: {total_diffs}")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
