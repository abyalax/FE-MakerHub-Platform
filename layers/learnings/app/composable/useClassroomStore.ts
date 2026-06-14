import { defineStore } from 'pinia';
import { computed, nextTick, ref, watch } from 'vue';
import type { ClassroomData, ClassroomLesson, ClassroomProject, LessonDetail } from '~/layers/learnings/types';
import { useCompleteLesson, useGetClassroom, useGetLesson, useResumeLearning, useUpdateLessonProgress } from './useClassroom';
import type { TResponse } from '~/layers/shared/app/types/response';

const getErrorMessage = (error: Error | { data?: TResponse; status?: number }, fallback: string) => {
  if (error instanceof Error) return error.message || fallback;
  const message = error.data?.message;
  return Array.isArray(message) ? (message[0] ?? fallback) : (message ?? fallback);
};

export type ClassroomProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ClassroomFlatLesson {
  index: number;
  projectId: string;
  projectTitle: string;
  projectIndex: number;
  sectionId: string;
  sectionTitle: string;
  sectionIndex: number;
  lesson: ClassroomLesson;
}

const normalizePercent = (value: string | number | undefined | null) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, Math.round(numericValue)));
};

const getStatusWeight = (status: ClassroomProgressStatus) => {
  if (status === 'COMPLETED') return 1;
  if (status === 'IN_PROGRESS') return 0.5;
  return 0;
};

const sortBySortOrder = <T extends { sortOrder?: number | null }>(items?: T[] | null): T[] =>
  [...(items ?? [])].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

const getFirstLessonFromClassroom = (classroom?: ClassroomData | null) => {
  const firstProject = sortBySortOrder(classroom?.projects)[0]?.project;
  const firstSection = sortBySortOrder(firstProject?.sections)[0];
  return sortBySortOrder(firstSection?.lessons)[0] ?? null;
};

