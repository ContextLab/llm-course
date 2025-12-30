---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication'
footer: 'Week 1 - Day 2'
---

<!-- _class: lead -->

# Lecture 2: Pattern Matching \& ELIZA
## The Fundamentals of Conversational AI 🔧

**PSYC 51.07: Models of Language and Communication**

Week 1 - Day 2

---

# Today's Journey 🗺️

<!-- TODO: Add manual table of contents or navigation -->


---

# Last Time... 🔄



<div class="callout info">
<div class="callout-title">Key Ideas from Lecture 1</div>

- Consciousness is complex and hard to define
- Language and thought are separable but interactive
- Current LLMs are not conscious
- Pattern matching can create illusions of understanding

</div>

<div class="callout info">
<div class="callout-title">Discussion</div>

Today we'll see *how* pattern matching can create these illusions by building our own simple conversational system!

</div>


---

# The Fundamental Challenge 💻


<div class="callout info">
<div class="callout-title">Core Problem</div>

Computers don't "understand" meaning—they manipulate **strings of characters**.

</div>

```
"I am sad" 
    *( -> ['I', ' ', 'a', 'm', ' ', -> Gap!
```

\end{center*

**The question:** How do we bridge this gap?

---

# Everything Starts with Patterns 🎯



**Basic text operations:**
1. **Finding** specific words or phrases
2. **Replacing** parts of text
3. **Extracting** information
4. **Transforming** input to output

<div class="callout warning">
<div class="callout-title">Important Insight</div>

Even sophisticated models like GPT-4 are (at their core) doing *pattern matching*—just at a much more complex level!

</div>

<div class="callout tip">
<div class="callout-title">Think about it!</div>

If you can master simple patterns, you'll understand the foundations of ALL natural language processing!

</div>


---

# Simple String Replacement 🔧


**Example 1: Direct replacement**

```python
user_input = "I am feeling sad"
response = user_input.replace("I am", "Why are you")
print(response)
# Output: "Why are you feeling sad"
```

**What happened here?**
- Found the substring "I am"
- Replaced it with "Why are you"
- Everything else stayed the same

<div class="callout tip">
<div class="callout-title">Think about it!</div>

This seems intelligent! But is it? What are the limitations?

</div>


---

# The Problem with Direct Replacement ❌


**What if the input is slightly different?**

```python
# Works
user_input = "I am sad"
response = user_input.replace("I am", "Why are you")
# "Why are you sad" ✓

# Doesn't work
user_input = "I'm sad"
response = user_input.replace("I am", "Why are you")
# "I'm sad" (unchanged!) ✗

# Doesn't work
user_input = "I am very very sad"
response = user_input.replace("I am", "Why are you")
# "Why are you very very sad"
# (But we only wanted to capture "sad") ✗
```

**Solution:** We need more flexible patterns! → **Regular Expressions**

---

# Introduction to Regular Expressions 🎯


<div class="callout info">
<div class="callout-title">What are Regular Expressions?</div>

A powerful language for describing patterns in text, not just exact matches.

</div>

**Example: Matching with wildcards**

```python
import re

pattern = r"I am (.*)"
match = re.search(pattern, "I am feeling sad")

if match:
    feeling = match.group(1)  # Captures "feeling sad"
    response = f"Why are you {feeling}?"
    print(response)
# Output: "Why are you feeling sad?"
```

**Key: ** The `(.*)` captures *anything* after "I am"!

---

# Regex Syntax Basics 📝



| * | Zero or more of previous | ca*t matches "ct", "cat", "caat" |
| --- | --- | --- |
| + | One or more of previous | ca+t matches "cat", "caat" |
| ? | Zero or one of previous | ca?t matches "ct", "cat" |
| () | Capture group | (cat) captures "cat" |
| | | Or | cat|dog matches "cat" or "dog" |
| [] | Character class | [abc] matches "a", "b", or "c" |
| \^{} | Start of string | \^{cat} matches "cat" at start |
| $ | End of string | cat$ matches "cat" at end |

<div class="callout warning">
<div class="callout-title">Practice Makes Perfect</div>

Regex can be tricky at first, but it's an essential skill for NLP!

</div>


---

# Regex Examples 💡


<div class="columns">
<div class="column">

**Example 1: Email addresses**
```python
[basicstyle=\ttfamily]
pattern = r"\w+@\w+\.\w+"
text = "Email: joe@example.com"
match = re.search(pattern, text)
# Matches: joe@example.com
```

**Example 2: Phone numbers**
```python
[basicstyle=\ttfamily]
pattern = r"--"
text = "Call 555-123-4567"
match = re.search(pattern, text)
# Matches: 555-123-4567
```

</div>
<div class="column">

**Example 3: Multiple captures**
```python
[basicstyle=\ttfamily]
pattern = r"I (.*) my (.*)"
text = "I love my family"
match = re.search(pattern, text)
if match:
    verb = match.group(1)   # "love"
    obj = match.group(2)    # "family"
```

**Example 4: Optional parts**
```python
[basicstyle=\ttfamily]
pattern = r"I'?m? (sad|happy)"
# Matches: "I am sad", "I'm sad",
#          "I am happy", "I'm happy"
```

</div>
</div>

<div class="callout tip">
<div class="callout-title">Think about it!</div>

With these patterns, we can handle much more variation in user input!

</div>


---

# Capturing and Using Patterns 🎯


**The power of capture groups:**

```python
pattern = r"I (.*) my (.*)"
match = re.search(pattern, "I love my family")

if match:
    verb = match.group(1)      # "love"
    object = match.group(2)    # "family"
    response = f"Tell me more about your {object}."
    print(response)
# Output: "Tell me more about your family."
```

<div class="callout tip">
<div class="callout-title">Think about it!</div>

This is remarkably simple, yet it can create the *illusion* of understanding! The bot seems to know what you're talking about!

</div>


---

# Regex State Machine Visualization 🔧



<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

=[fill=blue!20, draw=blue, text=black, minimum size=1cm]

% Pattern: I am (.*)

\node[below=0...
-->

```
[Diagram placeholder - manual conversion required]
```

<div class="callout info">
<div class="callout-title">How It Works</div>

The regex engine steps through the input character by character, tracking which state it's in. When it matches the pattern, it captures the specified groups.

</div>


---

# Pre-Substitutions: Normalizing Input 🔄


<div class="callout info">
<div class="callout-title">Why Pre-Substitutions?</div>

Users type in many different ways. We need to normalize input before pattern matching.

</div>

```python
pre_subs = {
    "dont": "don't",
    "cant": "can't",
    "wont": "won't",
    "im": "I'm",
    "youre": "you're"
}

user_input = "I dont know"
for old, new in pre_subs.items():
    user_input = user_input.replace(old, new)
# Result: "I don't know"
```

**Benefit:** Now our patterns can assume standardized input!

---

# Post-Substitutions: Fixing Grammar 🔄


<div class="callout info">
<div class="callout-title">Why Post-Substitutions?</div>

When we mirror user input, we need to flip pronouns and verb forms.

</div>

```python
post_subs = {
    " i ": " you ",
    " my ": " your ",
    " am ": " are ",
    " was ": " were ",
    " I ": " you "
}

# User said: "I am sad"
# We extracted: "am sad"
# Initial response: "Why are you am sad" (WRONG!)

response = " Why are you am sad "
for old, new in post_subs.items():
    response = response.replace(old, new)
# Result: "Why are you are sad" (BETTER!)
```

**Note:** This is still imperfect, but good enough for ELIZA!

---

# The Substitution Pipeline 🔧



```
User Input ``i dont know' -> Pre-Subs ``I don't know'' -> Pattern Match captures: ` -> Template ``Why don't you. -> Post-Subs ``Why don't you -> Output Display to user
```


---

# ELIZA: A Revolutionary Program 🎭



<div class="columns">
<div class="column">

<div class="callout info">
<div class="callout-title">Weizenbaum (1966)</div>

*ELIZA — A Computer Program For the Study of Natural Language Communication Between Man and Machine*

</div>

**What was ELIZA?**
- First "chatbot" (1964-1966)
- Simulated a Rogerian psychotherapist
- Used pattern matching & string manipulation
- Created by Joseph Weizenbaum at MIT

</div>
<div class="column">

<div class="callout tip">
<div class="callout-title">Think about it!</div>

ELIZA was meant to *demonstrate* the superficiality of human-computer interaction.

Instead, people became emotionally attached to it!

</div>

</div>
</div>


---

# Why a Rogerian Therapist? 🧠



<div class="callout info">
<div class="callout-title">Carl Rogers' Approach</div>

Rogerian therapy is *non-directive*—the therapist mainly reflects what the patient says back to them.

</div>

**Perfect for a chatbot because:**
- ✅ Doesn't require understanding the problem
- ✅ Can use simple reflection ("Tell me more about X")
- ✅ Asks open-ended questions
- ✅ Minimal need for world knowledge
- ✅ Pattern matching is sufficient!

<div class="callout info">
<div class="callout-title">Discussion</div>

**Patient:** I'm sad about my mother.\\
**Therapist:** Tell me more about your mother.\\
**Pattern:** `I am (.*) about my (.*)`\\
**Response:** `Tell me more about your {2\`.}

</div>


---

# How ELIZA Works: High Level 🔧



```
User Input -> Pre-Subs -> Pattern Match -> Decompose -> Reassemble -> Post-Subs -> Output -> Normalize contractions
```

<div class="callout warning">
<div class="callout-title">No Understanding Required!</div>

ELIZA had **zero** understanding. It's pure pattern transformation!

</div>


---

# Pattern Priority and Ranking 🎯



<div class="callout info">
<div class="callout-title">Multiple Pattern Problem</div>

What if more than one pattern matches the input?

</div>

**Example input:** "I am sad about my mother"

**Multiple matches:**
- Pattern 1: `I am (.*)` - Very general
- Pattern 2: `(.*) mother (.*)` - Specific keyword
- Pattern 3: `I am (.*) about (.*)` - More specific

**ELIZA's solution:**
1. Each pattern has a **rank** (priority score)
2. Keywords like "mother", "father", "family" get higher ranks
3. More specific patterns generally rank higher
4. Choose the highest-ranking pattern that matches


---

# ELIZA Pattern Structure 📋


**A typical ELIZA rule:**

```python, basicstyle=\ttfamily
{
    "pattern": r"(.*) my (mother|father|family) (.*)",
    "rank": 100,  # High priority for family keywords
    "responses": [
        "Tell me more about your {2}.",
        "How do you feel about your {2}?",
        "What role does your {2} play in this?",
        "Does your {2} influence how you feel?"
    ]
}
```

**How it works:**
1. `pattern`: Regex to match input
2. `rank`: Priority level (higher = more important)
3. `responses`: List of possible response templates
4. `{2\`}: Placeholder for captured group 2


---

# Example ELIZA Conversation 💬


<div class="callout info">
<div class="callout-title">Sample Interaction</div>

**ELIZA:** Welcome. What brings you here today?

**User:** I am feeling sad.

**ELIZA:** Why do you feel sad?

**User:** I can't stop thinking about my family.

**ELIZA:** Tell me more about your family.

**User:** My mother never understood me.

**ELIZA:** Who else in your family never understood you?

**User:** I have to go now.

**ELIZA:** That will be $200. See you again next week.

</div>


---

# Breaking Down the Conversation 🔍


**Let's analyze what happened:**

1. **User:** "I am feeling sad"
    - Pattern: `I am (.*)`
- Captures: "feeling sad"
- Response template: "Why do you {1}?"

    

2. **User:** "I can't stop thinking about my family"
    - Pattern: `(.*) my family (.*)`
- Higher rank due to keyword "family"
- Response: "Tell me more about your family."

    

3. **User:** "My mother never understood me"
    - Pattern: `my (mother|father) (.*) me`
- Response: "Who else in your family {2} you?"
- Post-sub: "me" stays "you"


---

# Why Does This Work? 🤔



<div class="callout info">
<div class="callout-title">The Psychology Behind ELIZA</div>

Humans are pattern-seeking creatures who project understanding onto machines.

</div>

**Factors that create the illusion:**
1. **Context**: We assume the bot understands context
2. **Expectations**: We expect intelligence from human-like responses
3. **Language structure**: Natural language has inherent patterns
4. **Confirmation bias**: We remember hits, forget misses
5. **Anthropomorphization**: We attribute human qualities to machines

<div class="callout tip">
<div class="callout-title">Think about it!</div>

The "intelligence" is often in the *interpreter* (you!), not the program!

</div>


---

# When Pattern Matching Fails 💥


<div class="callout info">
<div class="callout-title">Example Failure Cases</div>

**User:** My mother and father are fighting.\\
**ELIZA:** Tell me more about your father. *(Only caught "father")*

**User:** I saw a mother duck with her babies.\\
**ELIZA:** Tell me more about your mother. *(Wrong context!)*

**User:** Why do you keep asking about my family?\\
**ELIZA:** Tell me more about your family. *(Recursive failure)*

</div>

<div class="callout warning">
<div class="callout-title">Important Lesson</div>

Pattern matching works surprisingly well, but it fundamentally lacks understanding. It can't handle context, sarcasm, or complex reasoning.

</div>


---

# Comparison: ELIZA vs Modern LLMs 📊



<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

% Create comparison table

% Rows

...
-->

```
[Diagram placeholder - manual conversion required]
```

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Both lack consciousness, but GPT-4 is vastly more sophisticated. Does this difference in degree create a difference in kind?

</div>


---

# What You've Learned Today 🎓


1. **String manipulation**: Basic text transformations
2. **Regular expressions**: Flexible pattern matching
3. **Capture groups**: Extracting information from patterns
4. **Pre/post substitutions**: Normalizing input and output
5. **ELIZA architecture**: How a simple chatbot works
6. **Pattern ranking**: Choosing between multiple matches
7. **Limitations**: Where pattern matching breaks down

<div class="callout warning">
<div class="callout-title">The Foundation</div>

These simple techniques form the foundation for all NLP systems, even modern ones!

</div>


---

# Next Lecture: Deep Dive into ELIZA 🔮



<div class="callout info">
<div class="callout-title">Lecture 3: ELIZA Implementation & The ELIZA Effect</div>

We'll cover:
- Complete implementation details
- Synonym substitutions
- Memory and context (primitive state)
- The ELIZA Effect and its implications
- Weizenbaum's warnings
- Assignment 1: Building your own ELIZA

</div>

**To prepare:**
- Read Weizenbaum (1966) - Focus on Section 3
- Practice regex with online tools (regex101.com)
- Think about conversation patterns


---

# Practice Exercises 💪



<div class="callout info">
<div class="callout-title">Try These Before Next Class</div>

1. Write a regex to match: "I think about X" where X can be anything
2. Create pre-substitutions for: "gonna", "wanna", "gotta"
3. Design a response template for: "I hate my X"
4. Think of 3 patterns a therapist might use
5. Find cases where simple pattern matching would fail

</div>

<div class="callout warning">
<div class="callout-title">Hint</div>

Try your patterns on [regex101.com](https://regex101.com) - it has excellent visualization and explanations!

</div>


---

# Key Takeaways 🔑



1. Pattern matching can create **convincing illusions** of understanding
2. Regular expressions are **essential tools** for NLP
3. ELIZA was **revolutionary** despite being simple
4. The **gap between behavior and understanding** is crucial
5. Even modern AI fundamentally relies on **pattern matching**
6. Understanding the basics helps you **think critically** about AI

<div class="callout info">
<div class="callout-title">Discussion</div>

After today, when you interact with ChatGPT or other AI, can you spot the "ELIZA moments"—where it's clearly pattern matching without understanding?

</div>


---

# Questions? 🤔



Let's discuss!

**Contact Information:**

📧 jeremy@dartmouth.edu

💬 Discord: [https://discord.gg/sftEk9Ygdw](https://discord.gg/sftEk9Ygdw)

🏢 Office Hours: By appointment (Moore Hall 349)

See you next class! 🚀

