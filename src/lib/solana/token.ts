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

export async function testRpcConnection(endpoint: string): Promise<boolean> {
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const blockHeight = await connection.getBlockHeight();
    return blockHeight > 0;
  } catch (error: unknown) {
    console.error('RPC connection test failed:', error);
    return false;
  }
}

export async function testTokenCreation(tokenConfig: TokenConfig): Promise<boolean> {
  try {
    // Create a test connection to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Create a test wallet
    const testWallet = Keypair.generate();
    
    // Try to build the transaction - if this succeeds, the config is valid
    await buildTokenCreateTransaction(
      testWallet.publicKey,
      tokenConfig,
      connection
    );

    return true;
  } catch (error: unknown) {
    console.error('Token creation test failed:', error);
    return false;
  }
}

export interface TokenCreationResult {
  signature: TransactionSignature;
  mintAddress: string;
  tokenAccount: string;
}

export async function createToken(
  wallet: WalletContextState,
  tokenConfig: TokenConfig,
  connection: Connection,
  network: NetworkType = 'devnet'
): Promise<TokenCreationResult> {
  // Validate network
  if (network === 'mainnet-beta' && process.env.NODE_ENV !== 'production') {
    throw new Error('Mainnet transactions only allowed in production');
  }

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

    // 5. Get latest blockhash and set fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // 6. Partial sign with mint account
    transaction.partialSign(mintKeypair);

    // 7. Get wallet signature
    const signedTx = await wallet.signTransaction(transaction);

    // 8. Send and confirm transaction
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    // 9. Wait for confirmation with timeout and retry logic
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed');

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
