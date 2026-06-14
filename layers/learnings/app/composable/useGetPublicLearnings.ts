import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ComputedRef } from 'vue';
import type { LearningClass } from '../../types';

export function useGetPublicLearnings(params: ComputedRef<MetaRequest & { category?: string }>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LEARNING_PUBLIC_LIST, unref(params)]),
    queryFn: async () => {
      const query = unref(params);
      const endpoint = query.category ? ENDPOINT.LEARNING.LIST_PUBLIC_CATEGORY(query.category) : ENDPOINT.LEARNING.LIST_PUBLIC;
      const response = await http<TResponse<Paginated<LearningClass>>>(endpoint, {
        method: 'GET',
        query: {
          page: query.page,
          limit: query.limit,
          search: query.search,
        },
      });
      return response.data;
    },
    staleTime: 0,
    enabled: true,
    refetchOnWindowFocus: false,
  });
}
