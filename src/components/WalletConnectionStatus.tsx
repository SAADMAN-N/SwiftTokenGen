'use client';

import { useEffect, useState } from 'react';
import { useWalletConnection } from '@/hooks/useWalletConnection';

export function WalletConnectionStatus() {
  const { connected, connecting, connect } = useWalletConnection();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (connecting) {
    return <div>Connecting to wallet...</div>;
  }

  if (!connected) {
    return (
      <button 
        onClick={connect}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Connect Wallet
      </button>
    );
  }

  return <div>Connected!</div>;
}