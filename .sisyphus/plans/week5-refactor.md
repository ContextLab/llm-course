# Week 5 Slides Refactor + Animated Transformer Demo

## TL;DR

> **Quick Summary**: Refactor all Week 5 lecture slides (15-17) to match Weeks 1-4 styling conventions, fix LaTeX conversion artifacts, and create a new purpose-built animated transformer demo with step-by-step canvas visualizations for educational use.
> 
> **Deliverables**:
> - Refactored `slides/week5/lecture15.md` (Attention Mechanisms)
> - Refactored `slides/week5/lecture16.md` (Transformer Architecture)
> - Refactored `slides/week5/lecture17.md` (Training Transformers)
> - New demo: `demos/16-animated-transformer/` with step-by-step canvas animations
> - Updated `demos/index.html` with new demo card
> 
> **Estimated Effort**: Large (multi-day)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Demo creation → Lecture 15 integration → Lecture 16/17 parallel

---

## Context

### Original Request
Refactor week 5 slides (lectures 15-17) to match weeks 1-4 theming/styling. For lecture 15 specifically, follow the approach of https://prvnsmpth.github.io/animated-transformer/ to break down the transformer step-by-step with similar animations.

### Interview Summary
**Key Discussions**:
- Animation strategy: User chose **Option C** (new embedded canvas animations, purpose-built for slides/demo context)
- Test strategy: **Manual verification only** (visual checks + compile verification)
- Scope: All 3 Week 5 lectures + new animated demo

**Research Findings**:
- Reference site uses Manim pre-rendered videos (not directly applicable to Marp)
- Existing `/demos/transformer/` uses Three.js/Anime.js but is marked "Work in Progress"
- Weeks 1-4 patterns: `note-box` with `data-title`, `scale-XX` classes, sentence case, `emoji-figure` closings
- Week 5 has LaTeX artifacts: broken `\textbf`, `\item`, corrupted table specs

### Self-Conducted Gap Analysis
**Potential Gaps Identified**:
1. New demo number: Should be `16-animated-transformer` (after existing 15-embeddings-comparison)
2. Animation scope: 12 steps from reference vs. simpler subset for educational clarity
3. Integration method: How slides reference the demo (embed vs. link)
4. Mobile responsiveness: Canvas animations need responsive handling

**Guardrails Applied**:
- DO NOT modify existing `/demos/transformer/` (marked WIP, different purpose)
- DO NOT create Manim video pipeline
- DO NOT add test files (manual verification confirmed)
- Use existing shared CSS/JS utilities from `/demos/shared/`

---

## Work Objectives

### Core Objective
Bring Week 5 lecture slides into visual and structural consistency with Weeks 1-4, and provide an interactive animated demonstration of transformer architecture for Lecture 15.

### Concrete Deliverables
1. `slides/week5/lecture15.md` - Refactored with proper boxes, scaling, sentence case, closing slide
2. `slides/week5/lecture16.md` - Refactored, LaTeX artifacts removed, dense slides split
3. `slides/week5/lecture17.md` - Refactored, corrupted table fixed, dense slides split
4. `demos/16-animated-transformer/index.html` - New demo entry point
5. `demos/16-animated-transformer/js/transformer-animation.js` - Step-by-step canvas engine
6. `demos/16-animated-transformer/css/animation-styles.css` - Demo-specific styling
7. `demos/16-animated-transformer/README.md` - Documentation
8. `demos/index.html` - Updated with Demo 16 card

### Definition of Done
- [ ] All 3 Week 5 lectures compile without errors: `../template_deck/compile.sh lectureN.md`
- [ ] No `\textbf`, `\item`, `\end{center**` artifacts remain in any file
- [ ] All slide titles use sentence case
- [ ] All callouts use `*-box` classes with `data-title` attribute
- [ ] All 3 lectures have standard closing slide (emoji-figure + tip-box)
- [ ] Demo 16 loads and animates through all steps in browser
- [ ] Demo 16 card appears on demos index page
- [ ] Visual inspection confirms styling matches Weeks 1-4

