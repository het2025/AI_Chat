import { useState, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "patel-conversations";
const MAX_CONVERSATIONS = 50;

/**
 * Load conversations from localStorage.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save conversations to localStorage.
 * Implements a fallback to strip large attachments if QuotaExceededError occurs.
 */
function saveToStorage(conversations) {
  try {
    // Only persist the latest MAX_CONVERSATIONS
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        // Fallback: strip attachment data to save space
        const stripped = trimmed.map(c => ({
          ...c,
          messages: c.messages.map(m => ({
            ...m,
            attachments: m.attachments?.map(att => ({ ...att, data: att.type === 'image' ? null : att.data }))
          }))
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      } else {
        throw e;
      }
    }
  } catch (err) {
    // localStorage completely full or unavailable — silently fail
    console.warn("Could not save to localStorage:", err);
  }
}

/**
 * Generate a time group label for sidebar display.
 */
function getTimeGroup(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7) return "week";
  return "older";
}

/**
 * Hook that manages conversations with localStorage persistence.
 */
export function useConversations() {
  const [conversations, setConversations] = useState(() => loadFromStorage());
  const [activeId, setActiveId] = useState(null);
  const saveTimeout = useRef(null);

  // Debounce saves to localStorage (300ms)
  useEffect(() => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveToStorage(conversations);
    }, 300);
    return () => clearTimeout(saveTimeout.current);
  }, [conversations]);

  // Get sidebar-friendly list with time groups
  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    time: getTimeGroup(c.createdAt),
    messages: c.messages,
  }));

  // Get messages for the active conversation
  const activeConversation = conversations.find((c) => c.id === activeId);
  const activeMessages = activeConversation?.messages || [];

  // Create a new conversation
  const createConversation = useCallback((firstMessage) => {
    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "…" : "");
    const newConv = {
      id: Date.now(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    return newConv.id;
  }, []);

  // Add a message to the active conversation
  const addMessage = useCallback((convId, msg) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, msg], updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  // Update the last assistant message (for streaming)
  const updateLastAssistantMessage = useCallback((convId, content) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        // Find the last assistant message
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "assistant") {
            msgs[i] = { ...msgs[i], content };
            break;
          }
        }
        return { ...c, messages: msgs, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  // Select and load a conversation
  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  // Start new chat (deselect)
  const newChat = useCallback(() => {
    setActiveId(null);
  }, []);

  // Rename conversation
  const renameConversation = useCallback((id, newTitle) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  }, []);

  // Get history for API calls (role + content only, capped at last 20 messages)
  const getHistory = useCallback((convId) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return [];
    // Keep last 20 messages to stay within token limits
    return conv.messages.slice(-20).map(({ role, content }) => ({ role, content }));
  }, [conversations]);

  // Truncate conversation (remove a message and all subsequent messages)
  const truncateConversation = useCallback((convId, messageId) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgIndex = c.messages.findIndex((m) => m.id === messageId);
        if (msgIndex === -1) return c;
        
        return {
          ...c,
          messages: c.messages.slice(0, msgIndex),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Export conversation as Markdown
  const exportConversation = useCallback((convId) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return null;

    const dateStr = new Date(conv.createdAt).toLocaleDateString();
    let md = `# ${conv.title}\n*Created on ${dateStr}*\n\n---\n\n`;

    for (const msg of conv.messages) {
      const role = msg.role === "user" ? "User" : "Patel AI";
      md += `### ${role} (${msg.time})\n\n${msg.content}\n\n---\n\n`;
    }

    return md;
  }, [conversations]);

  return {
    conversations: sidebarConversations,
    activeId,
    activeMessages,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    deleteConversation,
    selectConversation,
    renameConversation,
    newChat,
    getHistory,
    truncateConversation,
    exportConversation,
  };
}
