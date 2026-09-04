# Build Log

## Phase 1 — Project Setup

- Created the Node.js project using JavaScript.
- Set up Express.js as the backend framework.
- Created the project folder structure.
- Added environment variable configuration using dotenv.
- Added Zod for structured data validation.

## Phase 2 — Database Setup

- Added PostgreSQL using Docker.
- Created the `image_matching` database.
- Created the required database tables.
- Enabled the pgvector PostgreSQL extension.
- Changed vector storage to `vector(384)`.

## Phase 3 — Image Dataset

- Created five image categories:
  - Fox
  - Wolf
  - Dog
  - Bear
  - Deer
- Added 10 images for each category.
- Total dataset: 50 images.
- Created a script to seed image records into PostgreSQL.

## Phase 4 — AI Image Understanding

- Integrated Gemini Vision API.
- Created the image analysis service.
- Generated structured metadata:
  - subject
  - category
  - attributes
  - caption
  - confidence
- Added Zod validation for AI responses.
- Tested the vision pipeline successfully.

### Example AI Output

```json
{
  "subject": "red fox",
  "category": "fox",
  "attributes": [
    "red fur",
    "lying down",
    "grass",
    "wildlife",
    "outdoor"
  ],
  "caption": "A red fox resting in a grassy field.",
  "confidence": 0.98
}

## Phase 5 — Batch Processing

- Created a batch image-processing script.
- Added retry handling for temporary AI failures.
- Added handling for Gemini quota errors.
- Processed 37 of the 50 images.
- The remaining 13 images could not be processed because the Gemini free-tier quota was exhausted.

## Phase 6 — Embeddings

- Installed Hugging Face Transformers.
- Used `Xenova/all-MiniLM-L6-v2`.
- Generated 384-dimensional embeddings.
- Generated embeddings for processed image metadata.
- Generated embeddings for the five blog posts.
- Stored embeddings using PostgreSQL and pgvector.

## Phase 7 — Semantic Matching

- Implemented cosine similarity using pgvector.
- Created the matching service.
- Added a configurable similarity threshold.
- Set the threshold to `0.55`.

## Phase 8 — Mismatch Guard
The matching system checks:

1. Expected post category.
2. Image category.
3. Similarity score.
A candidate is accepted only when the category matches and similarity is at least `0.55`.

This prevents weak or incorrect recommendations.

### Important Test Cases

- Red Fox: `0.8087` → accepted.
- Wolf: `0.7057` → accepted.
- Brown Bear: `0.7004` → accepted.
- Friendly Dog: `0.5471` → rejected.
- Deer: `0.5105` best available score → rejected.

## Phase 9 — APIs
Implemented:

```
GET  /health
GET  /api/posts/:id/matches
POST /api/posts/:id/suggestions
POST /api/suggestions/:id/reviews
```
Tested the health, matching, suggestions, and review endpoints successfully.

## Phase 10 — Suggestions

- Created the suggestion service.
- Added accepted suggestions to PostgreSQL.
- Added a unique constraint for `(post_id, image_id)`.
- Used upsert logic to prevent duplicate suggestions.
Final tested suggestions:

```
Red Fox  → 5
Wolf     → 5
Bear     → 5
Dog      → 0
Deer     → 0
```
Total accepted suggestions: `15`.

## Phase 11 — Evaluation
Evaluated the generated suggestions against the expected categories.

Result:

```
Correct accepted suggestions: 15
Mismatched accepted suggestions: 0
```
Therefore:

```
Accepted-suggestion precision = 15 / 15 = 100%
Mismatch rate = 0 / 15 = 0%
```
The system also rejected the tested weak/no-match cases.

## Issues Encountered

### Gemini Model Error
An initial Gemini model configuration returned a 404 model-not-found error.

The model configuration was updated to the working model:

```
gemini-3.6-flash
```

### Gemini Free-Tier Quota
Batch processing eventually returned a `429 RESOURCE_EXHAUSTED` quota error.

The project was kept on the free tier.

Processing stopped after 37 images and can continue after the quota resets.

### PostgreSQL Vector Type
Initial embeddings were stored as JSONB.

The database was migrated to:

```
vector(384)
```
Existing embeddings were converted successfully.

### PostgreSQL Collation Warning
PostgreSQL displayed a collation version mismatch warning.

The warning did not block the application, so it was not changed during the capstone implementation.

### Posts Table Schema
The posts table uses the column:

```
content
```
instead of `body`.

The seed script was corrected accordingly.

## Final Status
The core capstone implementation is complete.

Implemented:

- AI image understanding
- Structured metadata
- Embeddings
- Vector storage
- Semantic matching
- Mismatch guard
- Suggestions
- Reviews
- Evaluation
-