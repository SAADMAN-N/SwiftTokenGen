'use client';

import { WalletProvider } from '@/contexts/WalletContext';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { ReactNode } from 'react';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <nav className="p-4 border-b">
        <WalletConnectButton />
      </nav>
      {children}
    </WalletProvider>
  );
}