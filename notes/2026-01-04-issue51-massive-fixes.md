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
- Assignment setup: submodules, autograders, template notebooks
- Canvas content drafts
- Slide cleanup weeks 2-10
- End-to-end testing

### 2026-01-04 14:23 (Session 4 - Current)

**COMPLETED:**

1. **GitHub Classroom submission instructions** - Added to ALL assignment READMEs:
   - Assignment 1 (ELIZA): `eliza-llm-course`, deadline Jan 16
   - Assignment 2 (SPAM): `spam-classifier-llm-course`, deadline Jan 23
   - Assignment 3 (Wikipedia): `embeddings-llm-course`, deadline Jan 30
   - Assignment 4 (Customer Service): `customer-service-bot-llm-course`, deadline Feb 6
   - Assignment 5 (GPT): `gpt-llm-course`, deadline Feb 13
   - Final Project: `final-project-llm-course`, deadline Mar 9
   - **Commit:** `48796f2`

2. **GitHub tutorial for students** - Created `admin/github-tutorial.md`:
   - Git/GitHub basics explanation
   - Installation instructions (Mac, Windows, Linux)
   - Accepting assignments via GitHub Classroom
   - Cloning, working, and submitting workflow
   - Authentication setup (PAT, SSH keys)
   - Common issues and troubleshooting
   - Quick reference commands
   - **Commit:** `565bd93`

**REMAINING HIGH-PRIORITY TASKS:**

1. **Template notebooks** - Each assignment repo needs:
   - Starter `.ipynb` notebook with skeleton functions
   - Any required data files (e.g., `instructions.txt` for ELIZA)
   - Currently repos only have README.md, LICENSE, .gitignore

