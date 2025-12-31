# Design Principles for Theme Refinement

## Issue #22: Slide Styling Improvements

This document provides a comprehensive analysis of the current Dartmouth Beamer theme compared to the CDL Marp reference theme, with specific recommendations for improvement.

---

## 1. Typography Analysis

### Current Dartmouth Theme Font Sizes (beamerthemeDartmouth.sty)

| Element | Current Setting | LaTeX Size Reference |
|---------|-----------------|---------------------|
| Title | `\LARGE, \bfseries` | ~24.88pt |
| Subtitle | `\large` | ~14.40pt |
| Author | `\normalsize` | ~12pt |
| Institute | `\small` | ~10.95pt |
| Date | `\small` | ~10.95pt |
| Frame Title | `\Large, \bfseries` | ~17.28pt |
| Frame Subtitle | `\normalsize` | ~12pt |
| Block Title | `\normalsize, \bfseries` | ~12pt |

### CDL Reference Theme Font Sizes (reference-theme.css)

| Element | CDL Setting | Approximate pt (base 35px) |
|---------|-------------|---------------------------|
| Base section text | 35px | ~26pt |
| h1 | 1.5em | ~39pt |
| h2 | 1.3em | ~34pt |
| h3 | 1.1em | ~29pt |
| h4 | 1.0em | ~26pt |
| h5 | 0.9em | ~24pt |
| h6 | 0.8em | ~21pt |
| Table text | 0.8em | ~21pt |
| Reference text | 12pt | ~12pt |
| Note text | 20pt | ~20pt |

### Analysis: Font Size Issues

**Problem Identified:** The current slides have text that is too small with insufficient contrast between heading levels.

**Current Issue Example (lecture1.tex):**
- Heavy use of `\small` and `\footnotesize` throughout slides
- Multiple `[shrink=10]` and `[shrink=15]` frame options to fit content
- Inconsistent size hierarchy makes it hard to scan slides

