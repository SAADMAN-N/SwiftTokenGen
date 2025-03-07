'use client';

import dynamic from 'next/dynamic';

// Dynamically import the WalletMultiButton with ssr disabled
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function WalletConnectButton() {
  return (
    <div className="flex items-center justify-end p-4">
      <WalletMultiButton />
    </div>
  );
}

// Export a dynamic version of the component
export const WalletConnectButtonDynamic = dynamic(() => Promise.resolve(WalletConnectButton), {
  ssr: false
});
