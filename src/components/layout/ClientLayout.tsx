'use client';

import { WalletProvider } from '@/contexts/WalletContext';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { ReactNode } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 z-50">
        <WalletConnectButton />
      </header>
      <main className="pt-16">
        {children}
      </main>
    </WalletProvider>
  );
}
