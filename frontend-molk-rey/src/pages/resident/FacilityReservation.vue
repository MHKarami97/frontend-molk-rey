<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useResidentStore } from '../../stores/useResidentStore';
import UnitSwitcher from '../../components/resident/UnitSwitcher.vue';
import PersianDatePicker from '../../components/common/PersianDatePicker.vue';

interface Facility {
  id: string;
  name: string;
}

interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
}

const store = useResidentStore();
const facilities = ref<Facility[]>([]);
const selectedFacilityId = ref<string | null>(null);
const reservations = ref<Reservation[]>([]);
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const isLoading = ref(true);
const error = ref<string | null>(null);
const isSubmitting = ref(false);

const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // ۸ صبح تا ۲۱

async function loadFacilities() {
  if (!store.activeUnit) return;
  facilities.value = await apiFetch<Facility[]>(`/resident/facilities?buildingId=${store.activeUnit.buildingId}`);
  // اصلاح noUncheckedIndexedAccess: facilities.value[0] می‌تواند undefined
  // باشد حتی وقتی length>0 چک شده (TS این را از روی .length نارو نمی‌کند)
  if (!selectedFacilityId.value) {
    selectedFacilityId.value = facilities.value[0]?.id ?? null;
  }
}

async function loadReservations() {
  if (!selectedFacilityId.value) return;
  isLoading.value = true;
  error.value = null;
  try {
    reservations.value = await apiFetch<Reservation[]>(`/resident/reservations?facilityId=${selectedFacilityId.value}`);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت رزروها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchUnits();
  await loadFacilities();
  await loadReservations();
});
watch(selectedFacilityId, loadReservations);

const occupiedHours = computed(() => {
  const dayStart = new Date(selectedDate.value);
  return new Set(
    reservations.value
      .filter((r) => new Date(r.startTime).toDateString() === dayStart.toDateString())
      .map((r) => new Date(r.startTime).getHours())
  );
});

async function reserveHour(hour: number) {
  if (!selectedFacilityId.value || !store.activeUnitId || occupiedHours.value.has(hour)) return;

  const startTime = new Date(selectedDate.value);
  startTime.setHours(hour, 0, 0, 0);
  const endTime = new Date(startTime);
  endTime.setHours(hour + 1);

  isSubmitting.value = true;
  try {
    await apiFetch('/resident/reservations', {
      method: 'POST',
      body: JSON.stringify({
        facilityId: selectedFacilityId.value,
        unitId: store.activeUnitId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      }),
    });
    await loadReservations();
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'رزرو ناموفق بود.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <UnitSwitcher />
    <h1 class="text-heading text-ink">رزرو مشاعات</h1>

    <div class="grid gap-3 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-xs text-ink/60">امکان رفاهی</label>
        <select v-model="selectedFacilityId" class="w-full rounded-control border border-surface-border p-2 text-sm">
          <option v-for="facility in facilities" :key="facility.id" :value="facility.id">{{ facility.name }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs text-ink/60">تاریخ (شمسی)</label>
        <PersianDatePicker v-model="selectedDate" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>

    <div v-if="isLoading" class="grid grid-cols-4 gap-2 sm:grid-cols-7">
      <div v-for="i in 14" :key="i" class="h-12 animate-pulse rounded-control bg-secondary/60" />
    </div>

    <div v-else class="grid grid-cols-4 gap-2 sm:grid-cols-7">
      <button
        v-for="hour in HOURS"
        :key="hour"
        type="button"
        class="rounded-control border p-2 text-xs transition"
        :class="
          occupiedHours.has(hour)
            ? 'cursor-not-allowed border-surface-border bg-secondary text-ink/40'
            : 'border-primary/40 bg-surface text-ink hover:bg-primary/10'
        "
        :disabled="occupiedHours.has(hour) || isSubmitting"
        @click="reserveHour(hour)"
      >
        {{ hour }}:۰۰
      </button>
    </div>
  </div>
</template>
