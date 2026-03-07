import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Play, Bot, Wrench, Square, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphNodeData } from "@/lib/graph-data";

const typeConfig = {
  start: { icon: Play, accent: "text-accent-green" },
  agent: { icon: Bot, accent: "text-accent-blue" },
  tool: { icon: Wrench, accent: "text-amber-500" },
  end: { icon: Square, accent: "text-muted-foreground" },
};

function GraphNode({ data, selected }: NodeProps<GraphNodeData>) {
  const { icon: Icon, accent } = typeConfig[data.type];

  return (
    <div
      className={cn(
        "relative px-5 py-3 rounded-xl border-2 bg-card shadow-md min-w-[180px] transition-all duration-300",
        data.status === "running" && "border-accent-blue animate-pulse shadow-accent-blue/20 shadow-lg",
        data.status === "success" && "border-accent-green",
        data.status === "error" && "border-destructive shadow-destructive/20 shadow-lg",
        data.status === "idle" && "border-border opacity-50",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
    >
      {data.type !== "start" && <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-card" />}

      <div className="flex items-center gap-2.5">
        <div className={cn("p-1.5 rounded-lg bg-muted", accent)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-card-foreground">{data.label}</span>

        {data.status === "success" && <CheckCircle2 className="h-4 w-4 text-accent-green ml-auto" />}
        {data.status === "error" && <AlertTriangle className="h-4 w-4 text-destructive ml-auto" />}
        {data.status === "running" && <Loader2 className="h-4 w-4 text-accent-blue ml-auto animate-spin" />}
      </div>

      {data.type !== "end" && <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-card" />}
    </div>
  );
}

export default memo(GraphNode);
