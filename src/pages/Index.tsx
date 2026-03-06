import { useState } from "react";
import { PanelLeftClose, PanelLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SettingsModal } from "@/components/chat/SettingsModal";
import { ChatProvider, useChatContext } from "@/hooks/use-chat";
import { useTheme } from "@/hooks/use-theme";

function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, cycle: toggleTheme } = useTheme();
  const { activeSession } = useChatContext();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar
        open={sidebarOpen}
        onSettingsOpen={() => setSettingsOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 shrink-0 flex items-center gap-2 px-3 border-b">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <ModelSelector />
        </header>

        {activeSession.messages.length === 0 ? (
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
