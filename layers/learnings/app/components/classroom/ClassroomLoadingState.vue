<script setup lang="ts">
import { Skeleton } from '~/layers/shared/app/components/ui/skeleton';
</script>

<template>
  <div class="min-h-screen bg-background p-4 lg:p-6">
    <div class="grid h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:p-0">
      <aside class="hidden rounded-4xl border bg-card p-5 shadow-sm lg:block">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="mt-4 h-3 w-full rounded-full" />
        <div class="mt-8 space-y-3">
          <Skeleton v-for="item in 8" :key="item" class="h-12 w-full rounded-2xl" />
        </div>
      </aside>

      <main class="rounded-4xl border bg-card p-5 shadow-sm">
        <Skeleton class="h-10 w-56" />
        <Skeleton class="mt-6 aspect-video w-full rounded-3xl" />
        <Skeleton class="mt-6 h-48 w-full rounded-3xl" />
      </main>
    </div>
  </div>
</template>
