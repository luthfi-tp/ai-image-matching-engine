import pool from "../config/database.js";
import { generateEmbedding } from "../services/embedding.service.js";

async function generatePostEmbeddings() {
    try {
        const result = await pool.query(`
      SELECT
        p.id AS post_id,
        p.title,
        p.content
      FROM posts p
      LEFT JOIN post_vectors pv
        ON pv.post_id = p.id
      WHERE pv.id IS NULL
      ORDER BY p.created_at;
    `);

        console.log(`🧠 Found ${result.rows.length} posts without embeddings`);

        let processed = 0;

        for (const post of result.rows) {
            const text = `
Title: ${post.title}
Content: ${post.content}
      `.trim();

            console.log(
                `[${processed + 1}/${result.rows.length}] ${post.title}`
            );

            const embedding = await generateEmbedding(text);

            if (embedding.length !== 384) {
                throw new Error(
                    `Expected 384 dimensions, got ${embedding.length}`
                );
            }

            await pool.query(
                `
        INSERT INTO post_vectors (
          post_id,
          embedding,
          model
        )
        VALUES ($1, $2, $3)
        `, [
                    post.post_id,
                    JSON.stringify(embedding),
                    "Xenova/all-MiniLM-L6-v2",
                ]
            );

            processed++;
            console.log(`✅ Saved (${embedding.length} dimensions)\n`);
        }

        console.log("================================");
        console.log("✅ Post embedding generation complete");
        console.log(`Processed: ${processed}`);
        console.log("================================");
    } catch (error) {
        console.error("❌ Failed:");
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

generatePostEmbeddings();