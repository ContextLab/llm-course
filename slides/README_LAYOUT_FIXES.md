# Slide Layout Fixes - Quick Reference

This directory contains automated tools and documentation for fixing layout issues in Beamer slides.

## Quick Start

### To fix layout issues in new/modified slides:

```bash
cd /Users/jmanning/llm-course/slides

# Run primary fixes
python3 fix_slides_layout.py

# Run additional refinements
python3 fix_slides_layout_v2.py
```

### To compile and check for warnings:

```bash
# Single file
cd /Users/jmanning/llm-course/slides/weekX
lualatex -interaction=nonstopmode lectureY.tex

# All files with report
cd /Users/jmanning/llm-course/slides
bash compile_all_slides.sh
cat compilation_report.txt
```

## What These Scripts Fix

1. **Frame shrinking** - Prevents content overflow
2. **Item spacing** - Reduces spacing in lists
3. **Vertical spacing** - Optimizes vspace usage
4. **TikZ scaling** - Prevents diagram overflow
5. **Font sizes** - Adjusts for dense content
6. **Column spacing** - Optimizes multi-column layouts

## Files

- `fix_slides_layout.py` - Primary fix script
- `fix_slides_layout_v2.py` - Additional refinements
- `compile_all_slides.sh` - Batch compilation script
- `notes/FINAL_SUMMARY.md` - Complete documentation
- `notes/slides_fix_tracking.csv` - Per-file tracking

## Best Practices for New Slides

```latex
% Use shrink for dense content
\begin{frame}[shrink=10]{Title}

% Reduce item spacing
\begin{itemize}\setlength{\itemsep}{0pt}
    \item Item 1
    \item Item 2
\end{itemize}

% Use moderate vspace
\vspace{0.3cm}  % Not 0.5cm or 1cm

% Scale TikZ diagrams
\begin{tikzpicture}[scale=0.85]
    % diagram content
\end{tikzpicture}
```

## When to Use

- After adding new slides
- After modifying existing slides
- When compilation shows "Overfull" warnings
- When PDFs show cut-off text or overlapping elements

## Documentation

See `notes/FINAL_SUMMARY.md` for complete details on:
- All fixes applied
- Before/after examples
- Technical specifications
- Testing procedures

## Questions?

Refer to the detailed documentation in the `notes/` directory.
