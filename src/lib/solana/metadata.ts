import { 
  Connection, 
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { uploadToIPFS } from '@/lib/ipfs';
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

interface MetadataConfig {
  name: string;
  symbol: string;
  description?: string;
  image?: File;
  externalUrl?: string;
  sellerFeeBasisPoints?: number;
}

export async function createTokenMetadata(
  connection: Connection,
  wallet: WalletContextState,
  mintAddress: PublicKey,
  config: MetadataConfig
) {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    // 1. Upload image to IPFS if provided and ensure we have a valid URL
    let imageUrl: string | undefined;
    if (config.image) {
      imageUrl = await uploadToIPFS(config.image);
      console.log('Image uploaded to IPFS:', imageUrl);
      
      // Verify the image URL is valid
      if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error('Invalid image URL after IPFS upload');
      }
    }

    // 2. Create metadata JSON following Metaplex standard
    const metadataJson = {
      name: config.name,
      symbol: config.symbol,
      description: config.description || '',
      image: imageUrl, // Main image URL
      animation_url: imageUrl, // Adding this for better compatibility
      external_url: config.externalUrl || '',
      attributes: [],
      properties: {
        files: [{
          uri: imageUrl,
          type: "image/png",
          cdn: false
        }],
        category: "image",
        creators: [{
          address: wallet.publicKey.toString(),
          share: 100,
          verified: true
        }]
      }
    };

    console.log('Metadata JSON:', metadataJson);

    // 3. Upload metadata JSON to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadataJson)], { 
      type: 'application/json' 
    });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    console.log('Uploading metadata with image URL:', imageUrl);
    const metadataUrl = await uploadToIPFS(metadataFile);
    console.log('Full metadata JSON:', JSON.stringify(metadataJson, null, 2));
    console.log('Metadata uploaded to:', metadataUrl);

    // 4. Create metadata data structure for on-chain storage
    const metadataData = {
      name: config.name,
      symbol: config.symbol,
      uri: metadataUrl,
      sellerFeeBasisPoints: config.sellerFeeBasisPoints || 0,
      creators: [{
        address: wallet.publicKey,
        verified: true,
        share: 100
      }],
      collection: null,
      uses: null,
    };

    // 5. Find the metadata account PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // 6. Create transaction
    const transaction = new Transaction();
    
    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintAddress,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: metadataData,
          isMutable: true,
          collectionDetails: null,
        },
      }
    );

    transaction.add(createMetadataInstruction);

    // 7. Get recent blockhash and sign
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const signedTx = await wallet.signTransaction(transaction);
    
    // 8. Send and confirm
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    console.log('Metadata transaction confirmed:', signature);
    console.log('Metadata PDA:', metadataPDA.toString());
    console.log('Final metadata URL:', metadataUrl);

    return { 
      signature, 
      metadataAccount: metadataPDA.toString(),
      metadataUrl 
    };
  } catch (error) {
    console.error('Error creating token metadata:', error);
    throw error;
  }
}
