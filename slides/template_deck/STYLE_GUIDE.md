# CDL Theme Style Guide

A comprehensive style guide for creating presentations using the Contextual Dynamics Lab (CDL) Marp theme.

## Table of Contents

1. [Installation](#installation)
2. [Compilation](#compilation)
3. [Slide Types](#slide-types)
4. [Typography](#typography)
5. [Colors](#colors)
6. [Tables](#tables)
7. [Code Blocks](#code-blocks)
8. [Equations](#equations)
9. [Two-Column Layouts](#two-column-layouts)
10. [Callout Boxes](#callout-boxes)
11. [Emoji Figures](#emoji-figures)
12. [Quotes](#quotes)
13. [Diagrams](#diagrams)
14. [Flow Diagrams](#flow-diagrams-auto-generated)
15. [Charts (Automated Styling)](#charts-automated-styling)
16. [Best Practices](#best-practices)
17. [Dartmouth Color Reference](#dartmouth-color-reference)
18. [Diagram and Figure Color Guidelines](#diagram-and-figure-color-guidelines)

---

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Python 3.8+

### Install Marp CLI

```bash
npm install -g @marp-team/marp-cli
```

### Clone the Template

```bash
cd /path/to/your/project
cp -r /path/to/template_deck .
```

---

## Compilation

### Basic Usage

```bash
./compile.sh presentation.md
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output` | Output file path | `<input>.html` |
| `-l, --lines` | Max lines per code block slide | 20 |
| `-r, --rows` | Max rows per table slide | 8 |
| `-f, --format` | Output format: html, pdf, pptx | html |
| `--no-split` | Disable auto-splitting | false |
| `--keep-temp` | Keep temp file for debugging | false |

### Examples

```bash
# Compile to HTML (default)
./compile.sh my_slides.md

# Compile to PDF
./compile.sh my_slides.md -f pdf

# Custom line limits
./compile.sh my_slides.md -l 15 -r 6

# Specify output file
./compile.sh my_slides.md -o output/presentation.html
```

---

## Slide Types

### Title Slide

The first slide automatically becomes a title slide with the CDL geometric background.

```markdown
---
marp: true
theme: cdl-theme
math: katex
---

# Presentation Title
### Subtitle or Course Name

Author Name
Institution
Term Year
```

### Content Slides

All subsequent slides use a clean layout with the CDL logo watermark.

```markdown
---

# Slide Title

Content goes here with bullet points:
- First point
- Second point
- Third point
```

---

## Typography

### Text Hierarchy

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 | 1.8em | 700 | Slide titles |
| H2 | 1.4em | 600 | Section headers |
| H3 | 1.2em | 600 | Subsection headers |
| Body | 1em | 400 | Regular text |
| Code | 0.9em | 400 | Inline code |

### Text Emphasis

```markdown
- Use **bold** for strong emphasis
- Use *italics* for subtle emphasis
- Use `code` for inline code or technical terms
```

### Sentence Case Convention

All titles and labels should use **sentence case** (capitalize only the first word and proper nouns):

- Good: "Training data"
- Bad: "Training Data"

---

## Colors

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| Dartmouth Green | `#00693e` | Primary accent, links |
| Dark Green | `#0a2518` | Headings, text |
| Light Gray | `#d8d8d8` | Slide background |
| Code Background | `#2a2f38` | Code blocks |

### Callout Box Colors (Dartmouth Palette)

| Type | Dartmouth Color | Border Hex |
|------|-----------------|------------|
| `.note-box` | River Blue | `#267aba` |
| `.example-box` | Dartmouth Green | `#00693e` |
| `.warning-box` | Bonfire Orange | `#ffa00f` |
| `.tip-box` | Rich Spring Green | `#a5d75f` |
| `.important-box` | Bonfire Red | `#9d162e` |
| `.definition-box` | Violet | `#8a6996` |

### Emoji Background Colors (Dartmouth Tertiary Palette)

| Class | Dartmouth Color | Hex |
|-------|-----------------|-----|
| `emoji-bg-green` | Dartmouth Green | `#00693e` |
| `emoji-bg-blue`, `emoji-bg-river-blue` | River Blue | `#267aba` |
| `emoji-bg-navy`, `emoji-bg-river-navy` | River Navy | `#003c73` |
| `emoji-bg-spring`, `emoji-bg-spring-green` | Spring Green | `#c4dd88` |
| `emoji-bg-rich-spring`, `emoji-bg-teal` | Rich Spring Green | `#a5d75f` |
| `emoji-bg-yellow`, `emoji-bg-summer` | Summer Yellow | `#f5dc69` |
| `emoji-bg-orange`, `emoji-bg-bonfire` | Bonfire Orange | `#ffa00f` |
| `emoji-bg-red`, `emoji-bg-bonfire-red` | Bonfire Red | `#9d162e` |
| `emoji-bg-tuck`, `emoji-bg-tuck-orange` | Tuck Orange | `#d94415` |
| `emoji-bg-violet`, `emoji-bg-purple` | Violet | `#8a6996` |
| `emoji-bg-brown`, `emoji-bg-autumn` | Autumn Brown | `#643c20` |
| `emoji-bg-gray`, `emoji-bg-granite` | Granite Gray | `#424141` |
| `emoji-bg-forest` | Forest Green | `#12312b` |

---

## Tables

### Simple Table

```markdown
| Model | Year | Params |
|-------|------|--------|
| GPT-2 | 2019 | 1.5B |
| GPT-3 | 2020 | 175B |
| GPT-4 | 2023 | Unknown |
```

### Auto-Splitting

Tables with more than 8 rows are automatically split across multiple slides:
- Headers repeat on each slide
- "continued..." indicator appears when more content follows
- Consistent font sizing across all split slides

### Best Practices

- Keep tables concise
- Use sentence case for headers
- Avoid extremely wide tables (5+ columns)
- Let long content wrap naturally in cells

---

## Code Blocks

### Basic Code Block

````markdown
```python
def hello():
    """Simple function example."""
    print("Hello, Dartmouth!")
    return True
```
````

### Features

- **Line numbers**: Automatically added by compile script
- **Syntax highlighting**: Python, JavaScript, and other languages
- **Auto-splitting**: Long code blocks split across slides with continued line numbers

### Maximum Lines

Default: 20 lines per slide. Adjust with `-l` flag:

```bash
./compile.sh presentation.md -l 15
```

---

## Equations

### Display Equations

```markdown
$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
```

### Inline Equations

```markdown
The softmax function normalizes scores: $\text{softmax}(x_i) = \frac{e^{x_i}}{\sum_j e^{x_j}}$
```

### Equations in Lists

```markdown
- Attention scores: $\text{score}(q, k) = q \cdot k$
- Scaled version:

$$\text{score}(q, k) = \frac{q \cdot k}{\sqrt{d_k}}$$

- Output is weighted sum of values
```

---

## Two-Column Layouts

### Basic Two-Column

```markdown
<div style="display: flex; gap: 2em;">
<div>

**Left Column**
- Point A
- Point B

</div>
<div>

**Right Column**
- Point X
- Point Y

</div>
</div>
```

### Tips

- Gap automatically set to 2.5em
- Font size reduced to 0.85em in columns
- Works well for comparisons, before/after, pros/cons

---

## Callout Boxes

### Note Box

```markdown
<div class="note-box">

The attention mechanism was introduced in the context of machine translation, allowing models to focus on relevant parts of the input.

</div>
```

### Example Box

```markdown
<div class="example-box">

Consider the function `f(x) = x^2`. When `x = 3`, we get `f(3) = 9`.

</div>
```

### Warning Box

```markdown
<div class="warning-box">

Common pitfalls when fine-tuning LLMs:
- Overfitting on small datasets
- Catastrophic forgetting
- Learning rate too high

</div>
```

### Tip Box

```markdown
<div class="tip-box">

Use gradient checkpointing to reduce memory usage during training.

</div>
```

### Important Box

```markdown
<div class="important-box">

Always validate your model on held-out data before deployment.

</div>
```

### Definition Box

```markdown
<div class="definition-box">

**Attention mechanism**: A technique that allows models to focus on relevant parts of the input when producing output.

</div>
```

### Multiple Callouts

Multiple callout boxes can appear on the same slide.

---

## Emoji Figures

### Size Classes

| Class | Size | Usage |
|-------|------|-------|
| `emoji-xs` | 24px | Inline accents |
| `emoji-sm` | 48px | Small figures |
| `emoji-md` | 72px | Medium figures |
| `emoji-lg` | 96px | Standard figures |
| `emoji-xl` | 128px | Large figures |
| `emoji-xxl` | 192px | Hero/title figures |

### Basic Usage

```markdown
<span class="emoji emoji-lg">🧠</span>
```

### With Background

```markdown
<span class="emoji emoji-xl emoji-bg emoji-bg-green">🎓</span>
```

### With Label

```markdown
<div class="emoji-labeled">
  <span class="emoji emoji-lg emoji-bg emoji-bg-teal">🤖</span>
  <span class="label">LLM</span>
</div>
```

### States

```markdown
<!-- Normal -->
<span class="emoji emoji-lg">👤</span>

<!-- Faded (50% grayscale) -->
<span class="emoji emoji-lg emoji-faded">👤</span>

<!-- Inactive (full grayscale) -->
<span class="emoji emoji-lg emoji-gray">👤</span>
```

### Flow Diagram

```markdown
<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">🎓</span>
    <span class="label">Students</span>
  </div>
  <span class="emoji emoji-lg">➡️</span>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-teal">🤖</span>
    <span class="label">LLM</span>
  </div>
  <span class="emoji emoji-lg">➡️</span>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-orange">💡</span>
    <span class="label">Insights</span>
  </div>
</div>
```

---

## Quotes

### Blockquote

```markdown
> This is a quote that demonstrates the blockquote styling.

— Attribution
```

---

## Diagrams

### Recommended Approach: Kroki.io

For complex diagrams (Mermaid, GraphViz, PlantUML), use pre-rendered SVGs via Kroki.io:

```markdown
<div class="diagram-container">

![Flowchart](https://kroki.io/mermaid/svg/...)

</div>
```

---

## Flow Diagrams (Auto-Generated)

The CDL theme includes automatic flow diagram generation from simple markdown syntax. Write intuitive syntax and have it rendered as themed SVG diagrams.

### Basic Flow Diagram

````markdown
```flow
[Input] --> [Process] --> [Output]
```
````

This generates a horizontal flowchart with automatically colored nodes (cycles through: green, teal, blue, orange, gray).

### Custom Colors

Override automatic colors by specifying a color after the label:

````markdown
```flow
[Training Data:green] --> [Model:blue] --> [Fine-tuning:orange] --> [Deployment:violet]
```
````

### Available Flow Diagram Colors (Dartmouth Palette)

| Color Name | Dartmouth Color | Hex Code |
|------------|-----------------|----------|
| `green` | Dartmouth Green | `#00693e` |
| `teal` | Rich Spring Green | `#a5d75f` |
| `blue` | River Blue | `#267aba` |
| `orange` | Bonfire Orange | `#ffa00f` |
| `gray` | Granite Gray | `#424141` |
| `red` | Bonfire Red | `#9d162e` |
| `violet` | Violet | `#8a6996` |
| `navy` | River Navy | `#003c73` |
| `yellow` | Summer Yellow | `#f5dc69` |
| `brown` | Autumn Brown | `#643c20` |
| `spring` | Spring Green | `#c4dd88` |

### Adding Captions

Add an optional caption using an HTML comment immediately after the flow block:

````markdown
```flow
[A] --> [B] --> [C]
```
<!-- caption: Description of the diagram -->
````

### Flow Diagram Features

- **Simple syntax** - `[Label] --> [Label]` for horizontal flow
- **Auto-coloring** - Nodes automatically cycle through theme colors
- **Custom colors** - Override with `[Label:color]` syntax
- **Dynamic sizing** - Node width adjusts based on text length
- **Theme matching** - Uses CDL theme fonts and color palette
- **Inline SVG** - No external files or services needed

---

## Charts (Automated Styling)

The CDL theme includes an automated chart styling system. Include the Chart.js library and `chart-defaults.js`, and all charts will automatically use Dartmouth theme colors, fonts, and sizing.

### Setup (once per presentation)

Add these script tags to your first chart slide:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="chart-defaults.js"></script>
```

### Basic Chart (Auto-Styled)

Just provide your data - colors, fonts, grid styling, and sizing are automatic:

```html
<div class="chart-container">
  <canvas id="myChart"></canvas>
</div>

<script>
new Chart(document.getElementById('myChart'), {
  type: 'bar',
  data: {
    labels: ['GPT-2', 'GPT-3', 'LLaMA', 'Claude'],
    datasets: [{ data: [1.5, 175, 70, 52] }]  // Colors auto-applied!
  },
  options: {
    plugins: { legend: { display: false } }
  }
});
</script>
```

### Multi-Dataset Charts

Each dataset automatically gets a distinct theme color:

```html
<script>
new Chart(document.getElementById('lineChart'), {
  type: 'line',
  data: {
    labels: ['1', '2', '3', '4', '5'],
    datasets: [
      { label: 'Training', data: [2.8, 2.1, 1.6, 1.3, 1.1] },  // First color
      { label: 'Validation', data: [2.9, 2.3, 1.9, 1.6, 1.4] } // Second color
    ]
  }
});
</script>
```

### Quick Helper Functions

For even simpler syntax, use `CDLChart` helpers:

```javascript
// Bar chart - just labels and data
CDLChart.bar('canvasId', ['A', 'B', 'C'], [10, 20, 30]);

// Line chart with multiple series
CDLChart.line('canvasId', ['1', '2', '3'], [
  { label: 'Series 1', data: [1, 2, 3] },
  { label: 'Series 2', data: [3, 2, 1] }
]);

// Pie chart - each slice gets a theme color
CDLChart.pie('canvasId', ['Web', 'Books', 'Code'], [45, 30, 25]);

// Scatter plot
CDLChart.scatter('canvasId', [
  { label: 'Group A', data: [{x: 1, y: 2}, {x: 3, y: 4}] }
]);

// Doughnut chart
CDLChart.doughnut('canvasId', ['A', 'B', 'C'], [40, 35, 25]);

// Radar chart
CDLChart.radar('canvasId', ['Speed', 'Power', 'Range'], [
  { label: 'Model A', data: [80, 90, 70] }
]);
```

### Accessing Theme Colors

If you need to manually access theme colors:

```javascript
// Get all chart colors
CDLChart.colors  // Array of 12 theme colors

// Get specific color by index
CDLChart.getColor(0)  // First color (Dartmouth Green)
CDLChart.getColor(2)  // Third color (Bonfire Orange)

// Get color with transparency
CDLChart.getColorWithAlpha('#00693e', 0.5)

// Get N colors
CDLChart.getColors(5)  // Array of first 5 colors
```

### Theme Color Palette

The chart system uses Dartmouth tertiary colors for maximum distinction:

| Index | Color | Hex | Name |
|-------|-------|-----|------|
| 1 | Primary | `#00693e` | Dartmouth Green |
| 2 | Accent | `#267aba` | River Blue |
| 3 | Warm | `#ffa00f` | Bonfire Orange |
| 4 | Alert | `#9d162e` | Bonfire Red |
| 5 | Tertiary | `#8a6996` | Violet |
| 6 | Light | `#a5d75f` | Rich Spring Green |

### Overriding Defaults

You can still override any setting when needed:

```javascript
new Chart(document.getElementById('myChart'), {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      data: [10, 20, 30],
      backgroundColor: '#ff0000'  // Override auto-color
    }]
  },
  options: {
    scales: {
      y: { min: 0, max: 50 }  // Custom scale
    }
  }
});
```

See `notes/diagrams_and_charts_research.md` for detailed implementation guidance.

---

## Best Practices

### Content Guidelines

1. **One idea per slide** - Keep slides focused
2. **Use bullet points** - Maximum 5-6 points per slide
3. **Sentence case** - For all titles and labels
4. **Minimal text** - Let visuals and code speak

### Visual Guidelines

1. **Consistent sizing** - Use predefined size classes
2. **Whitespace** - Don't overcrowd slides
3. **Color purpose** - Use callout colors meaningfully
4. **Tables over lists** - For structured data comparisons

### Technical Guidelines

1. **Test compilation** - Run `./compile.sh` frequently
2. **Check auto-splitting** - Verify long content splits correctly
3. **Preview in browser** - Check rendering before presenting
4. **Commit often** - Backup your work frequently

### File Organization

```
presentation/
├── my_presentation.md    # Main presentation
├── themes/
│   └── cdl-theme.css     # Theme file
├── images/               # Custom images
├── compile.sh            # Compilation script
├── process_markdown.py   # Preprocessing script
└── autoscale.js          # Auto-scaling script
```

---

## Quick Reference

### Frontmatter

```yaml
---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Your Name
---
```

### Slide Separator

```markdown
---
```

### Common Classes

| Class | Purpose |
|-------|---------|
| `.note-box` | Informational callout (River Blue) |
| `.example-box` | Example callout (Dartmouth Green) |
| `.warning-box` | Warning callout (Bonfire Orange) |
| `.tip-box` | Tip callout (Rich Spring Green) |
| `.important-box` | Important callout (Bonfire Red) |
| `.definition-box` | Definition callout (Violet) |
| `.emoji` | Base emoji class |
| `.emoji-{size}` | Size: xs, sm, md, lg, xl, xxl |
| `.emoji-bg-{color}` | Background: green, blue, orange, teal, violet, red, navy, etc. |
| `.emoji-gray` | Grayscale (inactive) |
| `.emoji-faded` | Partially faded |
| `.emoji-figure` | Emoji container |
| `.emoji-row` | Horizontal emoji layout |
| `.emoji-col` | Vertical emoji layout |
| `.diagram-container` | Diagram wrapper |
| `.chart-container` | Chart.js wrapper |

### Flow Diagram Syntax

| Syntax | Description |
|--------|-------------|
| `` ```flow `` | Start flow diagram block |
| `[Label]` | Node with auto-color |
| `[Label:color]` | Node with custom color |
| `-->` | Arrow connecting nodes |
| `<!-- caption: text -->` | Optional caption below diagram |

### Chart Helper Functions

| Function | Purpose |
|----------|---------|
| `CDLChart.bar(id, labels, data)` | Simple bar chart |
| `CDLChart.line(id, labels, datasets)` | Line chart with multiple series |
| `CDLChart.pie(id, labels, data)` | Pie chart |
| `CDLChart.doughnut(id, labels, data)` | Doughnut chart |
| `CDLChart.scatter(id, datasets)` | Scatter plot |
| `CDLChart.radar(id, labels, datasets)` | Radar chart |
| `CDLChart.colors` | Array of theme colors |
| `CDLChart.getColor(index)` | Get specific theme color |
| `CDLChart.getColors(count)` | Get N theme colors |

---

## Dartmouth Color Reference

Complete Dartmouth tertiary color palette used throughout the theme:

| Color Name | CSS Variable | Hex Code |
|------------|--------------|----------|
| Dartmouth Green | `--dartmouth-green` | `#00693e` |
| Forest Green | `--forest-green` | `#12312b` |
| River Blue | `--river-blue` | `#267aba` |
| River Navy | `--river-navy` | `#003c73` |
| Spring Green | `--spring-green` | `#c4dd88` |
| Rich Spring Green | `--rich-spring-green` | `#a5d75f` |
| Summer Yellow | `--summer-yellow` | `#f5dc69` |
| Bonfire Orange | `--bonfire-orange` | `#ffa00f` |
| Bonfire Red | `--bonfire-red` | `#9d162e` |
| Tuck Orange | `--tuck-orange` | `#d94415` |
| Violet | `--violet` | `#8a6996` |
| Autumn Brown | `--autumn-brown` | `#643c20` |
| Granite Gray | `--granite-gray` | `#424141` |

---

## Diagram and Figure Color Guidelines

This section provides guidelines for consistent, meaningful color use across all diagrams and figures in presentations.

### Core Principles

1. **Semantic consistency** - Colors should mean the same thing throughout a presentation
2. **Minimal palette** - Use 3-5 colors maximum per diagram
3. **Accessibility** - Ensure sufficient contrast and avoid relying on color alone
4. **Purpose over decoration** - Every color should convey meaning, not just look pretty

---

### Semantic Color Assignments

Use these colors consistently based on their semantic meaning:

| Meaning | Color | Hex | Flow Syntax | Use Cases |
|---------|-------|-----|-------------|-----------|
| **Start/Origin/Input** | Dartmouth Green | `#00693e` | `:green` | Initial states, inputs, data sources |
| **Process/Action** | River Blue | `#267aba` | `:blue` | Processing steps, transformations, actions |
| **Success/Positive/Output** | Rich Spring Green | `#a5d75f` | `:teal` | Successful outcomes, outputs, completions |
| **Warning/Caution** | Bonfire Orange | `#ffa00f` | `:orange` | Warnings, attention needed, intermediate states |
| **Error/Stop/Critical** | Bonfire Red | `#9d162e` | `:red` | Errors, failures, critical alerts, endpoints |
| **Neutral/Context** | Granite Gray | `#424141` | `:gray` | Background info, optional steps, context |
| **Abstract/Conceptual** | Violet | `#8a6996` | `:violet` | Theoretical concepts, abstractions, models |

---

### Flow Diagram Color Patterns

#### Sequential Progressions

For timelines or step-by-step processes, use a consistent color progression:

**Learning/Growth progression:**
```flow
[Basic:green] --> [Intermediate:teal] --> [Advanced:blue] --> [Expert:violet]
```

**Pipeline/Process progression:**
```flow
[Input:green] --> [Process:blue] --> [Validate:orange] --> [Output:teal]
```

**Historical/Timeline progression:**
```flow
[Past:gray] --> [Present:green] --> [Future:blue]
```

#### Decision Flows

For diagrams with branching decisions:

```flow
[Decision:blue] --> [Success path:teal]
[Decision:blue] --> [Failure path:red]
```

Use:
- **Blue** for decision points
- **Teal/Green** for positive outcomes
- **Red** for negative outcomes or errors
- **Orange** for conditional/warning paths

---

### Comparison Diagrams

#### Humans vs AI/Machines

| Entity | Color | Rationale |
|--------|-------|-----------|
| Human | River Blue (`#267aba`) | Calm, trustworthy, organic |
| AI/Machine | Violet (`#8a6996`) | Abstract, technological |
| Collaboration | Dartmouth Green (`#00693e`) | Positive combination |

**Example:**
```flow
[Human input:blue] --> [AI processing:violet] --> [Combined output:green]
```

#### Before vs After

| State | Color |
|-------|-------|
| Before/Old | Gray or Orange |
| After/New | Green or Teal |

#### Pros vs Cons

| Type | Color |
|------|-------|
| Pros/Advantages | Teal or Green |
| Cons/Disadvantages | Orange or Red |

---

### Chart Color Guidelines

Charts automatically use theme colors via `chart-defaults.js`. For semantic consistency:

| Chart Type | Recommended Colors | Notes |
|------------|-------------------|-------|
| **Single metric** | Dartmouth Green | Primary brand color |
| **Two comparisons** | Green + Blue | High contrast pair |
| **Multiple categories** | Auto-cycle | Let system assign |
| **Good vs Bad** | Teal vs Red | Clear semantic meaning |
| **Trend lines** | Blue (primary), Orange (secondary) | Distinguishable in B&W |

---

### Color Quantity Guidelines

| Diagram Type | Recommended Colors | Maximum |
|--------------|-------------------|---------|
| Simple flow (3-4 nodes) | 2-3 | 3 |
| Complex flow (5+ nodes) | 3-4 | 5 |
| Comparison | 2 | 3 |
| Timeline | 3-4 (progression) | 5 |
| Pie/Doughnut chart | 4-5 | 6 |
| Bar/Line chart | 2-3 datasets | 4 |

**Rule of thumb:** If you need more than 5 colors, consider splitting into multiple diagrams.

---

### Good Examples

#### Course Roadmap (Timeline)
```flow
[ELIZA:green] --> [Tokenization:teal] --> [Embeddings:blue] --> [Attention:orange] --> [GPT:violet]
```
**Why it works:** Uses a consistent color progression from simple (green) to complex (violet), creating visual narrative of increasing sophistication.

#### Data Pipeline (Process)
```flow
[Raw data:gray] --> [Clean:green] --> [Transform:blue] --> [Model:violet] --> [Output:teal]
```
**Why it works:** Gray for raw/unprocessed, green for cleaned start, blue for processing, violet for model abstraction, teal for successful output.

#### Concept Spectrum (Continuum)
```flow
[Strong position:green] --> [Moderate:teal] --> [Evidence:blue] --> [Weak position:orange] --> [Opposite:violet]
```
**Why it works:** Shows progression across a conceptual spectrum with smooth color transitions.

---

### Anti-Patterns to Avoid

#### 1. Rainbow Diagrams
**Bad:**
```flow
[A:green] --> [B:red] --> [C:blue] --> [D:orange] --> [E:violet] --> [F:yellow]
```
**Problem:** Random colors with no semantic meaning. Visually chaotic.

**Fix:** Use consistent progression or group by meaning.

#### 2. Inconsistent Semantics
**Bad:** Using green for "error" on one slide and "success" on another.

**Fix:** Establish color meanings and stick to them throughout the presentation.

#### 3. Too Many Colors
**Bad:** 8+ colors in a single diagram.

**Problem:** Cognitive overload, impossible to track meaning.

**Fix:** Group related items, use the same color for similar concepts.

#### 4. Low Contrast Pairs
**Bad:** Teal (`#a5d75f`) next to Spring Green (`#c4dd88`).

**Problem:** Colors too similar to distinguish.

**Fix:** Choose colors from different parts of the palette (e.g., green + blue, not green + teal).

#### 5. Color as Only Differentiator
**Bad:** Relying solely on color to distinguish elements without labels or shapes.

**Problem:** Inaccessible to colorblind viewers.

**Fix:** Always use labels; consider shapes or patterns for additional differentiation.

#### 6. Decorative Colors
**Bad:** Adding colors just to make the diagram "prettier."

**Problem:** Undermines semantic meaning system.

**Fix:** If an element does not need semantic distinction, use gray or the default auto-color.

---

### Emoji Figure Color Consistency

When using emoji figures with backgrounds, follow the same semantic rules:

| Concept Type | Background Class | Example |
|--------------|-----------------|---------|
| Positive/Success | `emoji-bg-green` or `emoji-bg-teal` | Achievements, completions |
| Information/Neutral | `emoji-bg-blue` | Facts, data, communication |
| Warning/Attention | `emoji-bg-orange` | Cautions, considerations |
| Critical/Important | `emoji-bg-red` | Errors, urgent items |
| Abstract/Conceptual | `emoji-bg-violet` | Ideas, theories, models |
| Supporting/Context | `emoji-bg-gray` | Background info |

**Example - Capability domains:**
```html
<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-blue">&#x1F4AC;</span>
    <span class="label">Language</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F9E0;</span>
    <span class="label">Reasoning</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-orange">&#x1F465;</span>
    <span class="label">Social</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-violet">&#x1F4CA;</span>
    <span class="label">Math</span>
  </div>
</div>
```

---

### Quick Reference: Color Selection

**Ask yourself these questions:**

1. **Is this a starting point?** Use green.
2. **Is this an action or process?** Use blue.
3. **Is this a successful outcome?** Use teal.
4. **Does this need attention/caution?** Use orange.
5. **Is this an error or critical warning?** Use red.
6. **Is this abstract or conceptual?** Use violet.
7. **Is this context or optional?** Use gray.

**When in doubt:**
- Let the auto-color system handle it (for simple diagrams)
- Use green for first item, blue for middle steps, teal for final output
- Limit yourself to 3 colors and use labels

---

### Presentation-Wide Consistency Checklist

Before finalizing a presentation, verify:

- [ ] Green always means the same thing (start/positive)
- [ ] Red always means the same thing (error/critical/end)
- [ ] No diagram uses more than 5 colors
- [ ] Comparison diagrams use consistent color pairs
- [ ] Human vs AI comparisons use blue vs violet
- [ ] Timeline progressions flow from one color family to another
- [ ] All critical distinctions have labels, not just colors

---

*Last updated: December 2025*
*CDL Theme v1.2 - Added flow diagrams, expanded callout boxes, Dartmouth color palette*
