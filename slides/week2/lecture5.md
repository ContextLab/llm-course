---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 5: Data Cleaning & Preprocessing
### PSYC 51.07: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Understand why data cleaning is critical for NLP tasks
2. Apply common preprocessing techniques to raw text
3. Use web scraping to collect text data
4. Implement lemmatization and stemming
5. Make informed decisions about preprocessing strategies

</div>

<div class="tip-box" data-title="Key theme">

Garbage in, garbage out!

</div> 

---

<!-- _class: scale-80 -->

# Real-world text is messy

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Common problems:**
- HTML/XML tags: `<p>text</p>`
- Special characters: &amp;nbsp; &amp;amp;
- Inconsistent formatting
- Extra whitespace
- Mixed encodings (UTF-8, ASCII...)
- Emoji and Unicode characters

</div>
<div style="flex: 1;">

**Consequences of dirty data:**
- Models learn noise, not signal
- Reduced accuracy and consistency
- Poor generalization to new data
- Wasted computation on junk
- Unpredictable model behavior
- Difficulty debugging issues

</div>
</div>

<div class="tip-box" data-title="Remember">

*"Quality of input = quality of output"*

</div>
 

---

# The data cleaning pipeline

```flow
[Raw Text:blue] --> [Remove Tags:teal] --> [Normalize:green] --> [Tokenize:orange] --> [Lemmatize:violet] --> [Clean Text:teal]
```
<!-- caption: A typical data cleaning pipeline -->

<div class="note-box" data-title="Important">

Pipeline varies by task! Not all steps are always needed.

</div>

---

<!-- _class: scale-75 -->

# Cleaning messy text step by step

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Raw input:**
```
<p>I LOVE this!!! 
https://ex.com 
a@b.com</p>
```

**Steps:**
1. Remove HTML tags
2. Remove URLs/emails
3. Normalize whitespace

</div>
<div style="flex: 1;">

```python
import re
raw = "<p>I LOVE this!!! https://ex.com a@b.com</p>"

text = re.sub(r'<.*?>', '', raw)       # Step 1
text = re.sub(r'http\S+', '', text)    # Step 2
text = re.sub(r'\S+@\S+', '', text)
text = ' '.join(text.split())          # Step 3

print(text)  # "I LOVE this!!!"
```

</div>
</div>

---

<!-- _class: scale-80 -->

# Worked example: Complete pipeline

**Full transformation:**

| Stage | Text |
|-------|------|
| **Raw** | `<p>I LOVE this product!!! https://ex.com</p>` |
| **Remove HTML** | `I LOVE this product!!! https://ex.com` |
| **Remove URLs** | `I LOVE this product!!! ` |
| **Normalize spaces** | `I LOVE this product!!! ` |
| **Lowercase** | `i love this product!!! ` |
| **Remove extra punctuation** | `i love this product! ` |

**Key decision points:**
- Keep emoji ? **Yes** for sentiment analysis (conveys emotion)
- Keep punctuation !!!? **Maybe** (emphasis, but noisy)
- Lowercase? **Depends** on task (lose "LOVE" emphasis)

---

<!-- _class: scale-80 -->

# Different tasks need different preprocessing

| Task | Keep | Remove |
|------|------|--------|
| Sentiment analysis | Emoji, punctuation (style matters) | Extra whitespace, special chars |
| Named entity recognition | Case (proper nouns important) | Extra whitespace |
| Topic modeling | Content words only | Punctuation, case (lowercase all) |

<div class="tip-box" data-title="Key principle">

Preserve information relevant to your task!

</div> 

---

<!-- _class: scale-80 -->

# The web is a massive source of text data

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**What you can collect:**
- News articles and blog posts
- Product reviews and ratings
- Social media and forum discussions
- Domain-specific technical content

</div>
<div style="flex: 1;">

**Popular tools:**
- **Beautiful Soup:** Parse HTML/XML
- **Requests:** Fetch web pages
- **Scrapy:** Full scraping framework
- **Selenium:** JavaScript-heavy sites

</div>
</div>

<div class="warning-box" data-title="Be ethical">

Check `robots.txt`, respect rate limits, and honor terms of service and copyright.

</div>


---

<!-- _class: scale-70 -->

# Web scraping with Beautiful Soup

**Basic example:**

```python
from bs4 import BeautifulSoup
import requests

# Fetch webpage
url = "https://example.com/article"
response = requests.get(url)
html_content = response.content

# Parse HTML
soup = BeautifulSoup(html_content, 'html.parser')

# Extract text from specific elements
title = soup.find('h1').get_text()
article = soup.find('article').get_text()
clean_text = ' '.join(article.split())  # Remove extra whitespace
print(f"Title: {title}\nArticle: {clean_text[:200]}...")
```


