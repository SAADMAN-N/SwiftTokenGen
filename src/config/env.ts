export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  solana: {
    network: process.env.NEXT_PUBLIC_NETWORK || 'devnet',
    rpcEndpoint: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
    merchantWallet: process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS!,
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const;
