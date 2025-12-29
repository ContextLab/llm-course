# Issue #17: Broken Links Analysis - slides/README.md

**Date:** 2025-12-27
**Analyzed File:** `/Users/jmanning/llm-course/slides/README.md`
**Verification:** All GitHub links tested via HTTP requests, local files verified via filesystem

---

## Executive Summary

**CRITICAL ISSUES FOUND:**
1. **ALL PDF slide links are broken** - No PDF files exist, only .tex source files
2. **Week 8 slides directory is missing** - Referenced but doesn't exist
3. All 15 demo links are valid
4. All 6 assignment directories exist
5. External links not tested (assumed working per instructions)

---

## 1. CRITICAL: Missing PDF Files

### Problem
The README references PDF files for all weeks, but **NO PDF files exist in the repository**. Only `.tex` source files are present.

### Broken PDF Links (Referenced in README)
All these links return 404 errors on GitHub:

1. `https://github.com/ContextLab/llm-course/blob/main/slides/week1/lecture.pdf` - **BROKEN** (needs compilation)
2. `https://github.com/ContextLab/llm-course/blob/main/slides/week2/lecture.pdf` - **BROKEN** (needs compilation)
3. `https://github.com/ContextLab/llm-course/blob/main/slides/week3-4/lecture.pdf` - **BROKEN** (needs compilation)
4. `https://github.com/ContextLab/llm-course/blob/main/slides/week5-6/lecture.pdf` - **BROKEN** (needs compilation)
5. `https://github.com/ContextLab/llm-course/blob/main/slides/week7/lecture.pdf` - **BROKEN** (needs compilation)
6. `https://github.com/ContextLab/llm-course/blob/main/slides/week8/lecture.pdf` - **BROKEN** (wrong path - should be week7)
7. `https://github.com/ContextLab/llm-course/blob/main/slides/week9/lecture.pdf` - **BROKEN** (needs compilation)

### What Actually Exists
Only `.tex` source files exist:
- `slides/week1/lecture.tex` ✓
- `slides/week2/lecture.tex` ✓
- `slides/week3-4/lecture.tex` ✓
- `slides/week5-6/lecture.tex` ✓
- `slides/week7/lecture.tex` ✓
- `slides/week8/lecture.tex` ✗ (directory missing entirely!)
- `slides/week9/lecture.tex` ✓

### Recommended Fix
**Option 1:** Compile all .tex files to PDFs and commit them
**Option 2:** Update README to link to .tex files instead
**Option 3:** Set up GitHub Actions to auto-compile PDFs from .tex on push

---

## 2. CRITICAL: Week 8 Content Misorganization

### Problem
The README references `slides/week8/lecture.pdf`, but the Week 8 content is actually stored in the `week7/` directory!

### What Actually Exists
Week 8 lectures (18, 19, 20) are stored in `slides/week7/`:
- `slides/week7/lecture18.tex` ✓ (Monday - Pragmatics, Dialogue)
- `slides/week7/lecture19.tex` ✓ (Wednesday - GPT Architecture)
- `slides/week7/lecture20.tex` ✓ (Friday - Language Models & Brain)
- `slides/week7/lecture.tex` ✓ (Combined file)

### Missing Directory
- `slides/week8/` - **DOES NOT EXIST**

### Where Week8 Is Referenced
Lines 227, 241, 251, 308 in slides/README.md reference week8 slides:
- Line 227: "📊 [Slides PDF](https://github.com/ContextLab/llm-course/blob/main/slides/week7/lecture.pdf)" (Week 8, Monday) - **INCORRECT PATH**
- Line 241: "📊 [Slides PDF](https://github.com/ContextLab/llm-course/blob/main/slides/week8/lecture.pdf)" (Week 8, Wednesday) - **BROKEN LINK**
- Line 251: "📊 [Slides PDF](https://github.com/ContextLab/llm-course/blob/main/slides/week8/lecture.pdf)" (Week 8, Friday) - **BROKEN LINK**
- Line 308: "- Week 8: [slides/week8/lecture.pdf](...)" - **BROKEN LINK**

### Recommended Fix Options

**Option A: Move content to week8 directory** (Cleaner)
1. Create `slides/week8/` directory
2. Move `lecture18.tex`, `lecture19.tex`, `lecture20.tex` from `week7/` to `week8/`
3. Compile `week8/lecture.tex` → `lecture.pdf`
4. Update all README links to point to `week8/lecture.pdf`

