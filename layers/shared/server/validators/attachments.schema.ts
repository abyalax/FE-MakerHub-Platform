import { z } from 'zod';

export const attachmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const attachmentListQuerySchema = z.object({
  ownerType: z.string().min(1),
  ownerId: z.coerce.number().int().positive(),
});

export const requestPresignedUploadSchema = z.object({
  ownerType: z.string().min(1),
  ownerId: z.coerce.number().int().positive(),
  files: z.array(
    z.object({
      fileName: z.string().min(1),
      contentType: z.string().min(1),
      size: z.coerce.number().int().positive(),
      fileCategory: z.enum(['PDF', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER']),
    })
  ).min(1),
});

export const confirmUploadSchema = z.object({
  ownerType: z.string().min(1),
  ownerId: z.union([z.coerce.number().int().positive(), z.coerce.string().min(1)]).transform((value) => Number(value)),
  objectKey: z.string().min(1),
  originalFileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.union([z.coerce.number().int().positive(), z.coerce.string().min(1)]).transform((value) => Number(value)),
  fileCategory: z.enum(['PDF', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER']),
});
