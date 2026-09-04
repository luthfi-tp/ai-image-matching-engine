import { analyzeImage } from "../services/vision.service.js";
import { imageMetadataSchema } from "../schemas/image-metadata.schema.js";

const imagePath = "images/fox/fox-01.jpg";

try {
    const rawResult = await analyzeImage(imagePath);

    console.log("Raw Gemini response:");
    console.log(rawResult);

    const parsed = JSON.parse(rawResult);

    const validated = imageMetadataSchema.safeParse(parsed);

    if (!validated.success) {
        console.error("❌ Validation failed:");
        console.error(validated.error.format());
        process.exit(1);
    }

    console.log("\n✅ Zod validation successful!");
    console.log(JSON.stringify(validated.data, null, 2));

} catch (error) {
    console.error("❌ Vision test failed:");
    console.error(error);
}