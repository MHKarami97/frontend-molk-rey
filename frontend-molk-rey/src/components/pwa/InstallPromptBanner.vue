<script setup lang="ts">
import { useInstallPrompt } from '../../composables/useInstallPrompt';

const { isInstallable, promptInstall, dismiss } = useInstallPrompt();
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="isInstallable"
      class="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-card border border-surface-border bg-surface p-4 shadow-overlay sm:inset-x-auto sm:left-4 sm:max-w-sm"
    >
      <div class="min-w-0">
        <p class="text-heading text-ink">نصب ملک‌ری</p>
        <p class="mt-0.5 text-xs text-ink/60">برای دسترسی سریع‌تر، این اپلیکیشن را روی دستگاه خود نصب کنید.</p>
      </div>
      <div class="flex shrink-0 gap-2">
        <button class="text-xs text-ink/50" @click="dismiss">بعدا</button>
        <button
          class="rounded-control bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary-dark"
          @click="promptInstall"
        >
          نصب
        </button>
      </div>
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
