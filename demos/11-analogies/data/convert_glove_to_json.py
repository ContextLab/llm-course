#!/usr/bin/env python3
"""
Convert GloVe text format to JSON format for the Analogies demo.
Selects top N most common words for browser performance.
"""

import json
import sys

def convert_glove_to_json(input_file, output_file, num_words=10000):
    """
    Convert GloVe text format to JSON.

    Args:
        input_file: Path to GloVe text file (e.g., glove.6B.50d.txt)
        output_file: Path to output JSON file
        num_words: Number of words to include (default: 10000)
    """
    embeddings = {}
    words_processed = 0

    print(f"Converting {input_file} to {output_file}...")
    print(f"Selecting top {num_words} most common words...")

    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            if words_processed >= num_words:
                break

            parts = line.strip().split()
            if len(parts) < 2:
                print(f"Warning: Skipping malformed line {line_num}")
                continue

            word = parts[0]
            try:
                vector = [float(x) for x in parts[1:]]
                embeddings[word] = vector
                words_processed += 1

                if words_processed % 1000 == 0:
                    print(f"  Processed {words_processed} words...")

            except ValueError as e:
                print(f"Warning: Could not parse vector for word '{word}' at line {line_num}: {e}")
                continue

    print(f"\nSuccessfully converted {words_processed} words.")
    print(f"Vector dimensions: {len(next(iter(embeddings.values())))}")

    # Write to JSON file
    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(embeddings, f, separators=(',', ':'))

    file_size_mb = sum(len(json.dumps(k) + json.dumps(v)) for k, v in embeddings.items()) / (1024 * 1024)
    print(f"Output file size: ~{file_size_mb:.1f} MB")
    print("Done!")

    # Print some sample words
    print(f"\nSample words included:")
    sample_words = list(embeddings.keys())[:20]
    print(f"  {', '.join(sample_words)}")

    # Check if common analogy words are included
    analogy_words = ['king', 'queen', 'man', 'woman', 'paris', 'france',
                     'germany', 'berlin', 'good', 'better', 'bad', 'worse']
    missing = [w for w in analogy_words if w not in embeddings]
    if missing:
        print(f"\nWarning: Some common analogy words are missing: {missing}")
    else:
        print(f"\nAll common analogy words are included!")

if __name__ == "__main__":
    # Default parameters
    input_file = "glove.6B.50d.txt"
    output_file = "glove-50d.json"
    num_words = 10000

    # Parse command line arguments if provided
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    if len(sys.argv) > 3:
        num_words = int(sys.argv[3])

    convert_glove_to_json(input_file, output_file, num_words)
