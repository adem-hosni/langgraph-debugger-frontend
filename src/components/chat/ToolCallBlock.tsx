import { useState } from "react";
import { ChevronDown, Globe, Code, Database, Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCall } from "@/lib/mock-data";

const iconMap = {
  globe: Globe,
  code: Code,
  database: Database,
  search: Search,
};

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Done", color: "text-accent-green" },
  running: { icon: Loader2, label: "Running", color: "text-accent-blue" },
  error: { icon: AlertCircle, label: "Error", color: "text-destructive" },
};

export function ToolCallBlock({ tool, index = 0 }: { tool: ToolCall; index?: number }) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[tool.icon];
  const status = statusConfig[tool.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="rounded-lg border border-border/50 bg-chat-tool my-2 animate-fade-in-left overflow-hidden transition-all duration-300"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent/30 transition-all duration-200 group"
      >
        <Icon className={cn(
          "h-4 w-4 shrink-0 transition-all duration-200",
          tool.status === "running" ? "text-accent-blue animate-pulse-icon" : "text-muted-foreground group-hover:text-foreground"
        )} />
        <span className="font-mono text-xs font-medium">{tool.name}</span>
        
        <span className={cn("ml-auto flex items-center gap-1.5 text-xs", status.color)}>
          <StatusIcon className={cn("h-3 w-3", tool.status === "running" && "animate-spin")} />
          <span className="font-mono text-[11px]">{status.label}</span>
        </span>
        
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-300 shrink-0",
          open && "rotate-180"
        )} />
      </button>
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="px-4 pb-3 space-y-2 border-t border-border/30 pt-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5">Input</p>
              <pre className="text-xs bg-chat-code rounded-md p-3 overflow-x-auto font-mono text-foreground/80">
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5">Output</p>
              <pre className="text-xs bg-chat-code rounded-md p-3 overflow-x-auto font-mono text-foreground/80">
                {JSON.stringify(tool.output, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
