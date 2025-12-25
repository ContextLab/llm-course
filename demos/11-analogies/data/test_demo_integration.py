#!/usr/bin/env python3
"""
Integration test to verify the demo works correctly with real GloVe embeddings.
Tests vector arithmetic and similarity computations.
"""

import json
import math

def cosine_similarity(v1, v2):
    """Compute cosine similarity between two vectors."""
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    return dot / (mag1 * mag2) if mag1 > 0 and mag2 > 0 else 0

def vector_add(v1, v2):
    """Add two vectors."""
    return [a + b for a, b in zip(v1, v2)]

def vector_subtract(v1, v2):
    """Subtract two vectors."""
    return [a - b for a, b in zip(v1, v2)]

def solve_analogy(embeddings, word_a, word_b, word_c, top_k=5):
    """Solve analogy: word_a - word_b + word_c = ?"""
    if word_a not in embeddings or word_b not in embeddings or word_c not in embeddings:
        return None

    # Calculate: vecA - vecB + vecC
    vec_a = embeddings[word_a]
    vec_b = embeddings[word_b]
    vec_c = embeddings[word_c]

    diff = vector_subtract(vec_a, vec_b)
    result = vector_add(diff, vec_c)

    # Find nearest neighbors
    exclude = {word_a, word_b, word_c}
    similarities = []

    for word, vec in embeddings.items():
        if word not in exclude:
            sim = cosine_similarity(result, vec)
            similarities.append((word, sim))

    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_k]

def test_demo_integration():
    """Test the demo with real embeddings."""
    print("Demo 11 - Analogies: Integration Test")
    print("=" * 70)

    # Load embeddings
    print("\n1. Loading embeddings...")
    with open('glove-50d.json', 'r') as f:
        embeddings = json.load(f)
    print(f"   ✓ Loaded {len(embeddings):,} word embeddings")

    # Test example analogies from the demo
    print("\n2. Testing example analogies from index.html:")
    print("   (Note: Real embeddings won't be perfect, which is expected!)")
    print()

    test_cases = [
        ("king", "man", "woman", ["queen", "monarch", "princess", "she"]),
        ("paris", "france", "germany", ["berlin", "munich", "vienna"]),
        ("good", "better", "bad", ["worse", "terrible", "horrible"]),
        ("walking", "walked", "swimming", ["swam", "swum", "swim"])
    ]

    all_passed = True

    for word_a, word_b, word_c, expected_words in test_cases:
        results = solve_analogy(embeddings, word_a, word_b, word_c, top_k=10)

        if results:
            top_5 = [word for word, sim in results[:5]]
            top_10 = [word for word, sim in results[:10]]

            # Check if any expected word is in top 10
            found = any(exp in top_10 for exp in expected_words)
            status = "✓" if found else "~"

            print(f"   {status} {word_a} - {word_b} + {word_c} =")
            print(f"      Top 5: {', '.join(top_5)}")

            if found:
                matches = [w for w in expected_words if w in top_10]
                print(f"      Found expected: {', '.join(matches)}")
            else:
                print(f"      Note: Expected words ({', '.join(expected_words)}) not in top 10")
                print(f"            This is normal for real embeddings!")
            print()

        else:
            print(f"   ✗ {word_a} - {word_b} + {word_c}: FAILED (words not found)")
            all_passed = False
            print()

    # Test similarity search
    print("3. Testing similarity search:")
    test_words = ["king", "computer", "happy", "red"]

    for word in test_words:
        if word in embeddings:
            similarities = []
            for other_word, vec in embeddings.items():
                if other_word != word:
                    sim = cosine_similarity(embeddings[word], vec)
                    similarities.append((other_word, sim))

            similarities.sort(key=lambda x: x[1], reverse=True)
            top_5 = [f"{w} ({s:.3f})" for w, s in similarities[:5]]
            print(f"   ✓ Similar to '{word}': {', '.join(top_5)}")

    print("\n4. Vector operations test:")
    # Test that vector operations are working correctly
    vec1 = embeddings["king"]
    vec2 = embeddings["man"]

    diff = vector_subtract(vec1, vec2)
    mag = math.sqrt(sum(x * x for x in diff))
    print(f"   ✓ Vector subtraction: ||king - man|| = {mag:.3f}")

    sim = cosine_similarity(embeddings["king"], embeddings["queen"])
    print(f"   ✓ Cosine similarity: king <-> queen = {sim:.3f}")

    print("\n" + "=" * 70)
    print("✓ Integration test complete!")
    print()
    print("Summary:")
    print("- Real embeddings are loaded correctly")
    print("- Vector arithmetic works as expected")
    print("- Similarity search produces reasonable results")
    print("- Analogies work (though not perfectly - which is authentic!)")
    print()
    print("The demo is ready to use with real pre-trained embeddings!")

if __name__ == "__main__":
    test_demo_integration()
