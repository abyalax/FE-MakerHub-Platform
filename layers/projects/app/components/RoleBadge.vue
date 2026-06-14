<script setup lang="ts">
defineProps<{ role: string }>();
</script>

<template>
  <span
    class="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
  >
    {{ role }}
  </span>
</template>
