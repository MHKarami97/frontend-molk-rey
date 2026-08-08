<script setup lang="ts">
defineProps<{ open: boolean; title: string }>();
const emit = defineEmits<{ (e: 'close'): void }>();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 bg-ink/50" @click.self="emit('close')">
        <Transition name="sheet">
          <div
            v-if="open"
            class="fixed inset-x-0 bottom-0 rounded-t-card border-t border-surface-border bg-surface p-4 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card"
          >
            <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-secondary sm:hidden" />
            <div class="mb-3 flex items-center justify-between">
              <p class="text-heading text-ink">{{ title }}</p>
              <button class="text-ink/60" @click="emit('close')">✕</button>
            </div>
            <slot />
          </div>
        </Transition>
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
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
