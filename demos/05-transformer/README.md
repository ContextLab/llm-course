# Interactive Transformer Architecture Explorer

A stunning 3D visualization tool for exploring transformer architectures interactively. This demo provides an immersive educational experience for understanding the internal workings of transformers.

## Features

### 🎨 3D Visualization
- **Three.js-powered 3D models** of transformer architectures
- **Smooth animations** and transitions using Anime.js
- **Interactive camera controls** (orbit, zoom, pan)
- **Dynamic lighting** and shadows for depth perception
- **Auto-rotation** and manual exploration modes

### 🏗️ Architecture Support
- **Vanilla Transformer** (Encoder-Decoder) - Original "Attention is All You Need"
- **BERT** (Encoder-only) - Bidirectional representations
- **GPT** (Decoder-only) - Autoregressive language modeling
- **T5** (Encoder-Decoder) - Text-to-Text Transfer Transformer

### 🔍 Component Deep-Dives
Click on any component to explore:
- **Embedding Layer**: Token-to-vector conversion
- **Positional Encoding**: Position information injection
- **Multi-Head Attention**: Parallel attention mechanisms
- **Feed-Forward Network**: Position-wise transformations
- **Layer Normalization**: Feature normalization
- **Residual Connections**: Skip connections for gradient flow

### 📊 Educational Modes
- **Beginner**: High-level explanations and intuitive descriptions
- **Intermediate**: Mathematical formulas and architectural details
- **Advanced**: Full implementations, research insights, and tensor operations

### 🎯 Interactive Features
- **Animated Forward Pass**: Watch data flow through the network
- **Tensor Shape Tracking**: See how dimensions change at each layer
- **Component Library**: Quick access to all building blocks
- **Clickable Components**: Zoom into specific layers
- **Color-coded Layers**: Visual distinction of component types
- **D3.js Data Flow**: 2D visualization of tensor transformations

## Usage

### Opening the Demo
Simply open `index.html` in a modern web browser:
```bash
# From the demos directory
cd /home/user/llm-course/demos/05-transformer
python3 -m http.server 8000
# Then navigate to http://localhost:8000
```

Or open directly in browser:
```bash
firefox index.html
# or
google-chrome index.html
```

### Controls

#### 3D Scene Navigation
- **Left Mouse**: Rotate view
- **Right Mouse**: Pan view
- **Scroll Wheel**: Zoom in/out
- **Click Component**: Select and view details

#### Interface Controls
- **Architecture Selector**: Switch between transformer variants
- **Educational Mode**: Adjust complexity of explanations
- **Input Text**: Enter text for forward pass animation
- **Animate Button**: Start forward pass visualization
- **Reset View**: Return camera to default position
- **Toggle Labels**: Show/hide component labels

### Exploring Components

1. **Select Architecture**: Choose from Vanilla, BERT, GPT, or T5
2. **Click on a Component**: In the 3D view or component library
3. **Read Details**: Side panel shows:
   - Description (mode-specific)
   - Mathematical formulas
   - Tensor shapes
   - Code implementation
   - Key insights

4. **Animate Forward Pass**:
   - Enter text in input field
   - Click "Animate Forward Pass"
   - Watch particles flow through layers
   - See components highlight as data passes through

## File Structure

```
05-transformer/
├── index.html                      # Main HTML file
├── css/
│   └── transformer.css             # Styling and animations
├── js/
│   ├── architecture-3d.js          # Three.js 3D visualization
│   └── component-explorer.js       # Component details and UI logic
└── README.md                       # This file
```

## Technical Details

### Libraries Used
- **Three.js r128**: 3D rendering and scene management
- **D3.js v7**: 2D tensor flow visualization
- **Anime.js 3.2.1**: Smooth animations and transitions
- **OrbitControls**: Interactive 3D camera controls

### Architecture Configurations

#### Vanilla Transformer
- Layers: 6 encoder + 6 decoder
- Attention Heads: 8
- Model Dimension: 512
- FFN Dimension: 2048

