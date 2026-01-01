# ELIZA Demo Debug Session - December 31, 2025

## Summary

Systematically debugged and tested the ELIZA demo for GitHub Pages deployment.

## Bug Fixed

### Bidirectional Post-Substitution Conflict

**Location**: `/Users/jmanning/llm-course/demos/01-eliza/js/pattern-matcher.js`

**Problem**: The `applyPostSubstitutions()` function was iterating through substitutions sequentially, causing bidirectional pairs to conflict:
- `"you" -> "me"` followed by `"me" -> "you"` would cancel each other out
- Same issue with `"your"/"my"` and `"yourself"/"myself"`

**Solution**: Use placeholder markers during substitution:
1. First pass: Replace all matches with unique placeholders (`__POSTSUB_0__`, `__POSTSUB_1__`, etc.)
2. Second pass: Replace all placeholders with their final values

This ensures atomic substitution without conflicts.

## Test Suite

Created comprehensive test suite at:
`/Users/jmanning/llm-course/demos/01-eliza/test/eliza-tests.mjs`

Run with: `node test/eliza-tests.mjs`

**128 tests covering:**
- Pre-substitutions (13 tests)
- Post-substitutions/reflection (9 tests)
- Pattern matching with wildcards (19 tests)
- Capture groups (4 tests)
- Rule matching by keyword (20 tests)
- Response assembly (3 tests)
- Edge cases (6 tests)
- Synonym groups (29 tests)
- Goto rule resolution (22 tests)
- Rank priority (3 tests)

## Commit

`0637a4f` - fix(eliza): Fix bidirectional post-substitution conflict

## Files Modified

- `demos/01-eliza/js/pattern-matcher.js` - Fixed `applyPostSubstitutions()` function
- `demos/01-eliza/test/eliza-tests.mjs` - Added comprehensive test suite

## GitHub Issue

Updated issue #26 with details: https://github.com/ContextLab/llm-course/issues/26#issuecomment-3703071348

## Notes for Future Work

1. The "you" keyword has no explicit rank, while "my" has rank 2. This means sentences like "you remind me of my father" match "my" instead of the more specific "you remind me of" pattern. This is correct behavior per the ranking system but could be reconsidered.

2. Pre-substitutions must be applied before `findMatchingRule()` for correct keyword detection (e.g., "computers" -> "computer").

3. The test suite uses ES modules (`.mjs` extension) and imports directly from the source files.

---

## Python Parity Verification Session

### Commit

a2aa0dc - test(eliza): Fix keyword ranking test to match Python solution behavior

### Analysis

1. Verified punctuation handling matches Python
2. Fixed keyword ranking test ("i" vs "always" - both rank 0, "i" appears first)
3. All 128 tests passing

### Issue #26

Added comment: https://github.com/ContextLab/llm-course/issues/26#issuecomment-3703166493
