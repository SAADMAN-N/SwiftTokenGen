import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';

export async function processPayment(
  wallet: WalletContextState,
  amountInSol: number,
  connection: Connection
): Promise<{ success: boolean; signature: string }> { // Make signature required
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const merchantWallet = new PublicKey('4LX6HnqAdhuTc5mYcBKV5QnRoRwMq177BRVAWV9Jy4Zu');
  const lamports = amountInSol * 1000000000;

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: merchantWallet,
      lamports,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  const signed = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature);

  if (!signature) {
    throw new Error('Failed to get transaction signature');
  }

  return {
    success: true,
    signature
  };
}
