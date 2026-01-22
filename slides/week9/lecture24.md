---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.17: Models of Language and Communication'
footer: 'Week 9'
---

<!-- _class: lead -->

# Lecture 24: Retrieval Augmented Generation
## Grounding LLMs in External Knowledge 

**PSYC 51.17: Models of Language and Communication**

Week 9

---

# Today's Journey 

<div class="callout info">
<div class="callout-title">What we'll cover</div>

1. **The Problem**: Why parametric memory isn't enough
2. **RAG Basics**: Retrieve, Augment, Generate
3. **Implementation**: Building RAG systems step-by-step
4. **Advanced Techniques**: Self-RAG, Corrective RAG, HyDE
5. **Production Challenges**: Making RAG work in the real world

</div>

---

# The Limits of Parametric Memory 



What are the fundamental limitations of storing knowledge in model parameters?

**Problems with purely parametric models:**
- **Knowledge cutoff**: No information after training date
- **Hallucinations**: Models confidently generate false information
- **No source attribution**: Can't cite where information comes from
- **Expensive updates**: Retraining for new information costs millions
- **Privacy concerns**: Sensitive data baked into parameters
- **Domain specificity**: Limited knowledge of specialized domains
- **Outdated facts**: World changes but model weights don't

**Solution:** Combine parametric knowledge with non-parametric retrieval! 

---

# Example: Knowledge Cutoff Problem 


<div class="callout info">
<div class="callout-title">User Query (Dec 2024)</div>

"Who won the 2024 US Presidential election?"

</div>

<div class="columns">
<div class="column">

**Parametric-only LLM:**

{} "I apologize, but my knowledge was last updated in April 2023, so I cannot tell you about the 2024 election results."

Or worse: Hallucinates an answer!

</div>
<div class="column">

**RAG-enhanced LLM:**

{} "According to CNN (retrieved Nov 6, 2024), [actual winner] won the 2024 US Presidential election with [details]."

Provides: Fresh info + source!

</div>
</div>

<div class="callout warning">
<div class="callout-title">Key Insight</div>

Retrieval provides a **dynamic, updatable** knowledge base without retraining!

</div>


---

# Retrieval Augmented Generation: Definition 


<div class="callout info">
<div class="callout-title">RAG (Lewis et al., 2020)</div>

A technique that enhances LLMs by retrieving relevant documents from an external knowledge base and using them to inform generation.

</div>

**Core Idea:** Instead of relying only on learned parameters, the model can "look things up"!

<div class="columns">
<div class="column">

**Traditional LLM:**
- Question → Model → Answer
- Only parametric knowledge
- Fixed at training time
- No sources

</div>
<div class="column">

**RAG Pipeline:**
- Question → Retrieve Docs
- Docs + Question → Model
- Grounded Answer + Citations
- Updateable knowledge

</div>
</div>

*Reference: Lewis et al. (2020) - "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"*

---

# RAG Architecture 

```flow
[User Query] --> [Embed Query] --> [Vector Search] --> [Retrieve Docs] --> [Augment Prompt] --> [LLM Generate] --> [Response]
```

**Worked Example: "What causes the Northern Lights?"**

| Step | Action | Result |
|------|--------|--------|
| 1. Embed | Convert query to vector | `[0.12, -0.45, 0.78, ...]` (384 dims) |
| 2. Search | Find similar vectors in DB | Top-3 docs: scores 0.92, 0.87, 0.85 |
| 3. Retrieve | Get actual text chunks | "Aurora borealis occurs when..." |
| 4. Augment | Add context to prompt | System + Context + Query |
| 5. Generate | LLM produces answer | Grounded response with citations |

---

# RAG: Step-by-Step Walkthrough 

**Query:** "What is the capital of Kazakhstan?"

```python
# Step 1: Embed the query
query = "What is the capital of Kazakhstan?"
query_embedding = embedding_model.encode(query)
# Result: numpy array of shape (384,)

# Step 2: Search vector database
results = vector_db.search(query_embedding, top_k=3)
# Returns: [
# {"text": "Astana is the capital of Kazakhstan...", "score": 0.94},
# {"text": "Kazakhstan's capital moved from Almaty...", "score": 0.89},
# {"text": "The city was renamed Nur-Sultan in 2019...", "score": 0.85}
# ]

# Step 3: Build augmented prompt
context = "\n".join([r["text"] for r in results])
prompt = f"""Answer based on the context below.
Context: {context}
Question: {query}
Answer:"""

# Step 4: Generate with LLM
response = llm.generate(prompt)
# "Astana (previously known as Nur-Sultan) is the capital of Kazakhstan."
```

