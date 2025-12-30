---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication'
footer: 'Week 1 - Day 3'
---

<!-- _class: lead -->

# Lecture 3: ELIZA Implementation
## The ELIZA Effect \& Your First Assignment 🎭

**PSYC 51.07: Models of Language and Communication**

Week 1 - Day 3

---

# Today's Journey 🗺️

<!-- TODO: Add manual table of contents or navigation -->


---

# Last Time... 🔄



<div class="callout info">
<div class="callout-title">Key Concepts from Lecture 2</div>

- String manipulation and replacement
- Regular expressions for flexible patterns
- Capture groups for extracting information
- Pre and post substitutions
- ELIZA's basic architecture

</div>

<div class="callout info">
<div class="callout-title">Discussion</div>

Today we'll complete the ELIZA implementation and explore its psychological impact!

</div>


---

# ELIZA Algorithm: Complete Version 🔧


```python
[basicstyle=\ttfamily]
def eliza_respond(user_input, rules):
    # 1. Pre-substitutions (normalize input)
    for old, new in PRE_SUBS.items():
        user_input = user_input.replace(old, new)

    # 2. Find all matching patterns
    matches = []
    for rule in rules:
        match = re.search(rule['pattern'], user_input)
        if match:
            matches.append((rule, match))

    # 3. Choose highest-ranked match
    if matches:
        best_rule, best_match = max(matches, key=lambda x: x[0]['rank'])

        # 4. Decompose - extract captured groups
        captured = best_match.groups()

        # 5. Reassemble - fill template with captures
        response = random.choice(best_rule['responses'])
        for i, group in enumerate(captured):
            response = response.replace(f'{{{i+1}}}', group)

        # 6. Post-substitutions (fix grammar)
        for old, new in POST_SUBS.items():
            response = response.replace(old, new)

        return response
    else:
        return random.choice(DEFAULT_RESPONSES)
```


---

# Synonym Substitutions 📝


<div class="callout info">
<div class="callout-title">The Problem</div>

Users express the same idea in different ways:
- "I am sad" vs "I am unhappy" vs "I am depressed"
- "My family" vs "My relatives" vs "My kin"

</div>

**ELIZA's solution: Synonym sets**

```python
SYNONYMS = {
    "family": ["family", "relatives", "kin", "folks"],
    "sad": ["sad", "unhappy", "depressed", "down", "blue"],
    "happy": ["happy", "glad", "joyful", "pleased", "content"],
    "remember": ["remember", "recall", "recollect"],
    "mother": ["mother", "mom", "mama", "mum"],
    "father": ["father", "dad", "papa", "pop"]
}
```

**Pattern:** `I am (sad|unhappy|depressed|down|blue)`

---

# Building Patterns from Synonyms 🔨


```python
def build_pattern(template, synonyms):
    """Convert template with synonym placeholders to regex"""
    for key, values in synonyms.items():
        placeholder = f"@{key}"
        if placeholder in template:
            options = "|".join(values)
            template = template.replace(placeholder, f"({options})")
    return template

# Example usage:
template = r"I am @sad"
pattern = build_pattern(template, SYNONYMS)
# Result: r"I am (sad|unhappy|depressed|down|blue)"

# Now can match ANY variant!
re.search(pattern, "I am depressed")  # ✓ Matches
re.search(pattern, "I am blue")       # ✓ Matches
re.search(pattern, "I am sad")        # ✓ Matches
```

<div class="callout tip">
<div class="callout-title">Think about it!</div>

This makes ELIZA much more flexible without writing hundreds of separate patterns!

</div>


---

# Memory and Context 🧠


<div class="callout info">
<div class="callout-title">Primitive State in ELIZA</div>

ELIZA can "remember" certain topics and bring them up later.

</div>

```python
class ElizaBot:
    def __init__(self):
        self.memory = []  # Store remembered topics

    def save_to_memory(self, topic):
        """Save a topic for later"""
        self.memory.append(topic)

    def recall_memory(self):
        """Retrieve a saved topic when needed"""
        if self.memory:
            topic = random.choice(self.memory)
            return f"Earlier you mentioned {topic}. Let's discuss that."
        return None

# Usage in a rule:
{
    "pattern": r"(.*) my (mother|father) (.*)",
    "rank": 100,
    "responses": [...],
    "save_to_memory": "{2}"  # Save "mother" or "father"
}
```


---

# Memory in Action 💡


<div class="callout info">
<div class="callout-title">Example Conversation with Memory</div>

