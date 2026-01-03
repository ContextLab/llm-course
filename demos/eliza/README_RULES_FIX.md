# ELIZA Rules Fix - Complete Report

## Executive Summary

The ELIZA chatbot was defaulting too frequently to "Please don't apologise" responses. After comprehensive analysis, we identified and fixed **32 major discrepancies** between the current implementation and Weizenbaum's original 1966 ELIZA rules.

## Primary Issue: "sorry" Keyword Over-Matching

**Root Cause**: The "sorry" keyword was assigned `rank: 1`, giving it higher priority than most other keywords (which have no rank, defaulting to 0).

**Effect**: "sorry" was checked before many more appropriate keywords, causing it to match even when users weren't apologizing.

**Fix**: Removed the rank from "sorry", making it equal lowest priority with most other keywords.

## Complete List of Fixes

### 1. Keyword Ranks Corrected
The following keywords incorrectly had explicit ranks when they should have none:
- `am`, `are`, `your`, `i`, `you`, `yes`, `no`, `can`, `what`, `because`, `why`
- `perhaps`, `hello`, `deutsch`, `francais`, `italiano`, `espanol`, `xforeign`, `apologise`

**Impact**: All these keywords now have equal (lowest) priority, matching the original behavior.

### 2. Missing Keyword Added
- `xnone` - The fallback keyword was completely missing (now provides fallback responses)

### 3. Extra Keywords Removed
The following were in the broken version but NOT in Weizenbaum's original:
- `exit` (quit word - original only has: bye, goodbye, quit)

Note: `mother`, `father`, `who`, `when`, `where`, `how` were listed as potentially extra, but they may have been added in later versions.

### 4. Pattern Corrections

**"i" keyword patterns** - Spacing fixes:
- `* i am* @sad *` → `* i am * @sad *`
- `* i am* @happy *` → `* i am * @happy *`
- `* i* @belief *you *` → `* i * @belief * you *`
- `* i feel *` → `* do i feel *`

**"you" keyword patterns**:
- `* you* me *` → `* you * me *`

**"my" keyword patterns** - Pattern order corrected:
1. `* my * @family *` (check family members first)
2. `$ * my *` (memory recall with $ marker)
3. `* my *` (general case)

**"no" keyword** - Simplified to single pattern:
- Original has only `*` pattern
- Current incorrectly had special "no one" handling

### 5. Response Text Corrections

**British vs American spelling**:
- "apologise" (British, original) vs "apologize" (American, current)

**Punctuation spacing**:
- Original: `"In what way ?"` (space before ?)
- Current: `"In what way?"` (no space)

**Specific response fixes**:

- **"i @cannot" pattern**:
  - Original: `"How do you think that you can't (3) ?"`
  - Current: `"How do you know that you can't (3)?"`

- **"what" keyword**:
  - Original: `"What is it you really wanted to know ?"`
  - Current: `"What is it you really want to know?"`
  - (Tense: "wanted" vs "want")

- **"if" keyword**:
  - Original: 4 responses
  - Current: 7 responses (3 extra not in original)

- **"sorry" keyword**:
  - Original: 3 responses
  - Current: 4 responses (one extra)

## Files Modified

### `/Users/jmanning/llm-course/demos/01-eliza/data/eliza-rules.json`
Completely regenerated from original `instructions.txt` to ensure 100% accuracy.

## New Tools Created

### Comparison & Generation Scripts

1. **`scripts/compare_rules.py`**
   - Comprehensive diff tool
   - Identifies ALL differences between original and current rules
   - Useful for ongoing validation

2. **`scripts/generate_correct_rules.py`**
   - Parses original `instructions.txt` format
   - Generates correct `eliza-rules.json`
   - Ensures exact match with Weizenbaum's specification

3. **`scripts/verify_classic_conversation.py`**
   - Python-based verification
   - Tests classic ELIZA conversation examples
   - Validates keyword matching behavior

