import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import type { GraphData } from "@/lib/mock-api";

const WS_URL = "ws://127.0.0.1:2026/ws/graph";

type WsMessageHandler = (data: GraphData) => void;
type NodeStateUpdateHandler = (nodeId: string, state: Record<string, unknown>) => void;

export function useGraphWebSocket(
  onGraphData: WsMessageHandler,
  onNodeStateUpdate?: NodeStateUpdateHandler,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Request initial graph data with all node states
      ws.send(JSON.stringify({ action: "fetch", include_states: true }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "graph_data") {
          onGraphData(msg.data);
        } else if (msg.type === "node_state_update") {
          onNodeStateUpdate?.(msg.nodeId, msg.state);
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
    };

    ws.onerror = () => {
      toast.error("Graph WebSocket connection failed");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [onGraphData]);

  const send = useCallback((action: string, payload?: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action, ...payload }));
    } else {
      toast.error("WebSocket not connected");
    }
  }, []);

  return { send, connected };
}