**User:** I don't get along with my mother.\\
**ELIZA:** Tell me more about your mother. *[Saves "mother" to memory]*

**User:** I like playing tennis.\\
**ELIZA:** That's interesting.

**User:** I don't know what to talk about.\\
**ELIZA:** Earlier you mentioned your mother. Let's discuss that.

</div>

<div class="callout tip">
<div class="callout-title">Think about it!</div>

This simple memory creates the illusion of ELIZA "thinking about" what you said earlier! But it's just storing and randomly retrieving strings.

</div>


---

# Complete ELIZA Flow with Memory 🔄



```
User Input -> Pre-Subs -> Pattern Match -> Select Best -> Decompose -> Save to Memory? -> Reassemble -> Post-Subs
```


---

# Default Responses 🎲


<div class="callout info">
<div class="callout-title">When No Pattern Matches</div>

ELIZA needs fallback responses when it can't find a matching pattern.

</div>

```python
DEFAULT_RESPONSES = [
    "I see.",
    "Tell me more.",
    "How does that make you feel?",
    "Why do you say that?",
    "Can you elaborate on that?",
    "What does that suggest to you?",
    "I'm not sure I understand. Can you rephrase?",
    "Interesting. Please continue.",
    "Go on..."
]

# Usage:
if no_pattern_matched:
    response = random.choice(DEFAULT_RESPONSES)
```

<div class="callout warning">
<div class="callout-title">Clever Design</div>

These generic responses sound thoughtful but require zero understanding! They keep the conversation flowing.

</div>


---

# Quit Detection 🚪


<div class="callout info">
<div class="callout-title">Ending the Conversation</div>

ELIZA needs to recognize when the user wants to quit.

</div>

```python
QUIT_PATTERNS = [
    r"^quit$",
    r"^exit$",
    r"^bye$",
    r"^goodbye$",
    r"I have to go",
    r"I need to leave"
]

def should_quit(user_input):
    """Check if user wants to end conversation"""
    user_input = user_input.lower().strip()
    for pattern in QUIT_PATTERNS:
        if re.search(pattern, user_input):
            return True
    return False

# Quit responses
QUIT_RESPONSES = [
    "Goodbye. It was nice talking to you.",
    "That will be $200. See you next week!",
    "Take care!"
]
```


---

# Main Conversation Loop 🔁


```python
[basicstyle=\ttfamily]
def main():
    """Main ELIZA conversation loop"""
    bot = ElizaBot()

    # Greeting
    print("ELIZA: Hello. I am ELIZA. What brings you here today?")
    print("(Type 'quit' to exit)\n")

    while True:
        # Get user input
        user_input = input("You: ").strip()

        # Check for quit
        if should_quit(user_input):
            print(f"ELIZA: {random.choice(QUIT_RESPONSES)}")
            break

        # Generate response
        response = bot.respond(user_input)
        print(f"ELIZA: {response}\n")

        # Occasionally recall memory (10% chance)
        if random.random() < 0.1:
            memory_response = bot.recall_memory()
            if memory_response:
                print(f"ELIZA: {memory_response}\n")

if __name__ == "__main__":
    main()
```


---

# The ELIZA Effect 😮



<div class="callout info">
<div class="callout-title">Definition: ELIZA Effect</div>

The tendency of humans to attribute human-like understanding to computer programs, even when they know the program is simple.

</div>

**What happened with ELIZA:**
- People formed **emotional bonds** with ELIZA
- Users shared **intimate details** of their lives
- Some **refused to believe** it was "just" a program
- Weizenbaum's secretary asked him to **leave the room** so she could talk to ELIZA privately!
- Some therapists thought ELIZA could **replace human therapists**

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Why are we so eager to see intelligence and understanding in machines?

</div>


---

# Why the ELIZA Effect Happens 🧠



<!-- Venn diagram - manual conversion required -->


---

# Weizenbaum's Reaction 😨



<div class="callout warning">
<div class="callout-title">A Shocking Discovery</div>

Joseph Weizenbaum was **horrified** by people's reactions to ELIZA.

</div>

**His initial goal:**
- Demonstrate the *superficiality* of human-computer interaction
- Show that simulation $≠$ understanding
- Critique overreliance on computers

**What actually happened:**
- People treated ELIZA as if it understood them
- Some therapists wanted to use it with real patients
- His secretary became emotionally attached to it
- The opposite of what he intended!

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Weizenbaum spent the rest of his career warning about the dangers of AI!

</div>


---

