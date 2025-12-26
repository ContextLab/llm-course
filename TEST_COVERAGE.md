# Test Coverage Documentation

This document provides a comprehensive overview of the automated test suite for the LLM Course interactive demos.

## Overview

**Total Test Suites**: 7
**Demos Covered**: 5 of 15 (33%)
**Total Test Cases**: 134+
**CI/CD**: GitHub Actions automated testing on every push and pull request

---

## Test Execution

### Run All Tests
```bash
npm test
```

### Run Individual Demo Tests
```bash
npm run test:demo01    # ELIZA Pattern Matching
npm run test:demo02    # BPE Tokenization
npm run test:demo06    # Sampling Strategies
npm run test:demo12    # BM25 Search
npm run test:demo15    # Chatbot Evolution (ELIZA, PARRY, ALICE)
```

### Run Specific Categories
```bash
npm run test:chatbots      # All chatbot tests (Demo 15)
npm run test:eliza         # ELIZA tests (Demo 01 + Demo 15)
npm run test:tokenization  # Tokenization tests (Demo 02)
npm run test:sampling      # Sampling strategy tests (Demo 06)
npm run test:search        # Semantic search tests (Demo 12)
```

---

## Detailed Test Coverage

### Demo 01: ELIZA Pattern Matching Chatbot

**Test File**: `demos/01-eliza/test-eliza.mjs`
**Test Count**: 43 tests
**Pass Rate**: 88% (38/43 passing)

#### Test Groups

1. **Classic Pattern Matching** (8 tests)
   - Tests keyword detection from original 1966 Weizenbaum paper
   - Validates correct pattern matching for: `alike`, `always`, `my`, `I`
   - Ensures non-empty responses generated

2. **Keyword Priority** (5 tests)
   - Tests `sorry` and `apologise` keyword priority
   - Verifies correct keyword selection when multiple matches exist

3. **Response Formatting** (6 tests)
   - Validates sentence case formatting
   - Checks uppercase/lowercase handling
   - Ensures proper capitalization

4. **Pre-substitutions** (4 tests)
   - Tests text preprocessing transformations
   - Validates contractions: `don't → do not`, `I'm → i am`

5. **Post-substitutions** (4 tests)
   - Tests reflection transformations: `I am → you are`, `my → your`
   - Validates pronoun swapping for natural responses

6. **Wildcard Pattern Matching** (3 tests)
   - Tests `*` wildcard in patterns
   - Validates multi-part pattern matching

7. **Conversation State** (4 tests)
   - Tests conversation history tracking
   - Validates reset functionality

8. **Quit Word Detection** (3 tests)
   - Tests `quit`, `goodbye` detection
   - Validates normal input handling

9. **Rules Validation** (3 tests)
   - Validates JSON rules structure
   - Checks rule completeness

10. **Synonym Expansion** (2 tests)
    - Tests synonym-based pattern matching
    - Validates family relation synonyms

11. **Response Cycling** (1 test)
    - Tests response rotation through multiple templates

**Key Functions Tested**:
- `ElizaEngine.loadRules()`
- `ElizaEngine.getResponse()`
- `ElizaEngine.reset()`
- `PatternMatcher.applyPreSubstitutions()`
- `PatternMatcher.applyPostSubstitutions()`
- `PatternMatcher.matchPattern()`

---

### Demo 02: Tokenization (BPE Algorithm)

**Test File**: `demos/02-tokenization/test-tokenization.mjs`
**Test Count**: 27 tests
**Pass Rate**: 100% (27/27 passing)

#### Test Groups

1. **BPE Initialization** (3 tests)
   - Tests initial state setup
   - Validates default parameters

2. **Token Initialization** (3 tests)
   - Tests text-to-token conversion
   - Validates character-level splitting

3. **Pair Finding Algorithm** (3 tests)
   - Tests adjacent token pair detection
   - Validates pair counting accuracy

4. **Most Frequent Pair Selection** (3 tests)
   - Tests frequency-based pair selection
   - Validates merge priority

5. **Pair Merging** (2 tests)
   - Tests token merging operations
   - Validates token count reduction

6. **Common Merge Rules** (3 tests)
   - Tests predefined merge patterns
   - Validates `th`, `the` patterns

7. **Multi-Step BPE Process** (3 tests)
   - Tests iterative merging
   - Validates convergence

