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
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ─── OPTIMIZED MODEL LIST ─── */
const MODELS = [
  "mistralai/mistral-nemotron",
  "nvidia/nemotron-nano-9b-v2:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "liquid/lfm-2.5-1.2b-instruct:free"
];

const DEFAULT_SYSTEM_PROMPT = `You are PatelAI. Provide direct, full code responses. 
IMPORTANT: If code is long, provide it entirely without cutting off. 
No LaTeX. Plain text only. Use bullet points (-) for lists.`;

function buildMessages(message, history = [], attachments = [], systemPrompt = null) {
  const activeSystemPrompt = { role: "system", content: systemPrompt || DEFAULT_SYSTEM_PROMPT };
  const trimmedHistory = history.slice(-10).map(msg => ({
    role: msg.role,
    content: Array.isArray(msg.content) ? msg.content : String(msg.content || "").slice(0, 3000)
  }));
  return [activeSystemPrompt, ...trimmedHistory, { role: "user", content: String(message) }];
}

async function tryModelsStream(messages, res, preferredModel = null) {
  const priorityList = [...new Set([preferredModel, ...MODELS].filter(m => m && MODELS.includes(m)))];

  for (const model of priorityList) {
    try {
      console.log(`🚀 [STREAM] Using: ${model}`);
      res.write(`data: ${JSON.stringify({ activeModel: model })}\n\n`);

      if (model === "mistralai/mistral-nemotron") {
        const stream = await nvidiaClient.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4096, // INCREASED LIMIT
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
            "X-Title": "Patel AI"
          },
          timeout: 20000,
          responseType: "stream",
        }
      );

      return new Promise((resolve, reject) => {
        response.data.on("data", (chunk) => {
          const lines = chunk.toString().split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") { res.write("data: [DONE]\n\n"); continue; }
              try {
                const token = JSON.parse(data).choices?.[0]?.delta?.content;
                if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
              } catch {}
            }
          }
        });
        response.data.on("end", () => { res.write("data: [DONE]\n\n"); resolve(true); });
        response.data.on("error", reject);
      });
    } catch (err) {
      console.log(`❌ ${model} failed...`);
    }
  }
  throw new Error("All Failed");
}

app.post("/chat/stream", chatLimiter, async (req, res) => {
  try {
    const { message, history, attachments, systemPrompt, model } = req.body;
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
    const messages = buildMessages(message, history, attachments, systemPrompt);
    await tryModelsStream(messages, res, model);
    res.end();
  } catch (error) {
    res.end();
  }
});

app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
