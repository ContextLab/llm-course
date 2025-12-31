---
marp: true
theme: cdl-theme
paginate: true
header: 'PSYC 51.07: Models of Language and Communication'
footer: 'Week 9'
---

<!-- _class: lead -->

# Lecture 21: Retrieval Augmented Generation
## Grounding LLMs in External Knowledge 🔍

**PSYC 51.07: Models of Language and Communication**

Week 9

---

# Today's Journey 🗺️

<!-- TODO: Add manual table of contents or navigation -->


---

# The Limits of Parametric Memory 🧠



What are the fundamental limitations of storing knowledge in model parameters?

**Problems with purely parametric models:**
- ❌ **Knowledge cutoff**: No information after training date
- ❌ **Hallucinations**: Models confidently generate false information
- ❌ **No source attribution**: Can't cite where information comes from
- ❌ **Expensive updates**: Retraining for new information costs millions
- ❌ **Privacy concerns**: Sensitive data baked into parameters
- ❌ **Domain specificity**: Limited knowledge of specialized domains
- ❌ **Outdated facts**: World changes but model weights don't

**Solution:** Combine parametric knowledge with non-parametric retrieval! 🔍

---

# Example: Knowledge Cutoff Problem 📅


<div class="callout info">
<div class="callout-title">User Query (Dec 2024)</div>

"Who won the 2024 US Presidential election?"

</div>

<div class="columns">
<div class="column">

**Parametric-only LLM:**

{❌} "I apologize, but my knowledge was last updated in April 2023, so I cannot tell you about the 2024 election results."

Or worse: Hallucinates an answer!

</div>
<div class="column">

**RAG-enhanced LLM:**

{✅} "According to CNN (retrieved Nov 6, 2024), [actual winner] won the 2024 US Presidential election with [details]."

Provides: Fresh info + source!

</div>
</div>

<div class="callout warning">
<div class="callout-title">Key Insight</div>

Retrieval provides a **dynamic, updatable** knowledge base without retraining!

</div>


---

# Retrieval Augmented Generation: Definition 📚


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

# RAG Architecture 🏗️



```
User Query "What is RAG?" -> Embedding Model -> Vector Database (Embeddin -> Retrieved Documents -> Similarity Search -> Augmented Prompt -> LLM Generation -> Grounded Response
```

**Key Steps:**
1. Embed user query into vector space
2. Search vector database for similar documents
3. Retrieve top-k most relevant documents
4. Augment prompt with retrieved context
5. Generate answer using LLM with context


---

# RAG Components Deep Dive 🔬


**1. Document Processing & Indexing**
- **Chunking**: Break documents into manageable pieces
    
- Fixed size (e.g., 512 tokens)
- Semantic (paragraph, section breaks)
- Recursive (hierarchical splitting)

    \item **Metadata**: Extract titles, dates, sources
    \item **Embedding**: Convert chunks to dense vectors

**2. Vector Database**
- Store embeddings for fast similarity search
- Popular options: FAISS, ChromaDB, Pinecone, Weaviate, Qdrant
- Indexing methods: IVF, HNSW, PQ
- Approximate nearest neighbor (ANN) search

**3. Retrieval**
- Embed query with same model as documents
- Compute similarity (cosine, dot product)
- Return top-k most similar chunks (typically k=3-10)


---

