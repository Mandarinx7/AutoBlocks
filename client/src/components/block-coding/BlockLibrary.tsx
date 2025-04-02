import React from "react";
import { Block } from "@/lib/block-coding/blockTypes";

interface BlockLibraryProps {
  blocks: Block[];
  onAddBlock: (blockType: string) => void;
}

const BlockLibrary = ({ blocks, onAddBlock }: BlockLibraryProps) => {
  return (
    <div className="space-y-2">
      {blocks.map((block) => (
        <div
          key={block.type}
          className={`p-2 ${block.bgColor} rounded-md border ${block.borderColor} cursor-grab hover:shadow-md transition-shadow`}
          onClick={() => onAddBlock(block.type)}
        >
          <div className="text-sm font-medium">{block.label}</div>
          <div className="text-xs text-gray-500">{block.description}</div>
        </div>
      ))}
    </div>
  );
};

export default BlockLibrary;
