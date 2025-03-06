export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  solana: {
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    merchantWallet: process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS!,
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const;
