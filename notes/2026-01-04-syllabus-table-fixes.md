# Syllabus Table Fixes

**Date:** 2026-01-04
**Status:** Pending
**Priority:** Medium

## Issue

The detailed schedule table in the syllabus has mismatched columns and inconsistent lecture numbering.

## Required Fixes

### 1. Column Structure
The table columns should be:
| Column | Description |
|--------|-------------|
| Day | Day of the week (Mon, Tue, Wed, etc.) |
| Lecture | Lecture number |
| Link to slides | URL to lecture slides |
| Materials | Links to readings + assignments |

### 2. Lecture Numbering
X-hour lectures should be numbered sequentially like every other lecture:
- Week 1 should have lectures 1, 2, 3, and 4
- Week 2 should continue with 5, 6, 7, 8
- And so on...

Currently x-hour lectures may be unnumbered or treated differently.

## Files to Modify
- `admin/syllabus.md` - Source markdown
- `syllabus/index.html` - Generated output (via build-pages.py)

## Notes
- The `scripts/build-pages.py` handles markdown-to-HTML conversion
- Table parsing was recently updated to support proper HTML tables
- After fixing syllabus.md, regenerate with: `python scripts/build-pages.py`
