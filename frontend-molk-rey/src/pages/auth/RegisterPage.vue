<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const phone = ref('');
const password = ref('');
const role = ref<'admin' | 'owner' | 'resident'>('owner');
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const roleOptions = [
  { value: 'admin', label: 'مدیر ساختمان (می‌خواهم ساختمان جدید ثبت کنم)' },
  { value: 'owner', label: 'مالک واحد' },
  { value: 'resident', label: 'ساکن (اجاره‌نشین)' },
] as const;

async function submit() {
  isSubmitting.value = true;
  error.value = null;

  const result = await authStore.register({
    name: name.value,
    phone: phone.value,
    password: password.value,
    role: role.value,
  });

  if (!result.ok) {
    error.value = result.message;
    isSubmitting.value = false;
    return;
  }

  router.push(authStore.getHomeRouteForRole(authStore.role));
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-8" dir="rtl">
    <div class="rounded-card border border-surface-border bg-surface p-6">
      <p class="text-hero text-primary">ملک‌ری</p>
      <p class="mt-1 text-sm text-ink/60">ثبت‌نام در سامانه</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-xs text-ink/60">من هستم:</label>
          <select v-model="role" class="w-full rounded-control border border-surface-border p-3 text-sm">
            <option v-for="option in roleOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <input
          v-model="name"
          placeholder="نام و نام خانوادگی"
          autocomplete="name"
          class="w-full rounded-control border border-surface-border p-3 text-sm"
          required
        />
        <input
          v-model="phone"
          type="tel"
          placeholder="شماره تلفن (مثلاً 09123456789)"
          autocomplete="tel"
          class="w-full rounded-control border border-surface-border p-3 text-sm"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="رمز عبور (حداقل ۸ کاراکتر)"
          autocomplete="new-password"
          class="w-full rounded-control border border-surface-border p-3 text-sm"
          required
          minlength="8"
        />

        <p v-if="role !== 'admin'" class="rounded-control border border-dashed border-surface-border bg-secondary/40 p-2 text-xs text-ink/60">
          بعد از ثبت‌نام، حساب شما ساخته می‌شود اما هنوز به هیچ واحدی متصل نیست؛
          مدیر ساختمان شما باید با همین شماره تلفن، شما را به واحد مربوطه متصل کند.
        </p>

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <button
          type="submit"
          class="w-full rounded-control bg-primary py-3 text-sm text-white transition hover:bg-primary-dark disabled:opacity-50"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام' }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-ink/60">
        حساب دارید؟ <router-link to="/login" class="text-primary hover:underline">وارد شوید</router-link>
      </p>
    </div>

    <router-link to="/" class="mt-4 text-center text-xs text-ink/50 hover:text-primary">
      بازگشت به صفحه اصلی
    </router-link>
  </div>
</template>
