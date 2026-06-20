<script setup lang="ts">
import { computed } from 'vue';
import type { JSONContent } from '@tiptap/vue-3';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Menu, PlayCircle, Save } from 'lucide-vue-next';
import { useClassroomStore } from '~/layers/learnings/app/composable/useClassroomStore';
import { Badge } from '~/layers/shared/app/components/ui/badge';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Card, CardContent } from '~/layers/shared/app/components/ui/card';
import { Progress } from '~/layers/shared/app/components/ui/progress';

const emit = defineEmits<{
  openRoadmap: [];
  previous: [];
  next: [];
  complete: [];
}>();

const classroomStore = useClassroomStore();

const lesson = computed(() => classroomStore.activeLesson);
const status = computed(() => (lesson.value ? classroomStore.getLessonStatus(lesson.value.id) : 'NOT_STARTED'));
const isCompleted = computed(() => status.value === 'COMPLETED');
const sectionTrail = computed(() => {
  const active = classroomStore.activeFlatLesson;
  if (!active) return 'Learning path';
  return `${active.projectTitle} / ${active.sectionTitle}`;
});
const lessonPosition = computed(() => {
  const active = classroomStore.activeFlatLesson;
  if (!active) return 'Lesson';
  return `Lesson ${active.index + 1} of ${classroomStore.flatLessons.length}`;
});

type LessonContentBlock = {
  key: string;
  type: 'heading' | 'paragraph' | 'bulletList' | 'orderedList' | 'blockquote' | 'codeBlock' | 'horizontalRule' | 'image';
  text?: string;
  id?: string;
  level?: number;
  items?: string[];
  src?: string;
  alt?: string;
};

const getNodeText = (node: JSONContent): string => {
  if (typeof node.text === 'string') return node.text;
  return node.content?.map(getNodeText).join('') ?? '';
};

const toHeadingId = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

const createHeadingId = (title: string, usedIds: Map<string, number>) => {
  const baseId = toHeadingId(title);
  const nextCount = (usedIds.get(baseId) ?? 0) + 1;
  usedIds.set(baseId, nextCount);
  return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
};

const renderedContentBlocks = computed<LessonContentBlock[]>(() => {
  const nodes = lesson.value?.section?.project?.contentJson?.content ?? [];
  const usedIds = new Map<string, number>();

  return nodes
    .map((node, index): LessonContentBlock | null => {
      const key = `${node.type ?? 'node'}-${index}`;
      const text = getNodeText(node).trim();

      if (node.type === 'heading' && text) {
        return {
          key,
          type: 'heading',
          id: createHeadingId(text, usedIds),
          level: typeof node.attrs?.level === 'number' ? node.attrs.level : 1,
          text,
        };
      }

      if (node.type === 'paragraph' && text) return { key, type: 'paragraph', text };
      if (node.type === 'blockquote' && text) return { key, type: 'blockquote', text };
      if (node.type === 'codeBlock' && text) return { key, type: 'codeBlock', text };
      if (node.type === 'horizontalRule') return { key, type: 'horizontalRule' };

      if ((node.type === 'bulletList' || node.type === 'orderedList') && node.content?.length) {
        return {
          key,
          type: node.type,
          items: node.content
            .map(getNodeText)
            .map((item) => item.trim())
            .filter(Boolean),
        };
      }

      if (node.type === 'image' && typeof node.attrs?.src === 'string') {
        return {
          key,
          type: 'image',
          src: node.attrs.src,
          alt: typeof node.attrs?.alt === 'string' ? node.attrs.alt : lesson.value?.title,
        };
      }

      return null;
    })
    .filter((block): block is LessonContentBlock => Boolean(block));
});
</script>

