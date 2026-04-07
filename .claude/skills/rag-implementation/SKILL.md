---
name: rag-implementation
description: "RAG implementation: vector DB, semantic search, document Q&A."
---

# RAG Implementation

Master Retrieval-Augmented Generation (RAG) to build LLM applications that provide accurate, grounded responses using external knowledge sources.

## When to Use This Skill

- Building Q&A systems over proprietary documents
- Creating chatbots with current, factual information
- Implementing semantic search with natural language queries
- Reducing hallucinations with grounded responses
- Enabling LLMs to access domain-specific knowledge
- Building documentation assistants
- Creating research tools with source citation

## Core Components

### 1. Vector Databases

**Purpose**: Store and retrieve document embeddings efficiently

**Options:**
- **Qdrant**: Fast, filtered search (ZNAI uses this)
- **Pinecone**: Managed, scalable, fast queries
- **Weaviate**: Open-source, hybrid search
- **Milvus**: High performance, on-premise
- **Chroma**: Lightweight, easy to use
- **FAISS**: Meta's library, local deployment

### 2. Embeddings

**Purpose**: Convert text to numerical vectors for similarity search

**Models:**
- **BGE-M3** (BAAI): Multilingual, strong performance (ZNAI uses this via HF TEI)
- **text-embedding-ada-002** (OpenAI): General purpose, 1536 dims
- **e5-large-v2**: High quality, multilingual
- **bge-large-en-v1.5**: SOTA performance

### 3. Retrieval Strategies

- **Dense Retrieval**: Semantic similarity via embeddings
- **Sparse Retrieval**: Keyword matching (BM25, TF-IDF)
- **Hybrid Search**: Combine dense + sparse
- **Multi-Query**: Generate multiple query variations
- **HyDE**: Generate hypothetical documents

### 4. Reranking

- **Cross-Encoders**: BERT-based reranking
- **Maximal Marginal Relevance (MMR)**: Diversity + relevance
- **LLM-based**: Use LLM to score relevance

## Document Chunking Strategies

### Recursive Character Text Splitter
```python
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", " ", ""]
)
```

### Semantic Chunking
```python
splitter = SemanticChunker(
    embeddings=embeddings,
    breakpoint_threshold_type="percentile"
)
```

### Markdown Header Splitter
```python
headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
```

## Retrieval Optimization

### 1. Metadata Filtering
```python
results = vectorstore.similarity_search(
    "query",
    filter={"category": "technical"},
    k=5
)
```

### 2. Maximal Marginal Relevance
```python
results = vectorstore.max_marginal_relevance_search(
    "query",
    k=5,
    fetch_k=20,
    lambda_mult=0.5  # 0=max diversity, 1=max relevance
)
```

### 3. Reranking with Cross-Encoder
```python
reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
candidates = vectorstore.similarity_search("query", k=20)
pairs = [[query, doc.page_content] for doc in candidates]
scores = reranker.predict(pairs)
reranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)[:5]
```

## Prompt Engineering for RAG

### Contextual Prompt
```
Use the following context to answer the question.
If you cannot answer based on the context, say "I don't have enough information."

Context:
{context}

Question: {question}
```

### With Citations
```
Answer the question based on the context below.
Include citations using [1], [2], etc.

Context:
{context}

Question: {question}
```

## Best Practices

1. **Chunk Size**: Balance between context and specificity (500-1000 tokens)
2. **Overlap**: Use 10-20% overlap to preserve context at boundaries
3. **Metadata**: Include source, page, timestamp for filtering
4. **Hybrid Search**: Combine semantic and keyword search
5. **Reranking**: Improve top results with cross-encoder
6. **Citations**: Always return source documents for transparency
7. **Evaluation**: Continuously test retrieval quality
8. **Monitoring**: Track retrieval metrics in production

## Common Issues

- **Poor Retrieval**: Check embedding quality, chunk size, query formulation
- **Irrelevant Results**: Add metadata filtering, use hybrid search, rerank
- **Missing Information**: Ensure documents are properly indexed
- **Slow Queries**: Optimize vector store, use caching, reduce k
- **Hallucinations**: Improve grounding prompt, add verification step

## ZNAI Stack

| Component | Technology |
|-----------|-----------|
| Vector DB | Qdrant |
| Embeddings | BGE-M3 via HF TEI |
| LLM | Qwen 2.5 via vLLM |
| Chunking | Markdown-aware |
| Storage | PostgreSQL (metadata) + Qdrant (vectors) |
