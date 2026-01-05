# Assignment 1: Building the ELIZA Chatbot

## Overview

In this assignment, you will build a simplified version of ELIZA, one of the earliest programs to mimic human conversation. Created by Joseph Weizenbaum at MIT in 1964-1966, ELIZA was designed to simulate a session with a non-directive (Rogerian) psychotherapist using simple pattern matching and string manipulation.

But this assignment goes beyond just implementing a chatbot. You'll also analyze what makes ELIZA feel conversational despite its simplicity, compare it to modern chatbots, and reflect on the psychological phenomenon known as the "ELIZA effect"—the tendency for people to attribute human-like understanding to computer programs.

This is your first assignment in the course, and it's designed to introduce you to fundamental concepts in natural language processing: pattern matching, text manipulation, rule-based systems, and the critical distinction between appearing intelligent and actually understanding language.

### Vibe coding is encouraged!

For this assignment, it is *possible* to code everything from scratch in the allotted assignment time (1 week). However, I strongly recommend that you use a coding agent to help you implement the core components. Some suggestions are provided [below](#resources-and-references). If you're already familiar with vibe coding, then feel free to use whatever approach you're comfortable with. If you're new to vibe coding, or if you'd like to try something different, what works well for me is:

1. Start with a highly detailed description of *exactly* what you want your coding agent to make. I would suggest including the assignment as a reference file to provide additional instructions and context. But to increase the chances of *working* code, hallucinations, and other quality issues, you should explain as clearly as possible precisely what the core algorithms are, how the work should be approached, and so on. In order to create this document, it is critical that *you* have a detailed and comprehensive understanding of what the solution should look like. You don't necessarily need to know how to *code* it yourself (LLMs are fantastic at writing code), but you *do* need to know exactly what each function will do (i.e., what are the inputs, what are the outputs, and how can you convince yourself that it's working-- including tricky edge cases). It helps to include examples to illustrate how each component should work.

2. Next, pass your description to your coding agent, and ask it to come up with a detailed **technical design document**. You should review this in detail, edit carefully, and iterate (with help from the coding agent, other LLMs, web searches, and your own intuitions) until you are 100% happy with the design. Ideally the design should contain skeleton code and/or code snippets showing exactly how each component of your project will be implemented.

3. Once you have your technical design document, the next step is to construct a detailed **implementation plan**. Given your *target* (i.e., your technical design document) ask your coding agent to draft a plan for how to implement it. You can use both the assignment instructions and your technical design document as context.  Since implementation plans can get lengthy, you may be pushing up against the context limits of your coding agent of choice. A nice "trick" is to break your task into smaller sub-tasks, and then use agents to do each sub-task. Then no single instance of the coding agent needs to store the full code base and plan in its context.  As with the technical design document, you should iterate until you are 100% happy with the plan.  Importantly, you should include in your plan a way of verifying that everything is working correctly.

4. Then let your model "loose" on the problem and have it **draft a solution**.  Provide the assignment, technical design document, and implementation plan as context.  It's highly likely that the first solution your coding agent comes up with will be wrong in important ways-- it might not run, it might not do what you asked, you might have had a conceptual bug in your understanding that propagated to the model's solution, and so on.  That's where you should turn to the verification checks from your implementation plan.  In addition to making sure those checks "pass," you should also (when you're creating chatbots or other interactive applications, like in this assignment) *use it yourself*. Pretend you're *using* your chatbot (e.g., pretend you're me, and you're trying to stress test the implementation). Does the code behave like you expect? Does the code break down in unexpected ways? Does it break down in *expected* ways? Are there any pieces that you don't understand fully?

## Learning Objectives

By completing this assignment, you will:

1. **Implement a rule-based chatbot** using pattern matching and text transformations
2. **Understand the mechanics of ELIZA** including pre/post-substitutions, synonym handling, and decomposition/reassembly
3. **Analyze conversational patterns** by testing ELIZA on diverse inputs
4. **Compare simple and complex approaches** to conversational AI
5. **Explore psychological aspects** of human-computer interaction (ELIZA effect, anthropomorphization)
6. **Reflect critically** on what conversation actually requires vs. what creates the illusion of understanding
7. **Appreciate historical context** of early AI and its relevance to modern systems

## Background

### The ELIZA Effect

When Weizenbaum first demonstrated ELIZA, he was shocked by people's reactions. His secretary, who watched him build the program, asked him to leave the room so she could talk to ELIZA privately. Users shared intimate details of their lives. Some refused to believe it was "just" a program following simple rules.

