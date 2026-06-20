<script setup lang="ts">
/**
 * PermissionGuard component - Conditional rendering wrapper
 *
 * Usage:
 *   <PermissionGuard permission="user:delete">
 *     <button @click="deleteUser">Delete</button>
 *     <template #fallback>
 *       <p>No permission</p>
 *     </template>
 *   </PermissionGuard>
 *
 *   <PermissionGuard :permissions="[PERMISSIONS.EVENT.CREATE, PERMISSIONS.EVENT.PUBLISH]" require-all>
 *     <form>...</form>
 *   </PermissionGuard>
 */

import type { PermissionGuardProps } from '../types';

const props = withDefaults(defineProps<PermissionGuardProps>(), {
  requireAll: false,
  fallback: false,
  permission: undefined,
  permissions: undefined,
});

const { has, hasAll, hasAny } = usePermission();

const isAuthorized = computed(() => {
  const perms = props.permissions || (props.permission ? [props.permission] : []);

  if (perms.length === 0) return true;

  if (props.requireAll) {
    return hasAll(perms);
  } else {
    return perms.length === 1 ? has(perms[0]) : hasAny(perms);
  }
});
</script>
<template>
  <div v-if="isAuthorized">
    <slot />
  </div>
  <div v-else-if="fallback">
    <slot name="fallback" />
  </div>
</template>
