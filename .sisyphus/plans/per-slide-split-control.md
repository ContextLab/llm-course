# Per-Slide Split Control for Marp Markdown

## TL;DR

> **Quick Summary**: Add `<!-- split: N -->` and `<!-- split: N, M -->` directives to control per-slide code/table split limits in `process_markdown.py`, replacing the global defaults on a per-block basis.
> 
> **Deliverables**:
> - Modified `process_markdown.py` with directive parsing and split override logic
> - Updated STYLE_GUIDE.md, template_deck/AGENTS.md, slides/AGENTS.md, root AGENTS.md
> - Test presentation exercising all edge cases
> - Playwright screenshots verifying correct output
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 3 → Task 4 → Task 5

---

## Context

### Original Request
Add per-slide control of code/table split limits in Marp markdown via HTML comment directives. Currently `process_markdown.py` uses global defaults (20 lines for code, 8 rows for tables). Authors want per-slide overrides.

### Interview Summary
**Key Discussions**:
- **Directive scope**: Applies to the NEXT block only (one-shot, consumed after use)
- **Override behavior**: Hard override — the author's number is the exact max, bypassing `compute_available_code_lines()` dynamic adjustment
- **Continuation slides**: Directive only on original source slides, not auto-generated continuations
- **Single directive**: One `<!-- split: N -->` controls both code and tables
- **Consumption**: Each directive applies to exactly one block, then resets to global defaults
- **Test strategy**: Manual verification via Playwright (no unit tests needed)

### Research Findings
- **Existing directive precedent**: `<!-- no-autoscale -->` at line 799, `<!-- _class: scale-XX -->`, `<!-- caption: text -->` — the new directive follows this established HTML comment pattern
- **Code splitting** (lines 1340-1457): Uses `effective_max_lines` from `compute_available_code_lines(slide_content, max_lines)`. The directive must override this entire computation.
- **Table splitting** (lines 1466-1508): Uses `max_table_rows` directly. The directive overrides this value.
- **`split_table()` function** (line 619): Uses fixed `max_rows` for ALL chunks. Must be refactored to support `first_max` vs `cont_max` (the two-number syntax).
- **Code chunking** (line 1356): `range(0, len(code_lines_buffer), effective_max_lines)` — same size for all chunks. Must be refactored for variable chunk sizes.
- **End-of-file table handling** (lines 1519-1540): Also needs directive support — a table ending at EOF must consume the pending directive.
- **`analyze_and_warn_slides()`**: Runs before splitting. Does NOT need changes — if the author deliberately sets a high split value, the warning is informational only.
- **Continued indicators** (lines 675-693 & 1415-1438): Tightly coupled with chunking loops. Must work correctly with variable-size chunks.
- **No existing tests** for `process_markdown.py` — all 1500+ tests are JS-based for demos.

### Gap Analysis (from Metis)
**Identified Gaps** (all addressed in plan):
- `split_table()` signature must change to support first/cont max rows
- Code chunking loop must change from `range(0, N, step)` to manual slice-and-advance
- End-of-file table handling needs pending directive check
- `start_line_num` calculation in continuation chunks must handle variable chunk sizes
- Continued indicator logic (`continued...` / `...continued...` / `...continued`) works by chunk index — no change needed since it's based on position not size

---

## Work Objectives

### Core Objective
Enable slide authors to override the global code/table split limits on a per-block basis using `<!-- split: N -->` or `<!-- split: N, M -->` HTML comment directives.

### Concrete Deliverables
- Modified `slides/template_deck/process_markdown.py` with:
  - New regex pattern for directive parsing
  - State variable for pending split directive
  - Hard override in code splitting path
  - Hard override in table splitting path (including EOF handler)
  - Refactored `split_table()` to support first/continuation max rows
  - Refactored code chunking to support first/continuation max lines
- Updated `slides/template_deck/STYLE_GUIDE.md` with new section documenting the directive
- Updated `slides/template_deck/AGENTS.md` mentioning the feature
- Updated `slides/AGENTS.md` mentioning the feature
- Updated root `AGENTS.md` if relevant (likely just a minor mention under slide preprocessing)
- New `slides/template_deck/test_split_control.md` test presentation
- Playwright screenshots saved to `.sisyphus/evidence/`

