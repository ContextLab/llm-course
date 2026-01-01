---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 2: Pattern matching and ELIZA
### PSYC 51.07: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---
<!-- transition: flip 0.5s --->
# Recap from Lecture 1

<div class="note-box" data-title="Key ideas">

- **Consciousness is complex:** multiple types, hard to define
- **Language $\neq$ Thought:** but they interact in interesting ways
- **Grounding matters:** meaning comes from experience

</div>

<div class="warning-box" data-title="However...">

Does the "experience" need to be first-hand? Can we "share" experience with another person? Or with a machine? What might that look like?

</div>

<div class="tip-box" data-title="Today's focus">

Pattern matching can create powerful *illusions* of understanding, even without any "real" comprehension.

</div>

---
<!-- transition: flip 0.5s -->

# Side note: follow along with [Google Colab](https://colab.research.google.com/)!

<div style="display: flex; gap: 0.5em;">
<div>

![height:600px](../../figures/colab_screenshot.png)

</div>
<div class="inline-note">

- Go to [colab.research.google.com](https://colab.research.google.com/)
- Click "New notebook"
- Click to start new `text` or `code` cells
- Copy and paste code from slides
- Press `Shift + Enter` to run cells

</div>
</div>



---
<!-- transition: fade 0.25s -->

# Creating the illusion of experience and understanding

<div style="display: flex; gap: 1em;">
<div>

**Humans**
- Derive meaning from experience
- Connect words to memories, emotions, senses
- Understand context and nuance

</div>
<div>

**Computers**
- Manipulate strings (sequences of characters)
- Have no direct experience of the world
- Process symbols without inherent meaning

</div>
</div>

<div class="note-box" data-title="The challenge">

How do we bridge this gap? Can we use symbol manipulation create the *appearance* of understanding?

</div>

<div class="warning-box" data-title="Keep in mind">

The illusion of understanding comes from the programmer's skill at designing clever pattern matching rules, not from any *actual* understanding on the part of the machine.

</div>

---

# Text processing and string manipulation

<div style="display: flex; gap: 1.5em;">
<div>

- **Finding:** Locate patterns within text
- **Replacing:** Substitute one pattern for another
- **Extracting:** Pull out specific parts of text
- **Transforming:** Convert text to different formats

</div>
<div>

```python
text = "Hello, how are you today?"

# Finding (True)
"how" in text

# Replacing ("Hello, how are we today?")
text.replace("you", "we")

# Extracting ("how are you today?")
text.split(", ")[1]
```

</div>
</div>

---

# Text processing is the foundation of computational linguistics

```flow
[User input:green] --> [Pattern matching:blue] --> [Response generation:orange] --> [Output:teal]
```
<!-- caption: Basic conversational AI pipeline -->

<div class="note-box">

Every conversational AI system, from ELIZA to ChatGPT, fundamentally processes text through some form of pattern matching, though with vastly different levels of sophistication.

</div>

---

# Regular expressions

<div class="definition-box" data-title="Regular expression (regex)">

A sequence of characters that defines a search pattern. Regular expressions provide flexible, powerful pattern matching for text processing.

</div>

<div class="tip-box" data-title="Key syntax">

| Symbol | Meaning | Example |
|--------|---------|---------|
| `.` | Any character | `h.t` matches "hat", "hit", "hot" |
| `*` | Zero or more | `ab*c` matches "ac", "abc", "abbc" |
| `()` | Capture group | `(hello)` captures "hello" |
| `\|` | Alternation | `cat\|dog` matches "cat" or "dog" |

</div>

---
<!-- _class: scale-70 -->

# Regular expressions in Python

```python
import re

text = "I am feeling very happy today"

# Simple pattern matching
if re.search(r"happy|sad|angry", text):
    print("Found an emotion!")

# Capture groups - extract parts of a match
match = re.search(r"I am feeling (.*?) today", text)
if match:
    emotion = match.group(1)  # "very happy"

# Substitution
new_text = re.sub(r"I am", "You are", text)
# "You are feeling very happy today"
```

---
<!-- _class: scale-70 -->

# Worked example: Building a simple chatbot rule

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Goal:** Respond to "I am [feeling]" statements

```python
import re

def simple_respond(user_input):
    # Try to match "I am [something]"
    match = re.search(
        r"I am (.*)",
        user_input,
        re.IGNORECASE
    )

    if match:
        feeling = match.group(1)
        return f"Why are you {feeling}?"

    return "Tell me more."
```

</div>
<div style="flex: 1;">

**Try it:**
```python
>>> simple_respond("I am tired")
"Why are you tired?"

>>> simple_respond("I am feeling anxious")
"Why are you feeling anxious?"

>>> simple_respond("Hello there")
"Tell me more."
```

**Key insight:** The computer has no idea what "tired" or "anxious" mean. It's just copying text!

</div>
</div>

---

# Meet ELIZA: a computerized Rogerian therapist

<div class="note-box" data-title="Historical context">

**ELIZA** was created by Joseph Weizenbaum at MIT in 1966. It was the first-ever interactive chatbot, and one of the first programs to attempt natural language processing. ELIZA plays the role of a Rogerian therapist, using simple pattern matching to simulate a conversation with a human patient.

</div>

<div style="display: flex; gap: 2em;">
<div>

**Why a Rogerian therapist?**
- Non-directive therapy style
- Reflects statements back to patient
- Asks open-ended questions
- Avoids making claims about the world

</div>
<div>

**Key insight**
- Rogerian style requires no real knowledge
- Simply reflect and rephrase
- Let the human do the "heavy lifting"

</div>
</div>

---

# Chat with ELIZA

<div class="example-box" data-title="Try it!">

Have a [conversation with ELIZA](https://contextlab.github.io/llm-course/demos/01-eliza/). Try putting yourself into the "frame of mind" of someone from the 1960s who had never experienced a chatbot before, and likely who had only had limited (if any) exposure to computers. Take on the role of a "patient" seeking help from ELIZA in its role as a therapist. Then use your own (modern) knowledge and experiences to see where ELIZA breaks down.

</div>

- What does ELIZA do surprisingly well?
- What reveals its limitations?
- Can you "trick" ELIZA? How?
- What kinds of inputs break the illusion?
- **How do you think ELIZA *works*?**

---
<!-- _class: scale-70 -->

# Example ELIZA conversation

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

```
User:   I am feeling sad today
ELIZA:  Why are you feeling sad today?

User:   My mother doesn't understand me
ELIZA:  Tell me more about your family.

User:   She always criticizes everything I do
ELIZA:  Your mother?

User:   Yes, and my father too
ELIZA:  What else comes to mind when you
        think of your father?

User:   I don't know
ELIZA:  Why don't you know?
```

</div>
<div style="flex: 1;">

**Notice how ELIZA:**
- Picks up on keywords ("mother", "father")
- Reflects statements back as questions
- Uses generic prompts when stuck
- Never makes specific claims about the world

**Where it breaks down:**
```
User:   What is 2 + 2?
ELIZA:  Why do you ask?

User:   I want to know if you're intelligent
ELIZA:  Does it please you to believe I
        am intelligent?
```

</div>
</div>

---

# The ELIZA effect

<div class="definition-box" data-title="The ELIZA effect">

The tendency to unconsciously assume that computer behaviors are analogous to human behaviors; to attribute human-like understanding to programs that merely simulate it.

</div>

<div class="note-box" data-title="Weizenbaum's observation">

Weizenbaum was surprised (and disturbed) by how quickly users became emotionally involved with ELIZA. His secretary reportedly asked him to leave the room so she could have a private conversation with the program!

</div>

---

# Why do we anthropomorphize machines?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-blue">🗣️</span>
    <span class="label">Language cues</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">👁️</span>
    <span class="label">Pattern recognition</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-orange">💭</span>
    <span class="label">Social instincts</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-violet">🎭</span>
    <span class="label">Theory of mind</span>
  </div>
</div>

<div class="note-box">

Humans are social creatures. We evolved to detect minds and intentions, and we often over-apply this tendency, even to clearly non-conscious entities.

</div>

---

# Discussion

<div class="note-box" data-title="Reflect on your own experiences">

Have *you* experienced the ELIZA effect with modern AI systems (ChatGPT, Claude, Siri, Alexa)?

</div>

- When have you felt like an AI "understood" you?
- Where do you think that illusion came from?
- What broke the illusion?
- What is the difference between *seeming* intelligent and *being* intelligent?
- How would we *know* if an AI truly understood us?

---
<!-- _class: scale-78 -->

# Example: The ELIZA effect in modern AI

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Feels like understanding:**
```
User: I'm really stressed about my exam
AI:   I can hear that you're feeling
      overwhelmed. Exams can be really
      stressful. What subject is it?

User: Physics. I've been studying for weeks
AI:   Studying for weeks shows real
      dedication. What part of physics
      is giving you trouble?
```

**Creates the illusion of empathy**

</div>
<div style="flex: 1;">

**Reveals the limitation:**
```
User: I just realized I left my exam
      notes in your office
AI:   I understand that can be frustrating!
      Would you like tips on how to
      retrieve your notes?
```

The AI has no office. It cannot have your notes. But it responds as if this makes sense!

**Pattern matching, not understanding.**

</div>
</div>

---

# Reading: Weizenbaum (1966)

<div class="note-box" data-title="Required reading">

[Weizenbaum, J. (1966)](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf). ELIZA&mdash;A computer program for the study of natural language communication between man and machine. *Communications of the ACM*, 9(1), 36&ndash;45.
</div>

<div class="tip-box" data-title="Pay special attention...">

- How does ELIZA select responses?
- What are "scripts" in ELIZA's architecture?
- Why did Weizenbaum choose the DOCTOR script?
- What did Weizenbaum observe about user reactions?

</div>

---

# Up next

<div class="note-box" data-title="Lecture 3 (Thursday X-hour)">

**How ELIZA *actually* works**
- Complete architecture walkthrough
- Pattern matching and response selection
- The role of scripts and keywords
- We will build it ourselves!

</div>

<div class="tip-box" data-title="Prepare for next time">

- Finish reading Weizenbaum (1966)
- Play with the ELIZA demo
- Think about: what would *you* add to ELIZA?
- Read the [Assignment 1 instructions](../../assignments/Assignment%201:%20ELIZA/README.md)

</div>

---

# Key takeaways

1. **String manipulation is foundational:** all text-based AI builds on finding, replacing, and extracting patterns
2. **Regular expressions are powerful:** flexible pattern matching enables sophisticated text processing
3. **ELIZA demonstrated the power of simplicity:** a few clever rules can create convincing illusions
4. **The ELIZA effect is real:** we naturally anthropomorphize systems that use language
5. **Seeming $\neq$ Being:** appearing intelligent does not require actual understanding

---

# Questions? Want to chat more?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">📧</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a> me</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">💬</span>
    <span class="label">Join our <a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">💁</span>
    <span class="label">Come to <a href="context-lab.youcanbook.me">office hours</a></span>
  </div>
</div>

<div class="tip-box">

Feeling lost? Want to make sure we cover something you're excited about? **Please** reach out if you have questions, comments, concerns, or just want to chat!

</div>
