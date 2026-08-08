import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiFetch } from '../lib/api/http';

export interface Building {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
}

/**
 * useAdminStore: State سراسری ساختمان انتخاب‌شده فعلی، چون یک مدیر ممکن
 * است چند ساختمان را مدیریت کند و اکثر صفحات پنل به این انتخاب وابسته‌اند.
 */
export const useAdminStore = defineStore('admin', () => {
  const buildings = ref<Building[]>([]);
  const selectedBuildingId = ref<string | null>(null);
  const isLoading = ref(false);

  const selectedBuilding = computed(
    () => buildings.value.find((b) => b.id === selectedBuildingId.value) ?? null
  );

  async function fetchBuildings() {
    isLoading.value = true;
    try {
      buildings.value = await apiFetch<Building[]>('/admin/buildings');
      const firstBuilding = buildings.value[0];
      if (!selectedBuildingId.value && firstBuilding) {
        selectedBuildingId.value = firstBuilding.id;
      }
    } finally {
      isLoading.value = false;
    }
  }

  function selectBuilding(id: string) {
    selectedBuildingId.value = id;
  }

  return {
    buildings,
    selectedBuildingId,
    selectedBuilding,
    isLoading,
    fetchBuildings,
    selectBuilding,
  };
});
