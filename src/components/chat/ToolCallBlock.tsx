import { useState } from "react";
import { ChevronDown, Globe, Code, Database, Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ToolCall } from "@/lib/mock-data";

const iconMap = {
  globe: Globe,
  code: Code,
  database: Database,
  search: Search,
};

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Done", className: "bg-accent-green/10 text-accent-green border-accent-green/20" },
  running: { icon: Loader2, label: "Running", className: "bg-accent-blue/10 text-accent-blue border-accent-blue/20" },
  error: { icon: AlertCircle, label: "Error", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function ToolCallBlock({ tool }: { tool: ToolCall }) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[tool.icon];
  const status = statusConfig[tool.status];
  const StatusIcon = status.icon;

  return (
    <div className="rounded-lg border bg-chat-tool my-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors rounded-lg"
      >
        <Icon className="h-4 w-4 text-accent-blue shrink-0" />
        <span className="font-medium">{tool.name}</span>
        <Badge variant="outline" className={cn("ml-auto text-xs gap-1 py-0.5", status.className)}>
          <StatusIcon className={cn("h-3 w-3", tool.status === "running" && "animate-spin")} />
          {status.label}
        </Badge>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2 border-t border-border/50 pt-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Input</p>
            <pre className="text-xs bg-chat-code rounded-md p-3 overflow-x-auto font-mono">
              {JSON.stringify(tool.input, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Output</p>
            <pre className="text-xs bg-chat-code rounded-md p-3 overflow-x-auto font-mono">
              {JSON.stringify(tool.output, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
