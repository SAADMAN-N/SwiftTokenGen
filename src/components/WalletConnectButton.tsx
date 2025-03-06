'use client';

import { useWalletConnection } from '@/hooks/useWalletConnection';

export function WalletConnectButton() {
  const { connected, connecting, walletAddress, connect, disconnect } = useWalletConnection();

  return (
    <div className="flex items-center gap-4">
      {connected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
          </span>
          <button
            onClick={disconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={connecting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
