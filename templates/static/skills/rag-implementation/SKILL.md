---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: rag-implementation
description: "RAG implementation: vector stores, retrieval, chunking, and grounded answering."
---

# RAG Implementation

Use this skill when the task involves retrieval-augmented generation, semantic search, or document-grounded answers.

## Core Building Blocks

- vector store or embedding index
- chunking strategy
- retrieval strategy
- reranking or filtering
- grounded prompting with citations

## Storage Options

- PostgreSQL + pgvector when the repository already uses that stack
- managed vector stores such as Pinecone or Weaviate
- local/lightweight options such as FAISS or Chroma

Choose the option that matches the repo’s existing operational model. Do not assume one stack by default.

## Best Practices

- keep metadata for source attribution
- test retrieval quality, not just generation quality
- prefer hybrid or filtered retrieval when exact constraints matter
- return citations or source handles whenever possible