### Definition of Done
- [ ] `<!-- split: 10 -->` before a 25-line code block produces a split at line 10, then every 20 lines (global default) thereafter
- [ ] `<!-- split: 10, 15 -->` before a 40-line code block produces chunks of 10, 15, 15 lines
- [ ] `<!-- split: 5 -->` before a 20-row table produces a split at row 5, then every 8 rows (global default) thereafter
- [ ] `<!-- split: 5, 10 -->` before a 25-row table produces chunks of 5, 10, 10 rows
- [ ] A second block on the same slide without a directive uses global defaults
- [ ] Existing lectures compile without any changes (no regression)
- [ ] Continued indicators (continued.../...continued.../...continued) display correctly
- [ ] Line numbers are continuous and correct across variable-size chunks

### Must Have
- Regex pattern matching `<!-- split: N -->` and `<!-- split: N, M -->`
- One-shot consumption: directive applies to exactly one block, then resets
- Hard override: bypasses `compute_available_code_lines()` when directive is active
- Variable chunk sizes: first chunk uses N, continuations use M (or global default if only N given)
- Works for both code blocks and tables
- All existing lectures compile identically when no directives are present (backward compatible)

### Must NOT Have (Guardrails)
- Do NOT add separate `<!-- code-split: -->` and `<!-- table-split: -->` directives — single directive only
- Do NOT change `compile.sh` CLI arguments
- Do NOT modify `autoscale.js` or `cdl-theme.css`
- Do NOT add the directive to auto-generated continuation slides
- Do NOT create Python unit tests (manual verification only per user decision)
- Do NOT change `analyze_and_warn_slides()` behavior
- Do NOT add the directive to any existing lecture `.md` files

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no Python test files for process_markdown.py)
- **User wants tests**: NO (manual verification only)
- **Framework**: None
- **QA approach**: Manual verification via compilation + Playwright screenshots

### Automated Verification Procedures

Each task's acceptance criteria uses automated verification that agents can execute directly:

**For process_markdown.py changes** (using Bash):
```bash
# Compile the test presentation
cd slides/template_deck
./compile.sh test_split_control.md
# Assert: exit code 0
# Assert: output mentions "Code blocks split:" and "Tables split:"
```

**For visual verification** (using Playwright skill):
```
1. Open: file:///Users/jmanning/llm-course/slides/template_deck/test_split_control.html
2. Navigate through slides
3. Screenshot each slide to .sisyphus/evidence/
4. Verify: code blocks split at expected line numbers
5. Verify: tables split at expected row counts
6. Verify: "continued..." indicators appear correctly
```

