# Session Notes: 2026-03-03 — Course Outline Audit & Notebook Fixes

## Commits This Session
- `9315e8c` — Replace SemanticScholarTool with WikipediaTool in agents_demo.ipynb
- `6402a0e` — Fix Wikipedia API 403 by adding User-Agent header
- `27fa004` — Fix langchain import: text_splitter moved to langchain-text-splitters
- `8423303` — Audit course outline: fix readings, dedup papers, sort by year

## What Was Done

### Notebook Fixes (agents_demo.ipynb)
1. Replaced SemanticScholarTool (429 rate limits) with WikipediaTool using Wikipedia's search + REST summary APIs
2. Added `User-Agent` header to fix 403 errors from Wikipedia API
3. Fixed langchain import: `langchain.text_splitter` → `langchain_text_splitters` (package restructured)

### Course Outline Audit (slides/README.md + admin/syllabus.md)
- **5 parallel agents** audited all 27 lectures against actual slide content
- **Added missing papers**: Chomsky (1956), Vaswani (2017), Devlin (2019), Chinchilla (Hoffmann 2022), InstructGPT (Ouyang 2022), ALBERT (Lan 2019), Sohl-Dickstein (2015), U-Net (Ronneberger 2015), Merrill & Sabharwal (2024), s1 (Muennighoff 2025), Anthropic autonomy (2025), reward tampering, AI researcher survey
- **Replaced phantom readings** not in actual slides: Anderson et al. (2016), ONNX/TensorRT references
- **Fixed incorrect links**: Merrill arXiv ID (2310.12397 → 2310.07923), Gemini version (2.5 → 3.1)
- **Fixed content mismatches**: L7 "SPAM" → "20 Newsgroups", L9 "chatbot analyzer" → "AI-powered search engine"
- **Added missing notebook links**: L7 X-hour, L25 companion

### Deduplication & Sorting
- **Removed 6 duplicate papers** (kept first/earliest occurrence):
  - Vaswani et al. (2017): L12 (kept) vs L15 (removed)
  - Devlin et al. (2019): L12 (kept) vs L18 (removed)
  - Fedorenko et al. (2024): L1 (kept) vs L20 (removed)
  - Bender et al. (2021): L14 (kept) vs L26 (removed)
  - van der Maaten & Hinton (2008): L13 (kept) vs X-hour (removed)
  - McInnes & Healy (2018): L13 (kept) vs X-hour (removed)
- **Sorted all readings** by year ascending, then author last name alphabetically for ties

### Syllabus Source
- `syllabus/index.html` is auto-generated from `admin/syllabus.md` via GitHub Actions (`build-pages.yml`)
- Updated `admin/syllabus.md` to match all README changes
- GitHub Action will regenerate the HTML on push

## All Tasks Complete
No pending items from this session.

## Key Learning
- Wikipedia API requires `User-Agent` header on all requests
- `langchain.text_splitter` moved to standalone `langchain-text-splitters` package
- `syllabus/index.html` is auto-compiled — edit `admin/syllabus.md` instead
- The build script is `scripts/build-pages.py`, triggered by `.github/workflows/build-pages.yml`
