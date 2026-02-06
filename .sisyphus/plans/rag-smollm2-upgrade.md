# RAG Demo SmolLM2 Upgrade

## TL;DR

> **Quick Summary**: Upgrade the RAG demo's text generator from flan-t5-small (~80M params) to SmolLM2 (135M-360M params) to fix nonsense answers. Port proven patterns from the chatbot-evolution demo's gpt-bot.js.
> 
> **Deliverables**:
> - Updated `rag-pipeline.js` with SmolLM2 generator
> - Updated `vector-store.js` with v3 CDN import
> - UI status indicator for model loading
> - Query "what is a submarine" returns coherent answer
> 
> **Estimated Effort**: Medium (3-4 hours)
> **Parallel Execution**: NO - sequential (each task depends on previous)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5

---

## Context

### Original Request
Upgrade RAG demo at `/Users/jmanning/llm-course/demos/rag/` to use SmolLM2 instead of flan-t5-small for text generation. Current implementation produces nonsense like "a slounge" for "what is a submarine".

### Interview Summary
**Key Discussions**:
- Root cause: flan-t5-small is too small for instruction-following RAG tasks
- Solution: Port SmolLM2 implementation from `demos/chatbot-evolution/js/gpt-bot.js`
- Keep embedding model as-is (all-MiniLM-L6-v2 works fine for retrieval)

**Research Findings**:
- Transformers.js v3 uses `@huggingface/transformers` (not `@xenova/transformers`)
- v3 uses `dtype: 'q4'` and `device: 'webgpu'/'wasm'`
- Chat messages format: `[{role: 'system', content: ...}, {role: 'user', content: ...}]`
- Model IDs: `onnx-community/SmolLM2-135M-Instruct-ONNX`, `onnx-community/SmolLM2-360M-Instruct-ONNX`

### Metis Review
**Identified Gaps** (addressed):
- Memory pressure from dual models (embedding + generation) - Added RAM warning in plan
- buildPrompt format change needed - Explicit task for messages format conversion
- Non-RAG mode path needs same update - Included in generation task
- Missing acceptance criteria - Added embedding dimension check

---

## Work Objectives

### Core Objective
Replace the RAG demo's flan-t5-small text generator with SmolLM2 for coherent, instruction-following answers to user queries.

### Concrete Deliverables
- `demos/rag/js/vector-store.js` - Updated CDN import to v3
- `demos/rag/js/rag-pipeline.js` - New SmolLM2 generator with RAM-based selection
- `demos/rag/index.html` - Model loading status indicator in UI
- Working demo that answers "what is a submarine" coherently

### Definition of Done
- [ ] `npm run test:demo07` passes (all 83 tests)
- [ ] Browser console shows no errors during initialization
- [ ] Query "what is a submarine" mentions underwater/vessel/ship
- [ ] Works on 4GB+ RAM devices
- [ ] Falls back to 135M model or WASM gracefully

### Must Have
- SmolLM2 generator (135M or 360M based on RAM)
- WebGPU with WASM fallback
- Chat messages format for generation
- Preserved embedding model functionality (384-dim vectors)
- All existing tests passing

### Must NOT Have (Guardrails)
- Model selection UI/dropdown (auto-select only)
- Conversation history/multi-turn state
- Changes to retriever.js or chunking logic
- Changes to test file (tests use MockVectorStore)
- Streaming generation
- Shared transformers instance abstraction

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL verification is executed by the agent using tools (browser console, test commands).

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Keep existing tests (they mock the generator)
- **Framework**: Custom TestRunner in test-rag.mjs

### Agent-Executed QA Scenarios (MANDATORY)

**Primary verification via browser console + npm test command.**

---

## Execution Strategy

### Sequential Execution (No Parallelization)

Each task depends on the previous task's completion:

