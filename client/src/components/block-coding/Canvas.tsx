import { useState, useRef, useEffect } from "react";
import { getBlockConfig } from "@/lib/block-coding/blockTypes";
import Block from "@/components/block-coding/Block";
import { Block as BlockType, Edge, Flow } from "@/pages/BlockCoding";

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
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  // Connection dragging state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ 
    blockId: string, 
    point: string, 
    x: number, 
    y: number 
  } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    // Get initial canvas position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasPosition({ x: rect.left, y: rect.top });
    }

    // Add event listeners for connection creation
    const handleConnectorMouseDown = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      
      // Check if clicked on a connection point
      if (e.target.classList.contains('connection-point')) {
        const blockId = e.target.getAttribute('data-block-id');
        const pointType = e.target.getAttribute('data-connection-point');
        
        if (blockId && pointType) {
          setIsConnecting(true);
          
          // Get the canvas element
          const canvasElement = document.querySelector('.canvas-background');
          if (!canvasElement) return;
          const canvasRect = canvasElement.getBoundingClientRect();
          
          if (!canvasRect) return;
          
          // Get canvas transform
          const canvasStyle = window.getComputedStyle(canvasElement);
          const transform = canvasStyle.transform || canvasStyle.webkitTransform;
          let scale = 1;
          let translateX = 0;
          let translateY = 0;
          
          // Extract scale and translation values from transform matrix
          if (transform && transform !== 'none') {
            const matrix = transform.match(/^matrix\((.+)\)$/);
            if (matrix) {
              const values = matrix[1].split(', ');
              scale = parseFloat(values[0]);
              translateX = parseFloat(values[4]);
              translateY = parseFloat(values[5]);
            }
          }
          
          // Get the position of this connection point
          const rect = e.target.getBoundingClientRect();
          
          // Calculate position in canvas space
          const pointX = ((rect.left + rect.width / 2 - canvasRect.left) / scale) - (translateX / scale);
          const pointY = ((rect.top + rect.height / 2 - canvasRect.top) / scale) - (translateY / scale);
          
          // Snap to grid
          const snappedX = Math.round(pointX / GRID_SIZE) * GRID_SIZE;
          const snappedY = Math.round(pointY / GRID_SIZE) * GRID_SIZE;
          
          console.log("Connection start at:", snappedX, snappedY);
          
          setConnectionStart({
            blockId,
            point: pointType,
            x: snappedX,
            y: snappedY
          });
          
          setConnectionEnd({
            x: snappedX,
            y: snappedY
          });
          
          // Handle both MouseEvent and TouchEvent
          if (typeof e.preventDefault === 'function') {
            e.preventDefault();
          }
          if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
          }
        }
      }
    };
    
    const handleConnectorMouseMove = (e: MouseEvent) => {
      if (isConnecting) {
        // Get the canvas element
        const canvasElement = document.querySelector('.canvas-background');
        if (!canvasElement) return;
        const canvasRect = canvasElement.getBoundingClientRect();
        
        // Get canvas transform
        const canvasStyle = window.getComputedStyle(canvasElement);
        const transform = canvasStyle.transform || canvasStyle.webkitTransform;
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        
        // Extract scale and translation values from transform matrix
        if (transform && transform !== 'none') {
          const matrix = transform.match(/^matrix\((.+)\)$/);
          if (matrix) {
            const values = matrix[1].split(', ');
            scale = parseFloat(values[0]);
            translateX = parseFloat(values[4]);
            translateY = parseFloat(values[5]);
          }
        }
        
        // Calculate mouse position in canvas space
        const mouseX = ((e.clientX - canvasRect.left) / scale) - (translateX / scale);
        const mouseY = ((e.clientY - canvasRect.top) / scale) - (translateY / scale);
        
        // Snap to grid
        const snappedX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;
        
        setConnectionEnd({
          x: snappedX,
          y: snappedY
        });
      }
    };
    
    const handleConnectorMouseUp = (e: MouseEvent) => {
      if (isConnecting && connectionStart) {
        if (!(e.target instanceof Element)) {
          setIsConnecting(false);
          setConnectionStart(null);
          return;
        }
        
        // Check if dropped on a connection point
        if (e.target.classList.contains('connection-point')) {
          const targetBlockId = e.target.getAttribute('data-block-id');
          const targetPointType = e.target.getAttribute('data-connection-point');
          
          if (targetBlockId && targetPointType && targetBlockId !== connectionStart.blockId) {
            // Determine source and target based on connection points
            let sourceBlockId, targetBlock;
            
            if (connectionStart.point === 'output' && targetPointType === 'input') {
              // Valid connection: output -> input
              sourceBlockId = connectionStart.blockId;
              targetBlock = targetBlockId;
            } else if (connectionStart.point === 'input' && targetPointType === 'output') {
              // Reverse connection: input <- output 
              sourceBlockId = targetBlockId;
              targetBlock = connectionStart.blockId;
            } else {
              // Invalid connection (output -> output or input -> input)
              setIsConnecting(false);
              setConnectionStart(null);
              return;
            }
            
            // Create edge with unique ID
            const edge: Edge = {
              id: `edge-${Date.now()}`,
              source: sourceBlockId,
              sourceHandle: 'output',
              target: targetBlock,
              targetHandle: 'input'
            };
            
            onAddEdge(edge);
          }
        }
        
        setIsConnecting(false);
        setConnectionStart(null);
      }
    };
    
    // Add canvas-level event listeners
    document.addEventListener('mousedown', handleConnectorMouseDown);
    document.addEventListener('mousemove', handleConnectorMouseMove);
    document.addEventListener('mouseup', handleConnectorMouseUp);
    
    // For mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        // Create a MouseEvent-like object from touch
        const mouseEventLike = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: touch.target,
          preventDefault: () => {
            if (typeof e.preventDefault === 'function') {
              e.preventDefault();
            }
          },
          stopPropagation: () => {
            if (typeof e.stopPropagation === 'function') {
              e.stopPropagation();
            }
          }
        };
        handleConnectorMouseDown(mouseEventLike as unknown as MouseEvent);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const mouseEventLike = {
          clientX: touch.clientX,
          clientY: touch.clientY
        };
        handleConnectorMouseMove(mouseEventLike as unknown as MouseEvent);
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const mouseEventLike = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: touch.target
        };
        handleConnectorMouseUp(mouseEventLike as unknown as MouseEvent);
      } else {
        setIsConnecting(false);
        setConnectionStart(null);
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('mousedown', handleConnectorMouseDown);
      document.removeEventListener('mousemove', handleConnectorMouseMove);
      document.removeEventListener('mouseup', handleConnectorMouseUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isConnecting, connectionStart, onAddEdge, canvasRef]);

  const handleDragStart = (blockId: string) => {
    setDraggingBlockId(blockId);
  };

  // Grid snapping constants
  const GRID_SIZE = 20; // Size of grid in pixels
  // Always snap to grid, no threshold
  
  const snapToGrid = (position: { x: number; y: number }): { x: number; y: number } => {
    // Always snap to grid, more predictable behavior
    const snapX = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
    const snapY = Math.round(position.y / GRID_SIZE) * GRID_SIZE;
    
    return { x: snapX, y: snapY };
  };

  const handleDragMove = (blockId: string, newPosition: { x: number; y: number }) => {
    // Apply grid snapping when dragging blocks
    const snappedPosition = snapToGrid(newPosition);
    onUpdateBlock(blockId, { position: snappedPosition });
  };

  const handleDragEnd = () => {
    setDraggingBlockId(null);
  };

  // Handle canvas pan and zoom
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  const [startCanvasPosition, setStartCanvasPosition] = useState({ x: 0, y: 0 });
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const [startScale, setStartScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  // Handle mouse pan interactions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicked directly on the canvas, not on a block
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      setStartPanPoint({ x: e.clientX, y: e.clientY });
      setStartCanvasPosition({ ...canvasPosition });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      const dx = e.clientX - startPanPoint.x;
      const dy = e.clientY - startPanPoint.y;
      
      setCanvasPosition({
        x: startCanvasPosition.x + dx,
        y: startCanvasPosition.y + dy
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Handle touch pan and zoom interactions
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // Single finger pan
      setIsPanning(true);
      setStartPanPoint({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
      setStartCanvasPosition({ ...canvasPosition });
    } else if (e.touches.length === 2) {
      // Two finger pinch-zoom
      setIsPinching(true);
      setIsPanning(false);
      
      // Calculate distance between fingers
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      setPinchStartDistance(distance);
      setStartScale(scale);
      
      // Calculate midpoint for scaling around it
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setStartPanPoint({ x: midX, y: midY });
    }
  };
  
  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPanning && e.touches.length === 1) {
      // Single finger pan
      const dx = e.touches[0].clientX - startPanPoint.x;
      const dy = e.touches[0].clientY - startPanPoint.y;
      
      setCanvasPosition({
        x: startCanvasPosition.x + dx,
        y: startCanvasPosition.y + dy
      });
    } else if (isPinching && e.touches.length === 2 && pinchStartDistance !== null) {
      // Two finger pinch-zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate scale factor based on finger distance change
      const scaleFactor = distance / pinchStartDistance;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * scaleFactor));
      
      setScale(newScale);
      
      // Calculate the midpoint between the two fingers
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      // We could also adjust position to zoom toward the pinch center point
      // This is a simplified version of that logic
      const dScale = newScale / startScale;
      if (dScale !== 1) {
        // Adjust position to zoom toward fingers
        const dx = midX - startPanPoint.x;
        const dy = midY - startPanPoint.y;
        setCanvasPosition(prev => ({
          x: prev.x - dx * (dScale - 1) / dScale,
          y: prev.y - dy * (dScale - 1) / dScale
        }));
      }
    }
    
    // Prevent default browser behavior (page scrolling/zooming)
    if (isPanning || isPinching) {
      e.preventDefault();
    }
  };
  
  const handleCanvasTouchEnd = () => {
    setIsPanning(false);
    setIsPinching(false);
    setPinchStartDistance(null);
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-gray-50">
      <div 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full overflow-hidden canvas-background"
        style={{ touchAction: 'none' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        onTouchCancel={handleCanvasTouchEnd}
      >
        <div 
          className="absolute"
          style={{
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: '5000px',
            height: '5000px'
          }}
        >
          {/* SVG for connectors */}
          <svg className="absolute inset-0 w-full h-full z-0">
            {/* Existing connections */}
            {flow.edges.map((edge) => {
              const sourceBlock = flow.blocks.find(b => b.id === edge.source);
              const targetBlock = flow.blocks.find(b => b.id === edge.target);
              
              if (!sourceBlock || !targetBlock) return null;
              
              // Calculate connector points
              const x1 = sourceBlock.position.x + 120; // Assuming block width is 240px
              const y1 = sourceBlock.position.y + 70;  // Approximate output point
              const x2 = targetBlock.position.x;
              const y2 = targetBlock.position.y + 70;  // Approximate input point
              
              // Calculate control points for curved connector
              const deltaX = Math.abs(x2 - x1) * 0.5;
              const path = `M${x1},${y1} C${x1+deltaX},${y1} ${x2-deltaX},${y2} ${x2},${y2}`;
              
              return (
                <g key={edge.id}>
                  <path
                    d={path}
                    className="stroke-purple-500 stroke-2 fill-none"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Wider invisible path for better touch target */}
                  <path
                    d={path}
                    className="stroke-transparent stroke-[10px] fill-none cursor-pointer"
                    onClick={() => onRemoveEdge(edge.id)} 
                  />
                  <title>Click to remove connection</title>
                </g>
              );
            })}
            
            {/* Connection being created */}
            {isConnecting && connectionStart && (
              <path
                d={`M${connectionStart.x},${connectionStart.y} 
                    C${connectionStart.x + 50},${connectionStart.y} 
                    ${connectionEnd.x - 50},${connectionEnd.y} 
                    ${connectionEnd.x},${connectionEnd.y}`}
                className="stroke-purple-500 stroke-2 fill-none stroke-dashed"
                strokeDasharray="5,5"
              />
            )}
            
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
                onDragMove={(newPos) => handleDragMove(block.id, newPos)}
                onDragEnd={handleDragEnd}
                onUpdateParams={(key, value) => onUpdateBlockParams(block.id, key, value)}
                onRemove={() => onRemoveBlock(block.id)}
                isDragging={draggingBlockId === block.id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Canvas;