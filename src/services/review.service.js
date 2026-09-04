import pool from "../config/database.js";

export async function createReview(suggestionId, decision) {
    if (!["accepted", "rejected"].includes(decision)) {
        throw new Error("Decision must be accepted or rejected");
    }

    const suggestion = await pool.query(
        `
    SELECT id
    FROM suggestions
    WHERE id = $1
    `, [suggestionId]
    );

    if (suggestion.rows.length === 0) {
        throw new Error("Suggestion not found");
    }

    const result = await pool.query(
        `
    INSERT INTO reviews (
      suggestion_id,
      decision
    )
    VALUES ($1, $2)
    RETURNING *;
    `, [suggestionId, decision]
    );

    return result.rows[0];
}