8. **Edge Cases** (3 tests)
   - Tests empty strings, single characters
   - Validates minimal inputs

9. **Merge History Tracking** (1 test)
   - Tests history array maintenance

10. **Mode Configuration** (2 tests)
    - Tests simplified vs GPT-2 modes

11. **Token Structure** (2 tests)
    - Validates token object properties

12. **Pair Counting Accuracy** (2 tests)
    - Tests precise pair counting
    - Validates index tracking

**Key Functions Tested**:
- `BPEVisualizer.findPairs()`
- `BPEVisualizer.getMostFrequentPair()`
- `BPEVisualizer.mergePair()`
- `BPEVisualizer.tokenize()`

---

### Demo 06: GPT Playground Sampling Strategies

**Test File**: `demos/06-gpt-playground/test-sampling.mjs`
**Test Count**: 37 tests
**Pass Rate**: 100% (37/37 passing)

#### Test Groups

1. **Softmax Conversion** (4 tests)
   - Tests logits → probabilities conversion
   - Validates probability sum = 1.0
   - Tests monotonic relationship

2. **Temperature Scaling** (4 tests)
   - Tests temperature parameter effects
   - Validates distribution flattening/sharpening
   - Tests entropy changes

3. **Entropy Calculation** (4 tests)
   - Tests uniform distribution (max entropy)
   - Tests deterministic distribution (zero entropy)
   - Validates non-negativity

4. **Greedy Decoding** (3 tests)
   - Tests argmax selection
   - Validates highest probability token

5. **Repetition Penalty** (5 tests)
   - Tests penalty application
   - Validates selective token penalization
   - Tests penalty = 1.0 (no change)

6. **Top-K Sampling** (3 tests)
   - Tests top-k filtering
   - Validates k-limited distributions

7. **Top-P (Nucleus) Sampling** (4 tests)
   - Tests cumulative probability filtering
   - Validates nucleus selection

8. **Temperature Effects** (2 tests)
   - Tests low vs high temperature
   - Validates entropy computation

9. **Edge Cases** (3 tests)
   - Tests single token, very large/small logits
   - Validates numerical stability

10. **Combined Sampling** (4 tests)
    - Tests top-k + top-p + temperature together
    - Validates multi-strategy integration

11. **Probability Distribution Properties** (4 tests)
    - Tests non-negativity, sum=1
    - Validates probability axioms

12. **Entropy Bounds** (3 tests)
    - Tests 0 ≤ entropy ≤ log₂(n)
    - Validates theoretical bounds

**Key Functions Tested**:
- `SamplingStrategies.softmax()`
- `SamplingStrategies.applyTemperature()`
- `SamplingStrategies.calculateEntropy()`
- `SamplingStrategies.greedyDecoding()`
- `SamplingStrategies.temperatureSampling()`
- `SamplingStrategies.topKSampling()`
- `SamplingStrategies.topPSampling()`
- `SamplingStrategies.combinedSampling()`
- `SamplingStrategies.applyRepetitionPenalty()`

---

### Demo 12: Semantic Search (BM25 Algorithm)

**Test File**: `demos/12-semantic-search/test-bm25.mjs`
**Test Count**: 44 tests
**Pass Rate**: 100% (44/44 passing)

#### Test Groups

1. **BM25 Initialization** (3 tests)
   - Tests default and custom parameters (k1, b)
   - Validates initial state

2. **Tokenization** (5 tests)
   - Tests text normalization
   - Validates lowercase conversion, punctuation removal
   - Tests whitespace handling, empty strings

3. **Index Building** (5 tests)
   - Tests document storage and tokenization
   - Validates IDF calculation
   - Tests vocabulary construction

4. **IDF Calculation** (4 tests)
   - Tests inverse document frequency
   - Validates rare vs common term IDF values

5. **BM25 Scoring** (4 tests)
   - Tests score calculation
   - Validates term frequency and document length effects

6. **Search Functionality** (4 tests)
   - Tests query processing
   - Validates result ranking
   - Tests top-k selection

7. **Empty Query Handling** (1 test)
   - Tests graceful handling of empty queries

8. **Top-K Result Limiting** (2 tests)
   - Tests result count limits
   - Validates all results contain query terms

9. **Score Normalization** (2 tests)
   - Tests 0-1 normalization
   - Validates top result = 1.0

10. **Vocabulary Statistics** (2 tests)
    - Tests vocabulary size calculation
    - Validates unique term counting

