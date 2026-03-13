import { createContext, useContext, useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import type { GraphData } from "@/lib/mock-api";
import { GraphNodeData } from "@/lib/graph-data";

const WS_URL = "ws://127.0.0.1:2026/ws/graph";
const RECONNECT_DELAY = 3000;

export type WsMessageHandler = (data: GraphData) => void;
export type NodeStateUpdateHandler = (nodeId: string, state: Partial<GraphNodeData>) => void;

interface GraphWsContextValue {
  connected: boolean;
  send: (action: string, payload?: Record<string, unknown>) => void;
  updateNodeState: (nodeId: string, state: Record<string, unknown>) => void;
  subscribe: (handler: WsMessageHandler) => () => void;
  subscribeNodeState: (handler: NodeStateUpdateHandler) => () => void;
}

export const GraphWsContext = createContext<GraphWsContextValue | null>(null);

export function useGraphWsProvider() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalClose = useRef(false);

  const graphHandlers = useRef<Set<WsMessageHandler>>(new Set());
  const nodeStateHandlers = useRef<Set<NodeStateUpdateHandler>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ action: "fetch", include_states: true }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "graph_data") {
          graphHandlers.current.forEach((h) => h(msg.data));
        } else if (msg.type === "node_state_update") {
          nodeStateHandlers.current.forEach((h) => h(msg.nodeId, msg.data));
        } else if (msg.type === "status") {
          toast.info(msg.message);
        } else if (msg.type === "error") {
          toast.error(msg.message);
        }
      } catch (error) {
        console.warn(error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (!intentionalClose.current) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };

    ws.onerror = () => {
      setConnected(false);
    };
  }, []);

  useEffect(() => {
    intentionalClose.current = false;
    connect();

    return () => {
      intentionalClose.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((action: string, payload?: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action, ...payload }));
    } else {
      toast.error("WebSocket not connected");
    }
  }, []);

  const updateNodeState = useCallback((nodeId: string, state: Record<string, unknown>) => {
    send("update_state", { nodeId, state });
  }, [send]);

  const subscribe = useCallback((handler: WsMessageHandler) => {
    graphHandlers.current.add(handler);
    return () => { graphHandlers.current.delete(handler); };
  }, []);

  const subscribeNodeState = useCallback((handler: NodeStateUpdateHandler) => {
    nodeStateHandlers.current.add(handler);
    return () => { nodeStateHandlers.current.delete(handler); };
  }, []);

  return { connected, send, updateNodeState, subscribe, subscribeNodeState };
}

export function useGraphWebSocket() {
  const ctx = useContext(GraphWsContext);
  if (!ctx) throw new Error("useGraphWebSocket must be used within GraphWsProvider");
  return ctx;
}
