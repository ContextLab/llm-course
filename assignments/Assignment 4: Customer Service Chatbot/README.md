# Assignment 4: Context-Aware Customer Service Chatbot

**Timeline: 1 Week**

## Overview

In this assignment, you will build a sophisticated, context-aware customer service chatbot that uses modern transformer models and retrieval-augmented generation (RAG) techniques. Unlike traditional rule-based chatbots, your system will leverage semantic understanding to match customer queries with relevant knowledge base entries and generate contextually appropriate responses.

This is a **1-week assignment** designed to be achievable with GenAI assistance (ChatGPT, Claude, GitHub Copilot). You can focus on system design, integration, and evaluation rather than getting bogged down in low-level implementation details.

You will implement a complete RAG pipeline that:
- Uses transformer-based encoders (BERT or similar) to understand customer queries semantically
- Performs efficient semantic search over a knowledge base using vector similarity
- Retrieves relevant context to ground responses in factual information
- Handles multi-turn conversations while maintaining context
- Compares your approach against simpler keyword-matching baselines

This assignment simulates a real-world application where customers need accurate, context-aware assistance, and where hallucinated or incorrect information could damage user trust.

## Learning Objectives

By completing this assignment, you will develop the following skills:

1. **Semantic Understanding**: Apply transformer-based models (BERT, Sentence-BERT) to encode text into meaningful vector representations
2. **Information Retrieval**: Implement efficient semantic search using vector similarity and libraries like FAISS
3. **Retrieval-Augmented Generation (RAG)**: Combine retrieval and generation to produce grounded, factual responses
4. **Evaluation Design**: Develop metrics to assess chatbot quality, including retrieval accuracy and response relevance
5. **System Architecture**: Design and implement a complete end-to-end conversational AI system
6. **Baseline Comparison**: Understand the importance of baselines by comparing against keyword-matching approaches
7. **Production Considerations**: Handle edge cases, multi-turn conversations, and system scalability

## Background

### Context-Aware Language Understanding

Traditional customer service systems often rely on keyword matching or simple pattern recognition (like your Assignment 1 ELIZA chatbot). However, customers express the same need in many different ways:
- "I can't log into my account"
- "My password isn't working"
- "I'm having authentication issues"
- "The login page keeps rejecting my credentials"

Transformer-based models like BERT can understand that these queries are semantically similar, even when they share few keywords. This is achieved through:

1. **Contextualized Embeddings**: BERT produces vector representations where semantically similar text has similar vectors
2. **Semantic Similarity**: Using cosine similarity or other distance metrics to find relevant knowledge base entries
3. **Dense Retrieval**: Unlike sparse keyword methods (TF-IDF, BM25), dense vector representations capture deeper semantic meaning

### Retrieval-Augmented Generation (RAG)

RAG systems combine the strengths of retrieval (finding relevant information) and generation (producing natural language). The typical pipeline:

1. **Encode**: Convert the user query into a vector representation
2. **Retrieve**: Find the most similar entries in your knowledge base
3. **Augment**: Include retrieved context with the query
4. **Generate**: Produce a response grounded in the retrieved information

This approach helps prevent hallucination and ensures responses are factually grounded in your knowledge base.

### Key Papers and Concepts

- **BERT** (Devlin et al., 2018): Bidirectional encoder representations from transformers
- **Sentence-BERT** (Reimers & Gurevych, 2019): Modified BERT for efficient sentence embeddings
- **RAG** (Lewis et al., 2020): Retrieval-augmented generation for knowledge-intensive tasks
- **Dense Passage Retrieval** (Karpukhin et al., 2020): Using dense representations for passage retrieval

## Dataset

You will use a customer service FAQ dataset. We recommend one of the following options:

### Option 1: HuggingFace Dataset (Recommended)

Use the `customer_support_twitter` dataset or similar customer service datasets from HuggingFace:

```python
from datasets import load_dataset

# Load customer support conversations
dataset = load_dataset("salesken/customer_support_twitter")
```

Alternatively, explore these datasets:
- `salesken/customer_support_twitter`: Real customer support conversations
- `banking77`: Banking customer service intents
- `SetFit/customer_support`: Multi-domain customer support dataset

### Option 2: Create Your Own Knowledge Base

You can create a synthetic knowledge base for a specific domain (e-commerce, banking, tech support, etc.):

