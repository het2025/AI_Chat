const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Send a chat message with full conversation history (multi-turn).
 * @param {string} message - The latest user message.
 * @param {Array} history - Previous messages [{role, content}, ...].
 * @returns {Promise<string>} The assistant's reply text.
 */
export async function sendMessage(message, history = [], attachments = [], systemPrompt = null) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, attachments, systemPrompt }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${res.status}`);
  }

  const data = await res.json();
  return data.reply;
}

/**
 * Send a chat message and receive a streaming response (SSE).
 * Calls onChunk for each text token, onDone when complete, onError on failure.
 * Returns an abort function.
 */
export function streamMessage(message, history = [], attachments = [], { onChunk, onDone, onError, systemPrompt = null }) {
  const controller = new AbortController();

  fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, attachments, systemPrompt }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onDone?.();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) onChunk?.(parsed.token);
              if (parsed.error) { onError?.(new Error(parsed.error)); return; }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
      onDone?.();
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        onError?.(err);
      }
    });

  return () => controller.abort();
}
