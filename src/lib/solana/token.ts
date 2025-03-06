import {
  createDefaultRpcTransport,
  createRpc,
  createJsonRpcApi,
  type PendingRpcRequest
} from '@solana/kit';

// Initialize RPC client with proper typing
export const initializeSolanaRpc = (endpoint: string) => {
  const transport = createDefaultRpcTransport({
    url: endpoint,
  });

  const api = createJsonRpcApi();
  return createRpc({ api, transport });
};

// Simple test function to verify RPC connection
export const testRpcConnection = async (endpoint: string) => {
  try {
    console.log('Testing RPC connection to endpoint:', endpoint);
    const rpc = initializeSolanaRpc(endpoint);
    const slot = await rpc.getSlot().send();
    console.log('Successfully connected to RPC. Current slot:', slot);
    return true;
  } catch (error) {
    console.error('Failed to connect to RPC:', error);
    return false;
  }
};
