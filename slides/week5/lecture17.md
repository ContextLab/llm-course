---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 17: Retrieval augmented generation
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Explain why language models need external knowledge
2. Describe the RAG pipeline: retrieve, augment, generate
3. Implement a basic RAG system in Python using free, open-source tools
4. Evaluate tradeoffs between RAG and fine-tuning

</div>

---

# Announcements

<div class="important-box" data-title="Assignment 3 due today!">

**Wikipedia Embeddings** assignment is due **today, Friday, February 6 at 11:59 PM EST**.

Submit via pull request after accepting assignment in GitHub Classroom.

</div>

<div class="note-box" data-title="Assignment 4 released">

[**Customer Service Chatbot**](https://contextlab.github.io/llm-course/assignments/assignment-4/) — build a context-aware chatbot using retrieval and generation techniques.

Due: **February 16 at 11:59 PM EST**.

</div>

---

# The knowledge problem

<div class="definition-box" data-title="Two kinds of knowledge">

**Parametric knowledge**: facts stored *inside* the model's parameters during training. The model "knows" things because it memorized patterns from its training data.

**Non-parametric knowledge**: facts stored *outside* the model in documents, databases, or APIs. The model accesses this knowledge at inference time.

</div>

<div class="warning-box" data-title="Why parametric knowledge falls short">

1. **Hallucination**: the model confidently generates plausible-sounding but incorrect information
2. **Stale data**: knowledge is frozen at training time — the model doesn't know about recent events
3. **No citations**: the model can't tell you *where* it learned something, making claims hard to verify

</div>

---

# What is RAG?

<div class="definition-box" data-title="Retrieval Augmented Generation">

**RAG** is a technique that gives language models access to external knowledge by *retrieving* relevant documents and *including* them in the prompt. The model generates its response based on both its parametric knowledge and the retrieved context.

</div>

<div class="note-box" data-title="Key insight">

Instead of trying to store all knowledge in the model's parameters, we let the model *look things up* in a knowledge base at inference time. This separates *what the model knows how to do* (reasoning, language) from *what facts it has access to* (documents, data).

</div>

---

# The RAG pipeline

```flow
[Query:blue] --> [Embed:teal] --> [Retrieve:green] --> [Augment:orange] --> [Generate:violet]
```
<!-- caption: The five stages of retrieval augmented generation -->

<div class="tip-box" data-title="The big picture">

$$\text{RAG}(q) = \text{LLM}(q + \text{retrieve}(q, \mathcal{D}))$$

where $q$ is the query and $\mathcal{D}$ is the document collection.

</div>

---

# Embeddings for retrieval

<div class="note-box" data-title="Connecting to lectures 11-12">

You already know that embeddings map text to vectors where **semantic similarity corresponds to geometric proximity**. RAG exploits this: embed the query and documents into the same vector space, then find the documents closest to the query using cosine similarity.

</div>

<div class="tip-box" data-title="Which embedding model?">

For RAG, we use **sentence embedding** models (not word-level) that produce a single vector for an entire passage. All of these are free and open-source:
- **Sentence-BERT** (all-MiniLM-L6-v2): fast, good quality, 384 dimensions
- **BGE** (BAAI/bge-small-en-v1.5): state-of-the-art for retrieval
- **E5, GTE**: strong open-source alternatives

</div>

---

# Document chunking

<div class="definition-box" data-title="Breaking documents into pieces">

Real documents are long. We can't embed an entire book as a single vector (too much information is lost). Instead, we split documents into smaller **chunks** and embed each chunk separately.

</div>

<div class="tip-box" data-title="Chunking strategies">

- **Fixed-size**: split every $n$ characters/tokens (simple but may cut mid-sentence)
- **Sentence-based**: split on sentence boundaries (preserves meaning better)
- **Semantic**: use topic shifts to determine chunk boundaries (best quality but most complex)
- **Recursive**: split on paragraphs first, then sentences if chunks are still too long

</div>

<div class="warning-box" data-title="Size tradeoffs">

Too small = loses context. Too large = dilutes relevance. Start with **256-512 tokens** per chunk with **50-100 token overlap** between adjacent chunks.

</div>

---

# Vector databases

<div class="definition-box" data-title="Specialized storage for embeddings">

A **vector database** stores embedding vectors and provides fast **approximate nearest neighbor** (ANN) search. Instead of comparing a query to every document (slow for millions of documents), vector databases use indexing structures to find the most similar vectors in milliseconds.

</div>

<div class="note-box" data-title="Why not just use a list?">

Brute-force search over $n$ vectors takes $O(n)$ time. For 10 million chunks, that's 10 million cosine similarity computations per query. Vector databases use techniques like HNSW (Hierarchical Navigable Small World graphs) to reduce this to roughly $O(\log n)$.

</div>

<div class="tip-box" data-title="For this course">

We'll use **ChromaDB** — no server setup, no API key, just `pip install chromadb`. For production scale, see also FAISS (Meta) and Pinecone (cloud).

</div>

---
<!-- _class: scale-85 -->

# Python: embed and retrieve

<div class="example-box" data-title="Steps 1-2: embed your knowledge base and find relevant documents">

```python
from sentence_transformers import SentenceTransformer, util

embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Knowledge base (in practice, loaded from files)
documents = [
    "The transformer was introduced by Vaswani et al. in 2017.",
    "BERT uses bidirectional attention for language understanding.",
    "GPT models use autoregressive (left-to-right) generation.",
    "Attention mechanisms allow models to focus on relevant context.",
    "Fine-tuning adapts a pre-trained model to a specific task.",
]
doc_embeddings = embedder.encode(documents, convert_to_tensor=True)

# Retrieve: embed query, find nearest documents
query = "How do transformers work?"
query_emb = embedder.encode(query, convert_to_tensor=True)
scores = util.cos_sim(query_emb, doc_embeddings)[0]
top_indices = scores.argsort(descending=True)[:3]
for idx in top_indices:
    print(f"  [{scores[idx]:.3f}] {documents[idx]}")
```

</div>

---
<!-- _class: scale-75 -->

# Python: generation with context

<div class="example-box" data-title="Step 3: augment the prompt and generate (free, no API key)">

```python
from transformers import pipeline

# Load a free, local text generation model
generator = pipeline("text2text-generation", model="google/flan-t5-base")

def rag_answer(query, documents, doc_embeddings, top_k=3):
    """Answer a question using RAG."""
    # Retrieve relevant context
    query_emb = embedder.encode(query, convert_to_tensor=True)
    scores = util.cos_sim(query_emb, doc_embeddings)[0]
    top_idx = scores.argsort(descending=True)[:top_k]
    context = "\n".join([documents[i] for i in top_idx])

    # Build augmented prompt and generate
    prompt = f"""Answer based on the context. Say "I don't know" if unsure.
Context: {context}
Question: {query}
Answer:"""
    return generator(prompt, max_new_tokens=128)[0]["generated_text"]

print(rag_answer("What is BERT?", documents, doc_embeddings))
```

</div>

<div class="tip-box" data-title="No API key needed">

FLAN-T5 runs locally in Colab. For better quality, try `google/flan-t5-large` (requires GPU).

</div>

---
<!-- _class: scale-70 -->

# End-to-end RAG with ChromaDB

<div class="example-box" data-title="A complete mini RAG system">

```python
import chromadb
from transformers import pipeline

# Set up ChromaDB (handles embedding automatically)
client = chromadb.Client()
collection = client.create_collection("course_notes")

# Add documents
collection.add(
    documents=[
        "The transformer uses self-attention to process sequences in parallel.",
        "Cross-entropy loss measures prediction error for classification.",
        "RAG combines retrieval with generation for knowledge-grounded answers.",
    ],
    ids=["doc1", "doc2", "doc3"]
)

# Retrieve relevant documents
results = collection.query(query_texts=["How does attention work?"], n_results=2)
context = "\n".join(results["documents"][0])

# Generate answer using retrieved context
generator = pipeline("text2text-generation", model="google/flan-t5-base")
prompt = f"Answer based on context.\nContext: {context}\nQuestion: How does attention work?\nAnswer:"
print(generator(prompt, max_new_tokens=128)[0]["generated_text"])
```

</div>

---

# RAG vs fine-tuning

<div class="tip-box" data-title="When to use which">

| | RAG | Fine-tuning |
|---|---|---|
| **Knowledge updates** | Easy — just update the documents | Hard — requires retraining |
| **Cost** | Cheap (no training needed) | Expensive (GPU time, data prep) |
| **Citations** | Natural — you know which docs were retrieved | Not possible |
| **Hallucination** | Reduced (grounded in retrieved text) | Can still hallucinate |
| **Domain adaptation** | Good for factual Q&A | Better for style/behavior changes |
| **Latency** | Higher (retrieval + generation) | Lower (just generation) |

</div>

<div class="note-box" data-title="They're complementary">

Many production systems use *both*: fine-tune the model for the domain's style and behavior, then use RAG for up-to-date factual knowledge.

</div>

---
<!-- _class: scale-85 -->

# Beyond basic RAG

<div class="note-box" data-title="Advanced techniques">

1. **Re-ranking**: after initial retrieval, use a cross-encoder model to re-score and re-order results for better precision
2. **Hybrid search**: combine vector similarity (semantic) with keyword matching (BM25) for more robust retrieval
3. **Query expansion**: rewrite or expand the user's query using an LLM before retrieval to improve recall

</div>

<div class="warning-box" data-title="Limitations to keep in mind">

1. **Retrieval quality**: if the retriever fails to find relevant documents, the generator can't produce a good answer — garbage in, garbage out
2. **Context window limits**: there's a limit to how much retrieved text fits in the prompt, requiring aggressive chunking or summarization
3. **Multi-source reasoning**: RAG is great for finding a specific fact, but struggles when answers require synthesizing information across many documents

</div>

---

# Best practices

<div class="tip-box" data-title="Making RAG work well">

1. **Chunk wisely**: experiment with chunk sizes (256-512 tokens is a good start). Use overlap between chunks.
2. **Choose the right embedding model**: test multiple models on your specific domain. General-purpose models may not capture domain-specific semantics.
3. **Evaluate retrieval separately**: before blaming the LLM, check if the retriever is finding the right documents.
4. **Include metadata**: store source, date, and section info with chunks so the LLM can cite sources.
5. **Handle "I don't know"**: instruct the model to say when the context doesn't contain the answer rather than hallucinating.

</div>

---

# Try it yourself

<div class="note-box" data-title="Interactive demo">

Explore our interactive RAG demo to see retrieval augmented generation in action:

[**RAG System Demo**](https://contextlab.github.io/llm-course/demos/rag/) — Search 2,000 Wikipedia articles, configure chunking strategies, compare RAG vs. non-RAG answers, and visualize embedding spaces — all in your browser with no API keys required.

</div>

<div class="tip-box" data-title="Assignment 4 connection">

Your next assignment asks you to build a **Customer Service Chatbot** that uses retrieval and generation techniques. The RAG concepts from today's lecture are directly applicable!

</div>

---

# Discussion: RAG in practice

<div class="tip-box" data-title="Questions to consider">

1. What kinds of applications benefit most from RAG? Where would fine-tuning be better?
2. A company wants to build a chatbot using internal documents. What are the privacy implications of RAG vs. fine-tuning?
3. Will RAG eventually be unnecessary if models get large enough to memorize everything?
4. What happens when the retrieved documents themselves contain misinformation?

</div>

---

# References

<div class="note-box" data-title="Further reading">

[**Lewis et al. (2020, *NeurIPS*)**](https://arxiv.org/abs/2005.11401) "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" — The original RAG paper.

[**Borgeaud et al. (2022, *ICML*)**](https://arxiv.org/abs/2112.04426) "Improving Language Models by Retrieving from Trillions of Tokens" — RETRO: scaling retrieval to massive corpora.

[**Gao et al. (2024, *arXiv*)**](https://arxiv.org/abs/2312.10997) "Retrieval-Augmented Generation for Large Language Models: A Survey" — Comprehensive survey of RAG techniques.

[**ChromaDB Documentation**](https://docs.trychroma.com/) — Getting started with vector databases for RAG.

</div>

---

# Questions?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label"><a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label"><a href="https://context-lab.youcanbook.me">Office hours</a></span>
  </div>
</div>

<div class="tip-box" data-title="Up next...">

Week 6: BERT deep dive — bidirectional attention, masked language modeling, and the pre-train/fine-tune paradigm!

</div>
