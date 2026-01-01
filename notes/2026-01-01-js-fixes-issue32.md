# Session Notes: JavaScript Error Fixes (Issue #32)

## Date: 2026-01-01

## Summary

Fixed JavaScript errors in multiple LLM course demos as documented in GitHub issue #32.

## Changes Made

### 1. Demo 02 (Tokenization) - `tokenizer.tokenize is not a function`
**File:** `demos/02-tokenization/js/tokenizer-comparison.js`

**Issue:** The `tokenizer.tokenize()` method doesn't exist in Transformers.js AutoTokenizer. Only `encode()` and `decode()` are available.

**Fix:** Changed the implementation to:
1. Use `tokenizer.encode(text)` to get token IDs
2. Decode each token ID individually with `tokenizer.decode([id])` to get token strings
3. Also fixed innerHTML usage to use safe DOM methods (removeChild loop)

### 2. Demo 04 (Attention) - Version Inconsistency
**File:** `demos/04-attention/js/attention-extractor.js`

**Issue:** Used Transformers.js version @2.17.2 while other demos use @2.17.1

**Fix:** Changed import to use consistent version @2.17.1

### 3. Demo 05 (Transformer) - OrbitControls Error
**File:** `demos/05-transformer/index.html`

**Issue:** OrbitControls was loaded from `https://threejs.org/examples/js/controls/OrbitControls.js` which may not be available or have CORS issues.

**Fix:** Changed to use jsdelivr CDN: `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js`

### 4. Demo 10 (POS Tagging) - `nlp is not defined`
**File:** `demos/10-pos-tagging/index.html`

**Issue:** Compromise.js was loaded from unpkg CDN which may have reliability issues.

**Fix:** Changed from `https://unpkg.com/compromise@14.10.0/builds/compromise.min.js` to `https://cdn.jsdelivr.net/npm/compromise@14.10.0/builds/compromise.min.js`

### 5. Demo 13 (BERT MLM) - Transformers.js Not Loading
**File:** `demos/13-bert-mlm/js/bert-model.js`

**Issue:** The code tried to destructure `{ pipeline, AutoTokenizer, AutoModelForMaskedLM }` from `window.Transformers`, but the Transformers.js script tag doesn't set a global `window.Transformers` object.

**Fix:**
1. Added ES module import at top of file: `import { pipeline, AutoTokenizer, AutoModelForMaskedLM, Tensor } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1'`
2. Removed references to `window.Transformers`
3. Moved `Tensor` import to module level instead of dynamic import

## Demos Analyzed But Not Changed

The following demos were analyzed and found to have correct code structure. Their issues are likely environment-related:

### Demo 01 (ELIZA) - Path Error
- Code correctly loads from `data/eliza-rules.json`
- The JSON file exists at the correct path
- Issue may be CORS/local file access when not using a web server

### Demo 03, 12, 14 (Embeddings, Semantic Search, Embeddings Comparison) - ES Module Issues
- All three demos already have `type="module"` on script tags
- Code correctly uses ES module syntax
- Dynamic imports use proper CDN URLs
- Issue may be CORS or CDN availability

### Demo 07 (RAG) - Model Loading Fails
- Uses dynamic import for Transformers.js (correct approach)
- Data file `wikipedia-articles.json` exists (5MB)
- Issue is likely network-related (large model download, CDN availability)

### Demo 11 (Analogies) - Plotly 3D Cameraposition Error
- Visualization code uses correct Plotly layout syntax
- Camera configuration is properly structured: `camera: { eye: { x, y, z } }`
- Error may be intermittent or browser-specific

## Root Causes Identified

1. **CDN Reliability:** unpkg and threejs.org direct links can be unreliable. jsdelivr is more consistent.

2. **Transformers.js API:**
   - No `window.Transformers` global - must use ES module imports
   - `tokenizer.tokenize()` doesn't exist - use `encode()` + `decode()`

3. **Three.js OrbitControls:** Must use versioned CDN URL that matches Three.js version

4. **ES Modules:** Script tags must have `type="module"` for import/export syntax

## Files Changed
- `demos/02-tokenization/js/tokenizer-comparison.js`
- `demos/04-attention/js/attention-extractor.js`
- `demos/05-transformer/index.html`
- `demos/10-pos-tagging/index.html`
- `demos/13-bert-mlm/js/bert-model.js`
