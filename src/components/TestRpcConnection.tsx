'use client';

import { testRpcConnection } from '@/lib/solana/token';
import { env } from '@/config/env';
import { useEffect, useState } from 'react';

export function TestRpcConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'failed'>('testing');

  useEffect(() => {
    const testConnection = async () => {
      console.log('Starting connection test with endpoint:', env.solana.rpcEndpoint);
      const result = await testRpcConnection(env.solana.rpcEndpoint);
      console.log('Connection test result:', result);
      setConnectionStatus(result ? 'success' : 'failed');
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold mb-2">RPC Connection Test</h2>
      <div className="flex items-center gap-2">
        <span>Status: </span>
        {connectionStatus === 'testing' && <span className="text-yellow-500">Testing...</span>}
        {connectionStatus === 'success' && <span className="text-green-500">Connected</span>}
        {connectionStatus === 'failed' && <span className="text-red-500">Failed</span>}
      </div>
    </div>
  );
}
