<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
}>();

const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
        @click.self="emit('cancel')"
      >
        <div class="w-full max-w-sm rounded-card border border-surface-border bg-surface p-4 shadow-overlay">
          <p class="text-heading text-ink">{{ title }}</p>
          <p class="mt-1 text-sm text-ink/70">{{ description }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-control border border-surface-border px-3 py-1.5 text-sm text-ink/70 hover:bg-secondary"
              @click="emit('cancel')"
            >
              انصراف
            </button>
            <button
              type="button"
              class="rounded-control px-3 py-1.5 text-sm text-white"
              :class="danger ? 'bg-danger' : 'bg-primary'"
              @click="emit('confirm')"
            >
              {{ confirmLabel ?? 'تأیید' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
