<script setup lang="ts">
import { ref } from 'vue';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwlevndk';

const form = ref({ name: '', email: '', message: '' });
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const error = ref<string | null>(null);

async function submit() {
  isSubmitting.value = true;
  error.value = null;

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        message: form.value.message,
      }),
    });

    if (!response.ok) {
      throw new Error('ارسال پیام ناموفق بود.');
    }

    isSubmitted.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'خطایی رخ داد؛ لطفاً دوباره تلاش کنید.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-14">
    <h1 class="text-hero text-ink">تماس با ما</h1>
    <p class="mt-3 text-sm text-ink/70">
      سؤالی درباره ملک‌ری دارید یا می‌خواهید برای ساختمان خود دمو بگیرید؟ فرم زیر را پر کنید.
    </p>

    <form v-if="!isSubmitted" class="mt-8 space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-xs text-ink/60">نام و نام خانوادگی</label>
        <input
          v-model="form.name"
          placeholder="نام کامل خود را وارد کنید"
          class="w-full rounded-control border border-surface-border p-3 text-sm"
          required
        />
      </div>

      <div>
        <label class="mb-1 block text-xs text-ink/60">ایمیل یا شماره تماس</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="مثلاً you@example.com"
          class="w-full rounded-control border border-surface-border p-3 text-sm"
          required
        />
      </div>

      <div>
        <label class="mb-1 block text-xs text-ink/60">پیام شما</label>
        <textarea
          v-model="form.message"
          rows="5"
          placeholder="پیام خود را بنویسید"
          class="w-full rounded-control border border-surface-border p-3 text-sm"
          required
        />
      </div>

      <button
        type="submit"
        class="w-full rounded-control bg-primary py-3 text-sm text-white transition hover:bg-primary-dark disabled:opacity-50"
        :disabled="isSubmitting"
      >
        ارسال پیام
      </button>
    </form>

    <div v-else class="mt-8 rounded-card border border-success/30 bg-success/5 p-6 text-center">
      <p class="text-heading text-success">پیام شما ثبت شد</p>
      <p class="mt-1 text-sm text-ink/70">به‌زودی با شما تماس می‌گیریم.</p>
    </div>

    <div class="mt-10 space-y-2 text-sm text-ink/70">
      <p>ایمیل: info@molkrey.ir</p>
      <p>پشتیبانی تلفنی: هر روز ۹ تا ۱۸</p>
    </div>
  </div>
</template>
