import { useState } from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SettingsModal } from "@/components/chat/SettingsModal";
import { mockConversation } from "@/lib/mock-data";
import { useTheme } from "@/hooks/use-theme";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [model, setModel] = useState("gpt-4o");
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar
        open={sidebarOpen}
        onSettingsOpen={() => setSettingsOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 shrink-0 flex items-center gap-2 px-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <ModelSelector value={model} onChange={setModel} />
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 scrollbar-thin">
          <div className="divide-y divide-border/40">
            {mockConversation.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput />
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
