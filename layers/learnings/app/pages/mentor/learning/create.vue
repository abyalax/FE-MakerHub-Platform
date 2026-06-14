<script setup lang="ts">
import Page from '~/layers/shared/app/components/layouts/Page.vue';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import LearningForm from '../../../components/LearningForm.vue';
import { useCreateLearning } from '../../../composable/useLearningMutations';
import type { CreateLearningPayload } from '../../../../types';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.LEARNING.CREATE],
});

const createLearning = useCreateLearning();

const breadcrumbs = [
  { title: 'Learning', url: '/mentor/learning', active: false },
  { title: 'Create', url: '/mentor/learning/create', active: true },
];

const submit = async (payload: CreateLearningPayload) => {
  await createLearning.mutateAsync(payload);
  await navigateTo('/mentor/learning');
};
</script>

<template>
  <Page title="Create Learning" :breadcrumbs="breadcrumbs">
    <template #children>
      <LearningForm :submitting="createLearning.isPending.value" @submit="submit" @cancel="navigateTo('/mentor/learning')" />
    </template>
  </Page>
</template>
