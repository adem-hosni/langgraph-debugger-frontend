<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/adem-hosni/langgraph-debugger/main/assets/banner-dark.png">
  <img alt="LangGraph Debugger" src="https://raw.githubusercontent.com/adem-hosni/langgraph-debugger/main/assets/banner-light.png">
</picture>

# LangGraph Debugger — Frontend Client

> A powerful visual debugging interface for [LangGraph](https://langchain-ai.github.io/langgraph/) applications. Inspect, step through, and debug your agentic graph workflows in real time.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![ReactFlow](https://img.shields.io/badge/ReactFlow-11.11-FF0072?logo=react&logoColor=white)](https://reactflow.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Overview

The LangGraph Debugger frontend provides a dual-mode interface for interacting with and debugging LangGraph applications:

- **Chat View** — A full-featured AI chat interface with multi-session management, model selection, mode switching, file attachments, and rich markdown rendering with syntax-highlighted code blocks.
- **Graph Debugger** — An interactive visual graph debugger powered by ReactFlow that lets you step through node executions, inspect inputs/outputs/state, set breakpoints, re-run individual nodes, and modify state on the fly — all over a real-time WebSocket connection.

---

## Features

### Chat Interface
- Multi-session conversation management with sidebar navigation
- Support for multiple AI models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, etc.)
- Custom model registration for any endpoint
- Five chat modes: Default, Deep Thinking, Research, Creative, Concise
- File attachments with drag-and-drop support (code, data, images, documents)
- Rich markdown rendering with syntax-highlighted code blocks and copy button
- Collapsible thinking/tool call blocks showing step-by-step AI reasoning
- System prompt configuration via settings panel
- Light/dark/system theme with toggle

### Graph Debugger
- Interactive directed graph visualization of LangGraph workflows using ReactFlow
- Real-time node execution state tracking (idle, running, success, error)
- Step-through execution with play/pause, step forward/back, and reset controls
- Visual breakpoints on agent and tool nodes to pause execution
- Side panel state inspector with editable JSON viewer for node input/output/state
- Automatic error node detection and stack trace display
- Node re-execution (rerun individual nodes)
- Mini-map and zoom controls for large graphs
- Full keyboard shortcut support (Space, Arrow keys, R, Escape)

### Real-Time Communication
- WebSocket connection to the LangGraph backend for live graph state updates
- Automatic reconnection with exponential backoff
- Connection status indicator in the execution controls bar

