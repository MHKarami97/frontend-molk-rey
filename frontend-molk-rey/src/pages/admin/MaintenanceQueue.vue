<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';

interface MaintenanceRequest {
  id: string;
  unitId: string;
  description: string;
  status: 'submitted' | 'in_progress' | 'resolved' | 'rejected';
  assignedTo: string | null;
}

const STATUS_LABELS: Record<MaintenanceRequest['status'], string> = {
  submitted: 'ثبت‌شده',
  in_progress: 'در حال انجام',
  resolved: 'برطرف‌شده',
  rejected: 'رد شده',
};

const items = ref<MaintenanceRequest[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const filterStatus = ref<MaintenanceRequest['status'] | ''>('');

async function load() {
  isLoading.value = true;
  error.value = null;
  try {
    const query = filterStatus.value ? `?status=${filterStatus.value}` : '';
    items.value = await apiFetch<MaintenanceRequest[]>(`/admin/maintenance-requests${query}`);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت درخواست‌های تعمیر.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);
watch(filterStatus, load);

async function updateStatus(id: string, status: MaintenanceRequest['status']) {
  const index = items.value.findIndex((item) => item.id === id);
  if (index === -1) return;
  const previous = items.value[index].status;
  items.value[index].status = status;

  try {
    await apiFetch(`/admin/maintenance-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (e) {
    items.value[index].status = previous;
    error.value = e instanceof ApiError ? e.message : 'به‌روزرسانی وضعیت ناموفق بود.';
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-heading text-ink">صف درخواست‌های تعمیر</h1>
      <select v-model="filterStatus" class="rounded-control border border-surface-border p-2 text-sm">
        <option value="">همه وضعیت‌ها</option>
        <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-else-if="items.length === 0"
      class="rounded-card border border-dashed border-surface-border p-8 text-center text-sm text-ink/60"
    >
      درخواست تعمیری با این فیلتر یافت نشد.
    </p>

    <TransitionGroup v-else name="list" tag="div" class="space-y-2">
      <div v-for="item in items" :key="item.id" class="rounded-card border border-surface-border bg-surface p-4">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm text-ink">{{ item.description }}</p>
          <select
            :value="item.status"
            class="shrink-0 rounded-control border border-surface-border p-1.5 text-xs"
            @change="updateStatus(item.id, ($event.target as HTMLSelectElement).value as MaintenanceRequest['status'])"
          >
            <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
