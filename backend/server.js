import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ─────────────────────────────────────────────────────────
   🛡️  Middleware
   ───────────────────────────────────────────────────────── */
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: "50kb" }));
app.use(morgan("dev"));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment and try again." },
});

/* ─────────────────────────────────────────────────────────
   🧠  AI Models (free tier)
   ───────────────────────────────────────────────────────── */
const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free"
];

const DEFAULT_SYSTEM_PROMPT = `You are a Patel AI assistant.

STRICT RULES (must follow):
- NEVER use LaTeX formatting (no \\( \\), \\[ \\], \\text, or symbols)
- NEVER use mathematical notation formatting
- ALWAYS write answers in plain simple text
- Use normal words like "km/h", not symbols
- Write step-by-step using simple bullet points
- Keep answers clean, readable, and human-like

If you use LaTeX or symbols, your answer is incorrect.`;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Build the messages array: system + history + current message.
 * Trims history to last 20 messages to stay within token limits.
 */
function buildMessages(message, history = [], attachments = [], systemPrompt = null) {
  const activeSystemPrompt = {
    role: "system",
    content: systemPrompt || DEFAULT_SYSTEM_PROMPT
  };

  const trimmedHistory = history.slice(-20).map(msg => {
    // If content is already an array (multi-modal), don't stringify it
    let content = Array.isArray(msg.content) ? msg.content : String(msg.content || "").slice(0, 4000);
    
    if (msg.attachments && msg.attachments.length > 0 && !Array.isArray(content)) {
      const arrContent = [{ type: "text", text: content }];
      msg.attachments.forEach(att => {
        if (att.type === "image" && att.data) {
          arrContent.push({ type: "image_url", image_url: { url: att.data } });
        } else if (att.type === "text" && att.data) {
          arrContent.push({ type: "text", text: `\n\n--- Attachment: ${att.name} ---\n${att.data.slice(0, 10000)}` });
        }
      });
      content = arrContent;
    }
    return {
      role: msg.role === "user" || msg.role === "assistant" ? msg.role : "user",
      content
    };
  });

  let currentUserContent = String(message).slice(0, 4000);
  if (attachments && attachments.length > 0) {
    const arrContent = [{ type: "text", text: currentUserContent }];
    attachments.forEach(att => {
      if (att.type === "image" && att.data) {
        arrContent.push({ type: "image_url", image_url: { url: att.data } });
      } else if (att.type === "text" && att.data) {
        arrContent.push({ type: "text", text: `\n\n--- Attachment: ${att.name} ---\n${att.data.slice(0, 10000)}` });
      }
    });
    currentUserContent = arrContent;
  }

  return [activeSystemPrompt, ...trimmedHistory, { role: "user", content: currentUserContent }];
}

/* ─────────────────────────────────────────────────────────
   🔁  Try Models (non-streaming)
   ───────────────────────────────────────────────────────── */
async function tryModels(messages, retry = false) {
  for (const model of MODELS) {
    try {
      console.log("⚡ Trying:", model);
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages, temperature: 0.7, max_tokens: 1024 },
        {
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      console.log("✅ Success:", model);
      return res.data.choices[0].message.content;
    } catch (err) {
      console.log("❌ Failed:", model, "-", err.message);
      await delay(1500);
    }
  }
  if (!retry) {
    console.log("🔁 Retrying all models...");
    await delay(3000);
    return await tryModels(messages, true);
  }
  throw new Error("All models failed");
}

/* ─────────────────────────────────────────────────────────
   🔁  Try Models (streaming via SSE)
   ───────────────────────────────────────────────────────── */
async function tryModelsStream(messages, res) {
  for (const model of MODELS) {
    try {
      console.log("⚡ [stream] Trying:", model);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages, temperature: 0.7, max_tokens: 1024, stream: true },
        {
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
          responseType: "stream",
        }
      );

      console.log("✅ [stream] Connected:", model);

      // Pipe the OpenRouter SSE stream to our client
      return new Promise((resolve, reject) => {
        let buffer = "";

        response.data.on("data", (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              res.write("data: [DONE]\n\n");
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
              }
            } catch {
              // skip malformed JSON
            }
          }
        });

        response.data.on("end", () => {
          res.write("data: [DONE]\n\n");
          resolve(true);
        });

        response.data.on("error", (err) => {
          reject(err);
        });
      });
    } catch (err) {
      console.log("❌ [stream] Failed:", model, "-", err.message);
      await delay(1000);
    }
  }
  throw new Error("All models failed (stream)");
}

/* ─────────────────────────────────────────────────────────
   🏥  Health Check
   ───────────────────────────────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/* ─────────────────────────────────────────────────────────
   💬  Chat Endpoint (non-streaming, with multi-turn history)
   ───────────────────────────────────────────────────────── */
app.post("/chat", chatLimiter, async (req, res) => {
  try {
    const { message, history, attachments, systemPrompt } = req.body;

    if (typeof message !== "string") {
      return res.status(400).json({ error: "A valid 'message' string is required." });
    }
    if (message.length > 4000) {
      return res.status(400).json({ error: "Message is too long. Max 4000 characters." });
    }

    const messages = buildMessages(message, history, attachments, systemPrompt);
    const reply = await tryModels(messages);
    res.json({ reply });
  } catch (error) {
    console.error("🚨 FINAL ERROR:", error.message);
    res.status(500).json({
      error: "⚠️ All AI servers are busy right now. Please try again in a few seconds.",
    });
  }
});

/* ─────────────────────────────────────────────────────────
   📡  Chat Stream Endpoint (SSE, with multi-turn history)
   ───────────────────────────────────────────────────────── */
app.post("/chat/stream", chatLimiter, async (req, res) => {
  try {
    const { message, history, attachments, systemPrompt } = req.body;

    if (typeof message !== "string") {
      return res.status(400).json({ error: "A valid 'message' string is required." });
    }
    if (message.length > 4000) {
      return res.status(400).json({ error: "Message is too long. Max 4000 characters." });
    }

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const messages = buildMessages(message, history, attachments, systemPrompt);

    // Handle client disconnect
    req.on("close", () => {
      console.log("📡 Client disconnected");
    });

    await tryModelsStream(messages, res);
    res.end();
  } catch (error) {
    console.error("🚨 STREAM ERROR:", error.message);
    // If headers already sent, send error as SSE event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "All AI servers are busy. Try again." })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "All AI servers are busy. Try again." });
    }
  }
});

/* ─────────────────────────────────────────────────────────
   🚨  Global error handler
   ───────────────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

/* ─────────────────────────────────────────────────────────
   🚀  Start Server
   ───────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});