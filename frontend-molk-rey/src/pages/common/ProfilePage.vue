<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const ROLE_LABELS: Record<string, string> = {
  platform_admin: 'مدیر پلتفرم',
  admin: 'مدیر ساختمان',
  board_member: 'عضو هیئت‌مدیره',
  resident: 'ساکن',
  owner: 'مالک',
};

const roleLabel = computed(() => (authStore.role ? ROLE_LABELS[authStore.role] ?? authStore.role : ''));

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-6">
    <h1 class="text-heading text-ink">پروفایل من</h1>

    <div v-if="authStore.user" class="rounded-card border border-surface-border bg-surface p-5">
      <div class="flex items-center gap-3">
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary"
        >
          👤
        </div>
        <div>
          <p class="text-heading text-ink">{{ authStore.user.name }}</p>
          <p class="mt-0.5 text-xs text-ink/60">{{ roleLabel }}</p>
        </div>
      </div>

      <div class="mt-5 space-y-3 border-t border-surface-border pt-4 text-sm">
        <div class="flex justify-between">
          <span class="text-ink/60">شماره تلفن</span>
          <span class="font-sans text-ink">{{ authStore.user.phone }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-ink/60">نقش کاربری</span>
          <span class="text-ink">{{ roleLabel }}</span>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="w-full rounded-control border border-danger/40 py-2.5 text-sm text-danger transition hover:bg-danger/5"
      @click="handleLogout"
    >
      خروج از حساب کاربری
    </button>
  </div>
</template>
