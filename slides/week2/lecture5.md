---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 5: Data cleaning & preprocessing
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

# Remember: follow along with [Google Colab](https://colab.research.google.com/)!

<div style="display: flex; gap: 0.25em;">
<div>

![width:580px](../../figures/colab_screenshot.png)

</div>
<div class="inline-note">

- Go to [colab.research.google.com](https://colab.research.google.com/)
- Click "New notebook"
- Click to create new `text` or `code` cells
- Copy and paste code from slides
- Press `Shift + Enter` to run cells
- *Doing* is the best way to learn!
- **Experiment! Break stuff!**

</div>
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

*"Quality of input $\propto$ quality of output"*

</div>
 

---

# The data cleaning pipeline

```flow
[Raw Text:blue] --> [Remove Tags:teal] --> [Normalize:green] --> [Tokenize:orange] --> [Lemmatize:violet] --> [Clean Text:teal]
```
<!-- caption: A typical data cleaning pipeline -->

<div class="warning-box" data-title="Important">

Pipeline varies by task&mdash; not all steps are always needed...and sometimes you'll need *additional* steps!

</div>

<div class="tip-box" data-title="Rule of thumb">

Think about: what are you trying to *get* out of your dataset? If something in your dataset is **informative**, keep it; otherwise normalize or remove it to cut down on how much explanatory power is eaten up by the stuff you don't think matters.

</div>

---
<!-- _class: scale-80 -->

# Regular expressions are often useful for cleaning

<div style="display: flex; gap: 0.5em;">
<div style="flex: 1;">

1. Remove HTML tags
2. Remove URLs/emails
3. Normalize whitespace

<div class="tip-box" data-title="Test it!">

Check your patterns against example inputs (you can make them up or use a package like [Faker](https://faker.readthedocs.io/en/master/)). Make sure you've covered weird edge cases in addition to common patterns.

</div>

<div class="warning-box" data-title="Be careful...">

When you normalize, remove, or simplify text, it introduces a potentially tricky-to-debug condition: text that *starts out* different may end up being the *same* after "cleaning."

</div>

</div>
<div style="flex: 1;">

```python
import re
raw = "<p>I LOVE this!!! https://ex.com a@b.com</p>"

text = re.sub(r'<.*?>', '', raw)   # HTML tags
text = re.sub(r'http\S+', '', text)  # URLs
text = re.sub(r'\S+@\S+', '', text)  # ← Emails ↓ Whitespace
text = ' '.join(text.split())

print(text) # "I LOVE this!!!"
```

</div>
</div>

---

<!-- _class: scale-85 -->

# Example: multi-step text cleaning

| Stage | Text |
|-------|------|
| **Raw** | `<p>I LOVE this product 😁!!! https://ex.com</p>` |
| **Remove HTML** | `I LOVE this product 😁!!! https://ex.com` |
| **Remove URLs** | `I LOVE this product 😁!!!` |
| **Remove emojis** | `I LOVE this product !!!` |
| **Normalize spaces** | `I LOVE this product!!! ` |
| **Lowercase** | `i love this product!!!` |
| **Remove extra punctuation** | `i love this product!` |


<div class="note-box" data-title="Example decision points">

- Keep emoji? **Yes** for sentiment analysis (conveys emotion)
- Keep punctuation!!!? **Maybe** (emphasis, but noisy)
- Lowercase? **Depends** on task (lose "LOVE" emphasis)

</div>

---

<!-- _class: scale-95 -->

# Different tasks need different preprocessing

| Task | Keep | Remove |
|------|------|--------|
| Sentiment analysis | Emoji, punctuation (style matters) | Extra whitespace, special chars |
| Named entity recognition | Case (proper nouns important) | Extra whitespace |
| Topic modeling (we'll learn about this next week!) | Content words only | Punctuation, case (lowercase all) |
| Text classification | Depends on domain | HTML tags, URLs, special chars |
| Training LLMs | As much raw text as possible (let model learn patterns) | Broken encodings, invalid chars |

<div class="tip-box" data-title="Pro tip">

When in doubt, keep it! If your dataset is large enough, modern models can often learn to ignore irrelevant noise.

</div>

---
<!-- _class: scale-90 -->

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

<div class="warning-box" data-title="Scrape ethically!">

Honor terms of service and copyright, respect rate limits, and check [robots.txt](https://en.wikipedia.org/wiki/Robots.txt) files.

</div>

---

<!-- _class: scale-70 -->

# Basic web scraping with Beautiful Soup

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

<!-- _class: scale-60 -->

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

<!-- _class: scale-80 -->

# Normalizing individual words: *stemming* is fast but crude; *lemmatization* is accurate

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**Stemming**
- Rule-based crude chopping
- Fast and simple
- May produce non-words
- No additional context needed
- Example: "running" &rarr; "run"

</div>
<div style="flex: 1;">

**Lemmatization**
- Uses vocabulary + morphology
- Slower but more accurate
- Always produces real words
- Requires POS context
- Example: "better" &rarr; "good"

</div>
</div>

<div class="tip-box" data-title="When to use which?">

- **Stemming:** Speed matters, approximate matching OK
- **Lemmatization:** Need interpretable, real words
- There are several variants of each of these approaches

</div>

---
<!-- _class: scale-70 -->

# Lemmatization produces real words; stemming produces fragments

| Word | Porter Stemmer | Lemmatizer | Notes |
|------|---------------|------------|-------|
| ran | ran | run | Lemma recognizes irregular verb |
| running | run | run | Both work well |
| runner | runner | runner | Both keep as-is |
| better | better | good | Lemma handles irregular adjective |
| best | best | good | Lemma handles superlative |
| geese | gees | goose | Stemmer produces non-word! |
| studies | studi | study | Stemmer produces non-word! |
| organizing | organ | organize | Stemmer too aggressive! |

---

<!-- _class: scale-70 -->

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

<!-- _class: scale-70 -->

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
<!-- _class: scale-90 -->

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

<!-- _class: scale-75 -->

# Stop words: common words with little semantic value

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1;">

**When to remove:**
- Topic modeling*
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

"the", "a", "is", "in", "and", "or" — language-specific lists available in NLTK, spaCy, and scikit-learn (among others).

</div>

<div class="definition-box" data-title="Topic modeling">

*There's that term again! **Topic modeling** is an unsupervised learning technique that identifies topics in a collection of documents by analyzing word co-occurrence patterns (i.e., "groups of words that often appear together"). Stop words are so common that they appear in nearly every document, so they aren't helpful for *distinguishing* topics.

</div>

---
<!-- _class: scale-70 -->

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
<!-- _class: scale-90 -->

# Discussion: preprocessing trade-offs

<div class="note-box" data-title="What do you think?">

1. *Information loss:* What do we lose when we lowercase everything?
   - Think: "US" (United States) vs. "us" (pronoun)
2. *Task dependency:* why might we use different preprocessing steps for different tasks?
   - Hint: which signals matter for sentiment vs. topic modeling?
3. *Modern models:* when might we skip preprocessing entirely?
   - Consider: size and quality of source data, model architecture
4. *Bias introduction:* can preprocessing introduce bias?
   - Example: Removing slang, intentional misspellings, or dialectal variations

</div>

<div class="example-box" data-title="Can you think of other examples?">

What other aspects of text preprocessing do you think might be important to consider?  Have you ever encountered a situation where you had to preprocess text data in a specific way to achieve better results? How did you decide on the best approach?

</div>


---

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

<!-- _class: scale-60 -->

# Libraries and resources for text preprocessing

<div style="display: flex; gap: 1.5em;">
<div class="examples-col">

<div class="inline-example">
<span class="example-title">Web scraping</span>
<span class="example-text">

- [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/): Parse HTML/XML
- [Requests](https://docs.python-requests.org/en/latest/): Fetch web pages
- [Scrapy](https://scrapy.org/): Full scraping framework
- [Selenium](https://www.selenium.dev/): JavaScript-heavy sites

</span>
</div>

<div class="inline-example">
<span class="example-title">Text processing</span>
<span class="example-text">

- [spaCy](https://spacy.io/): Industrial-strength NLP
- [NLTK](https://www.nltk.org/): Natural Language Toolkit
- [TextBlob](https://textblob.readthedocs.io/): Simple text processing
- [Gensim](https://radimrehurek.com/gensim/): Topic modeling and more
- [Scikit-learn](https://scikit-learn.org/stable/): ML with text features

</span>
</div>

</div>

<div class="examples-col">

<div class="inline-example">
<span class="example-title">Character encoding</span>
<span class="example-text">

- [chardet](https://pypi.org/project/chardet/): Character encoding detection
- [ftfy](https://ftfy.readthedocs.io/en/latest/): Fixes broken Unicode

</span>
</div>

<div class="inline-example">
<span class="example-title">HuggingFace Resources</span>
<span class="example-text">

- [Chapter 3.2: Processing Data](https://huggingface.co/learn/nlp-course/chapter3/2)
- [Chapter 2.4: Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4)
- [Tokenizers library](https://huggingface.co/docs/tokenizers/index)

</span>
</div>

<div class="inline-example">
<span class="example-title">Other useful libraries</span>
<span class="example-text">

- [regex](https://pypi.org/project/regex/): Enhanced regex capabilities
- [Faker](https://faker.readthedocs.io/en/master/): Generate fake data for testing

</span>
</div>

</div>
</div>

---

# Further reading

<div class="note-box" data-title="Classic papers">

- [**Porter, M. F. (1980, *Program*).**](http://www.cs.toronto.edu/~frank/csc2501/Readings/R2_Porter/Porter-1980.pdf) An algorithm for suffix stripping.
- [**Manning, C. D. et al. (2008, *Introduction to information retrieval*).**](https://link.springer.com/content/pdf/10.1007/s10791-009-9096-x.pdf) Text preprocessing fundamentals.

</div>

<div class="example-box" data-title="Ethical considerations">

[**Liang et al. (2020, *arXiv*).**](https://arxiv.org/pdf/2007.08100) Towards Debiasing Sentence Representations.

</div>

---

# Let's try it out!

<div class="example-box" data-title="Time to get your hands dirty...">

1. Choose *any* website (news, blog, Reddit...)
2. Scrape 10-20 articles/posts
3. Apply different preprocessing pipelines:
   - **Minimal:** Just remove HTML
   - **Moderate:** + normalize whitespace, lowercase
   - **Heavy:** + lemmatize, remove stop words
4. Compare the results:
   - How does vocabulary size change?
   - What information is lost/preserved?
   - What'd you get stuck on?

</div>

<div class="note-box" data-title="Bonus">

Share what you learn with the class, live or on our [Discord](https://discord.gg/sftEk9Ygdw)!

</div> 

---

<!-- _class: scale-85 -->

# Key takeaways

1. **Preprocessing is crucial** but task-dependent: no universal pipeline
2. **Balance cleaning vs. information loss**: more preprocessing does not always mean better
3. **Stemming vs. lemmatization**: the correct answer is "lemmatization"
4. **Big datasets and complex models** can handle messy text better than older models fit to small datasets
5. **Always validate**: inspect your data before and after preprocessing

---

# What's next?

<div class="note-box" data-title="Rest of this week">

- **Wednesday**: tokenization&mdash; carving text into useful pieces
- **Thursday (X-hour)**: text classification&mdash; automatically labeling text data
- **Friday**: POS tagging and sentiment analysis&mdash; understanding word roles and emotions

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

<div class="tip-box" data-title="Remember">

- Assignment 1 is due on Friday; ask questions early and often!
- Feeling lost or stuck? Let me know; I'm here to help!

</div>
