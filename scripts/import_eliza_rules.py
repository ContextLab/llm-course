#!/usr/bin/env python3
"""
Import ELIZA rules from the original Weizenbaum format (instructions.txt)
to our JSON format used by the JavaScript ELIZA engine.

Source: https://github.com/ContextLab/cs-for-psych/blob/master/assignments/eliza/instructions.txt

Usage:
    python scripts/import_eliza_rules.py [--url URL] [--output PATH]

Options:
    --url URL       URL to fetch rules from (default: GitHub raw URL)
    --output PATH   Output path for JSON file (default: demos/01-eliza/data/eliza-rules.json)
    --verbose       Print detailed parsing information
"""

import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path


DEFAULT_URL = "https://raw.githubusercontent.com/ContextLab/cs-for-psych/master/assignments/eliza/instructions.txt"
DEFAULT_OUTPUT = "demos/01-eliza/data/eliza-rules.json"


def fetch_rules(url: str) -> str:
    """Fetch rules from URL."""
    print(f"Fetching rules from: {url}")
    with urllib.request.urlopen(url) as response:
        content = response.read().decode('utf-8')
    print(f"Fetched {len(content)} bytes")
    return content


def parse_rules(content: str, verbose: bool = False) -> dict:
    """Parse the instructions.txt format into our JSON structure."""

    result = {
        "preSubstitutions": {},
        "postSubstitutions": {},
        "synonyms": {},
        "quitWords": [],
        "initialGreetings": [],
        "finalGreetings": [],
        "rules": [],
        "fallbacks": []
    }

    lines = content.strip().split('\n')

    current_keyword = None
    current_rank = None
    current_decomp = None
    current_responses = []
    current_patterns = []

    # Track seen quit words to avoid duplicates
    seen_quit_words = set()

    def save_current_decomp():
        """Save current decomposition pattern if exists."""
        nonlocal current_decomp, current_responses
        if current_decomp is not None and current_responses:
            current_patterns.append({
                "pattern": current_decomp,
                "responses": current_responses.copy()
            })
            current_responses = []
            current_decomp = None

    def save_current_keyword():
        """Save current keyword if exists."""
        nonlocal current_keyword, current_rank, current_patterns
        save_current_decomp()

        if current_keyword is not None and current_patterns:
            rule = {
                "keyword": current_keyword,
                "patterns": current_patterns.copy()
            }
            if current_rank is not None:
                rule["rank"] = current_rank

            # Special handling for xnone - these are fallback responses
            if current_keyword == "xnone":
                # Extract responses as fallbacks
                for pattern in current_patterns:
                    result["fallbacks"].extend(pattern["responses"])
            else:
                result["rules"].append(rule)

            current_patterns = []
            current_keyword = None
            current_rank = None

    for line in lines:
        line = line.rstrip()

        # Skip empty lines
        if not line.strip():
            continue

        # Parse initial greetings
        if line.startswith("initial:"):
            greeting = line[8:].strip()
            result["initialGreetings"].append(greeting)
            if verbose:
                print(f"Initial greeting: {greeting}")
            continue

        # Parse final greetings
        if line.startswith("final:"):
            greeting = line[6:].strip()
            result["finalGreetings"].append(greeting)
            if verbose:
                print(f"Final greeting: {greeting}")
            continue

        # Parse quit words (avoid duplicates)
        if line.startswith("quit:"):
            word = line[5:].strip()
            if word not in seen_quit_words:
                result["quitWords"].append(word)
                seen_quit_words.add(word)
                if verbose:
                    print(f"Quit word: {word}")
            continue

        # Parse pre-substitutions
        if line.startswith("pre:"):
            parts = line[4:].strip().split(None, 1)
            if len(parts) == 2:
                result["preSubstitutions"][parts[0]] = parts[1]
                if verbose:
                    print(f"Pre-sub: {parts[0]} -> {parts[1]}")
            continue

        # Parse post-substitutions
        if line.startswith("post:"):
            parts = line[5:].strip().split(None, 1)
            if len(parts) == 2:
                result["postSubstitutions"][parts[0]] = parts[1]
                if verbose:
                    print(f"Post-sub: {parts[0]} -> {parts[1]}")
            continue

        # Parse synonyms
        if line.startswith("synon:"):
            parts = line[6:].strip().split()
            if len(parts) >= 2:
                # First word is the synonym group name, rest are members
                group_name = parts[0]
                members = parts[1:]
                result["synonyms"][group_name] = members
                if verbose:
                    print(f"Synonym group '{group_name}': {members}")
            continue

        # Parse keyword (key: keyword [rank])
        if line.startswith("key:"):
            save_current_keyword()

            key_part = line[4:].strip()
            # Check for rank number
            match = re.match(r'(\S+)\s+(\d+)$', key_part)
            if match:
                current_keyword = match.group(1)
                current_rank = int(match.group(2))
            else:
                current_keyword = key_part
                current_rank = None

            if verbose:
                rank_str = f" (rank {current_rank})" if current_rank else ""
                print(f"Keyword: {current_keyword}{rank_str}")
            continue

        # Parse decomposition pattern (  decomp: pattern)
        if line.strip().startswith("decomp:"):
            save_current_decomp()
            current_decomp = line.strip()[7:].strip()
            if verbose:
                print(f"  Decomp: {current_decomp}")
            continue

        # Parse reassembly response (    reasmb: response)
        if line.strip().startswith("reasmb:"):
            response = line.strip()[7:].strip()
            current_responses.append(response)
            if verbose:
                print(f"    Reasmb: {response}")
            continue

    # Save any remaining keyword
    save_current_keyword()

    return result


