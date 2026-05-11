import { tryModelsStream, buildMessages } from "../services/aiService.js";

export const streamChat = async (req, res, next) => {
  try {
    const { message, history, attachments, systemPrompt, model } = req.body;
    res.writeHead(200, { 
      "Content-Type": "text/event-stream", 
      "Cache-Control": "no-cache", 
      "Connection": "keep-alive" 
    });
    const messages = buildMessages(message, history, attachments, systemPrompt);
    await tryModelsStream(messages, res, model);
    res.end();
  } catch (error) {
    console.error("Critical Stream Error:", error.message);
    if (!res.headersSent) {
      next(error); // Pass to global error handler
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};
