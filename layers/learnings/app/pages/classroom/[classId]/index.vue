<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ClassroomLoadingState from '~/layers/learnings/app/components/classroom/ClassroomLoadingState.vue';
import { useClassroomStore } from '~/layers/learnings/app/composable/useClassroomStore';
import { Button } from '~/layers/shared/app/components/ui/button';

const route = useRoute();
const classId = String(route.params.classId ?? '');
const classroomStore = useClassroomStore();
const resumeAttempted = ref(false);
const isResolving = ref(true);
const resumeErrorMessage = ref('');

const isBusy = computed(() => isResolving.value || classroomStore.loading);
const hasNoLesson = computed(() => resumeAttempted.value && !resumeErrorMessage.value);
const title = computed(() => {
  if (resumeErrorMessage.value) return 'Unable to resume this classroom';
  if (hasNoLesson.value) return 'No lesson is ready for this classroom';
  return 'Preparing your last lesson';
});
const description = computed(() => {
  if (resumeErrorMessage.value) return resumeErrorMessage.value;
  if (hasNoLesson.value) return 'The class is enrolled, but the backend did not return a lesson. Start the first available lesson or retry after reseeding.';
  return 'We are finding your most recent learning position and will redirect automatically.';
});

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message || 'Failed to resume classroom' : 'Failed to resume classroom');

const navigateToLesson = async (lessonId: string) => {
  await navigateTo(`/classroom/${classId}/${lessonId}`, { replace: true });
};

const resumeClassroom = async () => {
  resumeAttempted.value = false;
  resumeErrorMessage.value = '';
  isResolving.value = true;

  try {
    const lesson = await classroomStore.resume(classId);
    if (lesson) {
      await navigateToLesson(lesson.id);
      return;
    }

    resumeAttempted.value = true;
  } catch (error) {
    resumeAttempted.value = true;
    resumeErrorMessage.value = getErrorMessage(error);
  } finally {
    isResolving.value = false;
  }
};

const startFirstLesson = async () => {
  resumeErrorMessage.value = '';
  isResolving.value = true;

  try {
    const firstLesson = await classroomStore.startFirstLesson(classId);
    if (firstLesson) {
      await navigateToLesson(firstLesson.id);
      return;
    }

    resumeAttempted.value = true;
  } catch (error) {
    resumeAttempted.value = true;
    resumeErrorMessage.value = getErrorMessage(error);
  } finally {
    isResolving.value = false;
  }
};

onMounted(resumeClassroom);
</script>

<template>
  <ClassroomLoadingState v-if="isBusy && !resumeAttempted && !resumeErrorMessage" />

  <main v-else class="grid min-h-screen place-items-center bg-background p-6">
    <section class="max-w-xl rounded-4xl border bg-card p-8 text-center shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Classroom resume</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-foreground">{{ title }}</h1>
      <p class="mt-3 text-sm text-muted-foreground">{{ description }}</p>

      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button class="rounded-full" :disabled="isBusy" @click="resumeClassroom">Retry resume</Button>
        <Button class="rounded-full" variant="outline" :disabled="isBusy" @click="startFirstLesson">Start first lesson</Button>
        <Button class="rounded-full" variant="ghost" :disabled="isBusy" @click="navigateTo('/public/learning')">Back</Button>
      </div>
    </section>
  </main>
</template>
