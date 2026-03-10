import { useState } from "react";
import { ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingBlockProps {
  content: string;
}

export function ThinkingBlock({ content }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border/40 bg-chat-thinking my-3 animate-scale-in overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group"
      >
        <Brain className="h-3.5 w-3.5 text-accent-amber group-hover:scale-110 transition-transform duration-200" />
        <span className="text-xs">Thought for 12 seconds</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 ml-auto transition-transform duration-300",
          open && "rotate-180"
        )} />
      </button>
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border-t border-border/30 pt-3">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
