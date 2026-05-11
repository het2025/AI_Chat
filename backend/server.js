import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import chatRoutes from "./src/routes/chatRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

// Basic validation for critical environment variables
if (!process.env.NVIDIA_API_KEY && !process.env.API_KEY) {
  console.warn("⚠️ WARNING: Neither NVIDIA_API_KEY nor API_KEY is set in the environment variables.");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security: In production, configure CORS origin to match your frontend domain
const corsOptions = {
  origin: process.env.FRONTEND_URL || true, // Allow all in dev, restrict in prod if FRONTEND_URL is set
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50kb" }));
app.use(morgan("dev"));

// Routes
app.use("/chat", chatRoutes);

// Global Error Handler
app.use(errorHandler);

// Handle server errors (like port already in use)
app.listen(PORT, () => {
  console.log(`🚀 Server on ${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Error: Port ${PORT} is already in use.`);
    console.error(`💡 Tip: Run 'npx kill-port ${PORT}' to free it up.`);
  } else {
    console.error("❌ Server Error:", err.message);
  }
  process.exit(1);
});
