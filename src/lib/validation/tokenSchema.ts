
import { z } from 'zod';

// Custom file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const tokenFormSchema = z.object({
  name: z.string()
    .min(2, 'Token name must be at least 2 characters')
    .max(50, 'Token name cannot exceed 50 characters'),
  symbol: z.string()
    .min(2, 'Symbol must be at least 2 characters')
    .max(10, 'Symbol cannot exceed 10 characters')
    .toUpperCase(),
  decimals: z.number()
    .int()
    .min(0, 'Decimals must be at least 0')
    .max(9, 'Decimals cannot exceed 9'),
  supply: z.string()
    .min(1, 'Supply is required')
    .regex(/^\d+$/, 'Supply must be a valid number'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  creatorName: z.string()
    .max(100, 'Creator name cannot exceed 100 characters')
    .optional(),
  creatorEmail: z.string()
    .email('Invalid email address')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .optional(),
  twitter: z.string()
    .url('Invalid Twitter URL')
    .optional(),
  telegram: z.string()
    .url('Invalid Telegram URL')
    .optional(),
  discord: z.string()
    .url('Invalid Discord URL')
    .optional(),
  tags: z.array(z.string())
    .max(5, 'Cannot add more than 5 tags')
    .optional(),
  logoFile: z.instanceof(File, { message: "Logo is required" })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      'Max file size is 5MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg and .png formats are supported'
    )
    .optional(),
});

export type TokenFormData = z.infer<typeof tokenFormSchema>;