---

<!-- _class: scale-78 -->

# Advanced Beautiful Soup techniques

```python
from bs4 import BeautifulSoup

html = """<div class="article">
 <h2>Breaking News</h2>
 <p class="content">First paragraph.</p>
 <p class="content">Second paragraph.</p>
 <div class="ads">Advertisement</div>
</div>"""

soup = BeautifulSoup(html, 'html.parser')

paragraphs = soup.find_all('p', class_='content')  # Find content paragraphs
text = ' '.join([p.get_text() for p in paragraphs])

for ad in soup.find_all('div', class_='ads'):      # Remove unwanted sections
    ad.decompose()

article_text = soup.get_text(separator=' ', strip=True)
print(article_text)
```


---

# Always use UTF-8 encoding

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Common encoding issues:**
- UTF-8 vs. ASCII vs. Latin-1
- Special characters: é, ñ, ü
- Emoji require Unicode support
- Mixed encodings in scraped data

</div>
<div style="flex: 1;">

**Best practices:**
- Default to UTF-8 for all files
- Detect unknown: `chardet` library
- Normalize Unicode: NFKC form
- Fix broken text: `ftfy` library

</div>
</div>

---

<!-- _class: scale-78 -->

# Web scraping often produces mixed encodings

```python
import chardet

raw_bytes = b'Caf\xe9 au lait \x96 delicious!'  # Unknown encoding

result = chardet.detect(raw_bytes)              # Detect encoding
print(f"Detected: {result}")  # {'encoding': 'Windows-1252', 'confidence': 0.73}

text = raw_bytes.decode(result['encoding'])     # Decode with detected encoding
print(text)                   # "Café au lait – delicious!"

import ftfy                                     # Alternative: fix broken Unicode
broken = "CafÃ au lait €" delicious!"
fixed = ftfy.fix_text(broken)
print(fixed)                  # "Café au lait – delicious!"
```

**Pro tip:** Save all files as UTF-8 to avoid these headaches!

---

<!-- _class: scale-80 -->

# Five common preprocessing steps

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**1. HTML/XML tag removal**
- `<p>Hello</p>` &rarr; `Hello`

**2. Whitespace normalization**
- `"Hello   world\n"` &rarr; `"Hello world"`

**3. Punctuation handling**
- Keep for sentiment ("Great!" vs "Great")
- Remove for topic modeling

</div>
<div style="flex: 1;">

**4. Case normalization**
- Lowercase: "Apple" = "apple"
- Preserve for NER: "Apple Inc."

**5. Special character removal**
- URLs, emails, numbers
- Task-dependent decisions

</div>
</div>


---

<!-- _class: scale-78 -->

# Preprocessing example

```python
import re

def preprocess_text(text):
    text = re.sub(r'http\S+|www.\S+', '', text)  # Remove URLs
    text = re.sub(r'\S+@\S+', '', text)          # Remove emails
    text = re.sub(r'<.*?>', '', text)            # Remove HTML tags
    text = ' '.join(text.split())                # Remove extra whitespace
    text = text.lower()                          # Lowercase
    return text

raw = "Check out https://example.com! <b>Amazing</b> deals!!"
print(preprocess_text(raw))  # "check out amazing deals!!"
```


---

<!-- _class: scale-80 -->

# Stemming is fast but crude; lemmatization is accurate

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Stemming**
- Rule-based crude chopping
- Fast and simple
- May produce non-words
- Porter Stemmer (1980)
- "running" &rarr; "run"

</div>
<div style="flex: 1;">

**Lemmatization**
- Uses vocabulary + morphology
- Slower but more accurate
- Always produces real words
- Requires POS context
- "better" &rarr; "good"

</div>
</div>

<div class="tip-box" data-title="When to use which?">

- **Stemming:** Speed matters, approximate matching OK
- **Lemmatization:** Need interpretable, real words

</div>


---

# Lemmatization produces real words; stemming produces fragments

| Word | Porter Stemmer | Lemmatizer | Notes |
|------|---------------|------------|-------|
| ran | ran | run | Lemma recognizes irregular verb |
| runs | run | run | Both work well |
| running | run | run | Both work well |
| runner | runner | runner | Both keep as-is (different word) |
| better | better | good | Lemma handles irregular adjective |
| best | best | good | Lemma handles superlative |
| geese | gees | goose | Stemmer produces non-word! |
| studies | studi | study | Stemmer produces non-word! |
| organizing | organ | organize | Stemmer too aggressive! |

**Key insight:** Lemmatization produces real words; stemming can produce fragments.

---

# Stemming can over-stem or under-stem

