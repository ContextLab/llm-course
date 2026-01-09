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
<!-- _class: scale-78 -->

# Common issues and tips

<div style="display: flex; gap: 1.5em;">
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
- **Formal grammars**: The theoretical foundations
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

<div class="tip-box" data-title="Key insight">

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

# The PARRY algorithm

```flow
[User input:blue] --> [Pattern match:teal] --> [Update emotions:green] --> [Select response:orange] --> [Output:violet]
```
<!-- caption: PARRY's processing pipeline with emotional state -->

<div class="note-box" data-title="Key difference from ELIZA">

PARRY maintains **persistent emotional state** across turns. This state influences which responses are selected, creating coherent paranoid behavior over time.

</div>

---
<!-- _class: scale-70 -->

# **Pattern matching:** detect triggers in user input

```flow
[User input:green] --> [Pattern match:green] --> [Update emotions:gray] --> [Select response:gray] --> [Output:gray]
```

<div class="definition-box" data-title="How does it work?">

PARRY scans input for **trigger keywords** organized by topic. Each topic has associated emotional effects and response pools.

</div>

<div class="example-box" data-title="Example trigger categories">

| Category | Keywords | Emotional effect |
|----------|----------|------------------|
| Mafia/mob | "mafia", "mob", "gangster" | Fear +4, Mistrust +5 |
| Police | "police", "cop", "arrest" | Mistrust +4, Anger +3 |
| Trust | "trust", "believe", "honest" | Mistrust +3 |
| Racetrack | "horses", "racing", "track" | Anger -1 (calming) |

</div>

---
<!-- _class: scale-80 -->

# **Emotional update:** modify internal state

```flow
[User input:gray] --> [Pattern match:gray] --> [Update emotions:green] --> [Select response:gray] --> [Output:gray]
```

<div class="definition-box" data-title="How does it work?">

When a trigger pattern matches, PARRY adjusts its emotional variables. These values persist across the conversation.

</div>

```python
class Parry:
    def __init__(self):
        self.anger = 5       # 0-20 scale
        self.fear = 8        # 0-20 scale
        self.mistrust = 10   # 0-15 scale

    def process_trigger(self, topic):
        if topic == "mafia":
            self.fear += 4
            self.mistrust += 5
            self.anger += 2
```

---
<!-- _class: scale-70 -->

# **Response selection:** choose based on emotional state

```flow
[User input:gray] --> [Pattern match:gray] --> [Update emotions:gray] --> [Select response:green] --> [Output:gray]
```

<div class="definition-box" data-title="How does it work?">

PARRY selects responses from different pools based on current emotional thresholds. Higher emotions trigger more paranoid responses.

</div>

<div class="example-box" data-title="Response pools by emotional state">

| Emotional level | Response style | Example |
|-----------------|----------------|---------|
| Low (calm) | Cooperative | "I used to gamble on horses." |
| Medium | Guarded | "I don't want to talk about that." |
| High (paranoid) | Hostile | "Are you one of THEM?" |

</div>

---
<!-- _class: scale-70 -->

# Worked example: PARRY conversation

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

<div class="note-box" data-title="Key insight">

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

<div class="warning-box">

More patterns $\neq$ more understanding. A.L.I.C.E. is still fundamentally pattern matching.

</div>

---

# The ALICE algorithm

```flow
[User input:blue] --> [Normalize:teal] --> [Pattern search:green] --> [Extract wildcards:orange] --> [Process template:violet] --> [Response:blue]
```
<!-- caption: ALICE's AIML processing pipeline -->

<div class="note-box" data-title="Key innovation">

AIML supports **recursive processing** via `<srai>` (Symbolic Reduction AI), allowing patterns to trigger other patterns. This enables handling many input variations with fewer rules.

</div>

---
<!-- _class: scale-70 -->

# **Normalization:** prepare input for matching

```flow
[User input:green] --> [Normalize:green] --> [Pattern search:gray] --> [Extract wildcards:gray] --> [Process template:gray] --> [Response:gray]
```

<div class="definition-box" data-title="How does it work?">

ALICE normalizes input to uppercase and removes punctuation before pattern matching. This reduces the number of patterns needed.

