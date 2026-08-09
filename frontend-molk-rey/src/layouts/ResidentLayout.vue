<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useResidentStore } from '../stores/useResidentStore';
import { useAuthStore } from '../stores/useAuthStore';
import UnitSwitcher from '../components/resident/UnitSwitcher.vue';

const store = useResidentStore();
const authStore = useAuthStore();
const router = useRouter();
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
  { key: 'profile', label: 'پروفایل', icon: '👤', to: '/resident/profile' },
];

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-secondary/40 pb-20 sm:pb-0" dir="rtl">
    <header class="hidden border-b border-surface-border bg-surface p-4 sm:flex sm:items-center sm:justify-between">
      <p class="text-heading text-primary">ملک‌ری</p>
      <nav class="flex items-center gap-4">
        <router-link
          v-for="item in desktopNavItems"
          :key="item.key"
          :to="item.to"
          class="text-sm text-ink/70 hover:text-primary"
          active-class="text-primary"
        >
          {{ item.label }}
        </router-link>
        <button type="button" class="text-sm text-danger hover:underline" @click="handleLogout">خروج</button>
      </nav>
    </header>

    <!-- هدر موبایل: قبلاً وجود نداشت; الان دسترسی به پروفایل و خروج را روی موبایل هم فراهم می‌کند -->
    <header class="flex items-center justify-between border-b border-surface-border bg-surface p-4 sm:hidden">
      <p class="text-heading text-primary">ملک‌ری</p>
      <div class="flex items-center gap-2">
        <router-link
          to="/resident/profile"
          class="flex h-9 w-9 items-center justify-center rounded-control border border-surface-border text-lg"
          aria-label="پروفایل من"
        >
          👤
        </router-link>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-control border border-danger/40 text-danger"
          aria-label="خروج از حساب"
          @click="handleLogout"
        >
          ⏻
        </button>
      </div>
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