```python
from nltk.stem import PorterStemmer
stemmer = PorterStemmer()

# Over-stemming: Different words become the same
words = ['universe', 'university', 'universal']
stems = [stemmer.stem(w) for w in words]
print(stems) # ['univers', 'univers', 'univers']
# All three map to the same stem - meaning is lost!

# Under-stemming: Same root stays different
words2 = ['absorb', 'absorption']
stems2 = [stemmer.stem(w) for w in words2]
print(stems2) # ['absorb', 'absorpt']
# Related words map to different stems!
```

**Takeaway:** Use lemmatization when you need interpretable, meaningful tokens.

---

<!-- _class: scale-78 -->

# Stemming with NLTK

```python
from nltk.stem import PorterStemmer, SnowballStemmer
porter = PorterStemmer()
snowball = SnowballStemmer('english')

words = ['running', 'runs', 'runner', 'ran', 'easily', 'fairly']

print("Word         Porter       Snowball")
for word in words:
    print(f"{word:12} {porter.stem(word):12} {snowball.stem(word)}")

# Output:
# running      run          run
# runs         run          run
# runner       runner       runner
# ran          ran          ran
# easily       easili       easili
# fairly       fairli       fair
```


---

<!-- _class: scale-78 -->

# Lemmatization with spaCy

```python
import spacy
nlp = spacy.load("en_core_web_sm")

text = "The cats are running faster than dogs ran yesterday"
doc = nlp(text)

print(f"{'Word':<12} {'Lemma':<12} {'POS'}")
print("-" * 36)
for token in doc:
    print(f"{token.text:<12} {token.lemma_:<12} {token.pos_}")

# Output:
# Word         Lemma        POS
# cats         cat          NOUN
# running      run          VERB
# dogs         dog          NOUN
# ran          run          VERB
```


---

# spaCy vs. NLTK for lemmatization

| Feature | spaCy | NLTK |
|---------|-------|------|
| Accuracy | High | Good |
| Setup | Easy | Requires data download |
| POS tagging | Built-in | Separate step |
| Dependencies | Included | Manual WordNet |
| Use case | Production | Research/Teaching |

<div class="tip-box" data-title="Recommendation">

Use spaCy for most tasks! It's faster, more accurate, and easier to use in production.

</div>

---

<!-- _class: scale-80 -->

# Stop words: common words with little semantic value

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**When to remove:**
- Topic modeling
- Text classification
- Search engines
- Information retrieval

</div>
<div style="flex: 1;">

**When to keep:**
- Sentiment ("not good" ≠ "good")
- Machine translation
- Text generation
- Neural models (they learn!)

</div>
</div>

<div class="tip-box" data-title="Examples">

"the", "a", "is", "in", "and", "or" — language-specific lists available in NLTK and spaCy.

</div>

---

# Stop words in practice

```python
from nltk.corpus import stopwords
import spacy

stop_words_nltk = set(stopwords.words('english'))  # NLTK approach
text = "This is an example showing stop word removal"
filtered_nltk = [w for w in text.lower().split() if w not in stop_words_nltk]
print("NLTK:", filtered_nltk)  # ['example', 'showing', 'stop', 'word', 'removal']

nlp = spacy.load("en_core_web_sm")  # spaCy approach
doc = nlp(text)
filtered_spacy = [token.text for token in doc if not token.is_stop]
print("spaCy:", filtered_spacy)  # ['example', 'showing', 'stop', 'word', 'removal']
```


---

# Sentiment analysis requires preserving emotional signals

<div class="example-box" data-title="Amazon review">

*"I LOVE this product!!! Best purchase ever! See details at http://example.com"*

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Keep:**
- Punctuation (! conveys emphasis)
- Capitalization (LOVE = strong)
- Emoji if present

</div>
<div style="flex: 1;">

**Remove:**
- URLs (no sentiment value)
- HTML tags
- Extra punctuation (!!! → !)

</div>
</div>

<div class="tip-box" data-title="Result">

*"I LOVE this product! Best purchase ever!"* — emotion preserved!

</div>

</div>
</div>

---

# Discussion: Preprocessing trade-offs

<div class="note-box" data-title="Questions to consider">

1. **Information loss:** What do we lose when we lowercase everything?
   - Think: "US" (United States) vs. "us" (pronoun)
2. **Task dependency:** Why does preprocessing differ by task?
   - Hint: What signals matter for sentiment vs. topic modeling?
3. **Modern models:** Do transformer models still need heavy preprocessing?
   - Consider: BERT handles subwords, capitalization, punctuation...
4. **Bias introduction:** Can preprocessing introduce bias?
   - Example: Removing slang might remove cultural markers

</div>


---

<!-- _class: scale-80 -->