---

# RAG Components Deep Dive 

<div class="columns">
<div class="column">

**1. Document Processing**
```python
# Chunking example
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
 chunk_size=500, # Target size
 chunk_overlap=50, # Overlap between chunks
 separators=["\n\n", "\n", ". ", " "]
)

chunks = splitter.split_text(long_document)
# ["First chunk about topic A...",
# "Second chunk continues topic A...",
# "Third chunk about topic B..."]
```

</div>
<div class="column">

**2. Embedding & Storage**
```python
from sentence_transformers import SentenceTransformer
import chromadb

# Create embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(chunks)

# Store in vector database
client = chromadb.Client()
collection = client.create_collection("docs")
collection.add(
 embeddings=embeddings.tolist(),
 documents=chunks,
 ids=[f"chunk_{i}" for i in range(len(chunks))]
)
```

</div>
</div>

---

# RAG Implementation Example 


**Basic RAG with LangChain:**

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. Load and chunk documents
loader = TextLoader('knowledge_base.txt')
documents = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
 chunk_size=512,
 chunk_overlap=50
)
chunks = text_splitter.split_documents(documents)

# 2. Create embeddings and vector store
embeddings = HuggingFaceEmbeddings(
 model_name="sentence-transformers/all-MiniLM-L6-v2"
)
vectordb = Chroma.from_documents(
 documents=chunks,
 embedding=embeddings,
 persist_directory="./chroma_db"
)

# 3. Set up retriever
retriever = vectordb.as_retriever(
 search_type="similarity",
 search_kwargs={"k": 3} # Retrieve top 3 chunks
)
```


---

# RAG Implementation (cont.) 


```python
# 4. Create LLM
llm = HuggingFacePipeline.from_model_id(
 model_id="meta-llama/Llama-2-7b-chat-hf",
 task="text-generation",
 model_kwargs={"temperature": 0.7, "max_length": 512}
)

# 5. Create RAG chain
qa_chain = RetrievalQA.from_chain_type(
 llm=llm,
 retriever=retriever,
 return_source_documents=True,
 chain_type="stuff" # How to combine documents
)

# 6. Query the system
query = "What is retrieval augmented generation?"
result = qa_chain({"query": query})

print("Answer:", result['result'])
print("\nSources:")
for doc in result['source_documents']:
 print(f"- {doc.metadata['source']}: {doc.page_content[:100]}...")
```

*Tutorial: HuggingFace Advanced RAG - https://huggingface.co/learn/cookbook/advanced_rag*

---

# Evolution of RAG Approaches 

```flow
[Naive RAG:blue] --> [Self-RAG:green] --> [Corrective RAG:orange] --> [Agentic RAG:purple]
```

| Approach | Key Innovation | When to Retrieve |
|----------|----------------|------------------|
| **Naive RAG** | Always retrieve | Every query |
| **Self-RAG** | Model decides | Only when needed |
| **Corrective RAG** | Verify relevance | Always, but filter |
| **Agentic RAG** | Multi-step reasoning | Tool-based decisions |

<div class="callout warning">
<div class="callout-title">Trend</div>

Moving from always-retrieve to **adaptive**, **self-correcting** retrieval systems!

</div>

---

# Self-RAG: Adaptive Retrieval 

<div class="columns">
<div class="column">

**Key Innovation:** Model decides when to retrieve

**Special Tokens Learned:**
- `[Retrieve]` - Need external info?
- `[Relevant]` - Is retrieved doc useful?
- `[Support]` - Does doc support answer?
- `[Useful]` - Is answer helpful?

</div>
<div class="column">

**Worked Example:**

```
Q: What's 2+2?
[Retrieve: No] # No retrieval needed
A: 4

Q: Who won the 2024 Olympics?
[Retrieve: Yes] # Need current info
[Retrieved: "Paris 2024 Olympic Games..."]
[Relevant: Yes] # Doc is on topic
A: The 2024 Olympics were held in Paris...
[Support: Fully] # Answer matches doc
[Useful: Yes] # Response is helpful
```

</div>
</div>

<div class="callout info">
<div class="callout-title">Key Insight</div>

The model learns these tokens during training, enabling **adaptive** retrieval without manual rules!

</div>

*Reference: Asai et al. (2023) - "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection"*

---

# Corrective RAG (CRAG) 

**Problem:** Sometimes retrieved documents are irrelevant or misleading!

```flow
[Query] --> [Retrieve] --> [Evaluate Relevance] --> {Correct?} --> [Generate]
 --> {Ambiguous?} --> [Filter & Refine] --> [Generate]
 --> {Wrong?} --> [Web Search] --> [Generate]
