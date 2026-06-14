<script setup lang="ts">
import { computed } from 'vue';
import Page from '~/layers/shared/app/components/layouts/Page.vue';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import LearningForm from '../../../components/LearningForm.vue';
import { useGetLearning } from '../../../composable/useGetLearning';
import { useUpdateLearning } from '../../../composable/useLearningMutations';
import type { CreateLearningPayload } from '../../../../types';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.LEARNING.UPDATE],
});

const route = useRoute();
const id = computed(() => String(route.params.id ?? ''));
const { data: learning, isPending } = useGetLearning(id);
const updateLearning = useUpdateLearning();

const breadcrumbs = [
  { title: 'Learning', url: '/mentor/learning', active: false },
  { title: 'Edit', url: route.fullPath, active: true },
];

const submit = async (payload: CreateLearningPayload) => {
  await updateLearning.mutateAsync({ id: id.value, payload });
  await navigateTo('/mentor/learning');
};
</script>

<template>
  <Page title="Edit Learning" :breadcrumbs="breadcrumbs">
    <template #children>
      <div v-if="isPending" class="rounded-md border p-8 text-sm text-muted-foreground">Loading learning...</div>
      <LearningForm v-else :initial="learning" :submitting="updateLearning.isPending.value" @submit="submit" @cancel="navigateTo('/mentor/learning')" />
    </template>
  </Page>
</template>
