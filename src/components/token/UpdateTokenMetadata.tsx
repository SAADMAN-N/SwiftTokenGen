'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { ImageUpload } from './ImageUpload';
import { updateTokenMetadata } from '@/lib/solana/metadata';
import { toast } from "sonner";

interface UpdateTokenMetadataProps {
  mintAddress: string;
  connection: Connection;
}

export function UpdateTokenMetadata({ mintAddress, connection }: UpdateTokenMetadataProps) {
  const wallet = useWallet();
  const [isUpdating, setIsUpdating] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setLogoFile(file);
  };

  const handleUpdate = async () => {
    if (!logoFile) {
      toast.error("Please select a logo image first");
      return;
    }

    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsUpdating(true);

      const metadataConfig = {
        name: "404JOB",
        symbol: "404JOB",
        description: "💀 What is $404JOB?\n$404JOB is the only currency for unemployed CS students. Stop applying. Start investing.\n\n🧐 Why $404JOB?\nBecause the job market is cooked and internships are a scam.",
        image: logoFile,
        socialLinks: {
          website: "https://404job.netlify.app/",
          twitter: "https://x.com/404jobtoken",
          telegram: "https://t.me/+AMlhSVcxEaZkZGNl"
        }
      };

      const result = await updateTokenMetadata(
        connection,
        wallet,
        new PublicKey(mintAddress),
        metadataConfig
      );

      toast.success("Token metadata updated successfully!");
      console.log("Update result:", result);

    } catch (error) {
      console.error("Error updating metadata:", error);
      toast.error(error.message || "Failed to update metadata");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-100">Update Token Metadata</h2>
      
      <div className="space-y-4">
        <ImageUpload
          onImageSelect={handleImageSelect}
          error={undefined}
        />

        <button
          onClick={handleUpdate}
          disabled={isUpdating || !logoFile}
          className={`w-full px-4 py-2 text-white rounded-lg ${
            isUpdating || !logoFile
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUpdating ? 'Updating...' : 'Update Metadata'}
        </button>
      </div>
    </div>
  );
}