```
Task 1: Verify embedding model v3 compatibility
    ↓
Task 2: Upgrade rag-pipeline.js generator
    ↓
Task 3: Update buildPrompt and generate methods
    ↓
Task 4: Add UI model status indicator
    ↓
Task 5: End-to-end verification
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5 | None |
| 2 | 1 | 3, 4, 5 | None |
| 3 | 2 | 4, 5 | None |
| 4 | 3 | 5 | None |
| 5 | 4 | None | None (final) |

---

## TODOs

- [ ] 1. Verify Embedding Model v3 Compatibility

  **What to do**:
  - Update CDN import in `vector-store.js` from `@xenova/transformers@2.17.1` to `@huggingface/transformers@3`
  - Keep model ID as `Xenova/all-MiniLM-L6-v2` (works with v3)
  - Test that embedding dimension is still 384

  **Must NOT do**:
  - Change embedding model ID
  - Change pooling/normalize options
  - Modify any other vector-store logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-line CDN change + browser verification
  - **Skills**: `[]`
    - No special skills needed - simple file edit

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None (start immediately)

  **References**:
  - `demos/rag/js/vector-store.js:23` - Current CDN import line
  - `demos/chatbot-evolution/js/gpt-bot.js:240` - v3 import pattern

  **Acceptance Criteria**:

  - [ ] CDN updated to `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3`
  - [ ] No breaking changes to embedding generation

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Embedding model loads with v3 CDN
    Tool: Playwright (playwright skill)
    Preconditions: Local server running on localhost:8000
    Steps:
      1. Navigate to: http://localhost:8000/demos/rag/
      2. Click: button#init-btn
      3. Wait for: .status-success visible (timeout: 60s)
      4. Execute console: ragPipeline.vectorStore.embeddings[0]?.length
      5. Assert: Result equals 384
      6. Screenshot: .sisyphus/evidence/task-1-embedding-v3.png
    Expected Result: Embedding dimension is 384, init succeeds
    Evidence: .sisyphus/evidence/task-1-embedding-v3.png

  Scenario: Embedding model fails gracefully if v3 breaks
    Tool: Bash (check console output)
    Steps:
      1. Start server: python -m http.server 8000
      2. Open browser devtools, navigate to demo
      3. Check console for "Embedding model initialized successfully"
      4. If error, note the specific error message
    Expected Result: Either success or clear error message
    Evidence: Console output captured
  ```

  **Commit**: YES
  - Message: `feat(rag): upgrade vector-store to transformers.js v3`
  - Files: `demos/rag/js/vector-store.js`
  - Pre-commit: None (browser verification only)

---

