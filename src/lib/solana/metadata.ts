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
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

interface MetadataConfig {
  name: string;
  symbol: string;
  description?: string;
  image?: File;
  externalUrl?: string;
  sellerFeeBasisPoints?: number;
  // Add social links to the interface
  socialLinks?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
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

    // 1. Upload image to IPFS if provided
    let imageUrl: string | undefined;
    if (config.image) {
      imageUrl = await uploadToIPFS(config.image);
      console.log('Image uploaded to IPFS:', imageUrl);
    }

    // 2. Create metadata JSON
    const metadataJson = {
      name: config.name,
      symbol: config.symbol,
      description: config.description || '',
      image: imageUrl || '',
      external_url: config.socialLinks?.website || '',
      properties: {
        files: imageUrl ? [{
          uri: imageUrl,
          type: "image/png",
          cdn: false
        }] : [],
        category: "image",
        creators: [{
          address: wallet.publicKey.toString(),
          share: 100,
          verified: true
        }]
      },
      // Add social links in a standard format
      attributes: [
        ...(config.socialLinks?.website ? [{
          trait_type: "Website",
          value: config.socialLinks.website
        }] : []),
        ...(config.socialLinks?.twitter ? [{
          trait_type: "Twitter",
          value: config.socialLinks.twitter
        }] : []),
        ...(config.socialLinks?.telegram ? [{
          trait_type: "Telegram",
          value: config.socialLinks.telegram
        }] : []),
        ...(config.socialLinks?.discord ? [{
          trait_type: "Discord",
          value: config.socialLinks.discord
        }] : [])
      ]
    };

    console.log('Final metadata JSON:', JSON.stringify(metadataJson, null, 2));

    // 3. Upload metadata JSON to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadataJson)], { 
      type: 'application/json' 
    });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    const metadataUrl = await uploadToIPFS(metadataFile);
    
    console.log('Metadata uploaded to IPFS:', {
      url: metadataUrl,
      content: metadataJson
    });

    // 4. Create on-chain metadata
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

export async function updateTokenMetadata(
  connection: Connection,
  wallet: WalletContextState,
  mintAddress: PublicKey,
  config: MetadataConfig
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    // 1. Upload image to IPFS if provided
    let imageUrl: string | undefined;
    if (config.image) {
      imageUrl = await uploadToIPFS(config.image);
      console.log('Image uploaded to IPFS:', imageUrl);
    }

    // 2. Create metadata JSON
    const metadataJson = {
      name: config.name,
      symbol: config.symbol,
      description: config.description || '',
      image: imageUrl || '',
      external_url: config.socialLinks?.website || '',
      properties: {
        files: imageUrl ? [{
          uri: imageUrl,
          type: "image/png",
          cdn: false
        }] : [],
        category: "image",
        creators: [{
          address: wallet.publicKey.toString(),
          share: 100,
          verified: true
        }]
      },
      attributes: [
        ...(config.socialLinks?.website ? [{
          trait_type: "Website",
          value: config.socialLinks.website
        }] : []),
        ...(config.socialLinks?.twitter ? [{
          trait_type: "Twitter",
          value: config.socialLinks.twitter
        }] : []),
        ...(config.socialLinks?.telegram ? [{
          trait_type: "Telegram",
          value: config.socialLinks.telegram
        }] : [])
      ]
    };

    // 3. Upload to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadataJson)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    const metadataUrl = await uploadToIPFS(metadataFile);

    // 4. Find metadata PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // 5. Create update instruction
    const updateInstruction = createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: wallet.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
          data: {
            name: config.name,
            symbol: config.symbol,
            uri: metadataUrl,
            sellerFeeBasisPoints: 0,
            creators: [{
              address: wallet.publicKey,
              verified: true,
              share: 100
            }],
            collection: null,
            uses: null,
          },
          updateAuthority: wallet.publicKey,
          primarySaleHappened: false,
          isMutable: true,
        }
      }
    );

    // 6. Create and sign transaction
    const transaction = new Transaction();
    
    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    transaction.add(updateInstruction);

    // Sign transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send and confirm transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    return {
      signature,
      metadataUrl,
      metadataPDA: metadataPDA.toString()
    };

  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}
