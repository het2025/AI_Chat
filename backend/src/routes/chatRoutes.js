import express from "express";
import { streamChat } from "../controllers/chatController.js";
import { chatLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/stream", chatLimiter, streamChat);

export default router;
