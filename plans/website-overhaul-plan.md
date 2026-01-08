# Website Overhaul Plan

**Date**: 2026-01-03
**Scope**: Complete website restructure, auto-generation pipeline, and student submission system

---

## Overview

Transform the course website from a static collection of pages into an auto-generated, CI-driven platform with:
- Unified navigation and theming
- Auto-generated pages from markdown sources
- Student assignment submission and autograding

---

## Phase 1: Site Structure & Navigation (Quick Wins)

### 1.1 Root Redirect
**Goal**: `contextlab.github.io/llm-course` → Course outline

**Implementation**:
- Create `index.html` at repo root that redirects to `/slides/`
- Alternative: Move course outline to root, adjust all relative paths

**Recommendation**: Simple redirect is cleaner and preserves existing structure.

### 1.2 Footer Standardization
**Goal**: Unified footer across all pages with lab website link

**Current footer links** (to remove):
- Interactive Demos
- GitHub Repository  
- Assignments
- Course Info (PBS link)

**New footer**:
```html
<footer>
    <p>&copy; 2026 <a href="https://www.context-lab.com">Contextual Dynamics Lab</a></p>
    <p>PSYC 51.17: Models of Language and Communication</p>
</footer>
```

**Files to update**:
- `slides/index.html` (course outline)
- `demos/index.html` (demos landing)
- All individual demo `index.html` files (15 demos)
- New syllabus page
- New assignments pages

### 1.3 Navigation Updates
**Current nav links**:
- Outline, Demos, GitHub, Course Info

**New nav structure**:
- Outline (current)
- Syllabus (new - links to HTML syllabus)
- Demos (current)
- Assignments (new)
- GitHub (keep)

---

## Phase 2: Syllabus Page

### 2.1 Create HTML Syllabus Generator
**Source**: `admin/syllabus.md`
**Output**: `syllabus/index.html`

**Approach**:
```
admin/syllabus.md → Python/Node script → syllabus/index.html
```

**Script responsibilities**:
- Parse markdown (handle LaTeX tables, links)
- Apply course theme CSS
- Generate navigation-consistent header/footer
- Output standalone HTML

**Theme**: Reuse `demos/shared/css/demo-styles.css` with course-specific additions

### 2.2 Syllabus Page Structure
```
syllabus/
└── index.html          # Auto-generated from admin/syllabus.md
```

---

## Phase 3: Assignments System

### 3.1 Create Assignments Hub
**Source**: `assignments/README.md` (new file to create)
**Output**: `assignments/index.html`

### 3.2 Create Individual Assignment Pages
**Sources**: Each `assignments/Assignment N: Name/README.md`
**Outputs**: `assignments/assignment-N/index.html`

### 3.3 Assignments Hub Structure
```markdown
# assignments/README.md (to create)

# Course Assignments

## Submission Instructions
All assignments should be submitted via [submission link]...

## Assignment Schedule

| # | Title | Released | Due | Weight |
|---|-------|----------|-----|--------|
| 1 | ELIZA Chatbot | Week 1 | Week 2 | 15% |
| 2 | SPAM Classifier | Week 2 | Week 3 | 15% |
| 3 | Wikipedia Embeddings | Week 3 | Week 4 | 15% |
| 4 | Customer Service Chatbot | Week 5 | Week 6 | 15% |
| 5 | Build GPT | Week 7 | Week 9 | 15% |
| Final | Research Project | Week 9 | Finals | 25% |

## Assignments

### [Assignment 1: ELIZA Chatbot](assignment-1/)
Build a pattern-matching chatbot...

### [Assignment 2: SPAM Classifier](assignment-2/)
...
```

### 3.4 Directory Structure
```
assignments/
├── README.md                    # Hub content (markdown)
├── index.html                   # Auto-generated hub
├── assignment-1/
│   └── index.html              # Auto-generated from Assignment 1: ELIZA/README.md
├── assignment-2/
│   └── index.html
├── ...
└── final-project/
    └── index.html
```