# RAG Implementation Example 💻


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
    search_kwargs={"k": 3}  # Retrieve top 3 chunks
)
```


---

# RAG Implementation (cont.) 💻


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
    chain_type="stuff"  # How to combine documents
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

# Evolution of RAG Approaches 📈



```
**Naive RAG -> \textbf{Self-RAG -> \textbf{Corrective RAG
```

\end{center**

<div class="callout warning">
<div class="callout-title">Trend</div>

Moving from always-retrieve to **adaptive**, **self-correcting** retrieval systems!

</div>


---

# Self-RAG: Adaptive Retrieval 🎯


<div class="columns">
<div class="column">

**Key Innovation:**

Model learns to decide:
1. **When** to retrieve
2. **What** is relevant
3. **How** to use it
4. **Whether** output is good

**Special Tokens:**
- [Retrieve]: Need info?
- [Relevant]: Is doc useful?
- [Support]: Does doc support answer?
- [Useful]: Is answer helpful?

</div>
<div class="column">

**Example:**

`Q: What's 2+2?`\\
{[Retrieve: No]}\\
`A: 4`

`Q: Who won the 2024 Olympics?`\\
{[Retrieve: Yes]}\\
{[Retrieved: Paris 2024 results]}\\
{[Relevant: Yes]}\\
`A: [Generated with docs]`\\
{[Support: Fully supported]}\\
{[Useful: Yes]}

</div>
</div>

*Reference: Asai et al. (2023) - "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection"*

---

# Corrective RAG (CRAG) 🔧


**Problem:** Sometimes retrieved documents are irrelevant or misleading!

**Solution: Evaluate and correct retrieval**

1. **Retrieve** initial documents
2. **Evaluate** relevance with a critic model
3. **Decision:**
    - If correct: Use as-is
- If ambiguous: Filter and refine
- If incorrect: Re-retrieve with expanded query or use web search
4. **Generate** with best available context

**Knowledge Refinement:**
- Extract key sentences
- Remove redundancy
- Rerank by relevance
- Decompose complex queries

*Reference: Yan et al. (2024) - "Corrective Retrieval Augmented Generation"*

---

# Comparing RAG Approaches 📊



| p{2.5cm} p{3cm}} Approach | When Retrieve | Filtering | Best For |
| --- | --- | --- | --- |
| \addlinespace Self-RAG | Model decides | Self-reflection | Adaptive needs |
| \addlinespace Corrective RAG | Always | Relevance scoring | High precision |
| \addlinespace HyDE | On hypothesis | Similarity | Complex reasoning |
| \addlinespace Agentic RAG | Tool-based | Multi-step | Complex workflows |

**Trade-offs:** Simplicity vs. Performance vs. Latency vs. Cost

What's right for your application?


---

# Chunking Strategies 📄


**How to split documents matters!**

1. **Fixed-size chunking**
    - Split every N tokens/characters
- ✅ Simple, predictable size
- ❌ May break semantic units
2. **Recursive chunking**
    - Try paragraphs, then sentences, then tokens
- ✅ Respects document structure
- ✅ More semantic coherence
3. **Semantic chunking**
    - Use embedding similarity to find boundaries
- ✅ Best semantic coherence
- ❌ More computation
4. **Hierarchical chunking**
    - Parent-child relationships (sections → paragraphs)
- ✅ Retrieve at multiple granularities
- ✅ Better context


---

# Embedding Models for Retrieval 🎯


**Dense Retrieval Models:**

| BGE-large-en | 1024 | 1.3GB | High quality |
| --- | --- | --- | --- |
| E5-large-v2 | 1024 | 1.3GB | Versatile |
| OpenAI text-embedding-3 | 1536 | API | Proprietary, excellent |

**Sparse Retrieval (Traditional IR):**
- **BM25**: TF-IDF-like, keyword matching
- **TF-IDF**: Term frequency weighting
- ✅ Interpretable, fast
- ❌ Misses semantic similarity

**Hybrid Retrieval:**
- Combine dense + sparse
- Best of both worlds: semantic + keyword
- Weighted combination or reranking


---

# Vector Databases 🗄️


**Purpose:** Fast similarity search over millions of embeddings

**Popular Options:**

<div class="columns">
<div class="column">

**Open Source:**
- **FAISS** (Meta)
    
- Extremely fast
- Library, not database

    \item **ChromaDB**
    - Easy to use
- Embedded or server

    \item **Weaviate**
    - Full-featured
- GraphQL interface

</div>
<div class="column">

**Managed Services:**
- **Pinecone**
    
- Fully managed
- Production-ready

    \item **Qdrant**
    - Rust-based, fast
- Cloud or self-hosted

    \item **Milvus**
    - Enterprise-grade
- Highly scalable

</div>
</div>

**Key Features to Consider:**
- Indexing speed, query latency, scalability
- Filtering (by metadata)
- Update capability, persistence


---

# Prompt Engineering for RAG 📝


**How to incorporate retrieved context into prompts:**

<div class="callout info">
<div class="callout-title">Template Example</div>

`You are a helpful assistant. Answer the question based on the context below.`

`Context:`\\
`[Document 1 text]`\\
`[Document 2 text]`\\
`[Document 3 text]`

`Question: [User's question]`

`Instructions:`
- `- Answer based on the context`
- `- Cite sources`
- `- If info not in context, say "I don't know"`

`Answer:`

</div>

**Best Practices:**
- Clear instructions to use provided context
- Explicit grounding requirements
- Request citations
- Discourage hallucination


---

# Production Challenges 🏭


<div class="columns">
<div class="column">

**Performance Challenges:**
- 💰 **Cost**: Embedding generation + storage + inference
- ⚡ **Latency**: Retrieval adds 50-200ms
- 📏 **Context limits**: LLM window size
- 🎯 **Quality**: Retrieval accuracy
- 🔄 **Freshness**: Keeping index up-to-date

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

# Evaluation Metrics for RAG 📊


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

# Common RAG Failure Modes ⚠️


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

# Multimodal RAG 🖼️📄


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

# Graph-Based RAG 🕸️


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

# HyDE: Hypothetical Document Embeddings 💭


**Clever trick: Generate a hypothetical answer first!**

<div class="callout info">
<div class="callout-title">HyDE Algorithm</div>

1. User asks question
2. LLM generates hypothetical answer (may be wrong!)
3. Embed the *hypothetical answer*
4. Retrieve documents similar to hypothetical answer
5. Generate real answer using retrieved docs

</div>

**Why this works:**
- Answers are more similar to answers than questions to answers
- Bridges semantic gap between query and documents
- Effective for complex queries

*Reference: Gao et al. (2022) - "Precise Zero-Shot Dense Retrieval without Relevance Labels"*

---

# RAG vs Fine-Tuning 🤔



When should you use RAG vs fine-tuning your model?

<div class="columns">
<div class="column">

**Use RAG when:**
- ✅ Knowledge changes frequently
- ✅ Need citations/provenance
- ✅ Privacy concerns (data in DB, not weights)
- ✅ Large knowledge base
- ✅ Multi-domain applications
- ✅ Want to update without retraining

</div>
<div class="column">

**Use Fine-Tuning when:**
- ✅ Need specific style/behavior
- ✅ Low latency critical
- ✅ Small, stable knowledge domain
- ✅ Specialized reasoning
- ✅ Domain-specific language
- ✅ Want fully self-contained model

</div>
</div>

<div class="callout warning">
<div class="callout-title">Best Practice</div>

Often the answer is **both**: Fine-tune for style/domain, RAG for knowledge!

</div>


---

# Future of RAG 🔮


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

# Key Takeaways 🔑


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

# Readings 📖


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


Questions? 💬

Next: Mixture of Experts!

