<script setup lang="ts">
import { ref } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useAdminStore } from '../../stores/useAdminStore';
import ConfirmModal from '../../components/common/ConfirmModal.vue';

interface PreviewRow {
  unitId: string;
  floor: number;
  area: number;
  amount: number;
}

const store = useAdminStore();
const strategyType = ref<'fixed' | 'area_based' | 'hybrid'>('area_based');
const fixedAmount = ref(500000);
const amountPerSquareMeter = ref(15000);
const baseAmount = ref(200000);
const dueDate = ref('');

const preview = ref<PreviewRow[]>([]);
const isPreviewing = ref(false);
const isGenerating = ref(false);
const error = ref<string | null>(null);
const showConfirm = ref(false);

function buildParams() {
  if (strategyType.value === 'fixed') return { fixedAmount: fixedAmount.value };
  if (strategyType.value === 'area_based') return { amountPerSquareMeter: amountPerSquareMeter.value };
  return { baseAmount: baseAmount.value, amountPerSquareMeter: amountPerSquareMeter.value };
}

async function loadPreview() {
  if (!store.selectedBuildingId) return;
  isPreviewing.value = true;
  error.value = null;
  try {
    preview.value = await apiFetch<PreviewRow[]>('/admin/bills/generate-batch/preview', {
      method: 'POST',
      body: JSON.stringify({
        buildingId: store.selectedBuildingId,
        strategyType: strategyType.value,
        params: buildParams(),
      }),
    });
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در پیش‌نمایش محاسبه.';
  } finally {
    isPreviewing.value = false;
  }
}

async function generateBatch() {
  if (!store.selectedBuildingId || !dueDate.value) return;
  isGenerating.value = true;
  try {
    await apiFetch('/admin/bills/generate-batch', {
      method: 'POST',
      body: JSON.stringify({
        buildingId: store.selectedBuildingId,
        strategyType: strategyType.value,
        params: buildParams(),
        dueDate: dueDate.value,
      }),
    });
    preview.value = [];
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'صدور دسته‌جمعی ناموفق بود.';
  } finally {
    isGenerating.value = false;
    showConfirm.value = false;
  }
}

const totalAmount = () => preview.value.reduce((sum, row) => sum + row.amount, 0);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-heading text-ink">صدور صورتحساب</h1>

    <div class="rounded-card border border-surface-border bg-surface p-4 space-y-3">
      <label class="block text-sm text-ink/70">روش محاسبه شارژ</label>
      <select v-model="strategyType" class="w-full rounded-control border border-surface-border p-2 text-sm">
        <option value="fixed">مبلغ ثابت</option>
        <option value="area_based">بر اساس متراژ</option>
        <option value="hybrid">ترکیبی (پایه + متراژ)</option>
      </select>

      <input
        v-if="strategyType === 'fixed'"
        v-model.number="fixedAmount"
        type="number"
        placeholder="مبلغ ثابت (تومان)"
        class="w-full rounded-control border border-surface-border p-2 text-sm"
      />
      <template v-if="strategyType === 'area_based' || strategyType === 'hybrid'">
        <input
          v-model.number="amountPerSquareMeter"
          type="number"
          placeholder="مبلغ به ازای هر متر"
          class="w-full rounded-control border border-surface-border p-2 text-sm"
        />
      </template>
      <input
        v-if="strategyType === 'hybrid'"
        v-model.number="baseAmount"
        type="number"
        placeholder="مبلغ پایه ثابت"
        class="w-full rounded-control border border-surface-border p-2 text-sm"
      />

      <input v-model="dueDate" type="date" class="w-full rounded-control border border-surface-border p-2 text-sm" />

      <button
        class="w-full rounded-control border border-surface-border py-2 text-sm hover:bg-secondary disabled:opacity-50"
        :disabled="isPreviewing"
        @click="loadPreview"
      >
        پیش‌نمایش محاسبه
      </button>
    </div>

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>

    <div v-if="isPreviewing" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-10 animate-pulse rounded-control bg-secondary/60" />
    </div>

    <div v-else-if="preview.length > 0" class="space-y-3">
      <table class="hidden w-full overflow-hidden rounded-card border border-surface-border bg-surface text-sm sm:table">
        <thead class="bg-secondary/60 text-label text-ink/70">
          <tr>
            <th class="p-3 text-right">طبقه</th>
            <th class="p-3 text-right">متراژ</th>
            <th class="p-3 text-right">مبلغ محاسبه‌شده</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in preview" :key="row.unitId" class="border-t border-surface-border">
            <td class="p-3">{{ row.floor }}</td>
            <td class="p-3">{{ row.area }} متر</td>
            <td class="p-3 font-sans text-heading text-primary">{{ row.amount.toLocaleString('fa-IR') }} تومان</td>
          </tr>
        </tbody>
      </table>

      <div class="space-y-2 sm:hidden">
        <div v-for="row in preview" :key="row.unitId" class="rounded-card border border-surface-border bg-surface p-3">
          <p class="text-ink">طبقه {{ row.floor }} — {{ row.area }} متر</p>
          <p class="text-hero text-primary">{{ row.amount.toLocaleString('fa-IR') }} تومان</p>
        </div>
      </div>

      <div class="rounded-card border border-surface-border bg-secondary/40 p-3 text-sm">
        مجموع کل: <span class="text-heading text-primary">{{ totalAmount().toLocaleString('fa-IR') }} تومان</span>
      </div>

      <button
        class="w-full rounded-control bg-primary py-2 text-white hover:bg-primary-dark disabled:opacity-50"
        :disabled="!dueDate || isGenerating"
        @click="showConfirm = true"
      >
        صدور نهایی برای {{ preview.length }} واحد
      </button>
    </div>

    <ConfirmModal
      :open="showConfirm"
      title="صدور دسته‌جمعی صورتحساب"
      :description="`این عملیات برای ${preview.length} واحد صورتحساب جدید صادر می‌کند و غیرقابل بازگشت است.`"
      confirm-label="صدور نهایی"
      danger
      @confirm="generateBatch"
      @cancel="showConfirm = false"
    />
  </div>
</template>
