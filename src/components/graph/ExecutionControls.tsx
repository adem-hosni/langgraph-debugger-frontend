import { RotateCcw, SkipBack, Play, Pause, SkipForward, Circle, Zap, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ExecutionControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isPaused: boolean;
  breakpointCount: number;
  connected?: boolean;
  onReset: () => void;
  onStepBack: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
  onClearBreakpoints?: () => void;
}

export function ExecutionControls({
  currentStep, totalSteps, isPlaying, isPaused, breakpointCount, connected,
  onReset, onStepBack, onPlayPause, onStepForward, onClearBreakpoints
}: ExecutionControlsProps) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1 px-3 py-2 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg">
          {/* Connection indicator */}
          <div className={cn("w-2 h-2 rounded-full mr-1 transition-colors", connected ? "bg-accent-green" : "bg-destructive animate-pulse")} />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset (R)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onStepBack} disabled={currentStep <= 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Step Back (←)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 relative",
                  isPaused ? "text-amber-500" : isPlaying ? "text-accent-green" : "text-foreground"
                )}
                onClick={onPlayPause}
              >
                {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                {isPlaying && (
                  <span className="absolute inset-0 rounded-md border-2 border-accent-green/30 animate-pulse" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? "Pause (Space)" : isPaused ? "Resume (Space)" : "Play (Space)"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Step Forward (→)</TooltipContent>
          </Tooltip>

          {/* Divider + progress */}
          <div className="ml-2 pl-2 border-l border-border flex items-center gap-3">
            {/* Step counter with mini progress bar */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {currentStep + 1}/{totalSteps}
              </span>
              <div className="w-12 h-0.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-accent-blue rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Breakpoint controls */}
            {breakpointCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onClearBreakpoints}
                    className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors group"
                  >
                    <Circle className="h-2.5 w-2.5 fill-current group-hover:animate-pulse" />
                    <span className="font-mono">{breakpointCount}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Clear all breakpoints</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
