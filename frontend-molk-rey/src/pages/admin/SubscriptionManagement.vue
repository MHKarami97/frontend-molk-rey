<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useAdminStore } from '../../stores/useAdminStore';

interface SubscriptionStatus {
  plan: 'free' | 'pro';
  maxUnits: number;
  currentUnitCount: number;
  isLimitReached: boolean;
}

interface UploadUrlResponse {
  receiptId: string;
  uploadUrl: string;
  expiresAt: string;
}

const store = useAdminStore();
const status = ref<SubscriptionStatus | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const amount = ref(0);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const uploadStage = ref<'idle' | 'uploading' | 'success' | 'error'>('idle');
const uploadError = ref<string | null>(null);

async function loadStatus() {
  if (!store.selectedBuildingId) return;
  isLoading.value = true;
  error.value = null;
  try {
    status.value = await apiFetch<SubscriptionStatus>(
      `/admin/subscription/status?buildingId=${store.selectedBuildingId}`
    );
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت وضعیت اشتراک.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchBuildings();
  await loadStatus();
});
watch(() => store.selectedBuildingId, loadStatus);

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

async function submitReceipt() {
  if (!store.selectedBuildingId || !selectedFile.value || amount.value <= 0) return;

  uploadStage.value = 'uploading';
  uploadError.value = null;

  try {
    const { receiptId, uploadUrl } = await apiFetch<UploadUrlResponse>('/admin/subscription/upload-url', {
      method: 'POST',
      body: JSON.stringify({
        buildingId: store.selectedBuildingId,
        contentType: selectedFile.value.type || 'image/jpeg',
        fileSizeBytes: selectedFile.value.size,
        amount: amount.value,
      }),
    });

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': selectedFile.value.type || 'image/jpeg' },
      body: selectedFile.value,
    });

    uploadStage.value = 'success';
    void receiptId;
  } catch (e) {
    uploadError.value = e instanceof ApiError ? e.message : 'ارسال رسید ناموفق بود.';
    uploadStage.value = 'error';
  }
}

const usagePercent = () => {
  if (!status.value) return 0;
  return Math.min(100, Math.round((status.value.currentUnitCount / status.value.maxUnits) * 100));
};
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-heading text-ink">اشتراک ساختمان</h1>

    <div v-if="isLoading" class="h-32 animate-pulse rounded-card border border-surface-border bg-secondary/60" />

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <template v-else-if="status">
      <div class="rounded-card border border-surface-border bg-surface p-5">
        <div class="flex items-center justify-between">
          <p class="text-heading text-ink">
            پلن فعلی:
            <span :class="status.plan === 'pro' ? 'text-success' : 'text-primary'">
              {{ status.plan === 'pro' ? 'حرفه‌ای (Pro)' : 'رایگان' }}
            </span>
          </p>
        </div>

        <div class="mt-3">
          <div class="flex justify-between text-xs text-ink/60">
            <span>واحدهای استفاده‌شده</span>
            <span>{{ status.currentUnitCount }} از {{ status.plan === 'pro' ? 'نامحدود' : status.maxUnits }}</span>
          </div>
          <div v-if="status.plan === 'free'" class="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              class="h-full transition-all"
              :class="status.isLimitReached ? 'bg-danger' : 'bg-primary'"
              :style="{ width: `${usagePercent()}%` }"
            />
          </div>
        </div>

        <p v-if="status.isLimitReached" class="mt-3 rounded-control border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          سقف پلن رایگان ({{ status.maxUnits }} واحد) پر شده است. برای افزودن واحد جدید، اشتراک خود را ارتقا دهید.
        </p>
      </div>

      <div v-if="status.plan === 'free'" class="rounded-card border border-surface-border bg-surface p-5">
        <p class="text-heading text-ink">ارتقا به پلن حرفه‌ای (Pro)</p>
        <p class="mt-1 text-sm text-ink/60">
          مبلغ را واریز و رسید پرداخت را ارسال کنید؛ پس از تأیید توسط مدیریت پلتفرم، محدودیت تعداد واحد برداشته می‌شود.
        </p>

        <div v-if="uploadStage !== 'success'" class="mt-4 space-y-3">
          <input
            v-model.number="amount"
            type="number"
            placeholder="مبلغ واریزی (تومان)"
            class="w-full rounded-control border border-surface-border p-2 text-sm"
          />

          <label class="flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-surface-border bg-secondary/40 p-6 text-center">
            <img v-if="previewUrl" :src="previewUrl" alt="پیش‌نمایش رسید" class="mb-2 max-h-40 rounded-control object-contain" />
            <span v-else class="text-sm text-ink/60">برای انتخاب تصویر رسید کلیک کنید</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onFileChange" />
          </label>

          <p v-if="uploadError" class="text-sm text-danger">{{ uploadError }}</p>

          <button
            class="w-full rounded-control bg-primary py-2 text-sm text-white hover:bg-primary-dark disabled:opacity-50"
            :disabled="!selectedFile || amount <= 0 || uploadStage === 'uploading'"
            @click="submitReceipt"
          >
            {{ uploadStage === 'uploading' ? 'در حال ارسال...' : 'ارسال رسید خرید اشتراک' }}
          </button>
        </div>

        <p v-else class="mt-4 rounded-control border border-success/30 bg-success/5 p-3 text-sm text-success">
          رسید ارسال شد و در انتظار بررسی مدیریت پلتفرم است.
        </p>
      </div>
    </template>
  </div>
</template>
