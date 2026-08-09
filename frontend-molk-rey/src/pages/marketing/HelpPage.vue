<script setup lang="ts">
import { ref } from 'vue';

const faqs = [
  {
    q: 'چطور رسید پرداخت شارژ را ارسال کنم؟',
    a: 'در صفحه «شارژ» روی صورتحساب مورد نظر دکمه «ارسال رسید پرداخت» را بزنید، عکس فیش یا رسید بانکی را انتخاب کنید و ارسال کنید. مدیر ساختمان آن را بررسی و تأیید می‌کند.',
  },
  {
    q: 'اگر رسیدم رد شود چه اتفاقی می‌افتد؟',
    a: 'دلیل رد شدن رسید برای شما نمایش داده می‌شود و صورتحساب به وضعیت «در انتظار پرداخت» برمی‌گردد تا رسید صحیح را دوباره ارسال کنید.',
  },
  {
    q: 'چطور مشاعات (سالن اجتماعات، پارکینگ مهمان) را رزرو کنم؟',
    a: 'از منوی «رزرو مشاعات»، امکان مورد نظر و تاریخ را انتخاب کنید. ساعت‌های خالی قابل انتخاب هستند و ساعت‌های رزروشده به‌صورت خودکار غیرفعال می‌شوند.',
  },
  {
    q: 'چند واحد دارم؛ چطور بین آن‌ها جابه‌جا شوم؟',
    a: 'اگر مالک یا ساکن بیش از یک واحد باشید، یک منوی انتخاب واحد در بالای صفحه نمایش داده می‌شود که می‌توانید واحد فعال را از آن تغییر دهید.',
  },
  {
    q: 'چطور درخواست تعمیر ثبت کنم؟',
    a: 'از منوی «تعمیرات» دکمه «درخواست جدید» را بزنید و مشکل را توضیح دهید. وضعیت درخواست از «ثبت‌شده» تا «برطرف‌شده» در همان صفحه قابل پیگیری است.',
  },
];

const openIndex = ref<number | null>(null);

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index;
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-14">
    <h1 class="text-hero text-ink">راهنما</h1>
    <p class="mt-3 text-sm text-ink/70">پاسخ سؤالات پرتکرار درباره استفاده از ملک‌ری.</p>

    <div class="mt-8 space-y-2">
      <div v-for="(faq, index) in faqs" :key="faq.q" class="rounded-card border border-surface-border bg-surface">
        <button
          type="button"
          class="flex w-full items-center justify-between p-4 text-right text-sm text-ink"
          @click="toggle(index)"
        >
          <span>{{ faq.q }}</span>
          <span>{{ openIndex === index ? '−' : '+' }}</span>
        </button>
        <div v-if="openIndex === index" class="border-t border-surface-border p-4 text-sm text-ink/70">
          {{ faq.a }}
        </div>
      </div>
    </div>

    <p class="mt-10 text-sm text-ink/70">
      پاسخ خود را پیدا نکردید؟ از <router-link to="/contact" class="text-primary hover:underline">صفحه تماس با ما</router-link> با ما در ارتباط باشید.
    </p>
  </div>
</template>
