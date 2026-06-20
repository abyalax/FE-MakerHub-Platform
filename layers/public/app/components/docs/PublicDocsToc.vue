<script setup lang="ts">
import type { PublicDocsTocGroup } from '~/layers/public/types';

defineProps<{
  title: string;
  versionLabel?: string;
  groups: PublicDocsTocGroup[];
}>();

const emit = defineEmits<{
  select: [item: PublicDocsTocGroup['items'][number]];
}>();

function selectItem(event: MouseEvent, item: PublicDocsTocGroup['items'][number]) {
  if (!item.tabValue) return;

  event.preventDefault();
  emit('select', item);
}
</script>

<template>
  <aside class="hidden xl:block">
    <div class="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto border-r pr-6">
      <div class="space-y-1 pb-4">
        <p class="text-sm font-semibold tracking-tight text-foreground">{{ title }}</p>
        <p v-if="versionLabel" class="text-xs text-muted-foreground">{{ versionLabel }}</p>
      </div>

      <nav class="space-y-4 text-sm">
        <section v-for="group in groups" :key="group.title">
          <details :open="!group.collapsible" class="group space-y-2">
            <summary
              class="flex cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground [&::-webkit-details-marker]:hidden"
            >
              <span>{{ group.title }}</span>
              <span v-if="group.collapsible" class="text-muted-foreground transition-transform group-open:rotate-90">›</span>
            </summary>

            <ul class="mt-2 space-y-1">
              <li v-for="item in group.items" :key="item.href">
                <a
                  :href="item.href"
                  class="block border-l-2 py-1.5 pl-3 transition-colors hover:border-primary hover:text-foreground"
                  :class="item.active ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground'"
                  @click="selectItem($event, item)"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </details>
        </section>
      </nav>
    </div>
  </aside>
</template>
