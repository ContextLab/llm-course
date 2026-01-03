# Interactive Tokenization Visualizer

An educational web-based tool for exploring different tokenization approaches used in modern NLP and language models.

## Recent Updates

### Real GPT-2 BPE Integration (Latest)
The BPE visualizer now supports **real GPT-2 merge rules** alongside the educational simplified mode:

- **5,000 real merge operations** downloaded from HuggingFace's GPT-2 model
- **Toggle between modes**: Compare simplified (16 patterns) vs. real GPT-2 (5,000 merges)
- **Authentic behavior**: See how OpenAI's GPT-2 actually tokenizes text
- **Visual clarity**: GPT-2's space character (Ġ) displayed as ▁ for readability
- **Educational value**: Understand the difference between toy examples and production systems

**Try it**: Select "Real GPT-2 BPE" mode in Tab 2 to see the actual merge sequences used by GPT-2!

## Features

### 1. Tokenizer Comparison
- **Live tokenization** with real tokenizers (GPT-2, BERT, T5)
- **Side-by-side comparison** of different tokenization algorithms
- **Token visualization** with color-coded highlighting
- **Efficiency metrics** (token count, character-to-token ratio)
- **Visual comparison chart** showing token counts
- **Token IDs display** for each tokenizer

### 2. BPE Step-by-Step Visualizer
- **Two BPE modes**: Simplified (Educational) and Real GPT-2 BPE
- **Interactive BPE algorithm** demonstration
- **Real GPT-2 merge rules**: 5,000 actual merge operations from HuggingFace
- **Step-by-step execution** showing merge operations
- **Auto-play mode** for automated demonstration
- **Merge history** tracking all operations
- **Visual merge tree** showing token hierarchy
- **Real-time statistics** (current step, token count, pairs found)
- **Mode comparison**: Toggle between simplified and real implementations

### 3. Vocabulary Browser
- **Explore vocabularies** of different tokenizers
- **Search and filter** tokens by type
- **Categorization** (special tokens, subwords, regular words)
- **Paginated table** with detailed token information
- **Vocabulary statistics** (size, special tokens, subwords)

## Technology Stack

- **Transformers.js** - Real tokenizer implementations from HuggingFace
- **Vanilla JavaScript** - No framework dependencies
- **ES6 Modules** - Modern JavaScript architecture
- **CSS3** - Smooth animations and responsive design
- **HTML5 Canvas** - Interactive visualizations

## Usage

### Opening the Demo

Simply open `index.html` in a modern web browser:

```bash
# Using Python's built-in server
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server

# Then navigate to:
# http://localhost:8000
```

### Tab 1: Tokenizer Comparison

1. Enter or paste text in the input area
2. Click "Tokenize" or press Ctrl+Enter
3. View how different tokenizers process the same text
4. Hover over tokens to see their IDs
5. Expand "Token IDs" to see the full sequence
6. Compare token counts in the visualization chart

**Example Use Cases:**
- Compare efficiency of different tokenizers
- Understand how subwords are created
- See how special characters are handled
- Analyze multilingual text processing

### Tab 2: BPE Step-by-Step

1. **Choose BPE Mode:**
   - **Simplified (Educational)**: Uses 16 hardcoded common English patterns - great for learning
   - **Real GPT-2 BPE**: Uses 5,000 actual merge rules from OpenAI's GPT-2 - shows real behavior

2. Enter text in the input field
3. Click "Start BPE Visualization"
4. Use "Next Step" to manually step through merges
5. Or click "Auto Play" for automatic demonstration
6. Watch the merge tree grow as tokens combine
7. Review merge history to understand the algorithm
8. Toggle between modes to compare behavior

**Example Texts:**
- `hello world` - Simple demonstration
- `the the the cat sat` - Shows frequency-based merging
- `tokenization preprocessing` - Common words that BPE handles well
- `The quick brown fox jumps` - Sentence with various patterns

**Understanding the Visualization:**
- **▁ symbol**: Represents spaces in GPT-2 mode (Ġ in the actual data)
- **Green tokens**: Recently merged tokens
- **Blue tokens**: Existing tokens waiting to merge
- **Merge history**: Shows which pairs were merged and how many times

### Tab 3: Vocabulary Browser

1. Select a tokenizer (GPT-2, BERT, or T5)
2. Browse the complete vocabulary
3. Search for specific tokens
4. Filter by type (letters, subwords, special tokens)
5. Navigate through pages
6. View statistics about the vocabulary

## Educational Applications

### For Students
- Understand how text is converted to tokens
- Visualize the BPE algorithm in action
- Compare different tokenization approaches
- Explore real-world vocabularies

### For Instructors
- Demonstrate tokenization concepts interactively
- Show real tokenizer behavior
- Explain subword tokenization benefits
- Illustrate efficiency trade-offs

### For Researchers
- Quick tokenization testing
- Vocabulary exploration
- Algorithm comparison
- Efficiency analysis

## Tokenization Algorithms