### Must Have
- Proper box class syntax (`<div class="note-box" data-title="...">`)
- Scale classes on dense slides (`<!-- _class: scale-80 -->`)
- Sentence case for all slide headers
- Standard closing slide pattern
- Canvas-based step-by-step transformer animation
- Theme toggle support in new demo

### Must NOT Have (Guardrails)
- Video embedding (Marp limitation)
- Manim Python dependencies
- Modifications to existing `/demos/transformer/` demo
- Modifications to Weeks 1-4 slides
- New test files (manual verification only)
- ONNX runtime or live model inference
- Over-engineering: Keep animation simple and educational, not production ML

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (npm test, custom TestRunner)
- **User wants tests**: NO (Manual verification only)
- **Framework**: N/A

### Manual Verification Procedures

Each TODO includes EXECUTABLE verification procedures:

**For Slide Changes:**
```bash
# Compile and check for errors
cd slides/week5
../template_deck/compile.sh lecture15.md
../template_deck/compile.sh lecture16.md
../template_deck/compile.sh lecture17.md

# Open in browser and visually inspect
open lecture15.html
open lecture16.html
open lecture17.html
```

**For Demo Changes:**
```bash
# Start local server
cd demos
python -m http.server 8000

# Open in browser
open http://localhost:8000/16-animated-transformer/
open http://localhost:8000/  # Check index card
```

**Verification Checklist:**
- [ ] No compilation errors
- [ ] Box styling matches Weeks 1-4 visually
- [ ] Dense slides are readable (not overflow)
- [ ] Closing slides have emoji-figure pattern
- [ ] Demo animations step through correctly
- [ ] Theme toggle works in demo
- [ ] Demo card appears on index

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Create demo scaffolding (16-animated-transformer)
├── Task 2: Refactor lecture16.md (largest, most artifacts)
└── Task 3: Refactor lecture17.md (dense slides, table fix)

Wave 2 (After Wave 1):
├── Task 4: Build animation engine (depends: Task 1)
├── Task 5: Refactor lecture15.md (depends: demo progress for integration)
└── Task 6: Create animation step content (depends: Task 4)

Wave 3 (After Wave 2):
├── Task 7: Integrate demo with Lecture 15 slides (depends: Tasks 4, 5, 6)
├── Task 8: Add demo to index.html (depends: Task 4)
└── Task 9: Final visual verification (depends: all)

Critical Path: Task 1 → Task 4 → Task 6 → Task 7 → Task 9
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 8 | 2, 3 |
| 2 | None | 9 | 1, 3 |
| 3 | None | 9 | 1, 2 |
| 4 | 1 | 6, 7 | 5 |
| 5 | None | 7 | 4 |
| 6 | 4 | 7 | 5 |
| 7 | 4, 5, 6 | 9 | 8 |
| 8 | 4 | 9 | 7 |
| 9 | 2, 3, 7, 8 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 2, 3 | 3 parallel agents (artistry for demo, quick for slides) |
| 2 | 4, 5, 6 | 2-3 parallel agents |
| 3 | 7, 8, 9 | Sequential integration + final check |

---

## TODOs

### Wave 1: Foundation (Parallel)

- [ ] 1. Create demo scaffolding for `16-animated-transformer`

  **What to do**:
  - Create directory `demos/16-animated-transformer/`
  - Create `index.html` with standard demo structure (nav, hero header, container)
  - Create `css/animation-styles.css` with base styling
  - Create `js/transformer-animation.js` with class stub
  - Create `README.md` with overview
  - Import shared CSS/JS from `../shared/`
  - Add theme toggle functionality (copy pattern from other demos)

  **Must NOT do**:
  - Don't implement animation logic yet (Task 4)
  - Don't copy from existing `/demos/transformer/` (different approach)

  **Recommended Agent Profile**:
  - **Category**: `artistry`
    - Reason: Creating new demo UI with proper styling and structure
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Demo structure and CSS styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 8
  - **Blocked By**: None

  **References**:
  - `demos/14-bert-mlm/index.html` - Standard demo HTML structure pattern
  - `demos/shared/css/demo-styles.css` - Shared CSS to import
  - `demos/shared/js/visualization-utils.js` - ThemeManager to use
  - `demos/attention/index.html` - Canvas-based demo pattern

  **Acceptance Criteria**:
  ```bash
  # Verify files exist
  ls demos/16-animated-transformer/
  # Expected: index.html, css/, js/, README.md
  
  # Start server and open
  cd demos && python -m http.server 8000 &
  open http://localhost:8000/16-animated-transformer/
  # Expected: Page loads without JS errors, theme toggle works
  ```

  **Commit**: YES
  - Message: `feat(demos): scaffold animated transformer demo (16)`
  - Files: `demos/16-animated-transformer/*`
  - Pre-commit: Manual browser check

