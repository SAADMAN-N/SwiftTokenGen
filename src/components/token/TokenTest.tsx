import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { requestDevnetSol } from '@/lib/solana/payment';
import { Connection, clusterApiUrl } from '@solana/web3.js';

export default function TokenTest() {
  const [isAirdropping, setIsAirdropping] = useState(false);
  const wallet = useWallet();

  const handleRequestDevnetSol = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsAirdropping(true);
    try {
      const connection = new Connection(clusterApiUrl('devnet'));
      const signature = await requestDevnetSol(wallet, connection);
      alert(`Airdrop successful! Signature: ${signature}`);
    } catch (error) {
      console.error('Airdrop error:', error);
      alert('Failed to request SOL. Please try again.');
    } finally {
      setIsAirdropping(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRequestDevnetSol}
        disabled={isAirdropping || !wallet.connected}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isAirdropping ? 'Requesting SOL...' : 'Request Devnet SOL'}
      </button>
      {/* Rest of your component */}
    </div>
  );
}