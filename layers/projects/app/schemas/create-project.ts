import * as z from 'zod';
import { ContentAccessType } from '~/layers/shared/app/common/enum';

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
  summary: z.string().trim().max(500, 'Summary must be at most 500 characters').optional(),
  objectivesText: z.string().optional(),
  description: z.string().trim().min(1, 'Project scope is required'),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  accessType: z.enum(ContentAccessType),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  currency: z.string().trim().length(3, 'Currency must use a 3-letter code').optional(),
});