def validate_rules(rules: dict) -> list:
    """Validate the parsed rules and return any issues found."""
    issues = []

    # Check required fields
    required_fields = ["preSubstitutions", "postSubstitutions", "synonyms",
                       "quitWords", "initialGreetings", "finalGreetings",
                       "rules", "fallbacks"]

    for field in required_fields:
        if field not in rules:
            issues.append(f"Missing required field: {field}")
        elif not rules[field]:
            if field == "fallbacks":
                issues.append(f"Warning: No fallback responses defined")

    # Check rules structure
    for i, rule in enumerate(rules.get("rules", [])):
        if "keyword" not in rule:
            issues.append(f"Rule {i}: missing keyword")
        if "patterns" not in rule:
            issues.append(f"Rule {i} ({rule.get('keyword', 'unknown')}): missing patterns")
        else:
            for j, pattern in enumerate(rule["patterns"]):
                if "pattern" not in pattern:
                    issues.append(f"Rule {i} ({rule.get('keyword', 'unknown')}), pattern {j}: missing pattern string")
                if "responses" not in pattern or not pattern["responses"]:
                    issues.append(f"Rule {i} ({rule.get('keyword', 'unknown')}), pattern {j}: missing or empty responses")

    # Check for expected synonym groups
    expected_synonyms = ["belief", "family", "desire", "sad", "happy", "cannot", "everyone", "be"]
    for syn in expected_synonyms:
        if syn not in rules.get("synonyms", {}):
            issues.append(f"Warning: Missing expected synonym group: {syn}")

    return issues


def print_summary(rules: dict):
    """Print a summary of the parsed rules."""
    print("\n" + "=" * 60)
    print("ELIZA RULES SUMMARY")
    print("=" * 60)
    print(f"Initial greetings: {len(rules['initialGreetings'])}")
    print(f"Final greetings: {len(rules['finalGreetings'])}")
    print(f"Quit words: {len(rules['quitWords'])}")
    print(f"Pre-substitutions: {len(rules['preSubstitutions'])}")
    print(f"Post-substitutions: {len(rules['postSubstitutions'])}")
    print(f"Synonym groups: {len(rules['synonyms'])}")
    print(f"Keywords (rules): {len(rules['rules'])}")
    print(f"Fallback responses: {len(rules['fallbacks'])}")

    # Count total patterns and responses
    total_patterns = sum(len(rule['patterns']) for rule in rules['rules'])
    total_responses = sum(
        sum(len(p['responses']) for p in rule['patterns'])
        for rule in rules['rules']
    )
    print(f"Total patterns: {total_patterns}")
    print(f"Total responses: {total_responses}")

    # List keywords with ranks
    print("\nKeywords by rank:")
    ranked = [(r.get('rank', 0), r['keyword']) for r in rules['rules']]
    ranked.sort(reverse=True)
    for rank, keyword in ranked[:15]:
        print(f"  {keyword}: rank {rank}")
    if len(ranked) > 15:
        print(f"  ... and {len(ranked) - 15} more")

    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Import ELIZA rules from Weizenbaum format to JSON"
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_URL,
        help=f"URL to fetch rules from (default: {DEFAULT_URL})"
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"Output path for JSON file (default: {DEFAULT_OUTPUT})"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print detailed parsing information"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and validate but don't write output file"
    )

    args = parser.parse_args()

    # Fetch rules
    content = fetch_rules(args.url)

    # Parse rules
    print("\nParsing rules...")
    rules = parse_rules(content, verbose=args.verbose)

    # Validate
    print("\nValidating rules...")
    issues = validate_rules(rules)

    if issues:
        print("\nValidation issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("Validation passed!")

    # Print summary
    print_summary(rules)

    # Write output
    if not args.dry_run:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w') as f:
            json.dump(rules, f, indent=2)

        print(f"\nRules written to: {output_path}")
        print(f"File size: {output_path.stat().st_size:,} bytes")
    else:
        print("\nDry run - no file written")

    # Return success if no errors (warnings are ok)
    errors = [i for i in issues if not i.startswith("Warning:")]
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
