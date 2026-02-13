---
title: "PSYC 51.17: Models of Language and Communication"
geometry: margin=1in
header-includes:
  - \usepackage{fontspec}
  - \usepackage{booktabs}
  - \usepackage{needspace}
  - \directlua{luaotfload.add_fallback("emojifallback", {"NotoColorEmoji:mode=harf"})}
  - \defaultfontfeatures{RawFeature={fallback=emojifallback}}
  - \setmainfont{Fira Code}
output: pdf
---

## Course Information

| Item | Details |
|------|---------|
| Meeting times | MWF 10:10--11:15 |
| X-hour | Th 12:15--1:05 |
| Classroom | Moore 302 |
| Instructor | Dr. Jeremy R. Manning |
| Email | [jeremy@dartmouth.edu](mailto:jeremy@dartmouth.edu) |
| Office location | 349 Moore Hall |
| Office hours | [By appointment](https://context-lab.youcanbook.me) |

## Course Description

Recent advancements in Artificial Intelligence (AI) have led to the development of powerful large language models (LLMs) capable of generating human-like text. These models have revolutionized the way we think about language, cognition, and intelligence. This course introduces students to the various approaches used in building, studying, and using conversational agents. We will use readings, discussions, and hands-on demonstrations to explore historical approaches, current approaches, and hints about the "next generation" of these models.

We will investigate what these models can and cannot do from various cognitive, philosophical, computational, and ethical perspectives. A special focus will be on which aspects of human cognition, experiences, minds, and language these models can vs. cannot capture.

## Course Goals

This course is intended to train students to:

- Explore a variety of approaches to constructing conversational agents, including string manipulation models, rules-based (decision tree) models, and transformer-based models. Students will implement and train these models, largely from scratch, to gain a deep understanding of how they work.
- Understand different classic and modern approaches to text embeddings (LSA, LDA, word2vec, USE, BERT, etc.) and dimensionality reduction (PCA, UMAP). Students will use these approaches to carry out analyses of text corpora.
- Gain a general understanding of computational linguistic text analyses including part of speech tagging, sentiment analysis, etc. Again, students will implement and apply these tools to text data.
- Explore the psychological and cognitive applications of LLMs, such as modeling thought processes, language comprehension, and social cognition
- Critically assess the abilities and limitations of conversational agents in replicating human-like reasoning and understanding
- Discuss the philosophical and ethical implications of AI, including questions around consciousness, agency, and the future of AI
- Develop and implement experiments using LLMs to explore research questions in psychology and cognitive science

## Pre-Requisites

Students _must_ have prior experience with Python programming in order to enroll in this course. Prior coursework on statistics or probability (e.g., PSYC 10, AP Stats, or similar) is also highly recommended. An online statistics course is fine as a stand-in, but I will expect you to know about hypothesis testing, probability distributions, and have some intuitions about how to design and interpret statistical analysis before you start this course. Additional prior coursework and/or experience with linguistics, linear algebra, statistics, machine learning, artificial intelligence, data science, philosophy of mind, and/or creative writing will all be useful, but are not required.

## Course Materials

**We will use a variety of _freely available_ online materials and research papers, which will be provided throughout the course.** You will also need an internet-enabled computer or tablet capable of displaying and outputting graphics and running a standard web browser (e.g., Chrome or Firefox).

## Format and Overview

This course follows an **experiential learning** model. Students will engage with lecture materials through hands-on programming exercises, experiments with models and tools, and group discussions. Problem sets will deepen your understanding of the course material, and small projects will allow you to apply concepts to real-world research problems in the relevant domains.

Classes will include:

- **Lectures**: Foundational topics, discussions on implementing and leveraging conversational agents, text embeddings, and text analysis.
- **Hands-on Labs**: Experimenting with conversational agents, designing simple conversational agents, and conducting research using these models.
- **Problem Sets and Projects**: Bi-weekly problem sets to apply what you've learned. These will typically take the form of small-scale "research" projects.

## Platforms and Tools

- [**Google Colaboratory**](https://colab.research.google.com/): For developing and running Python code.
- [**Hugging Face Models**](https://huggingface.co/models): We will use pre-trained models available through [Hugging Face](https://huggingface.co)'s model hub.
- [**GitHub**](https://github.com/): Used for managing and sharing code, data, and project work.
- [**Discord**](https://discord.gg/sftEk9Ygdw): To facilitate discussions outside of class, share ideas, and collaborate on projects.

## Grading

Grades will be based on the following components:

- **Problem Sets** (75%): A total of 4 required problem sets designed to reinforce key concepts (each is worth 18.75% of the final course grade). An optional 5th problem set (Assignment 5) is available for extra credit.
- **Final Project** (25%): You will carry out a larger scale (relative to the problem sets) "research" project on a topic of your choosing. This will include:
  - Python code, organized as a Colaboratory notebook
  - A "presentation" to the class (also submitted as a YouTube video), along with an in-class discussion of your project
  - A brief (2--5 page) writeup of the main approach and key findings or takeaways

Students may work together on all of the assignments, unless otherwise noted in class or in the assignment instructions. However, **each student must submit their own problem set and indicate who they worked with**. Final projects will (typically) be completed in groups of 2--3 students, with the entire group turning in the same project (and receiving the same grade for it).

Grading Scale: A (93–100), A- (90–92), B+ (87–89), B (83–86), B- (80–82), C+ (77–79), C (73–76), C- (70–72), D (60–69), E (0–59). All grades will be rounded to the nearest integer (e.g., a 92.5 average will result in a final grade of "A", whereas a 92.4999 average will result in a final grade of "A-"). Out of fairness to all students in the course, there will be no "negotiations" about grading-- e.g., your grade will be determined solely by the numerical average of your assignment scores.

### Late Policy

Problem sets will receive a 10% deduction for each week late, rounded **up** to the nearest whole week (e.g., from a grading standpoint submitting an assignment 1 minute late is the same as submitting it 1 day late, is the same as submitting it 6 days late).

Your final project **must be submitted on time** in order to receive credit for it.

I strongly encourage you to submit your assignments _before_ the last possible moment to avoid grading penalties, unexpected circumstances (e.g., illness, emergencies, etc.).

## Academic Honor Principle

Students are expected to adhere to Dartmouth's Academic Honor Principle. You are encouraged to collaborate and discuss ideas with classmates, but all submitted work must be your own (aside from the final projects, which will be completed in small groups). If you're unsure about what constitutes a violation, please ask for clarification.

## Use of Generative AI

Given that this is a course about the technologies used to _make_ modern generative AIs like ChatGPT, Claude, Llama, Gemini, etc., you will be using these models extensively in class and in your assignments. There are just two "rules" about using GenAI:

- Most importantly, **you** are responsible for the content of your assignments, whether written by you "from scratch" or with the help of a GenAI agent.
- Second, you are bound by the Academic Honor Principle to acknowledge any use of GenAI in your work. This can be done by either using a brief comment in your code, by explicitly citing the tools you use, or by adding a note to the relevant section(s) of your assignment. Each situation is unique, but you need to make it clear exactly what work is your own vs. produced by GenAI. You must also include a chat history (including any prompts you used) as an addendum to your assignment(s).

## Scheduling Conflicts

Attendance is expected for all classes unless previously arranged. A critical part of the course is the in-class discussions and demos, and those will only work if you are physically present in class. If you anticipate any conflicts due to religious observances or other commitments, please inform the instructor by Week 2 to make appropriate arrangements.

## Student Needs

We strive to create an inclusive learning environment where all students feel supported and engaged. If you require any accommodations, please contact the Student Accessibility Services office, or discuss your needs with the instructor privately.

## Course Schedule

**Note:** Classes meet MWF 10:10--11:15. X-hours (Th 12:15--1:05) in the first four weeks will be used to make up for instructor absence February 23--27 (no classes that week).

| Week | Dates | Topics | Assignments |
|------|-------|--------|-------------|
| 1 | Jan 5--9 | Introduction, Pattern Matching, ELIZA | [Assignment 1](https://contextlab.github.io/llm-course/assignments/assignment-1/) released (Jan 9) |
| 2 | Jan 12--16 | Data Cleaning, Tokenization, Text Classification | [Assignment 2](https://contextlab.github.io/llm-course/assignments/assignment-2/) released (Jan 16) |
| 3 | Jan 19--23 | POS Tagging, Vibe Coding, Classical Embeddings | [Assignment 1](https://contextlab.github.io/llm-course/assignments/assignment-1/) due (Jan 19), [Assignment 3](https://contextlab.github.io/llm-course/assignments/assignment-3/) released (Jan 23) |
| 4 | Jan 26--30 | Word Embeddings, Contextual Embeddings, Dimensionality Reduction | [Assignment 2](https://contextlab.github.io/llm-course/assignments/assignment-2/) due (Jan 26) |
| 5 | Feb 2--6 | Transformer Architecture, Training, RAG | [Assignment 3](https://contextlab.github.io/llm-course/assignments/assignment-3/) due (Feb 6), [Assignment 4](https://contextlab.github.io/llm-course/assignments/assignment-4/) released (Feb 6) |
| 6 | Feb 9--13 | BERT, Encoder Variants, Language & Thought | |
| 7 | Feb 16--20 | Diffusion Models, Extensions, Applications & Ethics | [Assignment 4](https://contextlab.github.io/llm-course/assignments/assignment-4/) due (Feb 16), [Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) released (Feb 16), [Assignment 5](https://contextlab.github.io/llm-course/assignments/assignment-5/) available (optional/extra credit) |
| 8 | Feb 23--27 | **No classes** (instructor away) | Work on [Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) |
| 9 | Mar 2--6 | Agents and Tool Use, Mixture of Experts, Ethics | |
| 10 | Mar 9 | Final Project Presentations | [Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) due (Mar 9, 11:59 PM EST) |
| Finals | Mar 13 | | |

## Detailed Schedule

\needspace{3in}
### Week 1: Introduction & String Manipulation (January 5--9)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Jan 5 | Lecture 1 | Course Introduction, Is ChatGPT Conscious? | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture1.html), [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture1.pdf) | [Fedorenko et al. (2024)](https://www.nature.com/articles/s41586-024-07522-w), [Lupyan et al. (2020)](https://doi.org/10.1016/j.tics.2020.08.005) |
| Wed Jan 7 | Lecture 2 | Pattern Matching & ELIZA | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture2.html), [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture2.pdf) | [Weizenbaum (1966)](https://web.stanford.edu/class/cs124/p36-weizenabaum.pdf) |
| Thu Jan 8 | Lecture 3 | ELIZA Implementation | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture3.html), [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture3.pdf) | |
| Fri Jan 9 | Lecture 4 | Rules-Based Chatbots | [HTML](https://contextlab.github.io/llm-course/slides/week1/lecture4.html), [PDF](https://contextlab.github.io/llm-course/slides/week1/lecture4.pdf) | [Colby et al. (1971)](https://doi.org/10.1016/0004-3702%2871%2990002-6), **[Assignment 1](https://contextlab.github.io/llm-course/assignments/assignment-1/) Released** |
\needspace{3in}
### Week 2: Computational Linguistics (January 12--16)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Jan 12 | Lecture 5 | Data Cleaning & Preprocessing | [HTML](https://contextlab.github.io/llm-course/slides/week2/lecture5.html), [PDF](https://contextlab.github.io/llm-course/slides/week2/lecture5.pdf) | |
| Wed Jan 14 | Lecture 6 | Tokenization | [HTML](https://contextlab.github.io/llm-course/slides/week2/lecture6.html), [PDF](https://contextlab.github.io/llm-course/slides/week2/lecture6.pdf) | [Sennrich et al. (2016)](https://aclanthology.org/P16-1162/), [Kudo & Richardson (2018)](https://aclanthology.org/D18-2012/) |
| Thu Jan 15 | Lecture 7 | Text Classification Workshop | [HTML](https://contextlab.github.io/llm-course/slides/week2/lecture7.html), [PDF](https://contextlab.github.io/llm-course/slides/week2/lecture7.pdf) | |
| Fri Jan 16 | Lecture 7 (continued) | Text Classification Workshop | [HTML](https://contextlab.github.io/llm-course/slides/week2/lecture7.html), [PDF](https://contextlab.github.io/llm-course/slides/week2/lecture7.pdf) | **[Assignment 2](https://contextlab.github.io/llm-course/assignments/assignment-2/) Released** |
\needspace{3in}
### Week 3: Vibe Coding & Classical Embeddings (January 19--23)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Jan 19 | -- | Martin Luther King Jr. Day (No Class) | -- | **[Assignment 1](https://contextlab.github.io/llm-course/assignments/assignment-1/) Due (Jan 19, 11:59 PM EST)** |
| Wed Jan 21 | Lecture 8 | POS Tagging & Sentiment Analysis | [HTML](https://contextlab.github.io/llm-course/slides/week3/lecture8.html), [PDF](https://contextlab.github.io/llm-course/slides/week3/lecture8.pdf) | [Linzen et al. (2016)](https://aclanthology.org/Q16-1037/) |
| Thu Jan 22 | Lecture 9 | Vibe Coding Tips & Tricks | [HTML](https://contextlab.github.io/llm-course/slides/week3/lecture9.html), [PDF](https://contextlab.github.io/llm-course/slides/week3/lecture9.pdf) | [OpenCode](https://opencode.ai), [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), [spec-kit](https://github.com/github/spec-kit), [GitHub Copilot for Students](https://github.com/education/students), [Google Gemini for Students](https://gemini.google/students/) |
| Fri Jan 23 | Lecture 10 | Classical Embeddings (LSA, LDA) | [HTML](https://contextlab.github.io/llm-course/slides/week3/lecture10.html), [PDF](https://contextlab.github.io/llm-course/slides/week3/lecture10.pdf) | [Deerwester et al. (1990)](http://wordvec.colorado.edu/papers/Deerwester_1990.pdf), [Blei et al. (2003)](https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf), **[Assignment 3](https://contextlab.github.io/llm-course/assignments/assignment-3/) Released** |
\needspace{3in}
### Week 4: Word Embeddings & Modern Methods (January 26--30)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Jan 26 | Lecture 11 | Word Embeddings (Word2Vec, GloVe, FastText) | [HTML](https://contextlab.github.io/llm-course/slides/week4/lecture11.html), [PDF](https://contextlab.github.io/llm-course/slides/week4/lecture11.pdf) | [Mikolov et al. (2013)](https://arxiv.org/abs/1301.3781), [Pennington et al. (2014)](https://aclanthology.org/D14-1162/), [Bojanowski et al. (2017)](https://arxiv.org/abs/1607.04606), **[Assignment 2](https://contextlab.github.io/llm-course/assignments/assignment-2/) Due (Jan 26, 11:59 PM EST)** |
| Wed Jan 28 | Lecture 12 | Contextual Embeddings | [HTML](https://contextlab.github.io/llm-course/slides/week4/lecture12.html), [PDF](https://contextlab.github.io/llm-course/slides/week4/lecture12.pdf) | [Peters et al. (2018)](https://aclanthology.org/N18-1202/), [Cer et al. (2018)](https://arxiv.org/abs/1803.11175) |
| Thu Jan 29 | Lecture 13 | Dimensionality Reduction | [HTML](https://contextlab.github.io/llm-course/slides/week4/lecture13.html), [PDF](https://contextlab.github.io/llm-course/slides/week4/lecture13.pdf) | [McInnes & Healy (2018)](https://arxiv.org/pdf/1802.03426) |
| Fri Jan 30 | Lecture 14 | Cognitive Models of Semantic Representation | [HTML](https://contextlab.github.io/llm-course/slides/week4/lecture14.html), [PDF](https://contextlab.github.io/llm-course/slides/week4/lecture14.pdf) | [Anderson et al. (2016)](https://www.jneurosci.org/content/36/45/11444) |
\needspace{3in}
### Week 5: Transformer Architecture (February 2--6)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Feb 2 | Lecture 15 | Transformer Architecture | [HTML](https://contextlab.github.io/llm-course/slides/week5/lecture15.html), [PDF](https://contextlab.github.io/llm-course/slides/week5/lecture15.pdf) | [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762), [The Animated Transformer](https://prvnsmpth.github.io/animated-transformer/) |
| Wed Feb 4 | Lecture 16 | Training Transformers | [HTML](https://contextlab.github.io/llm-course/slides/week5/lecture16.html), [PDF](https://contextlab.github.io/llm-course/slides/week5/lecture16.pdf) | [Kaplan et al. (2020)](https://arxiv.org/abs/2001.08361) |
| Fri Feb 6 | Lecture 17 | Retrieval Augmented Generation (RAG) | [HTML](https://contextlab.github.io/llm-course/slides/week5/lecture17.html), [PDF](https://contextlab.github.io/llm-course/slides/week5/lecture17.pdf) | [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401), **[Assignment 3](https://contextlab.github.io/llm-course/assignments/assignment-3/) Due**, **[Assignment 4](https://contextlab.github.io/llm-course/assignments/assignment-4/) Released** |
\needspace{3in}
### Week 6: Encoder Models (February 9--13)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Feb 9 | Lecture 18 | BERT Deep Dive | [HTML](https://contextlab.github.io/llm-course/slides/week6/lecture18.html), [PDF](https://contextlab.github.io/llm-course/slides/week6/lecture18.pdf) | [Devlin et al. (2019)](https://aclanthology.org/N19-1423/) |
| Wed Feb 11 | Lecture 19 | BERT Variants | [HTML](https://contextlab.github.io/llm-course/slides/week6/lecture19.html), [PDF](https://contextlab.github.io/llm-course/slides/week6/lecture19.pdf) | [Liu et al. (2019)](https://arxiv.org/abs/1907.11692), [Sanh et al. (2019)](https://arxiv.org/abs/1910.01108) |
| Fri Feb 13 | Lecture 20 | Language, Thought, and Other Brains | [HTML](https://contextlab.github.io/llm-course/slides/week6/lecture20.html), [PDF](https://contextlab.github.io/llm-course/slides/week6/lecture20.pdf) | [Stephens et al. (2010)](https://doi.org/10.1073/pnas.1008662107), [Schrimpf et al. (2021)](https://doi.org/10.1073/pnas.2105646118) |
\needspace{3in}
### Week 7: Diffusion Models (February 16--20)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Feb 16 | Lecture 21 | Diffusion Models | [HTML](https://contextlab.github.io/llm-course/slides/week7/lecture21.html), [PDF](https://contextlab.github.io/llm-course/slides/week7/lecture21.pdf) | [Ho et al. (2020)](https://arxiv.org/abs/2006.11239), [Song & Ermon (2019)](https://arxiv.org/abs/1907.05600), **[Assignment 4](https://contextlab.github.io/llm-course/assignments/assignment-4/) Due (Feb 16, 11:59 PM EST)**, **[Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) Released**, **[Assignment 5](https://contextlab.github.io/llm-course/assignments/assignment-5/) Available (Optional/Extra Credit)** |
| Wed Feb 18 | Lecture 22 | Diffusion Model Extensions | [HTML](https://contextlab.github.io/llm-course/slides/week7/lecture22.html), [PDF](https://contextlab.github.io/llm-course/slides/week7/lecture22.pdf) | [Rombach et al. (2022)](https://arxiv.org/abs/2112.10752), [Peebles & Xie (2023)](https://arxiv.org/abs/2212.09748) |
| Fri Feb 20 | Lecture 23 | Diffusion Applications and Ethics | [HTML](https://contextlab.github.io/llm-course/slides/week7/lecture23.html), [PDF](https://contextlab.github.io/llm-course/slides/week7/lecture23.pdf) | [Ramesh et al. (2022)](https://arxiv.org/abs/2204.06125), [OpenAI (2024) - Sora](https://openai.com/research/video-generation-models-as-world-simulators) |
### Week 8: No Classes (February 23--27)

Instructor away February 23--27. No classes this week. Use this time to work on your [final project](https://contextlab.github.io/llm-course/assignments/final-project/).

\needspace{3in}
### Week 9: Advanced Topics (March 2--6)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Mar 2 | Lecture 24 | Agents and Tool Use | [HTML](https://contextlab.github.io/llm-course/slides/week9/lecture24.html), [PDF](https://contextlab.github.io/llm-course/slides/week9/lecture24.pdf) | [Yao et al. (2023)](https://arxiv.org/abs/2210.03629), [Schick et al. (2023)](https://arxiv.org/abs/2302.04761) |
| Wed Mar 4 | Lecture 25 | Mixture of Experts & Efficiency | [HTML](https://contextlab.github.io/llm-course/slides/week9/lecture25.html), [PDF](https://contextlab.github.io/llm-course/slides/week9/lecture25.pdf) | [Fedus et al. (2022)](https://arxiv.org/abs/2101.03961), [Jiang et al. (2024)](https://arxiv.org/abs/2401.04088) |
| Fri Mar 6 | Lecture 26 | Ethics, Bias, and Safety | [HTML](https://contextlab.github.io/llm-course/slides/week9/lecture26.html), [PDF](https://contextlab.github.io/llm-course/slides/week9/lecture26.pdf) | [Bender et al. (2021)](https://dl.acm.org/doi/10.1145/3442188.3445922) |
\needspace{2in}
### Week 10: Final Project Presentations (March 9)

| Day | Lecture | Topics | Slides | Materials |
|-----|---------|--------|--------|-----------|
| Mon Mar 9 | Lecture 27 | Final Project Presentations & Wrap-up | -- | Last day of classes, **[Final Project](https://contextlab.github.io/llm-course/assignments/final-project/) Due (Mar 9, 11:59 PM EST)** |
### Final Exam Period (March 13--17)

No additional submissions required. Final project materials were due March 9.
  