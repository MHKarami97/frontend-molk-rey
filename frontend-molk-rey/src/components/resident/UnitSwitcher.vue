<script setup lang="ts">
import { useResidentStore } from '../../stores/useResidentStore';

const store = useResidentStore();
</script>

<template>
  <div v-if="store.units.length > 1" class="px-1">
    <select
      class="w-full rounded-control border border-surface-border bg-surface p-2 text-sm"
      :value="store.activeUnitId"
      @change="store.setActiveUnit(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
        {{ unit.buildingName }} — طبقه {{ unit.floor }} ({{ unit.relation === 'owner' ? 'مالک' : 'ساکن' }})
      </option>
    </select>
  </div>
</template>
