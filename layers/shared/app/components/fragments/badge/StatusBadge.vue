<script setup lang="ts">
import { computed } from 'vue';

/**
 * Define the named model for the status value.
 */
const status = defineModel<string>('status', { default: '' });

interface Props {
  /**
   * Optional custom mapping to override or add new status styles.
   * This makes the component truly reusable across different modules.
   */
  customStyles?: Record<string, string>;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  customStyles: () => ({}),
  className: '',
});

const defaultStyles: Record<string, string> = {
  draft: 'border-border bg-muted text-muted-foreground',
  published: 'border-primary bg-primary text-primary-foreground',
  cancelled: 'border-destructive bg-destructive text-destructive-foreground',
  completed: 'border-primary bg-primary text-primary-foreground',
  pending: 'border-accent bg-accent text-accent-foreground',
};

const badgeClass = computed(() => {
  const key = status.value?.toLowerCase() ?? '';
  // Merge default styles with custom styles from props
  const styles = { ...defaultStyles, ...props.customStyles };
  return styles[key] ?? 'border-border bg-secondary text-secondary-foreground';
});
</script>

<template>
  <span :class="['inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize transition-colors', badgeClass, className]">
    <!-- Slot allows for icons or custom text formatting -->
    <slot>
      {{ status }}
    </slot>
  </span>
</template>
