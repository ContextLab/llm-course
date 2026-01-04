#!/usr/bin/env python3
"""
Comprehensive audit of ALICE AIML patterns to find conversion bugs.

Checks for:
1. SRAI redirects that lose wildcard captures
2. SET operations with empty values that should use STAR
3. GET operations that might return empty/wrong values
4. Mismatched wildcard usage
5. Other template processing issues
"""

import json
import re
from collections import defaultdict
from pathlib import Path


def load_patterns(path):
    with open(path) as f:
        data = json.load(f)
    return data["patterns"], data.get("metadata", {})


def analyze_patterns(patterns):
    issues = defaultdict(list)
    stats = defaultdict(int)

    for i, p in enumerate(patterns):
        pattern = p.get("pattern", "")
        template = p.get("template", "")
        regex = p.get("regex", "")
        source = p.get("source_file", "unknown")

        has_wildcard = "*" in pattern or "_" in pattern
        wildcard_count = pattern.count("*") + pattern.count("_")

        stats["total"] += 1
        if has_wildcard:
            stats["has_wildcard"] += 1

        # Issue 1: SRAI without passing wildcards
        # Pattern has wildcard but SRAI doesn't include STAR
        if has_wildcard and "{{SRAI:" in template:
            srai_matches = re.findall(r"\{\{SRAI:([^}]+)\}\}", template)
            for srai_target in srai_matches:
                if "{{STAR:" not in srai_target and "STAR:" not in srai_target:
                    # Check if the SRAI target would lose the wildcard
                    issues["srai_loses_wildcard"].append(
                        {
                            "index": i,
                            "pattern": pattern,
                            "template": template,
                            "srai_target": srai_target,
                            "source": source,
                        }
                    )

        # Issue 2: SET with empty value when pattern has wildcard
        if has_wildcard and "{{SET:" in template:
            set_matches = re.findall(r"\{\{SET:([^:]+):([^}]*)\}\}", template)
            for var_name, value in set_matches:
                if value == "" or value.strip() == "":
                    issues["set_empty_value"].append(
                        {
                            "index": i,
                            "pattern": pattern,
                            "template": template,
                            "var_name": var_name,
                            "source": source,
                        }
                    )

        # Issue 3: Pattern has wildcard but template never uses STAR
        if has_wildcard and "{{STAR:" not in template and "STAR:" not in template:
            # Check if it's using PERSON:WILDCARD (old style)
            if "{{PERSON:WILDCARD}}" not in template:
                # Not necessarily a bug, but worth noting
                stats["wildcard_unused"] += 1

        # Issue 4: Template uses STAR but pattern has no wildcard
        if not has_wildcard and "{{STAR:" in template:
            issues["star_without_wildcard"].append(
                {"index": i, "pattern": pattern, "template": template, "source": source}
            )

        # Issue 5: GET:name usage (potential for empty value issues)
        if "{{GET:name}}" in template:
            stats["uses_get_name"] += 1

        # Issue 6: Unbalanced braces
        open_braces = template.count("{{")
        close_braces = template.count("}}")
        if open_braces != close_braces:
            issues["unbalanced_braces"].append(
                {
                    "index": i,
                    "pattern": pattern,
                    "template": template,
                    "open": open_braces,
                    "close": close_braces,
                    "source": source,
                }
            )

        # Issue 7: Nested tags that might not process correctly
        # Look for {{TAG:{{OTHER:...}}}} patterns
        nested_pattern = r"\{\{[A-Z]+:[^}]*\{\{[A-Z]+:"
        if re.search(nested_pattern, template):
            stats["has_nested_tags"] += 1

        # Issue 8: SRAI to pattern that doesn't exist or has issues
        # (We'd need a second pass for this)

    return issues, stats


def find_srai_chain_issues(patterns):
    """Find SRAI chains that might lose context."""
    pattern_map = {p["pattern"]: p for p in patterns}

    issues = []
    for p in patterns:
        if "*" not in p["pattern"] and "_" not in p["pattern"]:
            continue

        template = p.get("template", "")
        srai_matches = re.findall(r"\{\{SRAI:([^}]+)\}\}", template)

        for srai_target in srai_matches:
            # Clean the target
            clean_target = srai_target.replace("{{STAR:1}}", "*").replace(
                "{{STAR:2}}", "*"
            )
            clean_target = re.sub(r"\{\{[^}]+\}\}", "", clean_target).strip().upper()

            # Check if target exists
            if clean_target in pattern_map:
                target_pattern = pattern_map[clean_target]
                # If source has wildcard but SRAI doesn't pass it, and target expects it
                if "*" in target_pattern["pattern"] or "_" in target_pattern["pattern"]:
                    if "{{STAR:" not in srai_target:
                        issues.append(
                            {
                                "source_pattern": p["pattern"],
                                "srai_target": srai_target,
                                "target_pattern": clean_target,
                                "target_expects_wildcard": True,
                            }
                        )

    return issues


