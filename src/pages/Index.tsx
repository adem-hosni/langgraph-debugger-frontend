import { useState, useEffect, useRef } from "react";
import { PanelLeftClose, PanelLeft, MessageSquare, Rocket, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SettingsModal } from "@/components/chat/SettingsModal";
import { GraphDebugger } from "@/components/graph/GraphDebugger";
import { ChatProvider, useChatContext } from "@/hooks/use-chat";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

function TypingIndicator() {
  return (
    <div className="py-6 px-4 md:px-0 animate-fade-in">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 bg-accent-blue/10">
          <Sparkles className="h-4 w-4 text-accent-blue" />
        </div>
        <div className="flex items-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-typing-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-typing-dot" style={{ animationDelay: "0.2s" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-typing-dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}

function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"chat" | "graph">("chat");
  const { theme, cycle: toggleTheme } = useTheme();
  const { activeSession, isLoading, isSending } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 100);
      }
    }
  }, [activeSession.messages.length]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {activeView === "chat" && (
        <ChatSidebar
          open={sidebarOpen}
          onSettingsOpen={() => setSettingsOpen(true)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-12 shrink-0 flex items-center px-3 border-b border-border animate-fade-in backdrop-blur-sm bg-background/80">
          <div className="flex items-center gap-2 min-w-[140px]">
            {activeView === "chat" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-all duration-200 hover:rotate-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <div className="transition-transform duration-300" style={{ transform: sidebarOpen ? "rotateY(0deg)" : "rotateY(180deg)" }}>
                  {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                </div>
              </Button>
            )}
            <span className="text-sm font-semibold text-foreground tracking-tight">LangGraph Studio</span>
          </div>

          <div className="flex-1 flex justify-center">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "chat" | "graph")}>
              <TabsList className="h-8">
                <TabsTrigger value="chat" className="text-xs px-4 h-7 transition-all duration-200 data-[state=active]:shadow-sm">Chat View</TabsTrigger>
                <TabsTrigger value="graph" className="text-xs px-4 h-7 transition-all duration-200 data-[state=active]:shadow-sm">Graph Debugger</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2 min-w-[140px] justify-end">
            {activeView === "chat" && <ModelSelector />}
            {activeView === "graph" && (
              <Button size="sm" className="h-8 gap-1.5 text-xs transition-all duration-200 hover:shadow-md active:scale-95">
                <Rocket className="h-3.5 w-3.5" />
                Deploy
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        {activeView === "chat" ? (
          <>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center animate-fade-in">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading conversations...</span>
              </div>
            ) : activeSession.messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center animate-fade-in-up">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 flex items-center justify-center animate-glow-pulse">
                    <MessageSquare className="h-7 w-7 text-accent-blue" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">How can I help you today?</h2>
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Start a conversation by typing a message below, or upload files to analyze.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 scrollbar-thin" ref={scrollRef}>
                <div className="divide-y divide-border/30">
                  {activeSession.messages.map((msg, i) => (
                    <ChatMessage key={msg.id} message={msg} index={i} />
                  ))}
                  {isSending && <TypingIndicator />}
                </div>
              </ScrollArea>
            )}
            <ChatInput />
          </>
        ) : (
          <div className="flex-1 animate-fade-in">
            <GraphDebugger />
          </div>
        )}
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
const Index = () => (
  <ChatProvider>
    <ChatApp />
  </ChatProvider>
);

export default Index;
