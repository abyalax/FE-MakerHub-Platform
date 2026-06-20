import type { ColumnDef } from '@tanstack/vue-table';
import type { Component } from 'vue';
import { h } from 'vue';
import { ExternalLink, EyeOff, Send, Trash2 } from 'lucide-vue-next';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/layers/shared/app/components/ui/tooltip';
import { createCrudSelectColumn, crudCellControlProps } from '~/layers/shared/app/composable/table/crud';
import type { Project } from '../../types/index.js';
import { ContentStatus } from '~/layers/shared/app/common/enum';

type Params = {
  crud: {
    isNewRow: (row: Project) => boolean;
    isRowEditable: (row: Project) => boolean;
    getFieldValue: <K extends keyof Project>(row: Project, field: K) => Project[K];
    handleFieldChange: <K extends keyof Project>(row: Project, field: K, value: Project[K]) => void;
    handleDelete: (row: Project) => void;
    isLoading: { value: boolean };
  };
  canDelete: boolean;
  canUpdate: boolean;
  onPublish: (row: Project) => void | Promise<void>;
  onUnpublish: (row: Project) => void | Promise<void>;
  lifecycleLoading?: { value: boolean };
};

const emptyValue = '-';

const textValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return emptyValue;
  return String(value);
};

const truncate = (value: unknown, maxLength = 80): string => {
  const text = textValue(value);
  if (text === emptyValue || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}...`;
};

const formatPrice = (price: Project['price'], currency: Project['currency']): string => {
  if (price === null || price === undefined || (typeof price === 'string' && price === '')) return emptyValue;

  const numericPrice = Number(price);
  const displayCurrency = textValue(currency);
  if (Number.isNaN(numericPrice)) return displayCurrency === emptyValue ? String(price) : `${displayCurrency} ${price}`;

  return displayCurrency === emptyValue ? numericPrice.toLocaleString('id-ID') : `${displayCurrency} ${numericPrice.toLocaleString('id-ID')}`;
};

const formatDate = (date: Project['publishedAt'] | Project['createdAt'] | Project['updatedAt']): string => {
  if (!date) return emptyValue;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return emptyValue;

  return parsedDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const mentorLabel = (project: Project): string => project.mentor?.user?.name ?? project.mentor?.headline ?? emptyValue;

const renderIconAction = (params: {
  label: string;
  icon: Component;
  disabled?: boolean;
  destructive?: boolean;
  onClick: (event: MouseEvent) => void;
}) =>
  h(
    Tooltip,
    {},
    {
      default: () => [
        h(
          TooltipTrigger,
          { asChild: true },
          {
            default: () =>
              h(
                Button,
                {
                  variant: 'ghost',
                  size: 'icon-sm',
                  class: params.destructive ? 'text-destructive hover:text-destructive' : undefined,
                  disabled: params.disabled,
                  title: params.label,
                  'aria-label': params.label,
                  onClick: params.onClick,
                },
                {
                  default: () => h(params.icon, { class: 'size-4' }),
                }
              ),
          }
        ),
        h(
          TooltipContent,
          { side: 'top' },
          {
            default: () => params.label,
          }
        ),
      ],
    }
  );

export const useColumnProjects = (params: Params): ColumnDef<Project>[] => {
  return [
    // 1. SELECT COLUMN
    createCrudSelectColumn(params.crud),

    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => {
        const id = textValue(row.original.id);

        return h('span', { class: 'font-mono text-xs text-muted-foreground', title: id }, truncate(id, 18));
      },
    },

    // 2. TITLE COLUMN
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const project = row.original;

        if (!params.crud.isRowEditable(project)) {
          return h('div', { class: 'max-w-96 space-y-1' }, [
            h('div', { class: 'font-medium', title: textValue(project.title) }, project.title),
            project.summary
              ? h('div', { class: 'text-xs text-muted-foreground', title: textValue(project.summary) }, truncate(project.summary, 96))
              : null,
            project.description
              ? h('div', { class: 'text-xs text-muted-foreground', title: textValue(project.description) }, truncate(project.description, 120))
              : null,
          ]);
        }

        return h(Input, {
          modelValue: (params.crud.getFieldValue(project, 'title') as string) ?? '',
          'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(project, 'title', String(value)),
          type: 'text',
          placeholder: 'Project Title',
          class: 'h-8 min-w-56',
          ...crudCellControlProps,
        });
      },
    },

    // 3. SLUG COLUMN
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => {
        const project = row.original;

        if (!params.crud.isRowEditable(project)) {
          return h('div', { class: 'text-sm text-muted-foreground' }, project.slug);
        }

        return h(Input, {
          modelValue: (params.crud.getFieldValue(project, 'slug') as string) ?? '',
          'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(project, 'slug', String(value)),
          type: 'text',
          placeholder: 'project-slug',
          class: 'h-8 min-w-44',
          ...crudCellControlProps,
        });
      },
    },

    {
      accessorKey: 'coverUrl',
      header: 'Cover',
      enableSorting: false,
      cell: ({ row }) => {
        const coverUrl = row.original.coverUrl;
        if (!coverUrl) return h('span', { class: 'text-sm text-muted-foreground' }, emptyValue);

        return h(
          'a',
          {
            href: coverUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            class: 'inline-flex items-center gap-2 text-sm text-primary hover:underline',
            title: coverUrl,
            onClick: (event: MouseEvent) => event.stopPropagation(),
          },
          [
            h('img', {
              src: coverUrl,
              alt: row.original.title ? `${row.original.title} cover` : 'Project cover',
              class: 'size-10 rounded object-cover border bg-muted',
            }),
            h(ExternalLink, { class: 'size-3.5' }),
          ]
        );
      },
    },

    // 4. PRICE COLUMN
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const project = row.original;
        const displayPrice = formatPrice(project.price, project.currency);

        if (!params.crud.isRowEditable(project)) {
          return h('div', { class: 'font-mono' }, displayPrice);
        }

        return h('div', { class: 'flex gap-1 items-center min-w-36' }, [
          h('span', { class: 'text-xs text-muted-foreground font-mono' }, textValue(project.currency)),
          h(Input, {
            modelValue: String(params.crud.getFieldValue(project, 'price') ?? ''),
            'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(project, 'price', Number(value)),
            type: 'number',
            placeholder: '0.00',
            class: 'h-8 w-full',
            ...crudCellControlProps,
          }),
        ]);
      },
    },

    // 5. CATEGORY COLUMN (Using InfiniteSelect)
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const project = row.original;

        return h('div', { class: 'text-sm' }, [
          h('div', {}, project.category?.name ?? emptyValue),
          project.category?.slug ? h('div', { class: 'text-xs text-muted-foreground' }, project.category.slug) : null,
        ]);
      },
    },

    {
      accessorKey: 'mentor',
      header: 'Mentor',
      cell: ({ row }) => {
        const project = row.original;

        return h('div', { class: 'max-w-56 text-sm', title: mentorLabel(project) }, mentorLabel(project));
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const project = row.original;

        return h('div', { class: 'text-sm' }, project.status ?? emptyValue);
      },
    },
    {
      accessorKey: 'accessType',
      header: 'Access',
      cell: ({ row }) => {
        const project = row.original;

        return h('div', { class: 'text-sm' }, project.accessType ?? emptyValue);
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => {
        const publishedAt = row.original.publishedAt;

        return h('div', { class: 'text-sm text-muted-foreground', title: textValue(publishedAt) }, formatDate(publishedAt));
      },
    },
    {
      accessorKey: 'tocJson',
      header: 'TOC',
      enableSorting: false,
      cell: ({ row }) => {
        const toc = row.original.tocJson ?? [];
        if (!toc.length) return h('span', { class: 'text-sm text-muted-foreground' }, emptyValue);

        return h(
          'div',
          { class: 'flex max-w-72 flex-wrap gap-1' },
          toc.map((item) =>
            h(
              'span',
              {
                key: item.id,
                class: 'rounded border bg-background px-2 py-0.5 text-xs',
                title: `h${item.level}: ${item.title}`,
              },
              item.title
            )
          )
        );
      },
    },

    // 6. ACTIONS COLUMN
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const project = row.original;

        const isPublished = project.status === ContentStatus.PUBLISHED;
        const isBusy = params.lifecycleLoading?.value || params.crud.isLoading.value;

        return h('div', { class: 'flex items-center justify-end gap-1' }, [
          renderIconAction({
            label: params.canUpdate ? (isPublished ? 'Unpublish project' : 'Publish project') : 'Update permission required',
            icon: isPublished ? EyeOff : Send,
            disabled: !params.canUpdate || isBusy,
            onClick: (event: MouseEvent) => {
              event.stopPropagation();
              if (isPublished) {
                void params.onUnpublish(project);
              } else {
                void params.onPublish(project);
              }
            },
          }),
          renderIconAction({
            label: params.canDelete ? 'Delete project' : 'Delete permission required',
            icon: Trash2,
            destructive: true,
            disabled: !params.canDelete || isBusy,
            onClick: (event: MouseEvent) => {
              event.stopPropagation();
              params.crud.handleDelete(project);
            },
          }),
        ]);
      },
    },
  ];
};
