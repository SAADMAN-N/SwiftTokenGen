export const isValidTokenName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 32;
};

export const isValidTokenSymbol = (symbol: string): boolean => {
  return /^[A-Z0-9]{2,10}$/.test(symbol);
};