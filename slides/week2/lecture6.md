---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 6: Tokenization
### PSYC 51.07: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Understand what tokenization is and why it matters
2. Explain the limitations of word-level tokenization
3. Describe how subword tokenization works (BPE, WordPiece, SentencePiece)
4. Compare different tokenization methods and their trade-offs
5. Implement and experiment with different tokenizers using HuggingFace

</div>

<div class="tip-box" data-title="Central question">

How do we break text into meaningful units for AI models?

</div>

---

# What is tokenization?

<div class="definition-box" data-title="Definition">

**Tokenization** is the process of converting text into smaller units (tokens).

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Why tokenize?**
- Neural networks process numbers, not text
- Need discrete units to create vocabulary
- First step in any NLP pipeline

</div>
<div style="flex: 1;">

**What can tokens be?**
- **Characters:** a, b, c, ... (very fine-grained)
- **Words:** "hello", "world" (intuitive but limited)
- **Subwords:** "un", "happiness" (sweet spot!)
- **Bytes:** 0-255 (most fine-grained)

</div>
</div>

<div class="tip-box" data-title="Remember">

*"The granularity of tokenization determines what a model can learn"*

</div>

---

# The tokenization spectrum

```flow
[Character:blue] --> [Subword:green] --> [Word:orange]
```
<!-- caption: Fine-grained to coarse-grained tokenization -->

| Granularity | Vocabulary size | Sequence length |
|-------------|-----------------|-----------------|
| Character | ~100s | Very long |
| Subword | 30k-50k | Medium |
| Word | 100k+ | Short |

<div class="tip-box" data-title="Key trade-off">

Vocabulary size vs. sequence length

</div>

---

# Splitting on spaces fails for three reasons

<div class="warning-box" data-title="1. Vocabulary explosion">

English has ~170,000 words, each inflection counts separately ("run", "runs", "running", "ran"), and compounds vary ("ice cream", "icecream", "ice-cream")

</div>

<div class="warning-box" data-title="2. Unknown words">

OOV for new terms ("COVID-19", "selfie"), rare words ("supercalifragilisticexpialidocious"), and typos ("teh")

</div>

<div class="warning-box" data-title="3. Languages without spaces">

Chinese: 没有空格 | Japanese: 日本語も同様

</div>


---

# Word-level limitations illustrated

```flow
[Word-level:red] --> [Subword-level:green] --> [Character-level:blue]
```
<!-- caption: Vocabulary growth as training data increases -->

<div class="note-box" data-title="Observation">

**Word-level vocabulary keeps growing!** Subword vocabulary stabilizes at a reasonable size.

</div>

---

<!-- _class: scale-75 -->

# The OOV problem in action

```python
# Simple word-level vocabulary
vocab = {"hello", "world", "the", "cat", "sat"}

def tokenize_word_level(text, vocab):
 tokens = text.lower().split()
 result = []
 for token in tokens:
 if token in vocab:
 result.append(token)
 else:
 result.append("<UNK>") # Unknown token
 return result

# Example
text = "Hello! The cat jumped"
tokens = tokenize_word_level(text, vocab)
print(tokens)
# Output: ['hello', 'the', 'cat', '<UNK>']
# ^^^ "jumped" is unknown!
```

<div class="warning-box" data-title="Problem">

We lose information! "jumped" becomes meaningless `<UNK>`

</div>

---

# Most words are made of smaller meaningful pieces

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Examples:**
- "unhappiness" = "un" + "happiness"
- "preprocessing" = "pre" + "process" + "ing"
- "antiestablishment" = "anti" + "establish" + "ment"

</div>
<div style="flex: 1;">

**Benefits:**
- Fixed vocabulary (30k-50k tokens)
- No OOV: break into known parts
- Captures morphology (prefixes, suffixes)

</div>
</div>

<div class="tip-box" data-title="Key insight">

Learn common character sequences from data! Works for any language.

</div>

---

# Subword tokenization solves the OOV problem

```python
# Word-level vocabulary (only words seen in training)
vocab = {"the", "cat", "sat", "on", "mat", "dog", "ran"}

# Trying to tokenize a new sentence:
sentence = "The supercalifragilisticexpialidocious cat meowed"
# Word-level result: ["<UNK>", "<UNK>", "cat", "<UNK>"]
# We lost almost everything!
```

**The subword solution:**

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# Same difficult sentence:
tokens = tokenizer.tokenize("supercalifragilisticexpialidocious")
print(tokens)
# ['super', 'cal', 'if', 'rag', 'il', 'istic', 'exp', 'ial', 'id', 'ocious']