---

## Phase 4: Build Pipeline (GitHub Actions)

### 4.1 Markdown-to-HTML Workflow
**Trigger**: Push to main with changes in:
- `admin/syllabus.md`
- `assignments/**/*.md`
- `slides/README.md`

**Script**: `scripts/build-pages.py` (or Node.js)

```yaml
# .github/workflows/build-pages.yml
name: Build Course Pages

on:
  push:
    branches: [main]
    paths:
      - 'admin/syllabus.md'
      - 'assignments/**/*.md'
      - 'slides/README.md'
      - 'scripts/build-pages.py'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install markdown beautifulsoup4
      - name: Build pages
        run: python scripts/build-pages.py
      - name: Commit generated files
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add -A
          git diff --staged --quiet || git commit -m "chore: Auto-generate HTML pages"
          git push
```

### 4.2 Slide Rebuild Workflow
**Trigger**: Push with changes in `slides/week*/lecture*.md`

```yaml
# .github/workflows/build-slides.yml
name: Build Slides

on:
  push:
    branches: [main]
    paths:
      - 'slides/week*/*.md'
      - 'slides/template_deck/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Install Marp CLI
        run: npm install -g @marp-team/marp-cli
      - name: Build changed slides
        run: |
          # Find and compile changed .md files
          for file in $(git diff --name-only HEAD~1 HEAD | grep 'slides/week.*\.md$'); do
            cd $(dirname $file)
            ../template_deck/compile.sh $(basename $file)
            cd -
          done
      - name: Commit built slides
        run: |
          git add slides/**/*.html slides/**/*.pdf
          git diff --staged --quiet || git commit -m "chore: Auto-build slides"
          git push
```

---

## Phase 5: Student Submission System (Complex)

### 5.1 Architecture Overview
```
Student Flow:
1. Click "Submit Assignment" link on assignment page
2. Redirected to submission form (GitHub Pages + serverless)
3. Upload notebook/files
4. Files sent to private grading repo via GitHub API
5. Autograder runs (GitHub Actions in private repo)
6. Results stored, instructor notified

Instructor Flow:
1. View dashboard with all submissions
2. See autograder results + LLM evaluation
3. Edit/override grades
4. Generate PDF reports
5. Download for LMS upload
```

### 5.2 Components

#### A. Submission Frontend
**Location**: `submissions/index.html` (public repo)
**Features**:
- Student authentication (GitHub OAuth or simple form)
- File upload (drag-drop)
- Assignment selection
- Submission confirmation

**Tech**: Static HTML + JavaScript, calls serverless function

#### B. Serverless Backend
**Options**:
1. **GitHub Actions workflow_dispatch** - Student triggers via API
2. **Cloudflare Workers/Vercel Functions** - Process upload, create PR
3. **Google Cloud Functions** - More flexibility

**Recommended**: GitHub Actions with repository_dispatch
- Student frontend calls GitHub API to trigger workflow
- Workflow receives files, runs tests, stores results

#### C. Private Grading Repository
**Location**: `ContextLabCourses/llm-course-grading` (private)
**Structure**:
```
llm-course-grading/
├── autograders/
│   ├── assignment-1/
│   │   ├── test_eliza.py
│   │   └── rubric.json
│   ├── assignment-2/
│   │   └── ...
├── submissions/
│   ├── 2026-winter/
│   │   ├── student-name-1/
│   │   │   ├── assignment-1/
│   │   │   │   ├── submission.ipynb
│   │   │   │   ├── results.json
│   │   │   │   └── llm-feedback.md
│   │   │   └── ...
├── reports/
│   └── 2026-winter/
│       ├── student-name-1.pdf
│       └── ...
└── .github/workflows/
    ├── grade-submission.yml
    └── generate-reports.yml
```

