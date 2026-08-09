<script setup lang="ts">
import OfflineBadge from './components/pwa/OfflineBadge.vue';
import InstallPromptBanner from './components/pwa/InstallPromptBanner.vue';
import UpdateAvailableBanner from './components/pwa/UpdateAvailableBanner.vue';
import ToastContainer from './components/common/ToastContainer.vue';
</script>

<template>
  <OfflineBadge />
  <router-view />
  <InstallPromptBanner />
  <UpdateAvailableBanner />
  <ToastContainer />
</template>