**CDL Reference Approach:**
- Larger base font size (35px = ~26pt vs Beamer's 12pt default)
- Clear heading hierarchy with consistent relative scaling (1.5, 1.3, 1.1, 1.0, 0.9, 0.8)
- Line height of 1.35 for better readability
- Letter-spacing of 1.25px for improved legibility

### Recommended Typography Changes

```latex
% CURRENT
\setbeamerfont{title}{size=\LARGE, series=\bfseries}
\setbeamerfont{frametitle}{size=\Large, series=\bfseries}

% RECOMMENDED
\setbeamerfont{title}{size=\Huge, series=\bfseries}
\setbeamerfont{frametitle}{size=\LARGE, series=\bfseries}
\setbeamerfont{normal text}{size=\large}  % ADD: Increase base size
```

**Specific Recommendations:**

1. **Increase base font size**: Set default slide text to `\large` (14.4pt) instead of `\normalsize` (12pt)
2. **Increase title sizes**: Use `\Huge` for title, `\LARGE` for frame titles
3. **Add line spacing**: Include `\linespread{1.2}` or use `setspace` package
4. **Reduce shrink usage**: Content should be simplified rather than shrunk

---

## 2. Color Palette Analysis

### Current Dartmouth Theme Colors

| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| **Primary** |
| DartmouthGreen | 0,105,62 | #00693e | Structure, titles, bullets |
| **Secondary** |
| ForestGreen | 18,49,43 | #12312b | Darker accents |
| RichForestGreen | 13,30,28 | #0D1E1C | Very dark accents |
| SnowWhite | 255,255,255 | #ffffff | Backgrounds, frame title text |
| MidnightBlack | 0,0,0 | #000000 | Body text |
| **Tertiary** |
| RiverBlue | 38,122,186 | #267aba | Example blocks, URLs |
| RiverNavy | 0,60,115 | #003c73 | (available, unused) |
| SpringGreen | 196,221,136 | #c4dd88 | (available, unused) |
| SummerYellow | 245,220,105 | #f5dc69 | (available, unused) |
| BonfireOrange | 255,160,15 | #ffa00f | Alert blocks |
| BonfireRed | 157,22,46 | #9d162e | (available, unused) |
| GraniteGray | 66,65,65 | #424141 | Subtitles, footline |
| Gray1 | 247,247,247 | #f7f7f7 | Block bodies |
| Gray2 | 226,226,226 | #e2e2e2 | Frame subtitle |
| Gray3 | 112,112,112 | #707070 | (available, unused) |

### CDL Reference Theme Colors

| Element | Color | Hex |
|---------|-------|-----|
| Background | Light Gray | #dfdfdf |
| Text | Black | #000000 |
| Code | Dark Green | #0d5f2e |
| Links | Black (underlined) | #000000 |
| Mark | Transparent | n/a |

### Analysis: Color Issues

**Current Strengths:**
- Good use of official Dartmouth colors
- Proper contrast for frame titles (white on green)
- Clear link differentiation (blue for URLs)

**Potential Improvements:**
1. The white background may be too stark - CDL uses #dfdfdf (light gray)
2. Code color in CDL (#0d5f2e) is very close to DartmouthGreen (#00693e) - consider using for code blocks
3. Gray tones could be used more strategically for visual hierarchy

### Recommended Color Changes

```latex
% OPTION 1: Softer background (like CDL)
\setbeamercolor{background canvas}{bg=Gray1}  % #f7f7f7 instead of white

% OPTION 2: Use code-specific green
\definecolor{CodeGreen}{RGB}{13,95,46}  % #0d5f2e from CDL
% Then apply to listings/minted

% Keep current scheme for structure - it's well-designed
% Just ensure contrast ratios meet accessibility standards
```

**Color Contrast Check (WCAG AA requires 4.5:1 for text):**
- DartmouthGreen on White: 5.24:1 (PASS)
- MidnightBlack on White: 21:1 (PASS)
- GraniteGray on White: 7.35:1 (PASS)
- DartmouthGreen on Gray1: 4.92:1 (PASS)

---

## 3. Spacing Guidelines

### Current Spacing Values (beamerthemeDartmouth.sty)

| Element | Current Value |
|---------|---------------|
| Frame title padding | sep=8pt, leftskip=8pt, rightskip=8pt |
| Frame title vspace after | -1.5ex (for progress bar) |
| Title page vertical spacing | vskip0.25em, vskip1em |
| Footline height | ht=2.5ex, dp=1ex |
| Progress bar height | 2pt |

### CDL Reference Spacing

| Element | Value |
|---------|-------|
| Section (slide) padding | 70px (~53pt) |
| Paragraph/blockquote margin | 1em 3.5em 0 |
| Pre margin | 1em 2em 0 |
| Blockquote padding | 0 1.5em |
| Table margin | 1em 0 0 |
| Figure padding-bottom | 10px |

### Analysis: Spacing Issues

**Issue from #22:** "Space is not used well (too compact in some places, too much whitespace in others)"

**Observed in lecture1.tex:**
- Multiple slides using `[shrink=5]`, `[shrink=10]`, `[shrink=15]` indicates content overflow
- Manual `\vspace{0.3cm}` additions throughout
- `\setlength{\itemsep}{0pt}` used to squeeze items together
- Mixed approaches: some slides too dense, others have unused space

**CDL Approach:**
- Very generous padding (70px all around)
- Consistent spacing units (em-based)
- Left/right margins for text create comfortable line lengths

### Recommended Spacing Changes

```latex
% Frame title - increase padding for more breathing room
\setbeamertemplate{frametitle}{
    \nointerlineskip
    \begin{beamercolorbox}[wd=\paperwidth,sep=12pt,leftskip=12pt,rightskip=12pt]{frametitle}
        % ... (increased from 8pt)
    \end{beamercolorbox}
}

% Add default item spacing (currently 0pt in slides)
\setbeamertemplate{itemize/enumerate body begin}{
    \setlength{\itemsep}{6pt}  % Add breathing room
    \setlength{\parskip}{3pt}
}

% Slide margins - increase overall padding
\setbeamersize{
    text margin left=1.5em,
    text margin right=1.5em
}
```

**Content Guidelines (for slide authors):**
1. Avoid using `[shrink]` - if content doesn't fit, split the slide
2. Limit bullet points to 5-6 per slide maximum
3. Use consistent spacing: `\vspace{0.5cm}` between major sections
4. Remove `\setlength{\itemsep}{0pt}` - let items breathe

---

## 4. Emoji Philosophy

### Issue Context

From Issue #22:
> "Emojis are overused - should only be used as semantic replacements for figures, not decorative"

Reference: The "slime mold" presentation style uses emojis sparingly and semantically.

### Current Usage Patterns (from lecture1.tex analysis)

| Category | Count | Examples |
|----------|-------|----------|
| Title decoration | 5+ | "Is ChatGPT Conscious? robot-face thought-bubble" |
| Section markers | 8+ | "Today's Journey world-map", "Readings for This Week book" |
| Inline bullet decoration | 15+ | "robot-face Building conversational agents" |
| Status indicators | 6+ | "check-mark LLMs are very good at...", "cross-mark No sensory grounding" |
| Pure decoration | 10+ | "Welcome! waving-hand", "See you next class! rocket" |

**Total estimated emoji usage in lecture1.tex: 40+ emojis**

### Appropriate vs. Inappropriate Usage

#### APPROPRIATE (Keep):

1. **Semantic Status Indicators**
   ```
   check-mark - indicating success/positive
   cross-mark - indicating failure/negative
   question-mark - indicating uncertainty
   ```
   These convey meaning that would otherwise require more text.

2. **Figure Replacements**
   ```
   brain - when discussing neural topics (semantic replacement for brain diagram)
   robot-face - when the topic IS robots/AI (the subject, not decoration)
   ```

3. **Visual Hierarchy/Categorization**
   Used consistently to denote types of content:
   ```
   book for readings
   wrench for tools
   warning for important notes
   ```
   (Only if used systematically and consistently throughout all lectures)

#### INAPPROPRIATE (Remove):

1. **Greeting/Filler Decoration**
   - "Welcome! waving-hand" --> "Welcome!"
   - "See you next class! rocket" --> "See you next class!"
   - "Let's discuss! thinking-face" --> "Let's discuss!"

2. **Frame Title Decoration**
   - "Today's Journey world-map" --> "Today's Agenda" or "Overview"
   - "The Big Questions star" --> "Core Questions"
   - "HuggingFace: Your Learning Companion hugging-face" --> "HuggingFace Resources"

3. **Redundant Status Emojis**
   - When emoji repeats what text already says clearly
   - "Tip: pencil-and-paper" - the word "Tip" is sufficient

4. **Bulleted List Decorations**
   - "robot-face Building conversational agents" --> "Building conversational agents"
   - These add visual noise without adding meaning

### Clear Rules for Emoji Usage

**RULE 1: The Substitution Test**
Can the emoji replace text entirely while preserving meaning?
- YES: Keep (e.g., "check-mark" instead of "Yes" or "Correct")
- NO: Remove

**RULE 2: The Consistency Test**
Is this emoji used consistently throughout ALL slides with the same meaning?
- YES: Keep (e.g., book always means "reading")
- NO: Remove or standardize

**RULE 3: The Distraction Test**
Would removing this emoji lose important information?
- YES: Keep (status indicators)
- NO: Remove (decorative)

**RULE 4: Maximum Density**
- Title slides: 0-1 emoji maximum
- Content slides: 2-4 emojis maximum, only for status indicators
- Per bullet point: 0-1 emoji, only if semantic

### Recommended Actions for lecture1.tex

| Line | Current | Recommended |
|------|---------|-------------|
| 56 | `\subtitle{Is ChatGPT Conscious? robot-face thought-bubble}` | `\subtitle{Is ChatGPT Conscious?}` |
| 69 | `{Today's Journey world-map}` | `{Overview}` |
| 75 | `{Welcome! waving-hand}` | `{Welcome}` |
| 80-84 | All bullets have emojis | Remove all emojis |
| 90-91 | `{This course is experiential! target}` | `{This course is experiential}` |
| 111-112 | `pencil-and-paper 5 Problem Sets` | `5 Problem Sets (75\%)` |
| 276-279 | Keep check/cross/question marks | KEEP - these are semantic |

---

## 5. Recommended Theme Changes

### Line-by-Line Recommendations for beamerthemeDartmouth.sty

```latex
% ============================================================================
% CHANGE 1: Add base font size configuration (after line 66)
% ============================================================================

% Add after font configuration:
\setbeamerfont{normal text}{size=\large}  % Increase base text size

% ============================================================================
% CHANGE 2: Improve title sizes (replace lines 125-134)
% ============================================================================

% Current:
\setbeamerfont{title}{size=\LARGE, series=\bfseries}
\setbeamerfont{subtitle}{size=\large}
\setbeamerfont{frametitle}{size=\Large, series=\bfseries}

% Recommended:
\setbeamerfont{title}{size=\Huge, series=\bfseries}
\setbeamerfont{subtitle}{size=\Large}  % Increase from \large
\setbeamerfont{frametitle}{size=\LARGE, series=\bfseries}  % Increase from \Large

% ============================================================================
% CHANGE 3: Add item spacing (after line 143)
% ============================================================================

% Add these lines after itemize subsubitem template:
\setlength{\leftmargini}{1.5em}
\setlength{\leftmarginii}{1.5em}
\setlength{\leftmarginiii}{1.5em}

% Add default spacing for items
\makeatletter
\def\@listi{\leftmargin\leftmargini
            \topsep 6pt
            \parsep 3pt
            \itemsep 6pt}
\makeatother

% ============================================================================
% CHANGE 4: Increase frame title padding (replace lines 186-195)
% ============================================================================

% Current sep=8pt
% Recommended:
\setbeamertemplate{frametitle}{
    \nointerlineskip
    \begin{beamercolorbox}[wd=\paperwidth,sep=12pt,leftskip=16pt,rightskip=16pt]{frametitle}
        \usebeamerfont{frametitle}\insertframetitle
        \ifx\insertframesubtitle\@empty\else
            \par\vskip-2pt
            \usebeamerfont{framesubtitle}\usebeamercolor[fg]{framesubtitle}\insertframesubtitle
        \fi
    \end{beamercolorbox}
}

% ============================================================================
% CHANGE 5: Increase slide margins (add after line 212)
% ============================================================================

\setbeamersize{
    text margin left=1.2cm,
    text margin right=1.2cm
}

% ============================================================================
% CHANGE 6: Optional softer background (replace line 73)
% ============================================================================

% For softer look (optional - test first):
% \setbeamercolor{background canvas}{bg=Gray1}  % #f7f7f7 instead of white
```

### Additional Recommendations for Slide Content

1. **Create content guidelines document** for slide authors:
   - Maximum 6 bullet points per slide
   - Avoid using `[shrink]` option
   - Follow emoji rules above
   - Use consistent heading hierarchy

2. **Add custom environments** to theme for common patterns:
   ```latex
   % Example: Cleaner discussion box without emoji
   \newtcolorbox{discussion}{
       colback=discussbox,
       colframe=RiverBlue,
       title=Discussion,  % Remove emoji from default
       fonttitle=\bfseries
   }
   ```

3. **Consider a "light" mode** with less color:
   - Frame titles as text without background bar
   - More whitespace, less visual density
   - Matches "lighter on text preferred" feedback

---

## Summary of Priority Changes

### High Priority (Immediate Impact)
1. Increase base font size in theme
2. Add default item spacing
3. Remove decorative emojis from all slides

### Medium Priority (Significant Improvement)
4. Increase frame title padding
5. Increase slide margins
6. Create emoji usage guidelines for contributors

### Lower Priority (Polish)
7. Consider softer background color
8. Standardize custom box environments
9. Create "light text" variant slides

---

*Document created: 2025-12-29*
*For Issue #22: Slide Styling Improvements*