---

- [ ] 2. Refactor `lecture16.md` (Transformer Architecture)

  **What to do**:
  - Remove LaTeX artifacts: `\textbf{`, `\end{center**` (lines 127-130 and others)
  - Remove all `\item` remnants in References section
  - Replace `<div class="callout ...">` with `<div class="note-box" data-title="...">` etc.
  - Convert all Title Case headers to sentence case
  - Add `<!-- _class: scale-80 -->` to "Computational Complexity" slide (lines 531-561)
  - Split dense slides if needed (target: max 6-8 items per slide)
  - Add standard closing slide with `emoji-figure` and `tip-box`
  - Verify flow diagrams render correctly

  **Must NOT do**:
  - Don't change the educational content meaning
  - Don't add animations (that's the demo's job)
  - Don't use Title Case for any headers

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Text editing with clear patterns, no complex logic
  - **Skills**: None needed
    - Pure markdown editing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `slides/week5/lecture16.md` - Source file to refactor
  - `slides/week1/lecture3.md:380-404` - Standard closing slide pattern
  - `slides/template_deck/STYLE_GUIDE.md:315-398` - Box class syntax
  - `slides/week2/lecture5.md:1-50` - Example of proper box usage with data-title

  **Acceptance Criteria**:
  ```bash
  # Compile
  cd slides/week5 && ../template_deck/compile.sh lecture16.md
  # Expected: No errors
  
  # Check for LaTeX artifacts (should return nothing)
  grep -E '\\textbf|\\item|\\end\{center' lecture16.md
  # Expected: No matches
  
  # Check for old callout syntax (should return nothing)
  grep 'class="callout' lecture16.md
  # Expected: No matches
  
  # Visual check
  open lecture16.html
  # Expected: Boxes have proper styling, no overflow, closing slide present
  ```

  **Commit**: YES
  - Message: `refactor(slides): update lecture16 to match weeks 1-4 styling`
  - Files: `slides/week5/lecture16.md`
  - Pre-commit: Compile check

---

- [ ] 3. Refactor `lecture17.md` (Training Transformers)

  **What to do**:
  - Fix corrupted table specification at line ~437 (`| p{4cm}p{4cm}}`)
  - Remove LaTeX artifacts: `\textbf{`, `\end{center**` (lines 460-463)
  - Remove all `\item` remnants in References section (line ~718)
  - Replace old callout syntax with proper box classes
  - Convert all Title Case headers to sentence case
  - Split "Practical Tips" slide (lines 537-589) into 2 slides
  - Split "Computational Efficiency Tips" slide (lines 594-623) into 2 slides
  - Add `<!-- _class: scale-80 -->` to remaining dense slides
  - Add standard closing slide

  **Must NOT do**:
  - Don't change code examples (they're educational content)
  - Don't split code blocks across slides (keep atomic)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Text editing with clear patterns
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `slides/week5/lecture17.md` - Source file to refactor
  - `slides/week1/lecture3.md:380-404` - Closing slide pattern
  - `slides/template_deck/STYLE_GUIDE.md:200-226` - Table best practices
  - `slides/template_deck/STYLE_GUIDE.md:315-398` - Box classes

  **Acceptance Criteria**:
  ```bash
  # Compile
  cd slides/week5 && ../template_deck/compile.sh lecture17.md
  # Expected: No errors
  
  # Check for LaTeX artifacts
  grep -E '\\textbf|\\item|\\end\{center|p\{4cm\}' lecture17.md
  # Expected: No matches
  
  # Count slides (should increase by 2-4 due to splits)
  grep -c '^---$' lecture17.md
  # Expected: ~27 (was 23 + splits)
  
  # Visual check
  open lecture17.html
  ```

  **Commit**: YES
  - Message: `refactor(slides): update lecture17 to match weeks 1-4 styling`
  - Files: `slides/week5/lecture17.md`
  - Pre-commit: Compile check

