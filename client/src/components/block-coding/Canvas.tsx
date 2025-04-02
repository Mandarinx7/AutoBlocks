import { useRef, useState, useEffect } from "react";
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

// Constants for canvas and grid
const GRID_SIZE = 20;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const DEFAULT_CANVAS_SIZE = 2000; // px
const BLOCK_WIDTH = 200; // Width in pixels
const BLOCK_HEIGHT = 100; // Approximate height in pixels for connection point calculation

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
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);

  // Calculate required canvas size based on block positions
  useEffect(() => {
    if (flow.blocks.length > 0) {
      const rightmostBlock = Math.max(...flow.blocks.map(block => block.position.x + BLOCK_WIDTH));
      const bottommostBlock = Math.max(...flow.blocks.map(block => block.position.y + BLOCK_HEIGHT));
      
      // Add some padding
      const requiredWidth = rightmostBlock + 500;
      const requiredHeight = bottommostBlock + 500;
      
      const newSize = Math.max(DEFAULT_CANVAS_SIZE, requiredWidth, requiredHeight);
      setCanvasSize(newSize);
    }
  }, [flow.blocks]);

  // Center canvas on load
  useEffect(() => {
    if (canvasRef.current) {
      const centerX = (canvasRef.current.clientWidth / 2) - (canvasSize / 2) * scale;
      const centerY = (canvasRef.current.clientHeight / 2) - (canvasSize / 2) * scale;
      setPosition({ x: centerX, y: centerY });
    }
  }, []);

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('grid-bg')) {
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

  // Handle zooming with limits
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale + delta));
    
    // Zoom centered on cursor position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newPos = {
        x: mouseX - (mouseX - position.x) * (newScale / scale),
        y: mouseY - (mouseY - position.y) * (newScale / scale)
      };
      
      setPosition(newPos);
    }
    
    setScale(newScale);
  };

  // Function to snap position to grid
  const snapToGrid = (x: number, y: number) => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE
    };
  };

  // Modified drag move handler with snap-to-grid
  const handleDragMoveWithSnap = (blockId: string, newPosition: { x: number, y: number }) => {
    const snappedPosition = snapToGrid(newPosition.x, newPosition.y);
    onUpdateBlock(blockId, { position: snappedPosition });
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
      {/* Grid background */}
      <div 
        className="absolute inset-0 grid-bg" 
        style={{
          backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
          backgroundImage: `radial-gradient(circle, #ddd 1px, transparent 1px)`,
          backgroundPosition: `${position.x % (GRID_SIZE * scale)}px ${position.y % (GRID_SIZE * scale)}px`,
        }}
      />
      
      {/* Zoom controls */}
      <div className="absolute bottom-20 right-6 bg-white rounded-lg shadow-lg z-30 flex">
        <button 
          onClick={() => setScale(Math.min(MAX_ZOOM, scale + 0.2))}
          className="p-2 hover:bg-gray-100"
        >
          +
        </button>
        <div className="p-2 border-x border-gray-200">
          {Math.round(scale * 100)}%
        </div>
        <button 
          onClick={() => setScale(Math.max(MIN_ZOOM, scale - 0.2))}
          className="p-2 hover:bg-gray-100"
        >
          -
        </button>
      </div>
      
      <div 
        className="absolute z-10"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: `${canvasSize}px`,
          height: `${canvasSize}px`
        }}
      >
        {/* SVG for connectors */}
        <svg className="absolute inset-0 w-full h-full z-0">
          {flow.edges.map((edge) => {
            const sourceBlock = flow.blocks.find(b => b.id === edge.source);
            const targetBlock = flow.blocks.find(b => b.id === edge.target);
            
            if (!sourceBlock || !targetBlock) return null;
            
            // Calculate connector points
            const x1 = sourceBlock.position.x + BLOCK_WIDTH; // Right edge of source block
            const y1 = sourceBlock.position.y + BLOCK_HEIGHT / 2;  // Middle of source block
            const x2 = targetBlock.position.x;  // Left edge of target block
            const y2 = targetBlock.position.y + BLOCK_HEIGHT / 2;  // Middle of target block
            
            // Calculate control points for curved connector
            const deltaX = Math.abs(x2 - x1) * 0.5;
            const path = `M${x1},${y1} C${x1+deltaX},${y1} ${x2-deltaX},${y2} ${x2},${y2}`;
            
            return (
              <path
                key={edge.id}
                d={path}
                className="stroke-purple-500 stroke-2 fill-none"
                markerEnd="url(#arrowhead)"
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
              <polygon points="0 0, 10 3.5, 0 7" className="fill-purple-500" />
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
              onDragMove={(newPos) => handleDragMoveWithSnap(block.id, newPos)}
              onDragEnd={handleDragEnd}
              onUpdateParams={(key, value) => onUpdateBlockParams(block.id, key, value)}
              onRemove={() => onRemoveBlock(block.id)}
              isDragging={draggingBlockId === block.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;
