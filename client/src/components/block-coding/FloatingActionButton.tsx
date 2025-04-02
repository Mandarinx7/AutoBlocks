import { PlusIcon, FileIcon, LayoutTemplate, TrashIcon } from "lucide-react";

interface FloatingActionButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddBlock: () => void;
  onNewFlow: () => void;
  onClearCanvas: () => void;
}

const FloatingActionButton = ({
  isOpen,
  onToggle,
  onAddBlock,
  onNewFlow,
  onClearCanvas
}: FloatingActionButtonProps) => {
  return (
    <>
      <button 
        onClick={onToggle}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-20 pulse-animation"
      >
        <PlusIcon className="h-8 w-8" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-24 right-6 bg-white rounded-lg shadow-xl p-3 z-20">
          <div className="space-y-2 w-48">
            <button 
              onClick={onAddBlock}
              className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="w-6 h-6 mr-2 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
                <PlusIcon className="h-4 w-4" />
              </span>
              <span className="text-sm">Add Block</span>
            </button>
            
            <button 
              onClick={onNewFlow}
              className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="w-6 h-6 mr-2 flex items-center justify-center bg-green-100 text-green-600 rounded">
                <FileIcon className="h-4 w-4" />
              </span>
              <span className="text-sm">New Flow</span>
            </button>
            
            <button className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
              <span className="w-6 h-6 mr-2 flex items-center justify-center bg-purple-100 text-purple-600 rounded">
                <LayoutTemplate className="h-4 w-4" />
              </span>
              <span className="text-sm">From Template</span>
            </button>
            
            <button 
              onClick={onClearCanvas}
              className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="w-6 h-6 mr-2 flex items-center justify-center bg-red-100 text-red-600 rounded">
                <TrashIcon className="h-4 w-4" />
              </span>
              <span className="text-sm">Clear Canvas</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingActionButton;
