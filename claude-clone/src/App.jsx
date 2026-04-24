import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTheme } from "./hooks/useTheme.js";
import { useConversations } from "./hooks/useConversations.js";
import { useShortcuts } from "./hooks/useShortcuts.js";
import { streamMessage } from "./utils/api.js";
import { PERSONAS } from "./utils/personas.js";

import Sidebar from "./components/layout/Sidebar.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import ArtifactPanel from "./components/layout/ArtifactPanel.jsx";
import Message from "./components/chat/Message.jsx";
import TypingIndicator from "./components/chat/TypingIndicator.jsx";
import WelcomeScreen from "./components/chat/WelcomeScreen.jsx";
import InputArea from "./components/chat/InputArea.jsx";

export default function App() {
  const { darkMode, toggleDark } = useTheme();
  const {
    conversations,
    activeId,
    activeMessages,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    deleteConversation,
    selectConversation,
    newChat,
    getHistory,
    truncateConversation,
    exportConversation,
  } = useConversations();

  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [personaId, setPersonaId] = useState("patel");
  const [model, setModel] = useState("sonnet");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [initialInput, setInitialInput] = useState("");
  const [activeArtifact, setActiveArtifact] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const abortRef = useRef(null);
  const nextIdRef = useRef(100);

  // ─── Auto-scroll ───────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [activeMessages, isTyping, scrollToBottom]);

  useEffect(() => {
    const handleOpenArtifact = (e) => setActiveArtifact(e.detail);
    window.addEventListener("patel-open-artifact", handleOpenArtifact);
    return () => window.removeEventListener("patel-open-artifact", handleOpenArtifact);
  }, []);

  // ─── Stop streaming ────────────────────────────────────
  const stopStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current(); // call the abort function from streamMessage
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // ─── Send message ──────────────────────────────────────
  const handleSend = useCallback((text, attachments = []) => {
    if (isStreaming) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Determine or create conversation
    let convId = activeId;
    if (!convId) {
      // Create title from text or first attachment
      const titleSrc = text || (attachments.length > 0 ? attachments[0].name : "New Chat");
      convId = createConversation(titleSrc);
    }

    // Add user message to conversation
    const userMsg = { id: nextIdRef.current++, role: "user", content: text, attachments, time: timeStr };
    addMessage(convId, userMsg);

    // Show typing indicator
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Add empty assistant message (will be filled by streaming)
      const assistantId = nextIdRef.current++;
      const assistantMsg = { id: assistantId, role: "assistant", content: "", time: timeStr, streaming: true };
      addMessage(convId, assistantMsg);
      setIsStreaming(true);

      // Get conversation history for multi-turn context
      const history = getHistory(convId);

      // Start SSE streaming
      const selectedPersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];

      let accumulated = "";
      const abort = streamMessage(text, history, attachments, {
        systemPrompt: selectedPersona.prompt,
        onChunk: (token) => {
          accumulated += token;
          updateLastAssistantMessage(convId, accumulated);
        },
        onDone: () => {
          setIsStreaming(false);
          abortRef.current = null;
          // Mark streaming complete — update the message to not be streaming
          updateLastAssistantMessage(convId, accumulated);
        },
        onError: (err) => {
          console.error("Stream error:", err);
          const fallback = accumulated || "❌ ⚠️ All AI servers are busy right now. Please try again in a few seconds.";
          updateLastAssistantMessage(convId, fallback);
          setIsStreaming(false);
          abortRef.current = null;
        },
      });

      abortRef.current = abort;
    }, 400);
  }, [isStreaming, activeId, personaId, createConversation, addMessage, updateLastAssistantMessage, getHistory]);

  // ─── Edit & Regenerate ─────────────────────────────────
  const handleEditMessage = useCallback((msgId, newText) => {
    if (isStreaming || !activeId) return;
    truncateConversation(activeId, msgId);
    handleSend(newText);
  }, [isStreaming, activeId, truncateConversation, handleSend]);

  const handleRegenerateMessage = useCallback((msgId) => {
    if (isStreaming || !activeId) return;
    
    // msgId is the assistant's message. We need to find the user message right before it.
    const msgIndex = activeMessages.findIndex(m => m.id === msgId);
    if (msgIndex <= 0) return;
    
    const userMsg = activeMessages[msgIndex - 1];
    if (userMsg.role !== "user") return;

    // Truncate at the assistant message (removing it and everything after)
    truncateConversation(activeId, msgId);
    // Send the user message content again to trigger new generation
    handleSend(userMsg.content);
  }, [isStreaming, activeId, activeMessages, truncateConversation, handleSend]);

  const handleEditLast = useCallback(() => {
    if (isStreaming || !activeId || activeMessages.length === 0) return;
    // Find last user message
    const msgs = [...activeMessages].reverse();
    const lastUser = msgs.find(m => m.role === "user");
    if (lastUser) {
      setInitialInput(lastUser.content);
      // Wait for React to render InputArea with updated initialInput, then truncate
      setTimeout(() => truncateConversation(activeId, lastUser.id), 0);
    }
  }, [activeId, activeMessages, isStreaming, truncateConversation]);

  // ─── Export Conversation ───────────────────────────────
  const handleShare = useCallback(() => {
    if (!activeId) return;
    const md = exportConversation(activeId);
    if (!md) return;

    const activeConv = conversations.find((c) => c.id === activeId);
    const filename = `${(activeConv?.title || "conversation").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeId, conversations, exportConversation]);

  // ─── PDF Export ────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    if (!chatContainerRef.current || !activeId) return;
    
    const activeConv = conversations.find((c) => c.id === activeId);
    const filename = `${(activeConv?.title || "conversation").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
    
    const element = chatContainerRef.current;
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert("PDF library is still loading. Please try again in a moment.");
    }
  }, [activeId, conversations]);

  // ─── Navigation ────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    newChat();
    setSidebarOpen(false);
  }, [newChat]);

  const handleSelectConv = useCallback((id) => {
    selectConversation(id);
    setSidebarOpen(false);
  }, [selectConversation]);

  const handleSuggestion = useCallback((text) => setInitialInput(text), []);

  // Build display messages from active conversation
  const displayMessages = useMemo(() => {
    return activeMessages.map((m) => ({
      ...m,
      streaming: isStreaming && m === activeMessages[activeMessages.length - 1] && m.role === "assistant",
    }));
  }, [activeMessages, isStreaming]);

  // ─── Shortcuts ─────────────────────────────────────────
  useShortcuts({
    onSearch: () => {
      setDesktopSidebarOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    },
    onNewChat: handleNewChat,
    onCopyLast: () => {
      const msgs = [...activeMessages].reverse();
      const lastAsst = msgs.find(m => m.role === "assistant");
      if (lastAsst) navigator.clipboard.writeText(lastAsst.content).catch(() => {});
    },
    onToggleSidebar: () => setDesktopSidebarOpen(prev => !prev),
    onEscape: stopStream,
  });



  // ─── Render ────────────────────────────────────────────
  return (
    <div
      className={darkMode ? "dark-mode" : ""}
      style={{
        display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
        background: "var(--bg-primary)", color: "var(--text-primary)",
        fontFamily: "'Söhne', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Desktop Sidebar */}
      {desktopSidebarOpen && (
        <div className="desktop-sidebar" style={{ display: "flex", flexShrink: 0, height: "100%", width: 260, borderRight: "1px solid var(--border)", transition: "width 200ms ease" }}>
          <Sidebar
            conversations={conversations} activeId={activeId}
            onNew={handleNewChat} onSelect={handleSelectConv}
            darkMode={darkMode} toggleDark={toggleDark} mobile={false}
            searchInputRef={searchInputRef}
          />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <Sidebar
          conversations={conversations} activeId={activeId}
          onNew={handleNewChat} onSelect={handleSelectConv}
          darkMode={darkMode} toggleDark={toggleDark}
          mobile={true} onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <Navbar model={model} setModel={setModel} 
          personaId={personaId} setPersonaId={setPersonaId}
          darkMode={darkMode} toggleDark={toggleDark}
          onToggleSidebar={() => setSidebarOpen(true)} onShare={handleShare} onExportPDF={handleExportPDF} />

        {displayMessages.length === 0 && !isTyping ? (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        ) : (
          <div ref={chatContainerRef} className="custom-scroll" style={{ flex: 1, overflowY: "auto", padding: "24px 24px 140px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              {displayMessages.map((msg) => (
                <Message key={msg.id} msg={msg} isStreaming={msg.streaming} onEdit={handleEditMessage} onRegenerate={handleRegenerateMessage} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <InputArea
          onSend={handleSend} isStreaming={isStreaming} onStop={stopStream}
          initialValue={initialInput} setInitialValue={setInitialInput} onEditLast={handleEditLast}
        />
      </div>

      {/* Artifact Panel */}
      {activeArtifact && (
        <ArtifactPanel artifact={activeArtifact} onClose={() => setActiveArtifact(null)} />
      )}
    </div>
  );
}