**For regression testing** (using Bash):
```bash
# Compile an existing lecture to verify no regression
cd slides/week1
../template_deck/compile.sh lecture1.md
# Assert: exit code 0
# Compare output stats with known baseline
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Modify process_markdown.py (core implementation)
└── Task 2: Update documentation files (STYLE_GUIDE, AGENTS.md files)

Wave 2 (After Wave 1):
├── Task 3: Create test presentation
└── (Task 3 depends on Task 1 for correct compilation)

Wave 3 (After Wave 2):
├── Task 4: Compile and run regression tests
└── Task 5: Visual verification with Playwright
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4, 5 | 2 |
| 2 | None | None | 1 |
| 3 | 1 | 4, 5 | None |
| 4 | 1, 3 | 5 | None |
| 5 | 4 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | Task 1: ultrabrain (complex Python refactor). Task 2: quick (doc edits) |
| 2 | 3 | quick (markdown authoring) |
| 3 | 4, 5 | Task 4: quick (bash compilation). Task 5: visual-engineering with playwright skill |

---

## TODOs

- [ ] 1. Modify `process_markdown.py` — add directive parsing and split override logic

  **What to do**:
  
  **Step 1: Add regex pattern** (near line 799, alongside existing patterns):
  ```python
  SPLIT_DIRECTIVE_PATTERN = re.compile(r"<!--\s*split:\s*(\d+)(?:\s*,\s*(\d+))?\s*-->")
  ```
  
  **Step 2: Add state variable** (near line 1277, in the state tracking section):
  ```python
  # Per-slide split directive: (first_max, continuation_max) or None
  pending_split_directive = None
  ```
  
  **Step 3: Parse the directive in the main loop** (in the "regular line" else branch, around line 1513-1515):
  - Before `result_lines.append(process_arrow_syntax(line))`, check if the line matches `SPLIT_DIRECTIVE_PATTERN`
  - If it matches: extract `first_max` (group 1) and `cont_max` (group 2, optional — defaults to global)
  - Store as `pending_split_directive = (first_max, cont_max_or_none)`
  - Still append the line to `result_lines` (the HTML comment is invisible in output)
  - Continue to next line
  
  **Step 4: Override code block splitting** (lines 1340-1457):
  - When code block ends and splitting is needed:
    - If `pending_split_directive` is set:
      - Use `pending_split_directive[0]` as `first_max` (ignore `compute_available_code_lines()`)
      - Use `pending_split_directive[1]` as `cont_max` (if None, fall back to global `max_lines`)
      - Clear `pending_split_directive = None` (consumed)
    - If not set: use existing logic (`compute_available_code_lines()`)
  - **Refactor chunking from fixed-step to variable-step**:
    ```python
    # OLD: chunks = [buffer[j:j+max] for j in range(0, len(buffer), max)]
    # NEW:
    chunks = []
    pos = 0
    chunk_idx = 0
    while pos < len(code_lines_buffer):
        current_max = first_max if chunk_idx == 0 else cont_max
        chunks.append(code_lines_buffer[pos:pos + current_max])
        pos += current_max
        chunk_idx += 1
    ```
  - **Fix `start_line_num` calculation**: Currently uses `chunk_idx * effective_max_lines + 1`. With variable chunks, must track cumulative lines:
    ```python
    cumulative_lines = 0
    for chunk_idx, chunk in enumerate(chunks):
        start_line_num = cumulative_lines + 1
        # ... render chunk ...
        cumulative_lines += len(chunk)
    ```
  
  **Step 5: Override table splitting** (lines 1466-1508):
  - When a table ends and splitting is needed:
    - If `pending_split_directive` is set:
      - Use `pending_split_directive[0]` as `first_max_rows`
      - Use `pending_split_directive[1]` as `cont_max_rows` (if None, fall back to global `max_table_rows`)
      - Clear `pending_split_directive = None` (consumed)
    - Pass both values to `split_table()`
  
  **Step 6: Update `split_table()` function** (line 619):
  - Change signature: `def split_table(table_lines, max_rows, current_title, cont_max_rows=None)`
  - If `cont_max_rows` is None, use `max_rows` for all chunks (backward compatible)
  - Refactor chunking loop from `range(0, len, step)` to variable-step:
    ```python
    chunks = []
    pos = 0
    chunk_idx = 0
    while pos < len(data_rows):
        current_max = max_rows if chunk_idx == 0 else (cont_max_rows or max_rows)
        chunks.append(data_rows[pos:pos + current_max])
        pos += current_max
        chunk_idx += 1
    ```
  
  **Step 7: Update end-of-file table handler** (lines 1519-1540):
  - Same logic as Step 5: check `pending_split_directive` and pass to `split_table()`
  
  **Step 8: Reset directive at slide boundaries** (line 1316-1317):
  - When `---` is encountered: `pending_split_directive = None`
  - This ensures a directive on one slide doesn't leak to the next slide
  
  **Step 9: Add to stats tracking**:
  - Add `"split_directives_found": 0` to stats dict
  - Increment when a directive is parsed
  - Print in output if > 0

  **Must NOT do**:
  - Do NOT change `compute_available_code_lines()` function itself
  - Do NOT change `analyze_and_warn_slides()` function
  - Do NOT change `compile.sh` or CLI arguments
  - Do NOT change the continued indicator CSS classes or text
  - Do NOT break backward compatibility — when no directive is present, behavior must be identical to current

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex Python refactoring with multiple interacting code paths, state management, and backward compatibility requirements
  - **Skills**: [`git-master`]
    - `git-master`: For atomic commit of the Python changes
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for this task (visual verification is a separate task)

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `process_markdown.py:799` — `NO_AUTOSCALE_PATTERN` regex for HTML comment directive parsing. Follow this pattern for the new `SPLIT_DIRECTIVE_PATTERN`.
  - `process_markdown.py:843-893` — `compute_available_code_lines()` function. Understand what it does so you can correctly bypass it when the directive is active.
  - `process_markdown.py:1270-1282` — State tracking variables section. Add new `pending_split_directive` variable here.
  - `process_markdown.py:1316-1317` — Slide boundary detection. Add directive reset here.
  - `process_markdown.py:1340-1457` — Full code block splitting logic. This is the main target for the variable-chunk refactor.
  - `process_markdown.py:1350-1357` — Current fixed-step chunking loop. Replace with variable-step loop.
  - `process_markdown.py:1362-1438` — Chunk rendering and continued indicators. Fix `start_line_num` calculation for variable chunks.
  - `process_markdown.py:1466-1508` — Table splitting in main loop. Add directive override here.
  - `process_markdown.py:1519-1540` — End-of-file table handler. Add directive override here too.
  - `process_markdown.py:619-695` — `split_table()` function. Refactor to support `cont_max_rows` parameter.
  - `process_markdown.py:644-647` — Fixed-step table chunking. Replace with variable-step.

  **API/Type References**:
  - `process_markdown.py:1217-1233` — `process_markdown()` function signature. Shows parameters `max_lines` and `max_table_rows` which are the global defaults.
  - `process_markdown.py:1284-1304` — Stats dictionary. Add `split_directives_found` key.

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # 1. Verify the regex pattern parses correctly
  cd slides/template_deck
  python3 -c "
  import re
  pat = re.compile(r'<!--\s*split:\s*(\d+)(?:\s*,\s*(\d+))?\s*-->')
  # Single number
  m = pat.search('<!-- split: 10 -->')
  assert m and m.group(1) == '10' and m.group(2) is None, f'Single: {m}'
  # Two numbers
  m = pat.search('<!-- split: 10, 20 -->')
  assert m and m.group(1) == '10' and m.group(2) == '20', f'Double: {m}'
  # With extra spaces
  m = pat.search('<!--  split:  10 ,  20  -->')
  assert m and m.group(1) == '10' and m.group(2) == '20', f'Spaces: {m}'
  # No match on unrelated comments
  m = pat.search('<!-- no-autoscale -->')
  assert m is None, f'False positive: {m}'
  print('All regex tests passed')
  "
  # Assert: "All regex tests passed"

  # 2. Compile an existing lecture to verify backward compatibility
  cd /Users/jmanning/llm-course/slides/week1
  ../template_deck/compile.sh lecture2.md 2>&1
  # Assert: exit code 0
  # Assert: no errors in output
  ```

  **Commit**: YES
  - Message: `feat(slides): add per-slide split control directive for code/table splitting`
  - Files: `slides/template_deck/process_markdown.py`
  - Pre-commit: `cd slides/week1 && ../template_deck/compile.sh lecture2.md`