### Resilience
- Graceful fallback to mock data when the backend is unreachable
- Comprehensive mock API covering all endpoints for standalone UI development

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Framework** | [React 18](https://react.dev/) with [TypeScript 5](https://www.typescriptlang.org/) |
| **Routing** | [React Router DOM 6](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Graph Visualization** | [ReactFlow 11](https://reactflow.dev/) |
| **State Management** | React Context + [TanStack React Query 5](https://tanstack.com/query) |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) + [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) |
| **Forms** | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Toasts** | [sonner](https://sonner.emilkowal.ski/) |
| **Charts** | [recharts](https://recharts.org/) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Linting** | [ESLint 9](https://eslint.org/) with `typescript-eslint` |

---

## Architecture

```
src/
├── App.tsx                  # Root app with providers and routing
├── main.tsx                 # Entry point
├── pages/
│   ├── Index.tsx            # Main page — Chat View + Graph Debugger tabs
│   └── NotFound.tsx         # 404 fallback
├── components/
│   ├── chat/                # Chat interface components
│   │   ├── ChatSidebar.tsx       # Session list sidebar
│   │   ├── ChatInput.tsx         # Message input with file uploads
│   │   ├── ChatMessage.tsx       # Message bubble renderer
│   │   ├── MarkdownRenderer.tsx   # Markdown with syntax highlighting
│   │   ├── ModelSelector.tsx     # AI model dropdown
│   │   ├── ModeSelector.tsx      # Chat mode picker
│   │   ├── SettingsModal.tsx     # System prompt configuration
│   │   ├── ThinkingBlock.tsx     # Collapsible thinking trace
│   │   └── ToolCallBlock.tsx     # Collapsible tool call details
│   ├── graph/               # Graph debugger components
│   │   ├── GraphDebugger.tsx     # Main graph view orchestrator
│   │   ├── GraphNode.tsx         # Custom ReactFlow node renderer
│   │   ├── StateInspector.tsx    # Side panel for node state inspection
│   │   └── ExecutionControls.tsx # Play/pause/step controls overlay
│   └── ui/                  # shadcn/ui primitives (automatically generated)
├── hooks/
│   ├── use-chat.tsx         # Chat context + session management
│   ├── use-graph-ws.ts      # WebSocket context for real-time graph updates
│   ├── use-theme.ts         # Theme management (light/dark/system)
│   ├── use-mobile.tsx       # Responsive breakpoint detection
│   └── use-toast.ts         # Toast notification system
├── lib/
│   ├── mock-api.ts          # REST API client with mock fallbacks
│   ├── mock-data.ts         # Mock data types and fixtures
│   ├── graph-data.ts        # Graph node/edge types and mock graph
│   └── utils.ts             # Utility functions (cn)
└── test/                    # Test setup and examples
```

### Data Flow

1. **Chat** — The `ChatProvider` context manages sessions, models, and message dispatch. API calls go through `mock-api.ts`, which first attempts the real backend (`http://127.0.0.1:2026`) and falls back to local mock data if the server is unreachable.

2. **Graph** — The `GraphWsProvider` establishes a WebSocket connection to `ws://127.0.0.1:2026/ws/graph`. The `GraphDebugger` component subscribes to graph data and node state update events, rendering the workflow in ReactFlow and the state inspector side panel.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- The [LangGraph Debugger backend](https://github.com/adem-hosni/langgraph-debugger) (optional — the UI works with mock data without it)

### Installation

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start the Vite dev server on port 8080
npm run dev
# or
bun run dev
```

The application runs at `http://localhost:8080`.

### Build

```bash
# Production build
npm run build

# Development build
npm run build:dev
```

### Preview

```bash
# Preview the production build locally
npm run preview
```

### Lint & Test

```bash
# Run ESLint
npm run lint

# Run tests (Vitest)
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## Configuration

### Backend URL

The frontend expects a LangGraph Debugger backend at:

| Protocol | URL | Purpose |
|---|---|---|
| **HTTP** | `http://127.0.0.1:2026` | REST API (chat, sessions, models, graph CRUD) |
| **WebSocket** | `ws://127.0.0.1:2026/ws/graph` | Real-time graph state updates |

Update these URLs in `src/lib/mock-api.ts` (line 24) and `src/hooks/use-graph-ws.ts` (line 6) to point to your backend instance.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/history/threads` | List chat sessions |
| `GET` | `/history/:id` | Get session with message history |
| `DELETE` | `/history/:id` | Delete a session |
| `POST` | `/chat/send` | Send a chat message |
| `GET` | `/models/fetch` | List available models |
| `POST` | `/models/add` | Register a custom model |
| `DELETE` | `/models/remove/:value` | Remove a custom model |
| `GET` | `/graph/info` | Get graph structure and node states |
| `GET` | `/graph/states` | Get node state data |
| `POST` | `/graph/run` | Run the graph |
| `POST` | `/graph/pause` | Pause graph execution |
| `POST` | `/graph/node/:id/rerun` | Re-execute a specific node |
| `POST` | `/graph/breakpoints/:nodeId` | Set a breakpoint on a node |
| `DELETE` | `/graph/breakpoints/:nodeId` | Remove a breakpoint |
| `DELETE` | `/graph/breakpoints` | Clear all breakpoints |

### Environment Variables

The current implementation uses hardcoded URLs. To make them configurable, set the following environment variables in a `.env` file:

```env
# Backend API URL (default: http://127.0.0.1:2026)
VITE_API_BASE_URL=http://127.0.0.1:2026
```

---

## Usage

### Chat View

1. Click **New Chat** in the sidebar or press `Ctrl+N` to start a new conversation
2. Select a model from the dropdown in the top toolbar
3. Choose a chat mode (Default, Deep Thinking, Research, Creative, Concise)
4. Type your message or drag-and-drop files to attach them
5. Press `Enter` to send (use `Shift+Enter` for a new line)
6. Click on an existing session in the sidebar to switch conversations
7. Access settings via the gear icon to configure the system prompt

### Graph Debugger

1. Switch to **Graph Debugger** using the tab toggle in the top toolbar
2. The graph layout displays nodes (START, agents, tools, END) connected by edges
3. Use the **execution controls** at the bottom to navigate through graph execution:
   - ▶ **Play/Pause** (Space) — Start or pause automatic step-through
   - ← **Step Back** (Arrow Left) — Move to the previous execution step
   - → **Step Forward** (Arrow Right) — Move to the next execution step
   - ↺ **Reset** (R) — Reset execution to the beginning
4. Click on any **node** to open the state inspector panel on the right
5. Toggle **breakpoints** by clicking the circle indicator on agent/tool nodes
6. In the state inspector, view node **Input**, **Output**, and editable **State** tabs
7. Click the **rerun** button to re-execute an individual node
8. Error nodes are automatically selected and display full stack traces

### Keyboard Shortcuts (Graph Debugger)

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` | Step Back |
| `→` | Step Forward |
| `R` | Reset |
| `Escape` | Close state inspector |

---

## Project Structure

```
client/
├── public/                 # Static assets (favicon, robots.txt)
├── src/
│   ├── components/
│   │   ├── chat/           # Chat UI components
│   │   ├── graph/          # Graph debugger components
│   │   └── ui/             # shadcn/ui primitives
│   ├── hooks/              # React context hooks and custom hooks
│   ├── lib/                # API client, mock data, utilities
│   ├── pages/              # Route pages
│   └── test/               # Test setup and example tests
├── index.html              # Vite entry HTML
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
├── vitest.config.ts        # Vitest test configuration
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui components configuration
└── eslint.config.js        # ESLint configuration
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing component patterns and naming conventions
- Use the `cn()` utility for conditional class merging
- Ensure all new features include graceful fallbacks to mock data
- Run `npm run lint` and `npm run test` before submitting

---

## License

This project is part of the [LangGraph Debugger](https://github.com/adem-hosni/langgraph-debugger) repository. See the root `LICENSE` file for details.

---

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) component primitives
- Graph visualization powered by [ReactFlow](https://reactflow.dev/)
- Inspired by [LangGraph](https://langchain-ai.github.io/langgraph/) by LangChain
