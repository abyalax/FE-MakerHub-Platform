<script setup lang="ts">
import { TrashIcon } from 'lucide-vue-next';
import { defineComponent, h } from 'vue';
import { Table } from '~/layers/shared/app/components/fragments/table';
import type { BulkAction } from '~~/layers/shared/app/components/fragments/table';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import ProjectTableTopActions from './ProjectTableTopActions.vue';
import { useColumnProjects } from '~/layers/projects/app/composable/useColumnProjects';
import { useFilterProjects } from '../composable/useFilterProjects.js';
import { useTableStateProjects } from '../composable/useTableStateProjects';
import { useGetProjects } from '../composable/useGetProjects';
import type { Project } from '../../types/index';
import ProjectExpandedRow from './ProjectExpandedRow.vue';

const { queryParams, state, menuFilter, search } = useFilterProjects();
const { has } = usePermission();
const crud = useTableStateProjects();

const { data, isFetching, refetch } = useGetProjects(queryParams);

const canCreate = computed(() => has(PERMISSIONS.PROJECT.CREATE));
const canUpdate = computed(() => has(PERMISSIONS.PROJECT.UPDATE));
const canDelete = computed(() => has(PERMISSIONS.PROJECT.DELETE));

const serverRows = computed<Project[]>(() =>
  (data.value?.data ?? []).map((project) => ({
    ...project,
    isNewRow: false,
  }))
);

const tableData = computed(() => ({
  meta: data.value?.meta,
  links: data.value?.links,
  data: [...crud.localRows.value, ...serverRows.value],
}));

const selectedRowsModel = computed({
  get: () => crud.selectedRows.value,
  set: (value: Project[]) => {
    crud.selectedRows.value = value;
  },
});

const bulkActions: BulkAction<Project>[] = [
  {
    label: 'Delete Selected',
    icon: TrashIcon,
    disabled: () => !canDelete.value,
    onClick: async () => {
      await crud.handleBulkDelete();
    },
  },
];

const columns = computed(() =>
  useColumnProjects({
    canDelete: canDelete.value,
    canUpdate: canUpdate.value,
    crud,
    lifecycleLoading: crud.lifecycleLoading,
    onPublish: crud.publishProject,
    onUnpublish: crud.unpublishProject,
  })
);

const TopActions = defineComponent({
  setup() {
    return () =>
      h(ProjectTableTopActions, {
        canCreate: canCreate.value,
        canUpdate: canUpdate.value,
        canDelete: canDelete.value,
        isFetching: isFetching.value,
        crud,
        onRefresh: refetch,
      });
  },
});

const handleExpandedRow = (project: Project) => {
  return h(ProjectExpandedRow, { project });
};
</script>

<template>
  <Table
    v-model:filter="state"
    v-model:selected="selectedRowsModel"
    v-model:search="search"
    :data="tableData"
    :columns="columns"
    :column-ids="[
      'select',
      'id',
      'title',
      'slug',
      'coverUrl',
      'category',
      'mentor',
      'price',
      'status',
      'accessType',
      'publishedAt',
      'tocJson',
      'actions',
    ]"
    :bulk-actions="bulkActions"
    :top-actions="TopActions"
    :expanded-row="handleExpandedRow"
    :initial-column-visibility="{
      select: true,
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      category: true,
      mentor: true,
      price: true,
      status: true,
      accessType: true,
      publishedAt: true,
      tocJson: true,
      actions: true,
    }"
    :menu-filter="menuFilter"
    :pagination="true"
  />
</template>
