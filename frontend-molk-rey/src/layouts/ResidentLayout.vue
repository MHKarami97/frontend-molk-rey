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
  { key: 'facilities', label: 'مشاعات', icon: '🏛️', to: '/resident/facilities' },
];

const desktopNavItems = [
  ...bottomNavItems,
  { key: 'polls', label: 'رأی‌گیری', icon: '🗳️', to: '/resident/polls' },
];
</script>

<template>
  <div class="min-h-screen bg-secondary/40 pb-20 sm:pb-0" dir="rtl">
    <header class="hidden border-b border-surface-border bg-surface p-4 sm:flex sm:items-center sm:justify-between">
      <p class="text-heading text-primary">ملک ری</p>
      <nav class="flex gap-4">
        <router-link
          v-for="item in desktopNavItems"
          :key="item.key"
          :to="item.to"
          class="text-sm text-ink/70 hover:text-primary"
          active-class="text-primary"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </header>

    <div class="p-4 sm:hidden">
      <UnitSwitcher />
    </div>

    <main class="p-4 sm:p-6">
      <router-view />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-surface-border bg-surface py-2 sm:hidden">
      <router-link
        v-for="item in bottomNavItems"
        :key="item.key"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 px-2 text-xs text-ink/70"
        active-class="text-primary"
      >
        <span class="text-lg">{{ item.icon }}</span>
        {{ item.label }}
      </router-link>
    </nav>
  </div>
</template>
