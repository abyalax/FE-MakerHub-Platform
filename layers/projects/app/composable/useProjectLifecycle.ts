import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Project } from '../../types';

export function usePublishProject() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (id: Project['id']) => http<TResponse<Project>>(ENDPOINT.PROJECTS.PUBLISH(id), { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
      $toast.info('Project published');
    },
  });
}

export function useUnpublishProject() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (id: Project['id']) => http<TResponse<Project>>(ENDPOINT.PROJECTS.UNPUBLISH(id), { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
      $toast.info('Project unpublished');
    },
  });
}