export const useClassroomStore = defineStore('classroom', () => {
  const currentClassId = ref<string>('');
  const currentLessonId = ref<string>('');

  const activeLesson = ref<LessonDetail | null>(null);
  const progressOverrides = ref<Record<string, ClassroomProgressStatus>>({});
  const lessonLoading = ref(false);

  const { data: classroomData, isLoading: loading, error: classroomError, refetch: fetchClassroom } = useGetClassroom(currentClassId);
  const { data: lessonData, isFetching: fetchingLesson, error: lessonError, refetch: fetchLesson } = useGetLesson(currentClassId, currentLessonId);
  const { error: resumeError, refetch: fetchResumeLesson } = useResumeLearning(currentClassId);

  const { mutateAsync: mutateProgress, isPending: saving } = useUpdateLessonProgress();

  const { mutateAsync: mutateComplete, isPending: completing } = useCompleteLesson();

  // Watch for query errors and show toasts
  const { $toast } = useNuxtApp();

  watch(classroomError, (error) => {
    if (error) $toast.warning(getErrorMessage(error, 'Failed to load classroom'));
  });

  watch(lessonError, (error) => {
    if (error) $toast.warning(getErrorMessage(error, 'Failed to load lesson'));
  });

  watch(resumeError, (error) => {
    if (error) $toast.warning(getErrorMessage(error, 'Failed to resume learning'));
  });

  // Reset overrides when changing classroom
  watch(currentClassId, () => {
    progressOverrides.value = {};
  });

  const enrollment = computed(() => classroomData.value?.enrollment ?? null);
  const learningClass = computed(() => enrollment.value?.class ?? null);
  const projects = computed(() => classroomData.value?.projects ?? []);

  const flatLessons = computed<ClassroomFlatLesson[]>(() => {
    const lessons: ClassroomFlatLesson[] = [];

    projects.value.forEach((projectItem, projectIndex) => {
      const sections = sortBySortOrder(projectItem.project.sections);

      sections.forEach((section, sectionIndex) => {
        sortBySortOrder(section.lessons).forEach((lesson) => {
          lessons.push({
            index: lessons.length,
            projectId: String(projectItem.projectId),
            projectTitle: projectItem.project.title,
            projectIndex,
            sectionId: String(section.id),
            sectionTitle: section.title,
            sectionIndex,
            lesson,
          });
        });
      });
    });

    return lessons;
  });

  const activeLessonId = computed(() => activeLesson.value?.id ?? null);
  const activeFlatLesson = computed(() => flatLessons.value.find((item) => item.lesson.id === activeLessonId.value) ?? null);
  const activeIndex = computed(() => activeFlatLesson.value?.index ?? -1);
  const previousLesson = computed(() => (activeIndex.value > 0 ? (flatLessons.value[activeIndex.value - 1]?.lesson ?? null) : null));
  const nextLesson = computed(() =>
    activeIndex.value >= 0 && activeIndex.value < flatLessons.value.length - 1 ? (flatLessons.value[activeIndex.value + 1]?.lesson ?? null) : null
  );
  const completedLessonCount = computed(() => flatLessons.value.filter((item) => getLessonStatus(item.lesson.id) === 'COMPLETED').length);
  const classProgressPercent = computed(() => {
    if (!flatLessons.value.length) return normalizePercent(enrollment.value?.progressPercent);

    const score = flatLessons.value.reduce((total, item) => total + getStatusWeight(getLessonStatus(item.lesson.id)), 0);
    return normalizePercent((score / flatLessons.value.length) * 100);
  });

  const lastActivityLabel = computed(() => {
    const date = enrollment.value?.completedAt ?? enrollment.value?.enrolledAt;
    if (!date) return 'Autosave ready';

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  });

  function getLessonStatus(lessonId: string): ClassroomProgressStatus {
    const override = progressOverrides.value[lessonId];
    if (override) return override;

    const lesson = flatLessons.value.find((item) => item.lesson.id === lessonId)?.lesson;
    return (lesson?.progress?.status ?? 'NOT_STARTED') as ClassroomProgressStatus;
  }

  function getProjectProgress(project: ClassroomProject) {
    const projectLessons = flatLessons.value.filter((item) => item.projectId === String(project.projectId));
    if (!projectLessons.length) return normalizePercent(project.project.progress?.progressPercent);

    const score = projectLessons.reduce((total, item) => total + getStatusWeight(getLessonStatus(item.lesson.id)), 0);
    return normalizePercent((score / projectLessons.length) * 100);
  }

  function setLessonStatus(lessonId: string, status: ClassroomProgressStatus) {
    progressOverrides.value = {
      ...progressOverrides.value,
      [lessonId]: status,
    };
  }

  async function loadClassroom(classId: string, options: { force?: boolean } = {}) {
    currentClassId.value = classId;
    await nextTick();

    if (!options.force && classroomData.value?.enrollment.classId === classId) {
      return classroomData.value;
    }

    const response = await fetchClassroom();
    return response.data ?? null;
  }

  async function resume(classId: string) {
    currentClassId.value = classId;
    await nextTick();

    const resumeResponse = await fetchResumeLesson();
    if (resumeResponse.data?.id) return resumeResponse.data;

    const classroom = await loadClassroom(classId, { force: true });
    return getFirstLessonFromClassroom(classroom);
  }

  async function startFirstLesson(classId: string) {
    const classroom = await loadClassroom(classId, { force: true });
    return getFirstLessonFromClassroom(classroom);
  }

  async function openLesson(classId: string, lessonId: string) {
    lessonLoading.value = true;
    currentClassId.value = classId;
    currentLessonId.value = lessonId;
    await nextTick();

    try {
      if (!classroomData.value || enrollment.value?.classId !== classId) {
        await loadClassroom(classId, { force: true });
      }

      const response = await fetchLesson();
      activeLesson.value = response.data ?? lessonData.value ?? null;

      if (activeLesson.value && getLessonStatus(lessonId) === 'NOT_STARTED') {
        await updateProgress(lessonId, 'IN_PROGRESS');
      }

      return activeLesson.value;
    } finally {
      lessonLoading.value = false;
    }
  }

  async function updateProgress(lessonId: string, status: ClassroomProgressStatus) {
    setLessonStatus(lessonId, status);
    await mutateProgress({ lessonId, status });
  }

  async function completeActiveLesson() {
    if (!activeLesson.value) return null;

    const lessonId = activeLesson.value.id;
    setLessonStatus(lessonId, 'COMPLETED');

    await mutateComplete(lessonId);
    return nextLesson.value;
  }

  async function autosaveActiveLesson() {
    if (!activeLesson.value) return;
    const currentStatus = getLessonStatus(activeLesson.value.id);
    if (currentStatus === 'COMPLETED') return;
    await updateProgress(activeLesson.value.id, 'IN_PROGRESS');
  }

  function reset() {
    currentClassId.value = '';
    currentLessonId.value = '';
    activeLesson.value = null;
    progressOverrides.value = {};
  }

  return {
    classroomData,
    activeLesson,
    loading,
    lessonLoading: computed(() => lessonLoading.value || fetchingLesson.value),
    saving,
    completing,
    enrollment,
    learningClass,
    projects,
    flatLessons,
    activeLessonId,
    activeFlatLesson,
    previousLesson,
    nextLesson,
    completedLessonCount,
    classProgressPercent,
    lastActivityLabel,
    loadClassroom,
    resume,
    startFirstLesson,
    openLesson,
    updateProgress,
    completeActiveLesson,
    autosaveActiveLesson,
    getLessonStatus,
    getProjectProgress,
    reset,
  };
});
