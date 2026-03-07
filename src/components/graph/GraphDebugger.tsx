import { useState, useCallback, useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, type Node } from "reactflow";
import "reactflow/dist/style.css";
import GraphNode from "./GraphNode";
import { StateInspector } from "./StateInspector";
import { ExecutionControls } from "./ExecutionControls";
import { type GraphNodeData, type NodeStatus } from "@/lib/graph-data";
import mockApi, { type GraphData } from "@/lib/mock-api";
import { Loader2 } from "lucide-react";

const nodeTypes = { graphNode: GraphNode };

export function GraphDebugger() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: GraphNodeData } | null>(null);

  // Fetch graph data from mock API
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const data = await mockApi.graph.fetch();
      if (cancelled) return;
      setGraphData(data);
      setCurrentStep(data.executionSteps.length - 1);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const steps = graphData?.executionSteps ?? [];

  const computedNodes = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.map((node) => {
      const stepIdx = steps.findIndex((s) => s.nodeId === node.id);
      let status: NodeStatus = "idle";
      if (stepIdx >= 0 && stepIdx <= currentStep) {
        status = steps[stepIdx].status;
      }
      return { ...node, data: { ...node.data, status } };
    });
  }, [graphData, currentStep, steps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData?.edges ?? []);

  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

  useEffect(() => {
    if (graphData) setEdges(graphData.edges);
  }, [graphData, setEdges]);

  // Auto-select error node
  useEffect(() => {
    const errorNode = computedNodes.find((n) => n.data.status === "error");
    if (errorNode && !selectedNode) {
      setSelectedNode({ id: errorNode.id, data: errorNode.data });
    }
  }, [computedNodes, selectedNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<GraphNodeData>) => {
    setSelectedNode({ id: node.id, data: node.data });
  }, []);

  const onReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setSelectedNode(null);
  }, []);

  const onStepBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const onStepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
  }, [steps.length]);

  const onPlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

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
          onReset={onReset}
          onStepBack={onStepBack}
          onPlayPause={onPlayPause}
          onStepForward={onStepForward}
        />
      </div>
      <StateInspector node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
