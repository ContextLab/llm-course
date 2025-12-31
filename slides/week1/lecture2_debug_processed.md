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

<!-- _class: scale-80 -->
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

<!-- _class: scale-80 -->
# Creating the illusion of experience and understanding

<div style="display: flex; gap: 1.5em;">
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

<div class="note-box" data-title="The key question">

How do we bridge this gap? How can symbol manipulation create the *appearance* of understanding?

</div>

---

<!-- _class: scale-90 -->
# String manipulation basics

Text processing is the foundation of computational linguistics:

- **Finding:** Locate patterns within text
- **Replacing:** Substitute one pattern for another
- **Extracting:** Pull out specific parts of text
- **Transforming:** Convert text to different formats

<pre><code class="language-python has-line-numbers" data-start-line="1">
<span class="line"><span class="line-num">1</span><span class="line-code"><span class="hl-n">text</span> <span class="hl-o">=</span> <span class="hl-s2">&quot;Hello, how are you today?&quot;</span></span></span>
<span class="line"><span class="line-num">2</span><span class="line-code"></span></span>
<span class="line"><span class="line-num">3</span><span class="line-code"><span class="hl-c1"># Finding</span></span></span>
<span class="line"><span class="line-num">4</span><span class="line-code"><span class="hl-s2">&quot;how&quot;</span> <span class="hl-ow">in</span> <span class="hl-n">text</span>              <span class="hl-c1"># True</span></span></span>
<span class="line"><span class="line-num">5</span><span class="line-code"></span></span>
<span class="line"><span class="line-num">6</span><span class="line-code"><span class="hl-c1"># Replacing</span></span></span>
<span class="line"><span class="line-num">7</span><span class="line-code"><span class="hl-n">text</span><span class="hl-o">.</span><span class="hl-n">replace</span><span class="hl-p">(</span><span class="hl-s2">&quot;you&quot;</span><span class="hl-p">,</span> <span class="hl-s2">&quot;we&quot;</span><span class="hl-p">)</span>  <span class="hl-c1"># &quot;Hello, how are we today?&quot;</span></span></span>
<span class="line"><span class="line-num">8</span><span class="line-code"></span></span>
<span class="line"><span class="line-num">9</span><span class="line-code"><span class="hl-c1"># Extracting</span></span></span>
<span class="line"><span class="line-num">10</span><span class="line-code"><span class="hl-n">text</span><span class="hl-o">.</span><span class="hl-n">split</span><span class="hl-p">(</span><span class="hl-s2">&quot;, &quot;</span><span class="hl-p">)[</span><span class="hl-mi">1</span><span class="hl-p">]</span>        <span class="hl-c1"># &quot;how are you today?&quot;</span></span></span>
</code></pre>

---

# Why string manipulation matters

