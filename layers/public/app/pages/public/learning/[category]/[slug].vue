<script setup lang="ts">
import { computed, ref } from 'vue';
import PublicDocsArticleSection from '~/layers/public/app/components/docs/PublicDocsArticleSection.vue';
import PublicDocsCodeBlock from '~/layers/public/app/components/docs/PublicDocsCodeBlock.vue';
import PublicDocsHero from '~/layers/public/app/components/docs/PublicDocsHero.vue';
import PublicDocsRelated from '~/layers/public/app/components/docs/PublicDocsRelated.vue';
import PublicDocsToc from '~/layers/public/app/components/docs/PublicDocsToc.vue';
import { useEnrollClass } from '~/layers/learnings/app/composable/useEnrollments';
import { useGetPublicLearningDetail } from '~/layers/learnings/app/composable/useGetPublicLearningDetail';
import { useClassCheckout } from '~/layers/payments/app/composable/useClassCheckout';
import { useMyPurchases } from '~/layers/payments/app/composable/usePaymentDashboard';
import { ClassType } from '~/layers/shared/app/common/enum';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Card, CardContent } from '~/layers/shared/app/components/ui/card';
import { Skeleton } from '~/layers/shared/app/components/ui/skeleton';

const route = useRoute();
const category = computed(() => String(route.params.category ?? ''));
const slug = computed(() => String(route.params.slug ?? ''));
const activeTab = ref('overview');

const { data: learning, isPending } = useGetPublicLearningDetail(category, slug);
const authStore = useAuthStore();
const { data: purchases } = useMyPurchases(computed(() => authStore.isAuthenticated));
const { mutateAsync: createCheckout, isPending: isCreatingCheckout } = useClassCheckout();
const { mutateAsync: enrollClass, isPending: isEnrolling } = useEnrollClass();
const { $toast } = useNuxtApp();

const orderedProjects = computed(() => {
  if (!learning.value?.projects) return [];
  return [...learning.value.projects].sort((a, b) => a.sortOrder - b.sortOrder);
});

const categoryName = computed(() => learning.value?.category?.name ?? 'Learning');
const categorySlug = computed(() => learning.value?.category?.slug ?? category.value);
const mentorName = computed(() => learning.value?.mentor?.name ?? 'Unknown mentor');
const classTypeLabel = computed(() => (learning.value?.classType === ClassType.PAID ? 'Paid' : 'Free'));
const isPaidClass = computed(() => learning.value?.classType === ClassType.PAID);
const hasPurchased = computed(
  () =>
    purchases.value?.some(
      (purchase) => purchase.classId === learning.value?.id && ['PAID', 'SUCCEEDED', 'COMPLETED', 'SETTLED'].includes(purchase.status)
    ) ?? false
);
const priceLabel = computed(() => {
  if (!learning.value) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: learning.value.currency ?? 'IDR', maximumFractionDigits: 0 }).format(
    Number(learning.value.price ?? 0)
  );
});

const breadcrumbs = computed(() => [
  { label: 'Learning paths', to: '/public/learning' },
  { label: categoryName.value, to: `/public/learning/${categorySlug.value}` },
  { label: learning.value?.title ?? 'Detail' },
]);

const tabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Curriculum', value: 'curriculum' },
  { label: 'API', value: 'api' },
];

const badges = computed(() => [categoryName.value, classTypeLabel.value, `${learning.value?.projectCount ?? 0} projects`]);

const tocGroups = computed(() => [
  {
    title: 'Learning path',
    items: [
      { label: 'Introduction', href: '#introduction', tabValue: 'overview', active: activeTab.value === 'overview' },
      { label: 'Mentor context', href: '#mentor-context', tabValue: 'overview' },
      { label: 'Next steps', href: '#next-steps', tabValue: 'overview' },
    ],
  },
  {
    title: 'Projects',
    collapsible: true,
    items: orderedProjects.value.length
      ? orderedProjects.value.map((item, index) => ({
          label: `${index + 1}. ${item.project.title}`,
          href: `#project-${item.project.slug}`,
          tabValue: 'curriculum',
          active: activeTab.value === 'curriculum' && index === 0,
        }))
      : [{ label: 'No projects yet', href: '#empty-curriculum', tabValue: 'curriculum', active: activeTab.value === 'curriculum' }],
  },
  {
    title: 'Reference',
    collapsible: true,
    items: [
      { label: 'Public endpoint', href: '#public-endpoint', tabValue: 'api', active: activeTab.value === 'api' },
      { label: 'Response shape', href: '#response-shape', tabValue: 'api' },
    ],
  },
]);

