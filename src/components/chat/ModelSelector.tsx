import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChatContext } from "@/hooks/use-chat";
import { Sparkles, Plus, X } from "lucide-react";

export function ModelSelector() {
  const { models, selectedModel, setSelectedModel, addCustomModel, removeCustomModel } = useChatContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");

  const handleAdd = () => {
    if (customName.trim()) {
      addCustomModel(customName.trim());
      setCustomName("");
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Select
        value={selectedModel}
        onValueChange={(v) => {
          if (v === "__add_custom") {
            setDialogOpen(true);
          } else {
            setSelectedModel(v);
          }
        }}
      >
        <SelectTrigger className="w-[220px] border-none bg-transparent hover:bg-accent gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-accent-blue" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              <span className="flex items-center gap-2">
                {m.label}
                {m.custom && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Custom
                  </Badge>
                )}
              </span>
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="__add_custom">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add custom model
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Custom Model</DialogTitle>
            <DialogDescription>Enter a name for your custom model endpoint.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="e.g. Llama 3.1 70B"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={!customName.trim()}>
              Add
            </Button>
          </div>
          {models.filter((m) => m.custom).length > 0 && (
            <div className="pt-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Custom models</p>
              <div className="flex flex-wrap gap-2">
                {models
                  .filter((m) => m.custom)
                  .map((m) => (
                    <Badge key={m.value} variant="secondary" className="gap-1 pr-1">
                      {m.label}
                      <button
                        onClick={() => removeCustomModel(m.value)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