#### BERT
- Layers: 12 (encoder-only)
- Attention Heads: 12
- Model Dimension: 768
- FFN Dimension: 3072

#### GPT
- Layers: 12 (decoder-only)
- Attention Heads: 12
- Model Dimension: 768
- FFN Dimension: 3072

#### T5
- Layers: 12 encoder + 12 decoder
- Attention Heads: 12
- Model Dimension: 768
- FFN Dimension: 3072

### Component Color Scheme
- 🟢 **Green (#4CAF50)**: Embedding layers
- 🔵 **Blue (#2196F3)**: Attention mechanisms
- 🟠 **Orange (#FF9800)**: Feed-forward networks
- 🟣 **Purple (#9C27B0)**: Normalization layers
- 🔴 **Red (#F44336)**: Output layers

## Educational Content

### Component Implementations
Each component includes:
- **Beginner-friendly** explanations
- **Mathematical formulas** with proper notation
- **PyTorch code** implementations
- **Tensor shape** transformations
- **Key concepts** and insights

### Code Examples
All code examples are executable PyTorch implementations that demonstrate:
- Proper tensor handling
- Shape transformations
- Forward pass logic
- Best practices

## Performance Tips

1. **Disable Auto-Rotate**: For better performance on slower devices
2. **Reduce Layers**: Use BERT/GPT with fewer displayed layers
3. **Toggle Labels Off**: Improves rendering performance
4. **Limit Animation**: Don't trigger multiple animations simultaneously

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires WebGL support for 3D rendering.

## Learning Path

### Beginners
1. Start with **Beginner Mode**
2. Explore **Vanilla Transformer** architecture
3. Click on **Embedding** and **Attention** components
4. Run **Animated Forward Pass** with simple text
5. Read the high-level descriptions

### Intermediate Learners
1. Switch to **Intermediate Mode**
2. Compare **BERT vs GPT** architectures
3. Study **mathematical formulas** in component details
4. Examine **tensor shape** transformations
5. Review **code implementations**

### Advanced Users
1. Use **Advanced Mode** for research-level details
2. Compare all four architectures (**Vanilla, BERT, GPT, T5**)
3. Study **implementation details** in code blocks
4. Understand **optimization techniques** mentioned in key points
5. Explore **architectural variants** (Pre-LN vs Post-LN, etc.)

## Extensions and Customization

### Adding New Architectures
Edit `architecture-3d.js` and add to `configs` object:
```javascript
this.configs.myarch = {
    name: 'My Architecture',
    layers: 6,
    heads: 8,
    dModel: 512,
    dFF: 2048,
    hasEncoder: true,
    hasDecoder: false
};
```

### Adding New Components
Edit `component-explorer.js` and add to `initializeComponentData()`:
```javascript
mynewcomponent: {
    name: 'My Component',
    icon: '🎯',
    description: { beginner: '...', intermediate: '...', advanced: '...' },
    formula: '...',
    tensorShapes: { input: '...', output: '...' },
    code: '...',
    keyPoints: [...]
}
```

## References

### Papers
- Vaswani et al. (2017) - "Attention is All You Need"
- Devlin et al. (2018) - "BERT: Pre-training of Deep Bidirectional Transformers"
- Radford et al. (2018) - "Improving Language Understanding by Generative Pre-Training"
- Raffel et al. (2019) - "Exploring the Limits of Transfer Learning with T5"

### Resources
- [The Illustrated Transformer](http://jalammar.github.io/illustrated-transformer/)
- [Annotated Transformer](http://nlp.seas.harvard.edu/annotated-transformer/)
- [Transformer Architecture - PyTorch Docs](https://pytorch.org/docs/stable/nn.html#transformer-layers)

## License

Educational use only. Created for the LLM Course. Copyright Jeremy R. Manning.

## Credits

Created with:
- Three.js for 3D graphics
- D3.js for data visualization
- Anime.js for animations
- Love for transformers ❤️
