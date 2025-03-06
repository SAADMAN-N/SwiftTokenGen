import { z } from 'zod';

export const tokenFormSchema = z.object({
  name: z.string()
    .min(3, 'Token name must be at least 3 characters')
    .max(32, 'Token name cannot exceed 32 characters')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Only alphanumeric characters and spaces are allowed'),
  
  symbol: z.string()
    .min(2, 'Symbol must be at least 2 characters')
    .max(11, 'Symbol cannot exceed 11 characters')
    .regex(/^[A-Z0-9]+$/, 'Symbol must be uppercase alphanumeric only'),
  
  decimals: z.number()
    .int()
    .min(0, 'Decimals must be at least 0')
    .max(9, 'Decimals cannot exceed 9'),
  
  supply: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Supply must be a positive number')
    .refine(
      (val) => Number(val) <= 1_000_000_000_000_000,
      'Supply cannot exceed 1 quadrillion'
    )
});

export type TokenFormData = z.infer<typeof tokenFormSchema>;