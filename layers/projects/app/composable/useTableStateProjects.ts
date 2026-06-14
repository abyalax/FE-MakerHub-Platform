import { useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useInlineCrud } from '~/layers/shared/app/composable/table/states/useInlineCrud';
import type { CreateProjectPayload, Project, UpdateProjectPayload } from '../../types';
import { AssetKind, AssetVisibility, ContentAccessType, ContentStatus } from '~/layers/shared/app/common/enum';
import { useCreateProject } from './useCreateProjects';
import { useUpdateProject } from './useUpdateProjects';
import { useDeleteProject } from './useDeleteProjects';
import { usePublishProject, useUnpublishProject } from './useProjectLifecycle';

export const useTableStateProjects = () => {
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const publishProjectMutation = usePublishProject();
  const unpublishProjectMutation = useUnpublishProject();
  const queryClient = useQueryClient();

  const crud = useInlineCrud<Project>({
    rowKey: 'id',
    maxNewRows: 5,
    maxSelectedRows: 5,

    createDefaultRow: () =>
      ({
        id: 0,
        mentorId: 0,
        authorId: '',
        categoryId: 0,
        coverAssetId: 0,
        coverUrl: '',
        title: '',
        slug: '',
        summary: '',
        description: '',
        objectives: [],
        accessType: ContentAccessType.FREE,
        status: ContentStatus.DRAFT,
        price: 0,
        currency: '',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        mentor: {
          id: 0,
          userId: '',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 0,
            name: '',
            email: '',
            roles: [],
            permissions: [],
          },
          projects: [],
          classes: [],
          revenueShareRules: [],
          payouts: [],
          trafficEvents: [],
        },
        author: {
          id: 0,
          name: '',
          email: '',
          roles: [],
          permissions: [],
        },
        category: {
          id: 0,
          name: '',
          slug: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          projects: [],
          classes: [],
        },
        coverAsset: {
          id: '',
          ownerId: '',
          bucket: '',
          objectKey: '',
          originalFileName: '',
          mimeType: '',
          originalName: '',
          size: 0,
          assetKind: AssetKind.COVER_IMAGE,
          visibility: AssetVisibility.PRIVATE,
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: {
            id: 0,
            name: '',
            email: '',
            roles: [],
            permissions: [],
          },
        },
        assets: [],
        assignments: [],
        bookmarks: [],
        classProjects: [],
        completionCriteria: [],
        entitlements: [],
        progress: [],
        sections: [],
        trafficEvents: [],
        isNewRow: true,
      }) as unknown as Project,

    onSave: async ({ created, updated }) => {
      try {
        for (const project of created) {
          const payload: CreateProjectPayload = {
            title: project.title,
            summary: project.summary,
            description: project.description,
            objectives: project.objectives,
            accessType: project.accessType,
            price: project.price,
            currency: project.currency,
            categoryId: project.categoryId,
          };
          await createProjectMutation.mutateAsync(payload);
        }

        for (const update of updated) {
          const payload: UpdateProjectPayload = {
            title: update.changes.title,
            summary: update.changes.summary,
            description: update.changes.description,
            objectives: update.changes.objectives,
            accessType: update.changes.accessType,
            price: update.changes.price,
            currency: update.changes.currency,
            categoryId: update.changes.categoryId,
          };

          await updateProjectMutation.mutateAsync({
            id: update.id,
            payload,
          });
        }

        await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
        return true;
      } catch (error) {
        console.error('Save projects failed:', error);
        return false;
      }
    },

    onDelete: async (rows) => {
      try {
        await Promise.all(rows.map((row) => deleteProjectMutation.mutateAsync(row.id)));
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
        return true;
      } catch (error) {
        console.error('Delete projects failed:', error);
        return false;
      }
    },
  });

  return {
    ...crud,
    publishProject: async (project: Project) => {
      await publishProjectMutation.mutateAsync(Number(project.id));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
    },
    unpublishProject: async (project: Project) => {
      await unpublishProjectMutation.mutateAsync(Number(project.id));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
    },
    lifecycleLoading: computed(() => publishProjectMutation.isPending.value || unpublishProjectMutation.isPending.value || crud.isLoading.value),
  };
};
