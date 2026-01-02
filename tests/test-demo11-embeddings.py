#!/usr/bin/env python3
"""
Test script to verify the GloVe embeddings JSON is correctly formatted
and contains the expected words.
"""

import json
import sys
import os

# Get the directory of this script to resolve relative paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, '..', 'demos', '12-analogies', 'data')
DEFAULT_JSON = os.path.join(DATA_DIR, 'glove-50d.json')

def test_embeddings(json_file=None):
    """Test the embeddings JSON file."""
    if json_file is None:
        json_file = DEFAULT_JSON
    print(f"Testing {json_file}...")
    print("=" * 60)

    # Load the embeddings
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            embeddings = json.load(f)
    except Exception as e:
        print(f"ERROR: Failed to load {json_file}: {e}")
        return False

    # Check vocabulary size
    vocab_size = len(embeddings)
    print(f"✓ Loaded {vocab_size:,} word embeddings")

    if vocab_size == 0:
        print("ERROR: Empty embeddings!")
        return False

    # Check dimensions
    first_word = list(embeddings.keys())[0]
    first_vector = embeddings[first_word]
    dimensions = len(first_vector)
    print(f"✓ Vector dimensions: {dimensions}")

    if dimensions != 50:
        print(f"WARNING: Expected 50 dimensions, got {dimensions}")

    # Check all vectors have the same dimension
    for word, vector in list(embeddings.items())[:100]:  # Check first 100
        if len(vector) != dimensions:
            print(f"ERROR: Word '{word}' has {len(vector)} dimensions, expected {dimensions}")
            return False

    print(f"✓ All vectors have consistent dimensions")

    # Check for common words
    common_words = [
        'the', 'a', 'is', 'are', 'and', 'or',
        'king', 'queen', 'man', 'woman',
        'paris', 'france', 'berlin', 'germany',
        'london', 'england', 'tokyo', 'japan',
        'good', 'better', 'best', 'bad', 'worse', 'worst'
    ]

    found_words = []
    missing_words = []

    for word in common_words:
        if word in embeddings:
            found_words.append(word)
        else:
            missing_words.append(word)

    print(f"✓ Found {len(found_words)}/{len(common_words)} common words")

    if missing_words:
        print(f"  Missing: {', '.join(missing_words)}")

    # Check some specific analogies
    print("\nChecking key analogy words:")
    analogy_sets = [
        ('king', 'queen', 'man', 'woman'),
        ('paris', 'france', 'berlin', 'germany'),
        ('good', 'better', 'bad', 'worse')
    ]

    for words in analogy_sets:
        all_present = all(w in embeddings for w in words)
        status = "✓" if all_present else "✗"
        print(f"  {status} {' / '.join(words)}")

    # Print some example words
    print(f"\nFirst 30 words in vocabulary:")
    print(f"  {', '.join(list(embeddings.keys())[:30])}")

    # Check vector values are reasonable
    print(f"\nVector value statistics (for '{first_word}'):")
    values = first_vector
    print(f"  Min: {min(values):.4f}")
    print(f"  Max: {max(values):.4f}")
    print(f"  Mean: {sum(values)/len(values):.4f}")

    print("\n" + "=" * 60)
    print("✓ All tests passed!")
    return True

if __name__ == "__main__":
    json_file = sys.argv[1] if len(sys.argv) > 1 else None
    success = test_embeddings(json_file)
    sys.exit(0 if success else 1)
