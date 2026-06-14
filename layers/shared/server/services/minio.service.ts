export const minioService = {
  getConfig: () => ({
    bucket: 'boilerplate-uploads',
    uploadExpiresSeconds: 600,
    downloadExpiresSeconds: 600,
    maxFileSizeBytes: 10 * 1024 * 1024,
  }),
  presignedPutObject: async () => '',
  presignedGetObject: async () => '',
  statObject: async () => ({ size: 0 }),
  removeObject: async () => undefined,
};
