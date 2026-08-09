<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';

interface Summary {
  totalUsers: number;
  usersByRole: { role: string; total: number }[];
  totalBuildings: number;
  activeBuildings: number;
  disabledBuildings: number;
  totalUnits: number;
  proBuildings: number;
  pendingSubscriptionReceipts: number;
  pendingChargeReceipts: number;
  totalIncomeAcrossAllBuildings: number;
  totalExpenseAcrossAllBuildings: number;
}

const ROLE_LABELS: Record<string, string> = {
  platform_admin: 'مدیر پلتفرم',
  admin: 'مدیر ساختمان',
  board_member: 'عضو هیئت‌مدیره',
  resident: 'ساکن',
  owner: 'مالک',
};

const summary = ref<Summary | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function load() {
  isLoading.value = true;
  error.value = null;
  try {
    summary.value = await apiFetch<Summary>('/platform/reports/summary');
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت گزارش سیستم.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-heading text-ink">گزارش کلی سیستم</h1>

    <div v-if="isLoading" class="grid gap-3 sm:grid-cols-3">
      <div v-for="i in 6" :key="i" class="h-24 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <template v-else-if="summary">
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">کل کاربران</p>
          <p class="mt-1 text-hero text-primary">{{ summary.totalUsers.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">کل ساختمان‌ها</p>
          <p class="mt-1 text-hero text-primary">{{ summary.totalBuildings.toLocaleString('fa-IR') }}</p>
          <p class="mt-1 text-xs text-ink/50">{{ summary.activeBuildings }} فعال، {{ summary.disabledBuildings }} غیرفعال</p>
        </div>
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">کل واحدها</p>
          <p class="mt-1 text-hero text-primary">{{ summary.totalUnits.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">ساختمان‌های Pro</p>
          <p class="mt-1 text-hero text-success">{{ summary.proBuildings.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">رسیدهای اشتراک در انتظار</p>
          <p class="mt-1 text-hero text-warning">{{ summary.pendingSubscriptionReceipts.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">رسیدهای شارژ در انتظار</p>
          <p class="mt-1 text-hero text-warning">{{ summary.pendingChargeReceipts.toLocaleString('fa-IR') }}</p>
        </div>
      </div>

      <div class="rounded-card border border-surface-border bg-surface p-4">
        <p class="mb-2 text-heading text-ink">کاربران بر اساس نقش</p>
        <div class="grid gap-2 sm:grid-cols-3">
          <div
            v-for="r in summary.usersByRole"
            :key="r.role"
            class="flex justify-between rounded-control border border-surface-border p-2 text-sm"
          >
            <span>{{ ROLE_LABELS[r.role] ?? r.role }}</span>
            <span class="text-primary">{{ r.total }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-card border border-success/30 bg-success/5 p-4">
          <p class="text-label text-ink/60">مجموع درآمد کل ساختمان‌ها</p>
          <p class="mt-1 text-hero text-success">{{ summary.totalIncomeAcrossAllBuildings.toLocaleString('fa-IR') }} تومان</p>
        </div>
        <div class="rounded-card border border-danger/30 bg-danger/5 p-4">
          <p class="text-label text-ink/60">مجموع هزینه کل ساختمان‌ها</p>
          <p class="mt-1 text-hero text-danger">{{ summary.totalExpenseAcrossAllBuildings.toLocaleString('fa-IR') }} تومان</p>
        </div>
      </div>
    </template>
  </div>
</template>
