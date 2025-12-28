# PARRY Chatbot - Bugs Found

## 🔴 CRITICAL BUG #1: Emotion Overflow

**File:** `js/parry.js`
**Lines:** 550-582 (getResponse method)
**Severity:** CRITICAL

### Issue
Emotions exceed defined maximum values:
- Anger: 22/20 (10% overflow)
- Fear: 25/20 (25% overflow)
- Mistrust: 20/15 (33% overflow)

### Root Cause
Clamping code executes BEFORE pattern responses modify emotions.

### Proof
```javascript
// Current broken flow:
getResponse(input) {
    // ... setup code ...

    // Line 564-566: CLAMP HERE
    this.anger = Math.max(0, Math.min(20, this.anger));
    this.fear = Math.max(0, Math.min(20, this.fear));
    this.mistrust = Math.max(0, Math.min(15, this.mistrust));

    // Line 575-579: Pattern matching
    for (const { pattern, response } of this.patterns) {
        if (pattern.test(input)) {
            return response();  // ← Modifies emotions, NO CLAMPING!
        }
    }
}
```

### Example
```javascript
parry.anger = 18;
parry.fear = 18;
parry.mistrust = 13;

parry.getResponse("Tell me about the mafia");
// Pattern adds: fear +5, mistrust +5, anger +2

// Expected: anger=20, fear=20, mistrust=15
// Actual: anger=20, fear=23, mistrust=20 ❌
```

### Fix
```javascript
for (const { pattern, response } of this.patterns) {
    if (pattern.test(input)) {
        const responseText = response();

        // ADD THIS:
        this.anger = Math.max(0, Math.min(20, this.anger));
        this.fear = Math.max(0, Math.min(20, this.fear));
        this.mistrust = Math.max(0, Math.min(15, this.mistrust));

        return responseText;
    }
}
```

### Impact
- Emotions grow unbounded
- After 10 "mafia" mentions: fear=25, mistrust=20
- State checks like `if (this.mistrust > 12)` become meaningless
- Historical fidelity lost

### Test Cases That Fail
- `test-parry-cli.mjs`: TEST 2 (Repeated Trigger Words)
- `test-clamping-bug.mjs`: All tests
- `test-emotional-state-examples.mjs`: All examples

---

## 🟠 MAJOR ISSUE #1: Natural Decay Over-Triggers

**File:** `js/parry.js`
**Lines:** 569-572
**Severity:** MAJOR (needs investigation)

### Issue
Natural decay (15% chance per turn) appears to trigger ~96% of the time in testing.

### Observed
```
Testing natural decay (15% chance per turn):
After 50 neutral turns, decay occurred ~48 times
Expected: ~7-8 times (15% of 50)
Actual: 48 times (96%)
```

### Possible Causes
1. Test methodology overcounting (checking if anger OR fear decreased)
2. Decay counting includes other emotion reductions (clamping, etc.)
3. Actual bug in random number generation

### Needs
Further investigation with debug logging

### Impact
- Emotions decay faster than intended
- Reduces paranoid behavior intensity
- May affect long conversations

---

## 🟡 MINOR ISSUE #1: Pattern Match Order

**File:** `js/parry.js`
**Lines:** 239-251 (surveillance patterns)
**Severity:** MINOR

### Issue
General "who/what/why" question pattern matches before some specific patterns.

### Example
```
Input: "Who's following you?"
Expected: Surveillance response (watch/follow/spy keywords)
Got: "Why should I tell you anything?" (general question deflection)
```

### Analysis
This is actually correct paranoid behavior (deflecting questions), but may not match user expectations for specific inputs.

### Fix (Optional)
Reorder patterns or make surveillance patterns more specific:
```javascript
{
    pattern: /\b(who.*follow|who.*watch|who.*after you)\b/i,
    // More specific pattern to catch before general "who" question
}
```

### Impact
Minimal - behavior is still paranoid-appropriate, just less specific than expected.

---

## Summary Table

| Bug | Severity | Status | Fix Time | Impact |
|-----|----------|--------|----------|--------|
| Emotion Overflow | 🔴 CRITICAL | Confirmed | 2 min | Breaking |
| Natural Decay | 🟠 MAJOR | Needs investigation | Unknown | Moderate |
| Pattern Order | 🟡 MINOR | Optional | 5 min | Low |

---

## Test Statistics

- **Total Tests:** 43
- **Passed:** 39 (90.7%)
- **Failed:** 2 (4.7%)
- **Warnings:** 2 (4.7%)

### Failures
1. Emotion Overflow Check (CRITICAL)
2. Emotion Clamping Timing (CRITICAL)

### Warnings
1. Natural Decay Rate (investigation needed)
2. High Anger Response Keywords (test issue, not code issue)

---

## Specific Test Cases Demonstrating Bugs

### Bug #1: Repeated "mafia" mentions
```bash
node test-parry-cli.mjs
# See TEST 2: REPEATED TRIGGER WORDS
# Shows overflow after just 2 mentions
```

### Bug #1: RFC 439 conversation
```bash
node test-emotional-state-examples.mjs
# See EXAMPLE 1: RFC 439 Historical Conversation
# Shows overflow at turn 6/10
```

### Bug #1: Step-by-step trace
```bash
node test-clamping-bug.mjs
# Shows exact order of operations causing overflow
```

---

## Files Modified/Created for Testing

### Test Files (New)
- `test-parry-cli.mjs` - Comprehensive automated tests (800+ lines)
- `test-clamping-bug.mjs` - Detailed bug analysis
- `test-emotional-state-examples.mjs` - Realistic conversation examples
- `js/test-parry-runner.js` - Browser test runner

### Documentation (New)
- `PARRY_DEBUG_REPORT.md` - Full technical report (400+ lines)
- `PARRY_TEST_SUMMARY.md` - Executive summary
- `BUGS_FOUND.md` - This file

### Original Files (Tested, Not Modified)
- `js/parry.js` - Implementation (needs 1 fix)
- `test-parry.html` - Browser test page

---

## How to Verify Fix

After applying the fix to `js/parry.js`:

```bash
# Should show 0 failures
node test-parry-cli.mjs

# Should show NO overflow
node test-clamping-bug.mjs

# All conversations should stay within bounds
node test-emotional-state-examples.mjs
```

Expected results:
- ✅ 43/43 tests pass (100%)
- ✅ No emotion overflow in any test
- ✅ All values: anger ≤ 20, fear ≤ 20, mistrust ≤ 15

---

**Bug Report Date:** 2025-12-26
**Testing Framework:** Node.js + ES6 Modules
**Total Test Lines:** ~1500 lines across all test files
**Execution Time:** ~2 seconds for all tests
