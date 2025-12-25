#!/usr/bin/env python3
"""
Parse GPT-2 merges.txt file and create a JSON file with merge rules.
Takes the top N merges (default 5000) for use in the BPE visualizer.
"""

import json
import sys

def parse_merges(merges_file, output_file, num_merges=5000):
    """Parse merges.txt and create JSON file with merge rules."""
    merges = []

    with open(merges_file, 'r', encoding='utf-8') as f:
        # Skip header line
        next(f)

        for i, line in enumerate(f):
            if i >= num_merges:
                break

            line = line.strip()
            if not line:
                continue

            # Split the merge rule (format: "token1 token2")
            parts = line.split(' ')
            if len(parts) == 2:
                merges.append(parts)

    # Create output data structure
    output_data = {
        "version": "gpt2",
        "num_merges": len(merges),
        "source": "https://huggingface.co/gpt2",
        "merges": merges
    }

    # Write to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"Parsed {len(merges)} merge rules from {merges_file}")
    print(f"Output written to {output_file}")

    # Print some examples
    print("\nFirst 10 merges:")
    for i, merge in enumerate(merges[:10]):
        # Replace Ġ with <space> for display
        token1 = merge[0].replace('Ġ', '<space>')
        token2 = merge[1].replace('Ġ', '<space>')
        print(f"  {i+1}. {token1} + {token2}")

if __name__ == "__main__":
    input_file = "merges.txt"
    output_file = "gpt2-merges.json"
    num_merges = 5000

    if len(sys.argv) > 1:
        num_merges = int(sys.argv[1])

    parse_merges(input_file, output_file, num_merges)
