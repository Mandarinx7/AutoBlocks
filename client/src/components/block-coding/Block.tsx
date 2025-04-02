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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.block-header')) {
      setIsDraggingLocal(true);
      onDragStart();
      
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingLocal && blockRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
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
  }, [isDraggingLocal, handleMouseMove]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.block-header')) {
      setIsDraggingLocal(true);
      onDragStart();
      
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
      }
      
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDraggingLocal && blockRef.current) {
      const newX = e.touches[0].clientX - dragOffset.x;
      const newY = e.touches[0].clientY - dragOffset.y;
      onDragMove({ x: newX, y: newY });
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
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingLocal]);

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
      className={`absolute block-card ${isDragging ? 'is-dragging' : ''}`}
      style={{
        left: `${block.position.x}px`,
        top: `${block.position.y}px`,
        touchAction: 'none',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Connection points */}
      <div className="connection-point connection-point-input" 
        data-connection-point="input"
        data-block-id={block.id}
      />
      <div className="connection-point connection-point-output"
        data-connection-point="output"
        data-block-id={block.id}
      />
      
      <div 
        className="block-header cursor-move"
        style={{ backgroundColor: config.headerColor }}
      >
        <span className="font-medium text-sm">{config.label}</span>
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
        <div className="block-content">
          <div className="space-y-3">
            {config.params && config.params.map((param) => (
              <div key={param.name} className="block-param">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {param.label}
                </label>
                <div className="relative">
                  {renderParamInput(param)}
                </div>
              </div>
            ))}
            
            {/* Block description */}
            {config.description && (
              <div className="mt-3 text-xs text-gray-500 italic">
                {config.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Block;
