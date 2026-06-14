<script setup lang="ts">
import Page from '~/layers/shared/app/components/layouts/Page.vue';
import { Badge } from '~/layers/shared/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/layers/shared/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/layers/shared/app/components/ui/table';
import { useAdminTransactions, useMentorRevenue, useMyPurchases } from '~/layers/payments/app/composable/usePaymentDashboard';

definePageMeta({
  requiresAuth: true,
});

const { data: purchases } = useMyPurchases();
const { data: mentorRevenue } = useMentorRevenue();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.roles?.some((role) => (typeof role === 'string' ? role === 'Admin' : role.name === 'Admin')) ?? false);
const { data: transactions } = useAdminTransactions(isAdmin);

const formatMoney = (amount?: number, currency = 'IDR') =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount ?? 0));

const formatDate = (value?: string) => (value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-');
</script>

<template>
  <Page title="Dashboard" :breadcrumbs="[{ title: 'Dashboard', url: '/dashboard', active: true }]">
    <template #children>
      <div class="space-y-6">
        <div class="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Total sales</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold">{{ mentorRevenue?.totalSales ?? 0 }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Today</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold">{{ formatMoney(mentorRevenue?.revenueToday) }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">This month</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold">{{ formatMoney(mentorRevenue?.revenueMonthly) }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Enrollments</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold">{{ mentorRevenue?.enrollmentCount ?? 0 }}</CardContent>
          </Card>
        </div>

        <Card v-if="isAdmin">
          <CardHeader>
            <CardTitle>My Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="purchase in purchases ?? []" :key="purchase.id">
                  <TableCell class="font-medium">{{ purchase.orderNumber }}</TableCell>
                  <TableCell>{{ purchase.classTitle ?? '-' }}</TableCell>
                  <TableCell>{{ formatMoney(purchase.amount, purchase.currency) }}</TableCell>
                  <TableCell><Badge variant="outline">{{ purchase.status }}</Badge></TableCell>
                  <TableCell>{{ formatDate(purchase.purchaseDate) }}</TableCell>
                </TableRow>
                <TableRow v-if="!purchases?.length">
                  <TableCell colspan="5" class="h-24 text-center text-muted-foreground">No purchases yet.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="transaction in transactions ?? []" :key="transaction.id">
                  <TableCell class="font-medium">{{ transaction.orderNumber }}</TableCell>
                  <TableCell>{{ transaction.learner?.name ?? '-' }}</TableCell>
                  <TableCell>{{ transaction.class?.title ?? transaction.classTitle ?? '-' }}</TableCell>
                  <TableCell>{{ formatMoney(transaction.amount, transaction.currency) }}</TableCell>
                  <TableCell><Badge variant="outline">{{ transaction.status }}</Badge></TableCell>
                </TableRow>
                <TableRow v-if="!transactions?.length">
                  <TableCell colspan="5" class="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </template>
  </Page>
</template>
