import { Flow } from "@/pages/BlockCoding";

const STORAGE_KEY = 'blockCodingFlows';

// Save a flow to local storage
export function saveFlow(flow: Flow): void {
  try {
    // Get existing flows
    const existingFlowsJson = localStorage.getItem(STORAGE_KEY);
    const existingFlows = existingFlowsJson ? JSON.parse(existingFlowsJson) : {};
    
    // Update the flow with the latest timestamp
    flow.updatedAt = new Date().toISOString();
    if (!flow.createdAt) {
      flow.createdAt = flow.updatedAt;
    }
    
    // Save the updated flow
    existingFlows[flow.id] = flow;
    
    // Store back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingFlows));
  } catch (error) {
    console.error('Error saving flow:', error);
    throw error;
  }
}

// Load a flow from local storage
export async function loadFlow(flowId: string): Promise<Flow | null> {
  try {
    const flowsJson = localStorage.getItem(STORAGE_KEY);
    if (!flowsJson) return null;
    
    const flows = JSON.parse(flowsJson);
    return flows[flowId] || null;
  } catch (error) {
    console.error('Error loading flow:', error);
    return null;
  }
}

// List all saved flows
export async function listFlows(): Promise<Flow[]> {
  try {
    const flowsJson = localStorage.getItem(STORAGE_KEY);
    if (!flowsJson) return [];
    
    const flows = JSON.parse(flowsJson);
    return Object.values(flows);
  } catch (error) {
    console.error('Error listing flows:', error);
    return [];
  }
}

// Delete a flow
export async function deleteFlow(flowId: string): Promise<boolean> {
  try {
    const flowsJson = localStorage.getItem(STORAGE_KEY);
    if (!flowsJson) return false;
    
    const flows = JSON.parse(flowsJson);
    if (!flows[flowId]) return false;
    
    delete flows[flowId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
    return true;
  } catch (error) {
    console.error('Error deleting flow:', error);
    return false;
  }
}

// Export a flow as JSON
export function exportFlow(flow: Flow): string {
  return JSON.stringify(flow, null, 2);
}

// Import a flow from JSON
export function importFlow(json: string): Flow | null {
  try {
    const flow = JSON.parse(json) as Flow;
    
    // Validate the flow structure
    if (!flow.id || !Array.isArray(flow.blocks) || !Array.isArray(flow.edges)) {
      throw new Error('Invalid flow format');
    }
    
    return flow;
  } catch (error) {
    console.error('Error importing flow:', error);
    return null;
  }
}