---

- [ ] 2. Update documentation files (STYLE_GUIDE.md + all AGENTS.md)

  **What to do**:

  **Step 1: Update `slides/template_deck/STYLE_GUIDE.md`**:
  - Add a new subsection under "Code Blocks" (after line 253, before the `---`) titled "Per-Slide Split Control"
  - Document:
    - Syntax: `<!-- split: N -->` and `<!-- split: N, M -->`
    - Semantics: N = max lines/rows on first slide, M = max on continuations
    - If only N given, continuations use global default
    - One-shot: applies to the next code/table block only
    - Works for both code blocks and tables
    - Example usage
  - Also update the "Tables" → "Auto-Splitting" section (around line 213-217) to mention per-slide control
  - Also update the Quick Reference section (around line 1016) to add the directive

  **Step 2: Update `slides/template_deck/AGENTS.md`**:
  - Add mention of per-slide split directives under CONVENTIONS section
  - Example: `**Split directives**: Use \`<!-- split: N -->\` or \`<!-- split: N, M -->\` to override split limits for the next code/table block.`

  **Step 3: Update `slides/AGENTS.md`**:
  - Add mention under CONVENTIONS → "Content splitting" bullet
  - Example: `**Content splitting**: Long code/tables auto-split by \`process_markdown.py\` with "continued..." markers. Per-slide overrides available via \`<!-- split: N -->\` directives.`

  **Step 4: Update root `AGENTS.md`**:
  - Under "Slide preprocessing" or "Slide compilation" mention, add brief note about per-slide split directives
  - Keep it minimal — just mention the feature exists and point to STYLE_GUIDE.md for details

  **Must NOT do**:
  - Do NOT over-document — keep additions concise and consistent with existing doc style
  - Do NOT add emojis to documentation
  - Do NOT restructure existing documentation sections

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward documentation edits across 4 files. No complex logic.
  - **Skills**: [`git-master`]
    - `git-master`: For atomic commit of doc changes
  - **Skills Evaluated but Omitted**:
    - `writing`: Overkill for technical doc edits that follow existing patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1)
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `slides/template_deck/STYLE_GUIDE.md:213-225` — Existing "Tables" → "Auto-Splitting" section. Add per-slide control mention here.
  - `slides/template_deck/STYLE_GUIDE.md:228-253` — Existing "Code Blocks" section. Add new subsection after this.
  - `slides/template_deck/STYLE_GUIDE.md:913-924` — Existing "Opting Out of Auto-Scaling" section with `<!-- no-autoscale -->`. The new directive documentation should follow this style.
  - `slides/template_deck/STYLE_GUIDE.md:1016-1066` — Quick Reference section. Add entry for split directive.
  - `slides/template_deck/AGENTS.md:41-49` — CONVENTIONS section. Add split directive mention.
  - `slides/AGENTS.md:39-41` — CONVENTIONS → Content splitting bullet. Update.
  - `AGENTS.md` root — "Slide compilation" line in the OVERVIEW or compilation section.

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # Verify all 4 files contain the new directive documentation
  grep -l "split:" slides/template_deck/STYLE_GUIDE.md slides/template_deck/AGENTS.md slides/AGENTS.md AGENTS.md
  # Assert: all 4 files listed

  # Verify STYLE_GUIDE has code examples
  grep -c "<!-- split:" slides/template_deck/STYLE_GUIDE.md
  # Assert: >= 3 occurrences (syntax example, code example, table example)
  ```

  **Commit**: YES
  - Message: `docs(slides): document per-slide split control directive`
  - Files: `slides/template_deck/STYLE_GUIDE.md`, `slides/template_deck/AGENTS.md`, `slides/AGENTS.md`, `AGENTS.md`
  - Pre-commit: None

---

- [ ] 3. Create test presentation (`test_split_control.md`)

  **What to do**:

  Create `slides/template_deck/test_split_control.md` with Marp frontmatter and test slides exercising:

  **Slide 1**: Title slide
  
  **Slide 2**: Code block with `<!-- split: 10 -->` — a 25-line Python code block. Expected: first chunk = 10 lines, then 20 (global default), then remaining 5.
  
  **Slide 3** (after the split slides): Code block with `<!-- split: 8, 12 -->` — a 32-line code block. Expected: first chunk = 8 lines, then 12, then 12.
  
  **Slide 4**: Table with `<!-- split: 5 -->` — a 20-row table. Expected: first chunk = 5 rows, then 8 (global default), then 7 remaining.
  
  **Slide 5**: Table with `<!-- split: 4, 6 -->` — an 18-row table. Expected: first chunk = 4 rows, then 6, 6, 2.
  
  **Slide 6**: Code block with `<!-- split: 10 -->` on a slide that also has a title and a callout box (tests interaction with content-heavy slides — directive should hard-override).
  
  **Slide 7**: Two blocks on one slide — `<!-- split: 5 -->` followed by a 15-line code block, then a 15-row table (no directive). Expected: code splits at 5 then 20 (global), table splits at 8 (global default, since directive was consumed).
  
  **Slide 8**: `<!-- split: 10 -->` followed by a SHORT code block (only 5 lines). Expected: no split (block is shorter than limit). Directive consumed.
  
  **Slide 9**: `<!-- _class: scale-85 -->` with `<!-- split: 15 -->` and a 30-line code block. Expected: split at 15 (hard override, scale class doesn't affect it).
  
  **Slide 10**: Code block with NO directive — a 25-line block. Expected: uses global default (dynamic computation). Verifies that consuming a directive earlier doesn't affect later slides.

  **Must NOT do**:
  - Do NOT use actual lecture content — use clearly labeled test data (numbered lines, labeled rows)
  - Do NOT add this file to any lecture index or navigation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Markdown authoring following known patterns
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All — straightforward file creation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Task 1 (needs working process_markdown.py to compile)

  **References**:

  **Pattern References**:
  - Any existing lecture `.md` file for Marp frontmatter pattern. Example: `slides/week1/lecture1.md` (first ~10 lines for frontmatter structure)
  - `slides/template_deck/STYLE_GUIDE.md:97-110` — Title slide structure
  - `slides/template_deck/STYLE_GUIDE.md:315-398` — Callout box syntax (for Slide 6 test)

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # Verify file exists and has Marp frontmatter
  head -5 slides/template_deck/test_split_control.md
  # Assert: contains "marp: true"

  # Verify it has multiple slides
  grep -c "^---$" slides/template_deck/test_split_control.md
  # Assert: >= 10 (slide separators)

  # Verify it contains split directives
  grep -c "<!-- split:" slides/template_deck/test_split_control.md
  # Assert: >= 6 (one per test case)
  ```

  **Commit**: YES (groups with Task 1 or standalone)
  - Message: `test(slides): add test presentation for per-slide split control`
  - Files: `slides/template_deck/test_split_control.md`
  - Pre-commit: None

