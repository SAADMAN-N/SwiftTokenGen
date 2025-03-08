'use client';

import { Connection } from '@solana/web3.js';
import { UpdateTokenMetadata } from '@/components/token/UpdateTokenMetadata';

export default function TokenPage({ params }: { params: { mintAddress: string } }) {
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com');

  return (
    <div className="container mx-auto px-4 py-8">
      <UpdateTokenMetadata 
        mintAddress={params.mintAddress}
        connection={connection}
      />
    </div>
  );
}