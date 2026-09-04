import fs from "fs";
import pool from "../config/database.js";
import { analyzeImage } from "../services/vision.service.js";
import { imageMetadataSchema } from "../schemas/image-metadata.schema.js";
import { saveImageMetadata } from "../services/metadata.service.js";

const imagePath = "images/fox/fox-01.jpg";
const sourceUrl = "/images/fox/fox-01.jpg";

try {
    // 1. Find the image in database
    const imageResult = await pool.query(
        "SELECT id FROM images WHERE source_url = $1 LIMIT 1", [sourceUrl]
    );

    if (imageResult.rows.length === 0) {
        throw new Error(`Image not found in database: ${sourceUrl}`);
    }

    const imageId = imageResult.rows[0].id;

    console.log(`Image ID: ${imageId}`);

    // 2. Check that image exists
    if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
    }

    // 3. Send image to Gemini
    console.log("🤖 Analyzing image...");

    const rawResult = await analyzeImage(imagePath);

    // 4. Parse AI response
    const parsed = JSON.parse(rawResult);

    // 5. Validate with Zod
    const validated = imageMetadataSchema.safeParse(parsed);

    if (!validated.success) {
        throw new Error(
            `Zod validation failed: ${JSON.stringify(validated.error.format())}`
        );
    }

    console.log("✅ AI response validated");

    // 6. Save metadata
    const saved = await saveImageMetadata(imageId, validated.data);

    console.log("✅ Metadata saved!");
    console.log(JSON.stringify(saved, null, 2));

} catch (error) {
    console.error("❌ Processing failed:");
    console.error(error);
} finally {
    await pool.end();
}