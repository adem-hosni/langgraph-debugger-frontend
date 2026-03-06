import { useState, useRef, useEffect } from "react";
import { Paperclip, ArrowUp, X, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StagedFile {
  name: string;
  id: string;
}

export function ChatInput() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [text]);

  const addDummyFile = () => {
    const names = ["script.py", "data.csv", "README.md", "config.json"];
    const name = names[files.length % names.length];
    setFiles((f) => [...f, { name, id: crypto.randomUUID() }]);
  };

  const removeFile = (id: string) => setFiles((f) => f.filter((x) => x.id !== id));

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f) => (
              <Badge key={f.id} variant="secondary" className="gap-1.5 py-1 px-2.5 pr-1.5 font-mono text-xs">
                <FileCode className="h-3.5 w-3.5" />
                {f.name}
                <button onClick={() => removeFile(f.id)} className="ml-1 hover:text-destructive transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 bg-chat-input rounded-xl border px-3 py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground" onClick={addDummyFile}>
            <Paperclip className="h-4 w-4" />
          </Button>

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
                // would send message
              }
            }}
          />

          <Button
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            disabled={!text.trim() && files.length === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
