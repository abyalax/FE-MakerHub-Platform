import { z } from 'zod';

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const createUserSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(z.coerce.number().int().positive()).optional(),
  permissions: z.array(z.coerce.number().int().positive()).optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ roles: true, permissions: true }).extend({
  roles: z.array(z.coerce.number().int().positive()).optional(),
  permissions: z.array(z.coerce.number().int().positive()).optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});
