import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import Message from "./Message";
import { ClaudeLogo } from "../icons/index.jsx";
import MagicLoader from "../ui/MagicLoader.jsx";

export default function SharedChatView() {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChat() {
      try {
        const { data, error } = await supabase
          .from("shared_chats")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setChat(data);
      } catch (err) {
        console.error("Error fetching shared chat:", err);
        setError("This shared link is invalid or has been removed.");
      } finally {
        setLoading(false);
      }
    }
    fetchChat();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <MagicLoader size={60} speed={1.5} particleCount={2} hueRange={[10, 40]} />
        <div style={{ color: "var(--text-secondary)" }}>Loading shared chat...</div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", textAlign: "center", padding: 20 }}>
        <ClaudeLogo size={48} />
        <h2 style={{ color: "var(--text-primary)", marginTop: 20 }}>Chat not found</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>{error}</p>
        <a href="/" style={{ marginTop: 20, color: "var(--accent)", textDecoration: "none" }}>Go back home</a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{ 
        padding: "12px 20px", borderBottom: "1px solid var(--border)", 
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-secondary)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ClaudeLogo size={24} />
          <span style={{ fontWeight: 600 }}>{chat.title}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          Shared via Patel AI
        </div>
      </div>

      {/* Messages */}
      <div className="custom-scroll" style={{ flex: 1, overflowY: "auto", padding: "24px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {chat.messages.map((msg) => (
            <Message key={msg.id} msg={msg} isReadOnly={true} />
          ))}
          <div style={{ height: 40 }} />
          <div style={{ 
            padding: 24, borderRadius: 12, border: "1px solid var(--border)", 
            textAlign: "center", background: "var(--bg-tertiary)" 
          }}>
            <p style={{ marginBottom: 16, fontSize: 14 }}>This is a shared conversation. Start your own with Patel AI.</p>
            <a href="/" style={{ 
              display: "inline-block", padding: "8px 16px", borderRadius: 8, 
              background: "var(--accent)", color: "white", textDecoration: "none", fontWeight: 500
            }}>
              Start New Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
