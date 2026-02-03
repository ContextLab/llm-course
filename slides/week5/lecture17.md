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
3. Understand how embeddings enable semantic retrieval
4. Implement a basic RAG system in Python
5. Evaluate tradeoffs between RAG and fine-tuning

</div>

---

# Announcements

<div class="important-box" data-title="Assignment 3 due this week">

**Wikipedia Embeddings** assignment is due **Thursday, February 6 at 11:59 PM EST**.

Submit via GitHub Classroom.

</div>

<div class="note-box" data-title="Assignment 4 released">

[**Customer Service Chatbot**](https://contextlab.github.io/llm-course/assignments/assignment-4/) — build a context-aware chatbot using retrieval and generation techniques.

Due: **February 16 at 11:59 PM EST**.

</div>

---

# The knowledge problem

<div class="definition-box" data-title="Two kinds of knowledge">

**Parametric knowledge**: Facts stored *inside* the model's parameters during training. The model "knows" things because it memorized patterns from its training data.

**Non-parametric knowledge**: Facts stored *outside* the model in documents, databases, or APIs. The model accesses this knowledge at inference time.

</div>

<div class="tip-box" data-title="Analogy">

Parametric knowledge is like what you remember from studying. Non-parametric knowledge is like having your textbook open during an exam — you can look things up when you need them.

</div>

---

# Why parametric knowledge falls short

<div class="warning-box" data-title="Limitations of relying only on model parameters">

1. **Hallucination**: The model confidently generates plausible-sounding but incorrect information
2. **Stale data**: The model's knowledge is frozen at training time — it doesn't know about events after its cutoff date
3. **No citations**: The model can't tell you *where* it learned something, making it hard to verify claims
4. **Costly updates**: Retraining or fine-tuning to add new knowledge is expensive and slow
5. **Long tail**: Rare or specialized facts are poorly represented in pre-training data

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

<div class="definition-box" data-title="Five steps">

1. **Query**: The user asks a question
2. **Embed**: Convert the query into a vector using an embedding model
3. **Retrieve**: Find the most similar document chunks in a vector database
4. **Augment**: Insert the retrieved chunks into the prompt as context
5. **Generate**: The language model generates an answer grounded in the retrieved context

</div>

<div class="tip-box" data-title="The big picture">

$$\text{RAG}(q) = \text{LLM}(q + \text{retrieve}(q, \mathcal{D}))$$

where $q$ is the query and $\mathcal{D}$ is the document collection.

</div>

---

# Embeddings for retrieval

<div class="definition-box" data-title="Connecting to lectures 11-15">

Remember embeddings? In lectures 11-14, we learned that embeddings map text to vectors where **semantic similarity corresponds to geometric proximity**:

$$\text{similar meaning} \Leftrightarrow \text{nearby vectors}$$

RAG uses this property for retrieval: embed the query and the documents into the same vector space, then find the documents closest to the query.

</div>

<div class="note-box" data-title="Which embedding model?">

For RAG, we typically use **sentence embedding** models (not word-level) that produce a single vector for an entire passage:
- **Sentence-BERT** (all-MiniLM-L6-v2): Fast, good quality, 384 dimensions
- **OpenAI text-embedding-3-small**: API-based, 1536 dimensions
- **BGE, E5, GTE**: Open-source alternatives with strong performance

</div>

---

# Vector similarity

<div class="definition-box" data-title="Measuring how similar two texts are">

Given embedding vectors $a$ and $b$, we compute **cosine similarity**:

$$\text{sim}(a, b) = \frac{a \cdot b}{\|a\| \|b\|} = \frac{\sum_i a_i b_i}{\sqrt{\sum_i a_i^2} \cdot \sqrt{\sum_i b_i^2}}$$

- $\text{sim} = 1$: Identical meaning
- $\text{sim} = 0$: Unrelated
- $\text{sim} = -1$: Opposite meaning

</div>

<div class="example-box" data-title="Example">

```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

query = model.encode("What causes rain?")
doc1 = model.encode("Precipitation occurs when water vapor condenses.")
doc2 = model.encode("The stock market closed higher today.")

print(util.cos_sim(query, doc1))  # ~0.72 (relevant!)
print(util.cos_sim(query, doc2))  # ~0.05 (irrelevant)
```

</div>

---

# Why do we need chunking?

<div class="definition-box" data-title="Breaking documents into pieces">

Real documents are long — hundreds or thousands of pages. We can't embed an entire book as a single vector (too much information is lost). Instead, we split documents into smaller **chunks** and embed each chunk separately.

</div>

<div class="tip-box" data-title="Chunking strategies">

- **Fixed-size**: Split every $n$ characters/tokens (simple but may cut mid-sentence)
- **Sentence-based**: Split on sentence boundaries (preserves meaning better)
- **Semantic**: Use topic shifts to determine chunk boundaries (best quality but most complex)
- **Recursive**: Split on paragraphs first, then sentences if chunks are still too long

</div>

---

# Chunk size tradeoffs

<div class="warning-box" data-title="Getting the chunk size right matters">

**Too small** (e.g., individual sentences):
- Loses surrounding context
- May not contain enough information to answer the question
- Retrieves many fragments that are hard to piece together

**Too large** (e.g., entire chapters):
- Embedding quality degrades — too much information in one vector
- Includes irrelevant content alongside relevant content
- Uses up the language model's context window

</div>

<div class="tip-box" data-title="Rules of thumb">

A good starting point is **256-512 tokens** per chunk with **50-100 token overlap** between adjacent chunks. This ensures each chunk has enough context and important information at chunk boundaries isn't lost.

</div>

---

# Vector databases

<div class="definition-box" data-title="Specialized storage for embeddings">

A **vector database** stores embedding vectors and provides fast **approximate nearest neighbor** (ANN) search. Instead of comparing a query to every document (slow for millions of documents), vector databases use indexing structures to find the most similar vectors in milliseconds.

</div>

<div class="note-box" data-title="Why not just use a list?">

Brute-force search over $n$ vectors takes $O(n)$ time. For 10 million chunks, that's 10 million cosine similarity computations per query. Vector databases use techniques like HNSW (Hierarchical Navigable Small World graphs) to reduce this to roughly $O(\log n)$.

</div>

---

# Popular vector databases

<div class="note-box" data-title="Options for different use cases">

| Database | Type | Best for |
|----------|------|----------|
| **FAISS** | Library (Meta) | Research, local experiments |
| **ChromaDB** | Embedded DB | Prototyping, small-medium scale |
| **Pinecone** | Managed cloud | Production, no-ops |
| **Weaviate** | Self-hosted | Full-featured, hybrid search |
| **Qdrant** | Self-hosted | Performance-focused |

For this course, **ChromaDB** or **FAISS** are the easiest to get started with — no server or API key needed.

</div>

---
<!-- _class: scale-90 -->

# Python: embedding documents

<div class="example-box" data-title="Step 1: embed your knowledge base">

```python
from sentence_transformers import SentenceTransformer

# Load embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Your knowledge base (in practice, loaded from files)
documents = [
    "The transformer was introduced by Vaswani et al. in 2017.",
    "BERT uses bidirectional attention for language understanding.",
    "GPT models use autoregressive (left-to-right) generation.",
    "Attention mechanisms allow models to focus on relevant context.",
    "Fine-tuning adapts a pre-trained model to a specific task.",
]

# Embed all documents
doc_embeddings = embedder.encode(documents, convert_to_tensor=True)
print(doc_embeddings.shape)  # (5, 384) — 5 docs, 384 dims each
```

</div>

---
<!-- _class: scale-90 -->

# Python: retrieval

<div class="example-box" data-title="Step 2: find relevant documents">

```python
from sentence_transformers import util

def retrieve(query, documents, doc_embeddings, top_k=3):
    """Find the top_k most relevant documents for a query."""
    # Embed the query
    query_embedding = embedder.encode(query, convert_to_tensor=True)

    # Compute cosine similarity against all documents
    scores = util.cos_sim(query_embedding, doc_embeddings)[0]

    # Get top-k results
    top_indices = scores.argsort(descending=True)[:top_k]

    results = []
    for idx in top_indices:
        results.append({
            "text": documents[idx],
            "score": scores[idx].item()
        })
    return results

# Example query
results = retrieve("How do transformers work?", documents, doc_embeddings)
for r in results:
    print(f"  [{r['score']:.3f}] {r['text']}")
```

</div>

---
<!-- _class: scale-85 -->

# Python: generation with context

<div class="example-box" data-title="Step 3: augment the prompt and generate">

```python
from openai import OpenAI  # or any LLM API

client = OpenAI()

def rag_answer(query, documents, doc_embeddings):
    """Answer a question using RAG."""
    # Step 1: Retrieve relevant context
    context_docs = retrieve(query, documents, doc_embeddings, top_k=3)
    context = "\n".join([doc["text"] for doc in context_docs])

    # Step 2: Build the augmented prompt
    prompt = f"""Answer the question based on the provided context.
If the context doesn't contain the answer, say "I don't know."

Context:
{context}

Question: {query}
Answer:"""

    # Step 3: Generate with the LLM
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

answer = rag_answer("What is BERT?", documents, doc_embeddings)
print(answer)
```

</div>

---
<!-- _class: scale-85 -->

# End-to-end RAG with ChromaDB

<div class="example-box" data-title="A complete mini RAG system">

```python
import chromadb
from sentence_transformers import SentenceTransformer

# Set up ChromaDB (persistent storage)
client = chromadb.Client()
collection = client.create_collection("course_notes")

# Add documents (ChromaDB handles embedding automatically)
collection.add(
    documents=[
        "The transformer uses self-attention to process sequences in parallel.",
        "Cross-entropy loss measures prediction error for classification.",
        "RAG combines retrieval with generation for knowledge-grounded answers.",
    ],
    ids=["doc1", "doc2", "doc3"]
)

# Query — ChromaDB embeds the query and finds nearest neighbors
results = collection.query(query_texts=["How does attention work?"], n_results=2)
print(results["documents"])
# [['The transformer uses self-attention to process sequences in parallel.',
#   'RAG combines retrieval with generation for knowledge-grounded answers.']]
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

# Advanced RAG techniques

<div class="note-box" data-title="Beyond basic RAG">

1. **Re-ranking**: After initial retrieval, use a cross-encoder model to re-score and re-order results for better precision

2. **Hybrid search**: Combine vector similarity (semantic) with keyword matching (BM25) for more robust retrieval

3. **Query expansion**: Rewrite or expand the user's query using an LLM before retrieval to improve recall

4. **Multi-hop retrieval**: For complex questions, retrieve → generate an intermediate answer → retrieve again with new context

5. **Contextual compression**: Summarize retrieved chunks to fit more information into the context window

</div>

---

# Limitations of RAG

<div class="warning-box" data-title="RAG is not a silver bullet">

**Retrieval quality**: If the retriever fails to find relevant documents, the generator can't produce a good answer — garbage in, garbage out.

**Context window limits**: Even with RAG, there's a limit to how much retrieved text fits in the prompt. Long documents may need aggressive chunking or summarization.

**Latency**: The retrieval step adds time. For real-time applications, this overhead matters.

**Reasoning over multiple sources**: RAG is great for finding a specific fact, but struggles when the answer requires synthesizing information across many documents.

**Embedding quality**: The retriever is only as good as the embedding model. Domain-specific queries may need domain-specific embeddings.

</div>

---

# Best practices

<div class="tip-box" data-title="Making RAG work well">

1. **Chunk wisely**: Experiment with chunk sizes (256-512 tokens is a good start). Use overlap between chunks.
2. **Choose the right embedding model**: Test multiple models on your specific domain. General-purpose models may not capture domain-specific semantics.
3. **Evaluate retrieval separately**: Before blaming the LLM, check if the retriever is finding the right documents.
4. **Include metadata**: Store source, date, and section info with chunks so the LLM can cite sources.
5. **Handle "I don't know"**: Instruct the model to say when the context doesn't contain the answer rather than hallucinating.

</div>

---

# Try it yourself

<div class="note-box" data-title="Interactive demo">

Explore our interactive RAG demo to see retrieval augmented generation in action:

[**RAG System Demo**](https://contextlab.github.io/llm-course/demos/rag/) — Upload documents, ask questions, and see how the system retrieves relevant passages and generates grounded answers.

</div>

<div class="tip-box" data-title="Assignment 4 connection">

Your next assignment asks you to build a **Customer Service Chatbot** that uses retrieval and generation techniques. The RAG concepts from today's lecture are directly applicable!

</div>

---

# Discussion: RAG applications

<div class="tip-box" data-title="Questions to consider">

1. What kinds of applications benefit most from RAG? Where would fine-tuning be better?
2. A company wants to build a chatbot that answers questions about their internal documents. What are the privacy implications of using RAG vs. fine-tuning?
3. How would you evaluate whether a RAG system is working well? What metrics matter?
4. If the retrieved documents contain contradictory information, how should the system handle that?

</div>

---

# Discussion: the future of knowledge-grounded generation

<div class="tip-box" data-title="Questions to consider">

1. Will RAG eventually be unnecessary if models get large enough to memorize everything?
2. How does RAG change the economics of AI — who controls the knowledge base controls the answers?
3. Could RAG be used to make language models more "honest" about what they know vs. don't know?
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

Week 6: BERT and encoder models — bidirectional attention and masked language modeling!

</div>