This phenomenon—the tendency to attribute human-like understanding to computer systems based on their outputs—became known as the **ELIZA effect**. It's particularly relevant today as we interact with increasingly sophisticated chatbots and AI systems.

### How ELIZA Works

Unlike modern chatbots that use machine learning, ELIZA operates purely through:

1. **Pattern Matching**: Identifying keywords and patterns in user input
2. **Text Transformations**: Applying substitutions to normalize and manipulate text
3. **Template Responses**: Using predefined templates to generate replies
4. **Context-Free Operation**: No memory, no learning, no real understanding

Despite this simplicity, ELIZA can create surprisingly convincing conversational experiences, especially when mimicking a Rogerian psychotherapist who reflects questions back to the patient.

### Why This Matters

Understanding ELIZA is crucial for understanding modern AI:
- It demonstrates the difference between **appearing intelligent** and **being intelligent**
- It shows how simple rules can create compelling illusions
- It raises questions about what we mean by "understanding" and "conversation"
- It provides historical context for today's language models

## Part 1: Implementation

You will follow these steps to complete the assignment. Each part corresponds to specific functionality that the chatbot must have.

### 1. Read the Rules from a File
The chatbot will use a predefined file (`instructions.txt`) containing patterns, synonyms, and rules for text manipulations. You will need to write code to read and parse this file into an appropriate data structure that your program can use for:
- Greeting the user at the start and end of the conversation.
- Substituting text before and after pattern matching.
- Handling synonym substitutions.
- Matching user inputs to patterns and responding appropriately.

### 2. Start with a Greeting
Once the chatbot starts, it should display one of the pre-defined greeting lines from the `instructions.txt` file. For example:
```
Welcome. What brings you here today?
```

### 3. Implement the Conversation Loop
Your chatbot should repeatedly ask for user input and respond based on pattern matching until the user types a quit command. The conversation ends when the user enters one of the quit keywords specified in the instructions file (e.g., `bye`, `quit`).

### 4. Pre-Substitutions
Before matching patterns, the chatbot should perform **pre-substitutions**. These substitutions map certain words to alternatives that are easier for the chatbot to handle. For example:
- `dont` → `don't`
- `recollect` → `remember`

You should implement a function that performs these substitutions on the user’s input before further processing.

### 5. Synonym Handling
Your chatbot should also handle **synonym substitution**. The rules file provides sets of synonyms that the chatbot should treat as equivalent for pattern matching purposes. For example, the words "sad", "unhappy", and "depressed" are considered synonymous.

You will need to implement synonym substitution, where the input is normalized before attempting to match any patterns. For example, if a user says, "I am unhappy," the chatbot should recognize that "unhappy" is synonymous with "sad."

### 6. Pattern Matching
Your chatbot needs to match user input against a set of predefined patterns (as specified in the `instructions.txt` file). Patterns contain:
- **Decomposition rules**: These define how to break down a sentence into components.
- **Reassembly rules**: These dictate how to form a response based on the decomposed parts of the sentence.

For example, if the user says, "I feel sad," a decomposition rule might match `I feel *`, and a reassembly rule might respond with, "Why do you feel sad?"

You should:
- Match user input to the most relevant pattern.
- Decompose the input according to the matched pattern.
- Reassemble the parts into a response.

### 7. Post-Substitutions
Once the chatbot has generated a response, it should perform **post-substitutions** to finalize the output. This step swaps certain words to ensure grammatical correctness. For example:
- `i` → `you`
- `your` → `my`

For instance, if the user says, "I feel sad," and the chatbot's response is based on a pattern that reflects the user’s words back, the chatbot might generate, "Why do you feel sad?" It will then substitute "I" with "you" to respond with, "Why do you feel sad?"

### 8. Generate Responses and Continue the Loop
Once the chatbot generates a response, it should display the response and continue the conversation until the user types a quit command. The chatbot should have default responses if no patterns match the user input, such as:
```
I'm not sure I understand you fully. Can you elaborate?
```

### 9. Quit and Final Message
When the user inputs one of the quit keywords (e.g., `bye` or `quit`), the chatbot should print a final message, like:
```
That will be $200. See you again next week.
```

### Example Conversation

Your chatbot should handle a conversation like the following:

```
Chatbot: Welcome. What brings you here today?
User: I am feeling sad.
Chatbot: Why do you feel sad?
User: I can't stop thinking about my family.
Chatbot: Tell me more about your family.
User: I have to go now.
Chatbot: That will be $200. See you again next week.
```

