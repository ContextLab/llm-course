---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 1: Course introduction
### PSYC 51.07: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Who am I?
<!-- _class: manual-layout -->

<div class="instructor-container">

<div class="instructor-header">
<div class="instructor-header-left">
<h3 style="color: #001c12 !important; margin: 0;">Jeremy R. Manning, Ph.D.</h3>
<p>
Associate Professor | Psychological &amp; Brain Sciences | <img src="../../figures/dartmouth_logo.png" style="height: 1.2em; vertical-align: middle; margin: 0 0.1em;"> | <a href="context-lab.youcanbook.me">Moore 349</a>
</p>
</div>
<div class="instructor-header-right">
<div class="header-link-row">
<img src="../../figures/cdl_logo.png" class="header-icon">
<a href="https://www.context-lab.com" class="header-link"><u>context-lab.com</u></a>
</div>
<div class="header-link-row">
<img src="../../figures/github_logo.png" class="header-icon">
<a href="https://github.com/ContextLab" class="header-link"><u>ContextLab</u></a>
</div>
</div>
</div>

<div class="content-grid">

<div class="col-flex">

<div class="info-box-styled" style="text-align: left !important;">
<h4>Research focus</h4>
<p style="text-align: left !important; display: block; margin: 0;">How do our brains support our ongoing conscious thoughts, and how (and what) do we remember?</p>
</div>

<div class="info-box-styled" style="text-align: left !important;">
<h4>Key areas</h4>
<p style="text-align: left !important; display: block; margin: 0;">Learning and memory, education technology, brain network dynamics, data science, NLP</p>
</div>

<div class="info-box-styled" style="text-align: left !important;">
<h4>Approach</h4>
<p style="text-align: left !important; display: block; margin: 0;">Theory, models, experiments, neuroimaging</p>
</div>

</div>

<div class="col-flex">

<div class="info-box-styled" style="text-align: left !important;">
<h4>Training</h4>
<div class="training-grid">
<div class="training-logo-cell"><img src="../../figures/brandeis_logo.svg" alt="Brandeis" class="training-logo"></div>
<div class="training-text" style="text-align: left !important;">B.S., Neuroscience &amp; Computer Science</div>

<div class="training-logo-cell"><img src="../../figures/upenn_logo.png" alt="Penn" class="training-logo"></div>
<div class="training-text">Ph.D., Neuroscience</div>

<div class="training-logo-cell"><img src="../../figures/princeton_logo.svg" alt="Princeton" class="training-logo"></div>
<div class="training-text">Postdoc, Computer Science &amp; Neuroscience</div>
</div>
</div>

<div class="info-box-styled">
<h4>Funding &amp; collaborators</h4>
<div class="funding-logo-grid">
<img src="../../figures/nih_logo.png" alt="NIH" style="max-height: 45px;">
<img src="../../figures/nsf_logo.png" alt="NSF" style="max-height: 65px;">
<img src="../../figures/darpa_logo.png" alt="DARPA" style="max-height: 30px;">
<img src="../../figures/brainfit_logo.png" alt="BrainFit" style="max-height: 48px;">
</div>
<div class="combined-card-spacer"></div>
<div class="logo-grid">
<img src="../../figures/intel_labs_logo.png" alt="Intel Labs" title="Intel Labs" style="max-height: 28px;">
<img src="../../figures/meta_logo.png" alt="Meta" title="Meta" style="max-height: 22px;">
<img src="../../figures/google_logo.webp" alt="Google" title="Google" style="max-height: 32px;">
<img src="../../figures/amazon_logo.png" alt="Amazon" title="Amazon" style="max-height: 30px;">
</div>
</div>

</div>

</div>

</div>

---

# What is this course about?

<div class="note-box" data-title="Course content">

We will explore how machines can understand and generate human language:
- Building conversational agents from scratch
- Understanding how language relates to thought
- Hands-on programming with real models
- Critical thinking about AI consciousness

</div>

<div class="warning-box" data-title="Course design">

**This course is experiential!** You will learn by doing: coding, experimenting, discussing, and researching.

</div>

---

# Course structure

<style scoped>
.small-boxes ul { font-size: 0.65em !important; }
.small-boxes li { font-size: inherit !important; }
</style>

<div class="small-boxes" style="display: flex; gap: 1.5em; margin-top: 0.5em; width: 100%;">
<div class="note-box" data-title="Grading" style="flex: 1;">

- Bi-weekly short projects (5): 75%
- Final project: 25%
- Can work individually or in groups
- See [syllabus](../../syllabus.pdf) for additional details

</div>
<div class="tip-box" data-title="Tools" style="flex: 1;">

- Google Colaboratory
- HuggingFace
- GitHub / Discord
- GenAI (Claude, ChatGPT, Gemini)

</div>
</div>

---

# The big questions

