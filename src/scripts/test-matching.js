import pool from "../config/database.js";

async function testMatching() {
    try {
        const result = await pool.query(`
      SELECT
        p.title AS post_title,
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
      ORDER BY p.id, similarity DESC;
    `);

        let currentPost = "";

        for (const row of result.rows) {
            if (row.post_title !== currentPost) {
                currentPost = row.post_title;

                console.log("\n================================");
                console.log(`📝 ${row.post_title}`);
                console.log("================================");
            }

            console.log(
                `${row.category.padEnd(8)} | ` +
                `${Number(row.similarity).toFixed(4)} | ` +
                `${row.source_url}`
            );
        }
    } catch (error) {
        console.error("❌ Matching failed:");
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

testMatching();