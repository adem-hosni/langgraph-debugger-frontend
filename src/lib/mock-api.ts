/**
 * Real API layer — fetches data from the FastAPI server.
 * Includes graceful fallbacks to mock data if the server endpoint is not yet implemented.
 */

import {
  initialSessions,
  defaultModels,
  type ChatSession,
  type ChatMessage,
  type AIModel,
  type ChatMode,
  type Attachment,
} from "./mock-data";
import {
  mockNodes,
  mockEdges,
  executionSteps,
  type GraphNodeData,
} from "./graph-data";
import type { Node, Edge } from "reactflow";

// --- API Configuration ---
const API_BASE_URL = "http://127.0.0.1:2026";

// ─── in-memory store (simulates server DB for mock fallbacks) ────────
let _sessions: ChatSession[] = structuredClone(initialSessions);
let _models: AIModel[] = structuredClone(defaultModels);

function resetStore() {
  _sessions = structuredClone(initialSessions);
  _models = structuredClone(defaultModels);
}

// ─── Chat Sessions API ─────────────────────────────────────────────

export async function fetchSessions(): Promise<ChatSession[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/history/threads`);
    if (!response.ok) throw new Error("Endpoint not found");
    return await response.json();
  } catch (error) {
    console.warn("Server /history/threads failed. Falling back to mock data.");
    return structuredClone(_sessions);
  }
}

export async function fetchSession(id: string): Promise<ChatSession | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Server returned ${response.status}`);
    }

    const backendData = await response.json();
    const messages: ChatMessage[] = [];
    const historyList = backendData.history.reverse();

    historyList.forEach((state: any, index: number) => {
      if (state.values.input_text && index === 0) {
        messages.push({
          id: `user-${state.checkpoint_id}`,
          role: "user",
          content: state.values.input_text,
          timestamp: state.created_at || "Just now",
        });
      }
      if (state.values.result) {
        messages.push({
          id: `ai-${state.checkpoint_id}`,
          role: "assistant",
          content: state.values.result,
          timestamp: state.created_at || "Just now",
        });
      }
    });

    return {
      id: backendData.thread_id,
      title:
        messages.length > 0
          ? messages[0].content.slice(0, 30) + "..."
          : "Debug Thread",
      date: "Today",
      messages: messages,
    };
  } catch (error) {
    console.warn(
      `Failed to fetch session ${id} from server. Mocking fallback.`,
    );
    const s = _sessions.find((s) => s.id === id);
    return s ? structuredClone(s) : null;
  }
}

export async function createSession(): Promise<ChatSession> {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    title: "New Debug Thread",
    date: "Today",
    messages: [],
  };
  return session;
}

export async function deleteSession(id: string): Promise<{ success: boolean }> {
  try {
    await fetch(`${API_BASE_URL}/history/${id}`, { method: "DELETE" });
    return { success: true };
  } catch (error) {
    console.warn("Delete endpoint failed. Mocking deletion.");
    _sessions = _sessions.filter((s) => s.id !== id);
    return { success: true };
  }
}

// ─── Messages API ───────────────────────────────────────────────────

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  attachments?: Attachment[];
  model: string;
  mode: ChatMode;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  updatedSessionTitle?: string;
}

export async function sendMessage(
  req: SendMessageRequest,
): Promise<SendMessageResponse> {
  try {
    // Assuming you will mount a REST router for chatting at /chat
    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Expecting the backend to return exactly the SendMessageResponse structure
    return await response.json();
  } catch (error) {
    console.warn("Server /chat failed. Using simulated response.", error);

    // Mock fallback
    const { sessionId, content } = req;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Simulated response (Backend unreachable)",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    return { userMessage: userMsg, assistantMessage: aiMsg };
  }
}

// ─── Models API ─────────────────────────────────────────────────────

export async function fetchModels(): Promise<AIModel[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/models/fetch`);
    if (!response.ok) throw new Error("Failed to fetch models");
    return await response.json();
  } catch (error) {
    console.warn("Server /models failed. Using default models.");
    return structuredClone(_models);
  }
}

export async function addModel(label: string): Promise<AIModel> {
  try {
    const response = await fetch(`${API_BASE_URL}/models/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!response.ok) throw new Error("Failed to add model");
    return await response.json();
  } catch (error) {
    return _models[0]; // Fallback
  }
}

export async function removeModel(
  value: string,
): Promise<{ success: boolean }> {
  try {
    await fetch(`${API_BASE_URL}/models/remove/${value}`, { method: "DELETE" });
    return { success: true };
  } catch (error) {
    return { success: true };
  }
}

// ─── Graph Debugger API ─────────────────────────────────────────────

export interface GraphData {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
  executionSteps: typeof executionSteps;
}

export async function fetchGraphData(): Promise<GraphData> {
  try {
    // Make sure this matches the prefix in your FastAPI router.
    // If you used prefix="/graph" in the python file, use /graph/info here.
    const response = await fetch(`${API_BASE_URL}/graph/info`);

    if (!response.ok) {
      throw new Error(`Failed to fetch graph data: ${response.status}`);
    }

    // The backend now returns the EXACT structure React Flow needs:
    // { nodes: [...], edges: [...], executionSteps: [] }
    const backendData: GraphData = await response.json();

    return backendData;
  } catch (error) {
    console.warn(
      "Server /graph/info failed. Using mock graph data.",
      error,
    );
    return {
      nodes: structuredClone(mockNodes),
      edges: structuredClone(mockEdges),
      executionSteps: structuredClone(executionSteps),
    };
  }
}

export async function rerunGraphNode(
  nodeId: string,
): Promise<{ status: "success" | "error"; message: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/graph/node/${nodeId}/rerun`,
      {
        method: "POST",
      },
    );
    const data = await response.json();
    return {
      status: data.status || "success",
      message: data.message || "Node re-executed",
    };
  } catch (error) {
    return {
      status: "success",
      message: "Mocked success (Backend unreachable)",
    };
  }
}

// ─── Health / Meta ─────────────────────────────────────────────────

export async function healthCheck(): Promise<{
  status: "ok";
  latency: number;
  version: string;
}> {
  try {
    const start = performance.now();
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    return {
      status: "ok",
      latency: Math.round(performance.now() - start),
      version: data.version || "1.0.0",
    };
  } catch (error) {
    return { status: "ok", latency: 0, version: "0.1.0-mock-fallback" };
  }
}

export const api = {
  sessions: {
    fetch: fetchSessions,
    get: fetchSession,
    create: createSession,
    delete: deleteSession,
  },
  messages: { send: sendMessage },
  models: { fetch: fetchModels, add: addModel, remove: removeModel },
  graph: { fetch: fetchGraphData, rerunNode: rerunGraphNode },
  health: healthCheck,
  _resetStore: resetStore,
};

export default api;
