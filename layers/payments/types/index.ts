import type { Order } from '~/layers/orders/types';

export interface Payment {
  id: string;
  orderId: string;
  externalId: string;
  amount: number;
  status: string;
  paidAt?: Date | null | undefined;
  createdAt: Date;
  order: Order;
}

export interface ClassCheckout {
  orderId: string;
  orderNumber: string;
  checkoutUrl?: string;
  status: string;
  amount: number;
  currency: string;
  expiredAt?: string | null;
}

export interface PurchaseHistoryItem {
  id: string;
  orderNumber?: string;
  classId?: string;
  classTitle?: string;
  amount: number;
  currency: string;
  status: string;
  checkoutUrl?: string;
  purchaseDate: string;
  createdAt: string;
}

export interface MentorRevenueMetrics {
  totalSales: number;
  revenueToday: number;
  revenueMonthly: number;
  revenueLifetime: number;
  enrollmentCount: number;
}

export interface AdminTransactionItem extends PurchaseHistoryItem {
  learner?: { id: string; name: string; email: string } | null;
  class?: { id: string; title: string; mentor?: string } | null;
  providerInvoiceId?: string;
}
