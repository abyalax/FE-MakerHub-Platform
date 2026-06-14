import { useFilter } from '~/layers/shared/app/composable/filters/useFilter.js';
import FilterRoleUsers from '../components/filters/FilterRoleUsers.vue';

export function useFilterUsers() {
  const { state, filterRefs, queryParams, search } = useFilter({
    storeKey: 'TableFilterUsers',
    filterFields: ['role_id', 'is_active'],
    debounceSearch: 500,
    debounceFilters: 300,
    syncUrl: true,
  });

  const menuFilter = computed(() => [
    {
      component: FilterRoleUsers,
      props: {
        roleId: filterRefs.role_id.value,
        'onUpdate:roleId': (value: number | null) => {
          filterRefs.role_id.value = value;
        },
      },
    },
  ]);

  return {
    state,
    filterRefs,
    queryParams,
    search,
    menuFilter,
  };
}
