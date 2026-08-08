<script setup lang="ts">
import OfflineBadge from './components/pwa/OfflineBadge.vue';
import InstallPromptBanner from './components/pwa/InstallPromptBanner.vue';
</script>

<template>
  <OfflineBadge />
  <router-view />
  <InstallPromptBanner />
</template>
