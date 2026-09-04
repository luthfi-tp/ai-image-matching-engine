# AI Image Understanding & Content Matching

An AI-powered backend that understands images, generates semantic embeddings, and matches images to blog posts based on meaning rather than filenames or simple keywords.

## Overview

The system is designed to:

1. Store an image library.
2. Analyze images using AI vision.
3. Extract structured metadata such as subject, category, attributes, caption, and confidence.
4. Generate semantic embeddings for image metadata.
5. Generate embeddings for blog posts.
6. Compare image and post embeddings using cosine similarity.
7. Apply a mismatch guard using category and similarity threshold.
8. Generate image suggestions for posts.
9. Allow suggestions to be reviewed as accepted or rejected.

The main goal is to avoid unsafe or irrelevant matches. If the system does not find a sufficiently strong match, it returns no match instead of forcing a recommendation.

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pgvector
- Gemini Vision API
- Hugging Face Transformers
- Zod
- Docker

---

## Architecture

```text
Image Dataset
     |
     v
Image Ingestion
     |
     v
Gemini Vision Analysis
     |
     v
Structured Metadata
     |
     v
Zod Validation
     |
     v
Text Embedding
     |
     v
PostgreSQL + pgvector
     |
     +----------------------+
     |                      |
     v                      v
Post Embedding        Image Embeddings
     |                      |
     +----------+-----------+
                |
                v
       Cosine Similarity
                |
                v
        Mismatch Guard
                |
        +-------+-------+
        |               |
      Match          No Match
        |
        v
   Suggestions
        |
        v
     Reviews