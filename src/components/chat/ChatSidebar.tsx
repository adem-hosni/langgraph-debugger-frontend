import { Plus, MessageSquare, Settings, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatSessions, type ChatSession } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  open: boolean;
  onSettingsOpen: () => void;
  theme: "light" | "dark" | "system";
  onThemeToggle: () => void;
}

export function ChatSidebar({ open, onSettingsOpen, theme, onThemeToggle }: ChatSidebarProps) {
  if (!open) return null;

  const grouped = chatSessions.reduce<Record<string, ChatSession[]>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border h-screen">
      <div className="p-3">
        <Button variant="outline" className="w-full justify-start gap-2 bg-sidebar hover:bg-sidebar-accent">
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Chat</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 scrollbar-thin">
        {Object.entries(grouped).map(([date, sessions]) => (
          <div key={date} className="mb-4">
            <p className="px-3 py-1 text-xs font-medium text-muted-foreground">{date}</p>
            {sessions.map((s) => (
              <button
                key={s.id}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors",
                  s.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <MessageSquare className="inline h-3.5 w-3.5 mr-2 opacity-50" />
                {s.title}
              </button>
            ))}
          </div>
        ))}
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent" onClick={onThemeToggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : theme === "light" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </Button>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent" onClick={onSettingsOpen}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
