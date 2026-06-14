import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ComputedRef } from 'vue';
import type { LearningClass } from '../../types';

export function useGetLearning(id: ComputedRef<string>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LEARNING_DETAIL, unref(id)]),
    queryFn: async () => {
      const response = await http<TResponse<LearningClass>>(ENDPOINT.LEARNING.DETAIL(unref(id)), { method: 'GET' });
      return response.data;
    },
    enabled: computed(() => Boolean(unref(id))),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
