import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTheme } from "./hooks/useTheme.js";
import { useConversations } from "./hooks/useConversations.js";
import { useShortcuts } from "./hooks/useShortcuts.js";
import { streamMessage } from "./utils/api.js";
import { PERSONAS } from "./utils/personas.js";
import { supabase } from "./utils/supabase.js";

import Sidebar from "./components/layout/Sidebar.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import ArtifactPanel from "./components/layout/ArtifactPanel.jsx";
import Message from "./components/chat/Message.jsx";
import TypingIndicator from "./components/chat/TypingIndicator.jsx";
import WelcomeScreen from "./components/chat/WelcomeScreen.jsx";
import InputArea from "./components/chat/InputArea.jsx";
import AuthPage from "./components/chat/AuthPage.jsx";

export default function App() {
  const { darkMode, toggleDark } = useTheme();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const {
    conversations,
    activeId,
    activeMessages,
    isLoading: convsLoading,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    saveFinalMessages,
    deleteConversation,
    renameConversation,
    selectConversation,
    newChat,
    getHistory,
    truncateConversation,
    exportConversation,
  } = useConversations(user?.id);

  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [personaId, setPersonaId] = useState("patel");
  const [model, setModel] = useState("nvidia/nemotron-3-super-120b-a12b:free");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [initialInput, setInitialInput] = useState("");
  const [activeArtifact, setActiveArtifact] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const abortRef = useRef(null);
  const nextIdRef = useRef(100);

  // ─── Visual Typing Logic ──────────────────────────────
  const typingQueueRef = useRef("");
  const displayContentRef = useRef("");
  const typingIntervalRef = useRef(null);

  const startTypingEffect = useCallback((convId, initialModel) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    displayContentRef.current = "";
    typingIntervalRef.current = setInterval(() => {
      if (typingQueueRef.current.length > 0) {
        const speed = Math.floor(Math.random() * 3) + 1; 
        const chunk = typingQueueRef.current.substring(0, speed);
        typingQueueRef.current = typingQueueRef.current.substring(speed);
        displayContentRef.current += chunk;
        updateLastAssistantMessage(convId, displayContentRef.current, initialModel);
      }
    }, 25);
  }, [updateLastAssistantMessage]);

  const stopTypingEffect = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    typingQueueRef.current = "";
  }, []);

  // ─── Auth Listener ─────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

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
      abortRef.current(); 
      abortRef.current = null;
    }
    stopTypingEffect();
    setIsStreaming(false);
  }, [stopTypingEffect]);

  // ─── Send message ──────────────────────────────────────
  const handleSend = useCallback(async (text, attachments = []) => {
    if (isStreaming) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let convId = activeId;
    if (!convId) {
      const titleSrc = text || (attachments.length > 0 ? attachments[0].name : "New Chat");
      convId = await createConversation(titleSrc);
      if (!convId) return;
    }

    const userMsg = { id: nextIdRef.current++, role: "user", content: text, attachments, time: timeStr };
    addMessage(convId, userMsg);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const assistantId = nextIdRef.current++;
      const assistantMsg = { id: assistantId, role: "assistant", content: "", time: timeStr, streaming: true, model: model };
      addMessage(convId, assistantMsg);
      setIsStreaming(true);

      const history = getHistory(convId);
      const selectedPersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];

      typingQueueRef.current = "";
      let actualModelName = model;
      startTypingEffect(convId, actualModelName);

      const abort = streamMessage(text, history, attachments, {
        model: model,
        systemPrompt: selectedPersona.prompt,
        onModelSelect: (m) => { actualModelName = m; },
        onChunk: (token) => {
          typingQueueRef.current += token;
        },
        onDone: () => {
          const checkDone = setInterval(() => {
            if (typingQueueRef.current.length === 0) {
              clearInterval(checkDone);
              stopTypingEffect();
              setIsStreaming(false);
              abortRef.current = null;
              saveFinalMessages(convId, [...activeMessages, userMsg, { id: assistantId, role: "assistant", content: displayContentRef.current, time: timeStr, model: actualModelName }]);
            }
          }, 100);
        },
        onError: (err) => {
          console.error("Stream error:", err);
          stopTypingEffect();
          updateLastAssistantMessage(convId, "⚠️ Server busy. Please try again.", actualModelName);
          setIsStreaming(false);
          abortRef.current = null;
        },
      });

      abortRef.current = abort;
    }, 400);
  }, [isStreaming, activeId, personaId, createConversation, addMessage, updateLastAssistantMessage, getHistory, model, saveFinalMessages, activeMessages, startTypingEffect, stopTypingEffect]);

  // ─── Shortcuts ─────────────────────────────────────────
  useShortcuts({
    onSearch: () => {
      setDesktopSidebarOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    },
    onNewChat: () => { newChat(); setSidebarOpen(false); },
    onCopyLast: () => {
      const msgs = [...activeMessages].reverse();
      const lastAsst = msgs.find(m => m.role === "assistant");
      if (lastAsst) navigator.clipboard.writeText(lastAsst.content).catch(() => {});
    },
    onToggleSidebar: () => setDesktopSidebarOpen(prev => !prev),
    onEscape: stopStream,
  });

  const displayMessages = useMemo(() => {
    const lastIdx = activeMessages.length - 1;
    return activeMessages.map((m, i) => ({
      ...m,
      // ONLY the very last assistant message gets the cursor during streaming
      streaming: isStreaming && i === lastIdx && m.role === "assistant",
    }));
  }, [activeMessages, isStreaming]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D97757]"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={(user) => setUser(user)} />;
  }

  return (
    <div
      className={darkMode ? "dark-mode" : ""}
      style={{
        display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
        background: "var(--bg-primary, #ffffff)", color: "var(--text-primary)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden", 
        position: "relative",
        background: "var(--bg-primary, #ffffff)"
      }}>
        {desktopSidebarOpen && (
          <div className="desktop-sidebar" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, borderRight: "1px solid var(--border)", background: "var(--bg-secondary)", zIndex: 60 }}>
            <Sidebar
              conversations={conversations} activeId={activeId}
              onNew={() => { newChat(); setSidebarOpen(false); }} onSelect={(id) => { selectConversation(id); setSidebarOpen(false); }}
              onDelete={deleteConversation} onRename={renameConversation}
              onShare={handleLogout} onLogout={handleLogout} user={user}
              darkMode={darkMode} toggleDark={toggleDark} mobile={false}
              searchInputRef={searchInputRef}
            />
          </div>
        )}

        {sidebarOpen && (
          <Sidebar
            conversations={conversations} activeId={activeId}
            onNew={() => { newChat(); setSidebarOpen(false); }} onSelect={(id) => { selectConversation(id); setSidebarOpen(false); }}
            onDelete={deleteConversation} onRename={renameConversation}
            onShare={handleLogout} onLogout={handleLogout} user={user}
            darkMode={darkMode} toggleDark={toggleDark}
            mobile={true} onClose={() => setSidebarOpen(false)}
          />
        )}

        <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            marginLeft: desktopSidebarOpen ? 260 : 0, 
            transition: "margin 200ms ease" 
        }}>
            <Navbar model={model} setModel={setModel} 
            personaId={personaId} setPersonaId={setPersonaId}
            darkMode={darkMode} toggleDark={toggleDark}
            onToggleSidebar={() => setDesktopSidebarOpen(!desktopSidebarOpen)} onShare={() => {}} onExportPDF={() => {}} />

            {convsLoading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D97757]"></div>
            </div>
            ) : displayMessages.length === 0 && !isTyping ? (
            <WelcomeScreen onSuggestion={(text) => setInitialInput(text)} />
            ) : (
            <div ref={chatContainerRef} className="custom-scroll" style={{ 
                flex: 1, 
                overflowY: "auto", 
                padding: "24px 24px 180px", 
                background: "var(--bg-primary, #ffffff)"
            }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                {displayMessages.map((msg) => (
                    <Message key={msg.id} msg={msg} isStreaming={msg.streaming} onEdit={() => {}} onRegenerate={() => {}} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
                </div>
            </div>
            )}

            <InputArea
            onSend={handleSend} isStreaming={isStreaming} onStop={stopStream}
            initialValue={initialInput} setInitialValue={setInitialInput} onEditLast={() => {}}
            />
        </div>
      </div>

      {activeArtifact && (
        <ArtifactPanel artifact={activeArtifact} onClose={() => setActiveArtifact(null)} />
      )}
    </div>
  );
}
