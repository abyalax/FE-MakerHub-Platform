import { config } from 'dotenv';
import { test, expect, type APIRequestContext } from '@playwright/test';

// Load environment variables from .env file
config({ path: '.env' });

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:4000';

const STUDENT = {
  email: 'lexi.student@gmail.com',
  password: 'Password1_',
};

// Paid learning class from mock data
const PAID_CLASS = {
  id: '550e8400-e29b-41d4-a716-446655440101',
  slug: 'mastering-modular-architecture',
  category: 'programming',
  title: 'Mastering Modular Architecture in NestJS',
};

async function login(request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(`Login failed with status ${response.status()}: ${await response.text()}`);
  }
  const cookies = response.headers()['set-cookie'];
  const cookiesArray = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
  const accessTokenCookie = cookiesArray.find((cookie: string) => cookie.includes('access_token='));
  const token = accessTokenCookie?.match(/access_token=([^;]+)/)?.[1];
  if (!token) {
    throw new Error('Access token not found in cookies');
  }
  return { token, data: await response.json() };
}

async function createCheckout(request: APIRequestContext, classId: string, token: string) {
  const response = await request.post(`${API_BASE}/payments/classes/checkout`, {
    data: { classId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Checkout failed with status ${response.status()}: ${await response.text()}`);
  }
  return await response.json();
}

async function simulatePaymentWebhook(request: APIRequestContext, externalId: string) {
  const webhookPayload = {
    id: `invoice_${Date.now()}`,
    external_id: externalId,
    amount: 150000,
    status: 'PAID',
    paid_at: new Date().toISOString(),
    currency: 'IDR',
  };

  const callbackToken =
    process.env.XENDIT_CALLBACK_TOKEN || process.env.NUXT_PUBLIC_XENDIT_CALLBACK_TOKEN || 'saddxewhe__secret__fergbregvrefverfgerge';

  const response = await request.post(`${API_BASE}/payments/webhook/invoice`, {
    data: webhookPayload,
    headers: {
      'x-callback-token': callbackToken,
    },
  });
  if (!response.ok()) {
    throw new Error(`Webhook failed with status ${response.status()}: ${await response.text()}`);
  }
  return await response.json();
}

test.describe('Student Class Purchase Flow - API Only', () => {
  test('student can sign in, create checkout, simulate payment, and verify purchase', async ({ request }) => {
    // Step 1: Login as student
    const { token } = await login(request, STUDENT.email, STUDENT.password);
    expect(token).toBeTruthy();

    // Step 2: Create checkout for paid class
    const checkoutResponse = await createCheckout(request, PAID_CLASS.id, token);
    expect(checkoutResponse.data.checkoutUrl).toBeTruthy();
    expect(checkoutResponse.data.orderNumber).toBeTruthy();
    const orderNumber = checkoutResponse.data.orderNumber;

    // Step 3: Verify initial purchase status is PENDING
    const purchasesResponse = await request.get(`${API_BASE}/payments/purchases/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(purchasesResponse.ok()).toBeTruthy();
    const purchasesData = await purchasesResponse.json();
    const pendingPurchase = purchasesData.data.find((p: { orderNumber: string }) => p.orderNumber === orderNumber);
    expect(pendingPurchase).toBeTruthy();
    expect(pendingPurchase.status).toBe('PENDING');

    // Step 4: Simulate successful payment via webhook
    await simulatePaymentWebhook(request, orderNumber);

    // Step 5: Wait a moment for webhook processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 6: Verify purchase status is now PAID
    const updatedPurchasesResponse = await request.get(`${API_BASE}/payments/purchases/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(updatedPurchasesResponse.ok()).toBeTruthy();
    const updatedPurchasesData = await updatedPurchasesResponse.json();
    const paidPurchase = updatedPurchasesData.data.find((p: { orderNumber: string }) => p.orderNumber === orderNumber);
    expect(paidPurchase).toBeTruthy();
    expect(paidPurchase.status).toBe('PAID');

    // Step 7: Verify the purchase is for the correct class
    expect(paidPurchase.classId).toBe(PAID_CLASS.id);
  });
});
