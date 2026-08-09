<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-secondary/40" dir="rtl">
    <header class="flex items-center justify-between border-b border-surface-border bg-surface p-4">
      <p class="text-heading text-primary">ملک‌ری — مدیریت پلتفرم</p>
      <div class="flex items-center gap-3">
        <router-link to="/platform/profile" class="text-sm text-ink/70 hover:text-primary">پروفایل</router-link>
        <button type="button" class="text-sm text-danger hover:underline" @click="handleLogout">خروج</button>
      </div>
    </header>
    <main class="mx-auto max-w-4xl p-4 sm:p-6">
      <router-view />
    </main>
  </div>
</template>
