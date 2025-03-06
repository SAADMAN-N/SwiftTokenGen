
import { z } from 'zod';

// Custom file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const tokenFormSchema = z.object({
  name: z.string()
    .min(1, 'Token name is required')
    .max(32, 'Token name must be 32 characters or less'),
  symbol: z.string()
    .min(1, 'Token symbol is required')
    .max(10, 'Token symbol must be 10 characters or less'),
  decimals: z.number()
    .min(0)
    .max(9),
  supply: z.string()
    .min(1, 'Initial supply is required'),
  description: z.string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional(),
  creatorName: z.string()
    .min(1, 'Creator name is required'),
  creatorEmail: z.string()
    .email('Invalid email address'),
  website: z.string()
    .url('Invalid URL')
    .optional(),
  twitter: z.string()
    .url('Invalid URL')
    .optional(),
  telegram: z.string()
    .url('Invalid URL')
    .optional(),
  discord: z.string()
    .url('Invalid URL')
    .optional(),
  tags: z.array(z.string()),
  logoFile: z.instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      'Max file size is 5MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg and .png formats are supported'
    )
    .optional(),
  
  // New authority fields
  freezeAuthority: z.boolean().default(false),
  mintAuthority: z.boolean().default(false),
  updateAuthority: z.boolean().default(false),
});

export type TokenFormData = z.infer<typeof tokenFormSchema>;