# Practical tips for data cleaning

<div class="tip-box" data-title="Best practices">

1. **Inspect your data first!** &mdash; Look at samples before deciding on preprocessing
2. **Keep raw data separate** &mdash; Never overwrite originals; you might need them!
3. **Document your pipeline** &mdash; Track what preprocessing you applied and why
4. **Experiment!** &mdash; Try different approaches, measure impact on task
5. **Validate incrementally** &mdash; Check results after each preprocessing step
6. **Consider automation** &mdash; Use libraries: spaCy, NLTK, HuggingFace tokenizers

</div>


---

<!-- _class: scale-78 -->

# Complete preprocessing pipeline example

```python
import spacy, re

class TextPreprocessor:
    def __init__(self, remove_stopwords=False):
        self.nlp = spacy.load("en_core_web_sm")
        self.remove_stopwords = remove_stopwords

    def clean(self, text):
        text = re.sub(r'http\S+', '', text)   # Remove URLs
        text = re.sub(r'<.*?>', '', text)     # Remove HTML
        text = ' '.join(text.split())         # Normalize whitespace
        doc = self.nlp(text)
        tokens = [t.lemma_ for t in doc if not (self.remove_stopwords and t.is_stop)]
        return ' '.join(tokens)
```


---

<!-- _class: scale-78 -->

# Preprocessing checklist

<div class="note-box checklist" data-title="Before starting your project, ask...">

- What is my task? (classification, generation, extraction...)
- What signals are important? (sentiment, topics, entities...)
- Should I lowercase? (preserve case for names?)
- How to handle punctuation? (keep for emotion?)
- Do I need lemmatization? (or will model handle it?)
- Should I remove stop words? (or keep for grammar?)
- How to handle special characters? (emoji, numbers, symbols)
- What about rare/unknown words? (keep, remove, replace?)
- Have I validated on sample data? (inspect before/after!)

</div>

<div class="tip-box" data-title="Remember">

There's no one-size-fits-all solution!

</div> 

---

<!-- _class: scale-78 -->

# Tools and libraries

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Web Scraping:**
- [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/)
- [Scrapy](https://scrapy.org/)

**Text Processing:**
- [spaCy](https://spacy.io/)
- [NLTK](https://www.nltk.org/)
- [TextBlob](https://textblob.readthedocs.io/)

</div>
<div style="flex: 1;">

**Encoding:**
- chardet: Character encoding detection
- ftfy: Fixes broken Unicode

**HuggingFace Resources:**
- [Chapter 3.2: Processing Data](https://huggingface.co/learn/nlp-course/chapter3/2)
- [Chapter 2.4: Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4)

</div>
</div>


---

<!-- _class: scale-78 -->

# Primary references

<div class="note-box" data-title="Classic papers">

- Porter, M. F. (1980). An algorithm for suffix stripping. *Program*, 14(3), 130-137. &mdash; The original Porter Stemmer algorithm
- Manning, C. D., Raghavan, P., & Schutze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. &mdash; Chapter 2: Text preprocessing fundamentals

</div>

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Modern resources:**
- spaCy documentation: Industrial-strength NLP
- HuggingFace NLP Course: Modern preprocessing with transformers

</div>
<div style="flex: 1;">

**Ethical considerations:**
- Liang et al. (2020). "Towards Debiasing Sentence Representations"
- Consider how preprocessing choices affect fairness

</div>
</div>


---

# Hands-on exercise

<div class="example-box" data-title="Try this yourself">

1. Choose a website (news, blog, Reddit...)
2. Scrape 10-20 articles/posts
3. Apply different preprocessing pipelines:
   - **Minimal:** Just remove HTML
   - **Moderate:** + normalize whitespace, lowercase
   - **Heavy:** + lemmatize, remove stop words
4. Compare the results:
   - How does vocabulary size change?
   - What information is lost/preserved?
   - Which would work best for sentiment analysis? Topic modeling?

</div>

<div class="tip-box" data-title="Bonus">

Share interesting findings with classmates!

</div> 

---

<!-- _class: scale-78 -->

# Key takeaways

1. **Preprocessing is crucial** but task-dependent &mdash; No universal pipeline; adapt to your needs!
2. **Balance cleaning vs. information loss** &mdash; More preprocessing does not always mean better
3. **Stemming vs. Lemmatization** &mdash; Stemming: fast, approximate; Lemmatization: slow, accurate
4. **Modern models are robust** &mdash; Transformers can handle messy text better than older models
5. **Always validate** &mdash; Inspect data before and after preprocessing

<div class="note-box" data-title="Coming up">

Tokenization deep dive!

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

Lecture 6 &mdash; Tokenization deep dive!

</div>
