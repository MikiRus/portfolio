<script setup lang="ts">
import { projectById } from '~/data/projects'

const props = defineProps<{ id: string }>()
const { t } = useI18n()
const { open } = usePhone()
const { stacks } = useStacks()

// Без конкретного проекта показываем первое запущенное живое демо.
const liveId = computed(() => props.id || Object.values(stacks.value).find((s) => s.sandbox)?.projectId || '')
const sandbox = computed(() => (liveId.value ? stacks.value[liveId.value]?.sandbox : undefined))
const project = computed(() => (liveId.value ? projectById(liveId.value) : undefined))
</script>

<template>
  <PhoneScreen :title="project?.name ?? t('apps.safari')">
    <iframe v-if="sandbox && project" :key="sandbox.id" :src="sandbox.url" :title="project.name" class="block h-full w-full border-0" />
    <div v-else class="grid h-full place-items-center p-8 text-center text-[15px] text-muted">
      <div>
        <p>{{ project ? t('safari.stopped') : t('phone.safariEmpty') }}</p>
        <button v-if="project" class="mt-3 rounded-full bg-accent px-5 py-2 text-sm font-bold text-white uppercase" @click="open({ kind: 'project', id: project.id })">
          {{ t('phone.launch') }}
        </button>
      </div>
    </div>
  </PhoneScreen>
</template>
