
import { z } from 'zod';

export const tokenFormSchema = z.object({
  name: z.string()
    .min(1, 'Token name is required')
    .max(32, 'Token name must be less than 32 characters'),
  
  symbol: z.string()
    .min(1, 'Token symbol is required')
    .max(10, 'Token symbol must be less than 10 characters'),
  
  decimals: z.number()
    .int()
    .min(0, 'Decimals must be at least 0')
    .max(9, 'Decimals cannot exceed 9'),
  
  supply: z.string()
    .min(1, 'Initial supply is required')
    .refine((val) => !isNaN(Number(val)), 'Supply must be a valid number'),
  
  description: z.string().optional(),
  creatorName: z.string().optional(),
  creatorEmail: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  discord: z.string().optional(),
  tags: z.array(z.string()).optional(),
  logoFile: z.any().optional(), // File type
  freezeAuthority: z.boolean(),
  mintAuthority: z.boolean(),
  updateAuthority: z.boolean(),
}).strict();

export type TokenFormData = z.infer<typeof tokenFormSchema>;