### Implementation Requirements

- **Initial and final messages**: These must be drawn from the predefined options in [`instructions.txt`](instructions.txt)
- **Pre-substitutions, synonym handling, and post-substitutions**: Must be implemented according to the rules in [`instructions.txt`](instructions.txt)
- **Pattern matching**: Must use the decomposition and reassembly rules from [`instructions.txt`](instructions.txt) to generate responses
- **Conversation loop**: The chatbot must continue the conversation until the user types a quit word
- **Code quality**: Well-organized, commented code with clear function/class structure

## Part 2: Analysis and Exploration

Once your ELIZA implementation is working, conduct the following analyses to understand what makes it tick and where it breaks down.

### 1. Conversation Testing (Required)

Test your ELIZA on at least 5 different conversation scenarios:

a) **Typical therapy session**: Discuss feelings, family, dreams (what ELIZA was designed for)

b) **Technical/factual questions**: Ask about facts, math problems, or technical information

c) **Casual conversation**: Try small talk about weather, hobbies, or daily life

d) **Adversarial testing**: Try to "break" ELIZA with unusual inputs, edge cases, or nonsense

e) **Emotional depth**: Explore a single topic in depth across multiple turns

For each conversation:
- Include the full transcript in your notebook
- Analyze what worked and what didn't
- Identify specific patterns that matched (or failed to match)
- Note where ELIZA seems "intelligent" vs. where the illusion breaks

### 2. The ELIZA Effect Analysis (Required)

Reflect on the psychological aspects of interacting with ELIZA:

a) **When does ELIZA feel human?**
   - What specific responses create the illusion of understanding?
   - Which conversational techniques (reflection, questions) are most effective?
   - How does the psychotherapist framing affect perception?

b) **When does the illusion break?**
   - What inputs expose ELIZA's limitations?
   - What types of context does ELIZA fail to maintain?
   - How do repetitive responses affect the experience?

c) **Modern parallels**
   - How do modern chatbots create similar illusions?
   - What techniques do they use beyond pattern matching?
   - Where do modern systems still exhibit "ELIZA-like" behaviors?

### 3. Pattern Analysis (Required)

Analyze ELIZA's rule system:

a) **Pattern effectiveness**
   - Which patterns in `instructions.txt` are most useful?
   - Which keywords have priority (higher rank numbers)?
   - Why might certain patterns be prioritized over others?

b) **Coverage gaps**
   - What topics or conversation types are not covered?
   - What patterns would improve ELIZA's performance?
   - How would you extend the rule set?

c) **Substitution impact**
   - How do pre- and post-substitutions affect responses?
   - Find examples where substitutions are critical
   - What happens if substitutions are applied incorrectly?

### 4. Comparison with Modern Chatbots (Required)

Compare your ELIZA implementation with a modern chatbot:

a) **Choose a comparison system**
   - ChatGPT (or similar LLM-based chatbot)
   - A simple chatbot library (ChatterBot, Rasa, etc.)
   - Another student's enhanced ELIZA (if available)

b) **Side-by-side testing**
   - Use the same prompts with both systems
   - Compare response quality, coherence, and relevance
   - Document at least 3 example conversations

c) **Analysis**
   - What capabilities does the modern system have that ELIZA lacks?
   - Are there any scenarios where ELIZA performs comparably?
   - What's needed to bridge the gap from ELIZA to modern chatbots?

## Part 3: Reflection and Insights (Required)

Write a thoughtful reflection (500-1000 words) addressing:

1. **What is conversation?**
   - What does ELIZA reveal about the nature of conversation?
   - Can pattern matching alone constitute "conversation"?
   - What's missing from ELIZA that humans have?

2. **Understanding vs. simulation**
   - Does ELIZA "understand" anything? Why or why not?
   - What would it take for a system to truly understand language?
   - How do we know if modern LLMs "understand" vs. just simulate?

3. **The gap to modern AI**
   - What are the key limitations of rule-based approaches?
   - What fundamental advances enabled modern chatbots?
   - What problems remain unsolved even with modern systems?

4. **Ethical implications**
   - Should users be informed they're talking to a bot?
   - What are the risks of systems that simulate understanding?
   - How do Weizenbaum's concerns apply to today's AI?

## Part 4: Extensions (Optional Bonus)

Choose one or more extensions to enhance your ELIZA:

### Extension 1: Advanced Pattern Matching

