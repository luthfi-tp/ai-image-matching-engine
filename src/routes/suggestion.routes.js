import express from "express";
import { generateSuggestions } from "../services/suggestion.service.js";

const router = express.Router();

router.post("/posts/:id/suggestions", async(req, res) => {
    try {
        const { id } = req.params;
        const limit = Number(req.query.limit || 5);

        if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
            return res.status(400).json({
                error: "limit must be an integer between 1 and 20",
            });
        }

        const result = await generateSuggestions(id, limit);

        return res.json(result);
    } catch (error) {
        console.error("❌ Suggestion API failed:");
        console.error(error.message);

        if (error.message === "Post not found") {
            return res.status(404).json({
                error: "Post not found",
            });
        }

        return res.status(500).json({
            error: "Failed to generate suggestions",
        });
    }
});

export default router;