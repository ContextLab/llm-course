---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 3: ELIZA implementation
### PSYC 51.07: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Today's agenda

<div class="note-box" data-title="What we'll cover">

1. **Demo:** See ELIZA in action
2. **Algorithm:** How ELIZA actually works
3. **Code:** Key implementation patterns
4. **Vibe coding:** Tools and best practices
5. **Assignment 1:** Getting started

</div>

<div class="tip-box" data-title="Goal">

Leave today knowing *exactly* how to build your own ELIZA.

</div>

---

# Let's try ELIZA

<div class="note-box" data-title="Interactive demo">

[ELIZA Demo](https://contextlab.github.io/llm-course/demos/01-eliza/)

</div>

**Try these inputs:**
- "I am feeling sad"
- "My mother never understood me"
- "I think you are just a computer"

<div class="tip-box" data-title="Exercise">

Before I reveal how it works: can you guess what rules are being used?

</div>

---

# The ELIZA algorithm

```flow
[User input:blue] --> [Pre-subs:teal] --> [Pattern match:green] --> [Decompose:orange] --> [Reassemble:violet] --> [Post-subs:pink] --> [Response:blue]
```
<!-- caption: The complete ELIZA processing pipeline -->

<div class="note-box" data-title="Key insight">

Each step is simple string manipulation. No "understanding" required!

</div>

---

# Step 1: Pre-substitutions

Normalize input before pattern matching.

```python
pre_subs = {
    "dont": "don't",
    "cant": "can't",
    "im": "I'm",
    "youre": "you're",
    "recollect": "remember"
}

def apply_pre_subs(text, subs):
    for old, new in subs.items():
        text = text.replace(old, new)
    return text
```

<div class="note-box" data-title="Why pre-substitutions?">

Users type in many ways. Normalize first, then match patterns.

</div>

---

# Step 2: Pattern matching

Find the best matching rule for the input.

```python
rules = [
    {"pattern": r"(.*) my (mother|father|family) (.*)",
     "rank": 100},
    {"pattern": r"I am (.*)",
     "rank": 50},
    {"pattern": r"(.*)",
     "rank": 0}  # Fallback
]
```

<div class="warning-box" data-title="Priority matters">

Higher rank = higher priority. Check specific patterns before general ones.

</div>

---

# Step 3: Decomposition

Capture groups extract the important parts.

```python
import re

pattern = r"I am (.*)"
text = "I am feeling sad"

match = re.search(pattern, text)
if match:
    captured = match.group(1)  # "feeling sad"
```

<div class="note-box" data-title="Regular expressions">

The `(.*)` captures "anything" into a group we can use later.

</div>

---

# Step 4: Reassembly

Insert captured content into response templates.

```python
templates = [
    "Why are you {1}?",
    "How long have you been {1}?",
    "What made you {1}?"
]

# "feeling sad" -> "Why are you feeling sad?"
response = random.choice(templates).format(captured)
```

<div class="tip-box" data-title="Variety">

Multiple templates prevent repetitive responses.

</div>

---

# Step 5: Post-substitutions

Flip pronouns for grammatical responses.

```python
post_subs = {
    " i ": " you ",
    " my ": " your ",
    " am ": " are ",
    " me ": " you ",
    " I ": " you "
}

# "Tell me about your mother"
# -> "Tell you about your mother" (fixed pronouns)
```

<div class="warning-box" data-title="Tricky">

Order and spacing matter. Be careful with word boundaries.

</div>

---

# Putting it together

```python
def eliza_respond(user_input):
    # 1. Normalize input
    text = apply_pre_subs(user_input, pre_subs)

    # 2. Find matching rule (highest rank first)
    rule = find_best_match(text, rules)

    # 3. Decompose: extract captured groups
    groups = decompose(text, rule["pattern"])

    # 4. Reassemble: build response
    response = reassemble(groups, rule["templates"])

    # 5. Fix pronouns
    return apply_post_subs(response, post_subs)
```

---

# Vibe coding: AI-assisted development

<style scoped>
.small-boxes ul { font-size: 0.65em !important; }
.small-boxes li { font-size: inherit !important; }
</style>

<div class="small-boxes" style="display: flex; gap: 1.5em; margin-top: 0.5em; width: 100%;">
<div class="note-box" data-title="Dartmouth AI Tools" style="flex: 1;">

- [ai-tools.dartmouth.edu](https://ai-tools.dartmouth.edu/)
- Free access to Claude, GPT-4, Gemini
- Dartmouth login required

</div>
<div class="tip-box" data-title="Other options" style="flex: 1;">

- [ChatGPT](https://chat.openai.com)
- [Claude](https://claude.ai)
- [Gemini](https://gemini.google.com)
- GitHub Copilot

</div>
</div>

---

# Recommended IDEs

<div class="note-box" data-title="For this course">

**Google Colaboratory** (recommended)
- Free, runs in browser
- Easy to share notebooks
- GPU access when needed

</div>

<div class="tip-box" data-title="For advanced users">

- VS Code with Copilot extension
- [Cursor](https://cursor.sh/) - AI-first editor
- [Antigravity](https://antigravity.dev/) - Python-focused

</div>

---

# Effective prompting

<div class="note-box" data-title="Start with a plan">

Before coding, describe what you want to build. Be specific about inputs, outputs, and behavior.

</div>

<div class="tip-box" data-title="Good prompt example">

"I'm building an ELIZA chatbot in Python. I need a function that takes a user input string, applies pre-substitutions from a dictionary, then matches against a list of regex patterns sorted by rank. Show me how to structure this."

</div>

---

# Prompting best practices

1. **Be specific** about what you want
2. **Provide context** about your project
3. **Show examples** of input/output
4. **Iterate** on the response
5. **Test incrementally** as you build

<div class="warning-box" data-title="Important">

Don't expect perfect code on the first try. Refine your prompts based on what you get.

</div>

---

# Testing strategies

<div class="note-box" data-title="Test incrementally">

1. Test pre-substitutions alone
2. Test pattern matching alone
3. Test full pipeline with simple inputs
4. Test edge cases

</div>

**Edge cases to consider:**
- Empty input
- Very long input
- Special characters (!@#$%)
- No pattern matches
- Multiple patterns could match

---

# Debugging tips

<div class="tip-box" data-title="Use print statements">

```python
def find_match(text, rules):
    for rule in rules:
        match = re.search(rule["pattern"], text)
        if match:
            print(f"Matched: {rule['pattern']}")
            print(f"Groups: {match.groups()}")
            return rule, match
    print("No match found!")
    return None, None
```

</div>

Print what patterns match and why. Remove prints when done.

---

# Assignment 1 overview

<div class="note-box" data-title="What you'll build">

A complete ELIZA implementation that:
- Reads rules from `instructions.txt`
- Handles pre/post substitutions
- Matches patterns and generates responses
- Maintains a conversation loop

</div>

<div class="warning-box" data-title="Due date">

**Friday, January 16** (end of Week 2)

</div>

---

# Assignment structure
<!-- _class: scale-70 -->

| Part | Weight | Description |
|------|--------|-------------|
| Implementation | 40% | Working ELIZA chatbot |
| Conversations | 20% | 5+ diverse test scenarios |
| Analysis | 25% | ELIZA effect, pattern analysis |
| Reflection | 10% | 500-1000 word essay |
| Presentation | 5% | Clean, organized notebook |

<div class="tip-box" data-title="Submission">

Submit as a Google Colaboratory notebook. Make sure it runs without errors!

</div>

---

# Getting started

<div class="note-box" data-title="Step 1: Read Weizenbaum">

[ELIZA paper (1966)](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf)

Focus on Section 3 for implementation details.

</div>

<div class="tip-box" data-title="Step 2: Try online ELIZA">

[masswerk.at/elizabot](http://www.masswerk.at/elizabot/)

See what responses you should expect.

</div>

<div class="note-box" data-title="Step 3: Practice regex">

[regex101.com](https://regex101.com)

Excellent visualization and testing tool.

</div>

---

# Common pitfalls

<div class="warning-box" data-title="Watch out for">

- **Pattern priority:** Higher rank numbers = higher priority
- **Substitution order:** Pre-subs before matching, post-subs after
- **Case sensitivity:** Normalize case for matching
- **Word boundaries:** Use spaces to avoid partial matches
- **Greedy matching:** `(.*)` vs `(.*?)`

</div>

<div class="tip-box" data-title="Verify your work">

Test with the same inputs as online ELIZA to verify your output.

</div>

---

# Suggested timeline
<!-- _class: scale-70 -->

| Days | Focus |
|------|-------|
| 1-2 | Core implementation (pattern matching, substitutions) |
| 3-4 | Conversation testing and analysis |
| 5-6 | Modern chatbot comparison, write reflection |
| 7 | Polish notebook, final testing |

<div class="note-box" data-title="Pro tip">

Start early! Pattern matching can be tricky to debug.

</div>

---

# Key takeaways

1. **ELIZA is simple:** Just string manipulation and pattern matching
2. **Pre/post subs:** Normalize input, fix output pronouns
3. **Pattern priority:** Check specific patterns before general ones
4. **Vibe coding:** Use AI tools to accelerate development
5. **Test incrementally:** Build and test piece by piece

<div class="note-box" data-title="Remember">

The magic isn't in the algorithm. It's in how humans interpret the output!

</div>

---

# Questions? Want to chat more?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy"><span class="emoji">&#x1F4E7;</span></span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a> me</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple"><span class="emoji">&#x1F4AC;</span></span>
    <span class="label">Join our <a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green"><span class="emoji">&#x1F481;</span></span>
    <span class="label">Come to <a href="https://context-lab.youcanbook.me">office hours</a></span>
  </div>
</div>

<div class="tip-box" data-title="Get help">

Start Assignment 1 early. Come to office hours if you get stuck!

</div>