Implement improved pattern matching using:
- **Regular expressions** instead of simple wildcards
- **Part-of-speech tagging** to match grammatical patterns
- **Named entity recognition** to identify people, places, etc.

Compare the enhanced version with your original implementation.

### Extension 2: Emotional State Tracking

Add a simple emotion tracking system:
- Detect emotional words (happy, sad, angry, etc.)
- Track emotional state across conversation turns
- Adjust responses based on detected emotion
- Visualize emotional trajectory of the conversation

### Extension 3: Conversation Analytics

Build analytics for ELIZA conversations:
- Track which patterns match most frequently
- Measure conversation length and depth
- Identify common conversation topics
- Detect when users disengage or get frustrated

Create visualizations of these metrics across multiple conversations.

### Extension 4: Simple Transformer Comparison

Implement a minimal transformer-based chatbot:
- Fine-tune a small model (GPT-2, DistilGPT-2) on therapy conversations
- Compare with ELIZA on the same test conversations
- Analyze where each system excels
- Measure computational costs vs. performance gains

### Extension 5: Hybrid System

Create a hybrid system that combines:
- ELIZA's pattern matching for structure
- Modern NLU for understanding
- Template responses with learned variations
- Memory of conversation context

Document design decisions and performance improvements.

## Deliverables

Submit a **single Jupyter notebook** that includes:

### 1. Implementation (40%)
- Complete, working ELIZA chatbot implementation
- Clean, well-commented code
- Proper handling of all rule types from `instructions.txt`
- Markdown cells explaining your approach

### 2. Conversation Examples (20%)
- At least 5 diverse conversation transcripts
- Analysis of each conversation
- Pattern matching explanations
- Examples of successes and failures

### 3. Analysis (25%)
- ELIZA effect analysis
- Pattern effectiveness analysis
- Comparison with modern chatbot (with examples)
- Insights into why ELIZA works/fails

### 4. Reflection (10%)
- Thoughtful 500-1000 word reflection
- Addresses all required questions
- Shows critical thinking about conversation and understanding
- Connects to modern AI systems

### 5. Presentation (5%)
- Well-organized notebook structure
- Clear markdown explanations throughout
- Proper formatting and readability
- Runs without errors in Google Colab

### Optional Bonus
- Any extensions you implement (+5-15% extra credit depending on depth)

## Evaluation Criteria

### Technical Implementation (40 points)

- **Core ELIZA functionality** (25 pts): Correct implementation of all required components
  - Pattern matching with decomposition/reassembly (8 pts)
  - Pre- and post-substitutions (6 pts)
  - Synonym handling (6 pts)
  - Conversation loop with greeting/quit (5 pts)

- **Code quality** (10 pts): Organization, comments, clarity

- **Completeness** (5 pts): All features working correctly

### Conversation Examples and Testing (20 points)

- **Diversity of tests** (8 pts): Cover required scenarios thoroughly
- **Documentation** (7 pts): Clear transcripts with analysis
- **Insights** (5 pts): Thoughtful observations about pattern matching

### Analysis (25 points)

- **ELIZA effect analysis** (8 pts): Insightful examination of psychological aspects
- **Pattern analysis** (7 pts): Understanding of rule system effectiveness
- **Modern comparison** (10 pts): Fair, thorough comparison with analysis

### Reflection (10 points)

- **Depth of thought** (5 pts): Thoughtful engagement with big questions
- **Connections** (3 pts): Links ELIZA to modern AI systems
- **Clarity** (2 pts): Well-written and organized

### Presentation (5 points)

- **Organization** (2 pts): Logical structure and flow
- **Formatting** (2 pts): Readable, well-formatted notebook
- **Completeness** (1 pt): Runs without errors

**Total: 100 points** (plus potential bonus)

### Grading Scale

- **A (90-100)**: Excellent implementation with thorough analysis and insightful reflections
- **B (80-89)**: Complete working implementation with good analysis
- **C (70-79)**: Working ELIZA with basic analysis and some gaps
- **D (60-69)**: Partial implementation or weak analysis
- **F (<60)**: Incomplete or non-functional submission

## Tips for Success

### Getting Started

1. **Read Weizenbaum's paper first**: Understanding the original design will help immensely
2. **Start with simple patterns**: Get basic matching working before tackling complex cases
3. **Test incrementally**: Don't write everything at once—test each component separately
4. **Use print statements**: Debug by printing what patterns match and why
5. **Study `instructions.txt`**: Understand the format before parsing it

### Common Pitfalls to Avoid

