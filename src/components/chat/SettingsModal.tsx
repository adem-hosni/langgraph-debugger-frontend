import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. You are knowledgeable, concise, and always provide accurate information. When analyzing code, be thorough and suggest best practices."
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure how the AI assistant behaves.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Instructions</Label>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              placeholder="Define the AI's persona and behavior..."
              className="resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              These instructions shape how the AI responds to your messages.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