# Every word can be tokenized! No information loss.
# Model can learn that 'super-' often means "very/above"
```

<div class="tip-box" data-title="Key insight">

Subwords preserve meaning even for novel words!

</div>

---

# Visual: How "unhappiness" gets tokenized

```flow
[unhappiness:gray] --> [Word-level:red]
[unhappiness:gray] --> [un:green] --> [happi:green] --> [ness:green]
```
<!-- caption: Word-level (1 token, may be OOV) vs. Subword BPE (3 tokens, always known) -->

<div class="note-box" data-title="Trade-off">

More tokens = longer sequences, but smaller vocabulary and no OOV!

</div>

---

# Byte-Pair Encoding (BPE)

<div class="note-box" data-title="Further reading">

[**Sennrich, Haddow, & Birch (2016, *ACL*):**](https://aclanthology.org/P16-1162/) Neural Machine Translation of Rare Words with Subword Units

</div>

- **Original use:** Data compression (1994)
- **Adapted for NLP:** Sennrich et al. (2016)
- **Used by:** GPT, GPT-2, GPT-3, RoBERTa, BART, many others!

<div class="definition-box" data-title="Core idea">

Iteratively merge the most frequent pair of characters/subwords.

</div>

<div class="tip-box" data-title="Algorithm">

1. Start with character-level vocabulary
2. Count all adjacent pairs in corpus
3. Merge most frequent pair &rarr; create new token
4. Repeat until desired vocabulary size

</div>

---

<!-- _class: scale-80 -->

# BPE example: Step by step

**Training data:** "low low low lower lower newest newest newest newest widest"

**Initial tokens (characters):** `l, o, w, e, r, n, s, t, i, d`

<div class="example-box" data-title="Iteration 1">

Most frequent pair = `e, s` (appears 4 times)
- Merge &rarr; new token: `es`
- Vocabulary: `l, o, w, e, r, n, s, t, i, d, es`

</div>

<div class="example-box" data-title="Iteration 2">

Most frequent = `es, t`
- Merge &rarr; new token: `est`
- Vocabulary: `l, o, w, e, r, n, s, t, i, d, es, est`

</div>

<div class="example-box" data-title="Iteration 3">

Most frequent = `l, o`
- Merge &rarr; new token: `lo`

</div>

Continue until reaching target vocabulary size (e.g., 30,000)...

---

<!-- _class: scale-80 -->

# BPE learns to merge frequent character pairs

```
Training corpus: "low" (x3), "lower" (x2), "newest" (x4), "widest" (x1)

After training, vocabulary includes:
- Characters: l, o, w, e, r, n, s, t, i, d
- Merges learned: es → est → lo → low → er → ...

Tokenizing "lowest":
 Step 1: Split into characters → [l, o, w, e, s, t]
 Step 2: Apply merge rules in order learned:
 [l, o, w, e, s, t]
 → [lo, w, e, s, t] (merge l+o)
 → [low, e, s, t] (merge lo+w)
 → [low, es, t] (merge e+s)
 → [low, est] (merge es+t)

 Final tokens: ["low", "est"]
```

**Result:** "lowest" → `["low", "est"]` (2 tokens instead of 6 characters!)

---

# BPE visualization

```flow
[l:blue] --> [o:blue] --> [w:blue] --> [e:blue] --> [s:blue] --> [t:blue]
```
<!-- caption: Step 0: Character-level -->

```flow
[lo:green] --> [w:blue] --> [est:green]
```
<!-- caption: After merges: "lowest" becomes 3 tokens -->

<div class="tip-box" data-title="Result">

"lowest" &rarr; `[lo, w, est]` &mdash; captures common patterns without explicit linguistic rules!

</div>

---

# BPE in practice with HuggingFace

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("gpt2")  # GPT-2 uses BPE

text = "I'm learning about tokenization!"
tokens = tokenizer.tokenize(text)
print("Tokens:", tokens)
# ['I', "'m", 'Ġlearning', 'Ġabout', 'Ġtoken', 'ization', '!']
# Note: 'Ġ' represents space

token_ids = tokenizer.encode(text)  # Get token IDs
print("Token IDs:", token_ids)  # [40, 1101, 4673, 546, 11241, 1634, 0]

decoded = tokenizer.decode(token_ids)  # Decode back
print("Decoded:", decoded)  # "I'm learning about tokenization!"
```

<div class="note-box" data-title="Try it out!">

