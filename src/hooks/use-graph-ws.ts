import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { GraphData } from "@/lib/mock-api";
import { GraphNodeData } from "@/lib/graph-data";

const WS_URL = "ws://127.0.0.1:2026/ws/graph";
const INITIAL_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 30000;

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
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const intentionalCloseRef = useRef(false);

  const graphHandlersRef = useRef<Set<WsMessageHandler>>(new Set());
  const nodeStateHandlersRef = useRef<Set<NodeStateUpdateHandler>>(new Set());

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    intentionalCloseRef.current = false;

    const scheduleReconnect = () => {
      if (intentionalCloseRef.current || reconnectTimerRef.current) return;

      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(
        Math.round(delay * 1.5),
        MAX_RECONNECT_DELAY,
      );

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);
    };

    const connect = () => {
      const existing = wsRef.current;
      if (existing) {
        if (
          existing.readyState === WebSocket.OPEN ||
          existing.readyState === WebSocket.CONNECTING
        ) {
          return;
        }
        existing.onopen = null;
        existing.onmessage = null;
        existing.onclose = null;
        existing.onerror = null;
        wsRef.current = null;
      }

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        ws.send(JSON.stringify({ action: "fetch", include_states: true }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "graph_data") {
            graphHandlersRef.current.forEach((handler) => handler(msg.data));
          } else if (msg.type === "node_state_update") {
            nodeStateHandlersRef.current.forEach((handler) =>
              handler(msg.nodeId, msg.data),
            );
          } else if (msg.type === "status") {
            toast.info(msg.message);
          } else if (msg.type === "error") {
            toast.error(msg.message);
          }
        } catch (error) {
          console.warn(error);
        }
      };

      ws.onerror = () => {
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        if (wsRef.current === ws) wsRef.current = null;
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      intentionalCloseRef.current = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }

      setConnected(false);
    };
  }, []);

  const send = (action: string, payload?: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action, ...payload }));
      return;
    }
    toast.error("WebSocket not connected");
  };

  const updateNodeState = (nodeId: string, state: Record<string, unknown>) => {
    send("update_state", { nodeId, state });
  };

  const subscribe = (handler: WsMessageHandler) => {
    graphHandlersRef.current.add(handler);
    return () => {
      graphHandlersRef.current.delete(handler);
    };
  };

  const subscribeNodeState = (handler: NodeStateUpdateHandler) => {
    nodeStateHandlersRef.current.add(handler);
    return () => {
      nodeStateHandlersRef.current.delete(handler);
    };
  };

  return { connected, send, updateNodeState, subscribe, subscribeNodeState };
}

export function useGraphWebSocket() {
  const ctx = useContext(GraphWsContext);
  if (!ctx) throw new Error("useGraphWebSocket must be used within GraphWsProvider");
  return ctx;
}
