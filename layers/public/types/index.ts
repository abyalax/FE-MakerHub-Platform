import type { Category } from '~/layers/projects/types';
import type { ContentAccessType } from '~/layers/shared/app/common/enum';

export interface ProjectPublicContentNode {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: ProjectPublicContentNode[];
  text?: string;
}

export interface ProjectPublic {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  contentJson?: ProjectPublicContentNode | null;
  tocJson: {
    id: string;
    level: number;
    title: string;
  }[];
  toc?: {
    id: string;
    level: number;
    title: string;
  }[];
  accessType: ContentAccessType;
  price: number;
  currency: string;
  publishedAt: null | string;
  coverUrl: string;
  category: Category;
  mentor: {
    id: string;
    name: string;
    headline: string;
  };
  objectives?: string[];
  hasLearning?: boolean;
  learningSlug?: string;
  learningCategorySlug?: string;
  learningTitle?: string;
}

export type PublicDocsBreadcrumb = {
  label: string;
  to?: string;
};

export type PublicDocsTab = {
  label: string;
  value: string;
};

export type PublicDocsRelatedLink = {
  label: string;
  to?: string;
  href?: string;
};

export type PublicDocsMetaItem = {
  label: string;
  value: string;
  description?: string;
};

export type PublicDocsTocGroup = {
  title: string;
  collapsible?: boolean;
  items: {
    label: string;
    href: string;
    tabValue?: string;
    active?: boolean;
  }[];
};
