import pool from "../config/database.js";

export async function saveImageMetadata(imageId, metadata) {
    const query = `
    INSERT INTO image_metadata (
      image_id,
      subject,
      category,
      attributes,
      caption,
      confidence,
      flagged
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

    const flagged = metadata.confidence < 0.7;

    const values = [
        imageId,
        metadata.subject,
        metadata.category,
        JSON.stringify(metadata.attributes),
        metadata.caption,
        metadata.confidence,
        flagged,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}