Use the [Tokenization Explorer Demo](https://contextlab.github.io/llm-course/demos/tokenization/) to experiment with different tokenizers interactively.

</div>

---

# WordPiece merges "surprisingly common" pairs

<div class="note-box" data-title="Further reading">

[**Wu et al. (2016, *arXiv*):**](https://arxiv.org/abs/1609.08144) Google's Neural Machine Translation System

</div>

<div class="definition-box" data-title="Key difference from BPE">

Instead of merging most *frequent* pair, merge pair that maximizes *likelihood*:
$$\text{score}(x, y) = \frac{P(xy)}{P(x) \times P(y)}$$

</div>

- **Used by:** BERT, DistilBERT, Electra
- **Special tokens:** `##` prefix for continuation ("playing" → `["play", "##ing"]`)

---

# WordPiece example with BERT

```python
from transformers import AutoTokenizer

# BERT uses WordPiece
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

text = "I'm learning about tokenization!"

tokens = tokenizer.tokenize(text)
print("Tokens:", tokens)
# Output: ['i', "'", 'm', 'learning', 'about', 'token', '##ization', '!']
# ^^^ Note the ##

# Compare with longer word
text2 = "unhappiness"
tokens2 = tokenizer.tokenize(text2)
print("Tokens:", tokens2)
# Output: ['un', '##hap', '##pin', '##ess']
# Breaks into morphological components!
```

<div class="tip-box" data-title="Note">

BERT lowercases by default (unless using cased model)

</div>

---

# SentencePiece works for languages without spaces

<div class="note-box" data-title="Further reading">

[**Kudo & Richardson (2018, *EMNLP*):**](https://aclanthology.org/D18-2012/) SentencePiece: A simple and language independent subword tokenizer

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Problem with BPE/WordPiece:**
- Assume pre-tokenized text
- Fail on Chinese, Japanese, Thai...

</div>
<div style="flex: 1;">

**SentencePiece solution:**
- Raw character stream input
- Space = just another char (`▁`)

</div>
</div>

**Used by:** T5, ALBERT, XLNet, mT5 (multilingual models)

---

# SentencePiece in action

```python
from transformers import AutoTokenizer

# T5 uses SentencePiece
tokenizer = AutoTokenizer.from_pretrained("t5-small")

text = "I'm learning about tokenization!"

tokens = tokenizer.tokenize(text)
print("Tokens:", tokens)
# Output: ['I', "'", 'm', 'learning', 'about', 'token', 'ization', '!']
# ^^^ Note the for spaces

# Works seamlessly with other languages!
text_chinese = ""
tokens_cn = tokenizer.tokenize(text_chinese)
print("Chinese:", tokens_cn)
# Breaks into characters/subwords without needing pre-tokenization
```

<div class="tip-box" data-title="Key advantage">

No language-specific preprocessing required!

</div>

---

# Tokenization methods comparison

| Method | Approach | Used By | Key Feature |
|--------|----------|---------|-------------|
| BPE | Frequency merging | GPT-2, RoBERTa | Bottom-up |
| WordPiece | Likelihood merging | BERT, DistilBERT | Principled scoring |
| SentencePiece (Unigram) | Top-down pruning | T5, mT5 | Multilingual |
| SentencePiece (BPE) | Bottom-up | mBART | Works with raw text |

<div class="note-box" data-title="HuggingFace Resources">

- [Chapter 2.4: Behind the Pipeline - Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4)
- [Chapter 6: Tokenizers (full chapter)](https://huggingface.co/learn/nlp-course/chapter6)

</div>


---

# Comparing tokenizers side-by-side

```python
from transformers import AutoTokenizer
text = "The unhappiest researchers couldn't preprocess data!"

models = {"GPT-2 (BPE)": "gpt2", "BERT (WordPiece)": "bert-base-uncased",
          "T5 (SentencePiece)": "t5-small"}

for name, model_name in models.items():
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokens = tokenizer.tokenize(text)
    print(f"{name}: Tokens ({len(tokens)}): {tokens}")

# Observe: Different handling of "unhappiest", spaces, and token counts!
```


---

<!-- _class: scale-80 -->

# Tokenizer comparison: Actual output

**Input:** `"The unhappiest researchers couldn't preprocess data!"`

| Tokenizer | Tokens | Count |
|-----------|--------|-------|
| **GPT-2 (BPE)** | `['The', 'Ġun', 'happ', 'iest', 'Ġresearchers', 'Ġcouldn', "'t", 'Ġpre', 'process', 'Ġdata', '!']` | 11 |
| **BERT (WordPiece)** | `['the', 'un', '##hap', '##pie', '##st', 'researchers', 'couldn', "'", 't', 'pre', '##process', 'data', '!']` | 13 |
| **T5 (SentencePiece)** | `['The', 'un', 'happiest', 'researchers', 'couldn', "'", 't', 'pre', 'process', 'data', '!']` | 11 |

<div class="tip-box" data-title="Key observations">

- `Ġ` (GPT-2) and `▁` (T5) mark word starts (spaces)
- `##` (BERT) marks continuation subwords
- "unhappiest" is split differently by each
- BERT lowercases; GPT-2/T5 preserve case

</div>

---

# Tokenizers add special tokens for model-specific purposes

| Token | Purpose | Used By |
|-------|---------|---------|
| [CLS] | Classification token (start) | BERT |
| [SEP] | Separator between segments | BERT |
| [PAD] | Padding to same length | Most models |
| [UNK] | Unknown/rare tokens | Most models |
| [MASK] | Masked token for training | BERT |
| &lt;s&gt;, &lt;/s&gt; | Start/end of sequence | GPT-2, T5 |
| &lt;\|endoftext\|&gt; | Document boundary | GPT-2 |

<div class="example-box" data-title="Example usage">

`[CLS] The cat sat [SEP] The dog ran [SEP]`

</div>

---

<!-- _class: scale-70 -->

# Working with special tokens

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

text = "Hello world"
encoded = tokenizer(text, return_tensors="pt")
print("Input IDs:", encoded['input_ids'])  # [101, 7592, 2088, 102]
# ^^^ [CLS] and [SEP] added automatically!

full_decode = tokenizer.decode(encoded['input_ids'][0])
print("With special:", full_decode)  # "[CLS] hello world [SEP]"

clean_decode = tokenizer.decode(encoded['input_ids'][0], skip_special_tokens=True)
print("Without special:", clean_decode)  # "hello world"
```


---

# Vocabulary size trade-offs

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Smaller vocabulary (e.g., 10k tokens):**
- Faster training (smaller embedding matrix)
- Less memory
- Longer sequences (more subwords per word)
- May lose semantic information

</div>
<div style="flex: 1;">

**Larger vocabulary (e.g., 100k tokens):**
- Shorter sequences (closer to word-level)
- Better semantic preservation
- Slower training (larger embeddings)
- More memory required

</div>
</div>

<div class="tip-box" data-title="Sweet spot">

30k-50k tokens for most models: **GPT-2:** 50k | **BERT:** 30k | **T5:** 32k

</div>

---

<!-- _class: scale-80 -->

# Tokenization pitfalls and gotchas

<div class="warning-box" data-title="Common issues to watch out for">

1. **Tokenizer-model mismatch:** Always use the tokenizer that matches your model! GPT-2 tokenizer &ne; BERT tokenizer
2. **Maximum sequence length:** BERT: 512 tokens | GPT-2: 1024 | GPT-3: 2048 &mdash; Text gets truncated if too long!
3. **Case sensitivity:** `bert-base-uncased` lowercases everything; `bert-base-cased` preserves case
4. **Rare words &rarr; many tokens:** "antidisestablishmentarianism" &rarr; 10+ tokens &mdash; Can hit sequence limit faster than expected!
5. **Special characters:** Emoji, Unicode, accents may be split unexpectedly

</div>

---

# Debugging tokenization

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("gpt2")
text = "The antidisestablishmentarianism debate continues!"

tokens = tokenizer.tokenize(text)
token_ids = tokenizer.encode(text)
print(f"Tokens ({len(tokens)}): {tokens}\n")

for i, (token, token_id) in enumerate(zip(tokens, token_ids)):
    decoded = tokenizer.decode([token_id])
    print(f"{i:2d}. ID {token_id:5d} | Token: {token:20s} | Decoded: {decoded}")

print(f"\nVocabulary size: {tokenizer.vocab_size}")
print(f"Special tokens: {tokenizer.all_special_tokens}")
```


---

# Connection to human language learning

<div class="note-box" data-title="Further reading">

[**Saffran, Aslin, & Newport (1996, *Science*):**](https://www.science.org/doi/10.1126/science.274.5294.1926) Statistical learning by 8-month-old infants

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Infant learning:**
- Babies track statistical regularities in speech
- Identify word boundaries from transitional probabilities
- No explicit rules&mdash;just patterns from exposure!

</div>
<div style="flex: 1;">

**Parallel with subword tokenization:**
- BPE: Merge frequent character pairs &rarr; discover common morphemes
- Infants: Track frequent syllable pairs &rarr; discover words
- Both are *data-driven*, not rule-based!

</div>
</div>

<div class="tip-box" data-title="Key difference">

Infants: Online, real-time, multimodal (sound + context) | BPE: Batch, text-only, no grounding

</div>

---

# Statistical learning in action

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Infant Learning:**

Input stream: `bidakupadotigolabu...`

Learn high-probability sequences:
- `bi-da-ku` (word)
- `pa-do-ti` (word)

Detect low-probability boundaries:
- `ku | pa` (boundary)

</div>
<div style="flex: 1;">

**BPE Learning:**

Input corpus: `low low lower...`

Merge high-frequency pairs:
- `l+o` &rarr; `lo`
- `lo+w` &rarr; `low`

Build vocabulary:
- `low, lower, lowest`

</div>
</div>

<div class="tip-box" data-title="Connection">

Both use distributional statistics to discover structure!

</div>

---

<!-- _class: scale-80 -->

# Hands-on exercise

<div class="example-box" data-title="Experiment with different tokenizers!">

1. **Choose 3 models:** GPT-2, BERT, T5
2. **Test on diverse texts:**
   - Standard English: "The cat sat on the mat"
   - Complex words: "antidisestablishmentarianism"
   - Contractions: "I'm, you're, won't"
   - Typos: "teh qiuck brown fox"
   - Emoji: "I love this!"
   - Other languages: "这是中文" (Chinese)
3. **Compare results:** Number of tokens, how words are split, handling of unknown/rare words
4. **Reflect:** Which tokenizer works best for your use case? What are the trade-offs?

</div>

<div class="tip-box" data-title="Try it out!">

Use the [Tokenization Explorer Demo](https://contextlab.github.io/llm-course/demos/tokenization/) to compare tokenizers interactively!

</div>

---

<!-- _class: scale-80 -->

# Discussion questions

<div class="note-box" data-title="Think about it...">

1. **Linguistics vs. Statistics:** BPE discovers morphemes (un-, -ing, -ness) without linguistic rules. Is this "learning" morphology, or just pattern matching?

2. **Cross-lingual tokenization:** Should we use the same tokenizer for all languages? What are the trade-offs?

3. **Semantic preservation:** Does breaking "unhappy" into ["un", "happy"] preserve meaning? What about "butterfly"?

4. **Human vs. machine:** Humans don't consciously tokenize words. Why do machines need to?

5. **Future directions:** Will we move toward character-level or byte-level models that don't need tokenization?

</div>

---

# Primary references

<div class="note-box" data-title="Foundational papers">

- **Sennrich, Haddow, & Birch (2016).** [Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/). *ACL*. &mdash; Introduced BPE for NLP
- **Kudo & Richardson (2018).** [SentencePiece: A simple and language independent approach](https://aclanthology.org/D18-2012/). *EMNLP*. &mdash; Language-agnostic tokenization
- **Wu et al. (2016).** [Google's Neural Machine Translation System](https://arxiv.org/abs/1609.08144). *arXiv*. &mdash; WordPiece algorithm

</div>

<div class="tip-box" data-title="HuggingFace resources">

- [Chapter 2.4: Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4)
- [Chapter 6: Tokenizers (detailed)](https://huggingface.co/learn/nlp-course/chapter6)

</div>


---

# Key takeaways

<div class="note-box" data-title="Summary">

1. **Tokenization is fundamental:** Bridges raw text and neural networks
2. **Word-level has major limitations:** OOV problem, vocabulary explosion, language-dependent
3. **Subword tokenization is the sweet spot:** Balanced vocabulary size and sequence length
4. **Different methods, similar principles:** BPE: frequency-based | WordPiece: likelihood | SentencePiece: language-agnostic
5. **Statistical learning connects humans and machines:** Both discover structure from distributional patterns
6. **Always match tokenizer to model!** Critical for correct predictions

</div>

---

# Looking ahead

<div class="note-box" data-title="Next lecture: X-Hour Text Classification Workshop">

**How tokenization connects:**
- POS tagging: Token-level classification
- Sentiment: Sequence-level classification
- Both depend on good tokenization!

</div>

<div class="tip-box" data-title="Prepare by...">

- Experimenting with HuggingFace tokenizers
- Thinking about: How does token granularity affect downstream tasks?
- Exploring: Tokenizer artifacts and their impact

</div>

---

# Questions? Want to chat more?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a> me</span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label">Join our <a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label">Come to <a href="https://context-lab.youcanbook.me">office hours</a></span>
  </div>
</div>

<div class="tip-box" data-title="Next up">

Lecture 7 &mdash; X-Hour: Text Classification Workshop

</div>
