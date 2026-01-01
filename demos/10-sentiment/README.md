# Interactive Sentiment Analysis Dashboard

A comprehensive web-based sentiment analysis tool featuring multiple models, real-time analysis, and beautiful visualizations. Now includes real IMDB movie review dataset with 5000 labeled reviews for model evaluation and comparison.

## Features

### 1. Sentiment Classification
- **Single Text Analysis**: Real-time sentiment detection as you type
- **Batch Analysis**: Upload CSV files to analyze multiple texts at once
- **IMDB Dataset Analysis**: Analyze real movie reviews with ground truth labels
- **Multi-class Classification**: Positive, Negative, and Neutral sentiments
- **Confidence Scores**: Detailed probability distributions for each sentiment
- **Model Performance Metrics**: Accuracy, precision, recall, F1 score, confusion matrix

### 2. Multiple Models
- **Rule-Based (VADER-like)**: Fast, lightweight sentiment analysis using lexicon-based approach
  - Comprehensive sentiment lexicon
  - Handles negations, intensifiers, and diminishers
  - Punctuation-aware (exclamation marks boost sentiment)
  - No internet required

- **Transformer-Based**: State-of-the-art deep learning model
  - Uses DistilBERT fine-tuned on SST-2 dataset
  - More accurate for complex sentences
  - Handles context and nuance better
  - Requires first-time model download

- **Model Comparison**: Compare results from both models side-by-side

### 3. Visualizations

#### Sentiment Gauge
- Beautiful animated gauge showing overall sentiment
- Visual representation with color-coded segments
- Real-time needle animation

#### Confidence Breakdown
- Animated progress bars for each sentiment class
- Percentage display with smooth transitions
- Color-coded for easy interpretation

#### Word-Level Contribution
- Interactive word highlighting showing sentiment contribution
- Hover tooltips with detailed scores
- Color intensity based on impact strength
- Statistics on positive/negative/neutral words
- Top contributing words ranking

#### Distribution Charts
- Doughnut chart for batch analysis results
- Visual distribution of sentiments across dataset

### 4. Advanced Features

#### Emoji Analysis
- Automatic emoji detection
- Sentiment classification of emojis
- Count of positive vs negative emojis
- Visual display of all detected emojis

#### Aspect-Based Sentiment
- Detects specific aspects mentioned in text
- Common aspects: product, service, quality, price, delivery
- Shows sentiment for each detected aspect

#### Real-time Feedback
- Auto-analysis as you type (1-second debounce)
- Character counter
- Instant visual updates

#### Batch Processing
- CSV file upload (drag-and-drop supported)
- Preview of uploaded data
- Filter results by sentiment
- Export analyzed results to CSV
- Batch statistics and distribution

## Usage

### Single Text Analysis

1. Open `index.html` in a modern web browser
2. Ensure you have an internet connection (for transformer model)
3. Type or paste text in the input area
4. Select your preferred model (Rule-Based or Transformer)
5. Click "Analyze Sentiment" or wait for real-time analysis
6. View results in the various visualization panels

### Batch Analysis

1. Click the "Batch (CSV)" tab
2. Upload a CSV file with a "text" column containing sentences
   - Or drag and drop the file into the upload area
   - See `sample-data.csv` for format example
3. Preview the loaded data
4. Select your analysis model
5. Click "Analyze Sentiment"
6. View results in the table and distribution chart
7. Filter results by sentiment type
8. Export results using the "Export Results" button

### IMDB Dataset Analysis

1. Click the "IMDB Reviews" tab
2. Choose dataset size:
   - **Sample (500 reviews)**: Fast loading and analysis for quick testing
   - **Full (5000 reviews)**: Comprehensive dataset for thorough evaluation
3. Set the number of reviews to analyze (10-5000)
4. Click "Load & Analyze Reviews"
5. View comprehensive results:
   - **Accuracy Banner**: Overall model accuracy percentage
   - **Results Table**: Shows each review with true label, prediction, and match indicator
   - **Performance Metrics**: Precision, recall, and F1 score
   - **Confusion Matrix**: True positives, false positives, true negatives, false negatives
   - **Distribution Chart**: Visual breakdown of sentiment predictions
6. Compare different models to see which performs better on real data

### Model Comparison

1. Enter text for analysis
2. Check the "Compare Models" checkbox
3. Click "Analyze Sentiment"
4. View side-by-side comparison of both models
5. See agreement/disagreement indicator

## Technical Details

### Architecture

```
demos/09-sentiment/
├── index.html                      # Main dashboard interface
├── css/
│   └── sentiment.css              # Styling and animations
├── js/
│   ├── sentiment-analyzer.js      # Core analysis logic
│   ├── contribution-visualizer.js # Word-level visualization
│   └── imdb-handler.js            # IMDB dataset handling
├── data/
│   ├── imdb-reviews.json          # Full IMDB dataset (5000 reviews)
│   └── imdb-sample.json           # Sample dataset (500 reviews)
├── sample-data.csv                # Example CSV dataset
└── README.md                      # Documentation
```

### Dependencies

- **Transformers.js** (v2.6.0): For transformer-based sentiment analysis
- **Chart.js** (v4.4.0): For distribution charts
- No build process required - pure vanilla JavaScript

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires ES6 module support and modern JavaScript features.

### Rule-Based Model Implementation

The VADER-like implementation includes:

- **Lexicon**: 100+ words with sentiment scores (-3 to +3)
- **Negation Handling**: Reverses sentiment within 3-word window
- **Intensifiers**: "very", "extremely" boost sentiment
- **Diminishers**: "somewhat", "slightly" reduce sentiment
- **Punctuation**: Exclamation marks increase intensity
- **Normalization**: Alpha-normalized compound score

### Transformer Model

