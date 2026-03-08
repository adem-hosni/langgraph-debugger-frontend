import { useState, useCallback, useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, type Node } from "reactflow";
import "reactflow/dist/style.css";
import GraphNode from "./GraphNode";
import { StateInspector } from "./StateInspector";
import { ExecutionControls } from "./ExecutionControls";
import { type GraphNodeData, type NodeStatus } from "@/lib/graph-data";
import { type GraphData } from "@/lib/mock-api";
import { useGraphWebSocket } from "@/hooks/use-graph-ws";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const nodeTypes = { graphNode: GraphNode };

export function GraphDebugger() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: GraphNodeData } | null>(null);
  const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set());

  const handleGraphData = useCallback((data: GraphData) => {
    setGraphData(data);
    setCurrentStep(data.executionSteps.length - 1);
    setLoading(false);
  }, []);

  const { send } = useGraphWebSocket(handleGraphData);

  const steps = graphData?.executionSteps ?? [];

  const toggleBreakpoint = useCallback((nodeId: string) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        toast.info(`Breakpoint removed from node`);
      } else {
        next.add(nodeId);
        toast.info(`Breakpoint set on node`);
      }
      return next;
    });
  }, []);

  const onReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsPaused(false);
    setSelectedNode(null);
    send("reset");
  }, [send]);

  const onStepBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
    setIsPaused(false);
    send("step_back");
  }, [send]);

  const onStepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
    setIsPaused(false);
    send("step_forward");
  }, [steps.length, send]);

  const onPlayPause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      send("run");
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
      send("pause");
    } else {
      setIsPlaying(true);
      send("run");
    }
  }, [isPaused, isPlaying, send]);

  const onRerunNode = useCallback((nodeId: string) => {
    send("rerun_node", { nodeId });
  }, [send]);

  const computedNodes = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.map((node) => {
      const stepIdx = steps.findIndex((s) => s.nodeId === node.id);
      let status: NodeStatus = "idle";
      if (stepIdx >= 0 && stepIdx <= currentStep) {
        status = steps[stepIdx].status;
      }
      return {
        ...node,
        data: {
          ...node.data,
          status,
          hasBreakpoint: breakpoints.has(node.id),
          onToggleBreakpoint: toggleBreakpoint,
          nodeId: node.id,
        },
      };
    });
  }, [graphData, currentStep, steps, breakpoints, toggleBreakpoint]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData?.edges ?? []);

  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

  useEffect(() => {
    if (graphData) setEdges(graphData.edges);
  }, [graphData, setEdges]);

  useEffect(() => {
    const errorNode = computedNodes.find((n) => n.data.status === "error");
    if (errorNode && !selectedNode) {
      setSelectedNode({ id: errorNode.id, data: errorNode.data });
    }
  }, [computedNodes, selectedNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<GraphNodeData>) => {
    setSelectedNode({ id: node.id, data: node.data });
  }, []);

  // Auto-play with breakpoint support
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const nextStep = currentStep + 1;
    const nextNodeId = steps[nextStep]?.nodeId;
    if (nextNodeId && breakpoints.has(nextNodeId)) {
      setIsPaused(true);
      setIsPlaying(false);
      toast.warning(`Paused at breakpoint: ${nextNodeId}`);
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, isPaused, currentStep, steps.length, steps, breakpoints]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading graph data...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          className="bg-background"
        >
          <Background gap={20} size={1} className="opacity-30" />
          <Controls className="!bg-card !border-border !shadow-md [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" />
        </ReactFlow>
        <ExecutionControls
          currentStep={currentStep}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          isPaused={isPaused}
          breakpointCount={breakpoints.size}
          onReset={onReset}
          onStepBack={onStepBack}
          onPlayPause={onPlayPause}
          onStepForward={onStepForward}
        />
      </div>
      <StateInspector node={selectedNode} onClose={() => setSelectedNode(null)} onRerun={onRerunNode} />
    </div>
  );
}
