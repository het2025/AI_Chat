import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase";

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
 * Hook that manages conversations with Supabase persistence.
 */
export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Fetch Conversations on Login ──────────────────────
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setActiveId(null);
      return;
    }

    async function fetchConvs() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setConversations(data);
      }
      setIsLoading(false);
    }

    fetchConvs();
  }, [userId]);

  // Get sidebar-friendly list with time groups
  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    time: getTimeGroup(c.created_at),
    messages: c.messages,
  }));

  // Get messages for the active conversation
  const activeConversation = conversations.find((c) => c.id === activeId);
  const activeMessages = activeConversation?.messages || [];

  // ─── DB Sync Helpers ──────────────────────────────────
  const syncToDB = async (id, updates) => {
    const { error } = await supabase
      .from("conversations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) console.error("Sync error:", error);
  };

  // ─── Actions ─────────────────────────────────────────

  const createConversation = useCallback(async (firstMessage) => {
    if (!userId) return;

    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "…" : "");
    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: userId,
          title,
          messages: [],
        }
      ])
      .select();

    if (!error && data) {
      setConversations((prev) => [data[0], ...prev]);
      setActiveId(data[0].id);
      return data[0].id;
    }
    return null;
  }, [userId]);

  const addMessage = useCallback((convId, msg) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === convId) {
          const newMessages = [...c.messages, msg];
          // Trigger background sync
          syncToDB(convId, { messages: newMessages });
          return { ...c, messages: newMessages, updated_at: new Date().toISOString() };
        }
        return c;
      });
      return updated;
    });
  }, []);

  const updateLastAssistantMessage = useCallback((convId, content) => {
    setConversations((prev) => {
      return prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "assistant") {
            msgs[i] = { ...msgs[i], content };
            break;
          }
        }
        // Only sync to DB once streaming is "done" (handled by caller typically, 
        // but here we just update local state for performance)
        return { ...c, messages: msgs, updated_at: new Date().toISOString() };
      });
    });
  }, []);

  // Final sync after streaming is complete
  const saveFinalMessages = useCallback(async (convId, messages) => {
    await syncToDB(convId, { messages });
  }, []);

  const deleteConversation = useCallback(async (id) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (!error) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setActiveId((prev) => (prev === id ? null : prev));
    }
  }, []);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  const newChat = useCallback(() => {
    setActiveId(null);
  }, []);

  const renameConversation = useCallback(async (id, newTitle) => {
    const { error } = await supabase.from("conversations").update({ title: newTitle }).eq("id", id);
    if (!error) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    }
  }, []);

  const getHistory = useCallback((convId) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return [];
    return conv.messages.slice(-20).map(({ role, content }) => ({ role, content }));
  }, [conversations]);

  const truncateConversation = useCallback(async (convId, messageId) => {
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;

    const msgIndex = conv.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const newMessages = conv.messages.slice(0, msgIndex);
    const { error } = await supabase
      .from("conversations")
      .update({ messages: newMessages, updated_at: new Date().toISOString() })
      .eq("id", convId);

    if (!error) {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: newMessages } : c))
      );
    }
  }, [conversations]);

  const exportConversation = useCallback((convId) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return null;

    const dateStr = new Date(conv.created_at).toLocaleDateString();
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
    isLoading,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    saveFinalMessages,
    deleteConversation,
    selectConversation,
    renameConversation,
    newChat,
    getHistory,
    truncateConversation,
    exportConversation,
  };
}
