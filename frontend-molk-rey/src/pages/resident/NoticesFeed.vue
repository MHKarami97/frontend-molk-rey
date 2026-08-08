<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useResidentStore } from '../../stores/useResidentStore';
import UnitSwitcher from '../../components/resident/UnitSwitcher.vue';

interface Notice {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

const store = useResidentStore();
const items = ref<Notice[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function load() {
  if (!store.activeUnit) return;
  isLoading.value = true;
  error.value = null;
  try {
    items.value = await apiFetch<Notice[]>(`/resident/notices?buildingId=${store.activeUnit.buildingId}`);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت اعلامیه‌ها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchUnits();
  await load();
});
watch(() => store.activeUnitId, load);

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'امروز';
  if (diffDays === 1) return 'دیروز';
  return `${diffDays} روز پیش`;
}
</script>

<template>
  <div class="space-y-6">
    <UnitSwitcher />
    <h1 class="text-heading text-ink">اعلامیه‌ها</h1>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <div
      v-else-if="items.length === 0"
      class="rounded-card border border-dashed border-surface-border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#E4D9C9_8px,#E4D9C9_9px)] p-8 text-center text-sm text-ink/60"
    >
      هنوز اعلامیه‌ای ثبت نشده است.
    </div>

    <div v-else class="space-y-2">
      <div v-for="notice in items" :key="notice.id" class="rounded-card border border-surface-border bg-surface p-4">
        <div class="flex items-start justify-between">
          <p class="text-heading text-ink">{{ notice.title }}</p>
          <span class="shrink-0 text-xs text-ink/50">{{ relativeTime(notice.createdAt) }}</span>
        </div>
        <p class="mt-1 whitespace-pre-line text-sm text-ink/70">{{ notice.body }}</p>
      </div>
    </div>
  </div>
</template>