# Weizenbaum's Warning ⚠️



<div class="callout info">
<div class="callout-title">From "Computer Power and Human Reason" (1976)</div>

*"The computer programmer is a creator of universes for which he alone is responsible. Universes of virtually unlimited complexity can be created in the form of computer programs."*

</div>

**His concerns:**
1. People mistake **simulation for understanding**
2. Risk of replacing **human relationships** with machines
3. Danger of trusting AI with decisions **it doesn't understand**
4. Questions about **what makes us human**
5. Ethical implications of **deception** (even unintentional)

<div class="callout info">
<div class="callout-title">Discussion</div>

Are these concerns still relevant today with ChatGPT, Claude, and other modern LLMs? What has changed? What hasn't?

</div>


---

# The ELIZA Effect Today 📱



<div class="callout info">
<div class="callout-title">Modern Examples</div>

The ELIZA effect is alive and well:

</div>

- 💬 People form bonds with **Replika** (AI companion app)
- 🤖 Users anthropomorphize **ChatGPT** and **Claude**
- 📞 Customers get frustrated with **chatbots** for "not understanding"
- 💔 Some people prefer AI therapists to human ones
- 🎮 Players form attachments to **NPCs** in games
- 🏠 People thank **Alexa** and **Siri**

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Have you ever caught yourself treating an AI as if it understands you? Why did you do it? How did it feel?

</div>


---

# Simulation vs. Understanding 🎭



<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

% Two boxes