**Option B: Keep in week7, fix README** (Simpler)
1. Update README lines 241, 251, 308 to point to `week7/lecture.pdf`
2. Line 227 already correctly points to `week7/lecture.pdf`
3. Compile `week7/lecture.tex` → `lecture.pdf`
4. Update PDF access list (line 308) to remove separate week8 entry

**Recommended:** Option B (simpler, less file movement)

---

## 3. Demo Links Status: ALL WORKING ✓

All 15 demo links are valid. Each demo directory exists:

| Demo | Link | Status |
|------|------|--------|
| 01-eliza | `https://contextlab.github.io/llm-course/demos/01-eliza/` | ✓ WORKING |
| 02-tokenization | `https://contextlab.github.io/llm-course/demos/02-tokenization/` | ✓ WORKING |
| 03-embeddings | `https://contextlab.github.io/llm-course/demos/03-embeddings/` | ✓ WORKING |
| 04-attention | `https://contextlab.github.io/llm-course/demos/04-attention/` | ✓ WORKING |
| 05-transformer | `https://contextlab.github.io/llm-course/demos/05-transformer/` | ✓ WORKING |
| 06-gpt-playground | `https://contextlab.github.io/llm-course/demos/06-gpt-playground/` | ✓ WORKING |
| 07-rag | `https://contextlab.github.io/llm-course/demos/07-rag/` | ✓ WORKING |
| 08-topic-modeling | `https://contextlab.github.io/llm-course/demos/08-topic-modeling/` | ✓ WORKING |
| 09-sentiment | `https://contextlab.github.io/llm-course/demos/09-sentiment/` | ✓ WORKING |
| 10-pos-tagging | `https://contextlab.github.io/llm-course/demos/10-pos-tagging/` | ✓ WORKING |
| 11-analogies | `https://contextlab.github.io/llm-course/demos/11-analogies/` | ✓ WORKING |
| 12-semantic-search | `https://contextlab.github.io/llm-course/demos/12-semantic-search/` | ✓ WORKING |
| 13-bert-mlm | `https://contextlab.github.io/llm-course/demos/13-bert-mlm/` | ✓ WORKING |
| 14-embeddings-comparison | `https://contextlab.github.io/llm-course/demos/14-embeddings-comparison/` | ✓ WORKING |
| 15-chatbot-evolution | `https://contextlab.github.io/llm-course/demos/15-chatbot-evolution/` | ✓ WORKING |

**Demo index page:** `https://contextlab.github.io/llm-course/demos/` - ✓ WORKING

---

## 4. Assignment Links Status: ALL WORKING ✓

All 6 assignment directories exist:

| Assignment | Link | Status |
|------------|------|--------|
| Assignment 1 | `https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%201%3A%20ELIZA` | ✓ WORKING |
| Assignment 2 | `https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%202%3A%20SPAM%20classifier` | ✓ WORKING |
| Assignment 3 | `https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%203%3A%20Wikipedia` | ✓ WORKING |
| Assignment 4 | `https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%204%3A%20Customer%20Service%20Chatbot` | ✓ WORKING |
| Assignment 5 | `https://github.com/ContextLab/llm-course/tree/main/assignments/Assignment%205%3A%20GPT` | ✓ WORKING |
| Final Project | `https://github.com/ContextLab/llm-course/tree/main/assignments/Final%20Project` | ✓ WORKING |

---

## 5. External Links (Not Tested)

Per instructions, external links are noted but not tested. These include:

### Academic Papers (arxiv, ACL, Nature, etc.)
- 38 external academic paper links
- Assumed to be working (stable DOIs/URLs)

### Documentation & Tutorials
- HuggingFace Learn links (15 links)
- External tutorials and resources

### Full List of External Domains Referenced
- `nature.com` - 3 links
- `doi.org` - 1 link
- `web.stanford.edu` - 1 link
- `aclanthology.org` - 11 links
- `arxiv.org` - 19 links
- `jmlr.org` - 1 link
- `home.cs.colorado.edu` - 1 link
- `wordvec.colorado.edu` - 1 link
- `direct.mit.edu` - 2 links
- `pubmed.ncbi.nlm.nih.gov` - 2 links
- `pmc.ncbi.nlm.nih.gov` - 1 link
- `science.org` - 1 link
- `annualreviews.org` - 1 link
- `huggingface.co` - 15 links
- `prvnsmpth.github.io` - 1 link (Animated Transformer)
- `youtube.com` - 1 link (Karpathy GPT tutorial)
- `semanticscholar.org` - 1 link
- `cdn.openai.com` - 2 links
- `dropbox.com` - 1 link (Turing 1950 paper)
- `tug.org` - 2 links (MacTeX, TeX Live)
- `miktex.org` - 1 link
- `overleaf.com` - 1 link

