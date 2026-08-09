<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useResidentStore } from '../../stores/useResidentStore';
import UnitSwitcher from '../../components/resident/UnitSwitcher.vue';
import BottomSheet from '../../components/common/BottomSheet.vue';

interface MaintenanceRequest {
  id: string;
  description: string;
  status: 'submitted' | 'in_progress' | 'resolved' | 'rejected';
}

const STEPS: MaintenanceRequest['status'][] = ['submitted', 'in_progress', 'resolved'];
const STEP_LABELS: Record<string, string> = {
  submitted: 'ثبت‌شده',
  in_progress: 'در حال انجام',
  resolved: 'برطرف‌شده',
};

const store = useResidentStore();
const items = ref<MaintenanceRequest[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const description = ref('');
const isSubmitting = ref(false);

async function load() {
  if (!store.activeUnitId) return;
  isLoading.value = true;
  error.value = null;
  try {
    items.value = await apiFetch<MaintenanceRequest[]>(
      `/resident/maintenance-requests/units/${store.activeUnitId}`
    );
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت درخواست‌ها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchUnits();
  await load();
});
watch(() => store.activeUnitId, load);

async function submit() {
  if (!store.activeUnitId || description.value.trim().length < 5) return;
  isSubmitting.value = true;
  try {
    await apiFetch('/resident/maintenance-requests', {
      method: 'POST',
      body: JSON.stringify({ unitId: store.activeUnitId, description: description.value }),
    });
    description.value = '';
    showForm.value = false;
    await load();
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'ثبت درخواست ناموفق بود.';
  } finally {
    isSubmitting.value = false;
  }
}

function stepIndex(status: MaintenanceRequest['status']): number {
  return status === 'rejected' ? -1 : STEPS.indexOf(status);
}
</script>

<template>
  <div class="space-y-6">
    <UnitSwitcher />

    <div class="flex items-center justify-between">
      <h1 class="text-heading text-ink">درخواست‌های تعمیر</h1>
      <button class="rounded-control bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-dark" @click="showForm = true">
        + درخواست جدید
      </button>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-else-if="items.length === 0"
      class="rounded-card border border-dashed border-surface-border p-8 text-center text-sm text-ink/60"
    >
      هنوز درخواست تعمیری ثبت نکرده‌اید.
    </p>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.id" class="rounded-card border border-surface-border bg-surface p-4">
        <p class="text-sm text-ink">{{ item.description }}</p>

        <div v-if="item.status === 'rejected'" class="mt-2 text-xs text-danger">این درخواست رد شده است.</div>
        <div v-else class="mt-3 flex items-center">
          <template v-for="(step, i) in STEPS" :key="step">
            <div class="flex flex-col items-center">
              <div
                class="h-3 w-3 rounded-full"
                :class="stepIndex(item.status) >= i ? 'bg-primary' : 'bg-secondary border border-surface-border'"
              />
              <span class="mt-1 text-[10px] text-ink/60">{{ STEP_LABELS[step] }}</span>
            </div>
            <div v-if="i < STEPS.length - 1" class="mx-1 h-0.5 flex-1" :class="stepIndex(item.status) > i ? 'bg-primary' : 'bg-secondary'" />
          </template>
        </div>
      </div>
    </div>

    <BottomSheet :open="showForm" title="درخواست تعمیر جدید" @close="showForm = false">
      <label class="mb-1 block text-xs text-ink/60">توضیح مشکل</label>
      <textarea
        v-model="description"
        rows="4"
        placeholder="مشکل را توضیح دهید..."
        class="w-full rounded-control border border-surface-border p-2 text-sm"
      />
      <button
        class="mt-3 w-full rounded-control bg-primary py-2 text-white hover:bg-primary-dark disabled:opacity-50"
        :disabled="description.trim().length < 5 || isSubmitting"
        @click="submit"
      >
        ثبت درخواست
      </button>
    </BottomSheet>
  </div>
</template>