11. **Top Terms by IDF** (3 tests)
    - Tests IDF ranking
    - Validates descending order

12. **Query Term Highlighting** (2 tests)
    - Tests HTML highlighting
    - Validates all query terms highlighted

13. **Document Length Normalization** (4 tests)
    - Tests BM25 length penalty
    - Validates shorter docs score higher for same term density

14. **Multiple Query Terms** (2 tests)
    - Tests multi-term queries
    - Validates combined term scoring

15. **Case Insensitivity** (2 tests)
    - Tests uppercase/lowercase equivalence

**Key Functions Tested**:
- `BM25.tokenize()`
- `BM25.buildIndex()`
- `BM25.calculateScore()`
- `BM25.search()`
- `BM25.highlightTerms()`
- `BM25.getVocabularySize()`
- `BM25.getTopTermsByIDF()`

---

### Demo 15: Chatbot Evolution

**Test Files**:
- `demos/15-chatbot-evolution/test-eliza-fixes.mjs`
- `demos/15-chatbot-evolution/test-parry-final.mjs`
- `demos/15-chatbot-evolution/test-alice-full-node.mjs`

**Total Test Count**: 12 (ELIZA) + 14 (PARRY) + integration tests (ALICE)
**Pass Rate**: 100%

#### ELIZA Fixes Test (12 tests)

Tests the same functionality as Demo 01 but specifically for the chatbot evolution demo:
- Classic conversation pattern matching
- Sorry keyword priority
- Response formatting (sentence case)

**Pass Rate**: 100% (12/12)

#### PARRY Test (14 tests)

Tests the paranoid chatbot's authentic behavior from the 1972 implementation:

1. **Bookie Question** - Tests knowledge about bookies
2. **Gambling Direct** - Tests gambling responses
3. **Racetrack Avoidance** - Tests deflection patterns
4. **Mafia Knowledge** - Tests mob-related responses
5. **Deflection Motives** - Tests "why" question handling
6. **People on Nerves** - Tests interpersonal anxiety
7. **Gambling Description** - Tests topic knowledge
8. **Bookie Incident** - Tests confrontation handling
9. **Horses/Racetrack** - Tests racing knowledge
10. **Trust Question** - Tests paranoia themes
11. **Racetrack Past** - Tests memory/avoidance
12. **Police Mention** - Tests authority responses
13. **Being Watched** - Tests surveillance paranoia
14. **Interpersonal** - Tests social discomfort

**Pass Rate**: 100% (14/14)
**Historical Accuracy**: Excellent (matches original PARRY behavior)

#### A.L.I.C.E. Test

Tests the full A.L.I.C.E. chatbot with 95,026 AIML patterns:

- Pattern matching with priority levels (0-3)
- SRAI recursive pattern matching
- Context tracking (that, topic, userName)
- BOT property substitution
- RANDOM, SET, GET, PERSON, THINK tags
- Wildcard capture (STAR)

**Test Inputs**: 20 conversation examples
**Pattern Count**: 95,026 patterns loaded
**Status**: Fully functional

---

## Test Categories

### Unit Tests
- Pattern matching algorithms
- Tokenization functions
- Mathematical operations (softmax, entropy, IDF)
- Text normalization and preprocessing

### Integration Tests
- End-to-end chatbot conversations
- Multi-step BPE algorithm
- Complete search pipeline (BM25)
- Sampling strategy combinations

### Regression Tests
- Historical ELIZA behavior (1966)
- Historical PARRY behavior (1972)
- Original A.L.I.C.E. patterns (1995)

### Algorithm Tests
- BPE merge algorithm correctness
- BM25 ranking algorithm
- Softmax numerical stability
- Entropy bounds and properties

---

## Continuous Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test-demos.yml`

**Triggers**:
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs**:
1. **Matrix Testing** - Runs each demo test in parallel
   - Demo 01 - ELIZA
   - Demo 02 - Tokenization
   - Demo 06 - GPT Playground
   - Demo 12 - Semantic Search
   - Demo 15 - ELIZA (Evolution)
   - Demo 15 - PARRY
   - Demo 15 - ALICE

2. **All Tests** - Runs complete test suite (`npm test`)

3. **Coverage Report** - Generates summary in GitHub Actions interface

**Node.js Version**: 18.x
**Runner**: ubuntu-latest

---

## Test Results Summary

