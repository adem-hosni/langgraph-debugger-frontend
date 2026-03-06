import { useChatContext } from "@/hooks/use-chat";
import { chatModes, type ChatMode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Brain, Search, Lightbulb, Zap, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const modeIcons: Record<ChatMode, typeof Brain> = {
  default: MessageSquare,
  thinking: Brain,
  research: Search,
  creative: Lightbulb,
  concise: Zap,
};

export function ModeSelector() {
  const { mode, setMode } = useChatContext();
  const currentMode = chatModes.find((m) => m.value === mode)!;
  const Icon = modeIcons[mode];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7 px-2">
          <Icon className="h-3.5 w-3.5" />
          {currentMode.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {chatModes.map((m) => {
          const MIcon = modeIcons[m.value];
          return (
            <DropdownMenuItem
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn("gap-2 cursor-pointer", mode === m.value && "bg-accent")}
            >
              <MIcon className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