def generate_fixes(issues):
    """Generate suggested fixes for common issues."""
    fixes = []

    # Fix SRAI that loses wildcards
    for issue in issues.get("srai_loses_wildcard", []):
        pattern = issue["pattern"]
        template = issue["template"]
        srai_target = issue["srai_target"]

        # Simple fix: append {{STAR:1}} to SRAI target
        if pattern.endswith(" *") or pattern.endswith(" _"):
            fixed_srai = f"{srai_target} {{{{STAR:1}}}}"
            fixed_template = template.replace(
                f"{{{{SRAI:{srai_target}}}}}", f"{{{{SRAI:{fixed_srai}}}}}"
            )
            fixes.append(
                {
                    "index": issue["index"],
                    "pattern": pattern,
                    "old_template": template,
                    "new_template": fixed_template,
                    "issue_type": "srai_loses_wildcard",
                }
            )

    # Fix SET with empty values
    for issue in issues.get("set_empty_value", []):
        pattern = issue["pattern"]
        template = issue["template"]
        var_name = issue["var_name"]

        # Fix: replace {{SET:var:}} with {{SET:var:{{STAR:1}}}}
        old_set = f"{{{{SET:{var_name}:}}}}"
        new_set = f"{{{{SET:{var_name}:{{{{STAR:1}}}}}}}}"
        fixed_template = template.replace(old_set, new_set)

        if fixed_template != template:
            fixes.append(
                {
                    "index": issue["index"],
                    "pattern": pattern,
                    "old_template": template,
                    "new_template": fixed_template,
                    "issue_type": "set_empty_value",
                }
            )

    return fixes


def apply_fixes(patterns, fixes):
    """Apply fixes to patterns."""
    fix_map = {f["index"]: f for f in fixes}
    fixed_count = 0

    for i, p in enumerate(patterns):
        if i in fix_map:
            p["template"] = fix_map[i]["new_template"]
            fixed_count += 1

    return fixed_count


def main():
    patterns_path = (
        Path(__file__).parent.parent
        / "demos"
        / "chatbot-evolution"
        / "data"
        / "alice-patterns-original.json"
    )

    print("=" * 70)
    print("ALICE Pattern Audit")
    print("=" * 70)

    patterns, metadata = load_patterns(patterns_path)
    print(f"\nLoaded {len(patterns)} patterns from {metadata.get('source', 'unknown')}")

    print("\n" + "-" * 70)
    print("Analyzing patterns for issues...")
    print("-" * 70)

    issues, stats = analyze_patterns(patterns)

    print(f"\nStatistics:")
    print(f"  Total patterns: {stats['total']}")
    print(f"  Patterns with wildcards: {stats['has_wildcard']}")
    print(f"  Patterns using {{GET:name}}: {stats['uses_get_name']}")
    print(f"  Patterns with nested tags: {stats['has_nested_tags']}")
    print(f"  Wildcards not used in template: {stats['wildcard_unused']}")

    print(f"\nIssues found:")
    for issue_type, issue_list in issues.items():
        print(f"  {issue_type}: {len(issue_list)}")

    # Show examples of each issue type
    for issue_type, issue_list in issues.items():
        if issue_list:
            print(f"\n{'=' * 70}")
            print(f"Issue: {issue_type} ({len(issue_list)} occurrences)")
            print("=" * 70)
            for issue in issue_list[:5]:  # Show first 5 examples
                print(f"\n  Pattern: {issue['pattern']}")
                print(
                    f"  Template: {issue['template'][:100]}..."
                    if len(issue.get("template", "")) > 100
                    else f"  Template: {issue.get('template', '')}"
                )
                if "srai_target" in issue:
                    print(f"  SRAI target: {issue['srai_target']}")
                if "var_name" in issue:
                    print(f"  Variable: {issue['var_name']}")
                print(f"  Source: {issue['source']}")
            if len(issue_list) > 5:
                print(f"\n  ... and {len(issue_list) - 5} more")

    # Generate and show fixes
    print(f"\n{'=' * 70}")
    print("Generating fixes...")
    print("=" * 70)

    fixes = generate_fixes(issues)
    print(f"\nGenerated {len(fixes)} automatic fixes")

    if fixes:
        print("\nSample fixes:")
        for fix in fixes[:10]:
            print(f"\n  Pattern: {fix['pattern']}")
            print(f"  Issue: {fix['issue_type']}")
            print(f"  Old: {fix['old_template'][:80]}...")
            print(f"  New: {fix['new_template'][:80]}...")

    # Ask to apply fixes
    print(f"\n{'=' * 70}")
    print(f"Ready to apply {len(fixes)} fixes to {patterns_path}")
    print("=" * 70)

    # Apply fixes
    fixed_count = apply_fixes(patterns, fixes)
    print(f"\nApplied {fixed_count} fixes")

    # Save fixed patterns
    with open(patterns_path) as f:
        data = json.load(f)

    data["patterns"] = patterns
    data["metadata"]["fixes_applied"] = len(fixes)
    data["metadata"]["audit_date"] = "2026-01-03"

    with open(patterns_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Saved fixed patterns to {patterns_path}")

    # Final verification
    print(f"\n{'=' * 70}")
    print("Re-analyzing after fixes...")
    print("=" * 70)

    issues_after, stats_after = analyze_patterns(patterns)
    print(f"\nRemaining issues:")
    for issue_type, issue_list in issues_after.items():
        print(f"  {issue_type}: {len(issue_list)}")


if __name__ == "__main__":
    main()
