import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import "dotenv/config";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeImage(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: [{
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
            {
                text: `
Analyze this image for an image matching system.

Return ONLY valid JSON.

Use exactly this structure:

{
  "subject": "main subject",
  "category": "fox | wolf | dog | bear | deer",
  "attributes": ["attribute1", "attribute2"],
  "caption": "short description",
  "confidence": 0.0
}

Rules:
- category must be exactly one of: fox, wolf, dog, bear, deer
- confidence must be between 0 and 1
- attributes must be an array of strings
- Do not add extra fields
- Do not use markdown
- Return JSON only
`,
            },
        ],
    });

    return response.text;
}