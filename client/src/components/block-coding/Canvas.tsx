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
          
          // Get the position of this connection point
          const rect = e.target.getBoundingClientRect();
          const pointX = rect.left + rect.width / 2;
          const pointY = rect.top + rect.height / 2;
          
          setConnectionStart({
            blockId,
            point: pointType,
            x: pointX,
            y: pointY
          });
          
          setConnectionEnd({
            x: pointX,
            y: pointY
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
        setConnectionEnd({
          x: e.clientX,
          y: e.clientY
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

  const handleDragMove = (blockId: string, newPosition: { x: number; y: number }) => {
    onUpdateBlock(blockId, { position: newPosition });
  };

  const handleDragEnd = () => {
    setDraggingBlockId(null);
  };

  // Handle canvas pan and zoom
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  const [startCanvasPosition, setStartCanvasPosition] = useState({ x: 0, y: 0 });

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

  return (
    <div className="relative flex-1 overflow-hidden bg-gray-50 touch-none">
      <div 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full overflow-hidden canvas-background"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
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