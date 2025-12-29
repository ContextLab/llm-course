---
marp: true
theme: cdl-theme
math: katex
author: Contextual Dynamics Lab
---

<script>
// Auto-splitting code blocks with line numbers
document.addEventListener('DOMContentLoaded', function() {
  var MIN_FONT_SIZE = 14; // Minimum font size before splitting
  var CODE_FONT_SIZE = 18; // Target font size for code

  // Get all slides container
  var slidesContainer = document.querySelector('.marpit > svg') || document.body;
  var allSections = Array.from(document.querySelectorAll('section'));

  // Process each code block
  allSections.forEach(function(section, sectionIndex) {
    var pre = section.querySelector('pre');
    if (!pre) return;

    var code = pre.querySelector('code');
    if (!code) return;

    // Get the title
    var title = section.querySelector('h1');
    var titleText = title ? title.textContent : '';

    // Get all lines with their HTML (preserving syntax highlighting)
    var html = code.innerHTML;
    var lines = html.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    // Calculate available space
    var sectionStyle = window.getComputedStyle(section);
    var sectionHeight = section.clientHeight || 720;
    var sectionPadding = parseFloat(sectionStyle.paddingTop) + parseFloat(sectionStyle.paddingBottom);
    var titleHeight = title ? title.offsetHeight + 40 : 60;
    var availableHeight = sectionHeight - sectionPadding - titleHeight - 60; // Buffer for continued text

    // Set font size and measure line height
    pre.style.fontSize = CODE_FONT_SIZE + 'px';
    var lineHeight = CODE_FONT_SIZE * 1.4; // Approximate line height
    var linesPerSlide = Math.floor(availableHeight / lineHeight);

    if (linesPerSlide < 1) linesPerSlide = 1;

    // If all lines fit, just add line numbers
    if (lines.length <= linesPerSlide) {
      addLineNumbers(code, lines, 1);
      return;
    }

    // Need to split across multiple slides
    var chunks = [];
    for (var i = 0; i < lines.length; i += linesPerSlide) {
      chunks.push(lines.slice(i, i + linesPerSlide));
    }

    // Update first slide with first chunk
    addLineNumbers(code, chunks[0], 1);

    // Add "continued..." indicator to first slide
    if (chunks.length > 1) {
      var contIndicator = document.createElement('div');
      contIndicator.className = 'code-continued-indicator';
      contIndicator.textContent = 'continued...';
      section.appendChild(contIndicator);
    }

    // Create additional slides for remaining chunks
    var currentLineNum = chunks[0].length + 1;
    for (var c = 1; c < chunks.length; c++) {
      var newSection = section.cloneNode(false);
      newSection.innerHTML = '';

      // Copy section classes but add continuation marker
      newSection.className = section.className;

      // Add title
      if (title) {
        var newTitle = document.createElement('h1');
        newTitle.textContent = titleText;
        newSection.appendChild(newTitle);
      }

      // Create new pre/code with this chunk
      var newPre = document.createElement('pre');
      newPre.style.fontSize = CODE_FONT_SIZE + 'px';
      var newCode = document.createElement('code');
      newCode.className = code.className;

      addLineNumbers(newCode, chunks[c], currentLineNum);
      currentLineNum += chunks[c].length;

      newPre.appendChild(newCode);
      newSection.appendChild(newPre);

      // Add continued indicator if not last chunk
      if (c < chunks.length - 1) {
        var contInd = document.createElement('div');
        contInd.className = 'code-continued-indicator';
        contInd.textContent = 'continued...';
        newSection.appendChild(contInd);
      }

      // Insert new section after current one in DOM
      // Find the SVG/foreignObject structure for Marp
      var parentSvg = section.closest('svg');
      if (parentSvg) {
        var foreignObj = section.closest('foreignObject');
        if (foreignObj) {
          var newSvg = parentSvg.cloneNode(false);
          var newForeign = foreignObj.cloneNode(false);
          newForeign.appendChild(newSection);
          newSvg.appendChild(newForeign);
          parentSvg.parentNode.insertBefore(newSvg, parentSvg.nextSibling);
          parentSvg = newSvg; // For next iteration
        }
      } else {
        section.parentNode.insertBefore(newSection, section.nextSibling);
        section = newSection; // For next iteration
      }
    }
  });

  function addLineNumbers(code, lines, startLine) {
    var result = lines.map(function(lineHtml, i) {
      var lineNum = startLine + i;
      return '<span class="line"><span class="line-num">' + lineNum + '</span><span class="line-code">' + lineHtml + '</span></span>';
    }).join('');

    var temp = document.createElement('div');
    temp.innerHTML = result;
    code.innerHTML = '';
    while (temp.firstChild) {
      code.appendChild(temp.firstChild);
    }
    code.classList.add('has-line-numbers');
  }
});
</script>

# Theme showcase
### PSYC 51.07: Models of language and conversation

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Simple bullet points

- First main point
- Second main point
- Third main point

---

# Text emphasis

- Use **bold** for strong emphasis
- Use *italics* for subtle emphasis
- Use `code` for inline code

---

# Code example

```python
def hello():
    """Simple function example."""
    print("Hello, Dartmouth!")
    return True
```

---

# Long code (auto-split demo)

```python
class MultiHeadAttention(nn.Module):
    """Multi-head attention mechanism for transformers."""

    def __init__(self, d_model, num_heads, dropout=0.1):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)

        # Linear projections
        Q = self.W_q(query)
        K = self.W_k(key)
        V = self.W_v(value)

        # Reshape for multi-head attention
        Q = Q.view(batch_size, -1, self.num_heads, self.d_k)
        K = K.view(batch_size, -1, self.num_heads, self.d_k)
        V = V.view(batch_size, -1, self.num_heads, self.d_k)

        # Compute attention scores
        scores = torch.matmul(Q, K.transpose(-2, -1))
        scores = scores / math.sqrt(self.d_k)

        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)

        attention = F.softmax(scores, dim=-1)
        attention = self.dropout(attention)

        # Apply attention to values
        output = torch.matmul(attention, V)
        output = output.view(batch_size, -1, self.d_model)

        return self.W_o(output)
```

---

# Equation

The attention mechanism:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

---

# Simple table

| Model | Year | Params |
|-------|------|--------|
| GPT-2 | 2019 | 1.5B |
| GPT-3 | 2020 | 175B |
| GPT-4 | 2023 | Unknown |

---

# Two column layout

<div style="display: flex; gap: 2em;">
<div>

**Left column**
- Point A
- Point B

</div>
<div>

**Right column**
- Point X
- Point Y

</div>
</div>

---

# Quote

> This line is a quote that demonstrates the blockquote styling from the CDL theme.

&mdash; Anonymous

---

# Contact

Thank you!

jeremy@dartmouth.edu
