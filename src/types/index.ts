export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
}

export interface TokenCreationResult {
  signature: string;
  mintAddress: string;
  tokenAccount: string;
  explorerUrl: string;
  tokenInfo: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
  };
}
