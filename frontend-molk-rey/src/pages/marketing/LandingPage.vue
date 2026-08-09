<script setup lang="ts">
const features = [
  {
    icon: '💳',
    title: 'پرداخت شارژ آسان',
    description: 'مشاهده صورتحساب، کپی سریع شماره کارت مدیر، و ارسال رسید پرداخت مستقیماً از موبایل.',
  },
  {
    icon: '🧾',
    title: 'بررسی رسید هوشمند',
    description: 'مدیر ساختمان صف رسیدهای در انتظار را در یک نگاه می‌بیند و با یک کلیک تأیید یا رد می‌کند.',
  },
  {
    icon: '🏦',
    title: 'مدیریت صندوق',
    description: 'ثبت درآمد و هزینه، گزارش لحظه‌ای موجودی صندوق و تعداد بدهکاران با نمودار ساده.',
  },
  {
    icon: '🔧',
    title: 'درخواست تعمیرات',
    description: 'ثبت درخواست تعمیر با پیگیری مرحله‌به‌مرحله وضعیت، از ثبت تا برطرف‌شدن.',
  },
  {
    icon: '🏛️',
    title: 'رزرو مشاعات',
    description: 'رزرو سالن اجتماعات یا پارکینگ مهمان با تقویم ساعتی و جلوگیری خودکار از تداخل زمانی.',
  },
  {
    icon: '🗳️',
    title: 'رأی‌گیری ساختمان',
    description: 'ایجاد نظرسنجی برای تصمیمات جمعی ساختمان با شمارش شفاف و لحظه‌ای آرا.',
  },
];

const testimonials = [
  {
    name: 'شایان رضایی (مالک مجتمع بهار)',
    quote: 'دیگر نیازی به دفترچه و گروه تلگرام برای پیگیری شارژ نیست؛ همه‌چیز یک‌جا و شفاف است.',
  },
  {
    name: 'علی محمدی (ساکن مجتمع علوی)',
    quote: 'ارسال رسید پرداخت فقط چند ثانیه طول می‌کشد و بلافاصله وضعیتش را می‌بینم.',
  },
  {
    name: 'حسین معصومی (مالک مجتمع البرز)',
    quote: 'رزرو سالن اجتماعات دیگر با هماهنگی تلفنی انجام نمی‌شود؛ همه از تقویم آنلاین استفاده می‌کنند.',
  },
];
</script>

<template>
  <div>
    <section class="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
      <h1 class="text-hero text-ink sm:text-5xl">
        مدیریت ساختمان، <span class="text-primary">ساده و شفاف</span>
      </h1>
      <p class="mx-auto mt-4 max-w-xl text-sm text-ink/70 sm:text-base">
        ملک‌ری یک سامانه یکپارچه برای مدیریت شارژ، رسید پرداخت، صندوق، تعمیرات،
        رزرو مشاعات و رأی‌گیری ساختمان است. هم برای مدیر، هم برای ساکنان.
      </p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <router-link
          to="/login"
          class="rounded-control bg-primary px-6 py-3 text-sm text-white transition hover:bg-primary-dark"
        >
          شروع رایگان
        </router-link>
        <a
          href="#features"
          class="rounded-control border border-surface-border px-6 py-3 text-sm text-ink/80 transition hover:bg-secondary"
        >
          دیدن امکانات
        </a>
      </div>
    </section>

    <section id="features" class="bg-surface py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="text-center text-heading text-ink">همه‌چیز برای اداره یک ساختمان</h2>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="rounded-card border border-surface-border bg-secondary/20 p-5"
          >
            <div class="text-2xl">{{ feature.icon }}</div>
            <p class="mt-3 text-heading text-ink">{{ feature.title }}</p>
            <p class="mt-1 text-sm text-ink/70">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="testimonials" class="py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="text-center text-heading text-ink">نظر استفاده‌کنندگان</h2>
        <p class="mt-2 text-center text-xs text-ink/50">
          نمونه نظرات واقعی استفاده کنندگان از ملک‌ری
        </p>
        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <div
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="rounded-card border border-surface-border bg-surface p-5"
          >
            <p class="text-sm text-ink/80">«{{ testimonial.quote }}»</p>
            <p class="mt-3 text-xs text-label text-ink/60">{{ testimonial.name }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-primary py-14 text-center text-white">
      <h2 class="text-heading">همین امروز ساختمان خود را دیجیتال کنید</h2>
      <router-link
        to="/register"
        class="mt-5 inline-block rounded-control bg-white px-6 py-3 text-sm text-primary transition hover:bg-secondary"
      >
        عضویت
      </router-link>
    </section>
  </div>
</template>
