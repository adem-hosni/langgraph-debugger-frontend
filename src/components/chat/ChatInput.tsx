import { useState, useRef, useEffect, useCallback } from "react";
import { Paperclip, ArrowUp, X, FileCode, FileSpreadsheet, FileImage, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeSelector } from "./ModeSelector";
import { useChatContext } from "@/hooks/use-chat";
import type { Attachment } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface StagedFile {
  name: string;
  size: string;
  type: Attachment["type"];
  id: string;
}

function getFileType(file: File): Attachment["type"] {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "java", "cpp", "c", "h", "css", "html", "json", "yaml", "yml", "toml", "sh"].includes(ext))
    return "code";
  if (["csv", "xlsx", "xls", "tsv", "sql", "db"].includes(ext)) return "data";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(ext)) return "image";
  return "document";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const fileTypeIcons = { code: FileCode, data: FileSpreadsheet, image: FileImage, document: File };

export function ChatInput() {
  const { sendMessage, isSending } = useChatContext();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [text]);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: StagedFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: formatSize(f.size),
      type: getFileType(f),
      id: crypto.randomUUID(),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => setFiles((f) => f.filter((x) => x.id !== id));

  const handleSend = () => {
    if (!text.trim() && files.length === 0) return;
    const attachments: Attachment[] = files.map((f) => ({ name: f.name, type: f.type, size: f.size }));
    sendMessage(text.trim(), attachments);
    setText("");
    setFiles([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="bg-background px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f) => {
              const Icon = fileTypeIcons[f.type];
              return (
                <Badge key={f.id} variant="secondary" className="gap-1.5 py-1.5 px-2.5 pr-1.5 text-xs">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono">{f.name}</span>
                  <span className="text-muted-foreground">({f.size})</span>
                  <button onClick={() => removeFile(f.id)} className="ml-1 hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        <div
          className={cn(
            "flex flex-col bg-chat-input rounded-xl border transition-colors",
            isDragging && "border-accent-blue ring-2 ring-accent-blue/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex items-end gap-2 px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message AI..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1.5 max-h-[200px] scrollbar-thin"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <Button
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              disabled={!text.trim() && files.length === 0}
              onClick={handleSend}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center px-3 pb-2 gap-1">
            <ModeSelector />
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
