
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
import { getMinimumBalanceForRentExemptMint } from '@solana/spl-token';
import { createToken } from '@/lib/solana/token';
import { toast } from "sonner"
import type { TokenConfig } from '@/types';

interface TokenCreationSuccess {
  signature: string;
  mintAddress: string;
  tokenAccount: string;
  config: TokenConfig;
}

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_NETWORK = "devnet";

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
      supply: '',
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

  // Add this debug function
  const debugSubmit = async (data: TokenFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Validation errors:', errors);
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

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
      console.log('Current environment state:', {
        env: process.env,
        required: REQUIRED_ENV_VARS,
      });

      // Validate environment variables first
      console.log('Validating environment variables...');
      console.log('Current env vars:', {
        RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
        NETWORK: process.env.NEXT_PUBLIC_NETWORK,
      });

      const env = validateEnvironment();
      
      // Log the full form data
      console.log('Form Data Received:', {
        ...data,
        supply: typeof data.supply,
        decimals: typeof data.decimals
      });

      // Validate required fields
      if (!data.name || !data.symbol || !data.supply) {
        toast.error("Please fill in all required fields");
        console.log('Validation failed - missing required fields');
        return;
      }

      // Validate wallet connection
      if (!walletContext.connected || !walletContext.publicKey) {
        toast.error("Please connect your wallet to create a token");
        console.log('Validation failed - wallet not connected');
        return;
      }

      // Create connection with validated RPC URL
      console.log('Connecting to RPC URL:', env.RPC_URL);
      const connection = new Connection(env.RPC_URL, 'confirmed');

      // Check balance
      const balance = await connection.getBalance(walletContext.publicKey);
      const minimumBalance = await getMinimumBalanceForRentExemptMint(connection);
      console.log('Balance check:', { balance, minimumBalance });

      if (balance < minimumBalance) {
        toast.error("Insufficient balance for token creation");
        console.log('Validation failed - insufficient balance');
        return;
      }

      // Proceed with token creation
      setIsCreating(true);
      console.log('Starting token creation process...');

      const tokenConfig: TokenConfig = {
        name: data.name.trim(),
        symbol: data.symbol.trim().toUpperCase(),
        decimals: Number(data.decimals),
        supply: data.supply,
        freezeAuthority: data.freezeAuthority,
        mintAuthority: data.mintAuthority,
        updateAuthority: data.updateAuthority
      };

      console.log('Token configuration:', tokenConfig);

      const result = await createToken(
        walletContext,
        tokenConfig,
        connection,
        env.NETWORK as NetworkType
      );

      console.log('Token creation successful:', result);

      const successData: TokenCreationSuccess = {
        signature: result.signature,
        mintAddress: result.mintAddress,
        tokenAccount: result.tokenAccount,
        config: tokenConfig
      };
      
      setCreationSuccess(successData);
      
      toast.success("Token Created Successfully!", {
        duration: 10000,
        description: (
          <div className="space-y-2">
            <p>Mint Address: {result.mintAddress.slice(0, 8)}...</p>
            <button 
              onClick={() => window.open(
                `https://explorer.solana.com/address/${result.mintAddress}?cluster=${REQUIRED_ENV_VARS.NETWORK}`,
                '_blank'
              )}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View on Explorer →
            </button>
          </div>
        )
      });

    } catch (error: unknown) {
      console.error('Token creation error:', error);
      console.error('Detailed error:', {
        error,
        env: process.env,
        required: REQUIRED_ENV_VARS,
      });
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error("Token Creation Failed", {
        description: errorMessage
      });
      setCreationSuccess(null);
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
                  error={errors.logoFile?.message}
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