---

### Wave 2: Animation Engine + Lecture 15 (Parallel)

- [ ] 4. Build transformer animation engine

  **What to do**:
  - Implement `TransformerAnimator` class in `js/transformer-animation.js`
  - Create step-based animation system with Next/Prev/Play controls
  - Implement canvas rendering for each of the 12 steps:
    1. Tokenization (text → token boxes)
    2. Token IDs (boxes → numbers)
    3. Embedding lookup (numbers → vectors)
    4. Position encoding (add position vectors)
    5. Combined embeddings (sum visualization)
    6. Q/K/V projection (matrix multiplication animation)
    7. Attention scores (Q·K^T matrix)
    8. Softmax (probability distribution)
    9. Attention output (weighted V sum)
    10. Multi-head (parallel heads visualization)
    11. Feed-forward (MLP animation)
    12. Stacking + output (full architecture)
  - Use color scheme from STYLE_GUIDE.md (Dartmouth palette)
  - Add descriptive text panel that updates with each step
  - Make responsive (handle window resize)

  **Must NOT do**:
  - Don't use Three.js (keep it 2D canvas for simplicity)
  - Don't implement actual model inference
  - Don't make it overly complex - educational clarity over accuracy

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Canvas rendering, animation timing, complex visualization logic
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Animation design and user interaction

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Task 1

  **References**:
  - `demos/attention/js/attention-visualizer.js` - Canvas-based visualization patterns
  - `demos/shared/js/visualization-utils.js` - AnimationUtils, CanvasUtils, ColorUtils
  - `demos/transformer/js/component-explorer.js:11-280` - Educational content structure for each component
  - prvnsmpth.github.io/animated-transformer - Step breakdown reference
  - `slides/template_deck/STYLE_GUIDE.md:159-198` - Dartmouth color palette

  **Acceptance Criteria**:
  ```bash
  # Start server
  cd demos && python -m http.server 8000 &
  
  # Open demo
  open http://localhost:8000/16-animated-transformer/
  
  # Manual checks:
  # - Click "Next" button → animation advances to step 2
  # - Click through all 12 steps → no JS errors in console
  # - Click "Prev" → goes back one step
  # - Click "Play" → auto-advances through steps
  # - Resize window → canvas redraws appropriately
  # - Theme toggle → colors update
  ```

  **Commit**: YES
  - Message: `feat(demos): implement transformer step-by-step animation engine`
  - Files: `demos/16-animated-transformer/js/transformer-animation.js`, `demos/16-animated-transformer/css/animation-styles.css`
  - Pre-commit: Browser test

---

- [ ] 5. Refactor `lecture15.md` (Attention Mechanisms)

  **What to do**:
  - Replace old callout syntax with proper box classes
  - Convert all Title Case headers to sentence case
  - Add `<!-- _class: scale-XX -->` to dense slides (identified: lines 337-371 "Real-World Impact")
  - Add standard closing slide with emoji-figure and tip-box
  - Add slide near end that links to the new animated transformer demo
  - Ensure flow diagrams render correctly

  **Must NOT do**:
  - Don't embed the animation directly (link to demo instead)
  - Don't duplicate content from demo

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Text editing, similar to Tasks 2 and 3
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 7
  - **Blocked By**: None (can start with placeholder link)

  **References**:
  - `slides/week5/lecture15.md` - Source file
  - `slides/week1/lecture3.md:294-306` - Demo link slide pattern ("It's demo time!")
  - `slides/week1/lecture3.md:380-404` - Closing slide pattern

  **Acceptance Criteria**:
  ```bash
  # Compile
  cd slides/week5 && ../template_deck/compile.sh lecture15.md
  # Expected: No errors
  
  # Check for old callout syntax
  grep 'class="callout' lecture15.md
  # Expected: No matches
  
  # Check for demo link
  grep -i 'animated-transformer' lecture15.md
  # Expected: At least one match (demo link slide)
  
  # Visual check
  open lecture15.html
  ```

  **Commit**: YES
  - Message: `refactor(slides): update lecture15 to match weeks 1-4 styling`
  - Files: `slides/week5/lecture15.md`
  - Pre-commit: Compile check

