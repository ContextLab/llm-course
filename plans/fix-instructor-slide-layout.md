# fix: Instructor slide layout and visual improvements

## Overview

Fix the instructor slide (slide 2) to improve visual hierarchy, icon sizing, and layout cohesion. This involves redesigning the layout to be more visually appealing while ensuring all required content is visible without cutoff.

## Problem Statement

The current instructor slide has several issues:
1. Icons/logos are too small and hard to see
2. Emoji icons clutter the lab website links
3. "Lab" label on blue info box is unnecessary
4. Room location takes up space without adding value
5. Boxes are not visually aligned/cohesive
6. Research question uses quote styling that doesn't fit
7. Need spiderweb icon for network dynamics (missing emoji)
8. Inconsistent notation (Neuroscience vs Neuro)
9. Logos separated from their context
10. Dartmouth logo needs white pixels replaced with Dartmouth green

## Proposed Solution

Redesign the instructor slide layout with these changes:

### Phase 1: Image Processing (Dartmouth Logo)
- Use Python/PIL to replace white pixels (#FFFFFF) with Dartmouth green (#00693e) in dartmouth_logo.png
- Save as dartmouth_logo_green.png

### Phase 2: Markdown Layout Changes (lecture1.md)
- Remove `data-title="Contextual Dynamics Lab"` from info-box (removes "Lab" label)
- Remove "Moore Hall 416" room location
- Remove emoji icons (globe, computer) from website links
- Place CDL logo inline next to context-lab.com link
- Place GitHub logo inline next to github.com link
- Change research question from `.core-question` div to plain text or different styling
- Update Key areas:
  - Use spiderweb emoji (&#x1F578;) for Brain network dynamics
  - Keep all 5 areas: Learning/memory, Education tech, Brain networks, Data science, NLP
- Update Training notation:
  - Change "Neuroscience" to "Neuro" for consistency (all use CS, Neuro pattern)
- Add university logos inline with training entries
- Increase logo sizes using `logo-row-lg` class

### Phase 3: CSS Updates (cdl-theme.css)
- Create new `.inline-logo-link` class for logo + link combinations
- Update `.logo-row` to support larger logos
- Create `.research-focus` class (non-quote styling for research question)
- Possibly add `.instructor-card` layout for better visual alignment

## Technical Approach

### Files to Modify

1. **`/Users/jmanning/llm-course/figures/dartmouth_logo.png`** - Process to create green version
2. **`/Users/jmanning/llm-course/slides/week1/lecture1.md`** - Update slide 2 markup
3. **`/Users/jmanning/llm-course/slides/week1/themes/cdl-theme.css`** - Add/update CSS classes

### Implementation Details

#### Image Processing Script
```python
from PIL import Image
import numpy as np

# Load dartmouth logo
img = Image.open('/Users/jmanning/llm-course/figures/dartmouth_logo.png')
data = np.array(img)

# Dartmouth green RGB
dartmouth_green = [0, 105, 62]

# Replace white pixels (allowing some tolerance for anti-aliasing)
white_threshold = 250
mask = (data[:,:,0] > white_threshold) & (data[:,:,1] > white_threshold) & (data[:,:,2] > white_threshold)
data[mask, 0:3] = dartmouth_green

# Save result
result = Image.fromarray(data)
result.save('/Users/jmanning/llm-course/figures/dartmouth_logo_green.png')
```

#### New CSS Classes
```css
/* Inline logo with link */
.inline-logo-link {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
}

.inline-logo-link img {
    height: 24px;
    width: auto;
    vertical-align: middle;
}

/* Research focus (non-quote styling) */
.research-focus {
    text-align: center;
    padding: 0.3em 0;
    margin: 0.2em auto;
    font-size: 0.95em;
    font-weight: 500;
}

/* Larger logo row variant */
.logo-row.logo-row-xl img {
    height: 64px !important;
    max-width: 150px !important;
}
```

#### Slide 2 Layout (Conceptual)
```
+------------------------------------------+
|         About the instructor             |
+------------------------------------------+
| [Left Column]        | [Right Column]    |
|                      |                   |
| Jeremy R. Manning    | Research focus    |
| Assoc Prof, PBS      | [research text]   |
| Dartmouth College    |                   |
|                      | [approach tags]   |
| [CDL] context-lab    |                   |
| [GH] github/Context  | Key areas         |
|                      | [5 emoji items]   |
| Training             |                   |
| [logos with entries] |                   |
+------------------------------------------+
```

## Acceptance Criteria

### Functional Requirements
- [ ] All 5 key areas visible: Learning/memory, Education tech, Brain networks, Data science, NLP
- [ ] Spiderweb emoji used for Brain network dynamics
- [ ] CDL logo appears next to context-lab.com link
- [ ] GitHub logo appears next to github.com/ContextLab link
- [ ] No emoji icons (globe, computer) in lab links
- [ ] No "Lab" label on info box
- [ ] No room location shown
- [ ] Consistent notation: "CS, Neuro" for all entries
- [ ] Research question NOT in quote style
- [ ] Approach tags visible: Theory, Models, Experiments, Neuroimaging
- [ ] Training timeline with university logos visible
- [ ] Dartmouth logo white pixels replaced with Dartmouth green

### Visual Requirements
- [ ] Logos are clearly visible (larger than current 32-40px)
- [ ] Visual alignment between left and right columns
- [ ] No content cutoff at bottom of slide
- [ ] Professional, cohesive appearance

### Quality Gates
- [ ] Compile lecture1.md successfully
- [ ] Take screenshot of slide 2 and verify all content visible
- [ ] No CSS errors in browser console
- [ ] Commit changes with descriptive message

## Success Metrics

1. All required content visible on single slide without scrolling
2. Logos recognizable at presentation distance (min 48-64px height)
3. Visual hierarchy clear (name > title > details)
4. Consistent styling throughout

## Dependencies & Prerequisites

- Python with PIL/Pillow for image processing
- Marp CLI for compilation
- Existing figures: cdl_logo.png, github_logo.png (renamed from .jpg), dartmouth_logo.png, brandeis_logo.svg, upenn_logo.png, princeton_logo.svg

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Logo sizes too large, causing overflow | High | Test incrementally, use responsive sizing |
| Dartmouth logo processing affects transparency | Medium | Preserve alpha channel during processing |
| Layout breaks on different screen sizes | Low | Marp uses fixed 1280x720, test at that resolution |

## References

### Internal References
- Current slide: `/Users/jmanning/llm-course/slides/week1/lecture1.md:18-98`
- Theme CSS instructor section: `/Users/jmanning/llm-course/slides/week1/themes/cdl-theme.css:2132-2358`
- Available figures: `/Users/jmanning/llm-course/figures/`

### Available Emojis
- Spiderweb: &#x1F578; (for network dynamics)
- Brain: &#x1F9E0; (for learning/memory)
- Books: &#x1F4DA; (for education tech)
- Chart: &#x1F4CA; (for data science)
- Speech bubble: &#x1F4AC; (for NLP)
