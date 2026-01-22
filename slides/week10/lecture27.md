---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.17: Models of Language and Communication'
footer: ''
---

<!-- _class: lead -->

# Lecture 27: Final Project Work Session
## Models of Language and Conversation 

**PSYC 51.17: Models of Language and Communication**

---

# Today's Agenda 

<!-- TODO: Add manual table of contents or navigation -->


---

# Where We Are 



<div class="callout info">
<div class="callout-title">The Home Stretch</div>

This is it—the final week of the course! Your final projects are due soon, and presentations are coming up.

</div>

**This week's schedule:**
- **Today (Monday)**: Project work session, debugging support, presentation prep
- **Wednesday**: Final project presentations (Part 1)
- **Friday**: Final project presentations (Part 2)
- **End of Friday**: All final materials due (11:59 PM Eastern)

<div class="callout warning">
<div class="callout-title">Important</div>

Today is your **last structured work time** before presentations. Use it wisely!

</div>


---

# Final Project Requirements Review 


**What you need to submit (all due Friday EOD):**

1. **Code Implementation**: Jupyter notebook that runs in Google Colab
 - Well-documented, reproducible, polished
- Includes all experiments and results
2. **Video Presentation**: 10-12 minute video (YouTube link)
 - Cover motivation, approach, results, discussion
- All team members participate
3. **Written Writeup**: 2-5 page report
 - Intro, approach, results, discussion, references
- Think mini research paper
4. **In-Class Presentation**: Wednesday or Friday
 - Show your video + lead 5-10 min Q&A discussion


---

# Presentation Format 


<div class="columns">
<div class="column">

**Video Component:**
- **Length**: 10-12 minutes
- **Format**: Pre-recorded video
- **Platform**: YouTube (unlisted OK)
- **Content**:
 
- Motivation (why?)
- Approach (how?)
- Results (what?)
- Discussion (so what?)

</div>
<div class="column">

**In-Class Component:**
- **Show video** to class
- **5-10 min Q&A**/discussion
- **All team members** present
- Be ready for questions about:
 
- Technical details
- Design decisions
- Limitations
- Future work

</div>
</div>

Test your video beforehand! Make sure audio is clear, slides are readable, and demos work smoothly.


---

# What Makes a Great Presentation? 



**Content:**
- **Clear motivation**: Why does this problem matter?
- **Technical depth**: Show you understand the methods
- **Honest results**: Good and bad—what worked, what didn't?
- **Critical analysis**: Limitations, future work, broader implications

**Presentation quality:**
- **Clear visuals**: Readable slides, effective figures
- **Good pacing**: Not too fast, not too slow
- **Engaging delivery**: Energy, clarity, enthusiasm
- **Team coordination**: Smooth transitions, balanced participation

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Your audience is smart but may not know your specific domain. Explain technical concepts clearly without oversimplifying.

</div>


---

# Presentation Structure Template 


**Suggested 10-12 minute structure:**

1. **Title & Introduction** (1 min)
 - Project title, team members, one-sentence summary
2. **Motivation & Background** (2 min)
 - The problem, why it matters, research questions
3. **Approach & Methods** (3-4 min)
 - Models, datasets, techniques, implementation details
4. **Results** (3-4 min)
 - Key findings, metrics, visualizations, demos
5. **Discussion & Conclusions** (1-2 min)
 - Limitations, future work, takeaways, broader impact


---

# Finishing Your Project: Technical Checklist 


**Code & Implementation:**
- [$\square$] Notebook runs completely in fresh Colab session (no errors!)
- [$\square$] All required packages installed with `!pip install` commands
- [$\square$] Dataset downloads automated (no manual file uploads)
- [$\square$] Random seeds set for reproducibility
- [$\square$] Code is well-commented and organized
- [$\square$] Markdown cells explain what's happening and why

**Results & Analysis:**
- [$\square$] All experiments completed and documented
- [$\square$] Visualizations clear and informative
- [$\square$] Metrics and baselines included
- [$\square$] Results interpreted thoughtfully


---

# Testing Reproducibility 


<div class="callout warning">
<div class="callout-title">Critical Step: Test in Clean Environment</div>

Before submitting, open a **brand new** Colab session and run your notebook from top to bottom. This is what graders will do!

</div>

**Common reproducibility issues:**
1. **Missing installations**: Did you forget a `!pip install`?
2. **File paths**: Are you referencing files that only exist on your machine?
3. **API keys**: Did you hard-code keys? (Use environment variables or instructions)
4. **Cell order**: Does notebook work when run sequentially?
5. **Out-of-order execution**: Did you run cells out of order during development?
6. **Runtime requirements**: Does it need a GPU? Does it exceed Colab limits?

Use "Runtime → Restart and run all" frequently during development!


---

# Code Quality Matters 


**Good code is:**
- **Readable**: Clear variable names, logical organization
- **Documented**: Comments, docstrings, markdown explanations
- **Modular**: Functions for repeated tasks, not copy-paste code
- **Efficient**: Reasonable runtime, not wasteful

**Example of good documentation:**
```python
def compute_embeddings(texts, model_name="sentence-transformers/all-MiniLM-L6-v2"):
 """
 Compute semantic embeddings for a list of texts.

 Args:
 texts (list): List of text strings to embed
 model_name (str): HuggingFace model identifier

 Returns:
 np.ndarray: Embeddings matrix of shape (len(texts), embedding_dim)
 """
 # Load model and encode
 # ...
```


---

# Common Pitfalls to Avoid 


