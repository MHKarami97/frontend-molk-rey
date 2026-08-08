<script setup lang="ts">
import { ref, computed } from 'vue';
import { useReceiptUpload } from '../../composables/useReceiptUpload';

const props = defineProps<{ billId: string }>();
const emit = defineEmits<{ (e: 'uploaded'): void }>();

const { stage, progress, errorMessage, previewUrl, selectFile, upload, retry } =
  useReceiptUpload(props.billId);

const fileInput = ref<HTMLInputElement | null>(null);
const isBusy = computed(() => stage.value === 'compressing' || stage.value === 'uploading');

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) await selectFile(file);
}

async function onSubmit() {
  const success = await upload();
  if (success) emit('uploaded');
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <label
      class="flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-surface-border bg-secondary/40 p-6 text-center transition hover:bg-secondary/60"
    >
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="پیش‌نمایش رسید"
        class="mb-3 max-h-48 rounded-control border border-surface-border object-contain"
      />
      <span v-else class="text-sm text-ink/60">برای انتخاب تصویر رسید کلیک کنید</span>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        :disabled="isBusy"
        @change="onFileChange"
      />
    </label>

    <Transition name="fade" mode="out-in">
      <p v-if="stage === 'compressing'" key="compressing" class="text-sm text-ink/60">
        در حال آماده‌سازی تصویر...
      </p>

      <div v-else-if="stage === 'uploading'" key="uploading" class="space-y-1">
        <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            class="h-full bg-primary transition-all duration-200"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <p class="text-xs text-ink/60">در حال آپلود... {{ progress }}٪</p>
      </div>

      <p v-else-if="stage === 'error'" key="error" class="text-sm text-danger">
        {{ errorMessage }}
      </p>

      <p v-else-if="stage === 'success'" key="success" class="text-sm text-success">
        رسید با موفقیت ارسال شد و در انتظار بررسی مدیر است.
      </p>
    </Transition>

    <div class="flex gap-2">
      <button
        type="submit"
        class="flex-1 rounded-control bg-primary px-4 py-2 text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isBusy || stage === 'success'"
      >
        ارسال رسید
      </button>

      <button
        v-if="stage === 'error'"
        type="button"
        class="rounded-control border border-surface-border px-4 py-2 text-ink transition hover:bg-secondary"
        @click="retry"
      >
        تلاش مجدد
      </button>
    </div>
  </form>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
