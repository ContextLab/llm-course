# Week 1: Introduction & String Manipulation

## Lecture Slides

This directory contains the beamer slides for Week 1 of the course.

### Files

- `lecture.tex` - Main LaTeX beamer presentation file

### Topics Covered

1. **Course Introduction** - Overview, structure, and goals
2. **Is ChatGPT Conscious?** - Discussion of consciousness and AI
3. **Language vs. Thought** - Key research from Fedorenko et al. (2024) and Lupyan et al. (2020)
4. **Pattern Matching & String Manipulation** - Fundamentals of computational text processing
5. **ELIZA: The First Chatbot** - Historical context and Weizenbaum (1966)
6. **Assignment 1** - Building the ELIZA chatbot

### Compiling the Slides

The slides use the beamer document class with custom styling, emojis, and code examples.

**Requirements:**
- XeLaTeX or LuaLaTeX (for Unicode emoji support)
- LaTeX packages: beamer, fontspec, listings, xcolor, tcolorbox, booktabs, hyperref

**To compile:**

```bash
xelatex lecture.tex
xelatex lecture.tex  # Run twice for proper references
```

Or with LuaLaTeX:

```bash
lualatex lecture.tex
lualatex lecture.tex
```

**Note:** If you don't have XeLaTeX/LuaLaTeX, you may need to modify the fontspec usage and emoji rendering.

### Alternative: Overleaf

The easiest way to compile these slides is to upload `lecture.tex` to [Overleaf](https://www.overleaf.com/) and set the compiler to XeLaTeX or LuaLaTeX.

### Features

- 🎨 Modern, clean theme (Madrid with seahorse color scheme)
- 📦 Custom "Think about it!" and "Discussion" boxes
- 💻 Syntax-highlighted Python code examples
- 🎯 Interactive discussion questions
- 📚 Citations to primary sources
- 💬 Emojis throughout for engagement

### Presentation Tips

1. Allow time for discussions (marked with 💬 boxes)
2. Encourage student reflection (marked with 💭 boxes)
3. Run Python code examples live if possible
4. Reference the readings frequently
5. Connect to Assignment 1 throughout

### Related Materials

- **Readings:**
  - Weizenbaum (1966) - ELIZA paper
  - Fedorenko et al. (2024) - Language network paper
  - Lupyan et al. (2020) - Language and perception paper

- **Assignment:**
  - Assignment 1: Building the ELIZA Chatbot
  - Location: `/assignments/Assignment 1: ELIZA/`

### Questions?

Contact Dr. Jeremy R. Manning:
- Email: jeremy@dartmouth.edu
- Office: Moore Hall 349
- Discord: https://discord.gg/sftEk9Ygdw
