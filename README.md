# Models of Language and Conversation

Welcome!  This repository contains course materials for the Dartmouth undergraduate course on large language models and chatbots (conversational agents).  The syllabus may be found [here](https://github.com/ContextLab/llm-course/blob/main/admin/syllabus.pdf).  Feel free to follow along with the course materials (whether you are officially enrolled in the course or just visiting!), submit comments and suggestions, etc.  An outline of the course materials, including links to lecture and discussion videos and assignments may be found [here](https://github.com/ContextLab/llm-course/blob/main/slides/README.md).

<p align="center">
  <img src="https://raw.githubusercontent.com/ContextLab/llm-course/main/admin/readme_robot.png" alt="robot" width="400"/>
</p>

## 🎮 Interactive Web Demos

Learn by doing with our collection of **15 interactive web demonstrations** that bring NLP concepts to life! Each demo runs entirely in your browser with no installation required.

**🌐 Explore all demos:** [https://contextlab.github.io/llm-course/demos/](https://contextlab.github.io/llm-course/demos/)

### Featured Demos

- **[ELIZA Chatbot](https://contextlab.github.io/llm-course/demos/eliza/)** - Chat with the groundbreaking 1966 pattern-matching therapist and experience the ELIZA effect firsthand
- **[Embeddings Visualization](https://contextlab.github.io/llm-course/demos/embeddings/)** - Explore word embeddings in interactive 3D space, rotate and zoom to discover semantic relationships
- **[Transformer Explorer](https://contextlab.github.io/llm-course/demos/transformer/)** - Step through the transformer architecture layer by layer with real-time visualizations of attention, feedforward networks, and residual connections
- **[Tokenization Explorer](https://contextlab.github.io/llm-course/demos/tokenization/)** - Compare BPE, WordPiece, and SentencePiece algorithms side-by-side
- **[Attention Mechanism](https://contextlab.github.io/llm-course/demos/attention/)** - Watch attention weights update in real-time as you modify input sequences

### All Demos

Our complete collection covers: ELIZA, tokenization, embeddings, attention mechanisms, transformer architecture, GPT playground, RAG systems, topic modeling, sentiment analysis, POS tagging, word analogies, semantic search, BERT masked language modeling, embeddings comparison, and chatbot evolution. Browse the [demo collection](https://contextlab.github.io/llm-course/demos/) to explore them all!

## 🧪 Running Tests

For developers contributing to this repository, we have a comprehensive test suite covering all 15 demos:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific demo tests
npm run test:demo01  # ELIZA
npm run test:demo02  # Tokenization
# ... etc for demos 01-15
```

The test suite includes 1,500+ tests covering unit tests, integration tests, and regression tests to ensure all demos function correctly. CI/CD runs automatically on all pull requests.

## A note about this Open Course
This course is taught as an *Open Course*, meaning that the course is designed from the ground up to be shareable and freely accessible to anyone.  All code for this course is written in [Python](https://www.python.org/) and most of the material is organized in [Jupyter notebooks](http://jupyter.org/).

Feel free to follow along with this course, do the assignments, post questions and/or issues to this repository or Discord, suggest changes, etc.  However, I won't formally evaluate your submitted work unless you are a Dartmouth student who is currently enrolled.

If you are a course instructor teaching overlapping material, feel free to borrow any materials used in this course!  If you directly copy (or "draw heavy inspiration from") the materials, I would appreciate a citation (e.g., a pointer to this repository).  I'd also love to hear from you about how you're using this resource!

This course is a continually evolving work in progress.  I plan to update the material to keep the syllabus fresh and relevant.  By the same token, although my goal is 100% accuracy and currency, it's unlikely that I'll achieve that goal.  You should participate with the understanding that this material will likely have occasional mistakes, ommissions, errors, etc.  Given this fact, one way to approach the course is to maintain an open yet critical view of the material.  If you think there's a mistake, I encourage you to bring it to my attention!

# Student instructions

## Overview
We will use the following tools in this course:
- [GitHub](https://www.github.com): used to download code and data, collaborate with other students, and submit course assignments
- [Google Colaboratory](https://colab.research.google.com/): a Google resource we will use to write code, download data, and run analyses
- [Discord](https://discord.com/): used to coordinate all course communication.  Use this link to join our class server:

[![](https://dcbadge.vercel.app/api/server/sftEk9Ygdw)](https://discord.gg/sftEk9Ygdw)

## Setup 
1. Start by creating a free [GitHub account](https://www.github.com) if you don't already have one.  (If you already have an account, you may use it for this course.)
2. Next, sign into the course's [Discord workspace](https://discord.gg/sftEk9Ygdw).  You can ask questions and get help with all aspects of the course via our Discord community.  You'll need to create a (free) Discord account.
3. If you don't already have one, create a [Google account](http://google.com/).  (If you already have an account, you may use it for this course.) Make sure you can sign into Colaboratory using [this link](https://colab.research.google.com/).
