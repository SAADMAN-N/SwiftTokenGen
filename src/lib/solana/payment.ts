import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';

const MAX_RETRIES = 3;
const CONFIRMATION_COMMITMENT = 'confirmed';

export async function processPayment(
  wallet: WalletContextState,
  amountInSol: number,
  connection: Connection
): Promise<{ success: boolean; signature: string }> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const merchantWallet = new PublicKey('4LX6HnqAdhuTc5mYcBKV5QnRoRwMq177BRVAWV9Jy4Zu');
  const lamports = amountInSol * 1000000000;

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: merchantWallet,
          lamports,
        })
      );

      // Get fresh blockhash for each attempt
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign and send
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: CONFIRMATION_COMMITMENT,
        maxRetries: 3,
      });

      // Confirm with shorter timeout
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, CONFIRMATION_COMMITMENT);

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      return {
        success: true,
        signature
      };
    } catch (error) {
      retries++;
      console.warn(`Payment attempt ${retries} failed:`, error);
      
      if (retries === MAX_RETRIES) {
        throw new Error(`Payment failed after ${MAX_RETRIES} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }

  throw new Error('Payment failed after maximum retries');
}
