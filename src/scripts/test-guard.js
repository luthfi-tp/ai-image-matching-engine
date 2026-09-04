import pool from "../config/database.js";
import { findMatches } from "../services/matching.service.js";

async function testGuard() {
    try {
        const posts = await pool.query(`
      SELECT id, title
      FROM posts
      ORDER BY created_at;
    `);

        for (const post of posts.rows) {
            const result = await findMatches(post.id, 3);

            console.log("\n================================");
            console.log(`📝 ${post.title}`);
            console.log(`Expected: ${result.expectedCategory}`);
            console.log(`Threshold: ${result.threshold}`);
            console.log("================================");

            if (!result.hasMatch) {
                console.log("🚫 NO SAFE MATCH FOUND");
                continue;
            }

            for (const match of result.matches) {
                console.log(
                    `✅ ${match.category} | ` +
                    `${match.similarity.toFixed(4)} | ` +
                    `${match.source_url}`
                );
            }
        }
    } catch (error) {
        console.error("❌ Guard test failed:");
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

testGuard();