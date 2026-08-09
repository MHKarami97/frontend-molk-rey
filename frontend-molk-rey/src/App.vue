<script setup lang="ts">
import OfflineBadge from './components/pwa/OfflineBadge.vue';
import InstallPromptBanner from './components/pwa/InstallPromptBanner.vue';
import UpdateAvailableBanner from './components/pwa/UpdateAvailableBanner.vue';
</script>

<template>
  <OfflineBadge />
  <router-view />
  <InstallPromptBanner />
  <UpdateAvailableBanner />
</template>
