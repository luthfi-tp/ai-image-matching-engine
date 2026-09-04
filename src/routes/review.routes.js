import express from "express";
import { createReview } from "../services/review.service.js";

const router = express.Router();

router.post("/suggestions/:id/reviews", async(req, res) => {
    try {
        const { id } = req.params;
        const { decision } = req.body;

        if (!decision) {
            return res.status(400).json({
                error: "decision is required",
            });
        }

        const review = await createReview(id, decision);

        return res.status(201).json({
            message: "Review created successfully",
            review,
        });
    } catch (error) {
        console.error("❌ Review API failed:");
        console.error(error.message);

        if (error.message === "Suggestion not found") {
            return res.status(404).json({
                error: "Suggestion not found",
            });
        }

        if (error.message.includes("Decision must")) {
            return res.status(400).json({
                error: error.message,
            });
        }

        return res.status(500).json({
            error: "Failed to create review",
        });
    }
});

export default router;