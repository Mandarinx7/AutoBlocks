import { Flow, Block, Edge } from "@/pages/BlockCoding";

// Helper function to convert block params to JavaScript values
function convertParamToJsValue(param: string, type: string): string {
  if (type === 'String') {
    return `"${param}"`;
  }
  return param;
}

// Generate code for individual blocks
function generateBlockCode(
  block: Block, 
  blocksMap: Map<string, Block>,
  edgesMap: Map<string, Edge[]>,
  visitedBlocks: Set<string>
): string {
  if (visitedBlocks.has(block.id)) {
    return ''; // Prevent circular references
  }
  
  visitedBlocks.add(block.id);
  let code = '';
  
  switch (block.type) {
    case 'console.log':
      code = `console.log(${JSON.stringify(block.params.message)});\n`;
      break;
      
    case 'variable':
      const varType = block.params.type || 'Number';
      const varValue = convertParamToJsValue(block.params.value, varType);
      code = `let ${block.params.name} = ${varValue};\n`;
      break;
      
    case 'if-else':
      code = `if (${block.params.condition}) {\n`;
      
      // Find blocks connected to the "true" output path
      const trueOutgoingEdges = edgesMap.get(block.id) || [];
      for (const edge of trueOutgoingEdges) {
        const targetBlock = blocksMap.get(edge.target);
        if (targetBlock) {
          code += '  ' + generateBlockCode(targetBlock, blocksMap, edgesMap, new Set(visitedBlocks)).split('\n').join('\n  ');
        }
      }
      
      code += `}\n`;
      break;
      
    case 'for-loop':
      code = `for (let ${block.params.initVar} = ${block.params.initVal}; ${block.params.initVar} ${block.params.condOp} ${block.params.condVal}; ${block.params.iteration}) {\n`;
      
      // Find blocks inside the loop body
      const loopOutgoingEdges = edgesMap.get(block.id) || [];
      for (const edge of loopOutgoingEdges) {
        const targetBlock = blocksMap.get(edge.target);
        if (targetBlock) {
          code += '  ' + generateBlockCode(targetBlock, blocksMap, edgesMap, new Set(visitedBlocks)).split('\n').join('\n  ');
        }
      }
      
      code += `}\n`;
      break;
      
    case 'while-loop':
      code = `while (${block.params.condition}) {\n`;
      
      // Find blocks inside the loop body
      const whileOutgoingEdges = edgesMap.get(block.id) || [];
      for (const edge of whileOutgoingEdges) {
        const targetBlock = blocksMap.get(edge.target);
        if (targetBlock) {
          code += '  ' + generateBlockCode(targetBlock, blocksMap, edgesMap, new Set(visitedBlocks)).split('\n').join('\n  ');
        }
      }
      
      code += `}\n`;
      break;
      
    case 'forEach':
      code = `${block.params.array}.forEach((${block.params.itemName}) => {\n`;
      
      // Find blocks inside the forEach body
      const forEachOutgoingEdges = edgesMap.get(block.id) || [];
      for (const edge of forEachOutgoingEdges) {
        const targetBlock = blocksMap.get(edge.target);
        if (targetBlock) {
          code += '  ' + generateBlockCode(targetBlock, blocksMap, edgesMap, new Set(visitedBlocks)).split('\n').join('\n  ');
        }
      }
      
      code += `});\n`;
      break;
      
    case 'math-operation':
      const operation = `${block.params.leftOperand} ${block.params.operator} ${block.params.rightOperand}`;
      if (block.params.resultVar) {
        code = `let ${block.params.resultVar} = ${operation};\n`;
      } else {
        code = `${operation};\n`;
      }
      break;
      
    case 'comparison':
      const comparison = `${block.params.leftOperand} ${block.params.operator} ${block.params.rightOperand}`;
      if (block.params.resultVar) {
        code = `let ${block.params.resultVar} = ${comparison};\n`;
      } else {
        code = `${comparison};\n`;
      }
      break;
      
    case 'logical-operator':
      let logicalOp = '';
      if (block.params.operator === '!') {
        logicalOp = `${block.params.operator}${block.params.rightOperand}`;
      } else {
        logicalOp = `${block.params.leftOperand} ${block.params.operator} ${block.params.rightOperand}`;
      }
      
      if (block.params.resultVar) {
        code = `let ${block.params.resultVar} = ${logicalOp};\n`;
      } else {
        code = `${logicalOp};\n`;
      }
      break;
      
    case 'function-def':
      code = `function ${block.params.name}(${block.params.params}) {\n`;
      
      // Find blocks inside the function body
      const funcOutgoingEdges = edgesMap.get(block.id) || [];
      for (const edge of funcOutgoingEdges) {
        const targetBlock = blocksMap.get(edge.target);
        if (targetBlock) {
          code += '  ' + generateBlockCode(targetBlock, blocksMap, edgesMap, new Set(visitedBlocks)).split('\n').join('\n  ');
        }
      }
      
      code += `}\n`;
      break;
      
    case 'return':
      code = `return ${block.params.value};\n`;
      break;
      
    case 'function-call':
      if (block.params.resultVar) {
        code = `let ${block.params.resultVar} = ${block.params.name}(${block.params.args});\n`;
      } else {
        code = `${block.params.name}(${block.params.args});\n`;
      }
      break;
      
    default:
      code = `// Unknown block type: ${block.type}\n`;
  }
  
  // Find the next blocks in the sequence
  let outgoingEdges = edgesMap.get(block.id) || [];
  
  // Only follow sequence if not a control structure (if, loop, function)
  if (!['if-else', 'for-loop', 'while-loop', 'forEach', 'function-def'].includes(block.type)) {
    for (const edge of outgoingEdges) {
      const targetBlock = blocksMap.get(edge.target);
      if (targetBlock && !visitedBlocks.has(targetBlock.id)) {
        code += generateBlockCode(targetBlock, blocksMap, edgesMap, visitedBlocks);
      }
    }
  }
  
  return code;
}

export function generateJavaScriptCode(flow: Flow): string {
  // Create maps for faster lookup
  const blocksMap = new Map<string, Block>();
  for (const block of flow.blocks) {
    blocksMap.set(block.id, block);
  }
  
  // Create a map of outgoing edges for each block
  const edgesMap = new Map<string, Edge[]>();
  for (const edge of flow.edges) {
    if (!edgesMap.has(edge.source)) {
      edgesMap.set(edge.source, []);
    }
    edgesMap.get(edge.source)!.push(edge);
  }
  
  // Find starting blocks (blocks with no incoming edges)
  const blockIdsWithIncomingEdges = new Set<string>();
  for (const edge of flow.edges) {
    blockIdsWithIncomingEdges.add(edge.target);
  }
  
  const startingBlocks = flow.blocks.filter(block => !blockIdsWithIncomingEdges.has(block.id));
  
  // Generate code starting from each entry point
  let generatedCode = '';
  const visitedBlocks = new Set<string>();
  
  for (const startBlock of startingBlocks) {
    generatedCode += generateBlockCode(startBlock, blocksMap, edgesMap, visitedBlocks);
  }
  
  // Add a comment
  generatedCode = '// JavaScript code generated by Block Coding App\n\n' + generatedCode;
  
  return generatedCode;
}
