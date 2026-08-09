<script setup lang="ts">
import { usePwaUpdate } from '../../composables/usePwaUpdate';

const { needRefresh, offlineReady, applyUpdate, dismissOfflineReady } = usePwaUpdate();
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="needRefresh"
      class="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-card border border-surface-border bg-surface p-4 shadow-overlay sm:inset-x-auto sm:right-4 sm:max-w-sm"
    >
      <div class="min-w-0">
        <p class="text-heading text-ink">نسخه جدید موجود است</p>
        <p class="mt-0.5 text-xs text-ink/60">برای استفاده از آخرین بهبودها، صفحه را به‌روزرسانی کنید.</p>
      </div>
      <button
        class="shrink-0 rounded-control bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary-dark"
        @click="applyUpdate"
      >
        به‌روزرسانی
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