### BPE (Byte Pair Encoding)
**Used by:** GPT-2, GPT-3, RoBERTa
- Iteratively merges most frequent character pairs
- Balances vocabulary size and token length
- Handles unknown words via subword decomposition

### WordPiece
**Used by:** BERT, DistilBERT
- Similar to BPE but uses likelihood-based scoring
- Prefix notation with `##` for subwords
- Optimized for masked language modeling

### SentencePiece
**Used by:** T5, XLNet, ALBERT
- Language-agnostic tokenization
- Treats spaces as special characters (`▁`)
- Unigram language model for segmentation

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (14+)
- Opera: ✅ Full support

**Note:** Requires JavaScript enabled and modern browser features (ES6 modules, async/await).

## Performance

- **Initial load:** ~2-3 seconds (tokenizer download)
- **Tokenization:** <100ms for typical text
- **BPE step:** <50ms per merge
- **Vocabulary load:** <500ms

Tokenizers are cached by the browser for subsequent visits.

## File Structure

```
02-tokenization/
├── index.html                    # Main HTML structure
├── css/
│   └── tokenization.css          # Styles and animations
├── js/
│   ├── tokenizer-comparison.js   # Tokenizer comparison logic
│   └── bpe-visualizer.js         # BPE algorithm visualization
├── data/
│   ├── gpt2-merges.json          # Parsed GPT-2 merge rules (5,000 merges)
│   ├── merges.txt                # Original GPT-2 merges from HuggingFace
│   ├── vocab.json                # GPT-2 vocabulary mapping
│   └── parse_gpt2_merges.py      # Script to parse merge rules
└── README.md                     # This file
```

## Implementation Details

### Tokenizer Loading
- Uses Transformers.js from CDN
- Loads three tokenizers in parallel
- Shows loading indicator during initialization
- Caches models in browser storage

### BPE Algorithm
- **Two implementations**:
  - **Simplified mode**: 16 hardcoded common English patterns for educational purposes
  - **Real GPT-2 mode**: 5,000 actual merge rules from OpenAI's GPT-2 tokenizer
- Downloaded real merge rules from HuggingFace (https://huggingface.co/gpt2)
- Maintains merge history for visualization
- Supports manual stepping and auto-play
- Renders merge tree dynamically
- Handles GPT-2's special space character (Ġ) displayed as ▁ for readability
- Merge priority based on GPT-2's trained merge order

### Visualization
- Color-coded tokens (8 rotating colors)
- Smooth CSS animations
- Canvas-based charts
- Responsive layout

## Customization

### Adding More Tokenizers

Edit `tokenizer-comparison.js`:

```javascript
// Add new tokenizer
const newTokenizer = await AutoTokenizer.from_pretrained('model-name');
tokenizers.newTokenizer = newTokenizer;

// Add corresponding HTML sections
```

### Modifying BPE Rules

Edit `bpe-visualizer.js`:

```javascript
this.commonMerges = [
    // Add your custom merge rules
    ['your', 'rule'],
    // ...
];
```

### Styling Changes

Edit `tokenization.css`:

```css
:root {
    --primary-color: #your-color;
    /* Customize color scheme */
}
```

## Known Limitations

1. **BPE Merge Count:** Real GPT-2 mode uses 5,000 merges (out of 50,000 total) for performance
   - Full 50K merges would be slower and unnecessary for visualization
   - Top 5,000 merges cover the vast majority of common patterns
2. **BPE Pre-tokenization:** The visualizer doesn't include GPT-2's pre-tokenization step (regex splitting)
   - Real GPT-2 first splits on whitespace and punctuation before BPE
   - Our visualizer shows BPE merging directly for educational clarity
3. **Vocabulary Size:** Large vocabularies (>100k) may be slow to browse
4. **Token Limit:** Very long texts may slow down visualization
5. **Browser Memory:** Loading multiple tokenizers uses ~100-200MB

## Future Enhancements

- [x] Real GPT-2 BPE merge rules (completed)
- [ ] Use all 50,000 GPT-2 merges (currently 5,000)
- [ ] Add GPT-2's pre-tokenization regex step
- [ ] Export tokenization results
- [ ] Upload custom text files
- [ ] More tokenizer options (GPT-3, LLaMA, etc.)
- [ ] Multilingual examples
- [ ] Token probability visualization
- [ ] Performance benchmarking
- [ ] Interactive merge rule editing
- [ ] Compare simplified vs real GPT-2 side-by-side

## Troubleshooting

**Tokenizers not loading:**
- Check internet connection (CDN required)
- Clear browser cache
- Try different browser

**Slow performance:**
- Reduce text length
- Close other browser tabs
- Use modern browser

**Visualization issues:**
- Enable JavaScript
- Update browser
- Check console for errors

## Credits

- **Transformers.js:** Xenova (HuggingFace)
- **Tokenizer Models:** OpenAI (GPT-2), Google (BERT, T5)
- **Design Inspiration:** Modern web UI patterns

## License

Educational use. Part of LLM Course materials.

## Contact

For issues or questions, please refer to the main course repository.
