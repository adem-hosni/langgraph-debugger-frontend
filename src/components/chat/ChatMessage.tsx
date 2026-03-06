import { Bot, User, FileCode, FileSpreadsheet, FileImage, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThinkingBlock } from "./ThinkingBlock";
import { ToolCallBlock } from "./ToolCallBlock";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage as ChatMessageType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fileIcons = { code: FileCode, data: FileSpreadsheet, image: FileImage, document: File };

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("py-6 px-4 md:px-0")}>
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
          isUser ? "bg-accent" : "bg-accent-blue/10"
        )}>
          {isUser ? (
            <User className="h-4 w-4 text-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-accent-blue" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1.5">{isUser ? "You" : "Assistant"}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att) => {
                const Icon = fileIcons[att.type];
                return (
                  <Badge key={att.name} variant="secondary" className="gap-1.5 py-1 px-2.5 font-mono text-xs">
                    <Icon className="h-3.5 w-3.5" />
                    {att.name}
                  </Badge>
                );
              })}
            </div>
          )}

          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="text-sm">
              {message.thinking && <ThinkingBlock content={message.thinking} />}
              {message.toolCalls?.map((tool, i) => (
                <ToolCallBlock key={i} tool={tool} />
              ))}
              <MarkdownRenderer content={message.content} />
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">{message.timestamp}</p>
        </div>
      </div>
    </div>
  );
}