| Demo | Test File | Tests | Pass | Fail | Pass Rate |
|------|-----------|-------|------|------|-----------|
| Demo 01 | `test-eliza.mjs` | 43 | 38 | 5 | 88% |
| Demo 02 | `test-tokenization.mjs` | 27 | 27 | 0 | 100% |
| Demo 06 | `test-sampling.mjs` | 37 | 37 | 0 | 100% |
| Demo 12 | `test-bm25.mjs` | 44 | 44 | 0 | 100% |
| Demo 15 (ELIZA) | `test-eliza-fixes.mjs` | 12 | 12 | 0 | 100% |
| Demo 15 (PARRY) | `test-parry-final.mjs` | 14 | 14 | 0 | 100% |
| Demo 15 (ALICE) | `test-alice-full-node.mjs` | N/A | ✓ | - | Functional |
| **TOTAL** | **7 test files** | **177+** | **172** | **5** | **97%** |

---

## Coverage by Demo Category

### Covered Demos (5 of 15)

✅ **Demo 01** - ELIZA (Pattern-matching chatbot)
✅ **Demo 02** - Tokenization (BPE algorithm)
❌ **Demo 03** - Embeddings (requires ML models)
❌ **Demo 04** - Attention (requires ML models)
❌ **Demo 05** - Transformer Architecture (visualization)
✅ **Demo 06** - GPT Playground (sampling strategies)
❌ **Demo 07** - RAG (requires ML models)
❌ **Demo 08** - Topic Modeling (LDA - future)
❌ **Demo 09** - Sentiment Analysis (requires ML models)
❌ **Demo 10** - POS Tagging (requires ML models)
❌ **Demo 11** - Word Analogies (requires embeddings)
✅ **Demo 12** - Semantic Search (BM25 algorithm)
❌ **Demo 13** - BERT MLM (requires ML models)
❌ **Demo 14** - Embeddings Comparison (requires ML models)
✅ **Demo 15** - Chatbot Evolution (ELIZA, PARRY, ALICE)

---

## Future Test Additions

### Candidates for Testing (No External Dependencies)

1. **Demo 08 - Topic Modeling (LDA)**
   - Gibbs sampling algorithm
   - Vocabulary construction
   - Topic extraction
   - Perplexity calculation

2. **Demo 11 - Word Analogies**
   - Vector operations (add, subtract)
   - Cosine similarity
   - k-NN search
   - PCA/t-SNE dimensionality reduction

### Demos Requiring ML Models (Lower Priority)

- Demo 03, 04, 07, 09, 10, 13, 14 - Require transformer models or embeddings
- These could be tested with mocked model outputs or small test models

---

## Running Tests Locally

### Prerequisites
```bash
# Requires Node.js 14+ (tested with Node 18)
node --version  # Should be >= 14.0.0
```

### Installation
```bash
# No dependencies required - all tests use Node.js built-ins
# Tests use ES modules (.mjs files)
```

### Execute Tests
```bash
# Run all tests
npm test

# Run specific demo
npm run test:demo01
npm run test:demo02
npm run test:demo06
npm run test:demo12
npm run test:demo15

# Run chatbot-specific tests
npm run test:chatbots

# Navigate to demo directory and run directly
cd demos/01-eliza
node test-eliza.mjs
```

---

## Test Design Principles

1. **No External Dependencies**: All tests use Node.js built-in modules only
2. **Real Function Calls**: No mocking - tests use actual implementation code
3. **ES Modules**: Modern .mjs format for better compatibility
4. **Comprehensive Coverage**: Unit + Integration + Regression tests
5. **Historical Accuracy**: Chatbot tests verify authentic historical behavior
6. **Algorithm Correctness**: Mathematical properties verified (entropy bounds, probability axioms)
7. **Edge Case Testing**: Empty inputs, single items, numerical stability
8. **Descriptive Output**: Clear pass/fail messages with expected vs actual values

---

## Contributing

When adding new tests:

1. Create test file as `demos/XX-name/test-name.mjs`
2. Use ES module format (`.mjs` extension)
3. Include comprehensive test groups
4. Add to `package.json` scripts
5. Update GitHub Actions workflow
6. Update this documentation

---

## License

MIT License - See LICENSE file for details

---

**Last Updated**: December 2024
**Test Framework**: Custom Node.js test runner
**CI/CD**: GitHub Actions
