# Session Handoff - January 4, 2026

**Status:** ✅ All tasks completed
**Completed:** 2026-01-04

## Summary
All three tasks from this handoff were completed:
1. ✅ Syllabus table fixes (columns, sequential lecture numbering, slide links)
2. ✅ Tag filtering removed from demos page
3. ✅ Related Lectures links added to all 15 demos

Commits: `50b1d64`, `9650a37` (pushed to main)

## Tasks To Complete

### 1. Syllabus Table Fixes
**File:** `admin/syllabus.md` → regenerate `syllabus/index.html`

**Problems:**
- Columns are mismatched in the detailed schedule tables
- X-hour lectures aren't numbered sequentially

**Required fixes:**
- Columns should be: **Day | Lecture | Link to slides | Materials**
- Materials column should contain links to readings + assignments
- X-hour lectures should be numbered sequentially like all other lectures:
  - Week 1: Lectures 1, 2, 3, 4 (not "Lecture 1, 2, X-hour, 3")
  - Week 2: Lectures 5, 6, 7, 8
  - And so on...

**Current state (from syllabus.md lines 153-158):**
```markdown
| Day | Lecture | Topics | Materials |
|-----|---------|--------|-----------|
| Mon Jan 5 | Lecture 1 | Course Introduction... | [readings] |
| Wed Jan 7 | Lecture 2 | Pattern Matching... | [readings] |
| Thu Jan 8 | X-hour 1 | ELIZA Deep Dive | Start Assignment 1 |
| Fri Jan 9 | Lecture 3 | ELIZA Implementation... | [readings], **Assignment 1 Released** |
```

**Should become:**
```markdown
| Day | Lecture | Link to slides | Materials |
|-----|---------|----------------|-----------|
| Mon Jan 5 | Lecture 1 | [Slides](../slides/week1/lecture1.html) | [Fedorenko et al.](url), [Schrimpf et al.](url) |
| Wed Jan 7 | Lecture 2 | [Slides](../slides/week1/lecture2.html) | [Weizenbaum (1966)](url) |
| Thu Jan 8 | Lecture 3 | [Slides](../slides/week1/lecture3.html) | Start Assignment 1 |
| Fri Jan 9 | Lecture 4 | [Slides](../slides/week1/lecture4.html) | [Natale (2021)](url), **Assignment 1 Released** |
```

After editing, run: `python scripts/build-pages.py`

---

### 2. Remove Keyword Filtering from Demos Page
**File:** `demos/index.html`

**Problem:** The "Filter by Topic" keyword buttons at the top aren't useful.

**Required changes:**
1. Remove the entire `.tag-browser` section (lines 456-459):
   ```html
   <div class="tag-browser">
       <div class="tag-browser-title">Filter by Topic</div>
       <div class="tag-list" id="tagList"></div>
   </div>
   ```

2. Remove `data-tags` attributes from demo cards (they're on each `.demo-card`)

3. Remove the `.demo-tags` display inside each card (the visible tag pills)

4. Update the JavaScript to:
   - Remove `collectAllTags()`, `populateTagBrowser()`, `toggleTag()` functions
   - Remove tag-related variables (`activeTag`, tag filtering logic)
   - Keep search functionality but make it search:
     - Card title
     - Card description
     - **Demo webpage content** (need to fetch/index demo README.md or index.html content)

5. Remove all `.tag-*` CSS styles

**Search enhancement idea:** Could pre-build a search index from demo README.md files, or fetch on page load.

---

### 3. Add Missing Lecture Links to All Demos
**File:** `demos/index.html`

**Problem:** Many demos are missing "Related Lectures" links. Every demo should have at least one.

**Current state - demos WITH lecture links:**
- ELIZA: Lectures 2, 3
- Tokenization: Lecture 6
- Word Embeddings: Lectures 11, 12
- Attention: Lecture 16
- Transformer: Lecture 17

**Demos MISSING lecture links (need to add):**
- Chatbot Evolution → Lectures 2, 3, 4 (pattern matching, ELIZA)
- GPT Playground → Lectures 18, 19, 20 (GPT architecture)
- RAG System → Lecture 21 (RAG)
- Topic Modeling → Lectures 7, 8 (LSA, LDA, embeddings)
- Sentiment Analysis → Lecture 6 (POS, sentiment)
- POS Tagging → Lecture 6 (POS tagging)
- Word Analogies → Lectures 8, 11 (Word2Vec, embeddings)
- Semantic Search → Lectures 9, 21 (contextual embeddings, RAG)
- BERT MLM → Lectures 15, 16 (BERT)
- Embeddings Comparison → Lectures 7, 8, 9 (all embedding lectures)

**Lecture-to-demo mapping (from syllabus):**
| Lecture | Week | Topic | Related Demos |
|---------|------|-------|---------------|
| 1-4 | 1 | Intro, ELIZA | eliza, chatbot-evolution |
| 5-6 | 2 | Tokenization, POS | tokenization, pos-tagging, sentiment |
| 7-8 | 3 | LSA/LDA, Word2Vec | topic-modeling, embeddings, analogies |
| 9-11 | 4 | Contextual embeddings, dim reduction | embeddings, embeddings-comparison, semantic-search |
| 12-14 | 5 | Attention, Transformers | attention, transformer |
| 15-17 | 6 | BERT | bert-mlm |
| 18-20 | 7 | GPT | gpt-playground |
| 21-23 | 9 | RAG, Ethics | rag |

---

## Files to Modify

1. `admin/syllabus.md` - Fix table structure and lecture numbering
2. `demos/index.html` - Remove keywords, add lecture links, enhance search
3. Run `python scripts/build-pages.py` after syllabus changes

## Commands

```bash
# After syllabus.md changes
python scripts/build-pages.py

# Verify generated HTML
open syllabus/index.html
open demos/index.html
```

## Previous Session Context

- Just committed `0aa896f`: list parsing fix with nesting + checkboxes
- All tests passing
- build-pages.py now handles nested lists and checkboxes properly
