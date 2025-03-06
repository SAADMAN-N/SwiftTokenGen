'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletConnectButton() {
  const { connected } = useWallet();

  return (
    <div className="flex items-center justify-end p-4">
      <WalletMultiButton 
        className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !py-2 !h-auto !text-sm" 
      />
    </div>
  );
}
