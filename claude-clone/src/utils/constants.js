// ─── Model definitions (Verified Working) ─────────────────
export const MODELS = [
  { id: "google/gemma-3-12b-it:free", label: "Patel Gemma 3 (12B)", badge: "Newest", badgeColor: "#d97706" },
  { id: "openai/gpt-oss-120b:free", label: "Patel GPT-OSS (120B)", badge: "Most capable", badgeColor: "#d97706" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Patel Nemotron Super", badge: "Pro", badgeColor: "#2563eb" },
  { id: "google/gemma-3-4b-it:free", label: "Patel Gemma 3 (4B)", badge: "Balanced", badgeColor: "#059669" },
  { id: "openai/gpt-oss-20b:free", label: "Patel GPT-OSS (20B)", badge: null },
  { id: "liquid/lfm-2.5-1.2b-thinking:free", label: "Patel Liquid Thinking", badge: "Reasoning", badgeColor: "#8b5cf6" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", label: "Patel Nemotron Nano", badge: null },
  { id: "google/gemma-3n-e4b-it:free", label: "Patel Gemma 3N (4B)", badge: "Experimental", badgeColor: "#64748b" },
  { id: "nvidia/nemotron-nano-9b-v2:free", label: "Patel Nano 9B", badge: null },
  { id: "liquid/lfm-2.5-1.2b-instruct:free", label: "Patel Liquid Lite", badge: "Fastest", badgeColor: "#059669" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", label: "Patel Nano 30B", badge: null },
  { id: "google/gemma-3n-e2b-it:free", label: "Patel Gemma 3N (2B)", badge: null },
];

// ─── Default sidebar conversations ────────────────────────
export const mockConversations = [
  { id: 1, title: "React component optimization",     time: "today" },
  { id: 2, title: "Explain quantum entanglement",     time: "today" },
  { id: 3, title: "Write a Python web scraper",       time: "yesterday" },
  { id: 4, title: "Cover letter for software engineer", time: "week" },
];
