# Convert Beamer Lecture to Marp

Convert a Beamer LaTeX lecture to Marp markdown format using the CDL theme.

## Arguments

$ARGUMENTS should be the lecture number (e.g., "1" for lecture1.tex) or a path to a specific .tex file.

## Process

Follow these steps in order:

### 1. Setup and Review

1. **Read the style guide** at `slides/template_deck/STYLE_GUIDE.md` to understand all available features, classes, and conventions
2. **Read the template presentation** at `slides/template_deck/theme_showcase.md` to see examples of proper formatting - pay close attention to:
   - Exact frontmatter format (including `transition: fade 0.25s`)
   - How emojis are used as figures (not decoration)
   - Callout box styling
   - Two-column layouts
3. **Identify the lecture file** - find the .tex file based on $ARGUMENTS:
   - If a number, search for `lecture$ARGUMENTS.tex` across week directories
   - If a path, use directly
4. **Clean up any temporary files** from previous builds in the lecture's directory:
   - `.aux`, `.log`, `.nav`, `.out`, `.snm`, `.toc`, `.vrb`, `.fdb_latexmk`, `.fls`, `.synctex.gz`
   - Any existing `.html` or `.pdf` files for this lecture

### 2. Content Analysis

1. **Read the Beamer .tex file** completely
2. **Create a conversion plan** considering:
   - Main topics and structure
   - TikZ diagrams that need manual conversion
   - Tables and their complexity
   - Code blocks and their languages
   - Custom Beamer environments (thinkaboutit, discussion, etc.)
   - Opportunities to simplify/minimize text
   - Where emoji figures can illustrate concepts (as figures only, never for tone or decoration)

### 3. Create the Marp Markdown

Create a new `.md` file in the same directory as the .tex file. Follow these rules:

**Exact Frontmatter (copy exactly):**
```yaml
---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---
```

**Title Slide:**
- Use `# Title` and `### Subtitle` format
- Include instructor name, institution, term on separate lines
- Example:
```markdown
# Lecture 1: Introduction
### PSYC 51.07: Models of language and conversation

Jeremy R. Manning
Dartmouth College
Winter 2026
```

**Content Slides:**
- One main idea per slide
- Maximum 5-6 bullet points
- Use **sentence case** for all titles and labels (only capitalize first word and proper nouns)
- Minimize text - let visuals speak
- Use proper Marp slide separators (`---`)

**Emoji Guidelines (IMPORTANT):**
- Emojis are ONLY for figures/illustrations, NEVER for tone or decoration
- Never add emojis at the end of titles or bullet points
- Use the emoji figure classes when an emoji represents a concept:
  ```html
  <span class="emoji emoji-lg emoji-bg emoji-bg-green">🧠</span>
  ```
- For flow diagrams showing processes, use emoji-figure layouts
- Maximum 1-2 emoji figures per slide, only where they genuinely illustrate something

**Conversions:**
| Beamer | Marp |
|--------|------|
| `\begin{frame}{Title}` | `---\n\n# Title` |
| `\begin{block}{Title}` | `<div class="note-box">` |
| `\begin{alertblock}` | `<div class="warning-box">` |
| `\begin{exampleblock}` | `<div class="example-box">` |
| `\begin{thinkaboutit}` | `<div class="tip-box">` |
| `\begin{discussion}` | `<div class="note-box">` |
| `\begin{columns}` | `<div style="display: flex; gap: 2em;">` |
| `\textbf{}` | `**text**` |
| `\textit{}` | `*text*` |
| `\texttt{}` | `` `code` `` |
| `\begin{itemize}` | Markdown list (`-`) |
| `\begin{enumerate}` | Numbered list (`1.`) |
| `\href{url}{text}` | `[text](url)` |
| `$$equation$$` | Same (KaTeX) |

**TikZ Diagrams:**
- Convert simple flows to `flow` code blocks:
  ```flow
  [Input] --> [Process] --> [Output]
  ```
- For complex diagrams, describe what's needed and dispatch a sub-agent to implement

### 4. Compile and Test

1. **Ensure themes symlink exists** in the lecture's week directory:
   ```bash
   cd slides/weekX
   ln -sf ../template_deck/themes themes
   ```

2. **Run the compile script** (from the week directory):
   ```bash
   ../../template_deck/compile.sh lectureX.md
   ```

   The script defaults to using `./themes/` so no `-t` flag needed if symlink exists.

3. **Verify both HTML and PDF are created** (default output format is `both`)

### 5. Visual Review

Dispatch a sub-agent (using Task tool) to review each slide visually. The sub-agent should:

1. Open the HTML file in the Playwright browser
2. Navigate through each slide taking screenshots
3. Check for:
   - **Layout issues**: Overlapping text, cut-off content, poor spacing
   - **Centering**: Elements that should be centered but aren't
   - **Sizing**: Text or figures too large/small
   - **Broken links**: Any URLs that don't work
   - **Content accuracy**: Incorrect information
   - **Emoji misuse**: Emojis used for tone/decoration instead of as figures
   - **Style compliance**: Following sentence case, callout box colors, etc.
   - **Readability**: Can content be read from a distance?

4. Report issues found with slide numbers and descriptions
5. Fix any issues identified

### 6. Cleanup

Remove any temporary files created during debugging:
- Screenshot files (unless documenting an issue)
- Temp markdown files
- Browser cache files
- Keep only: .md, .html, .pdf for the lecture

### 7. Style Guide Updates

If new functionality was needed or something was confusing:
1. Update `slides/template_deck/STYLE_GUIDE.md`
2. Add examples for any new patterns used

### 8. Commit Changes

Commit all changes with a descriptive message:
```
feat(lecture-X): Convert lecture X to Marp format

- Converted from Beamer LaTeX to Marp markdown
- [List specific improvements or notable changes]
- Visual review completed
```

## Example Usage

```
/convert-lecture 1
```

This converts `lecture1.tex` (found in slides/week1/) to `lecture1.md`.

```
/convert-lecture slides/week2/lecture4.tex
```

This converts the specified file directly.

## Troubleshooting

### Theme not being applied?

1. **Check the themes symlink exists** in the week directory:
   ```bash
   ls -la slides/weekX/themes
   # Should show: themes -> ../template_deck/themes
   ```

2. **Verify the symlink points to a real directory**, not another symlink:
   ```bash
   ls -la slides/weekX/themes/
   # Should show actual files: cdl-theme.css, background_geometry.svg, etc.
   # Should NOT show another symlink to themes
   ```

3. **Check the frontmatter** in the .md file has exactly:
   ```yaml
   theme: cdl-theme
   ```

4. **Verify the CSS is included in generated HTML**:
   ```bash
   grep "Cormorant" slides/weekX/lectureX.html
   # Should return matches if theme is applied
   ```

5. **Check for compile errors** when running compile.sh - watch for:
   - "Local files are missing" warnings
   - Theme not found errors

### Common issues:

- **Nested symlinks**: If themes/themes exists, remove it: `rm slides/template_deck/themes/themes`
- **Wrong theme name**: Frontmatter must say `theme: cdl-theme` (not `cdl` or `cdl-theme.css`)
- **Missing symlink**: Create with `ln -sf ../template_deck/themes themes`
- **Compile script not found**: Run from the week directory, or use full path

## Notes

- Always prefer editing existing .md files over creating duplicates
- If the automatic conversion (beamer_to_marp.py) was already run, review and improve that output rather than starting from scratch
- Focus on quality over speed - a well-formatted slide deck is worth the extra time
- When in doubt, check the theme_showcase.md for examples
- Remember: emojis are figures, not decoration
