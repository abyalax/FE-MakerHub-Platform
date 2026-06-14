<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { JSONContent } from '@tiptap/vue-3';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ContentAccessType } from '~/layers/shared/app/common/enum';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/layers/shared/app/components/ui/form';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/layers/shared/app/components/ui/select';
import { createProjectSchema } from '../../schemas/create-project';
import type { CreateProjectPayload } from '../../../types';
import ProjectContentEditor from '../ProjectContentEditor.vue';

const emptyDocument = (): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

const projectSchema = toTypedSchema(createProjectSchema);

const contentJson = ref<JSONContent>(emptyDocument());

const parseObjectives = (value?: string) =>
  Array.from(
    new Set(
      (value ?? '')
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const form = useForm({
  validationSchema: projectSchema,
  initialValues: {
    title: '',
    summary: '',
    objectivesText: '',
    description: '',
    contentJson: contentJson.value,
    accessType: ContentAccessType.FREE,
    price: 0,
    currency: 'IDR',
  },
});

const disabled = computed(() => form.isSubmitting.value);

watch(
  contentJson,
  (value) => {
    form.setFieldValue('contentJson', value);
  },
  { deep: true }
);

const submit = async (): Promise<CreateProjectPayload | null> => {
  const result = await form.validate();
  if (!result.valid) return null;

  const values = createProjectSchema.parse({
    ...form.values,
    contentJson: contentJson.value,
  });

  const data: CreateProjectPayload = {
    title: values.title,
    summary: values.summary || undefined,
    description: values.description,
    contentJson: contentJson.value,
    objectives: parseObjectives(values.objectivesText),
    accessType: values.accessType,
    price: values.price,
    currency: values.currency,
  };

  return data;
};

const reset = () => {
  contentJson.value = emptyDocument();
  form.resetForm();
};

defineExpose({
  submit,
  reset,
});
</script>

<template>
  <form class="space-y-6" @submit.prevent>
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-4">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input v-bind="componentField" :disabled="disabled" placeholder="Build a distributed task queue" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="summary">
          <FormItem>
            <FormLabel>Summary</FormLabel>
            <FormControl>
              <textarea
                v-bind="componentField"
                :disabled="disabled"
                rows="3"
                class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Short catalog summary shown before learners open the project"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="objectivesText">
          <FormItem>
            <FormLabel>Learning objectives</FormLabel>
            <FormControl>
              <textarea
                v-bind="componentField"
                :disabled="disabled"
                rows="4"
                class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="One objective per line, e.g.&#10;Design an idempotent queue worker&#10;Implement retry and dead-letter handling"
              />
            </FormControl>
            <p class="text-xs text-muted-foreground">Each non-empty line is saved as one public learning objective.</p>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div class="space-y-4">
        <FormField v-slot="{ componentField }" name="accessType">
          <FormItem>
            <FormLabel>Access</FormLabel>
            <Select v-bind="componentField" :disabled="disabled">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="ContentAccessType.FREE">Free</SelectItem>
                <SelectItem :value="ContentAccessType.PREMIUM">Premium</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-[minmax(0,1fr)_8rem] gap-3">
          <FormField v-slot="{ componentField }" name="price">
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input v-bind="componentField" :disabled="disabled" type="number" min="0" step="1000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="currency">
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select v-bind="componentField" :disabled="disabled">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>
    </div>

    <FormField name="description">
      <FormItem>
        <FormLabel>Project scope</FormLabel>
        <FormControl>
          <ProjectContentEditor
            v-model="contentJson"
            :disabled="disabled"
            @text-change="(value) => form.setFieldValue('description', value)"
            @upload-error="(message) => form.setFieldError('description', message)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </form>
</template>
