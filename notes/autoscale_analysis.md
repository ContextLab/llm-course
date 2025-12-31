# Autoscale.js Architecture Analysis

## Problem Statement

The HTML and PDF versions of slides are out of sync because `autoscale.js` modifies content at runtime (browser), but PDFs are generated at compile-time (by Marp) before JavaScript runs.

## Current Architecture

### Build Pipeline (compile.sh)
1. `process_markdown.py` - Pre-processes markdown (flow diagrams, table/code splitting)
2. Marp generates HTML and PDF from processed markdown
3. `chart-defaults.js` injected into HTML `<head>`
4. `autoscale.js` injected into HTML `<body>`

### What autoscale.js Does at Runtime

Observed modifications on Slide 8 ("The hard problem"):

1. **H1 Title**:
   - `font-size: 1.3416em` (scaled down from default)
   - `margin-top: 0px`
   - `margin-bottom: 12.285px`

2. **Flex Container (two-column layout)**:
   - `--content-scale: 0.78` (CSS custom property)
   - `gap: 15.6px` (scaled down)
   - `margin-top: 16.2435px`
   - `margin-bottom: 0px`

3. **Note Box**:
   - `font-size: 17.745px` (scaled down from ~22.75px)
   - `margin-top: 5.3235px`
   - `margin-bottom: 0px`
   - `padding: 8.8725px 14.196px 10.647px` (scaled padding)

### The Algorithm (from autoscale.js)

```
LAYOUT CASCADE:
1. Reset all scaling to defaults
2. Measure actual content height
3. If content fits, do nothing
4. Otherwise:
   a. First shrink gaps (from 30px down to 20px minimum)
   b. Then shrink scale (all fonts proportionally, min 0.5)
5. Apply proportional layout preserving font ratios
```

Font ratios preserved:
- Title: 1.72x body
- Body: 1.0x (35px base)
- Code: 0.63x
- Table: 0.7x
- Callout: 0.65x

## Impact Analysis

### Slides Affected
- **Slide 8**: Two-column layout with note-box - needs scaling
- **Slide 9**: Chinese room with flow diagram - looks OK
- **Slide 13**: Language-thought spectrum - looks OK (flow diagram only)

### Root Cause
Content that exceeds slide height triggers scaling in HTML but not in PDF.

## Solution Design

### Option A: Remove autoscale.js entirely
**Pros**: PDF/HTML always match
**Cons**: Content may overflow, requires manual slide design

### Option B: CSS-only responsive sizing
**Pros**: Works at compile-time
**Cons**: CSS can't measure actual content height

### Option C: Pre-calculate scaling in process_markdown.py
**Pros**: Compile-time, consistent PDF/HTML
**Cons**: Complex to implement, needs content measurement

### Option D: Hybrid - CSS defaults + minimal JS fine-tuning
**Pros**: Most content handled by CSS, JS only for edge cases
**Cons**: Still some PDF/HTML differences for edge cases

## Recommended Solution: Option B + Manual Override Classes

1. **CSS-based default sizing** that works for most content
2. **Manual override classes** for slides that need special treatment
3. **Remove or minimize autoscale.js** runtime modifications

### Implementation Plan

1. Add CSS classes for common scaling scenarios:
   - `.compact-content` - 80% font scaling
   - `.dense-content` - 70% font scaling
   - `.compact-gaps` - reduced margins/gaps

2. Modify CSS to use viewport-relative units where appropriate

3. Update autoscale.js to only apply minimal fixes for truly dynamic content (like tables with unknown row counts)

4. Document in STYLE_GUIDE.md how to use manual scaling classes

## Files to Modify

1. `/Users/jmanning/llm-course/slides/week1/themes/cdl-theme.css` - Add scaling classes
2. `/Users/jmanning/llm-course/slides/template_deck/autoscale.js` - Minimize or remove
3. `/Users/jmanning/llm-course/slides/week1/lecture1.md` - Add classes to problematic slides