```python
knowledge_base = [
    {
        "question": "How do I reset my password?",
        "answer": "To reset your password, click 'Forgot Password' on the login page. Enter your email address, and we'll send you a reset link. Follow the link to create a new password.",
        "category": "account_access"
    },
    {
        "question": "What is your return policy?",
        "answer": "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Refunds are processed within 5-7 business days.",
        "category": "returns"
    },
    # Add 100+ entries for a meaningful knowledge base
]
```

### Option 3: Web Scraping

Scrape FAQs from public customer support pages (ensure compliance with terms of service):

```python
# Example: Parse FAQ pages from a website
import requests
from bs4 import BeautifulSoup

# Your scraping code here
```

**Requirements**:
- Minimum 100 FAQ entries for meaningful evaluation
- Diverse topics/categories (at least 5-10 categories)
- Both simple and complex queries
- Include some ambiguous questions that require context

## Your Tasks

### 1. Build a Semantic Search System

Implement a semantic search system that can find relevant FAQ entries given a customer query.

**Requirements**:

a) **Encode the Knowledge Base**:
   - Use a pre-trained sentence transformer model (e.g., `sentence-transformers/all-MiniLM-L6-v2`)
   - Generate embeddings for all FAQ questions/answers
   - Store embeddings for efficient retrieval

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
# Your code here
```

b) **Implement Efficient Search**:
   - Use FAISS or similar library for fast similarity search
   - Implement both cosine similarity and L2 distance metrics
   - Support retrieving top-k results

```python
import faiss
import numpy as np

# Build FAISS index
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)
```

c) **Query Processing**:
   - Encode incoming queries using the same model
   - Retrieve top-k most similar FAQ entries
   - Return results with similarity scores

### 2. Implement a Baseline (Keyword Matching)

Create a simple baseline using traditional keyword matching to demonstrate the value of semantic search.

**Requirements**:
- Implement TF-IDF with cosine similarity OR BM25
- Use the same knowledge base
- Compare retrieval quality against your semantic approach

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Your baseline implementation
```

### 3. Build the Retrieval Mechanism

Develop a complete retrieval system that:

a) **Handles Query Variations**:
   - Test with paraphrased queries
   - Handle typos and misspellings (optional: add spelling correction)
   - Support queries of varying length

b) **Context Filtering**:
   - Implement category-based filtering (if applicable)
   - Use confidence thresholds to reject low-quality matches
   - Handle "no good match" scenarios gracefully

c) **Re-ranking** (Advanced):
   - Optionally implement a re-ranking step using cross-encoders
   - This can improve retrieval quality for ambiguous queries

### 4. Generate Contextual Responses

Use the retrieved context to generate helpful responses.

**Requirements**:

a) **Template-Based Generation** (Minimum):
   - Use retrieved FAQ answers directly
   - Format responses naturally
   - Include confidence indicators

b) **LLM-Based Generation** (Recommended):
   - Use a lightweight LLM (via Ollama, HuggingFace, or OpenAI API)
   - Provide retrieved context in the prompt
   - Generate natural, conversational responses

```python
# Example prompt structure
def generate_response(query, retrieved_contexts):
    prompt = f"""You are a helpful customer service assistant.

Customer Question: {query}

Relevant Information:
{retrieved_contexts}

Provide a helpful, accurate response based on the information above.
Do not make up information not present in the context."""

    # Call your LLM here
    return response
```

c) **Response Quality**:
   - Ensure responses are grounded in retrieved context
   - Handle cases where no good match exists
   - Provide clear, actionable information

### 5. Handle Multi-Turn Conversations

Extend your system to maintain context across multiple conversation turns.

**Requirements**:

a) **Conversation State**:
   - Track conversation history
   - Maintain context from previous turns
   - Update query encoding with conversation context

b) **Context Integration**:
   - Combine current query with relevant prior context
   - Implement conversation summarization for long dialogues
   - Handle follow-up questions ("What about shipping?", "How long does that take?")

c) **Example Multi-Turn Flow**:
```
User: "I want to return an item"
Bot: "Our return policy allows returns within 30 days..."

User: "How do I start the process?"
Bot: [Uses context that this is about returns]

User: "What about shipping costs?"
Bot: [Understands this relates to return shipping]
```

### 6. Evaluate Response Quality

Develop comprehensive evaluation metrics for your system.

**Required Metrics**:

a) **Retrieval Metrics**:
   - **Precision@k**: Of the k retrieved documents, how many are relevant?
   - **Recall@k**: Of all relevant documents, how many are in top-k?
   - **MRR (Mean Reciprocal Rank)**: Position of first relevant result
   - Create a test set with ground-truth relevant FAQs for queries

