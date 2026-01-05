# Final Project Presentation Guidelines

**Course:** Models of Language and Conversation (PSYC 51.17)
**Instructor:** Dr. Jeremy R. Manning
**Presentation Dates:** Week 10 (Wednesday & Friday)

---

## Overview

Your final project presentation is a critical component of your project deliverables. You will create a **pre-recorded video presentation** (10-12 minutes) that you'll share with the class, followed by a **live Q&A discussion** (5-10 minutes). This format allows you to polish your presentation while still engaging in dynamic discussion with your peers and instructor.

The presentation should showcase your work in a clear, engaging, and intellectually rigorous manner—similar to what you might present at a research conference or industry talk.

---

## Presentation Format

### Two-Part Structure

Your presentation consists of two components:

#### 1. Pre-Recorded Video (10-12 minutes)
- **Format:** Video file uploaded to YouTube (public or unlisted)
- **Length:** 10-12 minutes (strictly enforced—practice to stay within bounds!)
- **Content:** Complete presentation of your project
- **Tools:** Use any video recording software (Zoom, OBS, PowerPoint recording, etc.)
- **Visuals:** Slides, demos, code walkthroughs, visualizations—whatever best conveys your work

#### 2. Live Q&A Discussion (5-10 minutes)
- **Format:** In-class discussion following your video
- **All team members participate:** Be ready to answer questions
- **Types of questions:** Technical details, design choices, limitations, future work
- **Engagement:** Ask questions of other presenters too!

---

## Schedule

### Wednesday, Week 10: Presentations Part 1
- Approximately half the teams will present
- Exact schedule will be posted on Canvas by Monday evening
- Each team gets ~15-20 minutes total (video + discussion)

### Friday, Week 10: Presentations Part 2
- Remaining teams present
- Same format as Wednesday
- Course wrap-up and reflections afterward

### Important Deadlines
- **Video submission:** Upload to YouTube and include link in your writeup by **Friday 11:59 PM Eastern** (even if presenting Wednesday)
- **Be present:** Attend both presentation days—you're expected to engage with other teams' work

---

## Required Content

Your presentation must cover the following sections:

### 1. Title & Introduction (1 minute)
**What to include:**
- Project title
- Team members and their roles
- One-sentence summary: "We built/investigated/evaluated [X] to [purpose] by [approach]"
- Hook: Why should the audience care?

**Example opening:**
> "Hi, I'm Alex, this is Jordan and Sam. Today we're presenting 'EmotiChat: A Fine-Tuned Empathetic Dialogue System.' We built a chatbot specifically trained to provide emotional support in mental health contexts by fine-tuning LLaMA-2 on counseling conversation data. Mental health support is increasingly needed but access is limited—our system explores whether LLMs can provide helpful, empathetic responses."

---

### 2. Motivation & Background (2 minutes)
**What to include:**
- **The problem:** What gap or challenge are you addressing?
- **Why it matters:** Real-world significance, research importance
- **Research questions:** What specific questions are you investigating?
- **Related work:** Briefly mention relevant prior work (2-3 papers max)
- **Your contribution:** What makes your approach novel or valuable?

**Tips:**
- Use concrete examples to make the problem tangible
- Avoid jargon without explanation
- Make it accessible to intelligent non-experts

---

### 3. Approach & Methods (3-4 minutes)
**What to include:**
- **Overall approach:** High-level architecture or methodology
- **Models used:** Which LLMs, architectures, or techniques?
- **Datasets:** What data did you use? How much? From where?
- **Implementation details:** Key technical decisions
 - Fine-tuning approach (if applicable)
 - Hyperparameters
 - Evaluation metrics
 - Baselines for comparison
- **Challenges:** What was technically difficult? How did you overcome it?

**Tips:**
- Use diagrams/flowcharts to illustrate architecture
- Show code snippets if they illuminate key points (but keep brief!)
- Balance detail and clarity—don't overwhelm with minutiae
- Explain *why* you made certain technical choices

