#!/usr/bin/env python3
"""
Convert ALICE AIML files to JSON format for JavaScript implementation.

This script parses all AIML files from the official ALICE distribution
and converts them to a format compatible with the alice.js implementation.

Original ALICE has ~95,000 patterns across 60 AIML files.
"""

import xml.etree.ElementTree as ET
import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any


class AIMLConverter:
    def __init__(self, aiml_dir: str):
        self.aiml_dir = Path(aiml_dir)
        self.patterns = []
        self.pattern_count = 0
        self.file_count = 0

    def parse_template(self, template_elem) -> str:
        """
        Parse AIML template element and convert to JavaScript-compatible string.

        AIML tags to handle:
        - <srai>text</srai> -> recursive call (we'll mark this for handling)
        - <random><li>opt1</li><li>opt2</li></random> -> random selection
        - <bot name="x"/> -> bot property
        - <get name="x"/> -> context variable
        - <set name="x">value</set> -> set context variable
        - <person/> or <person>text</person> -> pronoun transformation
        - <think>...</think> -> execute without output
        - Plain text
        """
        if template_elem is None:
            return ""

        # Get all text and handle child elements
        result = template_elem.text or ""

        for child in template_elem:
            if child.tag == "srai":
                # Mark for recursive call - we'll handle this specially
                srai_text = self.get_element_text(child)
                result += f"{{{{SRAI:{srai_text}}}}}"
            elif child.tag == "random":
                # Random selection - use parse_template to preserve bot/get/set tags
                options = [self.parse_template(li) for li in child.findall("li")]
                result += f"{{{{RANDOM:{json.dumps(options)}}}}}"
            elif child.tag == "bot":
                # Bot property
                name = child.get("name", "")
                result += f"{{{{BOT:{name}}}}}"
            elif child.tag == "get":
                # Get context variable
                name = child.get("name", "")
                result += f"{{{{GET:{name}}}}}"
            elif child.tag == "set":
                # Set context variable
                name = child.get("name", "")
                value = self.get_element_text(child)
                result += f"{{{{SET:{name}:{value}}}}}"
            elif child.tag == "person":
                # Pronoun transformation
                text = self.get_element_text(child) or "WILDCARD"
                result += f"{{{{PERSON:{text}}}}}"
            elif child.tag == "think":
                # Think tag - process but don't output
                think_content = self.parse_template(child)
                result += f"{{{{THINK:{think_content}}}}}"
            elif child.tag == "star":
                # Wildcard capture
                index = child.get("index", "1")
                result += f"{{{{STAR:{index}}}}}"
            elif child.tag == "that":
                # Reference to bot's previous response
                result += "{THAT}"
            elif child.tag == "formal":
                # Capitalize first letter
                text = self.get_element_text(child)
                result += f"{{{{FORMAL:{text}}}}}"
            elif child.tag == "uppercase":
                text = self.get_element_text(child)
                result += f"{{{{UPPERCASE:{text}}}}}"
            elif child.tag == "lowercase":
                text = self.get_element_text(child)
                result += f"{{{{LOWERCASE:{text}}}}}"
            elif child.tag == "a":
                # HTML link
                href = child.get("href", "")
                text = self.get_element_text(child)
                result += f'<a href="{href}">{text}</a>'
            elif child.tag == "br":
                result += "\n"
            else:
                # Unknown tag - just get text
                result += self.get_element_text(child)

            # Add tail text
            if child.tail:
                result += child.tail

        # Clean up whitespace
        result = " ".join(result.split())
        return result.strip()

    def get_element_text(self, elem) -> str:
        """Get all text from an element and its children."""
        if elem is None:
            return ""
        text = elem.text or ""
        for child in elem:
            text += self.get_element_text(child)
            if child.tail:
                text += child.tail
        return text.strip()

    def convert_pattern_to_regex(self, pattern: str) -> str:
        """
        Convert AIML pattern to regex.

        AIML wildcards:
        - * (star) = match 1+ words (lower priority)
        - _ (underscore) = match 1+ words (higher priority)
        - EXACT = exact match (highest priority)
        """
        # Escape special regex characters except * and _
        pattern = pattern.strip()

        # Replace AIML wildcards with regex
        # _ matches one or more words (higher priority)
        pattern = pattern.replace("_", "(.+)")
        # * matches one or more words (lower priority)
        pattern = pattern.replace("*", "(.*)")

        # Escape other special regex characters
        for char in [".", "?", "+", "(", ")", "[", "]", "{", "}", "^", "$", "|", "\\"]:
            if char not in pattern or pattern.count(char) == pattern.count("(."):
                continue
            pattern = pattern.replace(char, "\\" + char)

        return pattern

    def determine_priority(self, pattern: str, has_that: bool, has_topic: bool) -> int:
        """
        Determine pattern priority based on AIML rules.

        Priority order (highest to lowest):
        1. Patterns with <that> context + exact match (priority 10)
        2. Patterns with <that> context + _ wildcard (priority 9)
        3. Patterns with <that> context + * wildcard (priority 8)
        4. Exact patterns (no wildcards) (priority 5)
        5. Patterns with _ wildcard (priority 4)
        6. Patterns with * wildcard (priority 2)
        7. Catch-all patterns (priority 0)

        Topic adds +1 to priority for context sensitivity
        """
        base_priority = 0

        # Check for wildcards in original pattern
        has_underscore = "_" in pattern
        has_star = "*" in pattern
        has_wildcard = has_underscore or has_star

        # Exact match (no wildcards)
        if not has_wildcard:
            base_priority = 5
        # Underscore wildcard (higher than star)
        elif has_underscore:
            base_priority = 4
        # Star wildcard
        elif has_star:
            base_priority = 2

        # <that> context significantly boosts priority
        if has_that:
            base_priority += 5

        # Topic adds small boost
        if has_topic:
            base_priority += 1

        return base_priority

    def parse_aiml_file(self, filepath: Path) -> List[Dict[str, Any]]:
        """Parse a single AIML file and extract patterns."""
        patterns = []

        try:
            # Parse XML
            tree = ET.parse(filepath)
            root = tree.getroot()

            # Find all category elements
            categories = root.findall(".//category")

            for category in categories:
                pattern_elem = category.find("pattern")
                template_elem = category.find("template")
                that_elem = category.find("that")
                topic_elem = category.find("topic")

                if pattern_elem is None or template_elem is None:
                    continue

                # Extract pattern
                pattern_text = self.get_element_text(pattern_elem)
                if not pattern_text:
                    continue

                # Extract template
                template_text = self.parse_template(template_elem)
                if not template_text:
                    continue

                # Extract that context if present
                that_text = None
                if that_elem is not None:
                    that_text = self.get_element_text(that_elem)

                # Extract topic if present
                topic_text = None
                if topic_elem is not None:
                    topic_text = self.get_element_text(topic_elem)

                # Convert pattern to regex
                regex_pattern = self.convert_pattern_to_regex(pattern_text)

                # Determine priority
                has_that = that_text is not None
                has_topic = topic_text is not None
                priority = self.determine_priority(pattern_text, has_that, has_topic)

                # Create pattern object
                pattern_obj = {
                    "pattern": pattern_text,
                    "regex": regex_pattern,
                    "template": template_text,
                    "priority": priority,
                    "source_file": filepath.name,
                }

                if that_text:
                    pattern_obj["that"] = that_text
                if topic_text:
                    pattern_obj["topic"] = topic_text

                patterns.append(pattern_obj)
                self.pattern_count += 1

        except Exception as e:
            print(f"Error parsing {filepath.name}: {e}")
            return []

        return patterns

    def pattern_quality_score(self, pattern: Dict[str, Any]) -> int:
        """
        Score pattern for deduplication. Higher = keep this version.
        Direct responses preferred over SRAI (avoids circular refs).
        mp files (-500) < core files (+50) < content files (+100)
        """
        template = pattern.get("template", "")
        source = pattern.get("source_file", "")
        score = 0

        if source.startswith("mp"):
            score -= 500

        content_files = [
            "ai.aiml",
            "knowledge.aiml",
            "humor.aiml",
            "science.aiml",
            "computers.aiml",
            "geography.aiml",
            "history.aiml",
            "literature.aiml",
        ]
        if source in content_files:
            score += 100

        if source in ["atomic.aiml", "default.aiml", "bot.aiml", "that.aiml"]:
            score += 50

        has_srai = "SRAI" in template
        has_random = "RANDOM" in template

        if has_random:
            score += 75

        if not has_srai and len(template) > 20:
            score += 50

        score += min(len(template), 100)

        return score

    def deduplicate_patterns(
        self, patterns: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Remove duplicate (pattern, that, topic) tuples, keeping highest-scored version."""
        from collections import defaultdict

        groups = defaultdict(list)
        for p in patterns:
            key = (p.get("pattern"), p.get("that"), p.get("topic"))
            groups[key].append(p)

        deduplicated = []
        duplicates_removed = 0

        for key, group in groups.items():
            if len(group) == 1:
                deduplicated.append(group[0])
            else:
                group.sort(key=lambda p: self.pattern_quality_score(p), reverse=True)
                deduplicated.append(group[0])
                duplicates_removed += len(group) - 1

        print(f"Deduplication: removed {duplicates_removed} duplicate patterns")
        return deduplicated

    def convert_all(self) -> List[Dict[str, Any]]:
        """Convert all AIML files in the directory."""
        all_patterns = []

        # Get all .aiml files
        aiml_files = sorted(self.aiml_dir.glob("*.aiml"))

        print(f"Found {len(aiml_files)} AIML files")

        for filepath in aiml_files:
            print(f"Processing {filepath.name}...")
            patterns = self.parse_aiml_file(filepath)
            all_patterns.extend(patterns)
            self.file_count += 1

        print(f"\nConversion complete!")
        print(f"Files processed: {self.file_count}")
        print(f"Patterns extracted: {self.pattern_count}")

        # Deduplicate patterns
        all_patterns = self.deduplicate_patterns(all_patterns)
        self.pattern_count = len(all_patterns)
        print(f"After deduplication: {self.pattern_count} patterns")

        return all_patterns

    def save_json(self, patterns: List[Dict[str, Any]], output_file: str):
        """Save patterns to JSON file."""
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "metadata": {
                        "source": "ALICE AIML Foundation v1.0",
                        "files_processed": self.file_count,
                        "total_patterns": self.pattern_count,
                        "license": "GNU General Public License",
                        "copyright": "(c) 2011 ALICE A.I. Foundation",
                    },
                    "patterns": patterns,
                },
                f,
                indent=2,
                ensure_ascii=False,
            )

        print(f"\nSaved {self.pattern_count} patterns to {output_file}")


def main():
    import sys

    aiml_dir = Path(__file__).parent / "alice-aiml-original"

    exclude_mindpixel = "--original" in sys.argv or "--no-mindpixel" in sys.argv

    if exclude_mindpixel:
        output_file = Path(__file__).parent / "data" / "alice-patterns-original.json"
        print("Mode: Original ALICE (excluding Mindpixel mp*.aiml files)")
        print("This matches the ~41,000 pattern 2001 Loebner Prize winning version.\n")
    else:
        output_file = Path(__file__).parent / "data" / "alice-patterns-full.json"
        print("Mode: Full ALICE (including all files)")
        print("Use --original to exclude Mindpixel data for authentic 2001 version.\n")

    converter = AIMLConverter(str(aiml_dir))

    aiml_files = sorted(aiml_dir.glob("*.aiml"))

    if exclude_mindpixel:
        aiml_files = [f for f in aiml_files if not f.name.startswith("mp")]
        print(f"Excluding {7} Mindpixel files (mp0-mp6.aiml)")

    print(f"Found {len(aiml_files)} AIML files to process\n")

    all_patterns = []
    for filepath in aiml_files:
        print(f"Processing {filepath.name}...")
        patterns = converter.parse_aiml_file(filepath)
        all_patterns.extend(patterns)
        converter.file_count += 1

    print(f"\nExtracted: {converter.pattern_count} patterns")

    all_patterns = converter.deduplicate_patterns(all_patterns)
    converter.pattern_count = len(all_patterns)
    print(f"After deduplication: {converter.pattern_count} patterns")

    metadata = {
        "source": "ALICE AIML Foundation v1.0",
        "version": "Original 2001" if exclude_mindpixel else "Full with Mindpixel",
        "files_processed": converter.file_count,
        "total_patterns": converter.pattern_count,
        "includes_mindpixel": not exclude_mindpixel,
        "license": "GNU General Public License",
        "copyright": "(c) 2011 ALICE A.I. Foundation",
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(
            {"metadata": metadata, "patterns": all_patterns},
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(f"\nSaved {converter.pattern_count} patterns to {output_file}")


if __name__ == "__main__":
    main()