b) **Response Quality**:
   - **Semantic Similarity**: Compare generated response to ground truth
   - **Factual Grounding**: Verify responses don't hallucinate information
   - **Human Evaluation**: Test on sample queries and manually assess quality

c) **Baseline Comparison**:
   - Compare semantic search vs. keyword matching on all metrics
   - Use statistical tests to determine significance
   - Visualize results with charts/graphs

d) **Error Analysis**:
   - Identify failure modes (when does the system fail?)
   - Categorize errors (retrieval failures vs. generation issues)
   - Provide examples of good and bad responses

### 7. Advanced Features (Optional Bonus)

Implement one or more of these for extra credit:

- **Hybrid Search**: Combine semantic and keyword search for better results
- **Cross-Encoder Re-ranking**: Use a cross-encoder model to re-rank retrieved results
- **Query Expansion**: Expand queries with synonyms or related terms
- **Active Learning**: Identify uncertain cases for human review
- **Multimodal Support**: Handle queries about images or documents
- **Intent Classification**: Classify query intent before retrieval
- **Conversation Analytics**: Track common issues and query patterns

## Technical Requirements

### Required Libraries

```python
# Core ML/NLP
transformers>=4.30.0
sentence-transformers>=2.2.0
torch>=2.0.0

# Vector Search
faiss-cpu>=1.7.4  # or faiss-gpu for GPU support

# Traditional IR (baseline)
scikit-learn>=1.3.0
rank-bm25>=0.2.2

# Data Handling
datasets>=2.14.0
pandas>=2.0.0
numpy>=1.24.0

# Visualization
matplotlib>=3.7.0
seaborn>=0.12.0
plotly>=5.14.0

# Optional: LLM Integration
openai>=0.27.0  # if using OpenAI
# or use Ollama for local LLMs
```

### Recommended Models

**Sentence Encoders** (choose one or compare multiple):
- `sentence-transformers/all-MiniLM-L6-v2` (fast, good quality)
- `sentence-transformers/all-mpnet-base-v2` (higher quality)
- `BAAI/bge-small-en-v1.5` (state-of-the-art for retrieval)
- `intfloat/e5-small-v2` (efficient, strong performance)

**Cross-Encoders** (for re-ranking):
- `cross-encoder/ms-marco-MiniLM-L-6-v2`

**Generation Models** (optional):
- Local: Llama 3 8B via Ollama
- API: OpenAI GPT-3.5-turbo or GPT-4
- HuggingFace: Flan-T5, GPT-2, or similar

### Computational Requirements

- **CPU**: Sufficient for most encoder models with FAISS
- **GPU**: Recommended for faster embedding generation with larger models
- **Memory**: 8GB+ RAM recommended
- **Storage**: ~2GB for models and data

The entire assignment should run in **Google Colaboratory** with a free tier GPU and is designed to be completable in **1 week** with GenAI assistance.

## Deliverables

Submit a **Google Colaboratory notebook** that includes:

### 1. Code Implementation (60%)

- Complete, runnable code for all required components
- Clear code organization with functions/classes
- Proper error handling and edge case management
- Comments explaining key design decisions

### 2. Documentation (20%)

- **Markdown cells** explaining your approach for each section
- System architecture diagram or description
- Model selection justification
- Design decisions and trade-offs

### 3. Evaluation and Analysis (15%)

- Comprehensive evaluation metrics implementation
- Baseline comparison with statistical analysis
- Visualizations (charts, confusion matrices, example outputs)
- Error analysis with specific examples

### 4. Examples and Demo (5%)

- At least 10 example queries with system responses
- Include both successful and failure cases
- Demo of multi-turn conversation (at least 3 turns)
- Comparison of semantic vs. keyword baseline on same queries

### Required Sections in Notebook

1. **Introduction**: Overview of your system
2. **Data Loading**: Load and explore the knowledge base
3. **Semantic Search Implementation**: Encoder model and FAISS
4. **Baseline Implementation**: TF-IDF or BM25
5. **Response Generation**: Template or LLM-based
6. **Multi-Turn Handling**: Conversation state management
7. **Evaluation**: Metrics, comparisons, and analysis
8. **Examples**: Interactive demos
9. **Conclusion**: Findings, limitations, future improvements

## Evaluation Criteria

Your assignment will be graded on the following criteria:

### Technical Implementation (40 points)

