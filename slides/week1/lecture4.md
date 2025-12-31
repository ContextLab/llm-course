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

# Live demo

<div class="note-box" data-title="Interactive exploration">

Let's interact with these historical systems:

[Chatbot Evolution Demo](https://contextlab.github.io/llm-course/demos/15-chatbot-evolution/)

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