- [ ] 2. Upgrade Generator to SmolLM2

  **What to do**:
  - Replace `initializeGenerator()` method in `rag-pipeline.js`
  - Add RAM-based model selection (135M for <4GB, 360M for 4GB+)
  - Add WebGPU detection with WASM fallback
  - Add WASM memory probing (copy `probeWasmMemory` from gpt-bot.js)
  - Store model info for UI display
  - Add progress callback support for model download

  **Must NOT do**:
  - Add model selection UI (auto-select only)
  - Add conversation history array
  - Change other methods yet (buildPrompt/generate are Task 3)
  - Modify retriever or vector store logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core logic change, needs careful porting from reference
  - **Skills**: `[]`
    - No special skills - JS editing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: Task 1

  **References**:
  - `demos/rag/js/rag-pipeline.js:54-69` - Current initializeGenerator
  - `demos/chatbot-evolution/js/gpt-bot.js:22-49` - probeWasmMemory function
  - `demos/chatbot-evolution/js/gpt-bot.js:56-87` - checkWebGPU function
  - `demos/chatbot-evolution/js/gpt-bot.js:97-127` - models array with specs
  - `demos/chatbot-evolution/js/gpt-bot.js:138-168` - getDefaultModelIndex logic
  - `demos/chatbot-evolution/js/gpt-bot.js:228-348` - loadModel function

  **Pattern to follow**:
  ```javascript
  // Model definitions (from gpt-bot.js:97-120)
  this.models = [
      {
          name: 'onnx-community/SmolLM2-135M-Instruct-ONNX',
          displayName: 'SmolLM2 135M',
          dtype: 'q4',
          sizeMB: 172,
          wasmMinMB: 500,
          minRAM: 2
      },
      {
          name: 'onnx-community/SmolLM2-360M-Instruct-ONNX',
          displayName: 'SmolLM2 360M',
          dtype: 'q4',
          sizeMB: 368,
          wasmMinMB: 900,
          minRAM: 4
      }
  ];
  ```

  **Acceptance Criteria**:

  - [ ] `initializeGenerator()` uses v3 CDN import
  - [ ] Uses `text-generation` pipeline (not `text2text-generation`)
  - [ ] Auto-selects 135M or 360M based on RAM
  - [ ] Attempts WebGPU first, falls back to WASM
  - [ ] Falls back to smaller model if larger fails
  - [ ] Stores `this.currentModel` for UI display

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Generator loads SmolLM2 model
    Tool: Playwright (playwright skill)
    Preconditions: Local server running, Task 1 complete
    Steps:
      1. Navigate to: http://localhost:8000/demos/rag/
      2. Open browser devtools console
      3. Click: button#init-btn
      4. Wait for: text "Loading generator model" in #init-status
      5. Wait for: .status-success visible (timeout: 120s)
      6. Execute console: ragPipeline.generator !== null
      7. Assert: Result is true
      8. Execute console: ragPipeline.currentModel?.displayName
      9. Assert: Result contains "SmolLM2"
      10. Screenshot: .sisyphus/evidence/task-2-generator-loaded.png
    Expected Result: Generator loads, currentModel is SmolLM2
    Evidence: .sisyphus/evidence/task-2-generator-loaded.png

  Scenario: Low-RAM fallback works
    Tool: Playwright (playwright skill)
    Preconditions: Cannot directly test low RAM, but verify fallback code exists
    Steps:
      1. Read rag-pipeline.js
      2. Verify fallback loop exists (iterates from 360M to 135M)
      3. Verify WASM fallback exists after WebGPU failure
    Expected Result: Fallback code is present
    Evidence: Code inspection
  ```

  **Commit**: YES
  - Message: `feat(rag): add SmolLM2 generator with RAM-based selection`
  - Files: `demos/rag/js/rag-pipeline.js`
  - Pre-commit: None

---

- [ ] 3. Update buildPrompt and generate Methods

  **What to do**:
  - Change `buildPrompt()` to return messages array instead of string
  - Create system prompt that instructs the model about RAG context
  - Update `generate()` to:
    - Accept messages array
    - Use correct generation parameters (`max_new_tokens` not `max_length`)
    - Extract response from new output format
  - Handle non-RAG mode (no context) with appropriate system message
  - Handle empty context edge case

  **Must NOT do**:
  - Add conversation history
  - Change retrieval logic
  - Modify `answerQuery()` return value structure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core generation logic change, format conversion
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Task 2

  **References**:
  - `demos/rag/js/rag-pipeline.js:213-221` - Current buildPrompt (string format)
  - `demos/rag/js/rag-pipeline.js:227-241` - Current generate method
  - `demos/chatbot-evolution/js/gpt-bot.js:371-383` - Messages format example
  - `demos/chatbot-evolution/js/gpt-bot.js:376-383` - Generation parameters

  **Pattern to follow**:
  ```javascript
  // New buildPrompt (returns messages array)
  buildPrompt(query, context) {
      const systemContent = context
          ? `You are a helpful assistant. Answer questions based on the provided context. Be concise and accurate.

Context:
${context}`
          : 'You are a helpful assistant. Answer questions to the best of your ability.';
      
      return [
          { role: 'system', content: systemContent },
          { role: 'user', content: query }
      ];
  }

  // New generate method
  async generate(messages) {
      const result = await this.generator(messages, {
          max_new_tokens: 256,
          temperature: 0.7,
          do_sample: true,
          top_k: 40,
          top_p: 0.9,
          repetition_penalty: 1.1
      });
      
      // Extract assistant response from output
      const generated = result[0].generated_text;
      if (Array.isArray(generated)) {
          return generated[generated.length - 1]?.content || '';
      }
      return generated;
  }
  ```

  **Acceptance Criteria**:

  - [ ] `buildPrompt()` returns array of `{role, content}` objects
  - [ ] System message includes context when RAG is enabled
  - [ ] System message is generic when RAG is disabled
  - [ ] `generate()` uses `max_new_tokens: 256`
  - [ ] Response extraction handles array output format
  - [ ] Empty context handled gracefully

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: RAG query returns coherent answer
    Tool: Playwright (playwright skill)
    Preconditions: Demo initialized and documents chunked/indexed
    Steps:
      1. Navigate to: http://localhost:8000/demos/rag/
      2. Click: button#init-btn
      3. Wait for: .status-success (init complete)
      4. Click: button#process-btn
      5. Wait for: #visualization-section visible (chunking complete)
      6. Fill: textarea#query-input with "what is a submarine"
      7. Click: button#query-with-rag-btn
      8. Wait for: #results-section visible (timeout: 30s)
      9. Read: #answer-text content
      10. Assert: Answer contains one of ["underwater", "vessel", "ship", "naval", "ocean", "water"]
      11. Assert: Answer length > 50 characters
      12. Assert: Answer does NOT contain "slounge" or gibberish
      13. Screenshot: .sisyphus/evidence/task-3-submarine-answer.png
    Expected Result: Coherent answer about submarines
    Evidence: .sisyphus/evidence/task-3-submarine-answer.png

  Scenario: Non-RAG query still works
    Tool: Playwright (playwright skill)
    Preconditions: Demo initialized
    Steps:
      1. Continue from previous scenario
      2. Fill: textarea#query-input with "Hello, how are you?"
      3. Click: button#query-without-rag-btn
      4. Wait for: #answer-text updated (timeout: 30s)
      5. Read: #answer-text content
      6. Assert: Answer length > 10 characters
      7. Assert: Answer is not an error message
      8. Screenshot: .sisyphus/evidence/task-3-non-rag.png
    Expected Result: Generic helpful response without context
    Evidence: .sisyphus/evidence/task-3-non-rag.png
  ```

  **Commit**: YES
  - Message: `feat(rag): convert to chat messages format for SmolLM2`
  - Files: `demos/rag/js/rag-pipeline.js`
  - Pre-commit: None