---

- [ ] 6. Create animation step content

  **What to do**:
  - Write educational descriptions for each of the 12 animation steps
  - Create data structures for each step's visual elements (what to draw)
  - Add mathematical formulas in LaTeX/KaTeX format where appropriate
  - Include "Key Insight" callouts for important concepts
  - Add analogies (e.g., Q/K/V as "search engine" metaphor)
  - Store in `js/step-content.js` as exportable module

  **Must NOT do**:
  - Don't make descriptions too long (max 2-3 sentences per step)
  - Don't include full implementation details (link to docs instead)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Educational content creation
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (after Task 4 provides structure)
  - **Blocks**: Task 7
  - **Blocked By**: Task 4 (needs animation structure)

  **References**:
  - prvnsmpth.github.io/animated-transformer - Step descriptions to adapt
  - `demos/transformer/js/component-explorer.js:16-280` - Existing beginner/intermediate/advanced descriptions
  - Jay Alammar's "The Illustrated Transformer" - Educational analogies

  **Acceptance Criteria**:
  ```bash
  # Verify file exists and exports content
  cat demos/16-animated-transformer/js/step-content.js
  # Expected: Exports STEP_CONTENT array with 12 objects
  
  # Each step should have: title, description, formula (optional), keyInsight
  grep -c '"title"' demos/16-animated-transformer/js/step-content.js
  # Expected: 12
  ```

  **Commit**: YES (group with Task 4)
  - Message: `feat(demos): add educational content for animation steps`
  - Files: `demos/16-animated-transformer/js/step-content.js`
  - Pre-commit: None

---

### Wave 3: Integration and Verification (Sequential)

- [ ] 7. Integrate demo with Lecture 15 slides

  **What to do**:
  - Update the demo link slide in lecture15.md with correct URL
  - Ensure the link works with both local server and GitHub Pages
  - Add a "Try the interactive demo" tip-box near attention mechanism content
  - Verify the demo URL pattern matches project conventions

  **Must NOT do**:
  - Don't embed the demo directly in slides
  - Don't duplicate demo content in slides

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple text updates
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 4, 5, 6

  **References**:
  - `slides/week5/lecture15.md` - Target file
  - `slides/week1/lecture3.md:294-306` - Demo link pattern

  **Acceptance Criteria**:
  ```bash
  # Compile
  cd slides/week5 && ../template_deck/compile.sh lecture15.md
  
  # Check demo links
  grep 'demos/16-animated-transformer' lecture15.md
  # Expected: Valid relative or absolute link
  
  # Visual check: demo link is clickable and styled as tip-box
  open lecture15.html
  ```

  **Commit**: YES (group with Task 5 if not already committed)
  - Message: `feat(slides): integrate animated transformer demo into lecture15`
  - Files: `slides/week5/lecture15.md`
  - Pre-commit: Compile check

---

- [ ] 8. Add demo to `demos/index.html`

  **What to do**:
  - Add Demo 16 card to the demos index page
  - Use proper card structure (number, title, description, tags, status, link)
  - Set status to "Available" (not WIP like demo 06)
  - Add appropriate tags: "Transformer", "Attention", "Animation", "Educational"
  - Place in correct numerical order (after Demo 15)

  **Must NOT do**:
  - Don't change existing demo cards
  - Don't mark as "Work in Progress" (it will be complete)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple HTML addition
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:
  - `demos/index.html` - Target file
  - `demos/index.html` (existing Demo 15 card) - Pattern to follow

  **Acceptance Criteria**:
  ```bash
  # Check card exists
  grep '16-animated-transformer' demos/index.html
  # Expected: Link to demo
  
  # Check card has required elements
  grep -A 20 'Demo 16' demos/index.html
  # Expected: title, description, tags, status, link
  
  # Visual check
  cd demos && python -m http.server 8000 &
  open http://localhost:8000/
  # Expected: Demo 16 card visible, clickable, leads to working demo
  ```

  **Commit**: YES
  - Message: `feat(demos): add animated transformer demo to index`
  - Files: `demos/index.html`
  - Pre-commit: Visual check

