'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { type Address } from '@solana/kit';

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  walletAddress: Address | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<Address | null>(null);

  const connect = async () => {
    // Implementation will be added in next step
  };

  const disconnect = async () => {
    // Implementation will be added in next step
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        walletAddress,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}