export const userService = {
  list: async () => [],
  findById: async (_id: number) => null,
  findByEmail: async (_email: string) => null,
  findUser: async (_where: Record<string, unknown>) => null,
  create: async (_payload: unknown) => null,
  update: async (_id: number, _payload: unknown) => null,
  delete: async (_id: number) => true,
  _getRepository: () => ({ cache: { get: () => undefined, set: () => undefined } }),
};
