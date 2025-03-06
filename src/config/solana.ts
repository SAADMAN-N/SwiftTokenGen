import { createSolanaRpc } from '@solana/kit';
import { env } from './env';

// Create RPC client based on environment
export const rpc = createSolanaRpc(env.solana.rpcEndpoint);

// Cluster configuration
export const clusterConfig = {
  endpoint: env.solana.rpcEndpoint,
  network: env.solana.network,
} as const;