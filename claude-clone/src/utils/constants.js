// ─── Model definitions (Performance Categorized) ───────────
/**
 * Speed: 3x (Instant), 2x (Fast), 1x (Deliberate)
 * Intelligence: Higher means more complex reasoning capabilities
 */
export const MODELS = [
  { 
    id: "mistralai/mistral-nemotron", 
    label: "EKKA Mistral Nemotron", 
    badge: "New", 
    badgeColor: "#10b981",
    description: "High performance & high quality"
  },
  { 
    id: "nvidia/nemotron-3-super-120b-a12b:free", 
    label: "EKKA Nemotron Super [1x]", 
    badge: "Smartest", 
    badgeColor: "#d97706",
    description: "Best for complex logic & artifacts"
  },
  { 
    id: "liquid/lfm-2.5-1.2b-thinking:free", 
    label: "EKKA Liquid Thinking [1x]", 
    badge: "Reasoning", 
    badgeColor: "#8b5cf6",
    description: "Deep step-by-step thinking"
  },
  { 
    id: "nvidia/nemotron-3-nano-30b-a3b:free", 
    label: "EKKA Nano 30B [2x]", 
    badge: "Balanced", 
    badgeColor: "#2563eb",
    description: "Good for general chat"
  },
  { 
    id: "nvidia/nemotron-nano-12b-v2-vl:free", 
    label: "EKKA Nemotron Nano [2x]", 
    badge: "Fast", 
    badgeColor: "#2563eb",
    description: "Quick & reliable"
  },
  { 
    id: "liquid/lfm-2.5-1.2b-instruct:free", 
    label: "EKKA Liquid Lite [3x]", 
    badge: "Instant", 
    badgeColor: "#059669",
    description: "Lightning fast responses"
  },
  { 
    id: "nvidia/nemotron-nano-9b-v2:free", 
    label: "EKKA Nano 9B [3x]", 
    badge: "Instant", 
    badgeColor: "#059669",
    description: "Minimal latency"
  },
];

// ─── Default sidebar conversations ────────────────────────
export const mockConversations = [
  { id: 1, title: "React component optimization",     time: "today" },
  { id: 2, title: "Explain quantum entanglement",     time: "today" },
  { id: 3, title: "Write a Python web scraper",       time: "yesterday" },
  { id: 4, title: "Cover letter for software engineer", time: "week" },
];