const relatedLinks = computed(() => {
  const projectLinks = orderedProjects.value.slice(0, 4).map((item) => ({
    label: item.project.title,
    to: `/public/projects/${item.project.category?.slug}/${item.project.slug}`,
  }));

  return [
    ...projectLinks,
    { label: `${categoryName.value} learning paths`, to: `/public/learning/${categorySlug.value}` },
    { label: 'All learning paths', to: '/public/learning' },
  ];
});

const metaItems = computed(() => [
  { label: 'Maintainer', value: mentorName.value, description: learning.value?.mentor?.headline ?? 'Mentor' },
  {
    label: 'Access',
    value: classTypeLabel.value,
    description: learning.value?.currency ? `${learning.value.currency} ${learning.value.price}` : undefined,
  },
  { label: 'Projects', value: String(learning.value?.projectCount ?? 0), description: 'Ordered from first step to final project' },
]);

const publicEndpointExample = computed(() => `GET /public/learning/${categorySlug.value}/${slug.value}`);
const curlExample = computed(() => `curl -X GET "/public/learning/${categorySlug.value}/${slug.value}"`);
const responseExample = computed(() =>
  JSON.stringify(
    {
      id: learning.value?.id,
      title: learning.value?.title,
      slug: learning.value?.slug,
      category: learning.value?.category
        ? {
            name: learning.value.category.name,
            slug: learning.value.category.slug,
          }
        : null,
      mentor: {
        name: mentorName.value,
      },
      projectCount: learning.value?.projectCount ?? 0,
      projects: orderedProjects.value.map((item) => ({
        sortOrder: item.sortOrder,
        title: item.project.title,
        slug: item.project.slug,
      })),
    },
    null,
    2
  )
);

