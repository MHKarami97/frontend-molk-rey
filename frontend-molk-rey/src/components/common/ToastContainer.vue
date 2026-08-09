<script setup lang="ts">
import { useToastStore } from '../../stores/useToastStore';

const toastStore = useToastStore();

const TYPE_CLASSES: Record<string, string> = {
  danger: 'border-danger/30 bg-danger text-white',
  success: 'border-success/30 bg-success text-white',
  info: 'border-surface-border bg-ink text-white',
};
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-x-4 top-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:left-4 sm:max-w-sm"
      dir="rtl"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="flex items-start justify-between gap-3 rounded-card border p-3 text-sm shadow-overlay"
          :class="TYPE_CLASSES[toast.type] ?? TYPE_CLASSES.info"
        >
          <span class="min-w-0">{{ toast.message }}</span>
          <button class="shrink-0 opacity-80 hover:opacity-100" @click="toastStore.remove(toast.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