<template>
  <main class="flex h-full min-h-0 flex-col overflow-hidden rounded-4xl border bg-card text-card-foreground shadow-sm">
    <header class="border-b bg-card/80 px-4 py-3 backdrop-blur md:px-6">
      <div class="flex items-center justify-between gap-3">
        <Button variant="outline" size="icon" class="lg:hidden" aria-label="Open course structure" @click="emit('openRoadmap')">
          <Menu class="size-4" />
        </Button>

        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold uppercase tracking-[0.2em] text-primary">{{ sectionTrail }}</p>
          <h2 class="mt-1 truncate text-lg font-bold text-foreground md:text-xl">{{ lesson?.title ?? 'Lesson' }}</h2>
        </div>

        <div class="hidden items-center gap-2 md:flex">
          <Badge variant="outline" class="rounded-full bg-background px-3">{{ lessonPosition }}</Badge>
          <Badge :variant="isCompleted ? 'default' : 'secondary'" class="rounded-full px-3">
            {{ isCompleted ? 'Completed' : 'Autosaving' }}
          </Badge>
        </div>
      </div>

      <div class="mt-3 flex items-center gap-3">
        <Progress :model-value="classroomStore.classProgressPercent" class="h-1.5 bg-muted" />
        <span class="text-xs font-semibold text-muted-foreground">{{ classroomStore.classProgressPercent }}%</span>
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto bg-muted/40">
      <div v-if="lesson" class="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
        <section v-if="lesson.videoAsset?.publicUrl" class="overflow-hidden rounded-4xl border bg-primary shadow-2xl">
          <video :src="lesson.videoAsset.publicUrl" controls class="aspect-video w-full" />
        </section>

        <section v-else class="grid min-h-70 place-items-center rounded-4xl border bg-primary p-8 text-center text-primary-foreground shadow-2xl">
          <div>
            <PlayCircle class="mx-auto size-14 text-primary-foreground/80" />
            <h3 class="mt-5 text-2xl font-bold">Text-first lesson</h3>
            <p class="mt-2 max-w-md text-sm text-primary-foreground/70">
              No video asset is attached yet. Learners can continue through the written module below.
            </p>
          </div>
        </section>

        <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <article class="rounded-4xl border bg-card p-5 shadow-sm md:p-8">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-primary">{{ lessonPosition }}</p>
                <h1 class="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">{{ lesson.title }}</h1>
              </div>
              <FileText class="mt-1 size-7 shrink-0 text-muted-foreground" />
            </div>

            <div v-if="renderedContentBlocks.length" class="space-y-5 text-base leading-8 text-foreground">
              <template v-for="block in renderedContentBlocks" :key="block.key">
                <component
                  :is="block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4'"
                  v-if="block.type === 'heading'"
                  :id="block.id"
                  class="scroll-mt-24 font-semibold tracking-tight text-foreground"
                  :class="block.level === 1 ? 'text-2xl' : block.level === 2 ? 'text-xl' : 'text-lg'"
                >
                  {{ block.text }}
                </component>

                <p v-else-if="block.type === 'paragraph'" class="whitespace-pre-line">
                  {{ block.text }}
                </p>

                <blockquote v-else-if="block.type === 'blockquote'" class="border-l-2 pl-4 italic">
                  {{ block.text }}
                </blockquote>

                <pre
                  v-else-if="block.type === 'codeBlock'"
                  class="overflow-x-auto rounded-2xl bg-muted p-4 text-sm text-foreground"
                ><code>{{ block.text }}</code></pre>

                <hr v-else-if="block.type === 'horizontalRule'" class="border-border" />

                <ul v-else-if="block.type === 'bulletList'" class="list-disc space-y-2 pl-5">
                  <li v-for="item in block.items" :key="item">{{ item }}</li>
                </ul>

                <ol v-else-if="block.type === 'orderedList'" class="list-decimal space-y-2 pl-5">
                  <li v-for="item in block.items" :key="item">{{ item }}</li>
                </ol>

                <img v-else-if="block.type === 'image' && block.src" :src="block.src" :alt="block.alt" class="rounded-2xl border" />
              </template>
            </div>

            <!-- <div v-else-if="lesson.content" class="whitespace-pre-wrap text-base leading-8 text-foreground">
              {{ lesson.content }}
            </div> -->

            <p v-else class="rounded-2xl border border-dashed bg-muted p-5 text-sm text-muted-foreground">
              Lesson content has not been added yet. The classroom shell still keeps navigation, progress, and completion controls available.
            </p>
          </article>

          <aside class="space-y-4">
            <Card class="rounded-4xl shadow-sm">
              <CardContent class="p-5">
                <div class="flex items-center gap-3">
                  <span class="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Save class="size-5" />
                  </span>
                  <div>
                    <h2 class="font-bold text-foreground">Progress saved</h2>
                    <p class="text-sm text-muted-foreground">
                      {{ classroomStore.saving ? 'Saving current position...' : 'Synced with classroom state' }}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card class="rounded-4xl bg-primary text-primary-foreground shadow-sm">
              <CardContent class="p-5">
                <p class="text-sm font-medium text-primary-foreground/70">Up next</p>
                <h3 class="mt-2 text-lg font-bold">{{ classroomStore.nextLesson?.title ?? 'Final lesson reached' }}</h3>
                <p class="mt-3 text-sm text-primary-foreground/70">
                  {{
                    classroomStore.nextLesson
                      ? 'Complete this lesson or continue when ready.'
                      : 'Complete this lesson to finish the available sequence.'
                  }}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>

    <footer class="border-t bg-card px-4 py-3 md:px-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button variant="outline" class="justify-center rounded-full" :disabled="!classroomStore.previousLesson" @click="emit('previous')">
          <ArrowLeft class="size-4" />
          Previous
        </Button>

        <Button class="rounded-full px-6" :disabled="classroomStore.completing || isCompleted" @click="emit('complete')">
          <CheckCircle2 class="size-4" />
          {{ isCompleted ? 'Lesson Completed' : classroomStore.completing ? 'Completing...' : 'Mark Complete' }}
        </Button>

        <Button class="justify-center rounded-full" :disabled="!classroomStore.nextLesson" @click="emit('next')">
          Next
          <ArrowRight class="size-4" />
        </Button>
      </div>
    </footer>
  </main>
</template>
