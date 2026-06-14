import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { CreateLearningPayload, LearningClass, UpdateLearningPayload } from '../../types';

const getErrorMessage = (error: { data?: TResponse; status?: number }, fallback: string) => {
  const message = error.data?.message;
  return Array.isArray(message) ? (message[0] ?? fallback) : (message ?? fallback);
};

export function useCreateLearning() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (payload: CreateLearningPayload) => {
      const response = await http<TResponse<LearningClass>>(ENDPOINT.LEARNING.CREATE, { method: 'POST', body: payload });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LEARNING_LIST] });
      $toast.info('Learning created');
    },
    onError: (error: { data?: TResponse; status?: number }) => {
      $toast.warning(getErrorMessage(error, 'Create learning failed'));
    },
  });
}

export function useUpdateLearning() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: { id: string; payload: UpdateLearningPayload }) => {
      const response = await http<TResponse<LearningClass>>(ENDPOINT.LEARNING.DETAIL(params.id), { method: 'PATCH', body: params.payload });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LEARNING_LIST] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LEARNING_DETAIL] });
      $toast.info('Learning updated');
    },
    onError: (error: { data?: TResponse; status?: number }) => {
      $toast.warning(getErrorMessage(error, 'Update learning failed'));
    },
  });
}

export function useDeleteLearning() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await http<TResponse<boolean>>(ENDPOINT.LEARNING.DETAIL(id), { method: 'DELETE' });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LEARNING_LIST] });
      $toast.info('Learning deleted');
    },
    onError: (error: { data?: TResponse; status?: number }) => {
      $toast.warning(getErrorMessage(error, 'Delete learning failed'));
    },
  });
}

export function usePublishLearning() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await http<TResponse<LearningClass>>(ENDPOINT.LEARNING.PUBLISH(id), { method: 'PATCH' });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LEARNING_LIST] });
      $toast.info('Learning published');
    },
    onError: (error: { data?: TResponse; status?: number }) => {
      $toast.warning(getErrorMessage(error, 'Publish learning failed'));
    },
  });
}

export function useUnpublishLearning() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await http<TResponse<LearningClass>>(ENDPOINT.LEARNING.UNPUBLISH(id), { method: 'PATCH' });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LEARNING_LIST] });
      $toast.info('Learning unpublished');
    },
    onError: (error: { data?: TResponse; status?: number }) => {
      $toast.warning(getErrorMessage(error, 'Unpublish learning failed'));
    },
  });
}
