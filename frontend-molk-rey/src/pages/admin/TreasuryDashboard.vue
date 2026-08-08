<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useAdminStore } from '../../stores/useAdminStore';

Chart.register(...registerables);

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  unpaidBillsCount: number;
}

const store = useAdminStore();
const summary = ref<Summary | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// رنگ‌ها مستقیماً از Design Tokens مرحله ۱، نه رنگ پیش‌فرض Chart.js
const COLORS = { primary: '#B5502F', success: '#2F7D5A', danger: '#B23B3B', ink: '#2B2521' };

async function loadSummary() {
  if (!store.selectedBuildingId) return;
  isLoading.value = true;
  error.value = null;
  try {
    summary.value = await apiFetch<Summary>(
      `/admin/reports/summary?buildingId=${store.selectedBuildingId}`
    );
    renderChart();
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت گزارش صندوق.';
  } finally {
    isLoading.value = false;
  }
}

function renderChart() {
  if (!chartCanvas.value || !summary.value) return;
  chartInstance?.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: ['درآمد', 'هزینه'],
      datasets: [
        {
          data: [summary.value.totalIncome, summary.value.totalExpense],
          backgroundColor: [COLORS.success, COLORS.danger],
          borderRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: COLORS.ink }, grid: { color: '#E4D9C9' } },
        x: { ticks: { color: COLORS.ink }, grid: { display: false } },
      },
    },
  });
}

onMounted(loadSummary);
watch(() => store.selectedBuildingId, loadSummary);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-heading text-ink">داشبورد صندوق</h1>

    <div v-if="isLoading" class="grid gap-3 sm:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <template v-else-if="summary">
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">مجموع درآمد</p>
          <p class="mt-1 text-hero text-success">{{ summary.totalIncome.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">مجموع هزینه</p>
          <p class="mt-1 text-hero text-danger">{{ summary.totalExpense.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="rounded-card border border-surface-border bg-surface p-4">
          <p class="text-label text-ink/60">موجودی صندوق</p>
          <p class="mt-1 text-hero text-primary">{{ summary.balance.toLocaleString('fa-IR') }}</p>
        </div>
      </div>

      <p class="text-sm text-ink/70">تعداد صورتحساب‌های پرداخت‌نشده: {{ summary.unpaidBillsCount }}</p>

      <div class="rounded-card border border-surface-border bg-surface p-4">
        <canvas ref="chartCanvas" height="220" />
      </div>
    </template>
  </div>
</template>
