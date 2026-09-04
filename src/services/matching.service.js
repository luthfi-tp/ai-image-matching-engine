import "dotenv/config";
import pool from "../config/database.js";

const SIMILARITY_THRESHOLD = Number(
    process.env.SIMILARITY_THRESHOLD || 0.55
);

export async function findMatches(postId, limit = 5) {
    const postResult = await pool.query(
        `
    SELECT
      p.id,
      p.title,
      p.content
    FROM posts p
    WHERE p.id = $1
    `, [postId]
    );

    if (postResult.rows.length === 0) {
        throw new Error("Post not found");
    }

    const post = postResult.rows[0];

    // Get expected category from the post title/content.
    const expectedCategory = detectCategory(
        `${post.title} ${post.content}`
    );

    const result = await pool.query(
        `
    SELECT
      i.id AS image_id,
      i.source_url,
      m.subject,
      m.category,
      m.caption,
      1 - (iv.embedding <=> pv.embedding) AS similarity
    FROM posts p
    JOIN post_vectors pv
      ON pv.post_id = p.id
    CROSS JOIN image_vectors iv
    JOIN images i
      ON i.id = iv.image_id
    JOIN image_metadata m
      ON m.image_id = i.id
    WHERE p.id = $1
    ORDER BY iv.embedding <=> pv.embedding
    `, [postId]
    );

    const candidates = result.rows.map((row) => ({
        ...row,
        similarity: Number(row.similarity),
        category_match:
            !expectedCategory || row.category === expectedCategory,
    }));

    const accepted = candidates
        .filter(
            (row) =>
            row.category_match &&
            row.similarity >= SIMILARITY_THRESHOLD
        )
        .slice(0, limit);

    return {
        post,
        expectedCategory,
        threshold: SIMILARITY_THRESHOLD,
        matches: accepted,
        hasMatch: accepted.length > 0,
    };
}

function detectCategory(text) {
    const normalized = text.toLowerCase();

    const categories = [
        "fox",
        "wolf",
        "dog",
        "bear",
        "deer",
    ];

    return categories.find((category) =>
        normalized.includes(category)
    ) || null;
}