```

**Worked Example:**

```python
# Query: "Latest COVID vaccine recommendations"
retrieved_docs = retriever.search(query) # Returns old 2021 docs

# Evaluator scores relevance
scores = evaluator.score(query, retrieved_docs)
# [0.3, 0.4, 0.35] # All low - docs are outdated!

if max(scores) < 0.5: # Threshold not met
 # Fallback to web search for current info
 fresh_docs = web_search(query)
 # Now returns CDC guidelines from 2024

response = generate(query, fresh_docs)
```

<div class="callout warning">
<div class="callout-title">Key Idea</div>

Don't blindly trust retrieval! Verify relevance and have fallback strategies.

</div>

*Reference: Yan et al. (2024) - "Corrective Retrieval Augmented Generation"*

---

# Comparing RAG Approaches 

| Approach | When Retrieve | Filtering | Latency | Best For |
|----------|---------------|-----------|---------|----------|
| **Naive RAG** | Always | None | Low | Simple Q&A |
| **Self-RAG** | Model decides | Self-reflection | Medium | Adaptive needs |
| **Corrective RAG** | Always + verify | Relevance scoring | High | High precision |
| **HyDE** | Via hypothesis | Similarity | Medium | Complex queries |
| **Agentic RAG** | Tool-based | Multi-step | Highest | Complex workflows |

**Trade-offs Example:**

```
Simple FAQ bot → Naive RAG (fast, cheap)
Medical diagnosis assistant → Corrective RAG (accuracy critical)
Research assistant → Agentic RAG (multi-step reasoning needed)
```

<div class="callout info">
<div class="callout-title">Rule of Thumb</div>

Start with Naive RAG. Add complexity only when you measure specific failures.

</div>

---

# Chunking Strategies 

**How you split documents dramatically affects retrieval quality!**

<div class="columns">
<div class="column">

**Fixed-size (Simple)**
```python
# Split every 500 chars
chunks = [text[i:i+500]
 for i in range(0, len(text), 500)]
# Problem: "The mitochondria is the power-"
# "house of the cell." <- split mid-sentence!
```

**Recursive (Better)**
```python
splitter = RecursiveCharacterTextSplitter(
 separators=["\n\n", "\n", ". ", " "],
 chunk_size=500
)
# Tries paragraph breaks first, then sentences
```

</div>
<div class="column">

**Semantic (Best Quality)**
```python
# Find natural breakpoints using embeddings
from langchain.text_splitter import SemanticChunker

chunker = SemanticChunker(embeddings)
# Groups sentences with similar meaning
```

**Example Comparison:**
| Strategy | Chunk | Quality |
|----------|-------|---------|
| Fixed | "...power-" / "house..." | Poor |
| Recursive | "...powerhouse." | Good |
| Semantic | Full paragraph on topic | Best |

</div>
</div>

---

# Embedding Models for Retrieval 

**Choosing the Right Embedding Model:**

| Model | Dims | Size | Speed | Quality |
|-------|------|------|-------|---------|
| all-MiniLM-L6-v2 | 384 | 90MB | Fast | Good |
| BGE-large-en | 1024 | 1.3GB | Medium | Excellent |
| OpenAI text-embedding-3-small | 1536 | API | Fast | Excellent |

**Code Example: Dense vs Hybrid Retrieval**

```python
# Dense retrieval (semantic similarity)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
query_vec = model.encode("What causes headaches?")
# Finds: "Migraines are often triggered by..." (semantically similar)

# Sparse retrieval (keyword matching with BM25)
from rank_bm25 import BM25Okapi
bm25 = BM25Okapi(tokenized_corpus)
scores = bm25.get_scores(query.split())
# Finds: "Headaches can be caused by..." (exact keyword match)

# Hybrid: Combine both for best results!
final_score = 0.7 * dense_score + 0.3 * sparse_score
```

---

# Vector Databases 

**Purpose:** Fast similarity search over millions of embeddings

<div class="columns">
<div class="column">

**Quick Start with ChromaDB:**
```python
import chromadb

# Create client and collection
client = chromadb.Client()
collection = client.create_collection("my_docs")

