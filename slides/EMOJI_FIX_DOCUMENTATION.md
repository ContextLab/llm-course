# Emoji Rendering Fix for LLM Course Slides

## Problem
Emojis were not rendering correctly in the Beamer slides. They appeared as missing characters (blank squares or question marks) when compiled with LuaLaTeX.

## Root Cause
The slides use a custom Dartmouth Beamer theme (`beamerthemeDartmouth.sty`) that was configured to use "Apple Color Emoji" font for emoji fallback. This font is only available on macOS, not on Ubuntu (used in GitHub Actions CI/CD).

## Solution
Updated the Dartmouth Beamer theme to use "Noto Color Emoji" as the primary emoji font, with fallbacks to Apple Color Emoji and Segoe UI Emoji for cross-platform compatibility.

### Changes Made

#### 1. Updated `/Users/jmanning/llm-course/slides/beamerthemeDartmouth.sty`

**Lines 54-63** (when Dartmouth Ruzicka fonts are available):
```latex
% Set up emoji font fallback for LuaLaTeX
% Try multiple emoji fonts for cross-platform compatibility
\newfontfamily\emojifont{Noto Color Emoji}[Renderer=Harfbuzz]
\directlua{
    luaotfload.add_fallback("emojifallback", {
        "Noto Color Emoji:mode=harf;",
        "Apple Color Emoji:mode=harf;",
        "Segoe UI Emoji:mode=harf;"
    })
}
```

**Lines 74-87** (fallback when Dartmouth Ruzicka fonts are NOT available):
```latex
% Fallback to system fonts if Ruzicka not available
% Set up emoji font fallback for LuaLaTeX
\newfontfamily\emojifont{Noto Color Emoji}[Renderer=Harfbuzz]
\directlua{
    luaotfload.add_fallback("emojifallback", {
        "Noto Color Emoji:mode=harf;",
        "Apple Color Emoji:mode=harf;",
        "Segoe UI Emoji:mode=harf;"
    })
}
\setsansfont{Helvetica Neue}[
    RawFeature={fallback=emojifallback}
]
```

## Technical Details

### Font Fallback Order
1. **Noto Color Emoji** (primary) - Available on Ubuntu/Linux via `fonts-noto-color-emoji` package
2. **Apple Color Emoji** - Available on macOS
3. **Segoe UI Emoji** - Available on Windows

### Why This Works
- LuaLaTeX with LuaHBTeX engine supports color fonts using HarfBuzz renderer
- The `luaotfload.add_fallback` function creates a font fallback chain
- When the main font (DartmouthRuzicka or Helvetica Neue) doesn't have emoji characters, LuaLaTeX automatically falls back to the emoji fonts in order
- The `mode=harf` parameter enables HarfBuzz rendering, which is required for color emoji fonts

### Compilation Requirements
- **Engine**: LuaLaTeX (with LuaHBTeX, available in TeX Live 2020+)
- **Font**: Noto Color Emoji must be installed
  - macOS: `brew install --cask font-noto-color-emoji`
  - Ubuntu: `sudo apt-get install fonts-noto-color-emoji`
- **Packages**: fontspec (automatically required by the Dartmouth theme)

## Testing

### Local Testing (macOS)
```bash
cd /Users/jmanning/llm-course/slides/week2
lualatex -interaction=nonstopmode lecture4.tex
```

Expected result: PDF compiles without "Missing character" warnings for emoji characters.

### CI/CD Testing (GitHub Actions)
The GitHub Actions workflow (`.github/workflows/build-slides.yml`) already:
1. Installs `fonts-noto-color-emoji` (line 51)
2. Uses LuaLaTeX as the primary compilation engine (line 98)

## Alternative Approaches Considered

### 1. Using the `emoji` Package
```latex
\usepackage{emoji}
\setemojifont{Noto Color Emoji}
```
**Why not used**: The Dartmouth theme provides a more robust font fallback mechanism that works automatically without requiring explicit emoji package configuration in every slide file.

### 2. Using `twemojis` Package
**Why not used**: Requires additional setup and may not render as well in Beamer presentations.

### 3. Removing Emojis Entirely
**Why not used**: Emojis enhance the visual appeal and accessibility of the slides. The proper solution is to fix the rendering, not remove the feature.

## References
- [Overleaf: Inserting emojis in LaTeX documents](https://www.overleaf.com/learn/latex/Questions/Inserting_emojis_in_LaTeX_documents_on_Overleaf)
- [CTAN: emoji package](https://ctan.org/pkg/emoji)
- [An overview of technologies supporting colour emoji fonts in LaTeX](https://www.overleaf.com/learn/latex/Articles/An_overview_of_technologies_supporting_the_use_of_colour_emoji_fonts_in_LaTeX)
- [Using Emoji in (pdf)LaTeX - Thom Wiggers](https://thomwiggers.nl/post/emoji-in-latex/)

## Files Modified
1. `/Users/jmanning/llm-course/slides/beamerthemeDartmouth.sty` - Updated emoji font fallback configuration

## Notes
- The fix is backward compatible - slides will compile on both macOS and Ubuntu
- No changes needed to individual slide files
- The theme handles emoji rendering automatically
- If compilation still shows emoji warnings, verify that Noto Color Emoji font is installed
