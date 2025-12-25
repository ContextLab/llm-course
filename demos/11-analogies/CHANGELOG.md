# Demo 11 - Analogies: Migration to Real Embeddings

## Summary

This demo has been updated to use **real pre-trained GloVe embeddings** instead of hand-crafted synthetic embeddings. This makes the demo more educationally honest and demonstrates how word embeddings actually behave in practice.

## What Changed

### Before
- Used hand-crafted embeddings explicitly designed to make analogies work perfectly
- Semantic relationships were manually coded (e.g., "king = royalty + male")
- Results were unrealistically perfect
- Only ~200 words in vocabulary
- 50 or 100 dimensional synthetic vectors

### After
- Uses real GloVe embeddings trained on 6 billion tokens
- 10,000 most common words from Wikipedia and Gigaword
- 50-dimensional vectors learned from actual text data
- Analogies produce realistic (imperfect) results
- Demonstrates authentic behavior of word embeddings

## Files Modified

1. **`data/sample-embeddings.js`** - Completely rewritten
   - Now loads real embeddings from `glove-50d.json`
   - Async loading with fetch API
   - Fallback error handling

2. **`index.html`** - Updated loading logic
   - Added `await` for async embedding loading
   - Updated model selector dropdown text
   - Removed synthetic Word2Vec option

3. **`README.md`** - Comprehensive documentation update
   - Added section on real vs. synthetic embeddings
   - Documented data source and citation
   - Added instructions for regenerating embeddings
   - Emphasized educational value of imperfect results

4. **`.gitignore`** (root) - Added exclusions
   - Excludes large GloVe source files (glove.6B.*.txt, glove.6B.zip)
   - Keeps processed JSON file (glove-50d.json)

## Files Added

1. **`data/glove-50d.json`** (4.2 MB)
   - 10,000 most common words
   - 50-dimensional vectors
   - Real pre-trained GloVe embeddings

2. **`data/convert_glove_to_json.py`**
   - Python script to convert GloVe text format to JSON
   - Configurable vocabulary size
   - Includes validation and statistics

3. **`data/test_embeddings.py`**
   - Test script to verify embeddings are correctly formatted
   - Checks for key analogy words
   - Validates vector dimensions and consistency

## Impact on Demo Behavior

### Expected Changes

1. **Analogies won't be perfect**
   - "king - man + woman" might not return "queen" as #1
   - This is authentic behavior!
   - Shows real limitations and biases in training data

2. **More diverse vocabulary**
   - 10,000 words instead of ~200
   - Includes common words, proper nouns, verbs, adjectives, etc.

3. **Semantic relationships are real**
   - Learned from billions of words of text
   - Reflects actual language usage patterns
   - May show interesting biases from training data

### What Still Works

- Vector arithmetic visualization
- Similarity search
- t-SNE and PCA dimensionality reduction
- All interactive features
- Example analogies (with realistic results)

## Educational Benefits

1. **Honesty**: Students see how embeddings actually work, not an idealized version
2. **Critical thinking**: Imperfect results prompt questions about training data and biases
3. **Realistic expectations**: Better preparation for using embeddings in real applications
4. **Authentic exploration**: Can explore 10K words instead of hand-picked examples

## Technical Details

**GloVe (Global Vectors for Word Representation)**
- Developed by Stanford NLP
- Trained on Wikipedia 2014 + Gigaword 5 corpus
- 6 billion tokens total
- Co-occurrence matrix factorization
- Captures both semantic and syntactic relationships

**Dataset Selection**
- Top 10,000 most frequent words (from 400,000 total)
- Selected for browser performance (~4.6 MB JSON)
- Includes all common analogy examples
- Preserves word frequency ordering

## Migration Notes

No action needed for users - the demo will automatically load real embeddings on page load.

For developers who want to customize:
```bash
cd demos/11-analogies/data
python3 convert_glove_to_json.py glove.6B.50d.txt glove-50d.json 15000  # For 15K words
```

## Citation

When using this demo, please cite:

```
Jeffrey Pennington, Richard Socher, and Christopher D. Manning. 2014.
GloVe: Global Vectors for Word Representation.
In Proceedings of the 2014 Conference on Empirical Methods in Natural Language Processing (EMNLP).
```

Source: https://nlp.stanford.edu/projects/glove/
