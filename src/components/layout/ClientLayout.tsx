'use client';

import dynamic from 'next/dynamic';
import { WalletProvider } from '@/contexts/WalletContext';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col">
        <header className="w-full border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="h-16 flex items-center justify-end">
              <WalletMultiButton className="!bg-[#512da8] hover:!bg-[#512da8]/80" />
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </WalletProvider>
  );
}
