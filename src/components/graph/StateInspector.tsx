import { X, Copy, Check, AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import type { GraphNodeData } from "@/lib/graph-data";

interface StateInspectorProps {
  node: { id: string; data: GraphNodeData } | null;
  onClose: () => void;
  onRerun?: (nodeId: string) => void;
}

function JsonViewer({ data }: { data: unknown; label: string }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [json]);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground z-10" onClick={copy}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 overflow-auto whitespace-pre-wrap text-foreground max-h-[400px]">
        {json}
      </pre>
    </div>
  );
}

export function StateInspector({ node, onClose, onRerun }: StateInspectorProps) {
  const [rerunning, setRerunning] = useState(false);

  if (!node) return null;

  const { data } = node;
  const statusColor = data.status === "success" ? "default" : data.status === "error" ? "destructive" : "secondary";

  const handleRerun = async () => {
    if (!onRerun) return;
    setRerunning(true);
    try {
      await onRerun(node.id);
    } finally {
      setRerunning(false);
    }
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">State Inspector</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{data.label}</span>
            <Badge variant={statusColor} className="text-[10px] px-1.5 py-0 h-5">{data.status}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {data.type !== "start" && data.type !== "end" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleRerun}
              disabled={rerunning}
              title="Rerun this node"
            >
              {rerunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {data.error && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs font-semibold text-destructive">Error Stack Trace</span>
          </div>
          <pre className="text-[11px] font-mono text-destructive/80 whitespace-pre-wrap">{data.error}</pre>
        </div>
      )}

      <Tabs defaultValue="input" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 w-auto">
          <TabsTrigger value="input" className="text-xs">Input</TabsTrigger>
          <TabsTrigger value="output" className="text-xs">Output</TabsTrigger>
          <TabsTrigger value="state" className="text-xs">Current State</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="input" className="mt-0">
            <JsonViewer data={data.input} label="Input" />
          </TabsContent>
          <TabsContent value="output" className="mt-0">
            <JsonViewer data={data.output} label="Output" />
          </TabsContent>
          <TabsContent value="state" className="mt-0">
            <JsonViewer data={data.state} label="State" />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
}
