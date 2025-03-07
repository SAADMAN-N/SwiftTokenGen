
import { z } from 'zod';

export const tokenFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  decimals: z.coerce.number(), // Use coerce for automatic conversion
  supply: z.coerce.number().min(1, "Supply must be greater than 0"), // Use coerce.number()
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