# Add documents (auto-embeds!)
collection.add(
 documents=["Paris is in France",
 "Berlin is in Germany"],
 ids=["doc1", "doc2"]
)

# Query
results = collection.query(
 query_texts=["European capitals"],
 n_results=2
)
# Returns both docs, ranked by relevance
```

</div>
<div class="column">

**Choosing a Vector DB:**

| Use Case | Best Choice |
|----------|-------------|
| Prototyping | ChromaDB |
| Production | Pinecone, Qdrant |
| Self-hosted | FAISS, Milvus |
| Graph + Vector | Weaviate |

**Key Features:**
- Query latency (<50ms for 1M docs)
- Metadata filtering
- Persistence & backups
- Scalability

</div>
</div>

---

# Prompt Engineering for RAG 

**Template for Grounded Generation:**

```python
RAG_PROMPT = """You are a helpful assistant. Answer the question based ONLY on
the context provided below. If the answer is not in the context, say
"I don't have that information."

Context:
{context}

Question: {question}

Instructions:
- Use only information from the context above
- Cite sources using [1], [2], etc.
- Be concise and accurate

Answer:"""

# Example usage
context = """[1] The Eiffel Tower was completed in 1889 for the World's Fair.
[2] It stands 330 meters tall and was the world's tallest structure until 1930.
[3] Gustave Eiffel's company designed and built the tower."""

question = "When was the Eiffel Tower built?"

response = llm.generate(RAG_PROMPT.format(context=context, question=question))
# "The Eiffel Tower was completed in 1889 for the World's Fair [1]."
```

<div class="callout tip">
<div class="callout-title">Key Elements</div>

1. Explicit grounding instruction, 2. Source citation format, 3. Fallback for missing info

</div>

---

# Production Challenges 


<div class="columns">
<div class="column">

**Performance Challenges:**
- **Cost**: Embedding generation + storage + inference
- **Latency**: Retrieval adds 50-200ms
- **Context limits**: LLM window size
- **Quality**: Retrieval accuracy
- **Freshness**: Keeping index up-to-date

</div>
<div class="column">

**Solutions:**
- Cache embeddings
- Semantic caching (similar queries)
- Incremental indexing
- Re-ranking pipelines
- Efficient embedding models
- Hybrid search
- Streaming responses

</div>
</div>

<div class="callout warning">
<div class="callout-title">Production Tip</div>

Start simple (Naive RAG), measure performance, iterate based on real bottlenecks!

</div>


---

# Evaluation Metrics for RAG 


**How to measure RAG quality:**

**Retrieval Quality:**
- **Recall@k**: Are relevant docs in top-k?
- **MRR (Mean Reciprocal Rank)**: Where is first relevant doc?
- **NDCG (Normalized Discounted Cumulative Gain)**: Ranked quality

**Generation Quality:**
- **Factual accuracy**: Are answers correct?
- **Faithfulness**: Does answer match retrieved docs?
- **Relevance**: Does answer address the question?
- **Citation quality**: Are sources correctly attributed?

**End-to-End:**
- **Answer correctness**: Human evaluation or LLM-as-judge
- **Groundedness**: Verifiable in retrieved docs
- **User satisfaction**: Thumbs up/down, A/B testing


---

# Common RAG Failure Modes 


1. **Retrieval Failures**
 - Wrong documents retrieved
- Relevant docs not in knowledge base
- Poor query formulation
2. **Context Problems**
 - Too much irrelevant context
- Context too long for LLM
- Important info not in retrieved chunks
3. **Generation Issues**
 - Ignores retrieved context
- Hallucinates despite good context
- Incorrect citations
- Overly dependent on parametric knowledge
4. **System Issues**
 - High latency
- Embedding drift
- Stale index

**Mitigation:** Monitoring, A/B testing, human-in-the-loop validation

---

# Multimodal RAG 


**Beyond text: Retrieving images, tables, code, etc.**

- **Vision + Text**
 
- Use CLIP embeddings for images
- Retrieve relevant diagrams, charts
- Generate answers referencing visual content

 \item **Code Retrieval**
 - Embed code snippets
- Retrieve relevant functions/examples
- Code completion and debugging

 \item **Structured Data**
 - Tables, databases
- Knowledge graphs
- SQL generation from natural language

 \item **Audio/Video**
 - Transcribe and embed
- Retrieve relevant segments
- Timestamp-aware responses

Future RAG systems will seamlessly integrate multiple modalities!


---

# Graph-Based RAG 


**Combining knowledge graphs with RAG:**

**Traditional RAG:** Flat document chunks

**Graph RAG:** Documents + relationships

**Advantages:**
- Capture entity relationships
- Multi-hop reasoning (A → B → C)
- Better for complex queries
- Explicit knowledge structure

**Implementation:**
1. Extract entities and relations from documents
2. Build knowledge graph
3. Traverse graph during retrieval
4. Combine graph paths with document chunks

**Tools:** Neo4j, Amazon Neptune, LangChain Graph QA

---

# HyDE: Hypothetical Document Embeddings 

**Clever trick: Generate a hypothetical answer first, then retrieve!**

```python
# Standard RAG: Query -> Retrieve -> Generate
query = "What causes the aurora borealis?"
# Direct embedding may not match scientific docs well

