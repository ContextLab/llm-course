# Canvas Content Drafts

Content for the Canvas course site: https://canvas.dartmouth.edu/courses/76824

---

## Course Home Page

### Course Description

Recent advancements in Artificial Intelligence have led to the development of powerful large language models (LLMs) capable of generating human-like text. This course introduces students to the various approaches used in building, studying, and using conversational agents. Through readings, discussions, and hands-on programming exercises, we will explore historical approaches (ELIZA, PARRY), current transformer-based models (BERT, GPT), and emerging techniques (RAG, Mixture of Experts).

We will investigate what these models can and cannot do from cognitive, philosophical, computational, and ethical perspectives, with special focus on which aspects of human cognition and language these models can vs. cannot capture.

### Quick Links

- [Course Syllabus (PDF)](https://github.com/ContextLab/llm-course/blob/main/admin/syllabus.pdf)
- [Course Website](https://context-lab.com/llm-course/)
- [Lecture Slides](https://context-lab.com/llm-course/slides/)
- [Interactive Demos](https://context-lab.com/llm-course/demos/)
- [Assignments](https://context-lab.com/llm-course/assignments/)
- [Discord Server](https://discord.gg/sftEk9Ygdw)

### Course Information

| Item | Details |
|------|---------|
| Meeting times | MWF 10:10-11:15 |
| X-hour | Th 12:15-1:05 |
| Classroom | Moore 302 |
| Instructor | Dr. Jeremy R. Manning |
| Email | jeremy@dartmouth.edu |
| Office | 349 Moore Hall |
| Office hours | [By appointment](https://context-lab.youcanbook.me) |

---

## Assignments Module

### Assignment Overview

All assignments are submitted via GitHub Classroom. Each assignment page has an "Accept Assignment" button that creates your personal repository.

**How to Submit:**
1. Click "Accept Assignment" on the assignment page
2. Clone your repository or open in Google Colab
3. Complete the work following the instructions
4. Commit and push your changes before the deadline
5. Your latest commit at the deadline is your submission

**Late Policy:** 10% deduction per week late (rounded up). Final project must be on time.

**Grading Criteria:**
- Correctness (does your code work?)
- Code Quality (is it well-organized and documented?)
- Understanding (do your explanations show mastery?)

---

### Assignment 1: ELIZA Chatbot

**Due: January 16, 11:59 PM EST | Weight: 15%**

Build a pattern-matching chatbot based on Weizenbaum's classic ELIZA program (1966). You will implement string manipulation and regular expressions to create a conversational agent that simulates a Rogerian psychotherapist.

**Learning Objectives:**
- Understand the foundations of conversational AI
- Master regular expressions for pattern matching
- Implement text transformation rules

[View Assignment Instructions](https://context-lab.com/llm-course/assignments/assignment-1/) | [Accept Assignment](https://classroom.github.com/a/SC1jeftp)

---

### Assignment 2: SPAM Classifier

**Due: January 23, 11:59 PM EST | Weight: 15%**

Develop a text classification system to identify spam messages. You will explore different feature engineering approaches, implement tokenization strategies, and evaluate classifier performance using standard metrics.

**Learning Objectives:**
- Apply text preprocessing and tokenization
- Engineer features for text classification
- Evaluate models using precision, recall, and F1 score

[View Assignment Instructions](https://context-lab.com/llm-course/assignments/assignment-2/) | [Accept Assignment](https://classroom.github.com/a/ttYZnDoc)

---

### Assignment 3: Wikipedia Embeddings

**Due: January 30, 11:59 PM EST | Weight: 15%**

Compare different text embedding methods (LSA, Word2Vec, BERT) on Wikipedia articles. You will visualize semantic relationships in embedding space and evaluate how well different methods capture meaning.

**Learning Objectives:**
- Understand classic and modern embedding approaches
- Apply dimensionality reduction for visualization
- Evaluate embedding quality quantitatively

[View Assignment Instructions](https://context-lab.com/llm-course/assignments/assignment-3/) | [Accept Assignment](https://classroom.github.com/a/0ofsYcmO)

---

### Assignment 4: Customer Service Chatbot

**Due: February 6, 11:59 PM EST | Weight: 15%**

Create a context-aware customer service chatbot using transformer-based models. You will implement retrieval-augmented generation to answer questions based on a knowledge base.

**Learning Objectives:**
- Work with pre-trained transformer models
- Implement retrieval-augmented generation (RAG)
- Handle multi-turn conversations with context

[View Assignment Instructions](https://context-lab.com/llm-course/assignments/assignment-4/) | [Accept Assignment](https://classroom.github.com/a/RYMMhVAL)

---

### Assignment 5: Build GPT

**Due: February 13, 11:59 PM EST | Weight: 15%**

Implement and train a small GPT model from scratch. You will build the transformer architecture piece by piece, including self-attention, positional encoding, and autoregressive text generation.

**Learning Objectives:**
- Implement the transformer architecture from scratch
- Understand attention mechanisms deeply
- Train a language model and generate text

[View Assignment Instructions](https://context-lab.com/llm-course/assignments/assignment-5/) | [Accept Assignment](https://classroom.github.com/a/8Wsa-bUG)

---

### Final Project: Research Project

**Due: March 9, 11:59 PM EST | Weight: 25%**

Conduct an independent research project applying concepts from the course to a question of your choosing. Work in groups of 2-3 to explore a novel application of language models.

**Deliverables:**
- Python code as a Colab notebook
- Class presentation (also submitted as YouTube video)
- Written report (2-5 pages)

**Learning Objectives:**
- Apply course concepts to a novel problem
- Conduct independent research
- Communicate findings effectively

[View Project Guidelines](https://context-lab.com/llm-course/assignments/final-project/) | [Accept Assignment](https://classroom.github.com/a/IFw74DY7)

---

## Syllabus Page

The complete syllabus including course policies, grading breakdown, and detailed weekly schedule is available here:

[Download Syllabus (PDF)](https://github.com/ContextLab/llm-course/blob/main/admin/syllabus.pdf)

### Key Policies

**Grading:**
- Problem Sets: 75% (5 assignments, 15% each)
- Final Project: 25%

**Scale:** A (93-100), A- (90-92), B+ (87-89), B (83-86), B- (80-82), C+ (77-79), C (73-76), C- (70-72), D (60-69), E (0-59)

**GenAI Policy:** You may use generative AI tools (ChatGPT, Claude, etc.) but you must (1) take responsibility for all submitted content and (2) acknowledge any AI assistance with a note and chat history.

**Academic Honor:** Collaboration is encouraged, but each student must submit their own work and acknowledge collaborators.

---

## Resources Page

### Interactive Demos

Explore course concepts hands-on with our collection of 15 browser-based demos:

[Browse All Demos](https://context-lab.com/llm-course/demos/)

**Featured:**
- [ELIZA Chatbot](https://context-lab.com/llm-course/demos/eliza/) - Chat with the 1966 pattern-matching therapist
- [Tokenization Explorer](https://context-lab.com/llm-course/demos/tokenization/) - Compare BPE, WordPiece, and more
- [Word Embeddings](https://context-lab.com/llm-course/demos/embeddings/) - Visualize semantic relationships in 3D
- [Attention Mechanism](https://context-lab.com/llm-course/demos/attention/) - See attention weights in real-time
- [Transformer Architecture](https://context-lab.com/llm-course/demos/transformer/) - Step through layers interactively

### Tools We Use

- [Google Colaboratory](https://colab.research.google.com/) - Python notebooks in the cloud
- [Hugging Face](https://huggingface.co/) - Pre-trained models and datasets
- [GitHub](https://github.com/) - Version control and assignment submission
- [Discord](https://discord.gg/sftEk9Ygdw) - Class discussions and Q&A

### Getting Help

- **Office Hours:** [Book an appointment](https://context-lab.youcanbook.me)
- **Discord:** Post questions in the appropriate channel
- **GitHub Tutorial:** [Step-by-step guide for beginners](https://context-lab.com/llm-course/admin/github-tutorial.html)