1. **Incorrect pattern priority**: Patterns with higher rank numbers should be checked first
2. **Substitution order**: Pre-substitutions before pattern matching, post-substitutions after
3. **Wildcard matching**: The `*` should match any sequence of words
4. **Synonym expansion**: Remember to treat all synonyms as equivalent during matching
5. **Reassembly**: Captured groups should be properly reinserted in responses
6. **Case sensitivity**: Normalize case for matching but preserve it appropriately in output

### Debugging Strategies

1. **Start tiny**: Test with just 2-3 patterns before using the full `instructions.txt`
2. **Print everything**: Show which pattern matched and which reassembly was selected
3. **Manual trace**: Walk through a simple example by hand to verify logic
4. **Edge cases**: Test empty input, very long input, special characters
5. **Compare outputs**: Check your responses against online ELIZA implementations

### Making Your Analysis Stand Out

1. **Be specific**: Use concrete examples from your conversations
2. **Think critically**: Don't just describe—analyze why things work or fail
3. **Make connections**: Link ELIZA to modern AI systems and concepts
4. **Be honest**: It's okay to note limitations and struggles
5. **Show creativity**: Test ELIZA in interesting or unexpected ways

### Time Management

This assignment is designed to be completed in **one week (7 days)**. While substantial, it is achievable within a week with focused effort. Here's a suggested daily breakdown:

- **Days 1-2**: Implement core ELIZA functionality (pattern matching, pre/post-substitutions, synonym handling, conversation loop)
- **Days 3-4**: Conduct conversation testing and analysis (at least 5 diverse conversation scenarios, ELIZA effect analysis, pattern effectiveness analysis)
- **Days 5-6**: Complete comparison with modern chatbots and write your reflection (500-1000 word reflection on key questions)
- **Day 7**: Polish your notebook, test it in a fresh Colab session, and prepare for submission

**Key tip**: These phases can overlap! While implementing, you can begin testing. While analyzing, you can refine your implementation. The daily breakdown above represents the primary focus for each phase, but iterating and moving between phases is normal and expected. Start early in the week and test incrementally as you build each component.

## Resources and References

### Essential Reading

1. **Weizenbaum, J. (1966)**. "ELIZA—A Computer Program For the Study of Natural Language Communication Between Man and Machine"
   - [PDF Link](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf)
   - **Read this first!** It will help you understand the design and implementation

