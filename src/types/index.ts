export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  freezeAuthority?: boolean;
  mintAuthority?: boolean;
  updateAuthority?: boolean;
}

export interface TokenCreationResult {
  signature: string;
  mintAddress: string;
  tokenAccount: string;
  explorerUrl?: string;
  tokenInfo?: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
  };
}