- **Semantic Search** (15 pts): Correct implementation of encoder + FAISS
- **Baseline** (5 pts): Working keyword-matching baseline
- **Response Generation** (10 pts): Quality and grounding of responses
- **Multi-Turn** (10 pts): Effective conversation context handling

### Evaluation and Analysis (25 points)

- **Metrics** (10 pts): Proper implementation of retrieval and quality metrics
- **Comparison** (10 pts): Thorough baseline comparison with statistics
- **Error Analysis** (5 pts): Insightful analysis of failure modes

### Code Quality and Documentation (20 points)

- **Code Organization** (10 pts): Clean, modular, well-commented code
- **Documentation** (10 pts): Clear markdown explanations throughout

### Examples and Presentation (10 points)

- **Quality Examples** (5 pts): Diverse, illustrative examples
- **Demo** (5 pts): Working interactive demonstration

### Creativity and Innovation (5 points)

- **Advanced Features** (3 pts): Implementation of optional features
- **Novel Insights** (2 pts): Unique observations or improvements

**Total: 100 points**

### Grading Rubric

- **A (90-100)**: Exceptional implementation with advanced features, thorough evaluation, and clear documentation
- **B (80-89)**: Complete implementation of all required components with good evaluation
- **C (70-79)**: Working system with basic evaluation and some documentation gaps
- **D (60-69)**: Partial implementation with significant gaps
- **F (<60)**: Incomplete or non-functional submission

## Tips for Success

### Getting Started (1-Week Timeline)

1. **Start Simple**: Begin with a small knowledge base (20-30 FAQs) to test your pipeline
2. **Incremental Development**: Build and test each component separately before integration
3. **Use Examples**: Work through concrete examples at each step
4. **Validate Early**: Check that embeddings and retrieval make sense before moving to generation
5. **Leverage GenAI**: Use ChatGPT, Claude, or GitHub Copilot to accelerate implementation. Ask for help understanding libraries, debugging errors, and optimizing code.

### Common Pitfalls to Avoid

1. **Ignoring Normalization**: Normalize embeddings for cosine similarity
2. **Wrong Distance Metric**: FAISS L2 distance requires normalized vectors for cosine similarity, or use IndexFlatIP
3. **Memory Issues**: Batch embedding generation for large knowledge bases
4. **Overfitting to Examples**: Test on diverse, unseen queries
5. **Hallucination**: Always ground responses in retrieved context
6. **Ignoring Edge Cases**: Handle no-match scenarios gracefully

### Debugging Strategies

1. **Print Similarities**: Inspect actual similarity scores to understand retrieval
2. **Manual Inspection**: Look at retrieved documents for sample queries
3. **Embedding Visualization**: Use t-SNE/UMAP to visualize embedding space
4. **Start Small**: Debug with 10 FAQs before scaling to 100+

### Performance Optimization

1. **Cache Embeddings**: Don't re-encode the knowledge base every time
2. **Batch Processing**: Encode multiple queries at once
3. **FAISS GPU**: Use GPU-accelerated FAISS for large knowledge bases
4. **Model Selection**: Balance model size with quality needs

### Going Beyond Requirements

- Implement A/B testing framework to compare different models
- Add conversation analytics dashboard
- Create a web interface using Gradio or Streamlit
- Fine-tune sentence transformers on your domain data
- Implement feedback loops for continuous improvement

## Resources and References

### Key Papers

1. **BERT**: Devlin et al. (2018). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding". [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

