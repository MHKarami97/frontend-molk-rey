<script setup lang="ts">
import { ref } from 'vue';
import { usePaymentAccount } from '../../composables/usePaymentAccount';

const props = defineProps<{ buildingId: string }>();

const { accounts, isLoading, error } = usePaymentAccount(props.buildingId);

const revealedCardIds = ref<Set<string>>(new Set());
const copiedCardId = ref<string | null>(null);

function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, '');
  return `${digits.slice(0, 4)}-****-****-${digits.slice(-4)}`;
}

function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1-');
}

function toggleReveal(id: string) {
  if (revealedCardIds.value.has(id)) revealedCardIds.value.delete(id);
  else revealedCardIds.value.add(id);
}

async function copyCard(cardNumber: string, id: string) {
  await navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
  copiedCardId.value = id;
  setTimeout(() => {
    if (copiedCardId.value === id) copiedCardId.value = null;
  }, 1500);
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="isLoading" class="grid gap-3">
      <div
        v-for="i in 2"
        :key="i"
        class="h-24 animate-pulse rounded-card border border-surface-border bg-secondary/60"
      />
    </div>

    <p v-else-if="error" class="rounded-control border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
      {{ error }}
    </p>

    <p
      v-else-if="accounts.length === 0"
      class="rounded-card border border-dashed border-surface-border p-6 text-center text-sm text-ink/60"
    >
      شماره حسابی برای این ساختمان ثبت نشده است.
    </p>

    <div
      v-for="account in accounts"
      :key="account.id"
      class="rounded-card border border-surface-border bg-surface p-4"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-label text-ink/60">{{ account.bankName }}</p>
          <p class="mt-1 font-sans text-hero tabular-nums text-primary" dir="ltr">
            {{ revealedCardIds.has(account.id) ? formatCardNumber(account.cardNumber) : maskCardNumber(account.cardNumber) }}
          </p>
          <p class="mt-1 text-heading text-ink">{{ account.accountHolderName }}</p>
        </div>

        <div class="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            class="rounded-control border border-surface-border px-3 py-1 text-xs text-ink/70 transition hover:bg-secondary"
            @click="toggleReveal(account.id)"
          >
            {{ revealedCardIds.has(account.id) ? 'پنهان‌سازی' : 'نمایش کامل' }}
          </button>

          <button
            type="button"
            class="relative flex items-center gap-1 rounded-control bg-primary px-3 py-1.5 text-xs text-white transition hover:bg-primary-dark"
            @click="copyCard(account.cardNumber, account.id)"
          >
            <Transition name="fade" mode="out-in">
              <span v-if="copiedCardId === account.id" key="copied">کپی شد ✓</span>
              <span v-else key="copy">کپی شماره کارت</span>
            </Transition>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
