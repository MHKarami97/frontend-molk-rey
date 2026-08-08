<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useResidentStore } from '../../stores/useResidentStore';
import UnitSwitcher from '../../components/resident/UnitSwitcher.vue';

interface Balance {
  outstandingAmount: number;
  isSettled: boolean;
}

interface Notice {
  id: string;
  title: string;
  createdAt: string;
}

const store = useResidentStore();
const balance = ref<Balance | null>(null);
const notices = ref<Notice[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function load() {
  if (!store.activeUnitId) return;
  isLoading.value = true;
  error.value = null;
  try {
    balance.value = await apiFetch<Balance>(`/resident/units/${store.activeUnitId}/balance`);
    if (store.activeUnit) {
      const feed = await apiFetch<Notice[]>(`/resident/notices?buildingId=${store.activeUnit.buildingId}&limit=3`);
      notices.value = feed;
    }
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت اطلاعات.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchUnits();
  await load();
});
watch(() => store.activeUnitId, load);
</script>

<template>
  <div class="space-y-6">
    <UnitSwitcher />

    <div v-if="isLoading" class="space-y-3">
      <div class="h-28 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <template v-else-if="balance">
      <div
        class="rounded-card border p-5"
        :class="balance.isSettled ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'"
      >
        <p class="text-label text-ink/60">{{ balance.isSettled ? 'وضعیت حساب' : 'بدهی فعلی' }}</p>
        <p class="mt-1 text-hero" :class="balance.isSettled ? 'text-success' : 'text-danger'">
          {{ balance.isSettled ? 'تسویه است' : `${balance.outstandingAmount.toLocaleString('fa-IR')} تومان` }}
        </p>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <a href="/resident/bills" class="rounded-card border border-surface-border bg-surface p-3 text-center text-xs text-ink/80 hover:bg-secondary">
          💳<br />پرداخت شارژ
        </a>
        <a href="/resident/maintenance" class="rounded-card border border-surface-border bg-surface p-3 text-center text-xs text-ink/80 hover:bg-secondary">
          🔧<br />ثبت درخواست
        </a>
        <a href="/resident/facilities" class="rounded-card border border-surface-border bg-surface p-3 text-center text-xs text-ink/80 hover:bg-secondary">
          🏛️<br />رزرو مشاعات
        </a>
      </div>

      <div>
        <p class="mb-2 text-heading text-ink">آخرین اعلامیه‌ها</p>
        <p v-if="notices.length === 0" class="rounded-card border border-dashed border-surface-border p-6 text-center text-sm text-ink/60">
          هنوز اعلامیه‌ای ثبت نشده است.
        </p>
        <div v-else class="space-y-2">
          <div v-for="notice in notices" :key="notice.id" class="rounded-card border border-surface-border bg-surface p-3 text-sm text-ink">
            {{ notice.title }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
