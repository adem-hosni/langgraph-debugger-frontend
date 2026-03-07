import { useState, useCallback, useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, type Node } from "reactflow";
import "reactflow/dist/style.css";
import GraphNode from "./GraphNode";
import { StateInspector } from "./StateInspector";
import { ExecutionControls } from "./ExecutionControls";
import { mockNodes, mockEdges, executionSteps, type GraphNodeData, type NodeStatus } from "@/lib/graph-data";

const nodeTypes = { graphNode: GraphNode };

export function GraphDebugger() {
  const [currentStep, setCurrentStep] = useState(executionSteps.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: GraphNodeData } | null>(null);

  // Compute node statuses based on current step
  const computedNodes = useMemo(() => {
    return mockNodes.map((node) => {
      const stepIdx = executionSteps.findIndex((s) => s.nodeId === node.id);
      let status: NodeStatus = "idle";
      if (stepIdx >= 0 && stepIdx <= currentStep) {
        status = executionSteps[stepIdx].status;
      }
      return { ...node, data: { ...node.data, status } };
    });
  }, [currentStep]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mockEdges);

  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

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
    setCurrentStep((s) => Math.min(executionSteps.length - 1, s + 1));
  }, []);

  const onPlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= executionSteps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

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
          totalSteps={executionSteps.length}
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
