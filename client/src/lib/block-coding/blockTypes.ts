export interface Block {
  type: string;
  label: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

export interface BlockParam {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  defaultValue: any;
  options?: { label: string, value: string }[];
}

export interface BlockConfig {
  type: string;
  label: string;
  description: string;
  headerColor: string;
  connectionPointColor: string;
  params?: BlockParam[];
}

export const blockCategories = [
  {
    id: 'basic',
    name: 'Basic',
    blocks: [
      {
        type: 'console.log',
        label: 'console.log',
        description: 'Output to console',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
      },
      {
        type: 'variable',
        label: 'Variable',
        description: 'Create/assign variable',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
      },
      {
        type: 'if-else',
        label: 'If-Else',
        description: 'Conditional logic',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
      },
    ],
  },
  {
    id: 'loops',
    name: 'Loops',
    blocks: [
      {
        type: 'for-loop',
        label: 'For Loop',
        description: 'Iterate with counter',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
      },
      {
        type: 'while-loop',
        label: 'While Loop',
        description: 'Loop with condition',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
      },
      {
        type: 'forEach',
        label: 'forEach',
        description: 'Iterate through array',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
      },
    ],
  },
  {
    id: 'math',
    name: 'Math & Logic',
    blocks: [
      {
        type: 'math-operation',
        label: 'Math Operation',
        description: '+, -, *, / operations',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
      },
      {
        type: 'comparison',
        label: 'Comparison',
        description: '==, !=, >, < operators',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
      },
      {
        type: 'logical-operator',
        label: 'Logical Operator',
        description: 'AND, OR, NOT',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
      },
    ],
  },
  {
    id: 'functions',
    name: 'Functions',
    blocks: [
      {
        type: 'function-def',
        label: 'Define Function',
        description: 'Create a function',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-300',
      },
      {
        type: 'return',
        label: 'Return',
        description: 'Return a value',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-300',
      },
      {
        type: 'function-call',
        label: 'Call Function',
        description: 'Execute a function',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-300',
      },
    ],
  },
];

// Block configurations with parameters for each block type
const blockConfigs: Record<string, BlockConfig> = {
  'console.log': {
    type: 'console.log',
    label: 'console.log',
    description: 'Output to console',
    headerColor: 'bg-blue-500',
    connectionPointColor: 'bg-blue-500',
    params: [
      {
        name: 'message',
        label: 'Message',
        type: 'text',
        defaultValue: 'Hello, world!',
      },
    ],
  },
  'variable': {
    type: 'variable',
    label: 'Variable',
    description: 'Create/assign variable',
    headerColor: 'bg-green-500',
    connectionPointColor: 'bg-green-500',
    params: [
      {
        name: 'name',
        label: 'Variable Name',
        type: 'text',
        defaultValue: 'myVar',
      },
      {
        name: 'value',
        label: 'Value',
        type: 'text',
        defaultValue: '0',
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        defaultValue: 'Number',
        options: [
          { label: 'Number', value: 'Number' },
          { label: 'String', value: 'String' },
          { label: 'Boolean', value: 'Boolean' },
          { label: 'Array', value: 'Array' },
          { label: 'Object', value: 'Object' },
        ],
      },
    ],
  },
  'for-loop': {
    type: 'for-loop',
    label: 'For Loop',
    description: 'Iterate with counter',
    headerColor: 'bg-purple-500',
    connectionPointColor: 'bg-purple-500',
    params: [
      {
        name: 'initVar',
        label: 'Initialize Variable',
        type: 'text',
        defaultValue: 'i',
      },
      {
        name: 'initVal',
        label: 'Initial Value',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'condOp',
        label: 'Condition Operator',
        type: 'select',
        defaultValue: '<',
        options: [
          { label: '<', value: '<' },
          { label: '<=', value: '<=' },
          { label: '>', value: '>' },
          { label: '>=', value: '>=' },
          { label: '==', value: '==' },
          { label: '!=', value: '!=' },
        ],
      },
      {
        name: 'condVal',
        label: 'Condition Value',
        type: 'number',
        defaultValue: 10,
      },
      {
        name: 'iteration',
        label: 'Iteration',
        type: 'text',
        defaultValue: 'i++',
      },
    ],
  },
  'while-loop': {
    type: 'while-loop',
    label: 'While Loop',
    description: 'Loop with condition',
    headerColor: 'bg-purple-500',
    connectionPointColor: 'bg-purple-500',
    params: [
      {
        name: 'condition',
        label: 'Condition',
        type: 'text',
        defaultValue: 'i < 10',
      },
    ],
  },
  'forEach': {
    type: 'forEach',
    label: 'forEach',
    description: 'Iterate through array',
    headerColor: 'bg-purple-500',
    connectionPointColor: 'bg-purple-500',
    params: [
      {
        name: 'array',
        label: 'Array',
        type: 'text',
        defaultValue: 'myArray',
      },
      {
        name: 'itemName',
        label: 'Item Name',
        type: 'text',
        defaultValue: 'item',
      },
    ],
  },
  'if-else': {
    type: 'if-else',
    label: 'If-Else',
    description: 'Conditional logic',
    headerColor: 'bg-yellow-500',
    connectionPointColor: 'bg-yellow-500',
    params: [
      {
        name: 'condition',
        label: 'Condition',
        type: 'text',
        defaultValue: 'x > 0',
      },
    ],
  },
  'math-operation': {
    type: 'math-operation',
    label: 'Math Operation',
    description: 'Mathematical operation',
    headerColor: 'bg-red-500',
    connectionPointColor: 'bg-red-500',
    params: [
      {
        name: 'leftOperand',
        label: 'Left Operand',
        type: 'text',
        defaultValue: '0',
      },
      {
        name: 'operator',
        label: 'Operator',
        type: 'select',
        defaultValue: '+',
        options: [
          { label: '+', value: '+' },
          { label: '-', value: '-' },
          { label: '*', value: '*' },
          { label: '/', value: '/' },
          { label: '%', value: '%' },
          { label: '**', value: '**' },
        ],
      },
      {
        name: 'rightOperand',
        label: 'Right Operand',
        type: 'text',
        defaultValue: '0',
      },
      {
        name: 'resultVar',
        label: 'Result Variable (optional)',
        type: 'text',
        defaultValue: 'result',
      },
    ],
  },
  'comparison': {
    type: 'comparison',
    label: 'Comparison',
    description: 'Compare values',
    headerColor: 'bg-red-500',
    connectionPointColor: 'bg-red-500',
    params: [
      {
        name: 'leftOperand',
        label: 'Left Operand',
        type: 'text',
        defaultValue: '0',
      },
      {
        name: 'operator',
        label: 'Operator',
        type: 'select',
        defaultValue: '==',
        options: [
          { label: '==', value: '==' },
          { label: '===', value: '===' },
          { label: '!=', value: '!=' },
          { label: '!==', value: '!==' },
          { label: '>', value: '>' },
          { label: '>=', value: '>=' },
          { label: '<', value: '<' },
          { label: '<=', value: '<=' },
        ],
      },
      {
        name: 'rightOperand',
        label: 'Right Operand',
        type: 'text',
        defaultValue: '0',
      },
      {
        name: 'resultVar',
        label: 'Result Variable (optional)',
        type: 'text',
        defaultValue: 'result',
      },
    ],
  },
  'logical-operator': {
    type: 'logical-operator',
    label: 'Logical Operator',
    description: 'Logical operation',
    headerColor: 'bg-red-500',
    connectionPointColor: 'bg-red-500',
    params: [
      {
        name: 'leftOperand',
        label: 'Left Operand',
        type: 'text',
        defaultValue: 'true',
      },
      {
        name: 'operator',
        label: 'Operator',
        type: 'select',
        defaultValue: '&&',
        options: [
          { label: 'AND', value: '&&' },
          { label: 'OR', value: '||' },
          { label: 'NOT', value: '!' },
        ],
      },
      {
        name: 'rightOperand',
        label: 'Right Operand',
        type: 'text',
        defaultValue: 'true',
      },
      {
        name: 'resultVar',
        label: 'Result Variable (optional)',
        type: 'text',
        defaultValue: 'result',
      },
    ],
  },
  'function-def': {
    type: 'function-def',
    label: 'Define Function',
    description: 'Create a function',
    headerColor: 'bg-indigo-500',
    connectionPointColor: 'bg-indigo-500',
    params: [
      {
        name: 'name',
        label: 'Function Name',
        type: 'text',
        defaultValue: 'myFunction',
      },
      {
        name: 'params',
        label: 'Parameters (comma separated)',
        type: 'text',
        defaultValue: 'a, b',
      },
    ],
  },
  'return': {
    type: 'return',
    label: 'Return',
    description: 'Return a value',
    headerColor: 'bg-indigo-500',
    connectionPointColor: 'bg-indigo-500',
    params: [
      {
        name: 'value',
        label: 'Return Value',
        type: 'text',
        defaultValue: 'result',
      },
    ],
  },
  'function-call': {
    type: 'function-call',
    label: 'Call Function',
    description: 'Execute a function',
    headerColor: 'bg-indigo-500',
    connectionPointColor: 'bg-indigo-500',
    params: [
      {
        name: 'name',
        label: 'Function Name',
        type: 'text',
        defaultValue: 'myFunction',
      },
      {
        name: 'args',
        label: 'Arguments (comma separated)',
        type: 'text',
        defaultValue: '1, 2',
      },
      {
        name: 'resultVar',
        label: 'Result Variable (optional)',
        type: 'text',
        defaultValue: 'result',
      },
    ],
  },
};

export function getBlockConfig(blockType: string): BlockConfig {
  return blockConfigs[blockType] || {
    type: blockType,
    label: blockType,
    description: 'Unknown block type',
    headerColor: 'bg-gray-500',
    connectionPointColor: 'bg-gray-500',
    params: [],
  };
}
