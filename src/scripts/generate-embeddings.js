import pool from "../config/database.js";
import { generateEmbedding } from "../services/embedding.service.js";

async function generateEmbeddings() {
    try {
        const result = await pool.query(`
      SELECT
        i.id AS image_id,
        i.source_url,
        m.subject,
        m.category,
        m.attributes,
        m.caption
      FROM images i
      INNER JOIN image_metadata m
        ON m.image_id = i.id
      LEFT JOIN image_vectors v
        ON v.image_id = i.id
      WHERE v.id IS NULL
      ORDER BY i.created_at;
    `);

        console.log(`\n🧠 Found ${result.rows.length} images without embeddings\n`);

        let processed = 0;

        for (const row of result.rows) {
            try {
                const attributes = Array.isArray(row.attributes) ?
                    row.attributes :
                    [];

                const text = `
Subject: ${row.subject}
Category: ${row.category}
Caption: ${row.caption}
Attributes: ${attributes.join(", ")}
        `.trim();

                console.log(
                    `[${processed + 1}/${result.rows.length}] ${row.source_url}`
                );

                const embedding = await generateEmbedding(text);

                if (embedding.length !== 384) {
                    throw new Error(
                        `Expected 384 dimensions, got ${embedding.length}`
                    );
                }

                await pool.query(
                    `
          INSERT INTO image_vectors (
            image_id,
            embedding,
            model
          )
          VALUES ($1, $2, $3)
          `, [
                        row.image_id,
                        JSON.stringify(embedding),
                        "Xenova/all-MiniLM-L6-v2",
                    ]
                );

                processed++;

                console.log(`✅ Embedding saved (${embedding.length} dimensions)\n`);
            } catch (error) {
                console.error(
                    `❌ Failed: ${row.source_url}`
                );
                console.error(error.message);
                console.log("");
            }
        }

        console.log("================================");
        console.log("✅ Embedding generation complete");
        console.log(`Processed: ${processed}`);
        console.log("================================\n");

    } catch (error) {
        console.error("❌ Embedding generation failed:");
        console.error(error);
    } finally {
        await pool.end();
    }
}

generateEmbeddings();