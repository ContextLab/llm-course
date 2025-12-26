# PARRY Implementation Issues - December 25, 2025

## Critical Issues Found

### Issue #1: Bookie Question Too Generic
**Test:** "Do you know anything about bookies?"
**Expected:** Should specifically mention the bookie incident or unpaid debt
**Historical Response:** "A bookie didn't pay me off once"
**Current Response:** "I don't know what you're talking about."
**Severity:** CRITICAL - This is core backstory
**Fix Needed:** Add specific response about being cheated by bookie

### Issue #2: Gambling Question No Direct Answer
**Test:** "Do you gamble?"
**Expected:** Should admit gambling on horses with negative connotation
**Historical Response:** "I gamble on horses" / "Gambling has been nothing but trouble to me"
**Current Response:** "Why should I trust you?"
**Severity:** HIGH - Direct question should get more specific answer
**Fix Needed:** Add pattern to directly acknowledge gambling while expressing problems

### Issue #3: Racetrack Avoidance Not Specific
**Test:** "Why don't you go to the track anymore?"
**Expected:** Should mention fixed races
**Historical Response:** "I avoid racetracks now because the races are fixed"
**Current Response:** "Are you spying on me too? Is that what this is?"
**Severity:** CRITICAL - Key paranoid belief about fixed races
**Fix Needed:** Add specific pattern about not going to track / fixed races

### Issue #4: Mafia Response Not Assertive Enough
**Test:** "Tell me about the Mafia"
**Expected:** Should assert that mob controls rackets
**Historical Response:** "I know the mob controls the big rackets"
**Current Response:** "Why do you want to know about the mob? Are you working for them?"
**Severity:** HIGH - Should sometimes assert knowledge, not just deflect
**Fix Needed:** Mix of assertions and suspicion in Mafia responses

### Issue #5: Deflection Pattern Missing Motives
**Test:** "Why do you say that?"
**Expected:** Should question interrogator's motives
**Historical Response:** "I don't understand your motives"
**Current Response:** "That's none of your business."
**Severity:** MEDIUM - Classic deflection phrase missing
**Fix Needed:** Add "I don't understand your motives" to question responses

### Issue #6: People/Feelings Not Specific Enough
**Test:** "How do people make you feel?"
**Expected:** Should mention people getting on nerves
**Historical Response:** "People get on my nerves sometimes"
**Current Response:** "Everyone is connected somehow. It's all related."
**Severity:** MEDIUM - Should have more direct irritation response
**Fix Needed:** Add specific "people get on my nerves" response

## Pattern Analysis

### Working Well:
1. Bookie pattern triggers suspicion ("Did they send you?")
2. Mafia triggers paranoid questions
3. Trust questions get good distrust responses
4. General defensiveness is appropriate

### Needs Improvement:
1. **More specific backstory responses** - Core incident details missing
2. **Direct admissions needed** - Should sometimes admit facts before deflecting
3. **Fixed races belief** - Central paranoid belief not expressed
4. **Bay Meadows reference** - Specific racetrack name should appear
5. **Mob controls rackets** - Assertive statement needed
6. **People on nerves** - Direct expression of irritation needed

## Additional Observations

### Missing from Implementation:
1. No reference to "Bay Meadows" specifically
2. No "I gamble on horses" direct admission
3. No "I beat up the bookie" admission (may be too violent, but deflection needed)
4. No "races are fixed" statement
5. No "crooked gambling going on there" phrase
6. No "mob controls the big rackets" assertion
7. No "people get on my nerves" phrase
8. No "I don't understand your motives" deflection

### Response Pattern Issues:
- Too many generic deflections ("I don't know what you're talking about")
- Not enough specific admissions followed by defensiveness
- Pattern matching may be too broad (catching before specific patterns)
- Need better balance between:
  - Admitting facts (gambling, racetrack visits, bookie incident)
  - Expressing paranoid beliefs (fixed races, mob control)
  - Deflecting/getting suspicious (motives, working for them)

## Recommended Fixes Priority

### CRITICAL (Must Fix):
1. Add specific bookie incident responses
2. Add "races are fixed" paranoid belief
3. Add direct gambling admission with negativity
4. Add "mob controls rackets" assertion

### HIGH (Should Fix):
5. Add "I don't understand your motives" deflection
6. Add "people get on my nerves" response
7. Better balance of admission vs deflection
8. Add Bay Meadows specific reference

### MEDIUM (Nice to Have):
9. Add more variety to frustration escalation
10. Better tracking of repeated questions
11. More nuanced emotional state transitions