---

- [ ] 4. Compile test presentation and run regression test

  **What to do**:

  **Step 1: Compile the test presentation**:
  ```bash
  cd slides/template_deck
  ./compile.sh test_split_control.md
  ```
  - Verify exit code 0
  - Check output stats: code blocks split count, tables split count, slides added
  - Verify `split_directives_found` stat appears

  **Step 2: Regression test an existing lecture**:
  ```bash
  cd slides/week1
  ../template_deck/compile.sh lecture2.md
  ```
  - Verify exit code 0
  - Verify output is identical to previous compilation (no directives present = no behavior change)

  **Step 3: If compilation fails**, fix issues in `process_markdown.py` and re-run.

  **Must NOT do**:
  - Do NOT modify existing lectures
  - Do NOT skip the regression test

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Running shell commands and checking output
  - **Skills**: [`git-master`]
    - `git-master`: For committing any fixes
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed yet (visual verification is Task 5)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - `slides/template_deck/compile.sh` — Build script entry point. Run from the directory containing the `.md` file.

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # Compile test presentation
  cd /Users/jmanning/llm-course/slides/template_deck
  ./compile.sh test_split_control.md 2>&1
  # Assert: exit code 0
  # Assert: output contains "Code blocks split:"
  # Assert: output contains "Tables split:"
  # Assert: test_split_control.html exists

  # Regression: compile existing lecture
  cd /Users/jmanning/llm-course/slides/week1
  ../template_deck/compile.sh lecture2.md 2>&1
  # Assert: exit code 0
  ```

  **Commit**: NO (compilation artifacts are generated files)

---

- [ ] 5. Visual verification with Playwright screenshots

  **What to do**:

  **Step 1: Open the compiled test presentation** in a browser:
  - URL: `file:///Users/jmanning/llm-course/slides/template_deck/test_split_control.html`

  **Step 2: Navigate through ALL slides and take screenshots**:
  - Save each screenshot to `.sisyphus/evidence/split-control-slide-NN.png`

  **Step 3: Verify each test case**:
  
  | Test Case | What to Check |
  |-----------|---------------|
  | Slide 2 (split:10, 25-line code) | First chunk has lines 1-10, second has 11-20 (global), third has 21-25 |
  | Slide 3 (split:8,12, 32-line code) | First chunk = 8 lines, second = 12, third = 12 |
  | Slide 4 (split:5, 20-row table) | First chunk = 5 rows, second = 8 (global), third = 7 |
  | Slide 5 (split:4,6, 18-row table) | First chunk = 4, second = 6, third = 6, fourth = 2 |
  | Slide 6 (split:10, with callout) | Code splits at line 10 despite callout box on slide |
  | Slide 7 (one directive, two blocks) | Code splits at 5, table uses global default 8 |
  | Slide 8 (split:10, short block) | No split — block shorter than limit |
  | Slide 9 (split:15, with scale-85) | Code splits at 15, not affected by scale class |
  | Slide 10 (no directive) | Code uses global dynamic default |

  **Step 4: Verify continued indicators**:
  - First slide of split: shows "continued..."
  - Middle slides: shows "...continued..."
  - Last slide: shows "...continued"
  
  **Step 5: Verify line numbers are continuous**:
  - Line numbers should be 1, 2, 3... through the entire code block, not restarting on each slide

  **Must NOT do**:
  - Do NOT modify any source files during verification
  - Do NOT skip any test case

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Browser automation for visual verification
  - **Skills**: [`playwright`]
    - `playwright`: Required for browser automation and screenshots
  - **Skills Evaluated but Omitted**:
    - `git-master`: No commits needed for this task

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 4)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 4 (needs compiled HTML)

  **References**:

  **Pattern References**:
  - Compiled HTML file: `slides/template_deck/test_split_control.html`
  - Marp HTML slides use keyboard arrow keys to navigate between slides

  **Acceptance Criteria**:

  **Automated Verification (via Playwright):**
  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: file:///Users/jmanning/llm-course/slides/template_deck/test_split_control.html
  2. For each slide (navigate with ArrowRight key):
     a. Screenshot: .sisyphus/evidence/split-control-slide-{N}.png
     b. Extract text content from the slide
     c. Verify expected split points match actual content
  3. Total screenshots taken >= 15 (original slides + split continuations)
  ```

  **Evidence to Capture:**
  - [ ] Screenshots in `.sisyphus/evidence/split-control-slide-*.png`
  - [ ] Summary of pass/fail per test case

  **Commit**: NO (screenshots are verification artifacts)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(slides): add per-slide split control directive for code/table splitting` | `process_markdown.py` | Compile existing lecture |
