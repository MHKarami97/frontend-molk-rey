<script setup lang="ts">
import { computed } from 'vue';
import type { ReceiptReviewStatus } from '../../types/receipt.types';

const props = defineProps<{ status: ReceiptReviewStatus }>();

const config = computed(() => {
  switch (props.status) {
    case 'confirmed':
      return { label: 'تأیید شده', classes: 'bg-success/10 text-success border-success/30' };
    case 'rejected':
      return { label: 'رد شده', classes: 'bg-danger/10 text-danger border-danger/30' };
    default:
      return { label: 'در انتظار بررسی', classes: 'bg-warning/10 text-warning border-warning/30' };
  }
});
</script>

<template>
  <span
    class="inline-flex items-center rounded-control border px-2 py-0.5 text-xs text-label"
    :class="config.classes"
  >
    {{ config.label }}
  </span>
</template>
