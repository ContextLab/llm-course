# ELIZA Sync Session Notes - December 27, 2025

## Issue #15: Fix ELIZA Implementation

### Summary
Synced ELIZA implementation with the original Weizenbaum rules from the cs-for-psych repository.

### Changes Made

#### 1. New Import Script (`scripts/import_eliza_rules.py`)
Created a Python script that:
- Fetches rules from the original `instructions.txt` at cs-for-psych repo
- Parses the Weizenbaum format (key/decomp/reasmb structure)
- Converts to our JSON format (keywords, patterns, responses, ranks)
- Handles special syntax: `@synonyms`, `$` prefix patterns, `goto` statements
- Validates rules and outputs summary statistics

#### 2. New Comparison Tool (`scripts/compare_rules.py`)
Created a tool to compare old and new rules and show differences.

#### 3. Updated Rules (`demos/01-eliza/data/eliza-rules.json`)
Generated fresh rules from the original source. Key differences:
- Synonym groups no longer include their own name (e.g., `@sad` contains `unhappy, depressed, sick` but not `sad`)
- Pattern spacing matches original (`* @synonym *` instead of `*@synonym*`)
- Keywords `i` and `you` no longer have explicit ranks (original behavior)
- `xnone` keyword responses are extracted to `fallbacks` array

#### 4. Removed Duplicate File
Deleted `demos/15-chatbot-evolution/data/eliza-rules.json` since Demo 15 already correctly imports from Demo 01.

#### 5. Updated Tests
Updated test expectations to match original ELIZA behavior:
- `"I'm sorry."` now matches `sorry` keyword (not `i`)
- `"I apologise."` now matches `apologise` keyword (not `i`)
- `"Am I happy"` now matches `am` keyword (not `i`)

#### 6. Removed Orphaned File
Deleted `demos/01-eliza/scripts/test_eliza.py` which tried to import a non-existent Python ELIZA module.

### Test Results
- Demo 01 ELIZA: **144/144 tests passed**
- Demo 15 ELIZA: **12/12 tests passed**
- Total: **156/156 tests passed (100%)**

### Key Insight
The original ELIZA implementation doesn't give special priority to the `i` keyword. When multiple keywords match with the same rank (or no rank), the first one in the rules list is used. This means:
- `sorry` and `apologise` match before `i` in apology statements
- `am` matches before `i` in "Am I..." questions (due to its catch-all pattern)

This is historically accurate to Weizenbaum's 1966 implementation.

### Files Changed
- `scripts/import_eliza_rules.py` (new)
- `scripts/compare_rules.py` (new)
- `demos/01-eliza/data/eliza-rules.json` (regenerated from original)
- `demos/15-chatbot-evolution/data/eliza-rules.json` (deleted - was duplicate)
- `demos/01-eliza/scripts/test_eliza.py` (deleted - orphaned)
- `tests/test-demo01-eliza.mjs` (updated expectations)
- `tests/test-demo15-eliza-fixes.mjs` (updated expectations)

### Branch
`fix/eliza-sync-issue-15`

### Related Issues
- Issue #15: Fix ELIZA Implementation (this issue)
- Issue #7: Cleanup tasks comment added

---
Session completed: December 27, 2025
