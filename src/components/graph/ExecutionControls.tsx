import { RotateCcw, SkipBack, Play, Pause, SkipForward, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExecutionControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isPaused: boolean;
  breakpointCount: number;
  onReset: () => void;
  onStepBack: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
}

export function ExecutionControls({ currentStep, totalSteps, isPlaying, isPaused, breakpointCount, onReset, onStepBack, onPlayPause, onStepForward }: ExecutionControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onStepBack} disabled={currentStep <= 0}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className={cn("h-9 w-9", isPaused ? "text-amber-500" : "text-foreground")} onClick={onPlayPause}>
          {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
          <SkipForward className="h-4 w-4" />
        </Button>
        <div className="ml-2 pl-2 border-l border-border flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {currentStep + 1}/{totalSteps}
          </span>
          {breakpointCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <Circle className="h-2.5 w-2.5 fill-current" />
              <span className="font-mono">{breakpointCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
