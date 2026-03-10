import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Play, Bot, Wrench, Square, CheckCircle2, AlertTriangle, Loader2, Circle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphNodeData } from "@/lib/graph-data";

const typeConfig = {
  start: { icon: Play, accent: "text-accent-green" },
  agent: { icon: Bot, accent: "text-accent-blue" },
  tool: { icon: Wrench, accent: "text-accent-amber" },
  end: { icon: Square, accent: "text-muted-foreground" },
};

function GraphNode({ data, selected }: NodeProps<GraphNodeData>) {
  const { icon: Icon, accent } = typeConfig[data.type];

  return (
    <div
      className={cn(
        "relative px-5 py-3.5 rounded-xl border bg-card shadow-elevated min-w-[180px] transition-all duration-300 group/node hover:scale-[1.03] hover:shadow-float",
        data.status === "running" && "border-accent-blue animate-border-glow shadow-[0_0_20px_-4px_hsl(var(--accent-blue)/0.25)]",
        data.status === "success" && "border-accent-green/50",
        data.status === "error" && "border-destructive/60 shadow-[0_0_20px_-4px_hsl(var(--destructive)/0.2)]",
        data.status === "idle" && "border-border/50 opacity-60 hover:opacity-90",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
    >
      {data.type !== "start" && <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-muted-foreground/60 !border-2 !border-card" />}

      {/* Breakpoint indicator */}
      {data.type !== "start" && data.type !== "end" && (
        <button
          className={cn(
            "absolute -left-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all",
            data.hasBreakpoint
              ? "bg-destructive text-destructive-foreground shadow-sm shadow-destructive/30"
              : "bg-muted text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted-foreground/20 opacity-0 group-hover/node:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleBreakpoint?.(data.nodeId!);
          }}
          title={data.hasBreakpoint ? "Remove breakpoint" : "Add breakpoint"}
        >
          <Circle className={cn("h-2.5 w-2.5", data.hasBreakpoint && "fill-current")} />
        </button>
      )}

      {/* Hover inspect icon */}
      <div className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-accent-blue/90 text-white flex items-center justify-center opacity-0 group-hover/node:opacity-100 transition-all duration-200 shadow-sm">
        <Search className="h-2.5 w-2.5" />
      </div>

      <div className="flex items-center gap-2.5">
        <div className={cn("p-1.5 rounded-lg bg-muted/60", accent)}>
          <Icon className={cn("h-4 w-4", data.status === "running" && "animate-pulse-icon")} />
        </div>
        <span className="text-sm font-semibold text-card-foreground tracking-tight">{data.label}</span>

        {data.status === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-accent-green ml-auto" />}
        {data.status === "error" && <AlertTriangle className="h-3.5 w-3.5 text-destructive ml-auto" />}
        {data.status === "running" && <Loader2 className="h-3.5 w-3.5 text-accent-blue ml-auto animate-spin" />}
      </div>

      {data.type !== "end" && <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-muted-foreground/60 !border-2 !border-card" />}
    </div>
  );
}

export default memo(GraphNode);
