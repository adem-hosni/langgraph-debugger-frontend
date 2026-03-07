/**
 * Mock API layer — simulates network latency and server responses.
 * Every function returns a Promise that resolves after a realistic delay.
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
import { mockNodes, mockEdges, executionSteps, type GraphNodeData } from "./graph-data";
import type { Node, Edge } from "reactflow";

// ─── helpers ────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── in-memory store (simulates server DB) ──────────────────────────
let _sessions: ChatSession[] = structuredClone(initialSessions);
let _models: AIModel[] = structuredClone(defaultModels);

function resetStore() {
  _sessions = structuredClone(initialSessions);
  _models = structuredClone(defaultModels);
}

// ─── Chat Sessions API ─────────────────────────────────────────────

export async function fetchSessions(): Promise<ChatSession[]> {
  await delay(rand(200, 500));
  return structuredClone(_sessions);
}

export async function fetchSession(id: string): Promise<ChatSession | null> {
  await delay(rand(100, 300));
  const s = _sessions.find((s) => s.id === id);
  return s ? structuredClone(s) : null;
}

export async function createSession(): Promise<ChatSession> {
  await delay(rand(150, 400));
  const session: ChatSession = {
    id: crypto.randomUUID(),
    title: "New Chat",
    date: "Today",
    messages: [],
  };
  _sessions.unshift(session);
  return structuredClone(session);
}

export async function deleteSession(id: string): Promise<{ success: boolean }> {
  await delay(rand(150, 350));
  _sessions = _sessions.filter((s) => s.id !== id);
  return { success: true };
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

/** Simulates streaming-style response with a realistic delay */
export async function sendMessage(req: SendMessageRequest): Promise<SendMessageResponse> {
  const { sessionId, content, attachments, model, mode } = req;

  // Simulate network + LLM thinking time
  await delay(rand(600, 1500));

  const modelLabel =
    _models.find((m) => m.value === model)?.label ?? model;

  const userMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content,
    attachments: attachments?.length ? attachments : undefined,
    timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };

  const responseVariants: Record<ChatMode, string> = {
    default: `I've processed your message using **${modelLabel}**.\n\n> ${content}\n\nHere's my analysis based on your input. This is a simulated response from the mock API.`,
    thinking: `After careful step-by-step reasoning with **${modelLabel}**:\n\n1. I first parsed your query\n2. Then evaluated multiple angles\n3. Synthesised a conclusion\n\n> ${content}\n\nThis is the result of deep analysis mode.`,
    research: `## Research Findings\n\nUsing **${modelLabel}** in research mode, I found the following:\n\n- **Source 1**: Relevant data point about "${content.slice(0, 30)}..."\n- **Source 2**: Supporting evidence from academic literature\n- **Source 3**: Industry report corroboration\n\n### Summary\nBased on cross-referencing multiple sources, the consensus is clear.`,
    creative: `✨ *Channeling creative energy through **${modelLabel}**...*\n\nYour prompt "${content.slice(0, 30)}..." inspired the following:\n\n---\n\nImagine a world where every line of code tells a story, where functions dance like poetry, and variables hold the weight of meaning beyond their types.\n\n---\n\n*That's the creative take on your request.*`,
    concise: `**${modelLabel}**: ${content.length > 50 ? content.slice(0, 50) + "..." : content} → Processed. Result ready.`,
  };

  const thinkingContent =
    mode === "thinking" || mode === "research"
      ? `Analyzing with ${modelLabel} in ${mode} mode...\n\n1. Parsing input: "${content.slice(0, 40)}"\n2. Evaluating context and prior messages\n3. Selecting optimal response strategy\n4. Generating structured output`
      : undefined;

  const aiMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: responseVariants[mode],
    thinking: thinkingContent,
    toolCalls:
      mode === "research"
        ? [
            {
              name: "Web Search",
              icon: "globe",
              status: "completed",
              input: { query: content.slice(0, 50) },
              output: { results_count: rand(3, 12), top_result: "Relevant finding" },
            },
          ]
        : undefined,
    timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };

  // Update in-memory store
  const session = _sessions.find((s) => s.id === sessionId);
  let updatedSessionTitle: string | undefined;
  if (session) {
    if (session.messages.length === 0) {
      updatedSessionTitle = content.slice(0, 40) + (content.length > 40 ? "..." : "");
      session.title = updatedSessionTitle;
    }
    session.messages.push(userMsg, aiMsg);
  }

  return { userMessage: userMsg, assistantMessage: aiMsg, updatedSessionTitle };
}

// ─── Models API ─────────────────────────────────────────────────────

export async function fetchModels(): Promise<AIModel[]> {
  await delay(rand(100, 300));
  return structuredClone(_models);
}

export async function addModel(label: string): Promise<AIModel> {
  await delay(rand(200, 400));
  const value = label.toLowerCase().replace(/\s+/g, "-");
  const existing = _models.find((m) => m.value === value);
  if (existing) return structuredClone(existing);
  const model: AIModel = { value, label, custom: true };
  _models.push(model);
  return structuredClone(model);
}

export async function removeModel(value: string): Promise<{ success: boolean }> {
  await delay(rand(100, 250));
  _models = _models.filter((m) => m.value !== value);
  return { success: true };
}

// ─── Graph Debugger API ─────────────────────────────────────────────

export interface GraphData {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
  executionSteps: typeof executionSteps;
}

export async function fetchGraphData(): Promise<GraphData> {
  await delay(rand(300, 600));
  return {
    nodes: structuredClone(mockNodes),
    edges: structuredClone(mockEdges),
    executionSteps: structuredClone(executionSteps),
  };
}

export async function rerunGraphNode(nodeId: string): Promise<{ status: "success" | "error"; message: string }> {
  await delay(rand(500, 1200));
  // Simulate random success/failure on retry
  const success = Math.random() > 0.3;
  return {
    status: success ? "success" : "error",
    message: success
      ? `Node "${nodeId}" re-executed successfully.`
      : `Node "${nodeId}" failed again: TimeoutError`,
  };
}

// ─── Health / Meta ──────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: "ok"; latency: number; version: string }> {
  const start = performance.now();
  await delay(rand(50, 150));
  return { status: "ok", latency: Math.round(performance.now() - start), version: "0.1.0-mock" };
}

export const mockApi = {
  sessions: { fetch: fetchSessions, get: fetchSession, create: createSession, delete: deleteSession },
  messages: { send: sendMessage },
  models: { fetch: fetchModels, add: addModel, remove: removeModel },
  graph: { fetch: fetchGraphData, rerunNode: rerunGraphNode },
  health: healthCheck,
  _resetStore: resetStore,
};

export default mockApi;
