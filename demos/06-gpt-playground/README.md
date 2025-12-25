# GPT Text Generation Playground

An interactive web-based playground for exploring GPT text generation with different sampling strategies and real-time visualizations.

## Features

### Model Support
- **GPT-2** (124M parameters)
- **DistilGPT-2** (82M parameters)
- Runs entirely in the browser using Transformers.js

### Sampling Strategies

1. **Greedy Decoding**
   - Always selects the most probable token
   - Deterministic output
   - Good for factual/consistent text

2. **Temperature Sampling**
   - Controls randomness (0.0 - 2.0)
   - Lower temperature = more focused
   - Higher temperature = more creative/random

3. **Top-k Sampling**
   - Sample from top k most likely tokens
   - Prevents selecting unlikely tokens
   - Adjustable k value (1-100)

4. **Top-p (Nucleus) Sampling**
   - Sample from smallest set with cumulative probability ≥ p
   - Dynamic vocabulary size
   - Adjustable p value (0.0-1.0)

5. **Combined Sampling**
   - Uses Top-k + Top-p + Temperature together
   - Most flexible and controllable

### Interactive Controls

- **Temperature Slider** (0.0-2.0): Control randomness
- **Top-k Slider** (1-100): Limit vocabulary size
- **Top-p Slider** (0.0-1.0): Nucleus sampling threshold
- **Max Length** (10-500): Control generation length
- **Repetition Penalty** (1.0-2.0): Discourage repetition

### Visualizations

#### Token Probability Display
- Shows probability distribution at each generation step
- Displays top 5 candidate tokens
- Highlights selected token
- Real-time probability bars

#### Alternative Tokens
- Shows top 10 alternative tokens
- Displays their probabilities
- Updates with each generation step

#### Entropy Chart
- Plots entropy over generation steps
- Shows uncertainty in model predictions
- Real-time line graph
- Measured in bits

#### Token Surprise
- Calculates negative log probability
- Color-coded by surprise level:
  - Green: Low surprise (< 2 bits)
  - Blue: Medium surprise (2-5 bits)
  - Orange: High surprise (5-8 bits)
  - Red: Very high surprise (> 8 bits)

#### Generation Statistics
- Tokens generated count
- Average probability
- Average entropy
- Time elapsed

### Comparison Mode

- Generate text with two different strategies side-by-side
- Compare outputs directly
- Useful for understanding strategy differences

## Usage

### Getting Started

1. Open `index.html` in a modern web browser
2. Wait for the model to load (first time may take 1-2 minutes)
3. Enter your prompt
4. Adjust parameters as desired
5. Click "Generate"

### Example Workflows

#### Creative Writing
- Strategy: Temperature or Top-p
- Temperature: 0.8-1.2
- Top-p: 0.9
- Repetition Penalty: 1.2

#### Factual/Consistent Text
- Strategy: Greedy or Low Temperature
- Temperature: 0.1-0.3
- Top-k: 10-20

#### Balanced Generation
- Strategy: Combined
- Temperature: 0.7
- Top-k: 40
- Top-p: 0.9

### Understanding the Visualizations

#### Probability Distribution
- Higher bars = more likely tokens
- Green highlight = selected token
- Compare selected vs alternatives

#### Entropy
- Low entropy (0-2 bits) = confident predictions
- Medium entropy (2-5 bits) = moderate uncertainty
- High entropy (5+ bits) = very uncertain

#### Surprise
- Measures how unexpected a token is
- Low surprise = predictable choice
- High surprise = creative/unexpected choice
- Useful for identifying interesting generation moments

## Technical Details

### Architecture

```
index.html              # Main HTML structure
├── css/
│   └── gpt.css        # Styling and animations
└── js/
    ├── text-generator.js           # Main controller
    ├── sampling-strategies.js      # Sampling algorithms
    └── probability-visualizer.js   # Visualization logic
```

### Key Components

#### SamplingStrategies Class
- Implements all sampling algorithms
- Temperature scaling
- Repetition penalty
- Softmax computation
- Entropy calculation
- Surprise metrics

#### ProbabilityVisualizer Class
- Token probability bars
- Entropy line chart
- Alternative tokens display
- Surprise visualization
- Statistics tracking

#### TextGenerationPlayground Class
- Model loading and management
- Generation orchestration
- UI event handling
- Token-by-token streaming
- Statistics collection

### Dependencies

- **Transformers.js** (v2.17.2): Browser-based ML inference
  - Loaded via CDN: `https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2`
  - No installation required
  - Runs entirely client-side

### Browser Requirements

- Modern browser with:
  - ES6 module support
  - WebAssembly support
  - Canvas API support
- Recommended: Chrome, Firefox, Safari (latest versions)

## Educational Value

### Learning Objectives

1. **Understand Sampling Strategies**
   - See how different strategies affect output
   - Compare deterministic vs stochastic generation
   - Understand trade-offs

2. **Visualize Model Uncertainty**
   - Observe probability distributions
   - Track entropy over time
   - Identify confident vs uncertain predictions

3. **Explore Parameter Effects**
   - Interactive parameter tuning
   - Real-time feedback
   - Develop intuition for settings

4. **Token-Level Analysis**
   - See generation step-by-step
   - Understand token probabilities
   - Identify surprising choices

### Use Cases

- **Students**: Learn about language model generation
- **Researchers**: Experiment with sampling parameters
- **Developers**: Understand generation strategies
- **Writers**: Explore creative AI assistance
- **Educators**: Demonstrate NLP concepts

## Performance Notes

### Initial Load
- First load downloads ~40-80MB (depending on model)
- Models are cached in browser
- Subsequent loads are instant

### Generation Speed
- DistilGPT-2: ~2-5 tokens/second (typical)
- GPT-2: ~1-3 tokens/second (typical)
- Speed varies by hardware
- Runs on CPU (no GPU required)

### Memory Usage
- DistilGPT-2: ~350MB
- GPT-2: ~500MB
- Browser should have sufficient memory

## Limitations

### Current Limitations

1. **Model Access**
   - Limited to models supported by Transformers.js
   - Cannot use larger models (GPT-2 Large/XL) efficiently
   - No fine-tuned model support currently

2. **Logits Access**
   - Transformers.js doesn't expose raw logits
   - Probability displays are simulated for visualization
   - Actual generation uses library's internal sampling

3. **Performance**
   - Slower than native inference
   - Not suitable for production use
   - Best for educational/experimental purposes

4. **Features**
   - No beam search implementation yet
   - No custom stopping criteria
   - Limited token-level control

### Future Enhancements

- [ ] True logits access for accurate probabilities
- [ ] Beam search visualization
- [ ] Custom model upload
- [ ] Export/save generations
- [ ] More visualization types
- [ ] Multi-generation comparison
- [ ] Parameter presets
- [ ] Generation history

## Troubleshooting

### Model won't load
- Check internet connection
- Clear browser cache
- Try a different browser
- Check console for errors

### Slow generation
- Normal on first run (model loading)
- Use DistilGPT-2 for faster generation
- Reduce max length
- Close other browser tabs

### Visualizations not updating
- Check visualization checkboxes are enabled
- Try clearing and regenerating
- Refresh the page

### Browser compatibility issues
- Update to latest browser version
- Try Chrome or Firefox
- Ensure JavaScript is enabled
- Check for WebAssembly support

## License

This demo is part of the LLM course materials and is intended for educational purposes.

## Credits

- Built with [Transformers.js](https://github.com/xenova/transformers.js)
- Models from [Hugging Face](https://huggingface.co/)
- Inspired by OpenAI's GPT playground
