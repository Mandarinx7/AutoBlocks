import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Block as BlockType } from "@/pages/BlockCoding";
import { BlockConfig } from "@/lib/block-coding/blockTypes";

/**
 * Block component that provides:
 * - Draggable blocks from anywhere on the block (not just the header)
 * - Touch and mouse controls for dragging
 * - Inline parameter editing without opening modals
 * - Collapsible content for better space management
 * - Visual connection points for flows
 */
interface BlockProps {
  block: BlockType;
  config: BlockConfig;
  onDragStart: (cursorPos: { x: number; y: number }) => void;
  onDragMove: (position: { x: number; y: number }) => void;
  onDragEnd: () => void;
  onUpdateParams: (key: string, value: any) => void;
  onRemove: () => void;
  isDragging: boolean;
}

const Block = ({
  block,
  config,
  onDragStart,
  onDragMove,
  onDragEnd,
  onUpdateParams,
  onRemove,
  isDragging
}: BlockProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);

  // Initialize default params if they don't exist
  useEffect(() => {
    if (config.params) {
      config.params.forEach(param => {
        if (block.params[param.name] === undefined) {
          onUpdateParams(param.name, param.defaultValue);
        }
      });
    }
  }, [block.params, config.params, onUpdateParams]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Allow dragging from anywhere in the block except buttons, inputs and selects
    if (!(e.target as HTMLElement).closest('button') && 
        !(e.target as HTMLElement).closest('input') && 
        !(e.target as HTMLElement).closest('select')) {
      setIsDraggingLocal(true);
      // Pass cursor position to parent component
      onDragStart({ x: e.clientX, y: e.clientY });
      
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect) {
        // Capture the offset within the block for precise positioning
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      
      // Stop event propagation to prevent canvas panning while dragging blocks
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingLocal && blockRef.current) {
      // Pass absolute screen coordinates to the parent component
      // The Canvas will handle conversion to canvas coordinates
      const newX = e.clientX;
      const newY = e.clientY;
      
      // Using requestAnimationFrame for smoother movement
      requestAnimationFrame(() => {
        onDragMove({ x: newX, y: newY });
      });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingLocal) {
      setIsDraggingLocal(false);
      onDragEnd();
    }
  };

  useEffect(() => {
    if (isDraggingLocal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLocal, handleMouseMove]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Allow dragging from anywhere in the block except buttons, inputs and selects
    if (!(e.target as HTMLElement).closest('button') && 
        !(e.target as HTMLElement).closest('input') && 
        !(e.target as HTMLElement).closest('select')) {
      setIsDraggingLocal(true);
      // Pass touch position to parent component
      onDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
      
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect) {
        // Capture the exact touch point on the block for precise positioning
        setDragOffset({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
      }
      
      // Stop event propagation to prevent canvas panning while dragging blocks
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDraggingLocal && blockRef.current) {
      // Pass absolute screen coordinates from touch directly to parent component
      // The Canvas will handle conversion to canvas coordinates
      const newX = e.touches[0].clientX;
      const newY = e.touches[0].clientY;
      
      // Using requestAnimationFrame for smoother movement
      requestAnimationFrame(() => {
        onDragMove({ x: newX, y: newY });
      });
      
      // Prevent default to avoid unwanted scrolling
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (isDraggingLocal) {
      setIsDraggingLocal(false);
      onDragEnd();
    }
  };

  useEffect(() => {
    if (isDraggingLocal) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingLocal, handleTouchMove, handleTouchEnd]);

  const renderParamInput = (param: any) => {
    switch (param.type) {
      case 'text':
        return (
          <Input
            value={block.params[param.name] || ''}
            onChange={(e) => onUpdateParams(param.name, e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={block.params[param.name] || 0}
            onChange={(e) => onUpdateParams(param.name, parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
          />
        );
      case 'select':
        return (
          <select
            value={block.params[param.name] || param.options[0]?.value}
            onChange={(e) => onUpdateParams(param.name, e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
          >
            {param.options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input
            value={block.params[param.name] || ''}
            onChange={(e) => onUpdateParams(param.name, e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
          />
        );
    }
  };

  return (
    <div
      ref={blockRef}
      className={`absolute p-0 bg-white rounded-lg shadow-md ${isDragging ? 'shadow-lg' : ''}`}
      style={{
        left: `${block.position.x}px`,
        top: `${block.position.y}px`,
        width: '200px',  // Changed from 240px to 200px (10 * GRID_SIZE)
        height: 'auto',  // Height will adjust based on content
        zIndex: isDragging ? 50 : 1,  // Higher z-index when dragging
        touchAction: 'none',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className={`block-header ${config.headerColor} text-white px-3 py-2 rounded-t-lg flex items-center justify-between cursor-move`}
      >
        <span className="font-medium">{config.label}</span>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white opacity-80 hover:opacity-100 p-1"
          >
            <ChevronDown className={`h-4 w-4 transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
          <button 
            onClick={onRemove}
            className="text-white opacity-80 hover:opacity-100 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-3">
          <div className="space-y-3">
            {config.params && config.params.map((param) => (
              <div key={param.name}>
                <label className="block text-xs text-gray-600">
                  {param.label}
                </label>
                <div className="relative mt-1">
                  {renderParamInput(param)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-b-lg">
        <div 
          className={`connection-point w-3 h-3 rounded-full ${config.connectionPointColor} opacity-70`}
          data-connection-point="input"
          data-block-id={block.id}
        />
        <div 
          className={`connection-point w-3 h-3 rounded-full ${config.connectionPointColor} opacity-70`}
          data-connection-point="output"
          data-block-id={block.id}
        />
      </div>
    </div>
  );
};

export default Block;
