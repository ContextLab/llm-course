# Demo 11 - Analogies: Quick Start Guide

## What's New

This demo now uses **real pre-trained GloVe embeddings** instead of synthetic hand-crafted vectors!

## Quick Facts

- **10,000 real words** from Wikipedia and news articles
- **Trained on 6 billion tokens** of real text
- **Authentic behavior** - analogies won't be perfect (as in real life!)
- **Educational honesty** - shows how embeddings actually work

## Usage

### Just want to use it?
1. Open `/home/user/llm-course/demos/11-analogies/index.html` in a browser
2. The real embeddings will load automatically
3. Try the example analogies or create your own!

### What to expect

**These will work well:**
- king - man + woman = queen ✓
- paris - france + germany = berlin ✓
- walking - walked + swimming = swim ✓

**These might not be perfect:**
- good - better + bad = ??? (might not get "worse")
- This is **normal** and **educational** - it shows real limitations!

## For Developers

### Regenerate embeddings with different vocabulary size:

```bash
cd demos/11-analogies/data

# Download GloVe (if not already done)
wget https://nlp.stanford.edu/data/glove.6B.zip
unzip glove.6B.zip

# Convert with custom vocabulary size
python3 convert_glove_to_json.py glove.6B.50d.txt glove-50d.json 15000  # 15K words
```

### Test the embeddings:

```bash
cd demos/11-analogies/data

# Validate format and check key words
python3 test_embeddings.py

# Full integration test
python3 test_demo_integration.py
```

## Files Overview

| File | Purpose | Size |
|------|---------|------|
| `index.html` | Main demo interface | 20 KB |
| `data/glove-50d.json` | Real word embeddings | 4.2 MB |
| `data/sample-embeddings.js` | Loads embeddings | 3 KB |
| `data/convert_glove_to_json.py` | Conversion tool | 3 KB |
| `js/embeddings.js` | Vector operations | 14 KB |
| `js/visualization.js` | t-SNE & PCA viz | varies |

## Educational Value

### Why Real Embeddings Matter

1. **Honest demonstration** - Shows actual behavior, not idealized
2. **Critical thinking** - Why do some analogies fail? (training data, biases)
3. **Real-world preparation** - This is how embeddings behave in production
4. **Exploration** - 10K words to explore vs. 200 hand-picked examples

### Discussion Points

- Why does "king - man + woman = queen" work so well?
- What does it mean when an analogy fails?
- What biases might exist in the training data?
- How does vocabulary size affect results?
- What's the trade-off between dimensions and accuracy?

## Troubleshooting

**Embeddings won't load?**
- Check browser console for errors
- Make sure you're serving from a web server (not `file://`)
- Verify `glove-50d.json` exists and is 4.2 MB

**Analogies seem random?**
- This can happen! Real embeddings aren't perfect
- Try words that are more common (higher frequency)
- Some linguistic patterns are harder to capture

**Performance issues?**
- Reduce "Words to display" in visualization settings
- Use PCA instead of t-SNE (faster)
- Clear browser cache and reload

## Next Steps

1. **Try classic analogies** - king/queen, countries/capitals
2. **Explore similarities** - find words similar to "happy", "computer", etc.
3. **Visualize the space** - use t-SNE to see word clusters
4. **Create your own** - find new analogy patterns!
5. **Discuss limitations** - why aren't all analogies perfect?

## Resources

- **GloVe Website**: https://nlp.stanford.edu/projects/glove/
- **Paper**: Pennington, Socher, Manning. "GloVe: Global Vectors for Word Representation." EMNLP 2014
- **Demo README**: Full documentation in `README.md`
- **Change Log**: See `CHANGELOG.md` for migration details

## Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Run `test_embeddings.py` to verify data integrity
3. Check browser console for JavaScript errors
4. Verify file paths are correct

---

**Happy exploring!** Remember: imperfect results are a feature, not a bug. They reveal how language models really work! 🎯
