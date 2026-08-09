<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const phone = ref("");
const password = ref("");
const isSubmitting = ref(false);
const error = ref<string | null>(null);

async function submit() {
  isSubmitting.value = true;
  error.value = null;

  const result = await authStore.login(phone.value, password.value);

  if (!result.ok) {
    error.value = result.message;
    isSubmitting.value = false;
    return;
  }

  const redirectTo =
    (route.query.redirect as string) ||
    authStore.getHomeRouteForRole(authStore.role);
  router.push(redirectTo);
}
</script>

<template>
  <div
    class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4"
    dir="rtl"
  >
    <div class="rounded-card border border-surface-border bg-surface p-6">
      <p class="text-hero text-primary">ملک‌ری</p>
      <p class="mt-1 text-sm text-ink/60">ورود به حساب کاربری</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <input
          v-model="phone"
          type="tel"
          id="username"
          name="username"
          placeholder="شماره تلفن (مثلاً 09123456789)"
          autocomplete="username"
          class="w-full rounded-control border border-surface-border p-3 text-sm text-right"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="رمز عبور"
          autocomplete="current-password"
          class="w-full rounded-control border border-surface-border p-3 text-sm"
          required
        />

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <button
          type="submit"
          class="w-full rounded-control bg-primary py-3 text-sm text-white transition hover:bg-primary-dark disabled:opacity-50"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "در حال ورود..." : "ورود" }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-ink/60">
        حساب ندارید؟
        <router-link to="/register" class="text-primary hover:underline"
          >ثبت‌نام کنید</router-link
        >
      </p>
    </div>

    <router-link
      to="/"
      class="mt-4 text-center text-xs text-ink/50 hover:text-primary"
    >
      بازگشت به صفحه اصلی
    </router-link>
  </div>
</template>
