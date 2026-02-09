# Slide infrastructure history

Consolidated record of slide compilation, theming, and autoscaling work (Dec 2025 – Jan 2026). All issues described here have been resolved.

## Autoscale timing bug (Dec 31, 2025)

### Problem
Scaling only applied after page refresh. `scaleSlides()` ran too early during `DOMContentLoaded` before fonts/images loaded and Marp's bespoke viewer initialized. `getBoundingClientRect()` returned 0 for non-visible slides.

### Fix
- Delayed initial scaling until `window.load` event.
- Added mutation observer for late-loading content.
- Retry logic for slides with zero dimensions.

### Architecture
Build pipeline: `process_markdown.py` → Marp (HTML + PDF) → inject `chart-defaults.js` + `autoscale.js`.
Autoscale philosophy: start at max font size, scale DOWN only when overflow detected. Never scale up.

## CDL theme verification (Dec 30, 2025)

Theme was working correctly all along. Investigation confirmed:
- Frontmatter `theme: cdl-theme` applied.
- Symlinks from `slides/weekN/themes → ../template_deck/themes` intact.
- Cormorant font, note-box classes, Dartmouth green (#00693e) all present in generated HTML.
- Removed confusing nested symlink at `template_deck/themes/themes`.

## Issue 22: Theme refinement (Jan 2026)

Design analysis comparing Dartmouth Beamer theme to CDL Marp reference theme:
- Typography audit (title, subtitle, frame title sizes).
- Emoji audit across weeks 1–6.
- Reference template and theme CSS created.
- Theme audit CSV tracking all refinement items.

Files preserved in `notes/issue-22/` subdirectory (still relevant for future theme work).

## HTML/PDF sync problem

`autoscale.js` modifies content at runtime in browser, but PDFs are generated at compile-time before JavaScript runs. This is a known architectural limitation. Workaround: `process_markdown.py` handles content splitting at compile time so autoscale only needs to handle minor font adjustments.