\node[draw, thick, fill=green!20, minimum width=3.5cm, minimum height=2.5cm, align=center] at (6,0) {
    **Understanding**\\[0.3cm]
    Actually\\comprehends\\[0.2cm]
    Mental models\\Meaning\\Reasoning\\[0.2cm]
    ...
-->

```
[Diagram placeholder - manual conversion required]
```

<div class="callout info">
<div class="callout-title">Discussion</div>

Is there a clear line between simulation and understanding? Or is it a spectrum?

</div>


---

# The Evolution of Chatbots 📈



```
**1966 -> ELIZA Pattern matching -> \textbf{1995 -> A.L.I.C.E. AIML -> \textbf{2001 -> SmarterChild Early IM bot
```

\end{center**

<div class="callout info">
<div class="callout-title">Key Point</div>

We've moved from hand-crafted rules to learned patterns, but the fundamental idea remains: **pattern matching at scale**.

</div>


---

# ELIZA vs Modern LLMs: Comparison 📊



<div class="columns">
<div class="column">

**ELIZA (1966):**
- ✍️ Hand-written rules
- 🔢 $\sim$200 patterns
- 🎯 Domain-specific (therapy)
- 💾 Tiny memory footprint
- ⚡ Instant responses
- 🎲 Random template selection
- ❌ No learning
- ❌ No context beyond memory
- ❌ Easily fooled

</div>
<div class="column">

**GPT-4 (2023):**
- 🤖 Learned from data
- 🔢 1.7+ trillion parameters
- 🌍 General purpose
- 💾 Massive model
- ⏱️ Slower responses
- 🧮 Statistical prediction
- ✅ Continuous learning (training)
- ✅ Long context windows
- ❓ Harder to fool, but possible

</div>
</div>

<div class="callout tip">
<div class="callout-title">Think about it!</div>

GPT-4 is incomparably more sophisticated, but does it truly "understand" or is it just better pattern matching?

</div>


---

# What ELIZA Teaches Us 🎓



<div class="callout info">
<div class="callout-title">Lessons from a 60-Year-Old Program</div>

ELIZA remains relevant because it reveals fundamental truths:

</div>

1. **Behavior $≠$ Understanding**: Looking intelligent is not the same as being intelligent
2. **Human Psychology**: We *want* to believe machines understand us
3. **Simplicity is powerful**: You don't need complexity to create illusions
4. **Context matters**: Without it, even good patterns fail
5. **Ethics are crucial**: Deception (even unintentional) has consequences
6. **Building reveals truth**: Making something yourself shows its limitations

<div class="callout warning">
<div class="callout-title">Why We Study ELIZA</div>

By building ELIZA, you'll understand what AI *really* is—and what it isn't!

</div>


---

# Assignment 1: Build ELIZA 🛠️



<div class="callout warning">
<div class="callout-title">Your First Assignment</div>

You will implement your own version of the ELIZA chatbot!

</div>

**What you'll do:**
1. Read rules from a configuration file
2. Implement pre-substitutions
3. Handle synonym substitutions
4. Implement pattern matching with regex
5. Implement decomposition and reassembly
6. Apply post-substitutions
7. Create a conversation loop
8. (Optional) Add memory functionality

<div class="callout tip">
<div class="callout-title">Think about it!</div>

This will be challenging but incredibly rewarding! You'll truly understand how chatbots work.

</div>


---

# Assignment Structure 📋



<div class="columns">
<div class="column">

**Technical requirements:**
- Python implementation
- Use provided `instructions.txt`
- Pattern matching with regex
- Proper text substitutions
- Conversation loop
- Greeting & goodbye messages
- At least 20 patterns
- Handle edge cases

</div>
<div class="column">

**Deliverable:**
- Single Jupyter notebook
- Runnable in Google Colab
- Markdown explanations
- Example conversations
- Well-documented code
- Reflection section
- Discussion of limitations

</div>
</div>

<div class="callout info">
<div class="callout-title">Due Date</div>

Check Canvas for the exact due date! Usually 2 weeks from today.

</div>


---

# The Configuration File Format 📄


**Example `instructions.txt** structure:`

```python
[basicstyle=\ttfamily]
# Pre-substitutions
PRE_SUB: dont -> don't
PRE_SUB: cant -> can't
PRE_SUB: wont -> won't

# Synonyms
SYNONYM: family -> family, relatives, kin, folks
SYNONYM: sad -> sad, unhappy, depressed, down, blue

# Patterns (rank, pattern, responses)
PATTERN: 100, (.*) @family (.*), Tell me more about your family.|How do you feel about your family?|What role does your family play in this?

PATTERN: 80, I am @sad, Why are you {1}?|How long have you been {1}?|What makes you {1}?

PATTERN: 50, I (.*) my (.*), Tell me more about your {2}.|How does your {2} make you feel?

PATTERN: 10, (.*), Tell me more.|I see.|How does that make you feel?

# Post-substitutions
POST_SUB:  i  ->  you
POST_SUB:  my  ->  your
POST_SUB:  am  ->  are
```


---

# Grading Rubric ✅



| Synonym substitutions | 10 |
| --- | --- |
| Pattern matching (regex) | 20 |
| Capture and reassembly | 15 |
| Post-substitutions | 10 |
| Conversation loop | 10 |
| Code quality \ | documentation | 10 |
| Example conversations | 5 |
| Reflection \ | analysis | 10 |

**Bonus (up to +10):**
- Memory implementation (+5)
- Particularly creative patterns (+5)


---

# Tips for Success 💡


1. **Start early!** Pattern matching can be tricky
2. **Test incrementally**: Build one piece at a time
3. **Use print statements**: Debug by seeing what patterns match
4. **Read Weizenbaum (1966)**: Understand the original design
5. **Test with edge cases**: What if input is empty? Very long?
6. **Experiment**: Try having conversations with your bot
7. **Use regex testers**: [regex101.com](https://regex101.com) is your friend!
8. **Collaborate**: Discuss ideas with classmates (but write your own code!)
9. **Ask questions**: Use Discord and office hours
10. **Have fun!**: This should be enjoyable!


---

# Common Pitfalls to Avoid ⚠️



<div class="callout warning">
<div class="callout-title">Watch Out For:</div>

- **Escaping special regex characters**: Use `r"..."` for raw strings
- **Substitution order**: Pre-subs before matching, post-subs after
- **Greedy vs. non-greedy matching**: `(.*)` vs `(.*?)`
- **Case sensitivity**: Convert to lowercase or use `(?i)` flag
- **Spaces in substitutions**: Use `" word "` to avoid partial matches
- **Empty input**: Handle edge cases gracefully
- **Infinite loops**: Make sure your quit condition works!
- **Overly specific patterns**: They'll never match real input

</div>

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Testing is your friend! Try lots of different inputs to find bugs.

</div>


---

# Example: Testing Your Implementation 🧪


```python
[basicstyle=\ttfamily]
# Good test cases to try:
test_inputs = [
    "I am sad",                    # Basic pattern
    "I'm depressed",               # Synonym + contraction
    "i dont like my mother",       # Pre-sub, post-sub, keyword
    "MY FATHER NEVER UNDERSTOOD ME", # Case sensitivity
    "I love my family",            # Synonym
    "",                            # Empty input
    "xyz123!@#",                   # Nonsense
    "Why do you keep asking about my family?", # Meta
    "I need to go",                # Quit pattern
]

# Test each one
for user_input in test_inputs:
    response = bot.respond(user_input)
    print(f"User: {user_input}")
    print(f"ELIZA: {response}")
    print()

# Check:
# - Does each match the expected pattern?
# - Are substitutions working?
# - Do responses make sense?
# - Any crashes or errors?
```


---

# Reflection Questions 💭



**Include in your notebook:**

1. What was the most challenging part of the implementation?
2. What surprised you about how ELIZA works?
3. Did you experience the "ELIZA effect" when testing your bot?
4. What are the main limitations you noticed?
5. How would you improve ELIZA if you had more time?
6. What did this teach you about modern AI systems?
7. Do you think ELIZA "understands" anything? Why or why not?

<div class="callout tip">
<div class="callout-title">Think about it!</div>

The reflection is as important as the code! It shows your critical thinking about AI.

</div>


---

# Extension Ideas (Optional) 🌟


**If you want to go further:**

- 🧠 **Smarter memory**: Track topics and their sentiment
- 🎭 **Multiple personas**: Different rule sets for different "personalities"
- 📊 **Conversation analysis**: Track which patterns are used most
- 🎨 **GUI interface**: Build a web interface with Gradio or Streamlit
- 🗣️ **Voice interaction**: Add speech-to-text and text-to-speech
- 🌐 **Multi-language**: Patterns for another language
- 📝 **Learning mode**: Save new patterns from conversations
- 🤖 **Compare with GPT**: Run same prompts through both

<div class="callout warning">
<div class="callout-title">Note</div>

These are optional enrichment activities—not required for full credit!

</div>


---

# What's Next? 🔮



<div class="callout info">
<div class="callout-title">Week 2: Computational Linguistics</div>

We'll move beyond simple pattern matching to explore:
- **Tokenization**: How to split text into meaningful units
- **N-grams**: Patterns across multiple words
- **Statistical language models**: Predicting what comes next
- **Part-of-speech tagging**: Understanding grammatical roles
- **Web scraping**: Getting real text data

</div>

<div class="callout warning">
<div class="callout-title">The Bridge</div>

Week 1 showed you pattern matching by hand. Week 2 shows you how to find patterns *automatically* from data!

</div>


---

# Resources for Learning 📚



<div class="callout info">
<div class="callout-title">Essential Reading</div>

- **Weizenbaum (1966)**: ELIZA paper - The original!
- **Python regex docs**: [docs.python.org/3/library/re.html](https://docs.python.org/3/library/re.html)
- **Regex101**: [regex101.com](https://regex101.com) - Test your patterns
- **HuggingFace NLP Course**: [huggingface.co/course](https://huggingface.co/course)

</div>

<div class="callout info">
<div class="callout-title">Optional Fun Stuff</div>

- Try talking to original ELIZA: [masswerk.at/elizabot](https://www.masswerk.at/elizabot/)
- Watch: "How ELIZA Worked" on YouTube
- Read: "Computer Power and Human Reason" by Weizenbaum

</div>


---

# Key Takeaways 🔑


1. **ELIZA is simple but powerful**: Pattern matching creates convincing illusions
2. **The ELIZA Effect is real**: We anthropomorphize machines easily
3. **Weizenbaum was prescient**: His warnings about AI are still relevant
4. **Building reveals truth**: Making ELIZA shows its limitations clearly
5. **Modern AI is similar**: More sophisticated, but still pattern matching
6. **Critical thinking is essential**: Always question what looks intelligent
7. **This is just the start**: Each week builds toward true understanding

<div class="callout warning">
<div class="callout-title">Remember</div>

The goal isn't just to build ELIZA—it's to *understand* what conversation, intelligence, and understanding really mean!

</div>


---

# Final Thoughts 💡



<!-- DIAGRAM: TikZ conversion needed -->
<!-- Original TikZ code preserved for reference:

% Quote box

...
-->

```
[Diagram placeholder - manual conversion required]
```

<div class="callout info">
<div class="callout-title">Discussion</div>

As you build your ELIZA, remember: You're creating a small universe. What responsibilities come with that?

How does it feel to create something that might deceive users into thinking it understands them?

</div>


---

# Questions? 🤔



Let's discuss!

**Contact Information:**

📧 jeremy@dartmouth.edu

💬 Discord: [https://discord.gg/sftEk9Ygdw](https://discord.gg/sftEk9Ygdw)

🏢 Office Hours: By appointment (Moore Hall 349)

**Assignment 1 is now available on Canvas!**

Good luck building ELIZA! 🚀

