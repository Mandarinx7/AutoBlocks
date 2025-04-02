import { useRef } from "react";
import { X, Copy, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  onRunCode: () => void;
}

const CodePreviewModal = ({ isOpen, onClose, code, onRunCode }: CodePreviewModalProps) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  const handleCopyCode = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(code);
      toast({
        title: "Code copied",
        description: "The code has been copied to your clipboard.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Generated JavaScript Code</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <pre 
            ref={codeRef}
            className="bg-gray-800 text-gray-100 p-4 rounded-md text-sm overflow-x-auto"
          >
            <code>{code}</code>
          </pre>
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-3">
          <button 
            onClick={handleCopyCode}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm flex items-center"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </button>
          <button 
            onClick={onRunCode}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Run Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodePreviewModal;
