import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ComputedRef } from 'vue';
import type { LearningClass } from '../../types';

export function useGetPublicLearningDetail(category: ComputedRef<string>, slug: ComputedRef<string>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LEARNING_PUBLIC_DETAIL, unref(category), unref(slug)]),
    queryFn: async () => {
      const response = await http<TResponse<LearningClass>>(ENDPOINT.LEARNING.DETAIL_PUBLIC(unref(category), unref(slug)), { method: 'GET' });
      return response.data;
    },
    enabled: computed(() => Boolean(unref(category)) && Boolean(unref(slug))),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
