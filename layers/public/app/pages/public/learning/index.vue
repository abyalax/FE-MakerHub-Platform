<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/layers/shared/app/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '~/layers/shared/app/components/ui/card';
import { Badge } from '~/layers/shared/app/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '~/layers/shared/app/components/ui/pagination';
import { useFilter } from '~/layers/shared/app/composable/filters/useFilter';
import { useGetPublicLearnings } from '~/layers/learnings/app/composable/useGetPublicLearnings';
import { ClassType, ContentStatus } from '~/layers/shared/app/common/enum';

const { state, queryParams, search, filterRefs, resetFilters } = useFilter({
  storeKey: 'TableFilterPublicLearnings',
  filterFields: ['category', 'type'],
  syncUrl: true,
});

const publicQueryParams = computed(() => ({
  ...queryParams.value,
  category: queryParams.value.category ?? undefined,
}));

const { data } = useGetPublicLearnings(publicQueryParams);

const learnings = computed(() => data.value?.data ?? []);
const pagination = computed(() => data.value?.meta);

const totalPages = computed(() => pagination.value?.totalPages ?? 1);
const currentPage = computed(() => pagination.value?.currentPage ?? state.value.page ?? 1);

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  state.value.page = page;
}
</script>

<template>
  <section class="container py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium text-primary">Learning Paths</p>

        <h1 class="mt-2 text-3xl font-bold tracking-tight text-foreground">Explore learning paths</h1>

        <p class="mt-2 max-w-2xl text-muted-foreground">
          Structured learning journeys curated by mentors to help you master skills through projects.
        </p>
      </div>

      <Button variant="outline" @click="resetFilters"> Reset filters </Button>
    </div>

    <div class="mb-6 grid gap-3 md:grid-cols-[1fr_220px_180px]">
      <Input v-model="search" type="search" placeholder="Search learning paths..." />

      <Select v-model="filterRefs.type.value">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="All types" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem :value="undefined">All types</SelectItem>
          <SelectItem :value="ClassType.FREE">Free</SelectItem>
          <SelectItem :value="ClassType.PAID">Paid</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="learnings.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="learning in learnings" :key="learning.id" class="overflow-hidden pt-0">
        <div class="relative aspect-video bg-muted">
          <img v-if="learning.coverUrl" :src="learning.coverUrl" :alt="learning.title" class="h-full w-full object-cover" />

          <div v-else class="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No cover image</div>

          <div class="absolute left-3 top-3 flex gap-2">
            <Badge variant="secondary">
              {{ learning.category?.name ?? 'Uncategorized' }}
            </Badge>

            <Badge :variant="learning.classType === ClassType.PAID ? 'default' : 'secondary'">
              {{ learning.classType === ClassType.PAID ? 'Paid' : 'Free' }}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <h2 class="line-clamp-2 text-lg font-semibold tracking-tight">
            {{ learning.title }}
          </h2>

          <p class="line-clamp-2 text-sm text-muted-foreground">
            {{ learning.description }}
          </p>
        </CardHeader>

        <CardContent>
          <div class="flex items-center justify-between gap-3 text-sm">
            <div class="min-w-0">
              <p class="truncate font-medium">
                {{ learning.mentor.name ?? 'Unknown mentor' }}
              </p>

              <p class="truncate text-muted-foreground">
                {{ learning.mentor?.headline ?? 'Mentor' }}
              </p>
            </div>

            <p class="shrink-0 font-semibold">{{ learning.projectCount }} projects</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button as-child class="w-full">
            <NuxtLink :to="`/public/learning/${learning?.category?.slug}/${learning?.slug}`"> Start learning </NuxtLink>
          </Button>
        </CardFooter>
      </Card>
    </div>

    <Card v-else class="border-dashed">
      <CardContent class="p-10 text-center">
        <h2 class="text-lg font-semibold">No learning paths found</h2>

        <p class="mt-2 text-sm text-muted-foreground">Try changing your search keyword or filters.</p>
      </CardContent>
    </Card>

    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground">Page {{ currentPage }} of {{ totalPages }}</p>

      <Pagination :page="currentPage" :total="pagination?.totalItems ?? 0" :items-per-page="pagination?.itemsPerPage ?? 10">
        <PaginationContent>
          <PaginationItem :value="Math.max(currentPage - 1, 1)">
            <PaginationPrevious href="#" :class="{ 'pointer-events-none opacity-50': currentPage <= 1 }" @click.prevent="goToPage(currentPage - 1)" />
          </PaginationItem>

          <PaginationItem v-for="page in totalPages" :key="page" :value="page">
            <Button :variant="page === currentPage ? 'default' : 'outline'" size="icon" @click="goToPage(page)">
              {{ page }}
            </Button>
          </PaginationItem>

          <PaginationItem :value="Math.min(currentPage + 1, totalPages)">
            <PaginationNext
              href="#"
              :class="{ 'pointer-events-none opacity-50': currentPage >= totalPages }"
              @click.prevent="goToPage(currentPage + 1)"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  </section>
</template>
