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
              <code className="px-1.5 py-0.5 rounded-md bg-chat-code font-mono text-[13px] border border-border/30" {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, "")} />;
        },
        h2: ({ children }) => <h2 className="text-base font-semibold mt-5 mb-2 tracking-tight text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mt-4 mb-1.5 tracking-tight text-foreground">{children}</h3>,
        p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground/80">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed text-foreground/80">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent-blue/40 pl-4 my-3 text-muted-foreground italic">{children}</blockquote>
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
    <div className="rounded-lg overflow-hidden my-3 border border-border/30 animate-scale-in group/code">
      <div className="flex items-center justify-between px-4 py-2 bg-chat-code text-xs text-muted-foreground/60">
        <span className="font-mono uppercase tracking-wider text-[10px] font-semibold">{language}</span>
        <button
          onClick={copy}
          className={cn(
            "flex items-center gap-1.5 transition-all duration-200 px-2 py-0.5 rounded opacity-0 group-hover/code:opacity-100",
            copied ? "text-accent-green opacity-100" : "hover:text-foreground hover:bg-accent"
          )}
        >
          <div className="transition-transform duration-200" style={{ transform: copied ? "scale(1.1)" : "scale(1)" }}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </div>
          <span className="text-[11px]">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.8125rem",
          background: "hsl(var(--chat-code))",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
