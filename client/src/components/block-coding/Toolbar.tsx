import { useState } from "react";
import { Menu, Code, Download, Upload, Play } from "lucide-react";
import { DownloadButton } from "./DownloadButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ToolbarProps {
  flowName: string;
  onOpenSidebar: () => void;
  onViewCode: () => void;
  onSaveFlow: () => void;
  onRunCode: () => void;
}

const Toolbar = ({ 
  flowName, 
  onOpenSidebar, 
  onViewCode, 
  onSaveFlow, 
  onRunCode 
}: ToolbarProps) => {
  const [name, setName] = useState(flowName);

  return (
    <div className="bg-white shadow z-10">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <button 
            onClick={onOpenSidebar}
            className="mr-3 text-gray-600 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Input
            className="h-8 w-32 md:w-auto text-lg font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSaveFlow}
            className="text-gray-600 hover:text-primary"
          >
            <Download className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-600 hover:text-primary"
          >
            <Upload className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onViewCode}
            className="text-gray-600 hover:text-primary"
          >
            <Code className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={onRunCode}
            size="sm"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