**Example slide:**
```
Approach: Fine-Tuning with LoRA
- Base model: LLaMA-2-7B
- Training data: 50K counseling conversations from XYZ dataset
- Method: Low-Rank Adaptation (LoRA) for parameter-efficient fine-tuning
 - Rank r=16, alpha=32
 - Target modules: Q, V attention matrices
- Training: 3 epochs, batch size 4, learning rate 2e-4
- Why LoRA? Computational constraints + prevents catastrophic forgetting
```

---

### 4. Results (3-4 minutes)
**What to include:**
- **Key findings:** What did you discover?
- **Quantitative results:** Metrics, numbers, comparisons to baselines
- **Qualitative results:** Examples, demos, case studies
- **Visualizations:** Plots, tables, confusion matrices, attention maps, etc.
- **Interpretation:** What do these results mean?

**Tips:**
- Lead with your most important finding
- Use clear, readable visualizations (large fonts, clear labels)
- Show examples—qualitative results make work tangible
- Include both successes AND failures/limitations
- Compare to baselines to provide context

**Effective result slides:**
- Before/after examples showing improvement
- Side-by-side comparisons (your model vs. baseline)
- Performance metrics in clean tables
- Error analysis or failure cases
- Live demos (if feasible and reliable!)

---

### 5. Discussion & Conclusions (1-2 minutes)
**What to include:**
- **Summary:** Briefly recap main findings
- **Limitations:** Be honest about what didn't work or limitations of approach
 - Dataset limitations
 - Model limitations
 - Generalizability concerns
 - Computational constraints
- **Future work:** What would you do with more time/resources?
- **Broader implications:** What does this mean for the field or real-world applications?
- **Takeaways:** What should the audience remember?

**Tips:**
- Don't hide limitations—they demonstrate critical thinking
- Future work should be specific and feasible, not vague
- End strong—leave audience with a clear takeaway

**Example conclusion:**
> "Our results show that fine-tuned LLaMA-2 can produce empathetic responses that users rated as more helpful than GPT-3.5 baseline. However, the model still occasionally generates inappropriate advice, highlighting the need for safety guardrails. Future work should explore reinforcement learning from human feedback to better align responses with counseling best practices. This work suggests that with careful design, LLMs can augment mental health support—though human oversight remains essential."

---

## Presentation Quality Guidelines

### Visual Design

**Slides should be:**
- **Readable:** Large fonts (≥24pt for body text, ≥36pt for titles)
- **Clean:** Not cluttered—use whitespace effectively
- **Consistent:** Unified color scheme and layout
- **Informative:** Figures and tables should have clear labels and legends
- **Minimal text:** Bullet points, not paragraphs—you'll elaborate verbally

**Avoid:**
- Tiny fonts that can't be read
- Too much text crammed on one slide
- Distracting animations or transitions
- Low-quality or pixelated images
- Inconsistent formatting

**Visualization best practices:**
- Label axes clearly
- Include legends
- Use colorblind-friendly palettes
- Make sure text in figures is large enough
- Include error bars or confidence intervals where appropriate

---

### Delivery

**Effective delivery includes:**
- **Clear audio:** Use a good microphone, minimize background noise
- **Good pacing:** Not too fast, not too slow—practice to find the right speed
- **Energy and enthusiasm:** Show you care about your work!
- **Clarity:** Explain concepts clearly, define technical terms
- **Smooth transitions:** Connect sections logically
- **Team coordination:** If multiple speakers, transition smoothly between speakers

**Recording tips:**
- Record in a quiet environment
- Test audio and video quality before recording the full presentation
- Use a script or bullet points—but don't just read verbatim
- Practice multiple times before recording
- Watch your recording—would you find it engaging?
- Edit out long pauses, technical glitches, or mistakes

---

### Team Participation

