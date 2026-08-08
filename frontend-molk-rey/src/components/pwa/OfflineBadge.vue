<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);

function updateStatus() {
  isOnline.value = navigator.onLine;
}

onMounted(() => {
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateStatus);
  window.removeEventListener('offline', updateStatus);
});
</script>

<template>
  <Transition name="fade">
    <div v-if="!isOnline" class="w-full bg-warning/10 py-1.5 text-center text-xs text-warning">
      آفلاین — برخی اطلاعات ممکن است به‌روز نباشد
    </div>
  </Transition>
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
