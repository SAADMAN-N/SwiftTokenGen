/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RPC_URL: "https://api.devnet.solana.com",
    NEXT_PUBLIC_NETWORK: "devnet",
  },
}

module.exports = nextConfig
