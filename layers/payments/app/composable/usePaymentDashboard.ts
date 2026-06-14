import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { AdminTransactionItem, MentorRevenueMetrics, PurchaseHistoryItem } from '../../types';
import type { MaybeRef } from 'vue';

export function useMyPurchases(enabled: MaybeRef<boolean> = true) {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.PAYMENT_PURCHASES],
    queryFn: async () => {
      const response = await http<TResponse<PurchaseHistoryItem[]>>(ENDPOINT.PAYMENTS.MY_PURCHASES, { method: 'GET' });
      return response.data;
    },
    enabled: computed(() => unref(enabled)),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useMentorRevenue() {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.PAYMENT_MENTOR_REVENUE],
    queryFn: async () => {
      const response = await http<TResponse<MentorRevenueMetrics>>(ENDPOINT.PAYMENTS.MENTOR_REVENUE, { method: 'GET' });
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useAdminTransactions(enabled: MaybeRef<boolean> = true) {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.PAYMENT_ADMIN_TRANSACTIONS],
    queryFn: async () => {
      const response = await http<TResponse<AdminTransactionItem[]>>(ENDPOINT.PAYMENTS.ADMIN_TRANSACTIONS, { method: 'GET' });
      return response.data;
    },
    enabled: computed(() => unref(enabled)),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
