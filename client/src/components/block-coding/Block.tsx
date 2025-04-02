import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Block as BlockType } from "@/pages/BlockCoding";
import { BlockConfig } from "@/lib/block-coding/blockTypes";

interface BlockProps {
  block: BlockType;
  config: BlockConfig;
  onDragStart: () => void;
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

  // Adjustment for canvas scale and position
  const adjustForCanvasTransform = (clientX: number, clientY: number) => {
    // Get the current canvas element (could be passed as a prop or found via DOM)
    const canvasElement = document.querySelector('.canvas-background');
    
    if (!canvasElement) return { x: clientX, y: clientY };
    
    // Get canvas transformation
    const canvasStyle = window.getComputedStyle(canvasElement);
    const transform = canvasStyle.transform || canvasStyle.webkitTransform || '';
    
    // Default values if we can't parse transform
    let scaleValue = 1;
    let translateX = 0;
    let translateY = 0;
    
    // Extract scale and translation values from transform matrix
    if (transform && transform !== 'none') {
      // Transform matrix format: matrix(scaleX, 0, 0, scaleY, translateX, translateY)
      const matrix = transform.match(/^matrix\((.+)\)$/);
      if (matrix) {
        const values = matrix[1].split(', ');
        scaleValue = parseFloat(values[0]);
        translateX = parseFloat(values[4]);
        translateY = parseFloat(values[5]);
      }
    }
    
    // Adjust coordinates for canvas scale and position
    const adjustedX = (clientX - translateX) / scaleValue;
    const adjustedY = (clientY - translateY) / scaleValue;
    
    return { x: adjustedX, y: adjustedY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = e.target as HTMLElement;
    
    // Only initiate drag on header
    if (targetElement.closest('.block-header')) {
      setIsDraggingLocal(true);
      onDragStart();
      
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect) {
        // Store the offset from the click point to the top-left corner of the block
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingLocal && blockRef.current) {
      // Calculate new position using adjusted coordinates
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Calculate position in canvas space
      onDragMove({ x: newX, y: newY });
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
  }, [isDraggingLocal, dragOffset]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const targetElement = e.target as HTMLElement;
    
    // Only initiate drag on header
    if (targetElement.closest('.block-header')) {
      setIsDraggingLocal(true);
      onDragStart();
      
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect && e.touches.length > 0) {
        // Store the offset from the touch point to the top-left corner of the block
        setDragOffset({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
      }
      
      // Prevent default to avoid scrolling while dragging
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDraggingLocal && blockRef.current && e.touches.length > 0) {
      // Get the canvas element
      const canvasElement = document.querySelector('.canvas-background');
      if (!canvasElement) return;
      const canvasRect = canvasElement.getBoundingClientRect();
      
      // Get current scale from canvas transform
      const canvasStyle = window.getComputedStyle(canvasElement);
      const transform = canvasStyle.transform || canvasStyle.webkitTransform || '';
      let scale = 1;
      
      // Extract scale value from transform matrix if present
      if (transform && transform !== 'none') {
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) {
          const values = matrix[1].split(', ');
          scale = parseFloat(values[0]);
        }
      }
      
      // Calculate new position, adjusting for canvas scale and offset
      const touch = e.touches[0];
      
      // Get touch position relative to canvas
      const touchX = touch.clientX - canvasRect.left;
      const touchY = touch.clientY - canvasRect.top;
      
      // Calculate block position considering scale and drag offset
      const newX = (touchX / scale) - (dragOffset.x / scale);
      const newY = (touchY / scale) - (dragOffset.y / scale);
      
      // Send position update
      onDragMove({ x: newX, y: newY });
      
      // Prevent scrolling
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isDraggingLocal) {
      setIsDraggingLocal(false);
      onDragEnd();
      
      // Prevent any default behavior
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    if (isDraggingLocal) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDraggingLocal, dragOffset]);

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
        width: '240px',
        zIndex: isDragging ? 10 : 1,
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
          className={`connection-point w-4 h-4 rounded-full ${config.connectionPointColor} opacity-70 hover:opacity-100 hover:scale-125 transition-all cursor-pointer flex items-center justify-center`}
          data-connection-point="input"
          data-block-id={block.id}
          title="Drag from another block to connect here"
        >
          {block.connections.inputs.length > 0 && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
        <div 
          className={`connection-point w-4 h-4 rounded-full ${config.connectionPointColor} opacity-70 hover:opacity-100 hover:scale-125 transition-all cursor-pointer flex items-center justify-center`}
          data-connection-point="output"
          data-block-id={block.id}
          title="Drag from here to another block to connect"
        >
          {block.connections.outputs.length > 0 && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Block;
