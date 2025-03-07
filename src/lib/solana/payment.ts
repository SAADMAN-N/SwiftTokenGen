import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';
import { prisma } from '@/lib/prisma';

// Add environment variable check
const MERCHANT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS;
if (!MERCHANT_WALLET_ADDRESS) {
  throw new Error('NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS environment variable is not set');
}

const merchantWallet = new PublicKey(MERCHANT_WALLET_ADDRESS);

const MAX_RETRIES = 5;
const CONFIRMATION_COMMITMENT = 'confirmed';

// List of backup RPC endpoints
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
  'https://solana-mainnet.g.alchemy.com/v2/iZB3fRBFnVpOQnqsXBPL2aiI6griJWMf'
];

async function getWorkingConnection(): Promise<Connection> {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, CONFIRMATION_COMMITMENT);
      // Test the connection
      await connection.getLatestBlockhash();
      return connection;
    } catch (error) {
      console.warn(`RPC endpoint ${endpoint} failed, trying next one...`);
      continue;
    }
  }
  throw new Error('All RPC endpoints failed');
}

export async function processPayment(
  wallet: WalletContextState,
  amountInSol: number,
  connection: Connection
): Promise<{ success: boolean; signature?: string }> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }

  try {
    // Add version and fee payer explicitly
    const transaction = new Transaction({ 
      feePayer: wallet.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    }).add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: merchantWallet,
        lamports: amountInSol * LAMPORTS_PER_SOL,
      })
    );

    // Serialize and deserialize to ensure proper formatting
    const serializedTx = transaction.serialize({ requireAllSignatures: false });
    const deserializedTx = Transaction.from(serializedTx);
    
    const signed = await wallet.signTransaction(deserializedTx);
    
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    const confirmation = await connection.confirmTransaction(signature);
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    return {
      success: true,
      signature
    };
  } catch (error) {
    console.error('Detailed payment error:', error);
    
    if (error.name === 'WalletSignTransactionError') {
      throw new Error(`Wallet signing failed: ${error.message}. Please ensure your wallet is unlocked and try again.`);
    }
    
    throw error;
  }
}
