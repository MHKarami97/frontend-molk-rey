<script setup lang="ts">
import { useAdminStore } from '../../stores/useAdminStore';
import AdminReceiptReviewQueue from '../../components/receipts/AdminReceiptReviewQueue.vue';

const store = useAdminStore();

/**
 * getImageUrl: چون imageKey فقط کلید داخل R2 است (نه URL کامل)، این تابع
 * آدرس نهایی نمایش تصویر را می‌سازد. در Production باید به Custom Domain
 * یا Worker Route اختصاصی نمایش تصویر متصل شود (نه مستقیم به R2 خصوصی).
 */
function getImageUrl(imageKey: string): string {
  const base = import.meta.env.VITE_RECEIPTS_PUBLIC_BASE_URL ?? '/receipt-images';
  return `${base}/${imageKey}`;
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-heading text-ink">بررسی رسیدها</h1>
    <AdminReceiptReviewQueue :building-id="store.selectedBuildingId ?? undefined" :get-image-url="getImageUrl" />
  </div>
</template>
