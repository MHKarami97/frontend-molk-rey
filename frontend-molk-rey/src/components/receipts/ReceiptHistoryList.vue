<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import ReceiptStatusBadge from './ReceiptStatusBadge.vue';
import type { ReceiptHistoryItem } from '../../types/receipt.types';

const props = defineProps<{ unitId: string; getImageUrl: (imageKey: string) => string }>();

const items = ref<ReceiptHistoryItem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function load() {
  isLoading.value = true;
  error.value = null;
  try {
    items.value = await apiFetch<ReceiptHistoryItem[]>(`/receipts/history/${props.unitId}`);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت تاریخچه رسیدها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso)
  );
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="isLoading" class="space-y-2">
      <div
        v-for="i in 3"
        :key="i"
        class="h-16 animate-pulse rounded-card border border-surface-border bg-secondary/60"
      />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-else-if="items.length === 0"
      class="rounded-card border border-dashed border-surface-border p-6 text-center text-sm text-ink/60"
    >
      هنوز هیچ رسیدی برای این واحد ثبت نشده است.
    </p>

    <TransitionGroup v-else name="list" tag="ul" class="space-y-2">
      <li
        v-for="item in items"
        :key="item.receiptId"
        class="flex items-center gap-3 rounded-card border border-surface-border bg-surface p-3"
      >
        <img
          :src="getImageUrl(item.imageKey)"
          alt="تصویر رسید"
          class="h-14 w-14 shrink-0 rounded-control border border-surface-border object-cover"
        />

        <div class="min-w-0 flex-1">
          <p class="truncate text-heading text-ink">{{ item.billAmount.toLocaleString('fa-IR') }} تومان</p>
          <p class="text-xs text-ink/60">{{ formatDate(item.uploadedAt) }}</p>
          <p v-if="item.reviewStatus === 'rejected' && item.reviewNote" class="mt-1 text-xs text-danger">
            دلیل رد: {{ item.reviewNote }}
          </p>
        </div>

        <ReceiptStatusBadge :status="item.reviewStatus" />
      </li>
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
