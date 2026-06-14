<script setup lang="ts">
import { computed } from 'vue';
import { Edit, EyeOff, Plus, Send, Trash2 } from 'lucide-vue-next';
import Page from '~/layers/shared/app/components/layouts/Page.vue';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { ContentStatus, ClassType } from '~/layers/shared/app/common/enum';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Badge } from '~/layers/shared/app/components/ui/badge';
import { Card, CardContent } from '~/layers/shared/app/components/ui/card';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/layers/shared/app/components/ui/select';
import { useFilter } from '~/layers/shared/app/composable/filters/useFilter';
import { useGetLearnings } from '../../../composable/useGetLearnings';
import { useDeleteLearning, usePublishLearning, useUnpublishLearning } from '../../../composable/useLearningMutations';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.LEARNING.READ],
});

const { state, queryParams, search, filterRefs, resetFilters } = useFilter({
  storeKey: 'TableFilterLearning',
  filterFields: ['status', 'type', 'category'],
  syncUrl: true,
});

const { data, isFetching } = useGetLearnings(queryParams);
const deleteLearning = useDeleteLearning();
const publishLearning = usePublishLearning();
const unpublishLearning = useUnpublishLearning();

const learnings = computed(() => data.value?.data ?? []);
const pagination = computed(() => data.value?.meta);
const totalPages = computed(() => pagination.value?.totalPages ?? 1);
const currentPage = computed(() => pagination.value?.currentPage ?? state.value.page ?? 1);
const isBusy = computed(
  () => isFetching.value || deleteLearning.isPending.value || publishLearning.isPending.value || unpublishLearning.isPending.value
);

const breadcrumbs = [{ title: 'Learning', url: '/mentor/learning', active: false }];

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  state.value.page = page;
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>

<template>
  <Page title="Learning" :breadcrumbs="breadcrumbs">
    <template #children>
      <div class="space-y-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div class="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px_180px]">
            <Input v-model="search" type="search" placeholder="Search learning..." />

            <Select v-model="filterRefs.status.value">
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All status</SelectItem>
                <SelectItem :value="ContentStatus.DRAFT">Draft</SelectItem>
                <SelectItem :value="ContentStatus.PUBLISHED">Published</SelectItem>
                <SelectItem :value="ContentStatus.ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filterRefs.type.value">
              <SelectTrigger>
                <SelectValue placeholder="All type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All type</SelectItem>
                <SelectItem :value="ClassType.FREE">Free</SelectItem>
                <SelectItem :value="ClassType.PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" @click="resetFilters">Reset</Button>
            <Button as-child>
              <NuxtLink to="/mentor/learning/create">
                <Plus class="size-4" />
                Create
              </NuxtLink>
            </Button>
          </div>
        </div>

        <div class="rounded-md border">
          <div
            class="grid grid-cols-[minmax(0,1.4fr)_130px_110px_90px_120px_150px] gap-3 border-b px-4 py-3 text-sm font-medium text-muted-foreground"
          >
            <span>Learning</span>
            <span>Category</span>
            <span>Status</span>
            <span>Type</span>
            <span>Published</span>
            <span class="text-right">Actions</span>
          </div>

          <div v-if="learnings.length" class="divide-y">
            <div
              v-for="learning in learnings"
              :key="learning.id"
              class="grid grid-cols-[minmax(0,1.4fr)_130px_110px_90px_120px_150px] items-center gap-3 px-4 py-3"
            >
              <div class="min-w-0">
                <p class="truncate font-medium">{{ learning.title }}</p>
                <p class="truncate text-sm text-muted-foreground">{{ learning.projectCount }} projects · {{ learning.slug }}</p>
              </div>
              <span class="truncate text-sm">{{ learning.category?.name ?? '-' }}</span>
              <Badge :variant="learning.status === ContentStatus.PUBLISHED ? 'default' : 'secondary'" class="w-fit">{{ learning.status }}</Badge>
              <span class="text-sm">{{ learning.classType }}</span>
              <span class="text-sm text-muted-foreground">{{ formatDate(learning.publishedAt) }}</span>
              <div class="flex justify-end gap-1">
                <Button as-child variant="ghost" size="icon-sm">
                  <NuxtLink :to="`/mentor/learning/${learning.id}`">
                    <Edit class="size-4" />
                  </NuxtLink>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  :disabled="isBusy"
                  @click="learning.status === ContentStatus.PUBLISHED ? unpublishLearning.mutate(learning.id) : publishLearning.mutate(learning.id)"
                >
                  <EyeOff v-if="learning.status === ContentStatus.PUBLISHED" class="size-4" />
                  <Send v-else class="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-destructive hover:text-destructive"
                  :disabled="isBusy"
                  @click="deleteLearning.mutate(learning.id)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <Card v-else class="m-4 border-dashed">
            <CardContent class="p-8 text-center text-sm text-muted-foreground">No learning paths found.</CardContent>
          </Card>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-end gap-2">
          <Button variant="outline" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">Previous</Button>
          <span class="text-sm text-muted-foreground">Page {{ currentPage }} of {{ totalPages }}</span>
          <Button variant="outline" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">Next</Button>
        </div>
      </div>
    </template>
  </Page>
</template>
