# BERT Masked Language Modeling

An interactive demonstration of BERT's masked language modeling capabilities with attention visualization.

## Features

### Core Functionality
- **BERT Model Loading**: Uses Transformers.js to load BERT models in the browser
- **Interactive Masking**: Click any word to mask it
- **Multiple Simultaneous Masks**: Mask multiple words at once
- **Top-K Predictions**: See the most likely predictions for each masked token
- **Model Selection**:
  - BERT Base Uncased
  - DistilBERT Base
  - BERT Base Cased

### Predictions Display
- **Ranked Predictions**: Top predictions ordered by probability
- **Visual Probability Bars**: Gradient bars showing confidence
- **Probability Values**: Displayed as decimals or percentages
- **Click to Replace**: Click any prediction to replace the masked word
- **Configurable Settings**:
  - Number of predictions to show (1-20)
  - Minimum probability threshold
  - Probability display format

### Attention Visualization

1. **Attention Heatmaps**
   - Layer-by-layer attention patterns
   - Head-by-head attention analysis
   - Interactive heatmap with Plotly
   - Hover for detailed attention weights

2. **Attention Analysis**
   - Click heatmap cells for detailed breakdown
   - Top attended tokens for each position
   - Attention statistics and entropy

### Interactive Features
- **Example Sentences**: Pre-loaded examples to try
- **Auto-predict Mode**: Automatically predict when masking
- **Random Masking**: Mask a random word
- **Unmask All**: Clear all masks at once
- **Real-time Statistics**: Token count, masks, predictions, confidence

## Technical Implementation

### Files
- `index.html` - Main HTML structure and application logic
- `css/bert-mlm.css` - Comprehensive styling
- `js/bert-model.js` - BERT model wrapper using Transformers.js
- `js/visualization.js` - Attention visualization components

### Key Components

**BERT Model Wrapper**:
- Tokenization using BERT tokenizer
- Model inference with attention extraction
- Softmax probability calculation
- Top-K prediction filtering
- Attention tensor processing

**Attention Processing**:
- Extract attention weights from model outputs
- Process multi-layer, multi-head attention
- Convert tensors to JavaScript arrays
- Support for attention aggregation

**Visualization**:
- Plotly heatmaps for attention weights
- Interactive color scales
- Layer and head selection
- Detailed attention breakdowns

## Usage

1. **Load Model**: BERT model loads automatically (or select different model)
2. **Enter Text**: Type or paste text, or select an example
3. **Process Text**: Click "Process Text" to tokenize
4. **Mask Words**: Click words to mask them (shows as [MASK])
5. **View Predictions**: See top predictions with probabilities
6. **Replace Words**: Click predictions to replace masked tokens
7. **Explore Attention**: Select layer and head to visualize attention patterns

## Educational Value

This demo teaches:
- How BERT performs masked language modeling
- Bidirectional context understanding
- Attention mechanisms in transformers
- Multi-head attention patterns
- Layer-wise representation learning
- Probability distributions over vocabulary
- Subword tokenization (WordPiece)

## How BERT MLM Works

1. **Tokenization**: Text is split into subword tokens
2. **Masking**: Selected tokens are replaced with [MASK]
3. **Encoding**: Bidirectional transformer processes sequence
4. **Prediction**: Model predicts original token at masked position
5. **Attention**: Each layer learns different attention patterns

## Use Cases

- **Exploring BERT's Knowledge**: See what BERT "knows" about the world
- **Understanding Context**: How surrounding words influence predictions
- **Attention Patterns**: Visualize what BERT pays attention to
- **Model Comparison**: Try different BERT variants
- **Educational**: Learn about transformer architectures

## Dependencies

- Transformers.js 2.17.1 - BERT model inference
- Plotly.js 2.27.0 - Attention heatmap visualization

## Performance Notes

- First model load takes 30-60 seconds (downloading weights)
- Subsequent loads use browser cache
- Inference is CPU-based (runs in browser)
- Smaller models (DistilBERT) are faster