---

- [ ] 9. Final visual verification and cleanup

  **What to do**:
  - Compile all 3 Week 5 lectures and verify no errors
  - Open each in browser and verify visual consistency with Weeks 1-4
  - Verify all closing slides have emoji-figure + tip-box pattern
  - Verify demo loads and all 12 steps animate correctly
  - Verify theme toggle works in demo
  - Verify demo card appears on index
  - Check for any remaining LaTeX artifacts with grep
  - Check for any remaining old callout syntax

  **Must NOT do**:
  - Don't make content changes at this stage (only fix bugs)
  - Don't push to remote without all checks passing

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification checklist execution
  - **Skills**: [`playwright`] (optional for automated screenshots)
    - `playwright`: Could automate visual checks if desired

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (completion)
  - **Blocked By**: Tasks 2, 3, 7, 8

  **References**:
  - All Week 5 lecture files
  - `demos/16-animated-transformer/`
  - `demos/index.html`

  **Acceptance Criteria**:
  ```bash
  # Compile all slides
  cd slides/week5
  ../template_deck/compile.sh lecture15.md && \
  ../template_deck/compile.sh lecture16.md && \
  ../template_deck/compile.sh lecture17.md
  # Expected: All compile without errors
  
  # Check for LaTeX artifacts in all files
  grep -rE '\\textbf|\\item|\\end\{center' slides/week5/*.md
  # Expected: No matches
  
  # Check for old callout syntax
  grep -r 'class="callout' slides/week5/*.md
  # Expected: No matches
  
  # Demo verification
  cd demos && python -m http.server 8000 &
  open http://localhost:8000/16-animated-transformer/
  # Manual: All 12 steps work, theme toggle works
  
  open http://localhost:8000/
  # Manual: Demo 16 card present and links work
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(demos): scaffold animated transformer demo (16)` | `demos/16-animated-transformer/*` | Browser load |
| 2 | `refactor(slides): update lecture16 to match weeks 1-4 styling` | `slides/week5/lecture16.md` | Compile |
| 3 | `refactor(slides): update lecture17 to match weeks 1-4 styling` | `slides/week5/lecture17.md` | Compile |
| 4+6 | `feat(demos): implement transformer step-by-step animation engine` | `demos/16-animated-transformer/js/*` | Browser test |
| 5+7 | `refactor(slides): update lecture15 with demo integration` | `slides/week5/lecture15.md` | Compile |
| 8 | `feat(demos): add animated transformer demo to index` | `demos/index.html` | Browser check |

---

## Success Criteria

### Verification Commands
```bash
# All slides compile
cd slides/week5
../template_deck/compile.sh lecture15.md  # Expected: success
../template_deck/compile.sh lecture16.md  # Expected: success
../template_deck/compile.sh lecture17.md  # Expected: success

# No LaTeX artifacts
grep -rE '\\textbf|\\item|\\end\{center' *.md  # Expected: no matches

# No old callout syntax
grep -r 'class="callout' *.md  # Expected: no matches

# Demo works
cd ../../demos
python -m http.server 8000 &
curl -s http://localhost:8000/16-animated-transformer/ | grep -q 'TransformerAnimator'
# Expected: match found (class is present)
```

### Final Checklist
- [ ] All "Must Have" present (box classes, scale classes, sentence case, closings, demo)
- [ ] All "Must NOT Have" absent (no LaTeX artifacts, no Title Case, no old callout syntax)
- [ ] All slides compile without errors
- [ ] Demo animates through all 12 steps
- [ ] Theme toggle works
- [ ] Demo card on index page
- [ ] Visual consistency with Weeks 1-4 confirmed
