import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingBlockProps {
  content: string;
}

export function ThinkingBlock({ content }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-chat-thinking my-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin-slow opacity-60" />
        <span>Thought for 12 seconds</span>
        <ChevronDown className={cn("h-3.5 w-3.5 ml-auto transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border-t border-border/50 pt-3">
          {content}
        </div>
      )}
    </div>
  );
}