</div>

<div class="example-box" data-title="Example normalization">

| Input | Normalized |
|-------|------------|
| "Don't you think so?" | "DO NOT YOU THINK SO" |
| "What's your name?" | "WHAT IS YOUR NAME" |
| "I can't believe it!" | "I CAN NOT BELIEVE IT" |

</div>

---
<!-- _class: scale-78 -->

# **Pattern search:** find matching AIML categories

```flow
[User input:gray] --> [Normalize:gray] --> [Pattern search:green] --> [Extract wildcards:gray] --> [Process template:gray] --> [Response:gray]
```

<div class="definition-box" data-title="How does it work?">

ALICE searches through 40,000+ patterns to find the best match. Patterns use wildcards (`*` and `_`) to capture variable text.

</div>

```xml
<category>
  <pattern>MY NAME IS *</pattern>
  <template>Nice to meet you, <star/>.</template>
</category>

<category>
  <pattern>I AM FEELING *</pattern>
  <template>Why are you feeling <star/>?</template>
</category>
```

<div class="tip-box" data-title="Sound familiar?">

This is the same decomposition/reassembly pattern as ELIZA, just in XML format with more extensive coverage.

</div>

---
<!-- _class: scale-78 -->

# **SRAI:** recursive pattern matching

```flow
[User input:gray] --> [Normalize:gray] --> [Pattern search:gray] --> [Extract wildcards:gray] --> [Process template:green] --> [Response:gray]
```

<div class="definition-box" data-title="How does it work?">

The `<srai>` tag redirects processing to another pattern. This allows many input variations to map to a single response.

</div>

```xml
<!-- These all redirect to the same base pattern -->
<category>
  <pattern>HI THERE</pattern>
  <template><srai>HELLO</srai></template>
</category>

<category>
  <pattern>HOWDY</pattern>
  <template><srai>HELLO</srai></template>
</category>

<category>
  <pattern>HELLO</pattern>
  <template>Hello! How can I help you today?</template>
</category>
```

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

SRAI lets you handle many input variations without writing separate rules for each.

</div>

---

# Live demo

<div class="note-box" data-title="Interactive exploration">

Let's interact with these historical systems:

