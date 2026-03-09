import { X, Copy, Check, AlertTriangle, RotateCcw, Loader2, Pencil, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { GraphNodeData } from "@/lib/graph-data";

interface StateInspectorProps {
  node: { id: string; data: GraphNodeData } | null;
  onClose: () => void;
  onRerun?: (nodeId: string) => void;
  onUpdateState?: (nodeId: string, state: Record<string, unknown>) => void;
}

function JsonViewer({ data, editable, onSave }: { data: unknown; label: string; editable?: boolean; onSave?: (val: Record<string, unknown>) => void }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const json = JSON.stringify(data, null, 2);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [json]);

  const startEdit = () => {
    setEditValue(json);
    setEditing(true);
    setParseError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setParseError(null);
  };

  const saveEdit = () => {
    try {
      const parsed = JSON.parse(editValue);
      onSave?.(parsed);
      setEditing(false);
      setParseError(null);
      toast.success("State updated");
    } catch {
      setParseError("Invalid JSON");
    }
  };

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {editing ? (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-accent-green hover:text-accent-green" onClick={saveEdit}>
              <Save className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={cancelEdit}>
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            {editable && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={copy}>
              {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </>
        )}
      </div>
      {editing ? (
        <div>
          <textarea
            value={editValue}
            onChange={(e) => { setEditValue(e.target.value); setParseError(null); }}
            className={cn(
              "w-full min-h-[200px] max-h-[400px] text-xs font-mono rounded-lg p-4 bg-muted/50 text-foreground border resize-y focus:outline-none focus:ring-2 focus:ring-ring",
              parseError ? "border-destructive focus:ring-destructive" : "border-border"
            )}
            spellCheck={false}
          />
          {parseError && (
            <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {parseError}
            </p>
          )}
        </div>
      ) : (
        <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 overflow-auto whitespace-pre-wrap text-foreground max-h-[400px] transition-colors">
          {json}
        </pre>
      )}
    </div>
  );
}

export function StateInspector({ node, onClose, onRerun, onUpdateState }: StateInspectorProps) {
  const [rerunning, setRerunning] = useState(false);
  const [activeTab, setActiveTab] = useState("input");

  if (!node) return null;

  const { data } = node;
  const statusColor = data.status === "success" ? "default" : data.status === "error" ? "destructive" : "secondary";
  const statusDot = data.status === "running" ? "bg-accent-blue animate-pulse" : data.status === "success" ? "bg-accent-green" : data.status === "error" ? "bg-destructive" : "bg-muted-foreground/40";

  const handleRerun = async () => {
    if (!onRerun) return;
    setRerunning(true);
    try {
      await onRerun(node.id);
    } finally {
      setRerunning(false);
    }
  };

  const handleStateSave = (newState: Record<string, unknown>) => {
    onUpdateState?.(node.id, newState);
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", statusDot)} />
            <h3 className="text-sm font-semibold text-card-foreground truncate">{data.label}</h3>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={300}>
              {data.type !== "start" && data.type !== "end" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleRerun} disabled={rerunning}>
                      {rerunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Rerun node</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Close</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={statusColor} className="text-[10px] px-1.5 py-0 h-5">{data.status}</Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground">{data.type}</Badge>
          {data.hasBreakpoint && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">breakpoint</Badge>
          )}
        </div>
      </div>

      {data.error && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs font-semibold text-destructive">Error Stack Trace</span>
          </div>
          <pre className="text-[11px] font-mono text-destructive/80 whitespace-pre-wrap">{data.error}</pre>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 w-auto">
          <TabsTrigger value="input" className="text-xs">Input</TabsTrigger>
          <TabsTrigger value="output" className="text-xs">Output</TabsTrigger>
          <TabsTrigger value="state" className="text-xs relative">
            Current State
            {data.type !== "start" && data.type !== "end" && (
              <Pencil className="h-2.5 w-2.5 ml-1 text-muted-foreground" />
            )}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="input" className="mt-0">
            <JsonViewer data={data.input} label="Input" />
          </TabsContent>
          <TabsContent value="output" className="mt-0">
            <JsonViewer data={data.output} label="Output" />
          </TabsContent>
          <TabsContent value="state" className="mt-0">
            <JsonViewer
              data={data.state}
              label="State"
              editable={data.type !== "start" && data.type !== "end"}
              onSave={handleStateSave}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
}
