import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  type ChatSession,
  type ChatMessage,
  type AIModel,
  type ChatMode,
  type Attachment,
} from "@/lib/mock-data";
import mockApi from "@/lib/mock-api";

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string;
  activeSession: ChatSession;
  models: AIModel[];
  selectedModel: string;
  mode: ChatMode;
  isLoading: boolean;
  isSending: boolean;
  setSelectedModel: (m: string) => void;
  setMode: (m: ChatMode) => void;
  addCustomModel: (label: string) => void;
  removeCustomModel: (value: string) => void;
  switchSession: (id: string) => void;
  createNewChat: () => void;
  deleteChat: (id: string) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be inside ChatProvider");
  return ctx;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [mode, setMode] = useState<ChatMode>("default");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Initial data fetch
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setIsLoading(true);
      const [fetchedSessions, fetchedModels] = await Promise.all([
        mockApi.sessions.fetch(),
        mockApi.models.fetch(),
      ]);
      if (cancelled) return;
      setSessions(fetchedSessions);
      setModels(fetchedModels);
      setActiveSessionId(fetchedSessions[0]?.id ?? "");
      setIsLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0] ?? {
    id: "",
    title: "",
    date: "",
    messages: [],
  };

  const switchSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const createNewChat = useCallback(async () => {
    const session = await mockApi.sessions.create();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
  }, []);

  const deleteChat = useCallback(async (id: string) => {
    await mockApi.sessions.delete(id);
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (id === activeSessionId && next.length > 0) {
        setActiveSessionId(next[0].id);
      }
      return next;
    });
  }, [activeSessionId]);

  const addCustomModel = useCallback(async (label: string) => {
    const model = await mockApi.models.add(label);
    setModels((prev) => {
      if (prev.some((m) => m.value === model.value)) return prev;
      return [...prev, model];
    });
    setSelectedModel(model.value);
  }, []);

  const removeCustomModel = useCallback(async (value: string) => {
    await mockApi.models.remove(value);
    setModels((prev) => prev.filter((m) => m.value !== value));
    setSelectedModel((cur) => (cur === value ? "gpt-4o" : cur));
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (isSending) return;
      setIsSending(true);

      try {
        const res = await mockApi.messages.send({
          sessionId: activeSessionId,
          content,
          attachments,
          model: selectedModel,
          mode,
        });

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            return {
              ...s,
              title: res.updatedSessionTitle ?? s.title,
              messages: [...s.messages, res.userMessage, res.assistantMessage],
            };
          })
        );
      } finally {
        setIsSending(false);
      }
    },
    [activeSessionId, selectedModel, mode, isSending]
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
        isLoading,
        isSending,
        setSelectedModel,
        setMode,
        addCustomModel,
        removeCustomModel,
        switchSession,
        createNewChat,
        deleteChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
