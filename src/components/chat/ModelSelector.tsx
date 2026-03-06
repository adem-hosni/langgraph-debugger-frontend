import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { models } from "@/lib/mock-data";
import { Sparkles } from "lucide-react";

interface ModelSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px] border-none bg-transparent hover:bg-accent gap-2 font-medium">
        <Sparkles className="h-4 w-4 text-accent-blue" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {models.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