function selectTocItem(item: { tabValue?: string; href: string }) {
  if (item.tabValue) activeTab.value = item.tabValue;

  window.requestAnimationFrame(() => {
    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

async function buyNow() {
  if (!learning.value) return;
  if (!authStore.isAuthenticated) {
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  const checkout = await createCheckout(learning.value.id);
  if (checkout.checkoutUrl) {
    window.location.href = checkout.checkoutUrl;
  }
}

async function startLearning() {
  if (!learning.value) return;
  if (!authStore.isAuthenticated) {
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  try {
    await enrollClass(learning.value.id);
    await navigateTo(`/classroom/${learning.value.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start learning';
    $toast.warning(message || 'Failed to start learning');
  }
}

const relatedCtaLabel = computed(() => {
  if (isPaidClass.value) return hasPurchased.value ? 'Continue learning' : `Buy now ${priceLabel.value}`;
  return 'Start learning';
});

const relatedCtaAction = computed(() => (isPaidClass.value && !hasPurchased.value ? buyNow : startLearning));
const isCtaLoading = computed(() => isCreatingCheckout.value || isEnrolling.value);
</script>

<template>
  <section v-if="isPending" class="container py-10">
    <div class="space-y-6">
      <Skeleton class="h-8 w-64" />
      <Skeleton class="h-12 w-full max-w-3xl" />
      <Skeleton class="h-80 w-full" />
    </div>
  </section>

  <template v-else-if="learning">
    <PublicDocsHero
      v-model="activeTab"
      :breadcrumbs="breadcrumbs"
      :title="learning.title"
      :description="learning.description"
      :tabs="tabs"
      :badges="badges"
    />

    <main class="container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[240px_minmax(0,860px)_280px]">
      <PublicDocsToc title="Learning Docs" :version-label="`Category: ${categorySlug}`" :groups="tocGroups" @select="selectTocItem" />

      <article class="min-w-0 space-y-8">
        <div v-if="activeTab === 'overview'" class="space-y-8">
          <PublicDocsArticleSection id="introduction" title="Introduction">
            <div class="space-y-4">
              <p class="whitespace-pre-wrap">{{ learning.description }}</p>

              <div v-if="learning.coverUrl" class="overflow-hidden rounded-md border bg-muted">
                <img :src="learning.coverUrl" :alt="learning.title" class="aspect-16/7 w-full object-cover" />
              </div>
            </div>
          </PublicDocsArticleSection>

          <PublicDocsArticleSection id="mentor-context" title="Mentor context">
            <dl class="grid gap-4 sm:grid-cols-3">
              <div class="border-l-2 border-primary pl-4">
                <dt class="text-xs font-medium uppercase text-muted-foreground">Mentor</dt>
                <dd class="mt-1 font-medium text-foreground">{{ mentorName }}</dd>
              </div>
              <div class="border-l-2 border-primary pl-4">
                <dt class="text-xs font-medium uppercase text-muted-foreground">Category</dt>
                <dd class="mt-1 font-medium text-foreground">{{ categoryName }}</dd>
              </div>
              <div class="border-l-2 border-primary pl-4">
                <dt class="text-xs font-medium uppercase text-muted-foreground">Access</dt>
                <dd class="mt-1 font-medium text-foreground">{{ classTypeLabel }}</dd>
              </div>
            </dl>
          </PublicDocsArticleSection>

          <PublicDocsArticleSection id="next-steps" title="Next steps">
            <div class="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" @click="activeTab = 'curriculum'">Review curriculum</Button>
            </div>
          </PublicDocsArticleSection>
        </div>

        <div v-else-if="activeTab === 'curriculum'" class="space-y-8">
          <PublicDocsArticleSection v-if="orderedProjects.length" id="curriculum" title="Project sequence">
            <div class="divide-y rounded-md border">
              <div
                v-for="(item, index) in orderedProjects"
                :id="`project-${item.project.slug}`"
                :key="item.projectId"
                class="grid gap-4 p-4 md:grid-cols-[48px_minmax(0,1fr)_auto] md:items-start"
              >
                <div class="flex size-10 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                  {{ index + 1 }}
                </div>

                <div class="min-w-0">
                  <h2 class="text-base font-semibold text-foreground">{{ item.project.title }}</h2>
                  <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {{ item.project.summary || item.project.description }}
                  </p>
                  <p class="mt-2 text-xs text-muted-foreground">
                    {{ item.project.category?.name ?? 'Uncategorized' }} · {{ item.project.accessType }}
                  </p>
                </div>

                <Button as-child variant="outline" size="sm">
                  <NuxtLink :to="`/public/projects/${item.project.category?.slug}/${item.project.slug}`">Open</NuxtLink>
                </Button>
              </div>
            </div>
          </PublicDocsArticleSection>

          <PublicDocsArticleSection v-else id="empty-curriculum" title="Project sequence">
            <p>This learning path has no published projects yet.</p>
          </PublicDocsArticleSection>
        </div>

        <div v-else class="space-y-8">
          <PublicDocsArticleSection id="public-endpoint" title="Public endpoint">
            <div class="space-y-4">
              <PublicDocsCodeBlock :code="publicEndpointExample" language="http" />
              <PublicDocsCodeBlock :code="curlExample" language="bash" />
            </div>
          </PublicDocsArticleSection>

          <PublicDocsArticleSection id="response-shape" title="Response shape">
            <PublicDocsCodeBlock :code="responseExample" language="json" />
          </PublicDocsArticleSection>
        </div>
      </article>

      <PublicDocsRelated
        :links="relatedLinks"
        :meta-items="metaItems"
        :cta-label="relatedCtaLabel"
        :cta-action="relatedCtaAction"
        :cta-loading="isCtaLoading"
        back-to="/public/learning"
        back-label="Back to learning"
      />
    </main>
  </template>

  <section v-else class="container py-10">
    <Card class="border-dashed">
      <CardContent class="p-10 text-center">
        <h2 class="text-lg font-semibold">Learning path not found</h2>
        <p class="mt-2 text-sm text-muted-foreground">This learning path may have been removed or is not published.</p>

        <Button as-child variant="outline" class="mt-4">
          <NuxtLink to="/public/learning">Browse all learning paths</NuxtLink>
        </Button>
      </CardContent>
    </Card>
  </section>
</template>
