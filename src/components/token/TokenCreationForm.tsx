
'use client';

import { tokenFormSchema, type TokenFormData } from '@/lib/validation/tokenSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { ImageUpload } from './ImageUpload';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { Toggle } from "@/components/ui/toggle";
import { TestRpcConnection } from '@/components/TestRpcConnection';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { createToken, NetworkType, testRpcConnection } from '@/lib/solana/token';
import { processPayment } from '@/lib/solana/payment';
import { toast } from "sonner"
import type { TokenConfig } from '@/types';
import { PublicKey } from '@solana/web3.js';
import { createTokenMetadata } from '@/lib/solana/metadata';
import { uploadToIPFS } from '@/lib/ipfs';

interface TokenCreationSuccess {
  signature: string;
  mintAddress: string;
  tokenAccount: string;
  config: TokenConfig;
}

const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";
const DEFAULT_NETWORK = "mainnet-beta";

const REQUIRED_ENV_VARS = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC_URL,
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || DEFAULT_NETWORK,
};

// Add this function to validate environment variables
const validateEnvironment = () => {
  console.log('Environment variables:', {
    fromEnv: {
      RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
      NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    },
    fromRequired: REQUIRED_ENV_VARS,
  });

  const rpcUrl = REQUIRED_ENV_VARS.RPC_URL;
  const network = REQUIRED_ENV_VARS.NETWORK;

  if (!rpcUrl || !network) {
    throw new Error(`Missing required environment variables. Using RPC_URL: ${rpcUrl}, NETWORK: ${network}`);
  }

  if (!rpcUrl.startsWith('https://')) {
    throw new Error(`Invalid RPC_URL format: ${rpcUrl}`);
  }

  return {
    RPC_URL: rpcUrl,
    NETWORK: network,
  };
};

async function confirmTransactionWithRetry(
  connection: Connection,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number,
  maxRetries = 3
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight
        },
        'confirmed'
      );
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }
      
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
    }
  }
}