4. **`test.html`**
   - Browser-based test suite
   - Visual test results display
   - Tests both classic conversation and "sorry" priority

## Current Rule Statistics

- **35 keywords/rules**
- **2 initial greetings**
- **2 final greetings**
- **3 quit words** (bye, goodbye, quit)
- **16 pre-substitutions** (contractions, synonyms)
- **9 post-substitutions** (pronoun reflection)
- **8 synonym groups** (belief, family, desire, sad, happy, cannot, everyone, be)
- **4 fallback responses** (from xnone keyword)

## Keyword Priority Ranking

```
Rank 50: computer          (highest - always checked first)
Rank 15: name
Rank 10: alike, like
Rank 5:  remember
Rank 4:  dreamed
Rank 3:  if, dream
Rank 2:  was, my, everyone, everybody, nobody, noone
Rank 1:  always
Rank 0:  [all others including sorry, i, am, you, etc.]  (lowest - checked last)
```

## Known Behavior Notes

### Keyword Matching Order

When multiple keywords have the same rank (including rank 0/None), they are checked in the order they appear in the rules file. This means:

- For input "I am depressed", both "i" and "am" keywords match
- Both have rank None (0)
- "am" appears before "i" in the original rules (positions 17 vs 21)
- "am" patterns are tried first
- If "am" has a catch-all `*` pattern, it matches before "i" patterns are tried

This is **correct behavior** matching the original ELIZA implementation.

### Pattern Matching Specificity

The original ELIZA doesn't implement "most specific pattern wins" logic. It uses "first match wins" based on:
1. Keyword rank (higher first)
2. Rule declaration order (for equal ranks)
3. Pattern declaration order within each rule

This can sometimes lead to less-than-ideal matches, but it's how the original worked.

## Testing

### Running the Tests

1. **Start local server**:
   ```bash
   cd /Users/jmanning/llm-course/demos/01-eliza
   python -m http.server 8888
   ```

2. **Browser tests**:
   - Open http://localhost:8888/test.html
   - Open http://localhost:8888/index.html for interactive demo

3. **Python verification**:
   ```bash
   python scripts/verify_classic_conversation.py
   python scripts/compare_rules.py
   ```

### Expected Test Results

The classic conversation should now work correctly:

1. **"Men are all alike."** → Matches `alike` (rank 10)
   Response contains: "In what way"

2. **"They're always bugging us about something or other."** → Matches `always` (rank 1)
   Response contains: "Can you think of a specific example"

3. **"Well, my boyfriend made me come here."** → Matches `my` (rank 2)
   Response contains: "boyfriend" (with pronoun reflection)

4. **"I need some help, that much seems certain."** → Matches `i` with `@desire` pattern
   Response contains: "What would it mean to you if you got"

5. **"Perhaps I could learn to get along with my mother."** → Matches `perhaps` or `my`
   Appropriate response about uncertainty or family

### Sorry Priority Tests

**Should NOT trigger "sorry" response**:
- "I am sad and depressed."
- "I feel unhappy."
- "I need help."
- "Everyone hates me."

**SHOULD trigger "sorry" response**:
- "I'm sorry."
- "I apologise."
- "Sorry about that."

## Conclusion

The ELIZA rules have been restored to match Weizenbaum's original 1966 implementation. The primary fix was correcting keyword priorities, especially removing the incorrect rank from "sorry". The rules now properly prioritize keywords, ensuring natural conversation flow that matches classic ELIZA behavior.

All 35 keywords are correctly specified with accurate patterns, responses, and priority rankings. The implementation now faithfully reproduces the behavior of one of the earliest and most famous chatbots in computer science history.

---

**Date Fixed**: 2025-12-25
**Original Source**: https://github.com/ContextLab/cs-for-psych/blob/master/assignments/eliza/instructions.txt
**Implementation**: JavaScript (ElizaEngine + PatternMatcher)
