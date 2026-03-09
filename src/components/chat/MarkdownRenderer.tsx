import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded bg-chat-code font-mono text-sm border border-border/50" {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, "")} />;
        },
        h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2 tracking-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-1.5 tracking-tight">{children}</h3>,
        p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground/90">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed text-foreground/90">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent-blue pl-4 my-3 text-muted-foreground italic">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden my-3 border border-border/50 animate-scale-in shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-chat-code text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-wider">{language}</span>
        <button
          onClick={copy}
          className={cn(
            "flex items-center gap-1.5 transition-all duration-200 px-2 py-0.5 rounded",
            copied ? "text-accent-green" : "hover:text-foreground hover:bg-accent"
          )}
        >
          <div className="transition-transform duration-200" style={{ transform: copied ? "scale(1.1)" : "scale(1)" }}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </div>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8125rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