export function TokenCreationForm() {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState<TokenCreationSuccess | null>(null);
  const walletContext = useWallet();

  useEffect(() => {
    console.log('Environment variables on mount:', {
      RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC_URL,
      NETWORK: process.env.NEXT_PUBLIC_NETWORK || DEFAULT_NETWORK,
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: '',
      symbol: '',
      decimals: 9,
      supply: 0, // Set as number
      description: '',
      creatorName: '',
      creatorEmail: '',
      website: '',
      twitter: '',
      telegram: '',
      discord: '',
      tags: [],
      logoFile: undefined,
      freezeAuthority: false,
      mintAuthority: false,
      updateAuthority: false,
    }
  });

  const handleAddTag = () => {
    if (newTag && tags.length < 5 && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const handleImageSelect = (file: File) => {
    setValue('logoFile', file);
  };

  const onSubmit = async (data: TokenFormData) => {
    try {
      console.log('Starting form submission...');
      
      const env = validateEnvironment();
      
      if (!walletContext.connected || !walletContext.publicKey) {
        toast.error("Please connect your wallet to create a token");
        return;
      }

      // Verify wallet capabilities
      if (!walletContext.signTransaction) {
        toast.error("Your wallet doesn't support transaction signing. Please use a different wallet.");
        return;
      }

      setIsCreating(true);
      const connection = new Connection(env.RPC_URL, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 120000, // Increase to 120 seconds
        wsEndpoint: env.RPC_URL.replace('https://', 'wss://'),  // Add WebSocket endpoint
      });
      
      // Test RPC connection first
      const isConnected = await testRpcConnection(connection);
      if (!isConnected) {
        throw new Error('Failed to connect to Solana network. Please try again later.');
      }

      // Define fixed price in SOL
      const priceInSol = 0.2;  // Add this line

      // Process payment
      const paymentResult = await processPayment(walletContext, priceInSol, connection);
      if (!paymentResult.success || !paymentResult.signature) {
        throw new Error('Payment processing failed. Please try again.');
      }

      // Create token configuration
      const tokenConfig: TokenConfig = {
        name: data.name.trim(),
        symbol: data.symbol.trim().toUpperCase(),
        decimals: data.decimals,
        supply: data.supply,
        freezeAuthority: Boolean(data.freezeAuthority),
        mintAuthority: Boolean(data.mintAuthority),
        updateAuthority: Boolean(data.updateAuthority)
      };

      // Create token
      const result = await createToken(
        walletContext,
        tokenConfig,
        connection,
        env.NETWORK as NetworkType
      );

      // Wait for token creation confirmation
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      
      // Confirm with retry
      await confirmTransactionWithRetry(
        connection,
        result.signature,
        blockhash,
        lastValidBlockHeight
      );

      // Create metadata
      try {
        const mintAddress = new PublicKey(result.mintAddress);
        console.log('Creating metadata for mint:', mintAddress.toString());
        
        const metadataConfig = {
          name: data.name,
          symbol: data.symbol,
          description: data.description,
          image: data.logoFile,
          socialLinks: {
            website: data.website || undefined,
            twitter: data.twitter || undefined,
            telegram: data.telegram || undefined,
            discord: data.discord || undefined
          }
        };

        await createTokenMetadata(
          connection,
          walletContext,
          mintAddress,
          metadataConfig
        );
        
        console.log('Metadata creation successful');
      } catch (metadataError) {
        console.error('Detailed metadata creation error:', metadataError);
        toast.warning("Token created successfully, but metadata creation failed. Your token will still work normally.");
      }

      // Prepare database entry
      const memecoinData = {
        name: data.name.trim(),
        symbol: data.symbol.trim().toUpperCase(),
        decimals: Number(data.decimals),
        totalSupply: String(data.supply),
        mintAddress: result.mintAddress,
        creatorAddress: walletContext.publicKey.toString(),
        priceInSol,  // Use the defined price
        hasMintAuthority: Boolean(data.mintAuthority),
        hasFreezeAuthority: Boolean(data.freezeAuthority),
        hasUpdateAuthority: Boolean(data.updateAuthority),
        network: env.NETWORK,
        paymentStatus: 'completed',
        paymentTx: paymentResult.signature,
        description: data.description,
        logoUrl: data.logoFile ? await uploadToIPFS(data.logoFile) : undefined,
        socialLinks: {
          website: data.website,
          twitter: data.twitter,
          telegram: data.telegram,
          discord: data.discord,
        }
      };

      // Save to database
      const dbResponse = await fetch('/api/memecoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memecoinData),
      });

      if (!dbResponse.ok) {
        throw new Error(`Failed to save token to database: ${await dbResponse.text()}`);
      }

      // Set success state
      setCreationSuccess({
        signature: result.signature,
        mintAddress: result.mintAddress,
        tokenAccount: result.tokenAccount,
        config: tokenConfig
      });

      toast.success("Token Created Successfully!");

    } catch (error) {
      console.error('Token creation error:', error);
      toast.error(error.message || 'Failed to create token. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Log form state outside of JSX
  console.log('Form State:', {
    isSubmitting,
    isCreating,
    walletConnected: walletContext.connected,
    hasPublicKey: !!walletContext.publicKey,
    formErrors: errors
  });

  return (
    <div>
      <TestRpcConnection />
      
      {/* Success Card */}
      {creationSuccess && (
        <div className="mb-8 p-6 bg-green-500/10 border border-green-500 rounded-lg">
          <h2 className="text-xl font-semibold text-green-400 mb-4">
            Token Created Successfully! 🎉
          </h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Token Details</h3>
              <p className="text-lg text-white">{creationSuccess.config.name} ({creationSuccess.config.symbol})</p>
              <p className="text-sm text-gray-400">Supply: {creationSuccess.config.supply.toLocaleString()} tokens</p>
              <p className="text-sm text-gray-400">Decimals: {creationSuccess.config.decimals}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300">Addresses</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-400">Mint Address: </span>
                  <code className="text-green-300">{creationSuccess.mintAddress}</code>
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Token Account: </span>
                  <code className="text-green-300">{creationSuccess.tokenAccount}</code>
                </p>
              </div>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => window.open(
                  `https://explorer.solana.com/address/${creationSuccess.mintAddress}?cluster=${REQUIRED_ENV_VARS.NETWORK}`,
                  '_blank'
                )}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View on Explorer
              </button>
              <button
                onClick={() => setCreationSuccess(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create Another Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Only show the form if there's no success state */}
      {!creationSuccess && (
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="max-w-6xl mx-auto p-6"
          noValidate
        >
          {/* Show validation errors at the top of the form */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <h3 className="text-red-500 font-semibold">Please fix the following errors:</h3>
              <ul className="list-disc list-inside">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="text-red-400">
                    {error?.message as string}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Basic Token Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6">Basic Token Information</h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Token Logo
                </label>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  error={errors.logoFile?.message || undefined}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                  Token Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  placeholder="My Token"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-200">
                  Token Symbol
                </label>
                <input
                  {...register('symbol')}
                  type="text"
                  id="symbol"
                  placeholder="TKN"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.symbol ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.symbol && (
                  <p className="text-sm text-red-500">{errors.symbol.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="decimals" className="block text-sm font-medium text-gray-200">
                  Decimals
                </label>
                <select
                  {...register('decimals', { valueAsNumber: true })}
                  id="decimals"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.decimals ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  {[0, 2, 4, 6, 8, 9].map(decimal => (
                    <option key={decimal} value={decimal}>
                      {decimal}
                    </option>
                  ))}
                </select>
                {errors.decimals && (
                  <p className="text-sm text-red-500">{errors.decimals.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="supply" className="block text-sm font-medium text-gray-200">
                  Initial Supply
                </label>
                <input
                  {...register('supply')}
                  type="text"
                  id="supply"
                  placeholder="1000000"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.supply ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.supply && (
                  <p className="text-sm text-red-500">{errors.supply.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-200">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  placeholder="Describe your token..."
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Right Column - Advanced Options */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6">Advanced Options</h2>

              {/* Creator Information Drawer */}
              <Disclosure as="div" className="border border-gray-700 rounded-lg">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-gray-200">Creator Information</span>
                        <p className="text-xs text-gray-400">Add creator details (Optional - Extra Fee)</p>
                      </div>
                      <ChevronUpIcon
                        className={`${
                          open ? '' : 'rotate-180 transform'
                        } h-5 w-5 text-gray-400`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="p-4 space-y-4 bg-gray-850 rounded-b-lg">
                        <div className="space-y-2">
                          <label htmlFor="creatorName" className="block text-sm font-medium text-gray-200">
                            Creator Name
                          </label>
                          <input
                            {...register('creatorName')}
                            type="text"
                            id="creatorName"
                            placeholder="Your Name"
                            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.creatorName ? 'border-red-500' : 'border-gray-700'
                            }`}
                          />
                          {errors.creatorName && (
                            <p className="text-sm text-red-500">{errors.creatorName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="creatorEmail" className="block text-sm font-medium text-gray-200">
                            Creator Email
                          </label>
                          <input
                            {...register('creatorEmail')}
                            type="email"
                            id="creatorEmail"
                            placeholder="your@email.com"
                            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.creatorEmail ? 'border-red-500' : 'border-gray-700'
                            }`}
                          />
                          {errors.creatorEmail && (
                            <p className="text-sm text-red-500">{errors.creatorEmail.message}</p>
                          )}
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

              {/* Social Links Drawer */}
              <Disclosure as="div" className="border border-gray-700 rounded-lg">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-gray-200">Social Links</span>
                        <p className="text-xs text-gray-400">Add social media links (Optional - Extra Fee)</p>
                      </div>
                      <ChevronUpIcon
                        className={`${
                          open ? '' : 'rotate-180 transform'
                        } h-5 w-5 text-gray-400`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="p-4 space-y-4 bg-gray-850 rounded-b-lg">
                        <div className="space-y-4">
                          <input
                            {...register('website')}
                            type="url"
                            placeholder="Website URL"
                            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.website ? 'border-red-500' : 'border-gray-700'
                            }`}
                          />
                          <input
                            {...register('twitter')}
                            type="url"
                            placeholder="Twitter URL"
                            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.twitter ? 'border-red-500' : 'border-gray-700'
                            }`}
                          />
                          <input
                            {...register('telegram')}
                            type="url"
                            placeholder="Telegram URL"
                            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.telegram ? 'border-red-500' : 'border-gray-700'
                            }`}
                          />
                          <input
                            {...register('discord')}
                            type="url"
                            placeholder="Discord URL"
                            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.discord ? 'border-red-500' : 'border-gray-700'
                            }`}
                          />
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Tags (max 5)
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-600 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-xs hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={tags.length >= 5}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Authority Controls Section */}
              <div className="space-y-6 mt-6">
                <h3 className="text-lg font-medium text-gray-200">Authority Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Toggle
                      pressed={watch('freezeAuthority')}
                      onPressedChange={(pressed: boolean) => setValue('freezeAuthority', pressed)}
                      aria-label="Toggle freeze authority"
                      className="w-full data-[state=on]:bg-blue-600"
                    >
                      <span className="text-sm">Freeze Authority</span>
                    </Toggle>
                    {errors.freezeAuthority && (
                      <p className="text-sm text-red-500">{errors.freezeAuthority.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Toggle
                      pressed={watch('mintAuthority')}
                      onPressedChange={(pressed: boolean) => setValue('mintAuthority', pressed)}
                      aria-label="Toggle mint authority"
                      className="w-full data-[state=on]:bg-blue-600"
                    >
                      <span className="text-sm">Mint Authority</span>
                    </Toggle>
                    {errors.mintAuthority && (
                      <p className="text-sm text-red-500">{errors.mintAuthority.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Toggle
                      pressed={watch('updateAuthority')}
                      onPressedChange={(pressed: boolean) => setValue('updateAuthority', pressed)}
                      aria-label="Toggle update authority"
                      className="w-full data-[state=on]:bg-blue-600"
                    >
                      <span className="text-sm">Update Authority</span>
                    </Toggle>
                    {errors.updateAuthority && (
                      <p className="text-sm text-red-500">{errors.updateAuthority.message}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Note: Enabling authorities may incur additional fees
                </p>
              </div>
            </div>
          </div>

          {/* Add debug info */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">
              Form Status: {isSubmitting ? 'Submitting...' : 'Ready'}
            </p>
            <p className="text-sm text-gray-400">
              Wallet Connected: {walletContext.connected ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-400">
              Creating Token: {isCreating ? 'Yes' : 'No'}
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isCreating}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                (!walletContext.connected || !walletContext.publicKey) ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {isCreating 
                ? 'Creating Token...' 
                : !walletContext.connected 
                ? 'Connect Wallet to Create' 
                : isSubmitting 
                ? 'Submitting...'
                : 'Create Token'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