- **Model**: DistilBERT Base Uncased (SST-2 fine-tuned)
- **Architecture**: 6-layer transformer, 768 hidden units
- **Training Data**: Stanford Sentiment Treebank v2
- **Performance**: ~90% accuracy on SST-2 test set
- **Size**: ~250MB (cached after first download)

## Performance

### Rule-Based Analysis
- **Speed**: <1ms per text
- **Memory**: ~1MB
- **Offline**: Yes
- **Accuracy**: ~70-80% on simple texts

### Transformer Analysis
- **Speed**: 50-200ms per text (after model load)
- **Memory**: ~300MB
- **Offline**: No (first download requires internet)
- **Accuracy**: ~85-92% on varied texts

## Examples

### Positive Sentiment
```
"I absolutely love this product! It's amazing and works perfectly. 😊"
```
- Sentiment: Positive
- Confidence: 95%
- Top words: "love" (+3.0), "amazing" (+3.0), "perfectly" (+2.5)

### Negative Sentiment
```
"This is the worst experience I've ever had. Completely disappointed. 😞"
```
- Sentiment: Negative
- Confidence: 93%
- Top words: "worst" (-3.0), "disappointed" (-2.5)

### Neutral Sentiment
```
"The weather is okay today, nothing special."
```
- Sentiment: Neutral
- Confidence: 78%
- Mixed positive/negative indicators

### Complex (Negation)
```
"I don't hate it, but it's not great either."
```
- Demonstrates negation handling
- Multiple sentiment switches
- Moderate confidence

## Customization

### Adding Custom Words to Lexicon

Edit `js/sentiment-analyzer.js`:

```javascript
this.lexicon = {
    // Add your custom words
    'awesome': 3.0,
    'terrible': -3.0,
    // ...existing words
};
```

### Changing Color Scheme

Edit CSS variables in `css/sentiment.css`:

```css
:root {
    --positive-color: #22c55e; /* Change positive color */
    --negative-color: #ef4444; /* Change negative color */
    --neutral-color: #94a3b8;  /* Change neutral color */
}
```

### Using Different Transformer Models

Edit `js/sentiment-analyzer.js`:

```javascript
this.transformerModel = await pipeline(
    'sentiment-analysis',
    'Xenova/your-model-name-here'
);
```

## Educational Use

This dashboard is designed for educational purposes to demonstrate:

1. **NLP Concepts**: Sentiment analysis, lexicon-based vs ML approaches
2. **Data Visualization**: Interactive charts and real-time updates
3. **Model Comparison**: Understanding trade-offs between approaches
4. **Web Technologies**: Modern JavaScript, async/await, ES6 modules
5. **UX Design**: Real-time feedback, progressive enhancement

## Limitations

- Rule-based model struggles with sarcasm and irony
- Transformer model requires internet for first use
- Single language support (English only)
- Word-level visualization is approximated for transformer model
- Aspect detection uses simple keyword matching

## Dataset Information

### IMDB Movie Reviews

The dashboard includes a real-world dataset of movie reviews from the Internet Movie Database (IMDB):

- **Total Reviews**: 5000 (with 500-review sample for faster testing)
- **Source**: IMDB movie reviews
- **Labels**: Binary sentiment (positive/negative)
- **Distribution**: Balanced dataset (~50% positive, ~50% negative)
- **Average Length**: Varies from short comments to detailed reviews
- **Format**: JSON array with fields: `text`, `sentiment`, `source`

This dataset allows you to:
- Test model accuracy on real-world data
- Compare rule-based vs. transformer models
- Understand model strengths and weaknesses
- Learn about precision, recall, and F1 scores
- Visualize confusion matrices

### Data Format

```json
[
  {
    "text": "This film is stunningly beautiful...",
    "sentiment": "positive",
    "source": "imdb"
  },
  {
    "text": "This was not enjoyable to watch...",
    "sentiment": "negative",
    "source": "imdb"
  }
]
```

## Future Enhancements

- [ ] Multi-language support
- [ ] Sarcasm detection
- [ ] Fine-grained emotion detection (joy, anger, fear, etc.)
- [ ] Sentence-level sentiment in paragraphs
- [ ] Additional real-world datasets (Twitter, Amazon reviews, etc.)
- [ ] Model fine-tuning interface
- [ ] API integration options
- [ ] Historical analysis tracking
- [ ] Export detailed performance reports

## License

This project is created for educational purposes as part of the LLM course materials.

## Credits

- **VADER Lexicon**: Inspired by VADER (Valence Aware Dictionary and sEntiment Reasoner)
- **Transformers.js**: By Xenova - JavaScript port of Hugging Face Transformers
- **DistilBERT**: By Hugging Face - Distilled version of BERT
- **Chart.js**: Open-source charting library

## Support

For issues or questions about this demo:
1. Check the browser console for error messages
2. Ensure you have a stable internet connection (for transformer model)
3. Try the rule-based model if transformer fails to load
4. Clear browser cache if models don't update

## Getting Started

Simply open `index.html` in your browser - no installation or build process required!

### Quick Start Options

**Option 1: Try IMDB Dataset (Recommended)**
1. Open `index.html` in a modern web browser
2. Click on the "IMDB Reviews" tab
3. Select "Sample Dataset" (500 reviews) for faster results
4. Set number of reviews to 100
5. Click "Load & Analyze Reviews"
6. Explore the accuracy metrics and results!

**Option 2: Single Text Analysis**
1. Open `index.html`
2. Type your own text in the input area
3. Watch real-time sentiment analysis
4. Try both Rule-Based and Transformer models

**Option 3: Batch CSV Upload**
1. Switch to "Batch (CSV)" mode
2. Upload `sample-data.csv`
3. Analyze and explore the results
