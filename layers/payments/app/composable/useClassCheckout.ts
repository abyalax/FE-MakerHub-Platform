import { useMutation } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ClassCheckout } from '../../types';

export function useClassCheckout() {
  const http = useHttp();

  return useMutation({
    mutationFn: async (classId: string) => {
      const response = await http<TResponse<ClassCheckout>>(ENDPOINT.PAYMENTS.CLASS_CHECKOUT, {
        method: 'POST',
        body: { classId },
      });
      return response.data;
    },
  });
}