2. **Weizenbaum, J. (1976)**. "Computer Power and Human Reason: From Judgment to Calculation"
   - [PDF Link](http://blogs.evergreen.edu/cpat/files/2013/05/Computer-Power-and-Human-Reason.pdf)
   - Weizenbaum's later reflections on ELIZA and AI ethics
   - Highly relevant to your reflection section

### Additional Context

3. **Hofstadter, D. (1995)**. "Fluid Concepts and Creative Analogies: Computer Models of the Fundamental Mechanisms of Thought"
   - [PDF Link](https://psycnet.apa.org/record/1995-98269-000)
   - Chapter on the Copycat program and understanding vs. simulation

4. **Turkle, S. (2011)**. "Alone Together: Why We Expect More from Technology and Less from Each Other"
   - [PDF Link](https://link.springer.com/article/10.1007/s10615-014-0511-4)
   - Modern examination of human-computer emotional connections

### Technical Resources

- **ELIZA Online Implementations**: Try online versions to see expected behavior
  - [context-lab.com/llm-course/demos/eliza]](https://context-lab.com/llm-course/demos/eliza/)
  - Useful for testing your implementation

- **Google Colaboratory**: Setup-free resource for writing and running code on Google Cloud machines
  - [Link](https://colab.research.google.com/)
  - Your assignment **must** run in Google Colaboratory: to test it, press the "Run all" button, or select "Runtime" > "Run all" from the menu. Make sure that *all* parts of the notebook run without crashing before you submit!!

- **Dartmouth GenAI**: Free access to powerful LLMs that can help with coding
  - [Link (requires Dartmouth NetID)](https://chat.dartmouth.edu/)

- **OpenCode**: Command line interface for vibe coding
  - [Link](https://opencode.ai/)
  - Suggested plugin: [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
  - Supports many providers and models, including local models

- **LM Studio**: Run open models on your own computer
  - [Link](https://lmstudio.ai/)
  - Suggested model (depending on your machine's power): [gpt-oss](https://lmstudio.ai/models/gpt-oss)

- **Antigravity**: Code development environment designed to faciliate interactions with AI agents
  - [Link](https://antigravity.google/)

- **Python String Methods**: Essential for text manipulation
  - [Python String Documentation](https://docs.python.org/3/library/stdtypes.html#string-methods)

- **Regular Expressions** (for bonus extensions):
  - [Python re module](https://docs.python.org/3/library/re.html)
  - [RegexOne Tutorial](https://regexone.com/)

### Modern Chatbot Comparisons

- **ChatGPT**: [chat.openai.com](https://chat.openai.com) - For comparison testing
- **Claude**: [claude.ai](https://claude.ai) - Another modern system to compare
- **Replika**: [replika.com](https://replika.com/) - Example of modern "therapeutic" chatbot
- **Evergreen**: [evergreenai.dartmouth.edu](https://evergreenai.dartmouth.edu/) - Dartmouth's version of AI-powered therapy!

### Course Materials

- [**Week 1 Lecture Slides**](https://context-lab.com/llm-course/#week1): Review pattern matching and ELIZA discussion
- **Course Readings**: [Weizenbaum (1966)](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf), along with [Fedorenko et al. (2024)](https://www.nature.com/articles/s41586-024-07522-w) and [Lupyan et al. (2020)](https://doi.org/10.1016/j.tics.2020.08.005) on language and thought

### Going Deeper (Optional)

- [**Searle, J. (1980)**](http://www.cse.buffalo.edu/~rapaport/Papers/Papers.by.Others/Searle/searle80-MindsBrainsProgs-BBS.pdf). "Minds, Brains, and Programs" - The Chinese Room argument
- [**Turing, A. (1950)**](https://ebiquity.umbc.edu/get/a/publication/1389.pdf). "Computing Machinery and Intelligence" - The original Turing Test
- [**Bender & Koller (2020)**](https://aclanthology.org/2020.acl-main.463.pdf). "Climbing towards NLU: On Meaning, Form, and Understanding in the Age of Data"

## Submission Guidelines

### GitHub Classroom Submission

This assignment is submitted via **GitHub Classroom**. Follow these steps:

1. **Accept the assignment**: Click the [accept assignment link](https://classroom.github.com/a/SC1jeftp)
   - This creates your own private repository for the assignment
   - Template repository (your private version will be based on this template): [github.com/ContextLab/eliza-llm-course](https://github.com/ContextLab/eliza-llm-course)

2. Click the "

5. **Verify submission**: Check that your latest commit appears in your GitHub repository before the deadline

**Deadline**: January 16, 2026 at 11:59 PM EST

### Notebook Requirements

1. **Runtime**: The notebook must run from start to finish without errors in a fresh Colab session
2. **Dependencies**: Include all imports and installations in the notebook
3. **Data**: The `instructions.txt` file should be loaded in your notebook (upload to Colab or link to it)
4. **Output**: Keep cell outputs visible in your submission
7. **Deadline**: January 16, 2026 at 11:59PM EST

### Before Submission Checklist

- [ ] ELIZA implementation is complete and working
- [ ] All conversation examples are included with analysis
- [ ] ELIZA effect analysis is thorough and insightful
- [ ] Modern chatbot comparison is complete with examples
- [ ] Reflection addresses all required questions
- [ ] Code is well-commented and organized
- [ ] All markdown cells provide clear explanations
- [ ] Notebook runs without errors in fresh Colab session
- [ ] Cell outputs are visible and meaningful
- [ ] Formatting is clean and professional

## Academic Integrity

You are encouraged to:
- Use generative AI tools (ChatGPT, Claude, Copilot) to help write and debug code
- Discuss concepts and approaches with classmates
- Search for online tutorials and ELIZA resources
- Ask questions in class, office hours, or discussion forums

You must:
- Write your own code and analysis (even if AI-assisted)
- Understand every line of code you submit
- Write your own reflection in your own words
- Cite any significant code snippets adapted from external sources
- Submit original conversation examples and analysis

Violations of academic integrity will result in a failing grade for the assignment.

## Questions?

If you have questions about the assignment:
1. Review this README and the Weizenbaum paper
2. Check the Week 1 lecture materials
3. Post in the course discussion forum
4. Attend office hours
5. Email the instructor/TA with specific questions

Have fun exploring one of the most important programs in AI history!

---

*ELIZA may be nearly 60 years old, but it raises questions about intelligence, understanding, and human-computer interaction that remain deeply relevant today. By building and analyzing ELIZA, you're engaging with fundamental questions that will resurface throughout this course as we explore modern language models.*
