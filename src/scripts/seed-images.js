import fs from "fs";
import path from "path";
import pool from "../config/database.js";

const categories = ["fox", "wolf", "dog", "bear", "deer"];

const imagesDir = path.resolve("images");

async function seedImages() {
    try {
        let total = 0;

        for (const category of categories) {
            const categoryDir = path.join(imagesDir, category);

            if (!fs.existsSync(categoryDir)) {
                console.log(`Skipping missing folder: ${category}`);
                continue;
            }

            const files = fs
                .readdirSync(categoryDir)
                .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

            for (const file of files) {
                const sourceUrl = `/images/${category}/${file}`;

                await pool.query(
                    `
          INSERT INTO images (source_url, status)
          VALUES ($1, 'pending')
          `, [sourceUrl]
                );

                total++;

                console.log(`Added: ${category}/${file}`);
            }
        }

        console.log(`\n✅ ${total} images added to database`);
    } catch (error) {
        console.error("❌ Failed to seed images:");
        console.error(error);
    } finally {
        await pool.end();
    }
}

seedImages();