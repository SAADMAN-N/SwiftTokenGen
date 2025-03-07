'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { createTokenMetadata } from '@/lib/solana/metadata';

export default function MetadataTest() {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleTest = async () => {
    if (!wallet.connected) {
      setResult('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // For testing, we'll use a dummy mint address
      // In production, this should be your actual token mint address
      const testMintAddress = new PublicKey('11111111111111111111111111111111');

      const metadataConfig = {
        name: "Test Token",
        symbol: "TEST",
        description: "This is a test token metadata",
        image: imageFile || undefined,
        externalUrl: "https://example.com",
      };

      const nft = await createTokenMetadata(
        connection,
        wallet,
        testMintAddress,
        metadataConfig
      );

      setResult(JSON.stringify(nft, null, 2));
    } catch (error) {
      console.error('Test failed:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Metadata Creation Test</h2>
      
      <div>
        <label className="block mb-2">Upload Token Image:</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={isLoading || !wallet.connected}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Testing...' : 'Test Metadata Creation'}
      </button>

      {!wallet.connected && (
        <div className="text-red-500">Please connect your wallet first</div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}