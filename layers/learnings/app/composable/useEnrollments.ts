import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import type { Enrollment } from '~/layers/learnings/types';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ComputedRef, Ref } from 'vue';

type EnrollmentQueryParam = string | Ref<string> | ComputedRef<string>;

export function useGetMyEnrollments(enabled: Ref<boolean> | ComputedRef<boolean> | boolean = true) {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.ENROLLMENT_MINE],
    queryFn: async () => {
      const response = await http<TResponse<Enrollment[]>>(ENDPOINT.ENROLLMENTS.MINE, {
        method: 'GET',
      });
      return response.data;
    },
    enabled: computed(() => Boolean(unref(enabled))),
  });
}

export function useGetMyEnrollment(classId: EnrollmentQueryParam, enabled: Ref<boolean> | ComputedRef<boolean> | boolean = true) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.ENROLLMENT_DETAIL, unref(classId)]),
    queryFn: async () => {
      const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.DETAIL_MINE(unref(classId)), {
        method: 'GET',
      });
      return response.data;
    },
    enabled: computed(() => Boolean(unref(classId)) && Boolean(unref(enabled))),
  });
}

export function useEnrollClass() {
  const http = useHttp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.ENROLL(classId), {
        method: 'POST',
      });
      return response.data;
    },
    onSuccess: (enrollment) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ENROLLMENT_MINE] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ENROLLMENT_DETAIL, enrollment.classId] });
    },
  });
}

export function useUpdateEnrollmentProgress() {
  const http = useHttp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, progressPercent }: { classId: string; progressPercent: number }) => {
      const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.PROGRESS(classId), {
        method: 'PATCH',
        body: { progressPercent },
      });
      return response.data;
    },
    onSuccess: (enrollment) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ENROLLMENT_MINE] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ENROLLMENT_DETAIL, enrollment.classId] });
    },
  });
}

export function useCompleteEnrollment() {
  const http = useHttp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.COMPLETE(classId), {
        method: 'PATCH',
      });
      return response.data;
    },
    onSuccess: (enrollment) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ENROLLMENT_MINE] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ENROLLMENT_DETAIL, enrollment.classId] });
    },
  });
}

export const useEnrollments = () => {
  const http = useHttp();

  const getMyEnrollments = async () => {
    const response = await http<TResponse<Enrollment[]>>(ENDPOINT.ENROLLMENTS.MINE, {
      method: 'GET',
    });
    return response.data;
  };

  const getMyEnrollment = async (classId: string) => {
    const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.DETAIL_MINE(classId), {
      method: 'GET',
    });
    return response.data;
  };

  const enroll = async (classId: string) => {
    const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.ENROLL(classId), {
      method: 'POST',
    });
    return response.data;
  };

  const updateProgress = async (classId: string, progressPercent: number) => {
    const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.PROGRESS(classId), {
      method: 'PATCH',
      body: { progressPercent },
    });
    return response.data;
  };

  const completeClass = async (classId: string) => {
    const response = await http<TResponse<Enrollment>>(ENDPOINT.ENROLLMENTS.COMPLETE(classId), {
      method: 'PATCH',
    });
    return response.data;
  };

  return {
    getMyEnrollments,
    getMyEnrollment,
    enroll,
    updateProgress,
    completeClass,
  };
};
