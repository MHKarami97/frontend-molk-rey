<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';

interface SubscriptionReceiptQueueItem {
  id: string;
  buildingId: string;
  buildingName: string;
  imageKey: string;
  amount: number;
  createdAt: string;
}

const items = ref<SubscriptionReceiptQueueItem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const activeRejectId = ref<string | null>(null);
const rejectNote = ref('');
const isSubmitting = ref(false);

/**
 * توجه فنی: مسیر نمایش تصویر رسید اشتراک از همان الگوی Placeholder
 * ماژول رسید شارژ استفاده می‌کند (VITE_RECEIPTS_PUBLIC_BASE_URL)؛ در
 * Production باید به یک Worker Route محافظت‌شده وصل شود.
 */
function getImageUrl(imageKey: string): string {
  const base = import.meta.env.VITE_RECEIPTS_PUBLIC_BASE_URL ?? '/receipt-images';
  return `${base}/${imageKey}`;
}

async function load() {
  isLoading.value = true;
  error.value = null;
  try {
    items.value = await apiFetch<SubscriptionReceiptQueueItem[]>('/platform/subscriptions/receipts/queue');
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت صف بررسی رسیدهای اشتراک.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);

async function decide(id: string, decision: 'confirmed' | 'rejected', reviewNote?: string) {
  const index = items.value.findIndex((item) => item.id === id);
  if (index === -1) return;
  const removed = items.value[index];
  if (!removed) return;

  items.value.splice(index, 1);
  isSubmitting.value = true;

  try {
    await apiFetch(`/platform/subscriptions/receipts/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, reviewNote }),
    });
  } catch (e) {
    items.value.splice(index, 0, removed);
    error.value = e instanceof ApiError ? e.message : 'ثبت تصمیم ناموفق بود.';
  } finally {
    isSubmitting.value = false;
    activeRejectId.value = null;
  }
}

function openReject(id: string) {
  activeRejectId.value = id;
  rejectNote.value = '';
}

function submitReject() {
  if (!activeRejectId.value || rejectNote.value.trim().length < 3) return;
  decide(activeRejectId.value, 'rejected', rejectNote.value.trim());
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-heading text-ink">صف بررسی رسیدهای خرید اشتراک</h1>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-if="!isLoading && items.length === 0"
      class="rounded-card border border-dashed border-surface-border p-8 text-center text-sm text-ink/60"
    >
      هیچ رسید اشتراکی در انتظار بررسی نیست.
    </p>

    <div v-for="item in items" :key="item.id" class="flex flex-col gap-3 rounded-card border border-surface-border bg-surface p-4 sm:flex-row sm:items-center">
      <img :src="getImageUrl(item.imageKey)" alt="رسید اشتراک" class="h-16 w-16 rounded-control border border-surface-border object-cover" />

      <div class="min-w-0 flex-1">
        <p class="text-heading text-ink">{{ item.buildingName }}</p>
        <p class="text-xs text-ink/60">مبلغ: {{ item.amount.toLocaleString('fa-IR') }} تومان</p>
      </div>

      <div class="flex shrink-0 gap-2">
        <button
          class="rounded-control bg-success px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50"
          :disabled="isSubmitting"
          @click="decide(item.id, 'confirmed')"
        >
          تأیید
        </button>
        <button
          class="rounded-control bg-danger px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50"
          :disabled="isSubmitting"
          @click="openReject(item.id)"
        >
          رد
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="activeRejectId" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
        <div class="w-full max-w-sm rounded-card border border-surface-border bg-surface p-4 shadow-overlay">
          <p class="mb-2 text-heading text-ink">دلیل رد رسید اشتراک</p>
          <textarea
            v-model="rejectNote"
            rows="3"
            class="w-full rounded-control border border-surface-border p-2 text-sm"
            placeholder="مثلاً: مبلغ واریزی با تعرفه اشتراک مطابقت ندارد."
          />
          <div class="mt-3 flex justify-end gap-2">
            <button class="rounded-control border border-surface-border px-3 py-1.5 text-sm" @click="activeRejectId = null">انصراف</button>
            <button
              class="rounded-control bg-danger px-3 py-1.5 text-sm text-white disabled:opacity-50"
              :disabled="rejectNote.trim().length < 3 || isSubmitting"
              @click="submitReject"
            >
              ثبت رد
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
