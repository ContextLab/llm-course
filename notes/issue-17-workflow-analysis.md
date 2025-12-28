# GitHub Actions Workflow Analysis - Issue #17

**Date:** 2025-12-27
**Workflow File:** `.github/workflows/build-slides.yml`

## Executive Summary

The workflow has **7 critical issues** that will prevent successful compilation and deployment:

1. Berkeley Mono font not being installed from repository
2. Missing week8 directory but referenced in index.html
3. Incorrect path references in index.html (links don't match actual file structure)
4. Missing lecture.tex files in some week directories
5. Potential font conflicts (slides use Arial/Courier, syllabus uses Berkeley Mono)
6. No error handling for LaTeX compilation failures
7. Individual lecture PDFs not being generated for some weeks

---

## Workflow Structure Overview

### Triggers
- Push to main/master branches (paths: `slides/**/*.tex`, `slides/**/*.ipynb`, `admin/syllabus.md`, workflow file)
- Pull requests to main/master
- Manual workflow dispatch

### Jobs & Steps
1. **Setup:** Checkout, install LaTeX, fonts, Python, Jupyter
2. **Compilation:** Syllabus PDF, lecture slides, notebook conversion
3. **Web Generation:** PDF viewers, directory structure, index page
4. **Deployment:** GitHub Pages configuration and deployment

---

## Critical Issues Found

### Issue 1: Berkeley Mono Font Not Installed from Repository ✅ FIXED

**Location:** Lines 49-57
**Status:** FIXED on 2025-12-27

**Original Problem:**
- The font file EXISTS at `/admin/berkeley-mono.ttf` in the repository (55KB)
- The workflow creates the directory but never copies the font
- Syllabus compilation would fail because `syllabus.md` specifies `\setmainfont{Berkeley Mono}` (line 7)

**Fix Applied:**
```yaml
- name: Install Berkeley Mono font for syllabus
  run: |
    # Create fonts directory
    sudo mkdir -p /usr/share/fonts/truetype/berkeley-mono

    # Copy Berkeley Mono font from repo to system fonts directory
    sudo cp admin/berkeley-mono.ttf /usr/share/fonts/truetype/berkeley-mono/

    # Refresh font cache
    sudo fc-cache -f -v

    # Verify font installation
    fc-list | grep -i "berkeley" || echo "Warning: Berkeley Mono font may not be installed correctly"
```

**Testing:**
- Local test: `pandoc -s -o /tmp/test-syllabus.pdf admin/syllabus.md --pdf-engine=xelatex`
- Result: SUCCESS - PDF compiled to 30KB
- Note: Emoji warnings are expected (Berkeley Mono doesn't include emoji glyphs)

---

### Issue 2: Missing week8 Directory

**Location:** Index.html generation (lines 462-469)

**Problem:**
```html
<div class="slide-card">
    <span class="emoji">🧠</span>
    <h2>Week 8: GPT Models</h2>
    <p>GPT evolution, building transformers from scratch, language models & the brain.</p>
    <div class="links">
        <a href="slides/week8/lecture.pdf" class="btn btn-primary" target="_blank">PDF</a>
    </div>
</div>
```

**Actual Directory Structure:**
- week1/ ✓
- week2/ ✓
- week3/ ✓
- week3-4/ ✓
- week4/ ✓
- week5/ ✓
- week5-6/ ✓
- week6/ ✓
- week7/ ✓
- **week8/ ✗ MISSING**
- week9/ ✓
- week10/ ✓

**Fix Needed:**
Either:
1. Remove week8 card from index.html, OR
2. Create week8 directory with lecture.tex file

---

### Issue 3: Path Mismatches in Index.html

**Location:** Lines 400-478 (index.html generation)

**Problems Found:**

#### Week 1
```html
<a href="slides/week1/lecture1.pdf" class="btn btn-primary" target="_blank">Lecture 1 PDF</a>
<a href="slides/week1/lecture2.pdf" class="btn btn-primary" target="_blank">Lecture 2 PDF</a>
<a href="slides/week1/lecture3.pdf" class="btn btn-primary" target="_blank">Lecture 3 PDF</a>
```
**Files that exist:** lecture.tex, lecture1.tex, lecture2.tex, lecture3.tex (4 files)
**Expected:** All 4 PDF files after compilation

#### Week 2
```html
<a href="slides/week2/lecture4.pdf" class="btn btn-primary" target="_blank">Lecture 4 PDF</a>
<a href="slides/week2/lecture5.pdf" class="btn btn-primary" target="_blank">Lecture 5 PDF</a>
<a href="slides/week2/lecture6.pdf" class="btn btn-primary" target="_blank">Lecture 6 PDF</a>
```
**Files that exist:** lecture.tex, lecture4.tex, lecture5.tex, lecture6.tex (4 files)
**Missing link:** lecture.pdf

#### Week 3
```html
<a href="slides/week3/lecture7.pdf" class="btn btn-primary" target="_blank">Lecture 7 PDF</a>
<a href="slides/week3/lecture8.pdf" class="btn btn-primary" target="_blank">Lecture 8 PDF</a>
```
**Files that exist:** lecture7.tex, lecture8.tex (2 files)
**Status:** ✓ Correct

#### Week 3-4
```html
<a href="slides/week3-4/lecture.pdf" class="btn btn-primary" target="_blank">Combined PDF</a>
```
**Files that exist:** lecture.tex
**Status:** ✓ Correct

#### Week 4
**No card in index.html**
**Files that exist:** lecture9.tex, lecture10.tex, lecture11.tex
**Problem:** Week 4 content exists but is not represented in index.html

#### Week 5-6
```html
<a href="slides/week5-6/lecture.pdf" class="btn btn-primary" target="_blank">Combined PDF</a>
```
**Files that exist:** lecture.tex
**Status:** ✓ Correct

#### Week 7
```html
<a href="slides/week7/lecture.pdf" class="btn btn-primary" target="_blank">PDF</a>
```
**Files that exist:** lecture.tex, lecture18.tex, lecture19.tex, lecture20.tex (4 files)
**Missing links:** Individual lecture PDFs (18, 19, 20)

#### Week 9
```html
<a href="slides/week9/lecture.pdf" class="btn btn-primary" target="_blank">PDF</a>
```
**Files that exist:** lecture.tex, lecture21.tex, lecture22.tex, lecture23.tex (4 files)
**Missing links:** Individual lecture PDFs (21, 22, 23)

#### Week 10
**No card in index.html**
**Files that exist:** lecture24.tex
**Problem:** Week 10 content exists but is not represented in index.html

---

### Issue 4: Missing lecture.tex Files

**Problem:** Some weeks have individual lecture files but no combined "lecture.tex":

- **week1/**: Has lecture.tex ✓
- **week2/**: Has lecture.tex ✓
- **week3/**: No lecture.tex (only lecture7.tex, lecture8.tex)
- **week4/**: No lecture.tex (only lecture9.tex, lecture10.tex, lecture11.tex)
- **week5/**: No lecture.tex (only lecture12.tex, lecture13.tex, lecture14.tex)
- **week6/**: No lecture.tex (only lecture15.tex, lecture16.tex, lecture17.tex)

**Impact:** If index.html expects combined PDFs for these weeks, they won't be generated.

---

### Issue 5: Font Conflicts and Requirements

**Syllabus (admin/syllabus.md):**
```yaml
header-includes:
  - \usepackage{fontspec}
  - \setmainfont{Berkeley Mono}
```
- **Requires:** XeLaTeX (for fontspec)
- **Requires:** Berkeley Mono font installed
- **Status:** Font exists but workflow doesn't install it

**Lecture Slides (e.g., week1/lecture1.tex):**
```latex
\documentclass[aspectratio=169]{beamer}
\usetheme{metropolis}
\usepackage{fontspec}
\setmainfont{Arial}
\setmonofont{Courier New}
```
- **Requires:** XeLaTeX (for fontspec)
- **Requires:** Arial and Courier New fonts
- **Status:** Workflow installs texlive-fonts-extra but Arial/Courier New might not be included

**Fix Needed:**
1. Install Berkeley Mono from repo (see Issue 1)
2. Verify Arial and Courier New are available or use fallback fonts
3. Consider using Liberation Sans/Mono as free alternatives

---

### Issue 6: No Error Handling for Compilation Failures

**Location:** Lines 84-111 (LaTeX compilation), Lines 113-128 (Jupyter conversion)

**Current Behavior:**
```bash
xelatex -interaction=nonstopmode -halt-on-error "$filename.tex" || true
```

**Problem:**
- The `|| true` means failures are silently ignored
- Echo statements report success/failure but workflow continues
- Broken PDFs could be deployed to GitHub Pages
- No aggregated failure report

**Fix Needed:**
1. Track compilation failures in a log file
2. Create summary report of all failures
3. Optionally fail workflow if critical files don't compile
4. Add artifact upload for compilation logs

---

### Issue 7: PDF Viewer HTML Generation Issues

**Location:** Lines 130-211

**Problem with viewer links:**
```html
<a href="../../index.html">🏠 All Slides</a>
```

**File structure will be:**
- web_slides/
  - index.html
  - slides/
    - week1/
      - lecture1.pdf
      - lecture1-viewer.html

**Correct relative path from viewer:** `../../index.html` ✓

**However:** The workflow generates viewers for ALL PDFs, including:
- Syllabus PDF (if it's in web_slides/admin/syllabus.pdf)
- The viewer script doesn't check if PDF is in slides/ directory

---

## Complete File Inventory

### Actual Files in Repository

**Notebooks (will be converted to HTML):**
1. slides/week1/xhour_eliza_demo.ipynb
2. slides/week2/xhour_classification_demo.ipynb
3. slides/week3/xhour_embeddings_demo.ipynb

**LaTeX Files (will be compiled to PDF):**

Week 1:
- lecture.tex
- lecture1.tex
- lecture2.tex
- lecture3.tex

Week 2:
- lecture.tex
- lecture4.tex
- lecture5.tex
- lecture6.tex

Week 3:
- lecture7.tex
- lecture8.tex

Week 3-4:
- lecture.tex

Week 4:
- lecture9.tex
- lecture10.tex
- lecture11.tex

Week 5:
- lecture12.tex
- lecture13.tex
- lecture14.tex

Week 5-6:
- lecture.tex

Week 6:
- lecture15.tex
- lecture16.tex
- lecture17.tex

Week 7:
- lecture.tex
- lecture18.tex
- lecture19.tex
- lecture20.tex

Week 9:
- lecture.tex
- lecture21.tex
- lecture22.tex
- lecture23.tex

Week 10:
- lecture24.tex

**Total:** 29 LaTeX files, 3 Jupyter notebooks

---

## Recommended Index.html Structure

Based on actual files, the index should include:

```html
<!-- Week 1: 4 PDFs + 1 notebook -->
<div class="slide-card">
    <span class="emoji">🚀</span>
    <h2>Week 1: Introduction</h2>
    <div class="links">
        <a href="slides/week1/lecture.pdf">Combined PDF</a>
        <a href="slides/week1/lecture1.pdf">Lecture 1</a>
        <a href="slides/week1/lecture2.pdf">Lecture 2</a>
        <a href="slides/week1/lecture3.pdf">Lecture 3</a>
        <a href="slides/week1/xhour_eliza_demo.html">X-hour Demo</a>
    </div>
</div>

<!-- Week 2: 4 PDFs + 1 notebook -->
<div class="slide-card">
    <span class="emoji">📝</span>
    <h2>Week 2: Computational Linguistics</h2>
    <div class="links">
        <a href="slides/week2/lecture.pdf">Combined PDF</a>
        <a href="slides/week2/lecture4.pdf">Lecture 4</a>
        <a href="slides/week2/lecture5.pdf">Lecture 5</a>
        <a href="slides/week2/lecture6.pdf">Lecture 6</a>
        <a href="slides/week2/xhour_classification_demo.html">X-hour Demo</a>
    </div>
</div>

<!-- Week 3: 2 PDFs + 1 notebook -->
<div class="slide-card">
    <span class="emoji">📊</span>
    <h2>Week 3: Text Embeddings I</h2>
    <div class="links">
        <a href="slides/week3/lecture7.pdf">Lecture 7</a>
        <a href="slides/week3/lecture8.pdf">Lecture 8</a>
        <a href="slides/week3/xhour_embeddings_demo.html">X-hour Demo</a>
    </div>
</div>

<!-- Week 3-4: Combined -->
<div class="slide-card">
    <span class="emoji">📈</span>
    <h2>Weeks 3-4: Text Embeddings (Combined)</h2>
    <div class="links">
        <a href="slides/week3-4/lecture.pdf">Combined PDF</a>
    </div>
</div>

<!-- Week 4: 3 individual lectures -->
<div class="slide-card">
    <span class="emoji">🔢</span>
    <h2>Week 4: Text Embeddings II</h2>
    <div class="links">
        <a href="slides/week4/lecture9.pdf">Lecture 9</a>
        <a href="slides/week4/lecture10.pdf">Lecture 10</a>
        <a href="slides/week4/lecture11.pdf">Lecture 11</a>
    </div>
</div>

<!-- Week 5: 3 individual lectures -->
<div class="slide-card">
    <span class="emoji">⚡</span>
    <h2>Week 5: Attention & Transformers I</h2>
    <div class="links">
        <a href="slides/week5/lecture12.pdf">Lecture 12</a>
        <a href="slides/week5/lecture13.pdf">Lecture 13</a>
        <a href="slides/week5/lecture14.pdf">Lecture 14</a>
    </div>
</div>

<!-- Week 5-6: Combined -->
<div class="slide-card">
    <span class="emoji">⚡</span>
    <h2>Weeks 5-6: Transformers & BERT (Combined)</h2>
    <div class="links">
        <a href="slides/week5-6/lecture.pdf">Combined PDF</a>
    </div>
</div>

<!-- Week 6: 3 individual lectures -->
<div class="slide-card">
    <span class="emoji">🤖</span>
    <h2>Week 6: BERT & Context</h2>
    <div class="links">
        <a href="slides/week6/lecture15.pdf">Lecture 15</a>
        <a href="slides/week6/lecture16.pdf">Lecture 16</a>
        <a href="slides/week6/lecture17.pdf">Lecture 17</a>
    </div>
</div>

<!-- Week 7: 1 combined + 3 individual -->
<div class="slide-card">
    <span class="emoji">💬</span>
    <h2>Week 7: Models of Conversation</h2>
    <div class="links">
        <a href="slides/week7/lecture.pdf">Combined PDF</a>
        <a href="slides/week7/lecture18.pdf">Lecture 18</a>
        <a href="slides/week7/lecture19.pdf">Lecture 19</a>
        <a href="slides/week7/lecture20.pdf">Lecture 20</a>
    </div>
</div>

<!-- NO WEEK 8 DIRECTORY EXISTS -->

<!-- Week 9: 1 combined + 3 individual -->
<div class="slide-card">
    <span class="emoji">🔍</span>
    <h2>Week 9: RAG & MoE</h2>
    <div class="links">
        <a href="slides/week9/lecture.pdf">Combined PDF</a>
        <a href="slides/week9/lecture21.pdf">Lecture 21</a>
        <a href="slides/week9/lecture22.pdf">Lecture 22</a>
        <a href="slides/week9/lecture23.pdf">Lecture 23</a>
    </div>
</div>

<!-- Week 10: 1 lecture -->
<div class="slide-card">
    <span class="emoji">🎤</span>
    <h2>Week 10: Student Presentations</h2>
    <div class="links">
        <a href="slides/week10/lecture24.pdf">Lecture 24</a>
    </div>
</div>
```

---

## Missing Steps in Workflow

1. **Validation step:** Check that expected files were created
2. **Fallback fonts:** Install Liberation fonts as free alternatives
3. **Compilation logs:** Capture and upload LaTeX logs as artifacts
4. **Index generation:** Should be dynamic based on actual compiled files
5. **Link checking:** Verify all links in index.html point to real files
6. **Cleanup step:** Remove auxiliary LaTeX files (.aux, .log, .out, etc.)

---

## Priority Fixes

### High Priority (Blocks Deployment)
1. Install Berkeley Mono font from repository
2. Remove or create week8 content
3. Fix all path mismatches in index.html
4. Add validation to fail workflow if critical files don't compile

### Medium Priority (Quality Issues)
1. Add week4 and week10 to index.html
2. Include all individual lecture links for weeks that have them
3. Add compilation error reporting
4. Install fallback fonts

### Low Priority (Nice to Have)
1. Dynamic index.html generation from actual files
2. Upload compilation logs as artifacts
3. Add link validation step
4. Improve error messages

---

## Testing Checklist

Before considering the workflow fixed:

- [X] Syllabus.pdf compiles successfully with Berkeley Mono font (FIXED 2025-12-27)
- [ ] All 29 .tex files compile to PDF
- [ ] All 3 .ipynb files convert to HTML
- [ ] Index.html contains correct links to all files
- [ ] No broken links in deployed site
- [ ] PDF viewers work correctly
- [ ] All emojis render in HTML
- [ ] GitHub Pages deployment succeeds
- [ ] Site is accessible at correct URL

---

## Specific Code Changes Needed

### 1. Font Installation (Lines 49-57)

**Replace:**
```yaml
- name: Install Berkeley Mono font for syllabus
  run: |
    # Create fonts directory
    sudo mkdir -p /usr/share/fonts/truetype/berkeley-mono

    # Note: Berkeley Mono is a commercial font
    # If the font files exist in the repo, they would be copied here
    # For now, we'll use a fallback font in the LaTeX compilation
    echo "Berkeley Mono font installation skipped (commercial font)"
```

**With:**
```yaml
- name: Install Berkeley Mono font for syllabus
  run: |
    # Create fonts directory and install Berkeley Mono from repo
    sudo mkdir -p /usr/share/fonts/truetype/berkeley-mono
    sudo cp admin/berkeley-mono.ttf /usr/share/fonts/truetype/berkeley-mono/

    # Rebuild font cache
    sudo fc-cache -f -v

    # Verify font is installed
    fc-list | grep -i berkeley || echo "Warning: Berkeley Mono not found in font cache"
    echo "✓ Berkeley Mono font installation complete"
```

### 2. Compilation Error Tracking (After Line 111)

**Add:**
```yaml
- name: Check compilation results
  run: |
    echo "📊 Compilation Summary:"
    echo "====================="

    failed_files=0
    success_files=0

    find slides -name "*.tex" -type f | while read -r tex_file; do
      dir=$(dirname "$tex_file")
      filename=$(basename "$tex_file" .tex)

      if [ -f "$dir/$filename.pdf" ]; then
        echo "✅ $tex_file"
        success_files=$((success_files + 1))
      else
        echo "❌ $tex_file FAILED"
        failed_files=$((failed_files + 1))
      fi
    done

    echo "====================="
    echo "Success: $success_files"
    echo "Failed: $failed_files"

    if [ $failed_files -gt 0 ]; then
      echo "⚠️  Warning: Some files failed to compile"
    fi
```

### 3. Index.html Generation (Replace Lines 243-489)

**Should dynamically generate based on actual compiled files, or**
**Update static HTML to match actual file structure (see "Recommended Index.html Structure" above)**

---

## Conclusion

The workflow is structurally sound but has critical issues that prevent successful deployment:

1. **Font installation is broken** - Berkeley Mono exists but isn't installed
2. **Index.html doesn't match actual files** - Links to missing week8, missing links to week4/week10
3. **No error handling** - Failed compilations are silently ignored
4. **Incomplete testing** - No validation that expected files were created

**Estimated time to fix:** 2-4 hours for a complete solution

**Quick fix for immediate deployment:**
1. Install Berkeley Mono font (5 minutes)
2. Remove week8 card from index.html (1 minute)
3. Test locally with Docker (30 minutes)
