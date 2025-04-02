import { useState } from "react";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import BlockLibrary from "./BlockLibrary";
import { blockCategories } from "@/lib/block-coding/blockTypes";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string) => void;
}

const Sidebar = ({ isOpen, onClose, onAddBlock }: SidebarProps) => {
  return (
    <div 
      className={`w-64 h-full bg-white shadow-lg transform transition-transform duration-300 fixed z-40 md:relative ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-semibold text-primary">Block Coding</h1>
          <button 
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Block Categories
          </h2>
          
          {blockCategories.map((category) => (
            <div key={category.id} className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">{category.name}</h3>
              <BlockLibrary 
                blocks={category.blocks} 
                onAddBlock={onAddBlock} 
              />
            </div>
          ))}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <button 
              onClick={() => onAddBlock('variable')}
              className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              New Block
            </button>
            <button className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm">
              Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
