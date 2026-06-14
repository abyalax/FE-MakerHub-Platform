<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ClassroomLessonViewer from '~/layers/learnings/app/components/classroom/ClassroomLessonViewer.vue';
import ClassroomLoadingState from '~/layers/learnings/app/components/classroom/ClassroomLoadingState.vue';
import ClassroomRoadmap from '~/layers/learnings/app/components/classroom/ClassroomRoadmap.vue';
import { useClassroomStore } from '~/layers/learnings/app/composable/useClassroomStore';
import type { ClassroomLesson } from '~/layers/learnings/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/layers/shared/app/components/ui/sheet';

const route = useRoute();
const classroomStore = useClassroomStore();
const mobileRoadmapOpen = ref(false);

const classId = computed(() => String(route.params.classId ?? ''));
const lessonId = computed(() => String(route.params.lessonId ?? ''));

watch(
  [classId, lessonId],
  async ([nextClassId, nextLessonId]) => {
    if (!nextClassId || !nextLessonId) return;
    await classroomStore.openLesson(nextClassId, nextLessonId);
  },
  { immediate: true }
);

async function navigateToLesson(lesson: ClassroomLesson | null) {
  if (!lesson) return;

  mobileRoadmapOpen.value = false;
  if (classroomStore.activeLessonId === lesson.id) return;

  await classroomStore.autosaveActiveLesson().catch(() => undefined);
  await navigateTo(`/classroom/${classId.value}/${lesson.id}`);
}

async function handlePrevious() {
  await navigateToLesson(classroomStore.previousLesson);
}

async function handleNext() {
  await navigateToLesson(classroomStore.nextLesson);
}

async function handleComplete() {
  const nextLesson = await classroomStore.completeActiveLesson().catch(() => null);
  if (nextLesson) {
    await navigateToLesson(nextLesson);
  }
}

onBeforeRouteLeave(() => {
  void classroomStore.autosaveActiveLesson().catch(() => undefined);
});
</script>

<template>
  <ClassroomLoadingState v-if="(classroomStore.loading || classroomStore.lessonLoading) && !classroomStore.activeLesson" />

  <div v-else class="h-screen overflow-hidden bg-background p-3 md:p-4">
    <div class="grid h-full min-h-0 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <ClassroomRoadmap class="hidden lg:flex" @select-lesson="navigateToLesson" />

      <ClassroomLessonViewer @open-roadmap="mobileRoadmapOpen = true" @previous="handlePrevious" @next="handleNext" @complete="handleComplete" />
    </div>

    <Sheet v-model:open="mobileRoadmapOpen">
      <SheetContent side="left" class="w-[92vw] max-w-105 gap-0 bg-card p-0">
        <SheetHeader class="sr-only">
          <SheetTitle>Course structure</SheetTitle>
        </SheetHeader>
        <ClassroomRoadmap compact @select-lesson="navigateToLesson" />
      </SheetContent>
    </Sheet>
  </div>
</template>
