# Slide Conversion Principles

This document captures lessons learned from reviewing converted lecture slides. Use these principles to avoid common issues during Beamer-to-Marp conversion.

---

## Table of Contents

1. [General Principles](#general-principles)
2. [Common Anti-Patterns](#common-anti-patterns)
3. [Pre-Conversion Checklist](#pre-conversion-checklist)
4. [Post-Conversion Checks](#post-conversion-checks)
5. [Examples: Good vs Bad Practices](#examples-good-vs-bad-practices)

---

## General Principles

### 1. Layout and Space Management

**Rule: Content must fit within the visible slide area without scrolling or cut-off.**

- Every element must be fully visible when the slide is displayed
- Leave adequate margins (especially at the bottom where content is most often cut off)
- Balance content across the slide area; avoid clustering everything to one side or top
- Use whitespace intentionally to create visual hierarchy, not as wasted space

**Rule: One clear focal point per slide.**

- If a slide has multiple competing elements (diagram, callout box, bullet list), one should be primary
- Secondary elements should support, not compete with, the main content

### 2. Callout Boxes (Tip, Note, Warning, etc.)

**Rule: Callout boxes must be fully visible and appropriately sized.**

- Test that the entire box, including bottom border, renders within the slide
- Text inside callout boxes should be slightly smaller (0.85em) than body text
- Limit callout box content to 2-3 lines of text when possible
- If content is longer, consider whether it belongs in a callout at all

**Rule: Use callout boxes sparingly and purposefully.**

- Maximum one callout box per slide (unless comparing concepts)
- Callout boxes are for supplementary information, not primary content
- If the callout contains the main point, it should be in the body instead

### 3. Captions and Labels

**Rule: Captions must appear BELOW their associated figure/diagram, with adequate spacing.**

- Never position captions above or overlapping with figures
- Use consistent spacing (25-40px) between figure and caption
- Caption text should be smaller and styled differently from body text (italics or muted color)

**Rule: All labels in diagrams must be clearly readable.**

- Ensure sufficient contrast between label text and background
- Avoid overlapping labels with diagram elements

### 4. Text Content and Redundancy

**Rule: Eliminate redundant text ruthlessly.**

- Never repeat the slide title in the body content
- Remove "Think about:" or "Key findings:" lead-in phrases - integrate into the title or content
- If content can be understood without a phrase, remove the phrase
- Titles should be informative enough that introductory phrases are unnecessary

**Rule: Streamline titles to convey maximum information.**

- Bad: "Topic Overview" with subtitle "Key considerations for X"
- Good: "Key considerations for X" (combine into single clear title)
- Avoid double-title situations where both H1 and H2 compete

### 5. Visual Consistency

**Rule: Use consistent styling within and across slides.**

- If using emoji figures, maintain consistent sizing (don't mix emoji-lg and emoji-xxl arbitrarily)
- Column headers in comparison layouts should align at the same height
- If boxes have titles, all boxes in the same context should have titles (or none should)
- Colors should convey consistent meaning across the deck

**Rule: Emoji backgrounds must complement the emoji, not clash.**

- Choose background colors that contrast well with the emoji's dominant colors
- Prefer muted backgrounds (green, blue, teal) over bright ones (yellow, orange) for most uses

### 6. Diagrams vs Text

**Rule: Prefer diagrams when showing processes, relationships, or flows.**

- If describing a sequential process, use a flow diagram
- If showing relationships between concepts, use a visual representation
- If comparing items, use a table or side-by-side layout
- Reserve prose for context and explanation, not structure

**Rule: Diagrams require explanatory context.**

- A diagram alone is rarely self-explanatory
- Include 1-2 lines of text explaining what the viewer should learn from the diagram
- Ensure diagram labels are descriptive, not just abbreviations

### 7. Links and References

**Rule: All links must be clickable and properly formatted.**

- Paper titles in reading lists should link to the paper (DOI, arXiv, etc.)
- Email addresses should use `mailto:` links
- Booking/scheduling links should be direct hyperlinks
- Format: `[Display Text](URL)` - never show raw URLs

**Rule: Cross-references must be accurate.**

- If referring to "Lecture 3," verify what Lecture 3 actually covers
- Duration references ("X-hour lecture") must be factually correct
- Update all forward/backward references when content changes

### 8. Balancing Quantity with Clarity

**Rule: More slides with less content each is better than fewer crowded slides.**

- If a slide feels cluttered, split it into multiple slides
- Each slide should be readable in 30 seconds or less
- Complex topics should span multiple focused slides, not one dense slide

**Rule: Content ordering matters.**

- Lead with the most important information
- Build concepts progressively
- Provide context before details

---

## Common Anti-Patterns

### Layout Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Tip box cut-off** | Bottom of callout extends beyond slide boundary | Reduce content or use smaller text in box |
| **Unbalanced layout** | Content clustered on one side with empty space elsewhere | Redistribute content; use two-column layouts |
| **Caption overlap** | Caption text overlaps with figure | Position caption below figure with 25-40px gap |
| **Cluttered slide** | Too many competing elements | Split into multiple slides; establish hierarchy |
| **Inconsistent heights** | Column titles or boxes at different vertical positions | Use CSS flexbox alignment or consistent sizing |

### Content Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Redundant title text** | Slide body repeats what the title already says | Remove redundant phrases; let title carry meaning |
| **Unnecessary lead-ins** | "Think about:" or "Key findings:" phrases add no value | Integrate into title or remove entirely |
| **Double titles** | Both H1 and H2 contain title-like content | Combine into single informative H1 |
| **Too much text** | Wall of text that won't be read | Bullet points, split slides, or use visuals |
| **Missing context** | Diagram without explanation | Add 1-2 lines explaining what to learn |

### Styling Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Inconsistent sizing** | Text or emoji sizes vary arbitrarily | Apply consistent size classes throughout |
| **Clashing colors** | Background colors conflict with emoji or text | Choose complementary, muted backgrounds |
| **Mixed styling** | Some items styled, others not | Apply styling consistently or not at all |
| **Text too large in boxes** | Callout box text same size as body | Use 0.85em or smaller text in callouts |
| **Text too small** | Tiny text that won't be visible from audience | Minimum 0.8em for any visible text |

### Reference Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Non-clickable links** | Papers or resources shown as plain text | Make all references proper markdown links |
| **Factual errors** | Wrong lecture numbers or durations | Verify all cross-references before finalizing |
| **Raw URLs** | Showing full URLs instead of descriptive text | Use `[description](url)` format |
| **Missing mailto** | Email addresses not clickable | Use `[email@example.com](mailto:email@example.com)` |

---

## Pre-Conversion Checklist

Before starting conversion, verify:

- [ ] Read the STYLE_GUIDE.md completely
- [ ] Review theme_showcase.md for formatting examples
- [ ] Understand the lecture structure and main topics
- [ ] Identify TikZ diagrams needing conversion to flow diagrams
- [ ] Note any tables that may need special handling
- [ ] List all external references (papers, links) that need proper formatting

---

## Post-Conversion Checks

After converting each slide, verify:

### Layout Checks
- [ ] All content visible (no cut-off at bottom/sides)
- [ ] Balanced use of space (no large empty areas)
- [ ] Single clear focal point
- [ ] Consistent margins and spacing

### Callout Box Checks
- [ ] Box fully visible (including bottom border)
- [ ] Text sized appropriately (smaller than body text)
- [ ] Only one callout per slide (unless intentionally comparing)
- [ ] Content belongs in a callout (supplementary, not primary)

### Caption Checks
- [ ] Captions below (never above) figures
- [ ] No overlap between caption and figure
- [ ] Consistent spacing (25-40px gap)
- [ ] Caption styled differently from body text

### Content Checks
- [ ] No redundant text (title not repeated in body)
- [ ] No unnecessary lead-in phrases
- [ ] No double-title situations
- [ ] Readable in 30 seconds or less
- [ ] Logical content ordering

### Visual Consistency Checks
- [ ] Consistent emoji sizing throughout
- [ ] Consistent column/box heights
- [ ] Colors convey consistent meaning
- [ ] Emoji backgrounds complement (don't clash with) emojis

### Diagram Checks
- [ ] Diagrams include explanatory text
- [ ] All labels readable and non-overlapping
- [ ] Flow diagrams used for processes (not prose)
- [ ] Appropriate complexity (not too busy)

### Reference Checks
- [ ] All paper references are clickable links
- [ ] Email addresses use mailto: links
- [ ] Booking links are direct hyperlinks
- [ ] Cross-references (lecture numbers, durations) are accurate
- [ ] No raw URLs visible

### Final Checks
- [ ] View each slide at presentation size (not just in editor)
- [ ] Read through as if presenting (does content flow logically?)
- [ ] Verify roadmap/overview slides accurately reflect lecture structure

---

## Examples: Good vs Bad Practices

### Example 1: Callout Boxes

**Bad:**
```markdown
# Understanding Attention

Here's what you need to know about attention mechanisms.

<div class="tip-box">

The attention mechanism was introduced in the groundbreaking 2014 paper by Bahdanau et al. It revolutionized sequence-to-sequence modeling by allowing models to dynamically focus on different parts of the input. This approach solved the bottleneck problem in encoder-decoder architectures where all information had to pass through a fixed-length vector. The key insight was that different output tokens should attend to different input tokens based on relevance.

</div>
```
Issues: Box content too long; will likely be cut off; content is primary not supplementary.

**Good:**
```markdown
# Attention mechanism

Introduced by Bahdanau et al. (2014) to solve the encoder bottleneck problem:
- Models dynamically focus on relevant input parts
- Different output tokens attend to different inputs
- Eliminated fixed-length vector constraint

<div class="tip-box">

Key insight: Relevance should be learned, not predetermined.

</div>
```

### Example 2: Captions

**Bad:**
```markdown
<!-- caption: Model architecture showing the flow from input to output -->
```flow
[Input] --> [Encoder] --> [Attention] --> [Decoder] --> [Output]
```
```
Issue: Caption above diagram (wrong position).

**Good:**
```markdown
```flow
[Input] --> [Encoder] --> [Attention] --> [Decoder] --> [Output]
```
<!-- caption: Model architecture showing the flow from input to output -->
```

### Example 3: Redundant Text

**Bad:**
```markdown
# Key Findings from the Study

Think about the key findings from this study:
- Finding 1
- Finding 2
```
Issues: "Key findings" repeated; "Think about" adds nothing.

**Good:**
```markdown
# Study findings

- Finding 1
- Finding 2
```

### Example 4: Diagram Clarity

**Bad:**
```markdown
# Model Overview

<div class="emoji-figure">
  <span class="emoji emoji-lg emoji-bg emoji-bg-yellow">🎯</span>
  <span class="emoji">➡️</span>
  <span class="emoji emoji-md emoji-bg emoji-bg-orange">🔄</span>
  <span class="emoji">➡️</span>
  <span class="emoji emoji-xl emoji-bg emoji-bg-green">✅</span>
</div>
```
Issues: No labels; inconsistent sizing; no context; unclear meaning.

**Good:**
```markdown
# Model training pipeline

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-lg emoji-bg emoji-bg-blue">📊</span>
    <span class="label">Training data</span>
  </div>
  <span class="emoji emoji-md">➡️</span>
  <div class="emoji-col">
    <span class="emoji emoji-lg emoji-bg emoji-bg-green">🔧</span>
    <span class="label">Fine-tuning</span>
  </div>
  <span class="emoji emoji-md">➡️</span>
  <div class="emoji-col">
    <span class="emoji emoji-lg emoji-bg emoji-bg-teal">🚀</span>
    <span class="label">Deployment</span>
  </div>
</div>

The model iterates through training data before deployment.
```

### Example 5: Links and References

**Bad:**
```markdown
# Further Reading

Required reading:
- "Attention Is All You Need" - Vaswani et al., 2017
- See the paper at https://arxiv.org/abs/1706.03762
```
Issues: Non-clickable title; raw URL shown.

**Good:**
```markdown
# Further reading

Required:
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) - Vaswani et al., 2017
```

### Example 6: Layout Balance

**Bad:**
```markdown
# Comparing Approaches

Traditional:
- Item 1
- Item 2
- Item 3

Modern:
- Item A
- Item B
- Item C
```
Issue: Vertical layout wastes horizontal space.

**Good:**
```markdown
# Comparing approaches

<div style="display: flex; gap: 2em;">
<div>

**Traditional**
- Item 1
- Item 2
- Item 3

</div>
<div>

**Modern**
- Item A
- Item B
- Item C

</div>
</div>
```

---

## Summary: The Five Most Important Rules

1. **Everything must fit**: No cut-off content. Test at presentation size.

2. **Eliminate redundancy**: If you said it in the title, don't repeat it in the body.

3. **Captions go below**: Always position captions below figures with clear spacing.

4. **Callouts are supplementary**: They highlight, not carry, the main content.

5. **Links must work**: Every reference should be clickable.

---

*This document should be reviewed and updated after each batch of lecture conversions to capture new lessons learned.*
