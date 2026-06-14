<script setup lang="ts">
import { computed } from 'vue';
import { Check, Circle, Clock3, Lock, Play, Sparkles } from 'lucide-vue-next';
import type { ClassroomLesson, ClassroomProject, ClassroomSection } from '~/layers/learnings/types';
import { useClassroomStore, type ClassroomFlatLesson, type ClassroomProgressStatus } from '~/layers/learnings/app/composable/useClassroomStore';
import { Badge } from '~/layers/shared/app/components/ui/badge';
import { Progress } from '~/layers/shared/app/components/ui/progress';

defineProps<{
  compact?: boolean;
}>();

const emit = defineEmits<{
  selectLesson: [lesson: ClassroomLesson];
}>();

const classroomStore = useClassroomStore();

const orderedProjects = computed(() => [...classroomStore.projects].sort((left, right) => left.sortOrder - right.sortOrder));

function getLessonFlatItem(lessonId: string) {
  return classroomStore.flatLessons.find((item) => item.lesson.id === lessonId) ?? null;
}

function getLessonStatus(lessonId: string) {
  return classroomStore.getLessonStatus(lessonId);
}

function isLessonActive(lessonId: string) {
  return classroomStore.activeLessonId === lessonId;
}

function isLessonLocked(flatLesson: ClassroomFlatLesson | null) {
  if (!flatLesson || flatLesson.index === 0) return false;
  if (classroomStore.activeFlatLesson && flatLesson.index <= classroomStore.activeFlatLesson.index + 1) return false;
  if (getLessonStatus(flatLesson.lesson.id) !== 'NOT_STARTED') return false;

  const previousLesson = classroomStore.flatLessons[flatLesson.index - 1];
  if (!previousLesson) return false;

  return getLessonStatus(previousLesson.lesson.id) !== 'COMPLETED';
}

function getStatusLabel(lessonId: string) {
  const flatLesson = getLessonFlatItem(lessonId);
  if (isLessonActive(lessonId)) return 'Current';
  if (isLessonLocked(flatLesson)) return 'Locked';

  const status = getLessonStatus(lessonId);
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'IN_PROGRESS') return 'In progress';
  return 'Not started';
}

function getStatusIcon(status: ClassroomProgressStatus, active: boolean, locked: boolean) {
  if (locked) return Lock;
  if (active) return Play;
  if (status === 'COMPLETED') return Check;
  if (status === 'IN_PROGRESS') return Clock3;
  return Circle;
}

function getStatusClass(lessonId: string) {
  const flatLesson = getLessonFlatItem(lessonId);
  const status = getLessonStatus(lessonId);

  if (isLessonActive(lessonId)) return 'border-primary bg-primary text-primary-foreground shadow-sm';
  if (isLessonLocked(flatLesson)) return 'border-border bg-muted text-muted-foreground';
  if (status === 'COMPLETED') return 'border-primary bg-primary text-primary-foreground';
  if (status === 'IN_PROGRESS') return 'border-accent bg-accent text-accent-foreground';
  return 'border-border bg-background text-muted-foreground';
}

function selectLesson(lesson: ClassroomLesson) {
  const flatLesson = getLessonFlatItem(lesson.id);
  if (isLessonLocked(flatLesson)) return;

  emit('selectLesson', lesson);
}

function getOrderedSections(projectItem: ClassroomProject) {
  return [...(projectItem.project.sections ?? [])].sort((left, right) => left.sortOrder - right.sortOrder);
}

function getOrderedLessons(section: ClassroomSection) {
  return [...(section.lessons ?? [])].sort((left, right) => left.sortOrder - right.sortOrder);
}
</script>

<template>
  <aside
    :class="['flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground', compact ? 'rounded-none' : 'rounded-4xl border shadow-sm']"
  >
    <header class="border-b p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles class="size-3.5" />
            Classroom
          </p>
          <h1 class="mt-2 line-clamp-2 text-xl font-bold tracking-tight text-foreground">
            {{ classroomStore.learningClass?.title ?? 'Learning classroom' }}
          </h1>
        </div>

        <Badge class="rounded-full px-3 py-1">{{ classroomStore.classProgressPercent }}%</Badge>
      </div>

      <div class="mt-5 space-y-2">
        <div class="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{{ classroomStore.completedLessonCount }} / {{ classroomStore.flatLessons.length }} lessons completed</span>
          <span>{{ classroomStore.lastActivityLabel }}</span>
        </div>
        <Progress :model-value="classroomStore.classProgressPercent" class="h-2 bg-muted" />
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5">
      <div v-for="(projectItem, projectIndex) in orderedProjects" :key="projectItem.projectId" class="group/project pb-6 last:pb-0">
        <div class="mb-3 flex items-center gap-3">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
            {{ projectIndex + 1 }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-sm font-bold text-foreground">{{ projectItem.project.title }}</h2>
            <div class="mt-1 flex items-center gap-2">
              <Progress
                :model-value="classroomStore.getProjectProgress(projectItem)"
                class="h-1.5 bg-muted"
              />
              <span class="text-xs font-semibold text-muted-foreground">{{ classroomStore.getProjectProgress(projectItem) }}%</span>
            </div>
          </div>
        </div>

        <div class="space-y-4 border-l pl-4">
          <section v-for="section in getOrderedSections(projectItem)" :key="section.id" class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ section.title }}</h3>

            <button
              v-for="lesson in getOrderedLessons(section)"
              :key="lesson.id"
              type="button"
              class="grid w-full grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-border hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-transparent"
              :disabled="isLessonLocked(getLessonFlatItem(lesson.id))"
              @click="selectLesson(lesson)"
            >
              <span :class="['mt-0.5 flex size-8 items-center justify-center rounded-full border transition', getStatusClass(lesson.id)]">
                <component
                  :is="getStatusIcon(getLessonStatus(lesson.id), isLessonActive(lesson.id), isLessonLocked(getLessonFlatItem(lesson.id)))"
                  class="size-4"
                />
              </span>

              <span class="min-w-0">
                <span
                  :class="[
                    'block truncate text-sm font-semibold',
                    isLessonLocked(getLessonFlatItem(lesson.id)) ? 'text-muted-foreground' : 'text-foreground',
                  ]"
                >
                  {{ lesson.title }}
                </span>
                <span class="mt-1 block text-xs text-muted-foreground">{{ getStatusLabel(lesson.id) }}</span>
              </span>
            </button>
          </section>
        </div>
      </div>
    </div>
  </aside>
</template>
