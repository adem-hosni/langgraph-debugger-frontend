export interface Attachment {
  name: string;
  type: "code" | "data" | "image";
}

export interface ToolCall {
  name: string;
  icon: "globe" | "code" | "database" | "search";
  status: "completed" | "running" | "error";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  thinking?: string;
  toolCalls?: ToolCall[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  active?: boolean;
}

export const chatSessions: ChatSession[] = [
  { id: "1", title: "Analyze index.js code", date: "Today", active: true },
  { id: "2", title: "React performance tips", date: "Today" },
  { id: "3", title: "Database schema design", date: "Yesterday" },
  { id: "4", title: "CSS Grid layout help", date: "Yesterday" },
  { id: "5", title: "API authentication flow", date: "Mar 3" },
  { id: "6", title: "Docker deployment setup", date: "Mar 2" },
];

export const mockConversation: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Can you analyze this code file and search for any recent updates to the Express.js framework that might affect it?",
    attachments: [{ name: "index.js", type: "code" }],
    timestamp: "2:34 PM",
  },
  {
    id: "2",
    role: "assistant",
    content: `I've analyzed your \`index.js\` file and searched for recent Express.js updates. Here's what I found:

## Code Analysis

Your file sets up a basic Express server with middleware. I noticed a few things:

### Issues Found

1. **Deprecated \`body-parser\` usage** — Since Express 4.16+, you can use \`express.json()\` directly
2. **Missing error handling middleware** — No global error handler
3. **Hardcoded port** — Should use environment variables

### Recommended Fix

\`\`\`javascript
const express = require('express');
const app = express();

// Use built-in middleware instead of body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
\`\`\`

## Recent Express.js Updates

Express **v5.0** was recently released with breaking changes:
- Path route matching syntax has changed
- \`req.query\` no longer uses \`qs\` by default
- Rejected promises in handlers are automatically caught

I'd recommend staying on **v4.x** for now unless you're ready to migrate.`,
    thinking: `Let me analyze the uploaded file step by step.

1. First, I'll look at the imports and dependencies used
2. Check for any deprecated patterns or security issues
3. Review the middleware configuration
4. Look at route handlers for best practices
5. Then I'll search for recent Express.js updates that could impact this code

The file uses body-parser which has been integrated into Express since v4.16. This is a common issue in older codebases. I should also check for proper error handling and environment variable usage.

Looking at the Express.js changelog, v5.0 was released recently with significant changes to routing and middleware handling. This could affect the user's code if they upgrade.`,
    toolCalls: [
      {
        name: "Web Search",
        icon: "globe",
        status: "completed",
        input: { query: "Express.js latest version updates 2025 breaking changes" },
        output: {
          results: [
            { title: "Express 5.0 Release Notes", url: "https://expressjs.com/en/5x/api.html" },
            { title: "Migrating from Express 4 to 5", url: "https://expressjs.com/en/guide/migrating-5.html" },
          ],
          summary: "Express 5.0 released with new path matching, automatic promise rejection handling, and qs removal.",
        },
      },
      {
        name: "Python Interpreter",
        icon: "code",
        status: "completed",
        input: { code: "# Static analysis of index.js\nimport ast_analysis\nresults = ast_analysis.scan('index.js')\nprint(results.summary)" },
        output: {
          issues_found: 3,
          severity: { high: 1, medium: 1, low: 1 },
          details: "Deprecated body-parser, missing error handler, hardcoded port",
        },
      },
    ],
    timestamp: "2:34 PM",
  },
];

export const models = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
];
