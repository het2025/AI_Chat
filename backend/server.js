import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50kb" }));
app.use(morgan("dev"));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment and try again." },
});

const MODELS = [
  "mistralai/mistral-nemotron",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free"
];

// SIMPLIFIED, DIRECT PROMPT
const DEFAULT_SYSTEM_PROMPT = `You are PatelAI, a helpful and direct assistant.
- Answer questions clearly and concisely.
- NEVER use LaTeX or mathematical symbols.
- Use plain simple English.
- Use bullet points (-) for lists.`;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function buildMessages(message, history = [], attachments = [], systemPrompt = null) {
  const activeSystemPrompt = {
    role: "system",
    content: systemPrompt || DEFAULT_SYSTEM_PROMPT
  };

  const trimmedHistory = history.slice(-20).map(msg => {
    return {
      role: msg.role === "user" || msg.role === "assistant" ? msg.role : "user",
      content: Array.isArray(msg.content) ? msg.content : String(msg.content || "").slice(0, 4000)
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

async function tryModelsStream(messages, res, preferredModel = null) {
  const priorityList = [...new Set([preferredModel, ...MODELS].filter(m => m && MODELS.includes(m)))];

  for (const model of priorityList) {
    try {
      console.log(`🚀 [BACKEND] Using Model: ${model}`);
      res.write(`data: ${JSON.stringify({ activeModel: model })}\n\n`);

      if (model === "mistralai/mistral-nemotron") {
        const stream = await nvidiaClient.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4096,
          stream: true,
        });

        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content || "";
          if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        return true;
      }

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages, temperature: 0.7, max_tokens: 4096, stream: true },
        {
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
            "X-Title": "Patel AI"
          },
          timeout: 60000,
          responseType: "stream",
        }
      );

      return new Promise((resolve, reject) => {
        let buffer = "";
        response.data.on("data", (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop();
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
              if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
            } catch {}
          }
        });
        response.data.on("end", () => {
          res.write("data: [DONE]\n\n");
          resolve(true);
        });
        response.data.on("error", (err) => reject(err));
      });
    } catch (err) {
      console.log("❌ [stream] Failed:", model, "-", err.message);
      await delay(2000);
    }
  }
  throw new Error("All models failed (stream)");
}

app.post("/chat/stream", chatLimiter, async (req, res) => {
  try {
    const { message, history, attachments, systemPrompt, model } = req.body;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const messages = buildMessages(message, history, attachments, systemPrompt);
    await tryModelsStream(messages, res, model);
    res.end();
  } catch (error) {
    res.end();
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
