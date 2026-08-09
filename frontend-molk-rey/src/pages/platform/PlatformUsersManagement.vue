<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';

interface PlatformUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  platform_admin: 'مدیر پلتفرم',
  admin: 'مدیر ساختمان',
  board_member: 'عضو هیئت‌مدیره',
  resident: 'ساکن',
  owner: 'مالک',
};

const users = ref<PlatformUser[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const togglingId = ref<string | null>(null);

async function load() {
  isLoading.value = true;
  error.value = null;
  try {
    users.value = await apiFetch<PlatformUser[]>('/platform/users');
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت لیست کاربران.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);

async function toggleActive(user: PlatformUser) {
  togglingId.value = user.id;
  try {
    await apiFetch(`/platform/users/${user.id}/toggle-active`, { method: 'POST' });
    user.isActive = !user.isActive;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'تغییر وضعیت کاربر ناموفق بود.';
  } finally {
    togglingId.value = null;
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-heading text-ink">مدیریت کاربران</h1>
    <p class="text-xs text-ink/50">
      کاربر غیرفعال‌شده دیگر نمی‌تواند وارد شود؛ نشست فعال او حداکثر تا ۱۵ دقیقه دیگر منقضی می‌شود.
    </p>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <div v-else class="space-y-2">
      <div
        v-for="user in users"
        :key="user.id"
        class="flex items-center justify-between gap-3 rounded-card border border-surface-border bg-surface p-3"
      >
        <div class="min-w-0">
          <p class="text-heading text-ink">{{ user.name }}</p>
          <p class="text-xs text-ink/60" dir="ltr">{{ user.phone }}</p>
          <p class="text-xs text-ink/50">{{ ROLE_LABELS[user.role] ?? user.role }}</p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <span
            class="rounded-control px-2 py-0.5 text-xs"
            :class="user.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
          >
            {{ user.isActive ? 'فعال' : 'غیرفعال' }}
          </span>
          <button
            type="button"
            class="rounded-control border px-3 py-1.5 text-xs disabled:opacity-50"
            :class="
              user.isActive
                ? 'border-danger/40 text-danger hover:bg-danger/5'
                : 'border-success/40 text-success hover:bg-success/5'
            "
            :disabled="togglingId === user.id"
            @click="toggleActive(user)"
          >
            {{ user.isActive ? 'غیرفعال کردن' : 'فعال کردن' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
