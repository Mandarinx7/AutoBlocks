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
const MAX_ZOOM = 1.0; // Maximum zoom limited to 100% as requested
const DEFAULT_CANVAS_SIZE = 1000; // px - Smaller for mobile screens
const BLOCK_WIDTH = 200; // Width in pixels (10 * GRID_SIZE for grid alignment)
const BLOCK_HEIGHT = 100; // Approximate height in pixels for connection point calculation

/**
 * Canvas component that provides:
 * - Pinch-to-zoom with 2 fingers on mobile
 * - Pan/drag with 1 finger on mobile or mouse on desktop
 * - Auto-expanding canvas as blocks are added
 * - Snap-to-grid functionality for precise positioning
 * - Connection lines between blocks
 */

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
  
  // Handle touch events for pinch zoom
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);
  
  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Get center point between two touches
  const getTouchCenter = (touches: React.TouchList): { x: number, y: number } => {
    if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
    
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Initialize pinch-to-zoom
      e.preventDefault();
      setInitialTouchDistance(getTouchDistance(e.touches));
      setInitialScale(scale);
    } else if (e.touches.length === 1) {
      // Single touch = pan
      setIsPanning(true);
      setStartPos({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistance) {
      // Handle pinch zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const touchRatio = currentDistance / initialTouchDistance;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialScale * touchRatio));
      
      // Zoom centered on touch center
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const center = getTouchCenter(e.touches);
        const touchX = center.x - rect.left;
        const touchY = center.y - rect.top;
        
        const newPos = {
          x: touchX - (touchX - position.x) * (newScale / scale),
          y: touchY - (touchY - position.y) * (newScale / scale)
        };
        
        setPosition(newPos);
      }
      
      setScale(newScale);
    } else if (e.touches.length === 1 && isPanning) {
      // Handle panning with one finger
      const newPos = { 
        x: e.touches[0].clientX - startPos.x, 
        y: e.touches[0].clientY - startPos.y 
      };
      setPosition(newPos);
    }
  };
  
  const handleTouchEnd = () => {
    setInitialTouchDistance(null);
    setIsPanning(false);
  };

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

  // This is the legacy drag start handler - will be removed
  const handleBlockDragStart = (blockId: string) => {
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

  // Tracking cursor position for precise dragging
  const [cursorOffset, setCursorOffset] = useState<{ x: number, y: number } | null>(null);
  
  // Set initial cursor position when starting to drag a block
  const handlePreciseDragStart = (blockId: string, cursorPos: { x: number, y: number }) => {
    const block = flow.blocks.find(b => b.id === blockId);
    if (block) {
      // Calculate cursor offset relative to the block's position in canvas coordinates
      const blockCanvasX = block.position.x;
      const blockCanvasY = block.position.y;
      
      // Convert cursor position from screen to canvas coordinates
      const cursorCanvasX = (cursorPos.x - position.x) / scale;
      const cursorCanvasY = (cursorPos.y - position.y) / scale;
      
      // Store offset between cursor and block origin
      setCursorOffset({
        x: cursorCanvasX - blockCanvasX,
        y: cursorCanvasY - blockCanvasY
      });
    }
    
    setDraggingBlockId(blockId);
  };
  
  // Modified drag move handler with snap-to-grid and cursor offset adjustment
  const handleDragMoveWithSnap = (blockId: string, newCursorPosition: { x: number, y: number }) => {
    if (!cursorOffset) return;
    
    // Convert cursor position from screen to canvas coordinates
    const cursorCanvasX = (newCursorPosition.x - position.x) / scale;
    const cursorCanvasY = (newCursorPosition.y - position.y) / scale;
    
    // Calculate new block position by subtracting the original cursor offset
    const newBlockPosition = {
      x: cursorCanvasX - cursorOffset.x,
      y: cursorCanvasY - cursorOffset.y
    };
    
    // Snap to grid after converting to canvas coordinates
    const snappedPosition = snapToGrid(newBlockPosition.x, newBlockPosition.y);
    
    // Update block with snapped canvas coordinates
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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
      
      {/* Scale indicator */}
      <div className="absolute bottom-20 right-6 bg-white rounded-lg shadow-lg z-30 flex">
        <div className="p-2">
          {Math.round(scale * 100)}%
        </div>
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
              onDragStart={(cursorPos) => handlePreciseDragStart(block.id, cursorPos)}
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