#### D. Autograder Scripts
**Per-assignment structure**:
```python
# autograders/assignment-1/test_eliza.py
import pytest
import json

def test_basic_response():
    """Test that ELIZA responds to basic input"""
    # Load student submission
    # Run tests
    # Return results

def test_pattern_matching():
    """Test pattern matching implementation"""
    pass

# Results written to results.json
```

#### E. LLM Evaluation
**For subjective criteria**:
```python
# autograders/llm_evaluator.py
def evaluate_code_quality(notebook_path, rubric):
    """Use Claude/GPT to evaluate code quality, documentation, etc."""
    prompt = f"""
    Evaluate this student submission against the rubric:
    
    Rubric: {rubric}
    
    Code: {code}
    
    Provide scores and feedback for:
    1. Code organization (0-10)
    2. Documentation (0-10)
    3. Creativity (0-10)
    4. Edge case handling (0-10)
    """
    # Call LLM API
    # Parse response
    # Return structured feedback
```

#### F. Report Generation
```python
# scripts/generate_report.py
def generate_student_report(student_id, term):
    """Generate PDF report for a student"""
    # Collect all assignment results
    # Apply any instructor overrides
    # Generate markdown
    # Convert to PDF (pandoc/weasyprint)
```

### 5.3 Integration with Existing Tools
Reference: `ContextLabCourses/teaching-tools`
- Leverage existing GitHub Classroom patterns
- Adapt autograder structure
- Extend for LLM evaluation

---

## Implementation Order

### Immediate (Phase 1-2): ~2-3 hours
1. [ ] Create root redirect `index.html`
2. [ ] Update footers across all pages
3. [ ] Update navigation links
4. [ ] Create syllabus page generator
5. [ ] Generate initial syllabus HTML

### Short-term (Phase 3-4): ~3-4 hours  
6. [ ] Create `assignments/README.md`
7. [ ] Create assignment page generator
8. [ ] Generate all assignment HTML pages
9. [ ] Set up build-pages.yml workflow
10. [ ] Set up build-slides.yml workflow

### Medium-term (Phase 5): ~8-12 hours
11. [ ] Design submission frontend
12. [ ] Set up private grading repo
13. [ ] Create autograder templates
14. [ ] Implement GitHub Actions grading workflow
15. [ ] Add LLM evaluation
16. [ ] Create report generation
17. [ ] Test end-to-end flow

---

## Questions for Clarification

1. **Root redirect vs move**: Should the course outline move to root, or use a redirect?

2. **Submission authentication**: 
   - GitHub OAuth (requires student GitHub accounts)
   - Simple form with student ID (less secure, simpler)
   - Integration with Canvas/LMS?

3. **LLM evaluation API**:
   - Which provider? (Anthropic Claude, OpenAI, etc.)
   - API keys stored where? (GitHub Secrets)
   - Cost concerns for per-submission evaluation?

4. **Report format**:
   - PDF only, or also HTML/markdown?
   - Per-assignment reports or cumulative?

5. **Grading repo**:
   - Create new `ContextLabCourses/llm-course-grading`?
   - Extend existing `teaching-tools`?

6. **Timeline priority**:
   - All at once?
   - Phase 1-4 now, Phase 5 later?

---

## Files to Create/Modify

### New Files
- `/index.html` (redirect)
- `/syllabus/index.html` (generated)
- `/assignments/README.md`
- `/assignments/index.html` (generated)
- `/assignments/assignment-*/index.html` (generated, 6 files)
- `/scripts/build-pages.py`
- `/.github/workflows/build-pages.yml`
- `/.github/workflows/build-slides.yml`

### Modified Files
- `/slides/index.html` (nav + footer)
- `/demos/index.html` (nav + footer)
- `/demos/*/index.html` (footer only, 15 files)

---

## Approve to Proceed?

Please review this plan and let me know:
1. Any changes to the approach
2. Answers to clarification questions
3. Which phases to prioritize

Once approved, I'll begin implementation.
