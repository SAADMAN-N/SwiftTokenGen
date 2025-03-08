import { 
  Connection, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
  Transaction
} from '@solana/web3.js';
import { createSolanaRpc, lamports } from '@solana/kit';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Use the environment variable for merchant wallet
const merchantWallet = new PublicKey(process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS!);

export async function processPayment(
  wallet: WalletContextState,
  amountInSol: number,
  connection: Connection
): Promise<{ success: boolean; signature?: string }> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }

  try {
    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    // Create instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: merchantWallet,
      lamports: amountInSol * LAMPORTS_PER_SOL,
    });

    // Create transaction and add instruction
    const transaction = new Transaction();
    transaction.add(transferInstruction);

    // Set the required transaction properties
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    // Sign transaction
    const signed = await wallet.signTransaction(transaction);

    // Send and confirm
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
      preflightCommitment: 'confirmed'
    });

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    return {
      success: true,
      signature
    };

  } catch (error: any) {
    console.error('Detailed payment error:', error);
    
    if (error.name === 'WalletSignTransactionError') {
      throw new Error(`Wallet signing failed: ${error.message}`);
    }
    
    if (error.message.includes('Blockhash not found')) {
      throw new Error('Network congestion detected. Please try again.');
    }
    
    throw error;
  }
}

// Add a helper function to request devnet SOL
export async function requestDevnetSol(
  wallet: WalletContextState,
  connection: Connection
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const rpc = createSolanaRpc(clusterApiUrl('devnet'));
  const signature = await rpc.requestAirdrop(
    wallet.publicKey.toBase58(),
    lamports(2n * BigInt(LAMPORTS_PER_SOL))  // Request 2 SOL
  ).send();

  await connection.confirmTransaction(signature);
  return signature;
}
