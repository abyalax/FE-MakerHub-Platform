<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ArrowDown, ArrowUp, Check, X } from 'lucide-vue-next';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { ContentStatus, ClassType } from '~/layers/shared/app/common/enum';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/layers/shared/app/components/ui/select';
import { Badge } from '~/layers/shared/app/components/ui/badge';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Category, Project } from '~/layers/projects/types';
import type { CreateLearningPayload, LearningClass } from '../../types';

const props = defineProps<{
  initial?: LearningClass | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreateLearningPayload];
  cancel: [];
}>();

const http = useHttp();

const title = ref('');
const description = ref('');
const categoryId = ref<number | null>(null);
const coverAssetId = ref('');
const classType = ref<ClassType>(ClassType.FREE);
const selectedProjectIds = ref<string[]>([]);

const { data: categories } = useQuery({
  queryKey: ['learning-categories'],
  queryFn: async () => {
    const response = await http<TResponse<Category[]>>(ENDPOINT.PROJECTS.LIST_CATEGORIES, { method: 'GET' });
    return response.data;
  },
  staleTime: 60_000,
});

const { data: projectsData } = useQuery({
  queryKey: ['learning-owned-projects'],
  queryFn: async () => {
    const response = await http<TResponse<Paginated<Project>>>(ENDPOINT.PROJECTS.LIST_MINE, {
      method: 'GET',
      query: { page: 1, limit: 100 },
    });
    return response.data;
  },
  staleTime: 0,
});

const publishedProjects = computed(() => (projectsData.value?.data ?? []).filter((project) => project.status === ContentStatus.PUBLISHED));

const selectedProjects = computed(() =>
  selectedProjectIds.value
    .map((id) => publishedProjects.value.find((project) => String(project.id) === id))
    .filter((project): project is Project => Boolean(project))
);

const resetFromInitial = () => {
  const learning = props.initial;
  title.value = learning?.title ?? '';
  description.value = learning?.description ?? '';
  categoryId.value = learning?.categoryId ?? learning?.category?.id ?? null;
  coverAssetId.value = learning?.coverAssetId ?? '';
  classType.value = learning?.classType ?? ClassType.FREE;
  selectedProjectIds.value = [...(learning?.projects ?? [])].sort((left, right) => left.sortOrder - right.sortOrder).map((item) => item.projectId);
};

watch(() => props.initial, resetFromInitial, { immediate: true });

const toggleProject = (projectId: string) => {
  if (selectedProjectIds.value.includes(projectId)) {
    selectedProjectIds.value = selectedProjectIds.value.filter((id) => id !== projectId);
    return;
  }

  selectedProjectIds.value = [...selectedProjectIds.value, projectId];
};

const moveProject = (projectId: string, direction: -1 | 1) => {
  const index = selectedProjectIds.value.indexOf(projectId);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= selectedProjectIds.value.length) return;

  const next = [...selectedProjectIds.value];
  const current = next[index] ?? projectId;
  const target = next[targetIndex] ?? projectId;
  next[index] = target;
  next[targetIndex] = current;
  selectedProjectIds.value = next;
};

const submit = () => {
  if (!categoryId.value || !title.value.trim() || !description.value.trim() || selectedProjectIds.value.length === 0) return;

  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    categoryId: categoryId.value,
    coverAssetId: coverAssetId.value.trim() || undefined,
    classType: classType.value,
    projects: selectedProjectIds.value.map((projectId, sortOrder) => ({ projectId, sortOrder })),
  } as CreateLearningPayload);
};

const reset = () => {
  title.value = '';
  description.value = '';
  categoryId.value = null;
  coverAssetId.value = '';
  classType.value = ClassType.FREE;
  selectedProjectIds.value = [];
};

defineExpose({
  submit,
  reset,
});
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Title</label>
          <Input v-model="title" :disabled="submitting" placeholder="IoT fundamentals" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Description</label>
          <textarea
            v-model="description"
            :disabled="submitting"
            rows="6"
            class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-36 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe the learning path and what learners will build."
          />
        </div>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Category</label>
          <Select v-model="categoryId" :disabled="submitting">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in categories ?? []" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Type</label>
          <Select v-model="classType" :disabled="submitting">
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="ClassType.FREE">Free</SelectItem>
              <SelectItem :value="ClassType.PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Cover asset ID</label>
          <Input v-model="coverAssetId" :disabled="submitting" placeholder="Optional media UUID" />
        </div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <section class="rounded-md border">
        <div class="border-b px-4 py-3">
          <h2 class="text-sm font-semibold">Published projects</h2>
        </div>

        <div class="max-h-96 divide-y overflow-y-auto">
          <button
            v-for="project in publishedProjects"
            :key="project.id"
            type="button"
            class="flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-accent"
            @click="toggleProject(String(project.id))"
          >
            <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border">
              <Check v-if="selectedProjectIds.includes(String(project.id))" class="size-3.5" />
            </span>
            <span class="min-w-0">
              <span class="block truncate font-medium">{{ project.title }}</span>
              <span class="block truncate text-muted-foreground">{{ project.category?.name ?? 'Uncategorized' }}</span>
            </span>
          </button>

          <p v-if="!publishedProjects.length" class="px-4 py-8 text-center text-sm text-muted-foreground">
            Publish at least one project before creating a learning path.
          </p>
        </div>
      </section>

      <section class="rounded-md border">
        <div class="border-b px-4 py-3">
          <h2 class="text-sm font-semibold">Learning path order</h2>
        </div>

        <div class="max-h-96 divide-y overflow-y-auto">
          <div v-for="(project, index) in selectedProjects" :key="project.id" class="flex items-center gap-3 px-4 py-3">
            <Badge variant="secondary" class="w-9 justify-center">{{ index + 1 }}</Badge>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ project.title }}</p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" :disabled="index === 0" @click="moveProject(String(project.id), -1)">
              <ArrowUp class="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              :disabled="index === selectedProjects.length - 1"
              @click="moveProject(String(project.id), 1)"
            >
              <ArrowDown class="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" @click="toggleProject(String(project.id))">
              <X class="size-4" />
            </Button>
          </div>

          <p v-if="!selectedProjects.length" class="px-4 py-8 text-center text-sm text-muted-foreground">Select one or more published projects.</p>
        </div>
      </section>
    </div>

    <div class="flex justify-end gap-2">
      <Button type="button" variant="outline" :disabled="submitting" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" :disabled="submitting || !categoryId || !title || !description || !selectedProjectIds.length">
        {{ submitting ? 'Saving...' : 'Save learning' }}
      </Button>
    </div>
  </form>
</template>
