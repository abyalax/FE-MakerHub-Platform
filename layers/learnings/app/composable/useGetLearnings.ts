import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ComputedRef } from 'vue';
import type { LearningClass } from '../../types';

export function useGetLearnings(params: ComputedRef<MetaRequest & Record<string, unknown>>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LEARNING_LIST, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<Paginated<LearningClass>>>(ENDPOINT.LEARNING.LIST_MINE, {
        method: 'GET',
        query: unref(params),
      });
      return response.data;
    },
    staleTime: 0,
    enabled: true,
    refetchOnWindowFocus: false,
  });
}
