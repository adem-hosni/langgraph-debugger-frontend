import type { Node, Edge } from "reactflow";

export type NodeStatus = "idle" | "running" | "success" | "error";

export interface GraphNodeData {
  label: string;
  type: "start" | "agent" | "tool" | "end";
  status: NodeStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  state?: Record<string, unknown>;
  error?: string;
  hasBreakpoint?: boolean;
  onToggleBreakpoint?: (nodeId: string) => void;
  nodeId?: string;
}

export const mockNodes: Node<GraphNodeData>[] = [
  {
    id: "start",
    type: "graphNode",
    position: { x: 400, y: 30 },
    data: {
      label: "START",
      type: "start",
      status: "success",
      input: { query: "What are the latest AI research papers on reasoning?" },
      output: { routed_to: "routing_agent" },
      state: { messages: [{ role: "user", content: "What are the latest AI research papers on reasoning?" }], current_step: 0 },
    },
  },
  {
    id: "routing_agent",
    type: "graphNode",
    position: { x: 400, y: 160 },
    data: {
      label: "Routing Agent",
      type: "agent",
      status: "success",
      input: { messages: [{ role: "user", content: "What are the latest AI research papers on reasoning?" }] },
      output: { tool_calls: [{ name: "web_search", args: { query: "latest AI reasoning papers 2025" } }], decision: "needs_web_search" },
      state: { messages: [{ role: "user", content: "..." }], current_step: 1, routing_decision: "web_search" },
    },
  },
  {
    id: "web_search",
    type: "graphNode",
    position: { x: 400, y: 290 },
    data: {
      label: "Web Search Tool",
      type: "tool",
      status: "error",
      input: { query: "latest AI reasoning papers 2025", max_results: 5 },
      output: {},
      error: "ConnectionError: Failed to reach search API\n  at WebSearchTool.execute (tools/web_search.py:42)\n  at ToolExecutor.run (executor.py:118)\n  at GraphRunner.step (runner.py:87)\n\nCaused by: TimeoutError: Request timed out after 30000ms\n  at fetch_with_retry (utils/http.py:23)",
      state: { messages: [{ role: "user", content: "..." }], current_step: 2, error: "web_search_failed", last_tool_input: { query: "latest AI reasoning papers 2025" } },
    },
  },
  {
    id: "formatter",
    type: "graphNode",
    position: { x: 400, y: 420 },
    data: {
      label: "Formatter Agent",
      type: "agent",
      status: "idle",
      input: {},
      output: {},
      state: {},
    },
  },
  {
    id: "end",
    type: "graphNode",
    position: { x: 400, y: 550 },
    data: {
      label: "END",
      type: "end",
      status: "idle",
      input: {},
      output: {},
      state: {},
    },
  },
];

export const mockEdges: Edge[] = [
  { id: "e-start-routing", source: "start", target: "routing_agent", animated: true, style: { stroke: "hsl(142, 71%, 45%)" } },
  { id: "e-routing-search", source: "routing_agent", target: "web_search", animated: true, style: { stroke: "hsl(142, 71%, 45%)" } },
  { id: "e-search-formatter", source: "web_search", target: "formatter", style: { stroke: "hsl(0, 0%, 40%)", strokeDasharray: "5 5" } },
  { id: "e-formatter-end", source: "formatter", target: "end", style: { stroke: "hsl(0, 0%, 40%)", strokeDasharray: "5 5" } },
];

export const executionSteps = [
  { nodeId: "start", status: "success" as NodeStatus },
  { nodeId: "routing_agent", status: "success" as NodeStatus },
  { nodeId: "web_search", status: "error" as NodeStatus },
];
