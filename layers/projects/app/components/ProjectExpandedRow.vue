<script setup lang="ts">
import { computed, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import type { Project } from '../../types';

// Define props with TypeScript interface
const props = defineProps<{
  project: Project;
}>();

const emptyDoc = { type: 'doc', content: [] };

// Initialize Tiptap editor for rich text rendering (read-only mode)
const editor = useEditor({
  content: props.project.contentJson ?? emptyDoc,
  editable: false,
  extensions: [StarterKit],
});

watch(
  () => props.project.contentJson,
  (contentJson) => {
    editor.value?.commands.setContent(contentJson ?? emptyDoc);
  },
  { deep: true }
);

// Helper formatter for currency
const formattedPrice = computed(() => {
  const price = props.project.price;
  if (price === null || price === undefined || (typeof price === 'string' && price === '')) return '-';

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) return `${props.project.currency || ''} ${price}`.trim();

  if (numericPrice === 0) return 'Free';
  return `${props.project.currency || ''} ${numericPrice.toLocaleString('id-ID')}`.trim();
});

const mentorName = computed(() => props.project.mentor?.user?.name ?? props.project.mentor?.headline ?? '-');

const tocItems = computed(() => props.project.toc ?? props.project.tocJson ?? []);

const objectives = computed(() => props.project.objectives?.filter((objective) => objective.trim().length > 0) ?? []);

// Helper formatter for dates
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '-';
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '-';

  return parsedDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<template>
  <div class="space-y-6 rounded-lg border bg-muted/50 p-6">
    <div class="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
      <div>
        <h3 class="text-xl font-bold text-foreground">
          {{ project.title || 'New Project' }}
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">
          Slug: <span class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ project.slug || '-' }}</span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold uppercase text-primary-foreground">
          {{ project.status || '-' }}
        </span>
        <span class="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold uppercase text-secondary-foreground">
          {{ project.accessType || '-' }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
      <div class="space-y-1">
        <p><span class="font-medium text-foreground">Category:</span> {{ project.category?.name ?? '-' }}</p>
        <p><span class="font-medium text-foreground">Category Slug:</span> {{ project.category?.slug ?? '-' }}</p>
        <p><span class="font-medium text-foreground">Mentor:</span> {{ mentorName }}</p>
        <p><span class="font-medium text-foreground">Mentor ID:</span> {{ project.mentor?.id ?? '-' }}</p>
        <p><span class="font-medium text-foreground">Author:</span> {{ project.author?.name ?? '-' }}</p>
      </div>
      <div class="space-y-1">
        <p><span class="font-medium text-foreground">Price:</span> {{ formattedPrice }}</p>
        <p><span class="font-medium text-foreground">Currency:</span> {{ project.currency || '-' }}</p>
        <p>
          <span class="font-medium text-foreground">Cover:</span>
          <a v-if="project.coverUrl" :href="project.coverUrl" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline"
            >Open cover</a
          ><span v-else>-</span>
        </p>
        <p><span class="font-medium text-foreground">Sections:</span> {{ project.sections?.length ?? 0 }} Chapters</p>
        <p><span class="font-medium text-foreground">Assignments:</span> {{ project.assignments?.length ?? 0 }} items</p>
      </div>
      <div class="space-y-1">
        <p><span class="font-medium text-foreground">Published At:</span> {{ formatDate(project.publishedAt) }}</p>
        <p><span class="font-medium text-foreground">Created At:</span> {{ formatDate(project.createdAt) }}</p>
        <p><span class="font-medium text-foreground">Updated At:</span> {{ formatDate(project.updatedAt) }}</p>
      </div>
    </div>

    <div v-if="project.summary" class="rounded-md border bg-card p-4">
      <h4 class="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h4>
      <p class="text-sm leading-relaxed text-foreground">{{ project.summary }}</p>
    </div>

    <div v-if="objectives.length" class="rounded-md border bg-card p-4">
      <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Learning Objectives</h4>
      <ol class="space-y-2 text-sm text-foreground">
        <li v-for="(objective, index) in objectives" :key="objective" class="flex gap-2">
          <span class="font-mono text-xs text-muted-foreground">{{ index + 1 }}.</span>
          <span>{{ objective }}</span>
        </li>
      </ol>
    </div>

    <div v-if="project.description" class="rounded-md border bg-card p-4">
      <h4 class="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h4>
      <p class="text-sm leading-relaxed text-foreground">{{ project.description }}</p>
    </div>

    <div v-if="tocItems.length" class="rounded-md border bg-card p-4">
      <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table of Contents</h4>
      <ol class="space-y-1 text-sm text-foreground">
        <li v-for="item in tocItems" :key="item.id">
          <span class="font-mono text-xs text-muted-foreground">h{{ item.level }}</span>
          <span class="ml-2">{{ item.title }}</span>
        </li>
      </ol>
    </div>

    <div v-if="project.contentJson" class="rounded-md border bg-card p-4">
      <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Content</h4>
      <EditorContent :editor="editor" class="prose max-w-none text-sm text-foreground" />
    </div>
  </div>
</template>

<style scoped>
/* Basic styling for Tiptap structure if Tailwind Typography (prose) is not globally configured */
:deep(.tiptap) {
  outline: none;
}
:deep(.tiptap p) {
  margin-bottom: 0.5rem;
}
:deep(.tiptap h1, .tiptap h2, .tiptap h3) {
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
</style>
