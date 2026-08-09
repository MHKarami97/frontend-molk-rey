<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';

interface PlatformBuilding {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  isActive: boolean;
  createdAt: string;
}

const buildings = ref<PlatformBuilding[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const togglingId = ref<string | null>(null);

async function load() {
  isLoading.value = true;
  error.value = null;
  try {
    buildings.value = await apiFetch<PlatformBuilding[]>('/platform/buildings');
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت لیست ساختمان‌ها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);

async function toggleActive(building: PlatformBuilding) {
  togglingId.value = building.id;
  try {
    await apiFetch(`/platform/buildings/${building.id}/toggle-active`, { method: 'POST' });
    building.isActive = !building.isActive;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'تغییر وضعیت ساختمان ناموفق بود.';
  } finally {
    togglingId.value = null;
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-heading text-ink">مدیریت ساختمان‌ها</h1>
    <p class="text-xs text-ink/50">
      غیرفعال‌کردن یک ساختمان، امکان افزودن واحد جدید و صدور صورتحساب برای آن را مسدود می‌کند.
    </p>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <div v-else class="space-y-2">
      <div
        v-for="building in buildings"
        :key="building.id"
        class="flex items-center justify-between gap-3 rounded-card border border-surface-border bg-surface p-3"
      >
        <div class="min-w-0">
          <p class="text-heading text-ink">{{ building.name }}</p>
          <p class="text-xs text-ink/60">{{ building.address }}</p>
          <p class="text-xs text-ink/50">{{ building.totalUnits }} واحد</p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <span
            class="rounded-control px-2 py-0.5 text-xs"
            :class="building.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
          >
            {{ building.isActive ? 'فعال' : 'غیرفعال' }}
          </span>
          <button
            type="button"
            class="rounded-control border px-3 py-1.5 text-xs disabled:opacity-50"
            :class="
              building.isActive
                ? 'border-danger/40 text-danger hover:bg-danger/5'
                : 'border-success/40 text-success hover:bg-success/5'
            "
            :disabled="togglingId === building.id"
            @click="toggleActive(building)"
          >
            {{ building.isActive ? 'غیرفعال کردن' : 'فعال کردن' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
