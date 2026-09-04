import { generateEmbedding } from "../services/embedding.service.js";

const text = `
A red fox resting in a grassy field.
red fur, lying down, grass, wildlife, outdoor
`;

try {
    console.log("🧠 Generating embedding...\n");

    const embedding = await generateEmbedding(text);

    console.log("✅ Embedding generated!");
    console.log("Dimensions:", embedding.length);
    console.log("First 10 values:", embedding.slice(0, 10));
} catch (error) {
    console.error("❌ Embedding test failed:");
    console.error(error);
}