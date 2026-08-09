<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center" dir="rtl">
    <!-- الگوی گرافیکی ساده الهام از کاشی‌کاری، طبق زبان طراحی مرحله ۱،
    به‌جای یک آیکون 404 عمومی -->
    <div
      class="mb-6 h-24 w-24 rounded-card border border-surface-border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#E4D9C9_8px,#E4D9C9_9px)]"
    />

    <p class="text-hero text-primary">۴۰۴</p>
    <p class="mt-2 text-heading text-ink">صفحه مورد نظر پیدا نشد</p>
    <p class="mt-2 text-sm text-ink/60">
      ممکن است آدرس اشتباه وارد شده باشد یا این صفحه حذف شده باشد.
    </p>

    <div class="mt-6 flex gap-2">
      <button
        class="rounded-control border border-surface-border px-4 py-2 text-sm text-ink/80 hover:bg-secondary"
        @click="router.back()"
      >
        بازگشت
      </button>
      <router-link to="/" class="rounded-control bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark">
        صفحه اصلی
      </router-link>
    </div>
  </div>
</template>
