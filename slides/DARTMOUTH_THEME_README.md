# Dartmouth Beamer Theme

This directory contains a custom Beamer theme for the PSYC 51.07: Models of Language and Communication course, following the official Dartmouth College Visual Identity Guidelines.

## Theme File

- **File**: `beamerthemeDartmouth.sty`
- **Location**: `/Users/jmanning/llm-course/slides/`

## Color Palette

The theme uses the official Dartmouth color palette from the [Dartmouth Communications Office](https://communications.dartmouth.edu/guides-and-tools/design-guidelines/dartmouth-colors):

### Primary Color
- **Dartmouth Green**: `#00693e` (RGB: 0, 105, 62) - Used for titles, structure elements, and primary highlights

### Secondary Colors
- **Forest Green**: `#12312b` (RGB: 18, 49, 43)
- **Rich Forest Green**: `#0D1E1C` (RGB: 13, 30, 28)
- **Snow White**: `#ffffff` (RGB: 255, 255, 255)
- **Midnight Black**: `#000000` (RGB: 0, 0, 0)

### Tertiary/Accent Colors
- **River Blue**: `#267aba` (RGB: 38, 122, 186) - Used for example blocks
- **River Navy**: `#003c73` (RGB: 0, 60, 115)
- **Spring Green**: `#c4dd88` (RGB: 196, 221, 136)
- **Rich Spring Green**: `#a5d75f` (RGB: 165, 215, 95)
- **Summer Yellow**: `#f5dc69` (RGB: 245, 220, 105)
- **Bonfire Orange**: `#ffa00f` (RGB: 255, 160, 15) - Used for alert blocks
- **Bonfire Red**: `#9d162e` (RGB: 157, 22, 46)
- **Tuck Orange**: `#d94415` (RGB: 216, 71, 38)
- **Violet**: `#8a6996` (RGB: 138, 105, 150)
- **Autumn Brown**: `#643c20` (RGB: 100, 60, 32)
- **Granite Gray**: `#424141` (RGB: 66, 65, 65)
- **Gray 1**: `#f7f7f7` (RGB: 247, 247, 247)
- **Gray 2**: `#e2e2e2` (RGB: 226, 226, 226)
- **Gray 3**: `#707070` (RGB: 112, 112, 112)

## Typography

### Dartmouth Ruzicka Font
The theme uses the official Dartmouth Ruzicka font family located in `/Users/jmanning/llm-course/admin/`:

- `DartmouthRuzicka-Regular.ttf`
- `DartmouthRuzicka-Bold.ttf`
- `DartmouthRuzicka-RegularItalic.ttf`
- `DartmouthRuzicka-BoldItalic.ttf`

If the Dartmouth Ruzicka fonts are not available, the theme falls back to Helvetica Neue.

### Emoji Support
The theme includes emoji font fallback support for LuaLaTeX using:
- Noto Color Emoji (primary)
- Apple Color Emoji (macOS fallback)
- Segoe UI Emoji (Windows fallback)

## Features

### Title Page
- Clean, professional layout with Dartmouth Green accents
- Course title and subtitle prominently displayed
- Author and institution information

### Frame Titles
- Dartmouth Green background with white text
- Progress bar at the top showing lecture progression
- Clean, readable design

### Blocks
- **Standard blocks**: Dartmouth Green header with light gray body
- **Alert blocks**: Bonfire Orange header for important information
- **Example blocks**: River Blue header for examples

### Lists
- Dartmouth Green bullets and numbers
- Clean, readable spacing

### Footline
- Course information on the left
- Slide numbers on the right
- Gray color for subtle appearance

## Usage

### In Lecture Files

All lecture files have been updated to use the Dartmouth theme. The typical structure is:

```latex
\documentclass[aspectratio=169]{beamer}
% Add slides directory to search path for Dartmouth theme
\makeatletter
\def\input@path{{../}}
\makeatother
\usetheme{Dartmouth}

% Packages
\usepackage{fontspec}
\usepackage{listings}
% ... other packages ...

% Title information
\title{Lecture Title}
\subtitle{Subtitle}
\author{PSYC 51.07: Models of Language and Communication}
\institute{Dr. Jeremy R. Manning}
\date{Week X - Day Y}
```

### Course Name
The course name has been updated throughout all lecture files to:
**PSYC 51.07: Models of Language and Communication**

## Compilation

### Requirements
- **LuaLaTeX** (required for emoji support and advanced font features)
- **TeX Live 2025** or later

### Compile Command
```bash
lualatex -interaction=nonstopmode lecture.tex
```

### macOS
```bash
cd /Users/jmanning/llm-course/slides/week1
lualatex lecture1.tex
```

### Ubuntu (GitHub Actions)
The theme is designed to work with both macOS and Ubuntu. On Ubuntu, if Dartmouth Ruzicka fonts are not available, it will fall back to Helvetica Neue or system sans-serif fonts.

## Design Principles

The theme follows Dartmouth's design guidelines:

1. **Dartmouth Green is primary**: The main institutional color is used consistently
2. **Clean and professional**: Minimal distractions, focus on content
3. **Good contrast**: Ensures readability for all audience members
4. **Brand consistency**: Follows official Dartmouth visual identity
5. **WCAG compliant**: Color combinations meet accessibility standards

## Files Updated

All 32 lecture .tex files across all week directories have been updated to use the Dartmouth theme:

- week1: lecture.tex, lecture1.tex, lecture2.tex, lecture3.tex
- week2: lecture.tex, lecture4.tex, lecture5.tex, lecture6.tex, emoji_test.tex, emoji_test_v2.tex
- week3: lecture7.tex, lecture8.tex
- week3-4: lecture.tex
- week4: lecture9.tex, lecture10.tex, lecture11.tex
- week5: lecture12.tex, lecture13.tex, lecture14.tex
- week5-6: lecture.tex
- week6: lecture15.tex, lecture16.tex, lecture17.tex
- week7: lecture.tex, lecture18.tex, lecture19.tex, lecture20.tex
- week9: lecture.tex, lecture21.tex, lecture22.tex, lecture23.tex
- week10: lecture24.tex

## Scripts

Two Python scripts were created to automate the theme updates:

1. **update_theme.py**: Replaces metropolis theme with Dartmouth theme and updates course names
2. **update_theme_path.py**: Adds the theme file search path to all lecture files

## References

- [Dartmouth Communications Design Guidelines](https://communications.dartmouth.edu/design-guidelines)
- [Dartmouth Colors](https://communications.dartmouth.edu/guides-and-tools/design-guidelines/dartmouth-colors)
- [Dartmouth Typefaces](https://communications.dartmouth.edu/guides-and-tools/design-guidelines/dartmouth-typefaces)

## Contact

For questions about the Dartmouth brand guidelines, contact the [Dartmouth Office of Communications](https://communications.dartmouth.edu/).