<div class="diagram-container">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1533 120">
  <defs>
    <symbol id="flow-arrow" viewBox="0 0 76.41 27.12">
      <path d="M43.3,1.69c-.92-.1-1.78.32-2.08,1.1-.3.79.06,1.69.83,2.23l1.19.46s0,0,0,0c0,0,0,0,0,0l15.39,5.94H2.98c-1.1,0-2,.9-2,2s.9,2,2,2h55.64l-15.4,5.94s0,0,0,0c0,0,0,0,0,0l-1.17.45c-.77.54-1.14,1.45-.83,2.24.3.78,1.16,1.2,2.09,1.1l1.15-.42s0,0,.01,0c0,0,0,0,0,0l24.98-9.1c2.07-.75,2.06-3.67,0-4.42L44.45,2.11" fill="currentColor"/>
    </symbol>
  </defs>
  <rect x="25" y="25" width="267" height="70" rx="12" ry="12"
        fill="rgba(0, 105, 62, 0.15)" stroke="#00693e" stroke-width="3"/>
  <text x="158" y="67" font-family="'Avenir LT Std', Avenir, 'Avenir Next', sans-serif" font-size="22"
        font-weight="600" fill="#00693e" text-anchor="middle">User input</text>
  <use href="#flow-arrow" x="302" y="46" width="50" height="28" style="color: #0a2518"/>
  <rect x="362" y="25" width="379" height="70" rx="12" ry="12"
        fill="rgba(38, 122, 186, 0.15)" stroke="#267aba" stroke-width="3"/>
  <text x="551" y="67" font-family="'Avenir LT Std', Avenir, 'Avenir Next', sans-serif" font-size="22"
        font-weight="600" fill="#003c73" text-anchor="middle">Pattern matching</text>
  <use href="#flow-arrow" x="751" y="46" width="50" height="28" style="color: #0a2518"/>
  <rect x="811" y="25" width="435" height="70" rx="12" ry="12"
        fill="rgba(255, 160, 15, 0.15)" stroke="#ffa00f" stroke-width="3"/>
  <text x="1028" y="67" font-family="'Avenir LT Std', Avenir, 'Avenir Next', sans-serif" font-size="22"
        font-weight="600" fill="#d94415" text-anchor="middle">Response generation</text>
  <use href="#flow-arrow" x="1256" y="46" width="50" height="28" style="color: #0a2518"/>
  <rect x="1316" y="25" width="192" height="70" rx="12" ry="12"
        fill="rgba(0, 128, 128, 0.15)" stroke="#008080" stroke-width="3"/>
  <text x="1412" y="67" font-family="'Avenir LT Std', Avenir, 'Avenir Next', sans-serif" font-size="22"
        font-weight="600" fill="#006666" text-anchor="middle">Output</text>
</svg>
</div>
<div class="diagram-caption">Basic conversational AI pipeline</div>

<div class="note-box">

Every conversational AI system, from ELIZA to ChatGPT, fundamentally processes text through some form of pattern matching, though with vastly different sophistication.

</div>

---

<!-- _class: scale-78 -->
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

# Regular expressions in Python

<pre><code class="language-python has-line-numbers" data-start-line="1">
<span class="line"><span class="line-num">1</span><span class="line-code"><span class="hl-kn">import</span> <span class="hl-nn">re</span></span></span>
<span class="line"><span class="line-num">2</span><span class="line-code"></span></span>
<span class="line"><span class="line-num">3</span><span class="line-code"><span class="hl-n">text</span> <span class="hl-o">=</span> <span class="hl-s2">&quot;I am feeling very happy today&quot;</span></span></span>
<span class="line"><span class="line-num">4</span><span class="line-code"></span></span>
<span class="line"><span class="line-num">5</span><span class="line-code"><span class="hl-c1"># Simple pattern matching</span></span></span>
<span class="line"><span class="line-num">6</span><span class="line-code"><span class="hl-k">if</span> <span class="hl-n">re</span><span class="hl-o">.</span><span class="hl-n">search</span><span class="hl-p">(</span><span class="hl-sa">r</span><span class="hl-s2">&quot;happy|sad|angry&quot;</span><span class="hl-p">,</span> <span class="hl-n">text</span><span class="hl-p">):</span></span></span>
<span class="line"><span class="line-num">7</span><span class="line-code">    <span class="hl-nb">print</span><span class="hl-p">(</span><span class="hl-s2">&quot;Found an emotion!&quot;</span><span class="hl-p">)</span></span></span>
<span class="line"><span class="line-num">8</span><span class="line-code"></span></span>
<span class="line"><span class="line-num">9</span><span class="line-code"><span class="hl-c1"># Capture groups - extract parts of a match</span></span></span>
<span class="line"><span class="line-num">10</span><span class="line-code"><span class="hl-n">match</span> <span class="hl-o">=</span> <span class="hl-n">re</span><span class="hl-o">.</span><span class="hl-n">search</span><span class="hl-p">(</span><span class="hl-sa">r</span><span class="hl-s2">&quot;I am feeling (.*?) today&quot;</span><span class="hl-p">,</span> <span class="hl-n">text</span><span class="hl-p">)</span></span></span>
<span class="line"><span class="line-num">11</span><span class="line-code"><span class="hl-k">if</span> <span class="hl-n">match</span><span class="hl-p">:</span></span></span>
<span class="line"><span class="line-num">12</span><span class="line-code">    <span class="hl-n">emotion</span> <span class="hl-o">=</span> <span class="hl-n">match</span><span class="hl-o">.</span><span class="hl-n">group</span><span class="hl-p">(</span><span class="hl-mi">1</span><span class="hl-p">)</span>  <span class="hl-c1"># &quot;very happy&quot;</span></span></span>
<span class="line"><span class="line-num">13</span><span class="line-code"></span></span>
<span class="line"><span class="line-num">14</span><span class="line-code"><span class="hl-c1"># Substitution</span></span></span>
<span class="line"><span class="line-num">15</span><span class="line-code"><span class="hl-n">new_text</span> <span class="hl-o">=</span> <span class="hl-n">re</span><span class="hl-o">.</span><span class="hl-n">sub</span><span class="hl-p">(</span><span class="hl-sa">r</span><span class="hl-s2">&quot;I am&quot;</span><span class="hl-p">,</span> <span class="hl-s2">&quot;You are&quot;</span><span class="hl-p">,</span> <span class="hl-n">text</span><span class="hl-p">)</span></span></span>
<span class="line"><span class="line-num">16</span><span class="line-code"><span class="hl-c1"># &quot;You are feeling very happy today&quot;</span></span></span>
</code></pre>

