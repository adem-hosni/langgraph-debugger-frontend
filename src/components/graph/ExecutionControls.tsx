import { RotateCcw, SkipBack, Play, Pause, SkipForward, Circle } from "lucide-react";
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
        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl glass shadow-float">
          {/* Connection indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "w-2 h-2 rounded-full mr-1.5 transition-colors shrink-0",
                connected ? "bg-accent-green shadow-[0_0_6px_hsl(var(--accent-green)/0.4)]" : "bg-destructive animate-pulse"
              )} />
            </TooltipTrigger>
            <TooltipContent>{connected ? "Connected" : "Disconnected"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" onClick={onReset}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset (R)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" onClick={onStepBack} disabled={currentStep <= 0}>
                <SkipBack className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Step Back (←)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-xl relative transition-all duration-300",
                  isPaused
                    ? "bg-accent-amber/15 text-accent-amber hover:bg-accent-amber/25 border border-accent-amber/20"
                    : isPlaying
                      ? "bg-accent-green/15 text-accent-green hover:bg-accent-green/25 border border-accent-green/20"
                      : "bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 border border-accent-blue/20"
                )}
                onClick={onPlayPause}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying && (
                  <span className="absolute inset-0 rounded-xl border border-accent-green/30 animate-pulse" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? "Pause (Space)" : isPaused ? "Resume (Space)" : "Play (Space)"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Step Forward (→)</TooltipContent>
          </Tooltip>

          {/* Divider + progress */}
          <div className="ml-1.5 pl-2.5 border-l border-border/30 flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                {currentStep + 1}/{totalSteps}
              </span>
              <div className="w-14 h-1 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full bg-accent-blue rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {breakpointCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onClearBreakpoints}
                    className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors group"
                  >
                    <Circle className="h-2.5 w-2.5 fill-current group-hover:animate-pulse" />
                    <span className="font-mono text-[11px]">{breakpointCount}</span>
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
