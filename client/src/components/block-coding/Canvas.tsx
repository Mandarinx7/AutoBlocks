import { useRef, useState } from "react";
import Block from "./Block";
import { Flow, Block as BlockType, Edge } from "@/pages/BlockCoding";
import { getBlockConfig } from "@/lib/block-coding/blockTypes";

interface CanvasProps {
  flow: Flow;
  onUpdateBlock: (blockId: string, updates: Partial<BlockType>) => void;
  onUpdateBlockParams: (blockId: string, paramKey: string, paramValue: any) => void;
  onAddEdge: (edge: Edge) => void;
  onRemoveEdge: (edgeId: string) => void;
  onRemoveBlock: (blockId: string) => void;
}

const Canvas = ({ 
  flow, 
  onUpdateBlock, 
  onUpdateBlockParams,
  onAddEdge,
  onRemoveEdge,
  onRemoveBlock
}: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('lf-canvas')) {
      setIsPanning(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newPos = { 
        x: e.clientX - startPos.x, 
        y: e.clientY - startPos.y 
      };
      setPosition(newPos);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Drag and drop functionality for blocks
  const handleDragStart = (blockId: string) => {
    setDraggingBlockId(blockId);
  };

  const handleDragMove = (blockId: string, newPosition: { x: number, y: number }) => {
    onUpdateBlock(blockId, { position: newPosition });
  };

  const handleDragEnd = () => {
    setDraggingBlockId(null);
  };

  // Handle zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    setScale(newScale);
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 relative bg-gray-50 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      <div 
        className="absolute inset-0 z-10"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* SVG for connectors */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {flow.edges.map((edge) => {
            const sourceBlock = flow.blocks.find(b => b.id === edge.source);
            const targetBlock = flow.blocks.find(b => b.id === edge.target);
            
            if (!sourceBlock || !targetBlock) return null;
            
            // Calculate connector points
            const x1 = sourceBlock.position.x + 140; // Adjusted connection point
            const y1 = sourceBlock.position.y + 40;  // Adjusted output point
            const x2 = targetBlock.position.x;
            const y2 = targetBlock.position.y + 40;  // Adjusted input point
            
            // Calculate control points for curved connector with more pronounced curve
            const deltaX = Math.abs(x2 - x1) * 0.7;
            const path = `M${x1},${y1} C${x1+deltaX},${y1} ${x2-deltaX},${y2} ${x2},${y2}`;
            
            return (
              <path
                key={edge.id}
                d={path}
                className="stroke-blue-500 stroke-2 fill-none"
                markerEnd="url(#arrowhead)"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
              />
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" className="fill-blue-500" />
            </marker>
          </defs>
        </svg>
        
        {/* Render blocks */}
        {flow.blocks.map((block) => {
          const blockConfig = getBlockConfig(block.type);
          return (
            <Block
              key={block.id}
              block={block}
              config={blockConfig}
              onDragStart={() => handleDragStart(block.id)}
              onDragMove={(newPos) => handleDragMove(block.id, newPos)}
              onDragEnd={handleDragEnd}
              onUpdateParams={(key, value) => onUpdateBlockParams(block.id, key, value)}
              onRemove={() => onRemoveBlock(block.id)}
              isDragging={draggingBlockId === block.id}
            />
          );
        })}
      </div>
      
      {/* Zoom controls - visible on mobile */}
      <div className="absolute bottom-20 right-6 flex flex-col gap-2 z-20 md:hidden">
        <button 
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
          onClick={() => setScale(prev => Math.min(prev + 0.1, 2))}
        >
          <span className="text-xl font-bold">+</span>
        </button>
        <button 
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
          onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
        >
          <span className="text-xl font-bold">-</span>
        </button>
      </div>
    </div>
  );
};

export default Canvas;
