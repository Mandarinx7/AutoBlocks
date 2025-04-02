import { useState, useEffect } from "react";
import Sidebar from "@/components/block-coding/Sidebar";
import Toolbar from "@/components/block-coding/Toolbar";
import Canvas from "@/components/block-coding/Canvas";
import FloatingActionButton from "@/components/block-coding/FloatingActionButton";
import CodePreviewModal from "@/components/block-coding/CodePreviewModal";
import { useToast } from "@/hooks/use-toast";
import { loadFlow, saveFlow, listFlows } from "@/lib/block-coding/flowStorage";
import { generateJavaScriptCode } from "@/lib/block-coding/codeGenerator";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Block {
  id: string;
  type: string;
  position: { x: number; y: number };
  params: Record<string, any>;
  connections: {
    inputs: string[];
    outputs: string[];
  };
}

export interface Edge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface Flow {
  id: string;
  name: string;
  blocks: Block[];
  edges: Edge[];
}

const BlockCoding = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<Flow>({
    id: "flow-" + Date.now(),
    name: "My Flow",
    blocks: [],
    edges: []
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Generate code whenever the flow changes
    const code = generateJavaScriptCode(currentFlow);
    setGeneratedCode(code);
  }, [currentFlow]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenCodeModal = () => {
    setIsCodeModalOpen(true);
  };

  const handleCloseCodeModal = () => {
    setIsCodeModalOpen(false);
  };

  const handleAddBlock = (blockType: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType,
      position: { x: 100, y: 100 },
      params: {},
      connections: {
        inputs: [],
        outputs: []
      }
    };

    setCurrentFlow(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
    setIsFabMenuOpen(false);
  };

  const handleSaveFlow = () => {
    saveFlow(currentFlow);
    toast({
      title: "Flow saved",
      description: `Your flow "${currentFlow.name}" has been saved.`
    });
  };

  const handleLoadFlow = async (flowId: string) => {
    const flow = await loadFlow(flowId);
    if (flow) {
      setCurrentFlow(flow);
      toast({
        title: "Flow loaded",
        description: `Flow "${flow.name}" has been loaded.`
      });
    }
  };

  const handleRunCode = () => {
    try {
      // Execute the generated code
      // Using Function to execute the generated code safely
      const executeFunction = new Function(generatedCode);
      executeFunction();
      
      toast({
        title: "Code executed",
        description: "The code was executed successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error executing code:", error);
      toast({
        title: "Execution error",
        description: error instanceof Error ? error.message : "Failed to execute code",
        variant: "destructive"
      });
    }
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    setCurrentFlow(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, ...updates } 
          : block
      )
    }));
  };

  const handleUpdateBlockParams = (
    blockId: string, 
    paramKey: string, 
    paramValue: any
  ) => {
    setCurrentFlow(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              params: {
                ...block.params,
                [paramKey]: paramValue
              }
            } 
          : block
      )
    }));
  };

  const handleAddEdge = (edge: Edge) => {
    // Check if there's already a connection between these blocks
    const existingEdge = currentFlow.edges.find(
      e => e.source === edge.source && e.target === edge.target
    );
    
    if (existingEdge) {
      toast({
        title: "Connection exists",
        description: "These blocks are already connected.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate that this won't create a circular reference
    if (wouldCreateCircularReference(edge, currentFlow.edges)) {
      toast({
        title: "Invalid connection",
        description: "This would create a circular reference.",
        variant: "destructive"
      });
      return;
    }
    
    // Add the new edge
    setCurrentFlow(prev => ({
      ...prev,
      edges: [...prev.edges, edge]
    }));
    
    // Update the connections in the blocks
    setCurrentFlow(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.id === edge.source) {
          return {
            ...block,
            connections: {
              ...block.connections,
              outputs: [...block.connections.outputs, edge.target]
            }
          };
        } else if (block.id === edge.target) {
          return {
            ...block,
            connections: {
              ...block.connections,
              inputs: [...block.connections.inputs, edge.source]
            }
          };
        }
        return block;
      })
    }));
  };
  
  // Check if adding a new edge would create a circular reference
  const wouldCreateCircularReference = (newEdge: Edge, existingEdges: Edge[]): boolean => {
    const edges = [...existingEdges, newEdge];
    const graph = buildGraph(edges);
    
    // Perform DFS to detect cycles
    const visited = new Set<string>();
    const recStack = new Set<string>();
    
    const hasCycle = (node: string): boolean => {
      if (!visited.has(node)) {
        visited.add(node);
        recStack.add(node);
        
        const neighbors = graph.get(node) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && hasCycle(neighbor)) {
            return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }
      
      recStack.delete(node);
      return false;
    };
    
    return hasCycle(newEdge.source);
  };
  
  // Build adjacency list representation of the graph
  const buildGraph = (edges: Edge[]): Map<string, string[]> => {
    const graph = new Map<string, string[]>();
    
    for (const edge of edges) {
      if (!graph.has(edge.source)) {
        graph.set(edge.source, []);
      }
      graph.get(edge.source)!.push(edge.target);
    }
    
    return graph;
  };

  const handleRemoveEdge = (edgeId: string) => {
    // First, get the edge that will be removed
    const edgeToRemove = currentFlow.edges.find(edge => edge.id === edgeId);
    
    if (!edgeToRemove) return;
    
    // Remove the edge
    setCurrentFlow(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => edge.id !== edgeId)
    }));
    
    // Update the connections in the blocks
    setCurrentFlow(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.id === edgeToRemove.source) {
          return {
            ...block,
            connections: {
              ...block.connections,
              outputs: block.connections.outputs.filter(id => id !== edgeToRemove.target)
            }
          };
        } else if (block.id === edgeToRemove.target) {
          return {
            ...block,
            connections: {
              ...block.connections,
              inputs: block.connections.inputs.filter(id => id !== edgeToRemove.source)
            }
          };
        }
        return block;
      })
    }));
  };

  const handleRemoveBlock = (blockId: string) => {
    // Get all edges connected to this block
    const connectedEdges = currentFlow.edges.filter(
      edge => edge.source === blockId || edge.target === blockId
    );
    
    // Remove the block and its connected edges
    setCurrentFlow(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId),
      edges: prev.edges.filter(
        edge => edge.source !== blockId && edge.target !== blockId
      )
    }));
    
    // Update connections in other blocks that were connected to this block
    setCurrentFlow(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        // Remove this block from other blocks' inputs
        if (block.connections.inputs.includes(blockId)) {
          return {
            ...block,
            connections: {
              ...block.connections,
              inputs: block.connections.inputs.filter(id => id !== blockId)
            }
          };
        }
        
        // Remove this block from other blocks' outputs
        if (block.connections.outputs.includes(blockId)) {
          return {
            ...block,
            connections: {
              ...block.connections,
              outputs: block.connections.outputs.filter(id => id !== blockId)
            }
          };
        }
        
        return block;
      })
    }));
    
    toast({
      title: "Block removed",
      description: `Block removed with ${connectedEdges.length} connection(s).`
    });
  };

  const handleNewFlow = () => {
    setCurrentFlow({
      id: "flow-" + Date.now(),
      name: "My Flow",
      blocks: [],
      edges: []
    });
    
    toast({
      title: "New flow created",
      description: "Started a new empty flow."
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={toggleSidebar}
        onAddBlock={handleAddBlock} 
      />
      
      <div className="flex-1 flex flex-col h-full relative">
        <Toolbar 
          flowName={currentFlow.name}
          onOpenSidebar={toggleSidebar}
          onViewCode={handleOpenCodeModal}
          onSaveFlow={handleSaveFlow}
          onRunCode={handleRunCode}
        />
        
        <Canvas 
          flow={currentFlow}
          onUpdateBlock={handleUpdateBlock}
          onUpdateBlockParams={handleUpdateBlockParams}
          onAddEdge={handleAddEdge}
          onRemoveEdge={handleRemoveEdge}
          onRemoveBlock={handleRemoveBlock}
        />
        
        <FloatingActionButton 
          isOpen={isFabMenuOpen}
          onToggle={() => setIsFabMenuOpen(!isFabMenuOpen)}
          onAddBlock={() => setIsSidebarOpen(true)}
          onNewFlow={handleNewFlow}
          onClearCanvas={() => {
            setCurrentFlow(prev => ({ ...prev, blocks: [], edges: [] }));
            toast({
              title: "Canvas cleared",
              description: "All blocks and connections have been removed."
            });
          }}
        />
      </div>
      
      <CodePreviewModal 
        isOpen={isCodeModalOpen}
        onClose={handleCloseCodeModal}
        code={generatedCode}
        onRunCode={handleRunCode}
      />
    </div>
  );
};

export default BlockCoding;
