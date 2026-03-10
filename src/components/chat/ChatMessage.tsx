import { Bot, User, FileCode, FileSpreadsheet, FileImage, File, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThinkingBlock } from "./ThinkingBlock";
import { ToolCallBlock } from "./ToolCallBlock";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage as ChatMessageType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fileIcons = { code: FileCode, data: FileSpreadsheet, image: FileImage, document: File };

export function ChatMessage({ message, index = 0 }: { message: ChatMessageType; index?: number }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("py-6 px-4 md:px-0 animate-fade-in-up")}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-300",
          isUser
            ? "bg-accent"
            : "bg-accent-blue/10"
        )}>
          {isUser ? (
            <User className="h-4 w-4 text-foreground/70" />
          ) : (
            <Bot className="h-4 w-4 text-accent-blue" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold tracking-tight">{isUser ? "You" : "Assistant"}</p>
            {!isUser && (
              <Sparkles className="h-3 w-3 text-accent-blue/60" />
            )}
            <span className="text-[11px] text-muted-foreground/50 ml-auto tabular-nums font-mono">{message.timestamp}</span>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att, i) => {
                const Icon = fileIcons[att.type];
                return (
                  <Badge
                    key={att.name}
                    variant="secondary"
                    className="gap-1.5 py-1 px-2.5 font-mono text-xs animate-scale-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {att.name}
                  </Badge>
                );
              })}
            </div>
          )}

          {isUser ? (
            <p className="text-sm leading-relaxed text-foreground/85">{message.content}</p>
          ) : (
            <div className="text-sm space-y-1">
              {message.thinking && <ThinkingBlock content={message.thinking} />}
              {message.toolCalls?.map((tool, i) => (
                <ToolCallBlock key={i} tool={tool} index={i} />
              ))}
              <div className="prose-sm">
                <MarkdownRenderer content={message.content} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