1. Can machines truly *understand* language?
2. What is the relationship between **language** and **thought**?
3. Can statistical patterns capture **meaning**? How? Under which circumstances?
4. Can AI be conscious? If so, what are the implications?

<div class="note-box">

These are not just "fluff" questions: they are at the heart of cognitive science, philosophy, psychology, and neuroscience!

</div>

---

# Discussion: is ChatGPT conscious?

- What does "conscious" even mean?
- How would we test for consciousness?
- Does it matter if ChatGPT *seems* conscious?

<div class="note-box" data-title="For further consideration">

What are the implications for:

- Ourselves
- Other animals
- Other life forms in general (aliens? synthetic life?)
- Policy, ethics, and society more broadly

</div>

---

# What is consciousness?

<style scoped>
section { font-size: 24px !important; padding: 18px 40px 28px 40px !important; }
section > *:not(h1) { font-size: 24px !important; }
section > h1 { font-size: 1.8em !important; }
section ul, section ol { display: block !important; }
.consciousness-layout { display: flex; gap: 0.8em; margin-top: 0.15em; width: 100%; align-items: flex-start; }
.definitions-col { flex: 1; text-align: left !important; }
.definitions-col ul {
  text-align: left !important;
  margin: 0 !important;
  padding-left: 1.3em !important;
  list-style-type: disc !important;
  list-style-position: outside !important;
  display: block !important;
  font-size: 1em !important;
}
.definitions-col ul li {
  text-align: left !important;
  margin-bottom: 0.5em !important;
  display: list-item !important;
  list-style-type: disc !important;
}
.examples-col { flex: 1.2; }
.c-example {
  background-color: rgba(0, 105, 62, 0.10);
  border-left: 4px solid #00693e;
  border-radius: 4px;
  padding: 0.25em 0.4em;
  margin-bottom: 0.25em;
  text-align: left !important;
}
.c-example::before { display: none !important; content: none !important; }
.c-example .c-title { color: #00693e; font-weight: 600; font-size: 0.82em; display: block; margin-bottom: 0.05em; }
.c-example .c-text { font-size: 0.82em; display: block; }
section > .note-box { font-size: 0.95em !important; padding: 0.25em 0.5em !important; margin-top: 0.25em !important; width: 85% !important; }
</style>

<div class="consciousness-layout">
<div class="definitions-col">
<ul>
<li><strong>Phenomenal:</strong> Subjective experience--the "what it is like" quality of sensations and emotions</li>
<li><strong>Access:</strong> Information available for reasoning, reporting, and guiding voluntary behavior</li>
<li><strong>Self-awareness:</strong> Knowledge of one's own mental states, including recognizing oneself as a distinct entity</li>
</ul>
</div>
<div class="examples-col">
<div class="c-example">
<span class="c-title">Example of phenomenal consciousness</span>
<span class="c-text">The redness of red, pain, taste of coffee</span>
</div>
<div class="c-example">
<span class="c-title">Example of access consciousness</span>
<span class="c-text">Being able to report on and use information to guide behavior</span>
</div>
<div class="c-example">
<span class="c-title">Example of self-awareness</span>
<span class="c-text">Knowing that you are thinking, or recognizing your own emotions</span>
</div>
</div>
</div>

<div class="note-box" data-title="For further consideration">

If ChatGPT says "I feel happy," does it actually *feel* anything?

</div>

---

# The hard problem

<div style="display: flex; gap: 2em;">
<div>

**Humans**
- Share similar biology
- Have our own conscious experiences
- Behave consistently with having experiences (e.g., of being human, living in the world, etc.)

</div>
<div>

**AI**
- Completely different "biology" (silicon vs. neurons)
- No shared evolutionary history
- Can produce human-like behavior without themselves being human

</div>
</div>

<div class="note-box" data-title="Why is it difficult to know if AI is conscious?">

We cannot directly observe consciousness &mdash; even in other humans!

</div>

---

# The Chinese room argument

<div class="note-box" data-title="John Searle (1980)">

- [Thought experiment](https://doi.org/10.1017/S0140525X00005756) about understanding vs. simulation.
- **The setup:** Person in room with Chinese symbols and rule book
- Does following rules = understanding? Searle argues: **No!**

</div>

```flow
[Chinese question:blue] --> [Rule book:orange] --> [Chinese answer:green]
```
<!-- caption: Person follows rules but does not understand Chinese -->

---

# Volition

- Another critical aspect of the human conscious experience is the ability to **decide** (how to act, what to think, etc.)
- Modern LLMs are trained to **respond** to other inputs (i.e., produce statistically likely sequence completions), but they cannot themselves initiate new or unexpected actions

<div class="tip-box" data-title="Think about it!">

LLMs are like a bellows that can only blow air if someone else is pumping it. When not in use, they are static. They can not sense the passage of time. They cease to exist between invocations.

</div>

---

# Current scientific consensus

<div class="warning-box" data-title="Survey says...">

Most cognitive scientists and AI researchers agree: **Current LLMs are not conscious.**

</div>

- No sensory-motor grounding in the world
- No persistent self-model or goals
- Pattern matching $\neq$ understanding

---

# Language and thought

<div class="note-box" data-title="Discussion">

Do you need language to think? Does language *shape* how you think?

</div>

- Possibility 1: Language is necessary for thought
- Possibility 2: Language is just a tool for communication

<span class="emoji emoji-xl">⚖️</span>


---

# The language-thought spectrum

```flow
[Strong Whorfian:green] --> [Weak Whorfian:teal] --> [Moderate:blue] --> [Language-of-Thought:violet]
```
<!-- caption: Language shapes thought (left) to language independent of thought (right) -->

Current evidence points toward the middle: language and thought interact in complex ways, but are not identical.

---

# Evidence: the language network

<div class="note-box" data-title="Further reading">

[**Fedorenko et al. (2024, *Nature*):**](https://www.nature.com/articles/s41586-024-07522-w) The language network as a natural kind

</div>

- The brain has a **specialized language network**
- Distinct (as measured using neuroimaging and lesion studies) from: reasoning, math, social cognition, music
- **Implication:** Language and thought are *separable* in the brain!

---

# Brain networks

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">💬</span>
    <span class="label">Language</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">🤔</span>
    <span class="label">Reasoning</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-orange">🤝</span>
    <span class="label">Social</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-violet">📊</span>
    <span class="label">Math</span>
  </div>
</div>

<div class="tip-box" data-title="Key insight">

Language is a specialized system, *not* the basis of all thought! This has fascinating implications for LLMs: we've built machines that can *interact* using language, but this doesn't necessarily mean they understand it in any recognizable way.

</div>

---

# However, language can *shape* thought

<div class="note-box" data-title="Further reading">

[**Lupyan et al. (2020, *TiCS*):**](https://doi.org/10.1016/j.tics.2020.08.005) *Effects of language on visual perception*

</div>

Having words for things affects how we *see* them:
- Speed up visual search
- Alter color perception
- Influence object categorization

---

# Example: Russian blue

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy"></span>
    <span class="label">English: "blue"</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-blue"></span>
    <span class="label">English: "blue"</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl"> </span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl"> </span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy"></span>
    <span class="label">Russian: "siniy"</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-blue"></span>
    <span class="label">Russian: "goluboy"</span>
  </div>
</div>

<div class="note-box" data-title="Key finding">

English speakers are slower to distinguish shades of blue than Russian speakers: 
language categories affect *perception*, not just description!

</div>

---

# So...what about LLMs?

<div class="note-box" data-title="The grounding problem">

How do symbols (words) get their meaning?

</div>

- For **humans**, the meanings of symbols are learned through *experience*:
  - See, touch, taste objects
  - Act in the world
  - We learn to associate symbols with our experiences
- For **LLMs**, the meanings of symbols are learned through *statistics*:
  - Learn patterns in text
  - Generate text based on those patterns
  - No direct connection with the external world

---

# Our approach (in this course)

<div class="note-box" data-title="Philosophy of this course">

We will build language models *from scratch* to understand **what they can and cannot do**. By learning about the inner workings of LLMs, we can better understand their capabilities and limitations *and our **own** capabilities and limitations*.

</div>

```flow
[ELIZA:green] --> [Classifiers:teal] --> [Embeddings:blue] --> [Attention:orange] --> [GPT:violet]
```
<!-- caption: You'll progress from building simple string manipulation models to modern LLMs. We will make heavy use of GenAI (vibe coding) to enable us to build and iterate quickly. -->

---

# Up next...

<div class="note-box" data-title="Lecture 2 (Wednesday)">

**Pattern matching and ELIZA**
- Introduction to ELIZA
- The ELIZA effect
- String manipulation and regular expressions

</div>
<div class="note-box" data-title="Lecture 3 (Thursday/X-hour)">

**ELIZA implementation**
- Complete architecture
- Assignment 1 details
- Coding together (time permitting)

</div>

---

# Readings for this week

1. [Weizenbaum (1966): ELIZA](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf)
2. [Fedorenko et al. (2024): The language network](https://www.nature.com/articles/s41586-024-07522-w)
3. [Lupyan et al. (2020): Effects of language on visual perception](https://doi.org/10.1016/j.tics.2020.08.005)

<div class="tip-box">

Start with Weizenbaum&mdash; it will help you understand the fundamentals!

</div>

---

# Key ideas from today

1. **Consciousness is complex:** multiple types, hard to define
2. **Language $\neq$ Thought:** but they interact in interesting ways
3. **LLMs are not conscious:** they are sophisticated pattern matchers
4. **Grounding matters:** meaning comes from experience
5. **Building to understand:** we'll build (and play around with) real models to understand what they can and can't do

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
