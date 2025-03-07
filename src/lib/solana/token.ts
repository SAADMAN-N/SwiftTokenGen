import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  TransactionSignature,
} from '@solana/web3.js';
import { 
  createInitializeMintInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import type { TokenConfig } from '@/types';
import { WalletContextState } from '@solana/wallet-adapter-react';

export type NetworkType = 'mainnet-beta' | 'devnet';

// Add the missing interface
export interface TokenCreationResult {
  signature: string;
  mintAddress: string;
  tokenAccount: string;
}

const CONFIRMATION_COMMITMENT = 'confirmed';

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let currentTry = 0;
  
  while (currentTry < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (error.message.includes('429') && currentTry < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, currentTry);
        console.log(`RPC rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        currentTry++;
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}

export async function testRpcConnection(connection: Connection): Promise<boolean> {
  return retryWithBackoff(async () => {
    const latestBlockhash = await connection.getLatestBlockhash();
    console.log('Connection to cluster established. Latest blockhash:', latestBlockhash.blockhash);
    return true;
  });
}

export async function createToken(
  wallet: WalletContextState,
  tokenConfig: TokenConfig,
  connection: Connection,
  network: NetworkType = 'mainnet-beta'
): Promise<TokenCreationResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    // 1. Build the base transaction
    const { transaction, mintKeypair } = await buildTokenCreateTransaction(
      wallet.publicKey,
      tokenConfig,
      connection
    );

    // 2. Get the associated token account address
    const associatedTokenAccount = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      wallet.publicKey
    );

    // 3. Add instruction to create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        mintKeypair.publicKey
      )
    );

    // 4. Add instruction to mint initial supply
    const mintAmount = BigInt(tokenConfig.supply) * BigInt(10 ** tokenConfig.decimals);
    transaction.add(
      createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        mintAmount
      )
    );

    // 5. Get fresh blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // 6. Partial sign with mint account
    transaction.partialSign(mintKeypair);

    // 7. Get wallet signature
    const signedTx = await wallet.signTransaction(transaction);

    // 8. Send and confirm transaction
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: CONFIRMATION_COMMITMENT,
      maxRetries: 3,
    });
    
    // 9. Wait for confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, CONFIRMATION_COMMITMENT);

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    return {
      signature,
      mintAddress: mintKeypair.publicKey.toString(),
      tokenAccount: associatedTokenAccount.toString(),
    };

  } catch (error: unknown) {
    console.error('Error creating token:', error);
    throw new Error(
      `Failed to create token: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    );
  }
}

export async function buildTokenCreateTransaction(
  feePayer: PublicKey,
  tokenConfig: TokenConfig,
  connection: Connection
) {
  try {
    // 1. Get minimum lamports for mint account
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    
    // 2. Generate a new keypair for the mint account
    const mintKeypair = Keypair.generate();

    // 3. Create transaction
    const transaction = new Transaction();

    // 4. Add create account instruction
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: feePayer,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // 5. Add initialize mint instruction
    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        tokenConfig.decimals,
        feePayer,
        feePayer,
        TOKEN_PROGRAM_ID
      )
    );

    return {
      transaction,
      mintKeypair,
    };

  } catch (error: unknown) {
    console.error('Error building token creation transaction:', error);
    throw new Error(
      `Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    );
  }
}
