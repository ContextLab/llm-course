# GitHub issues and fixes history

Consolidated record of issue-driven work (Dec 2025 – Jan 2026). All issues described here have been resolved.

## Issue 17: Slides workflow and broken links (Dec 29, 2025)

### Problems identified
- 7 critical issues in `build-slides.yml`: missing fonts, missing week8 directory, incorrect path references, missing `.tex` files, font conflicts, no LaTeX error handling, missing individual lecture PDFs.
- Broken links across slides and README.
- Slides inventory audit completed.

### Resolution
- `build-slides.yml` was eventually deleted entirely (slides migrated from LaTeX to Marp).
- Broken links fixed in slides/README.md.
- All lecture HTML/PDF files verified.

## Issue 22: Theme refinement

Design analysis and emoji audits for slide styling. Files preserved in `notes/issue-22/` (still relevant for future work).

## Issue 32: JavaScript errors in demos (Jan 1, 2026)

### Fixes
- Demo 02 (Tokenization): `tokenizer.tokenize()` → `tokenizer.encode()` + individual `decode()`. Fixed innerHTML to use safe DOM methods.
- Additional JS fixes across multiple demos.

## Issue 51: Massive pre-launch fixes (Jan 4, 2026)

### Scope
Comprehensive preparation for course launch covering:
- Assignment setup (submodules, autograder scripts, template notebooks, deadlines).
- GitHub Pages deployment fixes.
- Syllabus table column structure and lecture numbering.
- Demo verification across all 15 demos.

### Key outcomes
- All 6 assignment repos added as submodules.
- Deadlines set (Assignment 1: Jan 16 through Final Project: Mar 9).
- Syllabus columns fixed: Day | Lecture | Link to slides | Materials.
- X-hour lectures numbered sequentially.

## Link audit (Jan 20, 2026)

Full citation link verification across all lectures. CSV with 19+ entries tracking:
- Citation, URL, status (valid/fixed), corrected URL, notes.
- Key fix: Colby et al. (1971) PARRY paper DOI corrected in both README and syllabus.
- All other links verified valid.

## GitHub issues to create (Dec 27, 2025)

Proposed issue for tracking the comprehensive demo fixes (22 bugs across 12 demos). Status: all fixes completed and committed.
