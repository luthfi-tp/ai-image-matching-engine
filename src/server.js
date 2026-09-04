import express from "express";
import "dotenv/config";
import matchingRoutes from "./routes/matching.routes.js";
import suggestionRoutes from "./routes/suggestion.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "ai-image-matching-engine",
    });
});

app.use("/api", matchingRoutes);
app.use("/api", suggestionRoutes);
app.use("/api", reviewRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});

server.on("error", (error) => {
    console.error("❌ Server error:", error);
});

server.on("close", () => {
    console.log("⚠️ Server closed");
});

process.on("SIGINT", () => {
    console.log("\n🛑 Server stopping...");
    server.close(() => {
        process.exit(0);
    });
});