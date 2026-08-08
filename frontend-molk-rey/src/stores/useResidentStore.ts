import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { apiFetch } from '../lib/api/http';

export interface ResidentUnit {
  id: string;
  buildingId: string;
  buildingName: string;
  area: number;
  floor: number;
  relation: 'owner' | 'resident';
}

const STORAGE_KEY = 'molk_rey_active_unit_id';

/**
 * useResidentStore: چون یک کاربر می‌تواند هم‌زمان مالک/ساکن چند واحد باشد،
 * انتخاب «واحد فعال» در Frontend نگهداری و در localStorage Persist می‌شود
 * (طبق الزام صریح مرحله ۵ — نه در Backend Session).
 */
export const useResidentStore = defineStore('resident', () => {
  const units = ref<ResidentUnit[]>([]);
  const activeUnitId = ref<string | null>(localStorage.getItem(STORAGE_KEY));
  const isLoading = ref(false);

  const activeUnit = computed(() => units.value.find((u) => u.id === activeUnitId.value) ?? null);

  async function fetchUnits() {
    isLoading.value = true;
    try {
      units.value = await apiFetch<ResidentUnit[]>('/resident/units');
      const stillValid = units.value.some((u) => u.id === activeUnitId.value);
      if (!stillValid && units.value.length > 0) {
        activeUnitId.value = units.value[0].id;
      }
    } finally {
      isLoading.value = false;
    }
  }

  function setActiveUnit(unitId: string) {
    activeUnitId.value = unitId;
  }

  watch(activeUnitId, (value) => {
    if (value) localStorage.setItem(STORAGE_KEY, value);
  });

  return { units, activeUnitId, activeUnit, isLoading, fetchUnits, setActiveUnit };
});