| 2 | `docs(slides): document per-slide split control directive` | `STYLE_GUIDE.md`, `AGENTS.md` (x3) | grep for directive |
| 3 | `test(slides): add test presentation for per-slide split control` | `test_split_control.md` | File exists |
| (optional) | `chore: combine tasks 1-3` if preferred as single commit | All above | Full compile |

---

## Success Criteria

### Verification Commands
```bash
# Compile test presentation
cd slides/template_deck && ./compile.sh test_split_control.md
# Expected: exit 0, stats show splits

# Regression test
cd slides/week1 && ../template_deck/compile.sh lecture2.md
# Expected: exit 0, identical output to before

# Check documentation
grep "split:" slides/template_deck/STYLE_GUIDE.md | head -5
# Expected: multiple references to the directive
```

### Final Checklist
- [ ] `<!-- split: N -->` parses correctly for single number
- [ ] `<!-- split: N, M -->` parses correctly for two numbers
- [ ] Code blocks split at the specified first-chunk size
- [ ] Table blocks split at the specified first-chunk size
- [ ] Continuation chunks use M (or global default if not specified)
- [ ] Directive is consumed after one block (one-shot)
- [ ] Directive resets at slide boundaries (`---`)
- [ ] Line numbers are continuous across variable-size code chunks
- [ ] Continued indicators display correctly
- [ ] Existing lectures compile without any changes
- [ ] STYLE_GUIDE.md documents the new feature
- [ ] All AGENTS.md files updated
- [ ] Test presentation exercises all edge cases
- [ ] Playwright screenshots confirm visual correctness
