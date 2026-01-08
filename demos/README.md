# LLM Interactive Demos

Welcome to the interactive demonstrations for the **Models of Language and Communication** course! This collection of web-based demos provides hands-on exploration of core concepts in natural language processing and large language models.

## Overview

These interactive demos complement the course lectures and assignments, allowing you to visualize and experiment with key concepts in modern NLP and language models. Each demo is self-contained and can run directly in your web browser.

## Quick Start

### View Demos Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/ContextLab/llm-course.git
   cd llm-course/demos
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node.js
   npx http-server -p 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### GitHub Pages Deployment

The demos are automatically deployed to GitHub Pages when changes are pushed to the main branch. Visit the live demos at:
```
https://contextlab.github.io/llm-course/demos/
```

## Demo Catalog

### Available Demos

| Demo | Title | Topics | Status |
|------|-------|--------|--------|
| 01 | [ELIZA Chatbot](01-eliza/) | Pattern matching, Rule-based systems | ✅ Available |
| 02 | [Chatbot Evolution Timeline](02-chatbot-evolution/) | ELIZA, PARRY, ALICE, Seq2Seq, GPT | ✅ Available |
| 03 | [Text Tokenization](03-tokenization/) | BPE, WordPiece, Tokenization strategies | ✅ Available |
| 04 | [Word Embeddings Explorer](04-embeddings/) | Word2Vec, 3D visualization, Semantic space | ✅ Available |
| 05 | [Attention Mechanism](05-attention/) | Self-attention, Query-Key-Value, Attention weights | ✅ Available |
| 06 | [Transformer Architecture](06-transformer/) | Encoder-decoder, Multi-head attention | ✅ Available |
| 07 | [GPT Playground](07-gpt-playground/) | Autoregressive generation, GPT architecture | ✅ Available |
| 08 | [RAG System Demo](08-rag/) | Retrieval-augmented generation, Wikipedia corpus | ✅ Available |
| 09 | [Topic Modeling Studio](09-topic-modeling/) | LDA, Unsupervised learning, Wikipedia articles | ✅ Available |
| 10 | [Sentiment Analysis Dashboard](10-sentiment/) | Sentiment classification, IMDB dataset, Feature visualization | ✅ Available |
| 11 | [POS Tagging & Parsing](11-pos-tagging/) | Part-of-speech tagging, Dependency parsing, Syntax trees | ✅ Available |
| 12 | [Word Analogies Explorer](12-analogies/) | Vector arithmetic, Word2Vec, Semantic relationships | ✅ Available |
| 13 | [Semantic Search Engine](13-semantic-search/) | BM25, Embeddings, Hybrid search | ✅ Available |
| 14 | [BERT Masked Language Modeling](14-bert-mlm/) | BERT, MLM, Bidirectional context | ✅ Available |
| 15 | [Embeddings Comparison Lab](15-embeddings-comparison/) | Benchmarking, Model comparison, Quality vs speed | ✅ Available |

## Architecture

### Directory Structure

```
demos/
├── index.html              # Main landing page
├── README.md              # This file
├── shared/                # Shared resources
│   ├── css/
│   │   └── demo-styles.css        # Common styles
│   └── js/
│       └── visualization-utils.js # Utility functions
├── 01-eliza/              # Individual demo directories
├── 02-chatbot-evolution/
├── 03-tokenization/
├── 04-embeddings/
└── ...
```

### Shared Resources

#### CSS (`shared/css/demo-styles.css`)

The shared stylesheet provides:
- **Theme System**: Dark/light mode with CSS variables
- **Component Library**: Buttons, cards, forms, alerts
- **Layout Utilities**: Grid, flexbox helpers
- **Typography**: Consistent text styles
- **Visualization Components**: Canvas, legend, charts
- **Responsive Design**: Mobile-first approach

Usage in your demo:
```html
<link rel="stylesheet" href="../shared/css/demo-styles.css">
```

#### JavaScript (`shared/js/visualization-utils.js`)

Utility modules include:
- **ThemeManager**: Theme switching and persistence
- **CanvasUtils**: Canvas setup, drawing helpers
- **ColorUtils**: Color interpolation, palette generation
- **AnimationUtils**: Easing functions, spring animations
- **MatrixUtils**: Matrix operations, softmax, normalization
- **TextUtils**: Tokenization, text processing
- **DOMUtils**: Element creation, debounce, throttle

Usage in your demo:
```html
<script src="../shared/js/visualization-utils.js"></script>
<script>
  // Initialize theme
  ThemeManager.init();

  // Create animated visualization
  AnimationUtils.animate({
    from: 0,
    to: 100,
    duration: 1000,
    easing: 'easeInOutQuad',
    onUpdate: (value) => {
      console.log('Current value:', value);
    }
  });
</script>
```

## Creating a New Demo

### Step 1: Create Demo Directory

```bash
mkdir demos/XX-demo-name
cd demos/XX-demo-name
```

### Step 2: Create HTML Structure

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Demo Title</title>

    <!-- Shared CSS -->
    <link rel="stylesheet" href="../shared/css/demo-styles.css">

    <!-- Demo-specific CSS -->
    <style>
        /* Your custom styles */
    </style>
