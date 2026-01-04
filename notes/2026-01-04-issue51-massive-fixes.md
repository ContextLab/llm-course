# Issue 51: Massive Set of Fixes and Edits

**Started:** 2026-01-04
**Status:** In Progress

## Overview

This issue requires comprehensive fixes across multiple areas to prepare the course for launch.

## Task Categories

### 1. Assignment Setup
- [ ] Create systems for syncing README files to assignment repos
- [ ] Add assignment repos as submodules
- [ ] Create autograder scripts for teaching-tools repo
- [ ] Create compile script for feedback PDFs
- [ ] Create template notebooks for each assignment
- [ ] Create detailed GitHub tutorial
- [ ] Add submission instructions to READMEs
- [ ] Update deadlines everywhere

**New Deadlines (from issue):**
- Assignment 1: Jan 16 11:59PM EST
- Assignment 2: Jan 23 11:59PM EST
- Assignment 3: Jan 30 11:59PM EST
- Assignment 4: Feb 6 11:59PM EST
- Assignment 5: Feb 13 11:59PM EST
- Final Project: March 9 11:59PM EST

**Assignment Repositories:**
- Assignment 1: https://github.com/ContextLab/eliza-llm-course
- Assignment 2: https://github.com/ContextLab/spam-classifier-llm-course
- Assignment 3: https://github.com/ContextLab/embeddings-llm-course
- Assignment 4: https://github.com/ContextLab/customer-service-bot-llm-course
- Assignment 5: https://github.com/ContextLab/gpt-llm-course
- Final Project: https://github.com/ContextLab/final-project-llm-course

### 2. Canvas Setup
- [ ] Draft assignment descriptions with links and submission instructions
- [ ] Draft course description with links to syllabus, outline, demo

### 3. Slide Edits (Weeks 2-10 only, NOT 1-2)
- [ ] Remove excessive emojis
- [ ] Make content simple and clear
- [ ] Follow tone/style of lectures 1 and 2

### 4. Demo Fixes

#### All Demos:
- [ ] Remove emojis
- [ ] Match main website style
- [ ] Use native JS libraries with consistent theming

#### Tokenization Demo Issues:
- [ ] Add description of what is happening
- [ ] Fix "Tokenize" button on "Tokenizer Comparison" tab
- [ ] Add explanation for "BPE Step-by-Step" tab
- [ ] Fix "Current State" animation for dark mode
- [ ] Fix Merge tree visualization for dark mode
- [ ] Fix mode selection theme
- [ ] Fix flow (text entry and "start visualization" separated by mode selection)
- [ ] Clarify difference between "start visualization" and "auto play"
- [ ] Fix search functionality (vocabulary browser)
- [ ] Fix token ID and Token possibly swapped for some tokenizers
- [ ] Remove "special tokens" stat

#### POS Tagging Demo Issues:
- [ ] Fix passage selection to parse more than first sentence
- [ ] Update colors for dark/light theme visibility
- [ ] Fix named entity demo

#### Sentiment Analysis Demo Issues:
- [ ] Update theming/colors for visibility
- [ ] Reduce dataset to 100 reviews
- [ ] Add dropdown menu for single text
- [ ] Fix word-level sentiment contribution
- [ ] Clarify model comparison box
- [ ] Clarify confusion matrix (which model(s))
- [ ] Add breakdown/architecture tab

#### Embeddings Comparison Demo Issues:
- [ ] Move example text selection near text entry
- [ ] Fix graph theming
- [ ] Fix "solve analogy" button
- [ ] Fix "speed vs. quality" plot in categorization test
- [ ] Remove "Custom Test" tab

#### Topic Modeling Studio Issues:
- [ ] Fix plot theming
- [ ] Add ability to close plots after clicking topics
- [ ] Add variable sizing to word clouds
- [ ] Fix inter-topic distance (should show top words)
- [ ] Fix top words per topic slider

#### All Other Demos:
- [ ] Add "in progress" warning

## Files to Update for Deadlines

Based on explore agent findings:
- `/admin/syllabus.md`
- `/slides/README.md`
- `/assignments/README.md`
- `/syllabus/index.html`
- `/index.html`
- Individual assignment README files

## Progress Log

### 2026-01-04 14:23
- Created initial task breakdown
- Launched background agents to explore demos
- Collected comprehensive information about demo structures

### 2026-01-04 14:XX (Session 2)
**COMPLETED:**
1. **Deadline updates** - Updated in:
   - `admin/syllabus.md`
   - `assignments/README.md`  
   - `slides/README.md`

2. **Warning banners** - Added "Work in Progress" banners to ALL demos:
   - Added `.demo-warning-banner` CSS class to `demos/shared/css/demo-styles.css`
   - Added banners to: eliza, chatbot-evolution, tokenization, embeddings, attention, 
     bert-mlm, analogies, semantic-search, transformer, rag, gpt-playground

3. **Emoji removal** - Removed emojis from all demo HTML/JS files:
   - eliza/index.html
   - tokenization/index.html  
   - embeddings/index.html
   - embeddings-comparison/index.html + js/comparison-app.js
   - transformer/index.html + js/component-explorer.js
   - semantic-search/index.html
   - sentiment/index.html (kept functional emojis for sentiment analysis)
   - chatbot-evolution/test-alice.html + test-alice-comprehensive.html

### 2026-01-04 14:23 (Session 3 - Current)
**COMPLETED:**
1. **Demo theming fixes** - All done:
   - Tokenization: dark mode colors for tokens, BPE, merge tree, mode selection, chart text
   - POS Tagging: dark mode colors for tokens and NER entities with CSS variables
   - Sentiment: dark mode word contribution colors
   - Topic Modeling: Added Plotly theme support for all charts (inter-topic, distributions, word bars)
   - Embeddings Comparison: Already properly themed with CSS variables

2. **Committed all changes**: `3f64076`
   - 31 files changed, 489 insertions, 166 deletions

**STILL PENDING:**
- Assignment setup (submodules, autograders, templates, tutorial, submission instructions)
- Canvas content drafts
- Slide cleanup weeks 2-10
- End-to-end testing
