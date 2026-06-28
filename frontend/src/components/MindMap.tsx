"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { MindMapNode } from "@/lib/api";

// ── Custom Node Components ──

function RootNode({ data }: { data: any }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-[#5046E4] to-[#06B6D4] rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
      <div className="relative bg-gradient-to-br from-[#5046E4] to-[#4338CA] text-white px-8 py-4 rounded-2xl shadow-2xl border border-[#6D5EE8]/30 min-w-[180px] text-center cursor-pointer transition-transform group-hover:scale-105">
        <div className="text-sm font-bold tracking-wide">{data.label}</div>
        {data.description && (
          <div className="text-[10px] text-indigo-200/80 mt-1 max-w-[200px] leading-tight">
            {data.description}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Top} className="!bg-[#06B6D4] !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#06B6D4] !w-2 !h-2 !border-0" id="bottom" />
      <Handle type="source" position={Position.Left} className="!bg-[#06B6D4] !w-2 !h-2 !border-0" id="left" />
      <Handle type="source" position={Position.Right} className="!bg-[#06B6D4] !w-2 !h-2 !border-0" id="right" />
    </div>
  );
}

function MainNode({ data }: { data: any }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5046E4]/40 to-[#06B6D4]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-[#1A2035]/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-[#5046E4]/30 shadow-lg min-w-[150px] text-center cursor-pointer transition-all group-hover:border-[#5046E4]/60 group-hover:scale-105">
        <div className="text-xs font-semibold">{data.label}</div>
        {data.timestamp && (
          <div className="text-[10px] text-[#06B6D4]/70 mt-1 font-mono">⏱ {data.timestamp}</div>
        )}
        {data.description && (
          <div className="text-[9px] text-slate-400 mt-1 max-w-[180px] leading-tight line-clamp-2">
            {data.description}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-[#5046E4] !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-[#5046E4] !w-2 !h-2 !border-0" id="left" />
      <Handle type="target" position={Position.Right} className="!bg-[#5046E4] !w-2 !h-2 !border-0" id="right" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#06B6D4] !w-2 !h-2 !border-0" id="bottom" />
      <Handle type="source" position={Position.Left} className="!bg-[#06B6D4] !w-2 !h-2 !border-0" id="s-left" />
      <Handle type="source" position={Position.Right} className="!bg-[#06B6D4] !w-2 !h-2 !border-0" id="s-right" />
    </div>
  );
}

function SubNode({ data }: { data: any }) {
  return (
    <div className="group relative">
      <div className="relative bg-[#111827]/80 backdrop-blur-sm text-slate-300 px-5 py-2.5 rounded-lg border border-white/[0.06] shadow-md min-w-[120px] text-center cursor-pointer transition-all group-hover:border-[#06B6D4]/40 group-hover:text-white group-hover:scale-105">
        <div className="text-[11px] font-medium">{data.label}</div>
        {data.timestamp && (
          <div className="text-[9px] text-[#06B6D4]/50 mt-0.5 font-mono">{data.timestamp}</div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-1.5 !h-1.5 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-slate-500 !w-1.5 !h-1.5 !border-0" id="left" />
      <Handle type="target" position={Position.Right} className="!bg-slate-500 !w-1.5 !h-1.5 !border-0" id="right" />
    </div>
  );
}

const nodeTypes = {
  root: RootNode,
  main: MainNode,
  sub: SubNode,
};

// ── Layout engine: tree-based radial positioning ──

function layoutNodes(rawNodes: MindMapNode[]): { nodes: Node[]; edges: Edge[] } {
  const nodeMap = new Map<string, MindMapNode>();
  rawNodes.forEach((n) => nodeMap.set(n.id, n));

  // Build children map
  const children = new Map<string, string[]>();
  let rootId = "";
  rawNodes.forEach((n) => {
    if (n.type === "root") rootId = n.id;
    if (n.parent) {
      if (!children.has(n.parent)) children.set(n.parent, []);
      children.get(n.parent)!.push(n.id);
    }
  });

  // Position nodes in a radial tree layout
  const positions = new Map<string, { x: number; y: number }>();
  const centerX = 0;
  const centerY = 0;

  // Place root at center
  positions.set(rootId, { x: centerX, y: centerY });

  // Place main nodes in a circle around root
  const mainIds = children.get(rootId) || [];
  const mainRadius = 280;
  mainIds.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / mainIds.length - Math.PI / 2;
    positions.set(id, {
      x: centerX + Math.cos(angle) * mainRadius,
      y: centerY + Math.sin(angle) * mainRadius,
    });
  });

  // Place sub nodes around their parent
  mainIds.forEach((mainId) => {
    const subIds = children.get(mainId) || [];
    const parentPos = positions.get(mainId)!;
    const subRadius = 180;
    // Direction away from center
    const parentAngle = Math.atan2(parentPos.y - centerY, parentPos.x - centerX);

    subIds.forEach((id, i) => {
      const spread = Math.PI * 0.6; // 108 degree spread
      const startAngle = parentAngle - spread / 2;
      const angle = subIds.length === 1 ? parentAngle : startAngle + (spread * i) / (subIds.length - 1);
      positions.set(id, {
        x: parentPos.x + Math.cos(angle) * subRadius,
        y: parentPos.y + Math.sin(angle) * subRadius,
      });
    });
  });

  // Also handle sub-nodes of sub-nodes (if any)
  rawNodes.forEach((n) => {
    if (!positions.has(n.id) && n.parent && positions.has(n.parent)) {
      const parentPos = positions.get(n.parent)!;
      const offset = Math.random() * 100 + 80;
      const angle = Math.random() * Math.PI * 2;
      positions.set(n.id, {
        x: parentPos.x + Math.cos(angle) * offset,
        y: parentPos.y + Math.sin(angle) * offset,
      });
    }
  });

  // Convert to React Flow nodes
  const nodes: Node[] = rawNodes
    .filter((n) => positions.has(n.id))
    .map((n) => ({
      id: n.id,
      type: n.type,
      position: positions.get(n.id)!,
      data: {
        label: n.label,
        timestamp: n.timestamp,
        description: n.description,
      },
    }));

  // Build edges
  const edges: Edge[] = rawNodes
    .filter((n) => n.parent && positions.has(n.id) && positions.has(n.parent!))
    .map((n) => ({
      id: `${n.parent}-${n.id}`,
      source: n.parent!,
      target: n.id,
      type: "default",
      animated: n.type === "main",
      style: {
        stroke: n.type === "main" ? "#5046E4" : "#334155",
        strokeWidth: n.type === "main" ? 2 : 1.5,
        opacity: n.type === "main" ? 0.7 : 0.4,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: n.type === "main" ? "#5046E4" : "#334155",
        width: 15,
        height: 15,
      },
    }));

  return { nodes, edges };
}

// ── Main component ──

interface MindMapProps {
  data: { nodes: MindMapNode[] };
  onNodeClick?: (node: MindMapNode) => void;
}

export default function MindMap({ data, onNodeClick }: MindMapProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => layoutNodes(data.nodes),
    [data.nodes]
  );

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        const raw = data.nodes.find((n) => n.id === node.id);
        if (raw) onNodeClick(raw);
      }
    },
    [data.nodes, onNodeClick]
  );

  return (
    <div className="w-full h-full mindmap-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background color="#1E293B" gap={30} size={1} />
        <Controls
          className="!bg-[#1A2035] !border-slate-700 !rounded-lg !shadow-xl [&_button]:!bg-[#1A2035] [&_button]:!border-slate-700 [&_button]:!text-slate-300 [&_button:hover]:!bg-slate-800"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-[#0F172A] !border-slate-800 !rounded-lg"
          nodeColor={(n) => {
            if (n.type === "root") return "#5046E4";
            if (n.type === "main") return "#3B3A8E";
            return "#1E293B";
          }}
          maskColor="rgba(9, 11, 18, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
