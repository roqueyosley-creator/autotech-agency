import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomECUNode from './CustomECUNode';
import genericTopology from '../../data/vehicleTopologies/generic.json';

const nodeTypes = {
  ecu: CustomECUNode,
  gateway: CustomECUNode
};

const TopologyView = ({ obdData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Inicializar Grafo desde el JSON de topología
    const initialNodes = genericTopology.nodes.map(node => {
      const pos = genericTopology.layout[node.id] || { x: 0, y: 0 };
      
      // Enriquecer con datos reales de OBD si existen
      const nodeDtcCount = obdData?.dtcs?.filter(d => d.module === node.id || d.address === node.address).length || 0;

      return {
        id: node.id,
        type: node.type,
        position: pos,
        data: { 
          ...node, 
          status: 'online',
          dtc_count: nodeDtcCount
        }
      };
    });

    const initialEdges = [];
    genericTopology.buses.forEach(bus => {
      // Conectar nodos del mismo bus al Gateway
      const gatewayNode = bus.nodes.find(n => n === 'gateway');
      const otherNodes = bus.nodes.filter(n => n !== 'gateway');

      if (gatewayNode) {
        otherNodes.forEach(targetId => {
          initialEdges.push({
            id: `e-${bus.id}-${targetId}`,
            source: 'gateway',
            target: targetId,
            label: bus.type,
            labelStyle: { fill: '#52525b', fontSize: 8, fontWeight: 700 },
            style: { stroke: bus.color, strokeWidth: 3, opacity: 0.6 },
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: bus.color,
            }
          });
        });
      }
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [obdData]);

  return (
    <div className="w-full h-full min-h-[500px] bg-zinc-950 rounded-[3rem] border border-zinc-900 overflow-hidden relative shadow-2xl">
      <div className="absolute top-8 left-8 z-10">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Red Vehicular</h2>
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2">Mapa de Comunicación CAN/LIN</p>
      </div>

      <div className="absolute top-8 right-8 z-10 flex gap-4">
        {genericTopology.buses.map(bus => (
          <div key={bus.id} className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bus.color }} />
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{bus.name}</span>
          </div>
        ))}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-dot-pattern"
      >
        <Background color="#27272a" gap={20} />
        <Controls className="!bg-zinc-900 !border-zinc-800 !fill-white" />
        <MiniMap 
          nodeColor={(n) => n.data.dtc_count > 0 ? '#ef4444' : '#27272a'}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="!bg-zinc-900 !border-zinc-800"
        />
      </ReactFlow>
      
      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#27272a 1px, transparent 0);
          background-size: 24px 24px;
        }
        .react-flow__edge-path {
          filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.2));
        }
      `}</style>
    </div>
  );
};

export default TopologyView;