</head>
<body>
    <div class="demo-container">
        <header class="demo-header">
            <h1 class="demo-title">Your Demo Title</h1>
            <p class="demo-description">Brief description of your demo</p>
        </header>

        <section class="demo-section">
            <!-- Your demo content -->
        </section>
    </div>

    <!-- Shared utilities -->
    <script src="../shared/js/visualization-utils.js"></script>

    <!-- Demo-specific JavaScript -->
    <script>
        // Initialize theme
        ThemeManager.init();

        // Your demo code
    </script>
</body>
</html>
```

### Step 3: Add to Landing Page

Edit `demos/index.html` and add a demo card:

```html
<div class="demo-card">
    <span class="demo-number">Demo XX</span>
    <h3 class="demo-title">Your Demo Title</h3>
    <p class="demo-description">Description of what the demo does.</p>
    <div class="demo-tags">
        <span class="tag">Tag1</span>
        <span class="tag">Tag2</span>
    </div>
    <div class="demo-status">
        <span class="status-dot"></span>
        <span>Available</span>
    </div>
    <a href="XX-demo-name/" class="demo-link">Launch Demo →</a>
</div>
```

### Step 4: Create Demo README

Create `XX-demo-name/README.md`:

```markdown
# Demo XX: Your Demo Title

## Overview
Brief description of the demo.

## Learning Objectives
- Objective 1
- Objective 2

## How to Use
1. Step 1
2. Step 2

## Technical Details
Implementation details, algorithms used, etc.

## References
- Link to relevant papers
- Link to course materials
```

## Design Guidelines

### Visual Design

- **Color Scheme**: Use CSS variables from `demo-styles.css`
- **Typography**: System fonts for performance
- **Spacing**: Use spacing variables (`--spacing-*`)
- **Responsive**: Mobile-first, test on different screen sizes

### User Experience

- **Progressive Disclosure**: Show simple options first
- **Immediate Feedback**: Respond to user actions quickly
- **Error Handling**: Provide clear error messages
- **Loading States**: Show spinners during processing
- **Accessibility**: Use semantic HTML, ARIA labels

### Performance

- **Lazy Loading**: Load resources only when needed
- **Debouncing**: Debounce expensive operations
- **Canvas**: Use `CanvasUtils.createCanvas()` for retina displays
- **Animations**: Use `requestAnimationFrame` for smooth animations

## Testing

### Local Testing

1. **Visual Testing**: Check in Chrome, Firefox, Safari
2. **Responsive Testing**: Test mobile, tablet, desktop
3. **Theme Testing**: Verify dark/light mode
4. **Performance Testing**: Check loading time and interactions

### Cross-Browser Compatibility

The demos are designed to work in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Test with screen readers

## Deployment

### Automatic Deployment

Demos are automatically deployed via GitHub Actions when changes are pushed to the `main` branch:

1. Workflow: `.github/workflows/deploy-demos.yml`
2. Trigger: Push to `main` with changes in `demos/`
3. Target: GitHub Pages

### Manual Deployment

To manually trigger deployment:

1. Go to GitHub repository
2. Navigate to "Actions" tab
3. Select "Deploy Demos to GitHub Pages"
4. Click "Run workflow"

### Enabling GitHub Pages

First-time setup:

1. Go to repository Settings
2. Navigate to Pages section
3. Under "Build and deployment":
   - Source: GitHub Actions
4. Save changes

## Troubleshooting

### Common Issues

**Demo not loading**
- Check browser console for errors
- Verify file paths are correct (use relative paths)
- Ensure local server is running

**Styles not applying**
- Clear browser cache
- Check CSS link path
- Verify CSS variables are defined

**JavaScript errors**
- Check that `visualization-utils.js` is loaded
- Verify function names match exported utilities
- Check for typos in variable names

**GitHub Pages 404**
- Verify file paths use correct case (case-sensitive)
- Check that `.nojekyll` file exists
- Wait a few minutes after deployment

## Resources

### Documentation

- [MDN Web Docs](https://developer.mozilla.org/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

### Visualization Libraries

While demos use vanilla JavaScript, you may find these libraries helpful:
- [D3.js](https://d3js.org/) - Data visualization
- [Three.js](https://threejs.org/) - 3D graphics
- [Chart.js](https://www.chartjs.org/) - Simple charts
- [Plotly.js](https://plotly.com/javascript/) - Interactive plots

### Course Materials

- [Course Repository](https://github.com/ContextLab/llm-course)
- [Lecture Notes](../lectures/)
- [Assignments](../assignments/)

## Contributing

We welcome contributions! To contribute a new demo:

1. Fork the repository
2. Create a new branch: `git checkout -b demo/your-demo-name`
3. Create your demo following the guidelines above
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow existing naming conventions
- Keep files organized and modular

## License

This project is part of the PSYC 51.17 course materials.

## Contact

For questions or issues:
- Course: PSYC 51.17 - Models of Language and Communication
- Instructor: [Course website](https://www.dartmouth.edu/~psyc50/)
- Repository: [GitHub](https://github.com/ContextLab/llm-course)

---

**Last Updated**: December 2025
**Course**: Winter 2026
**Copyright**: Jeremy R. Manning
