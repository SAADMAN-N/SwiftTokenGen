'use client';

import { useEffect, useState } from 'react';
import { formatDistance } from 'date-fns';

interface Memecoin {
  id: string;
  name: string;
  symbol: string;
  mintAddress: string;
  createdAt: string;
  totalSupply: string;
  priceInSol: number;
  paymentStatus: string;
}

export function MemecoinsDisplay() {
  const [memecoins, setMemecoins] = useState<Memecoin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemecoins = async () => {
    try {
      const response = await fetch('/api/memecoins');
      if (!response.ok) {
        throw new Error('Failed to fetch memecoins');
      }
      const data = await response.json();
      setMemecoins(data);
    } catch (error) {
      console.error('Failed to fetch memecoins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemecoins();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMemecoins, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading memecoins...</div>;
  }

  if (memecoins.length === 0) {
    return <div className="text-center py-8">No memecoins created yet.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {memecoins.map((coin) => (
        <div key={coin.id} className="p-4 rounded-lg border bg-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{coin.name}</h3>
              <p className="text-sm text-muted-foreground">${coin.symbol}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              coin.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {coin.paymentStatus}
            </span>
          </div>
          
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-mono">Mint: {coin.mintAddress.slice(0, 8)}...</p>
            <p>Supply: {coin.totalSupply}</p>
            <p>Price: {coin.priceInSol} SOL</p>
            <p className="text-muted-foreground">
              Created {formatDistance(new Date(coin.createdAt), new Date(), { addSuffix: true })}
            </p>
          </div>
          
          <a 
            href={`https://explorer.solana.com/address/${coin.mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-sm text-blue-500 hover:text-blue-600 inline-block"
          >
            View on Explorer →
          </a>
        </div>
      ))}
    </div>
  );
}
