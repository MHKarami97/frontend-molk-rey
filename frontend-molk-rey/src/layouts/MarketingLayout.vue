<script setup lang="ts">
import { ref } from 'vue';

const isMenuOpen = ref(false);

const navItems = [
  { label: 'خانه', to: '/' },
  { label: 'امکانات', to: '/#features' },
  { label: 'نظرات کاربران', to: '/#testimonials' },
  { label: 'درباره ما', to: '/about' },
  { label: 'راهنما', to: '/help' },
  { label: 'تماس با ما', to: '/contact' },
];
</script>

<template>
  <div class="min-h-screen bg-secondary/40" dir="rtl">
    <header class="sticky top-0 z-40 border-b border-surface-border bg-surface/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between p-4">
        <router-link to="/" class="text-heading text-primary">ملک‌ری</router-link>

        <!-- اصلاح حیاتی: قبلاً <a href> بود که باعث Reload کامل صفحه
        می‌شد؛ router-link از History API استفاده می‌کند و SPA را در
        می‌کند (بدون Reload)، حتی برای مسیرهای دارای Hash متل /#features. -->
        <nav class="hidden gap-6 sm:flex">
          <router-link
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="text-sm text-ink/70 transition hover:text-primary"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <div class="hidden items-center gap-2 sm:flex">
          <router-link
            to="/register"
            class="rounded-control bg-primary px-4 py-1.5 text-sm text-white hover:bg-primary-dark"
          >
            ثبت‌نام
          </router-link>
          <router-link
            to="/login"
            class="rounded-control border border-surface-border px-4 py-1.5 text-sm text-ink/80 hover:bg-secondary"
          >
            ورود
          </router-link>
        </div>

        <button class="sm:hidden" @click="isMenuOpen = !isMenuOpen">☰</button>
      </div>

      <nav v-if="isMenuOpen" class="flex flex-col gap-1 border-t border-surface-border p-4 sm:hidden">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="rounded-control px-3 py-2 text-sm text-ink/80 hover:bg-secondary"
          @click="isMenuOpen = false"
        >
          {{ item.label }}
        </router-link>
        <router-link
          to="/register"
          class="mt-1 rounded-control bg-primary px-3 py-2 text-center text-sm text-white"
          @click="isMenuOpen = false"
        >
          ثبت‌نام
        </router-link>
        <router-link
          to="/login"
          class="rounded-control border border-surface-border px-3 py-2 text-center text-sm text-ink/80"
          @click="isMenuOpen = false"
        >
          ورود
        </router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="border-t border-surface-border bg-surface p-6 text-center text-xs text-ink/50">
      <p>© {{ new Date().getFullYear() }} ملک‌ری — سامانه مدیریت ساختمان</p>
      <div class="mt-2 flex justify-center gap-4">
        <router-link to="/about" class="hover:text-primary">درباره ما</router-link>
        <router-link to="/help" class="hover:text-primary">راهنما</router-link>
        <router-link to="/contact" class="hover:text-primary">تماس با ما</router-link>
      </div>
    </footer>
  </div>
</template>
