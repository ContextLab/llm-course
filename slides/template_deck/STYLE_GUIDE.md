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
14. [Best Practices](#best-practices)

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

### Callout Box Colors

| Type | Background | Border |
|------|------------|--------|
| Note | `rgba(70, 130, 180, 0.12)` | `#4682b4` |
| Example | `rgba(0, 105, 62, 0.10)` | `#00693e` |
| Warning | `rgba(218, 165, 32, 0.15)` | `#daa520` |

### Emoji Background Colors

| Class | Color | Hex |
|-------|-------|-----|
| `emoji-bg-green` | Dartmouth Green | `#00693e` |
| `emoji-bg-teal` | Teal | `#14b8a6` |
| `emoji-bg-orange` | Orange | `#f97316` |
| `emoji-bg-blue` | Blue | `#3b82f6` |
| `emoji-bg-gray` | Gray | `#9ca3af` |

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

For diagrams (Mermaid, GraphViz, PlantUML), use pre-rendered SVGs via Kroki.io:

```markdown
<div class="diagram-container">

![Flowchart](https://kroki.io/mermaid/svg/...)

</div>
```

### Chart.js (Interactive Charts)

```markdown
<div class="chart-container">
  <canvas id="myChart"></canvas>
</div>

<script>
new Chart(document.getElementById('myChart'), {
  type: 'bar',
  data: { /* ... */ }
});
</script>
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
| `.note-box` | Informational callout |
| `.example-box` | Example callout |
| `.warning-box` | Warning callout |
| `.emoji` | Base emoji class |
| `.emoji-{size}` | Size: xs, sm, md, lg, xl, xxl |
| `.emoji-bg-{color}` | Background: green, teal, orange, blue, gray |
| `.emoji-gray` | Grayscale (inactive) |
| `.emoji-faded` | Partially faded |
| `.emoji-figure` | Emoji container |
| `.emoji-row` | Horizontal emoji layout |
| `.emoji-col` | Vertical emoji layout |
| `.diagram-container` | Diagram wrapper |
| `.chart-container` | Chart.js wrapper |

---

*Last updated: December 2025*
*CDL Theme v1.0*
