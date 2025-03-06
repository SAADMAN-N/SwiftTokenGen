'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import dynamic from 'next/dynamic';

// Dynamically import the WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  () => Promise.resolve(WalletMultiButton),
  { 
    ssr: false,
    loading: () => <div className="h-[38px] w-[140px] bg-blue-600 rounded-lg animate-pulse" />
  }
);

export function WalletConnectButton() {
  const { connected } = useWallet();

  return (
    <div className="flex items-center justify-end p-4">
      <WalletMultiButtonDynamic 
        className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !py-2 !h-auto !text-sm" 
      />
    </div>
  );
}
