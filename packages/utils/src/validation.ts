import { z } from 'zod';

export const listingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['portable', 'deck', 'disc_blank', 'disc_prerecorded', 'disc_custom', 'accessory', 'remote', 'cable', 'other']),
  condition: z.enum(['new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts']),
  price_cents: z.number().int().positive(),
  shipping_price_cents: z.number().int().min(0),
  shipping_domestic_only: z.boolean(),
  quantity: z.number().int().min(1),
});

export const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const deviceSubmissionSchema = z.object({
  name: z.string().min(2).max(200),
  manufacturer: z.string().min(1).max(100),
  model_number: z.string().min(1).max(100),
  device_type: z.enum([
    'portable_netmd', 'portable_himd', 'portable_standard',
    'deck_netmd', 'deck_standard', 'deck_es',
    'shelf_system', 'car_unit', 'professional',
  ]),
  year_released: z.number().int().min(1992).max(2025).optional(),
  description: z.string().max(2000).optional(),
});
