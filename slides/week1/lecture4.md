---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 4: Rules-based chatbots
### PSYC 51.07: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Assignment 1: Q&A

<div class="note-box" data-title="Questions welcome">

Let's take some time to address any questions about Assignment 1:
- Implementation challenges
- Pattern matching strategies
- Configuration file format
- Testing approaches

</div>

<div class="tip-box" data-title="Remember">

There are no bad questions. If you're confused about something, others probably are too.

</div>

---

# Common issues and tips

<style scoped>
.small-boxes ul { font-size: 0.65em !important; }
.small-boxes li { font-size: inherit !important; }
</style>

<div class="small-boxes" style="display: flex; gap: 1.5em; margin-top: 0.5em;">
<div class="note-box" data-title="Technical tips" style="flex: 1;">

- Use raw strings for regex: `r"pattern"`
- Test patterns on [regex101.com](https://regex101.com)
- Handle edge cases (empty input, special chars)
- Print intermediate results for debugging

</div>
<div class="warning-box" data-title="Common pitfalls" style="flex: 1;">

- Forgetting pre-substitutions before matching
- Case sensitivity issues
- Greedy vs. non-greedy matching
- Substitution order matters

</div>
</div>

---

# Beyond ELIZA

<div class="note-box" data-title="A foundation for more">

ELIZA (1966) was just the beginning. Weizenbaum's ideas inspired other researchers to explore what rules-based systems could do.

</div>

Today we'll explore:
- **PARRY** (1972): A different kind of simulation
- **A.L.I.C.E.** (1995): Pattern matching at scale
- The limits of rules-based approaches

---

# PARRY (1972)

<div class="note-box" data-title="Further reading">

[**Colby, Weber, & Hilf (1971, *Artificial Intelligence*):**](https://doi.org/10.1016/S0004-3702(71)80014-6) Artificial Paranoia

</div>

- Created by psychiatrist **Kenneth Colby** at Stanford
- Simulated a patient with **paranoid schizophrenia**
- Different goal than ELIZA: model a specific mental illness
- Had internal state: beliefs, emotional level, goals

<div class="note-box" data-title="Key insight">

ELIZA *reflects*; PARRY *models*. ELIZA avoids commitment; PARRY has a coherent (if paranoid) worldview.

</div>

---
<!-- _class: scale-78 -->

# PARRY vs ELIZA

<div style="display: flex; gap: 2em;">
<div>

**ELIZA (1966)**
- Non-directive therapy
- Reflects user input back
- No internal state or beliefs
- Avoids making claims
- Goal: keep user talking

</div>
<div>

**PARRY (1972)**
- Simulates a patient
- Has beliefs about the world
- Tracks emotional "anger" level
- Makes paranoid claims
- Goal: behave like a specific illness

</div>
</div>

<div class="warning-box" data-title="Important caveat">

Both are still rule-based systems with no real understanding. The "beliefs" in PARRY are just variables that affect pattern selection.

</div>

---

# How PARRY works: The algorithm

PARRY uses a **state machine** with emotional variables:

```python
class Parry:
    def __init__(self):
        self.anger = 5       # 0-20 scale
        self.fear = 8        # 0-20 scale
        self.mistrust = 10   # 0-15 scale
```

<div class="note-box" data-title="Processing steps">

1. **Match pattern** against input (like ELIZA)
2. **Update emotional state** based on topic
3. **Select response** influenced by anger/fear/mistrust levels
4. **Apply threshold rules** for extreme reactions

</div>

---
<!-- _class: scale-78 -->

# PARRY example: Step by step

**Input:** "Tell me about the mafia"

<div style="display: flex; gap: 1em;">
<div style="flex: 1;">

**Step 1: Pattern Match**
```
/\b(mafia|mob)\b/i → MATCH
```

**Step 2: Emotional Update**
```
fear += 4   → 8 → 12
anger += 3  → 5 → 8
mistrust += 3 → 10 → 13
```

</div>
<div style="flex: 1;">

**Step 3: Response Selection**
High fear + high mistrust triggers paranoid responses:

```
"You know, they have their
 ways of getting to you."
```

**Step 4: State Carried Forward**
Next input processed with elevated emotional levels.

</div>
</div>

---

# PARRY's emotional dynamics

```
Low emotions → Cooperative responses
    "I used to gamble on horses."
    "I've been feeling tense."

Medium emotions → Guarded responses
    "I don't want to talk about that."
    "Why are you asking me this?"

High emotions → Paranoid/hostile responses
    "Are you one of THEM?"
    "You're trying to trick me!"
```

<div class="warning-box" data-title="Key insight">

The emotional state creates **coherent behavior over time**. ELIZA has no memory; PARRY's responses depend on conversation history.

</div>

---
<!-- _class: scale-70 -->

# Worked example: PARRY conversation over time

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Early in conversation (low emotions):**
```
anger=5, fear=8, mistrust=10

Doctor: Tell me about yourself.
PARRY:  I went to the races at Bay Meadows.
        [Neutral topic, cooperative]

Doctor: Did you win?
PARRY:  I bet a little on the horses.
        [Still calm, sharing]
```

</div>
<div style="flex: 1;">

**After triggering topics (high emotions):**
```
anger=15, fear=16, mistrust=14

Doctor: What about the mafia?
PARRY:  I know what you're up to!
        [Defensive, suspicious]

Doctor: I'm just trying to help.
PARRY:  You're trying to get me to
        say something I don't mean.
        [Paranoid interpretation]
```

</div>
</div>

<div class="note-box" data-title="Key difference from ELIZA">

PARRY's responses are shaped by accumulated emotional state, creating a coherent "personality" over time.

</div>

---

# The Turing Test, revisited

<div class="note-box" data-title="A famous experiment">

In 1972, PARRY was tested via teletype against real patients and psychiatrists. Judges could not reliably distinguish PARRY from actual patients with paranoid schizophrenia.

</div>

- This was one of the first informal "Turing tests"
- Success? Or a comment on how we judge understanding?
- Psychiatrists were looking for *symptoms*, not *understanding*

<div class="tip-box" data-title="Think about it">

Does passing a specialized test mean the system understands anything? What does it mean that experts could be fooled?

</div>

---

# A.L.I.C.E. (1995)

<div class="note-box" data-title="The AIML era">

[**A.L.I.C.E.**](https://www.alicebot.org/) (Artificial Linguistic Internet Computer Entity) was created by Richard Wallace.

</div>

Key innovations:
- **AIML** (Artificial Intelligence Markup Language)
- Over **40,000 patterns** (vs ELIZA's ~200)
- Won the [Loebner Prize](https://en.wikipedia.org/wiki/Loebner_Prize) three times (2000, 2001, 2004)
- Open source, widely studied and extended

<div class="note-box">

More patterns $\neq$ more understanding. A.L.I.C.E. is still fundamentally pattern matching.

</div>

---

# AIML: Pattern matching at scale

```xml
<category>
  <pattern>MY NAME IS *</pattern>
  <template>
    Nice to meet you, <star/>.
  </template>
</category>

<category>
  <pattern>I AM FEELING *</pattern>
  <template>
    Why are you feeling <star/>?
  </template>
</category>
```

<div class="tip-box" data-title="Sound familiar?">

This is the same decomposition/reassembly pattern as ELIZA, just in XML format with more extensive coverage.

</div>

---
<!-- _class: scale-78 -->

# How ALICE works: The algorithm

**AIML Processing Steps:**

1. **Normalize input**: "Don't you think so?" → "DO NOT YOU THINK SO"
2. **Find matching pattern**: Search through 40,000+ patterns
3. **Extract wildcards**: `*` captures arbitrary text
4. **Process template**: May include conditionals, `<srai>` redirects
5. **Generate response**: Substitute captured text

<div class="note-box" data-title="Key difference from ELIZA">

AIML supports **recursive processing** via `<srai>` (Symbolic Reduction AI), allowing patterns to trigger other patterns.

</div>

---

# ALICE example: Step by step

**Input:** "My name is John and I like pizza"

<div style="display: flex; gap: 1em;">
<div style="flex: 1;">

**Step 1: Normalization**
```
MY NAME IS JOHN AND I LIKE PIZZA
```

**Step 2: Pattern Search**
```xml
<pattern>MY NAME IS *</pattern>
→ MATCHES with star = "JOHN AND I LIKE PIZZA"
```

</div>
<div style="flex: 1;">

**Step 3: Template Processing**
```xml
<template>
  Nice to meet you, <star/>.
  <think><set name="name">
    <star/></set></think>
</template>
```

**Step 4: Response**
"Nice to meet you, JOHN AND I LIKE PIZZA."
(stores name="JOHN AND I LIKE PIZZA")

</div>
</div>

---

# AIML advanced features

```xml
<!-- Symbolic Reduction (SRAI) -->
<category>
  <pattern>HI THERE</pattern>
  <template><srai>HELLO</srai></template>
</category>

<!-- Topic-based context -->
<topic name="MOVIES">
  <category>
    <pattern>WHAT DO YOU LIKE</pattern>
    <template>I enjoy science fiction films.</template>
  </category>
</topic>

<!-- That-based context (previous bot response) -->
<category>
  <pattern>YES</pattern>
  <that>DO YOU LIKE MOVIES</that>
  <template>What is your favorite movie?</template>
</category>
```

<div class="warning-box" data-title="Still rule-based">

Despite these features, ALICE cannot generalize beyond its patterns. 40,000 rules still miss infinite valid inputs.

</div>

---
<!-- _class: scale-70 -->

# Worked example: AIML recursive processing

**Input:** "Do you know what my name is"

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Step 1: Direct pattern search**
```xml
<pattern>DO YOU KNOW WHAT MY NAME IS</pattern>
→ No exact match found
```

**Step 2: Try wildcard patterns**
```xml
<pattern>DO YOU KNOW *</pattern>
<template>
  <srai>WHAT IS <star/></srai>
</template>
→ MATCH! Redirect to "WHAT IS my name"
```

</div>
<div style="flex: 1;">

**Step 3: Recursive processing**
```xml
<pattern>WHAT IS MY NAME</pattern>
<template>
  <condition name="name">
    <li value="unknown">
      I don't know. What is your name?
    </li>
    <li>Your name is <get name="name"/>.</li>
  </condition>
</template>
```

**Result:** "I don't know. What is your name?"

</div>
</div>

<div class="tip-box" data-title="The power of SRAI">

SRAI lets you handle many input variations without writing separate rules for each. "Do you know my name", "What's my name", and "Can you tell me my name" can all redirect to the same base pattern.

</div>

---

# Live demo

<div class="note-box" data-title="Interactive exploration">

Let's interact with these historical systems:

[Chatbot Evolution Demo](https://contextlab.github.io/llm-course/demos/02-chatbot-evolution/)

</div>

**While exploring, consider:**
- How do PARRY and A.L.I.C.E. differ from ELIZA?
- What do they do surprisingly well?
- Where do they break down?
- Can you find the edges of their rule sets?

---

# Discussion: The limits of rules

<div class="note-box" data-title="Discussion questions">

1. More rules $\neq$ understanding. Why not?
2. What *can't* rules-based systems do?
3. Where do they break down?
4. Is there a fundamental limit, or just a practical one?

</div>

**Consider these failure modes:**
- Novel situations not covered by rules
- Context that spans multiple turns
- Reasoning about cause and effect
- Understanding sarcasm, irony, metaphor

---
<!-- _class: scale-70 -->

# Worked example: Where rules fail

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Problem 1: Novel combinations**
```
User: My robot vacuum ate my homework
ALICE: I have no response for that.

# No pattern for this specific situation
# Even though it understands "vacuum"
# and "homework" separately
```

**Problem 2: Multi-turn reasoning**
```
User: I bought a red car yesterday
ALICE: Nice! I like cars.

User: What color is it?
ALICE: What is what color?

# ALICE forgot the car was red!
```

</div>
<div style="flex: 1;">

**Problem 3: Implicit meaning**
```
User: Can you pass the salt?
ALICE: Yes, I am capable of passing salt.

# Literal interpretation misses
# the REQUEST implied by the question
```

**Problem 4: Sarcasm**
```
User: Oh great, another Monday.
ALICE: What makes Mondays so great for you?

# Misses the negative sentiment entirely
```

</div>
</div>

<div class="warning-box" data-title="The fundamental issue">

Rules capture **syntax** (patterns of words), not **semantics** (meaning). No amount of rules can bridge this gap.

</div>

---

# The evolution of chatbots

```flow
[ELIZA (1966):green] --> [PARRY (1972):teal] --> [A.L.I.C.E. (1995):blue] --> [Modern LLMs:violet]
```
<!-- caption: From hand-crafted rules to learned patterns -->

<div class="note-box">

The trajectory: fewer hand-crafted rules, more learned patterns. But the fundamental question remains: does *any* of this constitute understanding?

</div>

---

# What rules-based systems teach us

1. **Behavior $\neq$ understanding**
   - A system can *seem* intelligent without understanding anything
   - This is the lesson of the Chinese Room

2. **Scale is not a solution**
   - 40,000 patterns is not qualitatively different from 200
   - More rules just mean more edge cases

3. **Pattern matching can fool us**
   - We project understanding onto systems that lack it
   - The ELIZA effect applies to all of these systems

---
<!-- _class: scale-78 -->

# Weizenbaum's legacy

<div class="note-box" data-title="Further reading">

**Weizenbaum, J. (1976).** *Computer Power and Human Reason: From Judgment to Calculation.* W.H. Freeman.

</div>

After creating ELIZA, Weizenbaum became a critic of AI:
- Warned against replacing human judgment with computation
- Argued some tasks *should not* be automated
- Foresaw many issues we face today with AI

> "What I had not realized is that extremely short exposures to a relatively simple computer program could induce powerful delusional thinking in quite normal people."

---
<!-- _class: scale-78 -->

# Weizenbaum's warnings

<div style="display: flex; gap: 2em;">
<div>

**His concerns (1976)**
- Mistaking simulation for understanding
- Replacing human relationships
- Trusting AI with decisions it cannot make
- Questions about human identity

</div>
<div>

**Still relevant today**
- Chatbots as therapists
- AI companions and relationships
- Automated decision systems
- Debates about AI consciousness

</div>
</div>

<div class="warning-box" data-title="50 years later">

Weizenbaum's warnings feel remarkably prescient. Are we heeding them?

</div>

---

# Next week: Computational linguistics

<div class="note-box" data-title="Week 2 preview">

We're leaving hand-crafted rules behind. Next week:
- **Tokenization**: Breaking text into meaningful units
- **Preprocessing**: Cleaning and normalizing text
- **Learning patterns from DATA** instead of writing them by hand

</div>

```flow
[Hand-crafted rules:gray] --> [Learning from data:green]
```
<!-- caption: The paradigm shift that enables modern NLP -->

---
<!-- _class: scale-78 -->

# Key takeaways

1. **ELIZA inspired others:** PARRY and A.L.I.C.E. built on Weizenbaum's ideas
2. **Different goals, same method:** Whether reflecting or modeling, all used pattern matching
3. **Scale doesn't solve understanding:** 40,000 patterns is not intelligence
4. **Behavior fools us:** We attribute understanding where none exists
5. **The warnings remain relevant:** Weizenbaum's concerns apply even more today
6. **The future is learning:** Moving from rules to data-driven approaches

---

# Questions? Want to chat more?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a> me</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label">Join our <a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label">Come to <a href="context-lab.youcanbook.me">office hours</a></span>
  </div>
</div>

<div class="tip-box">

Start working on Assignment 1 now if you haven't already. Reach out early if you get stuck.

</div>
