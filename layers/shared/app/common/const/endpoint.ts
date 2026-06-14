export const ENDPOINT = Object.freeze({
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',

  USERS: '/users',
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  EVENTS: '/events',
  EVENTS_PUBLISH: '/events/publish',
  EVENTS_PUBLIC: '/events/public',
  EVENTS_PUBLIC_DETAIL: '/events/public',

  ORDERS: '/orders',
  BUY_TICKET: '/orders/buy-ticket',
  USER_ORDERS: '/orders/user/my-orders',
  ORDER_DETAIL: (id: string) => `/orders/${encodeURIComponent(String(id))}`,
  ORDER_STATUS: (id: string) => `/orders/${encodeURIComponent(String(id))}/status`,
  ORDER_TICKETS: (id: string) => `/orders/${encodeURIComponent(String(id))}/tickets`,
  ORDER_PAYMENT_QRIS: (id: string) => `/orders/${encodeURIComponent(String(id))}/payment-qris`,

  CHECK_IN: '/check-in',
  CHECK_IN_PDF: '/check-in/pdf-upload',

  ATTACHMENTS: '/attachments',
  ATTACHMENT_PRESIGN_UPLOAD: '/attachments/presign-upload',
  ATTACHMENT_CONFIRM: '/attachments/confirm',
  ATTACHMENT_DOWNLOAD: (id: number) => `/attachments/${id}/download`,
  ATTACHMENT_DELETE: (id: number) => `/attachments/${id}`,

  DASHBOARD: {
    TOTAL_SALES: '/dashboard/total-sales',
    TOP_CLASSES: '/dashboard/top-classes',
    TOP_CATEGORIES: '/dashboard/top-categories',
  },

  PAYMENTS: {
    CLASS_CHECKOUT: '/payments/classes/checkout',
    MY_PURCHASES: '/payments/purchases/me',
    MENTOR_REVENUE: '/payments/mentor/revenue',
    ADMIN_TRANSACTIONS: '/payments/admin/transactions',
  },

  PROJECTS: {
    LIST: '/projects',
    LIST_MINE: '/projects/mine',
    DETAIL: (id: string | number) => `/projects/${encodeURIComponent(String(id))}`,
    PUBLISH: (id: string | number) => `/projects/${encodeURIComponent(String(id))}/publish`,
    UNPUBLISH: (id: string | number) => `/projects/${encodeURIComponent(String(id))}/unpublish`,
    LIST_PUBLICS: '/projects/public',
    DETAIL_PUBLIC: (slug: string) => `/projects/public/${encodeURIComponent(slug)}`,
    LIST_CATEGORIES: '/projects/categories',
  },

  LEARNING: {
    LIST_MINE: '/mentor/learning',
    CREATE: '/mentor/learning',
    DETAIL: (id: string | number) => `/mentor/learning/${encodeURIComponent(String(id))}`,
    PUBLISH: (id: string | number) => `/mentor/learning/${encodeURIComponent(String(id))}/publish`,
    UNPUBLISH: (id: string | number) => `/mentor/learning/${encodeURIComponent(String(id))}/unpublish`,
    LIST_PUBLIC: '/public/learning',
    LIST_PUBLIC_CATEGORY: (category: string) => `/public/learning/${encodeURIComponent(category)}`,
    DETAIL_PUBLIC: (category: string, slug: string) => `/public/learning/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
  },

  ENROLLMENTS: {
    MINE: '/enrollments/mine',
    DETAIL_MINE: (classId: string | number) => `/enrollments/mine/${encodeURIComponent(String(classId))}`,
    ENROLL: (classId: string | number) => `/enrollments/${encodeURIComponent(String(classId))}`,
    PROGRESS: (classId: string | number) => `/enrollments/${encodeURIComponent(String(classId))}/progress`,
    COMPLETE: (classId: string | number) => `/enrollments/${encodeURIComponent(String(classId))}/complete`,
  },
});