---

- [ ] 4. Add UI Model Status Indicator

  **What to do**:
  - Add status element to show which model is loaded
  - Display during initialization: "Loading SmolLM2 360M..."
  - Display after load: "Using SmolLM2 360M (WebGPU)" or "Using SmolLM2 135M (WASM)"
  - Add to existing init-section or create small info badge

  **Must NOT do**:
  - Add model selection dropdown
  - Major UI redesign
  - Change existing UI element positions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple HTML/JS addition
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  - `demos/rag/index.html:31-46` - Current init section
  - `demos/rag/index.html:44` - Current init-status element

  **Acceptance Criteria**:

  - [ ] Model name displayed after initialization
  - [ ] Backend type (WebGPU/WASM) displayed
  - [ ] Styled consistently with existing UI

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Model info displayed after init
    Tool: Playwright (playwright skill)
    Preconditions: Demo page loaded
    Steps:
      1. Navigate to: http://localhost:8000/demos/rag/
      2. Click: button#init-btn
      3. Wait for: .status-success visible
      4. Assert: Page contains text matching /SmolLM2 (135|360)M/
      5. Assert: Page contains text matching /(WebGPU|WASM)/
      6. Screenshot: .sisyphus/evidence/task-4-model-status.png
    Expected Result: Model name and backend visible in UI
    Evidence: .sisyphus/evidence/task-4-model-status.png
  ```

  **Commit**: YES
  - Message: `feat(rag): display loaded model info in UI`
  - Files: `demos/rag/index.html`
  - Pre-commit: None

---

- [ ] 5. End-to-End Verification and Test Suite

  **What to do**:
  - Run `npm run test:demo07` to verify all 83 tests pass
  - Perform complete browser walkthrough
  - Test multiple queries
  - Verify timing metrics are reasonable
  - Check for console errors/warnings

  **Must NOT do**:
  - Modify test file
  - Change test assertions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no code changes
  - **Skills**: `[playwright]`
    - Browser automation for E2E testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:
  - `tests/test-rag.mjs` - Test file (83 tests)
  - Success criteria from original request

  **Acceptance Criteria**:

  - [ ] `npm run test:demo07` exits with code 0
  - [ ] All 83 tests pass
  - [ ] No console errors during full demo flow
  - [ ] Generation time < 30 seconds
  - [ ] Retrieval time < 2 seconds

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Automated test suite passes
    Tool: Bash
    Preconditions: Code changes complete
    Steps:
      1. cd /Users/jmanning/llm-course
      2. npm run test:demo07
      3. Assert: Exit code is 0
      4. Assert: Output contains "83 passed" or similar
    Expected Result: All tests pass
    Evidence: Terminal output captured

  Scenario: Full E2E demo flow
    Tool: Playwright (playwright skill)
    Preconditions: Local server running
    Steps:
      1. Navigate to: http://localhost:8000/demos/rag/
      2. Click: button#init-btn
      3. Wait for: .status-success (timeout: 120s)
      4. Click: button#process-btn (chunk documents)
      5. Wait for: #visualization-section visible
      6. Click: button#viz-2d-btn (verify visualization works)
      7. Fill: textarea#query-input with "what is a submarine"
      8. Click: button#query-with-rag-btn
      9. Wait for: #results-section visible
      10. Assert: #answer-text contains meaningful content
      11. Read: #generation-time value
      12. Assert: Generation time < 30000 (ms)
      13. Fill: textarea#query-input with "Tell me about artificial intelligence"
      14. Click: button#compare-btn
      15. Wait for: #comparison-result visible
      16. Assert: Both RAG and non-RAG answers present
      17. Screenshot: .sisyphus/evidence/task-5-full-e2e.png
    Expected Result: Complete flow works, answers coherent
    Evidence: .sisyphus/evidence/task-5-full-e2e.png

  Scenario: Error-free console
    Tool: Playwright (playwright skill)
    Preconditions: Fresh page load
    Steps:
      1. Enable console log capture
      2. Navigate to demo and complete full init
      3. Filter console logs for errors
      4. Assert: No error-level logs (warnings OK)
    Expected Result: No JS errors
    Evidence: Console log capture
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(rag): upgrade vector-store to transformers.js v3` | vector-store.js | Browser test |
| 2 | `feat(rag): add SmolLM2 generator with RAM-based selection` | rag-pipeline.js | Browser test |
| 3 | `feat(rag): convert to chat messages format for SmolLM2` | rag-pipeline.js | Browser test |
| 4 | `feat(rag): display loaded model info in UI` | index.html | Browser test |
| 5 | (no commit - verification only) | - | npm test + browser |

---

## Success Criteria

### Verification Commands
```bash
# Run test suite
npm run test:demo07  # Expected: 83 tests pass, exit code 0

# Start local server for browser testing
python -m http.server 8000 --directory /Users/jmanning/llm-course
```

### Final Checklist
- [ ] All "Must Have" present (SmolLM2, WebGPU fallback, messages format)
- [ ] All "Must NOT Have" absent (no model dropdown, no conversation history)
- [ ] All 83 tests pass
- [ ] "What is a submarine" query returns coherent answer about underwater vessels
- [ ] Works on 4GB+ RAM devices
- [ ] Falls back gracefully on lower-spec devices
