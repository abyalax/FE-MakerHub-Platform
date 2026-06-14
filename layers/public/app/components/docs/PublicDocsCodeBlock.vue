<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next';
import { ref } from 'vue';
import { Button } from '~/layers/shared/app/components/ui/button';

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
  }>(),
  {
    language: 'text',
  },
);

const copied = ref(false);

async function copyCode() {
  if (!import.meta.client) return;

  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1400);
}
</script>

<template>
  <div class="overflow-hidden rounded-md border bg-muted/40">
    <div class="flex h-10 items-center justify-between border-b px-3">
      <span class="text-xs font-medium text-muted-foreground">{{ language }}</span>

      <Button type="button" variant="ghost" size="icon-sm" :aria-label="copied ? 'Copied' : 'Copy code'" @click="copyCode">
        <Check v-if="copied" class="size-4" />
        <Copy v-else class="size-4" />
      </Button>
    </div>

    <pre class="overflow-x-auto p-4 text-xs leading-6 text-foreground"><code>{{ code }}</code></pre>
  </div>
</template>