[Chatbot Evolution Demo](https://contextlab.github.io/llm-course/demos/chatbot-evolution/)

</div>

**While exploring, consider:**
- How do PARRY and A.L.I.C.E. differ from ELIZA?
- What do they do surprisingly well?
- Where do they break down?
- Can you find the edges of their rule sets?

---

# Formal grammars: the theory behind pattern matching

<div class="note-box" data-title="Further reading">

[**Chomsky (1956):**](https://chomsky.info/articles/195609--/) "Three Models for the Description of Language," *IRE Transactions on Information Theory*

</div>

In 1956, Noam Chomsky introduced a **hierarchy of formal grammars** that classify languages by the complexity of rules needed to generate them.

<div class="definition-box" data-title="Why does this matter?">

The Chomsky hierarchy tells us what kinds of patterns different computational systems can recognize&mdash;and what they *cannot*.

</div>

---
<!-- _class: scale-70 -->

# The Chomsky hierarchy

```flow
[Type 3 (Regular):green] --> [Type 2 (Context-free):teal] --> [Type 1 (Context-sensitive):blue] --> [Type 0 (Unrestricted):violet]
```
<!-- caption: Each level can express everything below it, plus more -->

| Type | Grammar | Recognizer | Example |
|------|---------|------------|---------|
| **Type 3** | Regular | Finite automaton | `a*b+` (any a's followed by b's) |
| **Type 2** | Context-free | Pushdown automaton | Balanced parentheses: `(())` |
| **Type 1** | Context-sensitive | Linear-bounded automaton | $a^n b^n c^n$ |
| **Type 0** | Unrestricted | Turing machine | Any computable language |

<div class="tip-box" data-title="Key insight">

Regular expressions (which ELIZA, PARRY, and ALICE use) are **Type 3**&mdash;the simplest class!

</div>

---

# Regular expressions = Type 3 grammars

<div class="definition-box" data-title="Mathematical equivalence">

Regular expressions and Type 3 (regular) grammars are **provably equivalent**&mdash;they recognize exactly the same class of languages.

</div>

<div style="display: flex; gap: 2em;">
<div>

**Regular expression**
```
(ab)*c+
```
Matches: "c", "cc", "abc", "ababcc"

</div>
<div>

**Equivalent Type 3 grammar**
```
S → A | C
A → abA | abC
C → c | cC
```

</div>
</div>

<div class="warning-box" data-title="Limitation">

Regular languages **cannot** match nested structures like balanced parentheses or recursive syntax. This is why rule-based chatbots struggle with complex language.

</div>

---
<!-- _class: scale-78 -->

# Chomsky's claims about human language

<div class="note-box" data-title="Historical context">

Chomsky argued that human languages require **at least** context-free (Type 2) grammars, and likely context-sensitive (Type 1) or beyond.

</div>

<div style="display: flex; gap: 2em;">
<div>

**What Chomsky showed:**
- Human syntax has recursive, nested structure
- Sentences like "The cat the dog chased ran" require tracking dependencies
- Regular grammars (Type 3) are **insufficient** for natural language

</div>
<div>

**The implication:**
- Pattern matching with regex can only approximate language
- No matter how many patterns (200 or 40,000), fundamental structures will be missed
- We need more powerful computational models

</div>
</div>

<div class="tip-box" data-title="Preview">

This theoretical limitation foreshadows why rule-based chatbots ultimately fail&mdash;and why the field moved toward statistical and neural approaches.

</div>

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

# The failure of rules: a paradigm shift

<div class="warning-box" data-title="The harsh reality">

Even with **40,000+ hand-crafted patterns**, ALICE cannot:
- Handle novel combinations of known concepts
- Maintain context across a conversation
- Understand implicit meaning or subtext
- Generalize beyond its training examples

</div>

```flow
[ELIZA (200 rules):green] --> [PARRY (state machine):teal] --> [ALICE (40,000 rules):blue] --> [Still fails:red]
```
<!-- caption: More rules don't solve the fundamental problem -->

<div class="note-box" data-title="The insight that changed everything">

What if, instead of *writing* rules by hand, we could *learn* patterns automatically from massive amounts of text data?

</div>

---

# From rules to data

<div style="display: flex; gap: 2em;">
<div>

**Rules-based approach**
- Humans write patterns
- Limited by human creativity
- Brittle to variations
- No generalization
- Example: ELIZA, PARRY, ALICE

</div>
<div>

**Data-driven approach**
- Learn patterns from data
- Scale with more data
- Handle variations naturally
- Generalize to new inputs
- Example: Neural networks, LLMs

</div>
</div>

<div class="tip-box" data-title="The key question">

Can statistical patterns learned from data capture something that hand-written rules cannot? This question drives the next era of NLP.

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

# Up next...

<div class="note-box" data-title="Week 2: Computational linguistics">

We're leaving hand-crafted rules behind. Next week we explore how to **learn from data**:

- **Lecture 5:** Data cleaning and preprocessing
- **Lecture 6:** Tokenization&mdash;breaking text into meaningful units
- **Lecture 7:** Text classification workshop
- **Lecture 8:** POS tagging and sentiment analysis

</div>

```flow
[Hand-crafted rules:gray] --> [Learning from data:green]
```
<!-- caption: The paradigm shift that enables modern NLP -->

<div class="tip-box" data-title="The key idea">

Instead of writing rules, we'll learn to **extract patterns** from large text corpora automatically.

</div>

---
<!-- _class: scale-78 -->

# Key takeaways

1. **PARRY adds emotional state:** Pattern matching + persistent variables = coherent personality
2. **ALICE scales patterns:** 40,000 rules with AIML and recursive SRAI processing
3. **Chomsky hierarchy:** Regular expressions (Type 3) are the *weakest* class of grammars
4. **Fundamental limits:** Rules capture syntax, not semantics&mdash;no amount of patterns can bridge this gap
5. **The paradigm shift:** From hand-written rules to learning patterns from data
6. **Weizenbaum's warnings:** The tendency to anthropomorphize remains relevant today

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