# HyDE: Query -> Generate Hypothesis -> Embed Hypothesis -> Retrieve -> Generate
hypothesis = llm.generate(f"Write a short explanation: {query}")
# "The aurora borealis occurs when charged particles from the sun
# interact with gases in Earth's atmosphere, causing them to glow."

# Now embed the HYPOTHESIS (an answer-like text)
hypo_embedding = embed(hypothesis)
docs = vector_db.search(hypo_embedding) # Better match to scientific docs!

# Finally generate with real retrieved docs
final_answer = llm.generate(query, context=docs)
```

<div class="callout info">
<div class="callout-title">Why It Works</div>

**Question:** "aurora borealis causes" (query-like)
**Hypothesis:** "charged particles from sun interact with atmosphere" (document-like)

Answers are more similar to documents than questions are!

</div>

*Reference: Gao et al. (2022) - "Precise Zero-Shot Dense Retrieval without Relevance Labels"*

---

# RAG vs Fine-Tuning 



When should you use RAG vs fine-tuning your model?

<div class="columns">
<div class="column">

**Use RAG when:**
- Knowledge changes frequently
- Need citations/provenance
- Privacy concerns (data in DB, not weights)
- Large knowledge base
- Multi-domain applications
- Want to update without retraining

</div>
<div class="column">

**Use Fine-Tuning when:**
- Need specific style/behavior
- Low latency critical
- Small, stable knowledge domain
- Specialized reasoning
- Domain-specific language
- Want fully self-contained model

</div>
</div>

<div class="callout warning">
<div class="callout-title">Best Practice</div>

Often the answer is **both**: Fine-tune for style/domain, RAG for knowledge!

</div>


---

# Future of RAG 


**Emerging trends and research directions:**

1. **Agentic RAG**
 - LLM decides retrieval strategy
- Multi-step reasoning with retrieval
- Tool use (web search, APIs, databases)
2. **Long-context RAG**
 - Models with 1M+ token windows
- Entire books as context
- Retrieval still useful for efficiency
3. **Personalized RAG**
 - User-specific knowledge bases
- Privacy-preserving retrieval
- Federated learning
4. **Real-time RAG**
 - Live web scraping
- Streaming document updates
- Event-driven retrieval


---

# Key Takeaways 


1. **RAG solves fundamental LLM limitations**
 - Knowledge cutoff, hallucination, no citations
2. **Core pipeline: Retrieve → Augment → Generate**
 - Vector search for relevant documents
- Incorporate into prompt
3. **Many variants exist**
 - Naive RAG → Self-RAG → Corrective RAG → Agentic RAG
4. **Key components matter**
 - Chunking strategy, embedding model, vector DB
5. **Production requires careful engineering**
 - Latency, cost, quality evaluation
6. **RAG + Fine-tuning is powerful combo**
 - Fine-tune for style, RAG for knowledge


---

# Readings 


**Required:**
1. **Lewis et al. (2020)**: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
 [[arXiv]](https://arxiv.org/abs/2005.11401)
2. **Asai et al. (2023)**: Self-RAG: Learning to Retrieve, Generate, and Critique
 [[arXiv]](https://arxiv.org/abs/2310.11511)

**Recommended:**
- Yan et al. (2024): Corrective RAG [[arXiv]](https://arxiv.org/abs/2401.15884)
- Gao et al. (2022): Precise Zero-Shot Dense Retrieval (HyDE) [[arXiv]](https://arxiv.org/abs/2212.10496)
- HuggingFace RAG Tutorial [[Tutorial]](https://huggingface.co/learn/cookbook/advanced_rag)
- LangChain RAG Docs [[Docs]](https://python.langchain.com/docs/use_cases/question_answering/)


---


Questions? 

Next: Mixture of Experts!

