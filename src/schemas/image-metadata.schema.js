import { z } from "zod";

export const imageMetadataSchema = z.object({
    subject: z.string().min(1),

    category: z.enum([
        "fox",
        "wolf",
        "dog",
        "bear",
        "deer",
    ]),

    attributes: z.array(z.string()).min(1),

    caption: z.string().min(1),

    confidence: z.number().min(0).max(1),
});