**Technical pitfalls:**
- **Scope creep**: Trying to do too much at the last minute
- **No baselines**: Results without comparison are hard to interpret
- **Cherry-picking**: Only showing best results, hiding failures
- **Ignoring errors**: Sweeping bugs under the rug instead of fixing
- **Last-minute testing**: Discovering critical bugs right before deadline

**Presentation pitfalls:**
- **Too much detail**: Getting lost in implementation minutiae
- **No motivation**: Jumping straight to methods without context
- **Unclear visuals**: Tiny fonts, cluttered slides, confusing plots
- **Going over time**: Practice and time yourself!
- **Unbalanced team**: One person doing all the talking


---

# When Things Don't Work 



<div class="callout info">
<div class="callout-title">Research Reality</div>

Not everything will work perfectly. That's **completely normal** in research!

</div>

**If experiments fail or results are negative:**
- **Don't panic!** Negative results are still valuable
- **Analyze why**: What went wrong? What did you learn?
- **Be honest**: Discuss failures and limitations openly
- **Show process**: Document what you tried and why
- **Suggest improvements**: What would you do differently?

Projects are graded on process, rigor, and critical thinking—not just positive results. A thoughtful analysis of why something didn't work can be just as valuable as showing success!


---

# Time Management: The Final 72 Hours 


**Recommended priorities:**

1. **Priority 1 (Critical)**: Make code run and reproduce core results
 - Fix any breaking bugs
- Ensure reproducibility
- Complete essential experiments
2. **Priority 2 (High)**: Create presentation video
 - Draft slides
- Record and edit video
- Upload to YouTube
3. **Priority 3 (Medium)**: Polish notebook
 - Add documentation
- Clean up code
- Add visualizations
4. **Priority 4 (Nice-to-have)**: Written writeup refinement
 - Draft should be done, now refine
- Proofread, fix formatting


---

# Grading Breakdown 


**How your project will be evaluated:**

| Results \ | Analysis | 20% |
| --- | --- | --- |
| Presentation (Video + In-Class) | 15% |
| Written Writeup | 10% |
| Proposal | 10% |
| Teamwork \ | Collaboration | 5% |

Focus most of your remaining time on **implementation** and **presentation**—they make up 55% of the grade!


---

# What We're Looking For 



**Excellent projects demonstrate:**
- **Technical sophistication**: Mastery of course concepts
- **Rigor**: Well-designed experiments, appropriate evaluation
- **Critical thinking**: Thoughtful analysis of results and limitations
- **Clarity**: Clear communication in code, writing, and presentation
- **Reproducibility**: Everything runs and can be verified
- **Insight**: Novel findings or meaningful contributions

<div class="callout tip">
<div class="callout-title">Think about it!</div>

Would you be proud to show this project in a job interview or grad school application? Would you be comfortable presenting it at a research conference? That's the bar we're aiming for.

</div>


---

# Today's Work Session 


**Use today for:**
- **Debugging**: Fix critical bugs, resolve issues
- **Completing experiments**: Finish any remaining analyses
- **Creating presentation**: Draft slides, record video
- **Testing reproducibility**: Run notebook in clean Colab
- **Peer feedback**: Show work to other teams, get suggestions
- **Getting help**: Ask questions, troubleshoot with instructor

<div class="callout warning">
<div class="callout-title">Office Hours Available</div>

I'll be available all day for questions, debugging help, and feedback. Use this time!

</div>

Work together in your team, but also talk to other teams. Fresh perspectives often reveal issues you've been missing!


---

# Getting Unstuck 


**If you're stuck on a technical issue:**
1. **Read the error message carefully**: What exactly is breaking?
2. **Google the error**: Someone has likely encountered it before
3. **Check documentation**: Are you using the API correctly?
4. **Simplify**: Create minimal example that reproduces the issue
5. **Use GenAI tools**: Claude, ChatGPT can help debug
6. **Ask for help**: Discord, peers, instructor

**If you're stuck on project direction:**
1. **Review your proposal**: What was your original plan?
2. **Prioritize**: What's essential vs. nice-to-have?
3. **Scope down**: Better to do less well than more poorly
4. **Talk it through**: Explain the issue to a teammate or peer
5. **Consult instructor**: Get feedback on revised approach


---

# Key Takeaways 


1. **Prioritize ruthlessly**: Focus on what matters most
2. **Test reproducibility**: Run in clean Colab before submitting
3. **Be honest about limitations**: Negative results are OK
4. **Practice your presentation**: Time it, refine it, polish it
5. **Use available support**: Office hours, peers, Discord
6. **Start with working code**: Polish can come later
7. **Document as you go**: Don't leave it all for the last minute

<div class="callout warning">
<div class="callout-title">Remember</div>

This is the culmination of everything you've learned. From ELIZA to GPT, from pattern matching to transformers—you've built an incredible foundation. Now show us what you can do with it!

</div>


---

# Final Submission Checklist 


**Before you submit Friday night, verify:**
- [$\square$] Code runs completely in fresh Colab (tested!)
- [$\square$] Video uploaded to YouTube, link included
- [$\square$] Writeup is 2-5 pages with all required sections
- [$\square$] All team members listed on all deliverables
- [$\square$] References properly cited
- [$\square$] Presentation ready for Wednesday or Friday
- [$\square$] All files submitted to Canvas

Submit early if possible! Don't wait until 11:59 PM—technical issues happen.


---

# You've Got This! 



You've learned an incredible amount this quarter.

You started with simple string manipulation and pattern matching...

And now you're building sophisticated LLM systems!

**Trust your skills. Use your resources. Do great work.**

We can't wait to see your presentations! 

**Now: Let's get to work! **

