<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetchPaged, apiFetch, ApiError } from '../../lib/api/http';
import type { ReceiptQueueItem } from '../../types/receipt.types';

const props = defineProps<{ buildingId?: string; getImageUrl: (imageKey: string) => string }>();

const items = ref<ReceiptQueueItem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const nextCursor = ref<string | null>(null);

const lightboxImage = ref<string | null>(null);
const activeReviewId = ref<string | null>(null);
const rejectNote = ref('');
const isSubmitting = ref(false);

async function loadQueue(cursor: string | null = null) {
  isLoading.value = true;
  error.value = null;

  const params = new URLSearchParams();
  if (props.buildingId) params.set('buildingId', props.buildingId);
  if (cursor) params.set('cursor', cursor);

  try {
    const query = params.toString();
    const { data, nextCursor: cursorFromServer } = await apiFetchPaged<ReceiptQueueItem[]>(
      `/admin/receipts/queue${query ? `?${query}` : ''}`
    );
    items.value = cursor ? [...items.value, ...data] : data;
    nextCursor.value = cursorFromServer;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت صف بررسی رسیدها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => loadQueue());

function openReject(receiptId: string) {
  activeReviewId.value = receiptId;
  rejectNote.value = '';
}

function closeReject() {
  activeReviewId.value = null;
}

/**
 * Optimistic UI Update: آیتم بلافاصله از لیست حذف می‌شود؛ در صورت خطای
 * سرور، آیتم به لیست بازگردانده می‌شود تا کاربر مجبور به Refresh کامل نشود.
 */
async function decide(receiptId: string, decision: 'confirmed' | 'rejected', reviewNote?: string) {
  const index = items.value.findIndex((item) => item.receiptId === receiptId);
  if (index === -1) return;

  const removedItem = items.value[index];
  if (!removedItem) return;

  items.value.splice(index, 1);
  isSubmitting.value = true;

  try {
    await apiFetch(`/admin/receipts/${receiptId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, reviewNote }),
    });
  } catch (e) {
    items.value.splice(index, 0, removedItem);
    error.value = e instanceof ApiError ? e.message : 'ثبت تصمیم ناموفق بود.';
  } finally {
    isSubmitting.value = false;
    closeReject();
  }
}

function confirmReceipt(receiptId: string) {
  decide(receiptId, 'confirmed');
}

function submitReject() {
  if (!activeReviewId.value || rejectNote.value.trim().length < 3) return;
  decide(activeReviewId.value, 'rejected', rejectNote.value.trim());
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="isLoading && items.length === 0" class="space-y-2">
      <div
        v-for="i in 3"
        :key="i"
        class="h-24 animate-pulse rounded-card border border-surface-border bg-secondary/60"
      />
    </div>

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-if="!isLoading && items.length === 0"
      class="rounded-card border border-dashed border-surface-border p-6 text-center text-sm text-ink/60"
    >
      صف بررسی خالی است؛ رسید در انتظاری وجود ندارد.
    </p>

    <TransitionGroup name="list" tag="ul" class="space-y-2">
      <li
        v-for="item in items"
        :key="item.receiptId"
        class="flex flex-col gap-3 rounded-card border border-surface-border bg-surface p-4 sm:flex-row sm:items-center"
      >
        <button type="button" class="shrink-0" @click="lightboxImage = getImageUrl(item.imageKey)">
          <img
            :src="getImageUrl(item.imageKey)"
            alt="تصویر رسید"
            class="h-16 w-16 rounded-control border border-surface-border object-cover"
          />
        </button>

        <div class="min-w-0 flex-1">
          <p class="text-heading text-ink">{{ item.uploaderName ?? 'ناشناس' }} — واحد طبقه {{ item.unitFloor }}</p>
          <p class="text-xs text-ink/60">مبلغ: {{ item.billAmount.toLocaleString('fa-IR') }} تومان</p>
        </div>

        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            class="rounded-control bg-success px-3 py-1.5 text-xs text-white transition hover:opacity-90 disabled:opacity-50"
            :disabled="isSubmitting"
            @click="confirmReceipt(item.receiptId)"
          >
            تأیید
          </button>
          <button
            type="button"
            class="rounded-control bg-danger px-3 py-1.5 text-xs text-white transition hover:opacity-90 disabled:opacity-50"
            :disabled="isSubmitting"
            @click="openReject(item.receiptId)"
          >
            رد
          </button>
        </div>
      </li>
    </TransitionGroup>

    <button
      v-if="nextCursor"
      type="button"
      class="w-full rounded-control border border-surface-border py-2 text-sm text-ink/70 transition hover:bg-secondary"
      @click="loadQueue(nextCursor)"
    >
      نمایش موارد بیشتر
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxImage"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          @click="lightboxImage = null"
        >
          <img :src="lightboxImage" alt="تصویر بزرگ رسید" class="max-h-[85vh] max-w-full rounded-card shadow-overlay" />
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="activeReviewId"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
        >
          <div class="w-full max-w-sm rounded-card border border-surface-border bg-surface p-4 shadow-overlay">
            <p class="mb-2 text-heading text-ink">دلیل رد رسید</p>
            <textarea
              v-model="rejectNote"
              rows="3"
              class="w-full rounded-control border border-surface-border p-2 text-sm focus:border-primary focus:outline-none"
              placeholder="مثلاً: مبلغ واریزی با صورت‌حساب مطابقت ندارد."
            />
            <div class="mt-3 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-control border border-surface-border px-3 py-1.5 text-sm text-ink/70 hover:bg-secondary"
                @click="closeReject"
              >
                انصراف
              </button>
              <button
                type="button"
                class="rounded-control bg-danger px-3 py-1.5 text-sm text-white disabled:opacity-50"
                :disabled="rejectNote.trim().length < 3 || isSubmitting"
                @click="submitReject"
              >
                ثبت رد
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active,
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