2. **Autograder scripts** - Need to create in `ContextLabCourses/teaching-tools/llm-course/assignments/`:
   - `eliza/autograde.py`
   - `spam-classifier/autograde.py`
   - `embeddings/autograde.py`
   - `customer-service-bot/autograde.py`
   - `gpt/autograde.py`
   - `final-project/autograde.py`
   - Should combine automated tests + LLM evaluation (per Issue #50)

3. **Report generation** - Scripts to:
   - Generate markdown reports from autograder results
   - Compile to PDF via pandoc
   - Batch generate for all students

**DEFERRED TASKS:**
- Submodules: Complex workflow, may need instructor input on whether this is the right approach
- Canvas content: Waiting for course to be ready
- Slide cleanup: Lower priority, weeks 2-10 only

### 2026-01-04 14:23 (Session 5 - Current)

**COMPLETED:**

1. **Template notebooks pushed to ALL assignment repositories**:
   
   | Repository | Notebook | Data Files | Commit |
   |------------|----------|------------|--------|
   | `eliza-llm-course` | `Assignment1_ELIZA.ipynb` | `instructions.txt` | (previous session) |
   | `spam-classifier-llm-course` | `Assignment2_SPAM_Classifier.ipynb` | `training.zip` (20MB) | `12b6f90` |
   | `embeddings-llm-course` | `Assignment3_Wikipedia_Embeddings.ipynb` | Downloads from Dropbox | `22f7091` |
   | `customer-service-bot-llm-course` | `Assignment4_Customer_Service_Chatbot.ipynb` | HuggingFace datasets | `5ed5051` |
   | `gpt-llm-course` | `Assignment5_GPT.ipynb` | Downloads Shakespeare | `2d9c6ec` |
   | `final-project-llm-course` | `FinalProject_Template.ipynb` | N/A | `ea98f0e` |

2. **Notebook features**:
   - All notebooks run in Google Colab with GPU support
   - Auto-install dependencies (`!pip install`)
   - Auto-download datasets
   - Clear markdown sections matching assignment structure
   - TODO placeholders for student implementation
   - Set random seeds for reproducibility

**REMAINING TASKS:**

1. **Autograder scripts** - Still needed in `ContextLabCourses/teaching-tools`
2. **Canvas content** - Course description, assignment descriptions
3. **Slide cleanup** - Weeks 2-10 (lower priority)

## Current Commits (Issue 51)

| Commit | Description |
|--------|-------------|
| `3f64076` | Demo fixes: dark mode theming, emoji removal, warning banners |
| `43c9660` | Update Issue 51 progress notes |
| `48796f2` | Add GitHub Classroom submission instructions to all assignments |
| `565bd93` | Add GitHub tutorial for students |

## External Repository Commits (Assignment Templates)

| Repository | Commit | Description |
|------------|--------|-------------|
| `eliza-llm-course` | (prev) | Add starter notebook + instructions.txt |
| `spam-classifier-llm-course` | `12b6f90` | Add starter notebook + training.zip |
| `embeddings-llm-course` | `22f7091` | Add starter notebook |
| `customer-service-bot-llm-course` | `5ed5051` | Add starter notebook |
| `gpt-llm-course` | `2d9c6ec` | Add starter notebook |
| `final-project-llm-course` | `ea98f0e` | Add template notebook |

### 2026-01-04 14:23 (Session 6 - Current)

**COMPLETED DEMO FIXES:**

| Commit | Demo | Fix |
|--------|------|-----|
| `c2bcd87` | POS Tagging | Parse all sentences in passage, not just first |
| `92876c0` | Embeddings Comparison | Dynamic analogy candidates for presets (royalty, capitals, grammar, tense) |
| `776509c` | POS Tagging | Correct NER entity matching logic (was checking backwards) |
| `4db5d35` | Sentiment | Lower word contribution threshold (0.1 -> 0.05) for better highlighting |
| `76390c9` | Topic Modeling | Make top words slider functional (was hardcoded at 10-15) |

**HIGH-PRIORITY ITEMS REMAINING:**

1. **Tokenization Demo:**
   - Fix Tokenize button on Tokenizer Comparison tab (may need browser testing)
   - Fix search/vocabulary browser functionality

2. **Autograder scripts** - Create in `ContextLabCourses/teaching-tools`

**MEDIUM-PRIORITY REMAINING:**

- SENTIMENT: Reduce dataset to 100 reviews  
- SENTIMENT: Add dropdown menu for single text
- EMBEDDINGS: Move example text near text entry
- EMBEDDINGS: Remove Custom Test tab
- TOPIC MODELING: Add close button for plots

**LOW-PRIORITY:**
- Slide cleanup weeks 2-10
- Canvas content drafts

### 2026-01-04 14:22 (Session 7 - Current)

**COMPLETED DEMO FIXES:**

| Commit | Demo | Fix |
|--------|------|-----|
| `ea03bcb` | Tokenization | Fix Tokenize button - move setupEventListeners before loadTokenizers + robust vocab access |
| `66c002e` | Embeddings Comparison | Remove Custom Test tab and all related JS code |
| `b495d30` | Sentiment | Reduce sample dataset to 100 reviews (50 pos, 50 neg) |
| `070ec00` | Topic Modeling | Add close button for topic details panel in inter-topic view |

**ALL TESTS PASSING:**
- Tokenization: 141/141 tests
- Embeddings Comparison: 84/84 tests
- Sentiment: 97/97 tests
- Topic Modeling: 93/93 tests

**HIGH-PRIORITY REMAINING:**
- Create autograder scripts in `ContextLabCourses/teaching-tools`

**LOW-PRIORITY REMAINING:**
- Slide cleanup weeks 2-10
- Canvas content drafts
- Other minor demo polish items

## TODO State Summary (Session 7)

| ID | Task | Status |
|----|------|--------|
| 1 | TOKENIZATION: Fix Tokenize button | **completed** |
| 3 | TOKENIZATION: Fix search/vocabulary browser | **completed** |
| 5 | POS TAGGING: Fix parse all sentences | **completed** |
| 6 | POS TAGGING: Fix named entity demo | **completed** |
| 7 | SENTIMENT: Reduce dataset to 100 reviews | **completed** |
| 8 | SENTIMENT: Fix word-level contribution | **completed** |
| 10 | EMBEDDINGS: Fix solve analogy button | **completed** |
| 12 | EMBEDDINGS: Remove Custom Test tab | **completed** |
| 13 | TOPIC MODELING: Fix inter-topic distance | **completed** |
| 14 | TOPIC MODELING: Fix top words slider | **completed** |
| 15 | TOPIC MODELING: Add close button for plots | **completed** |
| 16 | Create autograder scripts | **completed** |

### 2026-01-04 14:23 (Session 8 - Current)

**COMPLETED:**

1. **Autograder scripts committed and pushed** to `ContextLabCourses/teaching-tools`:
   - Commit: `f912440`
   - Location: `llm-course/assignments/`
   - Files created:
     - `base_autograder.py` - Base class with notebook execution, LLM evaluation
     - `__init__.py` - Package init
     - `README.md` - Usage documentation
     - `eliza/autograde.py` - Assignment 1 grader
     - `spam-classifier/autograde.py` - Assignment 2 grader
     - `embeddings/autograde.py` - Assignment 3 grader
     - `customer-service-bot/autograde.py` - Assignment 4 grader
     - `gpt/autograde.py` - Assignment 5 grader
     - `final-project/autograde.py` - Final project grader

**ALL HIGH-PRIORITY TASKS COMPLETE**

**REMAINING (LOW PRIORITY):**
- Slide cleanup weeks 2-10 (remove emojis, simplify)
- Canvas content drafts
- Other minor demo polish items
