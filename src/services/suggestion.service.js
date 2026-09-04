import pool from "../config/database.js";
import { findMatches } from "./matching.service.js";

export async function generateSuggestions(postId, limit = 5) {
    const result = await findMatches(postId, limit);

    if (!result.hasMatch) {
        return {
            post: result.post,
            expectedCategory: result.expectedCategory,
            threshold: result.threshold,
            hasMatch: false,
            suggestions: [],
        };
    }

    const suggestions = [];

    for (const match of result.matches) {
        const insertResult = await pool.query(
            `
      INSERT INTO suggestions (
  post_id,
  image_id,
  similarity,
  decision,
  reason
)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (post_id, image_id)
DO UPDATE SET
  similarity = EXCLUDED.similarity,
  decision = EXCLUDED.decision,
  reason = EXCLUDED.reason
RETURNING *;
      `, [
                postId,
                match.image_id,
                match.similarity,
                "accepted",
                `Category matches expected "${result.expectedCategory}" and similarity ${match.similarity.toFixed(4)} meets threshold ${result.threshold}.`,
            ]
        );

        suggestions.push({
            ...insertResult.rows[0],
            sourceUrl: match.source_url,
            category: match.category,
            caption: match.caption,
        });
    }

    return {
        post: result.post,
        expectedCategory: result.expectedCategory,
        threshold: result.threshold,
        hasMatch: true,
        suggestions,
    };
}