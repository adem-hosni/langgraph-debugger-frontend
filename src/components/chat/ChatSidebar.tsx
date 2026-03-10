import { Plus, MessageSquare, Settings, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/lib/mock-data";

interface ChatSidebarProps {
  open: boolean;
  onSettingsOpen: () => void;
  theme: "light" | "dark" | "system";
  onThemeToggle: () => void;
}

export function ChatSidebar({ open, onSettingsOpen, theme, onThemeToggle }: ChatSidebarProps) {
  const { sessions, activeSessionId, switchSession, createNewChat } = useChatContext();

  if (!open) return null;

  const grouped = sessions.reduce<Record<string, ChatSession[]>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border h-screen animate-slide-in-left">
      <div className="p-3 animate-fade-in">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-sidebar hover:bg-sidebar-accent border-sidebar-border transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
          onClick={createNewChat}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Chat</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 scrollbar-thin">
        {Object.entries(grouped).map(([date, chats], groupIdx) => (
          <div key={date} className="mb-4 animate-fade-in" style={{ animationDelay: `${groupIdx * 0.05}s` }}>
            <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">{date}</p>
            {chats.map((s, i) => (
              <button
                key={s.id}
                onClick={() => switchSession(s.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-all duration-200 group relative",
                  s.id === activeSessionId
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-0.5"
                )}
                style={{ animationDelay: `${(groupIdx * chats.length + i) * 0.03}s` }}
              >
                {/* Active accent bar */}
                {s.id === activeSessionId && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-accent-blue transition-all duration-300" />
                )}
                <MessageSquare className={cn(
                  "inline h-3.5 w-3.5 mr-2 transition-colors duration-200",
                  s.id === activeSessionId ? "text-accent-blue" : "opacity-40 group-hover:opacity-70"
                )} />
                {s.title}
              </button>
            ))}
          </div>
        ))}
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border flex items-center gap-1 animate-fade-in">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          onClick={onThemeToggle}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : theme === "light" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          onClick={onSettingsOpen}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
