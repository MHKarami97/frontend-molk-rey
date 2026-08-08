<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useResidentStore } from '../../stores/useResidentStore';
import UnitSwitcher from '../../components/resident/UnitSwitcher.vue';
import ReceiptStatusBadge from '../../components/receipts/ReceiptStatusBadge.vue';
import PaymentCardDisplay from '../../components/receipts/PaymentCardDisplay.vue';
import ReceiptUploadForm from '../../components/receipts/ReceiptUploadForm.vue';
import ReceiptHistoryList from '../../components/receipts/ReceiptHistoryList.vue';

interface Bill {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid_pending_review' | 'approved' | 'rejected';
  penaltyAmount: number;
}

const store = useResidentStore();
const bills = ref<Bill[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const activeBillId = ref<string | null>(null);

async function load() {
  if (!store.activeUnitId) return;
  isLoading.value = true;
  error.value = null;
  try {
    bills.value = await apiFetch<Bill[]>(`/resident/units/${store.activeUnitId}/bills`);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت صورتحساب‌ها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchUnits();
  await load();
});
watch(() => store.activeUnitId, load);

function getImageUrl(imageKey: string): string {
  const base = import.meta.env.VITE_RECEIPTS_PUBLIC_BASE_URL ?? '/receipt-images';
  return `${base}/${imageKey}`;
}

function onUploaded() {
  activeBillId.value = null;
  load();
}
</script>

<template>
  <div class="space-y-6">
    <UnitSwitcher />
    <h1 class="text-heading text-ink">شارژ و پرداخت</h1>

    <div v-if="store.activeUnit">
      <p class="mb-2 text-label text-ink/60">شماره کارت‌های مدیر</p>
      <PaymentCardDisplay :building-id="store.activeUnit.buildingId" />
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-else-if="bills.length === 0"
      class="rounded-card border border-dashed border-surface-border p-8 text-center text-sm text-ink/60"
    >
      صورتحسابی برای این واحد ثبت نشده است.
    </p>

    <div v-else class="space-y-2">
      <div v-for="bill in bills" :key="bill.id" class="rounded-card border border-surface-border bg-surface p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-sans text-heading text-primary">{{ (bill.amount + bill.penaltyAmount).toLocaleString('fa-IR') }} تومان</p>
            <p class="text-xs text-ink/60">سررسید: {{ new Date(bill.dueDate).toLocaleDateString('fa-IR') }}</p>
          </div>
          <ReceiptStatusBadge :status="bill.status === 'approved' ? 'confirmed' : bill.status === 'rejected' ? 'rejected' : 'pending'" />
        </div>

        <button
          v-if="bill.status === 'pending'"
          class="mt-3 w-full rounded-control bg-primary py-2 text-sm text-white hover:bg-primary-dark"
          @click="activeBillId = activeBillId === bill.id ? null : bill.id"
        >
          {{ activeBillId === bill.id ? 'بستن فرم' : 'ارسال رسید پرداخت' }}
        </button>

        <div v-if="activeBillId === bill.id" class="mt-3">
          <ReceiptUploadForm :bill-id="bill.id" @uploaded="onUploaded" />
        </div>
      </div>
    </div>

    <div v-if="store.activeUnitId">
      <p class="mb-2 text-heading text-ink">تاریخچه رسیدها</p>
      <ReceiptHistoryList :unit-id="store.activeUnitId" :get-image-url="getImageUrl" />
    </div>
  </div>
</template>
