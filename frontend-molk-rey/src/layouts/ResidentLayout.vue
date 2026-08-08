<script setup lang="ts">
import { onMounted } from 'vue';
import { useResidentStore } from '../stores/useResidentStore';
import UnitSwitcher from '../components/resident/UnitSwitcher.vue';

const store = useResidentStore();
onMounted(() => store.fetchUnits());

const bottomNavItems = [
  { key: 'home', label: 'خانه', icon: '🏠', to: '/resident/home' },
  { key: 'bills', label: 'شارژ', icon: '💳', to: '/resident/bills' },
  { key: 'maintenance', label: 'تعمیرات', icon: '🔧', to: '/resident/maintenance' },
  { key: 'notices', label: 'اعلامیه', icon: '📢', to: '/resident/notices' },
  { key: 'profile', label: 'پروفایل', icon: '👤', to: '/resident/profile' },
];

const desktopNavItems = [
  ...bottomNavItems,
  { key: 'facilities', label: 'رزرو مشاعات', icon: '🏛️', to: '/resident/facilities' },
  { key: 'polls', label: 'رأی‌گیری', icon: '🗳️', to: '/resident/polls' },
];
</script>

<template>
  <div class="min-h-screen bg-secondary/40 pb-20 sm:pb-0" dir="rtl">
    <!-- Top Nav فقط Desktop -->
    <header class="hidden border-b border-surface-border bg-surface p-4 sm:flex sm:items-center sm:justify-between">
      <p class="text-heading text-primary">ملک ری</p>
      <nav class="flex gap-4">
        <a v-for="item in desktopNavItems" :key="item.key" :href="item.to" class="text-sm text-ink/70 hover:text-primary">
          {{ item.label }}
        </a>
      </nav>
    </header>

    <div class="p-4 sm:hidden">
      <UnitSwitcher />
    </div>

    <main class="p-4 sm:p-6">
      <slot />
    </main>

    <!-- Bottom Navigation فقط موبایل -->
    <nav class="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-surface-border bg-surface py-2 sm:hidden">
      <a
        v-for="item in bottomNavItems"
        :key="item.key"
        :href="item.to"
        class="flex flex-col items-center gap-0.5 px-2 text-xs text-ink/70"
      >
        <span class="text-lg">{{ item.icon }}</span>
        {{ item.label }}
      </a>
    </nav>
  </div>
</template>
