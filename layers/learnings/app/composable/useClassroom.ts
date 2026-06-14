import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, unref, type ComputedRef, type Ref } from 'vue';
import type { ClassroomData, ClassroomLesson, LessonDetail } from '~/layers/learnings/types';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';

const getErrorMessage = (error: { data?: TResponse; status?: number }, fallback: string) => {
  const message = error.data?.message;
  return Array.isArray(message) ? (message[0] ?? fallback) : (message ?? fallback);
};

interface LessonProgressResponse {
  id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  userId: string;
  lessonId: string;
  completedAt?: string;
  updatedAt: string;
}

type ClassroomQueryParam = ComputedRef<string> | Ref<string> | string;

export function useGetClassroom(classId: ClassroomQueryParam) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.CLASSROOM, unref(classId)]),
    queryFn: async () => {
      const response = await http<TResponse<ClassroomData>>(`/classroom/${unref(classId)}`, {
        method: 'GET',
      });
      return response.data;
    },
    enabled: computed(() => !!unref(classId)),
  });
}

export function useGetLesson(classId: ClassroomQueryParam, lessonId: ClassroomQueryParam) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LESSON, unref(classId), unref(lessonId)]),
    queryFn: async () => {
      const response = await http<TResponse<LessonDetail>>(`/classroom/${unref(classId)}/lesson/${unref(lessonId)}`, {
        method: 'GET',
      });
      return response.data;
    },
    enabled: computed(() => !!unref(classId) && !!unref(lessonId)),
  });
}

export function useGetNextLesson(classId: ClassroomQueryParam, currentLessonId: ClassroomQueryParam) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LESSON_NEXT, unref(classId), unref(currentLessonId)]),
    queryFn: async () => {
      const response = await http<TResponse<ClassroomLesson | null>>(`/classroom/${unref(classId)}/next-lesson/${unref(currentLessonId)}`, {
        method: 'GET',
      });
      return response.data;
    },
    enabled: computed(() => !!unref(classId) && !!unref(currentLessonId)),
  });
}

export function useGetPreviousLesson(classId: ClassroomQueryParam, currentLessonId: ClassroomQueryParam) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LESSON_PREVIOUS, unref(classId), unref(currentLessonId)]),
    queryFn: async () => {
      const response = await http<TResponse<ClassroomLesson | null>>(`/classroom/${unref(classId)}/previous-lesson/${unref(currentLessonId)}`, {
        method: 'GET',
      });
      return response.data;
    },
    enabled: computed(() => !!unref(classId) && !!unref(currentLessonId)),
  });
}

export function useResumeLearning(classId: ClassroomQueryParam) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LEARNING_RESUME, unref(classId)]),
    queryFn: async () => {
      const response = await http<TResponse<ClassroomLesson | null>>(`/classroom/${unref(classId)}/resume`, {
        method: 'GET',
      });
      return response.data;
    },
    enabled: computed(() => !!unref(classId)),
  });
}

export function useUpdateLessonProgress() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async ({ lessonId, status }: { lessonId: string; status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' }) => {
      const response = await http<TResponse<LessonProgressResponse>>(`/classroom/lesson/${lessonId}/progress`, {
        method: 'PATCH',
        body: { status },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related classroom or lesson data to trigger auto-refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CLASSROOM] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LESSON] });
    },
    onError: (error: { data?: TResponse; status?: number }) => {
      $toast.warning(getErrorMessage(error, 'Failed to update lesson progress'));
    },
  });
}

export function useCompleteLesson() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await http<TResponse<LessonProgressResponse>>(`/classroom/lesson/${lessonId}/complete`, {
        method: 'POST',
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related classroom or lesson data to trigger auto-refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CLASSROOM] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LESSON] });
    },
    onError: (error: { data?: TResponse; status?: number }) => {
      $toast.warning(getErrorMessage(error, 'Failed to complete lesson'));
    },
  });
}