---

## 6. Other Internal Links

### Main Course README
- Line 390: `[main course README](../README.md)` - ✓ WORKING

---

## Summary of Issues to Fix

### HIGH PRIORITY (Blocking Users)

1. **Generate all missing PDF files** (6 files needed)
   - Compile `slides/week1/lecture.tex` → `lecture.pdf`
   - Compile `slides/week2/lecture.tex` → `lecture.pdf`
   - Compile `slides/week3-4/lecture.tex` → `lecture.pdf`
   - Compile `slides/week5-6/lecture.tex` → `lecture.pdf`
   - Compile `slides/week7/lecture.tex` → `lecture.pdf` (contains Week 8 content)
   - Compile `slides/week9/lecture.tex` → `lecture.pdf`

2. **Fix Week 8 link inconsistency** (Choose Option B - simpler)
   - Update line 241: Change `week8/lecture.pdf` → `week7/lecture.pdf`
   - Update line 251: Change `week8/lecture.pdf` → `week7/lecture.pdf`
   - Update line 308: Remove separate Week 8 entry, or redirect to week7
   - Note: Line 227 already correctly points to `week7/lecture.pdf`

### MEDIUM PRIORITY (Improvements)

4. **Consider automation**
   - Add GitHub Actions workflow to auto-compile .tex → .pdf
   - Or add build script in repository

---

## Files Verified

### Slide Directories Present
- ✓ `slides/week1/`
- ✓ `slides/week2/`
- ✓ `slides/week3-4/`
- ✓ `slides/week5-6/`
- ✓ `slides/week7/`
- ✗ `slides/week8/` - **MISSING**
- ✓ `slides/week9/`
- ✓ `slides/week10/`

### Additional Week Directories (Not referenced in README)
- ✓ `slides/week3/` (individual lectures)
- ✓ `slides/week4/` (individual lectures)
- ✓ `slides/week5/` (individual lectures)
- ✓ `slides/week6/` (individual lectures)

---

## Conclusion

**Total Broken Links:** 6 missing PDFs + 3 incorrect week8 references = **9 link issues**

**Working Links:** 15 demos + 6 assignments + 1 main README = **22 working links**

**Root Causes:**
1. PDFs were never compiled from .tex source files
2. Week 8 content is stored in week7/ directory, but README inconsistently references week8/

**Main Action Items:**
1. Compile all 6 .tex files to PDF format
2. Fix 3 week8 references in README to point to week7/lecture.pdf
3. Commit all PDFs to repository

**Good News:**
- All demo links are working correctly (15/15)
- All assignment links are working correctly (6/6)
- All .tex source files exist
- Week 8 content exists, just in wrong directory reference

---

## Quick Fix Reference

### Exact README Changes Needed

| Line | Current | Should Be |
|------|---------|-----------|
| 241 | `slides/week8/lecture.pdf` | `slides/week7/lecture.pdf` |
| 251 | `slides/week8/lecture.pdf` | `slides/week7/lecture.pdf` |
| 308 | `- Week 8: [slides/week8/lecture.pdf](...)` | `- Week 8: [slides/week7/lecture.pdf](...)` |

### PDFs to Compile

```bash
cd /Users/jmanning/llm-course/slides

# Week 1
cd week1 && pdflatex lecture.tex && pdflatex lecture.tex && cd ..

# Week 2
cd week2 && pdflatex lecture.tex && pdflatex lecture.tex && cd ..

# Week 3-4
cd week3-4 && pdflatex lecture.tex && pdflatex lecture.tex && cd ..

# Week 5-6
cd week5-6 && pdflatex lecture.tex && pdflatex lecture.tex && cd ..

# Week 7 (contains Week 8 content: lectures 18, 19, 20)
cd week7 && pdflatex lecture.tex && pdflatex lecture.tex && cd ..

# Week 9
cd week9 && pdflatex lecture.tex && pdflatex lecture.tex && cd ..
```

### Verification Commands

```bash
# Verify PDFs were created
find slides -name "lecture.pdf" -type f

# Should output:
# slides/week1/lecture.pdf
# slides/week2/lecture.pdf
# slides/week3-4/lecture.pdf
# slides/week5-6/lecture.pdf
# slides/week7/lecture.pdf
# slides/week9/lecture.pdf
```
