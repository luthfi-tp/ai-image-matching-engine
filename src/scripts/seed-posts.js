import pool from "../config/database.js";

const posts = [{
        title: "Red Fox in the Wild",
        content: "A red fox resting and moving through a grassy outdoor environment.",
    },
    {
        title: "Wolf in the Forest",
        content: "A wild wolf living and moving through a natural forest habitat.",
    },
    {
        title: "Friendly Dog Outdoors",
        content: "A domestic dog enjoying time outside in a grassy area.",
    },
    {
        title: "Brown Bear in Nature",
        content: "A brown bear exploring a natural outdoor environment.",
    },
    {
        title: "Deer in the Forest",
        content: "A deer walking through a peaceful forest and natural habitat.",
    },
];

try {
    for (const post of posts) {
        await pool.query(
            `
      INSERT INTO posts (title, content)
      VALUES ($1, $2)
      `, [post.title, post.content]
        );
    }

    console.log(`✅ Inserted ${posts.length} posts`);
} catch (error) {
    console.error("❌ Failed to seed posts:");
    console.error(error.message);
} finally {
    await pool.end();
}