---

<!-- _class: scale-78 -->
# Meet ELIZA

<div class="note-box" data-title="Historical context">

**ELIZA** was created by Joseph Weizenbaum at MIT in 1966. It was one of the first programs to attempt natural language processing.

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

# Reading: Weizenbaum (1966)

<div class="note-box" data-title="Required reading">

[Weizenbaum, J. (1966). ELIZA&mdash;A computer program for the study of natural language communication between man and machine. *Communications of the ACM*, 9(1), 36-45.](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf)

</div>

**Pay attention to:**
- How does ELIZA select responses?
- What are "scripts" in ELIZA's architecture?
- Why did Weizenbaum choose the DOCTOR script?
- What did Weizenbaum observe about user reactions?

---

<!-- _class: scale-90 -->
# Live demo

<div class="tip-box" data-title="Try it yourself!">

[ELIZA Demo](https://contextlab.github.io/llm-course/demos/01-eliza/)

</div>

**Discussion prompts:**
- What does ELIZA do surprisingly well?
- What reveals its limitations?
- Can you "trick" ELIZA? How?
- What kinds of inputs break the illusion?

<div class="warning-box">

Try to have a "real" conversation. At what point does the illusion break down?

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
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">🧠</span>
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

<div class="note-box" data-title="Reflect on your experience">

Have you experienced the ELIZA effect with modern AI systems (ChatGPT, Claude, Siri, Alexa)?

</div>

**Consider:**
- When have you felt like an AI "understood" you?
- What broke the illusion?
- What is the difference between *seeming* intelligent and *being* intelligent?

<div class="warning-box" data-title="The hard question">

How would we know if an AI truly understood us?

</div>

---

<!-- _class: scale-78 -->
# Up next

<div class="note-box" data-title="Lecture 3 (Thursday X-hour)">

**How ELIZA actually works**
- Complete architecture walkthrough
- Pattern matching and response selection
- The role of scripts and keywords
- We will build it ourselves!

</div>

<div class="tip-box" data-title="Prepare for next time">

- Finish reading Weizenbaum (1966)
- Play with the ELIZA demo
- Think about: What would YOU add to ELIZA?

</div>

---

# Key takeaways

1. **String manipulation is foundational:** All text-based AI builds on finding, replacing, and extracting patterns
2. **Regular expressions are powerful:** Flexible pattern matching enables sophisticated text processing
3. **ELIZA demonstrated the power of simplicity:** A few clever rules can create convincing illusions
4. **The ELIZA effect is real:** We naturally anthropomorphize systems that use language
5. **Seeming $\neq$ Being:** Appearing intelligent does not require actual understanding

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

This course will move *very* quickly. **Please** reach out if you have questions, comments, concerns, or just want to chat!

</div>