2. **Sentence-BERT**: Reimers & Gurevych (2019). "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks". [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

3. **RAG**: Lewis et al. (2020). "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks". [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

4. **Dense Passage Retrieval**: Karpukhin et al. (2020). "Dense Passage Retrieval for Open-Domain Question Answering". [arXiv:2004.04906](https://arxiv.org/abs/2004.04906)

5. **ColBERT**: Khattab & Zaharia (2020). "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT". [arXiv:2004.12832](https://arxiv.org/abs/2004.12832)

### Documentation and Tutorials

- **HuggingFace Transformers**: [https://huggingface.co/docs/transformers/](https://huggingface.co/docs/transformers/)
- **Sentence Transformers**: [https://www.sbert.net/](https://www.sbert.net/)
- **FAISS**: [https://github.com/facebookresearch/faiss/wiki](https://github.com/facebookresearch/faiss/wiki)
- **LangChain** (optional framework): [https://python.langchain.com/](https://python.langchain.com/)

### Code Examples

- **Sentence Transformers Examples**: [https://www.sbert.net/examples/applications/semantic-search/README.html](https://www.sbert.net/examples/applications/semantic-search/README.html)
- **FAISS Tutorial**: [https://github.com/facebookresearch/faiss/wiki/Getting-started](https://github.com/facebookresearch/faiss/wiki/Getting-started)
- **RAG Tutorial**: [https://huggingface.co/docs/transformers/model_doc/rag](https://huggingface.co/docs/transformers/model_doc/rag)

### Datasets

- **HuggingFace Datasets Hub**: [https://huggingface.co/datasets](https://huggingface.co/datasets)
  - Search for: "customer support", "FAQ", "helpdesk"
- **Banking77**: [https://huggingface.co/datasets/banking77](https://huggingface.co/datasets/banking77)
- **MS MARCO** (optional, for retrieval practice): [https://microsoft.github.io/msmarco/](https://microsoft.github.io/msmarco/)

### Tools and Libraries

- **Gradio** (for UI): [https://gradio.app/](https://gradio.app/)
- **Streamlit** (for UI): [https://streamlit.io/](https://streamlit.io/)
- **Weights & Biases** (for experiment tracking): [https://wandb.ai/](https://wandb.ai/)

### Additional Reading

- "Building Chatbots with Python" - Sumit Raj
- "Natural Language Processing with Transformers" - Lewis Tunstall et al.
- "Speech and Language Processing" (Chapter on Question Answering) - Jurafsky & Martin

### Related Techniques

- **Hybrid Search**: Combining dense and sparse retrieval
- **Query Expansion**: Enhancing queries with related terms
- **Pseudo-Relevance Feedback**: Using top results to refine queries
- **Learning to Rank**: ML approaches to re-ranking results

## Submission Guidelines

### GitHub Classroom Submission

This assignment is submitted via **GitHub Classroom**. Follow these steps:

1. **Accept the assignment**: Click the assignment link provided in Canvas or by your instructor
   - Repository: [github.com/ContextLab/customer-service-bot-llm-course](https://github.com/ContextLab/customer-service-bot-llm-course)
   - This creates your own private repository for the assignment

2. **Clone your repository**: 
   ```bash
   git clone https://github.com/ContextLab/customer-service-bot-llm-course-YOUR_USERNAME.git
   ```

3. **Complete your work**: 
   - Work in Google Colab, Jupyter, or your preferred environment
   - Save your notebook to the repository

4. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Complete customer service chatbot assignment"
   git push
   ```

5. **Verify submission**: Check that your latest commit appears in your GitHub repository before the deadline

**Deadline**: February 6, 2026 at 11:59 PM EST

### Notebook Requirements

1. **Runtime**: The notebook must run from start to finish without errors
2. **Permissions**: Ensure the notebook is accessible (include in your GitHub repository)
3. **Dependencies**: All required packages should be installed in the notebook
4. **Data**: Include code to automatically download any required datasets
5. **Output**: Keep cell outputs visible in your submission

### Before Submission Checklist

- [ ] Notebook runs completely in a fresh Colab session
- [ ] All required sections are included with markdown explanations
- [ ] Code is well-commented and organized
- [ ] Evaluation metrics are properly implemented and visualized
- [ ] At least 10 diverse examples are included
- [ ] Multi-turn conversation demo is working
- [ ] Baseline comparison is complete with statistical analysis
- [ ] All visualizations are clear and properly labeled
- [ ] No hardcoded paths (use relative paths or automatic downloads)
- [ ] Cell outputs are visible and meaningful

## Academic Integrity

You are encouraged to:
- Use generative AI tools (ChatGPT, Claude, Copilot) to help write code
- Collaborate with classmates on understanding concepts
- Search for tutorials and examples online
- Ask questions in class or office hours

You must:
- Write your own analysis and explanations
- Understand every line of code you submit
- Cite any significant code you use from external sources
- Submit your own original work

Violations of academic integrity will result in a failing grade for the assignment and potential course-level consequences.

## Questions?

If you have questions about the assignment:
1. Check this README thoroughly
2. Review the resources and references section
3. Post questions in the course forum
4. Attend office hours
5. Email the instructor/TA with specific questions

Good luck, and have fun building your customer service chatbot!

---

*This assignment is designed to give you hands-on experience with modern NLP techniques used in production systems. The skills you develop here—semantic search, RAG, and evaluation—are directly applicable to real-world AI applications.*
