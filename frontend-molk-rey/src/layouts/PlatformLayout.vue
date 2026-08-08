<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-secondary/40" dir="rtl">
    <header class="border-b border-surface-border bg-surface p-4">
      <p class="text-heading text-primary">ملک ری — مدیریت پلتفرم</p>
    </header>
    <main class="mx-auto max-w-4xl p-4 sm:p-6">
      <router-view />
    </main>
  </div>
</template>
