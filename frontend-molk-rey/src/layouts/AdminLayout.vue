<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminStore } from '../stores/useAdminStore';

const isDrawerOpen = ref(false);
const store = useAdminStore();

onMounted(() => store.fetchBuildings());

const navItems = [
  { key: 'buildings', label: 'ساختمان‌ها', to: '/admin/buildings' },
  { key: 'bills', label: 'صورتحساب', to: '/admin/bills' },
  { key: 'treasury', label: 'صندوق', to: '/admin/treasury' },
  { key: 'maintenance', label: 'تعمیرات', to: '/admin/maintenance' },
  { key: 'notices', label: 'اعلامیه‌ها', to: '/admin/notices' },
  { key: 'polls', label: 'رأی‌گیری', to: '/admin/polls' },
  { key: 'receipts', label: 'بررسی رسیدها', to: '/admin/receipts' },
];
</script>

<template>
  <div class="flex min-h-screen bg-secondary/40" dir="rtl">
    <!-- Drawer موبایل -->
    <Transition name="fade">
      <div
        v-if="isDrawerOpen"
        class="fixed inset-0 z-40 bg-ink/50 sm:hidden"
        @click="isDrawerOpen = false"
      />
    </Transition>

    <aside
      class="fixed inset-y-0 right-0 z-50 w-64 shrink-0 -translate-x-0 transform border-l border-surface-border bg-surface p-4 transition-transform duration-200 sm:static sm:translate-x-0"
      :class="isDrawerOpen ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'"
    >
      <div class="mb-6 flex items-center justify-between">
        <p class="text-heading text-primary">ملک ری</p>
        <button class="sm:hidden" @click="isDrawerOpen = false">✕</button>
      </div>

      <div v-if="store.buildings.length > 0" class="mb-4">
        <label class="mb-1 block text-xs text-ink/60">ساختمان فعال</label>
        <select
          class="w-full rounded-control border border-surface-border bg-surface p-2 text-sm"
          :value="store.selectedBuildingId"
          @change="store.selectBuilding(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="b in store.buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <nav class="space-y-1">
        <a
          v-for="item in navItems"
          :key="item.key"
          :href="item.to"
          class="block rounded-control px-3 py-2 text-sm text-ink/80 transition hover:bg-secondary"
        >
          {{ item.label }}
        </a>
      </nav>
    </aside>

    <div class="flex-1">
      <header class="flex items-center justify-between border-b border-surface-border bg-surface p-4 sm:hidden">
        <p class="text-heading text-primary">ملک ری</p>
        <button class="rounded-control border border-surface-border px-3 py-1.5 text-sm" @click="isDrawerOpen = true">
          منو
        </button>
      </header>

      <main class="p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
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
