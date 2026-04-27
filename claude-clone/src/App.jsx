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
import MagicLoader from "./components/ui/MagicLoader.jsx";

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
  const [model, setModel] = useState("mistralai/mistral-nemotron");
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
    }, 20);
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [activeMessages, isTyping, scrollToBottom]);

  useEffect(() => {
    const handleOpenArtifact = (e) => setActiveArtifact(e.detail);
    window.addEventListener("patel-open-artifact", handleOpenArtifact);
    return () => window.removeEventListener("patel-open-artifact", handleOpenArtifact);
  }, []);

  const stopStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current(); 
      abortRef.current = null;
    }
    stopTypingEffect();
    setIsStreaming(false);
  }, [stopTypingEffect]);

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
    
    setIsTyping(true); // START MAGIC LOADER

    let isFirstChunk = true;
    let actualModelName = model;
    const history = getHistory(convId);
    
    // We wrap streamMessage in a small timeout so the UI updates
    setTimeout(() => {
      const abort = streamMessage(text, history, attachments, {
        model: model,
        systemPrompt: PERSONAS.find(p => p.id === personaId)?.prompt || PERSONAS[0].prompt,
        onModelSelect: (m) => { actualModelName = m; },
        onChunk: (token) => { 
          if (isFirstChunk) { // Only set up the assistant message block once the AI has actually begun streaming text!
            isFirstChunk = false;
            setIsTyping(false); // STOP LOADER
            const assistantId = nextIdRef.current++;
            addMessage(convId, { id: assistantId, role: "assistant", content: "", time: timeStr, model: actualModelName });
            setIsStreaming(true);
            typingQueueRef.current = "";
            startTypingEffect(convId, actualModelName);
          }
          typingQueueRef.current += token; 
        },
        onDone: () => {
          // Fallback if nothing was ever streamed
          if (isFirstChunk) {
            isFirstChunk = false;
            setIsTyping(false);
            const assistantId = nextIdRef.current++;
            addMessage(convId, { id: assistantId, role: "assistant", content: "", time: timeStr, model: actualModelName });
            setIsStreaming(true);
            typingQueueRef.current = "";
            startTypingEffect(convId, actualModelName);
          }

          const checkDone = setInterval(() => {
            if (typingQueueRef.current.length === 0) {
              clearInterval(checkDone);
              stopTypingEffect();
              setIsStreaming(false);
              abortRef.current = null;
              saveFinalMessages(convId, [...activeMessages, userMsg, { id: nextIdRef.current - 1, role: "assistant", content: displayContentRef.current, time: timeStr, model: actualModelName }]);
            }
          }, 50);
        },
        onError: (err) => {
          if (isFirstChunk) { setIsTyping(false); }
          stopTypingEffect();
          updateLastAssistantMessage(convId, "⚠️ Error.", actualModelName);
          setIsStreaming(false);
          abortRef.current = null;
        },
      });
      abortRef.current = abort;
    }, 400);
  }, [isStreaming, activeId, personaId, createConversation, addMessage, updateLastAssistantMessage, getHistory, model, saveFinalMessages, activeMessages, startTypingEffect, stopTypingEffect]);

  const displayMessages = useMemo(() => {
    const lastIdx = activeMessages.length - 1;
    return activeMessages.map((m, i) => ({
      ...m,
      streaming: isStreaming && i === lastIdx && m.role === "assistant",
    }));
  }, [activeMessages, isStreaming]);

  if (authLoading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <MagicLoader size={60} speed={1.5} particleCount={2} hueRange={[10, 40]} />
      <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>Authenticating...</div>
    </div>
  );

  if (!user) return <AuthPage onAuthSuccess={(user) => setUser(user)} />;

  return (
    <>
      <div
        className={darkMode ? "dark-mode theme-transition" : "theme-transition"}
        style={{
          display: "grid",
          gridTemplateColumns: `
            ${desktopSidebarOpen ? "260px" : "0px"} 
            1fr 
            ${activeArtifact ? "min(95vw, 650px)" : "0px"}
          `,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          background: "var(--bg-primary, #ffffff)",
          color: "var(--text-primary)",
          fontFamily: "'Inter', sans-serif",
          transition: "grid-template-columns 300ms cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
      {/* Sidebar Area */}
      <div style={{ overflow: "hidden", borderRight: desktopSidebarOpen ? "1px solid var(--border)" : "none", background: "var(--bg-secondary)" }}>
        <Sidebar
          conversations={conversations} activeId={activeId}
          onNew={() => { newChat(); setSidebarOpen(false); }} onSelect={(id) => { selectConversation(id); setSidebarOpen(false); }}
          onDelete={deleteConversation} onRename={renameConversation}
          onShare={() => {}} onLogout={handleLogout} user={user}
          darkMode={darkMode} toggleDark={toggleDark} mobile={false}
          searchInputRef={searchInputRef}
        />
      </div>

      {/* Main Chat Flow Area */}
      <div style={{ 
          display: "grid",
          gridTemplateRows: "56px 1fr auto",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          background: "var(--bg-primary, #ffffff)"
      }}>
          <Navbar model={model} setModel={setModel} 
            personaId={personaId} setPersonaId={setPersonaId}
            darkMode={darkMode} toggleDark={toggleDark}
            onToggleSidebar={() => setDesktopSidebarOpen(!desktopSidebarOpen)} onShare={() => {}} onExportPDF={() => {}} 
          />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div ref={chatContainerRef} className="custom-scroll" style={{ 
                flex: 1, 
                overflowY: "auto", 
                background: "transparent"
            }}>
                {convsLoading ? (
                   <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", justifyContent: "center", height: "100%", paddingBottom: "20vh" }}>
                      <MagicLoader size={60} speed={1.5} particleCount={2} hueRange={[10, 40]} />
                   </div>
                ) : displayMessages.length === 0 && !isTyping ? (
                  <WelcomeScreen onSuggestion={(text) => setInitialInput(text)} />
                ) : (
                  <div style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "24px 24px 40px" }}>
                    {displayMessages.map((msg) => (
                        <Message key={msg.id} msg={msg} isStreaming={msg.streaming} onEdit={() => {}} onRegenerate={() => {}} />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                )}
            </div>
          </div>

          <InputArea
            onSend={handleSend} isStreaming={isStreaming} onStop={stopStream}
            initialValue={initialInput} setInitialValue={setInitialInput} onEditLast={() => {}}
            isWelcomeScreen={displayMessages.length === 0 && !isTyping}
          />
      </div>

      {/* Artifact Panel Area */}
      <div style={{ 
          overflow: "hidden", 
          borderLeft: activeArtifact ? "1px solid var(--border)" : "none",
          background: "var(--bg-secondary)",
          display: "flex",
          height: "100%"
      }}>
        {activeArtifact && (
          <ArtifactPanel artifact={activeArtifact} onClose={() => setActiveArtifact(null)} />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <Sidebar
          conversations={conversations} activeId={activeId}
          onNew={() => { newChat(); setSidebarOpen(false); }} onSelect={(id) => { selectConversation(id); setSidebarOpen(false); }}
          onDelete={deleteConversation} onRename={renameConversation}
          onShare={() => {}} onLogout={handleLogout} user={user}
          darkMode={darkMode} toggleDark={toggleDark}
          mobile={true} onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
    </>
  );
}
