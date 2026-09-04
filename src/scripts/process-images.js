import fs from "fs";
import path from "path";
import pool from "../config/database.js";
import { analyzeImage } from "../services/vision.service.js";
import { imageMetadataSchema } from "../schemas/image-metadata.schema.js";
import { saveImageMetadata } from "../services/metadata.service.js";

const categories = ["fox", "wolf", "dog", "bear", "deer"];

const MAX_RETRIES = 3;
const CONFIDENCE_THRESHOLD = 0.7;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processImage(imagePath, sourceUrl, index, total) {
    const imageResult = await pool.query(
        "SELECT id FROM images WHERE source_url = $1 LIMIT 1", [sourceUrl]
    );

    if (imageResult.rows.length === 0) {
        throw new Error(`Image not found in database: ${sourceUrl}`);
    }

    const imageId = imageResult.rows[0].id;

    // Skip images that already have metadata
    const existingMetadata = await pool.query(
        "SELECT id FROM image_metadata WHERE image_id = $1 LIMIT 1", [imageId]
    );

    if (existingMetadata.rows.length > 0) {
        console.log(`[${index}/${total}] ${sourceUrl} ⏭️ already processed`);
        return "skipped";
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(
                `[${index}/${total}] ${sourceUrl} 🤖 processing...`
            );

            const rawResult = await analyzeImage(imagePath);

            const parsed = JSON.parse(rawResult);

            const validated = imageMetadataSchema.safeParse(parsed);

            if (!validated.success) {
                throw new Error(
                    `Zod validation failed: ${JSON.stringify(
            validated.error.format()
          )}`
                );
            }

            const saved = await saveImageMetadata(
                imageId,
                validated.data
            );

            console.log(
                `[${index}/${total}] ${sourceUrl} ✅ saved (${saved.confidence})`
            );

            return "processed";
        } catch (error) {
            const message = error.message || "";

            console.error(
                `[${index}/${total}] Attempt ${attempt}/${MAX_RETRIES} failed: ${message}`
            );

            // Stop immediately when Gemini quota is exhausted
            if (
                message.includes("429") ||
                message.includes("RESOURCE_EXHAUSTED") ||
                message.includes("quota")
            ) {
                console.error("\n🛑 Gemini Free Tier quota exhausted.");
                console.error("Stopping batch. Run again after quota resets.\n");

                process.exit(1);
            }

            if (attempt < MAX_RETRIES) {
                await sleep(2000 * attempt);
            }
        }
    }

    console.error(`[${index}/${total}] ${sourceUrl} ❌ failed`);
    return "failed";
}

async function processImages() {
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    const imageFiles = [];

    for (const category of categories) {
        const categoryDir = path.resolve("images", category);

        if (!fs.existsSync(categoryDir)) {
            console.log(`⚠️ Missing folder: ${categoryDir}`);
            continue;
        }

        const files = fs
            .readdirSync(categoryDir)
            .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

        for (const file of files) {
            imageFiles.push({
                category,
                file,
                imagePath: path.join(categoryDir, file),
                sourceUrl: `/images/${category}/${file}`,
            });
        }
    }

    const total = imageFiles.length;

    console.log(`\n🚀 Found ${total} images\n`);

    for (let i = 0; i < imageFiles.length; i++) {
        const image = imageFiles[i];

        const result = await processImage(
            image.imagePath,
            image.sourceUrl,
            i + 1,
            total
        );

        if (result === "processed") processed++;
        if (result === "skipped") skipped++;
        if (result === "failed") failed++;
    }

    console.log("\n================================");
    console.log("✅ Batch processing complete");
    console.log(`Processed: ${processed}`);
    console.log(`Skipped:   ${skipped}`);
    console.log(`Failed:    ${failed}`);
    console.log("================================\n");
}

processImages()
    .catch((error) => {
        console.error("❌ Batch processing failed:");
        console.error(error);
    })
    .finally(async() => {
        await pool.end();
    });