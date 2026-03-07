import { useState } from "react";
import { PanelLeftClose, PanelLeft, MessageSquare, Rocket, Loader2 } from "lucide-react";
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

function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"chat" | "graph">("chat");
  const { theme, cycle: toggleTheme } = useTheme();
  const { activeSession, isLoading } = useChatContext();

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
        <header className="h-12 shrink-0 flex items-center px-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-[140px]">
            {activeView === "chat" && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </Button>
            )}
            <span className="text-sm font-semibold text-foreground tracking-tight">LangGraph Studio</span>
          </div>

          <div className="flex-1 flex justify-center">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "chat" | "graph")}>
              <TabsList className="h-8">
                <TabsTrigger value="chat" className="text-xs px-4 h-7">Chat View</TabsTrigger>
                <TabsTrigger value="graph" className="text-xs px-4 h-7">Graph Debugger</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2 min-w-[140px] justify-end">
            {activeView === "chat" && <ModelSelector />}
            {activeView === "graph" && (
              <Button size="sm" className="h-8 gap-1.5 text-xs">
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
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading conversations...</span>
              </div>
            ) : activeSession.messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-medium">How can I help you today?</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Start a conversation by typing a message below, or upload files to analyze.
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 scrollbar-thin">
                <div className="divide-y divide-border/40">
                  {activeSession.messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </div>
              </ScrollArea>
            )}
            <ChatInput />
          </>
        ) : (
          <GraphDebugger />
        )}
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

const Index = () => (
  <ChatProvider>
    <ChatApp />
  </ChatProvider>
);

export default Index;
