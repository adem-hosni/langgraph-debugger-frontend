import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  initialSessions,
  defaultModels,
  type ChatSession,
  type ChatMessage,
  type AIModel,
  type ChatMode,
  type Attachment,
} from "@/lib/mock-data";

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string;
  activeSession: ChatSession;
  models: AIModel[];
  selectedModel: string;
  mode: ChatMode;
  setSelectedModel: (m: string) => void;
  setMode: (m: ChatMode) => void;
  addCustomModel: (label: string) => void;
  removeCustomModel: (value: string) => void;
  switchSession: (id: string) => void;
  createNewChat: () => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be inside ChatProvider");
  return ctx;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState("1");
  const [models, setModels] = useState<AIModel[]>(defaultModels);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [mode, setMode] = useState<ChatMode>("default");

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  const switchSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const createNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      date: "Today",
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  }, []);

  const addCustomModel = useCallback((label: string) => {
    const value = label.toLowerCase().replace(/\s+/g, "-");
    if (models.some((m) => m.value === value)) return;
    setModels((prev) => [...prev, { value, label, custom: true }]);
    setSelectedModel(value);
  }, [models]);

  const removeCustomModel = useCallback((value: string) => {
    setModels((prev) => prev.filter((m) => m.value !== value));
    setSelectedModel((cur) => (cur === value ? "gpt-4o" : cur));
  }, []);

  const sendMessage = useCallback(
    (content: string, attachments?: Attachment[]) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        attachments: attachments?.length ? attachments : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };

      // Mock AI response
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I've received your message. You said:\n\n> ${content}\n\nThis is a mock response. In a real application, this would call the **${models.find((m) => m.value === selectedModel)?.label}** API${mode !== "default" ? ` in **${mode}** mode` : ""}.`,
        thinking: mode === "thinking" || mode === "research"
          ? `Analyzing the user's request step by step...\n\n1. Understanding the context\n2. Processing with ${selectedModel}\n3. Formulating a response using ${mode} mode`
          : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const updated = { ...s, messages: [...s.messages, userMsg, aiMsg] };
          // Update title from first message
          if (s.messages.length === 0) {
            updated.title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
          }
          return updated;
        })
      );
    },
    [activeSessionId, selectedModel, mode, models]
  );

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        models,
        selectedModel,
        mode,
        setSelectedModel,
        setMode,
        addCustomModel,
        removeCustomModel,
        switchSession,
        createNewChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