**All team members must participate meaningfully:**
- Each person should present at least one section
- Balance speaking time reasonably (doesn't need to be exactly equal)
- During Q&A, different team members can answer different questions based on expertise
- Show collaboration—reference each other's contributions

**Example division:**
- Person 1: Intro, motivation, background
- Person 2: Approach, methods, implementation
- Person 3: Results, discussion, conclusions
- All: Participate in Q&A

---

## Live Q&A Component

### Preparation

**Be ready to discuss:**
- **Technical details:** "How did you choose hyperparameters?" "Why this model over alternatives?"
- **Design decisions:** "Why did you use that dataset?" "What other approaches did you consider?"
- **Results interpretation:** "What explains this unexpected finding?" "How do you account for variance?"
- **Limitations:** "What are the main weaknesses?" "How would you address them?"
- **Future directions:** "What would you do next?" "How would this scale?"
- **Broader implications:** "What are ethical considerations?" "How might this be misused?"

### Answering Questions

**Good answer strategy:**
- Listen carefully to the full question
- Pause briefly to think before responding
- Give concise, direct answers
- Admit if you don't know—speculate thoughtfully rather than making up answers
- If question requires long answer, offer to discuss after presentation

**Example responses:**

**Good:** "That's a great question about why we chose LoRA over full fine-tuning. We were constrained by GPU memory on Colab, and LoRA gave us 95% of the performance with 10% of the memory requirements. Full fine-tuning would be interesting future work with more compute."

**Less good:** "Um, I don't know, we just used LoRA because everyone uses it."

---

## Grading Rubric

Your presentation is worth **15% of your final project grade**, evaluated on:

### Content (60% of presentation grade)
- **Clarity of motivation** (10%): Is the problem well-defined and justified?
- **Technical depth** (20%): Do you demonstrate understanding of methods and implementation?
- **Results quality** (15%): Are results clearly presented and well-analyzed?
- **Critical thinking** (15%): Are limitations and implications thoughtfully discussed?

### Presentation Quality (30% of presentation grade)
- **Visual design** (10%): Are slides clear, readable, and well-designed?
- **Delivery** (10%): Is the presentation engaging and well-paced?
- **Organization** (10%): Is content logically structured and easy to follow?

### Team Participation (10% of presentation grade)
- **Balanced participation**: Do all team members contribute meaningfully?
- **Q&A engagement**: Can team answer questions thoughtfully and accurately?

---

## Common Pitfalls to Avoid

### Content Issues
- **No motivation:** Jumping straight to methods without explaining why the problem matters
- **Too much background:** Spending half the time on related work instead of your contribution
- **Unclear methods:** Not explaining your approach well enough to understand what you did
- **Cherry-picking results:** Only showing successes, hiding failures
- **No baselines:** Presenting metrics without comparison to make them meaningful
- **Ignoring limitations:** Claiming everything worked perfectly with no weaknesses

### Presentation Issues
- **Going over time:** Practicing is essential—12 minutes means 12 minutes!
- **Too fast:** Racing through slides so audience can't absorb content
- **Reading slides verbatim:** Slides should support your talk, not replace it
- **Unreadable slides:** Tiny fonts, cluttered layout, too much text
- **Poor audio:** Background noise, unclear speech, inconsistent volume
- **Unbalanced team:** One person doing 90% of the talking

### Q&A Issues
- **Defensive:** Getting argumentative when questioned about limitations
- **Unprepared:** Unable to answer basic questions about your own project
- **Making up answers:** Inventing explanations rather than admitting uncertainty
- **Too detailed:** Giving 5-minute answers when a 30-second answer would suffice

---

## Tips for Success

### Before Recording

1. **Draft slides early:** Don't wait until the last minute
2. **Practice multiple times:** Time yourself—adjust content to fit 10-12 minutes
3. **Get feedback:** Show draft to teammates, friends, or other teams
4. **Prepare for questions:** Anticipate what you might be asked
5. **Test your demo:** If showing live results, have backup screenshots in case demo fails
6. **Check your tech:** Test recording software, microphone, screensharing

### During Recording

1. **Warm up:** Do a few practice runs right before recording
2. **Speak clearly:** Enunciate, maintain good pacing
3. **Show enthusiasm:** Energy is contagious—be excited about your work!
4. **Use transitions:** Clearly signal when moving between sections
5. **Point to visuals:** "As you can see in this graph..." guides audience attention
6. **Don't worry about perfection:** Small stumbles are fine—it's not Hollywood

### After Recording

1. **Watch your recording:** Would you find it engaging? Clear?
2. **Edit if needed:** Cut out long pauses, technical issues
3. **Check timing:** Is it within 10-12 minutes?
4. **Add captions:** Consider adding subtitles for accessibility
5. **Upload to YouTube:** Make sure link works and privacy settings are correct
6. **Submit link:** Include in your writeup, double-check it's accessible

### For Live Q&A

1. **Attend both days:** Engage with other teams' work
2. **Take notes on other presentations:** Prepare thoughtful questions
3. **Stay calm:** Take a breath before answering
4. **Collaborate with team:** Different members can answer different questions
5. **Enjoy it:** This is your chance to share something you worked hard on!

---

## Example Presentation Outline

Here's a concrete example for a hypothetical project on building an empathetic chatbot:

**Slide 1: Title**
- Project: "EmotiChat: Fine-Tuned Empathetic Dialogue System"
- Team: Alex Chen, Jordan Lee, Sam Patel
- Course: Models of Language and Conversation

**Slide 2: The Problem**
- Mental health support demand exceeds capacity
- Many people hesitant to seek traditional therapy
- Could LLMs provide supplementary emotional support?
- Research question: Can we fine-tune LLMs for empathetic, helpful responses?

**Slide 3: Related Work**
- Empathetic chatbots: Zhou et al. (2020), Rashkin et al. (2019)
- Fine-tuning for dialogue: Zhang et al. (2023)
- Gap: Limited work on counseling-style conversations
- Our contribution: Domain-specific fine-tuning + empathy evaluation

**Slide 4: Approach Overview**
- Base model: LLaMA-2-7B (open-source, reasonable size)
- Training data: 50K counseling conversations from ESConv dataset
- Method: LoRA fine-tuning (parameter-efficient)
- Evaluation: Automatic metrics + human evaluation of empathy

**Slide 5: Technical Details**
- LoRA configuration: rank=16, alpha=32, targeting Q/V matrices
- Training: 3 epochs, batch size 4, learning rate 2e-4
- Hardware: Google Colab with A100 GPU
- Baselines: GPT-3.5-turbo, non-fine-tuned LLaMA-2

**Slide 6: Evaluation Metrics**
- Automatic: Perplexity, BLEU, BERTScore
- Human: Empathy rating (1-5 scale), Helpfulness (1-5 scale)
- 100 test conversations, 3 raters per conversation

**Slide 7: Quantitative Results**
- Table showing metrics across models
- EmotiChat outperforms baselines on empathy (4.2 vs 3.5)
- Comparable helpfulness to GPT-3.5-turbo
- Lower perplexity than non-fine-tuned model

**Slide 8: Qualitative Examples**
- Side-by-side comparison of responses
- User: "I've been feeling really down lately"
- GPT-3.5: [generic response]
- EmotiChat: [more empathetic, specific response]
- Shows validation and reflection techniques

**Slide 9: Error Analysis**
- Types of failures: inappropriate advice (12%), overly formal (8%), off-topic (5%)
- Example failure case
- Suggests need for safety guardrails

**Slide 10: Limitations**
- Limited to text-only interaction (no voice, video)
- Dataset bias: Mostly young adults in US
- Doesn't replace professional therapy
- Risk of over-reliance or misuse

**Slide 11: Future Work**
- RLHF for better alignment with counseling practices
- Multi-turn consistency improvements
- Safety mechanisms: detecting crisis situations
- Expanding to other languages and cultures

**Slide 12: Conclusions**
- Fine-tuning LLMs for empathy is feasible and effective
- Significant improvement in empathy scores vs baselines
- Promising direction but requires careful safety considerations
- Could supplement (not replace) human mental health support

**Slide 13: Thank You**
- Thank you! Questions?
- Contact info, GitHub repo link

---

## Frequently Asked Questions

**Q: Can we go slightly over 12 minutes?**
A: Keep it to 12 minutes maximum. Practice and edit ruthlessly. If you have more to say, include it in your written report.

**Q: What if our results are negative or experiments failed?**
A: That's completely fine! Present what you did, analyze why it didn't work, and discuss what you learned. Negative results with good analysis are valuable.

**Q: Do we need to show our code in the presentation?**
A: Only if it illuminates a key point. Usually architecture diagrams or pseudocode are better than actual code. Your notebook is where code lives.

**Q: Can we do a live demo instead of a video?**
A: No, the video format is required. But you can include screen recordings of demos in your video.

**Q: What if we can't all be there in person for the live Q&A?**
A: All team members are expected to attend. If there's a legitimate conflict (illness, emergency), notify the instructor immediately.

**Q: How should we handle videos that are too long when we practice?**
A: Cut content—be more concise, remove less critical slides, speed up delivery slightly. Quality over quantity.

**Q: Should we acknowledge help from GenAI tools in the presentation?**
A: Briefly mentioning tools used is fine ("We implemented this using Claude for code generation"), but don't spend time on it. Focus on your contribution and results.

**Q: What video format should we use?**
A: Upload to YouTube—any standard video format works (MP4, MOV, etc.). Make sure it's accessible with the link you provide.

**Q: Can we use memes or humor?**
A: In moderation, yes! A well-placed joke or meme can make presentations more engaging. But keep it professional and don't overdo it.

---

## Technical Setup Guide

### Recording Your Video

**Option 1: Zoom**
1. Set up a Zoom meeting (just yourself)
2. Share screen with slides
3. Record locally (cloud recording also works)
4. Video will be saved as MP4 automatically

**Option 2: PowerPoint/Keynote**
1. PowerPoint: Slide Show → Record Slide Show
2. Keynote: Play → Record Slideshow
3. Export as video file

**Option 3: OBS Studio (Open Broadcaster Software)**
1. Free, powerful screen recording
2. More control over layout, sources
3. Steeper learning curve but professional results

**Option 4: QuickTime (Mac) or Windows Game Bar**
1. Simple built-in screen recording
2. Good for basic needs

### Uploading to YouTube

1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click "Create" → "Upload videos"
3. Select your video file
4. Add title: "[Course Code] [Team Names] - [Project Title]"
5. Add description with team names and brief summary
6. Set visibility: "Unlisted" (viewable with link but not publicly searchable)
7. Click "Publish"
8. Copy the link and include in your writeup

---

## Final Checklist

Before your presentation day:

- [ ] Video recorded and edited
- [ ] Video is 10-12 minutes long
- [ ] All team members participate in video
- [ ] Video uploaded to YouTube
- [ ] Link is accessible (test in incognito/private browser)
- [ ] Link included in written writeup
- [ ] Practiced Q&A with team
- [ ] All team members know the schedule and will attend
- [ ] Prepared slides/notes for Q&A reference
- [ ] Reviewed other teams' presentations to ask thoughtful questions

---

## Inspiration & Examples

While this is a new course without prior student examples, here are characteristics of excellent presentations:

**Clear structure:** Viewer can easily follow the logic from problem → approach → results → implications

**Visual storytelling:** Diagrams, examples, and visualizations make abstract concepts concrete

**Balanced detail:** Enough technical depth to demonstrate expertise, but not so much that non-experts are lost

**Honest assessment:** Acknowledges both successes and limitations thoughtfully

**Engaging delivery:** Speakers are enthusiastic, clear, and keep audience engaged

**Professional polish:** Slides are clean, audio is clear, transitions are smooth

---

## Resources

- **Presentation design:**
 - [Google Slides templates](https://docs.google.com/presentation/u/0/)
 - [Canva presentation templates](https://www.canva.com/presentations/templates/)

- **Recording tools:**
 - [Zoom](https://zoom.us)
 - [OBS Studio](https://obsproject.com/)

- **Color accessibility:**
 - [ColorBrewer](https://colorbrewer2.org/) (colorblind-safe palettes)
 - [Coolors](https://coolors.co/) (palette generator)

- **Presentation skills:**
 - [TED's secret to great public speaking](https://www.ted.com/talks/chris_anderson_tед_s_secret_to_great_public_speaking)
 - [How to give a great research talk (Simon Peyton Jones)](https://www.microsoft.com/en-us/research/academic-program/give-great-research-talk/)

---

## Questions?

If you have questions about presentation expectations, format, or logistics:
- **Discord:** Post in #final-project channel
- **Office Hours:** Schedule time to discuss
- **Email:** jeremy@dartmouth.edu

We're excited to see your presentations and learn about the amazing work you've done this quarter!

**Good luck!** 
