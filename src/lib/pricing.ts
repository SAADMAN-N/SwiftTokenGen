export interface PricingOptions {
  includeSocials: boolean;
  revokeAuthorities: {
    mint: boolean;
    freeze: boolean;
    update: boolean;
  };
}

export const calculatePrice = (options: PricingOptions): number => {
  // During promotional period, return flat rate of 0.2 SOL
  return 0.2;
};

export const formatPrice = (price: number): string => {
  return `${price} SOL`;
};