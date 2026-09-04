import express from "express";
import { findMatches } from "../services/matching.service.js";

const router = express.Router();

router.get("/posts/:id/matches", async(req, res) => {
    try {
        const { id } = req.params;

        const limit = Number(req.query.limit || 5);

        if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
            return res.status(400).json({
                error: "limit must be an integer between 1 and 20",
            });
        }

        const result = await findMatches(id, limit);

        return res.json({
            post: {
                id: result.post.id,
                title: result.post.title,
            },
            expectedCategory: result.expectedCategory,
            threshold: result.threshold,
            hasMatch: result.hasMatch,
            matches: result.matches.map((match) => ({
                imageId: match.image_id,
                sourceUrl: match.source_url,
                subject: match.subject,
                category: match.category,
                caption: match.caption,
                similarity: Number(match.similarity.toFixed(4)),
            })),
        });
    } catch (error) {
        console.error("❌ Matching API failed:");
        console.error(error.message);

        if (error.message === "Post not found") {
            return res.status(404).json({
                error: "Post not found",
            });
        }

        return res.status(500).json({
            error: "Failed to find image matches",
        });
    }
});

export default router;