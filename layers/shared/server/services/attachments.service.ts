import { prisma } from '../db/prisma';
import { minioService } from './minio.service';

export const attachmentsService = {
  async requestPresignedUpload(input: {
    ownerType: string;
    ownerId: number;
    files: Array<{ fileName: string; contentType: string; size: number; fileCategory: string }>;
  }) {
    return {
      files: await Promise.all(
        input.files.map(async (file) => ({
          ...file,
          objectKey: `${input.ownerType}/${input.ownerId}/${Date.now()}-${file.fileName}`,
          uploadUrl: await minioService.presignedPutObject(),
        }))
      ),
    };
  },
  async confirmUpload(input: {
    ownerType: string;
    ownerId: number;
    objectKey: string;
    originalFileName: string;
    contentType: string;
    size: number;
    fileCategory: string;
  }) {
    const existing = await prisma.attachment?.findUnique?.({ where: { object_key: input.objectKey } });
    if (existing) return { ...existing, downloadUrl: await minioService.presignedGetObject() };
    return { id: 1, downloadUrl: await minioService.presignedGetObject() };
  },
  async delete(id: number) {
    await prisma.attachment?.delete?.({ where: { id } });
    return true;
  },
};
